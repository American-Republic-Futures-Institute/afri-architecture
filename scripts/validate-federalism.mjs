#!/usr/bin/env node
// Validate Article IV, Article VI and Tenth, Eleventh, Fourteenth Amendment ARFI architecture.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateFederalism} from "./federalism-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fed=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities"];
const result=validateFederalism({
 manifest:read("model/federal/manifest.json"),
 models:{
  units:read("model/constitutional/federalism-units.json"),
  qualifications:read("model/constitutional/federalism-qualifications.json"),
  relationships:read("model/constitutional/federalism-relationships.json"),
  rights:read("model/constitutional/federalism-rights.json"),
  capabilityLinks:read("model/constitutional/federalism-capability-links.json")
 },
 provisions:read("model/constitutional/provisions.json").items,
 norms:read("model/constitutional/norms.json").items,
 bindings:read("model/constitutional/bindings.json").items,
 actors:read("model/constitutional/actors.json").items,
 changes:read("model/constitutional/changes.json").items,
 federal_institutions:fed.flatMap(n=>read("model/federal/"+n+".json").items),
 capabilities:read("model/federal/capabilities.json").items,
 sources:read("model/federal/sources.json").items,
 articleIQualifications:read("model/constitutional/article-i-qualifications.json").items,
 articleIIQualifications:read("model/constitutional/article-ii-qualifications.json").items,
 articleIIIQualifications:read("model/constitutional/article-iii-qualifications.json").items
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
