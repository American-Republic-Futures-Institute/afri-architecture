import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=(p,root=ROOT)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
export function loadContract(root=ROOT){
 return {
  ontology:read("model/wholegov/ontology.json",root),
  schema:read("schemas/wholegov-ontology.schema.json",root),
  manifest:read("model/federal/manifest.json",root),
  branches:read("model/federal/branches.json",root),
  departments:read("model/federal/executive-departments.json",root),
  legacy:read("model/federal/relationships.json",root),
  registry:read("model/federal/inc15e1/relationship-type-registry.json",root)
 };
}
export function validateContract(data){
 const errors=[],no=s=>errors.push(s);
 const {ontology:o,schema:s,manifest:m,branches,departments,legacy,registry}=data;
 if(o?.model_version!=="0.1.0"||o?.contract_id!=="ARFI-COA-WHOLEGOV-INC17A"||
  o?.release_status!=="unratified_definitions_only"||
  o?.source_fact_count!==0||o?.public_graph_edges_added!==0)no("Ontology facts/authority admission forbidden");
 if(!m?.models?.includes("model/wholegov/ontology.json")||
  m?.whole_government_ontology_extension?.automatic_atlas_admission!==false||
  m?.whole_government_ontology_extension?.identity_mutations!==false)
  no("Missing unadmitted immutable manifest declaration");
 if(s?.additionalProperties!==false||s?.properties?.items?.items?.oneOf?.length!==5)
  no("Missing closed five-family JSON Schema");
 const arrays={};for(const type of ["element","jurisdiction","relationship","crosswalk","viewpoint"])arrays[type]=[];
 const ids=new Set();
 for(const item of o?.items||[]){
  if(ids.has(item.id))no("Duplicate ontology identifier "+item.id);
  ids.add(item.id);
  if(!arrays[item.record_type]){no("Unknown ontology record type");continue;}
  arrays[item.record_type].push(item);
  const shape=s?.properties?.items?.items?.oneOf?.find(v=>v.properties.record_type?.const===item.record_type);
  if(!shape||shape.additionalProperties!==false||
   Object.keys(item).sort().join()!==Object.keys(shape.properties).sort().join())
   no("Record not schema-closed: "+item.id);
 }
 const entities=new Set(arrays.element.map(x=>x.kind)),rels=new Set(arrays.relationship.map(x=>x.kind));
 for(const type of ["jurisdiction","institution","organizational_component","office","position",
  "legal_instrument","legal_provision","authority","government_function","capability",
  "program","public_service","population","public_outcome","indicator","source_observation"])
  if(!entities.has(type))no("Missing distinct entity kind "+type);
 for(const j of arrays.jurisdiction){
  if(j.default_federal_subordinate!==false||j.member_state!==(j.kind==="member_state"))
   no("Jurisdiction improperly subordinate or reclassified: "+j.id);
 }
 for(const kind of ["federal","member_state","tribal_nation","territory","federal_district","local_government"])
  if(!arrays.jurisdiction.some(x=>x.kind===kind))no("Missing jurisdiction class "+kind);
 for(const r of arrays.relationship){
  if(!r.directed||r.transitive_inference||r.automatic_inverse||r.legal_power_inferred||
    r.operational_action_inferred||r.public_admission)no("Inferred power or auto-admitted relation "+r.kind);
  if(!["structure","rights","powers","services","oversight","context"].includes(r.category))
   no("Unsupported Atlas edge category "+r.kind);
  if(r.assertion_class==="legal"&&!/(reviewed|review)/.test(r.evidence_requirement))
   no("Legal predicate lacks independent review requirement: "+r.kind);
  for(const kind of [...r.from_kinds,...r.to_kinds])if(!entities.has(kind))
   no("Dangling typed endpoint "+kind+" for "+r.kind);
 }
 const available=new Map([
  ["model/federal/relationships.json",new Set((legacy?.items||[]).map(x=>x.relationship_type))],
  ["model/federal/inc15e1/relationship-type-registry.json",new Set((registry?.relationship_types||[]).map(x=>x.id))]
 ]);
 for(const x of arrays.crosswalk){
  if(!available.get(x.origin_model)?.has(x.origin_predicate))no("Unknown legacy source predicate: "+x.origin_predicate);
  if(!rels.has(x.normalized_predicate)||x.origin_predicate!==x.normalized_predicate||
   x.source_review_inherited!==false||x.automatic_admission!==false)
   no("Unqualified legacy predicate promotion "+x.id);
 }
 for(const v of arrays.viewpoint){
  if(!v.source_commit_required||!v.admitted_edges_only||v.public_admission||v.max_hops<1||v.max_hops>3)
   no("Unadmitted viewpoint cannot claim authority or publish edges "+v.id);
  for(const kind of v.root_kinds)if(!entities.has(kind))no("Unknown viewpoint root "+kind);
  for(const pred of v.relationship_kinds)if(!rels.has(pred))no("Unknown viewpoint predicate "+pred);
 }
 if(!arrays.viewpoint.some(x=>x.id==="WG-V-CITIZEN"))no("Citizen outcome reverse trace missing");
 if((branches?.items||[]).length!==3||(departments?.items||[]).filter(x=>x.kind==="executive_department").length!==15)
  no("Existing canonical federal branch/Cabinet roster changed");
 return {errors,counts:Object.fromEntries(Object.entries(arrays).map(([k,v])=>[k,v.length]))};
}
/* A preliminary proof of shape and source scoping, NOT an Atlas admission gate
 * and NOT a verification of actual statutory, signed or operational originals.
 */
export function inspectCandidateEdge(edge,nodes,ontology){
 const failures=[],r=ontology.items.find(x=>x.record_type==="relationship"&&x.kind===edge.relationship_type);
 const byId=new Map(nodes.map(x=>[x.id,x])),a=byId.get(edge.from_id),b=byId.get(edge.to_id);
 if(!r)failures.push("unknown predicate");
 if(!a||!b)failures.push("missing endpoint");
 if(r&&a&&b&&(!r.from_kinds.includes(a.kind)||!r.to_kinds.includes(b.kind)))
  failures.push("wrong typed direction");
 if(!/^[a-f0-9]{40}$/.test(edge.source_commit||"")||!Array.isArray(edge.source_ids)||!edge.source_ids.length)
  failures.push("unqualified source edition");
 if(a&&b&&a.jurisdiction!==b.jurisdiction&&!edge.explicit_jurisdiction_scope)
  failures.push("cross-jurisdiction authority not established");
 if(r?.assertion_class==="legal"&&(!edge.verified_legal_original||!edge.independent_legal_review||
  !edge.legal_effective_from))failures.push("unverified law or legal era");
 if(r&&(r.assertion_class==="operational"||r.evidence_requirement.includes("operational"))&&
  !edge.verified_operational_original)failures.push("unverified operational execution");
 if(r?.kind==="delegates_to"&&!edge.executed_delegation_original_verified)
  failures.push("executed delegation instrument not verified");
 if(edge.atlas_admitted||edge.inferred_command||edge.inferred_causation||edge.inferred_legal_authority)
  failures.push("forbidden inferred power, causality or public admission");
 return failures;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const r=validateContract(loadContract());
 console.log(JSON.stringify({status:r.errors.length?"invalid":"definition_only_valid",...r}));
 if(r.errors.length)process.exitCode=1;
}
