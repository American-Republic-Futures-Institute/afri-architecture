#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ARCH04B_MODEL_PATHS,inspectArchive04bSchema} from "./validate-federal-archive04b-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries(ARCH04B_MODEL_PATHS.map(p=>[p,read(p)]));
const x=inspectArchive04bSchema(read("schemas/federal-source-archive-04b.schema.json"),files);
if(x.errors.length){console.error(x.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify({status:"strict_draft_2020_12_contract_valid",collections:x.families}));
