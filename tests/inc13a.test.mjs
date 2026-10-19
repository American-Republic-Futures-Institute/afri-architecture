import test from "node:test";
import assert from "node:assert/strict";
import {loadINC13A} from "../scripts/validate-inc13a.mjs";
import {BASELINE,GATE_NAMES,PILOT_NAMES,RELATION_CLASSES,
 inspectINC13ASchema,validateINC13A,projectINC13A} from "../scripts/inc13a-validation-core.mjs";

const BASE=loadINC13A();
const clone=()=>structuredClone(BASE);
const errors=x=>validateINC13A(x).errors.join("\n");
function reject(title,mutate,pattern){
 test(title,()=>{const x=clone();mutate(x);assert.match(errors(x),pattern);});
}
const DOD="ORG-FED-EXE-DEP-DEFENSE";
const sampleClaim=()=>{
 const obs=BASE.inc12.observations.items.find(x=>x.id==="X12-OBS-CENSUS-COMP-DEF-OSD");
 assert(obs,"real INC-12 DoD statutory composition observation required");
 const source=BASE.snapshots.find(x=>x.id===obs.source_snapshot_id);
 assert(source,"original INC-12 edition snapshot required");
 return {
  id:"X13A-REL-RESEARCH-OSD",
  subject_id:obs.id,object_id:obs.observed_parent_id,
  relation_class:"source_observed_placement",
  source_observation_id:obs.id,
  original_source_record_id:obs.source_record_id,
  original_relation_id:obs.relation_source_id,
  original_source_relation_type:obs.relation_type,
  source_snapshot_id:obs.source_snapshot_id,
  source_edition_label:source.edition_date||source.edition||source.as_of||source.revision_id,
  source_observed_on:source.observed_on||source.accessed_on||source.retrieved_on,
  source_ids:[...obs.source_ids],
  effective_from:null,effective_until:null,
  effective_period_status:"unverified_not_implied_by_source_snapshot",
  review_state:"research_only_unreviewed",legal_effect:"none_certified",
  independent_legal_decision_id:null
 };
};
const addClaim=x=>x.models.pilots.items[0].research_relationships.push(sampleClaim());

test("INC-13A registered closed source contract, all nine VA precedent gates and three research-only pilots",()=>{
 const report=validateINC13A(BASE);
 assert.deepEqual(report.errors,[]);
 assert.deepEqual(inspectINC13ASchema(BASE.schema,BASE.models),[]);
 assert.equal(report.source_baseline_commit,BASELINE);
 assert.equal(report.required_gates,9);
 assert.equal(report.pilot_departments,3);
 assert.equal(report.certified_adl1_entities,0);
 assert.equal(report.qualified_first_level_denominators,0);
 assert.equal(report.independent_human_certification_performed,false);
 assert.deepEqual(BASE.models.gates.items.map(x=>x.id),
  GATE_NAMES.map(x=>"X13A-GATE-"+x));
 assert.deepEqual(BASE.models.pilots.items.map(x=>x.id),
  PILOT_NAMES.map(x=>"X13A-PILOT-"+x));
 assert.equal(RELATION_CLASSES.length,8);
 for(const p of BASE.models.pilots.items){
  assert.equal(p.complete_first_level_denominator,null);
  assert.equal(p.as_of_effective_date,null);
  assert.equal(p.adl1_certified,false);
  assert.equal(p.independent_legal_review_complete,false);
  assert.equal(p.certification_decision_id,null);
  assert.equal(p.gate_results.length,9);
  assert(p.gate_results.every(x=>x.status==="not_met"&&
    x.reviewer_id===null&&x.review_decision_id===null));
  assert.deepEqual(p.research_relationships,[]);
 }
 assert(BASE.legacyGates.items.every(x=>x.status==="not_met"&&
  x.verified===false&&x.waived===false));
});

test("DoD/DOJ/VA projection preserves unknown denominators, reviewer gaps and zero granted powers",()=>{
 for(const id of ["DEFENSE","JUSTICE","VA"]){
  const p=projectINC13A(BASE,"ORG-FED-EXE-DEP-"+id);
  assert.equal(p.certified_adl1,false);
  assert.equal(p.legal_authority_certified,false);
  assert.equal(p.complete_first_level_denominator,null);
  assert.equal(p.gate_results.length,9);
  assert.equal(p.source_baseline_commit,BASELINE);
  assert.match(p.notice,/Source placement is not supervision/);
 }
 assert.throws(()=>projectINC13A(BASE,"ORG-FED-EXE-DEP-NONEXISTENT"),/unknown/);
});

