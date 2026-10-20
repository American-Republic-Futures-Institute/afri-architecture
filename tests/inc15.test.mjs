import test from "node:test";
import assert from "node:assert/strict";
import {loadINC15,validateINC15,PIN} from "../scripts/inc15-validation-core.mjs";
const copy=x=>structuredClone(x);
const load=()=>loadINC15();
const cohort=(d,id)=>d.models["inc15-cohorts"].items.find(x=>x.id==="INC15-COHORT-"+id);
const pilot=(d,id)=>d.models["inc15-department-pilots"].items.find(x=>x.id==="INC15-PILOT-"+id);
test("INC-15A maintains twelve non-additive cohorts, fifteen existing Cabinet IDs, and 3 bounded pilots",()=>{
 const d=load(),r=validateINC15(d);
 assert.equal(r.original_source_commit,PIN);
 assert.equal(r.source_cohorts,12);
 assert.equal(r.source_qualified_fixed_counts,8);
 assert.equal(r.cabinet_identity_crosswalks,15);
 assert.equal(r.original_census_references,61);
 assert.equal(r.department_pilots,3);
 assert.equal(r.whole_government_denominator,null);
 assert.equal(r.full_first_level_denominator,null);
 assert.equal(r.adl1_certified_count,0);
 const cohorts=d.models["inc15-cohorts"].items;
 assert(cohorts.every(x=>x.counts_additive_to_other_cohorts===false));
 assert.equal(cohort(d,"DOD-10USC111B").source_record_count,11);
 assert.equal(cohort(d,"DOJ-CHART36").source_record_count,36);
 assert.equal(cohort(d,"VA-DIR22").source_record_count,22);
 assert.equal(cohort(d,"VA-STAT9").source_record_count,9);
 assert.equal(cohort(d,"VA-CAND25").source_record_count,25);
 for(const x of ["EOP-NOT-DENOMINATED","INDEPENDENTS-NOT-DENOMINATED",
  "LEGISLATIVE-NOT-DENOMINATED","JUDICIAL-NOT-DENOMINATED"]){
  assert.equal(cohort(d,x).source_record_count,null);
  assert.equal(cohort(d,x).full_current_first_level_denominator,null);
 }
 assert.equal(pilot(d,"VA").counted_cohort_ids.length,3);
 assert.equal(pilot(d,"DEFENSE").global_first_level_denominator,null);
});
for(const [name,alter]of [
 ["invented government denominator",d=>d.models["inc15-cohorts"].whole_federal_first_level_denominator=350],
 ["forged signoff",d=>d.manifest.federal_institutional_breadth_15_extension.legal_review_complete=true],
 ["falsely ratified model",d=>d.manifest.release_status="ratified"],
 ["falsely additive cohorts",d=>cohort(d,"VA-CAND25").counts_additive_to_other_cohorts=true],
 ["improper cohort original custody",d=>cohort(d,"DOJ-CHART36").independent_publisher_original_custody=true],
 ["unknown source epoch",d=>cohort(d,"VA-DIR22").source_model_commit="a".repeat(40)],
 ["wrong 40-hex original Git blob",d=>cohort(d,"VA-DIR22").source_model_blob_sha="a".repeat(40)],
 ["canonical source file bytes substituted",d=>d.sourceBytes["model/federal/dod/statutory-composition.json"]+=" "],
 ["canonical original statutory class replaced",d=>d.originals["model/federal/dod/statutory-composition.json"].items[0].kind="military_command"],
 ["invented first level count from unknown EOP",d=>cohort(d,"EOP-NOT-DENOMINATED").source_record_count=7],
 ["changed Cabinet canonical identity",d=>d.models["inc15-cabinet-crosswalks"].items[0].canonical_institution_id="ORG-FED-EXE-DEP-JUSTICE"],
 ["Cabinet parent legal hierarchy invention",d=>d.models["inc15-cabinet-crosswalks"].items[0].canonical_parent_id="ORG-FED-EXE-DEP-DEFENSE"],
 ["Cabinet current legal effect forged",d=>d.models["inc15-cabinet-crosswalks"].items[0].independent_legal_review_complete=true],
 ["Cabinet individual officeholder falsely certified",d=>d.models["inc15-cabinet-crosswalks"].items[0].current_individual_officeholders_verified=true],
 ["DoD Coast Guard scope exception dropped",d=>pilot(d,"DEFENSE").exceptions=pilot(d,"DEFENSE").exceptions.filter(x=>!x.includes("Coast_Guard"))],
 ["DOJ adjudicator independence exception dropped",d=>pilot(d,"JUSTICE").exceptions=pilot(d,"JUSTICE").exceptions.filter(x=>!x.includes("adjudicative"))],
 ["VA overlapping source cohort removed",d=>pilot(d,"VA").counted_cohort_ids.pop()],
 ["false agency first-level completeness",d=>pilot(d,"DEFENSE").current_department_roster_complete=true],
 ["evidence of signed individual delegation forged",d=>pilot(d,"JUSTICE").signed_delegation_verified=true],
 ["wrong source record group",d=>cohort(d,"CONGRESS-APP24").source_record_count=25],
 ["duplicated source cohort",d=>d.models["inc15-cohorts"].items.push(copy(d.models["inc15-cohorts"].items[0]))],
 ["undeclared source family",d=>d.manifest.models.pop()],
 ["false State-level agency classification",d=>cohort(d,"VA-DIR22").jurisdiction="state"],
 ["open schema allows invented binding",d=>d.models["inc15-department-pilots"].items[0].command_authority="all"]
]){
 test("INC-15A refuses "+name,()=>{
  const d=copy(load());alter(d);
  assert.throws(()=>validateINC15(d),/INC-15 source census rejected:/);
 });
}
