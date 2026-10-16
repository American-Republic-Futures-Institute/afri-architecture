// ARFI federal statutory authority graph: no constitutional grant, departmental mission,
// or functional capability may be silently promoted to executable administrative power.
const families=["statutory-sources","statutes","statutory-provisions","statutory-powers","statutory-conditions","statutory-capability-links","statutory-traces","statutory-viewpoints"];
const targets={"statutory-sources":6,statutes:3,"statutory-provisions":6,"statutory-powers":6,"statutory-conditions":12,"statutory-capability-links":2,"statutory-traces":2,"statutory-viewpoints":2};
const legal="official_codified_text_indexed_no_current_citator_or_program_verification";
const D="ORG-FED-EXE-DEP-DHS",E="ORG-FED-EXE-DEP-EDUCATION",congress="ORG-FED-LEG-CONGRESS";
const arr=x=>Array.isArray(x)?x:[];
const mk=x=>new Map(arr(x).map(y=>[y.id,y]));
const groupOf={"FSTAT-PROV-DHS-6-111":"FSTAT-GROUP-DHS-HSA-2002","FSTAT-PROV-DHS-6-112":"FSTAT-GROUP-DHS-HSA-2002",
"FSTAT-PROV-ED-20-3411":"FSTAT-GROUP-ED-DEOA-1979","FSTAT-PROV-ED-20-3471":"FSTAT-GROUP-ED-DEOA-1979","FSTAT-PROV-ED-20-3403":"FSTAT-GROUP-ED-DEOA-1979","FSTAT-PROV-ED-20-1232A":"FSTAT-GROUP-ED-GEPA"};
const constraintKinds={
"FSTAT-COND-DHS-PRESERVE-OTHER-FUNCTIONS":"preserve_nonsecurity_functions",
"FSTAT-COND-DHS-ECONOMIC-SECURITY":"protect_economic_security",
"FSTAT-COND-DHS-CIVIL-LIBERTIES":"protect_civil_rights_liberties",
"FSTAT-COND-DHS-INVESTIGATION-RESPONSIBILITY":"investigation_and_prosecution_not_primary_department_mission",
"FSTAT-COND-DHS-DELEGATION-EXCEPTION":"delegation_subject_to_specific_exceptions",
"FSTAT-COND-DHS-CONTRACTING-SCOPE":"contracts_within_secretary_responsibilities",
"FSTAT-COND-ED-STATE-RESERVATION":"no_extra_federal_authority_from_department_creation",
"FSTAT-COND-ED-CURRICULUM-PROHIBITION":"school_content_and_personnel_direction_prohibited_absent_law",
"FSTAT-COND-ED-GEPA-CONTROL-PROHIBITION":"gepa_applicable_program_control_prohibition",
"FSTAT-COND-ED-TRANSFER-SCOPE":"authority_only_for_transferred_functions_available_by_law",
"FSTAT-COND-ED-SECRETARY-APPOINTMENT":"presidential_appointment_senate_confirmation",
"FSTAT-COND-ED-HISTORIC-FUNDING-TRANSITION":"historical_eight_month_transition_not_current"};
const powerKinds={
"FSTAT-POWER-DHS-ESTABLISH":"department_establishment_not_program_power",
"FSTAT-POWER-DHS-MISSION":"statutory_mission_not_independent_coercive_authority",
"FSTAT-POWER-DHS-SECRETARY":"department_internal_direction_not_every_law_enforcement_power",
"FSTAT-POWER-DHS-DELEGATION":"delegable_only_except_statutory_restrictions",
"FSTAT-POWER-ED-ESTABLISH":"department_establishment_not_program_power",
"FSTAT-POWER-ED-TRANSFER":"only_preexisting_transferred_function_authority"};
const required=(r,fields,bad)=>{for(const f of fields)if(!Object.hasOwn(r||{},f))bad("Missing federal statutory field "+(r?.id||"record")+"."+f)};
export function validateFederalStatutes(d){
 const errors=[],bad=s=>errors.push(s),manifest=d.manifest||{},ext=manifest.federal_statutory_extension||{},M=d.models||{};
 const all=Object.fromEntries(families.map(x=>[x,arr(M[x]?.items)]));
 const maps=Object.fromEntries(families.map(x=>[x,mk(all[x])]));
 const ids=new Set();
 for(const fam of families){
  if(!arr(manifest.models).includes("model/federal/"+fam+".json"))bad("Federal statutory family unregistered "+fam);
  if(M[fam]?.model_version!=="0.1.0"||!Array.isArray(M[fam]?.items))bad("Federal statutory family has invalid contract "+fam);
  if(all[fam].length!==targets[fam])bad("Federal statutory coverage count mismatch "+fam);
  for(const o of all[fam]){
   if(!o?.id||ids.has(o.id))bad("Duplicate federal statutory record "+o?.id);
   ids.add(o.id);
  }
 }
 const countFields={source_count:"statutory-sources",code_group_count:"statutes",codified_section_count:"statutory-provisions",authority_count:"statutory-powers",condition_count:"statutory-conditions",capability_link_count:"statutory-capability-links",trace_count:"statutory-traces",viewpoint_count:"statutory-viewpoints"};
 if(ext.id!=="ARFI-COA-FEDERAL-STATUTES-001"||ext.review_status!==legal||ext.snapshot_date!=="2026-10-16"||ext.fully_researched_department_count!==0||JSON.stringify(ext.pilot_departments)!==JSON.stringify([D,E]))bad("Federal statutory publication falsely asserts legal or institutional completeness");
 for(const [key,name]of Object.entries(countFields))if(ext[key]!==targets[name])bad("Federal statute manifest count incorrect "+key);
 const src=maps["statutory-sources"],groups=maps.statutes,provisions=maps["statutory-provisions"],powers=maps["statutory-powers"],conditions=maps["statutory-conditions"],caplinks=maps["statutory-capability-links"],traces=maps["statutory-traces"];
 const institutions=mk(d.institutions),caps=mk(d.capabilities),constitution=mk(d.constitutionalProvisions);
 const idsToCheck=new Set([...src.keys()]);
 const sourceCheck=x=>{if(!arr(x.source_ids).length)bad("Federal law provenance missing "+x.id);for(const sid of arr(x.source_ids))if(!idsToCheck.has(sid))bad("Unknown primary U.S. Code source "+x.id+":"+sid)};
 const validDepartment=x=>[D,E].includes(x.department_id)&&institutions.get(x.department_id)?.parent_id==="BR-FED-EXE"&&institutions.get(x.department_id)?.kind==="executive_department";
 for(const s of all["statutory-sources"]){
  required(s,["type","title","publisher","url","citation","source_act_history","code_section","title_number","accessed_on","positive_law_version_basis","review_status"],bad);
  let url;try{url=new URL(s.url)}catch{url=null}
  if(s.type!=="federal_statutory_primary_source"||!url||url.protocol!=="https:"||url.hostname!=="uscode.house.gov"||url.pathname!=="/us/usc/119-118/t"+s.title_number+"/s"+s.code_section+"/"||s.accessed_on!=="2026-10-16"||s.positive_law_version_basis!=="through Public Law 119-120 (2026-10-07)")bad("Incorrect source host, exact U.S. Code locator, or effective snapshot "+s.id);
  if(s.review_status!=="official_primary_codification_not_professional_legal_citator_review")bad("Federal statute source falsely legally certified "+s.id);
  const expected=s.title_number+" U.S.C. § "+s.code_section;if(s.citation!==expected)bad("Federal statutory citation and Code locator disagree "+s.id);
 }
 for(const g of all.statutes){
  required(g,["type","department_id","title","code_title","source_act","section_ids","source_ids","enacted_by_institution_id","classification","review_status"],bad);sourceCheck(g);
  if(g.type!=="federal_codification_group"||!validDepartment(g)||g.enacted_by_institution_id!==congress||g.review_status!==legal)bad("Code group detached from federal lawmaking or department "+g.id);
  if(g.classification==="complete_reenactment_without_history"||!["codified_law_as_amended_not_unmodified_2002_act","codified_law_as_amended_not_unmodified_1979_act","separate_cross_program_statutory_limitation_not_education_department_creating_act"].includes(g.classification))bad("Federal codified group falsely asserts one unchanged Act "+g.id);
  for(const id of arr(g.section_ids))if(!provisions.has(id))bad("Federal law group missing enacted Code section "+g.id+":"+id);
 }
 for(const sp of all["statutory-provisions"]){
  required(sp,["type","code_group_id","department_id","citation","source_ids","source_scope","legal_effect_status","review_status"],bad);sourceCheck(sp);
  const g=groups.get(sp.code_group_id);
  if(sp.type!=="federal_codified_section"||!validDepartment(sp)||!g||g.department_id!==sp.department_id||!g.section_ids?.includes(sp.id)||groupOf[sp.id]!==sp.code_group_id||sp.review_status!==legal)bad("Cross-department statutory section or false Public Law grouping "+sp.id);
  if(!arr(sp.source_ids).length||sp.source_ids.some(id=>!g.source_ids.includes(id)))bad("Statutory provision source unbacked by Code group "+sp.id);
  if(sp.legal_effect_status!=="codified_current_section_subject_to_valid_law_and_judicial_review")bad("Statutory provision current effect falsely certified "+sp.id);
 }
 for(const p of all["statutory-powers"]){
  required(p,["type","department_id","statutory_provision_id","source_ids","subsection","power_kind","summary","scope_boundary","constitutional_context_ids","condition_ids","actor_classification","review_status"],bad);sourceCheck(p);
  if(p.type!=="federal_statutory_authority"||!validDepartment(p)||provisions.get(p.statutory_provision_id)?.department_id!==p.department_id||p.power_kind!==powerKinds[p.id]||p.actor_classification!=="federal_executive_department_not_constitutional_branch"||!p.scope_boundary||p.review_status!==legal)bad("Federal department invented unrestricted constitutional or statutory power "+p.id);
  if(p.source_ids.some(id=>!provisions.get(p.statutory_provision_id)?.source_ids?.includes(id)))bad("Federal department power cites unrelated enabling statute "+p.id);
  if(!arr(p.constitutional_context_ids).length||p.constitutional_context_ids.some(id=>!constitution.has(id)))bad("Federal statutory power lacks actual constitutional context "+p.id);
  if(!arr(p.condition_ids).length||p.condition_ids.some(id=>conditions.get(id)?.department_id!==p.department_id))bad("Federal power drops limits or inherits another department rules "+p.id);
 }
 for(const c of all["statutory-conditions"]){
  required(c,["type","department_id","source_provision_ids","source_ids","subsection","condition_kind","summary","effect_status","qualifies_grant_not_new_grant","review_status"],bad);sourceCheck(c);
  if(c.type!=="federal_statutory_condition"||!validDepartment(c)||c.condition_kind!==constraintKinds[c.id]||c.qualifies_grant_not_new_grant!==true||c.review_status!==legal||!c.summary)bad("False authority condition or unreviewed federal control claim "+c.id);
  if(!arr(c.source_provision_ids).length||c.source_provision_ids.some(id=>provisions.get(id)?.department_id!==c.department_id))bad("Statutory limitation is attached to wrong department "+c.id);
  if(c.source_ids.some(id=>!c.source_provision_ids.some(pid=>provisions.get(pid)?.source_ids?.includes(id))))bad("Statutory limitation cites wrong Code section "+c.id);
  if(c.effect_status!==(c.id==="FSTAT-COND-ED-HISTORIC-FUNDING-TRANSITION"?"expired_historical_condition":"current_applicable_limit"))bad("Historical federal program limit incorrectly activated "+c.id);
 }
 for(const p of all["statutory-powers"])if(all["statutory-conditions"].some(c=>c.department_id===p.department_id&&!p.condition_ids?.includes(c.id)))bad("Federal power omits department boundary "+p.id);
 for(const l of all["statutory-capability-links"]){
  required(l,["type","department_id","institution_id","capability_id","statutory_power_ids","condition_ids","classification","source_ids","review_status"],bad);sourceCheck(l);
  if(l.type!=="federal_statutory_capability_link"||!validDepartment(l)||l.institution_id!==l.department_id||!caps.has(l.capability_id)||l.capability_id!==(l.department_id===D?"CAP-FED-20":"CAP-FED-18")||l.classification!=="descriptive_capability_alignment_not_new_law_enforcement_power"||l.review_status!==legal)bad("Federal agency capability made into unauthorized mission power "+l.id);
  if(!arr(l.statutory_power_ids).length||l.statutory_power_ids.some(id=>powers.get(id)?.department_id!==l.department_id)||!arr(l.condition_ids).length||l.condition_ids.some(id=>conditions.get(id)?.department_id!==l.department_id))bad("Federal capability lacks lawful limiting authority "+l.id);
  if(all["statutory-conditions"].some(c=>c.department_id===l.department_id&&!l.condition_ids.includes(c.id)))bad("Functional description drops source-based limitation "+l.id);
 }
 for(const t of all["statutory-traces"]){
  required(t,["type","institution_id","branch_id","enacted_by_id","code_group_ids","statutory_provision_ids","constitutional_context_ids","power_ids","condition_ids","capability_link_ids","source_ids","appropriation_verified","program_implementation_authorized","citator_review_complete","full_department_powers_inventoried","publication_owner","rendering_status","scope_note","review_status"],bad);sourceCheck(t);
  const dept=t.institution_id;
  if(t.type!=="federal_constitution_statute_agency_capability_trace"||![D,E].includes(dept)||institutions.get(dept)?.parent_id!=="BR-FED-EXE"||t.branch_id!=="BR-FED-EXE"||t.enacted_by_id!==congress||t.review_status!==legal)bad("Federal agency trace falsely uses a State, courts, or wrong branch "+t.id);
  if(!t.code_group_ids?.length||t.code_group_ids.some(id=>groups.get(id)?.department_id!==dept)||!t.statutory_provision_ids?.length||t.statutory_provision_ids.some(id=>provisions.get(id)?.department_id!==dept)||!t.power_ids?.length||t.power_ids.some(id=>powers.get(id)?.department_id!==dept)||!t.condition_ids?.length||t.condition_ids.some(id=>conditions.get(id)?.department_id!==dept)||!t.capability_link_ids?.length||t.capability_link_ids.some(id=>caplinks.get(id)?.department_id!==dept))bad("Statutory end-to-end Federal authority trace missing or crosses institutions "+t.id);
  if(arr(t.constitutional_context_ids).length!==3||t.constitutional_context_ids.some(id=>!constitution.has(id)))bad("Federal authority wrongly constructed from invented constitutional provision "+t.id);
  if(all["statutory-powers"].some(x=>x.department_id===dept&&!t.power_ids.includes(x.id))||all["statutory-conditions"].some(x=>x.department_id===dept&&!t.condition_ids.includes(x.id))||all["statutory-provisions"].some(x=>x.department_id===dept&&!t.statutory_provision_ids.includes(x.id)))bad("Federal department trace silently omits limiting law "+t.id);
  if(t.appropriation_verified!==false||t.program_implementation_authorized!==false||t.citator_review_complete!==false||t.full_department_powers_inventoried!==false||t.publication_owner!=="afri-website"||t.rendering_status!=="model_only_unrendered")bad("Federal statute misrepresented as funded, actionable, judicially verified, or website deployed "+t.id);
 }
 for(const v of all["statutory-viewpoints"]){
  required(v,["type","root_trace_ids","root_institution_id","publisher_owner","rendering_status","review_status","source_ids"],bad);sourceCheck(v);
  if(v.type!=="federal_statutory_authority_view"||v.publisher_owner!=="afri-website"||v.rendering_status!=="not_implemented"||!v.root_trace_ids?.length||v.root_trace_ids.some(id=>traces.get(id)?.institution_id!==v.root_institution_id)||v.review_status!=="architecture_viewpoint_only_no_website_rendering")bad("Federal architecture claims a nonexistent rendered legal view "+v.id);
 }
 if(!traces.has("FSTAT-TRACE-DHS-FOUNDATION")||!traces.has("FSTAT-TRACE-ED-FOUNDATION"))bad("Two contrasting federal department authority traces required");
 if(provisions.get("FSTAT-PROV-ED-20-1232A")?.code_group_id!=="FSTAT-GROUP-ED-GEPA")bad("GEPA wrongly treated as Department of Education Organization Act");
 return {errors,counts:Object.fromEntries(families.map(name=>[name,all[name].length])),review_status:legal,publication_status:"canonical_source_only_no_website_implementation"};
}