test("one real original INC-12 DoD source line can be a research-only claim without certifying command",()=>{
 const x=clone();addClaim(x);
 const r=validateINC13A(x);
 assert.deepEqual(r.errors,[]);
 assert.equal(r.source_bounded_research_relationships,1);
 assert.equal(r.certified_adl1_entities,0);
 const p=projectINC13A(x,DOD);
 assert.equal(p.research_relationships[0].original_source_relation_type,"statutory_composition_only");
 assert.equal(p.research_relationships[0].effective_from,null);
 assert.equal(p.research_relationships[0].legal_effect,"none_certified");
});
reject("fail closed on invented completed ADL-1 certification",x=>{
 x.models.pilots.items[0].adl1_certified=true;
},/const mismatch|unearned/);
reject("fail closed on fabricated complete first-level denominator",x=>{
 x.models.pilots.items[1].complete_first_level_denominator=31;
},/const mismatch|unearned/);
reject("fail closed on unknown asserted effective-day roster",x=>{
 x.models.pilots.items[0].as_of_effective_date="2026-02-30";
},/unearned/);
reject("fail closed on forged independent legal decision id",x=>{
 x.models.pilots.items[2].certification_decision_id="ARFI-FAKE-SIGNATURE";
},/const mismatch|unearned/);
reject("fail closed on unearned institutional counsel approval",x=>{
 x.models.pilots.items[1].independent_legal_review_complete=true;
},/const mismatch|unearned/);
reject("fail closed on a missing mandatory qualification gate",x=>{
 x.models.pilots.items[0].gate_results.pop();
},/cardinality|mandatory/);
reject("fail closed on reordered gate results concealing unmet prerequisite",x=>{
 x.models.pilots.items[0].gate_results.reverse();
},/mandatory/);
reject("fail closed on self-reported human approval",x=>{
 x.models.pilots.items[0].gate_results[0].reviewer_id="SELF-REVIEW";
},/forged/);
reject("fail closed on an unsigned pending review presented as underway",x=>{
 x.models.pilots.items[0].gate_results[0].status="under_review";
},/forged/);
reject("fail closed on a nonexistent evidence source",x=>{
 x.models.pilots.items[0].gate_results[0].evidence_refs=["SRC-FAKE-UNTRUSTED"];
},/forged/);
reject("fail closed on VA precedent gate waiver",x=>{
 x.legacyGates.items[0].waived=true;
},/nonwaivable/);
reject("fail closed on unverified VA precedent signoff",x=>{
 x.legacyGates.items[2].verified=true;
},/nonwaivable/);
reject("fail closed on erased VA qualification gate",x=>{
 x.models.gates.items.pop();
},/nine ordered|cardinality/);
reject("fail closed on new false governing authority",x=>{
 x.models.gates.items[0].effect="automatic_government_certification";
},/const mismatch|nonwaivable/);
reject("fail closed on altered census source epoch",x=>{
 x.models.pilots.items[0].source_baseline_commit="f".repeat(40);
},/const mismatch|identity/);
reject("fail closed on mislabeled target department",x=>{
 x.models.pilots.items[0].canonical_department_id="ORG-FED-EXE-DEP-VA";
},/department identity/);
reject("fail closed on forged INC-12 current roster certification",x=>{
 x.inc12.identities.items.find(y=>y.canonical_id===DOD).adl1_certified=true;
},/department identity/);
reject("fail closed on forged cross-family completeness",x=>{
 x.inc12.scopes.items[0].adl1_certified_count=1;
},/INC12 bounded/);
reject("fail closed on certified VA claims in the preserved 04F baseline",x=>{
 x.manifest.federal_operational_custody_04f_extension.VA_ADL1_certified=true;
},/INC12\/04F/);
reject("fail closed on fabricated certified manifest totals",x=>{
 x.manifest.federal_adl1_qualification_13a_extension.certified_institutions=3;
},/manifest falsely/);
reject("fail closed on incomplete manifest registration",x=>{
 x.manifest.models=x.manifest.models.filter(p=>p!=="model/federal/inc13a-pilots.json");
},/registered model/);
reject("fail closed on loosening schema to accept unknown fields",x=>{
 x.schema.$defs.pilot.additionalProperties=true;
},/schema definition not closed/);
reject("fail closed on unmodeled extra flag",x=>{
 x.models.pilots.items[1].signed_delegation=true;
},/unknown property/);

reject("source chart placement cannot be rewritten as military command",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].relation_class="operational_command";
},/source placement promoted/);
reject("source statutory composition cannot be rewritten as delegation",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].relation_class="delegated_authority";
},/source placement promoted/);
reject("source has no verified effective period merely from its edition date",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].effective_from="2026-10-07";
},/source placement promoted/);
reject("source relation cannot pretend to have an independent counsel decision",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].independent_legal_decision_id="EVIDENCE-FAKE";
},/const mismatch|source placement promoted/);
reject("reject invented original relationship ID",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].original_relation_id="CENSUS-REL-FORGED";
},/untraceable/);
reject("reject invented original source record",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].original_source_record_id="CENSUS-COMP-FAKE";
},/untraceable/);
reject("reject substituted parent that implies false hierarchy",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].object_id="ORG-FED-EXE-DEP-JUSTICE";
},/untraceable/);
reject("reject original government edition mismatch",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].source_edition_label="current_unpinned";
},/untraceable/);
reject("reject falsely current source-observed date",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].source_observed_on="2026-10-19";
},/untraceable/);
reject("reject a claim's alternative undocumented source locator",x=>{
 addClaim(x);x.models.pilots.items[0].research_relationships[0].source_ids=["CENSUS-SRC-INVENTED"];
},/untraceable/);
reject("reject cross-branch transfer by moving a DoD row into VA scope",x=>{
 x.models.pilots.items[2].research_relationships.push(sampleClaim());
},/untraceable/);
reject("reject duplicated relationship IDs across scopes",x=>{
 addClaim(x);x.models.pilots.items[1].research_relationships.push(sampleClaim());
},/duplicated research relation|untraceable/);
