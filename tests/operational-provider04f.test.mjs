import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {checkOperationalReleaseScope,verifyElevenPrimaryAndReplicaVersions,
 inspectCloudTrailValidationOutput,inspectCloudTrailObjectDataSelectors,
 mark04FPrequalificationOnly} from "../scripts/verify-operational-custody-04f-core.mjs";
const hash=b=>createHash("sha256").update(b).digest("hex");
function fixture(){
 const bytes=Array.from({length:11},(_,i)=>Buffer.from(("ARFI synthetic government source "+i+" ").repeat(8)));
 const queue=bytes.map((b,i)=>{const h=hash(b);return {
  source_id:"F04F-MOCK-"+i,SHA256:h,byte_count:b.length,object_key:"sha256/"+h.slice(0,2)+"/"+h};});
 const decision={ratified:true,retention_policy_id:"ARFI-RATIFIED-TEST-01",
  require_independent_replica:true,require_storage_data_event_audit:true,
  minimum_retain_until:"2034-01-01T00:00:00Z",
  approved_storage:{account_id:"123456789012",bucket:"arfi-primary-proof",region:"us-east-1",
   kms_key_arn:"arn:aws:kms:us-east-1:123456789012:key/approved-primary"},
  approved_replica:{account_id:"234567890123",bucket:"arfi-replica-proof",region:"us-west-2",
   kms_key_arn:"arn:aws:kms:us-west-2:234567890123:key/approved-replica"}};
 const trustedDecision={institutional_trust_root_verified:true,decision};
 const sources=queue.map((q,i)=>({source_id:q.source_id,sha256:q.SHA256,bytes:q.byte_count,
  object_key:q.object_key,version_id:"primary-"+i,replica_version_id:"replica-"+i}));
 const releaseIndex={release_version:"ARFI-EVIDENCE-04E-v1",policy_id:decision.retention_policy_id,sources};
 const releaseApproval={cryptographic_approvals_verified:2,
  release_manifest_sha256:"a".repeat(64),approved_source_refs:sources};
 function api(which){
  const c=which==="primary"?decision.approved_storage:decision.approved_replica;
  const v=which==="primary"?"primary-":"replica-";
  return {
   getCallerIdentity:async()=>({Account:c.account_id}),
   getBucketVersioning:async()=>({Status:"Enabled"}),
   getObjectLockConfiguration:async()=>({ObjectLockConfiguration:{ObjectLockEnabled:"Enabled"}}),
   headObject:async q=>{const i=queue.findIndex(x=>x.object_key===q.Key);return {
    VersionId:v+i,ContentLength:queue[i].byte_count,ServerSideEncryption:"aws:kms",SSEKMSKeyId:c.kms_key_arn};},
   getObjectRetention:async()=>({Retention:{Mode:"COMPLIANCE",RetainUntilDate:"2039-01-01T00:00:00Z"}}),
   getObjectBytes:async q=>bytes[queue.findIndex(x=>x.object_key===q.Key)]
  };
 }
 return {bytes,queue,trustedDecision,releaseIndex,releaseApproval,
  primaryApi:api("primary"),replicaApi:api("replica")};
}
test("re-reads eleven WORM originals and eleven independent-account replicas, but does not certify archive",async()=>{
 const x=fixture(),r=await verifyElevenPrimaryAndReplicaVersions({...x,now:"2026-10-17T22:30:00Z"});
 assert.equal(r.live_original_bytes_verified,11);
 assert.equal(r.live_replica_bytes_verified,11);
 assert(r.sources.every(x=>x.primary.account!==x.replica.account));
 assert.equal(r.institutional_record_certified,false);
 assert.equal(r.data_event_audit_integrity_verified,false);
});
const deny=(name,mutate)=>test(name,()=>{
 const x=fixture();mutate(x);
 assert.throws(()=>checkOperationalReleaseScope(x),/04F operational qualification rejected/);
});
deny("signed root policy is required",x=>{x.trustedDecision.institutional_trust_root_verified=false;});
deny("two independent custodian/legal signatures are required",x=>{x.releaseApproval.cryptographic_approvals_verified=1;});
deny("replica AWS account cannot equal the primary account",x=>{
 x.trustedDecision.decision.approved_replica.account_id="123456789012";});
deny("replica cannot reuse primary storage bucket",x=>{
 x.trustedDecision.decision.approved_replica.bucket="arfi-primary-proof";});
deny("root-signed governance requires data event audit",x=>{
 x.trustedDecision.decision.require_storage_data_event_audit=false;});
deny("eleven original source records cannot be shortened",x=>{x.queue.pop();});
deny("signed release cannot change a 64-byte source digest",x=>{
 x.releaseIndex.sources[0].sha256="f".repeat(64);});
deny("release must provide exact non-null replica versions",x=>{
 x.releaseIndex.sources[1].replica_version_id=null;});
deny("source release policy ID must equal root-signed ratified retention",x=>{
 x.releaseIndex.policy_id="not-the-policy";});
deny("unversioned latest objects cannot qualify custody",x=>{
 x.releaseIndex.sources[0].version_id="null";});
