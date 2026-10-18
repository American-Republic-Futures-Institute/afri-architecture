import test from "node:test";
import assert from "node:assert/strict";import fs from "node:fs";
import {FAMILIES,validateX08} from "../scripts/inc08-primary-validation-core.mjs";
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const prev=["model/constitutional/provisions.json","model/federal/executive-departments.json",
 "model/federal/legislative.json","model/federal/x06-accounts.json","model/federal/x06-metrics.json",
 "model/federal/x06-enactments.json","model/federal/x06-gaps.json","model/federal/x07-apportionments.json",
 "model/federal/x07-execution.json","model/federal/x07-tas.json","model/federal/x07-gaps.json"];
const baseline={
 manifest:json("model/federal/manifest.json"),
 collections:Object.fromEntries(FAMILIES.map(x=>[x,json("model/federal/x08-"+x+".json")])),
 ancestors:new Map(prev.flatMap(p=>json(p).items.map(x=>[x.id,x]))),
 ancestorSources:new Map(["model/federal/x06-sources.json","model/federal/x07-sources.json"]
   .flatMap(p=>json(p).items.map(x=>[x.id,x])))
};
baseline.originalBytes=new Map(baseline.collections.sources.items.filter(x=>x.original_body_is_in_git)
 .map(x=>[x.repository_original_path,fs.readFileSync(x.repository_original_path)]));
const result=d=>validateX08(d).errors.join("\n");
const item=(d,k,id)=>{const x=d.collections[k].items.find(v=>v.id===id);assert(x,id);return x};
const deny=(name,fn,msg)=>test(name,()=>{const d=structuredClone(baseline);fn(d);assert.match(result(d),new RegExp(msg,"i"))});
test("canonical four original OMB government files are physically present and exactly hash verifiable",()=>{
 assert.equal(result(baseline),"");
 const report=validateX08(baseline);assert.equal(report.verified_original_OMB_publisher_JSON_bytes,4);
 assert.equal(report.unresolved_operational_or_legal_gates,7);
});
deny("source body missing from repository cannot pass despite receipt digest",d=>{
 d.originalBytes.delete(item(d,"omb-revisions","X08-OMB-REV-01").original_git_path)
},"original byte source missing");
deny("modified one original OMB publisher byte fails SHA256",d=>{
 const k=item(d,"omb-revisions","X08-OMB-REV-04").original_git_path;
 d.originalBytes.set(k,Buffer.from(d.originalBytes.get(k).toString().replace("Program Associate Director","Deputy Associate Director")));
},"original byte source missing");
deny("apportionment source is tied to original official approval timestamp",d=>{
 item(d,"omb-revisions","X08-OMB-REV-04").publisher_approval_timestamp="2025-09-30-00.00.00"
},"dated issuer identity");
deny("actual OMB line 6190 cannot become account annual obligations",d=>{
 item(d,"omb-revisions","X08-OMB-REV-04").line_6190_approved_resources_usd=203144000000
},"amount, dated issuer identity");
deny("official original government publisher cannot be replaced with advocacy index",d=>{
 item(d,"sources","SRC-X08-OMB-11403044").publisher="Protect Democracy Project"
},"issuer/locator");
deny("opening unobligated amount cannot be erased from April annual basis reconciliation",d=>{
 item(d,"omb-revisions","X08-OMB-REV-04").line_1000_brought_forward_unobligated_usd=null
},"amount, dated issuer identity");
deny("do not promote raw official JSON to cryptographically verified official signer",d=>{
 item(d,"sources","SRC-X08-OMB-11424792").source_signature_cryptographically_verified=true
},"issuer/locator");
deny("do not conflate official source document with approved actual FMA and TDA",d=>{
 item(d,"controls","X08-CTRL-VA-FMA-TDA").actual_fy2025_account_signed_document_captured=true
},"signing, allotment");
deny("VA account SF133 and GTAS reconciliation must not be fabricated",d=>{
 item(d,"reconciliations","X08-REC-VA-SF133-GTAS").observed_usd=218641267181
},"accounting comparison");
deny("published OMB April approved plan is not the OMB fiscal-year-end actual resource record",d=>{
 item(d,"reconciliations","X08-REC-OMB-APRIL-VS-ACTUAL").review_status="fully_reconciled_and_paid"
},"dated OMB approved plan");
deny("no claim original Treasury PDF preserved when request redirects to landing page",d=>{
 item(d,"sources","SRC-X08-TREASURY-CS2025-CH42").source_obtained_into_temporary_artifact=true
},"unretrieved Treasury original");
deny("unreviewed OMB signer and WORM approval gate may not be waived",d=>{
 item(d,"gaps","X08-GAP-OMB-SIGNER").verified=true
},"unreviewed OMB signatures");
deny("stage-specific SF133 gap may not disappear even if listed at end",d=>{
 const s=item(d,"traces","X08-TRACE-VA-2025-0102").stages[6];s.record_ids=s.record_ids.filter(x=>x!=="X08-GAP-SF133-GTAS")
},"stage-local evidence qualification");
deny("typed relation may not remove mandatory signed-allotment qualifier",d=>{
 item(d,"relationships","X08-REL-13").qualification_gate_ids=[]
},"independent gate");
deny("original constitutional legal effect cannot be changed by research",d=>{
 d.ancestors.get("CONST-US-ART-07").effect_status="operative"
},"original Constitution altered");
deny("uncaptured institutional immutable replica must not appear independently qualified",d=>{
 d.manifest.federal_primary_execution_custody_08_extension.independent_archival_primary_replica_verified=true
},"extension mutated");
