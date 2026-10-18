import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {validateX06,X06_FAMILIES} from "../scripts/inc06-lineage-validation-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const docs=["model/constitutional/provisions.json","model/federal/legislative.json","model/federal/executive-departments.json","model/federal/executive-leadership.json","model/federal/x05-traces.json","model/federal/x05-statutes.json"];
const srces=["model/federal/sources.json","model/federal/x05-sources.json"];
const seed={manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(X06_FAMILIES.map(n=>[n,read("model/federal/x06-"+n+".json")])),
 records:new Map(docs.flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(srces.flatMap(p=>read(p).items.map(x=>[x.id,x])))};
const err=d=>validateX06(d).errors.join("\n");
const rec=(d,f,id)=>{const r=d.collections[f].items.find(x=>x.id===id);assert(r,id);return r;};
const negative=(label,mutate,reason)=>test(label,()=>{const d=structuredClone(seed);mutate(d);assert.match(err(d),new RegExp(reason));});
test("INC06 anchored enacted appropriation, OMB accounting and unresolved authority trace pass",()=>{
 const out=validateX06(seed);assert.deepEqual(out.errors,[]);
 assert.equal(out.counts.traces,1);assert.equal(out.counts.relationships,32);assert.equal(out.counts.gaps,9);
 assert.equal(out.fiscalReconciliation.exactEnactedUSD,212552579000);
 assert.equal(out.fiscalReconciliation.ombResourcesRoundedUSD,217841000000);
});
negative("enacted appropriation amount cannot be falsified",d=>rec(d,"enactments","X06-APP-PL11842-FY25").amount_usd=100,"enacted public law amounts");
negative("reimbursement transfer cap attaches only to PL11842",d=>rec(d,"controls","X06-CTRL-FY25-REIMBURSEMENT").applies_to_tranche_id="X06-APP-PL1194-FY25","tranche-limited reimbursement");
negative("source 2026 OMB request cannot be silently passed off as actual 2025",d=>rec(d,"metrics","X06-METRIC-OUTLAYS-GROSS").observation_class="fy2027_budget_request","2025 actual incorrectly");
negative("a real treasury TAS cannot be invented by federal account label",d=>rec(d,"accounts","X06-ACCOUNT-VA-0102").exact_components_treasury_account_symbol_verified=true,"falsely elevates grouped federal account");
negative("OMB total resources are not actual SF132",d=>rec(d,"metrics","X06-METRIC-AVAILABLE-RESOURCES").apportioned_amount_usd=217841000000,"escalated to legal transaction");
negative("new obligations must reconcile to available and closing balance",d=>rec(d,"metrics","X06-METRIC-UNOBLIGATED-CLOSE").value_usd=1,"financial actual or currency altered|reconciliation error");
negative("gross outlays minus offsets must match net outlays",d=>rec(d,"metrics","X06-METRIC-OFFSETS").value_usd=0,"financial actual or currency altered|reconciliation error");
negative("named Under Secretary never implies individual obligating delegation",d=>rec(d,"actors","X06-ACTOR-UNDERSEC-BENEFITS").individual_obligating_delegation_verified=true,"institutional headship falsely");
negative("unresolved apportionment evidence cannot be checked away",d=>rec(d,"gaps","X06-GAP-APPORTIONMENT").verified=true,"silently treated as verified");
negative("trace cannot erase source-to-transaction uncertainty from its oversight",d=>rec(d,"traces","X06-TRACE-VA-2025-0102").stages[6].record_ids.pop(),"missing unqualified operational gates");
negative("financial lineage may not assert proven individual payments",d=>rec(d,"traces","X06-TRACE-VA-2025-0102").transaction_source_to_outlay_proven=true,"unverifiable operational/legal certification");
negative("relationship may not assert individual disbursement",d=>rec(d,"relationships","X06-REL-27").individual_disbursement_verified=true,"relationship fabricates certifying");
negative("relationship cannot cross unrelated fiscal year or hidden account",d=>rec(d,"relationships","X06-REL-08").to_id="X06-GAP-PAYMENT-EVENT","relation escapes canonical trace|relationship fabricates");
negative("unattributed public law record is refused",d=>rec(d,"enactments","X06-APP-PL1194-FY25").source_ids=[],"absent source provenance");
negative("spoofed US Code provenance fails",d=>rec(d,"sources","SRC-X06-38-306").url="https://uscode.house.gov.evil.test/","primary evidence spoofing");
negative("one annual workload count does not prove outcomes caused by single tranche",d=>rec(d,"outcomes","X06-OUTPUT-FY25-RATING").caused_by_enacted_tranche_verified=true,"workload or GAO program oversight falsely");
negative("source record cannot falsely imply immutable original archive custody",d=>rec(d,"sources","SRC-X06-PL118-42").original_bytes_archived=true,"custody overclaim");
negative("change in original Article VII effect is not permitted",d=>d.records.get("CONST-US-ART-07").effect_status="operative","constitutional source identity/effect integrity");
negative("FY2025 must not be transformed into future requested year",d=>rec(d,"traces","X06-TRACE-VA-2025-0102").fiscal_year=2027,"lineage identity, as-of year");
negative("controlling enacted authority cannot be treated as expired after FY2025",d=>rec(d,"enactments","X06-APP-PL1194-FY25").availability_end="2025-09-30","no-year enacted funding");
