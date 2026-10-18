import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {SOURCE_PINS,validateFileAOriginals,extractFileAOriginal,parseFileACSV,moneyCents}
 from "../scripts/inc09-filea-source-core.mjs";
const root="evidence/va-fy2025/file-a-originals/sha256/";
const load=(k,ext)=>fs.readFileSync(root+SOURCE_PINS[k].sha+"."+ext);
const fixture={zip:load("ZIP","zip"),csv:load("CSV","csv"),
 snapshot:load("SNAPSHOT","json"),history:load("HISTORY","json")};
const cloned=()=>Object.fromEntries(Object.entries(fixture).map(([k,v])=>[k,Buffer.from(v)]));
test("original Treasury File A ZIP and single CSV are exact SHA-256, 859 compressed bytes and 1943 original CSV bytes",()=>{
 const rows=validateFileAOriginals(fixture).rows;
 assert.equal(rows.length,2);
 assert.equal(extractFileAOriginal(fixture.zip).equals(fixture.csv),true);
 assert.deepEqual(rows.map(x=>x.treasury_account_symbol),["036-2020/2020-0102-000","036-X-0102-000"]);
});
test("source-exact FY2025 File A resource and obligation arithmetic in integer cents",()=>{
 const {rows}=validateFileAOriginals(fixture);
 const current=rows.find(x=>x.availability_type_code==="X");
 const C=k=>moneyCents(current[k]);
 assert.equal(C("budget_authority_unobligated_balance_brought_forward")+
  C("adjustments_to_unobligated_balance_brought_forward_cpe")+
  C("budget_authority_appropriated_amount"),C("total_budgetary_resources"));
 assert.equal(C("obligations_incurred")+C("unobligated_balance"),
  C("total_budgetary_resources"));
 assert.equal(C("total_budgetary_resources"),21784002742926n);
 assert.equal(C("gross_outlay_amount"),20151035530281n);
 const history=validateFileAOriginals(fixture).certification_history;
 assert.equal(history.length,2);
 assert.equal(history[0].publication_date.slice(0,10),"2026-05-15");
});
const wrong=(title,fn,pattern)=>test(title,()=>{
 const x=cloned();fn(x);
 assert.throws(()=>validateFileAOriginals(x),new RegExp(pattern,"i"));
});
wrong("new ZIP publisher response with same file name cannot replace pinned original",x=>{
 x.zip[24]^=0x4f;
},"SHA-256");
wrong("truncated compressed government ZIP cannot be treated as source",x=>{
 x.zip=x.zip.subarray(0,x.zip.length-1);
},"SHA-256|size");
wrong("false opening or prior-year recovery inside original CSV not accepted",x=>{
 x.csv=Buffer.from(x.csv.toString("utf8").replace("24400000.00","24400001.00"));
},"SHA-256|member");
wrong("even original-looking government CSV path must equal ZIP member source bytes",x=>{
 x.csv=Buffer.from(x.csv.toString("utf8").replace("201510355302.81","200670783364.35"));
},"CSV does not equal|original CSV");
wrong("account snapshot totals cannot be substituted or reissued silently",x=>{
 x.snapshot=Buffer.from(x.snapshot.toString().replace("203144226697.36","203144226697.37"));
},"original bytes not hash pinned");
wrong("VA agency FY2025 certified submission metadata cannot be invented",x=>{
 x.history=Buffer.from(x.history.toString().replace("2026-05-15T19:07:25.469881","2025-09-30T19:07:25.469881"));
},"original bytes not hash pinned");
test("unsigned account source may never make a payment through rounding",()=>{
 assert.equal(moneyCents("-24400000.00"),-2440000000n);
 assert.throws(()=>moneyCents("203144226697.369"),/notation/);
});
