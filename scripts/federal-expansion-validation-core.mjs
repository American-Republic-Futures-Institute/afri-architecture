// ARFI constitutional-to-institutional expansion: source-bounded, read-only research.
export const EXPANSION_FAMILIES = Object.freeze([
 "sources","snapshots","roster","department-seeds","crossbranch-seeds",
 "relationships","coverage-ledger","gaps","viewpoints"
]);
export const EXPANSION_MODEL_PATHS = Object.freeze(EXPANSION_FAMILIES.map(
 x=>"model/federal/expansion/"+x+".json"));
export const EXPANSION_CONTEXT_PATHS = Object.freeze([
 "model/federal/branches.json","model/federal/sources.json",
 "model/federal/coverage/source-registry.json",
 "model/federal/coverage/institution-references.json",
 "model/federal/executive-departments.json",
 "model/federal/executive-leadership.json","model/federal/executive-independent.json",
 "model/federal/legislative.json","model/federal/judiciary.json"
]);
const COUNTS=Object.freeze({departments:12,eop:10,independent:18,legislative:9,judiciary:9});
const PILOTS=new Set(["ORG-FED-EXE-DEP-DEFENSE","ORG-FED-EXE-DEP-DHS","ORG-FED-EXE-DEP-EDUCATION"]);
const SOURCE_URLS=Object.freeze({
 "EXP-SRC-5-USC-101":"https://uscode.house.gov/us/usc/119-118/t5/s101/",
 "EXP-SRC-GOVMAN-2024-EOP":"https://www.govinfo.gov/app/details/GOVMAN-2024-12-31/GOVMAN-2024-12-31-098",
 "EXP-SRC-USCOURTS-STRUCTURE":"https://www.uscourts.gov/about-federal-courts/court-role-and-structure",
 "EXP-SRC-HOUSE-119":"https://www.govinfo.gov/app/details/HMAN-119",
 "EXP-SRC-SENATE-119":"https://www.senate.gov/committees/index.htm"
});
const SNAP_SOURCES=Object.freeze({
 "EXP-SNAP-GOVMAN-2025":"CENSUS-SRC-GOVMAN-2025",
 "EXP-SNAP-5-USC-101":"EXP-SRC-5-USC-101",
 "EXP-SNAP-GOVMAN-2024-EOP":"EXP-SRC-GOVMAN-2024-EOP",
 "EXP-SNAP-USCOURTS-STRUCTURE":"EXP-SRC-USCOURTS-STRUCTURE",
 "EXP-SNAP-HOUSE-119":"EXP-SRC-HOUSE-119",
 "EXP-SNAP-SENATE-119":"EXP-SRC-SENATE-119"
});
const REL_TYPES=Object.freeze({
 departments:"statutory_department_in_executive_branch_not_subordinate_power",
 eop:"presidential_office_catalog_parentage_not_delegation",
 independent:"nondepartment_executive_catalog_not_legal_independence",
 legislative:"legislative_catalog_or_support_affiliation_not_chamber_control",
 judiciary:"judicial_catalog_and_grouping_not_jurisdiction"
});
const KNOWN_VIEWS=Object.freeze({
 "VIEW-EXP-ALL":"all","VIEW-EXP-DEPARTMENTS":"departments",
 "VIEW-EXP-EOP":"eop","VIEW-EXP-INDEPENDENT":"independent",
 "VIEW-EXP-CONGRESS":"legislative","VIEW-EXP-JUDICIARY":"judiciary"
});
const fail=why=>{throw new Error("Federal expansion rejected: "+why);};
const check=(condition,why)=>{if(!condition)fail(why);};
const same=(x,y)=>JSON.stringify([...x].sort())===JSON.stringify([...y].sort());
const unique=x=>new Set(x).size===x.length;
const id=x=>typeof x==="string"&&/^[A-Z][A-Z0-9-]{2,170}$/.test(x);
const recordMap=x=>new Map(x.map(z=>[z.id,z]));
const familyForPath=p=>p.endsWith("/executive-departments.json")?"departments":
 p.endsWith("/executive-leadership.json")?"eop":
 p.endsWith("/executive-independent.json")?"independent":
 p.endsWith("/legislative.json")?"legislative":"judiciary";
