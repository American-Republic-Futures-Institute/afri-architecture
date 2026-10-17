// ARFI 04D: structural/source research only. Never infer legal power from a directory.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
export const FAMILIES=Object.freeze(["source-targets","statutory-crosswalk","legal-identities",
 "temporal-events","trust-gates","review-approvals","coverage","observed-source-receipts","fom-page-anchors"]);
export const PATHS=FAMILIES.map(x=>"model/federal/inc04d/"+x+".json");
export const CONTEXT=Object.freeze(["model/federal/inc04c/va-directory.json",
 "model/federal/inc04c/va-statutory-composition.json"]);
const fail=x=>{throw Error("04D architecture rejected: "+x);};
const check=(x,y)=>{if(!x)fail(y);};
const unique=x=>new Set(x).size===x.length;
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const byId=x=>new Map(x.map(y=>[y.id,y]));
const HASHES=Object.freeze({
 "D04D-SRC-FOM1":["d4c9bc1f84cfb08dd92df5e95e624b479f04a9f7e94abecb6e092e2748a5d523",8993757,315],
 "D04D-SRC-FOM2":["a9900503672b48541a1639167bc0a2b2f5e7b3607c85881faa9caf0b28a90f1b",33434554,506],
 "D04D-SRC-USC38":["d56b1ef48b0b6c85a5d68ecf2f9469b83f066c4",28011,null],
 "D04D-SRC-USC41":["8e5d35b1cdc7c7fc8832bd0aacf8ecb487b7df772cd50ae3dbf4988f77cd94d7",18691,null]
});
const ALLOWLIST=Object.freeze({
 "D04D-SRC-FOM1":"https://department.va.gov/wp-content/uploads/2025/04/va-functional-organizational-manual-volume-1.pdf",
 "D04D-SRC-FOM2":"https://department.va.gov/wp-content/uploads/2024/06/va-functional-organizational-manual-volume-2.pdf",
 "D04D-SRC-USC38":"https://www.govinfo.gov/content/pkg/USCODE-2024-title38/html/USCODE-2024-title38-partI-chap3-sec301.htm",
 "D04D-SRC-USC41":"https://www.govinfo.gov/content/pkg/USCODE-2024-title41/html/USCODE-2024-title41-subtitleIII-chap71-sec7105.htm",
 "D04D-SRC-CBCA":"https://www.cbca.gov/board/index.html"
});
const ANCHORS=Object.freeze({
 "D04D-ANCHOR-FOM1-HEAD":["D04D-OBS-FOM1",7,"ORGANIZATION OF THE DEPARTMENT"],
 "D04D-ANCHOR-FOM1-ADMIN":["D04D-OBS-FOM1",8,"three Administrations"],
 "D04D-ANCHOR-FOM2-SECRETARY":["D04D-OBS-FOM2",19,"OSVA-00 Office of the Secretary"],
 "D04D-ANCHOR-FOM2-OEDCA":["D04D-OBS-FOM2",33,"OSVA-000 Office of Employment Discrimination Complaint Adjudication"],
 "D04D-ANCHOR-FOM2-BVA":["D04D-OBS-FOM2",39,"BVA-01 Board of Veterans' Appeals"],
 "D04D-ANCHOR-FOM2-OIG":["D04D-OBS-FOM2",321,"OIG-50 Office of the Inspector General"]
});
const EXPECTED_ROLES=["custodian","records_officer","institutional_architect",
 "statutory_counsel","IG_adjudication_reviewer","citator_reviewer"];
