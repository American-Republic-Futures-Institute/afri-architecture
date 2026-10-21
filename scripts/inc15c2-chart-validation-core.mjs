// INC-15C.2: source edition chart boxes, not operational authority or current census.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {loadINC15C1,validateINC15C1} from "./inc15c1-validation-core.mjs";

const PATH="model/federal/inc15c2-dhs-chart-boxes.json";
export const ORIGINAL_SHA256="d48f661bf9d6643409585451a2dc49f53358fe869dd40d182344f0bed58e4175";
export const ORIGINAL_GIT_BLOB_SHA="bdbcbc4a6045eebef852daeceeb154be15c48684";
export const ORIGINAL_BYTES=17622005;
export const ORIGINAL_PATH="evidence/dhs-fy2024/originals/sha256/"+ORIGINAL_SHA256+".pdf";
const RECEIPT="evidence/dhs-fy2024/receipts/inc15c2-git-retention.json";
const TRANSIENT="evidence/dhs-fy2024/receipts/inc15c2-official-source-capture.json";
const OFFICIAL_URL="https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf";
const SOURCE="CENSUS-SRC-DHS-CHART-2025";
const SNAP="CENSUS-SNAPSHOT-DHS-CHART-2025";
const G="office_secretary_executive",B="operational_component",P="support_and_oversight";
const expected=[
["Executive Secretary",G,510.52,196.82,null],
["Secretary / Deputy Secretary",G,245.14,209.57,null],
["Chief of Staff",G,393.57,223.80,null],
["Military Advisor",G,510.52,223.80,null],
["Counterterrorism Coordinator",G,510.52,250.80,null],
["Office for Civil Rights and Civil Liberties",G,18,304.77,null],
["Office of the General Counsel",G,116.20,304.77,null],
["Office of Legislative Affairs",G,215.16,304.77,null],
["Office of Partnership and Engagement",G,313.36,304.77,null],
["Privacy Office",G,411.57,304.77,null],
["Office of Public Affairs",G,510.52,304.77,null],
["Office of Strategy, Policy, and Plans",G,18,372.23,null],
["Office for State and Local Law Enforcement",G,116.20,372.23,null],
["Federal Law Enforcement Training Centers",P,215.16,372.23,"FLETC"],
["Science and Technology Directorate",P,313.36,372.23,null],
["Countering Weapons of Mass Destruction Office",P,411.57,372.23,null],
["Office of Intelligence and Analysis",P,510.52,372.23,null],
["Office of Inspector General",P,510.52,439.70,"OIG"],
["Management Directorate",P,18,440.45,null],
["Office of Homeland Security Situational Awareness",P,116.20,440.45,null],
["Office of Health Security",P,215.16,440.45,null],
["Office of the Immigration Detention Ombudsman",P,313.36,440.45,null],
["Office of the Citizenship and Immigration Services Ombudsman",P,411.57,440.45,null],
["Chief Financial Officer",P,18,491.42,null],
["U.S. Customs and Border Protection",B,116.20,511.66,"CBP"],
["Cybersecurity and Infrastructure Security Agency",B,215.16,511.66,"CISA"],
["Federal Emergency Management Agency",B,313.36,511.66,"FEMA"],
["U.S. Immigration and Customs Enforcement",B,411.57,511.66,"ICE"],
["Chief Information Officer",P,18,529.65,null],
["Federal Protective Service",P,18,567.14,null],
["Transportation Security Administration",B,116.20,579.87,"TSA"],
["U.S. Coast Guard",B,215.16,579.87,"USCG"],
["U.S. Citizenship and Immigration Services",B,313.36,579.87,"USCIS"],
["U.S. Secret Service",B,411.57,579.87,"USSS"]
];
const ROOT_FIELDS=Object.freeze(["model_version","model_family","source_id","source_snapshot_id","source_publisher","source_report_title","source_claimed_publication_date","captured_official_url","source_retrieved_at_utc","source_original_git_path","source_original_sha256","source_original_git_blob_sha","source_original_bytes","pdf_metadata_creation_utc","pdf_metadata_modified_utc","source_figure","printed_page_number","physical_pdf_page_number","chart_scope_statement","figure_box_count","legend_box_count_excluded","office_secretary_executive_boxes","operational_component_boxes","support_and_oversight_boxes","prior_research_candidate_boxes_reconciled","previously_unmodeled_chart_boxes","complete_source_figure_box_enumeration_reviewed","complete_current_DHS_institutional_census","current_DHS_first_level_denominator","independent_WORM_custody_verified","independent_legal_review_complete","adl1_certified_count","no_new_current_canonical_institution_ids","items"]);
const BOX_FIELDS=Object.freeze(["id","type","figure_order","chart_label","chart_legend_class","printed_page","physical_pdf_page","box_top_left_x_pt","box_top_left_y_pt","contains_multiple_office_titles","source_footnote_marker","prior_inc15c1_candidate_id","prior_inc12_observation_id","prior_descriptive_relation_id","source_only_unratified_candidate","independent_oversight_exception","conditional_coast_guard_military_placement","source_descriptive_chart_placement_only","current_authority_verified","operational_command_verified","statutory_delegation_verified","independent_legal_review_complete","adl1_certified"]);
const GIT_RECEIPT_FIELDS=Object.freeze(["id","publisher_url","source_edition","claimed_published_on","captured_at_utc","original_pdf_sha256","original_pdf_byte_count","original_pdf_git_blob_sha","original_repository_path","storage_tier","independent_WORM_custody_verified","source_page_24_independently_reviewed","current_first_level_DHS_denominator","legal_review_complete","adl1_certified_count"]);
const TRANSIENT_RECEIPT_FIELDS=Object.freeze(["id","source_id","source_edition","original_published_on","attempted_at_utc","allowlisted_urls","attempts","status","acquired_url","original_sha256","original_byte_count","artifact_relative_path","storage_tier","independent_durable_custody_verified","original_pdf_page_24_inspected","full_chart_population_reconciled","original_census_candidates_unchanged","current_dhs_first_level_denominator","independent_legal_review_complete","adl1_certified_count"]);
const error=message=>{throw new Error("INC-15C.2 chart rejected: "+message);};
const check=(ok,message)=>{if(!ok)error(message);};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sameKeys=(a,b)=>a&&typeof a==="object"&&!Array.isArray(a)&&
 eq(Object.keys(a).sort(),[...b].sort());
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
function validateShape(schema,object){
 check(schema&&schema.type==="object"&&schema.additionalProperties===false&&
  sameKeys(schema.properties,schema.required)&&sameKeys(object,schema.required),
  "unclosed JSON Schema");
 for(const [k,r] of Object.entries(schema.properties)){
  const value=object[k];
  if(Object.prototype.hasOwnProperty.call(r,"const"))
   check(eq(value,r.const),"constant source metadata changed "+k);
  if(r.type==="array"){
   check(Array.isArray(value)&&value.length===r.minItems&&
     value.length===r.maxItems,"chart source population changed");
   for(const child of value)validateShape(r.items,child);
   continue;
  }
  const t=value===null?"null":Number.isInteger(value)?"integer":typeof value;
  if(r.type)check([r.type].flat().includes(t)||
    (r.type==="number"&&t==="integer"),"invalid data type "+k);
  if(r.minLength)check(typeof value==="string"&&value.length>=r.minLength,
   "empty source field "+k);
 }
}
export function loadINC15C2(){
 return{
  model:JSON.parse(read(PATH).toString("utf8")),
  schema:JSON.parse(read("schemas/inc15c2-dhs-chart-boxes.schema.json").toString("utf8")),
  manifest:JSON.parse(read("model/federal/manifest.json").toString("utf8")),
  sourceBytes:read(ORIGINAL_PATH),
  gitReceipt:JSON.parse(read(RECEIPT).toString("utf8")),
  transientReceipt:JSON.parse(read(TRANSIENT).toString("utf8")),
  previous:loadINC15C1()
 };
}
export function validateINC15C2(d){
 const {model,schema,manifest,sourceBytes,gitReceipt,transientReceipt,previous}=d;
 const ext=manifest?.federal_institutional_breadth_15c2_extension;
 const extContract={
  id:"ARFI-INC15C2-DHS-FY2024-PDF-CHART-BOXES",
  source_original_sha256:ORIGINAL_SHA256,
  source_original_git_blob_sha:ORIGINAL_GIT_BLOB_SHA,
  source_chart_box_count:34,existing_research_candidates_reconciled:10,
  unqualified_source_only_chart_boxes:24,current_DHS_first_level_denominator:null,
  independent_WORM_custody_verified:false,independent_legal_review_complete:false,
  adl1_certified_count:0,
  status:"original_dhs_publisher_pdf_git_preserved_source_chart_reconciled_research_unratified"
 };
 check(Array.isArray(manifest?.models)&&manifest.models.length>=278&&
  manifest.models.filter(x=>x===PATH).length===1&&
  sameKeys(ext,Object.keys(extContract))&&
  Object.entries(extContract).every(([k,v])=>eq(ext[k],v)),
  "manifest false legal/custody/first-level promotion or absent source model");
 check(Buffer.isBuffer(sourceBytes)&&sourceBytes.length===ORIGINAL_BYTES&&
  createHash("sha256").update(sourceBytes).digest("hex")===ORIGINAL_SHA256&&
  createHash("sha1").update("blob "+sourceBytes.length+"\0").update(sourceBytes).digest("hex")===ORIGINAL_GIT_BLOB_SHA&&
  sourceBytes.subarray(0,8).toString("ascii")==="%PDF-1.7"&&
  sourceBytes.subarray(-4096).toString("latin1").includes("%%EOF"),
  "original DHS PDF bytes/hash/Git blob not independently reproducible");
 check(gitReceipt?.id==="INC15C2-DHS-FY2024-GIT-SOURCE-EVIDENCE"&&
  gitReceipt.publisher_url===OFFICIAL_URL&&
  gitReceipt.original_pdf_sha256===ORIGINAL_SHA256&&
  gitReceipt.original_pdf_git_blob_sha===ORIGINAL_GIT_BLOB_SHA&&
  gitReceipt.original_pdf_byte_count===ORIGINAL_BYTES&&
  gitReceipt.original_repository_path===ORIGINAL_PATH&&
  gitReceipt.storage_tier==="git_versioned_source_original_no_independent_WORM_attestation"&&
  gitReceipt.independent_WORM_custody_verified===false&&
  gitReceipt.source_page_24_independently_reviewed===false&&
  gitReceipt.current_first_level_DHS_denominator===null&&
  gitReceipt.legal_review_complete===false&&
  gitReceipt.adl1_certified_count===0&&
  transientReceipt?.source_id===SOURCE&&
  transientReceipt.original_sha256===ORIGINAL_SHA256&&
  transientReceipt.original_byte_count===ORIGINAL_BYTES&&
  transientReceipt.acquired_url===OFFICIAL_URL&&
  transientReceipt.independent_durable_custody_verified===false&&
  transientReceipt.original_pdf_page_24_inspected===false&&
  transientReceipt.current_dhs_first_level_denominator===null,
  "publisher original Git receipt, research capture provenance or false WORM claim");
 check(sameKeys(model,ROOT_FIELDS)&&sameKeys(schema?.properties,ROOT_FIELDS)&&
  sameKeys(schema?.properties?.items?.items?.properties,BOX_FIELDS)&&
  sameKeys(gitReceipt,GIT_RECEIPT_FIELDS)&&sameKeys(transientReceipt,TRANSIENT_RECEIPT_FIELDS),
  "co-edited record, schema, receipt or unauthorized legal field");
 check(model?.model_family==="inc15c2-dhs-original-chart-boxes"&&
  model.model_version==="0.1.0"&&
  model.source_id===SOURCE&&model.source_snapshot_id===SNAP&&
  model.source_original_sha256===ORIGINAL_SHA256&&
  model.source_original_git_blob_sha===ORIGINAL_GIT_BLOB_SHA&&
  model.source_original_git_path===ORIGINAL_PATH&&
  model.source_original_bytes===ORIGINAL_BYTES&&
  model.captured_official_url===OFFICIAL_URL&&
  model.source_retrieved_at_utc===gitReceipt.captured_at_utc&&
  model.source_claimed_publication_date==="2025-01-17"&&
  model.pdf_metadata_creation_utc==="2025-01-16T13:57:53Z"&&
  model.pdf_metadata_modified_utc==="2025-02-04T13:53:52Z"&&
  model.printed_page_number===24&&model.physical_pdf_page_number===24&&
  model.source_figure==="Figure 1: DHS Organizational Chart"&&
  model.chart_scope_statement==="This chart shows how DHS, its Components, and a majority of our key offices are organized."&&
  model.legend_box_count_excluded===3&&
  model.figure_box_count===34&&model.office_secretary_executive_boxes===13&&
  model.operational_component_boxes===8&&model.support_and_oversight_boxes===13&&
  model.prior_research_candidate_boxes_reconciled===10&&
  model.previously_unmodeled_chart_boxes===24&&
  model.complete_source_figure_box_enumeration_reviewed===true&&
  model.complete_current_DHS_institutional_census===false&&
  model.current_DHS_first_level_denominator===null&&
  model.independent_WORM_custody_verified===false&&
  model.independent_legal_review_complete===false&&
  model.adl1_certified_count===0&&model.no_new_current_canonical_institution_ids===true,
  "historical diagram page, source integrity, counts or non-legal scope changed");
 check(schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
   schema.properties?.items?.type==="array"&&
   schema.properties.items.minItems===34&&schema.properties.items.maxItems===34,
   "closed original chart schema missing");
 validateShape(schema,model);
 check(Array.isArray(model.items)&&model.items.length===34&&expected.length===34,
  "source chart box count changed");
 const prior=previous?.model?.items;
 check(Array.isArray(prior)&&prior.length===10,"INC15C1 source crosswalk lost");
 const seenIds=new Set(),priorSeen=new Set();
 let byCat={ [G]:0,[P]:0,[B]:0 },unmatched=0;
 for(let i=0;i<expected.length;i++){
  const m=model.items[i],e=expected[i],suffix=e[4];
  check(typeof m.id==="string"&&!seenIds.has(m.id)&&
   m.figure_order===i+1&&
   m.type==="source_bounded_pdf_org_chart_box"&&
   m.id.startsWith("INC15C2-BOX-"+String(i+1).padStart(2,"0")+"-")&&
   m.chart_label===e[0]&&m.chart_legend_class===e[1]&&
   m.box_top_left_x_pt===e[2]&&m.box_top_left_y_pt===e[3]&&
   m.printed_page===24&&m.physical_pdf_page===24&&
   m.contains_multiple_office_titles===(i===1)&&
   m.source_footnote_marker===(suffix==="OIG"?"*":null)&&
   m.independent_oversight_exception===(suffix==="OIG")&&
   m.conditional_coast_guard_military_placement===(suffix==="USCG")&&
   m.source_descriptive_chart_placement_only===true&&
   m.current_authority_verified===false&&
   m.operational_command_verified===false&&
   m.statutory_delegation_verified===false&&
   m.independent_legal_review_complete===false&&m.adl1_certified===false,
   "chart page text, independent IG, USCG or claimed source authority changed at box "+(i+1));
  seenIds.add(m.id);byCat[m.chart_legend_class]++;
  if(suffix){
   const id="CENSUS-COMP-DHS-"+suffix;
   const old=prior.find(x=>x.source_candidate_id===id);
   check(old&&old.display_name===m.chart_label&&
    m.prior_inc15c1_candidate_id===id&&
    m.prior_inc12_observation_id===old.inc12_observation_id&&
    m.prior_descriptive_relation_id===old.original_relationship_id&&
    m.source_only_unratified_candidate===false&&!priorSeen.has(id),
    "original DHS/X12/relationship identity mismatch "+id);
   priorSeen.add(id);
  }else{
   check(m.prior_inc15c1_candidate_id===null&&
    m.prior_inc12_observation_id===null&&
    m.prior_descriptive_relation_id===null&&
    m.source_only_unratified_candidate===true,
    "new chart office falsely promoted to canonical institutional identity");
   unmatched++;
  }
 }
 check(eq(byCat,{[G]:13,[P]:13,[B]:8})&&priorSeen.size===10&&unmatched===24,
  "legend class, prior census crosswalk or chart residual count drift");
 // Strong predecessor validation guarantees edition snapshots and all six prior Git source originals.
 check(validateINC15C1(previous).adl1Certified===0,
  "predecessor source provenance or ADL-1 boundary compromised");
 return {source_original_sha256:ORIGINAL_SHA256,source_github_blob:ORIGINAL_GIT_BLOB_SHA,
  evidence_pdf_bytes:ORIGINAL_BYTES,chart_figure_boxes:34,
  source_boxes_by_legend:{executive:13,operational:8,support_and_oversight:13},
  old_source_candidates_matched:10,new_source_only_boxes:24,
  current_DHS_first_level_denominator:null,independent_WORM_custody_verified:false,
  independent_legal_review_complete:false,adl1_certified_count:0};
}