import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {INDEX_PATHS,compileFocusedGraph,projectFocusedView} from "../scripts/focused-projection-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const viewPaths=["model/projection/scopes.json","model/projection/edge-rules.json","model/projection/article-index.json","model/projection/amendment-index.json"];
function fixture(){return {manifest:read("model/federal/manifest.json"),files:Object.fromEntries([...INDEX_PATHS,...viewPaths].map(p=>[p,read(p)]))};}
const original=fixture();
const graph=compileFocusedGraph(original.manifest,original.files);
const scope=id=>projectFocusedView(graph,{scope_id:id});
const record=(path,id,f=original)=>{const item=f.files[path].items.find(x=>x.id===id);assert(item,"Missing test fixture "+id);return item;};
function negative(name,mutation,expected){
 test(name,()=>{const f=structuredClone(original);mutation(f);assert.throws(()=>compileFocusedGraph(f.manifest,f.files),new RegExp(expected));});
}
test("canonical Article coverage is indexed from seven separate source roots, not replicated summaries",()=>{
 assert.deepEqual(graph.coverage,{articles:7,amendments:27,article_units:103,amendment_units:126,rules:53,derived_edges:graph.edges.length});
 const matrix=[53,17,8,10,9,3,3];
 for(let i=0;i<7;i++){
  const row=original.files["model/projection/article-index.json"].items[i];
  assert.equal(row.source_unit_count,matrix[i]);
  assert(!Object.hasOwn(row,"summary"),"Article source summaries remain canonical, not copied into projection indexes");
  assert.equal(row.root_id,"CONST-US-ART-"+String(i+1).padStart(2,"0"));
  assert.equal(scope("SCOPE-CONST-ART-"+String(i+1).padStart(2,"0")).root_ids[0],row.root_id);
 }
});
test("individual Articles IV, V, VI, VII expose source-only focused views, preserving original legal effect",()=>{
 for(const [number,count]of [[4,10],[5,9],[6,3],[7,3]]){
  const id="SCOPE-CONST-ART-"+String(number).padStart(2,"0");
  const output=scope(id);
  const root=output.root_ids[0];
  assert(output.nodes.some(x=>x.id===root));
  assert.equal(original.files["model/projection/article-index.json"].items[number-1].source_unit_count,count);
  assert.equal(output.status,"data_projection_only_not_legal_advice");
  assert(!output.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-EDUCATION"));
 }
 const four=scope("SCOPE-CONST-ART-04");
 assert(four.nodes.some(x=>x.id==="A47-UNIT-IV-02-03"&&x.effect_status==="superseded"));
 const seven=scope("SCOPE-CONST-ART-07");
 assert(seven.nodes.some(x=>x.id==="A47-UNIT-VII-02"&&x.effect_status==="expired"));
 const five=scope("SCOPE-CONST-ART-05");
 assert(five.nodes.some(x=>x.id==="A47-UNIT-V-08"&&x.effect_status==="expired"));
});
test("Amendment I is a focused graph, not the global 27-amendment viewport",()=>{
 const result=scope("SCOPE-CONST-AMD-01");
 assert(result.nodes.some(x=>x.id==="CONST-US-AMD-01"));
 assert(result.nodes.some(x=>x.id==="AMD-UNIT-01-U-01"));
 assert(result.nodes.some(x=>x.id==="AMD-QUAL-01-U-01"));
 assert(!result.nodes.some(x=>x.id==="CONST-US-AMD-02"));
 assert(!result.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-EDUCATION"));
 assert(!result.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-DEFENSE"));
 assert(result.nodes.length>=6);
 assert(result.edges.every(e=>e.legal_authority_proven===false));
});
test("each of 27 amendment scopes retains its own source units and chronological status",()=>{
 const entries=original.files["model/projection/amendment-index.json"].items;
 assert.equal(entries.length,27);
 for(let n=1;n<=27;n++){
  const id="SCOPE-CONST-AMD-"+String(n).padStart(2,"0");
  const result=scope(id);
  const parent="CONST-US-AMD-"+String(n).padStart(2,"0");
  assert(result.nodes.some(x=>x.id===parent),"Missing amendment "+n);
  assert.equal(result.root_ids.length,1);
  assert.equal(entries[n-1].root_id,parent);
  assert(entries[n-1].source_unit_count>0);
 }
 const original18=scope("SCOPE-CONST-AMD-18");
 assert(original18.nodes.some(x=>x.id==="CONST-US-AMD-18"&&x.effect_status==="repealed"));
 const am21=scope("SCOPE-CONST-AMD-21");
 assert(am21.nodes.some(x=>x.id==="CONST-US-AMD-21"&&x.effect_status==="operative"));
});
test("cross-domain Amendment I + Defense query does not manufacture a legal connection",()=>{
 const query={scope_id:"SCOPE-CONST-AMD-01",focus_ids:["ORG-FED-EXE-DEP-DEFENSE"],
   exclude_ids:["ORG-FED-EXE-DEP-EDUCATION"],max_hops:4};
 const result=projectFocusedView(graph,query);
 assert.equal(result.root_ids.length,2);
 assert(result.nodes.some(x=>x.id==="CONST-US-AMD-01"));
 assert(result.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-DEFENSE"));
 assert(!result.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-EDUCATION"));
 assert.equal(result.connections.length,1);
 assert.equal(result.connections[0].status,"not_evidenced_within_selected_models");
 assert.match(result.connections[0].absence_caveat,/not proof/);
 assert(!result.edges.some(x=>x.from_id==="CONST-US-AMD-01"&&x.to_id==="ORG-FED-EXE-DEP-DEFENSE"));
});
test("explicit optional federal institutional relationships remain labeled descriptive, never delegation",()=>{
 const query={scope_id:"SCOPE-CONST-AMD-01",focus_ids:["ORG-FED-EXE-DEP-DEFENSE"],
 include_relation_classes:["structural","research_analysis","textual_candidate","qualification","historical_context","functional_alignment","federal_observed"]};
 const output=projectFocusedView(graph,query);
 assert(output.edges.some(x=>x.relationship_class==="federal_observed"&&x.legal_authority_proven===false));
 assert(!output.edges.some(x=>x.legal_authority_proven));
});
test("strict source-projection graph excludes unverified future policy domains",()=>{
 assert(!INDEX_PATHS.some(p=>p.startsWith("model/policy/")));
 assert(!original.manifest.focused_projection_extension.policy_mapping_status.includes("implemented"));
 assert(!original.manifest.focused_projection_extension.user_interface_status.includes("implemented"));
});
test("explicit exclusions remove context without silently changing canonical source",()=>{
 const x=projectFocusedView(graph,{scope_id:"SCOPE-CONST-AMD-01",exclude_ids:["AMD-QUAL-01-U-01"]});
 assert(!x.nodes.some(n=>n.id==="AMD-QUAL-01-U-01"));
 assert.equal(graph.nodes.get("AMD-QUAL-01-U-01").id,"AMD-QUAL-01-U-01");
});
test("text search identifies records only; string similarity cannot create a legal edge",()=>{
 const searched=projectFocusedView(graph,{search_text:"Department of Defense",max_hops:0});
 assert(searched.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-DEFENSE"));
 assert.equal(searched.edges.length,0);
 assert.equal(searched.connections.length,0);
 assert(!searched.nodes.some(x=>x.id==="CONST-US-AMD-01"));
});
test("filter source family and relationship class without changing source ownership",()=>{
 const x=projectFocusedView(graph,{scope_id:"SCOPE-CONST-AMD-01",include_record_kinds:["constitutional_provision"],include_relation_classes:["structural"]});
 assert(x.nodes.every(n=>n.kind==="constitutional_provision"));
 assert(x.edges.every(e=>e.relationship_class==="structural"));
});
test("query budget and unknown operation are rejected",()=>{
 for(const q of [
  {scope_id:"SCOPE-CONST-AMD-01",max_nodes:1},
  {scope_id:"SCOPE-CONST-AMD-01",max_hops:9},
  {scope_id:"SCOPE-CONST-AMD-01",include_relation_classes:["invented_delegation"]},
  {scope_id:"SCOPE-CONST-AMD-01",policy_mapping:true},
  {scope_id:"SCOPE-CONST-AMD-01",exclude_ids:["CONST-US-AMD-01"]},
  {scope_id:"SCOPE-CONST-AMD-01",focus_ids:["ORG-FED-DOES-NOT-EXIST"]}
 ])assert.throws(()=>projectFocusedView(graph,q),/Focused projection rejected/);
});
negative("missing one Article VI index record is rejected",f=>{f.files["model/projection/article-index.json"].items.splice(5,1);},"scope/index coverage incomplete");
negative("Article IV source-unit mapping cannot contain Nebraska-only or wrong Article unit",f=>{const row=record("model/projection/article-index.json","ARTICLE-INDEX-04",f);row.source_unit_ids[0]="A47-UNIT-VI-02";},"Article IV–VII crosswalk");
negative("source unit coverage cannot be reduced by falsifying its declared count",f=>{const row=record("model/projection/article-index.json","ARTICLE-INDEX-01",f);row.source_unit_ids.pop();row.source_unit_count--;},"Article source unit coverage");
negative("invented Article V index ID is rejected",f=>{record("model/projection/article-index.json","ARTICLE-INDEX-05",f).root_id="CONST-US-ART-04";},"incorrect Article index");
negative("missing First Amendment focused selector is rejected",f=>{f.files["model/projection/scopes.json"].items=f.files["model/projection/scopes.json"].items.filter(x=>x.id!=="SCOPE-CONST-AMD-01");},"scope/index coverage incomplete");
negative("amendment source index cannot claim another amendment's analytic spans",f=>{const row=record("model/projection/amendment-index.json","AMENDMENT-INDEX-01",f);row.source_unit_ids[0]="AMD-UNIT-02-U-01";},"amendment index crosses source records");
negative("repealed eighteenth amendment cannot become operative from index",f=>{record("model/projection/amendment-index.json","AMENDMENT-INDEX-18",f).current_text_effect="operative";},"amendment chronology/status mismatch");
negative("fabricated article source root is rejected",f=>{record("model/projection/scopes.json","SCOPE-CONST-ART-07",f).root_ids=["CONST-US-ART-99"];},"Article focus definition missing");
negative("source record identity collisions between families rejected",f=>{record("model/constitutional/amendment-units.json","AMD-UNIT-01-U-01",f).id="CONST-US-AMD-01";},"cross-file duplicate source ID");
negative("critical norm-to-provision edge may not be silently removed",f=>{f.files["model/projection/edge-rules.json"].items=f.files["model/projection/edge-rules.json"].items.filter(x=>x.source_model_path!=="model/constitutional/norms.json");f.manifest.focused_projection_extension.rule_count--;},"critical source reference rule omitted");
negative("invalid source path in edge rule is rejected",f=>{f.files["model/projection/edge-rules.json"].items[0].source_model_path="model/policy/nonexistent.json";},"rule uses unregistered");
negative("source path must be registered in canonical manifest",f=>{f.manifest.models=f.manifest.models.filter(p=>p!=="model/projection/article-index.json");},"unregistered collection");
negative("false website publication status is rejected",f=>{f.manifest.focused_projection_extension.release_status="deployed_live";},"projection release state");
negative("mutated historical article citation cannot silently switch legal effects",f=>{record("model/constitutional/article-iv-vii-units.json","A47-UNIT-IV-02-03",f).current_effect_status="operative";},"historical");
