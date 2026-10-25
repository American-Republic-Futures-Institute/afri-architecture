"""INC-15E.1B original GPO 2024 49 USC 24301 legal-status evidence regression."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15e1b",ROOT/"scripts/inc15e1b-amtrak-qualify.py")
q=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(q)
F=importlib.util.spec_from_file_location("inc15e1a_old_tests",ROOT/"tests/test_inc15e1_identity_reconciliation.py")
previous_test=importlib.util.module_from_spec(F)
F.loader.exec_module(previous_test)

SOURCE_SET={
 q.capture.RECEIPT.as_posix(),
 q.MODEL,
 q.read(ROOT,q.capture.RECEIPT)["original_repository_path"]
}
EXTRA={
 q.COVERAGE, q.TRANSITION, q.REGISTRY, q.MANIFEST,
 *(x for x in q.SUFFIX.values())
}

def write(root,path,data):
    (root/path).write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

class AmtrakOfficialOriginalAndScopedStatus(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.receipt=q.read(ROOT,q.capture.RECEIPT)
        cls.status=q.read(ROOT,q.MODEL)
        cls.coverage=q.read(ROOT,q.COVERAGE)
        cls.transition=q.read(ROOT,q.TRANSITION)

    def scratch(self,all_prior=False):
        tmp=tempfile.TemporaryDirectory(prefix="inc15e1b_original_")
        root=Path(tmp.name)
        files=SOURCE_SET | (set(previous_test.INPUTS) | EXTRA if all_prior else set())
        for f in files:
            target=root/f
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(ROOT/f,target)
        return tmp,root

    def reject_original(self,path,mutation,match="INC-15E.1B primary-source custody rejected"):
        tmp,root=self.scratch()
        with tmp:
            model=q.read(root,path)
            mutation(model)
            write(root,path,model)
            with self.assertRaisesRegex(ValueError,match):
                q.capture.verify(root)

    def reject_full(self,path,mutation,match=r"INC-15E\.1(?: identity and statutory-evidence gate|B legal-status evidence contract) rejected"):
        tmp,root=self.scratch(all_prior=True)
        with tmp:
            model=q.read(root,path)
            mutation(model)
            write(root,path,model)
            with self.assertRaisesRegex(ValueError,match):
                q.verify(root)

    def test_full_prior_and_GPO_status_contract(self):
        v=q.verify(ROOT)
        self.assertEqual(v["source_statutory_clauses_verified"],3)
        self.assertEqual(v["bounded_directed_statutory_status_relations"],1)
        self.assertEqual(v["registered_shared_relationship_types"],10)
        self.assertEqual(v["new_canonical_entities"],0)
        self.assertEqual(v["independent_legal_reviews_completed"],0)
        self.assertIs(v["public_atlas_admitted"],False)

    def test_original_GPO_bytes_are_physically_retained_and_hash_checked(self):
        v=q.capture.verify(ROOT)
        self.assertEqual(v["source_original_bytes_verified"] if "source_original_bytes_verified" in v else v["byte_length"],30123)
        self.assertEqual(v["original_sha256"],self.receipt["original_sha256"])
        self.assertEqual(self.receipt["original_bytes"],30123)
        self.assertEqual(self.receipt["source_edition"],"USCODE-2024-title49")
        self.assertEqual(self.receipt["official_url"],q.capture.URL)
        self.assertEqual(self.receipt["git_blob_sha1"],"8896783bbb61e92a3d33f7a8a64d0fae3bb08c80")
        self.assertTrue((ROOT/self.receipt["original_repository_path"]).exists())

    def test_2024_citation_is_not_current_2026_US_Code_status(self):
        self.assertEqual(self.receipt["claim_scope"],"2024_gpo_uscode_edition_only_not_2026_live_code")
        self.assertIs(self.status["qualifies_2024_codified_clause_only"],True)
        self.assertIs(self.status["qualifies_2026_legal_edition"],False)
        self.assertIs(self.status["statutory_epoch_effective_date_independently_adjudicated"],False)
        self.assertFalse(self.transition["statutory_2026_currentness_checked"])

    def test_exact_3_subsection_A_text_assertions_are_bounded(self):
        labels=[x["locator"] for x in self.status["clauses"]]
        self.assertEqual(labels,["24301(a)(1)","24301(a)(2)","24301(a)(3)"])
        self.assertEqual([x["predicate"] for x in self.status["clauses"]],[
            "statute_labels_Amtrak_railroad_carrier",
            "statute_directs_for_profit_management",
            "statute_excludes_department_agency_instrumentality_and_title31"])
        self.assertTrue(all(x["statutory_text_verified_from_original"] is True and
                            x["asserts_constitutional_status"] is False and
                            x["asserts_actual_company_profits"] is False for x in self.status["clauses"]))

    def test_Lebron_constitutional_limit_not_overridden_by_statute_clause(self):
        boundary=self.status["judicial_interpretation_boundary"]
        self.assertEqual(boundary["case"],"Lebron v. National Railroad Passenger Corporation, 513 U.S. 374 (1995)")
        self.assertIs(boundary["no_conclusion_that_Amtrak_is_private_for_every_purpose"],True)
        self.assertIs(boundary["citation_only_not_new_original_retained"],True)
        self.assertIn("not_categorical_private_or_nongovernment_status_for_constitutional_purposes",
                      self.status["exclusions"])

    def test_statutory_subject_is_not_promoted_to_GovMan_canonical_identity(self):
        self.assertEqual(self.status["statutory_clause_subject_id"],"STAT-USCODE-2024-49-24301-AMTRAK")
        self.assertEqual(self.status["to_id"],"STAT-USCODE-2024-49-24301-AMTRAK")
        self.assertEqual(self.status["source_publisher_observation_id"],"GOVMAN-2025-12-31:160")
        self.assertIsNone(self.status["existing_canonical_institution_id"])
        self.assertIs(self.status["source_observation_is_legal_identity_match"],False)
        self.assertIs(self.transition["statutory_subject_not_ARFI_canonical_identity"],True)

    def test_source_receipt_separates_Git_archive_from_independent_WORM(self):
        self.assertIs(self.receipt["source_original_git_retained"],True)
        self.assertIs(self.receipt["independent_external_WORM_verified"],False)
        self.assertIs(self.receipt["independent_professional_legal_review_complete"],False)
        self.assertIs(self.status["independent_professional_legal_review_complete"],False)
        self.assertIs(self.status["atlas_graph_admitted"],False)

    def test_one_typed_status_relationship_registered_in_shared_graph_taxonomy(self):
        registry=q.read(ROOT,q.REGISTRY)["relationship_types"]
        typ=[t for t in registry if t["id"]==q.TYPE]
        self.assertEqual(len(typ),1)
        t=typ[0]
        self.assertEqual((t["from_node_kind"],t["to_node_kind"]),("statutory_clause","statutory_named_subject"))
        self.assertEqual(t["required_evidence_class"],"retained_statutory_original")
        self.assertIs(t["asserts_legal_identity_or_authority"],False)
        self.assertIs(t["allows_automatic_publisher_tree_or_name_inference"],False)

    def test_source_coverage_keeps_231_50_181_unchanged(self):
        c=self.coverage
        self.assertEqual((c["source_to_canonical_crosswalk_entries_unchanged"],
                          c["prior_provisional_name_links_unchanged"],
                          c["prior_unlinked_GovMan_observations_unchanged"]),(231,50,181))
        self.assertEqual(c["directional_statutory_status_edges"],1)
        self.assertEqual(c["independently_professional_legal_reviewed_status_edges"],0)
        self.assertEqual(c["historical_GovMan_to_statutory_subject_legal_equivalence_matches"],0)
        self.assertEqual(c["atlas_relationships_admitted"],0)

    def test_prior_UNRETAINED_case_status_is_not_retroactively_changed(self):
        p=q.read(ROOT,q.CASES)["pilot_cases"][2]
        self.assertEqual(p["comparison_result"],self.transition["prior_case_status"])
        self.assertIs(self.transition["prior_case_release_intact"],True)
        self.assertEqual(self.transition["newly_archived_original_source_sha256"],
                         self.receipt["original_sha256"])

    def test_bitflip_original_30KB_immutable_HTML_fails(self):
        tmp,root=self.scratch()
        with tmp:
            path=root/self.receipt["original_repository_path"]
            data=bytearray(path.read_bytes())
            data[1623]^=1
            path.write_bytes(data)
            with self.assertRaisesRegex(ValueError,"original raw bytes, SHA-256, or Git blob"):
                q.capture.verify(root)

    def test_original_clause_TITLe31_tamper_fails_even_with_adjusted_hash(self):
        tmp,root=self.scratch()
        with tmp:
            r=q.read(root,q.capture.RECEIPT)
            path=root/r["original_repository_path"]
            raw=path.read_bytes()
            self.assertIn(b"shall not be subject to title 31",raw)
            changed=raw.replace(b"shall not be subject to title 31",
                                b"shall always be subject to title 31",1)
            digest=q.capture.hash_sha(changed)
            newer=q.capture.PATH/"originals"/"sha256"/(digest+".html")
            (root/newer).write_bytes(changed)
            path.unlink()
            r["original_repository_path"]=newer.as_posix()
            r["original_sha256"]=digest
            r["git_blob_sha1"]=q.capture.git_sha(changed)
            r["original_bytes"]=len(changed)
            write(root,q.capture.RECEIPT,r)
            with self.assertRaisesRegex(ValueError,"source clause absent"):
                q.capture.verify(root)

    def test_URL_only_substitution_for_GPO_bytes_rejected(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(
            original_repository_path="https://www.govinfo.gov/app/details/USCODE-2024-title49"))

    def test_original_receipt_edition_time_travel_rejected(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(source_edition="USCODE-2026-title49"))

    def test_GPO_response_redirect_must_remain_to_official_host(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d["http"].update(
            final_official_url="https://law.example.com/fabricated-section"))

    def test_original_Hash_cannot_be_faked_in_receipt(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(original_sha256="0"*64))

    def test_forged_independent_external_WORM_certificate_rejected(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(independent_external_WORM_verified=True))

    def test_forged_independent_legal_review_complete_rejected(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(independent_professional_legal_review_complete=True))

    def test_statute_cannot_assert_Amtrak_is_private_for_every_purpose(self):
        self.reject_original(q.MODEL,lambda d:d["judicial_interpretation_boundary"].update(
            no_conclusion_that_Amtrak_is_private_for_every_purpose=False))

    def test_statute_not_categorical_claim_of_constitutional_non_government(self):
        self.reject_original(q.MODEL,lambda d:d["clauses"][2].update(
            asserts_constitutional_status=True))

    def test_statute_cannot_certify_actual_Amtrak_corporate_profits(self):
        self.reject_original(q.MODEL,lambda d:d["clauses"][1].update(
            asserts_actual_company_profits=True))

    def test_statute_cannot_certify_new_canonical_identity_id(self):
        self.reject_original(q.MODEL,lambda d:d.update(
            existing_canonical_institution_id="ORG-FED-EXE-IND-AMTRAK",
            canonical_identity_certified=True))

    def test_statutory_reference_cannot_be_called_2026_current(self):
        self.reject_original(q.MODEL,lambda d:d.update(
            qualifies_2026_legal_edition=True))

    def test_previous_2025_publisher_observation_cannot_be_equated_with_statutory_subject(self):
        self.reject_original(q.MODEL,lambda d:d.update(
            source_observation_is_legal_identity_match=True))

    def test_statutory_status_not_prequalified_for_Atlas(self):
        self.reject_original(q.MODEL,lambda d:d.update(
            atlas_graph_admitted=True))

    def test_second_source_edition_cannot_be_retroactively_added_to_original(self):
        self.reject_original(q.capture.RECEIPT,lambda d:d.update(
            claim_scope="through_2026_current_law"))

    def test_registry_type_cannot_turn_into_broad_legal_organization_equivalence(self):
        self.reject_full(q.REGISTRY,lambda d:next(x for x in d["relationship_types"]
            if x["id"]==q.TYPE).update(
            asserts_legal_identity_or_authority=True))

    def test_statutory_coverage_cannot_claim_independent_review(self):
        self.reject_full(q.COVERAGE,lambda d:d.update(
            independently_professional_legal_reviewed_status_edges=1))

    def test_prior_source_GovMan_total_identity_50_181_cannot_be_changed(self):
        self.reject_full(q.MANIFEST,lambda d:d["federal_identity_interoperability_15e1b_extension"].update(
            canonical_identity_links_modified=1))

    def test_temporal_overlay_cannot_promote_cross_epoch_identical_legal_entity(self):
        self.reject_full(q.TRANSITION,lambda d:d.update(
            cross_edition_name_comparison_legal_identity_certified=True))

    def test_external_judicial_original_not_falsely_retained(self):
        self.reject_full(q.COVERAGE,lambda d:d.update(
            judicial_Lebron_original_retained=True))

    def test_misleading_original_schema_forces_rejection(self):
        self.reject_full(q.COVERAGE,lambda d:d.update(
            additional_2026_current_law_originals_retained=1))

if __name__=="__main__":
    unittest.main()
