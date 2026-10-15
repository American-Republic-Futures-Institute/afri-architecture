// ARFI-COA Article II validation: source-grounded constitutional semantics, not legal advice.
const arr = x => Array.isArray(x)?x:[];
const pad = x => String(x).padStart(2,"0");
const cl = (s,c) => "CONST-US-ART-02-SEC-"+pad(s)+"-CL-"+pad(c);
const seg = n => "CONST-US-ART-02-SEC-03-SEG-"+pad(n);
const AII="AII-";
const active = new Set(["operative","modified_in_part"]);
const historical = new Set(["superseded","repealed","expired"]);
const kinds = new Set(["allocation","time_limit","amendment_change","separation_of_powers","threshold","eligibility","historic_supersession","procedural_requirement","interpretive_boundary","historical_limit","condition","scope","prohibition","cross_provision_limit","prior_action","exception","consent","reservation","duty","shared_power"]);
function missing(o, keys, push, id){for(const k of keys)if(o?.[k]===undefined||o?.[k]===null)push("Missing "+id+"."+k);}
export function validateArticleII(d) {
  const errors=[],push=s=>errors.push(s),m=d.manifest||{},models=d.models||{};
  const keys=["units","qualifications","capabilityLinks"];
  const names={units:"article-ii-units",qualifications:"article-ii-qualifications",capabilityLinks:"article-ii-capability-links"};
  for(const k of keys){
    if(models[k]?.model_version!=="0.1.0"||!Array.isArray(models[k]?.items))push("Invalid Article II collection "+k);
    if(!arr(m.models).includes("model/constitutional/"+names[k]+".json"))push("Missing Article II publication manifest entry "+k);
  }
  if(m.article_ii_extension?.numbered_clause_count!==11||m.article_ii_extension?.unnumbered_section3_analytic_segments!==5||m.article_ii_extension?.analysis_unit_count!==17)
    push("Article II manifest count contract invalid");
  const units=arr(models.units?.items),quals=arr(models.qualifications?.items),links=arr(models.capabilityLinks?.items);
  const provisions=new Map(arr(d.provisions).map(x=>[x.id,x])),norms=new Map(arr(d.norms).map(x=>[x.id,x])),caps=new Map(arr(d.capabilities).map(x=>[x.id,x]));
  const src=new Set(arr(d.sources).map(x=>x.id)),actors=new Set(arr(d.actors).map(x=>x.id)),a1=new Set(arr(d.articleIQualifications).map(x=>x.id));
  const bindings=arr(d.bindings);
  const qmap=new Map(quals.map(x=>[x.id,x])),lmap=new Map(links.map(x=>[x.id,x])),umap=new Map(units.map(x=>[x.id,x]));
  const sourceOk = o => {
    if(!arr(o.source_ids).length)push("Missing provenance "+o.id);
    for(const sid of arr(o.source_ids))if(!src.has(sid))push("Unknown provenance "+o.id+":"+sid);
  };
  for(const [type,items] of [["units",units],["qualifications",quals],["capabilityLinks",links]]){
    const seen=new Set;
    for(const item of items) {
      if(typeof item.id!=="string"||seen.has(item.id))push("Duplicate/missing "+type+" ID "+item.id);
      seen.add(item.id);
      sourceOk(item);
    }
  }
  if(units.length!==17)push("Article II must have 17 analytic units");
  if(units.filter(x=>x.unit_kind==="numbered_clause").length!==11)push("Article II original numbered clause count must be 11");
  if(units.filter(x=>x.unit_kind==="analytic_segment").length!==5)push("Article II Section 3 segment count must be 5");
  if(units.filter(x=>x.unit_kind==="section_text").length!==1)push("Article II Section 4 must be modeled at the actual section level");
  const expected=[8,3,5,1];
  for(let s=1;s<=4;s++){
    if(units.filter(x=>x.section===s).length!==expected[s-1])push("Article II Section "+s+" unit count mismatch");
    for(let i=1;i<=expected[s-1];i++){
      const id="AII-UNIT-"+pad(s)+"-"+pad(i),u=umap.get(id);
      if(!u){push("Missing Article II unit "+id);continue;}
      const expectedProvision=s<3?cl(s,i):s===3?seg(i):"CONST-US-ART-02-SEC-04";
      if(u.provision_id!==expectedProvision)push("Article II source-location mismatch "+id);
    }
  }
  const article2Clauses=arr(d.provisions).filter(p=>/^CONST-US-ART-02-SEC-\d{2}-CL-\d{2}$/.test(p.id));
  const segs=arr(d.provisions).filter(p=>/^CONST-US-ART-02-SEC-03-SEG-\d{2}$/.test(p.id));
  if(article2Clauses.length!==11)push("Invented or omitted numbered Article II clause");
  if(segs.length!==5)push("Missing unnumbered analytic Section 3 segment");
  for(const s of segs) {
    if(s.unit!=="article_section_segment"||s.parent_id!=="CONST-US-ART-02-SEC-03"||s.segment_kind!=="arfi_analytic_not_numbered_clause")
      push("Analytic Section 3 text represented as fictitious numbered clause "+s.id);
    if(s.citation!=="U.S. Const. art. II, § 3"||/cl\.\s*\d/i.test(s.source_locator||""))
      push("Invented official clause citation for Section 3 "+s.id);
  }
  for(const u of units){
    missing(u,["type","id","unit_kind","section","unit_index","provision_id","name","summary","current_effect_status","norm_ids","qualification_ids","capability_link_ids","source_ids","review_status"],push,u.id);
    if(u.type!=="article_ii_unit_analysis"||u.review_status!=="textual_summary_pending_legal_review")push("Unreviewed Article II analysis promoted to law "+u.id);
    const prov=provisions.get(u.provision_id);
    if(!prov||prov.effect_status!==u.current_effect_status)push("Article II provision/effect mismatch "+u.id);
    if(u.unit_kind==="section_text"&&prov?.unit!=="article_section")push("Section 4 must remain section text "+u.id);
    if(u.unit_kind==="numbered_clause"&&prov?.unit!=="article_clause")push("Numbered Article II clause not a clause "+u.id);
    if(u.unit_kind==="analytic_segment"&&prov?.unit!=="article_section_segment")push("Article II Section 3 segment presented as official clause "+u.id);
    if(!arr(u.norm_ids).length||!arr(u.qualification_ids).length)push("Unmodeled Article II unit "+u.id);
    for(const nid of arr(u.norm_ids))if(!norms.get(nid)?.provision_ids?.includes(u.provision_id))push("Norm/provision mismatch "+u.id+":"+nid);
    for(const qid of arr(u.qualification_ids))if(!qmap.get(qid)?.source_provision_ids?.includes(u.provision_id))push("Dangling unit qualification "+u.id+":"+qid);
    for(const lid of arr(u.capability_link_ids))if(!norms.get(lmap.get(lid)?.constitutional_norm_id)?.provision_ids?.includes(u.provision_id))push("Misattributed unit capability "+u.id+":"+lid);
    if(historical.has(u.current_effect_status) && arr(u.capability_link_ids).length)push("Superseded Article II text used as operative capability "+u.id);
    if(u.id==="AII-UNIT-01-03"&&arr(u.qualification_ids).some(q=>qmap.get(q)?.effect_status!=="historical_only"))push("Original elector ballots reactivated despite Twelfth Amendment");
  }
  if(provisions.get(cl(1,3))?.effect_status!=="superseded")push("Original Article II elector procedure must remain superseded");
  if(provisions.get(cl(1,6))?.effect_status!=="modified_in_part")push("Original succession text must be marked modified in part");
  if(provisions.get(cl(1,1))?.effect_status!=="operative")push("Four-year tenure incorrectly marked repealed");
  const usedQual=new Set;
  for(const q of quals){
    missing(q,["id","type","kind","origin","name","summary","source_provision_ids","applies_to_norm_ids","effect_status","legal_review_status","source_ids"],push,q.id);
    if(q.type!=="article_ii_qualification"||!/^AII-QUAL-[A-Z0-9-]+$/.test(q.id)||!kinds.has(q.kind))push("Invalid Article II qualification type "+q.id);
    if(q.legal_review_status!=="textual_mapping_pending_review")push("Unreviewed legal qualification claimed authoritative "+q.id);
    if(!["original_text","amendment_overlay","historical_text"].includes(q.origin))push("Invalid Article II qualification provenance kind "+q.id);
    if(!["operative","amendment_modified","historical_only"].includes(q.effect_status))push("Invalid Article II qualification legal effect "+q.id);
    if(!arr(q.source_provision_ids).length||!arr(q.applies_to_norm_ids).length)push("Orphan qualification "+q.id);
    for(const p of arr(q.source_provision_ids))if(!provisions.has(p))push("Dangling Article II qualification provision "+q.id+":"+p);
    for(const n of arr(q.applies_to_norm_ids))if(!norms.has(n))push("Dangling Article II qualification norm "+q.id+":"+n);
    if(q.origin==="amendment_overlay"&&!arr(q.source_provision_ids).some(p=>p.startsWith("CONST-US-AMD-")))
      push("Unsupported Article II amendment overlay "+q.id);
    if(q.origin==="historical_text"&&q.effect_status!=="historical_only")push("Article II historical text reactivated "+q.id);
    if(q.effect_status==="amendment_modified"&&!arr(q.source_provision_ids).some(p=>p.startsWith("CONST-US-AMD-")))push("False amendment effect "+q.id);
    for(const a1id of arr(q.article_i_qualification_ids))if(!a1.has(a1id))push("Dangling Article I constitutional limit "+q.id+":"+a1id);
    for(const rid of arr(q.related_current_norm_ids))if(!norms.has(rid)||historical.has(norms.get(rid)?.effect_status))push("Historical replacement fails to cite current law "+q.id+":"+rid);
    if(q.effect_status==="historical_only"&&arr(links).some(l=>arr(l.qualification_ids).includes(q.id)))push("Historical-only qualifier used to grant operative capability "+q.id);
    usedQual.add(q.id);
  }
  for(const q of quals)if(!units.some(u=>arr(u.qualification_ids).includes(q.id)))push("Article II qualification not linked to any unit "+q.id);
  const mapped=new Set,seenPairs=new Set;
  for(const l of links){
    missing(l,["id","type","constitutional_norm_id","capability_id","qualification_ids","relationship_type","rationale","source_ids","review_status"],push,l.id);
    if(l.type!=="article_ii_capability_alignment"||!/^AII-CAP-[0-9]{4}$/.test(l.id))push("Invalid capability link "+l.id);
    const n=norms.get(l.constitutional_norm_id),c=caps.get(l.capability_id);
    if(!n||!active.has(n.effect_status)||!n.provision_ids?.some(pid=>pid.startsWith("CONST-US-ART-02-")))
      push("Non-operative/non-Article-II norm used as executive capability "+l.id);
    if(!c)push("Unknown federal capability "+l.id+":"+l.capability_id);
    if(l.relationship_type!=="functional_alignment_not_delegation"||l.review_status!=="research_mapping_pending_review")push("Article II mapping improperly grants agency authority "+l.id);
    if(!arr(l.qualification_ids).length)push("Article II unqualified capability mapping "+l.id);
    for(const qid of arr(l.qualification_ids)){
      const q=qmap.get(qid);
      if(!q||q.effect_status==="historical_only"||!arr(q.applies_to_norm_ids).includes(l.constitutional_norm_id))
        push("Article II capability misses applicable operative qualification "+l.id+":"+qid);
    }
    const pair=l.constitutional_norm_id+"|"+l.capability_id;
    if(seenPairs.has(pair))push("Duplicate Article II norm/capability pair "+pair);
    seenPairs.add(pair);mapped.add(l.constitutional_norm_id);
  }
  const eligible=arr(d.norms).filter(n=>active.has(n.effect_status)&&["power","duty","procedure","eligibility","structural_allocation","limitation","prohibition"].includes(n.norm_kind)&&arr(n.provision_ids).some(p=>p.startsWith("CONST-US-ART-02-")));
  for(const n of eligible)if(!mapped.has(n.id))push("Article II active norm without capability alignment "+n.id);
  for(const u of units)if(u.current_effect_status!=="superseded"&&!arr(u.capability_link_ids).length)push("Operative Article II function missing capability link "+u.id);
  // Actor attribution: Article II sometimes confers powers on Congress, not the President.
  const powers=[
    ["NORM-US-CONST-AII-01-04-ELECTION-TIMING","ORG-FED-LEG-CONGRESS"],
    ["NORM-US-CONST-AII-01-06-CONGRESS-DOUBLE-VACANCY","ORG-FED-LEG-CONGRESS"],
    ["NORM-US-CONST-AII-02-02-INFERIOR-OFFICER-ALLOCATION","ORG-FED-LEG-CONGRESS"],
    ["NORM-US-CONST-021","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-022","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-023","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-026","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-AII-03-01-RECOMMEND","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-AII-03-02-CONVENE","ORG-FED-EXE-PRESIDENT"],
    ["NORM-US-CONST-AII-03-02-ADJOURN","ORG-FED-EXE-PRESIDENT"]
  ];
  for(const [nid,target] of powers)if(!bindings.some(b=>b.norm_id===nid&&b.target_id===target&&b.relationship_type==="confers_power_on"))
    push("Article II power allocated to wrong constitutional actor "+nid+"->"+target);
  // Critical explicit textual safeguards and amendment separation.
  const mandatory=[
    ["AII-QUAL-01-01-JANUARY-20","NORM-US-CONST-AII-01-01-TERM"],
    ["AII-QUAL-01-01-TWENTY-SECOND","NORM-US-CONST-083"],
    ["AII-QUAL-01-02-DC-TWENTY-THIRD","NORM-US-CONST-084"],
    ["AII-QUAL-01-03-ORIGINAL-BALLOT-SUPERSEDED","NORM-US-CONST-090"],
    ["AII-QUAL-01-04-UNIFORM-CASTING-DAY","NORM-US-CONST-AII-01-04-ELECTION-TIMING"],
    ["AII-QUAL-01-05-NATURAL-BORN","NORM-US-CONST-AII-01-05-NATURAL-BORN"],
    ["AII-QUAL-01-06-ORIGINAL-SUCCESSION-QUALIFIED","NORM-US-CONST-086"],
    ["AII-QUAL-01-06-VP-VACANCY-NOMINATION","NORM-US-CONST-086"],
    ["AII-QUAL-01-06-VOLUNTARY-INABILITY","NORM-US-CONST-086"],
    ["AII-QUAL-01-06-CONTESTED-DEADLINES","NORM-US-CONST-086"],
    ["AII-QUAL-01-06-TWENTIETH-PRESIDENT-ELECT","NORM-US-CONST-080"],
    ["AII-QUAL-01-07-OTHER-FEDERAL-STATE-EMOLUMENTS","NORM-US-CONST-AII-01-07-NO-OTHER-EMOLUMENTS"],
    ["AII-QUAL-01-08-BEFORE-OFFICE-EXECUTION","NORM-US-CONST-AII-01-08-OATH"],
    ["AII-QUAL-02-01-CONGRESSIONAL-WAR-POWERS","NORM-US-CONST-021"],
    ["AII-QUAL-02-01-MILITIA-STATE-RESERVATIONS","NORM-US-CONST-021"],
    ["AII-QUAL-02-01-CLEMENCY-IMPEACHMENT-EXCEPTION","NORM-US-CONST-022"],
    ["AII-QUAL-02-02-TREATY-SENATE-TWO-THIRDS","NORM-US-CONST-024"],
    ["AII-QUAL-02-02-TREATY-THRESHOLD-NOT-APPOINTMENTS","NORM-US-CONST-025"],
    ["AII-QUAL-02-02-INFERIOR-OFFICER-BY-LAW","NORM-US-CONST-AII-02-02-INFERIOR-OFFICER-ALLOCATION"],
    ["AII-QUAL-02-03-COMMISSIONS-EXPIRE-NEXT-SESSION","NORM-US-CONST-026"],
    ["AII-QUAL-03-02-EXTRAORDINARY-OCCASIONS","NORM-US-CONST-AII-03-02-CONVENE"],
    ["AII-QUAL-03-02-ADJOURNMENT-DISAGREEMENT","NORM-US-CONST-AII-03-02-ADJOURN"],
    ["AII-QUAL-03-04-NO-INDEPENDENT-APPROPRIATION","NORM-US-CONST-027"],
    ["AII-QUAL-03-05-COMMISSION-NOT-SOLE-APPOINTMENT","NORM-US-CONST-AII-03-05-COMMISSION-OFFICERS"],
    ["AII-QUAL-04-01-HOUSE-IMPEACHMENT","NORM-US-CONST-029"],
    ["AII-QUAL-04-01-SENATE-TRIAL-TWO-THIRDS","NORM-US-CONST-029"],
    ["AII-QUAL-04-01-NO-IMPEACHMENT-PARDON","NORM-US-CONST-022"]
  ];
  for(const [qid,nid] of mandatory)if(!qmap.has(qid)||!arr(qmap.get(qid).applies_to_norm_ids).includes(nid))
    push("Missing critical Article II safeguard "+qid+"->"+nid);
  const appointed=qmap.get("AII-QUAL-02-02-TREATY-SENATE-TWO-THIRDS");
  if(appointed?.applies_to_norm_ids.includes("NORM-US-CONST-025"))
    push("Treaty two-thirds threshold incorrectly applied to appointments");
  if(qmap.get("AII-QUAL-01-03-CURRENT-BALLOT-TWELFTH")?.effect_status!=="historical_only")
    push("Superseded Article II ballots treated as operative law");
  if(qmap.get("AII-QUAL-01-06-VOLUNTARY-INABILITY")?.source_provision_ids.includes("CONST-US-AMD-25-SEC-02"))
    push("Vice-presidential vacancy incorrectly treated as presidential disability");
  for(const qid of ["AII-QUAL-02-01-CONGRESSIONAL-WAR-POWERS","AII-QUAL-02-01-MILITIA-STATE-RESERVATIONS","AII-QUAL-03-04-NO-INDEPENDENT-APPROPRIATION","AII-QUAL-04-01-SENATE-TRIAL-TWO-THIRDS"]){
    if(!arr(qmap.get(qid)?.article_i_qualification_ids).length)push("Interbranch limit lost Article I trace "+qid);
  }
  return {errors,counts:{units:units.length,numbered_clauses:article2Clauses.length,section3_analytic_segments:segs.length,qualifications:quals.length,capability_links:links.length,mapped_norms:mapped.size},status:"research_textual_summary_pending_legal_review"};
}
