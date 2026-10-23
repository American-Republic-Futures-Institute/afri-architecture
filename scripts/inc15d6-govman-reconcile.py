#!/usr/bin/env python3
"""INC-15D.6: source-exact Commerce / Education publisher-entry reconciliation.

Rooted in the retained December 2025 Government Manual XML. This describes
publisher records and bounded earlier research correspondence, not signed law,
a federal institutional identity, present-day legal status, department command,
charter, fiscal control, agency membership, or citizen-service outcomes.
"""
from __future__ import annotations
import argparse
from collections import Counter
import importlib.util
import json
from pathlib import Path
import re
import sys

REPO=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15d5_prior",REPO/"scripts/inc15d5-govman-reconcile.py")
prior=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)
govman=prior.govman
PACKAGE=govman.PACKAGE
SHA=govman.SHA
BLOB=govman.BLOB
ORIGINAL=govman.ORIGINAL
CURATION="model/federal/inc15d6-govman-2025-curation.json"
DISPOSITIONS="model/federal/inc15d6-govman-2025-dispositions.json"
COVERAGE="model/federal/inc15d6-govman-2025-coverage.json"
MANIFEST="model/federal/manifest.json"
DEPARTMENTS="model/federal/executive-departments.json"
IDENTITIES="model/federal/x12-identities.json"
SEEDS="model/federal/expansion/department-seeds.json"
GRANULES="model/federal/department-structure/candidate-granules.json"
UNITS="model/federal/department-structure/units.json"
COMMERCE_SOURCE="model/federal/department-structure/source-registry.json"
COMMERCE_SNAPSHOTS="model/federal/department-structure/source-snapshots.json"
ED_CHART="model/federal/inc15c5-education-fy2024-chart-boxes.json"
COMMERCE="ORG-FED-EXE-DEP-COMMERCE"
EDUCATION="ORG-FED-EXE-DEP-EDUCATION"
COMMERCE_ROOT=PACKAGE+":113"
EDUCATION_ROOT=PACKAGE+":115"
EDUCATION_HEADING=PACKAGE+":269"
COMMERCE_IDS=("259","260","261","262","263","264","265","266","267","268")
EDUCATION_IDS=("269","270","271","272","274")
ED_AFFILIATES=("270","271","272","274")
DISPOSITIONS_ALLOWED={
 "commerce":"source_only_institutional_candidate_pending_statutory_confirmation",
 "header":"noninstitutional_publisher_grouping_not_federal_agency",
 "affiliate":"publisher_affiliated_entry_legal_classification_unresolved",
}
RATIONALES={
 "commerce_seed":"Exact-source-title reference to a preexisting expansion seed and a dated Commerce model; neither is an independently established canonical identity or a legal power.",
 "commerce_web":"Exact-title reference in a separate dated Commerce webpage source model; mutable webpage original bytes and legal identity have not been independently verified.",
 "commerce_only":"2025 Government Manual publisher component lacking an exact-name 2026 Commerce model counterpart; no legal identity or present-day status inferred.",
 "header":"Publisher's Federally Aided Corporations grouping is a directory header, not a certified federal office, corporate ownership assertion, or command relationship.",
 "affiliate":"Publisher entry beneath Federally Aided Corporations; directory placement alone cannot certify this entry as a federal agency or department-controlled organization.",
}
NAMES={
 "269":"Federally Aided Corporations",
 "270":"American Printing House for the Blind",
 "271":"Gallaudet University",
 "272":"Howard University",
 "274":"National Technical Institute for the Deaf / Rochester Institute of Technology",
}

def ensure(condition,reason):
 if not condition:raise ValueError("INC-15D.6 reconciliation rejected: "+reason)

def get(root,path):
 return json.loads((root/path).read_text(encoding="utf-8"))

def fields(data,names,where):
 ensure(type(data) is dict and set(data)==set(names),where+" closed fields")

def wrap(family,items,extra):
 return {
  "model_version":"0.1.0","model_family":family,
  "source_package_id":PACKAGE,"source_publication_date":"2025-12-31",
  "source_original_sha256":SHA,
  "source_original_git_blob_sha1":BLOB,
  "source_original_repository_path":ORIGINAL,
  "whole_edition_publisher_entries":231,
  "existing_provisional_canonical_links":50,
  "existing_unlinked_source_entries":181,
  "current_first_level_institution_denominator":None,
  "whole_federal_legal_institution_denominator":None,
  "independent_legal_review_complete":False,
  "independent_worm_custody_verified":False,
  "canonical_component_identities_minted":0,
  "legally_certified_subordinate_components":0,
  "observed_command_delegations":0,
  "new_atlas_relationships":0,
  **extra,"items":items,
 }

