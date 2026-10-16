#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateJudicialPrecedent} from "./judicial-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const files=Object.fromEntries(Object.entries({
 courts:"courts",sources:"sources",cases:"cases",holdings:"holdings",
 interpretations:"interpretations",treatments:"treatments",
 statusAssessments:"status-assessments",viewpoints:"viewpoints"
}).map(([k,v])=>[k,read("model/judicial/"+v+".json")]));
const fed=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities"];
const result=validateJudicialPrecedent({
 manifest:read("model/federal/manifest.json"),models:files,
 provisions:read("model/constitutional/provisions.json").items,
 norms:read("model/constitutional/norms.json").items,
 actors:read("model/constitutional/actors.json").items,
 federalInstitutions:fed.flatMap(k=>read("model/federal/"+k+".json").items)
});
console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;
