import test from "node:test";
import assert from "node:assert/strict";
import {loadINC13B1,validateINC13B1,projectINC13B1} from "../scripts/inc13b1-validation-core.mjs";
const copy=x=>structuredClone(x);
test("bounded source projection never certifies ADL1",()=>{
 const data=loadINC13B1(),v=validateINC13B1(data.model,data.inputs);
 assert.deepEqual(v.errors,[]);assert.equal(v.adl1_certified_count,0);
 assert.equal(v.whole_department_first_level_denominator,null);
 assert.equal(projectINC13B1(data).root_id,"ORG-FED-EXE-DEP-DEFENSE");
});
for(const [name,alter] of [
 ["invented current roster",d=>d.model.whole_department_first_level_denominator=55],
 ["false legal signoff",d=>d.model.independent_legal_review_complete=true],
 ["false source custody",d=>d.model.original_bytes_retained_verified=true],
 ["false ADL promotion",d=>d.model.adl1_certified_count=1],
 ["GAO roster is current",d=>d.model.items[1].current_entire_dod_structure_complete=true],
 ["forged agency record",d=>d.inputs.collections["model/federal/dod/dafas.json"].items.push({...d.inputs.collections["model/federal/dod/dafas.json"].items[0],id:"FAKE"})],
 ["invented source",d=>d.model.items[0].source_ids=["UNKNOWN"]],
 ["invalid edition",d=>d.model.items[2].snapshot_id="unknown"],
 ["wrong department",d=>d.model.department_id="ORG-FED-EXE-DEP-JUSTICE"],
 ["unregistered family",d=>d.inputs.manifest.models=d.inputs.manifest.models.filter(x=>x!=="model/federal/inc13b1-source-slices.json")],
 ["duplicate record",d=>d.model.items.push(d.model.items[0])]
]){
 test("reject "+name,()=>{const d=copy(loadINC13B1());alter(d);assert.notEqual(validateINC13B1(d.model,d.inputs).errors.length,0);});
}
