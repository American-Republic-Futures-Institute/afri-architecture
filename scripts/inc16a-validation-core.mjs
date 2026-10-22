#!/usr/bin/env node
// INC-16A: descriptive federal interface facts, source retention, and non-promotion.
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const HERE=path.dirname(fileURLToPath(import.meta.url));
export const ROOT=path.resolve(HERE,"..");
export const MODEL="model/federal/inc16/inc16a-hhs-dhs-functional-interface.json";
export const SCHEMA="schemas/inc16a-hhs-dhs-functional-interface.schema.json";
export const GOVSHA="c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138";
const CODE_ORIGINALS={
 "INC16A-SRC-USC-6-467":"37a657bc872228bc232de0ef75dd78a03fec194bc9e30f435adae5b07985ccd2",
 "INC16A-SRC-USC-42-300HH":"23b076dd183daacd5489f4352b4e342c97b2a95807822ddf6a85f2cd115e9058"
};
const SOURCE_RECEIPT="evidence/inc16b-uscode/source-custody.json";
const H="ORG-FED-EXE-DEP-HHS",D="ORG-FED-EXE-DEP-DHS",DEF="ORG-FED-EXE-DEP-DEFENSE";
const G="INC16A-SRC-GOVMAN-2025",S6="INC16A-SRC-USC-6-467",S42="INC16A-SRC-USC-42-300HH";
const ORIGINAL="evidence/govman-2025/originals/sha256/"+GOVSHA+".xml";
const FILE_FIELDS={
  root:["model_version","model_family","release_status","edition_scope","legal_first_level_denominator",
    "independent_legal_review_complete","all_source_originals_retained","new_canonical_institution_ids",
    "website_atlas_admitted","policy_recommendations_created","sources","canonical_links","functions",
    "relationship_type_registry","interfaces","authority_boundaries","viewpoints"],
  sources:["id","source_kind","publisher","official_url","source_edition","original_repo_path",
    "original_sha256","original_bytes_retained","verified_scope","legally_certified_current"],
  canonical_links:["id","source_local_id","source_observation_id","existing_canonical_id",
    "existing_x12_id","identity_status","source_id","independent_identity_review_complete"],
  functions:["id","institution_id","function_label","source_id","source_observation_id",
    "source_excerpt","claim_type","verified_execution","assigned_office_id",
    "exclusive_mandate_asserted","legal_delegation_inferred","public_outcome_evidenced"],
  relationship_type_registry:["type","direction","qualified_as","atlas_category_candidate",
    "implies_command","implies_actual_operation"],
  interfaces:["id","from_id","to_id","relationship_type","condition","source_id",
    "official_locator","source_excerpt","interpretation_limit","claimed_direction",
    "actual_notice_verified","signed_agreement_verified","operational_control_transfer_verified",
    "legal_review_complete","public_graph_admitted"],
  authority_boundaries:["id","source_id","official_locator","existing_institution_id","source_excerpt",
    "boundary_kind","hhs_command_over_defense_assets_inferred","legally_certified_operational_event"],
  viewpoints:["id","root_ids","included_edge_types","qualification_display","atlas_admitted"]
};
const FACTS=[
  ["INC16A-IF-HHS-TO-DHS-DECLARED",H,D,S6,"6 U.S.C. 467(b)(2)",
    "statutory_conditional_disclosure_to","public_health_emergency_declared_under_42_USC_247d_a",
    "HHS_to_DHS","shall keep relevant agencies, including the Department of Homeland Security"],
  ["INC16A-IF-DHS-TO-HHS-POTENTIAL",D,H,S6,"6 U.S.C. 467(b)(3)",
    "statutory_conditional_disclosure_to","potential_public_health_emergency_no_hhs_declaration_under_42_USC_247d_a",
    "DHS_to_HHS","all relevant agencies, including the Department of Homeland Security"],
  ["INC16A-IF-HHS-DHS-AGREEMENT-DUTY",H,D,S42,"42 U.S.C. 300hh(b)",
    "statutory_interagency_agreement_collaboration",
    "establish_emergency_response_interagency_agreement_consistent_with_successor_plan",
    "HHS_to_DHS_required_collaboration",
    "in collaboration with the Secretary of Veterans Affairs, the Secretary of Transportation, the Secretary of Defense, the Secretary of Homeland Security"]
];
const MISSIONS={
  HHS:[
    ["HEALTH-ACCESS","making affordable and quality health care and childcare accessible"],
    ["FOOD-SAFETY","ensuring the safety of food products"],
    ["EMERGENCY-PREPAREDNESS","preparing for public health emergencies"],
    ["MEDICAL-RESEARCH","advancing the diagnosis, treatment, and curing of life-threatening illnesses"]],
  DHS:[
    ["TERRORISM","prevents terrorism and enhances security"],
    ["BORDERS","manages the Nation’s borders"],
    ["IMMIGRATION","administers immigration laws"],
    ["CYBER","safeguards cyberspace"],
    ["RESILIENCE","ensures resilience in the wake of disaster"]]
};
function check(value,msg){if(!value)throw Error("INC-16A: "+msg)}
function keys(obj,want,what){
  check(obj && typeof obj==="object" && !Array.isArray(obj) &&
    JSON.stringify(Object.keys(obj).sort())===JSON.stringify(want.slice().sort()),
    "closed record fields: "+what);
}
function uniq(items,key="id"){check(items.length===new Set(items.map(x=>x[key])).size,"duplicate "+key)}
function jload(root,p){return JSON.parse(fs.readFileSync(path.join(root,p),"utf8"))}
export function loadINC16A(root=ROOT){
  return {root,model:jload(root,MODEL),schema:jload(root,SCHEMA),
    manifest:jload(root,"model/federal/manifest.json"),
    directory:jload(root,"model/federal/inc15d-govman-2025-directory.json"),
    directoryCrosswalk:jload(root,"model/federal/inc15d-govman-2025-crosswalk.json"),
    identities:jload(root,"model/federal/x12-identities.json"),
    departments:jload(root,"model/federal/executive-departments.json")};
}
export function validateINC16A(data){
  const {root,model:m,schema,manifest,directory,directoryCrosswalk,identities,departments}=data;
  keys(m,FILE_FIELDS.root,"root");
  check(m.model_version==="0.1.0" && m.model_family==="inc16a-hhs-dhs-functional-interface" &&
    m.release_status==="research_baseline_unratified","unratified release");
  check(m.edition_scope==="2025-12-31 Government Manual missions plus official Code text through Public Law 119-120 on 2026-10-07; statutory originals captured 2026-10-22 as publisher HTML bytes","edition/temporal qualification");
  check(m.legal_first_level_denominator===null &&
    m.independent_legal_review_complete===false && m.all_source_originals_retained===true &&
    m.new_canonical_institution_ids===0 && m.website_atlas_admitted===false &&
    m.policy_recommendations_created===false,"false authority, institution or Atlas admission");
  check(manifest.release_status==="research_baseline_unratified" &&
    manifest.models.includes(MODEL) &&
    manifest.models.length>=306 &&
    new Set(manifest.models).size===manifest.models.length,
    "extension absent or duplicate manifest");
  const ext=manifest.federal_descriptive_missions_16a_extension;
  check(ext && ext.source_mission_function_excerpts===9 &&
    ext.conditional_statutory_interface_claims===3 &&
    ext.existing_canonical_department_roots===2 &&
    ext.source_text_only_no_observed_disclosure===true &&
    ext.all_statutory_originals_retained===true && ext.source_originals_receipt===SOURCE_RECEIPT &&
    ext.statute_source_original_count===2 &&
    ext.atlas_graph_admission===false && ext.new_canonical_institution_ids===0 &&
    ext.current_legal_first_level_denominator===null,"extension source/qualification metrics");
  const families=["sources","canonical_links","functions","relationship_type_registry",
    "interfaces","authority_boundaries","viewpoints"];
  const lengths=[3,2,9,2,3,2,3];
  families.forEach((p,i)=>{
    check(Array.isArray(m[p]) && m[p].length===lengths[i],"wrong "+p+" count");
    m[p].forEach(x=>keys(x,FILE_FIELDS[p],p));
    uniq(m[p],p==="relationship_type_registry"?"type":"id");
  });
  const sourceMap=new Map(m.sources.map(x=>[x.id,x]));
  check(JSON.stringify([...sourceMap.keys()].sort())===JSON.stringify([G,S6,S42].sort()),"source registry");
  const gov=sourceMap.get(G);
  check(gov.source_kind==="official_government_manual_original" &&
    gov.source_edition==="GOVMAN-2025-12-31" &&
    gov.original_repo_path===ORIGINAL && gov.original_sha256===GOVSHA &&
    gov.original_bytes_retained===true && gov.legally_certified_current===false,
    "GovManual original receipt");
  const digest=createHash("sha256").update(fs.readFileSync(path.join(root,ORIGINAL))).digest("hex");
  check(digest===GOVSHA,"GovManual original bytes changed");
  const custody=jload(root,SOURCE_RECEIPT);
  check(custody.model_family==="inc16b-official-uscode-originals" &&
    custody.original_source_count===2 && custody.publisher_release_point==="Public Law 119-120" &&
    custody.publisher_through_date==="October 7, 2026" &&
    custody.not_external_worm_custody===true &&
    custody.not_independent_legal_review===true &&
    custody.website_atlas_admission===false &&
    JSON.stringify(Object.keys(custody.records).sort())===
      JSON.stringify(Object.keys(CODE_ORIGINALS).sort()),
    "untrusted official originals receipt or forged independent review");
  for(const [id,reference,url] of [
    [S6,"official_text_inspected_online_6_USC_467_subsections_b2_b3",
      "https://uscode.house.gov/us/usc/119-118/t6/s467/"],
    [S42,"official_text_inspected_online_42_USC_300hh_subsection_b",
      "https://uscode.house.gov/us/usc/119-120/t42/s300hh/"]]){
    const s=sourceMap.get(id);
    check(s.source_kind==="official_us_code_online_text" &&
      s.source_edition==="text_in_effect_through_Public_Law_119-120_2026-10-07" &&
      s.official_url===url && s.verified_scope===reference &&
      s.original_sha256===CODE_ORIGINALS[id] &&
      s.original_repo_path==="evidence/inc16b-uscode/originals/sha256/"+CODE_ORIGINALS[id]+".html" &&
      s.original_bytes_retained===true && s.legally_certified_current===false,
      "official Code original bytes or legal status falsely represented: "+id);
    const receipt=custody.records[id];
    const raw=fs.readFileSync(path.join(root,s.original_repo_path));
    const digest=createHash("sha256").update(raw).digest("hex");
    const gitBlob=createHash("sha1").update(Buffer.concat([
      Buffer.from("blob "+raw.length),Buffer.from([0]),raw])).digest("hex");
    check(receipt && receipt.publisher==="Office of the Law Revision Counsel, U.S. House of Representatives" &&
      receipt.publisher_code_text_through==="Public Law 119-120" &&
      receipt.original_repository_path===s.original_repo_path &&
      receipt.original_sha256===digest && digest===CODE_ORIGINALS[id] &&
      receipt.original_bytes===raw.length && receipt.git_blob_sha1===gitBlob &&
      receipt.source_original_git_retained===true &&
      receipt.external_independent_WORM_verified===false &&
      receipt.legal_certification_completed===false &&
      receipt.operational_relationship_execution_verified===false,
      "source original receipt differs from exact retained Git bytes: "+id);
  }
  const existing=new Map(departments.items.map(x=>[x.id,x]));
  check(existing.has(H) && existing.has(D) && existing.has(DEF),"existing canonical departments");
  const xw=new Map(directoryCrosswalk.items.map(x=>[x.source_entity_key,x]));
  const obs=new Map(directory.items.map(x=>[x.id,x]));
  const identityMap=new Map(identities.items.map(x=>[x.canonical_id,x]));
  for(const [i,tag,canonical,editionLocal] of [[0,"HHS",H,"117"],[1,"DHS",D,"118"]]){
    const l=m.canonical_links[i],o=obs.get("INC15D-OBS-"+editionLocal);
    check(l.id==="INC16A-XWALK-"+tag &&
      l.source_local_id==="GOVMAN-2025-12-31:"+editionLocal &&
      l.source_observation_id==="INC15D-OBS-"+editionLocal &&
      l.existing_canonical_id===canonical &&
      l.existing_x12_id==="X12-IDENTITY-"+canonical &&
      l.identity_status==="provisional_explicit_source_name_or_alias" &&
      l.source_id===G && l.independent_identity_review_complete===false &&
      identityMap.get(canonical)?.id===l.existing_x12_id &&
      xw.get(l.source_local_id)?.canonical_id===canonical &&
      xw.get(l.source_local_id)?.legal_identity_certified===false &&
      o?.source_original_sha256===GOVSHA && o?.directory_nesting_only===true &&
      o?.mission_text_is_legal_authority===false,"identity/custody false promotion "+tag);
  }
  const funcIDs=new Set();
  for(const [tag,canonical,local] of [["HHS",H,"117"],["DHS",D,"118"]]){
    const source=obs.get("INC15D-OBS-"+local);
    for(const [slug,excerpt] of MISSIONS[tag]){
      const id="INC16A-FUNC-"+tag+"-"+slug;
      const x=m.functions.find(f=>f.id===id);
      check(x && !funcIDs.has(id) && x.institution_id===canonical &&
        x.source_observation_id===source.id && x.source_id===G &&
        x.source_excerpt===excerpt &&
        source.mission_statement_as_published.includes(excerpt) &&
        x.claim_type==="publisher_mission_mentions_function" &&
        x.verified_execution===false && x.assigned_office_id===null &&
        x.exclusive_mandate_asserted===false &&
        x.legal_delegation_inferred===false &&
        x.public_outcome_evidenced===false,"mission excerpt or unsupported responsibility: "+id);
      funcIDs.add(id);
    }
  }
  check(funcIDs.size===m.functions.length,"unknown mission additions");
  const registry=new Map(m.relationship_type_registry.map(t=>[t.type,t]));
  for(const type of ["statutory_conditional_disclosure_to","statutory_interagency_agreement_collaboration"]){
    const t=registry.get(type);
    check(t && t.atlas_category_candidate==="context" &&
      t.implies_command===false && t.implies_actual_operation===false &&
      t.qualified_as.startsWith("reported_codified_"),"relationship type promotion: "+type);
  }
  for(const [id,from,to,src,locator,type,condition,direction,excerpt] of FACTS){
    const edge=m.interfaces.find(x=>x.id===id);
    check(edge && edge.from_id===from && edge.to_id===to &&
      edge.source_id===src && edge.official_locator===locator &&
      edge.relationship_type===type && edge.condition===condition &&
      edge.claimed_direction===direction && edge.source_excerpt===excerpt &&
      edge.interpretation_limit.length>=70 &&
      edge.actual_notice_verified===false && edge.signed_agreement_verified===false &&
      edge.operational_control_transfer_verified===false &&
      edge.legal_review_complete===false && edge.public_graph_admitted===false,
      "statutory direction/condition or observed execution falsely promoted: "+id);
  }
  const b=m.authority_boundaries.find(x=>x.id==="INC16A-BOUNDARY-DOD-MILITARY-COMMAND");
  check(b && b.source_id===S42 && b.existing_institution_id===DEF &&
    b.official_locator==="42 U.S.C. 300hh(b) exception" &&
    b.source_excerpt==="remain under the command and control of the Secretary of Defense" &&
    b.boundary_kind==="military_command_retained_by_defense" &&
    b.hhs_command_over_defense_assets_inferred===false &&
    b.legally_certified_operational_event===false,"military command exception");
  check(m.authority_boundaries.every(x=>x.hhs_command_over_defense_assets_inferred===false &&
    x.legally_certified_operational_event===false),"command/operation inflation");
  for(const v of m.viewpoints){
    check(v.id.startsWith("VIEW-INC16A-") && v.atlas_admitted===false &&
      v.root_ids.every(x=>x===H||x===D) &&
      v.included_edge_types.every(t=>t==="publisher_mission_mentions_function"||registry.has(t)),
      "unsupported viewpoint or publication");
  }
  // Closed schema cannot be co-modified to excuse a new model field/claim.
  check(schema.$schema==="https://json-schema.org/draft/2020-12/schema" &&
    schema.additionalProperties===false &&
    JSON.stringify(Object.keys(schema.properties).sort())===
      JSON.stringify(FILE_FIELDS.root.slice().sort()),"schema root co-forgery");
  for(const family of families){
    const s=schema.$defs?.[family];
    check(s?.additionalProperties===false &&
      JSON.stringify(Object.keys(s.properties).sort())===
      JSON.stringify(FILE_FIELDS[family].slice().sort()),"schema family co-forgery: "+family);
  }
  for(const [family,field] of [
    ["interfaces","signed_agreement_verified"],["interfaces","actual_notice_verified"],
    ["interfaces","operational_control_transfer_verified"],["interfaces","public_graph_admitted"],
    ["canonical_links","independent_identity_review_complete"],
    ["functions","legal_delegation_inferred"],
    ["authority_boundaries","hhs_command_over_defense_assets_inferred"],
    ["viewpoints","atlas_admitted"]]){
    check(schema.$defs[family].properties[field].const===false,
      "schema removes false-claim guard: "+family+"."+field);
  }
  return {
    govman_original_sha256:GOVSHA,canonical_department_roots:2,
    official_code_section_sources:2,official_code_originals_retained:2,
    source_reported_mission_functions:9,directed_conditional_statutory_claims:3,
    qualified_current_executed_interagency_agreements:0,
    qualified_current_operational_communications:0,public_atlas_edges_admitted:0,
    current_legal_first_level_denominator:null,independent_legal_review_complete:false
  };
}
