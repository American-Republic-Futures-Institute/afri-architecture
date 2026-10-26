import test from "node:test";
import assert from "node:assert/strict";
import {loadContract,validateContract,inspectCandidateEdge} from "../scripts/wholegov-contract-core.mjs";
const load=()=>structuredClone(loadContract());
const deny=(fn,regex)=>{const d=load();fn(d);assert.match(validateContract(d).errors.join(" | "),regex);};
test("INC-17A ontology definitions use preexisting IDs without any public claims",()=>{
 const d=load(),r=validateContract(d);assert.deepEqual(r.errors,[]);
 assert.equal(r.counts.element,19);assert.equal(r.counts.jurisdiction,8);
 assert.equal(r.counts.relationship,23);assert.equal(r.counts.crosswalk,10);
 assert.equal(r.counts.viewpoint,8);
 assert.equal(d.ontology.public_graph_edges_added,0);
});
test("reject duplicate semantic identity",()=>deny(d=>d.ontology.items[1].id=d.ontology.items[0].id,/Duplicate ontology identifier/));
test("reject inferential command and transitive legal delegation",()=>deny(d=>{
 d.ontology.items.find(x=>x.kind==="delegates_to").transitive_inference=true;
},/Inferred power or auto-admitted/));
test("reject a fictional hierarchy endpoint",()=>deny(d=>{
 d.ontology.items.find(x=>x.kind==="reports_to").to_kinds=["federal_ministry_of_states"];
},/Dangling typed endpoint/));
test("reject making States federal subordinates",()=>deny(d=>{
 d.ontology.items.find(x=>x.kind==="member_state").default_federal_subordinate=true;
},/Jurisdiction improperly subordinate/));
test("reject reclassifying DC as a fifty-first State",()=>deny(d=>{
 d.ontology.items.find(x=>x.kind==="federal_district").member_state=true;
},/Jurisdiction improperly subordinate/));
test("reject silent legal review inheritance from earlier registries",()=>deny(d=>{
 d.ontology.items.find(x=>x.record_type==="crosswalk").source_review_inherited=true;
},/Unqualified legacy predicate promotion/));
test("reject false legacy predicate maps",()=>deny(d=>{
 d.ontology.items.find(x=>x.record_type==="crosswalk").origin_predicate="general_federal_command";
},/Unknown legacy source predicate/));
test("reject auto-publishing unreviewed viewpoints",()=>deny(d=>{
 d.ontology.items.find(x=>x.record_type==="viewpoint").public_admission=true;
},/Unadmitted viewpoint/));
test("reject undeclared source models",()=>deny(d=>{
 d.manifest.models=d.manifest.models.filter(x=>x!=="model/wholegov/ontology.json");
},/Missing unadmitted immutable manifest declaration/));
test("candidate relationship has exact, directional and source-epoch semantics",()=>{
 const d=load(),nodes=[
  {id:"ORG-FED-EXE-DEP-HHS",kind:"institution",jurisdiction:"federal"},
  {id:"CAP-FED-01",kind:"capability",jurisdiction:"federal"}
 ];
 const edge={from_id:nodes[0].id,to_id:nodes[1].id,relationship_type:"performs_capability",
  source_commit:"a".repeat(40),source_ids:["SRC-CONSTITUTION"],atlas_admitted:false};
 assert.deepEqual(inspectCandidateEdge(edge,nodes,d.ontology),[]);
 assert.match(inspectCandidateEdge({...edge,from_id:nodes[1].id,to_id:nodes[0].id},nodes,d.ontology).join(" "),/wrong typed direction/);
 assert.match(inspectCandidateEdge({...edge,atlas_admitted:true},nodes,d.ontology).join(" "),/forbidden inferred/);
});
test("publisher listing never establishes legal State supervision or command",()=>{
 const d=load(),nodes=[{id:"ORG-FED-EXE-DEP-DHS",kind:"institution",jurisdiction:"federal"},
  {id:"ORG-STATE-VA-LEG-GENERAL-ASSEMBLY",kind:"institution",jurisdiction:"member_state"}];
 const edge={from_id:nodes[0].id,to_id:nodes[1].id,relationship_type:"supervises",
  source_commit:"a".repeat(40),source_ids:["GOVMAN-2025-12-31:118"],atlas_admitted:false,
  verified_legal_original:false,independent_legal_review:false,inferred_command:true};
 const errors=inspectCandidateEdge(edge,nodes,d.ontology).join(" | ");
 assert.match(errors,/cross-jurisdiction/);assert.match(errors,/unverified law/);assert.match(errors,/forbidden inferred/);
});

test("military command requires operational evidence even after legal text review",()=>{
 const d=load(),nodes=[
  {id:"ORG-FED-EXE-DEP-DEFENSE",kind:"institution",jurisdiction:"federal"},
  {id:"ORG-FED-EXE-DEP-DHS",kind:"institution",jurisdiction:"federal"}
 ];
 const claim={from_id:nodes[0].id,to_id:nodes[1].id,relationship_type:"operationally_commands",
  source_commit:"c".repeat(40),source_ids:["SRC-TITLE10"],atlas_admitted:false,
  verified_legal_original:true,independent_legal_review:true,legal_effective_from:"2026-01-01",
  verified_operational_original:false};
 assert.match(inspectCandidateEdge(claim,nodes,d.ontology).join(" | "),/unverified operational execution/);
});
test("generic statutory text cannot impersonate an executed delegation",()=>{
 const d=load(),nodes=[{id:"AUTH-SCOPE",kind:"authority",jurisdiction:"federal"},
  {id:"ORG-FED-EXE-DEP-HHS",kind:"institution",jurisdiction:"federal"}];
 const edge={from_id:nodes[0].id,to_id:nodes[1].id,relationship_type:"delegates_to",
  source_commit:"c".repeat(40),source_ids:["SRC-STATUTE"],atlas_admitted:false,
  verified_legal_original:true,independent_legal_review:true,legal_effective_from:"2026-01-01"};
 assert.match(inspectCandidateEdge(edge,nodes,d.ontology).join(" | "),/executed delegation instrument not verified/);
});
