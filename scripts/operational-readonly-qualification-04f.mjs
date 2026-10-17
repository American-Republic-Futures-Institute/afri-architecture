#!/usr/bin/env node
// Privileged operator read-only qualification. This does NOT create archive objects, sign data or certify ADL-1.
// Run outside GitHub CI using explicitly approved human-provisioned credentials and externally transferred root hash.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";
import {verifyGovernanceTrustDecision,verifySeparatedReleaseApprovals}
 from "./verify-institutional-trust-04e-core.mjs";
import {createReadOnlyAwsCliAdapter} from "./verify-live-s3-worm-04e-core.mjs";
import {verifyElevenPrimaryAndReplicaVersions,inspectCloudTrailValidationOutput,
 inspectCloudTrailObjectDataSelectors} from "./verify-operational-custody-04f-core.mjs";
import {FAMILIES,PATHS,PREDECESSORS,validate04F}
 from "./validate-operational-custody-04f-core.mjs";
const cli=promisify(execFile);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const config=async p=>JSON.parse(await fs.readFile(path.join(root,p),"utf8"));
const model=Object.fromEntries(await Promise.all([...PATHS,...PREDECESSORS].map(async p=>[p,await config(p)])));
const schema=await config("schemas/evidence-custody-04f.schema.json");
const checked=validate04F(await config("model/federal/manifest.json"),model,schema);
const [command,...args]=process.argv.slice(2);
const profile=s=>{
 if(typeof s!=="string"||!/^[A-Za-z0-9_.-]{1,100}$/.test(s))throw Error("approved AWS CLI profile name required");
 return s;
};
function rootFingerprint(){
 const value=process.env.ARFI_TRUST_ROOT_SHA256;
 if(!value||!/^[a-f0-9]{64}$/.test(value))throw Error("ARFI_TRUST_ROOT_SHA256 must be independently established outside decision JSON and this repository");
 return value;
}
function readAWSArgs(region,awsProfile){
 return ["--region",region,"--profile",profile(awsProfile),"--output","json","--no-cli-pager"];
}
if(command==="--verify-provider"&&args.length===7){
 const [decisionPath,signaturePath,pemPath,releasePath,approvalsPath,primaryProfile,replicaProfile]=args;
 if(primaryProfile===replicaProfile)throw Error("distinct approved AWS CLI profiles required for two custodial accounts");
 const decisionBytes=await fs.readFile(path.resolve(decisionPath));
 const trust=verifyGovernanceTrustDecision({decisionBytes,
  rootSignatureBase64:(await fs.readFile(path.resolve(signaturePath),"utf8")).trim(),
  rootPublicKeyPem:await fs.readFile(path.resolve(pemPath),"utf8"),
  externallyPinnedRootFingerprint:rootFingerprint()});
 const releaseIndexBytes=await fs.readFile(path.resolve(releasePath));
 const releaseApproval=verifySeparatedReleaseApprovals({trustedDecision:trust,
  releaseIndexBytes,approvals:JSON.parse(await fs.readFile(path.resolve(approvalsPath)))});
 const releaseIndex=JSON.parse(releaseIndexBytes);
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),"arfi-04f-live-"));
 try{
  await fs.mkdir(path.join(temp,"primary"));await fs.mkdir(path.join(temp,"replica"));
  const primaryApi=createReadOnlyAwsCliAdapter({region:trust.decision.approved_storage.region,
   accountId:trust.decision.approved_storage.account_id,profile:profile(primaryProfile),
   outputDir:path.join(temp,"primary")});
  const replicaApi=createReadOnlyAwsCliAdapter({region:trust.decision.approved_replica.region,
   accountId:trust.decision.approved_replica.account_id,profile:profile(replicaProfile),
   outputDir:path.join(temp,"replica")});
  const proof=await verifyElevenPrimaryAndReplicaVersions({
   queue:checked.models["custody-source-queue"],trustedDecision:trust,
   releaseApproval,releaseIndex,primaryApi,replicaApi});
  console.log(JSON.stringify(proof,null,2));
 }finally{await fs.rm(temp,{recursive:true,force:true});}
}else if(command==="--audit-trail"&&args.length===5){
 const [trailArn,startTime,endTime,bucket,awsProfile]=args;
 const match=/^arn:aws:cloudtrail:([a-z0-9-]+):([0-9]{12}):trail\/[A-Za-z0-9_.-]+$/.exec(trailArn);
 if(!match)throw Error("valid explicit CloudTrail ARN required");
 if(!Number.isFinite(Date.parse(startTime))||!Number.isFinite(Date.parse(endTime))||
   Date.parse(startTime)>=Date.parse(endTime))throw Error("complete bounded UTC log validation period required");
 if(!/^[a-z0-9][a-z0-9.-]{2,62}$/.test(bucket))throw Error("trusted audit bucket name required");
 const region=match[1],argsAWS=readAWSArgs(region,awsProfile);
 const options={timeout:240000,maxBuffer:16*1024*1024,
  env:{...process.env,AWS_PAGER:"",AWS_EC2_METADATA_DISABLED:"true"}};
 const get=async a=>(await cli("aws",a,options)).stdout;
 const identity=JSON.parse(await get(["sts","get-caller-identity",...argsAWS]));
 if(identity.Account!==match[2])throw Error("CloudTrail validation credential must match explicit trail account");
 const selectors=JSON.parse(await get(["cloudtrail","get-event-selectors",
  "--trail-name",trailArn,...argsAWS]));
 const scope=inspectCloudTrailObjectDataSelectors({selectors,bucket});
 // AWS CLI validates the original signed CloudTrail digest/log chain in the publisher's S3 delivery location.
 const output=await get(["cloudtrail","validate-logs","--trail-arn",trailArn,
  "--start-time",startTime,"--end-time",endTime,
  "--verbose","--region",region,"--profile",profile(awsProfile)]);
 const proof=inspectCloudTrailValidationOutput({output,trailArn,startTime,endTime});
 console.log(JSON.stringify({audit_account:identity.Account,...scope,...proof,
  eleven_object_specific_events_verified:false,independent_auditor_signature_present:false,
  source_release_approved:false},null,2));
}else throw Error("Usage: node scripts/operational-readonly-qualification-04f.mjs --verify-provider DECISION_JSON ROOT_SIGNATURE ROOT_PEM SIGNED_RELEASE_JSON APPROVALS_JSON PRIMARY_PROFILE REPLICA_PROFILE | --audit-trail TRAIL_ARN START_UTC END_UTC SOURCE_BUCKET AUDITOR_AWS_PROFILE");
