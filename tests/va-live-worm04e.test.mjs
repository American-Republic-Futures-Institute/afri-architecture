import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {validateLocator,verifyS3WormOriginal
} from "../scripts/verify-live-s3-worm-04e-core.mjs";
const sha=b=>createHash("sha256").update(b).digest("hex");
const fixture=()=>{
 const original=Buffer.from("ARFI fixed-edition source response ".repeat(100),"utf8"),hash=sha(original);
 const locator={
  bucket:"arfi-evidence-originals",key:"sha256/"+hash.slice(0,2)+"/"+hash,
  versionId:"VERSION-EXTERNAL-0001",region:"us-east-1",accountId:"123456789012",
  expectedSha256:hash,expectedBytes:original.length,
  kmsKeyArn:"arn:aws:kms:us-east-1:123456789012:key/0000-1111-2222",
  minimumRetainUntil:"2032-01-01T00:00:00Z"
 };
 const api={
  getCallerIdentity:async()=>({Account:locator.accountId}),
  getBucketVersioning:async()=>({Status:"Enabled"}),
  getObjectLockConfiguration:async()=>({ObjectLockConfiguration:{ObjectLockEnabled:"Enabled"}}),
  headObject:async()=>({VersionId:locator.versionId,ContentLength:locator.expectedBytes,
   ServerSideEncryption:"aws:kms",SSEKMSKeyId:locator.kmsKeyArn}),
  getObjectRetention:async()=>({Retention:{Mode:"COMPLIANCE",RetainUntilDate:"2035-01-01T00:00:00Z"}}),
  getObjectBytes:async()=>original
 };
 return {locator,api,original};
};
const fails=(name,change,pattern=/04E immutable storage rejected/)=>test(name,async()=>{
 const x=fixture();change(x);
 await assert.rejects(()=>verifyS3WormOriginal({api:x.api,locator:x.locator,
  now:"2026-10-17T15:00:00Z"}),pattern);
});
test("AWS read-only API returns independent exact-version bytes, compliance lock and pinned KMS",async()=>{
 const f=fixture();
 assert.equal(validateLocator(f.locator),true);
 const r=await verifyS3WormOriginal({api:f.api,locator:f.locator,now:"2026-10-17T15:00:00Z"});
 assert.equal(r.bytes_verified,f.original.length);
 assert.equal(r.content_sha256,sha(f.original));
 assert.equal(r.object_lock_verified,true);
 assert.equal(r.retention_mode,"COMPLIANCE");
 assert.equal(r.CloudTrail_data_events_verified,false);
 assert.equal(r.replica_verified,false);
 assert.equal(r.VA_ADL1_certified,false);
});
fails("cannot supply unbounded object key unrelated to source digest",f=>{
 f.locator.key="misc/false-proof";
});
fails("cannot supply a null/suspended object version",f=>{
 f.locator.versionId="null";
});
fails("must reject accessing an unexpected AWS account",f=>{
 f.api.getCallerIdentity=async()=>({Account:"444444444444"});
});
fails("cannot accept versioning disabled even when source digest happens to match",f=>{
 f.api.getBucketVersioning=async()=>({Status:"Suspended"});
});
fails("cannot accept a bucket with Object Lock disabled",f=>{
 f.api.getObjectLockConfiguration=async()=>({ObjectLockConfiguration:{ObjectLockEnabled:"Disabled"}});
});
fails("cannot accept governance-mode locks which administrators can bypass",f=>{
 f.api.getObjectRetention=async()=>({Retention:{Mode:"GOVERNANCE",RetainUntilDate:"2035-01-01T00:00:00Z"}});
});
fails("cannot accept retention below independently approved minimum",f=>{
 f.api.getObjectRetention=async()=>({Retention:{Mode:"COMPLIANCE",RetainUntilDate:"2030-01-01T00:00:00Z"}});
});
fails("cannot accept expired retention deadline",f=>{
 f.api.getObjectRetention=async()=>({Retention:{Mode:"COMPLIANCE",RetainUntilDate:"2025-01-01T00:00:00Z"}});
});
fails("cannot accept different exact object version returned by S3",f=>{
 f.api.headObject=async()=>({VersionId:"VERSION-REPLACED",ContentLength:f.original.length,
   ServerSideEncryption:"aws:kms",SSEKMSKeyId:f.locator.kmsKeyArn});
});
fails("cannot accept S3-managed SSE in place of customer-controlled AWS KMS",f=>{
 f.api.headObject=async()=>({VersionId:f.locator.versionId,ContentLength:f.original.length,
   ServerSideEncryption:"AES256",SSEKMSKeyId:f.locator.kmsKeyArn});
});
fails("cannot substitute an unapproved KMS key while hiding behind same bucket name",f=>{
 f.api.headObject=async()=>({VersionId:f.locator.versionId,ContentLength:f.original.length,
   ServerSideEncryption:"aws:kms",SSEKMSKeyId:"arn:aws:kms:us-east-1:123456789012:key/untrusted"});
});
fails("must independently rehash retrieved ORIGINAL bytes rather than trust S3 head metadata",f=>{
 f.api.getObjectBytes=async()=>Buffer.concat([f.original,Buffer.from("tamper")]);
});
fails("a data-only JSON claim is not an authenticated provider API",f=>{
 f.api={provider_verified:true,objectLock:true};
});
fails("AWS account ID must be explicit and twelve digits",f=>{
 f.locator.accountId="000";
});
fails("a KMS key ARN in a different account fails pinning",f=>{
 f.locator.kmsKeyArn="arn:aws:kms:us-east-1:999999999999:key/abcdef";
});
