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
 if(inputs.manifest.models.filter(x=>x==="model/federal/inc13b1-source-slices.json").length!==1)fail("manifest registration");
 if(inputs.manifest.federal_adl1_qualification_13a_extension?.certified_institutions!==0 ||
   inputs.manifest.federal_adl1_qualification_13a_extension?.independent_decision_verified!==false)fail("INC13A nonpromotion");
 return {errors,source_slices:4,source_observations:55,whole_department_first_level_denominator:null,adl1_certified_count:0,qualified_review:false};
}
export function loadINC13B1(){
 const model=read("model/federal/inc13b1-source-slices.json");
 const collections=Object.fromEntries(expected.map(x=>[x[1],read(x[1])]));
 return {model,inputs:{collections,sources:read("model/federal/dod/source-registry.json"),coverageSources:read("model/federal/coverage/source-registry.json"),snapshots:read("model/federal/dod/source-snapshots.json"),manifest:read("model/federal/manifest.json")}};
}
export function projectINC13B1(input){
 const report=validateINC13B1(input.model,input.inputs);
 if(report.errors.length)throw Error(report.errors.join("; "));
 return {root_id:input.model.department_id,scope:"source-bounded DoD research",source_slices:input.model.items,coverage:report,
 notice:"Source-listed records only; no current complete DoD organizational denominator, operational command, delegation or certified ADL-1."};
}
