#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateStateStatutes} from "./state-statutory-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["statutory-sources","statutes","statutory-provisions","statutory-powers","statutory-conditions","statutory-capabilities","statutory-traces","statutory-viewpoints"];
const result=validateStateStatutes({manifest:read("model/federal/manifest.json"),models:Object.fromEntries(families.map(n=>[n,read("model/state/"+n+".json")])),stateProvisions:read("model/state/provisions.json").items,stateInstitutions:read("model/state/institutions.json").items,stateJurisdictions:read("model/state/jurisdictions.json").items});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
