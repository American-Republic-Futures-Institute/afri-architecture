import test from "node:test";
import assert from "node:assert/strict";
import {loadINC14C} from "../scripts/validate-inc14c.mjs";
import {validateINC14C,validateINC14CSchema,projectINC14C} from "../scripts/inc14c-validation-core.mjs";
const base=loadINC14C(),clone=()=>structuredClone(base);
const rows=(s,f)=>s.data[f].items;
const negative=(label,fn,pattern)=>test(label,()=>{
 const s=clone();fn(s);assert.throws(()=>validateINC14C(s),pattern);
});
test("publication has 12 separately registered research families and no promoted ADL1",()=>{
 const r=validateINC14C(base);
 assert.equal(r.families,12);
 assert.equal(r.source_records,15);
 assert.equal(r.house_subcommittees,12);
 assert.equal(r.senate_subcommittees,12);
 assert.equal(r.procedural_rule_granules,7);
 assert.equal(r.real_roll_calls,4);
 assert.equal(r.official_public_law_approval_records,1);
 assert.equal(r.whole_congress_complete,false);
 assert.equal(r.adl1_certified,0);
 assert.equal(r.actual_executive_payments_verified,0);
 validateINC14CSchema(base.schema,Object.fromEntries(Object.entries(base.data).map(([f,x])=>[f,x.items])));
});
test("119th House and Senate Appropriations source-slices are reconciled without double-counting MilCon",()=>{
 const u=rows(base,"units"),d=rows(base,"denominators");
 assert.equal(u.length,24);
 assert.equal(u.filter(x=>x.preexisting_canonical_id!==null).length,2);
 assert.equal(u.filter(x=>x.chamber_id==="ORG-FED-LEG-HOUSE").length,12);
 assert.equal(u.filter(x=>x.chamber_id==="ORG-FED-LEG-SENATE").length,12);
 assert(u.some(x=>x.id==="X14-NODE-HOUSE-MILCON"));
 assert(u.some(x=>x.id==="X14-NODE-SENATE-MILCON"));
 assert.equal(d.length,2);
 assert(d.every(x=>x.publisher_listing_count===12&&x.complete_chamber_committee_roster_denominator===null));
 assert(u.some(x=>x.name==="National Security, Department of State, and Related Programs"));
 assert(u.some(x=>x.name==="State, Foreign Operations, and Related Programs"));
});
test("House X versus Senate XXV/XXVI powers and oversight are typed separately",()=>{
 const rules=rows(base,"rules"),oversight=rows(base,"oversight");
 assert.equal(rules.filter(x=>x.chamber_id==="ORG-FED-LEG-HOUSE").length,3);
 assert.equal(rules.filter(x=>x.chamber_id==="ORG-FED-LEG-SENATE").length,4);
 assert(oversight.some(x=>x.actor_id==="ORG-FED-LEG-GAO"));
 assert(oversight.some(x=>x.actor_id==="ORG-FED-LEG-CBO"));
 assert(oversight.every(x=>!x.subpoena_actually_issued&&!x.executive_supervision_proven));
});
test("two House votes and two Senate votes are individually anchored to original publisher roll numbers",()=>{
 const rows0=rows(base,"actions").filter(x=>x.roll_call_number!==null);
 assert.deepEqual(rows0.map(x=>[x.roll_call_number,x.yeas,x.nays]),[
  [281,217,212],[616,60,40],[618,60,40],[285,222,209]]);
 assert(rows0.every(x=>x.record_level==="official_chamber_roll_call"&&
  !x.committee_referral_verified&&!x.original_binary_retained));
 const pub=rows(base,"actions").find(x=>x.action_kind==="presidential_approval_record");
 assert.equal(pub.action_on,"2025-11-12");assert.equal(pub.source_ids[0],"X14C-SRC-GOVINFO-37");
});
test("enacted FY2026 Division D has no established VA TAS, signed allotment, payee or FY2025 substitution",()=>{
 const f=rows(base,"fiscal")[0],m=rows(base,"measure")[0];
 assert.equal(m.public_law,"119-37");assert.equal(m.appropriations_division,"D");
 assert.equal(f.fiscal_year,2026);assert.equal(f.appropriations_authority_status,"enacted_published_division_D");
 assert.equal(f.specific_budget_account_TAS,null);assert.equal(f.enacted_account_amount_cents,null);
 assert.equal(f.payment_id,null);assert.equal(f.signed_allotment_identifier,null);
 assert.equal(f.fy2025_VA_lineage_misrepresented,false);
});
test("five bounded publication projections have sources, qualifications and NO certified congressional ADL1",()=>{
 const views=rows(base,"views");
 assert.equal(views.length,5);
 for(const v of views){
  const p=projectINC14C(base,v.id);
  assert.equal(p.research_only,true);
  assert(p.units.length>0);
  assert.equal(p.adl1_certified,false);
  assert.equal(p.executive_payments_verified,0);
  assert.equal(p.qualification_gaps.length,8);
 }
 assert.throws(()=>projectINC14C(base,"VIEW-X14C-FAKE"),/unregistered view/);
});
negative("reject false global chamber denominator",s=>rows(s,"denominators")[0].current_global_chamber_office_denominator=36,/locked schema qualification/);
negative("reject inflated Appropriations subcommittee count",s=>rows(s,"denominators")[0].publisher_listing_count=13,/source-specific page denominator/);
negative("reject duplicate subcommittee",s=>rows(s,"units").push(structuredClone(rows(s,"units")[0])),/count\/duplicate identity/);
negative("reject a fabricated congressional committee",s=>rows(s,"units")[0].id="X14C-UNIT-HOUSE-FAKE",/source anchor changed|source anchor/);
negative("reject cross-Senate subcommittee placement under House",s=>rows(s,"units")[0].parent_id="X14-NODE-SENATE-APP",/source anchor changed/);
negative("reject invented current subcommittee legal jurisdiction",s=>rows(s,"units")[0].current_rules_jurisdiction_certified=true,/locked schema qualification/);
negative("reject invented executive control by committee",s=>rows(s,"units")[0].executive_supervision_inferred=true,/locked schema qualification/);
negative("reject claimed full House roster",s=>rows(s,"denominators")[0].complete_current_legal_roster_qualified=true,/locked schema qualification/);
negative("reject invented ADL1 of subcommittee",s=>rows(s,"units")[0].adl1_certified=true,/locked schema qualification/);
negative("reject House Rule X shifted to Senate Rule XXV",s=>rows(s,"rules")[0].locator="Senate Rule XXV",/procedural pinpoint source anchor changed|pinpoint/);
negative("reject a draft procedural rule treated as current executed action",s=>rows(s,"rules")[0].individual_action_executed=true,/locked schema qualification/);
negative("reject subpoena claimed actually issued",s=>rows(s,"oversight")[2].subpoena_actually_issued=true,/locked schema qualification/);
negative("reject hearing equated to executive supervision",s=>rows(s,"oversight")[1].executive_supervision_proven=true,/locked schema qualification/);
negative("reject full H.R.5371 referral history fabricated",s=>rows(s,"measure")[0].committee_referral_chain_verified=true,/locked schema qualification/);
negative("reject congressional roll call date shifted",s=>rows(s,"actions")[0].action_on="2025-09-20",/roll call.*source anchor changed|vote or approval/);
negative("reject Senate amendment misidentified as passage",s=>rows(s,"actions")[1].action_kind="senate_passage_as_amended",/vote or approval source anchor changed/);
negative("reject House vote reversed",s=>rows(s,"actions")[0].yeas=212,/vote or approval source anchor changed/);
negative("reject appropriation treated as automatically executable",s=>rows(s,"fiscal")[0].authorized_executive_payment_inferred=true,/locked schema qualification/);
negative("reject FY2026 VA payment made up",s=>rows(s,"fiscal")[0].payment_id="FAKE-PAYEE-001",/fiscal authority/);
negative("reject FY2025 VA account reused without crosswalk",s=>rows(s,"fiscal")[0].fy2025_VA_lineage_misrepresented=true,/locked schema qualification/);
negative("reject claimed full original signed presidential custody",s=>rows(s,"actions")[4].signed_presidential_instrument_independently_reconciled=true,/locked schema qualification/);
negative("reject external URL substitution on same publisher host",s=>rows(s,"sources")[0].url="https://clerk.house.gov/FAKE-COMMITTEES",/source locator/);
negative("reject fabricated original source SHA custody",s=>rows(s,"sources")[0].original_sha256="a".repeat(64),/locked schema qualification/);
negative("reject DoD naming treated as verified committee rules",s=>rows(s,"crosswalks")[0].current_committee_rules_qualified=true,/locked schema qualification/);
negative("reject historical successor asserted without original instrument",s=>rows(s,"history")[0].legal_succession_reconciliation_complete=true,/locked schema qualification/);
negative("reject hidden unresolved requirement",s=>rows(s,"gaps").pop(),/human qualification|gap/);
negative("reject fabricated independent approval",s=>rows(s,"gaps")[0].independent_signoff=true,/locked schema qualification/);
negative("reject unregistered model family",s=>{s.manifest.models=s.manifest.models.filter(x=>x!=="model/federal/x14c-rules.json")},/missing or duplicated family/);
negative("reject untrusted hidden field",s=>{rows(s,"units")[0].executive_budget_signature=true},/unexpected or missing field/);
negative("reject publication claims complete congressional coverage",s=>rows(s,"views")[0].full_congress_current_roster_claim=true,/locked schema qualification/);
negative("reject research baseline ratification by manifest",s=>s.manifest.release_status="ratified",/manifest qualification/);
