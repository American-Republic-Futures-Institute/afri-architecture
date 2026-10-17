// Increment 04C: VA dated directory != statutory composition != first-level legal institution census.
import {validatePinnedReceipts} from "./durable-evidence-registry-04c-core.mjs";
export const FAMILIES=Object.freeze(["archive-index","va-directory","va-statutory-composition","va-coverage",
 "va-gaps","approvals","trust-policy","hhs-acquisition","va-source-versions"]);
export const PATHS=FAMILIES.map(x=>"model/federal/inc04c/"+x+".json");
export const PRIOR=Object.freeze(["model/federal/department-structure/units.json",
 "model/federal/archive04b/observed-capture-receipts.json",
 "model/federal/archive04b/denominators.json",
 "model/federal/archive04b/classification-review.json"]);
const VA="ORG-FED-EXE-DEP-VA";
const SOURCE="40d3130d0484607014295318fd3d9aefacc5462ac34332f89a902c99c4e96c24";
const LAW="https://uscode.house.gov/view.xhtml?edition=prelim&num=0&req=granuleid%3AUSC-prelim-title38-section301";
const fail=x=>{throw Error("VA evidence registry rejected: "+x);};
const check=(x,y)=>{if(!x)fail(y);};
const unique=x=>new Set(x).size===x.length;
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const toMap=x=>new Map(x.map(v=>[v.id,v]));
const EXCEPTIONS=["OIG","BVA","OEDCA"];
const FLAGS=["reporting_parent_verified","statutory_subtype_verified","first_level_organizational_membership_verified","legal_authority_verified"];
function schemaValue(v,rule){
 if("const" in rule&&v!==rule.const)return false;
 if(rule.enum&&!rule.enum.includes(v))return false;
 const type=v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
 if(rule.type&&!([].concat(rule.type)).includes(type))return false;
 if(type==="string"&&((rule.minLength!==undefined&&v.length<rule.minLength)||
   rule.pattern&&!new RegExp(rule.pattern).test(v)))return false;
 if(type==="integer"&&rule.minimum!==undefined&&v<rule.minimum)return false;
 if(type==="array"&&(rule.uniqueItems&&!unique(v)||rule.items&&!v.every(x=>schemaValue(x,rule.items))))return false;
 return true;
}
export function inspect04cSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
   schema?.additionalProperties!==false||schema.oneOf?.length!==FAMILIES.length||
   !same(schema.properties?.model_family?.enum||[],FAMILIES))
  errors.push("missing strict JSON Schema 2020-12 family dispatch");
 for(const fam of FAMILIES){
  const p="model/federal/inc04c/"+fam+".json",d=schema?.$defs?.[fam],c=files[p];
  const dispatch=schema?.oneOf?.find(x=>x.properties?.model_family?.const===fam);
  if(dispatch?.properties?.items?.items?.$ref!=="#/$defs/"+fam||
   d?.type!=="object"||d.additionalProperties!==false||!Array.isArray(d.required))
    {errors.push("missing closed record schema "+fam);continue;}
  if(c?.model_version!=="0.1.0"||c?.model_family!==fam||!Array.isArray(c.items)){
   errors.push("mislabeled family "+fam);continue;
  }
  for(const [i,x]of c.items.entries()){
   for(const k of Object.keys(x)){
    const r=d.properties?.[k];
    if(!r)errors.push("unknown field "+fam+"/"+i+"/"+k);
    else if(!schemaValue(x[k],r))errors.push("violates property "+fam+"/"+i+"/"+k);
   }
   for(const k of d.required)if(!(k in x))errors.push("missing field "+fam+"/"+i+"/"+k);
  }
 }
 return {collections:FAMILIES.length,errors};
}
export function validateVA04C(manifest,files,schema){
 const ext=manifest?.federal_evidence_registry_extension;
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  ext?.id==="ARFI-COA-FED-EVIDENCE-004C"&&ext.version==="0.1.0"&&
  ext.predecessor==="ARFI-COA-FED-SOURCE-ARCHIVE-004B"&&
  ext.VA_directory_named_candidates===22&&ext.VA_statutory_clauses===9&&
  ext.VA_open_residual_statutory_categories===2&&
  ext.VA_known_statutory_named_not_in_22_directory===3&&
  ext.VA_organizational_complete===false&&ext.VA_ADL1_certified===false&&
  ext.VA_first_level_denominator===null&&ext.VA_independently_reviewed_institutions===0&&
  ext.source_record_total===8&&ext.source_sha256_receipts===7&&ext.HHS_blocked_official_capture===1&&
  ext.promoted_durable_bytes===0&&ext.approved_signing_keys===0&&ext.signatures_trusted===0&&
  ext.independent_legal_review_complete===false&&
  ext.source_temporal_reconciliation_complete===false&&
  ext.website_publication==="not_implemented"&&
  ext.status==="source_verified_receipts_only_unratified",
  "manifest cannot certify legal ADL-1 or a durable signature without review");
 const report=inspect04cSchema(schema,files);
 check(report.errors.length===0,"strict schema rejects: "+report.errors.slice(0,3).join("; "));
 const models=Object.fromEntries(FAMILIES.map(f=>{
  const path="model/federal/inc04c/"+f+".json";
  check(manifest.models?.includes(path),"unregistered 04C data model "+f);
  const values=files[path]?.items;
  check(Array.isArray(values)&&unique(values.map(x=>x.id)),"duplicate/missing model "+f);
  return [f,values];
 }));
 const prior=Object.fromEntries(PRIOR.map(p=>{
  const x=files[p];check(x?.model_version==="0.1.0"&&manifest.models.includes(p)&&
   Array.isArray(x.items),"04B required predecessor missing "+p);
  return [p,x.items];
 }));
 const oldUnits=prior[PRIOR[0]],oldReceipts=prior[PRIOR[1]],oldLedgers=prior[PRIOR[2]],legal=prior[PRIOR[3]];
 check(oldUnits.length===80&&oldReceipts.length===8&&oldLedgers.length===4&&legal.length===9,
  "upstream architecture source identity changed");
 const receipts=toMap(oldReceipts), index=toMap(models["archive-index"]);
 check(index.size===8&&models["archive-index"].length===8,"source registry must preserve eight exact identifiers");
 validatePinnedReceipts(models["archive-index"]);
 for(const x of models["archive-index"]){
  const prior=receipts.get(x.prior_receipt_id),value=x.source_id;
  check(prior&&prior.source_id===value&&x.id==="AR04C-REG-"+value&&
   x.observed_sha256===prior.decoded_entity_sha256&&
   x.observed_bytes===prior.decoded_entity_byte_count&&
   x.observed_at===prior.captured_at&&x.source_url===prior.source_url&&
   x.original_capture_run_id===prior.github_artifact_run_id&&
   x.temporary_artifact_id===prior.github_artifact_id&&
   x.legal_classification_verified===false&&x.first_level_completeness_verified===false,
   "untrusted or reassigned prior source receipt "+value);
 }
 const va=oldUnits.filter(x=>x.department_id===VA),vmap=toMap(va);
 check(va.length===22&&va.filter(x=>x.group==="administrations_heading").length===3&&
  va.filter(x=>x.group==="staff_offices_heading").length===19,
  "VA predecessor 3+19 source-group reference modified");
 const rows=models["va-directory"];
 check(rows.length===22&&unique(rows.map(x=>x.inc04a_candidate_id))&&
  same(rows.map(x=>x.inc04a_candidate_id),va.map(x=>x.id)),
  "directory must match only the exact preexisting 22 VA source headings");
 let a=0,b=0;
 for(const row of rows){
  const v=vmap.get(row.inc04a_candidate_id);
  const label=row.source_heading==="Administrations"?"administrations_heading":"staff_offices_heading";
  if(label==="administrations_heading")a++;else b++;
  check(v&&row.id==="AR04C-VA-ROW-"+v.id.slice("DEPT04-UNIT-VA-".length)&&
    row.canonical_department_id===VA&&row.name===v.name&&row.source_group===v.group&&
    row.original_class===v.structural_class&&v.group===label&&
    row.source_id==="ARCH04B-VA-HTML"&&row.source_sha256===SOURCE&&
    row.date_basis==="directory_updated_2026-02-25_capture_2026-10-17"&&
    row.source_occurrence_verified_against_received_html===true&&
    row.source_url==="https://department.va.gov/administrations-and-offices/"&&
    row.approval_status==="research_pending_institutional_and_legal_review"&&
    FLAGS.every(k=>row[k]===false),
    "missing or promoted VA directory identity, subsection or organization authority");
  const expectedOrder=v.group==="administrations_heading"?va.indexOf(v)+1:va.indexOf(v)-2;
  check(row.source_relative_heading_ordinal===expectedOrder,
   "VA published heading order changed without source-reconciliation review");
 }
 check(a===3&&b===19,"3 VA administrations and 19 staff-section entries required");
 const lawItems=models["va-statutory-composition"];
 check(lawItems.length===9,"all nine 38 USC 301(c) clauses must be represented");
 const expected=[
  ["1",null,"office_of_secretary_h2_header_not_in_22_count"],
  ["2","DEPT04-UNIT-VA-VHA","matched_administration"],
  ["3","DEPT04-UNIT-VA-VBA","matched_administration"],
  ["4","DEPT04-UNIT-VA-NCA","matched_administration"],
  ["5","DEPT04-UNIT-VA-BVA","matched_but_adjudicative_competence_separate"],
  ["6",null,"not_in_bounded_22_entry_directory"],
  ["7",null,"not_in_bounded_22_entry_directory_status_and_successor_review"],
  ["8",null,"open_residual_category_not_enumerated"],
  ["9",null,"open_residual_category_not_enumerated"]
 ];
 for(const [sub,id,match]of expected){
  const row=lawItems.find(x=>x.id==="AR04C-VA-STAT-301-C-"+sub);
  check(row?.legal_reference==="38 U.S.C. §301(c)("+sub+")"&&
   row.source_url===LAW&&row.directory_candidate_id===id&&
   row.reconciliation===match&&row.published_primary_legal_text_sha256===null&&
   row.code_display_version==="2026_OLRC_prelim_page_not_independently_citator_archived"&&
   row.existence_2026_independently_verified===false&&
   row.first_level_legal_inclusion_reviewed===false&&
   row.operational_reporting_verified===false&&row.statute_review_status==="pending_qualified_legal_review",
   "statutory composition or unresolved identity falsely promoted");
 }
 const coverage=models["va-coverage"][0];
 check(models["va-coverage"].length===1&&coverage?.id==="AR04C-VA-BASELINE"&&
   coverage.source_section_administration_entries===3&&coverage.source_section_staff_entries===19&&
   coverage.source_section_total===22&&coverage.office_of_secretary_header_outside_section===true&&
   coverage.statutory_named_clauses===7&&coverage.open_statutory_categories===2&&
   coverage.statutory_matched_directory_candidates===4&&
   coverage.statutory_named_not_in_22_directory===3&&
   coverage.section_denominator_verified_from_captured_html===true&&
   coverage.whole_department_first_level_denominator===null&&
   coverage.first_level_membership_verified===0&&coverage.statute_review_completion===false&&
   coverage.independent_institutional_review_completion===false&&
   coverage.certified_adl1===false&&coverage.zero_authority_from_directory===true,
   "VA section numerator may not become an unverified complete institution denominator");
 check(models["va-gaps"].length===11&&models["va-gaps"].every(x=>
   x.status==="open"&&x.certified===false&&x.assigned_reviewer===null&&x.reviewed_at===null),
   "all VA composition/retention exception gaps must stay open");
 check(models.approvals.length===5&&
   same(models.approvals.map(x=>x.reviewer_role),[
    "institutional_structure","statutory_authority","inspector_general_independence",
    "evidence_custodian","source_temporal_reconciliation"])&&
   models.approvals.every(x=>x.identity===null&&x.verified_credentials===false&&
    x.review_input_manifest_sha256===null&&x.decision==="pending"&&
    x.decision_at===null&&x.signed_approval_proof===null&&x.not_satisfied_by_CI===true),
    "qualified legal and institutional review cannot be automatically signed off");
 const policy=models["trust-policy"][0];
 check(models["trust-policy"].length===1&&policy?.id==="AR04C-TRUST-POLICY"&&
  policy.signing_algorithm==="Ed25519"&&policy.public_key_fingerprint_sha256===null&&
  policy.approved_signer_identifiers.length===0&&policy.signer_enrollment_complete===false&&
  policy.object_lock_or_equivalent_verified===false&&policy.retention_policy_ratified===false&&
  policy.source_bytes_durably_promoted===false&&policy.archived_bytes_signature_verified===false&&
  policy.independent_legal_signoff_complete===false&&policy.source_complete===false,
  "source registry trust policy and organization signer are not yet ratified");
 const hhs=models["hhs-acquisition"];
 check(hhs.length===2&&same(hhs.map(x=>x.id),[
   "AR04C-HHS-AUTHORIZED-ACQUISITION","AR04C-HHS-CORROBORATING-2026-INDEX"])&&
   hhs.every(x=>x.blocked_source_id==="ARCH04B-HHS-HTML"&&
    x.capture_in_evidence_artifact===false&&x.capture_method===null&&
    x.source_bytes_sha256===null&&x.authorized_provenance===null&&
    x.publisher_authentication_confirmed===false&&x.equivalent_to_2025_HHS_chart===false&&
    x.substitute_GOVMAN_accepted_as_chart===false&&x.access_control_bypass_prohibited===true),
  "HHS blocked page cannot be replaced, attributed or bypassed without evidence");
 const versions=models["va-source-versions"];
 check(versions.length===4&&versions.filter(x=>x.source_payload_sha256!==null).length===1&&
  versions.find(x=>x.id==="AR04C-VERSION-VA-DIRECTORY-2026")?.source_payload_sha256===SOURCE&&
  versions.every(x=>x.change_event_id===null&&x.legal_effect_from_difference===false&&
   x.absence_means_abolished===false&&x.review_status==="requires_primary_source_and_effective_date_reconciliation"),
  "mixed historical editions cannot automatically imply institutional abolition");
 return {status:"VA_22_bounded_directory_and_9_statutory_clauses_not_certified_ADL1",models,
  original_va_units:va,
  counts:{directory:rows.length,statute_clauses:lawItems.length,open_va_gaps:11,
   four_legal_institution_matches:4,source_verified_sha256:7,HHS_original_blocked:1,
   legal_approvals:0,trust_signatures:0,certified_ADL1:0}};
}
export function projectVA04C(validated,mode){
 check(["directory","statutory","gaps"].includes(mode),"unknown or unsupported VA projection");
 if(mode==="directory")return {mode,records:validated.models["va-directory"],denominator_scope:"three_administrations_19_staff_headings_only",complete_first_level:false};
 if(mode==="statutory")return {mode,records:validated.models["va-statutory-composition"],denominator_scope:"38_USC_301c_open_residual_classes_and_two_missing_directory_names",complete_first_level:false};
 return {mode,records:validated.models["va-gaps"],review_approval_count:0,complete_first_level:false};
}
