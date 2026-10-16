#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleIVVII} from "./article-iv-vii-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["article-iv-vii-units","article-iv-vii-qualifications","article-iv-vii-actor-links","article-iv-vii-capability-links","article-iv-vii-viewpoints"];
const result=validateArticleIVVII({
 manifest:read("model/federal/manifest.json"),
 models:Object.fromEntries(families.map(k=>[k,read("model/constitutional/"+k+".json")])),
 provisions:read("model/constitutional/provisions.json").items,
 norms:read("model/constitutional/norms.json").items,
 actors:read("model/constitutional/actors.json").items,
 bindings:read("model/constitutional/bindings.json").items,
 capabilities:read("model/federal/capabilities.json").items,
 institutions:["legislative","executive-leadership","executive-departments","executive-independent","judiciary"].flatMap(x=>read("model/federal/"+x+".json").items),
 federalismUnits:read("model/constitutional/federalism-units.json").items,
 federalismQualifications:read("model/constitutional/federalism-qualifications.json").items,
 federalismRelations:read("model/constitutional/federalism-relationships.json").items,
 federalismCapabilities:read("model/constitutional/federalism-capability-links.json").items,
 sourceIds:read("model/federal/sources.json").items.map(x=>x.id)
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
