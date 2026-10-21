import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {loadINC15C1,validateINC15C1,SOURCE_PIN} from "../scripts/inc15c1-validation-core.mjs";

const duplicate=x=>structuredClone(x);
const load=()=>loadINC15C1();
const ids=d=>d.model.items;
const record=(d,suffix)=>ids(d).find(x=>x.source_candidate_id==="CENSUS-COMP-DHS-"+suffix);
const exception=(d,suffix)=>d.model.exceptions.find(x=>x.id==="INC15C1-"+suffix);
const ext=d=>d.manifest.federal_institutional_breadth_15c1_extension;
const violation=/INC-15C\.1 rejected:/;

test("INC-15C.1 confirms ten preexisting original DHS IDs, X12 observations, relationships, and research scope",()=>{
 const d=load(),r=validateINC15C1(d);
 assert.equal(r.sourcePin,SOURCE_PIN);
 assert.equal(r.reconciledCandidates,10);
 assert.equal(r.tracedOriginalRelations,10);
 assert.equal(r.matchedINC12Observations,10);
 assert.equal(r.oversightExceptions,1);
 assert.equal(r.conditionalCoastGuardExceptions,1);
 assert.equal(r.adl1Certified,0);
 assert.equal(r.publisherDenominator,null);
 assert.equal(r.currentFirstLevelDenominator,null);
 assert.equal(r.originalPublisherByteCustody,"not_qualified_HTTP_403");
 assert.equal(d.model.publisher_source_id,"CENSUS-SRC-DHS-CHART-2025");
 assert.equal(d.model.publisher_edition_date,"2025-01-17");
 assert.equal(d.model.original_publisher_pdf_sha256,null);
 assert.equal(ids(d).length,10);
 assert.equal(ids(d).filter(x=>x.independent_oversight_exception).length,1);
 assert.equal(ids(d).filter(x=>x.coast_guard_transfer_exception).length,1);
 assert.equal(record(d,"OIG").original_relation_kind,"independent_oversight_placement_not_command");
 assert.equal(record(d,"USCG").command_verified,false);
 assert(ids(d).every(x=>x.qualified_current_institution_id===null&&
  x.adl1_certified===false&&x.command_verified===false&&
  x.current_membership_verified===false));
 assert.deepEqual(d.model.exceptions.map(x=>x.status),["open","open","open","open"]);
});

for(const [label,mutate] of [
 ["candidate current institutional count",d=>d.model.new_legally_qualified_institution_count=1],
 ["current first-level denominator",d=>d.model.full_current_first_level_denominator=10],
 ["historical source count promoted to complete census",d=>d.model.complete_publisher_chart_census_verified=true],
 ["false publisher original SHA",d=>d.model.original_publisher_pdf_sha256="a".repeat(64)],
 ["false publisher original byte count",d=>d.model.original_publisher_pdf_bytes=1024],
 ["unqualified original PDF custody promoted",d=>d.model.original_publisher_custody_qualified=true],
 ["legal review promoted",d=>d.model.legal_review_complete=true],
 ["ADL-1 count forged",d=>d.model.adl1_certified_count=1],
 ["funding authority forged",d=>record(d,"CBP").appropriation_verified=true],
 ["military command forged",d=>record(d,"USCG").command_verified=true],
 ["Inspector General command relation",d=>record(d,"OIG").original_relation_kind="operational_command"],
 ["Inspector General exception removed",d=>record(d,"OIG").independent_oversight_exception=false],
 ["Coast Guard special status removed",d=>record(d,"USCG").coast_guard_transfer_exception=false],
 ["cross-department identity substitution",d=>record(d,"ICE").canonical_parent_id="ORG-FED-EXE-DEP-DEFENSE"],
 ["cross-jurisdiction substitution",d=>record(d,"USCIS").canonical_parent_id="JUR-VA"],
 ["statutory delegation fraud",d=>record(d,"CISA").legal_delegation_verified=true],
 ["source observation replacement",d=>record(d,"FEMA").inc12_observation_id="X12-OBS-UNKNOWN"],
 ["relationship source replacement",d=>record(d,"FLETC").original_relationship_id="CENSUS-REL-DOES-NOT-EXIST"],
 ["unreviewed source date rewritten",d=>d.model.publisher_edition_date="2026-10-20"],
 ["source model commit rewritten",d=>d.model.source_baseline_commit="a".repeat(40)],
 ["duplicate previously known ID",d=>ids(d)[1].source_candidate_id=ids(d)[0].source_candidate_id],
 ["additional component invented",d=>ids(d).push(duplicate(ids(d)[0]))],
 ["original source PDF retrieval claim upgraded",d=>d.model.source_capture_status="verified_immutable_original"],
 ["custody gap deleted",d=>d.model.exceptions.shift()],
 ["IG exception turned into legal qualification",d=>exception(d,"EXC-DHS-OIG").status="verified"],
 ["Coast Guard exception relabeled",d=>exception(d,"EXC-USCG").category="direct_command"],
 ["manifest legal status upgraded",d=>ext(d).status="ratified_complete_current_census"],
 ["manifest PDF custody upgraded",d=>ext(d).original_publisher_pdf_custody_qualified=true],
 ["manifest extra authority certified field",d=>ext(d).military_command_certified=true],
 ["manifest current denominator claimed",d=>ext(d).current_department_first_level_denominator=10],
 ["manifest research family omitted",d=>d.manifest.models=d.manifest.models.filter(x=>x!=="model/federal/inc15c1-dhs-source-reconciliation.json")],
 ["extra untyped source-model field",d=>ids(d)[0].executed_UCP_directive=true],
 ["schema and observed record jointly authorize added command",d=>{
  ids(d)[0].signed_military_command=true;
  const p=d.schema.properties.items.items;
  p.required.push("signed_military_command");
  p.properties.signed_military_command={type:"boolean"};
 }],
 ["historical component model mutated in memory",d=>{
  d.originals["model/federal/coverage/components.json"].items
   .find(x=>x.id==="CENSUS-COMP-DHS-OIG").kind="combatant_command";
 }],
 ["original source PDF URL changed",d=>{
  d.originals["model/federal/coverage/source-registry.json"].items
   .find(x=>x.id==="CENSUS-SRC-DHS-CHART-2025").url="https://example.org/invalid.pdf";
 }]
]){
 test("INC-15C.1 rejects "+label,()=>{
  const d=duplicate(load());mutate(d);
  assert.throws(()=>validateINC15C1(d),violation);
 });
}
test("pinned Git-source digest rejects altered raw bytes even with a co-forged checksum field",()=>{
 const d=duplicate(load()),path="model/federal/coverage/components.json";
 const bytes=d.sourceBytes[path]+" ";
 const buff=Buffer.from(bytes,"utf8");
 const sha=createHash("sha1").update("blob "+buff.length+"\0").update(buff).digest("hex");
 assert.match(sha,/^[a-f0-9]{40}$/);
 d.sourceBytes[path]=bytes;
 d.model.original_publisher_pdf_sha256=sha.padEnd(64,"0");
 assert.throws(()=>validateINC15C1(d),violation);
});
test("pinned Git-source digest cannot be made valid by co-changing the model record",()=>{
 const d=duplicate(load()),path="model/federal/coverage/relationships.json";
 d.sourceBytes[path]+="\n";
 d.originals[path]=JSON.parse(d.sourceBytes[path]);
 assert.throws(()=>validateINC15C1(d),/original Git blob pin mismatch/);
});
