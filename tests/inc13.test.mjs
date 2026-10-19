import test from "node:test";
import assert from "node:assert/strict";
import {loadINC13} from "../scripts/validate-inc13.mjs";
import {FAMILIES,validateINC13,inspectINC13Schema,projectINC13} from "../scripts/inc13-validation-core.mjs";
const baseline=loadINC13();
const cloned=()=>structuredClone(baseline);
const errors=s=>validateINC13(s).errors.join("; ");
const breaks=(name,mutate,match)=>test(name,()=>{
 const s=cloned();mutate(s);assert.match(errors(s),match);
});
const items=(s,k)=>s.data[k].items;
test("source-bounded EOP/FTC pilots preserve 28 selected references and zero ADL1",()=>{
 const r=validateINC13(baseline);
 assert.deepEqual(r.errors,[]);
 assert.equal(r.checked_families,7);assert.equal(r.sources,10);
 assert.equal(r.observed_units,13);assert.equal(r.typed_relationships,14);
 assert.deepEqual(r.pilot_groups.map(c=>c.selected_references),[10,18]);
 assert.deepEqual(r.pilot_groups.map(c=>c.source_sliced_units),[7,6]);
 assert(r.pilot_groups.every(c=>c.official_complete_denominator===null&&c.qualified_adl1===0));
 assert.deepEqual(inspectINC13Schema(baseline.schema,baseline.data),[]);
});
test("OMB statutory section differs from its agency descriptive directory",()=>{
 const omb=projectINC13(baseline,"VIEW-X13-OMB");
 assert.equal(omb.root_id,"ORG-FED-EXE-EOP-OMB");
 assert.equal(omb.relationships.length,8);
 assert.equal(omb.relationships.filter(x=>x.relationship_type==="statutory_office_location").length,4);
 const oira=omb.relationships.find(x=>x.from_id==="X13-UNIT-OMB-OIRA");
 assert.deepEqual(oira.source_ids,["X13-SRC-USC31-505","X13-SRC-USC44-3503"]);
 assert.equal(omb.coverage.complete_pilot_first_level_denominator,null);
 assert(omb.gaps.some(x=>/delegation/i.test(x.missing_requirement)));
 assert.equal(omb.signed_delegations_confirmed,0);
});
test("FTC bureau listing and statutory commission are different source propositions",()=>{
 const ftc=projectINC13(baseline,"VIEW-X13-FTC");
 assert.equal(ftc.root_id,"ORG-FED-EXE-IND-FTC");
 assert.equal(ftc.units.length,6);assert.equal(ftc.relationships.length,6);
 assert.equal(ftc.relationships.filter(x=>x.relationship_type==="statutory_commission_composition").length,1);
 assert.equal(ftc.relationships.filter(x=>x.relationship_type==="publisher_listed_organizational_component").length,5);
 assert.equal(ftc.current_full_roster_denominator,null);
 assert.equal(ftc.adl1_certified,false);
 assert.throws(()=>projectINC13(baseline,"VIEW-X13-FAKE"),/Unknown/);
});
test("current legal effects, leadership roles and historical succession remain expressly unverified",()=>{
 assert(items(baseline,"units").every(u=>u.canonical_match_id===null&&u.external_agency_identifier===null));
 assert(items(baseline,"relationships").every(r=>!r.signed_delegation_verified&&
  !r.current_direct_supervision_verified&&!r.operational_command_verified));
 assert(items(baseline,"events").every(e=>e.no_new_canonical_identity&&
  !e.confirmed_complete_legal_succession&&!e.signed_original_verified));
 assert(items(baseline,"sources").every(s=>s.original_bytes_sha256===null));
});
breaks("deny invented signed delegation",s=>{items(s,"relationships")[0].signed_delegation_verified=true},/schema const mismatch|relationship/);
breaks("deny certification of direct supervision",s=>{items(s,"relationships")[1].current_direct_supervision_verified=true},/schema const mismatch|relationship/);
breaks("deny operational command",s=>{items(s,"units")[0].confirmed_operational_command=true},/schema const mismatch|unit/);
breaks("deny unapproved ADL1",s=>{items(s,"units")[0].adl1_certified=true},/schema const mismatch|unit/);
breaks("deny qualified current institutional inventory",s=>{items(s,"coverage")[0].complete_pilot_first_level_denominator=7},/schema const mismatch|denominator/);
breaks("deny artificial official denominator",s=>{items(s,"coverage")[1].complete_government_family_denominator=18},/schema const mismatch|denominator/);
breaks("deny omitted source record",s=>{items(s,"units").pop()},/source-slice count drift|unit/);
breaks("deny duplicate record ID",s=>{items(s,"units")[1].id=items(s,"units")[0].id},/duplicate record identity|duplicate/);
breaks("deny unknown model field",s=>{items(s,"units")[0].authority_verified=true},/unexpected schema field/);
breaks("deny swapped OMB/FTC source parent",s=>{items(s,"units")[0].observed_parent_id="ORG-FED-EXE-IND-FTC"},/unit improperly/);
breaks("deny policy directory promoted to statute",s=>{items(s,"relationships")[1].relationship_type="statutory_office_location"},/statutory office|agency descriptive|publisher directory represented as legally authoritative/);
breaks("deny fabricated review",s=>{s.manifest.federal_eop_independent_structure_13_extension.independently_corroborated_legal_authority=true},/manifest claims/);
breaks("deny historical successor equivalence",s=>{items(s,"events")[0].confirmed_complete_legal_succession=true},/schema const mismatch|historic/);
breaks("deny historical original signing",s=>{items(s,"events")[1].signed_original_verified=true},/schema const mismatch|historic/);
breaks("deny fake official source domain",s=>{items(s,"sources")[0].url="https://uscode.example.com/fake"},/source URL/);
breaks("deny fake original source digest",s=>{items(s,"sources")[0].original_bytes_sha256="0".repeat(64)},/schema const mismatch|source URL/);
breaks("deny missing mandatory schema family",s=>{delete s.schema.$defs.relationships},/invalid closed schema|unqualified closed schema/);
breaks("deny silent extra enum value",s=>{items(s,"units")[0].observation_class="assumed_delegated_command"},/schema enum mismatch/);
breaks("deny local ratification by manifest",s=>{s.manifest.release_status="ratified"},/baseline must remain unratified/);
breaks("deny non-reviewed FTC executive control assertion",s=>{items(s,"gaps")[3].confirmed_resolved=true},/schema const mismatch|qualification/);
