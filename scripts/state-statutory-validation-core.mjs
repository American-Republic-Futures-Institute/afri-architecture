// ARFI statutory overlay: source-bound legal authority, not a claim of certified current law.
const names=["statutory-sources","statutes","statutory-provisions","statutory-powers","statutory-conditions","statutory-capabilities","statutory-traces","statutory-viewpoints"];
const count={ "statutory-sources":5,statutes:2,"statutory-provisions":5,"statutory-powers":4,"statutory-conditions":7,"statutory-capabilities":2,"statutory-traces":2,"statutory-viewpoints":2 };
const read=(x)=>Array.isArray(x)?x:[];
const state=id=>/^(?:JUR-US-|ORG-STATE-|STATE-PROV-|STAT-PROV-|STAT-STATE-|SRC-STAT-|POWER-STAT-|COND-STAT-|CAP-STATE-|TRACE-STATE-|VIEW-STATE-)(VA|NE)(?:-|$)/.exec(id)?.[1]||null;
const legal="primary_statutory_text_indexed_pending_qualified_legal_review";
const required=(r,fields,err)=>{for(const f of fields)if(!Object.hasOwn(r||{},f))err("Required statutory field "+(r?.id||"missing")+"."+f)};
export function validateStateStatutes(d){
 const errors=[],err=x=>errors.push(x),M=d.models||{},ext=d.manifest?.state_statutory_extension||{};
 const entries=Object.fromEntries(names.map(n=>[n,read(M[n]?.items)]));
 const index=Object.fromEntries(names.map(n=>[n,new Map(entries[n].map(x=>[x.id,x]))]));
 const seen=new Set();
 for(const n of names){
  if(!d.manifest?.models?.includes("model/state/"+n+".json"))err("Statutory model missing from manifest "+n);
  if(M[n]?.model_version!==d.manifest?.model_version||!Array.isArray(M[n]?.items))err("Invalid statutory collection "+n);
  if(entries[n].length!==count[n])err("Statutory collection coverage mismatch "+n);
  for(const x of entries[n]){
   if(typeof x.id!=="string"||seen.has(x.id))err("Duplicate or missing statutory identifier "+x.id);
   seen.add(x.id);
   if(!["VA","NE"].includes(state(x.id)))err("Unapproved State statutory record "+x.id);
  }
 }
 if(ext.id!=="ARFI-COA-STATE-STATUTES-001"||ext.snapshot_date!=="2026-10-16"||ext.review_status!==legal||ext.fully_modelled_state_count!==0||JSON.stringify(ext.pilot_state_codes)!=='["VA","NE"]')err("Statutory publication coverage overclaim");
 for(const [field,name] of Object.entries({source_count:"statutory-sources",statute_group_count:"statutes",codified_section_count:"statutory-provisions",statutory_power_count:"statutory-powers",condition_count:"statutory-conditions",capability_count:"statutory-capabilities",trace_count:"statutory-traces",viewpoint_count:"statutory-viewpoints"}))if(ext[field]!==count[name])err("Statutory extension count incorrect "+field);
 const constitutional=new Map(read(d.stateProvisions).map(x=>[x.id,x]));
 const institutions=new Map(read(d.stateInstitutions).map(x=>[x.id,x]));
 const jurisdictions=new Map(read(d.stateJurisdictions).map(x=>[x.id,x]));
 const sources=index["statutory-sources"],statutes=index.statutes,provisions=index["statutory-provisions"],powers=index["statutory-powers"],conditions=index["statutory-conditions"],caps=index["statutory-capabilities"];
 const sourceCheck=x=>{if(!Array.isArray(x.source_ids)||!x.source_ids.length)err("Statutory missing provenance "+x.id);for(const s of read(x.source_ids))if(!sources.has(s))err("Statutory source reference invalid "+x.id+" "+s)};
 const same=(x,id)=>state(x.jurisdiction_id)===state(id)&&state(x.id)===state(id);
 for(const s of entries["statutory-sources"]){
  required(s,["type","jurisdiction_id","title","publisher","url","kind","section","scope","accessed_on","review_status"],err);
  if(s.type!=="state_primary_codified_statute_source"||s.kind!=="official_enacted_statute_codification"||s.accessed_on!=="2026-10-16"||!same(s,s.id)||!jurisdictions.has(s.jurisdiction_id))err("Incorrect State statutory source identity "+s.id);
  if(!(s.url.startsWith("https://law.lis.virginia.gov/")&&state(s.id)==="VA"||s.url.startsWith("https://nebraskalegislature.gov/")&&state(s.id)==="NE"))err("Statute lacks corresponding official State publisher "+s.id);
  if(s.review_status!=="official_primary_law_locator_not_professional_citator_review")err("Statutory source falsely legally certified "+s.id);
 }
 for(const st of entries.statutes){
  required(st,["type","jurisdiction_id","constitutional_provision_id","enacting_institution_id","enactment_classification","source_ids","review_status"],err);sourceCheck(st);
  const cp=constitutional.get(st.constitutional_provision_id),ins=institutions.get(st.enacting_institution_id);
  if(st.type!=="state_code_chapter_group"||!cp||!ins||!same(st,st.id)||cp.jurisdiction_id!==st.jurisdiction_id||ins.jurisdiction_id!==st.jurisdiction_id||!["legislature","unicameral_legislature"].includes(ins.kind))err("Statute cannot trace State constitutional legislature "+st.id);
  if(st.enactment_classification!=="codification_of_multiple_enacted_acts_not_one_new_enactment"||st.review_status!==legal)err("Statute falsely presents historical enactment or full validation "+st.id);
 }
 for(const sp of entries["statutory-provisions"]){
  required(sp,["type","jurisdiction_id","statute_id","section","citation","source_ids","effective_from","published_current_on","scope_summary","review_status"],err);sourceCheck(sp);
  const st=statutes.get(sp.statute_id);if(sp.type!=="state_codified_statutory_section"||!st||!same(sp,sp.id)||st.jurisdiction_id!==sp.jurisdiction_id||sp.source_ids.some(id=>!st.source_ids.includes(id)))err("Statutory provision cross-jurisdiction or code group mismatch "+sp.id);
  if(!sp.citation.includes(sp.section)||sp.published_current_on!=="2026-10-16"||sp.review_status!==legal)err("Statutory citation or temporal status invalid "+sp.id);
  if(sp.id==="STAT-PROV-VA-17.1-400"&&(sp.effective_from!=="2026-09-01"||!sp.superseded_statutory_fact?.includes("17 judges")||!sp.superseded_statutory_fact?.includes("21 judges")))err("Virginia appellate judge-count revision not dated "+sp.id);
 }
 for(const po of entries["statutory-powers"]){
  required(po,["type","jurisdiction_id","institution_id","constitutional_provision_id","statutory_provision_id","statute_id","source_ids","power_kind","subsection","summary","scope_boundary","review_status"],err);sourceCheck(po);
  const ins=institutions.get(po.institution_id),cp=constitutional.get(po.constitutional_provision_id),sp=provisions.get(po.statutory_provision_id);
  if(po.type!=="state_statutory_authority"||!same(po,po.id)||!ins||!cp||!sp||sp.statute_id!==po.statute_id||[ins.jurisdiction_id,cp.jurisdiction_id,sp.jurisdiction_id].some(id=>id!==po.jurisdiction_id)||po.source_ids.every(id=>!sp.source_ids.includes(id)))err("Statutory power chain invalid or crosses State "+po.id);
  if(!["bounded_appellate_jurisdiction","institutional_establishment_not_general_jurisdiction"].includes(po.power_kind)||po.review_status!==legal||!po.scope_boundary||!po.subsection)err("Statutory authority lacks operative limitation "+po.id);
 }
 for(const co of entries["statutory-conditions"]){
  required(co,["type","jurisdiction_id","power_id","condition_kind","summary","source_provision_ids","source_ids","limits_unrestricted_power","review_status"],err);sourceCheck(co);
  const po=powers.get(co.power_id);
  if(co.type!=="state_statutory_authority_condition"||!po||po.jurisdiction_id!==co.jurisdiction_id||!same(co,co.id)||co.limits_unrestricted_power!==true||!read(co.source_provision_ids).length||co.source_provision_ids.some(id=>provisions.get(id)?.jurisdiction_id!==co.jurisdiction_id)||co.review_status!==legal)err("Statutory condition is detached or disabled "+co.id);
 }
 for(const c of entries["statutory-capabilities"]){
  required(c,["type","jurisdiction_id","institution_id","authority_classification","functional_family","source_ids","review_status"],err);sourceCheck(c);
  if(c.type!=="state_government_functional_capability"||!same(c,c.id)||institutions.get(c.institution_id)?.jurisdiction_id!==c.jurisdiction_id||c.authority_classification!=="traceable_limited_statutory_power_not_constitutional_blanket_grant"||c.review_status!==legal)err("Capability falsely assumes a broad power "+c.id);
 }
 for(const t of entries["statutory-traces"]){
  required(t,["type","jurisdiction_id","constitutional_provision_id","statute_id","statutory_provision_ids","institution_id","establishment_power_id","jurisdiction_power_id","condition_ids","capability_id","source_ids","appropriation_verified","judicial_citator_review_complete","disposition","publication_owner","rendering_status","review_status"],err);sourceCheck(t);
  const a=powers.get(t.establishment_power_id),j=powers.get(t.jurisdiction_power_id),c=caps.get(t.capability_id);
  if(t.type!=="state_constitution_statute_institution_capability_trace"||!same(t,t.id)||!a||!j||!c||a.power_kind!=="institutional_establishment_not_general_jurisdiction"||j.power_kind!=="bounded_appellate_jurisdiction"||a.institution_id!==j.institution_id||j.institution_id!==t.institution_id||c.institution_id!==t.institution_id||[a,j,c].some(x=>x.jurisdiction_id!==t.jurisdiction_id)||a.constitutional_provision_id!==t.constitutional_provision_id||j.constitutional_provision_id!==t.constitutional_provision_id||[a,j].some(x=>x.statute_id!==t.statute_id)||t.statutory_provision_ids.some(id=>provisions.get(id)?.jurisdiction_id!==t.jurisdiction_id))err("Statutory end-to-end authority trace broken "+t.id);
  if(!t.condition_ids?.length||t.condition_ids.some(id=>{const co=conditions.get(id);return !co||co.jurisdiction_id!==t.jurisdiction_id||![t.establishment_power_id,t.jurisdiction_power_id].includes(co.power_id)}))err("Statutory trace drops restrictive conditions "+t.id);
  const all=entries["statutory-conditions"].filter(x=>x.jurisdiction_id===t.jurisdiction_id);
  if(all.some(x=>!t.condition_ids.includes(x.id)))err("Statutory trace omits known limitation "+t.id);
  if(t.appropriation_verified!==false||t.judicial_citator_review_complete!==false||t.rendering_status!=="not_implemented_in_architecture_repo"||t.publication_owner!=="afri-website"||t.review_status!==legal)err("Statutory research misrepresented as certified or deployed "+t.id);
 }
 for(const v of entries["statutory-viewpoints"]){
  sourceCheck(v);
  if(v.type!=="state_statutory_authority_viewpoint"||v.publication_owner!=="afri-website"||v.rendering_status!=="not_implemented"||!v.root_trace_ids?.length||v.root_trace_ids.some(id=>index["statutory-traces"].get(id)?.jurisdiction_id!==v.jurisdiction_id))err("Unpublished statutory viewpoint wrongly deployed "+v.id);
 }
 if(entries["statutory-traces"].length!==2||!index["statutory-traces"].has("TRACE-STATE-VA-COA-STATUTORY-01")||!index["statutory-traces"].has("TRACE-STATE-NE-COA-STATUTORY-01"))err("Both State pilot authority chains required");
 return {errors,counts:Object.fromEntries(names.map(n=>[n,entries[n].length])),legalReviewStatus:legal,publicationStatus:"architecture_source_only"};
}
