#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,CONTEXT,inspect04DSchema,validateVA04D,verifyOriginal04DBytes
} from "./validate-va-04d-core.mjs";
import {releaseBlockers} from "./controlled-release-04d-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries([...PATHS,...CONTEXT].map(p=>[p,read(p)]));
const schema=read("schemas/va-evidence-04d.schema.json");
const m=read("model/federal/manifest.json");
const [mode,argument]=process.argv.slice(2);
if(mode==="--schema"){
 const result=inspect04DSchema(schema,files);
 if(result.errors.length)throw Error(result.errors.join("\n"));
 console.log(JSON.stringify({status:"schema_2020_12_strict",families:result.families},null,2));
}else{
 const v=validateVA04D(m,files,schema);
 if(!mode||mode==="--validate"){
  console.log(JSON.stringify({status:v.status,counts:v.counts},null,2));
 }else if(mode==="--release-readiness"){
  const problems=releaseBlockers(v.data["trust-gates"][0],
   v.data["review-approvals"],v.data["observed-source-receipts"]);
  console.log(JSON.stringify({release_ready:problems.length===0,unresolved_prerequisites:problems},null,2));
 }else if(mode==="--verify-originals"&&argument){
  console.log(JSON.stringify(await verifyOriginal04DBytes(path.resolve(argument),
   v.data["observed-source-receipts"]),null,2));
 }else throw Error("Usage: node scripts/validate-va-04d.mjs [--validate|--schema|--release-readiness|--verify-originals EXTRACTED_ARTIFACT_DIR]");
}
