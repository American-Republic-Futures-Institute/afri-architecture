#!/usr/bin/env node
import fs from "node:fs";
import {X07_FAMILIES,validateX07} from "./inc07-treasury-validation-core.mjs";
import {validateX07Schema} from "./inc07-treasury-envelope-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=read("model/federal/manifest.json");
const collections=Object.fromEntries(X07_FAMILIES.map(n=>[n,read("model/federal/x07-"+n+".json")]));
const existing=[
 "model/constitutional/provisions.json","model/federal/legislative.json",
 "model/federal/executive-departments.json","model/federal/x06-accounts.json",
 "model/federal/x06-traces.json","model/federal/x06-metrics.json",
 "model/federal/x06-enactments.json","model/federal/x06-gaps.json"
];
const sources=["model/federal/x06-sources.json","model/federal/x05-sources.json","model/federal/sources.json"];
const records=new Map(existing.flatMap(p=>read(p).items.map(x=>[x.id,x])));
const sourceRecords=new Map(sources.flatMap(p=>read(p).items.map(x=>[x.id,x])));
const schema=validateX07Schema(read("schemas/inc07-treasury-envelope.schema.json"),collections);
const actual=validateX07({manifest,collections,records,sourceRecords});
actual.errors.unshift(...schema.errors.map(e=>"X07 envelope: "+e));
console.log(JSON.stringify(actual,null,2));
if(actual.errors.length)process.exitCode=1;
