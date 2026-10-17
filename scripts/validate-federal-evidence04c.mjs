#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,PRIOR,validateVA04C,projectVA04C} from "./validate-federal-evidence04c-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries([...PATHS,...PRIOR].map(p=>[p,read(p)]));
const model=validateVA04C(read("model/federal/manifest.json"),files,
 read("schemas/federal-evidence-registry-04c.schema.json"));
const args=process.argv.slice(2);
if(args.length===0||args.length===1&&args[0]==="--validate")
 console.log(JSON.stringify({status:model.status,counts:model.counts,
  first_level_denominator:null,source_archive_durable:false},null,2));
else if(args.length===2&&args[0]==="--view")
 console.log(JSON.stringify(projectVA04C(model,args[1]),null,2));
else throw Error("Usage: node scripts/validate-federal-evidence04c.mjs [--validate|--view directory|statutory|gaps]");
