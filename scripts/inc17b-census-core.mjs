#!/usr/bin/env node
/* INC-17B: exact-edition, additive government census. This validator inspects
 * source-only reference indexes, not legal status, government authority,
 * historical/current identity equivalence, or public Atlas admission.
 */
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const relative={
 anchors:"model/wholegov/inc17b-institution-anchors.json",
 observations:"model/wholegov/inc17b-publisher-observations.json",
 departments:"model/wholegov/inc17b-department-breadth.json",
 jurisdictions:"model/wholegov/inc17b-jurisdiction-coverage.json",
 boundaries:"model/wholegov/inc17b-relationship-boundaries.json",
 coverage:"model/wholegov/inc17b-coverage-ledger.json"
};
const orig={
 directory:"model/federal/inc15d-govman-2025-directory.json",
 crosswalk:"model/federal/inc15d-govman-2025-crosswalk.json",
 report:"model/federal/inc15d9-govman-2025-publisherwide-disposition-coverage.json",
 inc15b:"model/federal/inc15b-cabinet-sources.json",
 departmentCrosswalk:"model/federal/inc15-cabinet-crosswalks.json",
 fedRelationships:"model/federal/relationships.json",
 stateLinks:"model/state/federalism-links.json",
 states:"model/state/jurisdictions.json",
 dc:"model/state/nonstate-comparators.json",
 stateInstitutions:"model/state/institutions.json"
};
const dispositionPaths=["5","6","7","8","9"].map(x=>"model/federal/inc15d"+x+"-govman-2025-dispositions.json");
const coreFamilies=[
 ["legislative","model/federal/legislative.json",9],
 ["executive_leadership","model/federal/executive-leadership.json",10],
 ["cabinet","model/federal/executive-departments.json",15],
 ["independent","model/federal/executive-independent.json",18],
 ["judiciary","model/federal/judiciary.json",9]
];
const file=(root,p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
export function loadCensus(root=ROOT){
 const originalPaths=[...Object.values(orig),...dispositionPaths,...coreFamilies.map(x=>x[1])];
 const sources=Object.fromEntries(originalPaths.map(p=>[p,file(root,p)]));
 const directory=sources[orig.directory];
 return {
  root, models:Object.fromEntries(Object.entries(relative).map(([name,p])=>[name,file(root,p)])),
  manifest:file(root,"model/federal/manifest.json"),
  schema:file(root,"schemas/inc17b-census.schema.json"),
  sources,
  sourceOriginalBytes:fs.readFileSync(path.join(root,directory.source_original_repository_path))
 };
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const groupBy=(rows,f)=>{const m=new Map();for(const x of rows){const k=f(x);m.set(k,(m.get(k)||0)+1);}return m;};
function shapeOk(value,schema){
 if("const" in schema)return same(value,schema.const);
 if(schema.type){
  const types=Array.isArray(schema.type)?schema.type:[schema.type];
  const t=value===null?"null":Array.isArray(value)?"array":Number.isInteger(value)?"integer":typeof value;
  if(!types.includes(t))return false;
  if(t==="string"&&schema.minLength&&value.length<schema.minLength)return false;
  if(t==="array")return value.every(item=>shapeOk(item,schema.items||{}));
 }
 return true;
}
export function validateCensus(d){
 const errors=[],fail=x=>errors.push(x),m=d.models,c=d.sources,main=d.manifest;
 const source=c[orig.directory],cross=c[orig.crosswalk],report=c[orig.report];
 const rawHash=createHash("sha256").update(d.sourceOriginalBytes).digest("hex");
 const gitHash=createHash("sha1").update(Buffer.from("blob "+d.sourceOriginalBytes.length+"\0")).update(d.sourceOriginalBytes).digest("hex");
 if(rawHash!==source.original_source_sha256||gitHash!==report.publisher_original_git_blob_sha1)
  fail("Original archived publisher XML does not match SHA-256 and Git-blob receipts");
 if(source.original_source_sha256!==cross.original_source_sha256||
    source.original_source_sha256!==report.publisher_original_sha256||
    source.source_package_id!=="GOVMAN-2025-12-31"||
    source.source_publication_date!=="2025-12-31")
  fail("Mixed or invalid original publisher epochs");
 const declared=Object.values(relative);
 if(declared.some(p=>main.models?.filter(x=>x===p).length!==1)||
    new Set(main.models).size!==main.models.length||
    main?.whole_government_inc17b_extension?.atlas_admitted!==false||
    main?.whole_government_inc17b_extension?.canonical_id_mutations!==false||
    main?.whole_government_inc17b_extension?.new_legal_authority_edges!==0||
    main?.whole_government_inc17b_extension?.research_family_count!==6)
  fail("Unreviewed census manifest or public authority promotion");
 if(d.schema?.oneOf?.length!==6||d.schema?.$schema!=="https://json-schema.org/draft/2020-12/schema")
  fail("Missing six collection closed JSON Schema contracts");
 for(const model of Object.values(m)){
  if(model.model_version!=="0.1.0"||!Array.isArray(model.items)||!model.items.length||
     model.atlas_admitted!==false&&model.model_family!=="inc17b-cross-branch-and-jurisdiction-semantic-boundaries")
   fail("Invalid or admitted source census collection "+model.model_family);
  const entry=d.schema?.oneOf?.find(x=>x.properties?.model_family?.const===model.model_family);
  if(!entry||entry.additionalProperties!==false||
     !entry.properties.items?.items||entry.properties.items.items.additionalProperties!==false)
   {fail("Missing closed schema for "+model.model_family);continue;}
  if(!same(Object.keys(model).sort(),entry.required.slice().sort()))fail("Model schema key drift "+model.model_family);
  const itemSchema=entry.properties.items.items;
  for(const record of model.items){
   if(!same(Object.keys(record).sort(),itemSchema.required.slice().sort()))
    fail("Row schema key drift "+model.model_family+":"+record.id);
   for(const [key,s] of Object.entries(itemSchema.properties))
    if(!shapeOk(record[key],s))fail("Invalid schema field "+model.model_family+":"+record.id+":"+key);
  }
 }
 const canonical=[],originalById=new Map(),originalBySourceKey=new Map();
 for(const [family,path,n] of coreFamilies){
  const rows=c[path].items;
  if(rows.length!==n)fail("Changed preexisting canonical core scope: "+family);
  for(const x of rows){
   if(originalById.has(x.id))fail("Duplicate existing core canonical identity "+x.id);
   originalById.set(x.id,x);canonical.push({family,path,x});
  }
 }
 const links=new Map();
 for(const row of cross.items){
  if(links.has(row.source_entity_key))fail("Repeated original publisher crosswalk");
  links.set(row.source_entity_key,row);
 }
 const canonicalLinks=new Map([...links.values()].filter(x=>x.canonical_id).map(x=>[x.canonical_id,x]));
 const aRows=m.anchors.items,byCanonical=new Map(aRows.map(x=>[x.canonical_id,x]));
 if(canonical.length!==61||aRows.length!==61||byCanonical.size!==61||canonicalLinks.size!==50)
  fail("Incorrect existing 61-core/50-link scope");
 if(m.anchors.source_catalog_base_sha!=="f18c6e1ad71090e0cd2cc833fe74031f07ad5d18"||
    m.anchors.current_legal_whole_government_denominator!==null||
    m.anchors.institutional_authority_certified!==false)
  fail("Canonical record anchor source and legal scope must remain pinned");
 for(const {family,path,x} of canonical){
  const r=byCanonical.get(x.id),link=canonicalLinks.get(x.id);
  if(!r||r.id!=="WG17B-CORE-"+x.id||r.canonical_source_model!==path||
    r.family!==family||r.branch_id!==x.branch_id||
    r.source_catalog_parent_id!==x.parent_id||
    !same(r.canonical_source_ids,x.source_ids)||r.original_core_observation_status!==x.status||
    r.govman_2025_source_key!==(link?.source_entity_key||null)||
    r.govman_identity_link_status!==(link?"provisional_edition_name_or_alias_not_certified":"no_2025_provisional_link"))
   fail("Core canonical identity or provenance drift "+x.id);
  if(r&&(r.adl1_certified!==false||r.qualified_adl1_first_level_denominator!==null||
   r.atlas_admitted!==false||r.current_legal_powers_independently_reviewed!==false||
   r.current_institutional_structure_complete!==false||
   r.source_catalog_hierarchy_is_not_command!==true||r.jurisdiction_class!=="federal"))
   fail("Source-only canonical record promoted to authority or complete ADL1 "+x.id);
 }
 const dMap=new Map();
 for(const p of dispositionPaths){
  const df=c[p];
  if((df.source_original_sha256||df.publisher_original_sha256)!==source.original_source_sha256)
   fail("Mixed original publisher disposition epoch "+p);
  for(const row of df.items){
   if(dMap.has(row.source_entity_key))fail("Overlapping source-only dispositions");
   dMap.set(row.source_entity_key,{p,row});
  }
 }
 const oRows=m.observations.items,byKey=new Map(oRows.map(x=>[x.source_entity_key,x]));
 const sourceRows=new Map(source.items.map(x=>[x.source_entity_key,x]));
 if(oRows.length!==231||byKey.size!==231||sourceRows.size!==231||links.size!==231||dMap.size!==88)
  fail("Publisher source accounting cardinality or uniqueness invalid");
 const states={provisional_name_or_alias:0,source_only_disposition:0,unresolved_without_disposition:0};
 for(const [key,src] of sourceRows){
  const row=byKey.get(key),cw=links.get(key),dp=dMap.get(key);
  if(!row||!cw){fail("Missing publisher row or source crosswalk "+key);continue;}
  const part=cw.canonical_id?"provisional_name_or_alias":dp?"source_only_disposition":"unresolved_without_disposition";
  states[part]++;
  if(row.id!==src.id||row.source_entity_key!==key||row.publisher_name!==src.published_name||
   row.publisher_category!==src.published_category||row.source_element_tag!==src.source_element_tag||
   row.publisher_depth!==src.published_depth||row.publisher_parent_key!==src.published_parent_key||
   row.source_original_xpath!==src.source_xml_xpath||
   row.source_original_sha256!==src.source_original_sha256||
   row.original_crosswalk_record_id!==cw.id||
   row.accounting_partition!==part||
   row.provisional_canonical_candidate_id!==(cw.canonical_id||null)||
   row.prior_source_only_disposition_model!==(dp?.p||null)||
   row.prior_source_only_disposition_id!==(dp?.row.id||null)||
   row.prior_source_only_disposition_type!==(dp?.row.disposition||null))
   fail("Publisher observation or candidate identity altered "+key);
  if(row.publisher_parent_key&&!sourceRows.has(row.publisher_parent_key))
   fail("Dangling source-only parent "+key);
  if(row.publisher_parentage_only!==true||row.candidate_identity_independently_certified!==false||
   row.legal_supervision_or_delegation_asserted!==false||
   row.current_2026_institutional_operation_verified!==false||row.atlas_admitted!==false)
   fail("Publisher source-only observation promoted to legal/government fact "+key);
  const ancestors=new Set([key]);let parent=row.publisher_parent_key,depth=0;
  while(parent&&depth++<231){
   if(ancestors.has(parent)){fail("Publisher-parent cycle "+key);break;}
   ancestors.add(parent);parent=sourceRows.get(parent)?.published_parent_key;
  }
 }
 if(states.provisional_name_or_alias!==50||states.source_only_disposition!==88||
    states.unresolved_without_disposition!==93)fail("2025 publisher crosswalk partition not 50/88/93");
 if(m.observations.original_source_sha256!==source.original_source_sha256||
    m.observations.original_source_repository_path!==source.source_original_repository_path||
    m.observations.original_git_blob_sha1!==report.publisher_original_git_blob_sha1||
    m.observations.source_original_independent_worm_custody!==false||
    m.observations.legal_currentness_verified!==false||
    m.observations.atlas_admitted!==false)
  fail("Missing archival source contract or unauthorized current/Atlas promotion");
 const cabinet=c["model/federal/executive-departments.json"].items,old15b=c[orig.inc15b],
   priorDept=new Map(old15b.items.map(x=>[x.canonical_department_id,x])),byDept=new Map(m.departments.items.map(x=>[x.canonical_department_id,x]));
 if(cabinet.length!==15||m.departments.items.length!==15||byDept.size!==15)
  fail("Exactly fifteen canonical Cabinet parents required");
 let directTotal=0,deeperTotal=0,sourceEmpty=0,with15b=0;
 for(const dept of cabinet){
  const r=byDept.get(dept.id),cw=canonicalLinks.get(dept.id),prior=priorDept.get(dept.id);
  if(!r||!prior||!cw){fail("Missing Cabinet original source pointer "+dept.id);continue;}
  const srcRoot=sourceRows.get(cw.source_entity_key);
  if(srcRoot?.published_category!=="Executive Branch: Departments")
   fail("Cabinet root not within original department publisher section "+dept.id);
  const children=source.items.filter(x=>x.published_parent_key===cw.source_entity_key);
  const descendants=source.items.filter(x=>{
   let p=x.published_parent_key,step=0;
   while(p&&step++<16){if(p===cw.source_entity_key)return true;p=sourceRows.get(p)?.published_parent_key;}
   return false;
  });
  directTotal+=children.length;deeperTotal+=descendants.length-children.length;
  if(!children.length)sourceEmpty++;
  if(prior.publisher_source_id)with15b++;
  if(r.govman_publisher_parent_key!==cw.source_entity_key||
   r.govman_publisher_root_name!==srcRoot.published_name||
   !same(r.govman_direct_child_keys,children.map(x=>x.source_entity_key))||
   r.govman_direct_source_count!==children.length||
   r.govman_deeper_source_count!==descendants.length-children.length||
   r.prior_inc15b_source_record_id!==prior.id||
   r.prior_inc15b_publisher_source_id!==prior.publisher_source_id||
   r.prior_inc15b_source_model_path!==prior.source_model_path||
   r.prior_inc15b_source_epoch!==prior.source_edition||
   r.prior_inc15b_source_record_count!==prior.source_scoped_record_count)
   fail("Cabinet breadth disobeys source-epoch hierarchy or prior evidence "+dept.id);
  for(const p of r.supplemental_research_model_paths||[]){
   if(!main.models.includes(p))fail("Unregistered supplemental source-only research "+p);
  }
  if(r.coverage_gap!==(children.length?"published_first_level_candidates_unqualified":"no_first_level_entries_in_govman_edition_not_proof_of_absence")||
   r.govman_hierarchy_is_publisher_listing_only!==true||
   r.complete_current_first_level_roster_qualified!==false||
   r.independently_qualified_adl1_count!==0||
   r.current_legal_first_level_denominator!==null||
   r.source_first_level_records_are_not_verified_offices!==true||
   r.source_nesting_is_not_supervision_or_military_command!==true||r.atlas_admitted!==false)
   fail("False ADL1, command or roster completion "+dept.id);
 }
 if(directTotal!==63||deeperTotal!==39||sourceEmpty!==5||with15b!==5)
  fail("Published departmental hierarchy or earlier source-cohort arithmetic changed");
 if(m.departments.whole_current_legal_first_level_denominator!==null||
   m.departments.current_organization_chain_verified!==false||
   m.departments.atlas_admitted!==false)
  fail("Department legal and operational qualification fabricated");
 const stateSources=c[orig.states].items,pilots=c[orig.stateInstitutions].items,district=c[orig.dc].items;
 const jurRows=m.jurisdictions.items,byJur=new Map(jurRows.map(x=>[x.canonical_jurisdiction_id||x.id,x]));
 if(stateSources.length!==50||district.length!==1||pilots.length!==19||jurRows.length!==55)
  fail("State jurisdiction, pilot or nonstate boundary size changed");
 let pilotJur=0,pilotCount=0;
 for(const state of stateSources){
  const r=byJur.get(state.id),ids=pilots.filter(x=>x.jurisdiction_id===state.id).map(x=>x.id);
  if(ids.length){pilotJur++;pilotCount+=ids.length;}
  if(!r||r.record_class!=="existing_member_state"||r.jurisdiction_kind!=="member_state"||
    r.canonical_jurisdiction_id!==state.id||r.state_constitution_id!==state.state_constitution_id||
    !same(r.original_source_ids,state.source_ids)||!same(r.pilot_canonical_institution_ids,ids)||
    r.verified_state_jurisdiction_record!==true)
   fail("Changed constitutional member-State identity "+state.id);
 }
 const dcSource=district[0],dcRow=byJur.get(dcSource.id);
 if(!dcRow||dcRow.record_class!=="existing_federal_district_comparator"||
  dcRow.jurisdiction_kind!=="federal_district"||
  dcRow.verified_state_jurisdiction_record!==false||
  !same(dcRow.original_source_ids,dcSource.source_ids)||
  dcRow.state_constitution_id!==null)fail("District improperly promoted as fifty-first State");
 const classes=new Set(["tribal_nation","territory","local_government","intergovernmental_body"]);
 for(const classKind of classes){
  const r=jurRows.find(x=>x.jurisdiction_kind===classKind);
  if(!r||r.record_class!=="jurisdiction_class_research_gap"||
    r.canonical_jurisdiction_id!==null||r.original_source_ids.length||
    r.pilot_canonical_institution_ids.length||r.verified_state_jurisdiction_record!==false)
   fail("Unverified jurisdiction class promoted to institution "+classKind);
 }
 for(const r of jurRows){
  if(r.federal_department_parent_id!==null||r.no_federal_executive_chain_of_command!==true||
   r.jurisdiction_legal_scope_independent_of_federal_catalog!==true||
   r.independently_qualified_complete_state_institution_denominator!==null||
   r.institutional_population_complete!==false||r.atlas_admitted!==false)
   fail("State/tribal/territorial/district/local jurisdiction reduced to federal subordinate "+r.id);
 }
 if(pilotJur!==2||pilotCount!==19||
   m.jurisdictions.no_tribal_territorial_or_local_census_created!==true||
   m.jurisdictions.verified_whole_government_jurisdiction_denominator!==null||
   m.jurisdictions.atlas_admitted!==false)fail("Jurisdiction incomplete-coverage boundary lost");
 const coreRels=new Map(c[orig.fedRelationships].items.map(x=>[x.id,x])),
  stateRels=new Map(c[orig.stateLinks].items.map(x=>[x.id,x]));
 const expectedExamples=new Map([
  ["REL-FED-0090","legislative_oversight_not_executive_command"],
  ["REL-FED-0096","judicial_review_not_supervisory_management"],
  ["STATE-FED-LINK-0001","reserved_state_power_not_federal_department_delegation"],
  ["STATE-FED-LINK-0005","reserved_state_power_not_federal_department_delegation"]
 ]);
 if(m.boundaries.items.length!==4||!m.boundaries.all_relationships_remain_unadmitted||
  m.boundaries.relationships_derived_as_verified_new_law!==false)
  fail("Missing noncommand cross-branch/intergovernmental boundaries");
 for(const e of m.boundaries.items){
  const src=e.original_relationship_id.startsWith("STATE-")?stateRels.get(e.original_relationship_id):coreRels.get(e.original_relationship_id);
  const state=Boolean(e.original_relationship_id.startsWith("STATE-"));
  if(!src||e.id!=="WG17B-BOUND-"+e.original_relationship_id||
   e.original_relationship_model!==(state?orig.stateLinks:orig.fedRelationships)||
   e.source_from_id!==(state?src.subject_id:src.from_id)||
   e.source_to_id!==(state?src.federal_provision_id:src.to_id)||
   e.source_relationship_type!==(state?src.relationship_kind:src.relationship_type)||
   !same(e.original_source_ids,src.source_ids)||
   e.original_review_state!==(state?src.review_status:src.status)||
   e.semantic_boundary!==expectedExamples.get(e.original_relationship_id)||
   e.independent_current_legal_review_complete!==false||
   e.legal_command_or_control_inferred!==false||e.atlas_admitted!==false)
   fail("Existing directed legal/constitutional evidence promoted or reinterpreted "+e.original_relationship_id);
 }
 const cov=m.coverage,origCats=report.items,cc=new Map(cov.items.map(x=>[x.original_publisher_category,x]));
 if(cov.items.length!==7||cc.size!==7||!same(new Set(cc.keys()),new Set(origCats.map(x=>x.original_publisher_category))))
  fail("Seven publisher source categories not preserved");
 for(const x of origCats){
  const q=cc.get(x.original_publisher_category),rows=source.items.filter(o=>o.published_category===x.original_publisher_category);
  if(!q||q.source_publisher_entry_count!==rows.length||
   q.provisional_identity_links!==rows.filter(o=>Boolean(links.get(o.source_entity_key)?.canonical_id)).length||
   q.source_only_dispositions!==rows.filter(o=>dMap.has(o.source_entity_key)).length||
   q.unresolved_source_entries!==rows.filter(o=>!dMap.has(o.source_entity_key)&&!links.get(o.source_entity_key)?.canonical_id).length||
   q.independently_certified_current_institution_denominator!==null)
   fail("Publisher source category counts overlap or imply certified legal denominator "+x.original_publisher_category);
 }
 if(cov.publisher_record_count!==231||cov.publisher_top_level_entry_count!==source.top_level_publisher_entries||
   cov.provisional_canonical_name_links!==50||cov.source_only_entries_with_disposition!==88||
   cov.unresolved_source_only_entries!==93||cov.existing_core_federal_catalog_anchors!==61||
   cov.existing_core_legislative!==9||cov.existing_core_executive_leadership!==10||
   cov.existing_core_cabinet!==15||cov.existing_core_independent!==18||cov.existing_core_judiciary!==9||
   cov.publisher_cabinet_parent_entries!==15||cov.publisher_cabinet_total_nested_entries!==102||
   cov.publisher_cabinet_direct_child_source_observations!==63||
   cov.existing_fifty_state_jurisdictions!==50||cov.state_constitutional_pilots!==2||
   cov.current_government_population_denominator!==null||
   cov.current_federal_adl1_first_level_denominator!==null||
   cov.present_day_whole_of_government_ADL1_completion_rate!==null||
   cov.present_day_institutional_identity_certifications_added!==0||
   cov.newly_qualified_current_supervision_delegation_or_command_edges!==0||
   cov.current_public_service_outcome_claims_added!==0||
   cov.atlas_admitted!==false)fail("Source-only coverage denominator or legal nonpromotion changed");
 return {errors,summary:{
  version:"INC-17B",sourceEdition:"GOVMAN-2025-12-31",sourceOriginalSha256:rawHash,
  canonicalAnchors:aRows.length,cabinetRoots:m.departments.items.length,
  publisherEntries:oRows.length,publisherProvisional:states.provisional_name_or_alias,
  sourceOnlyDispositions:states.source_only_disposition,unresolved:states.unresolved_without_disposition,
  publisherDirectCabinetCandidates:directTotal,publisherDeeperCabinetObservations:deeperTotal,
  cabinetRootsWithoutPublisherChildren:sourceEmpty,
  initialAdditionalCohorts:with15b,
  stateJurisdictions:stateSources.length,statePilots:pilotJur,statePilotInstitutions:pilotCount,
  unqualifiedCurrentLegalDenominator:null,atlasAdmitted:false
 }};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const result=validateCensus(loadCensus());
 console.log(JSON.stringify({status:result.errors.length?"invalid":"source_index_qualified_not_legal_admission",...result},null,2));
 if(result.errors.length)process.exitCode=1;
}
