#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {CENSUS_MODEL_PATHS,validateFederalCensus,projectFederalCensus} from "./federal-census-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("model/federal/manifest.json");
const files=Object.fromEntries(CENSUS_MODEL_PATHS.map(p=>[p,read(p)]));
const data=validateFederalCensus(manifest,files);
const args=process.argv.slice(2);
if(!args.length||args.includes("--validate")){
 console.log(JSON.stringify({status:"validated_reference_data_only",...data.counts,
  coverage_level:data.coverage_level,denominator_status:data.denominator_status,
  deployment_status:"not_rendered_on_website"},null,2));
}else if(args.length===2&&args[0]==="--view")
 console.log(JSON.stringify(projectFederalCensus(data,args[1]),null,2));
else throw new Error("Usage: node scripts/validate-federal-census.mjs [--validate | --view VIEW-CENSUS-ID]");
