#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateFederalStatutes} from "./federal-statutory-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["statutory-sources","statutes","statutory-provisions","statutory-powers","statutory-conditions","statutory-capability-links","statutory-traces","statutory-viewpoints"];
const result=validateFederalStatutes({manifest:read("model/federal/manifest.json"),
 models:Object.fromEntries(families.map(n=>[n,read("model/federal/"+n+".json")])),
 institutions:["legislative","executive-departments"].flatMap(n=>read("model/federal/"+n+".json").items),
 capabilities:read("model/federal/capabilities.json").items,
 constitutionalProvisions:read("model/constitutional/provisions.json").items
});
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
