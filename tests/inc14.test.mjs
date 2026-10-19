import test from "node:test";
import assert from "node:assert/strict";
import {loadINC14} from "../scripts/validate-inc14.mjs";
import {FAMILIES,validateINC14,validateINC14Schema,projectINC14} from "../scripts/inc14-validation-core.mjs";
const base=loadINC14(),copy=()=>structuredClone(base);
const mutate=(name,fn,expected)=>test(name,()=>{
 const s=copy();fn(s);
 assert.throws(()=>validateINC14(s),expected);
});
const data=(s,f)=>s.data[f].items;
test("12 manifest-registered closed congressional research families with zero ADL1",()=>{
 const r=validateINC14(base);
 assert.equal(r.models,12);assert.equal(r.sources,13);
 assert.equal(r.new_units,8);assert.equal(r.process_stages,14);
 assert.equal(r.conditional_transitions,14);assert.equal(r.published_history_points,3);
 assert.equal(r.complete_denominator,null);assert.equal(r.adl1_count,0);
 assert.equal(r.unqualified_gaps,8);
 assert.doesNotThrow(()=>validateINC14Schema(base.schema,base.data));
 assert.equal(FAMILIES.length,12);
});
test("specific published H.R. 1815 history is not a completed whole-process or appropriation record",()=>{
 assert.deepEqual(data(base,"observations").map(x=>[x.event_kind,x.event_on]),[
  ["house_passage","2025-05-19"],["senate_passage","2025-07-15"],
  ["presidential_approval","2025-07-30"]]);
 assert(data(base,"observations").every(x=>!x.committee_referral_proven&&!x.appropriations_act_proven));
 assert(data(base,"stages").every(x=>!x.completed_for_any_actual_bill));
});
test("precisely typed bicameral stages and constitutionally contingent veto override",()=>{
 const t=data(base,"transitions");
 assert.equal(t.find(x=>x.id==="X14-TRANS-RECONCILE-IDENTICAL").condition,
   "requires_separate_house_and_senate_approval_of_identical_text");
 assert.equal(t.find(x=>x.id==="X14-TRANS-OVERRIDE-PUBLICATION").condition,
   "two_thirds_approval_both_chambers_and_enacted");
 assert(t.every(x=>!x.constitutes_legislative_enactment&&!x.automatic_government_authorization));
 const v=projectINC14(base,"VIEW-X14-PROCESS");
 assert.equal(v.relationships.length,14);
 assert.equal(v.qualified_legal_current_effect,false);
});
test("House/Senate committee parents, subcommittees and selected officer pilot remain source-bounded",()=>{
 const h=projectINC14(base,"VIEW-X14-HOUSE"),s=projectINC14(base,"VIEW-X14-SENATE");
 assert.equal(h.units.length,4);assert.equal(s.units.length,4);
 assert.equal(h.relationships.length,4);assert.equal(s.relationships.length,4);
 assert(h.units.every(x=>x.chamber_id==="ORG-FED-LEG-HOUSE"));
 assert(s.units.every(x=>x.chamber_id==="ORG-FED-LEG-SENATE"));
 assert.equal(h.coverage.whole_congress_entity_denominator,null);
 assert.equal(h.coverage.complete_chamber_office_denominator,null);
 assert(h.unresolved_evidence_gaps.some(x=>/subpoena|hearings/i.test(x.missing_requirement)));
});
test("appropriation legislative control cannot be reinterpreted as an executed VA payment",()=>{
 const v=projectINC14(base,"VIEW-X14-FISCAL");
 assert.equal(v.relationships.length,4);
 assert(v.relationships.every(x=>x.legislative_committee_cannot_disburse));
 assert(v.relationships.every(x=>x.signed_executive_allotment===false&&
   x.payment_verified===false&&x.specific_enacted_TAS_id===null));
 assert.throws(()=>projectINC14(base,"VIEW-X14-UNSUPPORTED"),/unknown INC14/);
});
mutate("reject cross-chamber subcommittee assignment",s=>data(s,"nodes")[2].parent_id="X14-NODE-SENATE-APP",/institutional unit/);
mutate("reject invented committee",s=>data(s,"nodes").push(structuredClone(data(s,"nodes")[0])),/bounded source record|duplicate/);
mutate("reject committee directory substituted for adopted House rules",s=>{data(s,"instruments")[1].source_ids=["X14-SRC-HOUSE-COMMITTEES"]},/governing instrument/);
mutate("reject committee jurisdiction promoted to direct supervision",s=>data(s,"relationships")[0].supervision_power_verified=true,/fixed qualification/);
mutate("reject enacted individual delegation invented",s=>data(s,"relationships")[0].signed_delegation_verified=true,/fixed qualification/);
mutate("reject historical source date shifted",s=>data(s,"observations")[0].event_on="2026-10-19",/legislative history/);
mutate("reject fabricated Senate passage",s=>data(s,"observations")[1].event_kind="senate_committed",/legislative history/);
mutate("reject purported full bill action chain",s=>data(s,"coverage")[0].fully_audited_specific_measure_workflows=1,/fixed qualification/);
mutate("reject complete committee roster certification",s=>data(s,"coverage")[0].complete_119th_committee_roster_verified=true,/fixed qualification/);
mutate("reject claimed census denominator",s=>data(s,"coverage")[0].whole_congress_entity_denominator=1000,/fixed qualification/);
mutate("reject ADL1 research promotion",s=>data(s,"coverage")[0].adl1_certified_count=8,/fixed qualification/);
mutate("reject direct VA spending from House committee record",s=>data(s,"fiscal")[0].payment_verified=true,/fixed qualification/);
mutate("reject actual enacted TAS without original evidence",s=>data(s,"fiscal")[2].specific_enacted_TAS_id="036-0102",/fixed qualification/);
mutate("reject source substitution on same official host",s=>data(s,"sources")[0].url="https://constitution.congress.gov/browse/article-2/",/source locator/);
mutate("reject unauthorized official source SHA",s=>data(s,"sources")[0].original_sha256="0".repeat(64),/fixed qualification/);
mutate("reject missing source family registration",s=>{s.manifest.models=s.manifest.models.filter(x=>x!=="model/federal/x14-gaps.json")},/manifest-registered/);
mutate("reject suppressed oversight qualification gap",s=>data(s,"gaps").shift(),/evidence gaps/);
mutate("reject independent approval fabricated",s=>data(s,"gaps")[0].independent_signoff=true,/fixed qualification/);
mutate("reject legal status ratification",s=>{s.manifest.release_status="ratified"},/ratification/);
mutate("reject changed lawmaking stage actorship",s=>data(s,"stages")[0].actor_ref_id="ORG-FED-EXE-PRESIDENT",/stage actor/);
mutate("reject automatic presentment grant",s=>data(s,"transitions")[0].automatic_government_authorization=true,/fixed qualification/);
mutate("reject one chamber sufficient for enactment",s=>data(s,"transitions").find(x=>x.id==="X14-TRANS-RECONCILE-IDENTICAL").condition="senate_only",/transition/);
mutate("reject invented Senate veto override with simple majority",s=>data(s,"transitions").find(x=>x.id==="X14-TRANS-OVERRIDE-PUBLICATION").condition="simple_majority",/transition/);
mutate("reject falsely enacted HR 1815 as FY2025 appropriations",s=>data(s,"observations")[2].appropriations_act_proven=true,/fixed qualification/);
mutate("reject extra power-bearing model field",s=>{data(s,"nodes")[0].has_executive_command=true},/unexpected field/);
mutate("reject historical committee succession without review",s=>data(s,"history")[0].committee_succession_inferred=true,/fixed qualification/);
mutate("reject no-data review promoted into whole-congress model",s=>data(s,"views")[0].complete_congress_scope_certified=true,/fixed qualification/);
mutate("reject separately unverified DoD committee status",s=>s.dod[0].current_committee_rules_verified=true,/inherited DOD/);
