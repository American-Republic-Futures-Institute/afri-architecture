// INC-13: EOP / independent-agency bounded source research, not ADL1.
export const FAMILIES=Object.freeze(["sources","units","relationships","coverage","events","gaps","views"]);
export const ROOTS=Object.freeze({eop:"ORG-FED-EXE-EOP-OMB",independent:"ORG-FED-EXE-IND-FTC"});
const EOP="ORG-FED-EXE-EOP",MODEL="0.1.0";
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
const date=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const t=x=>x===null?"null":Array.isArray(x)?"array":typeof x;
const hash=x=>/^https:\/\/(uscode\.house\.gov|www\.whitehouse\.gov|www\.ftc\.gov)\//.test(x);
function rule(v,r,where,defs,errors){
 if(r.$ref){const d=defs[r.$ref.split("/").at(-1)];if(!d)errors.push(where+" bad reference");
  else rule(v,d,where,defs,errors);return;}
 if(Object.hasOwn(r,"const")&&!eq(v,r.const))errors.push(where+" schema const mismatch");
 if(r.enum&&!r.enum.some(e=>eq(e,v)))errors.push(where+" schema enum mismatch");
 if(r.type&&!([].concat(r.type).includes(t(v))))errors.push(where+" schema type mismatch");
 if(r.pattern&&typeof v==="string"&&!new RegExp(r.pattern).test(v))errors.push(where+" schema pattern mismatch");
 if(r.minLength!==undefined&&typeof v==="string"&&v.length<r.minLength)errors.push(where+" empty schema field");
 if(r.type==="object"&&t(v)==="object"){
  for(const key of r.required||[])if(!Object.hasOwn(v,key))errors.push(where+" required field missing "+key);
  for(const [k,val]of Object.entries(v)){
   if(!Object.hasOwn(r.properties||{},k)){if(r.additionalProperties===false)errors.push(where+" unexpected schema field "+k);}
   else rule(val,r.properties[k],where+"."+k,defs,errors);
  }
 }
 if(r.type==="array"&&Array.isArray(v)){
  if(v.length<(r.minItems||0))errors.push(where+" array missing required entries");
  if(r.uniqueItems&&!unique(v.map(x=>JSON.stringify(x))))errors.push(where+" duplicate array entries");
  for(let i=0;i<v.length;i++)if(r.items)rule(v[i],r.items,where+"["+i+"]",defs,errors);
 }
}
export function inspectINC13Schema(schema,data){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  Object.keys(schema.$defs||{}).length!==FAMILIES.length||schema.oneOf?.length!==FAMILIES.length)
  errors.push("INC13 invalid closed schema registry");
 for(const f of FAMILIES){
  const d=schema?.$defs?.[f],wrapper=schema?.oneOf?.find(x=>x.properties?.model_family?.const==="inc13-"+f);
  if(!d||!wrapper||d.additionalProperties!==false||wrapper.additionalProperties!==false||
    d.required?.length!==Object.keys(d.properties||{}).length||
    wrapper.properties?.items?.items?.$ref!=="#/$defs/"+f){
    errors.push("INC13 unqualified closed schema "+f);continue;
  }
  rule(data?.[f],wrapper,f,schema.$defs,errors);
 }
 return errors;
}
const expect=(ok,bad,msg)=>{if(!ok)bad("INC13 "+msg)};
export function validateINC13({manifest,schema,data,canonical,x12scopes}){
 const errors=[],bad=msg=>errors.push(msg),assert=(pass,msg)=>expect(pass,bad,msg);
 errors.push(...inspectINC13Schema(schema,data));
 const ext=manifest?.federal_eop_independent_structure_13_extension;
 assert(manifest?.model_version===MODEL&&manifest?.release_status==="research_baseline_unratified",
  "baseline must remain unratified");
 assert(ext?.id==="ARFI-FED-INC13-EOP-INDEPENDENT"&&
  ext?.model_version===MODEL&&ext?.research_as_of==="2026-10-19"&&
  ext?.release_status==="bounded_unratified_research"&&
  eq(ext?.pilot_roots,[ROOTS.eop,ROOTS.independent])&&
  ext?.legacy_eop_selected_references===10&&ext?.legacy_independent_selected_references===18&&
  ext?.new_source_observations===13&&ext?.source_groups===10&&
  ext?.pilot_families===2&&ext?.approved_whole_family_denominators===false&&
  ext?.complete_first_level_rosters_verified===false&&
  ext?.independently_corroborated_legal_authority===false&&
  ext?.signed_individual_delegation_verified===false&&ext?.adl1_certified_count===0,
  "manifest claims a complete roster or certified authority");
 for(const f of FAMILIES)assert(manifest?.models?.includes("model/federal/x13-"+f+".json")&&
  data?.[f]?.model_version===MODEL&&data?.[f]?.model_family==="inc13-"+f&&
  Array.isArray(data?.[f]?.items),"missing registered model "+f);
 if(FAMILIES.some(f=>!Array.isArray(data?.[f]?.items)))return {errors};
 const [sources,units,relations,coverage,events,gaps,views]=FAMILIES.map(f=>data[f].items);
 const all=[...sources,...units,...relations,...coverage,...events,...gaps,...views];
 assert(unique(all.map(r=>r.id)),"duplicate record identity across seven families");
 assert(sources.length===10&&units.length===13&&relations.length===14&&
  coverage.length===2&&events.length===2&&gaps.length===5&&views.length===2,
  "bounded research source-slice count drift");
 const canon=new Map(canonical.map(c=>[c.id,c]));
 assert(canonical.length===28&&canon.size===28,
  "incorrect referenced X12 eop plus independent research universe");
 const expected=[["eop",10],["independent",18]];
 for(const [f,n]of expected){
  assert(canonical.filter(c=>f==="eop"?c.id.startsWith("ORG-FED-EXE-")&&!c.id.startsWith("ORG-FED-EXE-IND"):c.id.startsWith("ORG-FED-EXE-IND")).length===n,
   "X12 reference count diverges from pilot scope "+f);
  const old=x12scopes.find(c=>c.family===f);
  assert(old?.canonical_selected_count===n&&old?.source_observation_count===0&&
   old?.complete_current_first_level_denominator===null&&old?.adl1_certified_count===0,
   "X12 source-slice baseline changed unexpectedly "+f);
 }
 const src=new Map(sources.map(s=>[s.id,s])),nodes=new Map(units.map(u=>[u.id,u]));
 const roots=new Set(Object.values(ROOTS));
 for(const s of sources){
  assert(/^X13-SRC-[A-Z0-9-]+$/.test(s.id)&&typeof s.url==="string"&&hash(s.url)&&
    date(s.retrieved_on)&&s.retrieved_on==="2026-10-19"&&
    (s.edition_on===null||date(s.edition_on)&&s.edition_on<="2026-10-19")&&
    s.original_bytes_sha256===null&&!s.independent_original_custody_verified&&
    s.source_status==="publisher_page_located_not_custody_certified",
   "source URL, edition or original byte qualification invalid "+s.id);
  if(s.source_kind==="codified_statute")
   assert(s.url.startsWith("https://uscode.house.gov/")&&s.edition_on==="2026-10-07",
    "codified source edition mismatch "+s.id);
 }
 for(const u of units){
  assert(/^X13-UNIT-[A-Z0-9-]+$/.test(u.id)&&
   roots.has(u.pilot_root_id)&&u.observed_parent_id===u.pilot_root_id&&
   u.pilot_root_id===ROOTS[u.family]&&u.source_sliced_first_level_observation===true&&
   u.canonical_match_id===null&&u.external_agency_identifier===null&&
   u.as_observed_on==="2026-10-19"&&
   u.source_ids.length>0&&unique(u.source_ids)&&u.source_ids.every(id=>src.has(id))&&
   !u.verified_current_first_level_roster&&!u.current_legal_effect_independently_reviewed&&
   !u.confirmed_supervision&&!u.confirmed_delegation&&!u.confirmed_operational_command&&
   !u.historical_identity_equivalence_verified&&u.adl_evidenced===0&&u.adl1_certified===false&&
   u.status==="source_bounded_research_not_qualified",
   "unit improperly treated as certified agency, reporting line, current roster or authority "+u.id);
  if(u.observation_class==="statutorily_named_office"||u.observation_class==="statutory_collective_body")
   assert(u.source_ids.some(id=>src.get(id)?.source_kind?.startsWith("codified_statute")),
    "statutory office with no publisher legal locator "+u.id);
 }
 const relKinds=new Set(["statutory_organizational_location","statutory_office_location",
  "statutory_commission_composition","publisher_listed_organizational_component"]);
 for(const r of relations){
  assert(relKinds.has(r.relationship_type)&&
   (nodes.has(r.from_id)||r.from_id===ROOTS.eop)&&
   (roots.has(r.to_id)||r.to_id===EOP)&&
   (r.from_id===ROOTS.eop ? r.to_id===EOP&&r.relationship_type==="statutory_organizational_location":
    nodes.get(r.from_id)?.observed_parent_id===r.to_id)&&
   r.source_ids.length>0&&r.source_ids.every(id=>src.has(id))&&
   r.relationship_orientation==="unit_or_organization_to_parent"&&
   r.as_observed_on==="2026-10-19"&&
   !r.signed_delegation_verified&&!r.current_direct_supervision_verified&&
   !r.operational_command_verified&&!r.original_enactment_custody_verified&&
   !r.independent_legal_review_complete&&
   r.status==="source_limited_not_executive_authorization",
   "relationship falsely asserts oversight, direct supervision, delegation or command "+r.id);
  const u=nodes.get(r.from_id);
  if(r.relationship_type==="publisher_listed_organizational_component"){
   assert(u?.observation_class!=="statutorily_named_office"&&
     u?.observation_class!=="statutory_collective_body"&&
     r.source_ids.every(id=>src.get(id)?.source_kind==="agency_descriptive_directory"),
    "agency descriptive source presented as statute "+r.id);
  }else assert(r.source_ids.every(id=>src.get(id)?.source_kind.startsWith("codified_statute"))&&
    (r.relationship_type!=="statutory_organizational_location"||r.from_id===ROOTS.eop)&&
    (r.relationship_type!=="statutory_commission_composition"||
      u?.observation_class==="statutory_collective_body"),
    "publisher directory represented as legally authoritative "+r.id);
 }
 assert(relations.filter(r=>r.from_id===ROOTS.eop).length===1&&
  units.every(u=>relations.filter(r=>r.from_id===u.id).length===1),
  "missing or duplicate source claim for a modeled unit");
 for(const c of coverage){
  const count=units.filter(u=>u.family===c.family).length;
  const n=c.family==="eop"?10:18;
  assert(c.pilot_root_id===ROOTS[c.family]&&c.legacy_family_selected_identity_count===n&&
   c.source_sliced_new_unit_count===count&&c.source_inventory_denominator===count&&
   c.source_sliced_pilot_root_count===1&&
   c.complete_government_family_denominator===null&&c.complete_pilot_first_level_denominator===null&&
   !c.official_publication_roster_exhaustive&&c.certified_adl1_count===0&&
   !c.current_structure_complete&&!c.independent_legal_review_complete&&
   !c.independent_original_custody_complete&&c.observed_source_group_ids.every(id=>src.has(id)),
   "denominator, ADL1 or population certification fabricated "+c.id);
 }
 assert(unique(coverage.map(c=>c.family))&&coverage.length===2,"two family coverages required");
 for(const e of events)
  assert(e.subject_canonical_id===ROOTS.eop&&e.family==="eop"&&
   date(e.reported_on)&&e.reported_on<"2026-10-19"&&
   e.source_ids.every(id=>src.has(id))&&e.original_historical_instrument_sha256===null&&
   !e.signed_original_verified&&!e.confirmed_complete_legal_succession&&
   e.no_new_canonical_identity===true&&e.review_status==="historic_report_not_independently_qualified",
   "unreviewed historic successor or source original promoted "+e.id);
 for(const g of gaps)
  assert(g.pilot_root_id===ROOTS[g.family]&&g.source_ids.every(id=>src.has(id))&&
    !g.confirmed_resolved&&g.adt_qualification==="adl1_blocked"&&g.review_status==="open",
   "missing qualification turned into asserted authority "+g.id);
 for(const f of Object.keys(ROOTS))assert(gaps.filter(g=>g.family===f).length>=2,
  "insufficient explicit legal and coverage gaps "+f);
 for(const v of views)
  assert(v.root_id===ROOTS[v.family]&&
   v.source_commit_policy==="exact_git_commit_required"&&v.read_only&&
   !v.qualified_current_legal_authority&&!v.current_organization_complete&&!v.adl1_certified&&
   v.disclaimer.length>50&&v.included_relationship_types.every(t=>relKinds.has(t)),
   "view incorrectly promotes model assertions "+v.id);
 assert(views.length===2&&unique(views.map(x=>x.family)),"pilot viewpoints must be distinct");
 return {errors,checked_families:FAMILIES.length,sources:sources.length,
  observed_units:units.length,typed_relationships:relations.length,
  pilot_groups:coverage.map(c=>({family:c.family,selected_references:c.legacy_family_selected_identity_count,
    source_sliced_units:c.source_sliced_new_unit_count,official_complete_denominator:null,
    qualified_adl1:c.certified_adl1_count}))};
}
export function projectINC13({data},viewId){
 const v=data.views.items.find(x=>x.id===viewId);
 if(!v)throw Error("Unknown INC-13 bounded source viewpoint "+viewId);
 const id=v.root_id;
 const units=data.units.items.filter(u=>u.pilot_root_id===id);
 const include=new Set([id,...units.map(u=>u.id)]);
 if(v.family==="eop")include.add(EOP);
 const relations=data.relationships.items.filter(r=>include.has(r.from_id)&&include.has(r.to_id)&&
   v.included_relationship_types.includes(r.relationship_type));
 return {view:v,source_commit_policy:"exact_git_commit_required",root_id:id,
  units,relationships:relations,sources:data.sources.items.filter(s=>
   units.some(u=>u.source_ids.includes(s.id))||relations.some(r=>r.source_ids.includes(s.id))),
  coverage:data.coverage.items.find(c=>c.pilot_root_id===id),
  gaps:data.gaps.items.filter(g=>g.pilot_root_id===id),
  historical_events:data.events.items.filter(e=>e.subject_canonical_id===id),
  independent_legal_review_qualified:false,signed_delegations_confirmed:0,
  current_full_roster_denominator:null,adl1_certified:false};
}
