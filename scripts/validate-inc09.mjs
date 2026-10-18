#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateInc09} from "./inc09-fiscal-validation-core.mjs";
import {SOURCE_PINS} from "./inc09-filea-source-core.mjs";
const get=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const root="evidence/va-fy2025/file-a-originals/sha256/";
const raw={};
for(const [k,ext] of [["ZIP","zip"],["CSV","csv"],["SNAPSHOT","json"],["HISTORY","json"]])
 raw[k.toLowerCase()]=fs.readFileSync(root+SOURCE_PINS[k].sha+"."+ext);
const ancestorPaths=[
"model/constitutional/provisions.json",
"model/federal/x06-accounts.json","model/federal/x06-metrics.json",
"model/federal/x07-execution.json","model/federal/x07-apportionments.json",
"model/federal/x08-omb-revisions.json","model/federal/x08-traces.json",
"model/federal/x08-gaps.json"
];
const sources=["model/federal/x06-sources.json","model/federal/x07-sources.json","model/federal/x08-sources.json"];
const ancestorRecords=new Map(ancestorPaths.flatMap(p=>get(p).items.map(v=>[v.id,v])));
const ancestorSources=new Map(sources.flatMap(p=>get(p).items.map(v=>[v.id,v])));
const model=Object.fromEntries(FAMILIES.map(n=>[n,get("model/federal/x09-"+n+".json")]));
const result=validateInc09({manifest:get("model/federal/manifest.json"),collections:model,raw,ancestorRecords,ancestorSources});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
