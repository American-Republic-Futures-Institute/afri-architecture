#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateState} from "./state-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["jurisdictions","nonstate-comparators","sources","constitutions","provisions","norms","actors","branches","institutions","relationships","federalism-links","judicial-links","viewpoints"];
const data={
 manifest:read("model/federal/manifest.json"),
 models:Object.fromEntries(families.map(f=>[f,read("model/state/"+f+".json")])),
 federalInstitutions:["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","authorities","capabilities"].flatMap(x=>read("model/federal/"+x+".json").items),
 federalProvisions:read("model/constitutional/provisions.json").items,
 judicialCases:read("model/judicial/cases.json").items,
 judicialHoldings:read("model/judicial/holdings.json").items,
 judicialStatus:read("model/judicial/status-assessments.json").items
};
const result=validateState(data);
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
