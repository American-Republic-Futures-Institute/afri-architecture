import fs from "node:fs";
import {validateX05} from "./inc05-crosswalk-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const families=["sources","statutes","functions","gates","relationships","traces"];
const modelPaths=[
 "model/constitutional/provisions.json","model/federal/legislative.json",
 "model/federal/executive-leadership.json","model/federal/executive-departments.json",
 "model/federal/judiciary.json","model/federal/dod/offices.json",
 "model/federal/dod/powers.json","model/federal/dod/statutory-provisions.json",
 "model/judicial/holdings.json"
];
const sourcePaths=[
 "model/federal/sources.json","model/federal/coverage/source-registry.json",
 "model/federal/dod/source-registry.json","model/judicial/sources.json"
];
const data={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(families.map(x=>[x,read("model/federal/x05-"+x+".json")])),
 records:new Map(modelPaths.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(sourcePaths.flatMap(p=>read(p).items.map(x=>[x.id,x])))
};
const result=validateX05(data);
console.log(JSON.stringify(result,null,2));
if(result.errors.length)process.exitCode=1;
