"""INC-15D.9 source-replay: final 15 plus publisher-wide 231/50/88/93 accounting."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15d9",ROOT/"scripts/inc15d9-govman-reconcile.py")
m=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
p8=m.prior
p7=p8.prior
p6=p7.prior
p5=p6.prior

COPIED=set([
 m.ORIGINAL,m.govman.LINKS,m.govman.X12,*m.govman.OUTPUTS.values(),
 p5.CURATION,p5.DISPOSITIONS,p5.COVERAGE,
 p6.CURATION,p6.DISPOSITIONS,p6.COVERAGE,
 p7.CURATION,p7.DISPOSITIONS,p7.COVERAGE,
 p8.CURATION,p8.DISPOSITIONS,p8.COVERAGE,
 m.CURATION,m.DISPOSITIONS,m.COVERAGE,m.PUBLISHER_WIDE,m.MANIFEST,
 m.CANONICAL,m.X12,p6.SEEDS,p6.GRANULES,p6.UNITS,
 p6.COMMERCE_SOURCE,p6.COMMERCE_SNAPSHOTS,p6.ED_CHART,
 p6.DEPARTMENTS,p6.IDENTITIES,
])

def exact_json_schema(value,schema,label="root"):
    if "const" in schema:
        assert value==schema["const"],label+" constant mismatch"
    if "enum" in schema:
        assert value in schema["enum"],label+" enum mismatch"
    if "type" in schema:
        options=schema["type"] if type(schema["type"]) is list else [schema["type"]]
        match={
         "object":lambda x:type(x) is dict,
         "array":lambda x:type(x) is list,
         "boolean":lambda x:type(x) is bool,
         "string":lambda x:type(x) is str,
         "integer":lambda x:type(x) is int,
         "null":lambda x:x is None,
        }
        assert any(match[t](value) for t in options),label+" wrong value type"
    if type(value) is dict:
        required=set(schema.get("required",()))
        assert required.issubset(value),label+" missing mandatory fields"
        props=schema.get("properties",{})
        if schema.get("additionalProperties") is False:
            assert set(value).issubset(props),label+" unapproved fields"
        for field,rule in props.items():
            if field in value:
                exact_json_schema(value[field],rule,label+"."+field)
    if type(value) is list:
        assert len(value)>=schema.get("minItems",0),label+" too few rows"
        assert len(value)<=schema.get("maxItems",len(value)),label+" too many rows"
        if "items" in schema:
            for idx,row in enumerate(value):
                exact_json_schema(row,schema["items"],label+"["+str(idx)+"]")


class FinalIndependentPublisherSources(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.generated=m.expected(ROOT)
        cls.rows=cls.generated[m.DISPOSITIONS]["items"]
        cls.coverage=cls.generated[m.COVERAGE]
        cls.whole=cls.generated[m.PUBLISHER_WIDE]
        cls.by={x["source_local_id"]:x for x in cls.rows}

    def scratch(self):
        temp=tempfile.TemporaryDirectory(prefix="inc15d9_negative_")
        root=Path(temp.name)
        for path in COPIED:
            dest=root/path
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(ROOT/path,dest)
        return temp,root

    def reject(self,path,mutation,error="INC-15D.9 publisher/canonical qualification denied"):
        temp,root=self.scratch()
        with temp:
            obj=m.read(root,path)
            mutation(obj)
            (root/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",
                                   encoding="utf-8")
            with self.assertRaisesRegex(ValueError,error):
                m.run(root)

    def test_last_15_exact_official_publisher_IDs_and_order(self):
        res=m.run(ROOT)
        self.assertEqual(res["independent_category_unlinked_source_dispositions"],45)
        self.assertEqual([x["source_local_id"] for x in self.rows],list(m.IDS))
        self.assertEqual(len({x["source_entity_key"] for x in self.rows}),15)
        self.assertEqual(res["independent_category_entries_awaiting_source_disposition"],0)

    def test_first_30_unchanged_and_45_of_45_independent_entries_accounted(self):
        self.assertEqual((self.coverage["source_only_entries_with_individual_dispositions"],
                          self.coverage["source_only_entries_outstanding"]),(45,0))
        self.assertEqual(self.coverage["existing_17_provisional_canonical_links_modified"],0)
        self.assertTrue(self.coverage["items"][0]["original_source_only_tranches_are_disjoint"])
        self.assertEqual([self.coverage["items"][0][k] for k in
                          ("INC15D7_source_only_entries","INC15D8_source_only_entries",
                           "INC15D9_source_only_entries")],[15,15,15])

    def test_231_50_181_88_93_publisher_accounting_is_disjoint(self):
        r=m.run(ROOT)
        self.assertEqual((r["total_source_entries"],r["provisional_links_unchanged"],
                          r["source_entries_unlinked_unchanged"],
                          r["edition_wide_source_only_dispositions"],
                          r["edition_wide_unlinked_source_entries_without_disposition"]),
                         (231,50,181,88,93))
        self.assertEqual(self.whole["unlinked_entries_with_explicit_source_only_disposition"],88)
        self.assertEqual(self.whole["unlinked_entries_without_source_only_disposition"],93)
        self.assertEqual(self.whole["historical_provisional_canonical_name_links"],50)

    def test_seven_distinct_publisher_categories_are_not_federal_census(self):
        cats=self.whole["items"]
        self.assertEqual(len(cats),7)
        self.assertEqual([r["original_publisher_entries"] for r in cats],
                         [10,16,2,117,62,8,16])
        self.assertEqual([r["prior_provisional_canonical_name_links"] for r in cats],
                         [9,7,2,15,17,0,0])
        self.assertEqual([r["unlinked_source_only_entries_with_disposition"] for r in cats],
                         [0,0,0,43,45,0,0])
        self.assertEqual([r["unlinked_entries_without_disposition"] for r in cats],
                         [1,9,0,59,0,8,16])
        self.assertTrue(all(x["publisher_category_is_current_US_government_population"] is False
                            and x["legally_certified_federal_entity_denominator"] is None
                            for x in cats))
        self.assertEqual(self.whole["source_scope"],
                         "original_2025_publisher_directory_not_government_legal_census")

    def test_OPIC_2025_historical_name_is_not_automatically_succeeded(self):
        x=self.by["169"]
        self.assertEqual(x["original_name"],"Overseas Private Investment Corporation")
        self.assertEqual(x["disposition"],m.HISTORICAL)
        self.assertIs(x["historical_OPIC_name_successor_identity_unresolved"],True)
        self.assertFalse(x["verified_successor_or_rename_identity"])
        self.assertFalse(x["original_statute_charter_or_successor_transition_reconciled"])
        self.assertIsNone(x["canonical_component_id"])

    def test_USAID_2025_directory_cannot_answer_2026_reorganization(self):
        x=self.by["180"]
        self.assertEqual(x["original_name"],"United States Agency for International Development")
        self.assertEqual(x["disposition"],m.TEMPORAL)
        self.assertIs(x["USAID_2026_institution_status_unresolved"],True)
        self.assertIs(x["present_day_legal_institutional_identity_verified"],False)
        self.assertIs(x["current_2026_operations_or_staffing_verified"],False)
        self.assertIs(x["agency_oversight_delegation_or_command_verified"],False)

    def test_two_special_named_bodies_need_original_charters(self):
        self.assertEqual({x["source_local_id"] for x in self.rows
                          if x["publisher_corporate_or_special_form_requires_legal_original"]},
                         {"171","178"})
        for local in ("171","178"):
            self.assertEqual(self.by[local]["disposition"],m.SPECIAL_FORM)
            self.assertIs(self.by[local]["government_corporation_or_agency_legal_subtype_verified"],False)
            self.assertIs(self.by[local]["fiscal_ownership_appropriation_or_budget_authority_verified"],False)

    def test_eleven_other_names_and_missions_are_source_only_not_authority(self):
        general=[x for x in self.rows if x["disposition"]==m.GENERAL]
        self.assertEqual(len(general),11)
        self.assertTrue(all(x["publisher_mission_does_not_qualify_legal_powers"] is True and
                            x["publisher_directory_class_is_not_verified_federal_subtype"] is True
                            for x in general))

    def test_publisher_sort_order_is_not_unique_entity_key(self):
        self.assertEqual(self.by["170"]["publisher_published_order"],73)
        self.assertEqual(self.by["169"]["publisher_published_order"],73)
        self.assertEqual(self.by["128"]["publisher_published_order"],84)
        self.assertEqual(self.by["179"]["publisher_published_order"],84)
        self.assertEqual(self.by["169"]["unlinked_publisher_category_ordinal"],32)

    def test_exact_original_local_key_path_category_and_sha(self):
        for row in self.rows:
            local=row["source_local_id"]
            self.assertEqual(row["source_entity_key"],m.PKG+":"+local)
            self.assertEqual(row["original_source_xpath"],
                "/GovernmentManual/Entity[@EntityId='"+local+"']")
            self.assertIsNone(row["source_parent_key"])
            self.assertEqual(row["source_depth"],0)
            self.assertEqual(row["source_element_tag"],"Entity")
            self.assertEqual(row["publisher_category"],m.CATEGORY)
            self.assertEqual(row["publisher_category_scope"],"independent_publisher")
            self.assertEqual(row["source_original_sha256"],m.SHA)
            self.assertEqual(row["source_original_git_blob_sha1"],m.BLOB)

    def test_all_15_unqualified_legal_fiscal_current_command_and_atlas(self):
        for x in self.rows:
            self.assertIsNone(x["canonical_component_id"])
            for key in ("present_day_legal_institutional_identity_verified",
                        "current_2026_operations_or_staffing_verified",
                        "original_statute_charter_or_successor_transition_reconciled",
                        "verified_successor_or_rename_identity",
                        "government_corporation_or_agency_legal_subtype_verified",
                        "fiscal_ownership_appropriation_or_budget_authority_verified",
                        "agency_oversight_delegation_or_command_verified",
                        "reported_publisher_mission_independently_verified_as_actual_action",
                        "adl1_legal_institution_certified",
                        "independent_legal_review_complete","external_worm_custody_verified",
                        "atlas_relationship_admitted","plan_or_data_outcome_claims_created"):
                self.assertIs(x[key],False,x["source_entity_key"]+"."+key)
        self.assertIsNone(self.whole["present_day_legal_federal_organization_denominator"])

    def test_four_closed_schema_contracts(self):
        for kind,path in (("curation",m.CURATION),("dispositions",m.DISPOSITIONS),
                          ("coverage",m.COVERAGE),
                          ("publisherwide-disposition-coverage",m.PUBLISHER_WIDE)):
            spec=json.loads((ROOT/("schemas/inc15d9-govman-2025-"+kind+".schema.json")).read_text())
            self.assertEqual(spec["$schema"],"https://json-schema.org/draft/2020-12/schema")
            self.assertIs(spec["additionalProperties"],False)
            exact_json_schema(m.read(ROOT,path),spec,path)
            if kind=="dispositions":
                child=spec["properties"]["items"]["items"]
                self.assertFalse(child["additionalProperties"])
                for field in ("verified_successor_or_rename_identity",
                              "current_2026_operations_or_staffing_verified",
                              "atlas_relationship_admitted"):
                    self.assertIs(child["properties"][field]["const"],False)

    def test_original_8MB_xml_bitflip_rejected(self):
        scope,root=self.scratch()
        with scope:
            path=root/m.ORIGINAL
            raw=bytearray(path.read_bytes());raw[28551]^=1;path.write_bytes(raw)
            with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
                m.run(root)

    def test_wrong_original_edition_sha_rejected(self):
        self.reject(m.CURATION,lambda o:o.update(source_original_sha256="0"*64))

    def test_wrong_source_edition_id_rejected(self):
        self.reject(m.CURATION,lambda o:o.update(source_edition="GOVMAN-2026-01-01"))

    def test_missing_one_of_15_original_entries_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"].pop())

    def test_duplicate_source_entity_key_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"][2].update(
            source_entity_local_id=o["items"][0]["source_entity_local_id"],
            source_entity_key=o["items"][0]["source_entity_key"]))

    def test_foreign_source_entry_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"][0].update(
            source_entity_local_id="189",source_entity_key=m.PKG+":189"))

    def test_original_xpath_edit_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"][0].update(
            source_xml_xpath="/GovernmentManual/Entity[@EntityId='171']"))

    def test_original_publisher_order_edit_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"][0].update(
            original_published_order=999))

    def test_original_selected_tranche_position_edit_rejected(self):
        self.reject(m.CURATION,lambda o:o["items"][0].update(
            original_publisher_sequence_index=15))

    def test_false_OPIC_successor_reconciliation_rejected(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="169").update(
            agency_rename_reorganization_or_transfer_independently_verified=True))

    def test_OPIC_cannot_be_downgraded_to_generic_without_historical_flag(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="169").update(disposition=m.GENERAL))

    def test_false_USAID_institution_2026_status_rejected(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="180").update(
            current_2026_operational_status_verified=True))

    def test_false_USAID_closure_or_continuation_disposition_rejected(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="180").update(disposition=m.HISTORICAL))

    def test_PBGC_fiscal_ownership_cannot_be_inferred_from_name(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="171").update(
            fiscal_ownership_or_congressional_appropriation_verified=True))

    def test_TVA_authority_name_does_not_certify_statute(self):
        self.reject(m.CURATION,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="178").update(
            original_entity_statute_charter_or_transition_custody_qualified=True))

    def test_unqualified_board_title_does_not_create_command(self):
        self.reject(m.DISPOSITIONS,lambda o:next(x for x in o["items"]
            if x["source_local_id"]=="173").update(
            agency_oversight_delegation_or_command_verified=True))

    def test_unqualified_agency_name_does_not_become_canonical_ID(self):
        self.reject(m.CURATION,lambda o:o["items"][0].update(
            legal_identity_or_successor_canonical_match="ORG-FED-EXE-IND-FAKE"))

    def test_a_research_disposition_cannot_become_atlas_admission(self):
        self.reject(m.DISPOSITIONS,lambda o:o["items"][0].update(
            atlas_relationship_admitted=True))

    def test_total_publisher_category_ledger_cannot_claim_88_legal_agencies(self):
        self.reject(m.PUBLISHER_WIDE,lambda o:o.update(
            legal_authority_census_completed=True))

    def test_whole_publisher_181_unlinked_entries_cannot_decrease(self):
        self.reject(m.PUBLISHER_WIDE,lambda o:o.update(
            still_unlinked_publisher_observations=93))

    def test_legislative_category_cannot_be_falsely_disposed_in_15D9(self):
        self.reject(m.PUBLISHER_WIDE,lambda o:o["items"][0].update(
            unlinked_source_only_entries_with_disposition=1))

    def test_independent_category_disposition_count_cannot_be_44(self):
        self.reject(m.COVERAGE,lambda o:o["items"][0].update(
            all_three_source_only_entries_accounted=44))

    def test_previous_Arts_foundation_parentage_must_not_change(self):
        self.reject(p8.DISPOSITIONS,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="208").update(
            published_parent_key=None),"INC-15D.8 source/canonical contract rejected")

    def test_previous_federal_reserve_Board_non_equivalence_must_hold(self):
        self.reject(p7.DISPOSITIONS,lambda o:next(x for x in o["items"]
            if x["source_entity_local_id"]=="147").update(
            composite_federal_reserve_system_not_board_of_governors=False),
            "INC-15D.7 source disposition rejected")

    def test_prior_50_provisional_links_cannot_change(self):
        self.reject(m.govman.OUTPUTS["crosswalk"],lambda o:o["items"][0].update(
            canonical_id=None),"INC-15D.5 reconciliation rejected")

    def test_manifest_cannot_invent_legal_canonical_or_atlas_promotion(self):
        self.reject(m.MANIFEST,lambda o:o["federal_institutional_breadth_15d9_extension"].update(
            new_canonical_legal_identities=15,atlas_graph_admission=True))

    def test_manifest_cannot_misstate_88_source_only_coverage(self):
        self.reject(m.MANIFEST,lambda o:o["federal_institutional_breadth_15d9_extension"].update(
            whole_publisher_source_observations_with_source_only_dispositions=181))

    def test_publisher_observation_cannot_silently_record_independent_measurement(self):
        self.reject(m.PUBLISHER_WIDE,lambda o:o.update(
            newly_independently_measured_public_service_outcome_links=1))


if __name__=="__main__":
    unittest.main()
