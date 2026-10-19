#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateINC12,projectINC12} from "./inc12-validation-core.mjs";
const J=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const path=f=>"model/federal/"+f+".json";
export const REF_PATHS=["legislative","executive-leadership","executive-departments","executive-independent","judiciary"];
export const OBSERVATION_PATHS={
 census:"coverage/components",
 department_chart:"department-structure/units",
 department_seed:"expansion/department-seeds",
 crossbranch_seed:"expansion/crossbranch-seeds"
};
export const RELATION_PATHS={
 census:"coverage/relationships",
 department_chart:"department-structure/relationships",
 expansion:"expansion/relationships"
};
export const SNAPSHOT_PATHS=["coverage/source-snapshots","department-structure/source-snapshots","expansion/snapshots"];
export function loadINC12(){
 return {manifest:J(path("manifest")),schema:J("schemas/inc12-institutional-census.schema.json"),
  data:Object.fromEntries(FAMILIES.map(f=>[f,J(path("x12-"+f))])),
  canonical:REF_PATHS.flatMap(p=>J(path(p)).items),
  originals:{
   references:J(path("coverage/institution-references")).items,
   observations:Object.fromEntries(Object.entries(OBSERVATION_PATHS).map(([k,p])=>[k,J(path(p)).items])),
   granules:J(path("department-structure/govman-roots")).items,
   events:[...J(path("dod/name-events")).items,...J(path("inc04d/temporal-events")).items]
  },
  relations:Object.fromEntries(Object.entries(RELATION_PATHS).map(([k,p])=>[k,J(path(p)).items])),
  snapshots:SNAPSHOT_PATHS.flatMap(p=>J(path(p)).items)};
}
if(process.argv[1]?.endsWith("/validate-inc12.mjs")){
 const m=loadINC12(),report=validateINC12(m);
 if(report.errors.length){console.error(JSON.stringify(report,null,2));process.exitCode=1;}
 else if(process.argv[2]==="--view"){
  try{console.log(JSON.stringify(projectINC12(m.data,process.argv[3],process.argv[4]||null),null,2));}
  catch(e){console.error(e.message);process.exitCode=1;}
 }else console.log(JSON.stringify(report,null,2));
}
