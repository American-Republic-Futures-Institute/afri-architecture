#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ARCH04B_MODEL_PATHS,ARCH04B_CONTEXT_PATHS,
 validateArchive04b,projectArchive04b} from "./validate-federal-archive04b-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("model/federal/manifest.json");
const schema=read("schemas/federal-source-archive-04b.schema.json");
const files=Object.fromEntries([...ARCH04B_MODEL_PATHS,...ARCH04B_CONTEXT_PATHS].map(p=>[p,read(p)]));
const data=validateArchive04b(manifest,files,schema);
const args=process.argv.slice(2);
if(args.length===0||args.length===1&&args[0]==="--validate")
 console.log(JSON.stringify({status:data.archive_status,counts:data.counts,
   legal_review_status:data.legal_review_status,whole_government_coverage_claim:false},null,2));
else if(args.length===2&&args[0]==="--view")
 console.log(JSON.stringify(projectArchive04b(data,args[1]),null,2));
else throw Error("Usage: node scripts/validate-federal-archive04b.mjs [--validate | --view VIEW-ARCH04B-[JUSTICE|TREASURY|HHS|VA]]");
