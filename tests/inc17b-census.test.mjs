import test from "node:test";
import assert from "node:assert/strict";
import {loadCensus,validateCensus} from "../scripts/inc17b-census-core.mjs";
const source=loadCensus();
const clean=()=>structuredClone(source);
function reject(name,mutate,expect){
 test(name,()=>{
  const d=clean();mutate(d);
  const res=validateCensus(d);
  assert.match(res.errors.join(" | "),expect,"Census validation must deny forged institutional claim");
 });
}
test("INC-17B validates all source editions, original XML bytes, source partitions and non-admission",()=>{
 const r=validateCensus(clean());
 assert.deepEqual(r.errors,[]);
 assert.equal(r.summary.canonicalAnchors,61);
 assert.equal(r.summary.cabinetRoots,15);
 assert.equal(r.summary.publisherEntries,231);
 assert.equal(r.summary.publisherProvisional,50);
 assert.equal(r.summary.sourceOnlyDispositions,88);
 assert.equal(r.summary.unresolved,93);
 assert.equal(r.summary.publisherDirectCabinetCandidates,63);
 assert.equal(r.summary.publisherDeeperCabinetObservations,39);
 assert.equal(r.summary.cabinetRootsWithoutPublisherChildren,5);
 assert.equal(r.summary.initialAdditionalCohorts,5);
 assert.equal(r.summary.stateJurisdictions,50);
 assert.equal(r.summary.statePilots,2);
 assert.equal(r.summary.statePilotInstitutions,19);
 assert.equal(r.summary.unqualifiedCurrentLegalDenominator,null);
 assert.equal(r.summary.atlasAdmitted,false);
});
reject("Original 2025 Government Manual bytes must replay against immutably recorded SHA",d=>{
 d.sourceOriginalBytes[30]^=1;
},/Original archived publisher XML/);
reject("Cannot manufacture a legally complete 2026 federal institutional denominator",d=>{
 d.models.coverage.current_government_population_denominator=231;
},/coverage denominator or legal nonpromotion/);
reject("Cannot treat the 15 federal departments as 15 fully qualified first-level structures",d=>{
 d.models.departments.items[0].complete_current_first_level_roster_qualified=true;
},/False ADL1|schema field/);
reject("Cannot turn a source directory gap into the absence of real offices",d=>{
 d.models.departments.items.find(x=>x.govman_direct_source_count===0).coverage_gap="no_agency_components_exist";
},/False ADL1|Cabinet breadth|schema field/);
reject("Department source name alone cannot assign actual military command",d=>{
 d.models.departments.items[0].source_nesting_is_not_supervision_or_military_command=false;
},/False ADL1|schema field/);
reject("Publisher source-parent relations cannot become 2026 legal supervision",d=>{
 d.models.observations.items.find(x=>x.publisher_parent_key).legal_supervision_or_delegation_asserted=true;
},/Publisher source-only observation promoted|schema field/);
reject("Publisher-only entry cannot be assigned an unreviewed canonical identity",d=>{
 d.models.observations.items.find(x=>x.accounting_partition==="source_only_disposition").provisional_canonical_candidate_id="ORG-FED-EXE-DEP-STATE";
},/Publisher observation or candidate identity/);
reject("Previously provisional link cannot silently become certified legal identity",d=>{
 d.models.observations.items.find(x=>x.accounting_partition==="provisional_name_or_alias").candidate_identity_independently_certified=true;
},/Publisher source-only observation promoted|schema field/);
reject("All 88 individually documented source-only dispositions retain exact pointers",d=>{
 d.models.observations.items.find(x=>x.accounting_partition==="source_only_disposition").prior_source_only_disposition_id="INC15D9-DISP-FAKE";
},/Publisher observation or candidate identity/);
reject("Unknown 93 observations cannot be silently disposed or linked",d=>{
 d.models.observations.items.find(x=>x.accounting_partition==="unresolved_without_disposition").accounting_partition="source_only_disposition";
},/Publisher observation or candidate identity/);
reject("Historical Government Manual observation cannot be relabeled as live 2026 agency census",d=>{
 d.models.observations.legal_currentness_verified=true;
},/Missing archival source contract|schema field/);
reject("Federal canonical institution identifiers and recorded catalog links are immutable",d=>{
 d.models.anchors.items[0].source_catalog_parent_id="ORG-FED-EXE-DEP-DEFENSE";
},/Core canonical identity|schema field/);
reject("Congressional oversight cannot be recast as executive chain of command",d=>{
 d.models.boundaries.items.find(x=>x.original_relationship_id==="REL-FED-0090").semantic_boundary="executive_reporting_command";
},/Existing directed legal|schema field/);
reject("Federal appeals are jurisdictional, not management-supervision",d=>{
 d.models.boundaries.items.find(x=>x.original_relationship_id==="REL-FED-0096").legal_command_or_control_inferred=true;
},/Existing directed legal|schema field/);
reject("State reserved powers cannot be remapped as federal agency delegation",d=>{
 d.models.boundaries.items.find(x=>x.original_relationship_id==="STATE-FED-LINK-0001").semantic_boundary="federal_command_of_virginia";
},/Existing directed legal|schema field/);
reject("Virginia must never be a subordinate federal department",d=>{
 d.models.jurisdictions.items.find(x=>x.canonical_jurisdiction_id==="JUR-US-VA").federal_department_parent_id="ORG-FED-EXE-DEP-DHS";
},/jurisdiction reduced to federal subordinate|schema field/);
reject("District of Columbia cannot become a fifty-first State",d=>{
 d.models.jurisdictions.items.find(x=>x.jurisdiction_kind==="federal_district").record_class="existing_member_state";
},/District improperly promoted|schema field/);
reject("Tribal placeholder cannot be upgraded to a fabricated complete institutional inventory",d=>{
 d.models.jurisdictions.items.find(x=>x.jurisdiction_kind==="tribal_nation").canonical_jurisdiction_id="JUR-TRIBAL-INVENTED";
},/Unverified jurisdiction class|schema field/);
reject("Unknown local and territorial denominators must remain explicitly unresolved",d=>{
 d.models.jurisdictions.items.find(x=>x.jurisdiction_kind==="territory").independently_qualified_complete_state_institution_denominator=5;
},/jurisdiction reduced to federal subordinate|schema field/);
reject("Do not mix editions while accepting source-only research pointers",d=>{
 d.models.observations.source_publisher_edition="GOVMAN-2026-10-26";
},/Mixed INC-17B source publisher edition labels|schema field|Mixed or invalid original publisher epochs/);
reject("No research source group is auto-admitted into the public Atlas",d=>{
 d.manifest.whole_government_inc17b_extension.atlas_admitted=true;
},/Unreviewed census manifest/);
reject("Closed schemas reject grafted unauthorized legal opinions",d=>{
 d.models.observations.items[0].government_legal_authority_certified=true;
},/Row schema key drift/);
reject("The seven dated publisher categories cannot be counted as seven disjoint contemporary government populations",d=>{
 d.models.coverage.items[0].independently_certified_current_institution_denominator=10;
},/Publisher source category counts overlap|schema field/);
reject("Changing the recorded direct-child figure cannot bypass ancestry verification",d=>{
 d.models.departments.items.find(x=>x.govman_direct_source_count>0).govman_direct_source_count=999;
},/Cabinet breadth|schema field/);
reject("New first-level source candidates cannot be forged as independently certified organizations",d=>{
 d.models.anchors.items.find(x=>x.family==="cabinet").adl1_certified=true;
},/Source-only canonical record promoted|schema field/);
