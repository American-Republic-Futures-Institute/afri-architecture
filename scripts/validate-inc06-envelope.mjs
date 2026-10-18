#!/usr/bin/env node
import fs from "node:fs";
import {families,validateInc06Envelopes} from "./inc06-envelope-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const schema=read("schemas/inc06-lineage-envelope.schema.json");
const models=Object.fromEntries(families.map(n=>[n,read("model/federal/x06-"+n+".json")]));
const r=validateInc06Envelopes(schema,models);
if(r.errors.length){console.error("INC06 envelope Schema 2020-12 validation FAILED:\n"+r.errors.slice(0,40).join("\n"));process.exitCode=1;}
else console.log("INC06 JSON Schema envelopes accepted:",r.checkedFamilies,"model families");
