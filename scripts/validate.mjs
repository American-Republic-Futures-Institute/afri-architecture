#!/usr/bin/env node
// Architecture-model integrity validation only. This repository has no renderer.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest = read("model/federal/manifest.json");
const failures=[];
const assert=(pass,message)=>{if(!pass)failures.push(message);};
assert(manifest.model_standard==="ARFI-COA" && manifest.model_version==="0.1.0","Unexpected model version");
assert(manifest.release_status==="research_baseline_unratified","Published as a ratified model");
assert(manifest.models.length===new Set(manifest.models).size,"Repeated model in manifest");
const mandatory=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","authorities","capabilities","relationships","sources","viewpoints"];
for(const m of mandatory)assert(manifest.models.includes("model/federal/"+m+".json"),"Missing model "+m);
const all=Object.fromEntries(manifest.models.filter(p=>p.startsWith("model/federal/")).map(p=>[path.basename(p,".json"),read(p)]));
for(const [name,data] of Object.entries(all)) {
  assert(data.model_version===manifest.model_version,"Version mismatch "+name);
  assert(Array.isArray(data.items),"Model missing items array "+name);
}
const sources=all.sources.items; const srcIds=new Set(sources.map(x=>x.id));
assert(sources.length===srcIds.size,"Duplicate source ID");
for(const s of sources){
  assert(/^SRC-[A-Z0-9-]+$/.test(s.id),"Invalid source ID "+s.id);
  assert(/^https:\/\//.test(s.url),"Non-HTTPS source "+s.id);
  assert(s.accessed_on===manifest.snapshot_date,"Undated source "+s.id);
}
const entities=[...all.branches.items,...all.legislative.items,...all["executive-leadership"].items,...all["executive-departments"].items,...all["executive-independent"].items,...all.judiciary.items,...all.authorities.items,...all.capabilities.items];
const ids=new Set(entities.map(x=>x.id));
assert(ids.size===entities.length,"Duplicate element ID");
const byId=new Map(entities.map(e=>[e.id,e]));
const branches=all.branches.items;
assert(branches.length===3 && ["BR-FED-LEG","BR-FED-EXE","BR-FED-JUD"].every(x=>ids.has(x)),"Expected exactly three constitutional branches");
const depts=all["executive-departments"].items;
assert(depts.length===15 && depts.every(x=>x.kind==="executive_department"),"Exactly 15 executive departments required");
for(const el of entities) {
 assert(typeof el.id==="string" && /^[A-Z0-9-]+$/.test(el.id),"Invalid element identifier");
 assert(typeof el.status==="string" && el.status.length>2,"Missing element status "+el.id);
 assert(Array.isArray(el.source_ids) && el.source_ids.length>0,"Missing provenance "+el.id);
 for(const s of el.source_ids??[])assert(srcIds.has(s),"Unknown source "+s+" on "+el.id);
 if(el.type==="institution"){
  assert(typeof el.mission==="string" && el.mission.length>=20,"Missing mission "+el.id);
  assert(Array.isArray(el.roles) && el.roles.length>0,"Missing roles "+el.id);
  assert(ids.has(el.branch_id) && byId.get(el.branch_id)?.type==="branch","Invalid branch "+el.id);
  assert(ids.has(el.parent_id),"Invalid parent "+el.id);
  assert(el.parent_id!==el.id,"Self-parent "+el.id);
  if(el.parent_id!==el.branch_id){
    assert(byId.get(el.parent_id)?.branch_id===el.branch_id,"Cross-branch containment "+el.id);
  }
 }
}
for(const el of entities.filter(x=>x.type==="institution")){
 const visited=new Set([el.id]);let p=el.parent_id;
 while(p && byId.get(p)?.type==="institution"){
  if(visited.has(p)){failures.push("Hierarchy cycle "+el.id);break;}
  visited.add(p);p=byId.get(p).parent_id;
 }
}
const rels=all.relationships.items; const relIds=new Set(rels.map(x=>x.id));
assert(relIds.size===rels.length,"Duplicate relationship ID");
const types=new Set(["performs_capability","established_under","exercises_power_under","exercises_oversight_of","executes_laws_enacted_by","advises_or_supports","reviews_decisions_of","sets_administrative_policy_for"]);
for(const r of rels){
 assert(ids.has(r.from_id) && ids.has(r.to_id),"Dangling relationship "+r.id);
 assert(types.has(r.relationship_type),"Unknown relationship type "+r.id);
 assert(Array.isArray(r.source_ids) && r.source_ids.length>0,"Missing relationship source "+r.id);
 for(const s of r.source_ids??[])assert(srcIds.has(s),"Dangling relationship source "+r.id);
 if(r.relationship_type==="performs_capability"){
  assert(byId.get(r.from_id)?.type==="institution" && byId.get(r.to_id)?.type==="capability","Invalid performance relationship "+r.id);
 }
}
for(const v of all.viewpoints.items){
 assert(Array.isArray(v.root_ids) && v.root_ids.length>0,"View without roots "+v.id);
 for(const id of v.root_ids)assert(ids.has(id),"Dangling view root "+v.id+":"+id);
 for(const t of v.included_relationship_types)assert(types.has(t),"Unrecognized view relation type "+v.id+":"+t);
}
assert(all.capabilities.items.length>=30,"Insufficient core capability seeds");
console.log(JSON.stringify({snapshot:manifest.snapshot_date,branches:branches.length,executive_departments:depts.length,institutions:entities.filter(x=>x.type==="institution").length,capabilities:all.capabilities.items.length,authorities:all.authorities.items.length,relationships:rels.length,sources:sources.length,viewpoints:all.viewpoints.items.length,errors:failures},null,2));
if(failures.length)process.exitCode=1;
