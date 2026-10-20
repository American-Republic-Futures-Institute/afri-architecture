import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {loadINC15B,validateINC15B,SOURCE_PIN} from "../scripts/inc15b-validation-core.mjs";
const clone=x=>structuredClone(x);
const load=()=>loadINC15B();
const registry=d=>d.models["inc15b-cabinet-sources"];
const crosswalk=d=>d.models["inc15b-roster-crosswalks"];
const partitions=d=>d.models["inc15b-source-partitions"];
const cab=(d,key)=>registry(d).items.find(x=>x.canonical_department_id==="ORG-FED-EXE-DEP-"+key);
const cross=(d,id)=>crosswalk(d).items.find(x=>x.source_unit_id===id);
test("INC15B reconciles 15 departments, five source cohorts and twenty-two original Treasury/Commerce observations",()=>{
 const d=load(),x=validateINC15B(d);
 assert.equal(x.sourcePin,SOURCE_PIN);
 assert.equal(x.canonicalCabinetDepartments,15);
 assert.equal(x.publisherEditionCohorts,5);
 assert.equal(x.departmentsWithoutEdition,10);
 assert.equal(x.treasuryOriginalPublisherObservations,9);
 assert.equal(x.commerceOriginalPublisherObservations,13);
 assert.equal(x.newlyReconciledSourceObservations,22);
 assert.equal(x.originalDept04SourcePartitionRows,80);
 assert.equal(x.earlierDoJVaSourceRows,58);
 assert.equal(x.priorResearchCandidateLinks,4);
 assert.equal(x.currentFirstLevelGovernmentDenominator,null);
 assert.equal(x.adl1Certified,0);
 assert.equal(cab(d,"TREASURY").source_scoped_record_count,9);
 assert.equal(cab(d,"COMMERCE").source_scoped_record_count,13);
 assert.equal(cab(d,"DEFENSE").source_scoped_record_count,11);
 assert.equal(cab(d,"JUSTICE").source_scoped_record_count,36);
 assert.equal(cab(d,"VA").source_scoped_record_count,22);
 for(const row of registry(d).items){
  assert.equal(row.complete_current_first_level_denominator,null);
  assert.equal(row.adl1_certified,false);
  if(!row.publisher_source_id)assert.equal(row.source_scoped_record_count,null);
 }
 assert.equal(crosswalk(d).items.length,22);
 assert(crosswalk(d).items.every(x=>x.canonical_unit_institution_id===null));
 assert.equal(crosswalk(d).items.filter(x=>x.matched_existing_seed_id!==null).length,4);
 for(const id of ["DEPT04-UNIT-TREASURY-OIG","DEPT04-UNIT-TREASURY-TIGTA"])
  assert.equal(cross(d,id).original_relation_kind,"independent_oversight_display_placement_not_command");
 for(const id of ["DEPT04-UNIT-COMMERCE-OUSEA","DEPT04-UNIT-COMMERCE-OS"])
  assert.equal(cross(d,id).original_structural_class,
   "executive_office_listed_in_bureaus_category_not_legal_bureau");
 assert.deepEqual(partitions(d).items.map(x=>x.original_source_rows),[36,22,9,13]);
});
for(const [name,mutate] of [
 ["invented Cabinet fifth branch",d=>cab(d,"TREASURY").branch_id="BR-US-STATE"],
 ["misleading website source URL",d=>cab(d,"COMMERCE").publisher_source_url="https://example.org/forged"],
 ["false first-level global denominator",d=>registry(d).complete_current_whole_federal_first_level_denominator=91],
 ["false denominator on an individual department",d=>cab(d,"TREASURY").complete_current_first_level_denominator=9],
 ["false ADL-1 legal status",d=>cab(d,"JUSTICE").adl1_certified=true],
 ["invalid unsigned source custody claim",d=>cab(d,"TREASURY").original_publisher_bytes_independently_archived=true],
 ["missing-department roster magically counted",d=>cab(d,"AGRICULTURE").source_scoped_record_count=8],
 ["published source date fabricated",d=>cab(d,"COMMERCE").source_last_published_or_updated="2026-10-20"],
 ["source hash impersonation",d=>cab(d,"TREASURY").source_model_git_blob_sha="a".repeat(40)],
 ["DoD statutory classes treated as 11 offices",d=>cab(d,"DEFENSE").publisher_source_classification="certified_individual_offices"],
 ["source version replaced",d=>cab(d,"TREASURY").source_model_commit="a".repeat(40)],
 ["Commerce and Treasury source identities swapped",d=>crosswalk(d).items[0].canonical_department_id="ORG-FED-EXE-DEP-COMMERCE"],
 ["changed original parent reporting unit",d=>crosswalk(d).items[0].original_observed_parent_id="ORG-FED-EXE-DEP-DEFENSE"],
 ["Treasury IG given direct command",d=>cross(d,"DEPT04-UNIT-TREASURY-OIG").military_or_civilian_command_verified=true],
 ["Treasury IG oversight relation relabelled as command",d=>cross(d,"DEPT04-UNIT-TREASURY-TIGTA").original_relation_kind="military_command"],
 ["Commerce executive office falsely bureau",d=>cross(d,"DEPT04-UNIT-COMMERCE-OS").original_structural_class="certified_bureau"],
 ["source X12 observation reallocated",d=>crosswalk(d).items[5].source_observation_id="X12-OBS-UNKNOWN"],
 ["prior candidate promoted to certified canonical identity",d=>cross(d,"DEPT04-UNIT-TREASURY-IRS").canonical_unit_institution_id="EXP-SEED-TREASURY-IRS"],
 ["false legal/ADL admitted crosswalk",d=>crosswalk(d).items[0].adl1_certified=true],
 ["duplicated crosswalk identity",d=>crosswalk(d).items[1].source_unit_id=crosswalk(d).items[0].source_unit_id],
 ["extra unregistered Office of Commerce",d=>crosswalk(d).items.push(clone(crosswalk(d).items[0]))],
 ["false source-group current-complete marker",d=>partitions(d).items[2].complete_current_department_roster_verified=true],
 ["false additive publisher populations",d=>partitions(d).items[2].source_population_additive_to_other_editions=true],
 ["lost Commerce mixed-type source exception",d=>partitions(d).items[3].recorded_structural_classes.pop()],
 ["altered published source row in memory",d=>d.originals["model/federal/department-structure/units.json"].items[0].name="Falsified"],
 ["missing validated predecessor source file",d=>delete d.sourceBytes["model/federal/x12-observations.json"]],
 ["missing required INC15B source family",d=>d.manifest.models=d.manifest.models.filter(p=>p!=="model/federal/inc15b-roster-crosswalks.json")],
 ["asserted sovereign State unit as Cabinet member",d=>registry(d).items[0].canonical_department_id="JUR-US-VA"],
 ["injected untyped legal clearance",d=>crosswalk(d).items[0].agency_command_certified=true],
 ["top-level false legal certification",d=>partitions(d).adl1_certified_count=1]
]){
 test("INC15B refuses "+name,()=>{
  const d=clone(load());mutate(d);
  assert.throws(()=>validateINC15B(d),/INC-15B source census rejected:/);
 });
}
test("INC15B refuses recomputed checksum accompanying a modified original Git blob",()=>{
 const d=clone(load()),path="model/federal/department-structure/units.json";
 const raw=d.sourceBytes[path]+" ";
 const bytes=Buffer.from(raw,"utf8");
 const coforged=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
 d.sourceBytes[path]=raw;
 cab(d,"TREASURY").source_model_git_blob_sha=coforged;
 assert.throws(()=>validateINC15B(d),/pinned original Git blob mismatch/);
});
