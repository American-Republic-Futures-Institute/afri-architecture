// Deterministic, research-only federal institution census audit.
// No endpoint, law, operational command, funding or external identifier is inferred.
const PATHS=Object.freeze({
 refs:"model/federal/coverage/institution-references.json",
 taxonomy:"model/federal/coverage/taxonomy.json",
 sources:"model/federal/coverage/source-registry.json",
 snapshots:"model/federal/coverage/source-snapshots.json",
 components:"model/federal/coverage/components.json",
 relations:"model/federal/coverage/relationships.json",
 gaps:"model/federal/coverage/gaps.json",
 viewpoints:"model/federal/coverage/viewpoints.json"
});
const BASE=Object.freeze([
 "model/federal/legislative.json",
 "model/federal/executive-leadership.json",
 "model/federal/executive-departments.json",
 "model/federal/executive-independent.json",
 "model/federal/judiciary.json"
]);
export const CENSUS_MODEL_PATHS=Object.freeze([...BASE,...Object.values(PATHS),
 "model/federal/branches.json","model/federal/sources.json"]);
const INSTITUTION_TYPES=new Set([
 "legislative_body","legislative_chamber","legislative_support","constitutional_office",
 "executive_office","executive_office_component","executive_department",
 "executive_non_department_candidate","judicial_entity","military_department",
 "statutory_component_class","department_component","independent_oversight_component"
]);
const DEPT_GROUPS={DEFENSE:9,DHS:10,EDUCATION:10};
const RELATIONS=new Set(["statutory_composition_only","agency_directory_or_chart_membership",
 "independent_oversight_placement_not_command"]);
