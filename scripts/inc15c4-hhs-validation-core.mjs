// INC-15C.4 HHS dual publisher editions: overlap is not certified legal identity.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const BASE="model/federal/";
const PATH=BASE+"inc15c4-hhs-dual-edition-crosswalk.json";
const HHS=BASE+"inc15c3-hhs-directory-reconciliation.json";
const GOV=BASE+"inc15d-govman-2025-directory.json";
const BLOB_HHS="37d06d6341a560a0689654819816e1396624b890";
const BLOB_GOV="ec626f20bb3a7be2fffd12d8af4c305d52c61b5e";
const RAW_GOV_SHA="c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138";
export const MAPPING=Object.freeze([["310","ACF"],["309","ACL"],["311","AHRQ"],
 ["312","ATSDR"],["313","CDC"],["314","CMS"],["315","FDA"],["316","HRSA"],
 ["317","IHS"],["318","NIH"],["320","SAMHSA"]]);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sha=raw=>{const b=Buffer.from(raw);return createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const closed=(obj,fields)=>obj&&typeof obj==="object"&&!Array.isArray(obj)&&
 eq(Object.keys(obj).sort(),[...fields].sort());
const fail=message=>{throw Error("INC-15C.4 source overlap rejected: "+message);};
const ensure=(condition,message)=>{if(!condition)fail(message);};
const ROOT_FIELDS=["model_version","model_family","hhs_department_canonical_id",
"hhs_index_model_path","hhs_index_source_blob_sha1",
"hhs_index_original_official_html_sha256","hhs_index_official_html_original_archived",
"govman_directory_model_path","govman_directory_model_git_blob_sha1",
"govman_original_sha256","govman_publication_edition",
"source_overlap_is_historical_cross_edition_not_current_roster",
"hhs_index_linked_names","govman_hhs_subentries",
"explicitly_source_paired_candidates","hhs_index_only_linked_names",
"govman_only_hhs_subentry_names","total_current_legal_first_level_denominator",
"independently_qualified_same_legal_identity_pairs","current_reporting_chain_certified_count",
"legally_delegated_power_certified_count","mission_cross_agency_relations_verified_count",
"independently_archived_hhs_html","items","hhs_index_only"];
const ITEM_FIELDS=["id","govman_source_entity_key","govman_publisher_name",
"govman_parent_source_key","hhs_index_source_link_id","hhs_index_abbreviation",
"hhs_index_publisher_name","original_arch04b_id","name_relation",
"source_research_kind","identity_reconciliation_state",
"current_office_reporting_verified","independent_same_legal_identity_review_complete",
"legal_delegation_or_command_verified","mission_cross_agency_relationship_verified",
"current_first_level_placement_certified"];
const ONLY_FIELDS=["hhs_index_source_link_id","hhs_index_abbreviation",
"hhs_index_publisher_name","disposition","prior_arch04b_id",
"independent_organizational_review_complete"];
export function loadINC15C4(){
 const rawH=read(HHS),rawG=read(GOV);
 return {model:JSON.parse(read(PATH)),hhs:JSON.parse(rawH),gov:JSON.parse(rawG),
  rawH,rawG,schema:JSON.parse(read("schemas/inc15c4-hhs-dual-edition-crosswalk.schema.json")),
  manifest:JSON.parse(read(BASE+"manifest.json")),
  custody:JSON.parse(read("evidence/govman-2025/receipts/repository-custody.json"))};
}
export function validateINC15C4(x){
 const {model:d,hhs:h,gov:g,rawH,rawG,schema:s,manifest:m,custody:c}=x||{};
 ensure(sha(rawH)===BLOB_HHS&&sha(rawG)===BLOB_GOV,
  "immutable publisher source-epoch Git blob mismatch");
 ensure(g?.source_package_id==="GOVMAN-2025-12-31"&&g.original_source_sha256===RAW_GOV_SHA&&
  c?.original_sha256===RAW_GOV_SHA&&c.git_blob_sha1==="195c46a67c87ae85f1dedd423250900f119a041a"&&
  c.independent_worm_custody_verified===false,
  "official original custody or edition changed");
 ensure(h?.items?.length===29&&h.original_official_html_sha256===null&&
  h.original_official_html_bytes_archived===false&&
  h.current_complete_department_first_level_denominator===null,
  "prior HHS publisher index changed or false HTML archival claim");
 ensure(closed(d,ROOT_FIELDS)&&d.model_version==="0.1.0"&&
  d.model_family==="inc15c4-hhs-2025-dual-publisher-source-overlap"&&
  d.hhs_department_canonical_id==="ORG-FED-EXE-DEP-HHS"&&
  d.hhs_index_model_path===HHS&&d.hhs_index_source_blob_sha1===BLOB_HHS&&
  d.hhs_index_original_official_html_sha256===null&&
  d.hhs_index_official_html_original_archived===false&&
  d.govman_directory_model_path===GOV&&
  d.govman_directory_model_git_blob_sha1===BLOB_GOV&&
  d.govman_original_sha256===RAW_GOV_SHA&&d.govman_publication_edition==="GOVMAN-2025-12-31"&&
  d.source_overlap_is_historical_cross_edition_not_current_roster===true&&
  d.hhs_index_linked_names===29&&d.govman_hhs_subentries===11&&
  d.explicitly_source_paired_candidates===11&&d.hhs_index_only_linked_names===18&&
  d.govman_only_hhs_subentry_names===0&&d.total_current_legal_first_level_denominator===null&&
  d.independently_qualified_same_legal_identity_pairs===0&&
  d.current_reporting_chain_certified_count===0&&d.legally_delegated_power_certified_count===0&&
  d.mission_cross_agency_relations_verified_count===0&&d.independently_archived_hhs_html===false,
  "legal, structural or source-epoch claim promoted");
 ensure(s?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  s.additionalProperties===false&&closed(s.properties,ROOT_FIELDS)&&
  eq([...s.required].sort(),[...ROOT_FIELDS].sort())&&
  s.properties.items.minItems===11&&s.properties.items.maxItems===11&&
  closed(s.properties.items.items.properties,ITEM_FIELDS)&&
  s.properties.items.items.additionalProperties===false&&
  s.properties.hhs_index_only.minItems===18&&
  s.properties.hhs_index_only.maxItems===18&&
  closed(s.properties.hhs_index_only.items.properties,ONLY_FIELDS),
  "closed schema could authorize unreviewed fields");
 ensure(Array.isArray(d.items)&&d.items.length===11&&
  Array.isArray(d.hhs_index_only)&&d.hhs_index_only.length===18&&
  new Set(d.items.map(v=>v.id)).size===11&&
  new Set(d.hhs_index_only.map(v=>v.hhs_index_abbreviation)).size===18,
  "bounded publisher source partitions incomplete/duplicated");
 const byH=new Map(h.items.map(z=>[z.source_abbreviation,z]));
 const byG=new Map(g.items.filter(z=>z.published_parent_key==="GOVMAN-2025-12-31:117")
 .map(z=>[z.source_entity_local_id,z]));
 ensure(byG.size===11,"whole-edition HHS source cohort changed");
 for(let i=0;i<MAPPING.length;i++){
  const [xml,abbr]=MAPPING[i],rec=d.items[i],old=byH.get(abbr),newer=byG.get(xml);
  ensure(old&&newer&&closed(rec,ITEM_FIELDS)&&
   rec.id==="INC15C4-HHS-PAIR-"+abbr&&
   rec.govman_source_entity_key===newer.source_entity_key&&
   rec.govman_publisher_name===newer.published_name&&
   rec.govman_parent_source_key==="GOVMAN-2025-12-31:117"&&
   rec.hhs_index_source_link_id===old.id&&rec.hhs_index_abbreviation===abbr&&
   rec.hhs_index_publisher_name===old.source_name&&
   rec.original_arch04b_id===old.original_arch04b_id&&
   rec.source_research_kind===old.source_research_kind&&
   rec.name_relation===(old.source_name===newer.published_name?
      "exact_publisher_name":"publisher_spelling_variant_requires_review")&&
   rec.identity_reconciliation_state==="candidate_same_described_body_two_dated_publisher_sources"&&
   rec.current_office_reporting_verified===false&&
   rec.independent_same_legal_identity_review_complete===false&&
   rec.legal_delegation_or_command_verified===false&&
   rec.mission_cross_agency_relationship_verified===false&&
   rec.current_first_level_placement_certified===false,
   "unbacked HHS pair, false legal identity or inferred reporting");
 }
 ensure(d.items.filter(z=>z.name_relation==="publisher_spelling_variant_requires_review").map(z=>z.id).join()===
  "INC15C4-HHS-PAIR-CMS","CMS source spelling difference obscured");
 const used=new Set(MAPPING.map(v=>v[1])),excluded=h.items.filter(z=>!used.has(z.source_abbreviation));
 ensure(excluded.length===18,"HHS publisher residual record count changed");
 for(let i=0;i<excluded.length;i++){
  const o=excluded[i],rec=d.hhs_index_only[i];
  ensure(closed(rec,ONLY_FIELDS)&&rec.hhs_index_source_link_id===o.id&&
   rec.hhs_index_abbreviation===o.source_abbreviation&&rec.hhs_index_publisher_name===o.source_name&&
   rec.prior_arch04b_id===o.original_arch04b_id&&
   rec.disposition==="index_only_unresolved_in_govman_not_absence_proof"&&
   rec.independent_organizational_review_complete===false,
   "HHS publisher residual misclassified as absent or qualified");
 }
 const ext=m?.federal_institutional_breadth_15c4_extension;
 ensure(m.models?.includes(PATH)&&ext?.id==="ARFI-FED-INC15C4-HHS-SOURCE-OVERLAP"&&
  ext.govman_2025_hhs_linked_names===11&&ext.hhs_index_linked_names===29&&
  ext.cross_publisher_identity_certified===false&&
  ext.independent_html_custody_complete===false&&
  ext.current_first_level_denominator===null&&
  ext.authority_certified===false,"manifest invented current HHS certified institution");
 return {source:"2025 Govt Manual HHS vs HHS web index",
  govmanSourceHhsSubentries:11,hhsIndexLinkedNames:29,candidateNamePairs:11,
  indexOnlyEntries:18,spellingVariants:1,legalIdentityCertified:0,
  legalFirstLevelDenominator:null,hhsOriginalHtmlIndependentlyArchived:false};
}
