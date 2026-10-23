#!/usr/bin/env python3
"""INC-15D.9: complete edition-local independent publisher dispositions (45/45).

Replays the immutable 2025 Government Manual source and every predecessor
INC-15D.5..8 original/canonical-denial contract. Builds a separate seven-
category evidence-accounting summary. Publisher names, 2025 missions, category
and tree position MUST NOT be presented as present-day legal institutions,
official renames, statutory power, corporate ownership, or Atlas admission.
"""
from __future__ import annotations

import argparse
from collections import Counter
import importlib.util
import json
from pathlib import Path
import re
import sys

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "inc15d8_prior", REPO / "scripts/inc15d8-govman-reconcile.py")
prior = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)
govman = prior.govman
PKG, SHA, BLOB, ORIGINAL = govman.PACKAGE, govman.SHA, govman.BLOB, govman.ORIGINAL
CATEGORY = "Executive Branch: Independent Agencies and Government Corporations"
CURATION = "model/federal/inc15d9-govman-2025-curation.json"
DISPOSITIONS = "model/federal/inc15d9-govman-2025-dispositions.json"
COVERAGE = "model/federal/inc15d9-govman-2025-coverage.json"
PUBLISHER_WIDE = "model/federal/inc15d9-govman-2025-publisherwide-disposition-coverage.json"
MANIFEST = "model/federal/manifest.json"
CANONICAL = "model/federal/executive-independent.json"
X12 = "model/federal/x12-identities.json"

IDS = ("170", "169", "171", "172", "173", "175", "335", "178",
       "128", "179", "129", "180", "181", "182", "168")
GENERAL = "source_only_institutional_candidate_pending_statutory_confirmation"
HISTORICAL = "historical_publisher_name_successor_identity_unreviewed"
TEMPORAL = "source_observation_2026_continuity_or_reorganization_unreviewed"
SPECIAL_FORM = "publisher_named_corporate_or_special_authority_form_unreviewed"
RATIONALES = {
    GENERAL: "Official 2025 publisher top-level listing only. Published name, board or commission title and mission are not independently verified present-day identity, legal subtype, appointment, authority, operations or oversight.",
    HISTORICAL: "2025 publisher retained the Overseas Private Investment Corporation name. No independently retained transition/original law or verified successor identity is part of this source-disposition tranche; no automatic current-name equivalence.",
    TEMPORAL: "Publisher's 2025 USAID entry cannot resolve 2026 institutional continuation, transfer, abolition, agency control or exercise of authority; requires independently retained dated primary sources and distinct legal review.",
    SPECIAL_FORM: "2025 publisher title suggests a corporation or specially named authority; actual legal form, federal ownership, appropriations, governance and delegation require separately retained and reviewed original charter or law.",
}

def ensure(condition, reason):
    if not condition:
        raise ValueError("INC-15D.9 publisher/canonical qualification denied: " + reason)

def read(root, path):
    return json.loads((root/path).read_text(encoding="utf-8"))

def fields(obj, names, label):
    ensure(type(obj) is dict and set(obj) == set(names),
           label + " closed field contract")

def wrapper(family, items, extra):
    return {
        "model_version": "0.1.0",
        "model_family": family,
        "publisher_edition": PKG,
        "publisher_publication_date": "2025-12-31",
        "publisher_original_sha256": SHA,
        "publisher_original_git_blob_sha1": BLOB,
        "publisher_original_repository_path": ORIGINAL,
        "original_publisher_entries": 231,
        "original_provisional_canonical_links": 50,
        "original_entries_without_canonical_link": 181,
        "publisher_independent_category_entries": 62,
        "publisher_independent_category_provisional_links": 17,
        "publisher_independent_category_unlinked_entries": 45,
        "present_day_legal_federal_organization_denominator": None,
        "whole_current_government_census_established": False,
        "newly_qualified_canonical_component_ids": 0,
        "new_legal_identity_or_successor_certifications": 0,
        "new_signed_delegation_supervision_or_fiscal_edges": 0,
        "independent_worm_custody_original_verified": False,
        "atlas_public_graph_changes": 0,
        "plan_or_data_observatory_changes": False,
        **extra,
        "items": items,
    }

