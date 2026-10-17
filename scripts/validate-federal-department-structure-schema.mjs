#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DEPT04_MODEL_PATHS,inspectDepartmentSchema} from "./federal-department-structure-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const f=Object.fromEntries(DEPT04_MODEL_PATHS.map(p=>[p,read(p)]));
const result=inspectDepartmentSchema(read("schemas/federal-department-structure.schema.json"),f);
if(result.errors.length){console.error(result.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify({status:"schema_2020_12_structural_contract_valid",model_families:result.families},null,2));
