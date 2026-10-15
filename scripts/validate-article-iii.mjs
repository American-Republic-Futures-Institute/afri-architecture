#!/usr/bin/env node
// Deterministic Article III constitutional model quality gate.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleIII} from "./article-iii-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const result=validateArticleIII({
 manifest:read("model/federal/manifest.json"),
 models:{
  units:read("model/constitutional/article-iii-units.json"),
  qualifications:read("model/constitutional/article-iii-qualifications.json"),
  capabilityLinks:read("model/constitutional/article-iii-capability-links.json"),
  jurisdiction:read("model/constitutional/article-iii-jurisdiction.json")
 },
 provisions:read("model/constitutional/provisions.json").items,
 norms:read("model/constitutional/norms.json").items,
 bindings:read("model/constitutional/bindings.json").items,
 capabilities:read("model/federal/capabilities.json").items,
 actors:read("model/constitutional/actors.json").items,
 sources:read("model/federal/sources.json").items,
 articleIQualifications:read("model/constitutional/article-i-qualifications.json").items,
 articleIIQualifications:read("model/constitutional/article-ii-qualifications.json").items
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
