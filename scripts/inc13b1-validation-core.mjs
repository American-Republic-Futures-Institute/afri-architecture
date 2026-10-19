// INC-13B1 is a bounded source-slice reconciliation, not a qualified ADL-1 decision.
import {readFileSync} from "node:fs";
const read=(p)=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
export const expected=Object.freeze([
 ["INC13B1-DOD-STATUTORY-COMPOSITION","model/federal/dod/statutory-composition.json","DOD-SNAPSHOT-USC-2026-10-07",11,"10_USC_111_b_enumerated_classes_and_residuals"],
 ["INC13B1-DOD-DAFA-MAY","model/federal/dod/dafas.json","DOD-SNAPSHOT-DAFA-MAY-2026",27,"GAO_2026_figure_1_May_2026_19_agencies_8_field_activities"],
 ["INC13B1-DOD-COMBATANT-PUBLIC","model/federal/dod/combatant-commands.json","DOD-SNAPSHOT-COMBATANT-PUBLIC-WEB-2026-10-16",11,"defense_gov_public_directory_2026_10_16"],
 ["INC13B1-DOD-ARMED-SERVICES","model/federal/dod/armed-services.json","DOD-SNAPSHOT-USC-2026-10-07",6,"selected_six_armed_service_source_records"]
]);
const unique=x=>new Set(x).size===x.length;
export function validateINC13B1(model,inputs){
 const errors=[];
 const fail=m=>errors.push("INC13B1 "+m);
 if(model.model_family!=="inc13b1-source-slices"||model.model_version!=="0.1.0"||model.department_id!=="ORG-FED-EXE-DEP-DEFENSE"||
   model.research_status!=="source_bounded_unratified"||model.whole_department_first_level_denominator!==null||
   model.adl1_certified_count!==0||model.original_bytes_retained_verified!==false||
   model.independent_legal_review_complete!==false) fail("false certification, completeness or family");
 if(!Array.isArray(model.items)||model.items.length!==4||!unique(model.items.map(x=>x.id))) fail("wrong bounded groups");
 const registeredSources=[...inputs.sources.items,...inputs.coverageSources.items];
 if(!unique(registeredSources.map(x=>x.id)))fail("cross-registry duplicate source identity");
 const sourceIDs=new Set(registeredSources.map(x=>x.id)),snapshots=new Map(inputs.snapshots.items.map(x=>[x.id,x]));
 for(const [id,path,snapshot,n,denom] of expected){
  const x=model.items?.find(y=>y.id===id),target=inputs.collections[path]?.items;
  if(!x||x.source_collection!==path||x.snapshot_id!==snapshot||x.declared_count!==n||
   x.denominator_kind!==denom||x.complete_within_source!==true||x.current_entire_dod_structure_complete!==false||
   !x.qualifier||!Array.isArray(x.source_ids)||!x.source_ids.length||!unique(x.source_ids)||x.source_ids.some(s=>!sourceIDs.has(s))||
   !snapshots.has(snapshot)) fail("source slice metadata "+id);
  if(!Array.isArray(target)||target.length!==n||!unique(target.map(v=>v.id))) fail("canonical collection count "+id);
  if(x?.source_ids?.length && target?.some(v=>v.department_id && v.department_id!=="ORG-FED-EXE-DEP-DEFENSE")) fail("department leakage "+id);
 }
 if(model.items?.some(x=>!expected.some(y=>y[0]===x.id)))fail("invented cohort");
 const reconcileSpecs=[
  {path:expected[0][1],kind:"statutory_composition_only",primary:"CENSUS-SRC-DOD-111",parent:x=>x.department_id,date:x=>"2026-10-07"},
  {path:expected[1][1],kind:"source_observed_placement_not_signed_supervision",primary:"DOD-SRC-GAO-DAFA-2026",parent:x=>x.category_parent_id,date:x=>x.observed_as_of},
  {path:expected[2][1],kind:"public_command_identity_only",primary:"DOD-SRC-DEFENSE-ABOUT-2026",parent:x=>x.statutory_family_id,date:x=>x.roster_as_of},
  {path:expected[3][1],kind:"statutory_service_placement_only",primary:"DOD-SRC-10-101",parent:x=>x.institutional_parent_id,date:x=>x.as_of_statutory_edition}
 ];
 const crosswalk=model.reconciled_observations;
 if(!Array.isArray(crosswalk)||crosswalk.length!==55||!unique(crosswalk.map(x=>x.id))||
   !unique(crosswalk.map(x=>x.original_record_id)))fail("incomplete or duplicate original-record crosswalk");
 const byRecord=new Map((Array.isArray(crosswalk)?crosswalk:[]).map(x=>[x.original_record_id,x]));
 for(const [index,spec] of reconcileSpecs.entries()){
  const snap=snapshots.get(expected[index][2]),family=inputs.collections[spec.path]?.items||[];
  if(index===1){
   const agency=family.filter(x=>x.category==="defense_agency").length,field=family.filter(x=>x.category==="dod_field_activity").length;
   if(agency!==19||field!==8)fail("GAO edition cohort split 19/8 violated");
  }
  for(const original of family){
   const x=byRecord.get(original.id);
   if(!x){fail("missing original record crosswalk "+original.id);continue;}
   const sourceIDsOriginal=JSON.stringify(original.source_ids);
   if(x.id!=="X13B1-OBS-"+original.id||
     x.source_collection!==spec.path||x.source_snapshot_id!==expected[index][2]||
     x.source_relation_class!==spec.kind||x.primary_source_id!==spec.primary||
     !Array.isArray(x.source_ids)||JSON.stringify(x.source_ids)!==sourceIDsOriginal||
     !x.source_ids.includes(spec.primary)||!snap?.source_ids?.includes(spec.primary)||
     x.source_ids.some(id=>!sourceIDs.has(id))||
     x.source_observed_on!==spec.date(original)||x.source_observed_on!==snap?.as_of||
     x.source_observed_parent_id!==spec.parent(original)||
     x.source_classification!==(original.kind||original.category||original.boundary_type)||
     x.publisher_reported_supervisor_role_id!==(index===1?original.supervisor_role_id:null)||
     x.legal_effective_on!==null||x.original_source_bytes_verified!==false||
     x.verified_signed_delegation!==false||x.specific_operational_command_established!==false||
     x.independent_legal_review_complete!==false||x.adl1_certified!==false)
      fail("unverified or altered record/source/role boundary "+original.id);
  }
 }
 if(crosswalk?.some(x=>!reconcileSpecs.some(s=>s.path===x.source_collection&&
   inputs.collections[s.path]?.items?.some(o=>o.id===x.original_record_id))))fail("invented source observation");
 if(!Array.isArray(model.associated_role_ids)||!unique(model.associated_role_ids)||
    JSON.stringify(model.associated_role_ids)!==JSON.stringify(inputs.roles.items.map(x=>x.id))||
    model.associated_role_scope!=="Associated statutory and publisher-described offices; not additional first-level source-cohort members or individually verified appointments")
  fail("DoD offices and oversight reference drift");
 const inspector=inputs.roles.items.find(x=>x.id==="DOD-ROLE-DOD-IG");
 const chairman=inputs.roles.items.find(x=>x.id==="DOD-ROLE-CHAIRMAN");
 const coast=byRecord.get("DOD-SERVICE-COAST");
 if(inspector?.oversight_independence!=="independent_ig_act_powers"||
    chairman?.military_command_role_verified!==false||
    coast?.source_observed_parent_id!=="ORG-FED-EXE-DEP-DHS")
  fail("independent oversight, non-command advisor or conditional Coast Guard boundary lost");
 if(inputs.manifest.models.filter(x=>x==="model/federal/inc13b1-source-slices.json").length!==1)fail("manifest registration");
 if(inputs.manifest.federal_adl1_qualification_13a_extension?.certified_institutions!==0 ||
   inputs.manifest.federal_adl1_qualification_13a_extension?.independent_decision_verified!==false)fail("INC13A nonpromotion");
 return {errors,source_slices:4,source_observations:55,associated_role_references:17,whole_department_first_level_denominator:null,adl1_certified_count:0,qualified_review:false};
}
export function loadINC13B1(){
 const model=read("model/federal/inc13b1-source-slices.json");
 const collections=Object.fromEntries(expected.map(x=>[x[1],read(x[1])]));
 return {model,inputs:{collections,sources:read("model/federal/dod/source-registry.json"),coverageSources:read("model/federal/coverage/source-registry.json"),snapshots:read("model/federal/dod/source-snapshots.json"),roles:read("model/federal/dod/offices.json"),manifest:read("model/federal/manifest.json")}};
}
export function projectINC13B1(input){
 const report=validateINC13B1(input.model,input.inputs);
 if(report.errors.length)throw Error(report.errors.join("; "));
 return {root_id:input.model.department_id,scope:"source-bounded DoD research",source_slices:input.model.items,reconciled_observations:input.model.reconciled_observations,associated_role_ids:input.model.associated_role_ids,coverage:report,
 notice:"Source-listed records only; no current complete DoD organizational denominator, operational command, delegation or certified ADL-1."};
}
