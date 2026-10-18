import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {FAMILIES,validateInc09} from "../scripts/inc09-fiscal-validation-core.mjs";
import {SOURCE_PINS} from "../scripts/inc09-filea-source-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const ancestry=[
 "model/constitutional/provisions.json","model/federal/x06-accounts.json","model/federal/x06-metrics.json",
 "model/federal/x07-execution.json","model/federal/x07-apportionments.json",
 "model/federal/x08-omb-revisions.json","model/federal/x08-traces.json","model/federal/x08-gaps.json"];
const root="evidence/va-fy2025/file-a-originals/sha256/";
const original=Object.fromEntries([["ZIP","zip"],["CSV","csv"],["SNAPSHOT","json"],["HISTORY","json"]]
 .map(([k,ext])=>[k.toLowerCase(),fs.readFileSync(root+SOURCE_PINS[k].sha+"."+ext)]));
const baseline={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(FAMILIES.map(n=>[n,read("model/federal/x09-"+n+".json")])),
 raw:original,ancestorRecords:new Map(ancestry.flatMap(p=>read(p).items.map(v=>[v.id,v]))),
 ancestorSources:new Map(["model/federal/x06-sources.json","model/federal/x07-sources.json",
   "model/federal/x08-sources.json"].flatMap(p=>read(p).items.map(v=>[v.id,v])))
};
function clone(){
 const x=structuredClone(baseline);
 x.raw=Object.fromEntries(Object.entries(original).map(([k,v])=>[k,Buffer.from(v)]));
 return x;
}
const rec=(d,k,id)=>{
 const x=d.collections[k].items.find(z=>z.id===id);assert(x,id);return x;
};
const deny=(title,change,pattern)=>test(title,()=>{
 const d=clone();change(d);
 const failures=validateInc09(d).errors.join("\n");
 assert.match(failures,new RegExp(pattern,"i"),"must reject "+title);
});
test("official Treasury File A and OMB+Treasury crosswalks are verified while signing gates remain open",()=>{
 const report=validateInc09(clone());
 assert.deepEqual(report.errors,[]);
 assert.equal(report.counts["file-a-rows"],2);
 assert.equal(report.counts.reconciliations,9);
 assert.equal(report.counts.relationships,18);
 assert.equal(report.mandatory_unresolved_gates,8);
 assert.equal(report.fiscal.resources,21784002742926);
 assert.equal(report.fiscal.gross_outlay,20151035530281);
});
test("April OMB plan-vs-FileA exact bridge is arithmetic and not authorization",()=>{
 const model=rec(clone(),"reconciliations","X09-REC-OMB-APRIL-PLAN-BRIDGE");
 const n=model.amounts_cents;
 assert.equal(n.OMB_approved_plan_resources-n.FileA_reported_resources,80123975174);
 assert.equal(n.OMB_anticipated_prior_recoveries-n.FileA_reported_prior_recoveries,80123975147);
 assert.equal(n.OMB_rounded_opening_balance-n.FileA_reported_opening_balance,27);
 assert.equal(n.estimated_vs_reported_recoveries_difference+n.opening_precision_difference,n.total_difference);
 assert.equal(model.SF133_GTAS_original_matched,false);
});
deny("published File A original budgetary resources cannot be overwritten with OMB plan",d=>{
 rec(d,"file-a-rows","X09-FILEA-VA-2025-NOYEAR").total_budgetary_resources_cents=21864126718100;
},"financial statement diverges");
deny("File A source original must not promote gross outlays to Treasury net",d=>{
 rec(d,"file-a-rows","X09-FILEA-VA-2025-NOYEAR").gross_outlay_cents=20067078336435;
},"financial statement diverges|Treasury");
deny("historic FY2020 subperiod must remain independently recorded",d=>{
 rec(d,"file-a-rows","X09-FILEA-VA-2025-LEGACY2020").prior_year_deobligations_recoveries_refunds_cents=0;
},"financial statement diverges");
deny("File A government PDF or ZIP origin can not be substituted by nonpublisher source",d=>{
 rec(d,"sources","SRC-X09-TREASURY-FILEA-ZIP").government_publisher_url="https://third-party.example/report.zip";
},"source origin");
deny("raw VA File A CSV cannot be represented as independently signed SF133",d=>{
 rec(d,"sources","SRC-X09-TREASURY-FILEA-CSV").is_signed_SF133_original=true;
},"unsigned source limitations|source origin");
deny("actual specific VA FMA and TDA cannot be inferred from aggregate File A",d=>{
 rec(d,"controls","X09-CTRL-VA-ALLOTMENT").specific_original_acquired=true;
},"signed agency");
deny("raw original agency GTAS was not retrieved by the Treasury File A download",d=>{
 rec(d,"controls","X09-CTRL-GTAS").specific_original_acquired=true;
},"signed agency");
deny("true SF133 receipt may not be added without its own source original",d=>{
 rec(d,"gaps","X09-GAP-SF133-GTAS").verified=true;
},"false qualification");
deny("independent File A signature cannot be inferred from agency certification timestamps",d=>{
 rec(d,"traces","X09-TRACE-VA-FY2025-0102").file_specific_certifying_official_signature_verified=true;
},"unearned account source approval");
deny("cross-class April projected recovery difference cannot be erased by invented reconciliation",d=>{
 rec(d,"reconciliations","X09-REC-OMB-APRIL-PLAN-BRIDGE").amounts_cents.total_difference=0;
},"temporal class|arithmetic");
deny("gross versus net observed delta cannot be claimed a source-confirmed accounting transfer",d=>{
 rec(d,"reconciliations","X09-REC-GROSS-VS-NET-UNRECONCILED").amounts_cents.gross_minus_net_difference=0;
},"temporal class|net versus");
deny("OMB resource rounding disagreement must remain visible",d=>{
 rec(d,"reconciliations","X09-REC-OMB-RESOURCES-ROUNDED-DIVERGENCE").amounts_cents.difference=0;
},"temporal class|discrepancies");
deny("missing period-specific SF133 gate cannot be hidden from its stage",d=>{
 rec(d,"traces","X09-TRACE-VA-FY2025-0102").stages[6].record_ids=
 rec(d,"traces","X09-TRACE-VA-FY2025-0102").stages[6].record_ids.filter(x=>x!=="X09-GAP-SF133-GTAS");
},"stage scope|missing stage");
deny("typed finance link may not omit VA FMA-TDA signature qualification",d=>{
 rec(d,"relationships","X09-REL-13").qualification_gap_ids=[];
},"typed relationship");
deny("File A repo immutable signing must not be silently ratified",d=>{
 d.manifest.federal_va_account_reporting_09_extension.institutionally_approved_immutable_source_custody=true;
},"unearned signer");
deny("Article VII temporal validity unaffected by FileA fiscal statements",d=>{
 d.ancestorRecords.get("CONST-US-ART-07").effect_status="operative";
},"constitutional");
deny("source archive original ZIP cannot be swapped with a new archive even when model is unchanged",d=>{
 d.raw.zip[36]^=0x01;
},"original government publisher ZIP");
