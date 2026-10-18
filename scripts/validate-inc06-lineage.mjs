import fs from "node:fs";
import {validateX06,X06_FAMILIES} from "./inc06-lineage-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export const sharedModels=[
 "model/constitutional/provisions.json",
 "model/federal/legislative.json",
 "model/federal/executive-departments.json",
 "model/federal/executive-leadership.json",
 "model/federal/x05-traces.json",
 "model/federal/x05-statutes.json"
];
export const sharedSources=["model/federal/sources.json","model/federal/x05-sources.json"];
const data={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(X06_FAMILIES.map(name=>[name,read("model/federal/x06-"+name+".json")])),
 records:new Map(sharedModels.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(sharedSources.flatMap(p=>read(p).items.map(x=>[x.id,x])))
};
const report=validateX06(data);
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
