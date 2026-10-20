// INC-15B. Source-scoped department publisher rosters. Not ADL-1 or a policy model.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
export const SOURCE_PIN="414704cd8eb749696387be95613772df90ef64ac";
export const FAMILIES=Object.freeze(["inc15b-cabinet-sources","inc15b-roster-crosswalks","inc15b-source-partitions"]);
const P="model/federal/",SHA=/^[a-f0-9]{40}$/,ID=/^[A-Z][A-Z0-9-]{2,174}$/;
const ORIGINAL_GIT_BLOBS=Object.freeze({
  "model/federal/executive-departments.json": "a7557ec212e3e3123d6b4e6bc121ed734d93bfc7",
  "model/federal/department-structure/units.json": "4b5748c932c3139e39abca684eb56f5d5d9995ae",
  "model/federal/department-structure/relationships.json": "4afc01a4e5c80746667bc45180c37b423e4485f4",
  "model/federal/department-structure/source-registry.json": "b91cccbe4687c4d1f7ca67cb4a513aeb096f8543",
  "model/federal/department-structure/source-snapshots.json": "15284a0e2b653703ce3b30d1a0f770c80c92389f",
  "model/federal/x12-observations.json": "7e4b20396c545207b9847c7a4f14e593a3b30b68",
  "model/federal/expansion/department-seeds.json": "645dc3a0c192a36747a341133266a38dd31c5d3f",
  "model/federal/dod/statutory-composition.json": "85f7311d716968fd80744df70725758a7afd7680",
  "model/federal/dod/source-snapshots.json": "68fb444b46d688b87a67d2190958e3c0da810567",
  "model/federal/coverage/source-registry.json": "7f0d6aae22c625d83dc1609cbc332335e5022bdc",
  "model/federal/inc15-cabinet-crosswalks.json": "c6896b9204b53172dde46ef947de9a84c7013011",
  "model/federal/inc13b2-doj-chart.json": "c612fce3a4e5b77eb3e7ab60fe3f5b33400da5f6",
  "model/federal/inc13b3-va-directory.json": "b827932a7b54baeb453ebf9e890199960ea8a19a",
  "model/federal/inc15-cohorts.json": "a5a1c36b5ae49c9ff6298d715685648cef15d0fb",
  "model/federal/inc15-department-pilots.json": "f7abac54f0b2418a6cf7db623f3076b777868f52"
});
const fail=s=>{throw Error("INC-15B source census rejected: "+s);};
const ok=(v,s)=>{if(!v)fail(s);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
const byId=a=>new Map(a.map(x=>[x.id,x]));
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const blobSha=raw=>{
 const b=Buffer.from(raw,"utf8");
 return createHash("sha1").update("blob "+b.length+String.fromCharCode(0),"utf8")
  .update(b).digest("hex");
};
export function loadINC15B(){
 const paths=Object.keys(ORIGINAL_GIT_BLOBS);
 const sourceBytes=Object.fromEntries(paths.map(p=>[p,read(p)]));
 return {manifest:JSON.parse(read(P+"manifest.json")),
  schema:JSON.parse(read("schemas/inc15b-cabinet-sources.schema.json")),
  models:Object.fromEntries(FAMILIES.map(f=>[f,JSON.parse(read(P+f+".json"))])),
  sourceBytes,originals:Object.fromEntries(Object.entries(sourceBytes).map(([p,v])=>[p,JSON.parse(v)]))};
}
function closedRule(rule,record){
 if(Object.hasOwn(rule,"const"))ok(same(record,rule.const),"schema const violated");
 if(rule.type){
  const found=record===null?"null":Array.isArray(record)?"array":
   Number.isInteger(record)?"integer":typeof record;
  ok([rule.type].flat().includes(found),"schema type mismatch");
 }
 if(typeof record==="string"&&rule.minLength!==undefined)
  ok(record.length>=rule.minLength,"empty source schema string");
 if(Number.isInteger(record)&&rule.minimum!==undefined)
  ok(record>=rule.minimum,"invalid source schema nonnegative");
 if(rule.type==="array"){
  ok(Array.isArray(record)&&record.length>=(rule.minItems??0)&&
   record.length<=(rule.maxItems??Infinity),"unbounded schema cohort");
  if(rule.uniqueItems)ok(unique(record.map(x=>JSON.stringify(x))),"duplicate source list entry");
  for(const x of record)closedRule(rule.items,x);
 }
 if(rule.type==="object"){
  ok(record&&typeof record==="object"&&!Array.isArray(record)&&
   rule.additionalProperties===false,"unclosed source model schema");
  const keys=Object.keys(rule.properties||{});
  ok(same(Object.keys(record).sort(),keys.slice().sort())&&
   same((rule.required||[]).slice().sort(),keys.slice().sort()),
   "injected, missing or untyped model field");
  for(const key of keys)closedRule(rule.properties[key],record[key]);
 }
}
export function validateINC15B(input){
 const {manifest,schema,models,sourceBytes,originals}=input||{};
 ok(manifest?.model_standard==="ARFI-COA"&&manifest.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  Array.isArray(manifest.models)&&manifest.models.length===276&&
  unique(manifest.models),"invalid 276-source-model baseline");
 const ext=manifest.federal_institutional_breadth_15b_extension;
 ok(ext?.source_baseline_commit===SOURCE_PIN&&
  ext.cabinet_departments===15&&ext.publisher_source_cohorts===5&&
  ext.publisher_rosters_missing===10&&ext.first_new_department_source_observations===22&&
  ext.original_dept04_source_records===80&&ext.nonadditive_source_partitions===4&&
  ext.complete_current_first_level_denominator===null&&
  ext.original_publisher_source_custody_qualified===false&&
  ext.independent_legal_review_complete===false&&
  ext.adl1_certified_count===0,
  "INC-15B scope, original custody or legal certification inflated");
 for(const name of FAMILIES)
  ok(manifest.models.filter(p=>p===P+name+".json").length===1,
   "missing, repeated or changed declared family "+name);
 ok(schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  Array.isArray(schema.oneOf)&&schema.oneOf.length===3,"unrecognized schema bundle");
 for(let i=0;i<FAMILIES.length;i++){
  const m=models?.[FAMILIES[i]];
  ok(m?.model_family===FAMILIES[i]&&m?.model_version==="0.1.0"&&
   m?.source_baseline_commit===SOURCE_PIN&&Array.isArray(m.items)&&
   unique(m.items.map(x=>x.id))&&m.items.every(x=>ID.test(x.id)),
   "source cohort family or IDs changed");
  closedRule(schema.oneOf[i],m);
 }
 // These expected source digests were independently copied from the fixed
 // SOURCE_PIN Git tree. A changed raw file and co-forged per-cohort SHA cannot pass.
 ok(sourceBytes&&same(Object.keys(sourceBytes).sort(),Object.keys(ORIGINAL_GIT_BLOBS).sort()),
  "unexpected mutable model-source file inventory");
 for(const [p,sha] of Object.entries(ORIGINAL_GIT_BLOBS)){
  const raw=sourceBytes[p];
  ok(SHA.test(sha)&&typeof raw==="string"&&blobSha(raw)===sha&&
   same(JSON.parse(raw),originals?.[p]),"pinned original Git blob mismatch "+p);
 }
 const data=p=>originals[P+p]?.items;
 const departments=data("executive-departments.json"),
  deptUnits=data("department-structure/units.json"),
  deptRels=data("department-structure/relationships.json"),
  deptSources=data("department-structure/source-registry.json"),
  deptSnaps=data("department-structure/source-snapshots.json"),
  x12=data("x12-observations.json"),
  seeds=data("expansion/department-seeds.json"),
  dodComposition=data("dod/statutory-composition.json"),
  dodSnaps=data("dod/source-snapshots.json"),
  sourceRows=data("coverage/source-registry.json"),
  originalCabinet=data("inc15-cabinet-crosswalks.json"),
  priorCohorts=data("inc15-cohorts.json"),
  priorPilots=data("inc15-department-pilots.json"),
  oldDoJ=data("inc13b2-doj-chart.json"),oldVA=data("inc13b3-va-directory.json");
 ok(departments?.length===15&&deptUnits?.length===80&&deptRels?.length===80&&
  deptSources?.length===5&&deptSnaps?.length===4&&x12?.length===150&&
  originalCabinet?.length===15&&priorCohorts?.length===12&&priorPilots?.length===3&&
  dodComposition?.length===11&&oldDoJ?.length===36&&oldVA?.length===22,
  "previous source roster population changed");
 const sourceMap=byId([...deptSources,...sourceRows]),snapMap=byId([...deptSnaps,...dodSnaps]);
 const unitMap=byId(deptUnits),relByFrom=new Map(deptRels.map(x=>[x.from_id,x])),
  x12BySource=new Map(x12.map(x=>[x.source_record_id,x])),seedMap=byId(seeds);
 ok(unique(deptRels.map(x=>x.from_id))&&unique(x12.map(x=>x.source_record_id))&&
  unique([...deptSources,...sourceRows].map(x=>x.id))&&
  unique([...deptSnaps,...dodSnaps].map(x=>x.id)),
  "ambiguous original source identity or relationship");
 const registry=models["inc15b-cabinet-sources"],
  crosswalk=models["inc15b-roster-crosswalks"],
  partitions=models["inc15b-source-partitions"];
 ok(registry.items.length===15&&
  registry.official_publisher_source_cohort_count===5&&
  registry.department_source_unavailable_count===10&&
  registry.legally_qualified_department_count===0&&
  registry.complete_current_whole_federal_first_level_denominator===null&&
  crosswalk.items.length===22&&crosswalk.crosswalk_count===22&&
  crosswalk.matched_prior_expansion_candidates===4&&
  crosswalk.new_legal_institutional_identities===0&&
  crosswalk.complete_department_first_level_denominator===null&&
  partitions.items.length===4&&partitions.original_department_structure_source_records===80&&
  partitions.crosswalk_new_records===22&&
  partitions.crosswalk_prior_reconciliation_source_records===58&&
  partitions.global_first_level_denominator===null&&
  partitions.adl1_certified_count===0,
  "fabricated source/identity/legal coverage count");
 const byDept=new Map(registry.items.map(x=>[x.canonical_department_id,x]));
 ok(same(registry.items.map(x=>x.canonical_department_id),departments.map(x=>x.id)),
  "Cabinet original canonical IDs were reordered or replaced");
 let sourced=0,unsourced=0;
 for(let i=0;i<departments.length;i++){
  const d=departments[i],r=registry.items[i],prior=originalCabinet[i],
   s=deptSnaps.find(s=>s.department_id===d.id),isDoD=d.id==="ORG-FED-EXE-DEP-DEFENSE",
   snap=s||(isDoD?dodSnaps.find(s=>s.id==="DOD-SNAPSHOT-USC-2026-10-07"):null),
   sourceId=s?.source_id||(isDoD?"CENSUS-SRC-DOD-111":null),
   source=sourceId?sourceMap.get(sourceId):null,
   observedCount=s?.source_group_record_count??(isDoD?dodComposition.length:null),
   modelPath=s?P+"department-structure/units.json":isDoD?P+"dod/statutory-composition.json":null;
  ok(d.branch_id==="BR-FED-EXE"&&d.parent_id==="BR-FED-EXE"&&
   r.id==="INC15B-CAB-"+d.id&&r.canonical_department_id===d.id&&
   r.original_cabinet_crosswalk_id===prior.id&&r.canonical_department_name===d.name&&
   r.branch_id===d.branch_id&&r.publisher_source_id===sourceId&&
   r.publisher_source_url===(source?.url||null)&&
   r.publisher_source_kind===(source?.type||null)&&
   r.source_model_path===modelPath&&
   r.source_model_commit===(modelPath?SOURCE_PIN:null)&&
   r.source_model_git_blob_sha===(modelPath?ORIGINAL_GIT_BLOBS[modelPath]:null)&&
   r.source_snapshot_id===(snap?.id||null)&&
   r.source_edition===(s?.edition||snap?.as_of||null)&&
   r.source_last_published_or_updated===(source?.published_or_last_updated||source?.published_on||null)&&
   r.source_observed_on===(s?.observed_on||(isDoD?"2026-10-16":null))&&
   r.source_scoped_record_count===observedCount&&
   r.source_group_reconciled===(s?.complete_source_group_extracted===true||isDoD)&&
   r.source_group_kind===(s?.source_group||(isDoD?"codified_10_usc_111_b_composition_categories":null))&&
   r.publisher_source_classification===(s?"publisher_edition_recorded_heading_or_connector":isDoD?"bounded_statutory_composition_categories":"official_first_level_roster_unacquired")&&
   r.original_publisher_bytes_independently_archived===false&&
   r.complete_current_first_level_denominator===null&&
   r.identity_legal_review_complete===false&&r.adl1_certified===false&&
   r.nonadditive_other_editions===true&&
   r.source_coverage_state===(sourceId?"source_publisher_cohort_recorded_not_independently_qualified":"source_edition_not_yet_registered"),
   "source registry identity, provenance, scope or certification drift "+d.id);
  if(sourceId){ok(source&&/^https:\/\//.test(source.url||"")&&
   snap&&(s?.complete_department_first_level_known===false||isDoD),
   "invalid dated publisher source or false denominator "+d.id);sourced++;}
  else unsourced++;
 }
 ok(sourced===5&&unsourced===10&&registry.items.filter(x=>x.source_scoped_record_count!==null).length===5,
  "unsupported publisher completeness or denominator");
 const focus=deptUnits.filter(x=>["ORG-FED-EXE-DEP-TREASURY","ORG-FED-EXE-DEP-COMMERCE"].includes(x.department_id));
 ok(focus.length===22&&same(crosswalk.items.map(x=>x.source_unit_id),focus.map(x=>x.id)),
  "22 source candidates must match original ordering and identities");
 let seedMatches=0,treasuryOversight=0,commerceExecutiveOffices=0;
 for(let i=0;i<focus.length;i++){
  const u=focus[i],x=crosswalk.items[i],rel=relByFrom.get(u.id),
   obs=x12BySource.get(u.id),snapshot=snapMap.get(u.snapshot_id),
   seed=u.legacy_candidate_id?seedMap.get(u.legacy_candidate_id):null;
  ok(rel&&obs&&snapshot&&(!u.legacy_candidate_id||seed)&&
   rel.from_id===u.id&&rel.to_id===u.parent_ref&&
   rel.source_id===u.source_id&&rel.snapshot_id===u.snapshot_id&&
   rel.relationship_type===obs.relation_type&&obs.observed_parent_id===u.parent_ref&&
   obs.relation_source_id===rel.id&&
   obs.source_snapshot_id===u.snapshot_id&&
   obs.adl1_eligible===false&&obs.confirmed_command===false&&
   obs.confirmed_supervision===false&&obs.confirmed_delegation===false&&
   rel.delegated_power_proven===false&&
   rel.direct_military_or_civilian_command_proven===false&&
   rel.appropriation_verified===false&&rel.legally_valid_adl1_claim===false&&
   u.legal_subtype_finalized===false&&u.adl_evidenced===0&&
   u.direct_operational_command_verified===false&&u.statutory_delegation_verified===false&&
   (seed===undefined||seed?.parent_department_id===u.department_id),
   "original date/identity/source/authority linkage invalid "+u.id);
  ok(x.id==="INC15B-OBS-"+u.id&&x.canonical_department_id===u.department_id&&
   x.source_unit_id===u.id&&x.source_unit_name===u.name&&
   x.original_source_model_path===P+"department-structure/units.json"&&
   x.original_source_relation_id===rel.id&&
   x.source_observation_id===obs.id&&
   x.source_id===u.source_id&&x.source_snapshot_id===u.snapshot_id&&
   x.source_observed_on===snapshot.observed_on&&
   x.original_observed_parent_id===u.parent_ref&&
   x.original_relation_target_id===rel.to_id&&
   x.original_relation_kind===rel.relationship_type&&
   x.original_source_group===u.group&&
   x.original_structural_class===u.structural_class&&
   x.source_locator===u.source_locator&&
   x.original_legacy_candidate_id===u.legacy_candidate_id&&
   x.matched_existing_seed_id===(seed?.id||null)&&
   x.source_identity_resolution===(seed?"linked_to_prior_research_candidate_not_certified_legal_identity":"original_source_observation_without_adl1_legal_identity")&&
   x.canonical_unit_institution_id===null&&
   x.individual_officeholder_verified===false&&
   x.legal_first_level_member_certified===false&&
   x.direct_reporting_verified===false&&
   x.military_or_civilian_command_verified===false&&
   x.delegated_authority_verified===false&&
   x.independent_original_publisher_custody===false&&
   x.adl1_certified===false,"source 22-row identity crosswalk changed "+u.id);
  if(seed)seedMatches++;
  if(u.department_id==="ORG-FED-EXE-DEP-TREASURY"&&
   u.structural_class==="independent_oversight_position_only"){
   ok(rel.relationship_type==="independent_oversight_display_placement_not_command",
    "Treasury inspector general legal boundary");treasuryOversight++;
  }
  if(u.department_id==="ORG-FED-EXE-DEP-COMMERCE"&&
   u.structural_class==="executive_office_listed_in_bureaus_category_not_legal_bureau")
   commerceExecutiveOffices++;
 }
 ok(seedMatches===4&&treasuryOversight===2&&commerceExecutiveOffices===2&&
   focus.filter(x=>x.department_id==="ORG-FED-EXE-DEP-TREASURY").length===9&&
   focus.filter(x=>x.department_id==="ORG-FED-EXE-DEP-COMMERCE").length===13,
   "Office of Secretary, Treasury IG, or prior candidate class was silently merged");
 const keys=["JUSTICE","VA","TREASURY","COMMERCE"],expectedCounts=[36,22,9,13];
 ok(same(partitions.items.map(x=>x.department_id),
  keys.map(x=>"ORG-FED-EXE-DEP-"+x)),"misplaced dated departmental publisher populations");
 for(let i=0;i<keys.length;i++){
  const department="ORG-FED-EXE-DEP-"+keys[i],p=partitions.items[i],
   s=deptSnaps.find(x=>x.department_id===department),source=sourceMap.get(s?.source_id),
   rows=deptUnits.filter(x=>x.department_id===department),
   cross=focus.filter(x=>x.department_id===department),
   old=(keys[i]==="JUSTICE"?P+"inc13b2-doj-chart.json":
    keys[i]==="VA"?P+"inc13b3-va-directory.json":null),
   structural=[...new Map(rows.map(x=>[x.structural_class,
    rows.filter(y=>y.structural_class===x.structural_class).length]))]
    .map(([name,n])=>name+":"+n).sort(),
   labels=new Set(rows.map(x=>x.name));
  ok(p.id==="INC15B-PARTITION-"+keys[i]&&s&&source&&
   p.original_source_collection===P+"department-structure/units.json"&&
   p.original_source_registry_collection===P+"department-structure/source-registry.json"&&
   p.source_id===s.source_id&&p.source_url===source.url&&
   p.snapshot_id===s.id&&p.source_edition===s.edition&&
   p.source_observed_on===s.observed_on&&p.source_group===s.source_group&&
   p.original_source_rows===expectedCounts[i]&&rows.length===expectedCounts[i]&&
   p.unique_source_labels===labels.size&&
   p.duplicate_source_labels===rows.length-labels.size&&
   p.inc12_observation_crosswalk_count===rows.filter(x=>x12BySource.has(x.id)).length&&
   p.inc15b_new_crosswalk_count===cross.length&&
   p.preexisting_reconciliation_model_path===old&&
   p.prior_expansion_seed_overlaps===rows.filter(x=>x.legacy_candidate_id!==null).length&&
   same(p.recorded_structural_classes,structural)&&
   p.source_scoped_group_extraction_complete===s.complete_source_group_extracted&&
   p.first_level_current_department_denominator===null&&
   p.complete_current_department_roster_verified===false&&
   p.independent_publisher_original_custody===false&&
   p.independent_legal_effect_review_complete===false&&
   p.source_population_additive_to_other_editions===false&&
   p.adl1_certified_count===0,
   "per-department source/overlap, exception or qualified population forged "+keys[i]);
 }
 ok(partitions.items.reduce((n,x)=>n+x.original_source_rows,0)===80&&
   partitions.items.reduce((n,x)=>n+x.inc12_observation_crosswalk_count,0)===80&&
   partitions.items.reduce((n,x)=>n+x.inc15b_new_crosswalk_count,0)===22,
   "source row partition and X12 original linkage loss");
 return Object.freeze({sourcePin:SOURCE_PIN,canonicalCabinetDepartments:15,
  publisherEditionCohorts:5,departmentsWithoutEdition:10,
  treasuryOriginalPublisherObservations:9,commerceOriginalPublisherObservations:13,
  newlyReconciledSourceObservations:22,originalDept04SourcePartitionRows:80,
  earlierDoJVaSourceRows:58,priorResearchCandidateLinks:4,
  currentFirstLevelGovernmentDenominator:null,adl1Certified:0,
  status:"versioned_publisher_source_research_not_complete_current_first_level_census"});
}
