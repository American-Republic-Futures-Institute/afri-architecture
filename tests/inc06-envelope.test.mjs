import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {families,validateInc06Envelopes} from "../scripts/inc06-envelope-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const template=read("schemas/inc06-lineage-envelope.schema.json");
const canonical=Object.fromEntries(families.map(n=>[n,read("model/federal/x06-"+n+".json")]));
test("eleven published INC06 collections satisfy declarative JSON Schema 2020-12 envelope contract",()=>{
 assert.deepEqual(validateInc06Envelopes(template,canonical).errors,[]);
});
const neg=(title,alter,re)=>test(title,()=>{
 const s=structuredClone(template),d=structuredClone(canonical);alter(s,d);
 assert.match(validateInc06Envelopes(s,d).errors.join("\n"),new RegExp(re));
});
neg("deleting type on a valid account fails the schema",(_s,d)=>{delete d.accounts.items[0].type},"missing required property");
neg("source entry without URL fails conditional provenance schema",(_s,d)=>{delete d.sources.items[0].url},"missing required property");
neg("ordinary report record with no source IDs fails conditional provenance schema",(_s,d)=>{delete d.metrics.items[0].source_ids},"missing required property");
neg("source locator model cannot carry source_ids instead of url",(_s,d)=>{d.sources.items[0].source_ids=["SRC-INVALID"];delete d.sources.items[0].url},"missing required property");
neg("arbitrary model envelope properties must be rejected",(_s,d)=>{d.accounts.injected=true},"disallowed additional property");
neg("unapproved verification cannot become true in typed model",(_s,d)=>{d.gaps.items[0].verified=true},"const mismatch");
neg("raw financial model IDs may not be arbitrary paths",(_s,d)=>{d.metrics.items[0].id="../escape"},"required pattern");
neg("schema's source provenance conditional may not be omitted",(s)=>{delete s.properties.items.items.allOf},"conditional original-source provenance rule absent");
neg("unsupported schema keywords are fail-closed",(s)=>{s.properties.items.items.experimentalPermit=true},"unsupported JSON Schema keyword");
neg("the canonical family namespace may not be changed",(_s,d)=>{d.traces.model_family="inc06-manifest"},"required pattern|collection family mismatch");
