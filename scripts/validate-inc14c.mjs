#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateINC14C,projectINC14C} from "./inc14c-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export function loadINC14C(){
 const data=Object.fromEntries(FAMILIES.map(f=>[f,read("model/federal/x14c-"+f+".json")]));
 return {
  manifest:read("model/federal/manifest.json"),
  schema:read("schemas/inc14c-congressional-authority.schema.json"),
  data,
  legislative:read("model/federal/legislative.json").items,
  priorUnits:read("model/federal/x14-nodes.json").items,
  priorCoverage:read("model/federal/x14-coverage.json").items,
  priorDOD:read("model/federal/dod/congressional-committees.json").items
 };
}
if(process.argv[1]?.endsWith("/validate-inc14c.mjs")){
 try{
  const s=loadINC14C(),report=validateINC14C(s);
  console.log(JSON.stringify(process.argv[2]==="--view"?projectINC14C(s,process.argv[3]):report,null,2));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
