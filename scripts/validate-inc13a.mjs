#!/usr/bin/env node
// INC-13A strictly read-only structural qualification gate and source input loader.
import fs from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname,join} from "node:path";
import {validateINC13A,projectINC13A} from "./inc13a-validation-core.mjs";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>JSON.parse(fs.readFileSync(join(ROOT,path),"utf8"));
const F=name=>"model/federal/"+name+".json";
export function loadINC13A(){
 const names=["coverage/source-snapshots","department-structure/source-snapshots","expansion/snapshots"];
 return {
  manifest:read(F("manifest")),
  schema:read("schemas/inc13a-adl1.schema.json"),
  models:{gates:read(F("inc13a-gates")),pilots:read(F("inc13a-pilots"))},
  legacyGates:read(F("inc04e/qualification-gates")),
  canonical:read(F("executive-departments")),
  inc12:{identities:read(F("x12-identities")),observations:read(F("x12-observations")),scopes:read(F("x12-scopes"))},
  snapshots:names.flatMap(name=>read(F(name)).items)
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const model=loadINC13A(),result=validateINC13A(model);
 if(result.errors.length){console.error(JSON.stringify(result,null,2));process.exitCode=1;}
 else if(process.argv[2]==="--view"){
  try{console.log(JSON.stringify(projectINC13A(model,process.argv[3]),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
 }else if(process.argv.length>2){console.error("Unknown INC13A operation");process.exitCode=2;}
 else console.log(JSON.stringify(result,null,2));
}
