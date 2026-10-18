import fs from "node:fs";
import {validateX06,X06_FAMILIES} from "./inc06-lineage-validation-core.mjs";
import {validateInc06Envelopes} from "./inc06-envelope-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
export const sharedModels=[
 "model/constitutional/provisions.json",
 "model/federal/legislative.json",
 "model/federal/executive-departments.json",
 "model/federal/executive-leadership.json",
 "model/federal/x05-traces.json",
 "model/federal/x05-statutes.json"
];
export const sharedSources=["model/federal/sources.json","model/federal/x05-sources.json"];
const data={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(X06_FAMILIES.map(name=>[name,read("model/federal/x06-"+name+".json")])),
 records:new Map(sharedModels.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(sharedSources.flatMap(p=>read(p).items.map(x=>[x.id,x])))
};
const envelope=validateInc06Envelopes(read("schemas/inc06-lineage-envelope.schema.json"),data.collections);
const report=validateX06(data);
// CLI is an atomic structural AND semantic gate: no direct invocation can
// accidentally accept an account record lacking required type/provenance.
report.errors.unshift(...envelope.errors.map(x=>"INC06 schema: "+x));
report.checkedSchemaFamilies=envelope.checkedFamilies;
console.log(JSON.stringify(report,null,2));
if(report.errors.length)process.exitCode=1;
