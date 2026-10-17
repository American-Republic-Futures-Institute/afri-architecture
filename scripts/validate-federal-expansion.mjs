#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EXPANSION_MODEL_PATHS,EXPANSION_CONTEXT_PATHS,
 validateFederalExpansion,projectFederalExpansion} from "./federal-expansion-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries([...EXPANSION_MODEL_PATHS,...EXPANSION_CONTEXT_PATHS].map(p=>[p,read(p)]));
const manifest=read("model/federal/manifest.json");
const schema=read("schemas/federal-expansion.schema.json");
const data=validateFederalExpansion(manifest,files,schema);
const a=process.argv.slice(2);
if(a.length===0||a.length===1&&a[0]==="--validate"){
 console.log(JSON.stringify({status:data.status,counts:data.counts,
  family_denominators:data.totals,denominator_scope:data.denominator_scope,
  adl1_verified:0,website_published:false},null,2));
}else if((a.length===2||a.length===4)&&a[0]==="--view"&&
         (a.length===2||a[2]==="--root")){
 console.log(JSON.stringify(projectFederalExpansion(data,a[1],a.length===4?a[3]:null),null,2));
}else throw Error("Usage: node scripts/validate-federal-expansion.mjs [--validate | --view VIEW-EXP-ID [--root ORG-FED-EXE-DEP-ID]]");