function fits(value,rule){
 if("const" in rule&&value!==rule.const)return false;
 if(rule.enum&&!rule.enum.includes(value))return false;
 const kind=value===null?"null":Array.isArray(value)?"array":Number.isInteger(value)?"integer":typeof value;
 if(rule.type&&!([].concat(rule.type)).includes(kind))return false;
 if(kind==="string"&&(rule.minLength!==undefined&&value.length<rule.minLength||
   rule.pattern&&!new RegExp(rule.pattern).test(value)))return false;
 if(kind==="integer"&&rule.minimum!==undefined&&value<rule.minimum)return false;
 if(kind==="array"&&(rule.uniqueItems&&!unique(value)||rule.items&&!value.every(x=>fits(x,rule.items))))return false;
 return true;
}
export function inspect04DSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
   schema?.additionalProperties!==false||schema?.oneOf?.length!==FAMILIES.length||
   !same(schema.properties?.model_family?.enum||[],FAMILIES))
  errors.push("strict draft 2020-12 dispatch missing");
 for(const name of FAMILIES){
  const d=schema?.$defs?.[name],v=files["model/federal/inc04d/"+name+".json"];
  const dispatch=schema?.oneOf?.find(x=>x.properties?.model_family?.const===name);
  if(!d||d.type!=="object"||d.additionalProperties!==false||
   !Array.isArray(d.required)||dispatch?.properties?.items?.items?.$ref!=="#/$defs/"+name){
   errors.push("missing family item schema "+name);continue;
  }
  if(v?.model_family!==name||v?.model_version!=="0.1.0"||!Array.isArray(v.items)){
   errors.push("missing/mislabeled collection "+name);continue;
  }
  for(const [i,row]of v.items.entries()){
   for(const k of Object.keys(row)){
    const p=d.properties[k];if(!p)errors.push("unknown field "+name+"/"+i+"/"+k);
    else if(!fits(row[k],p))errors.push("property invalid "+name+"/"+i+"/"+k);
   }
   for(const k of d.required)if(!(k in row))errors.push("missing field "+name+"/"+i+"/"+k);
  }
 }
 return {families:FAMILIES.length,errors};
}
export function validateVA04D(manifest,files,schema){
 const m=manifest?.federal_evidence_04d_extension;
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  m?.id==="ARFI-COA-VA-EVIDENCE-04D"&&m.version==="0.1.0"&&
  m.previous==="ARFI-COA-FED-EVIDENCE-004C"&&
  m.capture_targets===5&&m.verified_new_capture_count===4&&
  m.VA_FOMs_verified===2&&m.CBCA_source_original_blocked===true&&
  m.GOVINFO_2024_code_html_byte_verified===2&&m.originals_durably_retained_count===0&&
  m.VA_ADL1_certified===false&&m.full_department_denominator===null&&
  m.retention_ratified===false&&m.institutional_signer_enrolled===false&&
  m.legal_review_complete===false&&m.website_published===false&&m.unratified===true,
  "source/retention/certification claim advanced without proof");
 check(inspect04DSchema(schema,files).errors.length===0,
  "strict closed JSON Schema contract rejected");
 const data=Object.fromEntries(FAMILIES.map(n=>{
  const p="model/federal/inc04d/"+n+".json";check(manifest.models?.includes(p),"unregistered "+n);
  const x=files[p].items;check(unique(x.map(z=>z.id)),"duplicate IDs "+n);return [n,x];
 }));
 const predecessors=CONTEXT.map(p=>{
  check(manifest.models.includes(p)&&files[p]?.model_version==="0.1.0","lost predecessor "+p);
  return files[p].items;
 });
 check(predecessors[0].length===22&&predecessors[1].length===9,
  "historic bounded VA source/Title 38 clause identities changed");
 const sources=byId(data["source-targets"]),obs=byId(data["observed-source-receipts"]);
 check(sources.size===5&&obs.size===5,"five distinct official targets and receipt states required");
 for(const [id,url]of Object.entries(ALLOWLIST)){
  const s=sources.get(id),r=obs.get(id.replace("D04D-SRC-","D04D-OBS-"));
  check(s?.url===url&&s.observed_sha256===null&&s.observed_bytes===null&&
   s.byte_capture_verified===false&&s.immutable_promotion_verified===false&&
   s.independently_reviewed===false,
   "original target or archival state is fabricated "+id);
  check(r?.source_target_id===id&&r.original_bytes_embedded_in_architecture_repo===false&&
   r.durable_write_once_approved===false&&r.institutionally_signed===false&&
   r.legal_review_completed===false&&r.capture_run_id===39042644962&&r.artifact_id===12104846619,
   "invented legal or archival status in observed receipt "+id);
  const known=HASHES[id];
  if(known){
   check(r.body_sha256===known[0]&&r.bytes===known[1]&&r.pages===known[2]&&
    r.independent_sha256_comparison==="match_actions_capture_manifest_and_downloaded_original_bytes"&&
    r.response_state==="verified_in_temporary_Actions_artifact",
    "original source SHA-256, page count or receipt mismatch "+id);
   if(id.includes("FOM"))check(r.PDF_cover_version==="8.1"&&r.PDF_cover_year==="2023"&&
    r.PDF_last_modified_utc?.startsWith("2025-03-14")&&
    r.source_publication_as_of==="VA_publisher_page_March_2025_update_but_cover_2023",
    "publisher update date may not silently be substituted for manual cover year");
  }else check(id==="D04D-SRC-CBCA"&&r.body_sha256===null&&r.bytes===null&&
   r.pages===null&&r.response_state==="official_page_not_captured",
   "blocked CBCA web source cannot have imaginary original bytes");
 }
 const clauses=data["statutory-crosswalk"];
 check(clauses.length===9,"all 38 USC 301(c) composition clauses required");
 for(const [i,prior]of predecessors[1].entries()){
  const x=clauses[i];
  check(x.id==="D04D-CLAUSE-"+(i+1)&&x.predecessor_id===prior.id&&
   x.citation===prior.legal_reference&&x.label===prior.described_element&&
   x.matched_directory_candidate===prior.directory_candidate_id&&
   x.source_id==="D04D-SRC-USC38"&&
   x.current_legal_status_verified===false&&x.regulatory_delegation_verified===false&&
   x.source_edition_bytes_verified===false&&
   x.absence_means_abolished===false&&x.human_approved===false,
   "statutory unit was wrongly promoted, reassigned or claimed repealed");
 }
 const legal=byId(data["legal-identities"]);
 check(legal.size===6&&same([...legal.keys()],
  ["CANTEEN","FORMER-VABCA","CBCA","OIG","BVA","OEDCA"].map(x=>"D04D-INST-"+x)),
  "six distinct legal identities required");
 for(const x of legal.values())check(x.source_sha256===null&&
  x.statutory_status_current===false&&x.organizational_reporting_verified===false&&
  x.adjudicative_jurisdiction_verified===false&&x.legal_review_approved===false,
  "special institution cannot receive authority solely by descriptive source");
 check(legal.get("D04D-INST-CANTEEN").basis.includes("7801")&&
  legal.get("D04D-INST-OEDCA").basis.includes("319")&&
  legal.get("D04D-INST-BVA").basis.includes("7101")&&
  legal.get("D04D-INST-CBCA").department==="GSA",
  "Canteen/OEDCA/BVA/GSA special statutory distinctions lost");
 const event=data["temporal-events"][0];
 check(data["temporal-events"].length===1&&event?.id==="D04D-EVENT-2007"&&
  event.from_id==="D04D-INST-FORMER-VABCA"&&event.to_id==="D04D-INST-CBCA"&&
  event.publisher_effective_date==="2007-01-06"&&
  event.statute_38_301_c7_repealed_inferred===false&&
  event.complete_legal_transfer_verified===false&&event.reviewer===null&&
  same(event.source_ids,["D04D-SRC-CBCA","D04D-SRC-USC41","D04D-SRC-USC38"]),
  "candidate historical consolidation may not erase still-printed statute");
 const trust=data["trust-gates"][0];
 check(data["trust-gates"].length===1&&trust?.id==="D04D-TRUST"&&
  trust.signing_alg==="Ed25519"&&trust.approved_signer===null&&trust.signer_fingerprint_sha256===null&&
  trust.retention_policy_id===null&&trust.ratified_retention_years===null&&
  trust.protected_archive_location===null&&trust.immutable_storage_proof===null&&
  trust.distinct_custodian_approval===null&&trust.independent_legal_approval===null&&
  trust.fully_attested===false&&trust.release_state==="blocked_missing_signer_retention_and_protection",
  "protected archive/policy cannot be self-certified by research data");
 const reviewers=data["review-approvals"];
 check(reviewers.length===6&&same(reviewers.map(x=>x.role),EXPECTED_ROLES)&&
  reviewers.every(x=>x.reviewer===null&&x.approval_signature_sha256===null&&
   x.decision==="pending"&&x.approved_at===null),
   "six independent human approvals remain pending");
 const coverage=data.coverage[0];
 check(data.coverage.length===1&&coverage.directory_listed===22&&
   coverage.administrations===3&&coverage.staff_offices===19&&
   coverage.statutory_clauses===9&&coverage.residual_statutory_categories===2&&
   coverage.matched_statute_to_directory===4&&
   coverage.full_department_first_level_denominator===null&&
   coverage.verified_first_level_members===0&&coverage.legal_certified===false&&
   coverage.ADL1_certified===false,
   "published source scope falsely declared complete department ADL1");
 const anchors=byId(data["fom-page-anchors"]);
 check(anchors.size===6,"all six page-bounded FOM research anchors required");
 for(const [id,[receipt,page,heading]]of Object.entries(ANCHORS)){
  const x=anchors.get(id);
  check(x?.observed_receipt_id===receipt&&x.PDF_physical_page_1_based===page&&
   x.printed_heading===heading&&x.pdf_source_sha256===
    (receipt==="D04D-OBS-FOM1"?HASHES["D04D-SRC-FOM1"][0]:HASHES["D04D-SRC-FOM2"][0])&&
    x.source_section_verified_in_original_bytes===true&&
    x.authorization_or_delegation_certified===false&&
    x.complete_first_level_census_certified===false&&x.reviewer_id===null,
    "FOM source page anchor invalid/legally elevated "+id);
 }
 return {status:"VA_primary_bytes_partial_temporary_legal_census_unratified",
  data,counts:{new_sha256_verified:4,VA_FOMs:2,page_anchors:6,
   unresolved_CBCA_originals:1,statutory_clauses:9,pending_approvals:6,
   complete_first_level_denominator:null,ADL1_certifications:0}};
}
export async function verifyOriginal04DBytes(dir,observations){
 const expected=byId(observations),seen=[];
 for(const [id,[hash,len]]of Object.entries(HASHES)){
  const name="D04D-OBS-"+id.slice("D04D-SRC-".length);
  const source=expected.get(name);
  check(source?.body_sha256===hash&&source.bytes===len,"source receipt not pinned to original");
  const file=path.join(dir,"bytes",id+(id.includes("FOM")?".pdf":".html"));
  const stats=await fs.lstat(file);
  check(stats.isFile()&&!stats.isSymbolicLink(),"source must be regular file");
  const bytes=await fs.readFile(file);
  check(bytes.length===len&&createHash("sha256").update(bytes).digest("hex")===hash,
   "source bytes mismatch "+id);
  seen.push(id);
 }
 check(expected.get("D04D-OBS-CBCA")?.body_sha256===null,
  "missing CBCA history cannot have forged hash");
 return {verified_sha256:seen.length,source_ids:seen,unavailable:["D04D-SRC-CBCA"],
  durable_archival_custody:false,VA_ADL1_certified:false};
}
