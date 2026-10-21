// INC-15C.1 DHS original-source cohort reconciliation: research only.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
export const SOURCE_PIN="f34b82c1d3ebfede1ae8b54e84c73f211f43f3bb";
const SRC="CENSUS-SRC-DHS-CHART-2025";
const SNAP="CENSUS-SNAPSHOT-DHS-CHART-2025";
const PARENT="ORG-FED-EXE-DEP-DHS";
const MODEL="model/federal/inc15c1-dhs-source-reconciliation.json";
const SOURCE_BLOBS=Object.freeze({
  "model/federal/coverage/components.json": "e4d6f5f7bec4aa53d0aca5622615938945ca0962",
  "model/federal/coverage/relationships.json": "efa2994fc764ad0e95b649948e6bd94d37fd2174",
  "model/federal/x12-observations.json": "7e4b20396c545207b9847c7a4f14e593a3b30b68",
  "model/federal/coverage/source-registry.json": "7f0d6aae22c625d83dc1609cbc332335e5022bdc",
  "model/federal/coverage/source-snapshots.json": "b8d60b31ef07df7ee9cbb1fff670ccb3e102b9cc",
  "model/federal/inc15b-cabinet-sources.json": "90558c7913255da8ea786e8e6ffb81e7739eb500"
});
const ROOT_FIELDS=Object.freeze(["model_version","model_family","source_baseline_commit","canonical_department_id","canonical_department_crosswalk_id","publisher_source_id","publisher_source_url","publisher_name","publisher_document","publisher_edition_date","publisher_edition_year","original_chart_locator","original_snapshot_id","source_model_observed_on","original_publisher_pdf_sha256","original_publisher_pdf_bytes","original_publisher_custody_qualified","source_capture_status","source_originals_pin_status","source_scope","existing_source_candidate_count","reconciled_original_candidate_count","original_relation_count","inc12_original_observation_count","new_legally_qualified_institution_count","full_current_first_level_denominator","complete_publisher_chart_census_verified","legal_review_complete","adl1_certified_count","source_population_additive_to_other_editions","observations","exceptions"]);
const OBS_FIELDS=Object.freeze(["id","source_candidate_id","display_name","canonical_parent_id","original_relationship_id","original_relation_kind","inc12_observation_id","source_id","source_snapshot_id","source_locator","provisional_kind","independent_oversight_exception","coast_guard_transfer_exception","source_record_claim","qualified_current_institution_id","source_publisher_independently_archived","current_membership_verified","command_verified","legal_delegation_verified","appropriation_verified","adl1_certified"]);
const EXC_FIELDS=Object.freeze(["id","affected_candidate_id","category","status","note"]);
const IDS=Object.freeze(["CENSUS-COMP-DHS-CBP","CENSUS-COMP-DHS-ICE","CENSUS-COMP-DHS-USCIS","CENSUS-COMP-DHS-CISA","CENSUS-COMP-DHS-FEMA","CENSUS-COMP-DHS-TSA","CENSUS-COMP-DHS-USSS","CENSUS-COMP-DHS-USCG","CENSUS-COMP-DHS-FLETC","CENSUS-COMP-DHS-OIG"]);
const EXCEPTIONS=Object.freeze([
  {
    "id": "INC15C1-GAP-ORIGINAL-PDF",
    "affected_candidate_id": null,
    "category": "original_publisher_custody",
    "note": "Official DHS FY2024 report PDF locator exists but decoded publisher bytes were not independently preserved; HTTP retrieval blocked with 403 in research environment. Model Git blobs are not publisher custody."
  },
  {
    "id": "INC15C1-GAP-2026-STRUCTURE",
    "affected_candidate_id": null,
    "category": "current_org_completeness",
    "note": "January 2025 chart cannot prove exhaustive current October 2026 first-level departmental population or independently resolved legal placements."
  },
  {
    "id": "INC15C1-EXC-DHS-OIG",
    "affected_candidate_id": "CENSUS-COMP-DHS-OIG",
    "category": "independent_oversight",
    "note": "DHS Inspector General is not a subordinate operational command chain merely because the office appears on the chart."
  },
  {
    "id": "INC15C1-EXC-USCG",
    "affected_candidate_id": "CENSUS-COMP-DHS-USCG",
    "category": "conditional_military_placement",
    "note": "Coast Guard operational/military transfer exceptions must not be inferred from a DHS organizational chart."
  }
]);
const fail=(m)=>{throw Error("INC-15C.1 rejected: "+m);};
const check=(c,m)=>{if(!c)fail(m);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const equalKeys=(obj,fields)=>obj&&typeof obj==="object"&&
 !Array.isArray(obj)&&same(Object.keys(obj).sort(),[...fields].sort());
const uniq=a=>Array.isArray(a)&&new Set(a).size===a.length;
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const gitBlob=(raw)=>{
 const b=Buffer.from(raw,"utf8");
 return createHash("sha1").update("blob "+b.length+String.fromCharCode(0),"utf8")
  .update(b).digest("hex");
};
function enforce(schema,value){
 if(Object.prototype.hasOwnProperty.call(schema,"const"))
  check(same(value,schema.const),"closed schema constant violated");
 const actual=value===null?"null":Array.isArray(value)?"array":
   Number.isInteger(value)?"integer":typeof value;
 if(schema.type)check([schema.type].flat().includes(actual),"closed schema type violation");
 if(schema.minLength!==undefined)
  check(typeof value==="string"&&value.length>=schema.minLength,"empty source field");
 if(schema.minimum!==undefined)
  check(Number.isInteger(value)&&value>=schema.minimum,"negative source count");
 if(schema.type==="array"){
  check(value.length>=(schema.minItems??0)&&value.length<=(schema.maxItems??Infinity),
   "source collection cardinality drift");
  for(const row of value)enforce(schema.items,row);
 }
 if(schema.type==="object"){
  check(schema.additionalProperties===false&&equalKeys(value,schema.required)&&
   equalKeys(schema.properties, schema.required),"open source schema or unexpected field");
  for(const [key,rule] of Object.entries(schema.properties))enforce(rule,value[key]);
 }
}
export function loadINC15C1(){
 const sourceBytes=Object.fromEntries(Object.keys(SOURCE_BLOBS)
  .map(p=>[p,read(p)]));
 return {
  manifest:JSON.parse(read("model/federal/manifest.json")),
  model:JSON.parse(read(MODEL)),
  schema:JSON.parse(read("schemas/inc15c1-dhs-reconciliation.schema.json")),
  sourceBytes,originals:Object.fromEntries(Object.entries(sourceBytes)
   .map(([p,raw])=>[p,JSON.parse(raw)]))
 };
}
export function validateINC15C1(input){
 const {manifest,model,schema,sourceBytes,originals}=input||{};
 check(manifest?.model_standard==="ARFI-COA"&&
  manifest?.release_status==="research_baseline_unratified"&&
  Array.isArray(manifest.models)&&manifest.models.length>=277&&
  uniq(manifest.models)&&manifest.models.filter(x=>x===MODEL).length===1,
  "manifest model edition or declaration drift");
 const ext=manifest.federal_institutional_breadth_15c1_extension;
 const fixed={
  id:"ARFI-INC15C1-DHS-CHART-RECONCILIATION",
  source_baseline_commit:SOURCE_PIN,
  source_selected_research_candidates:10,
  original_model_collection_count:6,
  original_publisher_pdf_custody_qualified:false,
  reconciled_prior_research_observations:10,
  new_authoritative_current_institution_count:0,
  current_department_first_level_denominator:null,
  adl1_certified_count:0,
  legal_review_complete:false,
  status:"bounded_source_reconciliation_original_pdf_custody_pending_unratified"
 };
 check(equalKeys(ext,Object.keys(fixed))&&
  Object.entries(fixed).every(([key,val])=>same(ext[key],val)),
  "manifest extension attempts to promote scope or legal qualification");
 check(equalKeys(model,ROOT_FIELDS)&&schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  schema.type==="object"&&schema.additionalProperties===false&&
  equalKeys(schema.properties,ROOT_FIELDS)&&
  same([...schema.required].sort(),[...ROOT_FIELDS].sort())&&
  equalKeys(schema.properties.observations.items.properties,OBS_FIELDS)&&
  equalKeys(schema.properties.exceptions.items.properties,EXC_FIELDS)&&
  model?.model_family==="inc15c1-dhs-source-reconciliation"&&model?.model_version==="0.1.0",
  "source and schema fields drifted or were co-edited");
 enforce(schema,model);
 check(sourceBytes&&equalKeys(sourceBytes,Object.keys(SOURCE_BLOBS))&&
  originals&&equalKeys(originals,Object.keys(SOURCE_BLOBS)),
  "missing or additional pinned source inputs");
 for(const [path,sha] of Object.entries(SOURCE_BLOBS)){
  const raw=sourceBytes[path];
  check(typeof raw==="string"&&gitBlob(raw)===sha&&
   same(originals[path],JSON.parse(raw)), "original Git blob pin mismatch "+path);
 }
 const rows=p=>originals["model/federal/"+p]?.items;
 const components=rows("coverage/components.json"),
  relationships=rows("coverage/relationships.json"),
  observations=rows("x12-observations.json"),
  sources=rows("coverage/source-registry.json"),
  snapshots=rows("coverage/source-snapshots.json"),
  cabinets=rows("inc15b-cabinet-sources.json");
 const source=sources?.find(x=>x.id===SRC),
  snapshot=snapshots?.find(x=>x.id===SNAP),
  cab=cabinets?.find(x=>x.canonical_department_id===PARENT);
 const selected=components?.filter(x=>x.parent_institution_id===PARENT),
  rselected=relationships?.filter(x=>x.to_id===PARENT),
  xselected=observations?.filter(x=>x.declared_parent_id===PARENT&&x.source_collection==="census");
 check(source&&snapshot&&cab&&selected?.length===10&&
  rselected?.length===10&&xselected?.length===10&&
  source.url==="https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf"&&
  source.published_on==="2025-01-17"&&source.accessed_on==="2026-10-16"&&
  source.publisher==="Department of Homeland Security"&&
  snapshot.source_id===source.id&&snapshot.edition_date==="2025-01-17"&&
  snapshot.revision_id==="FY2024-2025-0117"&&
  snapshot.denominator_status==="not_current_full_census"&&
  snapshot.review_status==="research_pending_current_org_reconciliation"&&
  cab.publisher_source_id===null&&cab.source_scoped_record_count===null&&
  cab.adl1_certified===false&&cab.complete_current_first_level_denominator===null,
  "original DHS publisher source/dated edition or unresolved cabinet denominator drift");
 const stable={
  model_version:"0.1.0",model_family:"inc15c1-dhs-source-reconciliation",
  source_baseline_commit:SOURCE_PIN,canonical_department_id:PARENT,
  canonical_department_crosswalk_id:cab.original_cabinet_crosswalk_id,
  publisher_source_id:SRC,publisher_source_url:source.url,
  publisher_name:source.publisher,publisher_document:"DHS FY2024 Annual Performance Report",
  publisher_edition_date:source.published_on,publisher_edition_year:"FY2024",
  original_chart_locator:"Organizational Chart, p. 24",
  original_snapshot_id:SNAP,source_model_observed_on:source.accessed_on,
  original_publisher_pdf_sha256:null,original_publisher_pdf_bytes:null,
  original_publisher_custody_qualified:false,
  source_capture_status:"external_pdf_HTTP_403_original_bytes_not_archived",
  source_originals_pin_status:"canonical_git_objects_only_not_publisher_original",
  source_scope:"ten_prior_arficoa_chart_candidate_records_not_all_publisher_members",
  existing_source_candidate_count:10,reconciled_original_candidate_count:10,
  original_relation_count:10,inc12_original_observation_count:10,
  new_legally_qualified_institution_count:0,full_current_first_level_denominator:null,
  complete_publisher_chart_census_verified:false,legal_review_complete:false,
  adl1_certified_count:0,source_population_additive_to_other_editions:false
 };
 check(Object.entries(stable).every(([k,v])=>same(model[k],v)),
  "unreviewed original publisher custody, denominator, identity or legal authority promoted");
 check(Array.isArray(model.observations)&&model.observations.length===10&&
  same(model.observations.map(x=>x.source_candidate_id),IDS)&&
  uniq(model.observations.map(x=>x.inc12_observation_id))&&
  uniq(model.observations.map(x=>x.original_relationship_id)),
  "ten source records/relation identity/order missing, changed or duplicated");
 const byRelation=new Map(rselected.map(x=>[x.from_id,x]));
 const byObservation=new Map(xselected.map(x=>[x.source_record_id,x]));
 for(let i=0;i<10;i++){
  const c=selected[i],m=model.observations[i],
   rel=byRelation.get(c.id),x=byObservation.get(c.id);
  check(equalKeys(m,OBS_FIELDS)&&c?.id===IDS[i]&&rel&&x&&
   x.relation_source_id===rel.id&&x.relation_type===rel.relationship_type&&
   x.source_snapshot_id===SNAP&&x.observed_parent_id===PARENT&&
   x.canonical_identity_id===null&&x.adl1_eligible===false&&
   x.confirmed_command===false&&x.confirmed_delegation===false&&
   x.independent_current_status_review===false&&
   c.source_ids?.length===1&&c.source_ids[0]===SRC&&c.snapshot_id===SNAP&&
   c.adl_evidenced===0&&c.delegation_verified===false&&
   c.appropriation_verified===false&&
   rel.source_ids?.length===1&&rel.source_ids[0]===SRC&&
   rel.snapshot_id===SNAP&&rel.operational_command_proven===false&&
   rel.delegated_statutory_power_proven===false&&
   rel.classification_review_complete===false,
   "prior INC-12 research source crosswalk or non-authority boundary drift "+c?.id);
  const isIG=c.id==="CENSUS-COMP-DHS-OIG",isCG=c.id==="CENSUS-COMP-DHS-USCG";
  check(c.kind===(isIG?"independent_oversight_component":"department_component")&&
   c.organizational_relation===(isIG?"independent_oversight_placement_not_command":"agency_directory_or_chart_membership")&&
   m.id==="INC15C1-OBS-"+c.id&&m.source_candidate_id===c.id&&
   m.display_name===c.name&&m.canonical_parent_id===PARENT&&
   m.original_relationship_id===rel.id&&
   m.original_relation_kind===rel.relationship_type&&
   m.inc12_observation_id===x.id&&m.source_id===SRC&&m.source_snapshot_id===SNAP&&
   m.source_locator===c.evidence_locator&&m.provisional_kind===c.kind&&
   m.independent_oversight_exception===isIG&&
   m.coast_guard_transfer_exception===isCG&&
   m.source_record_claim==="previously_researched_edition_candidate_not_independently_recaptured"&&
   m.qualified_current_institution_id===null&&
   m.source_publisher_independently_archived===false&&
   m.current_membership_verified===false&&m.command_verified===false&&
   m.legal_delegation_verified===false&&m.appropriation_verified===false&&
   m.adl1_certified===false,
   "source record improperly renamed, promoted or given command "+c.id);
 }
 check(Array.isArray(model.exceptions)&&model.exceptions.length===EXCEPTIONS.length&&
  same(model.exceptions.map(x=>x.id),EXCEPTIONS.map(x=>x.id)),
  "original custody, current cohort, IG or Coast Guard exceptions removed");
 for(let i=0;i<EXCEPTIONS.length;i++){
  const e=model.exceptions[i],expected=EXCEPTIONS[i];
  check(equalKeys(e,EXC_FIELDS)&&e.status==="open"&&
   Object.entries(expected).every(([k,v])=>same(e[k],v)),
   "exception altered or legal/command limitation promoted "+e.id);
 }
 return Object.freeze({sourcePin:SOURCE_PIN,reconciledCandidates:10,
  tracedOriginalRelations:10,matchedINC12Observations:10,
  oversightExceptions:1,conditionalCoastGuardExceptions:1,
  originalPublisherByteCustody:"not_qualified_HTTP_403",publisherDenominator:null,
  currentFirstLevelDenominator:null,adl1Certified:0,independentLegalReview:false,
  status:"bounded_DHS_historical_research_not_authoritative_current_census"});
}
