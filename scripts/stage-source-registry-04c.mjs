#!/usr/bin/env node
// Run against verified, extracted 04B artifact. Signing keys must remain OUTSIDE the repository.
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {stageRegistry,verifyRegistry,signRegistry} from "./durable-evidence-registry-04c-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const args=process.argv.slice(2);
const read=p=>fs.readFile(p,"utf8").then(JSON.parse);
const expected=(await read(path.join(root,"model/federal/inc04c/archive-index.json"))).items;
if(args[0]==="--stage"&&args.length===3){
 const data=await stageRegistry({captureDirectory:path.resolve(args[1]),outputDirectory:path.resolve(args[2]),expected});
 console.log(JSON.stringify({status:data.staging_status,stored:data.entries.length,blocked:data.missing.length},null,2));
}else if(args[0]==="--sign"&&args.length===4){
 const signingKey=await fs.readFile(path.resolve(args[2]),"utf8");
 console.log(JSON.stringify(await signRegistry({directory:path.resolve(args[1]),
  privateKeyPem:signingKey,signerId:args[3]}),null,2));
}else if(args[0]==="--verify"&&args.length>=2&&args.length<=4){
 const trustIndex=args.indexOf("--trust");
 const trust=trustIndex===-1?null:await read(path.resolve(args[trustIndex+1]));
 console.log(JSON.stringify(await verifyRegistry({directory:path.resolve(args[1]),expected,
  trustPolicy:trust,requireTrustedSignature:args.includes("--require-signature")}),null,2));
}else throw Error("Usage: node scripts/stage-source-registry-04c.mjs [--stage EXTRACTED_04B_ARTIFACT OUTPUT_DIR | --sign STAGED_DIR PRIVATE_KEY_FILE SIGNER_ID | --verify STAGED_DIR [--trust TRUST_POLICY] [--require-signature]]");
