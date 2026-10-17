// ARFI 04F research model and original-source custody qualification. Fail closed.
export const FAMILIES=Object.freeze(["custody-source-queue","unavailable-originals","custody-acceptance-gates",
 "va-first-level-candidates","va-legal-review-packets"]);
export const PATHS=FAMILIES.map(x=>"model/federal/inc04f/"+x+".json");
export const PREDECESSORS=Object.freeze([
 "model/federal/archive04b/observed-capture-receipts.json","model/federal/archive04b/sources.json",
 "model/federal/inc04d/observed-source-receipts.json","model/federal/inc04d/source-targets.json",
 "model/federal/inc04c/va-directory.json","model/federal/inc04e/va-legal-issues.json"]);
const HASH=/^[a-f0-9]{64}$/, error=x=>{throw Error("04F evidence qualification rejected: "+x);};
const requireThat=(x,msg)=>{if(!x)error(msg);};
const uniq=a=>new Set(a).size===a.length;
const equalSet=(a,b)=>uniq(a)&&uniq(b)&&a.length===b.length&&a.every(x=>b.includes(x));
function matches(v,r){
 if("const" in r&&v!==r.const)return false;
 if(r.enum&&!r.enum.includes(v))return false;
 const type=v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
 if(r.type&&!([]).concat(r.type).includes(type))return false;
 if(type==="string"&&(r.minLength!==undefined&&v.length<r.minLength||
  r.pattern&&!new RegExp(r.pattern).test(v)))return false;
 if(type==="integer"&&r.minimum!==undefined&&v<r.minimum)return false;
 return true;
}
export function inspect04FSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  schema?.additionalProperties!==false||schema.oneOf?.length!==FAMILIES.length||
  !equalSet(schema.properties?.model_family?.enum||[],FAMILIES))
  errors.push("closed draft 2020-12 model dispatcher missing");
 for(const fam of FAMILIES){
  const item=schema?.$defs?.[fam],p="model/federal/inc04f/"+fam+".json",data=files[p];
  const dispatch=schema?.oneOf?.find(x=>x.properties?.model_family?.const===fam);
  if(item?.type!=="object"||item.additionalProperties!==false||
   !Array.isArray(item.required)||dispatch?.properties?.items?.items?.$ref!=="#/$defs/"+fam){
   errors.push("closed collection schema missing "+fam);continue;
  }
  if(data?.model_family!==fam||data?.model_version!=="0.1.0"||!Array.isArray(data.items)){
   errors.push("incorrect collection "+fam);continue;
  }
  for(const [i,row]of data.items.entries()){
   for(const [k,v]of Object.entries(row)){
    if(!item.properties?.[k])errors.push("unknown field "+fam+"/"+i+"/"+k);
    else if(!matches(v,item.properties[k]))errors.push("invalid value "+fam+"/"+i+"/"+k);
   }
   for(const k of item.required)if(!(k in row))errors.push("missing field "+fam+"/"+i+"/"+k);
  }
 }
 return {families:FAMILIES.length,errors};
}
export function validate04F(manifest,files,schema){
 const e=manifest?.federal_operational_custody_04f_extension;
 requireThat(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  e?.id==="ARFI-COA-FED-EVIDENCE-004F"&&e.model_version==="0.1.0"&&
  e.status==="unratified_source_custody_preparation_only"&&
  e.source_original_count===11&&e.original_04b_count===7&&e.original_04d_count===4&&
  e.unavailable_publisher_originals===2&&e.ready_for_replay_from_temporary_artifacts===true&&
  e.artifact_source_bytes_reverified_in_04f===false&&
  e.approved_immutable_primary_objects===0&&e.approved_immutable_replica_objects===0&&
  e.institutional_signer_enrolled===false&&e.retention_policy_ratified===false&&
  e.independent_audit_verified===false&&e.disaster_recovery_qualified===false&&
  e.archived_publication_certified===false&&e.VA_first_level_candidate_count===25&&
  e.VA_verified_full_first_level_denominator===null&&e.VA_ADL1_certified===false&&
  e.legal_review_completed_count===0&&e.public_website_published===false,
  "04F research proposal cannot assert a ratified or certified release");
 const report=inspect04FSchema(schema,files);
 requireThat(report.errors.length===0,"strict collection schema: "+report.errors.slice(0,5).join(", "));
 const models=Object.fromEntries(FAMILIES.map(f=>{
  const p="model/federal/inc04f/"+f+".json";
  requireThat(manifest.models?.includes(p),"04F manifest missing model "+p);
  const entries=files[p].items;
  requireThat(uniq(entries.map(x=>x.id)),"repeated 04F record "+f);
  return [f,entries];
 }));
 for(const p of PREDECESSORS)requireThat(manifest.models.includes(p)&&
  files[p]?.model_version==="0.1.0"&&Array.isArray(files[p].items),
  "predecessor model missing "+p);
 const byId=a=>new Map(a.map(x=>[x.id,x]));
 const olderB=byId(files[PREDECESSORS[0]].items),urlsB=byId(files[PREDECESSORS[1]].items);
 const olderD=byId(files[PREDECESSORS[2]].items),urlsD=byId(files[PREDECESSORS[3]].items);
 const queue=models["custody-source-queue"];
 requireThat(queue.length===11&&uniq(queue.map(x=>x.source_id))&&uniq(queue.map(x=>x.SHA256)),
  "exact eleven independent source originals required");
 const expectedB=files[PREDECESSORS[0]].items.filter(x=>x.decoded_entity_sha256!==null);
 const expectedD=files[PREDECESSORS[2]].items.filter(x=>x.body_sha256!==null);
 requireThat(expectedB.length===7&&expectedD.length===4,"source predecessor receipts must be seven plus four");
 const expectedKeys=[...expectedB.map(x=>x.source_id),...expectedD.map(x=>x.source_target_id)];
 requireThat(equalSet(queue.map(x=>x.source_id),expectedKeys),"missing or fabricated source original");
 for(const x of queue){
  const older=x.collection==="04B"?olderB.get("ARCH04B-OBS-"+x.source_id):
   olderD.get("D04D-OBS-"+x.source_id.slice("D04D-SRC-".length));
  const source=x.collection==="04B"?urlsB.get(x.source_id):urlsD.get(x.source_id);
  const hash=x.collection==="04B"?older?.decoded_entity_sha256:older?.body_sha256;
  const bytes=x.collection==="04B"?older?.decoded_entity_byte_count:older?.bytes;
  const run=x.collection==="04B"?older?.github_artifact_run_id:older?.capture_run_id;
  const artifact=x.collection==="04B"?older?.github_artifact_id:older?.artifact_id;
  const relative="bytes/"+x.source_id+
   (x.collection==="04B"?(x.source_id.endsWith("-XML")?".xml":".html"):
    (x.source_id.includes("FOM")?".pdf":".html"));
  requireThat(older&&source&&x.id==="F04F-SOURCE-"+x.source_id&&
   x.predecessor_receipt_id===older.id&&
   x.source_url===source.url&&x.source_edition===source.edition&&
   HASH.test(hash||"")&&x.SHA256===hash&&
   x.byte_count===bytes&&x.byte_count>100&&x.byte_count<134217728&&
   x.captured_at===(x.collection==="04B"?older.captured_at:null)&&
   x.original_run_id===run&&x.original_artifact_id===artifact&&
   x.original_artifact_name===(x.collection==="04B"?
    "arfi-federal-primary-source-capture-04b":"arfi-04d-va-fom-and-law-original-bytes-UNRATIFIED")&&
   x.original_artifact_expires_at===(x.collection==="04B"?
    "2027-01-15T01:17:08Z":"2027-01-15T14:53:06Z")&&
   x.artifact_relative_path===relative&&
   x.object_key==="sha256/"+hash.slice(0,2)+"/"+hash&&
   x.original_bytes_in_repository===false&&x.candidate_manifest_only===true&&
   x.source_bytes_reverified_04f===false&&
   x.primary_object_version_id===null&&x.replica_object_version_id===null&&
   x.qualified_custody_record===null&&x.legal_status_certified===false&&
   x.ADL1_certified===false&&x.release_state==="research_only_pending_live_preservation",
   "wrong source URL, digest, edition, artifact, custody flag or role for "+x.source_id);
 }
 const exc=models["unavailable-originals"];
 requireThat(exc.length===2&&equalSet(exc.map(x=>x.id),["F04F-EXCEPTION-HHS","F04F-EXCEPTION-CBCA"]),
  "two distinct uncaptured primary sources required");
 for(const x of exc){
  const hhs=x.id==="F04F-EXCEPTION-HHS";
  const prior=hhs?olderB.get("ARCH04B-OBS-ARCH04B-HHS-HTML"):olderD.get("D04D-OBS-CBCA");
  const src=hhs?urlsB.get("ARCH04B-HHS-HTML"):urlsD.get("D04D-SRC-CBCA");
  requireThat(prior&&src&&x.source_id===(hhs?"ARCH04B-HHS-HTML":"D04D-SRC-CBCA")&&
   x.source_url===src.url&&x.previous_receipt_id===prior.id&&
   x.capture_blocker===(hhs?"official_HTTP_403":"original_public_webpage_not_captured")&&
   x.original_bytes_sha256===null&&x.recovered_source_bytes===false&&
   x.allowed_substitution===false&&x.legal_review_signoff_id===null,
   "a blocked source cannot be represented as archived or substituted");
 }
 const gates=models["custody-acceptance-gates"];
 const gateIDs=["GOVERNANCE","KEYS","ROLES","SOURCE","PRIMARY","REPLICA",
  "AUDIT","RECOVERY","LEGAL","ADL1"].map(x=>"F04F-GATE-"+x);
 requireThat(gates.length===10&&equalSet(gates.map(x=>x.id),gateIDs)&&
  gates.every(x=>x.type==="operational_and_review_acceptance_gate"&&
   x.evidence_sha256===null&&x.reviewer_id===null&&x.completed_at===null&&
   x.verified===false&&x.waived===false&&x.status==="blocked_pending_external_evidence"),
  "human release gate cannot be bypassed or self-signed");
 const oldDirectory=files[PREDECESSORS[4]].items,roster=models["va-first-level-candidates"];
 requireThat(oldDirectory.length===22&&roster.length===25&&uniq(roster.map(x=>x.id)),
  "twenty-two directory identities plus three source-bounded exceptions required");
 for(const row of oldDirectory){
  const id="F04F-CAND-"+row.id.slice("AR04C-VA-ROW-".length);
  const candidate=roster.find(x=>x.id===id);
  requireThat(candidate&&candidate.predecessor_id===row.inc04a_candidate_id&&
   candidate.legacy_directory_id===row.id&&candidate.name===row.name&&
   candidate.research_source_class===row.source_group&&
   candidate.source_receipt_id==="ARCH04B-OBS-ARCH04B-VA-HTML"&&
   candidate.candidate_basis==="bounded_published_directory_heading"&&
   candidate.source_presence_in_bounded_material_verified===true,
   "22 historic VA directory identities cannot be overwritten: "+id);
 }
 const extra=roster.filter(x=>x.legacy_directory_id===null);
 requireThat(extra.length===3&&equalSet(extra.map(x=>x.id),
  ["F04F-CAND-SECRETARY","F04F-CAND-CANTEEN","F04F-CAND-FORMER-VABCA"]),
  "office of Secretary, VCS and historical Board must be distinct");
 requireThat(extra.find(x=>x.id==="F04F-CAND-SECRETARY")?.predecessor_id==="AR04C-VA-STAT-301-C-1"&&
  extra.find(x=>x.id==="F04F-CAND-CANTEEN")?.source_receipt_id==="D04D-OBS-USC38"&&
  extra.find(x=>x.id==="F04F-CAND-FORMER-VABCA")?.name.includes("historical"),
  "VA legal exceptions require original source qualified status");
 requireThat(roster.every(x=>x.inside_2026_current_first_level_legal_universe_verified===false&&
  x.direct_department_reporting_verified===false&&x.legal_subtype_verified===false&&
  x.explicitly_external_to_VA===false&&x.qualifying_legal_review_id===null&&
  x.status==="source_observed_first_level_candidate_unratified"),
  "VA first-level status not independently verified");
 requireThat(!roster.some(x=>x.name==="Civilian Board of Contract Appeals"),
  "GSA CBCA cannot be counted as VA first level");
 const legal=models["va-legal-review-packets"],priorLegal=files[PREDECESSORS[5]].items;
 requireThat(legal.length===6&&equalSet(legal.map(x=>x.predecessor_legal_issue_id),
  priorLegal.map(x=>x.id)),"six VA/GSA statutory exception review packets required");
 for(const x of legal){
  const original=priorLegal.find(y=>y.id===x.predecessor_legal_issue_id);
  requireThat(original&&x.id==="F04F-CASE-"+original.id.slice("E04E-LEGAL-".length)&&
   x.source_identity_id===original.predecessor_identity_id&&
   x.official_citation===original.primary_reference&&
   x.distinct_qualifier===original.qualifying_reference&&
   x.primary_source_url===original.official_legal_source_url&&
   x.actual_controlling_2026_instrument_sha256===null&&x.legal_effect_asof===null&&
   x.independent_qualified_counsel_identity===null&&x.counsel_decision_signature===null&&
   x.official_delegation_verified===false&&x.legal_identity_finalized===false&&
   x.reporting_power_inferred===false&&
   x.adjudication_or_oversight_override_inferred===false&&
   x.source_status==="unratified_preliminary_research",
   "qualified institutional or legal review cannot be silently asserted");
 }
 return {status:"eleven_pinned_originals_pending_replay_and_institutional_archive",
  models,counts:{source_receipts:11,original_04b:7,original_04d:4,
   excluded_unavailable_originals:2,VA_directory:22,VA_extra_named_leads:3,
   VA_source_bounded_candidates:25,VA_verified_first_level_denominator:null,
   legal_review_packets:6,verified_operational_custody_gates:0,ADL1_certifications:0}};
}
