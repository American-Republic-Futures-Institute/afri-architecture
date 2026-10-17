#!/usr/bin/env node
// All options are read-only. No source archival write or signature generation occurs.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {fileURLToPath} from "node:url";
import {PATHS,UPSTREAM,validate04E,inspectSchema04E,projectVA04E} from "./validate-va-04e-core.mjs";
import {verifyGovernanceTrustDecision} from "./verify-institutional-trust-04e-core.mjs";
import {verifyS3WormOriginal,createReadOnlyAwsCliAdapter} from "./verify-live-s3-worm-04e-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries([...PATHS,...UPSTREAM].map(x=>[x,read(x)]));
const schema=read("schemas/va-evidence-04e.schema.json");
const model=validate04E(read("model/federal/manifest.json"),files,schema);
const [command,...args]=process.argv.slice(2);
if(!command||command==="--validate"){
 console.log(JSON.stringify({status:model.status,counts:model.counts},null,2));
}else if(command==="--schema"){
 const result=inspectSchema04E(schema,files);
 if(result.errors.length)throw Error(result.errors.join("\n"));
 console.log(JSON.stringify({status:"strict_JSON_Schema_2020_12_valid",families:result.families},null,2));
}else if(command==="--view"&&args.length===1){
 console.log(JSON.stringify(projectVA04E(model,args[0]),null,2));
}else if(command==="--trust-proof"&&args.length===3){
 // Fingerprint must be independently transferred from out-of-band governance process.
 const pinned=process.env.ARFI_TRUST_ROOT_SHA256;
 if(!pinned)throw Error("ARFI_TRUST_ROOT_SHA256 must be independently pinned by institutional custody");
 const result=verifyGovernanceTrustDecision({
  decisionBytes:await fsp.readFile(args[0]),
  rootSignatureBase64:(await fsp.readFile(args[1],"utf8")).trim(),
  rootPublicKeyPem:await fsp.readFile(args[2],"utf8"),
  externallyPinnedRootFingerprint:pinned
 });
 console.log(JSON.stringify({institutional_root_verified:true,resolution_id:result.decision.resolution_id,
  signer_ids:result.signers.map(x=>x.signer_id),decision_sha256:result.decision_sha256,
  WORM_storage_proven:false,VA_ADL1_certified:false},null,2));
}else if(command==="--s3-readonly"&&args.length>=1&&args.length<=2){
 if(!process.env.ARFI_TRUST_ROOT_SHA256)throw Error("externally pinned institutional root must be present");
 const locator=JSON.parse(await fsp.readFile(args[0],"utf8"));
 const temp=await fsp.mkdtemp(path.join(os.tmpdir(),"arfi04e-s3-"));
 try{
  const api=createReadOnlyAwsCliAdapter({region:locator.region,accountId:locator.accountId,profile:args[1]||null,outputDir:temp});
  const proof=await verifyS3WormOriginal({api,locator});
  console.log(JSON.stringify({...proof,release_qualification:"not_complete_requires_board_and_signatures"},null,2));
 }finally{await fsp.rm(temp,{recursive:true,force:true});}
}else throw Error("Usage: node scripts/arfi-evidence-ops-04e.mjs [--validate|--schema|--view legal|sources|qualification|governance|--trust-proof DECISION_JSON SIGNATURE_TXT ROOT_PUBLIC_PEM|--s3-readonly LOCATOR_JSON [AWS_PROFILE]]");
