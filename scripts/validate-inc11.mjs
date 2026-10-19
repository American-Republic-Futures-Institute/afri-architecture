#!/usr/bin/env node
import fs from "node:fs";
import {INC11_FAMILIES,validateINC11,projectINC11} from "./inc11-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export const INC11_REFERENCE_PATHS=[
 "model/federal/legislative.json","model/federal/executive-departments.json",
 "model/federal/x06-actors.json","model/federal/x06-accounts.json",
 "model/federal/x06-enactments.json","model/federal/x06-controls.json",
 "model/federal/x07-controls.json","model/federal/x05-statutes.json",
 "model/federal/statutory-provisions.json"
];
export const INC11_SOURCE_PATHS=[
 "model/federal/x06-sources.json","model/federal/x07-sources.json",
 "model/federal/x05-sources.json","model/federal/statutory-sources.json"
];
export function loadInc11(){
 return {manifest:read("model/federal/manifest.json"),
  schema:read("schemas/inc11-office-policy-authority.schema.json"),
  collections:Object.fromEntries(INC11_FAMILIES.map(f=>[f,read("model/federal/x11-"+f+".json")])),
  recordIndex:new Map(INC11_REFERENCE_PATHS.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
  sourceIndex:new Map(INC11_SOURCE_PATHS.flatMap(p=>read(p).items.map(x=>[x.id,x])))};
}
if(process.argv[1]?.endsWith("/validate-inc11.mjs")){
 const data=loadInc11(),result=validateINC11(data);
 if(result.errors.length){console.error(JSON.stringify(result,null,2));process.exitCode=1;}
 else if(process.argv[2]==="--view"){
  try{console.log(JSON.stringify(projectINC11(data.collections,process.argv[3]),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
 }else console.log(JSON.stringify({...result,status:"unratified_research_pass"},null,2));
}
