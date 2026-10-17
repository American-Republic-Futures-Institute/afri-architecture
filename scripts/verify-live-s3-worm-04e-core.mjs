// Increment 04E: authenticated, read-only AWS S3 Object Lock verifier.
// A JSON-only storage "receipt" is insufficient. Must perform live AWS API reads.
// No cloud object is provisioned, uploaded, mutated or deleted.
import {createHash} from "node:crypto";
import {promisify} from "node:util";
import {execFile} from "node:child_process";
const execFileAsync=promisify(execFile);
const HASH=/^[a-f0-9]{64}$/;
const BUCKET=/^(?!.*\.\.)(?!-)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
const ACCOUNT=/^[0-9]{12}$/;
const fail=msg=>{throw Error("04E immutable storage rejected: "+msg);};
const check=(v,msg)=>{if(!v)fail(msg);};
const sha256=b=>createHash("sha256").update(b).digest("hex");
function utcDate(value){
 const time=Date.parse(value);
 check(typeof value==="string"&&Number.isFinite(time)&&/(Z|[+-][0-9]{2}:[0-9]{2})$/.test(value),"UTC timestamp required");
 return time;
}
export function validateLocator(x){
 check(BUCKET.test(x?.bucket||"")&&!x.bucket.includes(".."),"invalid explicitly approved bucket");
 check(HASH.test(x?.expectedSha256||"")&&
  x.key==="sha256/"+x.expectedSha256.slice(0,2)+"/"+x.expectedSha256,
  "S3 object key must be a pinned content-addressed SHA-256 locator");
 check(typeof x.versionId==="string"&&x.versionId.length>=3&&
  x.versionId!=="null"&&x.versionId!=="undefined","non-null object version ID required");
 check(/^[a-z]{2}-[a-z]+-[0-9]{1,2}$/.test(x.region||""),"AWS region required");
 check(ACCOUNT.test(x.accountId||""),"explicit AWS account identity required");
 check(typeof x.kmsKeyArn==="string"&&
  x.kmsKeyArn.startsWith("arn:aws:kms:"+x.region+":"+x.accountId+":key/"),
  "approved customer-managed KMS key ARN required");
 check(Number.isSafeInteger(x.expectedBytes)&&x.expectedBytes>0&&x.expectedBytes<=134217728,
  "invalid source original byte length");
 utcDate(x.minimumRetainUntil);
 return true;
}
const trimDate=x=>x instanceof Date?x.toISOString():x;
export async function verifyS3WormOriginal({api,locator,now=new Date().toISOString()}){
 validateLocator(locator);
 check(api&&["getCallerIdentity","getBucketVersioning","getObjectLockConfiguration",
  "headObject","getObjectRetention","getObjectBytes"].every(x=>typeof api[x]==="function"),
  "authenticated provider adapter required");
 const asof=utcDate(now);
 const who=await api.getCallerIdentity();
 check(who?.Account===locator.accountId,"AWS credential account mismatch");
 const q={Bucket:locator.bucket,Key:locator.key,VersionId:locator.versionId,ExpectedBucketOwner:locator.accountId};
 const [v,lock,head,retention]=await Promise.all([
  api.getBucketVersioning({Bucket:locator.bucket,ExpectedBucketOwner:locator.accountId}),
  api.getObjectLockConfiguration({Bucket:locator.bucket,ExpectedBucketOwner:locator.accountId}),
  api.headObject(q),api.getObjectRetention(q)
 ]);
 check(v?.Status==="Enabled","versioning not enabled");
 check(lock?.ObjectLockConfiguration?.ObjectLockEnabled==="Enabled","bucket Object Lock disabled");
 const r=retention?.Retention;
 check(r?.Mode==="COMPLIANCE","retention is not compliance-mode Object Lock");
 const until=trimDate(r.RetainUntilDate);
 check(utcDate(until)>=utcDate(locator.minimumRetainUntil)&&utcDate(until)>asof,
  "object retention expired or below ratified policy");
 check(head?.VersionId===locator.versionId&&head.ContentLength===locator.expectedBytes,
  "object version or content length mismatch");
 check(head?.ServerSideEncryption==="aws:kms"&&head.SSEKMSKeyId===locator.kmsKeyArn,
  "encryption is not bound to expected AWS KMS key");
 const original=await api.getObjectBytes(q);
 check(Buffer.isBuffer(original)||original instanceof Uint8Array,"raw original source bytes required");
 const bytes=Buffer.from(original);
 check(bytes.length===locator.expectedBytes&&sha256(bytes)===locator.expectedSha256,
  "re-downloaded original bytes fail SHA-256 verification");
 return {
  provider:"AWS_S3_Object_Lock",method:"authenticated_read_of_exact_version",
  account_id:locator.accountId,region:locator.region,bucket:locator.bucket,
  key:locator.key,version_id:locator.versionId,content_sha256:locator.expectedSha256,
  bytes_verified:bytes.length,kms_key_arn:locator.kmsKeyArn,
  retention_mode:"COMPLIANCE",retention_until:until,
  verified_at:now,versioning_verified:true,object_lock_verified:true,customer_KMS_verified:true,
  institutional_legal_review_verified:false,source_as_of_2026_legal_status:false,
  VA_ADL1_certified:false,CloudTrail_data_events_verified:false,replica_verified:false
 };
}
const safeArg=s=>{
 check(typeof s==="string"&&s.length>0&&s.length<=1024&&
  !s.startsWith("-")&&!s.includes("\n"),"unsafe AWS CLI argument");
 return s;
};
export function createReadOnlyAwsCliAdapter({region,accountId,profile=null,outputDir,timeoutMs=90000}){
 check(/^[a-z]{2}-[a-z]+-[0-9]{1,2}$/.test(region||""),"AWS region required");
 check(ACCOUNT.test(accountId||""),"expected bucket owner account must be explicitly provided");
 check(typeof outputDir==="string"&&outputDir.startsWith("/")&&!outputDir.includes(".."),
  "operator-owned absolute output directory required");
 if(profile!==null)check(/^[A-Za-z0-9_.-]{1,100}$/.test(profile),"invalid AWS profile");
 const creds=profile?["--profile",profile]:[];
 async function cli(service,operation,params=[]){
  const args=[service,operation,...params,"--region",region,...creds,"--output","json"];
  try{
   const {stdout}=await execFileAsync("aws",args,{
    timeout:timeoutMs,maxBuffer:4*1024*1024,
    env:{...process.env,AWS_PAGER:"",AWS_EC2_METADATA_DISABLED:"true"}});
   return JSON.parse(stdout);
  }catch(e){fail("authenticated read failed "+service+"/"+operation+": "+String(e?.message||e).slice(0,210));}
 }
 const q=x=>["--bucket",safeArg(x.Bucket),"--key",safeArg(x.Key),
  "--version-id",safeArg(x.VersionId),"--expected-bucket-owner",safeArg(x.ExpectedBucketOwner)];
 let counter=0;
 return {
  getCallerIdentity:()=>cli("sts","get-caller-identity"),
  getBucketVersioning:x=>cli("s3api","get-bucket-versioning",["--bucket",safeArg(x.Bucket),"--expected-bucket-owner",safeArg(x.ExpectedBucketOwner)]),
  getObjectLockConfiguration:x=>cli("s3api","get-object-lock-configuration",["--bucket",safeArg(x.Bucket)]),
  headObject:x=>cli("s3api","head-object",q(x)),
  getObjectRetention:x=>cli("s3api","get-object-retention",q(x)),
  getObjectBytes:async x=>{
   const fs=await import("node:fs/promises");
   const path=await import("node:path");
   counter++;
   const output=path.join(outputDir,"arfi04e-"+process.pid+"-"+counter+".bin");
   try{
    const args=["s3api","get-object",...q(x),"--region",region,...creds,output];
    await execFileAsync("aws",args,{timeout:timeoutMs,maxBuffer:2*1024*1024,
     env:{...process.env,AWS_PAGER:"",AWS_EC2_METADATA_DISABLED:"true"}});
    return await fs.readFile(output);
   }catch(e){fail("S3 read-version failed: "+String(e?.message||e).slice(0,210));}
   finally{await fs.rm(output,{force:true}).catch(()=>{});}
  }
 };
}