test("modified replica original bytes fail provider's exact SHA-256 verification",async()=>{
 const x=fixture();x.replicaApi.getObjectBytes=async()=>Buffer.from("tampered");
 await assert.rejects(()=>verifyElevenPrimaryAndReplicaVersions({...x,now:"2026-10-17T22:30:00Z"}),
  /re-downloaded original bytes fail SHA-256/);
});
test("two storage roles cannot share a single provider adapter object",async()=>{
 const x=fixture();x.replicaApi=x.primaryApi;
 await assert.rejects(()=>verifyElevenPrimaryAndReplicaVersions({...x,now:"2026-10-17T22:30:00Z"}),
  /independently credentialed primary and replica/);
});
const arn="arn:aws:cloudtrail:us-east-1:123456789012:trail/ARFI-Evidence-Audit";
const startTime="2026-10-17T00:00:00Z",endTime="2026-10-18T00:00:00Z";
const output="Validating log files for trail "+arn+" between "+startTime+" and "+endTime+
 "\nResults found:\n4/4 digest files valid\n5/5 log files valid";
test("CloudTrail digest chain validation is cryptographically useful but not a per-object event attestation",()=>{
 const x=inspectCloudTrailValidationOutput({output,trailArn:arn,startTime,endTime});
 assert.equal(x.crypto_digest_chain_reported_valid,true);
 assert.equal(x.exact_eleven_object_events_verified,false);
});
test("CloudTrail validator rejects any invalid digest signature",()=>{
 assert.throws(()=>inspectCloudTrailValidationOutput({output:output+"\nINVALID: signature verification failed",
  trailArn:arn,startTime,endTime}),/04F operational qualification rejected/);
});
test("CloudTrail validator rejects 0 of 0 log files",()=>{
 assert.throws(()=>inspectCloudTrailValidationOutput({output:output.replace("5/5 log","0/0 log"),
  trailArn:arn,startTime,endTime}),/04F operational qualification rejected/);
});
test("legacy CloudTrail all-event bucket selector must cover full original prefix",()=>{
 const selectors={EventSelectors:[{ReadWriteType:"All",IncludeManagementEvents:true,
  DataResources:[{Type:"AWS::S3::Object",Values:["arn:aws:s3:::arfi-primary-proof/"]}]}]};
 assert.equal(inspectCloudTrailObjectDataSelectors({selectors,bucket:"arfi-primary-proof"})
  .configuration_has_S3_object_data_event_scope,true);
});
test("advanced CloudTrail data event selectors require eventCategory, object type and bucket ARN",()=>{
 const selectors={AdvancedEventSelectors:[{FieldSelectors:[
  {Field:"eventCategory",Equals:["Data"]},{Field:"resources.type",Equals:["AWS::S3::Object"]},
  {Field:"resources.ARN",StartsWith:["arn:aws:s3:::arfi-replica-proof/"]}
 ]}]};
 assert.equal(inspectCloudTrailObjectDataSelectors({selectors,bucket:"arfi-replica-proof"})
  .configuration_has_S3_object_data_event_scope,true);
 assert.throws(()=>inspectCloudTrailObjectDataSelectors({selectors,bucket:"different-bucket"}),
  /do not demonstrably cover/);
});
test("CloudTrail selector restricted to GetObject cannot prove primary writes",()=>{
 const fields=[{Field:"eventCategory",Equals:["Data"]},
  {Field:"resources.type",Equals:["AWS::S3::Object"]},
  {Field:"resources.ARN",StartsWith:["arn:aws:s3:::arfi-primary-proof/"]},
  {Field:"eventName",Equals:["GetObject"]}];
 assert.throws(()=>inspectCloudTrailObjectDataSelectors({
  selectors:{AdvancedEventSelectors:[{FieldSelectors:fields}]},bucket:"arfi-primary-proof"}),
  /do not demonstrably cover/);
});
test("CloudTrail readOnly=true selector cannot prove retention write events",()=>{
 const fields=[{Field:"eventCategory",Equals:["Data"]},
  {Field:"resources.type",Equals:["AWS::S3::Object"]},
  {Field:"resources.ARN",StartsWith:["arn:aws:s3:::arfi-primary-proof/"]},
  {Field:"readOnly",Equals:["true"]}];
 assert.throws(()=>inspectCloudTrailObjectDataSelectors({
  selectors:{AdvancedEventSelectors:[{FieldSelectors:fields}]},bucket:"arfi-primary-proof"}),
  /do not demonstrably cover/);
});
test("management-only CloudTrail without data-event selector cannot authorize archive",()=>{
 assert.throws(()=>inspectCloudTrailObjectDataSelectors({selectors:{
  EventSelectors:[{ReadWriteType:"All",IncludeManagementEvents:true,DataResources:[]}]
 },bucket:"arfi-primary-proof"}),/do not demonstrably cover/);
});
test("even complete mocked provider and CLI digest results yield technical prequalification only",()=>{
 const x=mark04FPrequalificationOnly({
  storage:{source_count:11,live_original_bytes_verified:11,live_replica_bytes_verified:11},
  audit:{crypto_digest_chain_reported_valid:true},
  selectorPrimary:{configuration_has_S3_object_data_event_scope:true},
  selectorReplica:{configuration_has_S3_object_data_event_scope:true}
 });
 assert.equal(x.permanent_archive_promotion_authorized,false);
 assert.equal(x.signed_institutional_custody_receipt,null);
 assert.equal(x.ADL1_certified,false);
});
