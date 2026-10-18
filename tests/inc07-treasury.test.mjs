import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {X07_FAMILIES,validateX07} from "../scripts/inc07-treasury-validation-core.mjs";
import {validateX07Schema} from "../scripts/inc07-treasury-envelope-core.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const baseline={
 manifest:read("model/federal/manifest.json"),
 collections:Object.fromEntries(X07_FAMILIES.map(n=>[n,read("model/federal/x07-"+n+".json")])),
 records:new Map(["model/constitutional/provisions.json","model/federal/legislative.json",
 "model/federal/executive-departments.json","model/federal/x06-accounts.json",
 "model/federal/x06-traces.json","model/federal/x06-metrics.json",
 "model/federal/x06-enactments.json","model/federal/x06-gaps.json"]
 .flatMap(p=>read(p).items.map(x=>[x.id,x]))),
 sourceRecords:new Map(["model/federal/x06-sources.json","model/federal/x05-sources.json",
  "model/federal/sources.json"].flatMap(p=>read(p).items.map(x=>[x.id,x])))
};
const schema=read("schemas/inc07-treasury-envelope.schema.json");
const validate=d=>[...validateX07Schema(schema,d.collections).errors,...validateX07(d).errors];
const get=(d,f,id)=>{const x=d.collections[f].items.find(x=>x.id===id);assert(x,id);return x;};
const deny=(name,act,why)=>test(name,()=>{const d=structuredClone(baseline);act(d);assert.match(validate(d).join("\n"),new RegExp(why));});
test("official Treasury cents and VA four-indexed OMB apportionment revisions validate without imaginary disbursements",()=>{
 const out=validate(baseline);assert.deepEqual(out,[]);
 const r=validateX07(baseline);assert.equal(r.fiscal.noYearAuthorityCents,21255257900000);
 assert.equal(r.fiscal.treasuryNetSubtotalCents,20067078336435);
 assert.equal(r.unresolvedRecords,7);
});
deny("Treasury no-year outlays cannot be overwritten by budget obligations",d=>{get(d,"execution","X07-EXEC-2025-NOYEAR").net_outlays_cents=20314400000000},"Treasury exact published");
deny("Treasury legacy FY2020 negative outlays cannot be dropped",d=>{get(d,"execution","X07-EXEC-2025-LEGACY2020").net_outlays_cents=0},"Treasury exact published");
deny("do not make account subtotal a spendable unique TAS",d=>{get(d,"tas","X07-TAS-VA-0102-SUBTOTAL").treasury_symbol_notation="036-X-0102-000"},"component TAS");
deny("do not falsely map current year enactment to a specific beneficiary",d=>{get(d,"tas","X07-TAS-VA-0102-X-000").individual_appropriation_tranche_mapping_verified=true},"component TAS");
deny("indexed OMB dates cannot become independently verified signed SF-132",d=>{get(d,"apportionments","X07-APP-03").OMB_signed_record_verified=true},"secondary OMB apportionment index");
deny("April 2025 index alone cannot create new apportionment amount",d=>{get(d,"apportionments","X07-APP-04").secondary_transcription_budgetary_resources_line_6190_usd=200000000000},"indexed apportionment line amounts");
deny("Dec 2024 resource lines must not be FY2025 actual outlays",d=>{get(d,"apportionments","X07-APP-03").line_6190_is_obligations_or_actual_FY2025_SF133=true},"indexed apportionment line amounts");
deny("VA funds control policy never means a signed actual FMA/TDA",d=>{get(d,"controls","X07-CTRL-ALLOTMENT").actual_FY2025_account_instrument_verified=true},"VA funds-control policy claimed");
deny("AAWS evidence cannot be silently assumed",d=>{get(d,"gaps","X07-GAP-AAWS-TRANSACTION").evidence_received=true},"missing document falsely");
deny("apportionment documentary gap must remain visible",d=>{get(d,"traces","X07-TRACE-VA-2025-0102").stages[2].record_ids=get(d,"traces","X07-TRACE-VA-2025-0102").stages[2].record_ids.filter(x=>x!=="X07-GAP-APPROVED-ASOF")},"missing documentary gap");
deny("qualification array must be explicitly present",d=>{delete get(d,"relationships","X07-REL-14").qualification_gap_ids},"qualification array absent");
deny("mandatory gate cannot be stripped from VA TDA link",d=>{get(d,"relationships","X07-REL-14").qualification_gap_ids=[]},"qualification array absent or altered");
deny("five legal review claims remain false",d=>{get(d,"relationships","X07-REL-19").individual_disbursement_certified=true},"falsely certifies payment");
deny("account cash and unknown signed apportionment have different statuses",d=>{get(d,"traces","X07-TRACE-VA-2025-0102").year_end_final_SF132_authenticated=true},"improperly certified");
deny("2020 outlay difference must not vanish from net totals",d=>{get(d,"execution","X07-EXEC-2025-SUBTOTAL").net_outlays_cents=20069518336435},"Treasury exact published");
deny("secondary index cannot become an authenticated original",d=>{get(d,"sources","SRC-X07-OPENOMB-DEC24").provenance_class="government_publisher_original_pdf_inspected_not_archived"},"secondary apportionment index");
deny("primary Treasury original cannot masquerade as cryptographically archived",d=>{get(d,"sources","SRC-X07-TREASURY-CS25").original_bytes_sha256="f".repeat(64)},"source spoofing or forged");
deny("historical 7 Articles 27 Amendments are immutable",d=>{d.records.get("CONST-US-ART-07").effect_status="operative"},"original constitutional");
deny("five required Treasury headline stages have fixed component identity order",d=>{const t=get(d,"traces","X07-TRACE-VA-2025-0102");t.financial_state_ids[1]="X07-EXEC-2025-SUBTOTAL"},"Treasury cash components or order");
