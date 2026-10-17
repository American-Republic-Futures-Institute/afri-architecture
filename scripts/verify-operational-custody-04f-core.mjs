// ARFI 04F: read-only primary/replica qualification, scoped only to the 11 pinned publisher originals.
// Does not create source objects or assert that an assigned human has legal authority.
import {createHash} from "node:crypto";
import {verifyS3WormOriginal} from "./verify-live-s3-worm-04e-core.mjs";
const HASH=/^[a-f0-9]{64}$/;
const sha=b=>createHash("sha256").update(b).digest("hex");
const fail=m=>{throw Error("04F operational qualification rejected: "+m);};
const check=(x,m)=>{if(!x)fail(m);};
const record=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const key=h=>"sha256/"+h.slice(0,2)+"/"+h;
const isDate=x=>typeof x==="string"&&Number.isFinite(Date.parse(x));
function storagePolicy(x,what){
 check(record(x)&&/^[0-9]{12}$/.test(x.account_id||"")&&
  typeof x.bucket==="string"&&x.bucket.length>3&&
  /^[a-z]{2}-[a-z]+-[0-9]{1,2}$/.test(x.region||"")&&
  typeof x.kms_key_arn==="string"&&x.kms_key_arn.startsWith(
   "arn:aws:kms:"+x.region+":"+x.account_id+":key/"),
  "approved "+what+" storage identity must come from signed institutional policy");
}
export function checkOperationalReleaseScope({queue,trustedDecision,releaseApproval,releaseIndex}){
 check(trustedDecision?.institutional_trust_root_verified===true&&
  trustedDecision?.decision?.ratified===true,
  "externally pinned, root-signed institutional decision required");
 check(releaseApproval?.cryptographic_approvals_verified===2&&
  HASH.test(releaseApproval.release_manifest_sha256||""),
  "two role-independent signed release approvals required");
 check(record(releaseIndex)&&releaseIndex.release_version==="ARFI-EVIDENCE-04E-v1"&&
  releaseIndex.policy_id===trustedDecision.decision.retention_policy_id,
  "release index is not bound to ratified institutional retention");
 const primary=trustedDecision.decision.approved_storage,replica=trustedDecision.decision.approved_replica;
 storagePolicy(primary,"primary");storagePolicy(replica,"replica");
 check(replica.account_id!==primary.account_id&&replica.bucket!==primary.bucket&&
  replica.kms_key_arn!==primary.kms_key_arn&&
  trustedDecision.decision.require_independent_replica===true&&
  trustedDecision.decision.require_storage_data_event_audit===true,
  "replica must be separately controlled and auditable, not the same primary credentials");
 check(Array.isArray(queue)&&queue.length===11&&new Set(queue.map(x=>x.source_id)).size===11&&
  new Set(queue.map(x=>x.SHA256)).size===11,
  "exact eleven historical original-source receipts required");
 check(Array.isArray(releaseIndex.sources)&&releaseIndex.sources.length===11&&
  Array.isArray(releaseApproval.approved_source_refs)&&
  JSON.stringify(releaseApproval.approved_source_refs)===JSON.stringify(releaseIndex.sources),
  "signed custodian/legal release source IDs must exactly bind live source index");
 const approved=new Map(releaseIndex.sources.map(x=>[x.source_id,x]));
 check(approved.size===11,"duplicate source IDs in signed release inventory");
 for(const source of queue){
  const r=approved.get(source.source_id);
  check(r&&r.sha256===source.SHA256&&HASH.test(r.sha256)&&
   r.bytes===source.byte_count&&r.object_key===key(source.SHA256)&&
   r.source_id===source.source_id&&
   typeof r.version_id==="string"&&r.version_id.length>=3&&
   r.version_id!=="null"&&
   typeof r.replica_version_id==="string"&&r.replica_version_id.length>=3&&
   r.replica_version_id!=="null",
   "signed release index cannot alter historical source bytes or skip protected version IDs: "+source.source_id);
 }
 check(isDate(trustedDecision.decision.minimum_retain_until),
  "institutional retention deadline not ratified");
 return {primary,replica,sources:queue};
}
export async function verifyElevenPrimaryAndReplicaVersions({
 queue,trustedDecision,releaseApproval,releaseIndex,primaryApi,replicaApi,
 now=new Date().toISOString()
}){
 const scope=checkOperationalReleaseScope({queue,trustedDecision,releaseApproval,releaseIndex});
 check(primaryApi&&replicaApi&&primaryApi!==replicaApi,
  "independently credentialed primary and replica provider sessions required");
 const index=new Map(releaseIndex.sources.map(x=>[x.source_id,x]));
 const proofs=[];
 for(const row of [...queue].sort((a,b)=>a.source_id.localeCompare(b.source_id))){
  const s=index.get(row.source_id);
  const common={key:s.object_key,expectedSha256:row.SHA256,expectedBytes:row.byte_count,
   minimumRetainUntil:trustedDecision.decision.minimum_retain_until};
  const source=await verifyS3WormOriginal({api:primaryApi,locator:{
   ...common,accountId:scope.primary.account_id,bucket:scope.primary.bucket,
   region:scope.primary.region,kmsKeyArn:scope.primary.kms_key_arn,versionId:s.version_id
  },now});
  const recovery=await verifyS3WormOriginal({api:replicaApi,locator:{
   ...common,accountId:scope.replica.account_id,bucket:scope.replica.bucket,
   region:scope.replica.region,kmsKeyArn:scope.replica.kms_key_arn,versionId:s.replica_version_id
  },now});
  check(source.content_sha256===recovery.content_sha256&&source.account_id!==recovery.account_id,
   "primary and independent replica must have matching source bytes and independent versions");
  proofs.push({source_id:row.source_id,sha256:row.SHA256,original_bytes:row.byte_count,
   primary:{account:source.account_id,bucket:source.bucket,version_id:source.version_id,
    retention_until:source.retention_until,read_verified_at:source.verified_at},
   replica:{account:recovery.account_id,bucket:recovery.bucket,version_id:recovery.version_id,
    retention_until:recovery.retention_until,read_verified_at:recovery.verified_at}});
 }
 return {
  receipt_version:"ARFI-04F-READONLY-PRIMARY-REPLICA-RESULT-v1",verified_at:now,
  source_count:proofs.length,bytes_per_storage_copy:queue.reduce((sum,x)=>sum+x.byte_count,0),
  live_original_bytes_verified:proofs.length,live_replica_bytes_verified:proofs.length,
  signed_custodian_legal_release_index_sha256:releaseApproval.release_manifest_sha256,
  separate_account_immutable_source_recovery_verified:true,
  data_event_audit_integrity_verified:false,exact_object_data_event_coverage_verified:false,
  outage_recovery_exercise_independently_signed:false,
  legal_signer_professional_qualification_independently_verified:false,
  institutional_record_certified:false,VA_ADL1_certified:false,
  sources:proofs
 };
}
const int=x=>Number.isInteger(+x)&&+x>=0?+x:null;
// CloudTrail validate-logs cryptographically validates stored log/digest chains using AWS CLI.
// A successful chain alone DOES NOT prove events for the eleven individual object versions.
export function inspectCloudTrailValidationOutput({output,trailArn,startTime,endTime}){
 check(typeof output==="string"&&output.length>100&&typeof trailArn==="string"&&
  /^arn:aws:cloudtrail:[a-z0-9-]+:[0-9]{12}:trail\/[A-Za-z0-9_.-]+$/.test(trailArn)&&
  isDate(startTime)&&isDate(endTime)&&Date.parse(endTime)>Date.parse(startTime),
  "scoped CloudTrail validation command and period required");
 check(output.includes("Validating log files for trail "+trailArn)&&
  !/\bINVALID\b|signature verification failed|cannot be validated|not found/i.test(output),
  "AWS CloudTrail digest/log validation reported invalid data");
 const digest=output.match(/(\d+)\/(\d+) digest files valid/i);
 const logs=output.match(/(\d+)\/(\d+) log files valid/i);
 check(digest&&logs&&int(digest[1])>0&&int(logs[1])>0&&
  digest[1]===digest[2]&&logs[1]===logs[2],
  "all nonempty CloudTrail digest and log files in the window must validate");
 return {trail_arn:trailArn,start_time:startTime,end_time:endTime,
  crypto_digest_chain_reported_valid:true,digest_files:+digest[1],log_files:+logs[1],
  exact_eleven_object_events_verified:false,independent_audit_approval_verified:false};
}
function fieldIncludes(fields,name,test){
 const item=fields?.find(x=>x.Field===name);
 return item&&Object.entries(test).every(([k,value])=>Array.isArray(item[k])&&item[k].includes(value));
}
export function inspectCloudTrailObjectDataSelectors({selectors,bucket}){
 check(typeof bucket==="string"&&bucket.length>3,"expected audit source bucket missing");
 const broadArn="arn:aws:s3:::"+bucket+"/";
 const adv=selectors?.AdvancedEventSelectors||[];
 const advance=adv.some(x=>fieldIncludes(x.FieldSelectors,"eventCategory",{Equals:"Data"})&&
  fieldIncludes(x.FieldSelectors,"resources.type",{Equals:"AWS::S3::Object"})&&
  x.FieldSelectors.some(y=>y.Field==="resources.ARN"&&
   (y.StartsWith?.includes(broadArn)||y.Equals?.includes(broadArn)))&&
  // A read-only or event-name filtered trail cannot prove all original writes/reads.
  !x.FieldSelectors.some(y=>y.Field==="eventName"||
   y.Field==="readOnly"&&
   !(y.Equals?.includes("true")&&y.Equals?.includes("false"))));
 const older=selectors?.EventSelectors||[];
 const legacy=older.some(x=>x.ReadWriteType==="All"&&x.IncludeManagementEvents!==undefined&&
  x.DataResources?.some(r=>r.Type==="AWS::S3::Object"&&r.Values?.includes(broadArn)));
 check(advance||legacy,
  "CloudTrail source data-event selectors do not demonstrably cover all S3 original-source object keys");
 return {expected_bucket:bucket,configuration_has_S3_object_data_event_scope:true,
  actual_object_version_events_independently_inspected:false};
}
export function mark04FPrequalificationOnly({storage,audit,selectorPrimary,selectorReplica}){
 check(storage?.source_count===11&&storage.live_original_bytes_verified===11&&
  storage.live_replica_bytes_verified===11&&
  audit?.crypto_digest_chain_reported_valid===true&&
  selectorPrimary?.configuration_has_S3_object_data_event_scope===true&&
  selectorReplica?.configuration_has_S3_object_data_event_scope===true,
  "operational evidence lacks a read-only custody or audit prerequisite");
 return {
  archive_prequalification:"eleven_original_bytes_two_accounts_and_CLI_digest_verified",
  signing_key_independence_claim_only:false,source_hashes_verified:11,
  CloudTrail_original_object_events_verified:false,
  independently_rehearsed_regional_or_provider_outage:false,
  institutional_governance_qualified:false,permanent_archive_promotion_authorized:false,
  signed_institutional_custody_receipt:null,ADL1_certified:false
 };
}
