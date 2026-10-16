import test from "node:test";
import assert from "node:assert/strict";
import {loadOutcomeData,validateOutcomeData} from "../scripts/outcome-dependency-validation-core.mjs";
const fresh=()=>structuredClone(loadOutcomeData());
const messages=d=>validateOutcomeData(d).errors.join(" | ");
function reject(name,mutate,error){test(name,()=>{const d=fresh();mutate(d);assert.match(messages(d),error);});}

test("INC-07 typed graph passes baseline integrity including no enacted powers",()=>{
 const r=validateOutcomeData(fresh());
 assert.deepEqual(r.errors,[]);
 assert.equal(r.summary.pilot_domains,4);
 assert.equal(r.summary.outcomes,39);
 assert.equal(r.summary.shared_capabilities,8);
 assert.equal(r.summary.options,10);
 assert.equal(r.summary.evidence,9);
 assert.equal(r.summary.guardrails,10);
 assert.equal(r.summary.authority_gates,9);
 assert.equal(r.summary.edges,92);
 assert.equal(r.summary.scenarios,9);
 assert.deepEqual(r.summary.edge_types.map(x=>x.count),[16,12,12,31,21]);
});
reject("Manifest cannot become ratified",d=>{d.manifest.status="ratified"},/unratified version/);
reject("Manifest cannot authorize a government action",d=>{d.manifest.safety.government_action_authorized=true},/must not authorize government action/);
reject("Preserve immutable manuscript contract",d=>{d.manifest.source_contracts.plan_commit_sha="main"},/Immutable plan manuscript baseline/);
reject("Preserve immutable architecture baseline",d=>{d.manifest.source_contracts.reference_baseline_commit_sha="main"},/Immutable architecture baseline/);
reject("No fabricated constitutional provisions in evidence",d=>{d.evidence.items[2].constitutional_record_ids.push("CONST-NOT-REAL")},/Unrecognized constitutional record/);
reject("No unreviewed elevation of an evidence claim to proven causality",d=>{d.evidence.items[0].validated_causal_effect=true},/Unsupported causal validation/);
reject("Evidence citations are required for all edges",d=>{d.relationships.items[0].evidence_ids=["EVID-MISSING"]},/Dangling evidence for edge/);
reject("No duplicate typed source-target relation",d=>{let x=structuredClone(d.relationships.items[0]);x.id="EDGE-07-9999";d.relationships.items.push(x)},/Duplicated typed graph edge/);
reject("No unrecognized external outcome",d=>{d.relationships.items[0].to_id="NEVER-A-REAL-OUTCOME"},/Dangling or self-referential graph edge/);
reject("supports edge cannot treat an option as a proven capability",d=>{d.relationships.items[0].from_id="OPT-07-01"},/Invalid supports endpoint types/);
reject("depends_on cannot assert an outcome requires a legal gate directly",d=>{const e=d.relationships.items.find(x=>x.relationship_type==="depends_on");e.to_id="AGATE-07-01"},/Invalid depends_on endpoint types/);
reject("conflicts_with cannot make two public outcomes intrinsically opposed",d=>{const e=d.relationships.items.find(x=>x.relationship_type==="conflicts_with");e.from_id="EDU-O01"},/Invalid conflicts_with endpoints/);
reject("constrained_by must point to safeguard rather than legal authorization",d=>{const e=d.relationships.items.find(x=>x.relationship_type==="constrained_by");e.to_id="AGATE-07-01"},/Invalid constrained_by endpoints/);
reject("requires_legal_authority cannot originate at a domain outcome",d=>{const e=d.relationships.items.find(x=>x.relationship_type==="requires_legal_authority");e.from_id="EDU-O01"},/Invalid requires_legal_authority endpoints/);
reject("Outcome dependencies must not form unacknowledged cycles",d=>{
 const original=d.relationships.items.find(x=>x.relationship_type==="depends_on");
 const a=structuredClone(original);a.id="EDGE-07-9998";a.from_id="HLT-O01";a.to_id="EPR-O01";
 const b=structuredClone(original);b.id="EDGE-07-9999";b.from_id="EPR-O01";b.to_id="HLT-O01";
 d.relationships.items.push(a,b);
},/Cycle in depends_on-only dependency graph/);
reject("No option can be reclassified as adopted policy",d=>{d.options.items[0].status="ratified"},/Option ratified or framed as existing authority/);
reject("No option can appoint its own lawful implementing agency",d=>{d.options.items[0].lawful_implementer="ORG-FED-EXE-DEP-HHS"},/Option ratified or framed as existing authority/);
reject("Every option has legal gating",d=>{
 d.relationships.items=d.relationships.items.filter(e=>!(e.from_id==="OPT-07-01"&&e.relationship_type==="requires_legal_authority"));
},/Option missing requires_legal_authority analysis/);
reject("Every option has independent safeguards",d=>{
 d.relationships.items=d.relationships.items.filter(e=>!(e.from_id==="OPT-07-01"&&e.relationship_type==="constrained_by"));
},/Option missing constrained_by analysis/);
reject("Every option acknowledges potential human consequences",d=>{
 d.relationships.items=d.relationships.items.filter(e=>!(e.from_id==="OPT-07-01"&&e.relationship_type==="conflicts_with"));
},/Option missing conflicts_with analysis/);
reject("No legal gate is deemed satisfied by the architecture graph",d=>{d["authority-gates"].items[0].satisfied=true},/Legal gate falsely satisfied/);
reject("No legal gate authorizes a public act",d=>{d["authority-gates"].items[0].authorizes_action=true},/Legal gate falsely satisfied/);
reject("No normative safeguard acquires power of law from the model",d=>{d.guardrails.items[0].auto_grants_authority=true},/Guardrail falsely ratified/);
reject("Legal guards must cite an existing constitutional record",d=>{d.guardrails.items[0].constitutional_record_ids=["AMEND-DOES-NOT-EXIST"]},/Guardrail has invented constitutional record/);
reject("Scenario cannot be called a quantitative simulation",d=>{d.scenarios.items[0].status="calibrated_simulation"},/Scenario wrongly modeled/);
reject("Scenario cannot claim probability estimates",d=>{d.scenarios.items[0].probability=0.71},/unjustified prediction/);
reject("Scenario must link its legal authority gate",d=>{d.scenarios.items[0].authority_gate_ids=[]},/Scenario missing or inventing authority gates/);
reject("Scenario must link its rights safeguards",d=>{d.scenarios.items[0].guardrail_ids=[]},/Scenario missing or inventing guardrails/);
reject("Scenario cannot reference an unknown edge",d=>{d.scenarios.items[0].edge_ids.push("EDGE-07-9999")},/Scenario has dangling or duplicate edges/);
reject("Scenario must include adverse-path description",d=>{d.scenarios.items[0].adverse_path=""},/Scenario lacks competing pathways/);
reject("Shared capabilities must connect at least two domains",d=>{
 d.relationships.items=d.relationships.items.filter(e=>e.relationship_type!=="supports"||e.from_id!=="CAP-XDOM-008"||e.to_id==="CYB-O04");
},/Shared capability has fewer than two domain support paths/);
