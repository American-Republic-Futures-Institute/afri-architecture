"""INC-17B.2A fail-closed statutory text and first-level nonpromotion regression."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
def imported(key,filename):
 s=importlib.util.spec_from_file_location(key,ROOT/filename)
 m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
core=imported("inc17b2a_model","scripts/inc17b2a-qualification-core.py")
originals=imported("inc17b2a_capture","scripts/inc17b2a-capture-statutes.py")
BASE=core.load_context()

class StatutoryQualifications(unittest.TestCase):
 def test_originals_and_reconciliations_pass_offline(self):
  self.assertEqual(originals.verify(ROOT)["official_originals"],6)
  result=core.validate_data(copy.deepcopy(BASE),validate_originals=True)
  self.assertEqual([],result["errors"],result["errors"])
  self.assertEqual(result["summary"]["source_textual_propositions"],15)
  self.assertEqual(result["summary"]["current_legal_adl1_qualified"],0)
  self.assertFalse(result["summary"]["public_atlas_admitted"])
 def rejected(self,fn,message):
  d=copy.deepcopy(BASE);fn(d)
  result=core.validate_data(d,validate_originals=False)
  self.assertTrue(result["errors"],"mutated research status unexpectedly qualified")
  self.assertIn(message," | ".join(result["errors"]))
 def test_all_six_sources_must_have_original_custody(self):
  self.rejected(lambda d:d["receipt"]["records"].pop("INC17B2A-SRC-HUD-3532"),
                "six official publisher sources")
 def test_cannot_merge_three_independent_source_epochs(self):
  self.rejected(lambda d:d["candidates"]["items"][4].__setitem__("source_edition","OLRC-through-PL-119-120"),
                "cross-era statute text")
 def test_original_receipt_hash_required_per_statute(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__("source_original_sha256","0"*64),
                "cross-era statute text")
 def test_legal_currentness_cannot_be_assumed_from_2024(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__("legal_currentness_2026_independently_verified",True),
                "uncertified legal powers")
 def test_source_only_statutory_bureau_is_not_complete_adl1(self):
  self.rejected(lambda d:d["candidates"]["items"][1].__setitem__("legal_organization_first_level_verified",True),
                "uncertified legal powers")
 def test_no_automatic_atlas_source_promotion(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__("atlas_admitted",True),
                "uncertified legal powers")
 def test_no_minted_canonical_unit_from_source_name(self):
  self.rejected(lambda d:d["candidates"]["items"][1].__setitem__("current_canonical_component_id","ORG-FED-STATE-CONSULAR"),
                "uncertified legal powers")
 def test_publisher_source_does_not_prove_actual_secretary_incumbent(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__("verified_executed_delegation_or_command",True),
                "uncertified legal powers")
 def test_disallow_statute_as_unreviewed_military_command(self):
  self.rejected(lambda d:d["candidates"]["items"][14].__setitem__("relationship_candidate_kind","operationally_commands"),
                "untyped or out-of-scope legal proposition")
 def test_no_mismapped_original_department(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__("canonical_department_id","ORG-FED-EXE-DEP-HUD"),
                "unverified statutory source institution endpoint")
 def test_dhs_34_boxes_remain_historical_descriptive_not_command(self):
  self.rejected(lambda d:next(x for x in d["coverage"]["items"] if x["canonical_department_id"].endswith("DHS")).__setitem__(
   "current_command_supervision_and_delegation_verified",True),"false current organization")
 def test_va_directory_22_entries_not_22_statutory_adl1_offices(self):
  self.rejected(lambda d:next(x for x in d["coverage"]["items"] if x["canonical_department_id"].endswith("VA")).__setitem__(
   "current_federal_first_level_legal_roster_count",22),"false current organization")
 def test_prior_zero_government_manual_children_not_no_offices(self):
  self.rejected(lambda d:next(x for x in d["coverage"]["items"] if x["canonical_department_id"].endswith("STATE")).__setitem__(
   "govman_2025_zero_immediate_entries_is_not_absence_of_offices",False),"historic publisher and official statute")
 def test_no_assumed_current_board_of_contract_appeals(self):
  self.rejected(lambda d:next(x for x in d["candidates"]["items"] if x["source_subject_label"]=="Board of Contract Appeals").__setitem__(
   "qualification_note","The Board of Contract Appeals currently operates."),"historic VA contract appeals board misrepresented")
 def test_five_department_priorities_do_not_promote_all_15_as_qualified(self):
  self.rejected(lambda d:d["coverage"].__setitem__("fully_qualified_current_department_roster_count",15),
                "historical edition populations added")
 def test_legacy_seed_name_must_exist_without_auto_identity_equivalence(self):
  self.rejected(lambda d:d["candidates"]["items"][1].__setitem__("legacy_research_candidate_id","INVENTED-FED-BUREAU"),
                "unverified old research crosswalk")
 def test_cannot_convert_source_only_gap_to_federalism_command(self):
  self.rejected(lambda d:d["coverage"]["items"][0].__setitem__(
   "current_command_supervision_and_delegation_verified",True),"false current organization")
 def test_statutory_source_clause_anchor_must_be_in_primary_body_not_notes(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__(
   "observed_clause_text_anchor","No evidence of currently executed appointments here"),
   "clause not found inside statutory text body")
 def test_schema_rejects_unreviewed_graph_admission_metadata(self):
  self.rejected(lambda d:d["candidates"]["items"][0].__setitem__(
   "new_operational_command_verified",True),"schema closed fields drift")
 def test_disallow_double_counting_international_or_unmodeled_components(self):
  self.rejected(lambda d:d["coverage"].__setitem__("exact_current_federal_adl1_denominator",63),
                "historical edition populations added")
 def test_manifest_requires_explicit_separate_no_admission_family(self):
  self.rejected(lambda d:d["manifest"]["whole_government_inc17b2a_extension"].__setitem__(
   "public_atlas_admission",True),"manifest authority/identity admission")
 def test_source_bytes_modified_cannot_pass_unchanged_anchor_verification(self):
  key="INC17B2A-SRC-USDA-2202"
  raw=(ROOT/BASE["receipt"]["records"][key]["source_original_repository_path"]).read_bytes()
  self.assertTrue(originals.text_for_original(key,raw))
  changed=raw.replace(b"Department of Agriculture shall be an executive department",
                      b"Department of Agriculture MIGHT be an executive department")
  self.assertNotEqual(raw,changed)
  with self.assertRaises(ValueError): originals.text_for_original(key,changed)

if __name__=="__main__":unittest.main()
