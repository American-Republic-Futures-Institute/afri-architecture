// INC-12: bounded federal institutional census and source-identity reconciliation.
// No complete-government, ADL-1, delegated authority or present-day organizational claims.
export const FAMILIES=Object.freeze(["scopes","identities","observations","locators","events","gaps","views"]);
export const GROUPS=Object.freeze(["legislative","eop","cabinet","independent","judiciary"]);
const keyFamily=id=>id.startsWith("ORG-FED-LEG")?"legislative":id.startsWith("ORG-FED-JUD")?"judiciary":
 id.startsWith("ORG-FED-EXE-DEP")?"cabinet":id.startsWith("ORG-FED-EXE-IND")?"independent":"eop";
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=xs=>Array.isArray(xs)&&new Set(xs).size===xs.length;
const validDay=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const jsType=x=>x===null?"null":Array.isArray(x)?"array":typeof x;
function validateRule(value,rule,path,defs,errors){
 if(rule.$ref){const def=defs[rule.$ref.split("/").at(-1)];
  if(!def)errors.push(path+" unresolved schema definition");else validateRule(value,def,path,defs,errors);
  return;
 }
 if(Object.hasOwn(rule,"const")&&!Object.is(value,rule.const))errors.push(path+" schema const mismatch");
 if(rule.enum&&!rule.enum.some(x=>equal(x,value)))errors.push(path+" invalid schema enum");
 if(rule.type&&!([].concat(rule.type).includes(jsType(value))))errors.push(path+" incorrect schema type");
 if(rule.pattern&&typeof value==="string"&&!new RegExp(rule.pattern).test(value))errors.push(path+" invalid schema pattern");
 if(rule.minLength!==undefined&&typeof value==="string"&&value.length<rule.minLength)errors.push(path+" empty string");
 if(rule.type==="object"&&jsType(value)==="object"){
  for(const required of rule.required||[])if(!Object.hasOwn(value,required))errors.push(path+" missing "+required);
  for(const [k,v]of Object.entries(value)){
   if(!Object.hasOwn(rule.properties||{},k)){if(rule.additionalProperties===false)errors.push(path+" extra key "+k);}
   else validateRule(v,rule.properties[k],path+"."+k,defs,errors);
  }
 }
 if(rule.type==="array"&&Array.isArray(value)){
  if(value.length<(rule.minItems||0))errors.push(path+" empty required array");
  if(rule.uniqueItems&&new Set(value.map(x=>JSON.stringify(x))).size!==value.length)
   errors.push(path+" duplicate array entry");
  for(const [i,v]of value.entries())if(rule.items)validateRule(v,rule.items,path+"["+i+"]",defs,errors);
 }
}
export function inspectSchema(schema,data){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
    schema.oneOf?.length!==FAMILIES.length||Object.keys(schema.$defs||{}).length!==FAMILIES.length)
  errors.push("invalid INC12 closed schema family registry");
 for(const f of FAMILIES){
  const rule=schema.oneOf?.find(x=>x.properties?.model_family?.const==="inc12-"+f);
  const def=schema.$defs?.[f];
  if(!rule||rule.additionalProperties!==false||rule.properties?.items?.items?.$ref!=="#/$defs/"+f||
   !def||def.additionalProperties!==false||
   !Object.keys(def.properties||{}).every(k=>def.required?.includes(k))){
   errors.push("INC12 schema definitions must be closed "+f);continue;
  }
  validateRule(data[f],rule,f,schema.$defs,errors);
 }
 return errors;
}
export function validateINC12({manifest,schema,data,canonical,originals,relations,snapshots}){
 const errors=[],bad=s=>errors.push("INC12 "+s),safety={};
 errors.push(...inspectSchema(schema,data));
 const ext=manifest?.federal_institutional_census_reconciliation_12_extension;
 if(ext?.id!=="ARFI-FED-INC12-GOVERNMENT-SCOPE"||ext?.canonical_selected!==61||
  ext?.source_observations!==150||ext?.govman_verified_granule_locators!==12||
  ext?.unresolved_identity_events!==4||ext?.federal_families!==5||
  ext?.source_data_completeness_only!==true||
  ext?.whole_federal_government_census_verified!==false||
  ext?.first_level_adl1_certification!==false||
  ext?.agency_identifier_verified_count!==0||ext?.independent_legal_review_qualified!==false)
  bad("unjustified census manifest completeness or institutional authority");
 for(const f of FAMILIES){
  if(data[f]?.model_version!=="0.1.0"||data[f]?.model_family!=="inc12-"+f||
   !Array.isArray(data[f]?.items)||manifest?.models?.filter(p=>p==="model/federal/x12-"+f+".json").length!==1)
   bad("unregistered or missing collection "+f);
 }
 const rows=f=>Array.isArray(data[f]?.items)?data[f].items:[];
 const ids=new Set();
 for(const f of FAMILIES)for(const x of rows(f)){
  if(ids.has(x.id))bad("duplicate model identity "+x.id);
  ids.add(x.id);
 }
 const cc=new Map(canonical.map(x=>[x.id,x])),ref=new Map(originals.references.map(x=>[x.id,x]));
 const obsOriginal=new Map(),relOriginal=new Map(),sourceSnapshot=new Map(snapshots.map(x=>[x.id,x]));
 for(const [label,collection]of Object.entries(originals.observations)){
  for(const x of collection){
   if(obsOriginal.has(x.id))bad("source observation duplicated across collections "+x.id);
   obsOriginal.set(x.id,{...x,__collection:label});
  }
 }
 for(const collection of Object.values(relations))for(const x of collection){
  if(relOriginal.has(x.id))bad("duplicate source relation "+x.id);
  relOriginal.set(x.id,x);
 }
 const ident=new Map(rows("identities").map(x=>[x.canonical_id,x]));
 const locator=new Map(rows("locators").map(x=>[x.canonical_id,x]));
 const byScope=new Map(rows("scopes").map(x=>[x.family,x]));
 if(cc.size!==61||ref.size!==61||ident.size!==61||rows("identities").length!==61)
  bad("canonical selected federal denominator must be exactly 61, one nonduplicating ID each");
 for(const x of rows("identities")){
  const c=cc.get(x.canonical_id),r=ref.get(x.source_pointer_id),l=locator.get(x.canonical_id);
  if(!c||!r||r.institution_id!==x.canonical_id||
   x.id!=="X12-IDENTITY-"+x.canonical_id||
   x.canonical_model_path!==r.canonical_model_path||
   x.canonical_kind!==r.canonical_kind||
   x.branch_id!==c.branch_id||x.family!==keyFamily(x.canonical_id)||
   !equal(x.source_ids,r.source_ids)||x.canonical_source_snapshot_id!==r.evidence_snapshot||
   x.verified_publisher_locator_id!==(l?.id||null)||
   x.entity_identifier!==null||x.entity_identifier_verified!==false||
   x.adl_evidenced!==0||x.adl1_certified!==false||
   x.present_day_structure_complete!==false||x.independent_legal_review_complete!==false||
   x.identity_disposition!=="existing_ARFI_canonical_reference_not_comprehensive_recensus")
   bad("source-bounded canonical identity mismatch or unsupported identifier "+x.id);
 }
 const sourceDefinitions=originals.observations;
 const allSourceCount=Object.values(sourceDefinitions).reduce((n,items)=>n+items.length,0);
 if(allSourceCount!==150||rows("observations").length!==150||
  new Set(rows("observations").map(x=>x.source_record_id)).size!==150)
  bad("source slice count, duplicate pointers or suppressed first-level research nodes");
 for(const x of rows("observations")){
  const o=obsOriginal.get(x.source_record_id),r=relOriginal.get(x.relation_source_id);
  const mappedCollection=o?.__collection;
  const parent=mappedCollection==="department_chart"?o?.parent_ref:(o?.parent_institution_id||o?.parent_department_id||o?.parent_id);
  const actualSources=o?.source_ids||(o?.source_id?[o.source_id]:[]);
  const actualSnapshot=o?.snapshot_id||o?.source_snapshot_id||null;
  const actualBranch=o?.branch_id||r?.branch_id||"BR-FED-EXE";
  const actualFamily=mappedCollection==="crossbranch_seed"?
   actualBranch==="BR-FED-LEG"?"legislative":actualBranch==="BR-FED-JUD"?"judiciary":
   String(o?.parent_id).startsWith("ORG-FED-EXE-IND")?"independent":"eop":"cabinet";
  const actualType=mappedCollection==="census"?o?.organizational_relation:
   mappedCollection==="department_chart"?r?.relationship_type:o?.relationship_type;
  if(!o||!r||mappedCollection!==x.source_collection||
   x.id!=="X12-OBS-"+x.source_record_id||
   r.from_id!==x.source_record_id||r.to_id!==x.observed_parent_id||
   parent!==x.declared_parent_id||parent!==x.observed_parent_id||
   x.display_name!==o.name||x.family!==actualFamily||x.branch_id!==actualBranch||
   x.relation_type!==actualType||!equal(x.source_ids,actualSources)||
   x.source_snapshot_id!==actualSnapshot||
   (actualSnapshot!==null&&!sourceSnapshot.has(actualSnapshot))||
   x.unit_status!=="bounded_source_listing_not_verified_full_current_organization"||
   x.official_entity_id!==null||x.canonical_identity_id!==null||
   x.source_record_adl!==0||x.adl1_eligible!==false||
   x.confirmed_command!==false||x.confirmed_supervision!==false||
   x.confirmed_delegation!==false||x.independent_current_status_review!==false)
   bad("source evidence, branch, structural edge or delegation falsified "+x.id);
  if(x.branch_id==="BR-FED-LEG"&&!x.declared_parent_id?.startsWith("ORG-FED-LEG"))
   bad("cross-branch legislative parent "+x.id);
  if(x.branch_id==="BR-FED-JUD"&&!x.declared_parent_id?.startsWith("ORG-FED-JUD"))
   bad("cross-branch judiciary parent "+x.id);
 }
 if(rows("locators").length!==12||locator.size!==12||
   originals.granules.length!==12)bad("verified publisher granule source slice mismatch");
 const sourceGranules=new Map(originals.granules.map(x=>[x.granule_id,x]));
 for(const x of rows("locators")){
  const g=sourceGranules.get(x.external_locator);
  if(!g||x.id!=="X12-LOCATOR-"+g.granule_id||
   x.canonical_id!==g.canonical_department_id||x.source_record_id!==g.id||
   x.source_id!==g.source_id||x.source_url!==g.source_url||
   x.edition_on!==g.edition_date||!validDay(x.edition_on)||
   x.identifier_type!=="government_publication_granule_not_agency_identifier"||
   x.original_bytes_sha256!==null||x.publisher_title_checked!==true||
   x.agency_identifier_verified!==false||x.organization_complete!==false||
   x.current_status_verified!==false||x.review_status!=="verified_publisher_locator_only"||
   !ident.has(x.canonical_id))bad("GovInfo publication ID falsely treated as agency identifier "+x.id);
 }
 const originalEvents=new Map(originals.events.map(x=>[x.id,x]));
 if(rows("events").length!==4||originalEvents.size!==4)bad("missing source-reported continuity and historical transfer events");
 for(const x of rows("events")){
  const o=originalEvents.get(x.source_record_id),isName=Boolean(o?.institution_id);
  if(!o||x.id!=="X12-EVENT-"+o.id||
   x.event_kind!==(isName?"reported_same_identity_name_change":"candidate_historical_function_transfer_not_legal_entity_equivalence")||
   x.from_id!==(isName?o.institution_id:o.from_id)||
   x.to_id!==(isName?o.institution_id:o.to_id)||
   x.event_on!==(isName?o.effective_on:o.publisher_effective_date)||
   x.old_name!==(isName?o.old_name:null)||x.new_name!==(isName?o.new_name:null)||
   !equal(x.source_ids,o.source_ids)||!validDay(x.event_on)||
   x.confirmed_full_legal_succession!==false||x.signed_original_verified!==false||
   x.no_new_canonical_identity!==true||
   x.review_status!==(isName?"source_reports_redesignation_not_verified_current_legal_effect":"source_reported_transfer_pending_qualified_legal_review"))
   bad("historic predecessor or alias falsely certified "+x.id);
 }
 if(rows("scopes").length!==5||rows("gaps").length!==5||rows("views").length!==5)
  bad("all five distinct federal institution families need coverage/gap/view");
 for(const f of GROUPS){
  const s=byScope.get(f),g=rows("gaps").find(x=>x.scope_id===s?.id);
  const v=rows("views").find(x=>x.scope_id===s?.id);
  const cCount=rows("identities").filter(x=>x.family===f).length;
  const oCount=rows("observations").filter(x=>x.family===f).length;
  const lCount=rows("locators").filter(x=>keyFamily(x.canonical_id)===f).length;
  if(!s||s.id!=="X12-SCOPE-"+f.toUpperCase()||
   s.canonical_selected_count!==cCount||s.source_observation_count!==oCount||
   s.verified_govinfo_granule_count!==lCount||
   s.denominator_basis!=="selected_ARFI_61_canonical_ids_and_source_slice_records_only"||
   s.official_federal_population_denominator!==null||
   s.complete_current_first_level_denominator!==null||
   s.current_organization_complete!==false||s.adl1_certified_count!==0||
   s.independent_legal_review_complete!==false||
   s.canonical_reference_scope_complete!==true||
   s.publication_status!=="bounded_research_not_complete_government_census")
   bad("unsupported current coverage claim "+f);
  if(!g||g.id!=="X12-GAP-"+f.toUpperCase()||
   g.source_observation_count!==oCount||g.unknown_denominator!==true||
   g.unverified_universe!==true||g.qualified_institutional_review!==false||
   g.complete_adl1!==false||g.review_status!=="unresolved"||
   !g.missing_requirement?.trim())bad("missing official denominator research gap "+f);
  if(!v||v.id!=="VIEW-X12-"+f.toUpperCase()||!equal(v.included_families,[f])||
   !v.root_ids?.length||!unique(v.root_ids)||
   !v.root_ids.every(id=>cc.has(id)||["BR-FED-EXE","BR-FED-JUD"].includes(id))||
   v.source_commit_policy!=="immutable_commit_sha_required"||
   v.consumer_kind!=="read_only_root_first_graph_coverage"||
   v.render_disclaimer_required!==true||
   v.legal_authority_certified!==false||v.complete_federal_census!==false||
   v.static_view_is_not_decision_or_delegation!==true)
   bad("publication view hides source bounds or unknown root "+f);
 }
 return {errors,checked_families:FAMILIES.length,canonical_selected:rows("identities").length,
  observed_source_records:rows("observations").length,verified_source_granules:rows("locators").length,
  unqualified_history_events:rows("events").length,coverage_groups:rows("scopes").map(x=>({
   family:x.family,canonical_selected_count:x.canonical_selected_count,source_observation_count:x.source_observation_count,
   govinfo_publication_locators:x.verified_govinfo_granule_count,complete_current_denominator:null,adl1_count:0}))};
}
export function projectINC12(data,viewId,rootId=null,limit=200){
 const v=data.views.items.find(x=>x.id===viewId);
 if(!v)throw Error("Unknown INC12 coverage viewpoint");
 if(!Number.isInteger(limit)||limit<1||limit>200)throw Error("Source-bounded node limit must be 1..200");
 if(rootId!==null&&!v.root_ids.includes(rootId))throw Error("Selected root is not authorized by bounded coverage viewpoint");
 const fam=v.included_families[0],identities=data.identities.items.filter(x=>x.family===fam),
  observations=data.observations.items.filter(x=>x.family===fam),
  scopedRoot=rootId||v.root_ids[0],
  subset=rootId?observations.filter(x=>x.observed_parent_id===rootId||x.declared_parent_id===rootId):observations;
 const page=subset.slice(0,limit);
 return {view_id:v.id,root_id:scopedRoot,scope_id:v.scope_id,model_status:"bounded_unratified_research",
  source_commit_policy:v.source_commit_policy,render_disclaimer_required:true,
  canonical_selected:identities.length,source_observations_in_family:observations.length,
  returned_observations:page.length,has_more_source_observations:subset.length>page.length,
  current_federal_universe_denominator:null,adl1_certified:false,legal_authority_certified:false,
  identities:rootId?identities.filter(x=>x.canonical_id===rootId):identities.slice(0,limit),
  observations:page,unresolved_gap:data.gaps.items.find(x=>x.scope_id===v.scope_id)};
}
