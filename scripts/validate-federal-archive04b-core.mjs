// Bound ARFI archive-stage research to exact dated source records. No law or current ADL-1 by inference.
import {assertTargets,EXPECTED_URLS} from "./federal-source-archive-core.mjs";
export const ARCH04B_FAMILIES=Object.freeze(["sources","hhs-source-entries","denominators",
 "classification-review","change-journal","gaps","viewpoints",
 "observed-capture-receipts","govman-xml-root-metadata"]);
export const ARCH04B_MODEL_PATHS=Object.freeze(ARCH04B_FAMILIES.map(x=>
 "model/federal/archive04b/"+x+".json"));
export const ARCH04B_CONTEXT_PATHS=Object.freeze([
 "model/federal/executive-departments.json",
 "model/federal/expansion/department-seeds.json",
 "model/federal/department-structure/units.json",
 "model/federal/department-structure/source-snapshots.json",
 "model/federal/department-structure/relationships.json"
]);
const fail=why=>{throw Error("Federal source archive rejected: "+why);};
const check=(ok,why)=>{if(!ok)fail(why);};
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const unique=arr=>new Set(arr).size===arr.length;
const ID=/^[A-Z][A-Z0-9-]{2,170}$/;
const ROOTS=["JUSTICE","TREASURY","HHS","VA"];
const SOURCE_COUNTS=Object.freeze({JUSTICE:36,TREASURY:9,HHS:28,VA:22});
const ROOT_ORIGINAL_SNAPSHOTS=Object.freeze({
 JUSTICE:"DEPT04-SNAPSHOT-JUSTICE",TREASURY:"DEPT04-SNAPSHOT-TREASURY",
 HHS:null,VA:"DEPT04-SNAPSHOT-VA"
});
const SOURCE_BY_CODE=Object.freeze({JUSTICE:"ARCH04B-DOJ-HTML",
 TREASURY:"ARCH04B-TREASURY-HTML",HHS:"ARCH04B-HHS-HTML",VA:"ARCH04B-VA-HTML"});
