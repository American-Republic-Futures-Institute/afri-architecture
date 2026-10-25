#!/usr/bin/env python3
"""INC-15E.1B: enforce original GPO statute custody and scope-limited typed status.

A codified legal clause is not a legal entity ID, general constitutional
status finding, independently reviewed legal certification, or live Atlas
edge. This validator is offline and replays the original 2025 GovMan source
and all previously accepted INC-15D/INC-15E.1A identity contracts.
"""
from __future__ import annotations
import argparse
import importlib.util
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]

def module(key,path):
    spec=importlib.util.spec_from_file_location(key,ROOT/path)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

capture=module("inc15e1b_gpo_capture",Path("scripts/inc15e1b-capture-amtrak-original.py"))
prior=module("inc15e1a_prior",Path("scripts/inc15e1-identity-reconcile.py"))
MODEL="model/federal/inc15e1b-amtrak-legal-status.json"
COVERAGE="model/federal/inc15e1b-amtrak-statutory-source-coverage.json"
TRANSITION="model/federal/inc15e1b-amtrak-status-transition.json"
REGISTRY="model/federal/inc15e1/relationship-type-registry.json"
MANIFEST="model/federal/manifest.json"
CASES="model/federal/inc15e1/identity-adjudications.json"
TYPE="statutory_status_declared_for"
SOURCE="INC15E1B-SRC-USCODE-2024-49-24301"
SUFFIX={
 "evidence/inc15e1b-amtrak-uscode/source-custody.json":"schemas/inc15e1b-amtrak-source-custody.schema.json",
 MODEL:"schemas/inc15e1b-amtrak-legal-status.schema.json",
 COVERAGE:"schemas/inc15e1b-amtrak-source-coverage.schema.json",
 TRANSITION:"schemas/inc15e1b-amtrak-status-transition.schema.json"
}

def require(test,message):
    if not test:
        raise ValueError("INC-15E.1B legal-status evidence contract rejected: "+message)

def read(root,path):
    return json.loads((root/path).read_text(encoding="utf-8"))

