import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {validateX05} from "../scripts/inc05-crosswalk-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const fam=["sources","statutes","functions","gates","relationships","traces"];
const modelPaths=["model/constitutional/provisions.json","model/federal/legislative.json","model/federal/executive-leadership.json","model/federal/executive-departments.json","model/federal/judiciary.json","model/federal/dod/offices.json","model/federal/dod/powers.json","model/federal/dod/statutory-provisions.json","model/judicial/holdings.json"];
const sourcePaths=["model/federal/sources.json","model/federal/coverage/source-registry.json","model/federal/dod/source-registry.json","model/judicial/sources.json"];
const baseline={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(fam.map(x=>[x,read("model/federal/x05-"+x+".json")])),
 records:new Map(modelPaths.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(sourcePaths.flatMap(p=>read(p).items.map(x=>[x.id,x])))
};
const validate=d=>validateX05(d).errors;
const record=(d,f,id)=>{const r=d.collections[f].items.find(x=>x.id===id);assert(r,id);return r};
const neg=(name,mutate,pattern)=>test(name,()=>{
 const d=structuredClone(baseline);mutate(d);
 assert.match(validate(d).join("\n"),new RegExp(pattern));
});
test("all three constitutional power traces have six scoped stages, provenance and open gates",()=>{
 const result=validateX05(baseline);
 assert.deepEqual(result.errors,[]);
 assert.deepEqual(result.counts,{traces:3,relationships:27,gates:9,sourceReferences:5,statutes:5,functions:4});
});
neg("forged enacted spending permission fails",d=>record(d,"traces","X05-TRACE-I").enacted_program_appropriation_verified=true,"asserts certified government authority");
neg("staged Defense chain cannot invent signed delegation",d=>record(d,"relationships","X05-EDGE-II-05").individual_delegation_verified=true,"unauthorized legal inference");
neg("expired or unresolved legal gates cannot be silently approved",d=>record(d,"gates","X05-GATE-JUSTICIABILITY").satisfied=true,"silently certified");
neg("unqualified account-level budget may not be erased",d=>record(d,"traces","X05-TRACE-I").stages[5].record_ids.shift(),"unbound or omitted legal gate|mandatory authority/qualification omitted");
neg("judicial jurisdiction must remain tied to actual Article III and statute",d=>record(d,"traces","X05-TRACE-III").stages[2].record_ids[0]="X05-LAW-31-1341","mandatory authority/qualification omitted");
neg("crossbranch context cannot be forged through a valid ID",d=>record(d,"relationships","X05-EDGE-II-03").to_id="X05-LAW-31-1301","relationship escapes supported Article scope");
neg("wrong source locator cannot masquerade as official law",d=>record(d,"sources","SRC-X05-28-1254").url="https://example.com/other","source spoofing");
neg("case-specific standing cannot be asserted from model",d=>record(d,"traces","X05-TRACE-III").case_specific_remedy_verified=true,"asserts certified government authority");
neg("losing opinion source fails independent evidence check",d=>record(d,"relationships","X05-EDGE-II-09").source_ids=["SRC-UNKNOWN"],"unrecognized evidence");
neg("historical original Article VII must stay expired",d=>d.records.get("CONST-US-ART-07").effect_status="operative","original constitutional integrity");
neg("trace root may not point to another Article",d=>record(d,"traces","X05-TRACE-III").primary_provision_id="CONST-US-ART-02-SEC-02-CL-01","constitutional Article context invalid");
