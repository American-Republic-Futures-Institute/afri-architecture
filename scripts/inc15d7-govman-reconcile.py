#!/usr/bin/env python3
"""INC-15D.7 — replay 15 historically unlinked independent-category publisher entries.

Only 2025 Government Manual publisher observations are represented. Neither
published directory placement nor name similarity qualifies legal powers,
specific federal institutional type, entity succession, fiscal control,
command, Board of Governors identity, present-day status or Atlas admission.
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
    "inc15d6_prior", REPO / "scripts/inc15d6-govman-reconcile.py")
prior = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)
govman = prior.govman
PACKAGE, SHA, BLOB, ORIGINAL = govman.PACKAGE, govman.SHA, govman.BLOB, govman.ORIGINAL
CATEGORY = "Executive Branch: Independent Agencies and Government Corporations"
CURATION = "model/federal/inc15d7-govman-2025-curation.json"
DISPOSITIONS = "model/federal/inc15d7-govman-2025-dispositions.json"
COVERAGE = "model/federal/inc15d7-govman-2025-coverage.json"
MANIFEST = "model/federal/manifest.json"
CANONICAL = "model/federal/executive-independent.json"
IDENTITIES = "model/federal/x12-identities.json"
TRANCHE_IDS = ("127", "321", "132", "133", "134", "136", "137", "138",
               "141", "142", "143", "146", "144", "145", "147")
HISTORICAL = "133"
SYSTEM = "147"
NORMAL = "source_only_institutional_candidate_pending_statutory_confirmation"
HISTORICAL_DISPOSITION = "historically_named_publisher_observation_successor_identity_unverified"
SYSTEM_DISPOSITION = "publisher_composite_system_scope_not_board_identity"
NOTE_NORMAL = ("Named top-level entry from the 2025 publisher directory; its legal form, "
               "powers, current-day existence, oversight, and independent canonical identity remain unqualified.")
NOTE_HISTORICAL = ("Edition-local Corporation for National and Community Service label: possible later "
                   "naming or successor is not independently verified or inferred.")
NOTE_SYSTEM = ("Federal Reserve System is the edition-local publisher's system-level label, "
               "not a verified equivalence to its Board of Governors or a singular supervisory institution.")


def ensure(condition, description):
    if not condition:
        raise ValueError("INC-15D.7 source disposition rejected: " + description)


def read(root, name):
    return json.loads((root / name).read_text(encoding="utf-8"))


def closed(obj, fields, label):
    ensure(type(obj) is dict and set(obj) == set(fields),
           label + " has missing/extra fields")


def wrapper(family, entries, extra):
    return {
        "model_version": "0.1.0",
        "model_family": family,
        "publisher_edition": PACKAGE,
        "publisher_date": "2025-12-31",
        "publisher_original_sha256": SHA,
        "publisher_original_git_blob_sha1": BLOB,
        "publisher_original_repository_path": ORIGINAL,
        "publisher_category": CATEGORY,
        "publisher_total_entries": 231,
        "publisher_independent_category_entries": 62,
        "publisher_independent_category_prior_provisional_canonical_links": 17,
        "publisher_independent_category_unlinked_entries": 45,
        "whole_edition_prior_provisional_canonical_links": 50,
        "whole_edition_prior_unlinked_entries": 181,
        "present_day_federal_legal_institution_denominator": None,
        "independent_legal_review_complete": False,
        "external_worm_original_certified": False,
        "new_canonical_institution_ids": 0,
        "legally_confirmed_source_to_canonical_matches": 0,
        "legally_established_official_successor_identifications": 0,
        "certified_institutional_subtype_assignments": 0,
        "legal_or_operational_authorities_established": 0,
        "atlas_edges_admitted": 0,
        "plan_or_data_observatory_changed": False,
        **extra,
        "items": entries,
    }


def expected(root=REPO):
    # INC-15D.6 validation itself replays INC-15D.5 and the original 8MB
    # publisher XML, and rejects drift to either earlier original-source cohort.
    prior.run(root)
    source = govman.outputs(root)
    observed = source[govman.OUTPUTS["directory"]]["items"]
    cross = source[govman.OUTPUTS["crosswalk"]]["items"]
    covered = source[govman.OUTPUTS["coverage"]]["items"]
    ensure(len(observed) == len(cross) == 231 and len(covered) == 22,
           "historical original source census changed")
    by_source = {x["source_entity_key"]: x for x in observed}
    by_xwalk = {x["source_entity_key"]: x for x in cross}
    ensure(len(by_source) == len(by_xwalk) == 231 and
           sum(x["canonical_id"] is not None for x in cross) == 50 and
           sum(x["canonical_id"] is None for x in cross) == 181,
           "missing or invented publisher/canonical identifiers")
    category = [x for x in observed if x["published_category"] == CATEGORY]
    linked = [x for x in category if by_xwalk[x["source_entity_key"]]["canonical_id"] is not None]
    unlinked = [x for x in category if by_xwalk[x["source_entity_key"]]["canonical_id"] is None]
    category_coverage = [x for x in covered if
                         x["population_kind"] == "publisher_category" and
                         x["publisher_partition_name"] == CATEGORY]
    ensure(len(category) == 62 and len(linked) == 17 and len(unlinked) == 45 and
           len(category_coverage) == 1 and
           category_coverage[0]["publisher_entry_denominator"] == 62 and
           category_coverage[0]["provisional_canonical_links"] == 17 and
           category_coverage[0]["unresolved_publisher_entries"] == 45 and
           category_coverage[0]["current_legal_first_level_institution_denominator"] is None,
           "independent publisher category population/coverage changed")
    selected = unlinked[:15]
    ensure(tuple(x["source_entity_local_id"] for x in selected) == TRANCHE_IDS,
           "first 15 unlinked publisher entities or source order changed")
    ensure(all(x["source_element_tag"] == "Entity" and
               x["published_parent_key"] is None and
               x["published_depth"] == 0 and
               x["published_kind"] == "Parent" and
               x["publisher_category_scope"] == "independent_publisher" and
               x["directory_nesting_only"] is True and
               x["independent_legal_review_complete"] is False and
               x["current_organization_verified"] is False and
               x["mission_text_is_legal_authority"] is False
               for x in selected),
           "top-level directory entity falsely treated as authoritative legal entity")
    ensure(all(by_xwalk[x["source_entity_key"]]["canonical_id"] is None and
               by_xwalk[x["source_entity_key"]]["legal_identity_certified"] is False and
               by_xwalk[x["source_entity_key"]]["legal_authority_inferred"] is False and
               by_xwalk[x["source_entity_key"]]["command_delegation_inferred"] is False
               for x in selected),
           "source-to-canonical identity or exercised authority falsely asserted")

    # Source-to-canonical reconciliation must detect an existing exact name,
    # but never silently mint a new identity or equate a system to one organ.
    independent = read(root, CANONICAL)["items"]
    identities = read(root, IDENTITIES)["items"]
    existing_canonical_ids = {x["id"] for x in independent}
    existing_identity_ids = {x["canonical_id"] for x in identities}
    ensure(len(existing_canonical_ids) == len(independent) == 18 and
           len(existing_identity_ids) == len(identities) == 61 and
           existing_canonical_ids.issubset(existing_identity_ids),
           "canonical independent organizations or X12 identity baseline changed")
    ensure(all(x["branch_id"] == "BR-FED-EXE" and
               x["parent_id"] == "BR-FED-EXE" for x in independent),
           "existing independent organization classification changed")
    exact_names = {x["name"] for x in independent}
    ensure(not any(x["published_name"] in exact_names for x in selected),
           "existing exact canonical identity requires separate qualified review")

    cur = read(root, CURATION)
    closed(cur, ("model_version", "model_family", "source_package_id",
                 "source_original_sha256", "publisher_category", "source_category_entries",
                 "unlinked_publisher_category_entries", "tranche_entry_count", "scope",
                 "source_entry_not_canonical_agency",
                 "independently_certified_legal_identity_count",
                 "confirmed_current_successor_identity_count",
                 "independent_worm_custody_verified",
                 "legal_or_operational_claims_created", "items"),
           "curation envelope")
    ensure(cur["model_version"] == "0.1.0" and
           cur["model_family"] == "inc15d7-independent-publisher-curation" and
           cur["source_package_id"] == PACKAGE and
           cur["source_original_sha256"] == SHA and
           cur["publisher_category"] == CATEGORY and
           cur["source_category_entries"] == 62 and
           cur["unlinked_publisher_category_entries"] == 45 and
           cur["tranche_entry_count"] == 15 and
           cur["scope"] == "first_15_previously_unlinked_top_level_2025_publisher_entries" and
           cur["source_entry_not_canonical_agency"] is True and
           cur["independently_certified_legal_identity_count"] == 0 and
           cur["confirmed_current_successor_identity_count"] == 0 and
           cur["independent_worm_custody_verified"] is False and
           cur["legal_or_operational_claims_created"] is False and
           type(cur["items"]) is list and len(cur["items"]) == 15,
           "curation scope, source edition or false legal/reclassification assertion")
    curated = {}
    for row in cur["items"]:
        closed(row, ("source_entity_local_id", "published_name", "source_entity_key",
                     "source_xml_xpath", "disposition", "canonical_component_id",
                     "provisional_alias_target_id", "official_successor_identity_verified",
                     "federal_reserve_board_equivalence_verified",
                     "legal_component_status_independently_verified",
                     "government_entity_subtype_qualified", "reviewed_evidence_basis",
                     "review_note"), "curated source row")
        local = row["source_entity_local_id"]
        ensure(type(local) is str and re.fullmatch(r"[1-9][0-9]*", local),
               "invalid edition-local identifier")
        key = PACKAGE + ":" + local
        ensure(key not in curated, "duplicate edition-local source ID " + key)
        ensure(row["source_entity_key"] == key and
               row["canonical_component_id"] is None and
               row["provisional_alias_target_id"] is None and
               row["official_successor_identity_verified"] is False and
               row["federal_reserve_board_equivalence_verified"] is False and
               row["legal_component_status_independently_verified"] is False and
               row["government_entity_subtype_qualified"] is False and
               row["reviewed_evidence_basis"] ==
                   "retained_2025_government_manual_publisher_original_only",
               "existing canonical identity, legal subtype, successor, or Federal Reserve Board match invented")
        curated[key] = row
    ensure(set(curated) == {x["source_entity_key"] for x in selected},
           "missing or foreign entries in the exact selected 15")

    rows = []
    for x in selected:
        key, local = x["source_entity_key"], x["source_entity_local_id"]
        c = curated[key]
        special = local == HISTORICAL
        system = local == SYSTEM
        disposition = (HISTORICAL_DISPOSITION if special else
                       SYSTEM_DISPOSITION if system else NORMAL)
        note = NOTE_HISTORICAL if special else NOTE_SYSTEM if system else NOTE_NORMAL
        ensure(c["published_name"] == x["published_name"] and
               c["source_xml_xpath"] == x["source_xml_xpath"] and
               c["disposition"] == disposition and
               c["review_note"] == note and
               (not special or x["published_name"] ==
                "Corporation for National and Community Service") and
               (not system or x["published_name"] == "Federal Reserve System"),
               "historical name, system label, immutable XPath, or reviewed disposition altered")
        rows.append({
            "id": "INC15D7-DISP-" + local,
            "source_entity_key": key,
            "source_entity_local_id": local,
            "publisher_edition": PACKAGE,
            "published_name": x["published_name"],
            "publisher_category": x["published_category"],
            "publisher_category_scope": x["publisher_category_scope"],
            "publisher_element_tag": x["source_element_tag"],
            "published_parent_key": x["published_parent_key"],
            "publisher_depth": x["published_depth"],
            "published_order": x["published_order"],
            "publisher_original_xpath": x["source_xml_xpath"],
            "publisher_original_sha256": SHA,
            "publisher_original_git_blob_sha1": BLOB,
            "directory_grouping_not_entity_legal_classification": True,
            "disposition": disposition,
            "disposition_rationale": note,
            "publisher_mission_text_present": bool(x["mission_statement_as_published"]),
            "publisher_mission_text_not_legal_authority": True,
            "existing_canonical_id": None,
            "unverified_alias_candidate_id": None,
            "historical_name_current_successor_unverified": special,
            "composite_federal_reserve_system_not_board_of_governors": system,
            "legal_agency_or_corporation_subtype_certified": False,
            "current_organization_2026_verified": False,
            "legal_identity_certified": False,
            "statutory_original_independently_captured_for_this_entity": False,
            "appropriation_or_fiscal_authority_verified": False,
            "oversight_or_reporting_chain_verified": False,
            "legal_delegation_or_command_verified": False,
            "actual_statutory_action_observed": False,
            "adl1_certified": False,
            "independent_legal_review_complete": False,
            "external_worm_custody_certified": False,
            "atlas_graph_admitted": False,
            "plan_or_observatory_inference_created": False,
        })
    ensure(Counter(x["disposition"] for x in rows) == {
        NORMAL: 13, HISTORICAL_DISPOSITION: 1, SYSTEM_DISPOSITION: 1
    }, "source-disposition partition must be 13 normal, 1 history, 1 composite system")

    m = read(root, MANIFEST)
    ext = m.get("federal_institutional_breadth_15d7_extension")
    closed(ext, ("source_edition", "original_source_sha256", "curation_model_path",
                 "disposition_model_path", "coverage_model_path",
                 "publisher_independent_category_entries",
                 "publisher_independent_category_prior_linked",
                 "publisher_independent_category_prior_unlinked",
                 "publisher_selected_and_accounted", "historical_name_unreviewed_entries",
                 "system_not_board_equivalence_unreviewed_entries",
                 "new_canonical_id_matches", "independent_legal_review_complete",
                 "current_legal_institution_denominator",
                 "publisher_category_is_certified_federal_agency_census",
                 "atlas_graph_admitted", "plan_or_data_observatory_changed"),
           "manifest 15D.7 source declaration")
    ensure(ext["source_edition"] == PACKAGE and
           ext["original_source_sha256"] == SHA and
           ext["curation_model_path"] == CURATION and
           ext["disposition_model_path"] == DISPOSITIONS and
           ext["coverage_model_path"] == COVERAGE and
           ext["publisher_independent_category_entries"] == 62 and
           ext["publisher_independent_category_prior_linked"] == 17 and
           ext["publisher_independent_category_prior_unlinked"] == 45 and
           ext["publisher_selected_and_accounted"] == 15 and
           ext["historical_name_unreviewed_entries"] == 1 and
           ext["system_not_board_equivalence_unreviewed_entries"] == 1 and
           ext["new_canonical_id_matches"] == 0 and
           ext["independent_legal_review_complete"] is False and
           ext["current_legal_institution_denominator"] is None and
           ext["publisher_category_is_certified_federal_agency_census"] is False and
           ext["atlas_graph_admitted"] is False and
           ext["plan_or_data_observatory_changed"] is False and
           all(path in m["models"] for path in (CURATION, DISPOSITIONS, COVERAGE)) and
           len(set(m["models"])) == len(m["models"]),
           "incorrect manifest research publication contract")

    aggregate = [{
        "id": "INC15D7-COV-INDEPENDENT-001",
        "publisher_category": CATEGORY,
        "publisher_category_entries": 62,
        "existing_publisher_source_to_canonical_provisional_links": 17,
        "publisher_category_entries_unlinked_to_canonical": 45,
        "selected_first_15_unlinked_top_level_publisher_entries": 15,
        "publisher_entries_accounted_for": 15,
        "category_unlinked_entries_outside_this_tranche": 30,
        "ordinary_source_only_organizational_candidates": 13,
        "historical_name_with_unverified_successor": 1,
        "composite_system_not_equivalent_to_board": 1,
        "new_canonical_identity_matches": 0,
        "publisher_source_entries_newly_linked_to_canonical": 0,
        "independently_verified_2026_entity_status": 0,
        "legal_subtype_or_statutory_authority_certified": 0,
        "operational_action_or_fiscal_reporting_certified": 0,
        "atlas_publication_count": 0,
        "publisher_counts_not_federal_legal_institution_denominator": True,
        "current_law_or_organization_status_independently_certified": False,
    }]
    return {
        DISPOSITIONS: wrapper("inc15d7-independent-publisher-dispositions", rows, {
            "selected_unlinked_edition_entries": 15,
            "source_dispositions_accounted": 15,
            "ordinary_source_only_organizational_candidates": 13,
            "historical_name_successor_unverified": 1,
            "system_level_not_board_of_governors_identity": 1,
            "remaining_unlinked_publisher_category_entries": 30,
            "historical_publisher_entry_disposition_is_canonical_match": False,
            "system_and_governing_board_are_identity_equivalent": False,
        }),
        COVERAGE: wrapper("inc15d7-independent-publisher-coverage", aggregate, {
            "selected_publisher_entries": 15,
            "selected_entries_accounted": 15,
            "unaccounted_selected_entries": 0,
            "publisher_source_category_remaining_unlinked": 30,
            "earlier_28_INC15D5_dispositions_preserved": 28,
            "earlier_15_INC15D6_dispositions_preserved": 15,
            "earlier_50_canonical_links_changed": 0,
            "earlier_181_unlinked_entries_reclassified_as_canonical": 0,
            "publisher_whole_edition_crosswalk_changed": False,
            "federal_reserve_system_auto_mapped_to_board": False,
            "historical_corporation_name_auto_mapped_to_successor": False,
        }),
    }


def run(root=REPO, write=False):
    outputs=expected(root)
    for path, data in outputs.items():
        dest = root / path
        if write:
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n",
                            encoding="utf-8")
        else:
            ensure(dest.is_file() and read(root,path) == data,
                   "committed original-source-derived data drifted " + path)
    return {
        "govman_publisher_edition": PACKAGE,
        "original_xml_sha256": SHA,
        "whole_edition_records": 231,
        "earlier_provisional_canonical_links": 50,
        "earlier_unlinked_source_entries": 181,
        "independent_publisher_category_records": 62,
        "prior_canonical_links_in_category": 17,
        "prior_unlinked_category_entries": 45,
        "inc15d7_source_dispositions": 15,
        "independent_category_unlinked_entries_outside_tranche": 30,
        "new_legal_entity_identifications": 0,
        "false_federal_reserve_governing_board_identity": False,
        "false_historical_name_successor_identity": False,
        "atlas_edges_admitted": 0,
        "separate_plan_or_data_modified": False,
    }


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=REPO)
    parser.add_argument("--write",action="store_true",
                        help="deliberately regenerate the two source-derived research outputs")
    args=parser.parse_args()
    try:print(json.dumps(run(args.root.resolve(),args.write),indent=2))
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
