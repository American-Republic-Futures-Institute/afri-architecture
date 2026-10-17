#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EXPANSION_MODEL_PATHS,inspectExpansionSchema} from "./federal-expansion-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries(EXPANSION_MODEL_PATHS.map(p=>[p,read(p)]));
const result=inspectExpansionSchema(read("schemas/federal-expansion.schema.json"),files);
if(result.errors.length){console.error(result.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify({status:"schema_2020_12_valid",model_families:result.model_families},null,2));
