// ARFI INC-15C.3 HHS publisher index research: source presence != legal authority.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
export const SOURCE_PIN="2288a20a4a7ff65b0163775c776bfeb3bf34fd74";
const PATH="model/federal/inc15c3-hhs-directory-reconciliation.json";
const PREFIX="model/federal/";
const FAMILY="inc15c3-hhs-directory-reconciliation";
const SOURCE_BLOBS=Object.freeze({
  "model/federal/archive04b/hhs-source-entries.json": "ae6b4eeb6962f4bf3ee3fc439e1f07c0ba2ecbfd",
  "model/federal/archive04b/sources.json": "99cd910191e59f07f8271bc15b680e39aa4311ef",
  "model/federal/archive04b/observed-capture-receipts.json": "39d832e06281ee12b76425b37d9b829fdceff581",
  "model/federal/archive04b/govman-xml-root-metadata.json": "aa5e44d8536ebe6d71fd8519000ccc2746f01eb3",
  "model/federal/inc15b-cabinet-sources.json": "90558c7913255da8ea786e8e6ffb81e7739eb500",
  "model/federal/inc15-cabinet-crosswalks.json": "c6896b9204b53172dde46ef947de9a84c7013011"
});
const ROOT_FIELDS=Object.freeze(["model_version","model_family","source_baseline_commit","department_id","original_directory_source_id","official_publisher_url","page_last_reviewed_as_reported","source_text_retrieved_as_of","original_official_html_sha256","original_official_html_bytes_archived","source_evidence_level","govman_2025_official_source_id","govman_2025_root_granule_id","govman_granule_is_separate_source_population","original_historical_named_research_entries","newly_observed_publisher_linked_names","bounded_publisher_index_linked_name_records","individually_noncounted_page_headings_and_leadership","current_complete_department_first_level_denominator","independent_original_bytes_qualified","independent_legal_review_complete","adl1_certified_count","current_reporting_chain_certified_count","mission_cross_agency_relations_verified_count","items","ancillary_publisher_features"]);
const ITEM_FIELDS=Object.freeze(["id","published_position","source_name","source_abbreviation","original_arch04b_id","original_arch04b_position","previously_modeled","source_research_kind","source_original_model","original_html_id","legally_qualified_unit_id","published_heading_not_legal_parent","current_first_level_placement_verified","operational_reporting_verified","officeholder_appointment_verified","mission_assignment_verified","other_agency_dependency_verified","legally_delegated_authority_verified","independent_legal_review_complete","adl1_certified"]);
const FEATURE_FIELDS=Object.freeze(["id","publisher_text","research_classification","previous_arch04b_id","counted_as_directory_link","legally_qualified_organizational_id","officeholder_name_verified","structural_parent_verified"]);
const SECONDARY=Object.freeze([
 ["OS","Office of the Secretary (OS)","publisher_section_description_not_individually_resolved_office"],
 ["DIV","Divisions","publisher_section_header_not_org_identity"],
 ["SEC","Secretary","leadership_position_title_not_organization"],
 ["DSEC","Deputy Secretary","leadership_position_title_not_organization"],
 ["COS","Chief of Staff","leadership_position_title_not_organization"]
]);
const fail=msg=>{throw Error("INC-15C.3 HHS source rejected: "+msg)};
const ensure=(value,msg)=>{if(!value)fail(msg)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const keys=(obj,arr)=>obj!==null&&typeof obj==="object"&&!Array.isArray(obj)&&
 same(Object.keys(obj).sort(),[...arr].sort());
const one=a=>new Set(a).size===a.length;
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const gitSha=raw=>{
 const b=Buffer.from(raw,"utf8");
 return createHash("sha1").update("blob "+b.length+String.fromCharCode(0),"utf8")
  .update(b).digest("hex");
};
export function loadINC15C3(){
 const sourceBytes=Object.fromEntries(Object.keys(SOURCE_BLOBS).map(p=>[p,read(p)]));
 return {manifest:JSON.parse(read(PREFIX+"manifest.json")),
  model:JSON.parse(read(PATH)),
  schema:JSON.parse(read("schemas/inc15c3-hhs-directory-reconciliation.schema.json")),
  sourceBytes,originals:Object.fromEntries(Object.entries(sourceBytes).map(([p,s])=>[p,JSON.parse(s)]))};
}
export function validateINC15C3(d){
 const {manifest,model,schema,sourceBytes,originals}=d||{};
 ensure(Array.isArray(manifest?.models)&&manifest.models.length>=279&&
  one(manifest.models)&&manifest.models.filter(p=>p===PATH).length===1&&
  manifest.model_standard==="ARFI-COA"&&manifest.release_status==="research_baseline_unratified",
  "undeclared source family or ratification promotion");
 const ext=manifest.federal_institutional_breadth_15c3_extension;
 const fixedExt={id:"ARFI-FED-INC15C3-HHS-INDEX",source_baseline_commit:SOURCE_PIN,
  prior_historical_directory_links:28,newly_observed_publisher_index_links:1,
  bounded_publisher_index_link_records:29,publisher_html_original_bytes_verified:false,
  current_legal_first_level_department_denominator:null,independent_legal_review_complete:false,
  adl1_certified_count:0};
 ensure(keys(ext,Object.keys(fixedExt))&&Object.entries(fixedExt).every(([k,v])=>same(ext[k],v)),
  "manifest original-custody or legal qualification promoted");
 ensure(model?.model_version==="0.1.0"&&model.model_family===FAMILY&&
  keys(model,ROOT_FIELDS)&&
  schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  schema.type==="object"&&schema.additionalProperties===false&&
  keys(schema.properties,ROOT_FIELDS)&&
  same(schema.required?.slice().sort(),ROOT_FIELDS.slice().sort())&&
  keys(schema.properties.items.items?.properties,ITEM_FIELDS)&&
  keys(schema.properties.ancillary_publisher_features.items?.properties,FEATURE_FIELDS)&&
  schema.properties.items.maxItems===29&&schema.properties.items.minItems===29&&
  schema.properties.ancillary_publisher_features.maxItems===5&&
  schema.properties.ancillary_publisher_features.minItems===5,
  "source model/schema shape or cohort size inflated");
 ensure(keys(sourceBytes,Object.keys(SOURCE_BLOBS))&&
  keys(originals,Object.keys(SOURCE_BLOBS)),
  "unexpected original Git source file");
 for(const [file,sha]of Object.entries(SOURCE_BLOBS)){
  const raw=sourceBytes[file];
  ensure(typeof raw==="string"&&gitSha(raw)===sha&&
   same(JSON.parse(raw),originals[file]),"immutable source Git tree digest mismatch "+file);
 }
 const get=p=>originals[PREFIX+p]?.items;
 const previous=get("archive04b/hhs-source-entries.json");
 const source=get("archive04b/sources.json").find(x=>x.id==="ARCH04B-HHS-HTML");
 const xml=get("archive04b/sources.json").find(x=>x.id==="ARCH04B-GOVMAN-HHS-XML");
 const receipts=get("archive04b/observed-capture-receipts.json");
 const meta=get("archive04b/govman-xml-root-metadata.json").find(x=>x.id==="ARCH04B-XML-ROOT-HHS");
 const cab=get("inc15b-cabinet-sources.json").find(x=>x.canonical_department_id==="ORG-FED-EXE-DEP-HHS");
 const cabinetLink=get("inc15-cabinet-crosswalks.json").find(x=>x.canonical_institution_id==="ORG-FED-EXE-DEP-HHS");
 const receipt=receipts.find(x=>x.source_id===source?.id);
 const xmlReceipt=receipts.find(x=>x.source_id===xml?.id);
 ensure(previous?.length===28&&one(previous.map(x=>x.id))&&
  previous.every((x,i)=>x.display_order===i+1&&x.department_id==="ORG-FED-EXE-DEP-HHS"&&
   x.source_id==="ARCH04B-HHS-HTML"&&x.parent_census_adl1_certified===false)&&
  source?.url==="https://www.hhs.gov/about/organization/org-chart/index.html"&&
  source.edition==="site_content_reviewed_2025-08-21"&&
  source.archived_sha256===null&&source.bytes_embedded_in_repository===false&&
  receipt?.decoded_entity_sha256===null&&receipt.receipt_status==="blocked_official_HTTP_403"&&
  receipt.is_permanent_archive===false&&
  xml?.url==="https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-117.xml"&&
  xmlReceipt?.decoded_entity_sha256==="b8a29d3c43757061a74f86712738b6ddc04c4f3b4420e37d79cd9bf0d2c24ad9"&&
  xmlReceipt.is_permanent_archive===false&&meta?.source_id===xml.id&&
  meta.agency_constituent_institutions_evidenced_by_this_XML_granule===false&&
  meta.complete_first_level_department_denominator_verified===false&&
  cab?.publisher_source_id===null&&cab.source_scoped_record_count===null&&
  cab.complete_current_first_level_denominator===null&&
  cabinetLink?.adl1_certified===false,
  "prior HHS source, temporary XML or unknown whole-department denominator drift");
 const fixed={model_version:"0.1.0",model_family:FAMILY,source_baseline_commit:SOURCE_PIN,
  department_id:"ORG-FED-EXE-DEP-HHS",original_directory_source_id:"ARCH04B-HHS-HTML",
  official_publisher_url:source.url,page_last_reviewed_as_reported:"2025-08-21",
  source_text_retrieved_as_of:"2026-10-21",original_official_html_sha256:null,
  original_official_html_bytes_archived:false,
  source_evidence_level:"official_publisher_visible_index_text_only_no_retained_raw_html",
  govman_2025_official_source_id:xml.id,
  govman_2025_root_granule_id:"GOVMAN-2025-12-31-117",
  govman_granule_is_separate_source_population:true,
  original_historical_named_research_entries:28,newly_observed_publisher_linked_names:1,
  bounded_publisher_index_linked_name_records:29,
  individually_noncounted_page_headings_and_leadership:5,
  current_complete_department_first_level_denominator:null,
  independent_original_bytes_qualified:false,
  independent_legal_review_complete:false,adl1_certified_count:0,
  current_reporting_chain_certified_count:0,mission_cross_agency_relations_verified_count:0};
 ensure(Object.entries(fixed).every(([k,v])=>same(model[k],v)),
  "current/office/mission authority or source original custody promoted");
 ensure(Array.isArray(model.items)&&model.items.length===29&&
  one(model.items.map(x=>x.id))&&
  model.items.every((x,i)=>keys(x,ITEM_FIELDS)&&x.published_position===i+1),
  "missing, additional, duplicate or misplaced publisher linked name");
 const researchStatuses=["operating_division_candidate","departmental_staff_office_candidate",
   "administrative_adjudication_requires_statutory_review",
   "independent_inspector_general_statutory_review"];
 ensure(previous.every(x=>researchStatuses.includes(x.provisional_kind)),"new unsupported role type");
 const oldById=new Map(previous.map(x=>[x.id,x]));
 for(const rec of model.items){
  let prior=rec.original_arch04b_id===null?null:oldById.get(rec.original_arch04b_id);
  ensure(rec.source_original_model===PREFIX+"archive04b/hhs-source-entries.json"&&
   rec.original_html_id===source.id&&
   rec.legally_qualified_unit_id===null&&
   rec.published_heading_not_legal_parent==="Office of the Secretary and HHS Divisions"&&
   rec.current_first_level_placement_verified===false&&
   rec.operational_reporting_verified===false&&
   rec.officeholder_appointment_verified===false&&
   rec.mission_assignment_verified===false&&
   rec.other_agency_dependency_verified===false&&
   rec.legally_delegated_authority_verified===false&&
   rec.independent_legal_review_complete===false&&rec.adl1_certified===false,
   "source linked name promoted to unsupported mission, command, identity or ADL-1");
  if(rec.original_arch04b_id===null){
   ensure(rec.id==="INC15C3-HHS-LINK-ARPA-H"&&
    rec.source_name==="Advanced Research Projects Agency for Health"&&
    rec.source_abbreviation==="ARPA-H"&&rec.published_position===9&&
    rec.original_arch04b_position===null&&rec.previously_modeled===false&&
    rec.source_research_kind==="publisher_linked_entry_unclassified",
    "unverified new office insertion or ARPA-H placement");
  }else{
   ensure(prior&&rec.id==="INC15C3-HHS-LINK-"+prior.code&&
    rec.source_name===prior.name&&rec.source_abbreviation===prior.code&&
    rec.original_arch04b_position===prior.display_order&&
    rec.published_position===prior.display_order+(prior.display_order>=9?1:0)&&
    rec.previously_modeled===true&&rec.source_research_kind===prior.provisional_kind,
    "prior 28 HHS source identities or order altered");
  }
 }
 ensure(model.items.filter(x=>x.original_arch04b_id!==null).length===28&&
  model.items.filter(x=>x.original_arch04b_id===null).length===1&&
  model.items.filter(x=>x.source_research_kind==="independent_inspector_general_statutory_review")
    .map(x=>x.source_abbreviation).join(",")==="OIG"&&
  same(model.items.filter(x=>x.source_research_kind==="administrative_adjudication_requires_statutory_review")
    .map(x=>x.source_abbreviation).sort(),["DAB","OMHA"]),
   "independent IG, adjudicative offices or historical cohort lost");
 ensure(Array.isArray(model.ancillary_publisher_features)&&
  model.ancillary_publisher_features.length===SECONDARY.length&&
  model.ancillary_publisher_features.every((row,i)=>
   keys(row,FEATURE_FIELDS)&&
   row.id==="INC15C3-HHS-FEATURE-"+SECONDARY[i][0]&&
   row.publisher_text===SECONDARY[i][1]&&
   row.research_classification===SECONDARY[i][2]&&
   row.previous_arch04b_id===null&&row.counted_as_directory_link===false&&
   row.legally_qualified_organizational_id===null&&
   row.officeholder_name_verified===false&&row.structural_parent_verified===false),
  "leadership labels or page headings promoted into agencies");
 return Object.freeze({sourcePin:SOURCE_PIN,
   boundedPublisherIndexNames:29,reusedHistoricalNames:28,newlyObservedName:"ARPA-H",
   separatePublisherHeadingsAndLeadership:5,
   retainedOriginalHtml:false,govmanOriginalPermanentArchive:false,
   legallyCertifiedFirstLevelInstitutions:0,verifiedCrossGovernmentMissionEdges:0,
   currentFirstLevelDenominator:null,description:"publisher index names and provisional research roles only"});
}