def expected(root=REPO):
 # Replays the 2025 8.1 MB original and requires byte-identical prior 28
 # source-only dispositions, plus the historically established 231/50/181 base.
 prior.run(root)
 whole=govman.outputs(root)
 entries=whole[govman.OUTPUTS["directory"]]["items"]
 links=whole[govman.OUTPUTS["crosswalk"]]["items"]
 cov=whole[govman.OUTPUTS["coverage"]]["items"]
 ensure(len(entries)==len(links)==231 and
        sum(x["canonical_id"] is not None for x in links)==50,
        "whole-GovMan original or canonical-link population drift")
 by={x["source_entity_key"]:x for x in entries}
 xw={x["source_entity_key"]:x for x in links}
 ensure(len(by)==231 and len(xw)==231,"duplicate publisher source ID")
 assert len(cov)==22

 depts={d["id"]:d for d in get(root,DEPARTMENTS)["items"]}
 ids={i["canonical_id"]:i for i in get(root,IDENTITIES)["items"]}
 for root_id,dept_id,name in ((COMMERCE_ROOT,COMMERCE,"Department of Commerce"),
                               (EDUCATION_ROOT,EDUCATION,"Department of Education")):
  d=depts.get(dept_id);i=ids.get(dept_id);src=by.get(root_id)
  ensure(d is not None and d["name"]==name and d["parent_id"]=="BR-FED-EXE" and
         d["branch_id"]=="BR-FED-EXE" and
         i is not None and i["branch_id"]=="BR-FED-EXE" and
         i["adl1_certified"] is False and
         i["independent_legal_review_complete"] is False and
         src is not None and src["published_name"]==name and
         src["source_element_tag"]=="Entity" and src["published_parent_key"] is None and
         xw[root_id]["canonical_id"]==dept_id,
         "missing original named department anchor or branch "+name)

 def below(root_key):
  visited=set()
  def walk(parent):
   ensure(parent not in visited,"cycle or duplicate publisher parent "+parent)
   visited.add(parent)
   children=sorted((x for x in entries if x["published_parent_key"]==parent),
                   key=lambda x:x["published_order"])
   result=[]
   for x in children:
    result.append(x)
    result.extend(walk(x["source_entity_key"]))
   return result
  return walk(root_key)
 commerce_rows=below(COMMERCE_ROOT)
 education_rows=below(EDUCATION_ROOT)
 ensure(tuple(x["source_entity_local_id"] for x in commerce_rows)==COMMERCE_IDS and
        tuple(x["source_entity_local_id"] for x in education_rows)==EDUCATION_IDS,
        "source subtree edition-local IDs or cardinality changed")
 ensure(all(x["published_parent_key"]==COMMERCE_ROOT and x["published_depth"]==1 and
            x["source_element_tag"]=="SubEntityLevelOne" for x in commerce_rows),
        "Commerce publisher level-one placement changed")
 ensure(education_rows[0]["source_entity_key"]==EDUCATION_HEADING and
        education_rows[0]["published_parent_key"]==EDUCATION_ROOT and
        education_rows[0]["source_element_tag"]=="SubEntityLevelOne" and
        all(x["published_parent_key"]==EDUCATION_HEADING and
            x["source_element_tag"]=="SubEntityLevelTwo" and
            x["published_depth"]==2 for x in education_rows[1:]),
        "Education grouping or its four level-two affiliate entries falsified")
 ensure(all(by[PACKAGE+":"+key]["published_name"]==name for key,name in NAMES.items()),
        "federally aided publisher names/combined organizational label changed")
 for record in [*commerce_rows,*education_rows]:
  ensure(xw[record["source_entity_key"]]["canonical_id"] is None and
         xw[record["source_entity_key"]]["legal_identity_certified"] is False and
         record["published_category"]=="Executive Branch: Departments" and
         record["publisher_category_scope"]=="cabinet_publisher" and
         record["directory_nesting_only"] is True and
         record["mission_text_is_legal_authority"] is False and
         record["current_organization_verified"] is False,
         "source entry falsely promoted into canonical government or legal authority")
 cov_map={x["publisher_source_root_key"]:x for x in cov if
          x["population_kind"]=="publisher_department_subtree"}
 for key,total in ((COMMERCE_ROOT,11),(EDUCATION_ROOT,6)):
  x=cov_map[key]
  ensure(x["publisher_entry_denominator"]==total and
         x["unresolved_publisher_entries"]==total-1 and
         x["provisional_canonical_links"]==1 and
         x["current_legal_first_level_institution_denominator"] is None,
         "2025 publisher subtree coverage changed")

 seed_rows=get(root,SEEDS)["items"]
 granule_rows=get(root,GRANULES)["items"]
 commerce_units=[x for x in get(root,UNITS)["items"] if x["department_id"]==COMMERCE]
 source_reg={x["id"]:x for x in get(root,COMMERCE_SOURCE)["items"]}
 snapshots={x["id"]:x for x in get(root,COMMERCE_SNAPSHOTS)["items"]}
 cs=source_reg.get("DEPT04-SRC-COMMERCE-BUREAUS-2026")
 snap=snapshots.get("DEPT04-SNAPSHOT-COMMERCE")
 ensure(cs is not None and cs["url"]=="https://www.commerce.gov/bureaus-and-offices" and
        cs["raw_source_bytes_archived"] is False and cs["raw_source_sha256"] is None and
        cs["qualified_legal_review"] is False and
        cs["retrieved_on"]=="2026-10-16" and
        snap is not None and snap["edition"]=="observed_2026-10-16" and
        snap["qualified_institutional_review_complete"] is False and
        snap["complete_department_first_level_known"] is False and
        snap["signed_source_instrument_independently_validated"] is False,
        "Commerce 2026 mutable observed website provenance was falsely promoted")
 seed_by={}
 for seed in seed_rows:
  if seed.get("parent_department_id")!=COMMERCE:continue
  k=seed["name"]
  ensure(k not in seed_by,"ambiguous Commerce original seed")
  ensure(seed["adl1_completed"] is False and
         seed["delegation_verified"] is False and
         seed["current_2026_presence_verified"] is False,
         "prior Commerce research seed promoted to current legal authority")
  seed_by[k]=seed
 unit_by={}
 for u in commerce_units:
  ensure(u["source_id"]=="DEPT04-SRC-COMMERCE-BUREAUS-2026" and
         u["snapshot_id"]=="DEPT04-SNAPSHOT-COMMERCE" and
         u["original_published_relation_verified_in_named_slice"] is True and
         u["whole_organization_current_status_2026_verified"] is False and
         u["direct_operational_command_verified"] is False and
         u["statutory_delegation_verified"] is False and
         u["legal_subtype_finalized"] is False and u["adl_evidenced"]==0,
         "Commerce 2026 website model claims legally verified component")
  ensure(u["name"] not in unit_by,"duplicate exact name in Commerce 2026 source model")
  unit_by[u["name"]]=u
 granule_by={}
 for gran in granule_rows:
  if gran.get("parent_department_id")!=COMMERCE:continue
  ensure(gran["prior_candidate_id"] not in granule_by,
         "repeated Commerce GovInfo granule candidate")
  ensure(gran["full_adl1_completed"] is False and
         gran["individual_direct_supervisor_verified"] is False and
         gran["legal_power_verified"] is False,"earlier GovInfo detail promoted to legal power")
  granule_by[gran["prior_candidate_id"]]=gran

 # FY2024 ED organization chart is a *different evidence family*. Its 19
 # boxes do not prove that the four named aided corporations are ED offices.
 ed_chart=get(root,ED_CHART)
 ensure(ed_chart["department_id"]==EDUCATION and
        ed_chart["prior_govman_department_source_entity_key"]==EDUCATION_ROOT and
        ed_chart["official_report_fiscal_year"]=="FY2024" and
        len(ed_chart["items"])==19 and
        ed_chart["foreign_quasi_official_govman_entities_promoted_to_ED_offices"] is False and
        ed_chart["independently_qualified_legal_first_level_components"]==0 and
        ed_chart["current_department_first_level_denominator"] is None and
        ed_chart["statutory_delegation_certified"] is False and
        ed_chart["operational_reporting_chain_certified"] is False and
        all(v["original_source_govman_entity_id"] is None and
            v["source_layout_only_not_operational_reporting"] is True for v in ed_chart["items"]),
        "education chart falsely linked to federally aided publisher entries")

 c=get(root,CURATION)
 fields(c,("model_version","model_family","source_package_id","original_source_sha256",
           "research_status","publisher_grouping_not_legal_supervision",
           "current_first_level_institution_denominator",
           "independent_legal_review_complete","new_canonical_component_id_count","items"),
        "manual curation")
 ensure(c["model_version"]=="0.1.0" and
        c["model_family"]=="inc15d6-govman-2025-curation" and
        c["source_package_id"]==PACKAGE and c["original_source_sha256"]==SHA and
        c["research_status"]=="source_only_unratified_no_federal_affiliate_assumption" and
        c["publisher_grouping_not_legal_supervision"] is True and
        c["current_first_level_institution_denominator"] is None and
        c["independent_legal_review_complete"] is False and
        c["new_canonical_component_id_count"]==0 and
        type(c["items"]) is list and len(c["items"])==15,
        "curation source edition or unsupported legal qualification")
 manual={}
 for v in c["items"]:
  fields(v,("source_entity_local_id","published_name","published_parent_key",
             "canonical_department_anchor_id","disposition","previous_research_seed_id",
             "previous_exact_commerce_unit_id","unreviewed_2026_name_variant_candidate",
             "publisher_label_is_combined_organizational_reference","rationale"),
         "curated observation")
  local=v["source_entity_local_id"]
  ensure(type(local) is str and re.fullmatch(r"[1-9][0-9]*",local),
         "invalid source-local identifier")
  k=PACKAGE+":"+local
  ensure(k not in manual,"duplicate 2025 publisher entry "+k)
  ensure(v["disposition"] in DISPOSITIONS_ALLOWED.values() and
         v["rationale"] in RATIONALES.values(),
         "unknown publisher disposition or legal reinterpretation")
  manual[k]=v
 expected_keys={x["source_entity_key"] for x in [*commerce_rows,*education_rows]}
 ensure(set(manual)==expected_keys,"15 publisher keys not accounted for exactly once")

 result=[]
 summary=[]
 for department,root_key,records in ((COMMERCE,COMMERCE_ROOT,commerce_rows),
                                      (EDUCATION,EDUCATION_ROOT,education_rows)):
  matches=0;chart_matches=0;granule_count=0;aliases=0
  for source in records:
   key=source["source_entity_key"]
   local=source["source_entity_local_id"]
   v=manual[key]
   header=key==EDUCATION_HEADING
   affiliate=department==EDUCATION and not header
   expected_disposition=(DISPOSITIONS_ALLOWED["header"] if header else
             DISPOSITIONS_ALLOWED["affiliate"] if affiliate else DISPOSITIONS_ALLOWED["commerce"])
   prior_seed=seed_by.get(source["published_name"]) if department==COMMERCE else None
   old_unit=unit_by.get(source["published_name"]) if department==COMMERCE else None
   old_granule=granule_by.get(prior_seed["id"]) if prior_seed else None
   granule_url=old_granule["verified_granule_detail_url"] if old_granule else None
   candidate_alias=("DEPT04-UNIT-COMMERCE-USPTO" if local=="268" else None)
   if candidate_alias:
    alias_unit=next((x for x in commerce_units if x["id"]==candidate_alias),None)
    ensure(alias_unit is not None and alias_unit["name"]=="U.S. Patent and Trademark Office",
           "unverified 2026 textual name variant lost")
    aliases+=1
   rationale=(RATIONALES["header"] if header else
              RATIONALES["affiliate"] if affiliate else
              RATIONALES["commerce_seed"] if prior_seed else
              RATIONALES["commerce_web"] if old_unit else RATIONALES["commerce_only"])
   ensure(v["published_name"]==source["published_name"] and
          v["published_parent_key"]==source["published_parent_key"] and
          v["canonical_department_anchor_id"]==department and
          v["disposition"]==expected_disposition and
          v["rationale"]==rationale and
          v["previous_research_seed_id"]==(prior_seed["id"] if prior_seed else None) and
          v["previous_exact_commerce_unit_id"]==(old_unit["id"] if old_unit else None) and
          v["unreviewed_2026_name_variant_candidate"]==candidate_alias and
          v["publisher_label_is_combined_organizational_reference"] is (local=="274"),
          "source alias, classification, department, or 2026 research crosswalk falsely promoted "+key)
   ensure((old_granule is None) or
          (old_granule["granule_resolution"]=="exact_official_details_page_verified" and
           old_granule["candidate_label"]==source["published_name"] and
           old_granule["verified_granule_detail_url"]==
             "https://www.govinfo.gov/app/details/"+PACKAGE+"/"+PACKAGE+"-"+local),
          "earlier NOAA/NIST exact detail reference mismatch")
   matches+=prior_seed is not None
   chart_matches+=old_unit is not None
   granule_count+=old_granule is not None
   result.append({
    "id":"INC15D6-DISP-"+local,
    "source_entity_key":key,
    "publisher_local_id":local,
    "publisher_edition":PACKAGE,
    "published_name":source["published_name"],
    "published_parent_key":source["published_parent_key"],
    "canonical_department_anchor_id":department,
    "department_publisher_root_key":root_key,
    "canonical_component_id":None,
    "publisher_hierarchy_level":source["published_depth"],
    "publisher_element_tag":source["source_element_tag"],
    "publisher_sort_order":source["published_order"],
    "publisher_original_xpath":source["source_xml_xpath"],
    "source_original_sha256":SHA,
    "source_original_git_blob_sha1":BLOB,
    "disposition":expected_disposition,
    "disposition_rationale":rationale,
    "prior_seed_id":prior_seed["id"] if prior_seed else None,
    "prior_exact_2026_commerce_source_unit_id":old_unit["id"] if old_unit else None,
    "prior_exact_2026_commerce_source_snapshot_id":"DEPT04-SNAPSHOT-COMMERCE" if old_unit else None,
    "prior_2026_commerce_source_original_bytes_retained":False,
    "prior_govinfo_research_granule_id":old_granule["id"] if old_granule else None,
    "prior_govinfo_details_page_url":granule_url,
    "unqualified_name_variant_candidate":candidate_alias,
    "publisher_combined_label_not_split_to_federal_agencies":local=="274",
    "identity_reconciliation_state":"edition_local_source_only_no_legal_canonical_match",
    "publisher_parentage_does_not_establish_legal_supervision":True,
    "affiliated_entries_not_certified_as_US_federal_agencies":True,
    "2026_current_legal_organization_verified":False,
    "specific_legal_identity_certified":False,
    "statutory_delegation_certified":False,
    "budget_or_fiscal_control_certified":False,
    "command_relationship_verified":False,
    "independent_legal_review_complete":False,
    "adl1_certified":False,
    "atlas_graph_admitted":False,
    "plan_or_observatory_inference_created":False,
   })
  summary.append({
   "id":"INC15D6-COV-"+root_key.rsplit(":",1)[1],
   "publisher_department_root_key":root_key,
   "department_canonical_anchor_id":department,
   "root_publisher_name":by[root_key]["published_name"],
   "publisher_full_subtree_count":len(records)+1,
   "existing_canonical_root_links":1,
   "publisher_selected_unlinked_records":len(records),
   "publisher_entries_accounted":len(records),
   "commerce_first_level_source_only_candidates":10 if department==COMMERCE else 0,
   "education_directory_grouping_records":1 if department==EDUCATION else 0,
   "education_affiliate_legal_identity_unresolved_records":4 if department==EDUCATION else 0,
   "prior_expansion_research_seed_overlaps":matches,
   "prior_exact_dated_commerce_web_unit_refs":chart_matches,
   "prior_verified_GovInfo_granule_refs":granule_count,
   "unreviewed_source_name_variants":aliases,
   "canonical_component_matches":0,
   "independent_legal_component_certifications":0,
   "new_atlas_relationships":0,
   "independently_verified_direct_command_edges":0,
   "publisher_subtree_is_verified_federal_institution_inventory":False,
  })
 ensure((sum(r["prior_expansion_research_seed_overlaps"] for r in summary),
         sum(r["prior_exact_dated_commerce_web_unit_refs"] for r in summary),
         sum(r["prior_verified_GovInfo_granule_refs"] for r in summary),
         sum(r["unreviewed_source_name_variants"] for r in summary))==(2,8,2,1),
        "misleading old 2026 webpage evidence / historic original qualification")
 ensure(Counter(x["disposition"] for x in result)=={
  DISPOSITIONS_ALLOWED["commerce"]:10,
  DISPOSITIONS_ALLOWED["header"]:1,
  DISPOSITIONS_ALLOWED["affiliate"]:4,
 } and len(result)==15,
        "unaccounted or incorrectly federal-promoted publisher entry")
 ensure(all(x["canonical_component_id"] is None and
            x["statutory_delegation_certified"] is False and
            x["atlas_graph_admitted"] is False for x in result),
        "publisher entry implicitly promoted to federal institutional power")

 m=get(root,MANIFEST)
 ext=m.get("federal_institutional_breadth_15d6_extension")
 fields(ext,("source_edition","original_source_sha256","curation_model_path",
             "disposition_model_path","coverage_model_path",
             "publisher_entries_selected","publisher_entries_accounted",
             "commerce_first_level_publisher_entries",
             "education_publisher_grouping_records",
             "education_publisher_affiliated_entries",
             "prior_exact_2026_commerce_web_references",
             "prior_2026_commerce_original_bytes_retained",
             "new_canonical_component_ids",
             "legal_identity_and_authority_certified",
             "current_first_level_institution_denominator",
             "publisher_entry_population_equals_federal_agency_census",
             "website_atlas_graph_admitted","plan_or_data_observatory_changed"),
        "manifest INC-15D.6 edition declaration")
 ensure(ext["source_edition"]==PACKAGE and
        ext["original_source_sha256"]==SHA and
        ext["curation_model_path"]==CURATION and
        ext["disposition_model_path"]==DISPOSITIONS and
        ext["coverage_model_path"]==COVERAGE and
        ext["publisher_entries_selected"]==15 and
        ext["publisher_entries_accounted"]==15 and
        ext["commerce_first_level_publisher_entries"]==10 and
        ext["education_publisher_grouping_records"]==1 and
        ext["education_publisher_affiliated_entries"]==4 and
        ext["prior_exact_2026_commerce_web_references"]==8 and
        ext["prior_2026_commerce_original_bytes_retained"] is False and
        ext["new_canonical_component_ids"]==0 and
        ext["legal_identity_and_authority_certified"] is False and
        ext["current_first_level_institution_denominator"] is None and
        ext["publisher_entry_population_equals_federal_agency_census"] is False and
        ext["website_atlas_graph_admitted"] is False and
        ext["plan_or_data_observatory_changed"] is False and
        all(q in m["models"] for q in (CURATION,DISPOSITIONS,COVERAGE)) and
        len(m["models"])==len(set(m["models"])),
        "manifest scope, custody or authority inflation")

 return {
  DISPOSITIONS:wrap("inc15d6-govman-2025-dispositions",result,{
   "selected_source_entries":15,"dispositions_accounted":15,
   "commerce_first_level_source_candidates":10,
   "education_directory_grouping_count":1,
   "education_affiliated_entries_legal_status_unresolved":4,
   "prior_noncanonical_research_seeds":2,
   "prior_exact_named_2026_web_matches_without_original_custody":8,
   "prior_original_2025_granule_detail_refs":2,
   "uncertified_alias_name_variants":1,
   "fiscal_or_command_relation_established":False,
   "education_aided_corporations_are_department_offices":False,
  }),
  COVERAGE:wrap("inc15d6-govman-2025-coverage",summary,{
   "departments_count":2,
   "selected_publisher_entries":15,
   "accounted_publisher_entries":15,
   "unaccounted_selected_entries":0,
   "commerce_observations":10,
   "education_publisher_heading_observations":1,
   "education_publisher_affiliate_observations":4,
   "publisher_grouping_or_affiliate_observations_not_canonical_agencies":5,
   "previous_unlinked_181_entries_reclassified_as_canonical":0,
   "previous_50_canonical_name_links_modified":0,
   "previous_28_INC15D5_curation_records_modified":0,
   "current_legal_organizational_denominator_is_known":False,
   "earlier_2026_commerce_web_source_original_retained":False,
  }),
 }

