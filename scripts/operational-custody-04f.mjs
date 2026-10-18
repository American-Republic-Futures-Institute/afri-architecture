#!/usr/bin/env node
// ARFI 04F: model-level audit, artifact source replay and unsigned contingency staging only.
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {FAMILIES,PATHS,PREDECESSORS,inspect04FSchema,validate04F}
 from "./validate-operational-custody-04f-core.mjs";
import {replay04FOriginals,verify04FBundle,createUnsigned04FIndex}
 from "./replay-originals-04f-core.mjs";
import {canonical} from "./verify-institutional-trust-04e-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=async filename=>JSON.parse(await fs.readFile(path.join(root,filename),"utf8"));
const model=Object.fromEntries(await Promise.all([...PATHS,...PREDECESSORS].map(async p=>[p,await read(p)])));
const schema=await read("schemas/evidence-custody-04f.schema.json");
const result=validate04F(await read("model/federal/manifest.json"),model,schema);
const queue=result.models["custody-source-queue"];
const [cmd,...args]=process.argv.slice(2);
if(cmd==="--validate"||cmd===undefined){
 console.log(JSON.stringify({status:result.status,counts:result.counts},null,2));
}else if(cmd==="--schema"){
 const x=inspect04FSchema(schema,model);
 if(x.errors.length)throw Error("04F schema invalid: "+x.errors.join("; "));
 console.log(JSON.stringify({schema_valid:true,collections:x.families},null,2));
}else if(cmd==="--view"&&args.length===1){
 const name=args[0],allowed={
  sources:"custody-source-queue",exceptions:"unavailable-originals",
  gates:"custody-acceptance-gates",candidates:"va-first-level-candidates",
  legal:"va-legal-review-packets"};
 if(!allowed[name])throw Error("view must be sources|exceptions|gates|candidates|legal");
 console.log(JSON.stringify({view:name,items:result.models[allowed[name]],certified:false},null,2));
}else if(cmd==="--propose-index"&&args.length===0){
 const x=createUnsigned04FIndex(queue);
 process.stdout.write(canonical(x));
}else if(cmd==="--stage"&&args.length===3){
 const x=await replay04FOriginals({input04B:path.resolve(args[0]),
  input04D:path.resolve(args[1]),output:path.resolve(args[2]),queue});
 console.log(JSON.stringify(x,null,2));
}else if(cmd==="--verify"&&args.length===1){
 console.log(JSON.stringify(await verify04FBundle({directory:path.resolve(args[0]),queue}),null,2));
}else if(cmd==="--release-readiness"&&args.length===0){
 console.log(JSON.stringify({release_ready:false,
  missing_governance:"authorized governing board retention resolution and offline-root enrollment",
  missing_storage:"approved primary+replica immutable object versions for eleven pinned SHA256 sources",
  missing_audit:"independently authenticated S3 data-event delivery and recovery qualification",
  missing_review:"qualified counsel review of six cases and 2026 as-of VA first-level denominator",
  VA_ADL1_certified:false},null,2));
}else throw Error("Usage: node scripts/operational-custody-04f.mjs --validate|--schema|--view sources|exceptions|gates|candidates|legal|--propose-index|--stage EXTRACTED_04B EXTRACTED_04D NEW_OUTPUT|--verify STAGED_OUTPUT|--release-readiness");
