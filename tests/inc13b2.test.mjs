import test from "node:test";
import assert from "node:assert/strict";
import {loadINC13B2,validateINC13B2,projectINC13B2} from "../scripts/inc13b2-validation-core.mjs";
const clone=()=>structuredClone(loadINC13B2());
test("DOJ 36 published chart connectors retain identity, qualified dates and zero granted powers",()=>{
 const input=clone(),result=validateINC13B2(input.model,input.inputs);
 assert.deepEqual(result.errors,[]);
 assert.equal(result.source_group_count,36);assert.equal(result.adl1_certified_count,0);
 assert.equal(result.current_first_level_denominator,null);
 const view=projectINC13B2(input);
 assert.equal(view.nodes.length,36);assert.equal(view.edges.length,36);
 assert.equal(view.root_id,"ORG-FED-EXE-DEP-JUSTICE");
 assert.ok(view.nodes.every(x=>!x.specific_operational_command_established&&!x.verified_signed_delegation&&!x.adl1_certified));
});
const bad=[
 ["fake complete DOJ census",d=>d.model.complete_department_first_level_denominator=36],
 ["fake fully qualified ADL",d=>d.model.adl1_certified_count=36],
 ["fake human legal signoff",d=>d.model.independent_institutional_review_complete=true],
 ["falsified signed chart authenticity",d=>d.model.source_scope.signed_chart_signature_independently_validated=true],
 ["wrong signed-chart date",d=>d.model.source_scope.signed_chart_date="2026-04-29"],
 ["wrong publisher page update date",d=>d.model.source_scope.publisher_page_last_updated="2026-10-16"],
 ["wrong original source snapshot",d=>d.model.items[0].source_snapshot_id="UNKNOWN"],
 ["source-record duplication",d=>d.model.items.push(d.model.items[0])],
 ["missing Inspector General source record",d=>d.model.items=d.model.items.filter(x=>x.original_record_id!=="DEPT04-UNIT-JUSTICE-OIG")],
 ["original chart parent reassignment",d=>d.model.items[0].source_observed_parent_id="DEPT04-UNIT-JUSTICE-DAG"],
 ["forged original relationship",d=>d.model.items[0].original_source_relation_id="FAKE"],
 ["forged X12 identity",d=>d.model.items[0].inc12_observation_id="FAKE"],
 ["pretend dated connector was legal command",d=>d.model.items[0].specific_operational_command_established=true],
 ["pretend chart was a signed delegation",d=>d.model.items[0].verified_signed_delegation=true],
 ["pretend chart original bytes retained",d=>d.model.items[0].original_source_bytes_verified=true],
 ["invent effective legal operation",d=>d.model.items[0].legal_effective_on="2026-02-17"],
 ["mislabel DOJ Inspector General as executive commander",d=>d.inputs.units.items.find(x=>x.id==="DEPT04-UNIT-JUSTICE-OIG").structural_class="command_staff"],
 ["lose adjudicatory independence qualifier",d=>d.inputs.units.items.find(x=>x.id==="DEPT04-UNIT-JUSTICE-EOIR").structural_class="unqualified_adjudicator"],
 ["forge signed authority in source relationship",d=>d.inputs.relationships.items.find(x=>x.from_id==="DEPT04-UNIT-JUSTICE-DAG").delegated_power_proven=true],
 ["overwrite verified source publisher",d=>d.inputs.sourceRegistry.items.find(x=>x.id==="DEPT04-SRC-DOJ-CHART-2026").raw_source_sha256="fake"],
 ["promote legacy INC12 executive command",d=>d.inputs.x12.items.find(x=>x.source_record_id==="DEPT04-UNIT-JUSTICE-AG").confirmed_command=true],
 ["remove source-scope exclusions",d=>d.model.explicit_scope_exclusions=[]],
 ["forge qualified INC13A pilot",d=>d.inputs.pilots.items.find(x=>x.id==="X13A-PILOT-JUSTICE").adl1_certified=true],
 ["unregister canonical model",d=>d.inputs.manifest.models=d.inputs.manifest.models.filter(x=>x!=="model/federal/inc13b2-doj-chart.json")]
];
for(const [name,mutate] of bad){
 test("reject "+name,()=>{const d=clone();mutate(d);assert.notEqual(validateINC13B2(d.model,d.inputs).errors.length,0);});
}
