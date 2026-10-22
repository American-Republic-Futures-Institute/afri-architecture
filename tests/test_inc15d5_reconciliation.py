"""INC-15D.5: edition-local 28/28 research disposition and legal non-promotion tests."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "inc15d5_govman", ROOT / "scripts/inc15d5-govman-reconcile.py")
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

COPY = (mod.govman.ORIGINAL, mod.govman.LINKS, mod.govman.X12,
        *mod.govman.OUTPUTS.values(), mod.CURATION, mod.DISPOSITIONS,
        mod.COVERAGE, mod.SEEDS, mod.GRANULES, mod.DEPARTMENTS,
        mod.IDENTITIES, mod.MANIFEST)


def subset(value, schema, label="root"):
    """Exercise all JSON Schema keywords in the three closed INC-15D.5 schemas."""
    if "const" in schema:
        assert value == schema["const"], label + " const"
    if "enum" in schema:
        assert value in schema["enum"], label + " enum"
    if "type" in schema:
        match = {
            "null": lambda x: x is None,
            "string": lambda x: type(x) is str,
            "boolean": lambda x: type(x) is bool,
            "integer": lambda x: type(x) is int,
            "object": lambda x: type(x) is dict,
            "array": lambda x: type(x) is list,
        }
        allowed = schema["type"] if type(schema["type"]) is list else [schema["type"]]
        assert any(match[t](value) for t in allowed), label + " type"
    if type(value) is dict:
        assert set(schema.get("required", ())).issubset(value), label + " missing required field"
        props = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            assert set(value).issubset(props), label + " unknown field"
        for key, nested in props.items():
            if key in value:
                subset(value[key], nested, label + "." + key)
    if type(value) is list:
        assert len(value) >= schema.get("minItems", 0), label + " minItems"
        assert len(value) <= schema.get("maxItems", len(value)), label + " maxItems"
        if "items" in schema:
            for i, item in enumerate(value):
                subset(item, schema["items"], label + "." + str(i))


class INC15D5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.expected = mod.expected(ROOT)
        cls.items = cls.expected[mod.DISPOSITIONS]["items"]
        cls.coverage = cls.expected[mod.COVERAGE]

    def worktree(self):
        folder = tempfile.TemporaryDirectory(prefix="inc15d5_negative_")
        root = Path(folder.name)
        for path in COPY:
            dest = root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / path, dest)
        return folder, root

    @staticmethod
    def write(root, path, obj):
        (root / path).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n",
                                 encoding="utf-8")

    def test_replay_exact_original_bytes_and_complete_28_of_28_dispositions(self):
        summary = mod.run(ROOT)
        self.assertEqual(summary["publisher_whole_edition_entries"], 231)
        self.assertEqual(summary["cohort_publisher_entries"], 28)
        self.assertEqual(summary["explicit_dispositions"], 28)
        self.assertEqual(summary["existing_candidate_correspondences"], 6)
        self.assertEqual(summary["new_canonical_component_matches"], 0)
        self.assertEqual(len(self.items), 28)
        self.assertEqual(len({x["source_entity_key"] for x in self.items}), 28)
        self.assertTrue(all(x["disposition"] == mod.DISPOSITION and
                            x["canonical_component_id"] is None and
                            x["published_element_tag"] == "SubEntityLevelOne" and
                            x["publisher_nesting_only_not_legal_parentage"] is True
                            for x in self.items))

    def test_three_cabinet_subtrees_are_10_9_9_nonadditive_source_entries(self):
        self.assertEqual([(x["publisher_department_root_key"],
                           x["selected_first_level_unlinked_entries"]) for
                          x in self.coverage["items"]],
                         [(mod.PACKAGE + ":120", 10), (mod.PACKAGE + ":323", 9),
                          (mod.PACKAGE + ":124", 9)])
        self.assertEqual(self.coverage["publisher_entries_accounted_for"], 28)
        self.assertEqual(self.coverage["unaccounted_target_entries"], 0)
        self.assertEqual(self.coverage["prior_unlinked_publisher_entries"], 181)
        self.assertEqual(self.coverage["existing_50_provisional_links_changed"], 0)
        self.assertEqual(self.coverage["earlier_181_unlinked_source_entries_reclassified_as_linked"], 0)
        self.assertIsNone(self.coverage["current_first_level_institution_denominator"])
        self.assertFalse(self.coverage["publisher_entry_population_is_legal_denominator"])

    def test_six_prior_research_seeds_are_not_canonical_agencies(self):
        selected = {x["source_entity_local_id"]: x for x in self.items
                    if x["previous_research_candidate_id"] is not None}
        self.assertEqual({k: x["previous_research_candidate_id"] for k, x in selected.items()},
                         {"295": "EXP-SEED-INTERIOR-NPS",
                          "298": "EXP-SEED-INTERIOR-BIA",
                          "325": "EXP-SEED-LABOR-BLS",
                          "329": "EXP-SEED-LABOR-OSHA",
                          "240": "EXP-SEED-TRANSPORTATION-FAA",
                          "244": "EXP-SEED-TRANSPORTATION-FTA"})
        self.assertEqual(sum(x["previous_granule_resolution"] ==
                             "exact_official_details_page_verified"
                             for x in selected.values()), 5)
        self.assertIsNone(selected["325"]["previous_granule_url"])
        self.assertEqual(selected["325"]["previous_granule_resolution"],
                         "present_in_edition_navigation_but_granule_id_not_reconciled")
        self.assertTrue(all(x["canonical_component_id"] is None and
                            x["present_day_component_verified"] is False and
                            x["specific_statutory_authority_verified"] is False and
                            x["adl1_certified"] is False for x in selected.values()))

    def test_all_28_provenance_and_anti_authority_flags(self):
        for x in self.items:
            self.assertEqual(x["source_original_sha256"], mod.ORIGINAL_SHA)
            self.assertEqual(x["source_original_git_blob_sha1"], mod.ORIGINAL_BLOB)
            self.assertEqual(x["published_parent_key"],
                             mod.PACKAGE + ":" + ("120" if "INTERIOR" in x["canonical_department_anchor_id"]
                                                 else "323" if "LABOR" in x["canonical_department_anchor_id"]
                                                 else "124"))
            self.assertIn("/Childrens/SubEntityLevelOne[@EntityId='" +
                          x["source_entity_local_id"] + "']", x["source_xml_xpath"])
            for key in ("legal_identity_certified", "present_day_component_verified",
                        "independently_retained_component_statute_original",
                        "specific_statutory_authority_verified",
                        "operational_command_verified", "direct_supervision_verified",
                        "congressional_fiscal_control_verified",
                        "independent_legal_review_complete", "adl1_certified", "atlas_graph_admitted"):
                self.assertIs(x[key], False, x["source_entity_key"] + "." + key)

    def test_three_closed_json_schemas_retain_exact_publisher_identities(self):
        for kind, path in (("curation", mod.CURATION), ("dispositions", mod.DISPOSITIONS),
                           ("coverage", mod.COVERAGE)):
            data = mod.read(ROOT, path)
            schema_path = ROOT / ("schemas/inc15d5-govman-2025-" + kind + ".schema.json")
            schema = json.loads(schema_path.read_text(encoding="utf-8"))
            self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
            self.assertFalse(schema["additionalProperties"])
            subset(data, schema, path)
            if kind != "curation":
                self.assertEqual(data, self.expected[path])

    def reject(self, path, mutation, reason):
        folder, root = self.worktree()
        with folder:
            obj = mod.read(root, path)
            mutation(obj)
            self.write(root, path, obj)
            with self.assertRaisesRegex(ValueError, reason):
                mod.run(root)

    def test_original_xml_bitflip_fails_source_custody(self):
        folder, root = self.worktree()
        with folder:
            path = root / mod.ORIGINAL
            data = bytearray(path.read_bytes())
            data[7777] ^= 1
            path.write_bytes(data)
            with self.assertRaisesRegex(ValueError, "source byte length, original SHA-256"):
                mod.run(root)

    def test_wrong_source_original_edition_sha_fails(self):
        self.reject(mod.CURATION, lambda o: o.update(original_source_sha256="f" * 64),
                    "curation source edition")

    def test_disposition_extra_canonical_id_is_forbidden(self):
        self.reject(mod.CURATION, lambda o: o["items"][0].update(
            canonical_component_id="ORG-FED-EXE-DEP-INTERIOR-FAKE"),
            "closed field contract")

    def test_source_foreign_identifier_may_not_enter_federal_cohort(self):
        self.reject(mod.CURATION, lambda o: o["items"][0].update(
            source_entity_local_id="189", published_name="African Development Bank"),
            "missing or mis-parented|missing/foreign")

    def test_wrong_department_anchor_is_rejected(self):
        self.reject(mod.CURATION, lambda o: o["items"][0].update(
            canonical_department_anchor_id="ORG-FED-EXE-DEP-LABOR"),
            "mis-parented")

    def test_duplicate_source_entity_is_rejected(self):
        self.reject(mod.CURATION, lambda o: o["items"][1].update(
            source_entity_local_id=o["items"][0]["source_entity_local_id"]),
            "duplicate curated source entry")

    def test_fake_prior_research_candidate_identity_is_rejected(self):
        self.reject(mod.CURATION, lambda o: o["items"][0].update(
            prior_research_candidate_id="EXP-SEED-INTERIOR-NPS"),
            "earlier research seed mismatch")

    def test_curation_cannot_certify_28_legal_institutions(self):
        self.reject(mod.CURATION, lambda o: o.update(
            all_entries_checked_as_legal_institutions=True),
            "curation source edition")

    def test_false_curation_disposition_and_legal_alias_denied(self):
        self.reject(mod.CURATION, lambda o: o["items"][0].update(
            disposition="existing_canonical_id_match"),
            "unsupported disposition")

    def test_earlier_canonical_crosswalk_cannot_be_rewritten(self):
        self.reject(mod.govman.OUTPUTS["crosswalk"], lambda o: o["items"][0].update(
            canonical_id=None), "baseline original XML replay")

    def test_statutory_authority_cannot_be_promoted_in_output(self):
        self.reject(mod.DISPOSITIONS, lambda o: o["items"][0].update(
            specific_statutory_authority_verified=True),
            "committed derived model differs")

    def test_false_ADL1_or_operational_command_cannot_be_promoted(self):
        self.reject(mod.DISPOSITIONS, lambda o: o["items"][0].update(
            adl1_certified=True, operational_command_verified=True),
            "committed derived model differs")

    def test_false_legal_denominator_cannot_be_promoted(self):
        self.reject(mod.COVERAGE, lambda o: o.update(
            current_first_level_institution_denominator=28),
            "committed derived model differs")

    def test_fake_atlas_edges_cannot_be_promoted(self):
        self.reject(mod.COVERAGE, lambda o: o.update(
            atlas_published_relationships=28),
            "committed derived model differs")

    def test_manifest_must_not_mint_canonical_components_or_publish_atlas(self):
        self.reject(mod.MANIFEST, lambda o: o["federal_institutional_breadth_15d5_extension"].update(
            new_canonical_component_matches=28, website_atlas_published=True),
            "manifest source/status/registration mismatch")


if __name__ == "__main__":
    unittest.main()
