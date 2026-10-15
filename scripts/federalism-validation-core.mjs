// ARFI-COA federalism semantic guardrail. Legal review and precedent not replaced by programmatic checks.
const arr=x=>Array.isArray(x)?x:[];
const pad=x=>String(x).padStart(2,"0");
const historical=new Set(["repealed","superseded","expired"]);
const active=new Set(["operative","modified_in_part"]);
const relevant=new Set(["article_iv","article_vi","amendment"]);
const groups={units:"federalism-units",qualifications:"federalism-qualifications",relationships:"federalism-relationships",rights:"federalism-rights",capabilityLinks:"federalism-capability-links"};
const required=(x,fields,err)=>{for(const f of fields)if(x?.[f]===null||x?.[f]===undefined)err("Missing "+(x?.id||"record")+"."+f);};
export function validateFederalism(d){
 const errors=[],err=s=>errors.push(s),root=d.manifest||{},files=d.models||{},ext=root.federalism_extension;
 for(const [key,path] of Object.entries(groups)){
  if(files[key]?.model_version!=="0.1.0"||!Array.isArray(files[key]?.items))err("Invalid federalism collection "+key);
  if(!arr(root.models).includes("model/constitutional/"+path+".json"))err("Missing federalism publication model "+path);
 }
 if(ext?.unit_count!==20||ext?.original_article_iv_numbered_clauses!==5||ext?.original_article_iv_analytic_segments!==5||ext?.original_article_vi_clauses!==3||ext?.amendment_units!==7)
  err("Federalism coverage contract invalid");
 const units=arr(files.units?.items),q=arr(files.qualifications?.items),rels=arr(files.relationships?.items),rights=arr(files.rights?.items),caps=arr(files.capabilityLinks?.items);
 const provisions=new Map(arr(d.provisions).map(x=>[x.id,x]));
 const norms=new Map(arr(d.norms).map(x=>[x.id,x]));
 const actors=new Set(arr(d.actors).map(x=>x.id));
 const orgs=new Set(arr(d.federal_institutions).map(x=>x.id));
 const allActors=new Set([...actors,...orgs]);
 const capIds=new Set(arr(d.capabilities).map(x=>x.id));
 const sourceIds=new Set(arr(d.sources).map(x=>x.id));
 const b=arr(d.bindings);
 const originalQ=new Set([...arr(d.articleIQualifications),...arr(d.articleIIQualifications),...arr(d.articleIIIQualifications)].map(x=>x.id));
 const umap=new Map(units.map(x=>[x.id,x])),qmap=new Map(q.map(x=>[x.id,x])),rmap=new Map(rels.map(x=>[x.id,x])),rightsMap=new Map(rights.map(x=>[x.id,x])),cmap=new Map(caps.map(x=>[x.id,x]));
 const sourceOk=o=>{
  if(!arr(o.source_ids).length)err("Missing source provenance "+o.id);
  for(const s of arr(o.source_ids))if(!sourceIds.has(s))err("Unknown source reference "+o.id+":"+s);
 };
 for(const [name,rows] of Object.entries({units,q,rels,rights,caps})){
  const seen=new Set();
  for(const r of rows){
   if(!r.id||seen.has(r.id))err("Duplicate/missing federalism record ID "+r.id);
   seen.add(r.id);sourceOk(r);
  }
 }
 if(units.length!==20)err("Federalism unit inventory incomplete");
 if(units.filter(x=>x.family==="article_iv").length!==10)err("Article IV unit coverage incomplete");
 if(units.filter(x=>x.family==="article_vi").length!==3)err("Article VI clause coverage incomplete");
 if(units.filter(x=>x.family==="amendment").length!==7)err("Tenth, Eleventh and Fourteenth amendment unit coverage incomplete");
 const expect=new Map([
  ["FED-UNIT-IV-01-01","CONST-US-ART-04-SEC-01-SEG-01"],
  ["FED-UNIT-IV-01-02","CONST-US-ART-04-SEC-01-SEG-02"],
  ...[1,2,3].map(c=>["FED-UNIT-IV-02-0"+c,"CONST-US-ART-04-SEC-02-CL-0"+c]),
  ...[1,2].map(c=>["FED-UNIT-IV-03-0"+c,"CONST-US-ART-04-SEC-03-CL-0"+c]),
  ...[1,2,3].map(c=>["FED-UNIT-IV-04-0"+c,"CONST-US-ART-04-SEC-04-SEG-0"+c]),
  ...[1,2,3].map(c=>["FED-UNIT-VI-0"+c,"CONST-US-ART-06-CL-0"+c]),
  ["FED-UNIT-X-01","CONST-US-AMD-10"],["FED-UNIT-XI-01","CONST-US-AMD-11"],
  ...[1,2,3,4,5].map(c=>["FED-UNIT-XIV-0"+c,"CONST-US-AMD-14-SEC-0"+c])
 ]);
 for(const [u,p] of expect)if(umap.get(u)?.provision_id!==p)err("Missing or misattributed federalism unit "+u);
 for(const u of units){
  required(u,["id","type","family","unit_index","unit_kind","provision_id","name","summary","effect_status","norm_ids","qualification_ids","relationship_ids","capability_link_ids","source_ids","review_status"],err);
  if(u.type!=="federalism_unit_analysis"||!relevant.has(u.family)||u.review_status!=="textual_summary_pending_legal_review")err("Unreviewed federalism unit treated as authoritative law "+u.id);
  const p=provisions.get(u.provision_id);
  if(!p||u.effect_status!==p.effect_status)err("Federalism unit/provision status mismatch "+u.id);
  if(u.unit_kind==="analytic_segment"){
   if(p?.unit!=="article_section_segment"||p.segment_kind!=="arfi_analytic_not_numbered_clause"||!/U\.S\. Const\. art\. IV, § [14]$/.test(p.citation))
    err("Artificial Article IV numbered constitutional clause "+u.id);
  }
  if(u.unit_kind==="numbered_clause"&&p?.unit!=="article_clause")err("Article IV numbered clause type incorrect "+u.id);
  if(u.unit_kind==="article_clause"&&p?.unit!=="article_clause")err("Article VI clause type incorrect "+u.id);
  if(u.unit_kind==="amendment"&&p?.unit!=="amendment")err("Reserved/immunity amendment type invalid "+u.id);
  if(u.unit_kind==="amendment_section"&&p?.unit!=="amendment_section")err("Fourteenth Amendment section type incorrect "+u.id);
  if(!arr(u.norm_ids).length||!arr(u.qualification_ids).length)err("Federalism unit incomplete "+u.id);
  for(const id of arr(u.norm_ids))if(!norms.get(id)?.provision_ids?.includes(u.provision_id))err("Federalism norm/provision mismatch "+u.id+":"+id);
  for(const id of arr(u.qualification_ids))if(!qmap.get(id)?.source_provision_ids?.includes(u.provision_id))err("Dangling federalism qualification "+u.id+":"+id);
  for(const id of arr(u.relationship_ids))if(rmap.get(id)?.unit_id!==u.id)err("Dangling federalism actor relationship "+u.id+":"+id);
  for(const id of arr(u.capability_link_ids))if(cmap.get(id)?.unit_id!==u.id)err("Dangling federalism capability link "+u.id+":"+id);
  if(historical.has(u.effect_status)){
   if(arr(u.relationship_ids).length||arr(u.capability_link_ids).length)err("Historical fugitive-service clause incorrectly activated "+u.id);
  }else if(!arr(u.relationship_ids).length||!arr(u.capability_link_ids).length)err("Operative federalism unit lacks traceable relationships or capabilities "+u.id);
 }
 if(arr(d.provisions).some(x=>x.id.startsWith("CONST-US-ART-04-SEC-01-CL-")||x.id.startsWith("CONST-US-ART-04-SEC-04-CL-")))
  err("Invented numbered clause in original Article IV Section 1 or Section 4");
 if(arr(d.provisions).filter(x=>x.id.startsWith("CONST-US-ART-04-SEC-01-SEG-")).length!==2||arr(d.provisions).filter(x=>x.id.startsWith("CONST-US-ART-04-SEC-04-SEG-")).length!==3)
  err("Original Article IV semantic segment counts invalid");
 if(provisions.get("CONST-US-ART-04-SEC-02-CL-03")?.effect_status!=="superseded")err("Thirteenth Amendment historical supersession lost");
 for(const qual of q){
  required(qual,["id","type","kind","name","summary","source_provision_ids","applies_to_norm_ids","effect_status","origin","source_ids","review_status"],err);
  if(qual.type!=="federalism_qualification"||!/^FED-QUAL-[A-Z0-9-]+$/.test(qual.id))err("Invalid federalism qualification identity "+qual.id);
  if(qual.review_status!=="research_textual_summary_pending_legal_review")err("Unreviewed federalism qualifier promoted to legal doctrine "+qual.id);
  if(!["operative","historical_only","amendment_modified","research_boundary"].includes(qual.effect_status))err("Invalid federalism qualification effect "+qual.id);
  if(!["original_text","historical_text","amendment_overlay","interpretive_boundary"].includes(qual.origin))err("Invalid federalism qualifier origin "+qual.id);
  if(qual.origin==="interpretive_boundary"&&qual.effect_status!=="research_boundary")err("Doctrinal boundary represented as express original text "+qual.id);
  if(qual.origin==="historical_text"&&qual.effect_status!=="historical_only")err("Historical fugitive-service rule activated "+qual.id);
  if(qual.origin==="amendment_overlay"&&!arr(qual.source_provision_ids).some(p=>p.startsWith("CONST-US-AMD-")))err("Unsubstantiated federalism amendment overlay "+qual.id);
  if(!arr(qual.source_provision_ids).length||!arr(qual.applies_to_norm_ids).length)err("Orphan federalism qualification "+qual.id);
  for(const p of arr(qual.source_provision_ids))if(!provisions.has(p))err("Unknown federalism qualifier provision "+qual.id+":"+p);
  for(const n of arr(qual.applies_to_norm_ids))if(!norms.has(n))err("Unknown federalism qualifier norm "+qual.id+":"+n);
  for(const id of arr(qual.cross_article_qualification_ids))if(!originalQ.has(id))err("Invalid cross-article qualification "+qual.id+":"+id);
  if(!units.some(u=>arr(u.qualification_ids).includes(qual.id)))err("Unlinked federalism qualifier "+qual.id);
 }
 for(const r of rels){
  required(r,["id","type","unit_id","norm_id","relationship_type","subject_actor_id","counterparty_actor_id","qualification_ids","effect_status","source_ids","review_status","classification"],err);
  if(r.type!=="constitutional_federalism_relationship"||!/^FED-REL-\d{4}$/.test(r.id))err("Invalid federalism relationship "+r.id);
  const u=umap.get(r.unit_id),n=norms.get(r.norm_id);
  if(!u||!u.norm_ids?.includes(r.norm_id))err("Federalism relationship has no source norm "+r.id);
  if(!n||!active.has(n.effect_status)||historical.has(u?.effect_status))err("Historical or inactive federalism relationship "+r.id);
  if(!allActors.has(r.subject_actor_id))err("Unknown federalism subject actor "+r.id+":"+r.subject_actor_id);
  if(r.counterparty_actor_id&&!allActors.has(r.counterparty_actor_id))err("Unknown federalism counterparty "+r.id+":"+r.counterparty_actor_id);
  if(r.effect_status!=="operative"||r.review_status!=="research_mapping_pending_review")err("Federalism relationship claims final legal effect "+r.id);
  if(r.classification!=="legal_role_relationship_not_organizational_hierarchy")err("State governments misclassified as federal administrative subordinates "+r.id);
  if(!arr(r.qualification_ids).length)err("Unqualified federalism actor relationship "+r.id);
  for(const id of arr(r.qualification_ids)){
   const qualifier=qmap.get(id);
   if(!qualifier||!qualifier.applies_to_norm_ids?.includes(r.norm_id)||!["operative","amendment_modified"].includes(qualifier.effect_status))
    err("Inapplicable/historical federalism relationship qualifier "+r.id+":"+id);
  }
 }
 for(const right of rights){
  required(right,["id","type","interest_kind","unit_id","norm_id","holder_actor_id","addressee_actor_id","qualification_ids","source_ids","review_status","not_independent_judicial_holding"],err);
  if(right.type!=="constitutional_protected_interest"||!/^FED-RIGHT-\d{2}$/.test(right.id))err("Invalid federalism protected-interest ID "+right.id);
  if(!umap.get(right.unit_id)?.norm_ids?.includes(right.norm_id))err("Right not sourced to unit norm "+right.id);
  if(!actors.has(right.holder_actor_id)||!actors.has(right.addressee_actor_id))err("Invalid protected right actor "+right.id);
  if(right.not_independent_judicial_holding!==true||right.review_status!=="research_textual_summary_pending_legal_review")err("Proposed constitutional right represented as final judicial holding "+right.id);
  for(const qid of arr(right.qualification_ids))if(!qmap.get(qid)?.applies_to_norm_ids?.includes(right.norm_id))err("Unqualified protected federalism interest "+right.id+":"+qid);
 }
 const rightsBy=new Map(rights.map(x=>[x.id,x]));
 const expectedRights=[
 ["FED-RIGHT-01","ACT-US-CITIZENS","ACT-US-STATES"],
 ["FED-RIGHT-02","ACT-US-OFFICE-CANDIDATES","ACT-US-FED"],
 ["FED-RIGHT-03","ACT-US-STATES","ACT-US-FED"],
 ["FED-RIGHT-04","ACT-US-PEOPLE","ACT-US-FED"],
 ["FED-RIGHT-05","ACT-US-PERSONS","ACT-US-STATES"],
 ["FED-RIGHT-06","ACT-US-CITIZENS","ACT-US-STATES"],
 ["FED-RIGHT-07","ACT-US-PERSONS","ACT-US-STATES"],
 ["FED-RIGHT-08","ACT-US-PERSONS","ACT-US-STATES"],
 ["FED-RIGHT-09","ACT-US-STATES","ACT-US-ARTICLE-III-COURTS"]
 ];
 if(rights.length!==9)err("Federalism rights and reservations inventory incomplete");
 for(const [id,holder,addressee] of expectedRights)if(rightsBy.get(id)?.holder_actor_id!==holder||rightsBy.get(id)?.addressee_actor_id!==addressee)
  err("Rights-holder or constitutional addressee incorrectly classified "+id);
 const linksSet=new Set;
 for(const l of caps){
  required(l,["id","type","unit_id","constitutional_norm_id","capability_id","qualification_ids","relationship_type","rationale","source_ids","review_status"],err);
  if(l.type!=="federalism_capability_alignment"||!/^FED-CAP-\d{4}$/.test(l.id))err("Invalid federalism capability alignment "+l.id);
  const u=umap.get(l.unit_id),n=norms.get(l.constitutional_norm_id);
  if(!u||!u.norm_ids?.includes(l.constitutional_norm_id)||!n||!active.has(n.effect_status)||historical.has(u.effect_status))
   err("Inactive federalism norm mapped to active capability "+l.id);
  if(!capIds.has(l.capability_id))err("Unknown federalism capability "+l.id);
  if(l.relationship_type!=="functional_alignment_not_delegation"||l.review_status!=="research_mapping_pending_review")
   err("Federalism capability incorrectly claimed as agency delegation "+l.id);
  if(!arr(l.qualification_ids).length)err("Federalism capability missing constitutional limits "+l.id);
  for(const id of arr(l.qualification_ids))if(!qmap.get(id)?.applies_to_norm_ids?.includes(l.constitutional_norm_id)||!["operative","amendment_modified"].includes(qmap.get(id)?.effect_status))
   err("Unsupported federalism capability qualification "+l.id+":"+id);
  const key=l.unit_id+"|"+l.constitutional_norm_id+"|"+l.capability_id;
  if(linksSet.has(key))err("Duplicate federalism functional alignment "+key);linksSet.add(key);
 }
 // A few negative conditions are constitutionally dispositive: keep them anchored and typed.
 const critical=[
 ["FED-QUAL-IV-02-SLAVERY-HISTORICAL","NORM-US-CONST-FED-IV-02-HISTORICAL-SERVICE"],
 ["FED-QUAL-IV-03-STATE-LEGISLATURE-CONSENT","NORM-US-CONST-FED-IV-03-STATE-CONSENTS"],
 ["FED-QUAL-IV-04-INVASION-ALL-STATES","NORM-US-CONST-FED-IV-04-INVASION"],
 ["FED-QUAL-IV-04-DOMESTIC-LEGISLATURE-REQUEST","NORM-US-CONST-FED-IV-04-DOMESTIC"],
 ["FED-QUAL-IV-04-DOMESTIC-EXECUTIVE-FALLBACK","NORM-US-CONST-FED-IV-04-DOMESTIC"],
 ["FED-QUAL-VI-02-LAWS-IN-PURSUANCE","NORM-US-CONST-045"],
 ["FED-QUAL-VI-02-STATE-JUDGES-BOUND","NORM-US-CONST-045"],
 ["FED-QUAL-VI-03-NO-FEDERAL-RELIGIOUS-TEST","NORM-US-CONST-047"],
 ["FED-QUAL-X-NOT-DELEGATED-NOT-PROHIBITED","NORM-US-CONST-062"],
 ["FED-QUAL-XI-COVERED-SUITS","NORM-US-CONST-063"],
 ["FED-QUAL-XI-OUT-OF-STATE-OR-FOREIGN-CLAIMANTS","NORM-US-CONST-063"],
 ["FED-QUAL-XIV-01-US-CITIZENS-PRIVILEGES","NORM-US-CONST-068"],
 ["FED-QUAL-XIV-01-PERSONS-DUE-PROCESS","NORM-US-CONST-069"],
 ["FED-QUAL-XIV-01-PERSONS-EQUAL-PROTECTION","NORM-US-CONST-070"],
 ["FED-QUAL-XIV-01-STATE-ACTOR-DIRECT","NORM-US-CONST-069"],
 ["FED-QUAL-XIV-02-ORIGINAL-MALE-VOTE-REFERENCE","NORM-US-CONST-FED-XIV-02-VOTE-ABRIDGMENT"],
 ["FED-QUAL-XIV-03-TWO-THIRDS-EACH-HOUSE","NORM-US-CONST-FED-XIV-03-REMOVAL-TWO-THIRDS"],
 ["FED-QUAL-XIV-04-NO-REBEL-DEBTS","NORM-US-CONST-FED-XIV-04-ILLEGAL-REBELLION-DEBT"],
 ["FED-QUAL-XIV-04-NO-ENSLAVEMENT-LOSS-COMPENSATION","NORM-US-CONST-FED-XIV-04-ENSLAVEMENT-CLAIMS"],
 ["FED-QUAL-XIV-05-APPROPRIATE-LEGISLATION","NORM-US-CONST-072"]
 ];
 for(const [qid,nid] of critical)if(!qmap.get(qid)?.applies_to_norm_ids?.includes(nid))err("Missing critical federalism safeguard "+qid+"->"+nid);
 if(qmap.get("FED-QUAL-IV-02-SLAVERY-HISTORICAL")?.effect_status!=="historical_only")err("Fugitive-service provision reactivated");
 if(!qmap.get("FED-QUAL-IV-02-SLAVERY-HISTORICAL")?.source_provision_ids?.includes("CONST-US-AMD-13-SEC-01"))err("Thirteenth Amendment historical abrogation untraced");
 if(qmap.get("FED-QUAL-XIV-02-ORIGINAL-MALE-VOTE-REFERENCE")?.effect_status!=="amendment_modified"||!qmap.get("FED-QUAL-XIV-02-ORIGINAL-MALE-VOTE-REFERENCE")?.source_provision_ids?.includes("CONST-US-AMD-26-SEC-01"))err("Twenty-Sixth Amendment overlay lost for Fourteenth Amendment voting age");
 if(!qmap.get("FED-QUAL-XI-ARTICLE-III-CONNECTION")?.source_provision_ids?.includes("CONST-US-ART-03-SEC-02-CL-01"))err("Eleventh Amendment jurisdiction link missing Article III");
 if(!qmap.get("FED-QUAL-XIV-01-STATE-ACTOR-DIRECT")?.source_provision_ids?.includes("CONST-US-AMD-05"))err("Fifth versus Fourteenth Amendment government addressee missing");
 if(!qmap.get("FED-QUAL-VI-02-LAWS-IN-PURSUANCE")?.applies_to_norm_ids?.includes("NORM-US-CONST-FED-VI-02-LAW-PURSUANT"))err("Invalid unconditional supremacy claim");
 if(!rels.some(r=>r.norm_id==="NORM-US-CONST-045"&&r.subject_actor_id==="ACT-US-STATE-JUDGES"&&r.relationship_type==="binds_state_judges"))err("State judge supremacy duty missing");
 if(!rels.some(r=>r.norm_id==="NORM-US-CONST-062"&&r.subject_actor_id==="ACT-US-PEOPLE"&&r.relationship_type==="reserves_power_to")||!rels.some(r=>r.norm_id==="NORM-US-CONST-062"&&r.subject_actor_id==="ACT-US-STATES"&&r.relationship_type==="reserves_power_to"))err("Tenth Amendment State and people reservations incomplete");
 const older=arr(d.changes);
 if(!older.some(ch=>ch.amending_provision_id==="CONST-US-AMD-13-SEC-01"&&ch.affected_provision_ids?.includes("CONST-US-ART-04-SEC-02-CL-03")))err("Original fugitive-service supersession change removed");
 if(!older.some(ch=>ch.amending_provision_id==="CONST-US-AMD-26-SEC-01"&&ch.affected_provision_ids?.includes("CONST-US-AMD-14-SEC-02")))err("Age-related Twenty-Sixth Amendment change removed");
 return {errors,counts:{units:units.length,article_iv_units:units.filter(x=>x.family==="article_iv").length,article_vi_units:units.filter(x=>x.family==="article_vi").length,amendment_units:units.filter(x=>x.family==="amendment").length,qualifications:q.length,relationships:rels.length,protected_interests:rights.length,capability_links:caps.length},status:"research_textual_summary_pending_legal_review"};
}
