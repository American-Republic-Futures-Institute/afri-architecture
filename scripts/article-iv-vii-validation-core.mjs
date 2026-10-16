// Independent pure validator for Articles IV-VII completeness; historic records confer no current authority.
const arr=x=>Array.isArray(x)?x:[];
const source="SRC-CONST-ORIGINAL-TRANSCRIPT",status="research_textual_analysis_pending_human_legal_review";
const family=["article-iv-vii-units","article-iv-vii-qualifications","article-iv-vii-actor-links","article-iv-vii-capability-links","article-iv-vii-viewpoints"];
const fixed={"article-iv-vii-units":25,"article-iv-vii-qualifications":25,"article-iv-vii-actor-links":8,"article-iv-vii-capability-links":8,"article-iv-vii-viewpoints":4};
const artRoman={4:"IV",5:"V",6:"VI",7:"VII"};
const pad=n=>String(n).padStart(2,"0");
const specialV=[
 ["ORG-FED-LEG-CONGRESS","no_presidential_assent"],
 ["ACT-US-STATE-LEG","no_auto_amendment"],
 ["ORG-FED-LEG-CONGRESS","conditional_application"],
 ["ACT-US-AMENDMENT-PROPOSING-CONVENTION","not_proof_of_convention"],
 ["ACT-US-STATE-LEG","three_quarters_states"],
 ["ACT-US-STATE-RATIFYING-CONVENTIONS","three_quarters_states"],
 ["ORG-FED-LEG-CONGRESS","exclusive_alternatives"],
 [null,"expires_1808"],
 ["ACT-US-STATES","state_specific_consent"]
];
const specialVII=["historical_convention","1788_threshold_met","historical_effect_only"];
const required=(x,keys,fail)=>{for(const k of keys)if(!Object.hasOwn(x||{},k))fail("Missing completion field "+(x?.id||"record")+"."+k)};
export function validateArticleIVVII(d){
 const errors=[],bad=x=>errors.push(x),manifest=d.manifest||{},ext=manifest.articles_iv_vii_completion_extension||{},M=d.models||{};
 const lists=Object.fromEntries(family.map(k=>[k,arr(M[k]?.items)]));
 const maps=Object.fromEntries(family.map(k=>[k,new Map(lists[k].map(x=>[x.id,x]))]));
 const allIds=new Set();
 for(const name of family){
  if(!arr(manifest.models).includes("model/constitutional/"+name+".json"))bad("Article completion missing manifest model "+name);
  if(M[name]?.model_version!==manifest.model_version||!Array.isArray(M[name]?.items))bad("Article completion invalid collection "+name);
  if(lists[name].length!==fixed[name])bad("Article completion count mismatch "+name);
  for(const x of lists[name]){
   if(!x?.id||allIds.has(x.id))bad("Article completion duplicate ID "+x?.id);
   allIds.add(x.id);
   if(!arr(x.source_ids).includes(source)||arr(x.source_ids).some(s=>!d.sourceIds?.includes(s)))bad("Completion unit lacks verified NARA source ID "+x?.id);
  }
 }
 const requiredCounts={article_iv_units:10,article_v_units:9,article_vi_units:3,article_vii_units:3,analytical_article_spans:12,qualifications:25,actor_links:8,capability_links:8,viewpoints:4};
 if(ext.id!=="ARFI-COA-ARTICLES-IV-VII-001"||ext.snapshot_date!=="2026-10-16"||ext.review_status!==status||ext.article_v_1808_limitation_status!=="expired_non_operational"||ext.article_vii_original_ratification_status!=="historical_condition_fulfilled_1788_not_reusable")bad("Article completion publication metadata invalid");
 for(const [k,n]of Object.entries(requiredCounts))if(ext[k]!==n)bad("Article completion claimed coverage incorrect "+k);
 const provisions=new Map(arr(d.provisions).map(x=>[x.id,x])),norms=new Map(arr(d.norms).map(x=>[x.id,x]));
 const actors=new Set([...arr(d.actors).map(x=>x.id),...arr(d.institutions).map(x=>x.id)]),caps=new Set(arr(d.capabilities).map(x=>x.id)),bindings=new Map(arr(d.bindings).map(x=>[x.norm_id,x]));
 const fed=new Map(arr(d.federalismUnits).map(x=>[x.id,x])),fq=new Set(arr(d.federalismQualifications).map(x=>x.id)),fr=new Set(arr(d.federalismRelations).map(x=>x.id)),fc=new Set(arr(d.federalismCapabilities).map(x=>x.id));
 const Q=maps["article-iv-vii-qualifications"],A=maps["article-iv-vii-actor-links"],C=maps["article-iv-vii-capability-links"];
 const unitRows=lists["article-iv-vii-units"],us=new Map(unitRows.map(x=>[x.id,x]));
 for(const [article,n]of [[4,10],[5,9],[6,3],[7,3]])if(unitRows.filter(x=>x.article===article).length!==n)bad("Incomplete Article "+article+" source-unit coverage");
 for(const u of unitRows){
  required(u,["id","type","article","ordinal","unit_kind","provision_id","name","summary","current_effect_status","norm_ids","qualification_ids","actor_link_ids","capability_link_ids","existing_federalism_unit_id","existing_federalism_qualification_ids","existing_federalism_actor_link_ids","existing_federalism_capability_link_ids","source_ids","review_status"],bad);
  const p=provisions.get(u.provision_id);
  if(u.type!=="article_iv_vii_comprehensive_unit"||!p||u.review_status!==status)bad("Unreviewed constitutional unit represented as final law "+u.id);
  if(!arr(u.norm_ids).length||u.norm_ids.some(id=>!norms.get(id)?.provision_ids?.includes(u.provision_id)))bad("Constitutional norm source gap "+u.id);
  if(u.qualification_ids?.length!==1||u.qualification_ids.some(id=>Q.get(id)?.unit_id!==u.id))bad("Article qualifier detached "+u.id);
  if(u.actor_link_ids?.some(id=>A.get(id)?.unit_id!==u.id)||u.capability_link_ids?.some(id=>C.get(id)?.unit_id!==u.id))bad("Constitutional authority link detached "+u.id);
  if([4,6].includes(u.article)){
   const f=fed.get(u.existing_federalism_unit_id);
   if(u.unit_kind!=="existing_source_decomposition_crosswalk"||!f||f.provision_id!==u.provision_id||f.family!=="article_"+artRoman[u.article].toLowerCase()||u.current_effect_status!==f.effect_status||p.effect_status!==f.effect_status)bad("Article IV/VI crosswalk changed existing authority "+u.id);
   for(const [field,expected,sourceSet]of [["existing_federalism_qualification_ids",f?.qualification_ids,fq],["existing_federalism_actor_link_ids",f?.relationship_ids,fr],["existing_federalism_capability_link_ids",f?.capability_link_ids,fc]])
    if(JSON.stringify(u[field])!==JSON.stringify(expected)||arr(u[field]).some(x=>!sourceSet.has(x)))bad("Article IV/VI source relation silently diverges "+u.id+":"+field);
   if(arr(u.actor_link_ids).length||arr(u.capability_link_ids).length)bad("Duplicate Article IV/VI relations inconsistent with federalism authority "+u.id);
   if(u.provision_id==="CONST-US-ART-04-SEC-02-CL-03"&&(u.current_effect_status!=="superseded"||f.relationship_ids.length||f.capability_link_ids.length))bad("Thirteenth Amendment historic-service safeguard violated");
  }else{
   const id="CONST-US-ART-"+pad(u.article)+"-SEG-"+pad(u.ordinal);
   const archived=u.current_effect_status==="expired";
   if(u.unit_kind!=="arfi_nonofficial_analytical_segment"||u.provision_id!==id||p?.parent_id!=="CONST-US-ART-"+pad(u.article)||p?.unit!=="article_segment"||p?.segment_kind!=="arfi_analytic_not_numbered_clause"||!p?.source_locator?.includes("not an original numbered Section or Clause")||p?.effect_status!==u.current_effect_status)bad("Original Article V/VII clause invented or mislabeled "+u.id);
   if(arr(u.existing_federalism_qualification_ids).length||u.existing_federalism_unit_id)bad("False federalism source lineage on Article V/VII "+u.id);
   if(archived&&(arr(u.actor_link_ids).length||arr(u.capability_link_ids).length||u.norm_ids.some(id=>bindings.has(id))))bad("Expired constitutional process revived as active authority "+u.id);
   if(!archived&&(!u.actor_link_ids?.length||!u.capability_link_ids?.length||u.norm_ids.some(id=>!bindings.has(id))))bad("Current Article V constitutional procedure not mapped to actor/capability "+u.id);
  }
 }
 // These Articles are not divided into numbered Sections. Do not generate fictional Clauses under V or VII.
 if([...provisions.values()].some(p=>/^CONST-US-ART-(05|07)-/.test(p.id)&&p.unit!=="article_segment"))bad("Invented Article V/VII original numbered Clause or Section");
 for(const q of lists["article-iv-vii-qualifications"]){
  required(q,["id","type","unit_id","qualification_kind","summary","source_provision_ids","current_effect_status","source_ids","review_status"],bad);
  const u=us.get(q.unit_id);
  if(q.type!=="article_iv_vii_textual_qualification"||!u||q.review_status!==status||q.current_effect_status!==u.current_effect_status||!arr(q.source_provision_ids).includes(u.provision_id)||q.source_provision_ids.some(id=>!provisions.has(id))||!u.qualification_ids?.includes(q.id)||!q.summary)bad("Article IV/VII missing legal limitation "+q.id);
 }
 for(const a of lists["article-iv-vii-actor-links"]){
  required(a,["id","type","unit_id","norm_id","actor_id","actor_role","actor_relationship_classification","qualification_ids","source_ids","review_status"],bad);
  const u=us.get(a.unit_id);
  if(a.type!=="article_iv_vii_actor_relationship"||!u||u.article!==5||u.current_effect_status!=="operative"||!actors.has(a.actor_id)||!u.norm_ids.includes(a.norm_id)||!u.actor_link_ids?.includes(a.id)||a.actor_relationship_classification!=="constitutional_procedural_role_not_organizational_subordination"||a.qualification_ids.some(id=>!u.qualification_ids.includes(id))||a.review_status!==status)bad("Article V procedural actor classified as federal subordinate "+a.id);
 }
 for(const c of lists["article-iv-vii-capability-links"]){
  required(c,["id","type","unit_id","norm_id","capability_id","qualification_ids","link_semantics","source_ids","review_status"],bad);
  const u=us.get(c.unit_id);
  if(c.type!=="article_iv_vii_functional_capability_link"||!u||u.article!==5||u.current_effect_status!=="operative"||!u.norm_ids.includes(c.norm_id)||!caps.has(c.capability_id)||c.capability_id!=="CAP-FED-58"||c.link_semantics!=="constitutional_amendment_process_alignment_not_statutory_agency_delegation"||!u.capability_link_ids.includes(c.id)||c.qualification_ids.some(id=>!u.qualification_ids.includes(id)))bad("Constitutional amendment power improperly mapped as agency delegation "+c.id);
 }
 const normalV=unitRows.filter(u=>u.article===5).sort((a,b)=>a.ordinal-b.ordinal),normalVII=unitRows.filter(u=>u.article===7).sort((a,b)=>a.ordinal-b.ordinal);
 for(let i=0;i<specialV.length;i++){
  const u=normalV[i],q=Q.get(u?.qualification_ids?.[0]),a=A.get(u?.actor_link_ids?.[0]),[actor,qkind]=specialV[i];
  if(u?.ordinal!==i+1||q?.qualification_kind!==qkind||u.current_effect_status!==(i===7?"expired":"operative")||a?.actor_id!==(i===7?undefined:actor))bad("Critical Article V amendment threshold/consent condition missing at "+(i+1));
 }
 for(let i=0;i<specialVII.length;i++){
  const u=normalVII[i],q=Q.get(u?.qualification_ids?.[0]);
  if(u?.ordinal!==i+1||u.current_effect_status!=="expired"||q?.qualification_kind!==specialVII[i])bad("Article VII historical ratification cannot be repurposed "+(i+1));
 }
 if(Q.get("A47-QUAL-IV-02-03-01")?.source_provision_ids?.includes("CONST-US-AMD-13-SEC-01")!==true)bad("Historical Article IV fugitive service not linked to Thirteenth Amendment");
 for(const v of lists["article-iv-vii-viewpoints"]){
  required(v,["id","type","root_provision_id","unit_ids","renderer_owner","publication_status","review_status","source_ids"],bad);
  if(v.type!=="article_iv_vii_viewpoint"||v.renderer_owner!=="afri-website"||v.publication_status!=="architecture_only_not_implemented_in_website"||!provisions.has(v.root_provision_id)||v.unit_ids.some(id=>!us.has(id)))bad("Article architecture illegally claims deployed view "+v.id);
 }
 return {errors,counts:{units:unitRows.length,articleIV:10,articleV:9,articleVI:3,articleVII:3,analyticalSegments:12,qualifications:lists["article-iv-vii-qualifications"].length,actorLinks:lists["article-iv-vii-actor-links"].length,capabilityLinks:lists["article-iv-vii-capability-links"].length,viewpoints:lists["article-iv-vii-viewpoints"].length},status};
}
