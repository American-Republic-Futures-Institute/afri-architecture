#!/usr/bin/env node
// Reads canonical architecture JSON and runs pure constitutional invariants.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateConstitutionCatalog} from "./constitutional-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("model/federal/manifest.json");
const keys=["actors","provisions","norms","bindings","changes","viewpoints"];
const models=Object.fromEntries(keys.map(k=>[k,read("model/constitutional/"+k+".json")]));
const legacyIds=["model/federal/branches.json","model/federal/legislative.json","model/federal/executive-leadership.json","model/federal/executive-departments.json","model/federal/executive-independent.json","model/federal/judiciary.json","model/federal/capabilities.json"];
const external_ids=legacyIds.flatMap(f=>read(f).items.map(r=>r.id));
const result=validateConstitutionCatalog({manifest,models,external_ids,sources:read("model/federal/sources.json").items,legacy_authorities:read("model/federal/authorities.json").items});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