def verify(root=ROOT):
    # Full prior original byte retention, 231/50/181 publisher partition,
    # historical Board/System, OPIC and USAID nonpromotion must stay green.
    older=prior.run(root)
    proof=capture.verify(root)
    r=read(root,capture.RECEIPT)
    status=read(root,MODEL)
    coverage=read(root,COVERAGE)
    transition=read(root,TRANSITION)
    for path,schema_path in SUFFIX.items():
        obj=read(root,path)
        schema=read(root,schema_path)
        require(schema.get("$schema")=="https://json-schema.org/draft/2020-12/schema" and
                schema.get("additionalProperties") is False,
                "open or invalid source-model JSON schema "+schema_path)
        prior.schema_check(obj,schema,path)

    d=r["original_sha256"]
    require(r["source_id"]==SOURCE and
            r["source_edition"]==capture.EDITION and
            r["claim_scope"]=="2024_gpo_uscode_edition_only_not_2026_live_code" and
            r["independent_external_WORM_verified"] is False and
            r["independent_professional_legal_review_complete"] is False,
            "statutory source source edition, custody or reviewers unsupported")
    require(status["original_source_sha256"]==d and
            status["statutory_source_id"]==SOURCE and
            status["source_edition"]==capture.EDITION and
            status["release_status"]=="publisher_original_qualified_independent_legal_review_pending" and
            status["relationship_type"]==TYPE and
            status["from_id"]=="STAT-USCODE-2024-49-24301-A" and
            status["to_id"]=="STAT-USCODE-2024-49-24301-AMTRAK" and
            status["existing_canonical_institution_id"] is None and
            status["source_publisher_observation_id"]=="GOVMAN-2025-12-31:160" and
            status["source_observation_is_legal_identity_match"] is False and
            status["qualifies_2024_codified_clause_only"] is True and
            status["qualifies_2026_legal_edition"] is False and
            status["independent_professional_legal_review_complete"] is False and
            status["statutory_epoch_effective_date_independently_adjudicated"] is False and
            status["source_original_qualified"] is True and
            status["canonical_identity_certified"] is False and
            status["current_2026_operations_verified"] is False and
            status["atlas_graph_admitted"] is False and
            status["plan_or_data_observatory_changed"] is False and
            len(status["clauses"])==3,
            "original legal-status relation falsely promoted to canonical/current/Atlas")
    require(status["judicial_interpretation_boundary"]=={
        "case":"Lebron v. National Railroad Passenger Corporation, 513 U.S. 374 (1995)",
        "citation_only_not_new_original_retained":True,
        "constitutional_individual_rights_status_must_be_modeled_separately":True,
        "no_conclusion_that_Amtrak_is_private_for_every_purpose":True},
        "Lebron constitutional-status exception missing or overstated")
    require("not_categorical_private_or_nongovernment_status_for_constitutional_purposes" in status["exclusions"] and
            "not_a_verified_canonical_identity_link" in status["exclusions"] and
            "not_an_ownership_or_command_or_appropriations_edge" in status["exclusions"],
            "statutory treatment exclusions missing")
    require(tuple(x["locator"] for x in status["clauses"])==
            ("24301(a)(1)","24301(a)(2)","24301(a)(3)") and
            all(x["asserts_constitutional_status"] is False and
                x["asserts_actual_company_profits"] is False and
                x["asserts_operational_or_governance_execution"] is False
                for x in status["clauses"]),
            "codified clauses were expanded into actual or constitutional claims")

    previous_case=read(root,CASES)["pilot_cases"][2]
    require(previous_case["id"]=="INC15E1-CASE-AMTRAK-160" and
            previous_case["source_entity_key"]=="GOVMAN-2025-12-31:160" and
            previous_case["comparison_result"]=="unresolved_statutory_classification_original_unretained" and
            previous_case["independent_statutory_identity_review_complete"] is False and
            previous_case["legal_identity_certified"] is False,
            "immutable prior Amtrak research-only identity case changed")
    require(transition["prior_pilot_case_id"]==previous_case["id"] and
            transition["prior_case_release_intact"] is True and
            transition["prior_case_status"]==previous_case["comparison_result"] and
            transition["newly_archived_source_id"]==SOURCE and
            transition["newly_archived_source_edition"]==capture.EDITION and
            transition["newly_archived_original_source_sha256"]==d and
            transition["newly_archived_original_path"]==r["original_repository_path"] and
            transition["new_original_custody_state"]=="retained_GPO_2024_code_original_source_clause_text_verified" and
            transition["statutory_status_relationship_predicate"]==TYPE and
            transition["statutory_status_model_path"]==MODEL and
            transition["statutory_status_from"]==status["from_id"] and
            transition["statutory_status_to"]==status["to_id"] and
            transition["statutory_subject_not_ARFI_canonical_identity"] is True and
            transition["2025_GovMan_publisher_source_observation"]=="GOVMAN-2025-12-31:160" and
            transition["cross_edition_name_comparison_legal_identity_certified"] is False and
            transition["independent_professional_legal_classification_review_complete"] is False and
            transition["statutory_2026_currentness_checked"] is False and
            transition["prior_2025_directory_source_observation_rewritten"] is False and
            transition["constitutional_individual_rights_status_from_statute_alone_inferred"] is False and
            transition["atlas_graph_admitted"] is False,
            "legal status progression invents an identity or crosses source epochs")

    predicate=[x for x in read(root,REGISTRY)["relationship_types"] if x["id"]==TYPE]
    require(len(predicate)==1 and predicate[0]["from_node_kind"]=="statutory_clause" and
            predicate[0]["to_node_kind"]=="statutory_named_subject" and
            predicate[0]["required_evidence_class"]=="retained_statutory_original" and
            predicate[0]["asserts_legal_identity_or_authority"] is False and
            predicate[0]["typed_scope_and_effective_date_required"] is True and
            predicate[0]["qualification_guard"]=="original_statutory_clause_verified_independent_review_pending" and
            predicate[0]["allows_automatic_publisher_tree_or_name_inference"] is False,
            "ten-type shared directional registry is not legally scoped")

    required={
        "model_version":"0.1.0","model_family":"inc15e1b-amtrak-statutory-source-coverage",
        "source_edition":capture.EDITION,
        "source_id":SOURCE,
        "source_original_sha256":d,
        "source_original_git_blob_sha1":r["git_blob_sha1"],
        "statute_section":"49 U.S.C. 24301(a)(1)-(3)",
        "original_source_html_retained_and_replayed":True,
        "official_first_party_source_originals":1,
        "archived_2024_statutory_subclauses_verified":3,
        "statute_local_named_subjects":1,
        "directional_statutory_status_edges":1,
        "additional_canonical_institutional_IDs":0,
        "historical_GovMan_to_statutory_subject_legal_equivalence_matches":0,
        "government_corporation_total_legal_taxonomy_certifications":0,
        "source_only_relationship_qualification":"2024_publisher_original_clause_text_verified_not_independently_legal_adjudicated",
        "independently_professional_legal_reviewed_status_edges":0,
        "additional_2026_current_law_originals_retained":0,
        "GPO_edition_temporal_scope_only":True,
        "statute_effective_date_reconciled_against_all_enactments":False,
        "current_2026_operations_verified":False,
        "broad_constitutional_government_status_assessed":False,
        "judicial_Lebron_original_retained":False,
        "external_independent_WORM_original_verified":False,
        "atlas_relationships_admitted":0,
        "plan_or_data_observatory_changed":False,
        "source_to_canonical_crosswalk_entries_unchanged":231,
        "prior_provisional_name_links_unchanged":50,
        "prior_unlinked_GovMan_observations_unchanged":181,
        "separate_Source_GovMan_epoch":"GOVMAN-2025-12-31",
        "statutory_source_and_GovMan_edition_not_identity_equivalence":True,
    }
    require(coverage==required,
            "source coverage claims legal certification, contemporary edition, Atlas or extra identities")

    manifest=read(root,MANIFEST)
    x=manifest.get("federal_identity_interoperability_15e1b_extension")
    require(type(x) is dict and
            x["official_original_sha256"]==d and
            x["retained_official_original_path"]==r["original_repository_path"] and
            x["source_custody_path"]==capture.RECEIPT.as_posix() and
            x["statutory_treatment_path"]==MODEL and
            x["supplemental_case_path"]==TRANSITION and
            x["statutory_coverage_path"]==COVERAGE and
            x["original_source_edition"]==capture.EDITION and
            x["qualified_original_statutory_clause_count"]==3 and
            x["publisher_original_supported_statutory_status_edges"]==1 and
            x["independently_legal_reviewed_status_edges"]==0 and
            x["canonical_identity_links_modified"]==0 and
            x["source_to_canonical_observation_equivalences_added"]==0 and
            x["current_2026_institutional_status_certified"] is False and
            x["publisher_GovMan_original_2025_crosswalk_changed"] is False and
            x["atlas_graph_changed"] is False and
            x["plan_or_data_observatory_changed"] is False and
            all(p in manifest["models"] for p in (MODEL,COVERAGE,TRANSITION)) and
            len(set(manifest["models"]))==len(manifest["models"]),
            "architecture manifest overstates legal identity or silently changes older models")
    require(older["source_to_canonical_legal_matches_qualified"]==0 and
            older["canonically_unlinked_entries"]==181 and
            older["prior_provisional_canonical_links"]==50,
            "source-to-canonical baseline regression")

    return {
        "GPO_2024_original_sha256":d,
        "source_original_bytes_verified":proof["byte_length"],
        "source_statutory_clauses_verified":3,
        "bounded_directed_statutory_status_relations":1,
        "registered_shared_relationship_types":len(read(root,REGISTRY)["relationship_types"]),
        "new_canonical_entities":0,
        "independent_legal_reviews_completed":0,
        "public_atlas_admitted":False,
        "prior_crosswalk_50_and_181_unchanged":True
    }

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=ROOT)
    args=parser.parse_args()
    try:
        print(json.dumps(verify(args.root.resolve()),indent=2))
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
