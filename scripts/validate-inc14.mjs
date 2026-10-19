#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateINC14,projectINC14} from "./inc14-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export function loadINC14(){
 const data=Object.fromEntries(FAMILIES.map(f=>[f,read("model/federal/x14-"+f+".json")]));
 return {manifest:read("model/federal/manifest.json"),
  schema:read("schemas/inc14-congressional-enterprise.schema.json"),data,
  legislative:read("model/federal/legislative.json").items,
  executive:read("model/federal/executive-leadership.json").items,
  x12scope:read("model/federal/x12-scopes.json").items.find(x=>x.family==="legislative"),
  dod:read("model/federal/dod/congressional-committees.json").items};
}
if(process.argv[1]?.endsWith("/validate-inc14.mjs")){
 try{
  const snap=loadINC14(),report=validateINC14(snap);
  if(process.argv[2]==="--view")console.log(JSON.stringify(projectINC14(snap,process.argv[3]),null,2));
  else console.log(JSON.stringify(report,null,2));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
