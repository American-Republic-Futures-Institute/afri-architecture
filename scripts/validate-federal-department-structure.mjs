#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DEPT04_MODEL_PATHS,DEPT04_CONTEXT_PATHS,
 validateDepartmentStructure,projectDepartmentStructure} from "./federal-department-structure-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries([...DEPT04_MODEL_PATHS,...DEPT04_CONTEXT_PATHS].map(p=>[p,read(p)]));
const model=validateDepartmentStructure(read("model/federal/manifest.json"),files,
 read("schemas/federal-department-structure.schema.json"));
const args=process.argv.slice(2);
if(args.length===0||args.length===1&&args[0]==="--validate"){
 console.log(JSON.stringify({status:model.status,counts:model.counts,whole_department_adl1:0,
  source_research_only:true,website_publication:false},null,2));
}else if(args.length===2&&args[0]==="--view"){
 console.log(JSON.stringify(projectDepartmentStructure(model,args[1]),null,2));
}else throw Error("Usage: node scripts/validate-federal-department-structure.mjs [--validate | --view VIEW-DEPT04-ID]");
