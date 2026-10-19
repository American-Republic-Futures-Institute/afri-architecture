import test from "node:test";
import assert from "node:assert/strict";
import {loadInc11} from "../scripts/validate-inc11.mjs";
import {validateINC11,validateInc11Schema,projectINC11} from "../scripts/inc11-validation-core.mjs";
const base=loadInc11();
const clone=()=>structuredClone(base);
const errors=d=>validateINC11(d).errors.join("\n");
const corrupt=(title,fn,match)=>test(title,()=>{
 const d=clone();fn(d);assert.match(errors(d),match);
});
test("registered research families and strict schema pass without legal signoff",()=>{
 const result=validateINC11(base);assert.deepEqual(result.errors,[]);
 assert.equal(result.checked_families,6);assert.equal(result.checked_claims,6);
 assert.equal(result.checked_records,23);
 assert.deepEqual(validateInc11Schema(base.schema,base.collections).errors,[]);
});
test("viewpoints retain sourced roots, unresolved legal gates and deny authority certification",()=>{
 for(const v of base.collections.viewpoints.items){
  const p=projectINC11(base.collections,v.id);
  assert.equal(p.root_id,v.root_id);assert.equal(p.authority_certified,false);
  assert.equal(p.claims.length,v.claim_ids.length);
  assert.ok(p.unresolved_qualifications.length>=2);
  assert.ok(p.claims.every(c=>c.assertion_status==="source_bounded_research_unratified"));
 }
 assert.throws(()=>projectINC11(base.collections,"VIEW-X11-NOT-REAL"),/Unknown/);
});
corrupt("missing canonical collection is rejected",d=>{delete d.collections.offices},/family, version or manifest|schema/);
corrupt("unregistered collection is rejected",d=>{d.manifest.models=d.manifest.models.filter(p=>p!=="model\/federal\/x11-claims.json")},/manifest registration/);
corrupt("record injection violates closed JSON Schema",d=>{d.collections.offices.items[0].admin_can_command=true},/unknown property/);
corrupt("unrelated actor cannot replace statutory headship target",d=>{d.collections.claims.items[0].to_id="ORG-FED-LEG-HOUSE"},/exemplar source-backed claim changed/);
corrupt("internal policy cannot authorize statutory headship",d=>{d.collections.claims.items[0].instrument_id="X11-INST-VA-FUNDS-2024"},/exemplar source-backed claim changed|invalid authority edge/);
corrupt("substituted source provenance is rejected",d=>{d.collections.instruments.items[0].source_ids=["SRC-X07-VA-FUNDS2024"]},/classification altered/);
corrupt("unknown source reference fails closed",d=>{d.collections.offices.items[0].source_ids=["SRC-FAKE-2026"]},/unreferenced office source/);
corrupt("unearned role-specific fiscal delegation forbidden",d=>{d.collections.offices.items[0].individual_delegation_verified=true},/schema constant|unearned powers/);
corrupt("policy cannot become codified statute",d=>{d.collections.instruments.items[3].instrument_kind="codified_statute"},/classification altered|agency policy/);
corrupt("agency approval cannot become signed delegation",d=>{d.collections.events.items[0].individual_delegation_event_verified=true},/schema constant|promoted to authority/);
corrupt("changed fiscal availability rejected",d=>{d.collections.instruments.items[1].fiscal_availability_from="2025-10-01"},/classification altered/);
corrupt("fabricated internal policy approval date rejected",d=>{d.collections.events.items[0].event_on="2023-07-17"},/policy event promoted/);
corrupt("unresolved signed execution gate cannot become verified",d=>{d.collections.gaps.items[2].verified=true},/schema constant|gap concealed/);
corrupt("institutional legal signoff cannot be added via manifest",d=>{d.manifest.federal_office_policy_authority_11_extension.independent_legal_review_complete=true},/manifest extension/);
corrupt("dropping evidence qualifications rejected",d=>{d.collections.claims.items[2].qualification_gap_ids=[]},/array too short|invalid authority edge/);
corrupt("duplicate qualifications rejected",d=>{d.collections.claims.items[0].qualification_gap_ids.push("X11-GAP-VA-DELEGATION")},/duplicate array member|invalid authority edge/);
corrupt("invalid calendar date rejected",d=>{d.collections.offices.items[0].reference_as_of="2026-02-31"},/invalid dated office/);
corrupt("unknown view root rejected",d=>{d.collections.viewpoints.items[1].root_id="X11-OFFICE-NONEXISTENT"},/missing root/);
corrupt("claim cannot invent individual payment",d=>{d.collections.claims.items[1].individual_government_action_verified=true},/schema constant|unearned power/);
corrupt("official position is not an individual incumbent",d=>{d.collections.offices.items[0].named_incumbent_id="PERSON-UNVERIFIED"},/schema constant|unearned powers/);