def expected(root=REPO):
    # Recursively replay original 8.1 MB GovInfo XML and the exact bytes of
    # D.5 (28), D.6 (15), D.7 (15), and D.8 (15) derived dispositions.
    prior.run(root)
    original = govman.outputs(root)
    directory = original[govman.OUTPUTS["directory"]]["items"]
    crosswalk = original[govman.OUTPUTS["crosswalk"]]["items"]
    coverage = original[govman.OUTPUTS["coverage"]]["items"]
    ensure(len(directory)==len(crosswalk)==231 and len(coverage)==22,
           "original directory or publisher coverage census modified")
    by_key = {x["source_entity_key"]:x for x in directory}
    xwalk = {x["source_entity_key"]:x for x in crosswalk}
    ensure(len(by_key)==len(xwalk)==231 and
           sum(x["canonical_id"] is not None for x in crosswalk)==50 and
           sum(x["canonical_id"] is None for x in crosswalk)==181,
           "source-to-canonical 231/50/181 baseline changed")
    cat = [x for x in directory if x["published_category"]==CATEGORY]
    cat_unlinked = [x for x in cat if xwalk[x["source_entity_key"]]["canonical_id"] is None]
    cat_linked = [x for x in cat if xwalk[x["source_entity_key"]]["canonical_id"] is not None]
    ensure((len(cat),len(cat_linked),len(cat_unlinked))==(62,17,45),
           "original independent publisher 62/17/45 population changed")
    selected = cat_unlinked[30:45]
    ensure(tuple(x["source_entity_local_id"] for x in selected)==IDS,
           "final 15 source-local IDs or source order changed")
    for x in selected:
        key=x["source_entity_key"];local=x["source_entity_local_id"]
        ensure(x["published_category"]==CATEGORY and
               x["publisher_category_scope"]=="independent_publisher" and
               x["source_element_tag"]=="Entity" and
               x["published_kind"]=="Parent" and
               x["published_parent_key"] is None and
               x["published_depth"]==0 and
               x["source_xml_xpath"]=="/GovernmentManual/Entity[@EntityId='"+local+"']" and
               x["directory_nesting_only"] is True and
               x["mission_text_is_legal_authority"] is False and
               x["current_organization_verified"] is False and
               x["independent_legal_review_complete"] is False and
               xwalk[key]["legal_identity_certified"] is False and
               xwalk[key]["legal_authority_inferred"] is False and
               xwalk[key]["command_delegation_inferred"] is False,
               "last-tranche publisher metadata falsely elevated to current law or canonical identity")
    s={x["source_entity_local_id"]:x for x in selected}
    ensure(s["169"]["published_name"]=="Overseas Private Investment Corporation" and
           s["180"]["published_name"]=="United States Agency for International Development" and
           s["171"]["published_name"]=="Pension Benefit Guaranty Corporation" and
           s["178"]["published_name"]=="Tennessee Valley Authority",
           "original historic, USAID, corporation or Authority publisher label changed")
    # This source family is disjoint from all earlier research cohorts. All
    # 45 independent-category unlinked IDs, not 45 federal legal bodies, are
    # accounted for by the publisher-specific source-disposition program.
    p7=prior.prior
    p6=p7.prior
    p5=p6.prior
    cohorts=[
        ("INC-15D.5",p5.DISPOSITIONS,28),
        ("INC-15D.6",p6.DISPOSITIONS,15),
        ("INC-15D.7",p7.DISPOSITIONS,15),
        ("INC-15D.8",prior.DISPOSITIONS,15),
    ]
    prior_keys=set()
    cohort_keys={}
    for label,path,count in cohorts:
        entries=read(root,path)["items"]
        ensure(len(entries)==count,"earlier "+label+" item count drifted")
        ids_here={row["source_entity_key"] for row in entries}
        ensure(len(ids_here)==count and not(ids_here & prior_keys),
               "duplicate/overlapping original publisher entries across "+label)
        ensure(all(xwalk[k]["canonical_id"] is None for k in ids_here),
               label+" source-only item falsely canonically identified")
        prior_keys.update(ids_here)
        cohort_keys[label]=ids_here
    new_keys={x["source_entity_key"] for x in selected}
    ensure(len(new_keys)==15 and not(new_keys&prior_keys),
           "final tranche overlaps previous source-only dispositions")
    independent_complete=cohort_keys["INC-15D.7"]|cohort_keys["INC-15D.8"]|new_keys
    ensure(len(independent_complete)==45 and
           independent_complete=={x["source_entity_key"] for x in cat_unlinked},
           "45/45 independent publisher source-only disposition accounting incomplete")
    ensure(len(prior_keys|new_keys)==88 and
           all(k in xwalk and xwalk[k]["canonical_id"] is None for k in prior_keys|new_keys),
           "all 88 unlinked edition observations not disjoint or missing from original crosswalk")
    ensure(len({x["source_entity_key"] for x in directory if
                xwalk[x["source_entity_key"]]["canonical_id"] is None}-(prior_keys|new_keys))==93,
           "unaccounted 93 source observations incorrectly computed")
    canon=read(root,CANONICAL)["items"]
    identities=read(root,X12)["items"]
    ensure(len(canon)==18 and len(identities)==61 and
           not({x["name"] for x in canon} & {x["published_name"] for x in selected}),
           "exact canonical-name overlap requires independently qualified separate adjudication")

    cur=read(root,CURATION)
    fields(cur,("model_version","model_family","source_edition",
                "source_original_sha256","source_category",
                "source_category_total_entries","source_category_prior_linked_entries",
                "source_category_unlinked_entries",
                "prior_qualified_source_dispositions_in_category",
                "selected_source_disposition_count","current_legal_institution_denominator",
                "new_canonical_links_qualified",
                "publisher_source_observation_is_not_current_law_certification",
                "publication_epoch_does_not_establish_2026_organization_status",
                "plan_observatory_or_Atlas_changed","items"),"curation envelope")
    ensure(cur["model_version"]=="0.1.0" and
           cur["model_family"]=="inc15d9-independent-publisher-curation" and
           cur["source_edition"]==PKG and
           cur["source_original_sha256"]==SHA and
           cur["source_category"]==CATEGORY and
           cur["source_category_total_entries"]==62 and
           cur["source_category_prior_linked_entries"]==17 and
           cur["source_category_unlinked_entries"]==45 and
           cur["prior_qualified_source_dispositions_in_category"]==30 and
           cur["selected_source_disposition_count"]==15 and
           cur["current_legal_institution_denominator"] is None and
           cur["new_canonical_links_qualified"]==0 and
           cur["publisher_source_observation_is_not_current_law_certification"] is True and
           cur["publication_epoch_does_not_establish_2026_organization_status"] is True and
           cur["plan_observatory_or_Atlas_changed"] is False and
           type(cur["items"]) is list and len(cur["items"])==15,
           "source curator misclassified 2025 publisher evidence or scope")
    fields_cur=(
        "source_entity_local_id","source_entity_key","published_name",
        "source_xml_xpath","original_publisher_sequence_index",
        "original_published_order","disposition",
        "legal_identity_or_successor_canonical_match",
        "current_2026_operational_status_verified",
        "current_2026_constitutional_or_statutory_authority_verified",
        "current_2026_government_entity_subtype_qualified",
        "independence_or_direct_oversight_verified",
        "governing_board_command_or_delegation_verified",
        "fiscal_ownership_or_congressional_appropriation_verified",
        "agency_rename_reorganization_or_transfer_independently_verified",
        "original_entity_statute_charter_or_transition_custody_qualified",
        "atlas_graph_admission_qualified",
        "source_only_not_legal_identity_certificate",
        "review_note"
    )
    manual={}
    for row in cur["items"]:
        fields(row,fields_cur,"curated source observation")
        local=row["source_entity_local_id"];key=row["source_entity_key"]
        ensure(type(local) is str and re.fullmatch("[1-9][0-9]*",local) and
               key==PKG+":"+local and key not in manual,
               "duplicate, missing or malformed publisher source identity")
        ensure(row["legal_identity_or_successor_canonical_match"] is None and
               all(row[k] is False for k in (
                  "current_2026_operational_status_verified",
                  "current_2026_constitutional_or_statutory_authority_verified",
                  "current_2026_government_entity_subtype_qualified",
                  "independence_or_direct_oversight_verified",
                  "governing_board_command_or_delegation_verified",
                  "fiscal_ownership_or_congressional_appropriation_verified",
                  "agency_rename_reorganization_or_transfer_independently_verified",
                  "original_entity_statute_charter_or_transition_custody_qualified",
                  "atlas_graph_admission_qualified")) and
               row["source_only_not_legal_identity_certificate"] is True,
               "curator falsely qualified successor, current authority, fiscal/command edge or Atlas")
        manual[key]=row
    ensure(set(manual)==new_keys,"final 15 manual observations missing or foreign")

    rows=[]
    for index,x in enumerate(selected):
        local=x["source_entity_local_id"];key=x["source_entity_key"]
        old=local=="169";USAID=local=="180";special=local in ("171","178")
        expected_disposition=(HISTORICAL if old else TEMPORAL if USAID else
                              SPECIAL_FORM if special else GENERAL)
        c=manual[key]
        ensure(c["published_name"]==x["published_name"] and
               c["source_xml_xpath"]==x["source_xml_xpath"] and
               c["original_publisher_sequence_index"]==31+index and
               c["original_published_order"]==x["published_order"] and
               c["disposition"]==expected_disposition and
               c["review_note"]==RATIONALES[expected_disposition],
               "original publisher date/order, OPIC, USAID or qualified subtype meaning drifted")
        rows.append({
            "id":"INC15D9-DISP-"+local,
            "source_entity_key":key,
            "source_local_id":local,
            "original_name":x["published_name"],
            "publisher_date":"2025-12-31",
            "source_original_sha256":SHA,
            "source_original_git_blob_sha1":BLOB,
            "original_source_xpath":x["source_xml_xpath"],
            "publisher_category":x["published_category"],
            "publisher_category_scope":x["publisher_category_scope"],
            "source_element_tag":x["source_element_tag"],
            "source_parent_key":x["published_parent_key"],
            "source_depth":x["published_depth"],
            "publisher_published_order":x["published_order"],
            "unlinked_publisher_category_ordinal":31+index,
            "disposition":expected_disposition,
            "disposition_rationale":RATIONALES[expected_disposition],
            "historical_OPIC_name_successor_identity_unresolved":old,
            "USAID_2026_institution_status_unresolved":USAID,
            "publisher_corporate_or_special_form_requires_legal_original":special,
            "publisher_directory_class_is_not_verified_federal_subtype":True,
            "publisher_mission_does_not_qualify_legal_powers":True,
            "canonical_component_id":None,
            "present_day_legal_institutional_identity_verified":False,
            "current_2026_operations_or_staffing_verified":False,
            "original_statute_charter_or_successor_transition_reconciled":False,
            "verified_successor_or_rename_identity":False,
            "government_corporation_or_agency_legal_subtype_verified":False,
            "fiscal_ownership_appropriation_or_budget_authority_verified":False,
            "agency_oversight_delegation_or_command_verified":False,
            "reported_publisher_mission_independently_verified_as_actual_action":False,
            "adl1_legal_institution_certified":False,
            "independent_legal_review_complete":False,
            "external_worm_custody_verified":False,
            "atlas_relationship_admitted":False,
            "plan_or_data_outcome_claims_created":False,
        })
    ensure(Counter(x["disposition"] for x in rows)==
           {GENERAL:11,HISTORICAL:1,TEMPORAL:1,SPECIAL_FORM:2},
           "11 general, one historical OPIC, one USAID temporal, two special-form split lost")

    # Edition-wide accounting is a set partition over original publisher
    # categories, not a whole-of-government institutional denominator.
    evidence_keys=prior_keys|new_keys
    observed_categories=list(dict.fromkeys(x["published_category"] for x in directory))
    category_rows=[]
    for i,category in enumerate(observed_categories):
        all_cat=[x for x in directory if x["published_category"]==category]
        linked=sum(xwalk[x["source_entity_key"]]["canonical_id"] is not None for x in all_cat)
        source_only=sum(x["source_entity_key"] in evidence_keys for x in all_cat)
        unresolved=len(all_cat)-linked-source_only
        ensure(unresolved>=0,"publisher category accounting impossible")
        category_rows.append({
            "id":"INC15D9-PUB-COV-"+str(i+1).zfill(2),
            "original_publisher_category":category,
            "original_publisher_entries":len(all_cat),
            "prior_provisional_canonical_name_links":linked,
            "unlinked_source_only_entries_with_disposition":source_only,
            "unlinked_entries_without_disposition":unresolved,
            "total_unlinked_entries":len(all_cat)-linked,
            "legally_certified_federal_entity_denominator":None,
            "canonical_link_is_full_legal_identity_certification":False,
            "source_disposition_is_canonical_identity_match":False,
            "publisher_category_is_current_US_government_population":False,
        })
    ensure(len(category_rows)==7 and
           sum(x["original_publisher_entries"] for x in category_rows)==231 and
           sum(x["prior_provisional_canonical_name_links"] for x in category_rows)==50 and
           sum(x["unlinked_source_only_entries_with_disposition"] for x in category_rows)==88 and
           sum(x["unlinked_entries_without_disposition"] for x in category_rows)==93 and
           sum(x["total_unlinked_entries"] for x in category_rows)==181,
           "full publisher 231=50 provisional +88 curated-source-only +93 outstanding violated")
    independent_summary=[x for x in category_rows if x["original_publisher_category"]==CATEGORY]
    ensure(len(independent_summary)==1 and
           (independent_summary[0]["original_publisher_entries"],
            independent_summary[0]["prior_provisional_canonical_name_links"],
            independent_summary[0]["unlinked_source_only_entries_with_disposition"],
            independent_summary[0]["unlinked_entries_without_disposition"])==(62,17,45,0),
           "45/45 independent directory entries remain source-only and unlinked")
    department_summary=[x for x in category_rows if x["original_publisher_category"]=="Executive Branch: Departments"]
    ensure(len(department_summary)==1 and
           (department_summary[0]["original_publisher_entries"],
            department_summary[0]["prior_provisional_canonical_name_links"],
            department_summary[0]["unlinked_source_only_entries_with_disposition"],
            department_summary[0]["unlinked_entries_without_disposition"])==(117,15,43,59),
           "earlier 43 Cabinet source-only identity dispositions changed")

    manifest=read(root,MANIFEST)
    ext=manifest.get("federal_institutional_breadth_15d9_extension")
    fields(ext,("source_edition","original_source_sha256",
                "curation_path","dispositions_path","coverage_path",
                "publisherwide_disposition_coverage_path",
                "last_independent_source_observations_disposed",
                "cumulative_independent_unlinked_source_observations_disposed",
                "independent_unlinked_source_observations_outside_all_three_tranches",
                "whole_publisher_source_observations_with_source_only_dispositions",
                "whole_publisher_unlinked_entries_not_disposed",
                "unchanged_provisional_canonical_links",
                "unchanged_unlinked_source_entries",
                "new_canonical_legal_identities",
                "verified_successor_or_name_alias_relations",
                "verified_2026_operational_currentness",
                "qualified_new_legal_or_fiscal_edges",
                "legal_federal_institution_denominator",
                "publisher_total_is_not_current_federal_agency_census",
                "atlas_graph_admission","plan_or_data_observatory_changed"),
           "manifest source and coverage extension")
    ensure(ext["source_edition"]==PKG and ext["original_source_sha256"]==SHA and
           ext["curation_path"]==CURATION and
           ext["dispositions_path"]==DISPOSITIONS and
           ext["coverage_path"]==COVERAGE and
           ext["publisherwide_disposition_coverage_path"]==PUBLISHER_WIDE and
           ext["last_independent_source_observations_disposed"]==15 and
           ext["cumulative_independent_unlinked_source_observations_disposed"]==45 and
           ext["independent_unlinked_source_observations_outside_all_three_tranches"]==0 and
           ext["whole_publisher_source_observations_with_source_only_dispositions"]==88 and
           ext["whole_publisher_unlinked_entries_not_disposed"]==93 and
           ext["unchanged_provisional_canonical_links"]==50 and
           ext["unchanged_unlinked_source_entries"]==181 and
           ext["new_canonical_legal_identities"]==0 and
           ext["verified_successor_or_name_alias_relations"]==0 and
           ext["verified_2026_operational_currentness"]==0 and
           ext["qualified_new_legal_or_fiscal_edges"]==0 and
           ext["legal_federal_institution_denominator"] is None and
           ext["publisher_total_is_not_current_federal_agency_census"] is True and
           ext["atlas_graph_admission"] is False and
           ext["plan_or_data_observatory_changed"] is False and
           all(k in manifest["models"] for k in
               (CURATION,DISPOSITIONS,COVERAGE,PUBLISHER_WIDE)) and
           len(manifest["models"])==len(set(manifest["models"])),
           "manifest falsely certifies legal agency/source-to-canonical/publication status")

    return {
        DISPOSITIONS: wrapper("inc15d9-independent-publisher-dispositions",rows,{
            "last_tranche_entries_disposed":15,
            "cumulative_independent_source_dispositions":45,
            "independent_entries_remaining_without_disposition":0,
            "historically_named_OPIC_entry":1,
            "USAID_source_temporal_uncertainty_entry":1,
            "special_form_original_statute_required_entries":2,
            "ordinary_source_only_candidate_entries":11,
            "all_45_source_entries_newly_identified_as_canonical":False,
            "current_2026_institutional_status_is_certified":False,
        }),
        COVERAGE: wrapper("inc15d9-independent-publisher-coverage",[{
            "id":"INC15D9-COV-45-OF-45",
            "publisher_independent_source_entries":62,
            "previous_canonical_name_links":17,
            "historically_unlinked_independent_source_entries":45,
            "INC15D7_source_only_entries":15,
            "INC15D8_source_only_entries":15,
            "INC15D9_source_only_entries":15,
            "all_three_source_only_entries_accounted":45,
            "still_unlinked_to_canonical_in_category":45,
            "unlinked_source_entries_without_source_disposition":0,
            "original_source_only_tranches_are_disjoint":True,
            "newly_legally_qualified_canonical_ids":0,
            "verified_source_successors_or_aliases":0,
            "operational_2026_continuity_asserted":False,
            "source_entry_count_equals_verified_agency_count":False,
            "legal_subtype_or_delegation_claims_made":False,
            "atlas_published_edges":0,
        }],{
            "independent_category_original_source_unlinked_entries":45,
            "source_only_entries_with_individual_dispositions":45,
            "source_only_entries_outstanding":0,
            "independently_qualified_identity_crosswalks_created":0,
            "existing_17_provisional_canonical_links_modified":0,
            "external_original_statutes_for_15_records_admitted":0,
        }),
        PUBLISHER_WIDE: wrapper("inc15d9-publisherwide-source-disposition-coverage",category_rows,{
            "publisher_category_partition_count":7,
            "source_scope":"original_2025_publisher_directory_not_government_legal_census",
            "publisher_observations":231,
            "historical_provisional_canonical_name_links":50,
            "still_unlinked_publisher_observations":181,
            "unlinked_entries_with_explicit_source_only_disposition":88,
            "unlinked_entries_without_source_only_disposition":93,
            "source_only_research_observation_is_legally_verified_identity":False,
            "source_only_entries_with_disposition_from_INC15D5":28,
            "source_only_entries_with_disposition_from_INC15D6":15,
            "source_only_entries_with_disposition_from_INC15D7":15,
            "source_only_entries_with_disposition_from_INC15D8":15,
            "source_only_entries_with_disposition_from_INC15D9":15,
            "current_2026_agency_population_verified":False,
            "legal_authority_census_completed":False,
            "current_status_of_preexisting_50_provisional_links_reassessed_in_this_increment":False,
            "new_qualifying_legal_source_custody_for_unlinked_entries":0,
            "new_public_Atlas_admissions":0,
            "newly_independently_measured_public_service_outcome_links":0,
        }),
    }

def run(root=REPO,write=False):
    outputs=expected(root)
    for path,obj in outputs.items():
        dest=root/path
        if write:
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        else:
            ensure(dest.is_file() and read(root,path)==obj,
                   "committed original-source derived register or coverage changed "+path)
    return {
        "source_edition":PKG,
        "total_source_entries":231,
        "provisional_links_unchanged":50,
        "source_entries_unlinked_unchanged":181,
        "independent_category_unlinked_source_dispositions":45,
        "independent_category_entries_awaiting_source_disposition":0,
        "edition_wide_source_only_dispositions":88,
        "edition_wide_unlinked_source_entries_without_disposition":93,
        "newly_qualified_current_legal_institution_identities":0,
        "OPIC_successor_not_automapped":True,
        "USAID_2026_status_not_inferred":True,
        "atlas_relationships_changed":False,
        "plan_and_data_observatory_unchanged":True,
    }

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=REPO)
    parser.add_argument("--write",action="store_true",
                        help="explicit deterministic rebuild of three derived, source-only 2025 registers")
    args=parser.parse_args()
    try:
        print(json.dumps(run(args.root.resolve(),args.write),indent=2))
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