def run(root=REPO,write=False):
 out=expected(root)
 for path,obj in out.items():
  full=root/path
  if write:
   full.parent.mkdir(parents=True,exist_ok=True)
   full.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  else:
   ensure(full.is_file() and get(root,path)==obj,
          "derived source/custody or legal-no-promotion model changed "+path)
 return {
  "edition":PACKAGE,"publisher_original_sha256":SHA,
  "2025_publisher_whole_edition_entries":231,
  "previous_provisional_canonical_links":50,
  "previous_unlinked_publisher_entries":181,
  "commerce_publisher_entries_accounted":10,
  "education_publisher_heading_entries_accounted":1,
  "education_affiliated_source_entries_accounted":4,
  "total_source_only_dispositions":15,
  "new_canonical_agencies":0,
  "legal_authority_granted_or_inferred":False,
  "atlas_edges_admitted":0,
  "Plan_or_Data_Observatory_changed":False,
 }

if __name__=="__main__":
 ap=argparse.ArgumentParser()
 ap.add_argument("--write",action="store_true",
                 help="explicitly regenerate the two source-derived records from original XML")
 ap.add_argument("--root",type=Path,default=REPO)
 opts=ap.parse_args()
 try:print(json.dumps(run(opts.root.resolve(),opts.write),indent=2))
 except Exception as e:
  print(str(e),file=sys.stderr)
  sys.exit(1)
