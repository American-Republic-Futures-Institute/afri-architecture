#!/usr/bin/env python3
"""INC-15D.8: reproducible original-source publisher hierarchy and legal-denial register.

This research records the second fifteen UNLINKED entries in the 2025
Government Manual independent agency / corporation publisher category.
Never interpret publisher category or nested display structure as legal
federal organization subtype, supervision, command, delegated powers,
current legal status, ownership, appropriations, or observed outcomes.
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
    "inc15d7_prior", REPO / "scripts/inc15d7-govman-reconcile.py")
prior = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)
govman = prior.govman

PKG, SHA, BLOB, ORIGINAL = govman.PACKAGE, govman.SHA, govman.BLOB, govman.ORIGINAL
CATEGORY = "Executive Branch: Independent Agencies and Government Corporations"
CURATION = "model/federal/inc15d8-govman-2025-curation.json"
DISPOSITIONS = "model/federal/inc15d8-govman-2025-dispositions.json"
COVERAGE = "model/federal/inc15d8-govman-2025-coverage.json"
MANIFEST = "model/federal/manifest.json"
CANONICAL = "model/federal/executive-independent.json"
X12 = "model/federal/x12-identities.json"
IDS = ("148", "151", "152", "155", "156", "157", "208", "209",
       "210", "158", "160", "159", "162", "164", "166")
FOUNDATION = PKG + ":157"
ARTS = ("208", "209", "210")
AMTRAK = "160"
NORMAL = "source_only_institutional_candidate_pending_statutory_confirmation"
GROUP = "publisher_composite_foundation_parent_legal_structure_unreviewed"
NESTED = "publisher_nested_foundation_component_legal_structure_unreviewed"
CORPORATE = "publisher_named_corporation_distinct_legal_subtype_unreviewed"
NOTES = {
    NORMAL: "Publisher top-level organization entry; legal subtype, current 2026 institution status, authority, fiscal controls, and oversight are not independently verified.",
    GROUP: "National Foundation on the Arts and the Humanities is a parent-level 2025 directory entry. Publisher nesting of the three components is not proof of legal control, office reporting, or statutory delegation.",
    NESTED: "Publisher level-one observation under the National Foundation on the Arts and the Humanities; precise legal identity, independence, delegated authority, and current structural parentage require separate source qualification.",
    CORPORATE: "Publisher labels the National Railroad Passenger Corporation (AMTRAK); corporate or governmental subtype, governance, ownership and statutory obligations require independently retained charter or law; never classify from directory grouping.",
}


def deny(test, msg):
    if not test:
        raise ValueError("INC-15D.8 source/canonical contract rejected: " + msg)


def get(root, path):
    return json.loads((root / path).read_text(encoding="utf-8"))


def keys(obj, want, label):
    deny(type(obj) is dict and set(obj) == set(want), label + " unknown/missing fields")


def wrap(family, data, additions):
    return {
        "model_version": "0.1.0",
        "model_family": family,
        "source_edition": PKG,
        "source_publication_date": "2025-12-31",
        "source_original_sha256": SHA,
        "source_original_git_blob_sha1": BLOB,
        "source_original_repository_path": ORIGINAL,
        "publisher_source_category": CATEGORY,
        "whole_edition_source_entries": 231,
        "whole_edition_provisional_canonical_links": 50,
        "whole_edition_unlinked_source_entries": 181,
        "independent_category_source_entries": 62,
        "independent_category_provisional_canonical_links": 17,
        "independent_category_unlinked_source_entries": 45,
        "current_federal_legal_institution_denominator": None,
        "independent_statutory_legal_review_complete": False,
        "independent_external_worm_certification": False,
        "new_canonical_institution_ids": 0,
        "new_independently_certified_legal_identities": 0,
        "new_typed_authority_or_supervision_edges": 0,
        "atlas_graph_relationships_admitted": 0,
        "plan_or_data_observatory_changed": False,
        **additions,
        "items": data,
    }


def expected(root=REPO):
    # Prior validator recursively verifies unaltered INC-15D.7, .6, .5,
    # and reproduces the 8.1MB XML with the complete 231/50/181 baseline.
    prior.run(root)
    baseline = govman.outputs(root)
    directory = baseline[govman.OUTPUTS["directory"]]["items"]
    crosswalk = baseline[govman.OUTPUTS["crosswalk"]]["items"]
    coverage = baseline[govman.OUTPUTS["coverage"]]["items"]
    deny(len(directory) == len(crosswalk) == 231 and len(coverage) == 22,
         "original Government Manual population or coverage changed")
    by_key = {x["source_entity_key"]: x for x in directory}
    by_link = {x["source_entity_key"]: x for x in crosswalk}
    deny(len(by_key) == len(by_link) == 231 and
         sum(x["canonical_id"] is not None for x in crosswalk) == 50 and
         sum(x["canonical_id"] is None for x in crosswalk) == 181,
         "canonical crosswalk lost source IDs or changed link population")
    all_category = [x for x in directory if x["published_category"] == CATEGORY]
    unlinked = [x for x in all_category if by_link[x["source_entity_key"]]["canonical_id"] is None]
    linked = [x for x in all_category if by_link[x["source_entity_key"]]["canonical_id"] is not None]
    deny((len(all_category), len(linked), len(unlinked)) == (62, 17, 45),
         "publisher independent category 62/17/45 changed")
    category_coverage = [x for x in coverage if
                         x["population_kind"] == "publisher_category" and
                         x["publisher_partition_name"] == CATEGORY]
    deny(len(category_coverage) == 1 and
         category_coverage[0]["publisher_entry_denominator"] == 62 and
         category_coverage[0]["provisional_canonical_links"] == 17 and
         category_coverage[0]["unresolved_publisher_entries"] == 45 and
         category_coverage[0]["current_legal_first_level_institution_denominator"] is None,
         "published category must not become current legal institution denominator")
    selected = unlinked[15:30]
    deny(tuple(x["source_entity_local_id"] for x in selected) == IDS,
         "wrong ordinal 16-30 source-local IDs or source order")
    for x in selected:
        deny(x["published_category"] == CATEGORY and
             x["publisher_category_scope"] == "independent_publisher" and
             x["directory_nesting_only"] is True and
             x["mission_text_is_legal_authority"] is False and
             x["current_organization_verified"] is False and
             x["independent_legal_review_complete"] is False and
             by_link[x["source_entity_key"]]["canonical_id"] is None and
             by_link[x["source_entity_key"]]["legal_identity_certified"] is False and
             by_link[x["source_entity_key"]]["legal_authority_inferred"] is False and
             by_link[x["source_entity_key"]]["command_delegation_inferred"] is False,
             "unlinked publisher record was legally/operationally promoted")
    for x in selected:
        local, nested = x["source_entity_local_id"], x["source_entity_local_id"] in ARTS
        deny(
            (x["published_parent_key"] == FOUNDATION and
             x["source_element_tag"] == "SubEntityLevelOne" and
             x["published_kind"] == "SubEntityLevelOne" and
             x["published_depth"] == 1 and
             x["source_xml_xpath"] ==
                "/GovernmentManual/Entity[@EntityId='157']/Childrens/SubEntityLevelOne[@EntityId='" + local + "']")
            if nested else
            (x["published_parent_key"] is None and
             x["source_element_tag"] == "Entity" and
             x["published_kind"] == "Parent" and
             x["published_depth"] == 0 and
             x["source_xml_xpath"] == "/GovernmentManual/Entity[@EntityId='" + local + "']"),
            "original parent/subentity tag or full publisher XPath falsified: " + local)
    deny([x["published_order"] for x in selected if x["source_entity_local_id"] in ARTS] == [1,2,3],
         "original Arts/Foundation component order changed")
    by_id = {x["source_entity_local_id"]: x for x in selected}
    deny(by_id["157"]["published_name"] == "National Foundation on the Arts and the Humanities" and
         by_id["208"]["published_name"] == "National Endowment for the Arts" and
         by_id["209"]["published_name"] == "National Endowment for the Humanities" and
         by_id["210"]["published_name"] == "Institute of Museum and Library Services" and
         by_id["160"]["published_name"] == "National Railroad Passenger Corporation (AMTRAK)",
         "Arts/Foundation publisher labels or corporate source name changed")
    deny({x["source_entity_key"] for x in selected if x["published_parent_key"] == FOUNDATION} ==
         {PKG+":"+i for i in ARTS} and
         sum(x["published_parent_key"] == FOUNDATION for x in selected) == 3,
         "Foundation publisher hierarchy changed or was flattened")
    prior_tranche = get(root, prior.DISPOSITIONS)["items"]
    deny(len(prior_tranche) == 15 and
         not ({x["source_entity_key"] for x in prior_tranche} & {x["source_entity_key"] for x in selected}),
         "second 15-entry tranche overlaps first 15 entries")

    # Compare against existing canonical records. A source directory entry
    # never licenses creating a new canonical ID from a similar label.
    canon = get(root, CANONICAL)["items"]
    x12 = get(root, X12)["items"]
    deny(len(canon) == 18 and len(x12) == 61 and
         all(x["branch_id"] == "BR-FED-EXE" and x["parent_id"] == "BR-FED-EXE" for x in canon) and
         not ({x["published_name"] for x in selected} & {x["name"] for x in canon}),
         "unknown exact source-to-canonical identity requires a separate legal review")

    curation = get(root, CURATION)
    keys(curation, ("model_version", "model_family", "source_edition", "source_original_sha256",
                    "publisher_category", "preceding_unlinked_entries",
                    "selected_unlinked_entries", "prior_independent_category_unlinked_entries",
                    "source_curation_is_legal_organizational_review",
                    "independent_legal_original_review_complete", "new_canonical_component_identities",
                    "government_wide_institution_denominator", "items"), "curation envelope")
    deny(curation["model_version"] == "0.1.0" and
         curation["model_family"] == "inc15d8-independent-publisher-curation" and
         curation["source_edition"] == PKG and
         curation["source_original_sha256"] == SHA and
         curation["publisher_category"] == CATEGORY and
         curation["preceding_unlinked_entries"] == 15 and
         curation["selected_unlinked_entries"] == 15 and
         curation["prior_independent_category_unlinked_entries"] == 45 and
         curation["source_curation_is_legal_organizational_review"] is False and
         curation["independent_legal_original_review_complete"] is False and
         curation["new_canonical_component_identities"] == 0 and
         curation["government_wide_institution_denominator"] is None and
         type(curation["items"]) is list and len(curation["items"]) == 15,
         "incorrect source edition/curation scope or false legal qualification")
    curated = {}
    fields = ("source_entity_local_id", "source_entity_key", "published_name",
              "published_parent_key", "source_xml_xpath", "expected_publisher_tag",
              "source_tranche_position", "disposition", "proposed_canonical_component_id",
              "independently_qualified_legal_parent_id", "charter_or_statutory_original_qualified",
              "current_institutional_form_2026_qualified",
              "signed_supervision_or_delegation_qualified",
              "board_commission_oversight_qualified", "budget_or_appropriation_power_qualified",
              "atlas_publication_admitted", "review_note")
    for row in curation["items"]:
        keys(row, fields, "curation observation")
        local = row["source_entity_local_id"]
        deny(type(local) is str and re.fullmatch("[1-9][0-9]*",local) and
             row["source_entity_key"] == PKG+":"+local and
             row["source_entity_key"] not in curated,
             "bad source-local key or duplicate")
        deny(row["proposed_canonical_component_id"] is None and
             row["independently_qualified_legal_parent_id"] is None and
             all(row[k] is False for k in (
                 "charter_or_statutory_original_qualified",
                 "current_institutional_form_2026_qualified",
                 "signed_supervision_or_delegation_qualified",
                 "board_commission_oversight_qualified",
                 "budget_or_appropriation_power_qualified",
                 "atlas_publication_admitted")),
             "curation silently certified institution, legal authority, or public graph")
        curated[row["source_entity_key"]] = row
    deny(set(curated) == {x["source_entity_key"] for x in selected},
         "missing, extra or foreign source IDs in second 15 publisher observations")

    rows = []
    for idx,x in enumerate(selected):
        local, key = x["source_entity_local_id"], x["source_entity_key"]
        publisher_nesting = local in ARTS
        foundation = local == "157"
        amtrak = local == AMTRAK
        disposition = NESTED if publisher_nesting else GROUP if foundation else CORPORATE if amtrak else NORMAL
        cur = curated[key]
        deny(cur["source_entity_local_id"] == local and
             cur["published_name"] == x["published_name"] and
             cur["published_parent_key"] == x["published_parent_key"] and
             cur["source_xml_xpath"] == x["source_xml_xpath"] and
             cur["expected_publisher_tag"] == x["source_element_tag"] and
             cur["source_tranche_position"] == idx+1 and
             cur["disposition"] == disposition and
             cur["review_note"] == NOTES[disposition],
             "original name, edition-local hierarchy, Arts/Amtrak subtype or precise disposition altered")
        rows.append({
            "id": "INC15D8-DISP-" + local,
            "source_entity_key": key,
            "source_entity_local_id": local,
            "published_name": x["published_name"],
            "source_edition": PKG,
            "source_original_sha256": SHA,
            "source_original_git_blob_sha1": BLOB,
            "publisher_category": x["published_category"],
            "publisher_category_scope": x["publisher_category_scope"],
            "published_parent_key": x["published_parent_key"],
            "published_order": x["published_order"],
            "published_depth": x["published_depth"],
            "publisher_element_tag": x["source_element_tag"],
            "publisher_original_xpath": x["source_xml_xpath"],
            "tranche_sequence": idx+1,
            "disposition": disposition,
            "disposition_rationale": NOTES[disposition],
            "original_mission_text_not_statutory_authority": True,
            "publisher_nesting_not_proof_of_statutory_parentage": True,
            "publisher_nested_foundation_component": publisher_nesting,
            "foundation_group_publisher_entry": foundation,
            "corporation_named_amtrak_source_entry": amtrak,
            "corporate_form_or_ownership_legal_review_pending": amtrak,
            "canonical_institutional_identity": None,
            "qualified_legal_parent_institution": None,
            "specific_current_2026_legal_identity_verified": False,
            "corporate_or_federal_agency_subtype_verified": False,
            "original_statute_or_charter_for_this_record_retained": False,
            "legal_supervision_or_delegation_verified": False,
            "board_or_commission_oversight_verified": False,
            "congressional_appropriation_authority_verified": False,
            "operational_command_exercised_verified": False,
            "independent_legal_review_complete": False,
            "adl1_certified": False,
            "external_worm_original_verified": False,
            "atlas_graph_admitted": False,
            "plan_or_data_observatory_inference_created": False,
        })
    deny(Counter(x["disposition"] for x in rows) ==
         {NORMAL:10,GROUP:1,NESTED:3,CORPORATE:1},
         "source partition must remain ten ordinary, one foundation, three nested, one Amtrak")

    manifest = get(root, MANIFEST)
    ext = manifest.get("federal_institutional_breadth_15d8_extension")
    keys(ext, ("source_edition", "original_source_sha256", "curation_path",
               "dispositions_path", "coverage_path", "prior_unlinked_category_count",
               "publisher_entries_selected_and_accounted", "top_level_publisher_entities",
               "foundation_grouping_entries", "nested_foundation_publisher_components",
               "named_corporation_amtrak_entries", "new_canonical_identity_links",
               "qualified_statutory_subtype_count", "independent_legal_review_complete",
               "remaining_unlinked_publisher_category_outside_two_tranches",
               "current_federal_legal_institution_denominator",
               "publisher_nesting_equated_to_legal_authority",
               "atlas_graph_admission", "plan_or_data_observatory_changed"),
         "manifest declaration")
    deny(ext["source_edition"] == PKG and
         ext["original_source_sha256"] == SHA and
         ext["curation_path"] == CURATION and
         ext["dispositions_path"] == DISPOSITIONS and
         ext["coverage_path"] == COVERAGE and
         ext["prior_unlinked_category_count"] == 45 and
         ext["publisher_entries_selected_and_accounted"] == 15 and
         ext["top_level_publisher_entities"] == 12 and
         ext["foundation_grouping_entries"] == 1 and
         ext["nested_foundation_publisher_components"] == 3 and
         ext["named_corporation_amtrak_entries"] == 1 and
         ext["new_canonical_identity_links"] == 0 and
         ext["qualified_statutory_subtype_count"] == 0 and
         ext["independent_legal_review_complete"] is False and
         ext["remaining_unlinked_publisher_category_outside_two_tranches"] == 15 and
         ext["current_federal_legal_institution_denominator"] is None and
         ext["publisher_nesting_equated_to_legal_authority"] is False and
         ext["atlas_graph_admission"] is False and
         ext["plan_or_data_observatory_changed"] is False and
         all(p in manifest["models"] for p in (CURATION,DISPOSITIONS,COVERAGE)) and
         len(manifest["models"]) == len(set(manifest["models"])),
         "manifest model admission or federal legal claim invalid")

    cov = [{
        "id": "INC15D8-COV-INDEPENDENT-SECOND-015",
        "publisher_source_category": CATEGORY,
        "original_publisher_total_entries": 62,
        "prior_provisional_publisher_canonical_links": 17,
        "prior_unlinked_publisher_entries": 45,
        "first_tranche_unlinked_source_entries_accounted": 15,
        "this_tranche_unlinked_source_entries_accounted": 15,
        "cumulative_source_only_dispositions": 30,
        "unlinked_publisher_entries_outside_15D7_and_15D8": 15,
        "top_level_publisher_entities": 12,
        "source_level_one_foundation_children": 3,
        "foundation_publisher_group_entries": 1,
        "amtrak_named_corporation_entries": 1,
        "general_top_level_source_candidates": 10,
        "canonical_institutional_identities_newly_matched": 0,
        "legally_qualified_corporate_subtypes": 0,
        "independently_verified_governance_and_command_edges": 0,
        "atlas_admitted_typed_relationships": 0,
        "publisher_counts_are_present_day_government_census": False,
        "federal_agency_subtype_inferred_from_corporation_label": False,
        "foundation_nesting_inferred_as_legal_supervision": False,
    }]
    return {
        DISPOSITIONS: wrap("inc15d8-independent-publisher-dispositions",rows,{
            "targeted_source_entries":15,
            "source_observations_accounted_for":15,
            "first_tranche_records_retained":15,
            "cumulative_source_dispositions_independent_category":30,
            "independent_category_unlinked_entries_outside_two_tranches":15,
            "general_top_level_publisher_source_candidates":10,
            "foundation_parent_publisher_grouping":1,
            "nested_foundation_level_one_components":3,
            "amtrak_corporate_publisher_label_unreviewed":1,
            "qualified_statutory_parent_child_edges":0,
            "confirmed_corporate_ownership_edges":0,
        }),
        COVERAGE: wrap("inc15d8-independent-publisher-coverage",cov,{
            "targeted_source_entries":15,
            "source_observations_accounted_for":15,
            "unaccounted_source_records":0,
            "prior_28_15D5_dispositions_unchanged":28,
            "prior_15_15D6_dispositions_unchanged":15,
            "prior_15_15D7_dispositions_unchanged":15,
            "cumulative_independent_category_research_dispositions":30,
            "source_only_unlinked_entries_outside_two_tranches":15,
            "prior_50_whole_edition_canonical_matches_changed":0,
            "prior_181_whole_edition_unlinked_records_recategorized_as_canonical":0,
            "publisher_disposition_does_not_qualify_current_legal_structure":True,
        }),
    }


def run(root=REPO,write=False):
    files = expected(root)
    for p,obj in files.items():
        target = root / p
        if write:
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",
                              encoding="utf-8")
        else:
            deny(target.is_file() and get(root,p)==obj,
                 "derived source/canonical relationship model changed: "+p)
    return {
        "government_manual_edition":PKG,
        "whole_edition_source_entries":231,
        "prior_canonical_links":50,
        "prior_unlinked_entries":181,
        "independent_publisher_category_entries":62,
        "independent_category_provisional_links":17,
        "independent_category_unlinked_source_entries":45,
        "tranche_entries_accounted":15,
        "cumulative_independent_category_source_dispositions":30,
        "remaining_independent_publisher_entries_not_reconciled":15,
        "newly_legally_qualified_canonical_ids":0,
        "qualified_legal_control_edges":0,
        "atlas_published_relationships":0,
        "plan_data_independence_preserved":True
    }


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=REPO)
    parser.add_argument("--write",action="store_true")
    args=parser.parse_args()
    try:print(json.dumps(run(args.root.resolve(),args.write),indent=2))
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
