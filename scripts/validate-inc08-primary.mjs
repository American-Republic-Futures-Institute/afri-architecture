#!/usr/bin/env node
import fs from "node:fs";
import {FAMILIES,validateX08} from "./inc08-primary-validation-core.mjs";
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=json("model/federal/manifest.json");
const collections=Object.fromEntries(FAMILIES.map(k=>[k,json("model/federal/x08-"+k+".json")]));
const files=new Map(collections.sources.items.filter(x=>x.original_body_is_in_git===true)
 .map(x=>[x.repository_original_path,fs.readFileSync(x.repository_original_path)]));
const previous=["model/constitutional/provisions.json","model/federal/executive-departments.json",
 "model/federal/legislative.json","model/federal/x06-accounts.json","model/federal/x06-metrics.json",
 "model/federal/x06-enactments.json","model/federal/x06-gaps.json","model/federal/x07-apportionments.json",
 "model/federal/x07-execution.json","model/federal/x07-tas.json","model/federal/x07-gaps.json"];
const ancestors=new Map(previous.flatMap(p=>json(p).items.map(x=>[x.id,x])));
const ancestorSources=new Map(["model/federal/x06-sources.json","model/federal/x07-sources.json"]
 .flatMap(p=>json(p).items.map(x=>[x.id,x])));
const result=validateX08({manifest,collections,originalBytes:files,ancestors,ancestorSources});
console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;
