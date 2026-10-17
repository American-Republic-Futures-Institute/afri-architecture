#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DOD_MODEL_PATHS} from "./dod-validation-core.mjs";
import {checkDodSchema} from "./dod-schema-validator.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const schema=read("schemas/dod-institutional.schema.json");
const files=Object.fromEntries(DOD_MODEL_PATHS.map(p=>[p,read(p)]));
const checked=checkDodSchema(schema,files);
if(checked.errors.length){
 console.error("DoD schema model mismatch:",checked.errors.slice(0,60).join("\n"));
 process.exitCode=1;
}else console.log("DoD constitutional/institutional/fiscal schema validated:",checked.model_families,"families");
