// Architecture-only Article I referential and legal-boundary validation.
// This checker does not interpret case law or create legal authority.
const arr=x=>Array.isArray(x)?x:[];
const pref=(s,c)=>"CONST-US-ART-01-SEC-"+String(s).padStart(2,"0")+"-CL-"+String(c).padStart(2,"0");
const expected=[1,5,7,2,4,2,3,18,8,3];
const historical=new Set(["superseded","repealed","expired"]);
const roleKinds=new Set(["scope","frequency","eligibility","threshold","historical_limit","amendment_change","required_action","authority_scope","exclusive_power","structural_requirement","exception","conditional_office","procedural_requirement","limit","qualification","allocation","condition","consent","prohibition","time_limit","cross_provision_limit","purpose","geographic_limit","reservation","dependency"]);
function required(v,keys,push,prefix){for(const k of keys)if(v?.[k]===undefined||v?.[k]===null)push("Missing "+prefix+"."+k);}
export function validateArticleI(data){
 const errors=[],push=s=>errors.push(s), m=data.manifest||{}, models=data.models||{};
 const collections=["clauses","qualifications","capabilityLinks"];
 for(const k of collections)if(models[k]?.model_version!=="0.1.0"||!Array.isArray(models[k]?.items))push("Invalid Article I "+k+" collection");
 const clauses=arr(models.clauses?.items),quals=arr(models.qualifications?.items),links=arr(models.capabilityLinks?.items);
 const provisions=new Map(arr(data.provisions).map(x=>[x.id,x]));
 const norms=new Map(arr(data.norms).map(x=>[x.id,x]));
 const caps=new Map(arr(data.capabilities).map(x=>[x.id,x]));
 const bindings=arr(data.bindings),srcids=new Set(arr(data.sources).map(x=>x.id));
 const qMap=new Map(quals.map(x=>[x.id,x])), lMap=new Map(links.map(x=>[x.id,x]));
 const ncl=new Map(clauses.map(x=>[x.provision_id,x]));
 const sourceExists=(record)=>{
  if(!Array.isArray(record.source_ids)||!record.source_ids.length)push("No evidence for "+record.id);
  for(const s of arr(record.source_ids))if(!srcids.has(s))push("Unknown evidence "+s+" on "+record.id);
 };
 for(const item of [".clauses",".qualifications",".capability-links"]){
  const f="model/constitutional/article-i-"+item.slice(1)+".json";
  if(!arr(m.models).includes(f))push("Missing publication manifest entry "+f);
 }
 if(m.article_i_extension?.clause_count!==53)push("Incorrect Article I manifest coverage");
 if(clauses.length!==53)push("Article I clause count expected 53; got "+clauses.length);
 for(const [label,values] of [["clauses",clauses],["qualifications",quals],["capabilityLinks",links]]){
  const set=new Set;
  for(const rec of values){if(set.has(rec.id))push("Duplicate "+label+" identifier "+rec.id);set.add(rec.id);}
 }
 const qKinds=new Set(quals.map(x=>x.kind));
 for(let i=0;i<expected.length;i++){
  const got=clauses.filter(x=>x.section===i+1);
  if(got.length!==expected[i])push("Section "+(i+1)+" clause count expected "+expected[i]+" got "+got.length);
  for(let c=1;c<=expected[i];c++){
   const id=pref(i+1,c),v=ncl.get(id);
   if(!v){push("Missing Article I clause "+id);continue;}
   if(v.id!=="AI-CL-"+String(i+1).padStart(2,"0")+"-"+String(c).padStart(2,"0"))push("Incorrect stable clause identifier "+id);
   if(v.clause!==c||v.section!==i+1)push("Inconsistent clause numbering "+id);
  }
 }
 for(const c of clauses){
  required(c,["type","id","section","clause","provision_id","name","summary","current_effect_status","norm_ids","qualification_ids","capability_link_ids","source_ids","review_status"],push,c.id);
  if(c.type!=="article_i_clause_analysis"||!/^\d{1,2}$/.test(String(c.section))||c.id!=="AI-CL-"+String(c.section).padStart(2,"0")+"-"+String(c.clause).padStart(2,"0"))push("Invalid clause analysis identity "+c.id);
  const p=provisions.get(c.provision_id);
  if(p?.unit!=="article_clause"||c.current_effect_status!==p.effect_status)push("Provision/status disagreement "+c.id);
  if(c.review_status!=="textual_summary_pending_legal_review")push("Clause interpretation approved without evidence "+c.id);
  if(!arr(c.norm_ids).length)push("Clause without constitutional effects "+c.id);
  if(!arr(c.qualification_ids).length)push("Clause without textual qualifications "+c.id);
  const noDup=(list)=>new Set(arr(list)).size===arr(list).length;
  if(!noDup(c.norm_ids)||!noDup(c.qualification_ids)||!noDup(c.capability_link_ids))push("Repeated clause reference "+c.id);
  for(const n of arr(c.norm_ids))if(!norms.get(n)?.provision_ids?.includes(c.provision_id))push("Incorrect norm provenance for "+c.id+" -> "+n);
  for(const qid of arr(c.qualification_ids)){
   const q=qMap.get(qid);
   if(!q||q.source_provision_ids?.[0]!==c.provision_id)push("Unresolved clause qualifier "+c.id+" -> "+qid);
  }
  for(const lid of arr(c.capability_link_ids)){
   const l=lMap.get(lid);
   if(!l||!norms.get(l.power_norm_id)?.provision_ids?.includes(c.provision_id))push("Incorrect clause capability alignment "+c.id+" -> "+lid);
  }
  if(historical.has(c.current_effect_status)&&arr(c.capability_link_ids).length)push("Inoperative Article I clause has a capability grant "+c.id);
  sourceExists(c);
 }
 for(const q of quals){
  required(q,["type","id","kind","name","summary","origin","source_provision_ids","applies_to_norm_ids","effect_status","legal_review_status","source_ids"],push,q.id);
  if(q.type!=="article_i_qualification"||!/^AI-QUAL-[A-Z0-9-]+$/.test(q.id))push("Invalid qualification identity "+q.id);
  if(!roleKinds.has(q.kind))push("Unknown qualification kind "+q.id+": "+q.kind);
  if(!["original_text","amendment_overlay"].includes(q.origin))push("Invalid origin "+q.id);
  if(!["operative","amendment_modified","historical_only"].includes(q.effect_status))push("Invalid effect "+q.id);
  if(q.legal_review_status!=="textual_mapping_pending_review")push("Unreviewed legal qualification treated as adopted "+q.id);
  if(!arr(q.source_provision_ids).length||!arr(q.applies_to_norm_ids).length)push("Incomplete legal provenance "+q.id);
  for(const prov of arr(q.source_provision_ids))if(!provisions.has(prov))push("Dangling qualification provision "+q.id+": "+prov);
  for(const normId of arr(q.applies_to_norm_ids))if(!norms.has(normId))push("Dangling qualification norm "+q.id+": "+normId);
  if(q.origin==="amendment_overlay"&&!arr(q.source_provision_ids).some(p=>p.startsWith("CONST-US-AMD-")))push("Unsubstantiated amendment overlay "+q.id);
  if(q.effect_status==="historical_only"&&arr(q.applies_to_norm_ids).some(id=>!historical.has(norms.get(id)?.effect_status)))push("Historical-only qualification grants a current norm "+q.id);
  sourceExists(q);
 }
 const incumbentCongress=new Set(["ORG-FED-LEG-CONGRESS","ORG-FED-LEG-HOUSE","ORG-FED-LEG-SENATE"]);
 const eligiblePowers=arr(data.norms).filter(n=>n.norm_kind==="power"&&n.effect_status==="operative"&&arr(n.provision_ids).some(pid=>pid.startsWith("CONST-US-ART-01-"))&&bindings.some(b=>b.norm_id===n.id && incumbentCongress.has(b.target_id)&&b.relationship_type==="confers_power_on"));
 const mapped=new Set;
 for(const link of links){
  required(link,["id","type","power_norm_id","capability_id","qualification_ids","relationship_type","rationale","source_ids","review_status"],push,link.id);
  if(link.type!=="article_i_capability_alignment"||!/^AI-CAP-\d{4}$/.test(link.id))push("Invalid capability link "+link.id);
  const n=norms.get(link.power_norm_id),cap=caps.get(link.capability_id);
  if(!n||n.norm_kind!=="power"||n.effect_status!=="operative")push("Non-operative/nonpower norm mapped "+link.id);
  if(!cap)push("Unknown federal capability "+link.id+": "+link.capability_id);
  if(link.relationship_type!=="functional_alignment_not_delegation"||link.review_status!=="research_mapping_pending_review")push("Functional alignment incorrectly treated as delegation "+link.id);
  if(n && !eligiblePowers.some(p=>p.id===n.id))push("Mapped noncongressional power "+link.id);
  if(!arr(link.qualification_ids).length)push("Unqualified power-capability mapping "+link.id);
  for(const id of arr(link.qualification_ids)){const qual=qMap.get(id);if(!qual||!arr(qual.applies_to_norm_ids).includes(link.power_norm_id)||qual.effect_status==="historical_only")push("Power link references unrelated/historical qualification "+link.id+":"+id);}
  mapped.add(link.power_norm_id);
  sourceExists(link);
 }
 const pairs=links.map(x=>x.power_norm_id+"|"+x.capability_id);
 if(new Set(pairs).size!==pairs.length)push("Duplicate power-to-capability pair");
 for(const p of eligiblePowers)if(!mapped.has(p.id))push("Congressional power without capability alignment "+p.id);
 for(let c=1;c<=18;c++) {
  const item=ncl.get(pref(8,c));
  if(!item||!arr(item.capability_link_ids).length)push("Section 8 clause lacks capability mapping "+c);
 }
 // Hard constitutional safety gates. A deletion in one of these records must block publication.
 const critical=[
  ["AI-QUAL-08-12-TWO-YEAR-ARMY-FUNDING","NORM-US-CONST-P12"],
  ["AI-QUAL-08-16-STATE-OFFICER-APPOINTMENT","NORM-US-CONST-P16"],
  ["AI-QUAL-08-16-STATE-TRAINING","NORM-US-CONST-P16"],
  ["AI-QUAL-08-18-NECESSARY-PROPER-DEPENDENCY","NORM-US-CONST-P18"],
  ["AI-QUAL-08-01-UNIFORM-INDIRECT","NORM-US-CONST-006"],
  ["AI-QUAL-09-04-AMENDMENT-16","NORM-US-CONST-006"],
  ["AI-QUAL-09-05-NO-FEDERAL-EXPORT-DUTY","NORM-US-CONST-006"],
  ["AI-QUAL-09-06-NO-PORT-PREFERENCE","NORM-US-CONST-P03"],
  ["AI-QUAL-09-07-TREASURY-APPROPRIATION","NORM-US-CONST-P12"],
  ["AI-QUAL-07-03-ADJOURNMENT-EXCEPTION","NORM-US-CONST-AI-07-03-RESOLUTION"],
  ["AI-QUAL-02-03-THREE-FIFTHS-HISTORIC","NORM-US-CONST-AI-02-03-HISTORIC"],
  ["AI-QUAL-09-01-PRE-1808-HISTORICAL","NORM-US-CONST-AI-09-01-HISTORICAL"]
 ];
 for(const [id,normId] of critical)if(!qMap.has(id)||!arr(qMap.get(id).applies_to_norm_ids).includes(normId))push("Missing critical Article I constitutional safeguard "+id+"->"+normId);
 if(qMap.get("AI-QUAL-09-01-PRE-1808-HISTORICAL")?.effect_status!=="historical_only")push("Expired importation clause reactivated");
 if(qMap.get("AI-QUAL-02-03-THREE-FIFTHS-HISTORIC")?.effect_status!=="historical_only")push("Superseded apportionment language reactivated");
 if(provisions.get(pref(3,1))?.effect_status!=="modified_in_part")push("Seventeenth Amendment incorrectly suppresses all Senator composition/tenure rules");
 if(provisions.get(pref(9,4))?.effect_status!=="modified_in_part")push("Sixteenth Amendment direct-tax exception lost");
 if(provisions.get(pref(9,1))?.effect_status!=="expired")push("Pre-1808 historical restriction incorrectly operative");
 if(!qKinds.has("exception")||!qKinds.has("consent")||!qKinds.has("time_limit")||!qKinds.has("reservation"))push("Missing condition/exception dimensions");
 const counts={clauses:clauses.length,qualifications:quals.length,capability_links:links.length,mapped_congressional_powers:mapped.size};
 return {errors,counts,model:"ARFI-COA Article I",status:"research_textual_summary_pending_legal_review"};
}