function read(manifest,files,path){
 check(manifest.models.includes(path),"collection not registered in manifest: "+path);
 const o=files[path];
 check(o&&o.model_version==="0.1.0"&&Array.isArray(o.items),
  "missing or unversioned records: "+path);
 check(o.items.every(x=>x&&id(x.id))&&unique(o.items.map(x=>x.id)),
  "malformed or duplicate identifiers: "+path);
 return o.items;
}
function propertyValid(v,p){
 if(Object.prototype.hasOwnProperty.call(p,"const")&&v!==p.const)return false;
 if(p.enum&&!p.enum.includes(v))return false;
 if(p.type){
  const validTypes=Array.isArray(p.type)?p.type:[p.type];
  const actual=v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
  if(!validTypes.includes(actual))return false;
 }
 if(typeof v==="string"){
  if(p.minLength!==undefined&&v.length<p.minLength)return false;
  if(p.pattern&&!new RegExp(p.pattern).test(v))return false;
 }
 if(typeof v==="number"&&p.minimum!==undefined&&v<p.minimum)return false;
 if(Array.isArray(v)){
  if(p.uniqueItems&&!unique(v))return false;
  if(p.items&&!v.every(x=>propertyValid(x,p.items)))return false;
 }
 return true;
}
export function inspectExpansionSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
    schema?.additionalProperties!==false)errors.push("schema version or strict document boundary missing");
 for(const f of EXPANSION_FAMILIES){
  const p="model/federal/expansion/"+f+".json",c=files[p];
  const def=schema?.$defs?.[f];
  if(!def||def.type!=="object"||def.additionalProperties!==false||
      !Array.isArray(def.required)||!def.properties?.id?.pattern){
   errors.push("missing strict item schema: "+f);continue;
  }
  if(c?.model_version!=="0.1.0"||!Array.isArray(c.items)){
   errors.push("missing collection or invalid version: "+f);continue;
  }
  for(const [i,x] of c.items.entries()){
   if(Object.keys(x).some(k=>!Object.prototype.hasOwnProperty.call(def.properties,k)))
    errors.push("additional property forbidden: "+f+"["+i+"]");
   for(const field of def.required)if(!Object.prototype.hasOwnProperty.call(x,field))
    errors.push("missing required field: "+f+"["+i+"]."+field);
   for(const [field,value] of Object.entries(x)){
    const rule=def.properties[field];if(rule&&!propertyValid(value,rule))
     errors.push("schema property mismatch: "+f+"["+i+"]."+field);
   }
  }
 }
 return {model_families:EXPANSION_FAMILIES.length,errors};
}
export function validateFederalExpansion(manifest,files,schema){
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified","canonical research status changed");
 const ext=manifest.federal_coverage_expansion_extension;
 check(ext?.id==="ARFI-COA-FED-EXPANSION-003"&&ext.model_version==="0.1.0"&&
  ext.research_status==="source_bounded_unratified"&&ext.isolated_from_dod_pr19===true&&
  ext.known_unchanged_canonical_references===61&&
  ext.selected_expansion_reference_count===58&&ext.remaining_cabinet_departments===12&&
  ext.selected_component_seeds===24&&ext.crossbranch_composition_candidates===17&&
  ext.complete_institutional_adl1_count===0&&ext.full_federal_census_denominator_known===false&&
  ext.all_independents_legally_subtyped===false&&ext.website_integration==="not_implemented"&&
  ext.external_identifiers_inferred===false&&ext.legal_review_status==="pending",
  "scope, ADL status, authority or publication flags falsely advanced");
 check(manifest.federal_institutional_census_extension?.institutional_reference_count===61&&
  manifest.federal_institutional_census_extension?.pilot_component_candidate_count===29,
  "merged increment 01 census prerequisites unexpectedly modified");
 const schemaReport=inspectExpansionSchema(schema,files);
 check(schemaReport.errors.length===0,"strict schema invalid: "+schemaReport.errors.slice(0,3).join("; "));
 const data=Object.fromEntries(EXPANSION_FAMILIES.map(f=>[f,read(manifest,files,
  "model/federal/expansion/"+f+".json")]));
 const branches=read(manifest,files,"model/federal/branches.json");
 check(same(branches.map(x=>x.id),["BR-FED-EXE","BR-FED-LEG","BR-FED-JUD"]),
  "constitutional branches incomplete");
 const basePaths=EXPANSION_CONTEXT_PATHS.filter(p=>p.endsWith("/executive-departments.json")||
  p.endsWith("/executive-leadership.json")||p.endsWith("/executive-independent.json")||
  p.endsWith("/legislative.json")||p.endsWith("/judiciary.json"));
 const baseline=basePaths.flatMap(p=>read(manifest,files,p).map(x=>({...x,_path:p})));
 const canon=new Map(baseline.map(x=>[x.id,x]));
 check(baseline.length===61&&canon.size===61,"canonical 61 IDs changed or duplicated");
 const depts=baseline.filter(x=>x.kind==="executive_department");
 check(depts.length===15&&PILOTS.size===3&&[...PILOTS].every(x=>canon.has(x)),
  "5 USC 101 15-department baseline or three pilot identities lost");
 const originalRefs=read(manifest,files,"model/federal/coverage/institution-references.json");
 check(originalRefs.length===61&&new Set(originalRefs.map(x=>x.institution_id)).size===61,
  "merged census identities must not be forked");
 const oldRefs=new Map(originalRefs.map(x=>[x.institution_id,x]));
 const publishedSources=read(manifest,files,"model/federal/sources.json");
 const censusSources=read(manifest,files,"model/federal/coverage/source-registry.json");
 const sourceIDs=new Set([...publishedSources,...censusSources,...data.sources].map(x=>x.id));
 check(sourceIDs.size===publishedSources.length+censusSources.length+data.sources.length,
  "duplicate official source identities across registries");
 check(same(data.sources.map(x=>x.id),Object.keys(SOURCE_URLS)),
  "source whitelist incomplete or expanded without review");
 for(const src of data.sources){
  check(src.url===SOURCE_URLS[src.id]&&src.type==="expansion_official_primary_source"&&
   src.accessed_on==="2026-10-16"&&src.claim_boundary.length>=18,
   "official source identity / version / exact locator mismatch "+src.id);
 }
 check(censusSources.some(x=>x.id==="CENSUS-SRC-GOVMAN-2025"&&
  x.url==="https://www.govinfo.gov/app/details/GOVMAN-2025-12-31"),
  "original dated Government Manual edition missing");
 const snapshots=recordMap(data.snapshots);
 check(snapshots.size===6&&same([...snapshots.keys()],Object.keys(SNAP_SOURCES)),
  "six explicit historical, legal and mutable source slices required");
 for(const s of data.snapshots){
  check(s.source_id===SNAP_SOURCES[s.id]&&sourceIDs.has(s.source_id)&&
   s.accessed_on==="2026-10-16"&&s.complete_federal_denominator===false&&
   s.complete_first_level_roster===false&&s.independent_legal_review_complete===false,
   "source slice overstates edition, population or review "+s.id);
 }
 const refs=data.roster,byId=recordMap(refs),seen=new Set();
 const expectedIds=baseline.filter(x=>!PILOTS.has(x.id)).map(x=>x.id);
 check(refs.length===58&&same(refs.map(x=>x.canonical_institution_id),expectedIds),
  "selected 58 references do not exactly cover canonical nonpilot inventory");
 const totals=Object.fromEntries(Object.keys(COUNTS).map(f=>[f,0]));
 for(const x of refs){
  const c=canon.get(x.canonical_institution_id),legacy=oldRefs.get(x.canonical_institution_id);
  check(!!c&&!!legacy&&x.id==="EXP-REF-"+c.id&&
    x.canonical_model_path===legacy.canonical_model_path&&
    x.canonical_parent_id===c.parent_id&&x.branch_id===c.branch_id&&
    x.family===familyForPath(c._path),
    "canonical identity remapping, illegal cross-branch parent, or class spoof "+x.id);
  check(!seen.has(c.id),"duplicated canonical pointer "+c.id);seen.add(c.id);
  check(legacy.source_ids.every(src=>x.source_ids.includes(src))&&
    x.source_ids.every(src=>sourceIDs.has(src))&&unique(x.source_ids)&&
    (x.source_snapshot_id===null||snapshots.has(x.source_snapshot_id)),
    "incomplete evidence snapshot or forged official source "+x.id);
  check(x.external_official_identifier===null&&x.adl_evidenced===0&&
    x.adl1_completed===false&&x.specific_statutory_authority_verified===false&&
    x.legal_subtype_verified===false&&x.current_parentage_verified===false&&
    x.individual_component_denominator_known===false&&
    x.review_status==="research_pending_qualified_human_review",
    "ADL / legal authority / external ID falsely promoted "+x.id);
  if(x.family==="departments")
   check(x.source_ids.includes("EXP-SRC-5-USC-101")&&
    x.source_snapshot_id==="EXP-SNAP-5-USC-101"&&
    x.source_match_status==="section_level_statutory_department_identity_15_of_15",
    "Cabinet classification lacks controlling 5 USC 101 citation");
  if(x.family==="independent")check(x.source_match_status===
    "dated_handbook_category_only_individual_class_unreviewed",
    "legal independence must not be inferred from directory category");
  if(x.family==="legislative"&&x.canonical_institution_id==="ORG-FED-LEG-HOUSE")
   check(x.source_ids.includes("EXP-SRC-HOUSE-119"),
    "House procedural source missing from chamber crosswalk");
  if(x.family==="judiciary"&&x.canonical_institution_id==="ORG-FED-JUD-APPEALS")
   check(x.source_ids.includes("EXP-SRC-USCOURTS-STRUCTURE"),
    "13 courts of appeals category lacks official source context");
  totals[x.family]++;
 }
 check(Object.keys(COUNTS).every(k=>totals[k]===COUNTS[k]),
  "family-level reference denominator drift");
 const dseeds=data["department-seeds"],cbseeds=data["crossbranch-seeds"];
 check(dseeds.length===24&&cbseeds.length===17,"bounded components must be exactly 24 + 17");
 const deptSeedCounts={};
 for(const x of dseeds){
  check(byId.has("EXP-REF-"+x.parent_department_id)&&x.branch_id==="BR-FED-EXE"&&
   x.source_snapshot_id==="EXP-SNAP-GOVMAN-2025"&&
   same(x.source_ids,["CENSUS-SRC-GOVMAN-2025"])&&
   x.evidence_locator.startsWith("GOVMAN-2025-12-31 / Executive Branch / Department")&&
   x.relationship_type==="published_department_affiliation_candidate_not_direct_command"&&
   x.original_edition_item_locator_reconciled===false&&x.adl_evidenced===0&&
   x.adl1_completed===false&&x.direct_supervision_verified===false&&
   x.delegation_verified===false&&x.appropriation_verified===false&&
   x.current_2026_presence_verified===false,
   "invented official department structure, current service, or authority "+x.id);
  deptSeedCounts[x.parent_department_id]=(deptSeedCounts[x.parent_department_id]||0)+1;
 }
 check(Object.keys(deptSeedCounts).length===12&&
  Object.values(deptSeedCounts).every(n=>n===2),"not all twelve departments have two explicitly partial seeds");
 const cbCounts={legislative:0,judiciary:0},knownParents=new Set(expectedIds);
 const courtLabels=new Set();
 for(const x of cbseeds){
  check(knownParents.has(x.parent_id)&&
   x.source_ids.every(s=>sourceIDs.has(s))&&
   x.source_snapshot_id&&snapshots.get(x.source_snapshot_id)?.source_id===x.source_ids[0]&&
   x.adl_evidenced===0&&x.adl1_completed===false&&
   x.source_item_locator_independently_reviewed===false&&
   x.individual_legal_creation_and_jurisdiction_verified===false&&
   x.committee_rule_and_subcommittee_jurisdiction_verified===false&&
   x.operational_reporting_or_command_proven===false,
   "invented court jurisdiction / committee powers or source "+x.id);
  const fam=x.branch_id==="BR-FED-LEG"?"legislative":"judiciary";
  if(fam==="legislative"){
   check(["ORG-FED-LEG-HOUSE","ORG-FED-LEG-SENATE"].includes(x.parent_id)&&
     /standing_committee_reference$/.test(x.relationship_type),
     "invalid congressional committee parent or legal role");
  }else{
   check(x.parent_id==="ORG-FED-JUD-APPEALS"&&
    x.relationship_type==="appellate_court_named_candidate_not_case_assignment",
    "an appellate court cannot be assigned judicial command or incorrect court group");
   courtLabels.add(x.name);
  }
  cbCounts[fam]++;
 }
 check(cbCounts.legislative===4&&cbCounts.judiciary===13&&courtLabels.size===13,
  "bounded 119th committee seeds / 13 appeals-court candidates incomplete");
 const nodes=new Map([...refs.map(x=>[x.canonical_institution_id,x]),
  ...dseeds.map(x=>[x.id,x]),...cbseeds.map(x=>[x.id,x])]);
 check(nodes.size===99,"duplicate cross-domain institution or candidate identifiers");
 const branchIDs=new Set(branches.map(x=>x.id));
 const edges=data.relationships,found=new Set();
 check(edges.length===nodes.size&&unique(edges.map(x=>x.id)),
  "each of 99 scoped nodes must have one descriptive relationship");
 for(const e of edges){
  const x=nodes.get(e.from_id),baseTarget=canon.get(e.to_id);
  check(!!x&&(!!baseTarget||branchIDs.has(e.to_id))&&
   e.branch_id===(x.branch_id)&&
   (baseTarget?.branch_id===e.branch_id||branchIDs.has(e.to_id)&&e.to_id===e.branch_id),
   "orphan or cross-branch relationship "+e.id);
  const isRoot=x.canonical_institution_id!==undefined;
  const actualTo=isRoot?x.canonical_parent_id:
    x.parent_department_id||x.parent_id;
  const actualType=isRoot?REL_TYPES[x.family]:x.relationship_type;
  check(e.to_id===actualTo&&e.relationship_type===actualType&&
   same(e.source_ids,x.source_ids)&&e.source_snapshot_id===x.source_snapshot_id&&
   e.type==="descriptive_evidence_scoped_institution_relation"&&
   e.operational_command_proven===false&&e.delegated_power_proven===false&&
   e.appropriation_verified===false&&e.current_direct_supervision_verified===false&&
   e.legal_subtype_resolved===false&&
   e.review_status==="catalogue_only_no_current_legal_certification",
   "unsupported legal effect or unsupported organizational relation "+e.id);
  check(!found.has(e.from_id),"multiple inconsistent hierarchy assertions "+e.from_id);
  found.add(e.from_id);
 }
 check(found.size===nodes.size,"unlinked scoped reference candidates");
 const ledger=recordMap(data["coverage-ledger"]);
 check(ledger.size===5,"family coverage ledger incomplete");
 for(const [fam,denom]of Object.entries(COUNTS)){
  const x=ledger.get("EXP-LEDGER-"+fam.toUpperCase());
  const seeds=fam==="departments"?24:fam==="legislative"?4:fam==="judiciary"?13:0;
  check(x?.family===fam&&x.known_canonical_reference_denominator===denom&&
   x.canonical_pointer_count===totals[fam]&&x.explicit_first_level_seed_count===seeds&&
   x.individual_first_level_official_denominator===null&&
   x.independently_verified_current_first_level_entities===0&&
   x.whole_institution_adl1_certified_count===0&&
   x.complete_current_roster_claim===false&&
   x.percentage_of_total_federal_government===null&&
   x.human_legal_review_complete===false&&
   x.denominator_basis==="ARFI_61_reference_register_excluding_three_pilot_cabinet_depts",
   "invalid internal denominator or fabricated federal completeness "+fam);
 }
 const gaps=recordMap(data.gaps);
 check(gaps.size===17,"open research gap register incomplete");
 for(const dept of depts.filter(x=>!PILOTS.has(x.id)))
  check(gaps.has("EXP-GAP-"+dept.id.split("-").at(-1)+"-FULL-LEVEL-ONE"),
   "missing department first-level structural verification gap "+dept.id);
 for(const k of ["EOP","INDEPENDENT","LEGISLATIVE","JUDICIARY","FEDERAL-UNIVERSE"])
  check(gaps.has("EXP-GAP-"+k),"missing cross-branch research gap "+k);
 for(const x of gaps.values())
  check(x.unknown_denominator===true&&x.adl1_complete===false&&
   x.legal_subtype_complete===false&&x.status==="open_unverified"&&
   (canon.has(x.root_id)||branchIDs.has(x.root_id)),
   "gap artificially closed or detached from official branch "+x.id);
 check(data.viewpoints.length===6&&same(data.viewpoints.map(x=>x.id),Object.keys(KNOWN_VIEWS)),
  "six declarative source-bounded viewpoints required");
 for(const v of data.viewpoints)
  check(v.family===KNOWN_VIEWS[v.id]&&v.root_filter_supported===(v.family==="departments")&&
   v.model_only===true&&v.website_rendered===false&&v.legal_authority_proven===false&&
   v.complete_current_census===false&&
   v.view_status==="data_contract_unratified_read_only",
   "unapproved view attempts publication, competence or completeness "+v.id);
 const counts={canonical_source_refs:61,covered_scoped_refs:58,excluded_pilot_departments:3,
  remaining_department_roots:12,department_unit_candidates:24,
  congressional_committee_candidates:4,appellate_court_candidates:13,
  nondepartment_root_references:18,explicit_gaps:17,
  source_slices:data.snapshots.length,source_records:data.sources.length,
  edges:edges.length,viewpoints:data.viewpoints.length,adls_one_certified:0};
 return {status:"source_bounded_research_not_complete_census",counts,totals,records:data,
  canonical:canon,branches,edges,source_slices:data.snapshots,
  denominator_scope:"58_PREEXISTING_CANONICAL_REFERENCES_NOT_ALL_FEDERAL_GOVERNMENT"};
}
export function projectFederalExpansion(result,viewId,rootId=null){
 const family=KNOWN_VIEWS[viewId];
 check(family!==undefined,"unknown unapproved expansion viewpoint "+viewId);
 if(rootId!==null)
  check(family==="departments"&&result.canonical.has(rootId)&&
   result.records.roster.some(x=>x.canonical_institution_id===rootId&&x.family==="departments"),
   "root filter not a bounded nonpilot Cabinet department");
 const refs=result.records.roster.filter(x=>(family==="all"||x.family===family)&&
  (!rootId||x.canonical_institution_id===rootId));
 const deptSeeds=result.records["department-seeds"].filter(x=>
   (family==="all"||family==="departments")&&(!rootId||x.parent_department_id===rootId));
 const otherSeeds=result.records["crossbranch-seeds"].filter(x=>
   family==="all"||family==="legislative"&&x.branch_id==="BR-FED-LEG"||
   family==="judiciary"&&x.branch_id==="BR-FED-JUD");
 const nodes=new Map();
 for(const x of refs){
  const c=result.canonical.get(x.canonical_institution_id);
  nodes.set(c.id,{id:c.id,name:c.name,branch_id:c.branch_id,
   kind:c.kind,adl_evidenced:0,canonical:true,source_ids:x.source_ids});
 }
 for(const x of [...deptSeeds,...otherSeeds])nodes.set(x.id,{
  id:x.id,name:x.name,branch_id:x.branch_id,kind:x.type,adl_evidenced:0,
  canonical:false,source_ids:x.source_ids});
 const eligible=result.edges.filter(e=>nodes.has(e.from_id));
 for(const e of eligible)if(!nodes.has(e.to_id)&&e.to_id===e.branch_id){
  const b=result.branches.find(x=>x.id===e.to_id);
  if(b)nodes.set(b.id,{id:b.id,name:b.name,branch_id:b.id,kind:"constitutional_branch",
   adl_evidenced:0,canonical:true,source_ids:b.source_ids});
 }
 const relationships=eligible.filter(x=>nodes.has(x.to_id)).sort((a,b)=>a.id.localeCompare(b.id));
 return {view_id:viewId,root_id:rootId,render_status:"data_contract_only_not_website_rendered",
  publication_status:"research_unratified",
  denominator_scope:result.denominator_scope,
  nodes:[...nodes.values()].sort((a,b)=>a.id.localeCompare(b.id)),
  relationships,counts:{nodes:nodes.size,links:relationships.length},
  warnings:["Every displayed edge is descriptive; none establishes military command, agency delegation, enacted appropriations or judicial jurisdiction.",
   "Only 58 pre-existing canonical references are within this expansion. Full federal and current first-level denominators remain unknown."]};
}
