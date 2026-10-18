import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
import {INC10_FAMILIES,validateINC10} from "../scripts/inc10-validation-core.mjs";
const J=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const files=["model/constitutional/provisions.json","model/federal/x06-accounts.json","model/federal/x06-metrics.json",
 "model/federal/x07-execution.json","model/federal/x08-omb-revisions.json","model/federal/x08-traces.json",
 "model/federal/x09-file-a-rows.json","model/federal/x09-traces.json"];
const sources=["model/federal/x06-sources.json","model/federal/x07-sources.json","model/federal/x08-sources.json","model/federal/x09-sources.json"];
const collections=Object.fromEntries(INC10_FAMILIES.map(k=>[k,J("model/federal/x10-"+k+".json")]));
const base={manifest:J("model/federal/manifest.json"),collections,
 originalBytes:new Map(collections.sources.items.map(x=>[x.original_path,fs.readFileSync(x.original_path)])),
 ancestorRecords:new Map(files.flatMap(p=>J(p).items.map(x=>[x.id,x]))),
 ancestorSources:new Map(sources.flatMap(p=>J(p).items.map(x=>[x.id,x])))};
const fork=()=>structuredClone(base);
const errors=d=>validateINC10(d).errors.join("\n");
const find=(d,f,id)=>{const x=d.collections[f].items.find(x=>x.id===id);assert(x,id);return x;};
function deny(title,mutate,match){test(title,()=>{const d=fork();mutate(d);assert.match(errors(d),new RegExp(match,"i"));});}
test("primary Treasury FY2025 page 4 and OMB FY2027 pp10-11 replay at exact source hashes",()=>{
 const r=validateINC10(base);assert.deepEqual(r.errors,[]);
 assert.equal(r.originals_confirmed,2);assert.equal(r.original_bytes,1177248);
 assert.equal(r.open_evidence_gates,9);assert.equal(r.exact_gross_to_net_reconciliation_qualified,false);
});
test("OMB actual offset class is signed and nonfederal plus federal in million units, not exact cents",()=>{
 const d=fork();
 const table=new Map(d.collections["offset-lines"].items.map(x=>[x.OMB_line_code,x.amount_reported_millions_usd]));
 assert.equal(table.get("4120")+table.get("4123"),table.get("4130"));
 assert.equal(table.get("4110")+table.get("4130"),table.get("4170"));
 assert.equal(table.get("4142")+table.get("4143"),table.get("4150"));
});
test("source classifications require exact resource-vintage and offset cent mismatches to remain unresolved",()=>{
 const d=fork(),findRec=id=>find(d,"reconciliations","X10-REC-"+id).amounts;
 const m=findRec("GROSS-NET-DELTA");
 assert.equal(m.FileA_gross_cents-m.Treasury_net_cents,83957193846);
 assert.equal(m.observed_difference_above_OMB_rounded_offsets_cents,57193846);
 assert(m.observed_difference_above_OMB_rounded_offsets_cents>m.one_rounded_million_half_width_cents);
 const v=findRec("RESOURCE-REVISION");assert.equal(v.difference_cents,97257074);
});
deny("forged PDF publisher source byte rejected independently of research labels",d=>{
 const k=d.collections.sources.items[0].original_path,b=Buffer.from(d.originalBytes.get(k));b[105]^=1;d.originalBytes.set(k,b);
},"original body is absent");
deny("wrong underlying OMB budget PDF not accepted as Treasury original",d=>{
 const [a,b]=d.collections.sources.items;d.originalBytes.set(a.original_path,d.originalBytes.get(b.original_path));
},"original body");
deny("official source URL cannot be switched to secondary advocacy index",d=>{
 find(d,"sources","SRC-X10-OMB-FY27-VA-ORIGINAL").url="https://example.com/omb.pdf";
},"original government report");
deny("OMB source may not invent exact federal offsetting collections beyond million resolution",d=>{
 find(d,"offset-lines","X10-OFFSET-LINE-4120").exact_sub_million_amount_obtained=true;
},"historical line");
deny("OMB 4142 expired-account offset may not be mistaken for additional net cash adjustment",d=>{
 find(d,"offset-lines","X10-OFFSET-LINE-4142").amount_reported_millions_usd=-24;
},"historical line");
deny("cross-source exact cent offset cannot be labelled fully reconciled",d=>{
 find(d,"reconciliations","X10-REC-GROSS-NET-DELTA").exact_offset_ledger_verified=true;
},"source periods");
deny("exact gross minus net cannot round to 839m without a gap",d=>{
 find(d,"reconciliations","X10-REC-GROSS-NET-DELTA").amounts.observed_difference_above_OMB_rounded_offsets_cents=0;
},"source periods|normalized");
deny("OMB File A reporting vintage $972570.74 difference must not be suppressed",d=>{
 find(d,"reconciliations","X10-REC-RESOURCE-REVISION").amounts.difference_cents=0;
},"source periods|normalized");
deny("expired 2020 Treasury negative component cannot become zero",d=>{
 find(d,"reconciliations","X10-REC-CASH-ORIGINAL").amounts.legacy_2020_net_outlays_cents=0;
},"source periods|cash");
deny("report source record does not substitute for signed VA FMA TDA allotment",d=>{
 d.manifest.federal_fiscal_reporting_reconciliation_10_extension.VA_specific_signed_FMA_TDA_available=true;
},"unearned");
deny("signed original SF-133 and underlying GTAS not established by OMB annual budget",d=>{
 d.manifest.federal_fiscal_reporting_reconciliation_10_extension.VA_original_signed_SF133_GTAS_available=true;
},"unearned");
deny("independent accountant/legal review cannot be marked true without evidence",d=>{
 find(d,"gaps","X10-GAP-INDEPENDENT-REVIEW").verified=true;
},"incorrectly closed");
deny("immutable original Git does not equal authorized institutional WORM custody",d=>{
 find(d,"gaps","X10-GAP-INSTITUTIONAL-WORM").independently_qualified_WORM_storage=true;
},"incorrectly closed");
deny("stage-local VA control gate cannot disappear",d=>{
 const stages=find(d,"traces","X10-TRACE-VA-FY2025-0102").stages;
 stages[6].record_ids=stages[6].record_ids.filter(x=>x!=="X10-GAP-EXACT-NETTING");
},"stage-local|publication");
deny("typed edge cannot assert a verified individual federal payment",d=>{
 find(d,"relationships","X10-REL-07").authorized_individual_payment_claimed=true;
},"unbounded");
deny("constitutional Article VII remains historically expired",d=>{
 d.ancestorRecords.get("CONST-US-ART-07").effect_status="operative";
},"constitutional");
