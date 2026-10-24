#!/usr/bin/env python3
"""INC-15E.1 — immutable publisher → canonical identity adjudication safety gate.

This first contract is intentionally *not* a certified statute-based identity
match. The retained Government Manual original can prove an edition-local
publisher entry, while URLs for 12/22/49 USC sections have not had original
bytes archived or independently reviewed. Therefore no legal successor,
organizational subtype, statutory control or public graph edge is permitted.

Unrelated prior model families and the publisher-wide 231/50/88/93 identity
disposition population remain unmodified.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path
import re
import sys

REPO = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("inc15d9_prior", REPO / "scripts/inc15d9-govman-reconcile.py")
prior = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(prior)
govman = prior.govman

PKG,SHA,BLOB,ORIGINAL = govman.PACKAGE,govman.SHA,govman.BLOB,govman.ORIGINAL
BASE="model/federal/inc15e1/"
REGISTRY=BASE+"relationship-type-registry.json"
EVIDENCE=BASE+"source-evidence.json"
CASES=BASE+"identity-adjudications.json"
RELATIONS=BASE+"relationship-candidates.json"
COVERAGE=BASE+"evidence-dimensions.json"
ADAPTER=BASE+"atlas-adapter-contract.json"
MANIFEST="model/federal/manifest.json"
CANONICAL="model/federal/executive-independent.json"
X12="model/federal/x12-identities.json"
CROSSWALK=govman.OUTPUTS["crosswalk"]
DIRECTORY=govman.OUTPUTS["directory"]
ORIGINAL_ID="INC15E1-SRC-GOVMAN-ORIGINAL"
BOARD="ORG-FED-EXE-IND-FED"
EXPECTED_CASES=(
 ("169","Overseas Private Investment Corporation","historical_successor_scope_unreviewed",
  "unresolved_primary_law_original_not_retained",None,"United States International Development Finance Corporation",
  ("INC15E1-LOC-USC-22-9683","INC15E1-LOC-USC-22-9684")),
 ("147","Federal Reserve System","composite_system_vs_board_scope_boundary",
  "scope_distinct_canonical_board_not_replacement_for_system",BOARD,None,
  ("INC15E1-LOC-USC-12-221",)),
 ("160","National Railroad Passenger Corporation (AMTRAK)","corporation_legal_subtype_unreviewed",
  "unresolved_statutory_classification_original_unretained",None,None,
  ("INC15E1-LOC-USC-49-24301",)),
 ("180","United States Agency for International Development","2026_temporal_organization_status_unverified",
  "unresolved_2026_currentness_without_dated_official_originals",None,None,())
)
TYPES={
 "publisher_listing_of":("publisher_document","publisher_observation","retained_publisher_original",False),
 "identity_candidate_of":("publisher_observation","canonical_institution","retained_publisher_original",False),
 "name_variant_of":("historical_institution","canonical_institution","retained_statutory_original",True),
 "historical_predecessor_of":("historical_institution","successor_institution","retained_statutory_original",True),
 "legal_successor_of":("successor_institution","historical_institution","retained_statutory_original",True),
 "statutorily_part_of":("statutory_component","statutory_parent","retained_statutory_original",True),
 "supervises":("supervising_institution","supervised_institution","retained_statutory_original",True),
 "delegates_to":("delegating_authority","delegated_actor","retained_statutory_original",True),
 "public_service_provided_by":("public_service","service_provider","retained_statutory_and_operational_originals",True)
}
LEGAL_LOCATORS={
 "INC15E1-LOC-USC-22-9683":"https://uscode.house.gov/us/usc/119-120/t22/s9683/",
 "INC15E1-LOC-USC-22-9684":"https://uscode.house.gov/us/usc/119-120/t22/s9684/",
 "INC15E1-LOC-USC-12-221":"https://uscode.house.gov/us/usc/119-121/t12/s221/",
 "INC15E1-LOC-USC-49-24301":"https://uscode.house.gov/view.xhtml?req=%28title%3A49+section%3A24301+edition%3Aprelim%29"
}
ALLOWED_FILES=(REGISTRY,EVIDENCE,CASES,RELATIONS,COVERAGE,ADAPTER)

def reject_unless(condition,message):
    if not condition:
        raise ValueError("INC-15E.1 identity and statutory-evidence gate rejected: "+message)

def read(root,path):
    return json.loads((root/path).read_text(encoding="utf-8"))

def closed(row,fields,label):
    reject_unless(type(row) is dict and set(row)==set(fields),label+" missing or extraneous fields")

def schema_check(value,schema,scope="root"):
    # Closed JSON Schema 2020-12 subset supported without network/pip dependencies.
    if "const" in schema:
        reject_unless(value==schema["const"],scope+" schema const violated")
    if "enum" in schema:
        reject_unless(value in schema["enum"],scope+" schema enum violated")
    if "type" in schema:
        forms=schema["type"] if isinstance(schema["type"],list) else [schema["type"]]
        checks={
            "object":lambda x:type(x) is dict, "array":lambda x:type(x) is list,
            "string":lambda x:type(x) is str, "null":lambda x:x is None,
            "boolean":lambda x:type(x) is bool, "integer":lambda x:type(x) is int
        }
        reject_unless(any(checks[t](value) for t in forms),scope+" schema type violated")
    if type(value) is dict:
        required=set(schema.get("required",()))
        reject_unless(required.issubset(value),scope+" schema missing required")
        props=schema.get("properties",{})
        if schema.get("additionalProperties") is False:
            reject_unless(set(value).issubset(props),scope+" schema additional properties")
        for key,inner in props.items():
            if key in value:
                schema_check(value[key],inner,scope+"."+key)
    if type(value) is list:
        reject_unless(len(value)>=schema.get("minItems",0) and
                      len(value)<=schema.get("maxItems",len(value)),
                      scope+" schema array bounds")
        if "items" in schema:
            for idx,row in enumerate(value):
                schema_check(row,schema["items"],scope+"."+str(idx))

def run(root=REPO):
    # D.9 replays all five publisher cohorts + 8.1 MB original immutable XML.
    prior.run(root)
    original=govman.outputs(root)
    observations=original[DIRECTORY]["items"]
    crosswalk=original[CROSSWALK]["items"]
    by_source={row["source_entity_key"]:row for row in observations}
    by_link={row["source_entity_key"]:row for row in crosswalk}
    reject_unless(len(by_source)==len(by_link)==231 and
                  sum(x["canonical_id"] is not None for x in crosswalk)==50 and
                  sum(x["canonical_id"] is None for x in crosswalk)==181,
                  "previous original publisher denominator or canonical crosswalk changed")
    previous=read(root,prior.PUBLISHER_WIDE)
    reject_unless(previous["unlinked_entries_with_explicit_source_only_disposition"]==88 and
                  previous["unlinked_entries_without_source_only_disposition"]==93,
                  "INC-15D.9 publisher-wide 88+93 source dispositions changed")
    existing_independent=read(root,CANONICAL)["items"]
    existing_x12=read(root,X12)["items"]
    reject_unless(len(existing_independent)==18 and len(existing_x12)==61 and
                  [x["name"] for x in existing_independent if x["id"]==BOARD]==
                  ["Board of Governors of the Federal Reserve System"],
                  "Board of Governors canonical scope not preserved")

    models={p:read(root,p) for p in ALLOWED_FILES}
    for p,obj in models.items():
        schema_name="schemas/inc15e1-"+p.rsplit("/",1)[1].replace(".json",".schema.json")
        schema=read(root,schema_name)
        reject_unless(schema["$schema"]=="https://json-schema.org/draft/2020-12/schema" and
                      schema["additionalProperties"] is False,
                      "closed schema absent or invalid for "+p)
        schema_check(obj,schema,p)

    registry=models[REGISTRY]
    reject_unless(registry["model_version"]=="0.1.0" and
                  registry["model_family"]=="inc15e1-typed-identity-relationship-registry" and
                  registry["release_status"]=="unratified_architecture_contract" and
                  registry["no_new_services_or_renderer_changes"] is True and
                  len(registry["relationship_types"])==len(TYPES),
                  "relationship registry unknown version or unsafe state")
    actual_types={}
    for row in registry["relationship_types"]:
        typ=row["id"]
        reject_unless(typ not in actual_types and typ in TYPES,
                      "unknown/duplicated typed identity or authority relationship")
        f,t,required,legal=TYPES[typ]
        reject_unless(row["from_node_kind"]==f and row["to_node_kind"]==t and
                      row["direction"]=="from_to" and
                      row["required_evidence_class"]==required and
                      row["asserts_legal_identity_or_authority"] is legal and
                      row["source_edition_required"] is True and
                      row["typed_scope_and_effective_date_required"] is legal and
                      row["historical_edition_is_not_present_day_execution"] is True and
                      row["allows_automatic_publisher_tree_or_name_inference"] is False and
                      row["intended_atlas_category"]==("structure" if legal else "context") and
                      row["qualification_guard"]==
                      ("legal_original_retained_and_reviewed" if legal else
                       "publisher_original_replayed_without_legal_certification"),
                      "direction, legal evidence, schema or non-inference semantics changed for "+typ)
        actual_types[typ]=row
    reject_unless(set(actual_types)==set(TYPES),"typed relationship families incomplete")

    src=models[EVIDENCE]
    reject_unless(src["source_edition"]==PKG and
                  src["model_version"]=="0.1.0" and
                  src["model_family"]=="inc15e1-source-custody-and-official-locators" and
                  src["legal_originals_newly_retained"]==0 and
                  src["externally_verified_immutable_WORM_copies"]==0 and
                  src["legal_instruments_admitted_for_certified_identity_edges"]==0 and
                  len(src["records"])==5,
                  "fictional legally qualified originals or wrong evidence population")
    evidence_by_id={x["id"]:x for x in src["records"]}
    reject_unless(len(evidence_by_id)==5 and set(evidence_by_id)==
                  {ORIGINAL_ID,*LEGAL_LOCATORS},
                  "original source vs statute locator inventory changed")
    gov=evidence_by_id[ORIGINAL_ID]
    reject_unless(gov["source_kind"]=="retained_official_publisher_original" and
                  gov["source_edition"]==PKG and
                  gov["document_observed_on"]=="2025-12-31" and
                  gov["original_repository_path"]==ORIGINAL and
                  gov["original_sha256"]==SHA and gov["original_git_blob_sha1"]==BLOB and
                  gov["original_bytes_retained"] is True and
                  gov["independent_external_WORM_verified"] is False and
                  gov["reviewed_for_legal_identity_and_authority"] is False and
                  gov["permits_source_listing_relationship"] is True and
                  gov["permits_legal_identity_or_statutory_authority_edge"] is False,
                  "original 2025 directory custody was reclassified as legal statute")
    for id,url in LEGAL_LOCATORS.items():
        entry=evidence_by_id[id]
        reject_unless(entry["source_kind"]=="official_primary_law_locator_original_unretained" and
                      entry["publisher"]=="Office of the Law Revision Counsel, U.S. House of Representatives" and
                      entry["official_url"]==url and
                      entry["source_edition"]=="official_USC_research_locator_only_not_archived" and
                      entry["document_observed_on"] is None and
                      entry["original_repository_path"] is None and
                      entry["original_sha256"] is None and
                      entry["original_git_blob_sha1"] is None and
                      entry["original_bytes_retained"] is False and
                      entry["independent_external_WORM_verified"] is False and
                      entry["reviewed_for_legal_identity_and_authority"] is False and
                      entry["permits_source_listing_relationship"] is False and
                      entry["permits_legal_identity_or_statutory_authority_edge"] is False and
                      entry["claim_scope"]=="citation_pointer_only_requires_exact_official_original_capture_and_edition_validation",
                      "URL-only official citation was falsely promoted to verified original legal custody "+id)

    pilots=models[CASES]
    reject_unless(pilots["model_version"]=="0.1.0" and
                  pilots["model_family"]=="inc15e1-source-local-identity-adjudication-pilot" and
                  pilots["source_edition"]==PKG and
                  pilots["identity_crosswalk_modified"] is False and
                  pilots["new_canonical_institutions_minted"]==0 and
                  pilots["independent_legal_adjudications_completed"]==0 and
                  len(pilots["pilot_cases"])==4,
                  "pilot identity set falsely certified or altered")
    for c,expected in zip(pilots["pilot_cases"],EXPECTED_CASES):
        local,name,kind,result,canonical,display,statutes=expected
        key=PKG+":"+local
        reject_unless(c["source_entity_key"]==key and
                      c["published_label"]==name and
                      c["case_kind"]==kind and
                      c["comparison_result"]==result and
                      c["candidate_canonical_id"]==canonical and
                      c["candidate_external_name"]==display and
                      c["candidate_is_equivalence"] is False and
                      c["possible_law_locator_ids"]==list(statutes) and
                      c["retained_source_evidence_ids"]==[ORIGINAL_ID] and
                      c["legal_relationship_asserted"] is None and
                      c["legal_effective_date"] is None and
                      c["organization_status_2026"] is None and
                      c["original_successor_instrument_retained"] is False and
                      c["independent_statutory_identity_review_complete"] is False and
                      c["source_observation_verified"] is True and
                      c["legal_identity_certified"] is False and
                      c["atlas_admitted"] is False and
                      c["reviewer_id"] is None and
                      c["id"].startswith("INC15E1-CASE-"),
                      "unreviewed identity, legally unsupported successor, 2026 status, or Board equivalence asserted")
        obs=by_source.get(key)
        reject_unless(obs is not None and obs["published_name"]==name and
                      obs["source_xml_xpath"]=="/GovernmentManual/Entity[@EntityId='"+local+"']" and
                      by_link[key]["canonical_id"] is None and
                      by_link[key]["legal_identity_certified"] is False,
                      "pilot observation does not match original 2025 unlinked source")
    reject_unless(len({x["source_entity_key"] for x in pilots["pilot_cases"]})==4,
                  "duplicate source identity case")

    edges=models[RELATIONS]
    reject_unless(edges["model_version"]=="0.1.0" and
                  edges["model_family"]=="inc15e1-source-qualified-relationship-candidates" and
                  edges["graph_revision"]=="publisher_source_observation_only" and
                  edges["allow_direct_website_admission"] is False and
                  edges["public_atlas_edges_admitted"]==0 and
                  edges["qualified_current_statutory_relationships"]==0 and
                  len(edges["edges"])==4,
                  "unqualified relation escaped into canonical legal graph or Atlas")
    case_ids={x["source_entity_key"] for x in pilots["pilot_cases"]}
    seen=set()
    for x in edges["edges"]:
        key=x["to_id"]
        reject_unless(key in case_ids and key not in seen and
                      x["from_id"]==PKG and x["relationship_type"]=="publisher_listing_of" and
                      x["evidence_id"]==ORIGINAL_ID and
                      x["source_snapshot"]==PKG and
                      x["qualification"]=="original_edition_directory_entry_verified" and
                      x["validity_start"] is None and x["validity_end"] is None and
                      x["legal_effective_on"] is None and
                      x["legal_identity_claimed"] is False and
                      x["statutory_authority_claimed"] is False and
                      x["source_date_only"]=="2025-12-31" and
                      x["actual_interagency_exercise_observed"] is False and
                      x["atlas_admitted"] is False and
                      x["source_inspection_required"] is True,
                      "source-only directional publisher observation misrepresented as government legal edge")
        seen.add(key)
    reject_unless(seen==case_ids,"publisher-backed relation missing or duplicated")

    coverage=models[COVERAGE]
    numbers=coverage["denominators"]
    metric=coverage["pilot"]
    reject_unless(coverage["model_version"]=="0.1.0" and
                  coverage["model_family"]=="inc15e1-identity-adjudication-evidence-dimensions" and
                  coverage["source_edition"]==PKG and
                  coverage["government_wide_legal_institution_denominator"] is None and
                  numbers=={
                    "original_2025_publisher_observations":231,
                    "existing_provisional_canonical_name_links":50,
                    "source_observations_without_canonical_links":181,
                    "explicit_source_only_dispositions":88,
                    "unlinked_without_dispositions":93,
                    "independent_category_source_unlinked_disposition_accounted":45,
                  } and metric=={
                    "cases":4,
                    "verified_publisher_entry_observations":4,
                    "candidate_cross_scope_comparisons":1,
                    "independently_certified_identity_equivalences":0,
                    "legally_qualified_successor_edges":0,
                    "legally_qualified_organization_subtypes":0,
                    "original_statutory_instruments_retained_for_pilot":0,
                    "verified_2026_entity_operations":0,
                    "source_original_supported_publisher_listing_edges":4,
                    "atlas_edges_admitted":0,
                    "independently_measured_outcome_links":0,
                  } and coverage["publisher_entry_count_is_not_present_government_agency_census"] is True and
                  coverage["plan_or_data_observatory_changed"] is False and
                  len(set(coverage["evidence_dimensions"]))==9,
                  "source coverage conflated identity, law, operations, Atlas and outcomes")
    adapter=models[ADAPTER]
    reject_unless(adapter["model_version"]=="0.1.0" and
                  adapter["model_family"]=="inc15e1-existing-atlas-source-qualified-adapter-contract" and
                  adapter["renderer_replacement_required"] is False and
                  adapter["website_repository_modified"] is False and
                  adapter["canonical_ids_rewritten"] is False and
                  adapter["source_read_scope"]=="existing_architecture_adapter_future_additive_consumer_only" and
                  adapter["producer_model_paths"]==list(ALLOWED_FILES[:-1]) and
                  adapter["candidate_export_qualification"]=="source_original_only_not_independently_legal" and
                  adapter["future_publication_requires_separate_website_PR"] is True and
                  adapter["publisher_listing_projection_eligible_only_after_source_inspector_review"] is True and
                  adapter["legal_relationship_projection_requires_retained_original_and_independent_review"] is True and
                  adapter["conditional_graph_insertion_if_reviewed"]=="future_website_adapter_gate_only" and
                  adapter["admitted_edges_in_this_increment"]==0 and
                  adapter["source_record_count_for_future_inspection"]==4 and
                  adapter["future_legal_edges_currently_exportable"]==0 and
                  adapter["future_projection_fields"]==[
                      "from_id","to_id","relationship_type","evidence_id","source_snapshot",
                      "qualification","legal_effective_on","source_inspection_required","atlas_admitted"] and
                  adapter["required_inspector_fields"]==[
                      "official_source","original_repository_path","source_sha256",
                      "source_edition","source_local_xpath","review_status",
                      "legal_status_vs_publisher_observation"] and
                  set(adapter["prohibited_promotions"])=={
                      "unreviewed_identity_candidate_to_certified_canonical",
                      "legal_successor_from_name_similarity",
                      "legal_parent_from_publisher_nesting",
                      "supervision_or_command_from_directory_category",
                      "current_2026_status_from_2025_edition",
                      "service_delivery_from_publisher_mission_text",
                      "source_only_edge_direct_to_live_Atlas_graph"},
                  "Atlas compatibility contract mutated to publish unsupported relationship")
    m=read(root,MANIFEST)
    ext=m.get("federal_identity_interoperability_15e1_extension")
    reject_unless(ext is not None and
                  ext["source_edition"]==PKG and
                  ext["source_original_sha256"]==SHA and
                  [ext[x] for x in (
                      "relationship_registry_path","evidence_registry_path",
                      "adjudication_path","source_relationship_path","evidence_dimensions_path","atlas_adapter_contract_path"
                  )]==list(ALLOWED_FILES) and
                  ext["crosswalk_existing_50_provisional_links_changed"]==0 and
                  ext["original_government_manual_unlinked_181_entries_changed"]==0 and
                  ext["bounded_identity_cases"]==4 and
                  ext["original_publisher_listing_edges_qualified"]==4 and
                  ext["new_canonical_institutional_identities"]==0 and
                  ext["new_statutorily_qualified_identity_or_succession_edges"]==0 and
                  ext["unretained_statute_locators_are_authority_certifications"] is False and
                  ext["independent_legal_originals_newly_retained"]==0 and
                  ext["verified_2026_operations"]==0 and
                  ext["atlas_public_graph_changed"] is False and
                  ext["allow_direct_Atlas_edge_publication"] is False and
                  ext["plan_or_observatory_changed"] is False and
                  all(p in m["models"] for p in ALLOWED_FILES) and
                  len(set(m["models"]))==len(m["models"]),
                  "manifest falsely claims legal identity certification or source model admission")

    return {
        "publisher_2025_observations":231,"prior_provisional_canonical_links":50,
        "canonically_unlinked_entries":181,"explicit_source_only_dispositions":88,
        "unlinked_without_source_dispositions":93,"pilot_cases":4,
        "typed_relationship_contracts":9,"original_replayed_publisher_listing_edges":4,
        "legal_originals_retained_for_this_pilot":0,"legal_successors_qualified":0,
        "source_to_canonical_legal_matches_qualified":0,"atlas_edges_admitted":0,
        "plan_data_observatory_unchanged":True,
    }

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",type=Path,default=REPO)
    opts=parser.parse_args()
    try:
        print(json.dumps(run(opts.root.resolve()),indent=2))
    except Exception as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
