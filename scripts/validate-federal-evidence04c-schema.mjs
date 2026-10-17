#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,inspect04cSchema} from "./validate-federal-evidence04c-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries(PATHS.map(p=>[p,read(p)]));
const result=inspect04cSchema(read("schemas/federal-evidence-registry-04c.schema.json"),files);
if(result.errors.length){console.error(result.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify({status:"strict_JSON_Schema_2020_12_valid",collections:result.collections},null,2));