const HHS_NAMES=Object.freeze({
  "ARCH04B-HHS-ACF": "Administration for Children and Families",
  "ARCH04B-HHS-IOS": "Immediate Office of the Secretary",
  "ARCH04B-HHS-ASA": "Office of the Assistant Secretary for Administration",
  "ARCH04B-HHS-ACL": "Administration for Community Living",
  "ARCH04B-HHS-IEA": "Office of Intergovernmental and External Affairs",
  "ARCH04B-HHS-ASFR": "Office of the Assistant Secretary for Financial Resources",
  "ARCH04B-HHS-AHRQ": "Agency for Healthcare Research and Quality",
  "ARCH04B-HHS-OASH": "Office of the Assistant Secretary for Health",
  "ARCH04B-HHS-ASL": "Office of the Assistant Secretary for Legislation",
  "ARCH04B-HHS-ASPR": "Administration for Strategic Preparedness and Response",
  "ARCH04B-HHS-ASPE": "Office of the Assistant Secretary for Planning and Evaluation",
  "ARCH04B-HHS-ATSDR": "Agency for Toxic Substances and Disease Registry",
  "ARCH04B-HHS-ASPA": "Office of the Assistant Secretary for Public Affairs",
  "ARCH04B-HHS-CDC": "Centers for Disease Control and Prevention",
  "ARCH04B-HHS-OCIO": "Office of the Chief Information Officer",
  "ARCH04B-HHS-CMS": "Centers for Medicare & Medicaid Services",
  "ARCH04B-HHS-OCR": "Office for Civil Rights",
  "ARCH04B-HHS-DAB": "Departmental Appeals Board",
  "ARCH04B-HHS-FDA": "Food and Drug Administration",
  "ARCH04B-HHS-HRSA": "Health Resources and Services Administration",
  "ARCH04B-HHS-OGC": "Office of the General Counsel",
  "ARCH04B-HHS-IHS": "Indian Health Service",
  "ARCH04B-HHS-OGA": "Office of Global Affairs",
  "ARCH04B-HHS-NIH": "National Institutes of Health",
  "ARCH04B-HHS-OIG": "Office of Inspector General",
  "ARCH04B-HHS-OMHA": "Office of Medicare Hearings and Appeals",
  "ARCH04B-HHS-SAMHSA": "Substance Abuse and Mental Health Services Administration",
  "ARCH04B-HHS-ONC": "Office of the National Coordinator for Health Information Technology"
});
const HHS_KINDS=Object.freeze({
  "ARCH04B-HHS-ACF": "operating_division_candidate",
  "ARCH04B-HHS-IOS": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ASA": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ACL": "operating_division_candidate",
  "ARCH04B-HHS-IEA": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ASFR": "departmental_staff_office_candidate",
  "ARCH04B-HHS-AHRQ": "operating_division_candidate",
  "ARCH04B-HHS-OASH": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ASL": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ASPR": "operating_division_candidate",
  "ARCH04B-HHS-ASPE": "departmental_staff_office_candidate",
  "ARCH04B-HHS-ATSDR": "operating_division_candidate",
  "ARCH04B-HHS-ASPA": "departmental_staff_office_candidate",
  "ARCH04B-HHS-CDC": "operating_division_candidate",
  "ARCH04B-HHS-OCIO": "departmental_staff_office_candidate",
  "ARCH04B-HHS-CMS": "operating_division_candidate",
  "ARCH04B-HHS-OCR": "departmental_staff_office_candidate",
  "ARCH04B-HHS-DAB": "administrative_adjudication_requires_statutory_review",
  "ARCH04B-HHS-FDA": "operating_division_candidate",
  "ARCH04B-HHS-HRSA": "operating_division_candidate",
  "ARCH04B-HHS-OGC": "departmental_staff_office_candidate",
  "ARCH04B-HHS-IHS": "operating_division_candidate",
  "ARCH04B-HHS-OGA": "departmental_staff_office_candidate",
  "ARCH04B-HHS-NIH": "operating_division_candidate",
  "ARCH04B-HHS-OIG": "independent_inspector_general_statutory_review",
  "ARCH04B-HHS-OMHA": "administrative_adjudication_requires_statutory_review",
  "ARCH04B-HHS-SAMHSA": "operating_division_candidate",
  "ARCH04B-HHS-ONC": "departmental_staff_office_candidate"
});
const KNOWN_VERIFIED_TEMPORARY_RECEIPTS=Object.freeze({
  "ARCH04B-DOJ-HTML": {
    "sha256": "328172769eaa94b7bf53e0523944a461814908b561c874c9e55415fe985f1434",
    "bytes": 60922,
    "when": "2026-10-17T01:17:13.848Z"
  },
  "ARCH04B-TREASURY-HTML": {
    "sha256": "67c3158ddfdad8b8feb516481328c3f80ed1388931e96e8ee903f0bb8a6978f4",
    "bytes": 69398,
    "when": "2026-10-17T01:17:22.006Z"
  },
  "ARCH04B-VA-HTML": {
    "sha256": "40d3130d0484607014295318fd3d9aefacc5462ac34332f89a902c99c4e96c24",
    "bytes": 1310213,
    "when": "2026-10-17T01:17:22.586Z"
  },
  "ARCH04B-GOVMAN-JUSTICE-XML": {
    "sha256": "f8368dde7631e99eeb23654ad93774b1bcef803f7ed957e4d79e54c1d84bcbc6",
    "bytes": 58265,
    "when": "2026-10-17T01:17:22.762Z"
  },
  "ARCH04B-GOVMAN-TREASURY-XML": {
    "sha256": "5b77bf522832645908974f834ec2a1d0b773562d03ba0b42d905dddd1f4aebc9",
    "bytes": 67982,
    "when": "2026-10-17T01:17:22.862Z"
  },
  "ARCH04B-GOVMAN-HHS-XML": {
    "sha256": "b8a29d3c43757061a74f86712738b6ddc04c4f3b4420e37d79cd9bf0d2c24ad9",
    "bytes": 59395,
    "when": "2026-10-17T01:17:22.953Z"
  },
  "ARCH04B-GOVMAN-VA-XML": {
    "sha256": "7d015850b60054402b62bb9e23522f8600aa99910520cd184e26c56deff7117e",
    "bytes": 70559,
    "when": "2026-10-17T01:17:23.045Z"
  }
});
const GOVMAN_XML_ROOT_FACTS=Object.freeze({
  "JUSTICE": {
    "id": "121",
    "sort": "25",
    "has_childrens": true,
    "name": "Department of Justice"
  },
  "TREASURY": {
    "id": "125",
    "sort": "31",
    "has_childrens": true,
    "name": "Department of the Treasury"
  },
  "HHS": {
    "id": "117",
    "sort": "22",
    "has_childrens": true,
    "name": "Department of Health and Human Services"
  },
  "VA": {
    "id": "126",
    "sort": "29",
    "has_childrens": false,
    "name": "Department of Veterans Affairs"
  }
});
const LEGAL_TARGETS=Object.freeze({
  "ARCH04B-LEGAL-JUSTICE-OIG": "DEPT04-UNIT-JUSTICE-OIG",
  "ARCH04B-LEGAL-JUSTICE-EOIR": "DEPT04-UNIT-JUSTICE-EOIR",
  "ARCH04B-LEGAL-TREASURY-OIG": "DEPT04-UNIT-TREASURY-OIG",
  "ARCH04B-LEGAL-TREASURY-TIGTA": "DEPT04-UNIT-TREASURY-TIGTA",
  "ARCH04B-LEGAL-VA-OIG": "DEPT04-UNIT-VA-OIG",
  "ARCH04B-LEGAL-VA-BVA": "DEPT04-UNIT-VA-BVA",
  "ARCH04B-LEGAL-HHS-OIG": "ARCH04B-HHS-OIG",
  "ARCH04B-LEGAL-HHS-DAB": "ARCH04B-HHS-DAB",
  "ARCH04B-LEGAL-HHS-OMHA": "ARCH04B-HHS-OMHA"
});
const map=x=>new Map(x.map(y=>[y.id,y]));
function load(manifest,files,path){
 check(manifest.models?.includes(path),"collection not manifest registered "+path);
 const data=files[path];
 check(data?.model_version==="0.1.0"&&Array.isArray(data.items)&&
  unique(data.items.map(x=>x.id))&&data.items.every(x=>ID.test(x.id)),
  "missing, duplicate or invalid evidence collection "+path);
 if(path.startsWith("model/federal/archive04b/"))
  check(data.model_family===path.split("/").at(-1).replace(".json",""),
   "evidence collection spoofed type "+path);
 return data.items;
}
function valid(v,rule){
 if("const" in rule&&v!==rule.const)return false;
 if(rule.enum&&!rule.enum.includes(v))return false;
 const kind=v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
 if(rule.type&&!([].concat(rule.type)).includes(kind))return false;
 if(kind==="string"&&((rule.minLength!==undefined&&v.length<rule.minLength)||
 (rule.pattern&&!new RegExp(rule.pattern).test(v))))return false;
 if(kind==="integer"&&rule.minimum!==undefined&&v<rule.minimum)return false;
 if(kind==="array"){
  if(rule.uniqueItems&&!unique(v))return false;
  if(rule.items&&!v.every(a=>valid(a,rule.items)))return false;
 }
 return true;
}
export function inspectArchive04bSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  schema?.additionalProperties!==false||schema.oneOf?.length!==ARCH04B_FAMILIES.length||
  !same(schema.properties?.model_family?.enum||[],ARCH04B_FAMILIES))
  errors.push("draft-2020-12 schema dispatch invalid");
 for(const family of ARCH04B_FAMILIES){
  const d=schema?.$defs?.[family];
  const dispatcher=schema?.oneOf?.find(z=>z.properties?.model_family?.const===family);
  if(dispatcher?.properties?.items?.items?.$ref!=="#/$defs/"+family)
   errors.push("invalid $ref discriminator "+family);
  if(!d||d.additionalProperties!==false||!d.properties?.id?.pattern||!Array.isArray(d.required)){
   errors.push("strict family item schema absent "+family);continue;
  }
  const c=files["model/federal/archive04b/"+family+".json"];
  if(c?.model_family!==family||c.model_version!=="0.1.0"||!Array.isArray(c.items)){
   errors.push("invalid version or family "+family);continue;
  }
  for(const [i,x]of c.items.entries()){
   for(const k of Object.keys(x))if(!Object.prototype.hasOwnProperty.call(d.properties,k))
    errors.push("additional field forbidden "+family+"/"+i+"/"+k);
   for(const k of d.required)if(!(k in x))errors.push("required field absent "+family+"/"+i+"/"+k);
   for(const [k,v]of Object.entries(x))if(d.properties[k]&&!valid(v,d.properties[k]))
    errors.push("schema field mismatch "+family+"/"+i+"/"+k);
  }
 }
 return {families:ARCH04B_FAMILIES.length,errors};
}
export function validateArchive04b(manifest,files,schema){
 const ext=manifest?.federal_source_archive_extension;
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  ext?.id==="ARFI-COA-FED-SOURCE-ARCHIVE-004B"&&ext.version==="0.1.0"&&
  ext.predecessor==="ARFI-COA-FED-STRUCTURE-004"&&
  ext.bounded_departments===4&&ext.planned_source_captures===8&&
  ext.hhs_linked_roster_entries===28&&ext.source_group_total_named_entries===95&&
  ext.source_group_contained_records_reconciled===80&&ext.active_legal_classification_gates===9&&
  ext.original_source_sha256_values_in_repo===0&&ext.independent_source_archive_complete===false&&
  ext.verified_transient_capture_receipts===7&&ext.uncaptured_source_count===1&&
  ext.captured_source_bytes_persisted_in_architecture_git===0&&
  ext.source_capture_artifact_id===12084901808&&ext.source_capture_run_id===38990195886&&
  ext.explicit_open_gaps===8&&
  ext.all_department_adl1_certified===0&&ext.verified_whole_dept_first_level_denominator===0&&
  ext.external_live_capture_status==="partial_7_of_8_verified_temporary_artifact"&&
  ext.website_published===false&&ext.independent_legal_review_complete===false&&
  ext.research_status==="unratified_source_boundaries_not_authority",
  "unverified archive / ADL-1 / legal or publication claims in manifest");
 check(manifest.federal_institutional_structure_extension?.extracted_source_group_unit_records===80&&
  manifest.federal_coverage_expansion_extension?.selected_component_seeds===24,
  "prior immutable department counts lost");
 const schemaReport=inspectArchive04bSchema(schema,files);
 check(schemaReport.errors.length===0,"strict schema invalid: "+schemaReport.errors.slice(0,3).join("; "));
 const data=Object.fromEntries(ARCH04B_FAMILIES.map(f=>[f,load(manifest,files,
  "model/federal/archive04b/"+f+".json")]));
 assertTargets(data.sources);
 const originals=load(manifest,files,"model/federal/executive-departments.json");
 const canon=new Map(originals.map(d=>[d.id,d]));
 const oldUnits=load(manifest,files,"model/federal/department-structure/units.json");
 const oldSnapshots=load(manifest,files,"model/federal/department-structure/source-snapshots.json");
 const oldSeeds=load(manifest,files,"model/federal/expansion/department-seeds.json");
 const oldRel=load(manifest,files,"model/federal/department-structure/relationships.json");
 check(originals.length===15&&oldUnits.length===80&&oldSnapshots.length===4&&
  oldRel.length===80&&oldSeeds.length===24,
  "predecessor source-bounded organization collection drift");
 const oldById=map(oldUnits),oldBySnapshot=map(oldSnapshots);
 const oldSeedById=map(oldSeeds);
 const hhsById=map(data["hhs-source-entries"]);
 check(hhsById.size===28&&same([...hhsById.keys()],Object.keys(HHS_NAMES)),
  "historical HHS page roster count or identity mismatches official named links");
 const originalLinked=[];
 for(const e of data["hhs-source-entries"]){
  check(e.type==="dated_HHS_directory_named_entry"&&
   e.department_id==="ORG-FED-EXE-DEP-HHS"&&e.source_id==="ARCH04B-HHS-HTML"&&
   e.source_date_context==="2025-08-21_page_content_last_reviewed"&&
   e.name===HHS_NAMES[e.id]&&e.provisional_kind===HHS_KINDS[e.id]&&
   e.grouping==="source_page_linked_organization_and_division_entries"&&
   e.role_classification==="research_descriptor_not_legal_classification"&&
   e.legacy_candidate_id===(e.code==="CDC"?"EXP-SEED-HHS-CDC":e.code==="CMS"?"EXP-SEED-HHS-CMS":null)&&
   e.individual_unit_statutory_basis_verified===false&&e.reporting_chain_verified===false&&
   e.delegated_authority_verified===false&&e.adjudication_authority_verified===false&&
   e.appropriation_verified===false&&e.present_day_status_independently_verified===false&&
   e.parent_census_adl1_certified===false,
   "HHS organization classification, name, source, or law falsely inferred "+e.id);
  check(e.display_order>=1&&e.display_order<=28,"invalid historical source order");
  if(e.legacy_candidate_id){
   check(oldSeedById.has(e.legacy_candidate_id),"HHS existing research candidate not preserved");
   originalLinked.push(e.legacy_candidate_id);
  }
 }
 check(unique(data["hhs-source-entries"].map(x=>x.display_order))&&
  same(originalLinked,["EXP-SEED-HHS-CDC","EXP-SEED-HHS-CMS"]),
  "HHS source order or prior canonical candidate crosswalk corrupted");
 const artifacts=map(data["observed-capture-receipts"]);
 check(artifacts.size===8&&Object.keys(KNOWN_VERIFIED_TEMPORARY_RECEIPTS).length===7,
  "seven independent SHA-256 receipts and one explicit blocked source required");
 const sourceByID=map(data.sources);
 for(const [id,src]of sourceByID){
  const r=artifacts.get("ARCH04B-OBS-"+id);
  const expected=KNOWN_VERIFIED_TEMPORARY_RECEIPTS[id];
  check(r?.source_id===id&&r.source_url===src.url&&
    r.github_artifact_run_id===38990195886&&r.github_artifact_id===12084901808&&
    r.github_artifact_zip_sha256==="3aff191998ee6c3f28e5778f855ef0dae1758a81616dc24110d788f9b5e812ce"&&
    r.github_artifact_expires_at==="2027-01-15T01:17:08Z"&&
    r.source_payload_in_repository===false&&r.is_permanent_archive===false&&
    r.legal_classification_verified===false&&r.complete_first_level_verified===false,
    "artifact lineage / legal review / source identity unverified "+id);
  if(expected)check(r.decoded_entity_sha256===expected.sha256&&
    r.decoded_entity_byte_count===expected.bytes&&r.captured_at===expected.when&&
    r.receipt_status==="verified_in_temporary_ci_artifact"&&
    r.response_verification==="sha256_recomputed_from_downloaded_actions_artifact",
    "independently verified original body digest or size substituted "+id);
  else check(id==="ARCH04B-HHS-HTML"&&r.captured_at===null&&
   r.decoded_entity_sha256===null&&r.decoded_entity_byte_count===null&&
   r.receipt_status==="blocked_official_HTTP_403"&&
   r.response_verification==="HTTP_403_not_captured_no_sha256",
   "HHS 403 must not be transformed into a successful government source capture");
 }
 const documentRoots=map(data["govman-xml-root-metadata"]);
 check(documentRoots.size===4,"four GovInfo department XML roots required");
 for(const [code,facts]of Object.entries(GOVMAN_XML_ROOT_FACTS)){
  const r=documentRoots.get("ARCH04B-XML-ROOT-"+code);
  const receipt=artifacts.get("ARCH04B-OBS-ARCH04B-GOVMAN-"+code+"-XML");
  check(r?.department_id==="ORG-FED-EXE-DEP-"+code&&
   r.source_id==="ARCH04B-GOVMAN-"+code+"-XML"&&
   r.response_receipt_id===receipt?.id&&r.source_xml_sha256===receipt?.decoded_entity_sha256&&
   r.access_id==="GOVMAN-2025-12-31-"+facts.id&&
   r.local_entity_id===facts.id&&r.parent_entity_id==="0"&&
   r.sort_order===facts.sort&&r.entity_type==="Parent"&&
   r.category==="Executive Branch: Departments"&&r.agency_name===facts.name&&
   r.XML_entity_elements_in_granule===1&&
   r.children_collection_element_present===facts.has_childrens&&
   r.XML_entity_identifier_scope==="only_this_GOVMAN_2025_package_not_permanent_federal_agency_identifier"&&
   r.complete_first_level_department_denominator_verified===false&&
   r.agency_constituent_institutions_evidenced_by_this_XML_granule===false&&
   r.human_legal_review_complete===false,
   "GovInfo-local XML identity cannot establish whole department child roster "+code);
 }
 const ledger=map(data.denominators);
 check(ledger.size===4,"all four explicitly bounded source groups required");
 for(const code of ROOTS){
  const r=ledger.get("ARCH04B-LEDGER-"+code);
  const canonical="ORG-FED-EXE-DEP-"+code;
  check(canon.has(canonical)&&r?.department_id===canonical&&
   r.section_source_id===SOURCE_BY_CODE[code]&&
   r.counted_entries===SOURCE_COUNTS[code]&&
   r.original_inc04a_snapshot_id===ROOT_ORIGINAL_SNAPSHOTS[code]&&
   r.legal_first_level_denominator===null&&
   r.source_group_reconciled_to_prior_in_scope===(code==="HHS"?0:SOURCE_COUNTS[code])&&
   r.original_source_payload_sha256===null&&
   r.current_organization_complete===false&&r.adl1_institution_certified===false&&
   r.legal_classification_review_completed===false&&
   r.missing_from_group_means_officially_abolished===false&&
   r.source_drift_observed===false&&r.review_status==="bounded_list_research_unratified",
   "date bounded denominator fabricated as complete department or current absence "+code);
  if(code!=="HHS")check(oldBySnapshot.get(ROOT_ORIGINAL_SNAPSHOTS[code])?.source_group_record_count===
   SOURCE_COUNTS[code],"predecessor dated group denominator mismatch "+code);
 }
 check([...ledger.values()].reduce((n,v)=>n+v.counted_entries,0)===95,
  "96? artificial department census aggregate (expected bounded sum 95)");
 const legal=map(data["classification-review"]);
 check(legal.size===9&&same([...legal.keys()],Object.keys(LEGAL_TARGETS)),
  "all nine special IG and adjudication reviews required");
 for(const x of legal.values()){
  check(x.source_unit_ref===LEGAL_TARGETS[x.id]&&
   (oldById.has(x.source_unit_ref)||hhsById.has(x.source_unit_ref))&&
   x.department_id===(oldById.get(x.source_unit_ref)?.department_id||
    hhsById.get(x.source_unit_ref)?.department_id)&&
   x.controlling_primary_legal_instrument_id===null&&
   x.statute_subsection_verified===false&&x.agency_charter_verified===false&&
   x.explicit_delegation_instrument_verified===false&&
   x.legal_classification_final===false&&
   x.organizational_directory_is_not_legal_authority===true&&
   x.independent_reviewer_id===null&&x.review_decision===null&&x.reviewed_at===null,
   "IG/adjudicative role may not acquire legal power from chart "+x.id);
 }
 const journal=map(data["change-journal"]);
 check(journal.size===4,"source change journal requires four independently scoped entries");
 for(const code of ROOTS){
  const z=journal.get("ARCH04B-CHANGE-"+code);
  check(z?.department_id==="ORG-FED-EXE-DEP-"+code&&
   z.selected_source_id===SOURCE_BY_CODE[code]&&
   z.previous_source_artifact_hash===null&&z.current_source_artifact_hash===null&&
   z.change_detection_status==="awaiting_two_byte_verified_captures"&&
   z.missing_entity_effect==="not_observed_not_disestablished"&&
   z.law_change_inferred===false&&z.current_date_verification_complete===false,
   "unverified source drift or organizational abolition inferred "+code);
 }
 check(data.gaps.length===8&&data.gaps.some(x=>x.id==="ARCH04B-GAP-HHS-AUTOMATED-403")&&data.gaps.every(x=>x.closure_status==="open"&&
  x.complete_adl1_claim===false&&x.legal_review_complete===false),
  "missing archival integrity or full ADL1 review gap");
 check(data.viewpoints.length===4&&same(data.viewpoints.map(x=>x.id),ROOTS.map(x=>"VIEW-ARCH04B-"+x)),
  "four bounded departmental source comparison views required");
 for(const v of data.viewpoints)
  check(v.source_group_ledger_id==="ARCH04B-LEDGER-"+v.department_id.split("-").at(-1)&&
   v.legal_review_required===true&&v.static_model_only===true&&v.website_implemented===false&&
   v.whole_department_known===false&&v.permission_to_infer_supervision===false,
   "source-view inference or website publication unsupported "+v.id);
 const counts={source_capture_targets:data.sources.length,
  HHS_dated_named_source_links:hhsById.size,bounded_department_groups:4,
  named_source_group_total:95,previously_reconciled_groups:80,
  individual_legal_review_gates:legal.size,change_journal_entries:journal.size,
  open_source_integrity_gaps:data.gaps.length,certified_ADL1_departments:0,
  captured_repository_source_bytes:0,
  verified_temporary_source_receipt_sha256:7,blocked_live_HHS_capture:1,XML_govman_parent_roots:4};
 return {counts,ledger,data,oldUnits,oldSnapshots,
  archive_status:"seven_sha256_verified_temporary_artifact_and_HHS_403_no_durable_archive",
  legal_review_status:"all_nine_special_role_reviews_pending"};
}
export function projectArchive04b(result,viewID){
 const v=result.data.viewpoints.find(x=>x.id===viewID);
 check(v,"unknown approved source comparison viewpoint "+viewID);
 const code=v.department_id.split("-").at(-1);
 const source=code==="HHS"?result.data["hhs-source-entries"]:
  result.oldUnits.filter(x=>x.department_id===v.department_id);
 const nodes=source.map(x=>({id:x.id,name:x.name,department_id:v.department_id,
  source_claim_type:"bounded_list_member_not_proven_department_first_level",adl1_verified:false,
  provenance_id:code==="HHS"?x.source_id:x.source_id}));
 return {view_id:viewID,source_as_of:result.ledger.get("ARCH04B-LEDGER-"+code).as_of_source_edition,
  bounded_list_denominator:nodes.length,whole_department_denominator:null,
  legal_classification_complete:false,source_archive_state:result.archive_status,
  nodes,authority_edges:[],website_rendered:false,
  warning:"A named directory group does not prove complete current departmental structure, signed delegation, organizational abolition or jurisdiction."};
}
