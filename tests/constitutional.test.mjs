// Regressions: fail closed on superseded text, missing authority links, and bad graph references.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateConstitutionCatalog} from "../scripts/constitutional-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 const keys=["actors","provisions","norms","bindings","changes","viewpoints"];
 const models=Object.fromEntries(keys.map(k=>[k,read("model/constitutional/"+k+".json")]));
 const pathList=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities"];
 return {
  manifest:read("model/federal/manifest.json"),models,
  sources:read("model/federal/sources.json").items,
  external_ids:pathList.flatMap(k=>read("model/federal/"+k+".json").items.map(x=>x.id)),
  legacy_authorities:read("model/federal/authorities.json").items
 };
}
test("baseline constitutional catalog passes reference integrity",()=>{
 const result=validateConstitutionCatalog(fixture());
 assert.deepEqual(result.errors,[]);
 assert.equal(result.counts.provisions,161);
 assert.equal(result.counts.actors,20);
 assert.equal(result.counts.norms,146);
 assert.equal(result.counts.bindings,208);
 assert.equal(result.counts.changes,11);
});
test("rejects dangling provision references",()=>{
 const f=fixture();f.models.norms.items[0].provision_ids=["CONST-US-DOES-NOT-EXIST"];
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("Unknown provision for norm")));
});
test("rejects converting repealed amendment into a current authority",()=>{
 const f=fixture();f.models.norms.items.push({...f.models.norms.items[0],id:"NORM-US-CONST-INVALID",provision_ids:["CONST-US-AMD-18"],effect_status:"operative"});
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("inoperative provisions")));
});
test("rejects actor bindings to superseded constitutional norms",()=>{
 const f=fixture();f.models.bindings.items.push({...f.models.bindings.items[0],id:"BIND-US-CONST-9999",norm_id:"NORM-US-CONST-090"});
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("may not have current actor binding")));
});
test("rejects dangling actors and institutions",()=>{
 const f=fixture();f.models.bindings.items[0].target_id="ORG-FED-UNKNOWN";
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("Unknown binding actor/institution")));
});
test("rejects missing Amendment XXI repeal transition",()=>{
 const f=fixture();f.models.changes.items=f.models.changes.items.filter(x=>x.change_kind!=="repeals");
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("Absent Amendment XXI repeal linkage")));
});
test("rejects provision hierarchy cycles",()=>{
 const f=fixture();f.models.provisions.items.find(p=>p.id==="CONST-US-ART-01").parent_id="CONST-US-ART-01-SEC-08";
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("ancestry cycle")));
});
test("rejects descriptive norm upgrades without legal review",()=>{
 const f=fixture();f.models.norms.items[0].interpretation_status="ratified_doctrine";
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("Unaudited")||e.includes("Unreviewed norm asserted as doctrine")));
});
test("rejects invalid provision counts",()=>{
 const f=fixture();f.models.provisions.items=f.models.provisions.items.filter(p=>p.id!=="CONST-US-AMD-27");
 const result=validateConstitutionCatalog(f);
 assert.ok(result.errors.some(e=>e.includes("27 ratified Amendments")));
});
