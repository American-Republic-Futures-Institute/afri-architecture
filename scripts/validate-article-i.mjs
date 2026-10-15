#!/usr/bin/env node
// Execute Article I architecture integrity and historical safeguards.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleI} from "./article-i-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const result=validateArticleI({
 manifest:load("model/federal/manifest.json"),
 models:{
  clauses:load("model/constitutional/article-i-clauses.json"),
  qualifications:load("model/constitutional/article-i-qualifications.json"),
  capabilityLinks:load("model/constitutional/article-i-capability-links.json")
 },
 provisions:load("model/constitutional/provisions.json").items,
 norms:load("model/constitutional/norms.json").items,
 bindings:load("model/constitutional/bindings.json").items,
 capabilities:load("model/federal/capabilities.json").items,
 sources:load("model/federal/sources.json").items
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