function bad(reason){throw new Error("Federal census rejected: "+reason);}
function requireFact(condition,message){if(!condition)bad(message);}
const id=x=>typeof x==="string"&&/^[A-Z][A-Z0-9-]{2,170}$/.test(x);
const uniq=arr=>new Set(arr).size===arr.length;
const isDate=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"));
const pathGuard=x=>typeof x==="string"&&/^model\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\.json$/.test(x);
const asArray=x=>Array.isArray(x)?x:[];
function dataset(manifest,files,path){
 requireFact(manifest.models.includes(path),"unregistered collection "+path);
 const data=files[path];
 requireFact(data&&data.model_version==="0.1.0"&&Array.isArray(data.items),
  "missing or incorrect versioned collection "+path);
 requireFact(data.items.every(x=>x&&typeof x==="object"&&!Array.isArray(x)&&id(x.id)),
  "malformed entity identifier in "+path);
 requireFact(uniq(data.items.map(x=>x.id)),"duplicate identifiers in "+path);
 return data.items;
}
function stableEqual(x,y){return JSON.stringify([...x].sort())===JSON.stringify([...y].sort());}
const classify=(path,x)=>{
 if(path.endsWith("executive-departments.json"))return "executive_department";
 if(path.endsWith("executive-independent.json"))return "executive_non_department_candidate";
 if(path.endsWith("judiciary.json"))return "judicial_entity";
 if(path.endsWith("executive-leadership.json"))return x.kind==="eop_component"?"executive_office_component":
  x.kind==="executive_office"?"executive_office":"constitutional_office";
 if(x.kind==="legislative_chamber")return "legislative_chamber";
 if(x.kind==="bicameral_legislature")return "legislative_body";
 return "legislative_support";
};
const familyKey=x=>"CENSUS-TYPE-"+x.toUpperCase().replaceAll("_","-");
function allowedSourceUrl(str){
 if(typeof str!=="string")return false;
 try{
  const url=new URL(str);
  if(url.protocol!=="https:"||url.username||url.password||url.searchParams.has("token"))return false;
  const allowed=["govinfo.gov","uscode.house.gov","dhs.gov","ed.gov"];
  return allowed.some(d=>url.hostname===d||url.hostname.endsWith("."+d));
 }catch{return false;}
}
export function validateFederalCensus(manifest,files){
 requireFact(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest?.release_status==="research_baseline_unratified","source model standard and unratified status");
 const ext=manifest.federal_institutional_census_extension;
 requireFact(ext?.id==="ARFI-COA-FED-CENSUS-001"&&ext.version==="0.1.0"&&
  ext.publication_status==="research_data_only_unratified"&&
  ext.website_integration_status==="deferred"&&ext.department_completeness_status==="none_certified"&&
  ext.full_government_denominator_status==="not_established"&&ext.legal_review_status==="pending",
  "projection must not claim deployed website, complete census or certified legal review");
 requireFact(uniq(asArray(manifest.models))&&asArray(manifest.models).every(pathGuard),
  "canonical manifest paths are not unique and safe");
 const baseline=BASE.flatMap(path=>dataset(manifest,files,path).map(x=>({...x,_path:path})));
 const branches=dataset(manifest,files,"model/federal/branches.json");
 const officialSources=dataset(manifest,files,"model/federal/sources.json");
 const sourceRegistry=new Map(officialSources.map(x=>[x.id,x]));
 requireFact(baseline.length===ext.institutional_reference_count&&baseline.length===61,
  "baseline model count mismatches census index");
 requireFact(branches.length===3&&stableEqual(branches.map(x=>x.id),["BR-FED-LEG","BR-FED-EXE","BR-FED-JUD"]),"three branches required");
 requireFact(baseline.filter(x=>x.kind==="executive_department").length===15&&ext.known_baseline_department_count===15,
  "known 15 department catalog mismatch");
 const byInstitution=new Map(baseline.map(x=>[x.id,x]));
 requireFact(byInstitution.size===baseline.length,"duplicate canonical institutional ID");
 const sources=dataset(manifest,files,PATHS.sources);
 const srcById=new Map();
 for(const s of sources){
  requireFact(s.type==="census_primary_source"&&allowedSourceUrl(s.url)&&isDate(s.accessed_on)&&
    (s.published_on===null||isDate(s.published_on))&&
    typeof s.scope_boundary==="string"&&s.scope_boundary.length>=28&&
    typeof s.revision_basis==="string"&&s.revision_basis.length>=15,
    "unsourced, undated or falsely versioned external census source "+s.id);
  requireFact(!srcById.has(s.id),"duplicate census source "+s.id);srcById.set(s.id,s);
 }
 requireFact(sources.some(x=>x.id===ext.primary_census_source_id&&x.url.includes("GOVMAN-2025-12-31")),
  "missing independently dated official federal baseline publication");
 const snapshots=dataset(manifest,files,PATHS.snapshots);
 const snapshotMap=new Map(snapshots.map(x=>[x.id,x]));
 for(const s of snapshots){
  const original=srcById.get(s.source_id);
  requireFact(!!original&&isDate(s.edition_date)&&isDate(s.retrieved_on)&&
   s.retrieved_on>=s.edition_date&&s.retrieved_on===original.accessed_on&&
   typeof s.scope==="string"&&s.scope.length>=28&&
   s.denominator_status!=="complete"&&s.denominator_status!=="fully_verified",
   "undated, unsourced or exaggerated source edition "+s.id);
  requireFact(s.snapshot_kind==="mutable_web_directory"?s.immutable_url===null:
    s.immutable_url===original.url,
    "mutable directory cannot masquerade as archived immutable source "+s.id);
 }
 requireFact(snapshots.length>=4&&snapshotMap.has("CENSUS-SNAPSHOT-GOVMAN-2025-12-31"),
  "dated federal census seed snapshot absent");
 const taxonomy=dataset(manifest,files,PATHS.taxonomy);
 const classMap=new Map(taxonomy.map(x=>[x.id,x]));
 requireFact(taxonomy.length===INSTITUTION_TYPES.size&&
  stableEqual(taxonomy.map(x=>x.type_key),[...INSTITUTION_TYPES]),"incomplete or invented class taxonomy");
 for(const c of taxonomy)requireFact(c.id===familyKey(c.type_key)&&c.type==="federal_institution_class"&&
  branches.some(b=>b.id===c.branch_id)&&
  typeof c.boundary==="string"&&c.boundary.length>=20,"invalid class boundary "+c.id);
 const refs=dataset(manifest,files,PATHS.refs),byRef=new Map(refs.map(x=>[x.institution_id,x]));
 requireFact(refs.length===baseline.length&&byRef.size===baseline.length,
  "census does not cover each canonical institutional identifier exactly once");
 for(const o of baseline){
  const x=byRef.get(o.id);
  requireFact(x&&x.id==="CENSUS-REF-"+o.id&&x.type==="federal_canonical_institution_reference",
   "missing authoritative canonical crosswalk "+o.id);
  requireFact(x.canonical_model_path===o._path&&x.canonical_kind===o.kind&&
   x.census_class_id===familyKey(classify(o._path,o))&&
   classMap.get(x.census_class_id)?.branch_id===o.branch_id&&
   x.branch_id===o.branch_id&&x.parent_catalog_id===o.parent_id,
   "cross-branch or invented institutional classification "+o.id);
  requireFact(stableEqual(asArray(x.source_ids),asArray(o.source_ids))&&
   x.source_ids.every(s=>sourceRegistry.has(s)),"census reference lost canonical official citations "+o.id);
  requireFact(x.adl_evidenced===0&&[1,2].includes(x.adl_target_min)&&
    x.identity_evidence_status==="canonical_source_catalogued_not_independently_recensused"&&
    x.structural_scope_status==="incomplete_first_level_component_census"&&
    x.authority_scope_status==="not_verified_for_whole_institution"&&
    x.official_external_identifier===null&&x.external_identifier_status==="not_mapped_no_identifier_inference"&&
    x.legal_classification_status!=="verified"&&x.last_verified_at===null&&
    x.review_status==="research_pending_human_review",
   "unsupported ADL / external-ID / legal-classification promotion "+o.id);
  requireFact(snapshotMap.has(x.evidence_snapshot),"canonical reference must be associated with a declared source edition");
 }
 const components=dataset(manifest,files,PATHS.components),compMap=new Map(components.map(x=>[x.id,x]));
 requireFact(components.length===ext.pilot_component_candidate_count&&
  ext.pilot_department_count===3&&components.length===29,
  "pilot component registry no longer matches the declared bounded research scope");
 const pilotCounts={};
 for(const c of components){
  requireFact(c.type==="first_level_component_candidate"&&c.branch_id==="BR-FED-EXE"&&
   /^ORG-FED-EXE-DEP-(?:DEFENSE|DHS|EDUCATION)$/.test(c.parent_institution_id)&&
   !!byInstitution.get(c.parent_institution_id)&&
   typeof c.name==="string"&&c.name.length>=8&&classMap.has(c.model_class_id)&&
   typeof c.evidence_locator==="string"&&c.evidence_locator.length>=15,
   "unknown or wrong-parent department component "+c.id);
  requireFact(c.organizational_relation==="statutory_composition_only"&&c.parent_institution_id.endsWith("DEFENSE")
   ||(c.organizational_relation!=="statutory_composition_only"&&!c.parent_institution_id.endsWith("DEFENSE")),
   "component incorrectly assigned statutory composition semantics "+c.id);
  requireFact(RELATIONS.has(c.organizational_relation)&&c.legal_authority_status==="not_mapped"&&
   c.adl_evidenced===0&&c.delegation_verified===false&&c.appropriation_verified===false&&
   c.review_status==="research_pending_human_review"&&
   c.identity_status==="official_source_recorded_current_structure_not_independently_verified",
   "institution component incorrectly asserts lawful powers or complete review "+c.id);
  const snapshot=snapshotMap.get(c.snapshot_id);
  requireFact(snapshot&&c.source_ids?.includes(snapshot.source_id)&&
   c.source_ids.every(x=>srcById.has(x)),"component without primary, matching edition provenance "+c.id);
  requireFact(c.model_class_id===familyKey(c.kind==="military_department"?"military_department":
   c.kind==="component_class"?"statutory_component_class":
   c.kind==="independent_oversight_component"?"independent_oversight_component":"department_component"),
   "incorrect component classification "+c.id);
  if(c.kind==="independent_oversight_component")
   requireFact(c.organizational_relation==="independent_oversight_placement_not_command",
    "inspector general cannot be placed in an executive command hierarchy");
  if(c.kind==="component_class")
   requireFact(c.name.includes("class"),"department-level collection cannot be mistaken for an individual agency");
  const key=c.parent_institution_id.split("-").at(-1);pilotCounts[key]=(pilotCounts[key]||0)+1;
 }
 requireFact(stableEqual(Object.entries(pilotCounts).map(([k,v])=>k+":"+v),Object.entries(DEPT_GROUPS).map(([k,v])=>k+":"+v)),
  "component inventory changed without bounded source and research review");
 const relations=dataset(manifest,files,PATHS.relations);
 requireFact(relations.length===components.length,"each pilot component needs an explicit typed source relationship");
 const seenRel=new Set();
 for(const e of relations){
  const item=compMap.get(e.from_id);
  requireFact(e.type==="federal_evidenced_organization_relation"&&item&&
   e.to_id===item.parent_institution_id&&e.relationship_type===item.organizational_relation&&
   e.classification==="source_descriptive_not_command_or_delegation"&&
   e.operational_command_proven===false&&e.delegated_statutory_power_proven===false&&
   e.classification_review_complete===false&&e.snapshot_id===item.snapshot_id&&
   stableEqual(e.source_ids,item.source_ids),
   "invalid relationship or fabricated command/legal power "+e.id);
  requireFact(!seenRel.has(e.from_id),"duplicate component relationship "+e.from_id);
  seenRel.add(e.from_id);
 }
 const gaps=dataset(manifest,files,PATHS.gaps),gapIds=new Set(gaps.map(x=>x.id));
 requireFact(gaps.length>=9&&["DEFENSE","DHS","EDUCATION"].every(x=>gapIds.has("CENSUS-GAP-"+x+"-FULL-STRUCTURE")),
  "missing declared pilot completeness gaps");
 for(const g of gaps)requireFact(g.type==="federal_coverage_gap"&&g.denominator==="unknown"&&
  g.review_status==="open_research_gap"&&
  (byInstitution.has(g.parent_institution_id)||branches.some(x=>x.id===g.parent_institution_id))&&
  typeof g.closure_condition==="string"&&g.closure_condition.length>=40,
  "false completed census claim or dangling gap "+g.id);
 const views=dataset(manifest,files,PATHS.viewpoints);
 requireFact(views.length===4,"missing reference-only federal census viewpoints");
 const viewIds=new Set(views.map(x=>x.id));
 requireFact(["VIEW-CENSUS-BASELINE","VIEW-CENSUS-DEFENSE-COMPONENTS","VIEW-CENSUS-DHS-COMPONENTS","VIEW-CENSUS-EDUCATION-COMPONENTS"].every(x=>viewIds.has(x)),
  "pilot published selectors missing");
 for(const v of views){
  requireFact(v.type==="census_institution_reference_view"&&
   v.render_status==="data_contract_only_not_website_rendered"&&
   v.allowed_relation_types.every(x=>RELATIONS.has(x))&&
   asArray(v.root_ids).every(x=>byInstitution.has(x)||branches.some(b=>b.id===x))&&
   asArray(v.source_model_paths).every(x=>manifest.models.includes(x)),
   "viewpoint tries to render unavailable, unreviewed or invented law "+v.id);
 }
 return {model_standard:"ARFI-COA",model_version:"0.1.0",status:"research_data_only_unratified",
  counts:{canonical_institutions:baseline.length,cabinet_departments:15,institution_classes:taxonomy.length,
   pilot_department_components:components.length,pilot_defense:pilotCounts.DEFENSE,
   pilot_dhs:pilotCounts.DHS,pilot_education:pilotCounts.EDUCATION,
   evidence_sources:sources.length,source_editions:snapshots.length,explicit_gaps:gaps.length,
   census_viewpoints:views.length,authorized_department_census:0},
  denominator_status:"not_established",coverage_level:"ADL-0_only_identified_candidate_not_verified_structural_completion",
  canonical:byInstitution,components:compMap,relationships:relations,gaps,views,sources,snapshots};
}
export function projectFederalCensus(data,viewId){
 const v=data.views.find(v=>v.id===viewId);
 requireFact(v,"unknown unapproved federal census viewpoint "+viewId);
 const roots=new Set(v.root_ids),included=new Map();
 for(const x of data.canonical.values()){
  if(roots.has(x.id)||roots.has(x.branch_id))included.set(x.id,{
   id:x.id,name:x.name,kind:x.kind,branch_id:x.branch_id,parent_id:x.parent_id,
   canonical_model_path:x._path,is_source_anchored:true,legal_authority_verified:false});
 }
 for(const x of data.components.values())if(roots.has(x.parent_institution_id))
  included.set(x.id,{id:x.id,name:x.name,kind:x.kind,branch_id:x.branch_id,
   parent_id:x.parent_institution_id,is_source_anchored:true,legal_authority_verified:false});
 const edges=data.relationships.filter(x=>included.has(x.from_id)&&included.has(x.to_id)&&
  v.allowed_relation_types.includes(x.relationship_type));
 return {view_id:viewId,root_ids:v.root_ids,status:"data_contract_only_not_website_rendered",
  model_standard:"ARFI-COA",denominator_status:data.denominator_status,
  elements:[...included.values()].sort((a,b)=>a.id.localeCompare(b.id)),
  relationships:edges,notes:["Descriptive census containment only; no operational command or statutory authority inferred.",
   "Incomplete historical/edition evidence; no claim of comprehensive current federal structure."]};
}
