#!/usr/bin/env node
import fs from "node:fs";
import {INC10_FAMILIES,validateINC10} from "./inc10-validation-core.mjs";
const J=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const a=["model/constitutional/provisions.json","model/federal/x06-accounts.json","model/federal/x06-metrics.json",
 "model/federal/x07-execution.json","model/federal/x08-omb-revisions.json","model/federal/x08-traces.json",
 "model/federal/x09-file-a-rows.json","model/federal/x09-traces.json"];
const ss=["model/federal/x06-sources.json","model/federal/x07-sources.json",
 "model/federal/x08-sources.json","model/federal/x09-sources.json"];
const src=J("model/federal/x10-sources.json").items;
const originalBytes=new Map(src.map(x=>[x.original_path,fs.readFileSync(x.original_path)]));
const output=validateINC10({
 manifest:J("model/federal/manifest.json"),
 collections:Object.fromEntries(INC10_FAMILIES.map(k=>[k,J("model/federal/x10-"+k+".json")])),
 originalBytes,ancestorRecords:new Map(a.flatMap(p=>J(p).items.map(x=>[x.id,x]))),
 ancestorSources:new Map(ss.flatMap(p=>J(p).items.map(x=>[x.id,x])))
});
console.log(JSON.stringify(output,null,2));if(output.errors.length)process.exitCode=1;
