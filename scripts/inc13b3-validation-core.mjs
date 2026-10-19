// INC-13B3: full source-bounded VA original-ID, time, special-case and evidence reconciliation.
// Research projections are not legal authority determinations or ADL-1 certifications.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {isDeepStrictEqual} from "node:util";
const BASELINE="b52d99f5dc8c36803dd4c3298795f75c1ece707a";
const VA="ORG-FED-EXE-DEP-VA";
export const SOURCE_BLOB_SHAS=new Map([["model/federal/inc04c/va-coverage.json","35845d9716a46bd5d96084035f8e8d284f1a1489"],["model/federal/inc04c/va-directory.json","d4d5b30c7522cb99ec297a10f7779937c00c1274"],["model/federal/inc04c/va-statutory-composition.json","b5edeb7342e26cdf6125f15c773b41c973964287"],["model/federal/inc04c/va-source-versions.json","5eb09daefb6568e3177fd7ea82f0cfb5c2659335"],["model/federal/inc04d/coverage.json","1fee5d01a72e0bec671219372409a35009d8a830"],["model/federal/inc04d/legal-identities.json","c9a41a69b83e9add4e051b939f706e11480bd4a7"],["model/federal/inc04d/statutory-crosswalk.json","3f77edc3fbb85d977641d7088983de88b3e9608f"],["model/federal/inc04d/temporal-events.json","79728d6ca8bd1970be63796944863c2a2113225c"],["model/federal/inc04d/observed-source-receipts.json","b617d10b3a4c27df469a231a22dde0949f39247a"],["model/federal/inc04e/va-legal-issues.json","6a7feab488c929ce4a8487712112d446cd21a597"],["model/federal/inc04e/qualification-gates.json","228a6fdb9aea3a75830ce7c2e7f0265fefc9c3b0"],["model/federal/inc04e/va-dossier.json","f3fe23a82fa11267609f16bcdf966463e432f291"],["model/federal/inc04e/source-temporal-index.json","7d19bdf177d303d930f04977c52ed13dd9b3d264"],["model/federal/inc04f/va-first-level-candidates.json","c596d34bfb65f659cd63609d9c828169df9d1c43"],["model/federal/inc04f/va-legal-review-packets.json","7b9e6c52f9a7c690a052b0aae764ec4332b481c5"],["model/federal/inc04f/custody-source-queue.json","a3c3d038d3476b8a4818ba0c76d072c0758cd631"],["model/federal/inc04f/unavailable-originals.json","e318ded6d0fb3425e3c305f0ba581503151ac580"],["model/federal/inc04f/custody-acceptance-gates.json","a440749b874bc3bc68a2fcbc07ad88454bae5592"],["model/federal/department-structure/units.json","4b5748c932c3139e39abca684eb56f5d5d9995ae"],["model/federal/department-structure/relationships.json","4afc01a4e5c80746667bc45180c37b423e4485f4"],["model/federal/x12-observations.json","7e4b20396c545207b9847c7a4f14e593a3b30b68"],["model/federal/inc13a-pilots.json","da782a05b0fcef2fb1b28b243dda97d628791e05"],["model/federal/inc13a-gates.json","56e59f4a1d56c7a0de12ed3d887b67dbc9d84069"]]);
export const FAMILIES=Object.freeze(["scopes","directory","statutes","candidates","legal","history","evidence","source-pins"]);
const SCOPE_IDS=["VA-DIRECTORY","VA-STATUTE","VA-CANDIDATES","VA-LEGAL","VA-HISTORY","VA-EVIDENCE"];
const LENGTHS=Object.freeze([6,22,9,25,6,1,6,23]);
const CASE_TYPES=Object.freeze({
 "D04D-INST-CANTEEN":"distinct_canteen_service_autonomy",
 "D04D-INST-FORMER-VABCA":"historical_board_predecessor_pending_legal_reconciliation",
 "D04D-INST-CBCA":"GSA_separate_board_not_VA_first_level",
 "D04D-INST-OIG":"independent_inspector_general_oversight",
 "D04D-INST-BVA":"adjudicatory_merits_distinct_from_administrative_supervision",
 "D04D-INST-OEDCA":"independent_merits_and_statutory_reporting_distinctions"
});
const EXCLUSIONS=Object.freeze(["whole_department_current_structure","signed_executive_delegation","current_citator_completed","legal_or_adjudicatory_reporting_order","ratified_institutional_review","durable_qualified_source_custody"]);
const pth=(family)=>"model/federal/inc13b3-va-"+family+".json";
const readRaw=p=>readFileSync(new URL("../"+p,import.meta.url));
const parse=p=>JSON.parse(readRaw(p).toString("utf8"));
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
const objEq=(a,b)=>isDeepStrictEqual(a,b);
const byId=a=>new Map((a||[]).map(x=>[x.id,x]));
const assert=(condition,errors,message)=>{if(!condition)errors.push("INC13B3 "+message);};
function sha1Blob(raw){
 return createHash("sha1").update(Buffer.from("blob "+raw.length+"\0","utf8")).update(raw).digest("hex");
}
const original=(data,path)=>data.orig["model/federal/"+path+".json"]?.items||[];
function typeOf(v){return v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;}
function scanSchema(rule,value,label,errors){
 if(!rule||typeof rule!=="object"){errors.push(label+" absent schema rule");return;}
 if(rule.oneOf){
  let count=0;
  for(const option of rule.oneOf){const inner=[];scanSchema(option,value,label,inner);if(inner.length===0)count++;}
  if(count!==1)errors.push(label+" oneOf matched "+count+" branches");
  return;
 }
 if(Object.hasOwn(rule,"const")&&!objEq(value,rule.const))errors.push(label+" constant");
 if(rule.type&&!([rule.type].flat()).includes(typeOf(value)))errors.push(label+" type");
 if(rule.pattern&&typeof value==="string"&&!new RegExp(rule.pattern).test(value))errors.push(label+" pattern");
 if(rule.minLength!==undefined&&typeof value==="string"&&value.length<rule.minLength)errors.push(label+" minLength");
 if(rule.type==="object"&&value!==null&&typeof value==="object"&&!Array.isArray(value)){
  for(const field of rule.required||[])if(!Object.hasOwn(value,field))errors.push(label+" missing "+field);
  for(const [field,v] of Object.entries(value)){
   if(!Object.hasOwn(rule.properties||{},field)){if(rule.additionalProperties===false)errors.push(label+" unexpected "+field);}
   else scanSchema(rule.properties[field],v,label+"."+field,errors);
  }
 }
 if(rule.type==="array"&&Array.isArray(value)){
  if(value.length<(rule.minItems??0)||value.length>(rule.maxItems??Number.POSITIVE_INFINITY))errors.push(label+" array cardinality");
  if(rule.uniqueItems&&!unique(value.map(v=>JSON.stringify(v))))errors.push(label+" duplicated item");
  for(let i=0;i<value.length;i++)scanSchema(rule.items,value[i],label+"["+i+"]",errors);
 }
}
function closedSchema(rule,errors,label){
 if(rule?.oneOf){for(const [i,child]of rule.oneOf.entries())closedSchema(child,errors,label+"."+i);return;}
 if(rule?.type==="object"){
  const properties=Object.keys(rule.properties||{}),required=[...(rule.required||[])];
  if(rule.additionalProperties!==false||!objEq([...properties].sort(),required.sort()))errors.push(label+" schema object not closed");
  for(const [name,child]of Object.entries(rule.properties||{}))closedSchema(child,errors,label+"."+name);
 }
 if(rule?.type==="array"){if(!rule.uniqueItems)errors.push(label+" array allows duplicates");closedSchema(rule.items,errors,label+".items");}
}
export function loadINC13B3(){
 const data={models:{},orig:{},raw:{},schema:parse("schemas/inc13b3-va.schema.json"),manifest:parse("model/federal/manifest.json")};
 for(const family of FAMILIES)data.models[family]=parse(pth(family));
 for(const path of SOURCE_BLOB_SHAS.keys()){
  const bytes=readRaw(path);data.raw[path]=bytes.toString("utf8");data.orig[path]=JSON.parse(data.raw[path]);
 }
 return data;
}
function verifySourceBaseline(data,errors){
 const pins=data.models["source-pins"]?.items||[];
 assert(pins.length===SOURCE_BLOB_SHAS.size&&unique(pins.map(p=>p.path)),errors,"source blob pin cohort");
 for(const [path,baselineSHA] of SOURCE_BLOB_SHAS){
  const pin=pins.find(x=>x.path===path),raw=typeof data.raw[path]==="string"?Buffer.from(data.raw[path],"utf8"):null;
  assert(pin&&pin.id==="X13B3-PIN-"+path.split("/").slice(2).join("-").replace(/\.json$/,"").toUpperCase()&&
   pin.path===path&&pin.source_commit===BASELINE&&pin.git_blob_sha===baselineSHA&&
   pin.government_original_retained_in_this_repo===false&&
   pin.independent_institutional_source_authentication_complete===false,
   errors,"incorrect immutable source-pin "+path);
  assert(raw&&sha1Blob(raw)===baselineSHA,errors,"baseline source bytes changed "+path);
 }
 assert(!pins.some(x=>!SOURCE_BLOB_SHAS.has(x.path)),errors,"unexpected or unsafe source pin path");
}
function verifyShape(data,errors){
 const rules=data.schema?.oneOf||[];
 if(data.schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||rules.length!==FAMILIES.length)
  errors.push("INC13B3 schema registry invalid");
 if(!unique(rules.map(x=>x.properties?.model_family?.const)))errors.push("INC13B3 schema duplicate family");
 for(let i=0;i<FAMILIES.length;i++){
  const family="inc13b3-va-"+FAMILIES[i],model=data.models[FAMILIES[i]];
  const rule=rules.find(x=>x.properties?.model_family?.const===family);
  if(!rule||rule.type!=="object"||rule.properties?.items?.minItems!==LENGTHS[i]||
   rule.properties?.items?.maxItems!==LENGTHS[i]||
   rule.properties?.source_baseline_commit?.const!==BASELINE||
   rule.properties?.model_version?.const!=="0.1.0")errors.push("INC13B3 invalid schema family "+family);
  if(rule)closedSchema(rule,errors,family);
  if(model?.model_family!==family||model?.model_version!=="0.1.0"||
   model?.source_baseline_commit!==BASELINE||model?.items?.length!==LENGTHS[i])
   errors.push("INC13B3 unexpected model envelope "+family);
  if(rule)scanSchema(rule,model,family,errors);
  if(data.manifest?.models?.filter(x=>x===pth(FAMILIES[i])).length!==1)
   errors.push("INC13B3 missing exact-once manifest registration "+family);
 }
}
function assertNonpromotion(data,errors){
 const c=original(data,"inc04c/va-coverage")[0],d=original(data,"inc04d/coverage")[0],
 e=original(data,"inc04e/va-dossier")[0],g=original(data,"inc04e/qualification-gates"),
 a=original(data,"inc13a-pilots").find(x=>x.id==="X13A-PILOT-VA");
 const fourF=original(data,"inc04f/custody-acceptance-gates");
 assert(c?.source_section_administration_entries===3&&c?.source_section_staff_entries===19&&
  c?.source_section_total===22&&c?.office_of_secretary_header_outside_section===true&&
  c?.statutory_named_clauses===7&&c?.open_statutory_categories===2&&
  c?.statutory_matched_directory_candidates===4&&c?.statutory_named_not_in_22_directory===3&&
  c?.whole_department_first_level_denominator===null&&c?.first_level_membership_verified===0&&
  c?.certified_adl1===false&&c?.zero_authority_from_directory===true&&
  c?.statute_review_completion===false&&c?.independent_institutional_review_completion===false,
  errors,"INC04C directory coverage or illegal first-level promotion");
 assert(d?.directory_listed===22&&d?.administrations===3&&d?.staff_offices===19&&
  d?.statutory_clauses===9&&d?.residual_statutory_categories===2&&
  d?.matched_statute_to_directory===4&&d?.full_department_first_level_denominator===null&&
  d?.verified_first_level_members===0&&d?.human_approvals===0&&
  d?.legal_certified===false&&d?.ADL1_certified===false,errors,"INC04D coverage falsely promoted");
 assert(e?.directory_source_heading_total===22&&e?.statutory_composition_clauses===9&&
  e?.open_residual_statutory_categories===2&&e?.original_FOM_PDF_receipts===2&&
  e?.original_fixed_2024_law_receipts===2&&e?.archive_provider_object_verifications===0&&
  e?.human_approval_count===0&&e?.full_same_as_of_first_level_denominator===null&&
  e?.complete_legal_composition_certified===false&&e?.ADL1_status==="research_only_not_qualified"&&
  e?.authorized_institutional_signer===null,errors,"04E unratified evidence dossier changed");
 assert(g.length===9&&unique(g.map(x=>x.id))&&g.every(x=>x.status==="not_met"&&
   x.verified===false&&x.waived===false&&x.independent_reviewer_id===null),
   errors,"nine mandatory 04E gate statuses changed");
 assert(a?.canonical_department_id===VA&&a?.complete_first_level_denominator===null&&
  a?.adl1_certified===false&&a?.independent_legal_review_complete===false&&
  a?.gate_results?.length===9&&a.gate_results.every(x=>x.reviewer_id===null&&x.review_decision_id===null&&x.status!=="met"),
  errors,"INC13A VA research qualification misrepresented");
 assert(fourF.length===10&&fourF.every(x=>x.passed!==true&&x.certified!==true),
  errors,"04F operational custody prematurely qualified");
 const ext=data.manifest?.federal_va_13b3_source_reconciliation_extension;
 assert(ext?.source_baseline_commit===BASELINE&&ext?.directory_headings===22&&
  ext?.statutory_clauses===9&&ext?.candidate_units===25&&ext?.legal_cases===6&&
  ext?.historical_transitions===1&&ext?.qualified_current_first_level_denominator===null&&
  ext?.adl1_certified_count===0&&ext?.independent_review_complete===false&&
  ext?.original_custody_ratified===false&&ext?.website_publication_enabled===false,
  errors,"INC13B3 manifest falsely qualified");
}
function compareFamily(data,family,expected,errors){
 const actual=data.models[family]?.items;
 if(!objEq(actual,expected)){
  const actualById=byId(actual);
  for(const row of expected)if(!objEq(actualById.get(row.id),row))errors.push("INC13B3 mismatched "+family+" "+row.id);
  if(actual?.length!==expected.length||actual?.some(x=>!expected.some(y=>y.id===x.id)))
   errors.push("INC13B3 incomplete/extra "+family+" cohort");
 }
}
function expectedScopes(){
 const make=(name,source,count,sub,status,edition,date)=>({id:"X13B3-SCOPE-"+name,source_family:source,source_count:count,source_subcounts:sub,completeness:status,publisher_edition:edition,observation_date:date,complete_current_department_roster:false});
 return [
 make("VA-DIRECTORY","inc04c/va-directory",22,{administrations:3,staff_offices:19},"bounded_directory_headings_only","updated_2026-02-25","2026-10-17"),
 make("VA-STATUTE","inc04c/va-statutory-composition",9,{named_statutory_clauses:7,open_residual_classes:2},"bounded_2024_code_section_plus_preliminary_2026_locator_not_citator","USCODE-2024",null),
 make("VA-CANDIDATES","inc04f/va-first-level-candidates",25,{directory_linked:22,outside_directory:3},"overlapping_research_candidate_union_not_institutional_denominator","mixed_source_epochs",null),
 make("VA-LEGAL","inc04f/va-legal-review-packets",6,{unratified_legal_cases:6},"separate_unratified_legal_questions_not_six_additional_institutions","mixed_source_epochs",null),
 make("VA-HISTORY","inc04d/temporal-events",1,{candidate_transition_events:1},"historical_transfer_candidate_not_good_law_certification","event_reported_2007-01-06",null),
 make("VA-EVIDENCE","inc04f/custody-source-queue_and_unavailable-originals",6,{recorded_temp_captures:5,unavailable_source_originals:1},"receipt_metadata_not_durable_custody_or_independent_legality","mixed_source_epochs",null)
 ];
}
function verifySourceRows(data,errors){
 const dir=original(data,"inc04c/va-directory"),stat=original(data,"inc04c/va-statutory-composition"),
 cross=original(data,"inc04d/statutory-crosswalk"),candidates=original(data,"inc04f/va-first-level-candidates"),
 issues=original(data,"inc04e/va-legal-issues"),legals=original(data,"inc04d/legal-identities"),
 packets=original(data,"inc04f/va-legal-review-packets"),history=original(data,"inc04d/temporal-events"),
 queue=original(data,"inc04f/custody-source-queue"),unavailable=original(data,"inc04f/unavailable-originals"),
 receipts=original(data,"inc04d/observed-source-receipts"),units=original(data,"department-structure/units"),
 relationships=original(data,"department-structure/relationships"),inc12=original(data,"x12-observations");
 const qRec=byId(queue),dirRows=byId(dir),candByDir=new Map(candidates.filter(x=>x.legacy_directory_id!==null).map(x=>[x.legacy_directory_id,x]));
 const qByReceipt=new Map(queue.map(x=>[x.predecessor_receipt_id,x])),
 receiptById=byId(receipts),crossByPrior=new Map(cross.map(x=>[x.predecessor_id,x])),
 issueByIdentity=new Map(issues.map(x=>[x.predecessor_identity_id,x])),
 packetByIdentity=new Map(packets.map(x=>[x.source_identity_id,x])),
 unitById=byId(units),relByUnit=new Map(relationships.map(x=>[x.from_id,x])),
 inc12ByRecord=new Map(inc12.map(x=>[x.source_record_id,x]));
 const qdir=qByReceipt.get("ARCH04B-OBS-ARCH04B-VA-HTML"),
 q38=qByReceipt.get("D04D-OBS-USC38");
 const distinct=arr=>unique(arr.map(x=>x.id));
 assert(dir.length===22&&distinct(dir)&&dir.filter(x=>x.source_group==="administrations_heading").length===3&&
  dir.filter(x=>x.source_group==="staff_offices_heading").length===19&&
  candidates.length===25&&distinct(candidates)&&candByDir.size===22&&
  candidates.filter(x=>x.legacy_directory_id===null).length===3&&
  stat.length===9&&distinct(stat)&&cross.length===9&&distinct(cross)&&
  stat.filter(x=>x.directory_candidate_id!==null).length===4&&
  legals.length===6&&issues.length===6&&packets.length===6&&history.length===1&&
  unavailable.find(x=>x.id==="F04F-EXCEPTION-CBCA")?.recovered_source_bytes===false,
  errors,"source population/denominator or missing-CBCA evidence drift");
 const expectedDirectory=[];
 for(const x of dir){
  const candidate=candByDir.get(x.id),u=unitById.get(x.inc04a_candidate_id),
  rel=relByUnit.get(x.inc04a_candidate_id),obs=inc12ByRecord.get(x.inc04a_candidate_id);
  if(!candidate||!u||!rel||!obs) {errors.push("INC13B3 missing legacy directory/04A/INC12 join "+x.id);continue;}
  assert(candidate.predecessor_id===x.inc04a_candidate_id&&candidate.source_receipt_id===qdir?.predecessor_receipt_id&&
   u.department_id===VA&&u.adl_evidenced===0&&u.direct_operational_command_verified===false&&
   u.statutory_delegation_verified===false&&u.snapshot_id==="DEPT04-SNAPSHOT-VA"&&
   rel.snapshot_id===u.snapshot_id&&rel.from_id===u.id&&rel.to_id===obs.observed_parent_id&&
   obs.relation_source_id===rel.id&&obs.relation_type===rel.relationship_type&&
   rel.delegated_power_proven===false&&rel.direct_military_or_civilian_command_proven===false&&
   rel.legally_valid_adl1_claim===false&&obs.confirmed_command===false&&
   obs.confirmed_supervision===false&&obs.confirmed_delegation===false&&obs.adl1_eligible===false&&
   x.canonical_department_id===VA&&x.source_sha256===qdir?.SHA256&&
   x.source_occurrence_verified_against_received_html===true&&
   x.reporting_parent_verified===false&&x.first_level_organizational_membership_verified===false&&
   x.legal_authority_verified===false&&x.source_relative_heading_ordinal>0,
   errors,"directory source, crosswalk and nonpower meaning "+x.id);
  expectedDirectory.push({
   id:"X13B3-DIR-"+x.id,original_directory_id:x.id,original_unit_candidate_id:x.inc04a_candidate_id,
   original_04f_candidate_id:candidate.id,source_id:x.source_id,source_receipt_id:qdir?.predecessor_receipt_id,
   source_queue_id:qdir?.id,recorded_original_sha256:x.source_sha256,source_heading:x.source_heading,
   source_relative_heading_ordinal:x.source_relative_heading_ordinal,source_group:x.source_group,
   original_class:x.original_class,publisher_updated_on:"2026-02-25",source_observed_on:"2026-10-17",
   observed_parent_id:null,legal_effective_on:null,independent_legal_review_complete:false,
   direct_reporting_verified:false,first_level_certified:false,permanent_custody_qualified:false,
   original_inc12_observation_id:obs.id,original_department_unit_relation_id:rel.id,
   original_relation_type:rel.relationship_type,original_04a_source_id:u.source_id,
   original_snapshot_id:u.snapshot_id,original_04a_observed_parent_id:rel.to_id
  });
 }
 assert(expectedDirectory.find(x=>x.original_unit_candidate_id==="DEPT04-UNIT-VA-OIG")?.original_relation_type===
  "independent_oversight_display_placement_not_command",errors,"VA IG source edge must retain distinct oversight");
 assert(expectedDirectory.some(x=>x.original_unit_candidate_id==="DEPT04-UNIT-VA-BVA"&&
  x.original_class==="adjudicatory_office_review_needed")&&
  expectedDirectory.some(x=>x.original_unit_candidate_id==="DEPT04-UNIT-VA-OEDCA"&&
  x.original_class==="adjudicatory_office_review_needed"),
  errors,"VA BVA/OEDCA adjudicatory independence qualification lost");
 compareFamily(data,"directory",expectedDirectory,errors);
 const expectedStatutes=stat.map((s,i)=>{
  const x=crossByPrior.get(s.id);
  assert(x&&x.citation===s.legal_reference&&x.matched_directory_candidate===s.directory_candidate_id&&
   x.current_legal_status_verified===false&&x.source_edition_bytes_verified===false&&
   x.human_approved===false&&s.first_level_legal_inclusion_reviewed===false,
   errors,"38 USC 301(c) source identity or legal review "+s.id);
  return {id:"X13B3-STAT-"+x?.id,original_clause_id:s.id,original_crosswalk_id:x?.id,
   legal_reference:s.legal_reference,source_id:"D04D-SRC-USC38",
   source_receipt_id:q38?.predecessor_receipt_id,source_queue_id:q38?.id,
   recorded_original_sha256:q38?.SHA256,source_edition:"USCODE-2024",
   directory_unit_candidate_id:s.directory_candidate_id,original_reconciliation:s.reconciliation,
   composition_claim_type:i>=7?"open_residual_statutory_category":"statutorily_named_category_or_office",
   is_historical_transition_question:i===6,current_2026_legality_certified:false,
   current_direct_reporting_verified:false,legal_effective_on:null,legal_review_signature:null,adl1_certified:false};
 });
 assert(stat[6]?.described_element==="Board of Contract Appeals"&&
  stat[7]?.reconciliation==="open_residual_category_not_enumerated"&&
  stat[8]?.reconciliation==="open_residual_category_not_enumerated",errors,"historical clause or open statutory class conflation");
 compareFamily(data,"statutes",expectedStatutes,errors);
 const outsideIDs=["F04F-CAND-SECRETARY","F04F-CAND-CANTEEN","F04F-CAND-FORMER-VABCA"];
 assert(objEq(candidates.filter(x=>x.legacy_directory_id===null).map(x=>x.id),outsideIDs),
  errors,"unqualified candidate additions exceed exact Office/Service/historical board set");
 const expectedCandidates=candidates.map(x=>{
  const q=qByReceipt.get(x.source_receipt_id),d=x.legacy_directory_id===null?null:dirRows.get(x.legacy_directory_id);
  assert(q&&q.SHA256&&x.status==="source_observed_first_level_candidate_unratified"&&
   x.source_presence_in_bounded_material_verified===true&&
   x.inside_2026_current_first_level_legal_universe_verified===false&&
   x.direct_department_reporting_verified===false&&x.legal_subtype_verified===false&&
   x.qualifying_legal_review_id===null&&
   (d===null||d?.inc04a_candidate_id===x.predecessor_id),
   errors,"04F candidate date/identity or unreviewed reporting "+x.id);
  return {id:"X13B3-CAND-"+x.id,original_candidate_id:x.id,
   original_predecessor_id:x.predecessor_id,original_directory_id:x.legacy_directory_id,
   source_receipt_id:x.source_receipt_id,source_queue_id:q?.id,recorded_original_sha256:q?.SHA256,
   original_source_edition:x.source_edition,source_class:x.research_source_class,
   candidate_basis:x.candidate_basis,source_classification:"source_observed_first_level_candidate_unratified",
   is_historical_board_candidate:x.id==="F04F-CAND-FORMER-VABCA",
   directory_parent_asserted:false,current_legal_first_level_inclusion_verified:false,
   independent_review_complete:false,legal_effective_on:null,adl1_certified:false};
 });
 assert(!candidates.some(x=>x.predecessor_id==="D04D-INST-CBCA"),errors,"external CBCA in VA first-level candidate list");
 compareFamily(data,"candidates",expectedCandidates,errors);
 const expectedLegal=legals.map(x=>{
  const i=issueByIdentity.get(x.id),p=packetByIdentity.get(x.id);
  assert(i&&p&&p.predecessor_legal_issue_id===i.id&&p.official_citation===i.primary_reference&&
   p.distinct_qualifier===i.qualifying_reference&&
   i.exact_controlling_2026_legal_edition_sha256===null&&i.effective_law_2026_verified===false&&
   i.jurisdiction_boundary_verified===false&&i.executed_delegation_instrument_id===null&&
   i.legal_counsel_review_id===null&&i.legal_decision==="unratified_research_only"&&
   p.actual_controlling_2026_instrument_sha256===null&&p.legal_effect_asof===null&&
   p.independent_qualified_counsel_identity===null&&p.counsel_decision_signature===null&&
   p.official_delegation_verified===false&&p.legal_identity_finalized===false&&
   p.reporting_power_inferred===false&&p.adjudication_or_oversight_override_inferred===false,
   errors,"04E/04F case independent legal qualification boundary "+x.id);
  return {id:"X13B3-LEGAL-"+p?.id,original_identity_id:x.id,
   original_issue_id:i?.id,original_review_packet_id:p?.id,primary_reference:i?.primary_reference,
   qualifying_reference:i?.qualifying_reference,relationship_kind_candidate:i?.relationship_kind_candidate,
   protected_distinction:CASE_TYPES[x.id],official_source_url:i?.official_legal_source_url,
   review_basis:p?.review_questions,external_GSA_body_not_VA_first_level:x.id==="D04D-INST-CBCA",
   historical_research_only:x.id==="D04D-INST-FORMER-VABCA"||x.id==="D04D-INST-CBCA",
   current_statutory_effect_2026_verified:false,current_legal_jurisdiction_qualified:false,
   legal_effective_on:null,verified_individual_delegation:false,
   adjudication_or_oversight_override_authorized:false,independent_counsel_decision_id:null,adl1_certified:false};
 });
 assert(Object.keys(CASE_TYPES).length===6&&legals.every(x=>CASE_TYPES[x.id])&&
  expectedLegal.find(x=>x.original_identity_id==="D04D-INST-CBCA")?.external_GSA_body_not_VA_first_level===true,
  errors,"six special legal boundaries or external GSA status lost");
 compareFamily(data,"legal",expectedLegal,errors);
 const event=history[0],un=unavailable.find(x=>x.id==="F04F-EXCEPTION-CBCA");
 assert(event?.id==="D04D-EVENT-2007"&&event.from_id==="D04D-INST-FORMER-VABCA"&&
  event.to_id==="D04D-INST-CBCA"&&event.publisher_effective_date==="2007-01-06"&&
  event.statute_38_301_c7_repealed_inferred===false&&
  event.complete_legal_transfer_verified===false&&event.reviewer===null&&
  un?.recovered_source_bytes===false&&un?.original_bytes_sha256===null&&
  un?.allowed_substitution===false&&un?.legal_review_signoff_id===null,
  errors,"2007 successor scope/citator or unavailable original silently certified");
 compareFamily(data,"history",[{id:"X13B3-HISTORY-2007",original_event_id:event?.id,
  predecessor_identity_id:event?.from_id,external_successor_identity_id:event?.to_id,
  publisher_reported_date:event?.publisher_effective_date,original_source_ids:event?.source_ids,
  missing_original_exception_id:un?.id,source_original_capture_verified:false,
  transition_scope_fully_verified:false,statutory_repeal_inferred:false,
  current_VA_first_level_membership_inferred:false,operative_legal_effect_certified:false,
  legal_review_decision_id:null,adl1_certified:false}],errors);
 const evidenceIDs=["ARCH04B-OBS-ARCH04B-VA-HTML","D04D-OBS-FOM1","D04D-OBS-FOM2","D04D-OBS-USC38","D04D-OBS-USC41"];
 const expectedEvidence=evidenceIDs.map(id=>{
  const q=qByReceipt.get(id),p=receiptById.get(id);
  assert(q&&q.SHA256&&/^[0-9a-f]{64}$/.test(q.SHA256)&&q.byte_count>0&&
   q.original_bytes_in_repository===false&&q.source_bytes_reverified_04f===false&&
   q.primary_object_version_id===null&&q.replica_object_version_id===null&&
   q.qualified_custody_record===null&&q.legal_status_certified===false&&q.ADL1_certified===false&&
   (!p||(p.body_sha256===q.SHA256&&p.bytes===q.byte_count&&
    p.durable_write_once_approved===false&&p.institutionally_signed===false&&p.legal_review_completed===false)),
   errors,"recorded source digest, original receipt or archive unqualified "+id);
  return {id:"X13B3-EVIDENCE-"+q?.source_id,source_id:q?.source_id,source_receipt_id:id,
   source_queue_id:q?.id,source_url:q?.source_url,source_edition:q?.source_edition,
   recorded_original_sha256:q?.SHA256,source_original_captured_previously:true,
   original_bytes_in_repository:false,independently_reverified_from_provider_04f:false,
   permanent_WORM_custody_qualified:false,institutional_signer_ratified:false,
   current_legal_edition_reverified:false,original_unavailable_exception_id:null};
 });
 const missing=unavailable.find(x=>x.id==="F04F-EXCEPTION-CBCA");
 expectedEvidence.push({id:"X13B3-EVIDENCE-CBCA-UNAVAILABLE",source_id:"D04D-SRC-CBCA",
  source_receipt_id:"D04D-OBS-CBCA",source_queue_id:null,source_url:missing?.source_url,
  source_edition:"historical_page_not_captured",recorded_original_sha256:null,
  source_original_captured_previously:false,original_bytes_in_repository:false,
  independently_reverified_from_provider_04f:false,permanent_WORM_custody_qualified:false,
  institutional_signer_ratified:false,current_legal_edition_reverified:false,
  original_unavailable_exception_id:missing?.id});
 compareFamily(data,"evidence",expectedEvidence,errors);
 compareFamily(data,"scopes",expectedScopes(),errors);
}
export function validateINC13B3(data){
 const errors=[];
 try{
  verifyShape(data,errors);verifySourceBaseline(data,errors);
  assertNonpromotion(data,errors);verifySourceRows(data,errors);
 }catch(e){errors.push("INC13B3 unexpected model/source shape: "+e.message);}
 return {errors,source_baseline_commit:BASELINE,source_pin_count:23,
  directory_headings:22,directory_administrations:3,directory_staff_offices:19,
  statutory_clauses:9,open_residual_categories:2,statutory_directory_matches:4,
  research_candidates:25,candidate_directory_links:22,candidates_outside_directory:3,
  distinct_special_legal_cases:6,historical_transition_candidates:1,
  historical_board_source_original_missing:true,qualified_current_first_level_denominator:null,
  adl1_certified_count:0,legal_review_complete:false,live_original_custody_qualified:false,
  public_website_admitted:false,disposition:"bounded_overlapping_VA_source_research_only"};
}
export function projectINC13B3(data,view="overview"){
 const report=validateINC13B3(data);
 if(report.errors.length)throw Error(report.errors.join("; "));
 const modes=["overview","directory","statutes","candidates","legal","history","evidence"];
 if(!modes.includes(view))throw Error("Unknown INC13B3 source projection "+view);
 const m=data.models;
 const base={root_id:VA,view,source_baseline_commit:BASELINE,coverage:report,
  qualification:"Not a complete current VA first-level roster, verified delegation, current controlling legal opinion, certified ADL-1 or independently ratified original archive"};
 if(view==="overview")return {...base,source_scopes:m.scopes.items,legal_gaps:m.legal.items.map(x=>({id:x.id,identity_id:x.original_identity_id,review_id:x.original_review_packet_id,review_completed:false}))};
 if(view==="directory")return {...base,nodes:m.directory.items,source_observed_edges:m.directory.items.map(x=>({
   id:x.original_department_unit_relation_id,from_id:x.original_unit_candidate_id,
   to_id:x.original_04a_observed_parent_id,source_relation_type:x.original_relation_type,
   source_observation_id:x.original_inc12_observation_id,
   source_epoch_commit:BASELINE,legal_effective_on:null,delegated_authority_verified:false}))};
 if(view==="statutes")return {...base,clauses:m.statutes.items};
 if(view==="candidates")return {...base,research_candidates:m.candidates.items};
 if(view==="legal")return {...base,unratified_legal_cases:m.legal.items};
 if(view==="history")return {...base,historical_transition_candidates:m.history.items};
 return {...base,custody_and_missing_originals:m.evidence.items};
}
