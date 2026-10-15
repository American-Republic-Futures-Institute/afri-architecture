// ARFI-COA Article III semantic checks; not a rendering engine or legal adjudication.
const asArray=x=>Array.isArray(x)?x:[];
const pad=x=>String(x).padStart(2,"0");
const clause=(s,c)=>"CONST-US-ART-03-SEC-"+pad(s)+"-CL-"+pad(c);
const segment=i=>"CONST-US-ART-03-SEC-01-SEG-"+pad(i);
const active=new Set(["operative","modified_in_part"]);
const validKind=new Set(["structural_requirement","allocation","interpretive_boundary","cross_article_limit","office_protection","actor_scope","procedural_requirement","prohibition","jurisdictional_limit","jurisdictional_category","amendment_limit","legislative_condition","right","exception","geographic_condition","substantive_limit","substantive_definition","evidentiary_threshold","alternative_proof","scope","time_limit"]);
const required=(o,keys,add)=>{for(const k of keys)if(o?.[k]===undefined||o?.[k]===null)add("Missing "+(o?.id||"record")+"."+k);};
export function validateArticleIII(model){
 const errors=[],add=x=>errors.push(x);
 const m=model.manifest||{}, data=model.models||{};
 const paths={units:"article-iii-units",qualifications:"article-iii-qualifications",capabilityLinks:"article-iii-capability-links",jurisdiction:"article-iii-jurisdiction"};
 for(const [key,p] of Object.entries(paths)){
  if(data[key]?.model_version!=="0.1.0"||!Array.isArray(data[key]?.items))add("Invalid Article III model "+key);
  if(!asArray(m.models).includes("model/constitutional/"+p+".json"))add("Missing Article III publication entry "+p);
 }
 const ext=m.article_iii_extension;
 if(!ext||ext.numbered_clause_count!==5||ext.unnumbered_section1_analytic_segments!==3||ext.analysis_unit_count!==8||ext.jurisdiction_categories!==9)
  add("Article III manifest coverage invalid");
 const units=asArray(data.units?.items),qual=asArray(data.qualifications?.items),links=asArray(data.capabilityLinks?.items),jurisdiction=asArray(data.jurisdiction?.items);
 const prov=new Map(asArray(model.provisions).map(p=>[p.id,p]));
 const norms=new Map(asArray(model.norms).map(n=>[n.id,n]));
 const caps=new Map(asArray(model.capabilities).map(c=>[c.id,c]));
 const actorIds=new Set(asArray(model.actors).map(a=>a.id));
 const sourceIds=new Set(asArray(model.sources).map(s=>s.id));
 const a1ids=new Set(asArray(model.articleIQualifications).map(q=>q.id));
 const a2ids=new Set(asArray(model.articleIIQualifications).map(q=>q.id));
 const bind=asArray(model.bindings);
 const unitMap=new Map(units.map(u=>[u.id,u]));
 const qmap=new Map(qual.map(q=>[q.id,q]));
 const lmap=new Map(links.map(l=>[l.id,l]));
 const jurmap=new Map(jurisdiction.map(j=>[j.id,j]));
 const ids={};
 const sourceCheck=o=>{
  if(!asArray(o.source_ids).length)add("Missing Article III provenance "+o.id);
  for(const s of asArray(o.source_ids))if(!sourceIds.has(s))add("Dangling Article III source "+o.id+":"+s);
 };
 for(const [name,records] of Object.entries({units,qual,links,jurisdiction})){
  ids[name]=new Set();
  for(const rec of records){
   if(!rec.id||ids[name].has(rec.id))add("Missing or duplicate "+name+" ID "+rec.id);
   ids[name].add(rec.id);sourceCheck(rec);
  }
 }
 if(units.length!==8)add("Article III requires exactly eight analytic units");
 if(units.filter(u=>u.unit_kind==="numbered_clause").length!==5)add("Article III must contain five numbered original clauses");
 if(units.filter(u=>u.unit_kind==="analytic_segment").length!==3)add("Article III requires three unnumbered Section 1 analytic segments");
 if(asArray(model.provisions).filter(p=>/^CONST-US-ART-03-SEC-0[23]-CL-0\d$/.test(p.id)).length!==5)add("Missing or invented original Article III clauses");
 if(asArray(model.provisions).some(p=>p.id.startsWith("CONST-US-ART-03-SEC-01-CL-")))add("Invented official Section 1 clause");
 if(asArray(model.provisions).filter(p=>p.id.startsWith("CONST-US-ART-03-SEC-01-SEG-")).length!==3)add("Missing Section 1 semantic segment");
 for(let s=1;s<=3;s++){
  const expected=s===1?3:s===2?3:2;
  if(units.filter(u=>u.section===s).length!==expected)add("Article III Section "+s+" unit count invalid");
  for(let i=1;i<=expected;i++){
   const unitId="AIII-UNIT-"+pad(s)+"-"+pad(i),u=unitMap.get(unitId),p=s===1?segment(i):clause(s,i);
   if(!u){add("Missing Article III unit "+unitId);continue;}
   if(u.provision_id!==p)add("Article III canonical provision ID mismatch "+unitId);
  }
 }
 for(const u of units){
  required(u,["type","section","unit_index","unit_kind","provision_id","name","summary","current_effect_status","norm_ids","qualification_ids","capability_link_ids","source_ids","review_status"],add);
  if(u.type!=="article_iii_unit_analysis"||u.review_status!=="textual_summary_pending_legal_review")add("Article III description asserted authoritative "+u.id);
  const p=prov.get(u.provision_id);
  if(!p||p.effect_status!==u.current_effect_status)add("Article III effect/provision mismatch "+u.id);
  if(u.unit_kind==="numbered_clause"&&p?.unit!=="article_clause")add("Numbered Article III clause has invalid type "+u.id);
  if(u.unit_kind==="analytic_segment"){
   if(p?.unit!=="article_section_segment"||p.parent_id!=="CONST-US-ART-03-SEC-01"||p.segment_kind!=="arfi_analytic_not_numbered_clause")
    add("Invented original Article III Section 1 clause "+u.id);
   if(p?.citation!=="U.S. Const. art. III, § 1"||/cl\.\s*\d/i.test(p?.source_locator||""))
    add("Misrepresented Section 1 semantic segment as official clause "+u.id);
  }
  if(!asArray(u.norm_ids).length||!asArray(u.qualification_ids).length||!asArray(u.capability_link_ids).length)add("Unmodeled Article III analysis unit "+u.id);
  for(const n of asArray(u.norm_ids))if(!norms.get(n)?.provision_ids?.includes(u.provision_id))add("Incorrect Article III norm/provision "+u.id+":"+n);
  for(const id of asArray(u.qualification_ids))if(!qmap.get(id)?.source_provision_ids?.includes(u.provision_id))add("Dangling Article III unit qualifier "+u.id+":"+id);
  for(const id of asArray(u.capability_link_ids))if(!norms.get(lmap.get(id)?.constitutional_norm_id)?.provision_ids?.includes(u.provision_id))add("Incorrect Article III unit capability link "+u.id+":"+id);
 }
 if(prov.get(clause(2,1))?.effect_status!=="modified_in_part")add("Eleventh Amendment qualification omitted from Article III Section 2 Clause 1");
 if(norms.get("NORM-US-CONST-032")?.effect_status!=="modified_in_part")add("General jurisdiction norm omits Eleventh Amendment change");
 for(const q of qual){
  required(q,["id","type","kind","name","summary","origin","source_provision_ids","applies_to_norm_ids","effect_status","legal_review_status","source_ids"],add);
  if(q.type!=="article_iii_qualification"||!/^AIII-QUAL-[A-Z0-9-]+$/.test(q.id)||!validKind.has(q.kind))add("Invalid Article III qualifier kind "+q.id);
  if(!["operative","amendment_modified","research_boundary","historical_only"].includes(q.effect_status))add("Invalid qualifier legal effect "+q.id);
  if(!["original_text","amendment_overlay","interpretive_boundary","historical_text"].includes(q.origin))add("Invalid qualifier origin "+q.id);
  if(q.legal_review_status!=="textual_mapping_pending_review")add("Unreviewed Article III legal claim "+q.id);
  if(!asArray(q.source_provision_ids).length||!asArray(q.applies_to_norm_ids).length)add("Orphaned Article III qualifier "+q.id);
  for(const p of asArray(q.source_provision_ids))if(!prov.has(p))add("Missing qualifier provision "+q.id+":"+p);
  for(const n of asArray(q.applies_to_norm_ids))if(!norms.has(n))add("Missing qualifier norm "+q.id+":"+n);
  if(q.origin==="amendment_overlay"&&!asArray(q.source_provision_ids).some(p=>p.startsWith("CONST-US-AMD-")))add("Article III amendment overlay lacks amendment "+q.id);
  if(q.effect_status==="amendment_modified"&&q.origin!=="amendment_overlay")add("Unsubstantiated amendment status "+q.id);
  if(q.origin==="interpretive_boundary"&&q.effect_status!=="research_boundary")add("Doctrine boundary promoted to constitutional text "+q.id);
  if(q.origin==="interpretive_boundary"&&!q.source_ids?.some(s=>s!=="SRC-CONST-ORIGINAL-TRANSCRIPT")&&q.id==="AIII-QUAL-01-01-JUDICIAL-REVIEW-SEPARATE")add("Judicial review presented without interpretation source "+q.id);
  for(const id of asArray(q.article_i_qualification_ids))if(!a1ids.has(id))add("Dangling Article I safeguard "+q.id+":"+id);
  for(const id of asArray(q.article_ii_qualification_ids))if(!a2ids.has(id))add("Dangling Article II safeguard "+q.id+":"+id);
  if(!units.some(u=>asArray(u.qualification_ids).includes(q.id)))add("Unlinked Article III qualifier "+q.id);
 }
 // The nine categories are original Article III 2(1) outer bounds, not independent inferior-court grants.
 if(jurisdiction.length!==9)add("Article III must describe nine enumerated jurisdiction categories");
 const firstThree=new Set(["AIII-JUR-01","AIII-JUR-02","AIII-JUR-03"]);
 for(let i=1;i<=9;i++){
  const id="AIII-JUR-"+pad(i),j=jurmap.get(id);
  if(!j){add("Missing Article III jurisdiction category "+id);continue;}
  required(j,["type","name","matter_group","summary","provision_id","norm_id","qualification_ids","constitutional_effect_status","does_not_self_authorize_inferior_court_jurisdiction","source_ids","review_status"],add);
  if(j.type!=="article_iii_jurisdiction_category"||j.provision_id!==clause(2,1))add("Bad Article III jurisdiction provenance "+id);
  if(j.matter_group!==(firstThree.has(id)?"cases":"controversies"))add("Article III jurisdiction case/controversy family mismatch "+id);
  if(!norms.get(j.norm_id)?.provision_ids?.includes(j.provision_id))add("Jurisdiction category has no constitutional norm "+id);
  if(j.does_not_self_authorize_inferior_court_jurisdiction!==true)add("Constitutional category incorrectly claimed to authorize statutory lower-court jurisdiction "+id);
  if(j.review_status!=="research_jurisdiction_mapping_pending_legal_review")add("Unreviewed Article III jurisdiction claimed final "+id);
  for(const qid of asArray(j.qualification_ids))if(!qmap.get(qid)?.applies_to_norm_ids?.includes(j.norm_id))add("Jurisdiction category references unrelated qualifier "+id+":"+qid);
  if(["AIII-JUR-06","AIII-JUR-09"].includes(id)){
   if(j.constitutional_effect_status!=="modified_in_part"||!j.qualification_ids.includes("AIII-QUAL-02-01-ELEVENTH-AMENDMENT"))add("Eleventh Amendment sovereign immunity boundary missing "+id);
  }else if(j.constitutional_effect_status!=="operative")add("Unexpected original Article III category effect "+id);
 }
 const mapped=new Set,pairs=new Set;
 for(const l of links){
  required(l,["id","type","constitutional_norm_id","capability_id","qualification_ids","relationship_type","rationale","source_ids","review_status"],add);
  if(l.type!=="article_iii_capability_alignment"||!/^AIII-CAP-\d{4}$/.test(l.id))add("Invalid Article III alignment ID "+l.id);
  const n=norms.get(l.constitutional_norm_id);
  if(!n||!active.has(n.effect_status)||!asArray(n.provision_ids).some(p=>p.startsWith("CONST-US-ART-03-")))add("Non-operative/non-Article-III capability norm "+l.id);
  if(!caps.has(l.capability_id))add("Unknown Article III federal capability "+l.id+":"+l.capability_id);
  if(l.relationship_type!=="functional_alignment_not_delegation"||l.review_status!=="research_mapping_pending_review")add("Article III function wrongly asserted as agency delegation "+l.id);
  if(!asArray(l.qualification_ids).length)add("Unqualified Article III capability alignment "+l.id);
  for(const id of asArray(l.qualification_ids)){
   const q=qmap.get(id);
   if(!q||!q.applies_to_norm_ids?.includes(l.constitutional_norm_id)||q.effect_status==="historical_only"||q.effect_status==="research_boundary")
    add("Unsupported legal qualification on Article III capability alignment "+l.id+":"+id);
  }
  const k=l.constitutional_norm_id+"|"+l.capability_id;if(pairs.has(k))add("Duplicate Article III capability alignment "+k);pairs.add(k);
  mapped.add(l.constitutional_norm_id);
 }
 const eligible=asArray(model.norms).filter(n=>active.has(n.effect_status)&&asArray(n.provision_ids).some(p=>p.startsWith("CONST-US-ART-03-")));
 for(const n of eligible)if(!mapped.has(n.id))add("Article III constitutional norm without capability mapping "+n.id);
 // Court classes are not interchangeable with federal tribunals and special Article I courts.
 const strict=new Set(["NORM-US-CONST-031","NORM-US-CONST-AIII-01-02-GOOD-BEHAVIOR","NORM-US-CONST-AIII-01-03-NON-DIMINUTION"]);
 const wrongTargets=new Set(["ACT-US-FED-COURTS","ORG-FED-JUD-COFC","ORG-FED-JUD-BANKRUPTCY"]);
 for(const b of bind)if(strict.has(b.norm_id)&&b.relationship_type==="protects"&&wrongTargets.has(b.target_id))add("Article III tenure wrongly extended to non-Article-III judicial body "+b.id);
 if(!actorIds.has("ACT-US-ARTICLE-III-JUDGES")||!actorIds.has("ACT-US-ARTICLE-III-COURTS"))add("Missing Article III-specific judicial actors");
 if(!bind.some(b=>b.norm_id==="NORM-US-CONST-031"&&b.target_id==="ACT-US-ARTICLE-III-JUDGES"&&b.relationship_type==="protects"))add("Judicial independence protection missing Article III judges");
 for(const id of ["NORM-US-CONST-AIII-01-01-INFERIOR-CREATION","NORM-US-CONST-AIII-02-02-CONGRESS-EXCEPTIONS","NORM-US-CONST-AIII-02-03-OUTSIDE-STATE","NORM-US-CONST-AIII-03-02-PUNISHMENT-CONGRESS"]){
  if(!bind.some(b=>b.norm_id===id&&b.target_id==="ORG-FED-LEG-CONGRESS"&&b.relationship_type==="confers_power_on"))add("Wrong congressional authority holder "+id);
 }
 const critical=[
  ["AIII-QUAL-01-01-INFERIOR-COURTS-CONGRESS","NORM-US-CONST-AIII-01-01-INFERIOR-CREATION"],
  ["AIII-QUAL-01-02-GOOD-BEHAVIOR","NORM-US-CONST-031"],
  ["AIII-QUAL-01-03-NO-DIMINUTION","NORM-US-CONST-AIII-01-03-NON-DIMINUTION"],
  ["AIII-QUAL-02-01-ELEVENTH-AMENDMENT","NORM-US-CONST-AIII-02-01-STATE-OTHER-CITIZEN"],
  ["AIII-QUAL-02-02-SUPREME-ORIGINAL","NORM-US-CONST-AIII-02-02-ORIGINAL"],
  ["AIII-QUAL-02-02-CONGRESS-EXCEPTIONS-AND-REGULATIONS","NORM-US-CONST-AIII-02-02-CONGRESS-EXCEPTIONS"],
  ["AIII-QUAL-02-03-IMPEACHMENT-EXCEPTION","NORM-US-CONST-AIII-02-03-JURY"],
  ["AIII-QUAL-02-03-CRIME-STATE-VENUE","NORM-US-CONST-AIII-02-03-STATE-VENUE"],
  ["AIII-QUAL-03-01-TREASON-ONLY-TWO-CATEGORIES","NORM-US-CONST-AIII-03-01-TREASON-ONLY"],
  ["AIII-QUAL-03-01-TWO-WITNESSES-SAME-ACT","NORM-US-CONST-AIII-03-01-TWO-WITNESSES"],
  ["AIII-QUAL-03-01-CONFESSION-OPEN-COURT","NORM-US-CONST-AIII-03-01-OPEN-COURT-CONFESSION"],
  ["AIII-QUAL-03-02-NO-CORRUPTION-OF-BLOOD","NORM-US-CONST-AIII-03-02-NO-CORRUPTION-BLOOD"],
  ["AIII-QUAL-03-02-FORFEITURE-LIFETIME","NORM-US-CONST-AIII-03-02-FORFEITURE-LIMIT"]
 ];
 for(const [qid,nid] of critical)if(!qmap.get(qid)?.applies_to_norm_ids?.includes(nid))add("Missing critical Article III safeguard "+qid+"->"+nid);
 for(const qid of ["AIII-QUAL-01-01-INFERIOR-COURTS-CONGRESS","AIII-QUAL-01-02-IMPEACHMENT-HOUSE-SENATE","AIII-QUAL-02-03-IMPEACHMENT-EXCEPTION","AIII-QUAL-03-02-ARTICLE-I-ATTAINDER-BAN"]){
  if(!asArray(qmap.get(qid)?.article_i_qualification_ids).length)add("Article III constitutional interbranch safeguard lost "+qid);
 }
 if(!asArray(qmap.get("AIII-QUAL-01-01-ARTICLE-II-APPOINTMENTS")?.article_ii_qualification_ids).length)add("Judicial appointment rule lost Article II Senate participation");
 if(!asArray(qmap.get("AIII-QUAL-02-01-ELEVENTH-AMENDMENT")?.source_provision_ids).includes("CONST-US-AMD-11"))add("Eleventh Amendment citation missing");
 if(qmap.get("AIII-QUAL-01-01-JUDICIAL-REVIEW-SEPARATE")?.origin!=="interpretive_boundary")add("Judicial review incorrectly asserted as express constitutional text");
 if(qmap.get("AIII-QUAL-01-01-JUDICIAL-REVIEW-SEPARATE")?.effect_status!=="research_boundary")add("Judicial review treated as express clause authority");
 return {errors,counts:{units:units.length,numbered_clauses:units.filter(u=>u.unit_kind==="numbered_clause").length,section1_analytic_segments:units.filter(u=>u.unit_kind==="analytic_segment").length,jurisdiction_categories:jurisdiction.length,qualifications:qual.length,capability_links:links.length,mapped_norms:mapped.size},status:"research_textual_summary_pending_legal_review"};
}
