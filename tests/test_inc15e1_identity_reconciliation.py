"""INC-15E.1 source-qualified typed identity contract and adversarial legal-denial tests."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15e1",ROOT/"scripts/inc15e1-identity-reconcile.py")
m=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
p9=m.prior
p8=p9.prior
p7=p8.prior
p6=p7.prior
p5=p6.prior
INPUTS=set([
 m.ORIGINAL,m.govman.LINKS,m.govman.X12,*m.govman.OUTPUTS.values(),
 p5.CURATION,p5.DISPOSITIONS,p5.COVERAGE,
 p6.CURATION,p6.DISPOSITIONS,p6.COVERAGE,
 p7.CURATION,p7.DISPOSITIONS,p7.COVERAGE,
 p8.CURATION,p8.DISPOSITIONS,p8.COVERAGE,
 p9.CURATION,p9.DISPOSITIONS,p9.COVERAGE,p9.PUBLISHER_WIDE,
 m.CANONICAL,m.X12,m.MANIFEST,*m.ALLOWED_FILES,
 p6.SEEDS,p6.GRANULES,p6.UNITS,p6.COMMERCE_SOURCE,
 p6.COMMERCE_SNAPSHOTS,p6.ED_CHART,p6.DEPARTMENTS,p6.IDENTITIES,
 *(("schemas/inc15e1-"+name.split("/")[-1].replace(".json",".schema.json"))
   for name in m.ALLOWED_FILES),
])

class IdentityAndRelationshipEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry=m.read(ROOT,m.REGISTRY)
        cls.sources=m.read(ROOT,m.EVIDENCE)
        cls.cases=m.read(ROOT,m.CASES)
        cls.graph=m.read(ROOT,m.RELATIONS)
        cls.coverage=m.read(ROOT,m.COVERAGE)

    def scratch(self):
        scope=tempfile.TemporaryDirectory(prefix="inc15e1_evidence_")
        root=Path(scope.name)
        for path in INPUTS:
            dest=root/path
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(ROOT/path,dest)
        return scope,root

    @staticmethod
    def write(root,path,obj):
        (root/path).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

    def reject(self,path,change,match="INC-15E.1 identity and statutory-evidence gate rejected"):
        scope,root=self.scratch()
        with scope:
            obj=m.read(root,path)
            change(obj)
            self.write(root,path,obj)
            with self.assertRaisesRegex(ValueError,match):
                m.run(root)

    def test_source_replay_full_identity_contract_passes(self):
        result=m.run(ROOT)
        self.assertEqual((result["publisher_2025_observations"],
                          result["prior_provisional_canonical_links"],
                          result["canonically_unlinked_entries"],
                          result["explicit_source_only_dispositions"],
                          result["unlinked_without_source_dispositions"]),
                         (231,50,181,88,93))
        self.assertEqual(result["typed_relationship_contracts"],10)
        self.assertEqual(result["pilot_cases"],4)
        self.assertEqual(result["original_replayed_publisher_listing_edges"],4)
        self.assertEqual(result["source_to_canonical_legal_matches_qualified"],0)

    def test_all_four_cases_use_original_edition_ids(self):
        cases=self.cases["pilot_cases"]
        self.assertEqual([x["source_entity_key"] for x in cases],
                         [m.PKG+":169",m.PKG+":147",m.PKG+":160",m.PKG+":180"])
        self.assertEqual([x["case_kind"] for x in cases],
                         [x[2] for x in m.EXPECTED_CASES])
        self.assertTrue(all(x["retained_source_evidence_ids"]==[m.ORIGINAL_ID]
                            and x["source_observation_verified"] is True
                            and x["reviewer_id"] is None for x in cases))

    def test_federal_reserve_canonical_board_is_not_composite_system(self):
        case=self.cases["pilot_cases"][1]
        self.assertEqual(case["source_entity_key"],m.PKG+":147")
        self.assertEqual(case["candidate_canonical_id"],m.BOARD)
        self.assertEqual(case["comparison_result"],
                         "scope_distinct_canonical_board_not_replacement_for_system")
        self.assertIs(case["candidate_is_equivalence"],False)
        self.assertIs(case["legal_identity_certified"],False)

    def test_OPIC_historical_successor_is_candidate_not_same_entity(self):
        case=self.cases["pilot_cases"][0]
        self.assertEqual(case["published_label"],"Overseas Private Investment Corporation")
        self.assertEqual(case["candidate_external_name"],
                         "United States International Development Finance Corporation")
        self.assertIsNone(case["candidate_canonical_id"])
        self.assertIsNone(case["legal_relationship_asserted"])
        self.assertIs(case["original_successor_instrument_retained"],False)

    def test_amtrak_is_not_categorically_a_government_executive_agency(self):
        case=self.cases["pilot_cases"][2]
        self.assertEqual(case["case_kind"],"corporation_legal_subtype_unreviewed")
        self.assertEqual(case["possible_law_locator_ids"],["INC15E1-LOC-USC-49-24301"])
        self.assertIsNone(case["legal_relationship_asserted"])
        self.assertIs(case["legal_identity_certified"],False)

    def test_USAID_2026_operations_and_organization_remain_unverified(self):
        case=self.cases["pilot_cases"][3]
        self.assertIsNone(case["organization_status_2026"])
        self.assertIsNone(case["legal_effective_date"])
        self.assertEqual(case["possible_law_locator_ids"],[])
        self.assertIs(case["independent_statutory_identity_review_complete"],False)

    def test_only_directory_xml_is_retained_and_hashed(self):
        self.assertEqual(len(self.sources["records"]),5)
        by={x["id"]:x for x in self.sources["records"]}
        original=by[m.ORIGINAL_ID]
        self.assertEqual(original["original_sha256"],m.SHA)
        self.assertEqual(original["original_repository_path"],m.ORIGINAL)
        self.assertIs(original["original_bytes_retained"],True)
        self.assertIs(original["permits_legal_identity_or_statutory_authority_edge"],False)
        for k in m.LEGAL_LOCATORS:
            law=by[k]
            self.assertIs(law["original_bytes_retained"],False)
            self.assertIsNone(law["original_sha256"])
            self.assertIsNone(law["original_repository_path"])
            self.assertIs(law["permits_legal_identity_or_statutory_authority_edge"],False)

    def test_typed_edges_are_directional_with_distinct_evidence_requirements(self):
        types={x["id"]:x for x in self.registry["relationship_types"]}
        self.assertEqual(set(types),set(m.TYPES))
        self.assertEqual(types["historical_predecessor_of"]["direction"],"from_to")
        self.assertEqual(types["legal_successor_of"]["direction"],"from_to")
        self.assertEqual(types["delegates_to"]["required_evidence_class"],
                         "retained_statutory_original")
        self.assertIs(types["supervises"]["allows_automatic_publisher_tree_or_name_inference"],False)
        self.assertEqual(types["publisher_listing_of"]["required_evidence_class"],
                         "retained_publisher_original")

    def test_four_graph_edges_are_only_source_listing_not_legal_identity(self):
        self.assertEqual(len(self.graph["edges"]),4)
        self.assertTrue(all(x["from_id"]==m.PKG and
                            x["relationship_type"]=="publisher_listing_of" and
                            x["qualification"]=="original_edition_directory_entry_verified" and
                            x["evidence_id"]==m.ORIGINAL_ID and
                            x["source_inspection_required"] is True and
                            x["legal_identity_claimed"] is False and
                            x["statutory_authority_claimed"] is False and
                            x["atlas_admitted"] is False for x in self.graph["edges"]))

    def test_independent_dimensions_not_one_federal_census_percentage(self):
        self.assertIsNone(self.coverage["government_wide_legal_institution_denominator"])
        self.assertIs(self.coverage["publisher_entry_count_is_not_present_government_agency_census"],True)
        self.assertEqual(self.coverage["pilot"]["independently_certified_identity_equivalences"],0)
        self.assertEqual(self.coverage["pilot"]["original_statutory_instruments_retained_for_pilot"],0)
        self.assertEqual(self.coverage["pilot"]["verified_2026_entity_operations"],0)
        self.assertEqual(self.coverage["pilot"]["atlas_edges_admitted"],0)
        self.assertEqual(self.coverage["pilot"]["independently_measured_outcome_links"],0)

    def test_corrupt_8MB_publisher_original_is_rejected(self):
        temp,root=self.scratch()
        with temp:
            original=root/m.ORIGINAL
            raw=bytearray(original.read_bytes());raw[12012]^=1;original.write_bytes(raw)
            with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
                m.run(root)

    def test_legal_url_without_bytes_cannot_gain_original_hash(self):
        self.reject(m.EVIDENCE,lambda o:o["records"][1].update(
            original_sha256="0"*64,original_bytes_retained=True))

    def test_original_publisher_directory_cannot_be_statutory_authority(self):
        self.reject(m.EVIDENCE,lambda o:o["records"][0].update(
            permits_legal_identity_or_statutory_authority_edge=True))

    def test_statute_locator_cannot_claim_independent_legal_review(self):
        self.reject(m.EVIDENCE,lambda o:o["records"][3].update(
            reviewed_for_legal_identity_and_authority=True))

    def test_statute_source_epoch_mix_is_rejected(self):
        self.reject(m.EVIDENCE,lambda o:next(x for x in o["records"]
            if x["id"]=="INC15E1-LOC-USC-22-9683").update(
            official_url="https://uscode.house.gov/us/usc/2000/t22/s9683/"))

    def test_unknown_or_conflicting_relationship_type_is_denied(self):
        self.reject(m.REGISTRY,lambda o:o["relationship_types"][1].update(
            id="legal_equivalent_of"))

    def test_direction_of_legal_successor_cannot_be_reversed_silently(self):
        self.reject(m.REGISTRY,lambda o:next(x for x in o["relationship_types"]
            if x["id"]=="legal_successor_of").update(
            from_node_kind="historical_institution"))

    def test_publisher_tree_cannot_become_statutory_supervision(self):
        self.reject(m.REGISTRY,lambda o:next(x for x in o["relationship_types"]
            if x["id"]=="statutorily_part_of").update(
            allows_automatic_publisher_tree_or_name_inference=True))

    def test_delegation_does_not_succeed_on_publisher_original(self):
        self.reject(m.REGISTRY,lambda o:next(x for x in o["relationship_types"]
            if x["id"]=="delegates_to").update(
            required_evidence_class="retained_publisher_original"))

    def test_public_service_execution_requires_more_than_published_mission(self):
        self.reject(m.REGISTRY,lambda o:next(x for x in o["relationship_types"]
            if x["id"]=="public_service_provided_by").update(
            required_evidence_class="retained_publisher_original"))

    def test_OPIC_successor_must_not_be_minted_from_name(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][0].update(
            candidate_is_equivalence=True,legal_relationship_asserted="legal_successor_of"))

    def test_OPIC_candidate_must_not_gain_fabricated_canonical_id(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][0].update(
            candidate_canonical_id="ORG-FED-EXE-IND-DFC"))

    def test_federal_reserve_system_must_not_equal_board(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][1].update(
            legal_identity_certified=True,comparison_result="confirmed_same_organization"))

    def test_amtrak_legal_form_must_not_be_certified_without_original(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][2].update(
            independent_statutory_identity_review_complete=True))

    def test_USAID_2026_continuity_cannot_be_inferred(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][3].update(
            organization_status_2026="continuing_no_reorganization"))

    def test_wrong_2025_source_observation_for_pilot_rejected(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][0].update(
            source_entity_key=m.PKG+":180"))

    def test_duplicate_case_source_key_rejected(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][3].update(
            source_entity_key=m.PKG+":169"))

    def test_legal_delegation_edge_cannot_be_admitted_from_GovMan(self):
        self.reject(m.RELATIONS,lambda o:o["edges"][0].update(
            relationship_type="delegates_to",statutory_authority_claimed=True))

    def test_publisher_listing_does_not_supplement_existing_canonical_id(self):
        self.reject(m.RELATIONS,lambda o:o["edges"][1].update(
            to_id=m.BOARD,legal_identity_claimed=True))

    def test_atlas_direct_publication_is_a_separate_gate(self):
        self.reject(m.RELATIONS,lambda o:o.update(
            allow_direct_website_admission=True,public_atlas_edges_admitted=4))

    def test_effective_date_of_legal_transfer_must_not_be_forged(self):
        self.reject(m.RELATIONS,lambda o:o["edges"][0].update(
            legal_effective_on="2019-01-01"))

    def test_schema_rejects_unregistered_government_authority_property(self):
        self.reject(m.CASES,lambda o:o["pilot_cases"][2].update(
            congress_approved_control=True),"schema additional properties")

    def test_coverage_cannot_convert_four_cases_to_verified_legal_matches(self):
        self.reject(m.COVERAGE,lambda o:o["pilot"].update(
            independently_certified_identity_equivalences=4))

    def test_coverage_cannot_claim_2026_operational_currentness(self):
        self.reject(m.COVERAGE,lambda o:o["pilot"].update(
            verified_2026_entity_operations=4))

    def test_manifest_must_not_claim_new_statutory_graph_edges(self):
        self.reject(m.MANIFEST,lambda o:o["federal_identity_interoperability_15e1_extension"].update(
            new_statutorily_qualified_identity_or_succession_edges=4,
            atlas_public_graph_changed=True))

    def test_original_govman_canonical_crosswalk_cannot_change(self):
        self.reject(m.CROSSWALK,lambda o:o["items"][0].update(
            canonical_id=None),"INC-15D.5 reconciliation rejected")

    def test_prior_D9_unlinked_source_counts_cannot_be_rewritten(self):
        self.reject(p9.PUBLISHER_WIDE,lambda o:o.update(
            unlinked_entries_with_explicit_source_only_disposition=181),
            "INC-15D.9 publisher/canonical qualification denied")


    def test_existing_atlas_adapter_is_future_only_and_source_inspectable(self):
        adapter=m.read(ROOT,m.ADAPTER)
        self.assertIs(adapter["website_repository_modified"],False)
        self.assertIs(adapter["renderer_replacement_required"],False)
        self.assertIs(adapter["future_publication_requires_separate_website_PR"],True)
        self.assertIs(adapter["source_record_count_for_future_inspection"]==4,True)
        self.assertEqual(adapter["admitted_edges_in_this_increment"],0)
        self.assertIn("source_local_xpath",adapter["required_inspector_fields"])

    def test_website_publication_without_separate_admission_is_rejected(self):
        self.reject(m.ADAPTER,lambda o:o.update(
            future_publication_requires_separate_website_PR=False,
            admitted_edges_in_this_increment=4))

    def test_atlas_inspector_cannot_hide_source_edition_or_qualification(self):
        self.reject(m.ADAPTER,lambda o:o.update(
            required_inspector_fields=["official_source","original_repository_path"]))

if __name__=="__main__":
    unittest.main()
