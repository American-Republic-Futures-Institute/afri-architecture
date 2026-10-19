#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateINC13,projectINC13} from "./inc13-validation-core.mjs";
const J=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export function loadINC13(){
 const data=Object.fromEntries(FAMILIES.map(f=>[f,J("model/federal/x13-"+f+".json")]));
 return {manifest:J("model/federal/manifest.json"),
  schema:J("schemas/inc13-eop-independent.schema.json"),data,
  canonical:[...J("model/federal/executive-leadership.json").items,
    ...J("model/federal/executive-independent.json").items],
  x12scopes:J("model/federal/x12-scopes.json").items};
}
if(process.argv[1]?.endsWith("/validate-inc13.mjs")){
 const snapshot=loadINC13(),report=validateINC13(snapshot);
 if(report.errors.length){console.error(JSON.stringify(report,null,2));process.exitCode=1;}
 else if(process.argv[2]==="--view"){
  try{console.log(JSON.stringify(projectINC13(snapshot,process.argv[3]),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
 }else console.log(JSON.stringify(report,null,2));
}
