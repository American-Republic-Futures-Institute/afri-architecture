#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DOD_MODEL_PATHS,OTHER_MODEL_PATHS,validateDod,projectDodView} from "./dod-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("model/federal/manifest.json");
const files=Object.fromEntries([...DOD_MODEL_PATHS,...OTHER_MODEL_PATHS].map(p=>[p,read(p)]));
const validated=validateDod(manifest,files),args=process.argv.slice(2);
if(args.length===0||(args.length===1&&args[0]==="--validate"))
 console.log(JSON.stringify({status:"research_only_source_bounded_not_legal_citator_verified",
  extension:validated.extension.id,as_of:validated.extension.reference_as_of,
  metrics:validated.checks,website:"not_rendered",appropriations:"not_verified"},null,2));
else if(args.length===2&&args[0]==="--view")
 console.log(JSON.stringify(projectDodView(validated,args[1]),null,2));
else throw Error("Usage: node scripts/validate-dod.mjs [--validate | --view VIEW-DOD-<SCOPE>]");
