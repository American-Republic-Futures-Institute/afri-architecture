#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateAmendments} from "./amendment-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const result=validateAmendments({
 manifest:read("model/federal/manifest.json"),
 models:{
  units:read("model/constitutional/amendment-units.json"),
  timeline:read("model/constitutional/amendment-timeline.json"),
  effects:read("model/constitutional/amendment-effects.json"),
  qualifications:read("model/constitutional/amendment-qualifications.json"),
  capabilityLinks:read("model/constitutional/amendment-capability-links.json")
 },
 provisions:read("model/constitutional/provisions.json").items,
 norms:read("model/constitutional/norms.json").items,
 bindings:read("model/constitutional/bindings.json").items,
 changes:read("model/constitutional/changes.json").items,
 capabilities:read("model/federal/capabilities.json").items,
 sources:read("model/federal/sources.json").items
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
