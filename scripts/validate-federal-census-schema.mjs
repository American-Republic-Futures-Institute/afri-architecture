#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {FAMILIES,inspectFederalCensusSchema} from "./federal-census-schema-validator.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const schema=read("schemas/federal-census.schema.json");
const files=Object.fromEntries(FAMILIES.map(n=>["model/federal/coverage/"+n+".json",read("model/federal/coverage/"+n+".json")]));
const result=inspectFederalCensusSchema(schema,files);
if(result.errors.length){
 console.error("Federal census schema contract failed:",result.errors.slice(0,30));
 process.exitCode=1;
}else console.log("Federal census model collections conform to bounded JSON Schema:",result.model_families);
