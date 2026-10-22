#!/usr/bin/env python3
"""INC-15D.5 — replay 28 bounded publisher-entry dispositions from a retained official XML.

All cohort nodes are 2025 Government Manual source observations. A publisher's
hierarchy is not a verified present-day command chain, statutory delegation,
independently established federal entity, or fiscal authority.
No network is required, no new canonical identifiers are allocated.
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
    "govman_inc15d", REPO / "scripts/inc15d-govman-directory.py")
govman = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(govman)

PACKAGE = govman.PACKAGE
ORIGINAL_SHA = govman.SHA
ORIGINAL_BLOB = govman.BLOB
ORIGINAL = govman.ORIGINAL
CURATION = "model/federal/inc15d5-govman-2025-curation.json"
DISPOSITIONS = "model/federal/inc15d5-govman-2025-dispositions.json"
COVERAGE = "model/federal/inc15d5-govman-2025-coverage.json"
SEEDS = "model/federal/expansion/department-seeds.json"
GRANULES = "model/federal/department-structure/candidate-granules.json"
DEPARTMENTS = "model/federal/executive-departments.json"
IDENTITIES = "model/federal/x12-identities.json"
MANIFEST = "model/federal/manifest.json"
DATE = "2025-12-31"
DISPOSITION = "source_only_institutional_candidate_pending_statutory_confirmation"
QUALIFICATION = "edition_local_research_curation_not_independent_identity_or_legal_review"
ROOTS = (
    ("120", "Department of the Interior", "ORG-FED-EXE-DEP-INTERIOR", 10),
    ("323", "Department of Labor", "ORG-FED-EXE-DEP-LABOR", 9),
    ("124", "Department of Transportation", "ORG-FED-EXE-DEP-TRANSPORTATION", 9),
)
ALLOWED_RESOLUTIONS = {
    "exact_official_details_page_verified",
    "present_in_edition_navigation_but_granule_id_not_reconciled",
}
RATIONALES = {
    False: "2025 publisher's first-level named directory component; no independently verified canonical identity, present-day status, statutory authority or command.",
    True: "Explicit earlier first-level research seed is only source-index correspondence; no independently verified legal identity, present-day parentage, power or command.",
}


def ensure(condition, reason):
    if not condition:
        raise ValueError("INC-15D.5 reconciliation rejected: " + reason)


def read(root, path):
    return json.loads((root / path).read_text(encoding="utf-8"))


def fields(data, expected, label):
    ensure(type(data) is dict and set(data) == set(expected), label + " closed field contract")


def wrapper(model_family, items, extra):
    return {
        "model_version": "0.1.0",
        "model_family": model_family,
        "source_package_id": PACKAGE,
        "source_publication_date": DATE,
        "source_original_sha256": ORIGINAL_SHA,
        "source_original_git_blob_sha1": ORIGINAL_BLOB,
        "source_original_repository_path": ORIGINAL,
        "publisher_whole_edition_entry_count": 231,
        "prior_provisional_canonical_links": 50,
        "prior_unlinked_publisher_entries": 181,
        "whole_federal_legal_institution_denominator": None,
        "current_first_level_institution_denominator": None,
        "independent_legal_review_complete": False,
        "independent_worm_custody_verified": False,
        "new_canonical_ids_minted": 0,
        "statutorily_qualified_component_identities": 0,
        "statutory_authority_verified": 0,
        "atlas_published_relationships": 0,
        **extra,
        "items": items,
    }


def expected(root=REPO):
    # Reparse the original 8.1 MB GovInfo XML, cryptographically verify the
    # SHA-256 and Git blob, then regenerate the entire existing 231/50/181
    # source-to-canonical baseline. It is not permissible to rewrite that base.
    prior = govman.outputs(root)
    for path, content in prior.items():
        ensure((root / path).is_file() and
               (root / path).read_text(encoding="utf-8") == govman.encode(content),
               "baseline original XML replay or 50 canonical links drifted " + path)
    directory = prior[govman.OUTPUTS["directory"]]
    crosswalk = prior[govman.OUTPUTS["crosswalk"]]
    coverage = prior[govman.OUTPUTS["coverage"]]
    ensure((directory["publisher_entry_count"], crosswalk["explicit_provisional_links"],
            crosswalk["unresolved_entries"], len(coverage["items"])) == (231, 50, 181, 22),
           "prior universe or crosswalk changed")

    all_entries = directory["items"]
    by_key = {x["source_entity_key"]: x for x in all_entries}
    xwalk = {x["source_entity_key"]: x for x in crosswalk["items"]}
    ensure(len(by_key) == len(xwalk) == 231, "duplicate or missing publisher source identity")

    departments = {x["id"]: x for x in read(root, DEPARTMENTS)["items"]}
    identities = {x["canonical_id"]: x for x in read(root, IDENTITIES)["items"]}
    seeds = read(root, SEEDS)["items"]
    granules = read(root, GRANULES)["items"]
    seed_by = {}
    for seed in seeds:
        if seed.get("parent_department_id") not in {x[2] for x in ROOTS}:
            continue
        key = (seed["parent_department_id"], seed["name"])
        ensure(key not in seed_by, "ambiguous earlier candidate identity " + str(key))
        seed_by[key] = seed
    granule_by = {}
    for granule in granules:
        if granule.get("parent_department_id") not in {x[2] for x in ROOTS}:
            continue
        key = granule["prior_candidate_id"]
        ensure(key not in granule_by, "duplicated earlier granule research candidate")
        granule_by[key] = granule

    curation = read(root, CURATION)
    fields(curation, ("model_version", "model_family", "source_package_id",
           "original_source_sha256", "disposition_qualification",
           "all_entries_checked_as_legal_institutions",
           "independently_qualified_canonical_identity_count",
           "current_first_level_institution_denominator", "items"), "research curation")
    ensure(curation["model_version"] == "0.1.0" and
           curation["model_family"] == "inc15d5-govman-2025-curation" and
           curation["source_package_id"] == PACKAGE and
           curation["original_source_sha256"] == ORIGINAL_SHA and
           curation["disposition_qualification"] == QUALIFICATION and
           curation["all_entries_checked_as_legal_institutions"] is False and
           curation["independently_qualified_canonical_identity_count"] == 0 and
           curation["current_first_level_institution_denominator"] is None and
           type(curation["items"]) is list and len(curation["items"]) == 28,
           "curation source edition, scope, count, or legal status")

    curator_by_key = {}
    for curator in curation["items"]:
        fields(curator, ("source_entity_local_id", "published_name",
               "published_parent_key", "canonical_department_anchor_id",
               "disposition", "prior_research_candidate_id", "rationale"),
               "curated publisher entry")
        local = curator["source_entity_local_id"]
        ensure(type(local) is str and re.fullmatch(r"[1-9][0-9]*", local),
               "invalid source-local identifier")
        key = PACKAGE + ":" + local
        ensure(key not in curator_by_key, "duplicate curated source entry " + key)
        ensure(curator["disposition"] == DISPOSITION and
               type(curator["rationale"]) is str and
               curator["rationale"] in RATIONALES.values(),
               "unsupported disposition or inflated legal assessment")
        curator_by_key[key] = curator

    expected_keys = set()
    selected = []
    cohort_rows = []
    for root_id, dept_name, canonical_id, target in ROOTS:
        root_key = PACKAGE + ":" + root_id
        org = by_key.get(root_key)
        d = departments.get(canonical_id)
        ident = identities.get(canonical_id)
        ensure(org is not None and org["published_name"] == dept_name and
               org["published_parent_key"] is None and
               org["source_element_tag"] == "Entity" and
               xwalk[root_key]["canonical_id"] == canonical_id,
               "wrong or replaced Cabinet root " + root_key)
        ensure(d is not None and d["name"] == dept_name and d["branch_id"] == "BR-FED-EXE" and
               d["parent_id"] == "BR-FED-EXE" and
               ident is not None and ident["canonical_id"] == canonical_id and
               ident["branch_id"] == "BR-FED-EXE" and
               ident["adl1_certified"] is False and
               ident["independent_legal_review_complete"] is False,
               "canonical department anchor or branch falsified " + canonical_id)

        children = sorted((x for x in all_entries if
                           x["published_parent_key"] == root_key),
                          key=lambda x: x["published_order"])
        ensure(len(children) == target and
               {x["published_order"] for x in children} == set(range(1, target + 1)),
               "publisher subtree count/order changed " + dept_name)
        # These are exactly the unlinked first-level nodes, not the whole
        # (legal) department workforce/office universe.
        ensure(all(x["source_element_tag"] == "SubEntityLevelOne" and
                   x["published_category"] == "Executive Branch: Departments" and
                   x["publisher_category_scope"] == "cabinet_publisher" and
                   x["directory_nesting_only"] is True and
                   xwalk[x["source_entity_key"]]["canonical_id"] is None and
                   xwalk[x["source_entity_key"]]["legal_identity_certified"] is False
                   for x in children), "incorrect first-level source/identity claim")

        n_seeds = 0
        n_granules = 0
        n_seed_no_granule = 0
        for source in children:
            source_key = source["source_entity_key"]
            expected_keys.add(source_key)
            c = curator_by_key.get(source_key)
            ensure(c is not None and c["published_name"] == source["published_name"] and
                   c["published_parent_key"] == root_key and
                   c["canonical_department_anchor_id"] == canonical_id,
                   "missing or mis-parented edition-local disposition " + source_key)
            old = seed_by.get((canonical_id, source["published_name"]))
            prior_id = old["id"] if old is not None else None
            ensure(c["prior_research_candidate_id"] == prior_id and
                   c["rationale"] == RATIONALES[prior_id is not None],
                   "earlier research seed mismatch or false identity link " + source_key)
            prior_crosswalk = granule_by.get(prior_id) if prior_id else None
            ensure((prior_id is None and prior_crosswalk is None) or
                   (prior_crosswalk is not None and
                    prior_crosswalk["prior_candidate_id"] == prior_id and
                    prior_crosswalk["candidate_label"] == source["published_name"] and
                    prior_crosswalk["parent_department_id"] == canonical_id and
                    prior_crosswalk["granule_resolution"] in ALLOWED_RESOLUTIONS and
                    prior_crosswalk["full_adl1_completed"] is False and
                    prior_crosswalk["individual_direct_supervisor_verified"] is False and
                    prior_crosswalk["legal_power_verified"] is False),
                   "prior research candidate would falsely certify source or power")
            url = prior_crosswalk["verified_granule_detail_url"] if prior_crosswalk else None
            resolution = prior_crosswalk["granule_resolution"] if prior_crosswalk else None
            if prior_id:
                n_seeds += 1
                if resolution == "exact_official_details_page_verified":
                    n_granules += 1
                    ensure(url == ("https://www.govinfo.gov/app/details/" + PACKAGE +
                                   "/" + PACKAGE + "-" + source["source_entity_local_id"]),
                           "prior granule refers to different original source entity")
                else:
                    n_seed_no_granule += 1
                    ensure(url is None, "previously unresolved granule falsely verified")
            selected.append({
                "id": "INC15D5-DISP-" + source["source_entity_local_id"],
                "source_entity_key": source_key,
                "source_entity_local_id": source["source_entity_local_id"],
                "publisher_edition": PACKAGE,
                "published_name": source["published_name"],
                "published_parent_key": root_key,
                "published_department_name": dept_name,
                "canonical_department_anchor_id": canonical_id,
                "canonical_component_id": None,
                "published_element_tag": source["source_element_tag"],
                "published_order": source["published_order"],
                "source_xml_xpath": source["source_xml_xpath"],
                "source_original_sha256": ORIGINAL_SHA,
                "source_original_git_blob_sha1": ORIGINAL_BLOB,
                "disposition": c["disposition"],
                "disposition_rationale": c["rationale"],
                "previous_research_candidate_id": prior_id,
                "previous_granule_research_id": prior_crosswalk["id"] if prior_crosswalk else None,
                "previous_granule_resolution": resolution,
                "previous_granule_url": url,
                "identity_reconciliation_state": "source_only_edition_local_accounted_identity_unresolved",
                "publisher_nesting_only_not_legal_parentage": True,
                "present_day_component_verified": False,
                "legal_identity_certified": False,
                "independently_retained_component_statute_original": False,
                "specific_statutory_authority_verified": False,
                "operational_command_verified": False,
                "direct_supervision_verified": False,
                "congressional_fiscal_control_verified": False,
                "independent_legal_review_complete": False,
                "adl1_certified": False,
                "atlas_graph_admitted": False,
            })
        ensure(n_seeds == 2, "earlier seed overlap missing from " + dept_name)
        cohort_rows.append({
            "id": "INC15D5-COV-" + root_id,
            "published_department_name": dept_name,
            "publisher_department_root_key": root_key,
            "canonical_department_anchor_id": canonical_id,
            "publisher_full_subtree_entries": target + 1,
            "existing_provisional_department_root_links": 1,
            "selected_first_level_unlinked_entries": target,
            "disposition_accounted_entries": target,
            "new_canonical_component_matches": 0,
            "prior_research_seed_correspondences": n_seeds,
            "prior_verified_govinfo_details_page_references": n_granules,
            "prior_unreconciled_govinfo_details_page_references": n_seed_no_granule,
            "source_only_identity_unresolved": target,
            "legal_component_identities_certified": 0,
            "independent_legal_review_complete": False,
            "observed_legal_command_relationships": 0,
            "source_date_is_current_law_certification": False,
        })
    ensure(set(curator_by_key) == expected_keys and len(selected) == 28 and
           len({x["source_entity_key"] for x in selected}) == 28,
           "missing/foreign/duplicate source identity in exact 28-item selected cohort")
    ensure(Counter(x["previous_research_candidate_id"] is not None for x in selected)[True] == 6 and
           sum(x["prior_verified_govinfo_details_page_references"] for x in cohort_rows) == 5 and
           sum(x["prior_unreconciled_govinfo_details_page_references"] for x in cohort_rows) == 1,
           "unqualified six earlier candidate / five locator correspondence")

    manifest = read(root, MANIFEST)
    ext = manifest.get("federal_institutional_breadth_15d5_extension", {})
    fields(ext, ("source_edition", "original_source_sha256", "curation_model_path",
                 "disposition_model_path", "coverage_model_path", "publisher_entries_selected",
                 "publisher_entries_accounted", "earlier_research_candidate_overlap",
                 "new_canonical_component_matches", "independent_legal_review_complete",
                 "current_first_level_institution_denominator", "publisher_entry_count_is_legal_denominator",
                 "website_atlas_published", "policy_recommendations_created"),
           "manifest INC-15D.5 extension")
    ensure(ext["source_edition"] == PACKAGE and ext["original_source_sha256"] == ORIGINAL_SHA and
           ext["curation_model_path"] == CURATION and
           ext["disposition_model_path"] == DISPOSITIONS and
           ext["coverage_model_path"] == COVERAGE and
           ext["publisher_entries_selected"] == 28 and
           ext["publisher_entries_accounted"] == 28 and
           ext["earlier_research_candidate_overlap"] == 6 and
           ext["new_canonical_component_matches"] == 0 and
           ext["independent_legal_review_complete"] is False and
           ext["current_first_level_institution_denominator"] is None and
           ext["publisher_entry_count_is_legal_denominator"] is False and
           ext["website_atlas_published"] is False and
           ext["policy_recommendations_created"] is False and
           all(path in manifest["models"] for path in (CURATION, DISPOSITIONS, COVERAGE)) and
           len(manifest["models"]) == len(set(manifest["models"])),
           "manifest source/status/registration mismatch")

    disposition_out = wrapper("inc15d5-govman-2025-dispositions", selected, {
        "selected_source_entry_count": 28,
        "selected_entries_accounted_for": 28,
        "unresolved_legal_component_identity_count": 28,
        "source_only_pending_statutory_confirmation": 28,
        "prior_research_candidate_correspondences": 6,
        "provisional_canonical_component_matches": 0,
        "source_directory_nesting_is_legal_parentage": False,
        "publisher_mission_text_is_verified_legal_authority": False,
        "current_day_organization_status_qualified": False,
    })
    coverage_out = wrapper("inc15d5-govman-2025-coverage", cohort_rows, {
        "department_cohort_count": 3,
        "publisher_entries_targeted": 28,
        "publisher_entries_accounted_for": 28,
        "unaccounted_target_entries": 0,
        "source_only_pending_statutory_confirmation": 28,
        "source_only_identity_unresolved": 28,
        "prior_research_seed_correspondences": 6,
        "prior_exact_govinfo_details_references": 5,
        "prior_unreconciled_govinfo_details_references": 1,
        "canonical_component_matches": 0,
        "existing_50_provisional_links_changed": 0,
        "earlier_181_unlinked_source_entries_reclassified_as_linked": 0,
        "publisher_entry_population_is_legal_denominator": False,
        "date_is_current_institutional_authority_certification": False,
        "source_edition_additive_across_prior_editions": False,
    })
    return {DISPOSITIONS: disposition_out, COVERAGE: coverage_out}


def run(root=REPO, write=False):
    files = expected(root)
    for path, obj in files.items():
        full = root / path
        if write:
            full.parent.mkdir(parents=True, exist_ok=True)
            full.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n",
                            encoding="utf-8")
        else:
            ensure(full.is_file() and read(root, path) == obj,
                   "committed derived model differs from original-source replay " + path)
    return {
        "source_edition": PACKAGE,
        "publisher_original_sha256": ORIGINAL_SHA,
        "publisher_whole_edition_entries": 231,
        "cohort_publisher_entries": 28,
        "explicit_dispositions": 28,
        "existing_candidate_correspondences": 6,
        "new_canonical_component_matches": 0,
        "legally_certified_components": 0,
        "published_atlas_edges": 0,
        "status": "source_only_edition_local_research_unratified",
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--root", type=Path, default=REPO)
    args = ap.parse_args()
    try:
        print(json.dumps(run(args.root.resolve(), args.write), indent=2))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
