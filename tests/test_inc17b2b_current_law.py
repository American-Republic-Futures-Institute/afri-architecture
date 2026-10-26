"""INC-17B.2B adversarial source-epoch, semantic and Atlas nonpromotion gates."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("inc17b2b_model",ROOT/"scripts/inc17b2b-current-law-core.py")
core=importlib.util.module_from_spec(spec)
spec.loader.exec_module(core)
BASE=core.load()
def item(name,needle):
 return next(x for x in name["items"] if needle in x["id"])
class CurrentLawAndInstitutionalBounds(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  result=core.validate(copy.deepcopy(BASE),replay_originals=True)
  if result["errors"]:
   raise AssertionError("Control data did not qualify: "+repr(result["errors"][:8]))
 def reject(self,update,expected):
  d=copy.deepcopy(BASE);update(d)
  errors=core.validate(d,replay_originals=False)["errors"]
  self.assertTrue(errors,"Invalid source/legal/operational model unexpectedly accepted")
  self.assertIn(expected," | ".join(errors),repr(errors[:6]))
 def test_original_receipts_and_incomplete_department_qualification(self):
  r=core.validate(copy.deepcopy(BASE),replay_originals=False)
  self.assertEqual(r["errors"],[])
  self.assertEqual(r["summary"]["current_original_sections"],7)
  self.assertEqual(r["summary"]["new_original_department_pages"],3)
  self.assertEqual(r["summary"]["agency_source_access_gaps"],1)
  self.assertEqual(r["summary"]["sourced_statutory_relationship_candidates"],28)
  self.assertEqual(r["summary"]["VA_two_source_name_concordances"],4)
  self.assertEqual(r["summary"]["actual_current_ADL1_denominator"],None)
  self.assertEqual(r["summary"]["new_admitted_legal_or_command_edges"],0)
 def test_cannot_backdate_modern_state_bureau_to_2024(self):
  self.reject(lambda d:item(d["epochs"],"STATE-2651A").__setitem__(
   "prior_publisher_edition","USCODE-2026-title22"),"Invalid original or historical source crosswalk")
 def test_2025_new_state_bureaus_must_not_be_mapped_as_historical(self):
  self.reject(lambda d:item(d["legal"],"STATE-HR").__setitem__(
   "prior_2023_or_2024_proposition_id","WG17B2A-PROP-02"),"Unqualified historical claim joins")
 def test_do_not_treat_2026_law_through_as_effective_date(self):
  self.reject(lambda d:item(d["epochs"],"STATE-2651A").__setitem__(
   "independently_adjudicated_legal_effective_interval","2026-10-15"),"Epoch revision incorrectly became")
 def test_no_source_currentness_after_119124_without_evidence(self):
  self.reject(lambda d:item(d["legal"],"STATE-CA").__setitem__(
   "current_olrc_release","Public Law 119-999"),"Statutory relationship not tied")
 def test_no_unreviewed_canonical_component_identity(self):
  self.reject(lambda d:item(d["legal"],"STATE-CA").__setitem__(
   "legally_determined_current_organization_identity",True),"Statutory source text promoted")
 def test_no_legal_command_from_statutory_inclusion(self):
  self.reject(lambda d:item(d["legal"],"STATE-CA").__setitem__(
   "first_level_immediate_organizational_reporting_verified",True),"Statutory source text promoted")
 def test_no_legal_advice_certification(self):
  self.reject(lambda d:item(d["legal"],"VA-VHA").__setitem__(
   "independent_professional_legal_review_complete",True),"Statutory source text promoted")
 def test_no_executed_statutory_delegation_without_instrument(self):
  self.reject(lambda d:item(d["legal"],"DHS-SECRETARY").__setitem__(
   "operationally_executed_delegation_verified",True),"Statutory source text promoted")
 def test_no_original_legal_statement_drift(self):
  self.reject(lambda d:item(d["legal"],"HUD-DEPUTY").__setitem__(
   "legal_clause_body_anchor","The Secretary actively delegated law enforcement authority to the Deputy Secretary yesterday"),
   "Relationship predicate not supported")
 def test_all_source_status_uses_real_original_hashes(self):
  self.reject(lambda d:item(d["legal"],"VA-VHA").__setitem__(
   "current_original_sha256","0"*64),"Statutory relationship not tied")
 def test_no_new_statutory_semantics_without_new_review(self):
  self.reject(lambda d:item(d["legal"],"DHS-SECRETARY").__setitem__(
   "legal_relation_type","exercises_military_command_over_all_states"),"Relationship predicate not supported")
 def test_no_fabricated_globally_canonical_component(self):
  self.reject(lambda d:item(d["legal"],"STATE-HR").__setitem__(
   "to_id","ORG-FED-EXE-DEP-STATE-BUREAU-HR"),"Duplicate or falsely global canonical subject")
 def test_no_conflation_of_hud_officer_class_and_actual_occupancy(self):
  self.reject(lambda d:item(d["legal"],"HUD-ASSISTANTS").__setitem__(
   "current_org_chart_completeness_certified",True),"Statutory source text promoted")
 def test_va_two_originals_do_not_certify_direct_supervision(self):
  self.reject(lambda d:item(d["legal"],"VA-BVA").__setitem__(
   "first_level_immediate_organizational_reporting_verified",True),"Statutory source text promoted")
 def test_va_board_contract_appeals_not_certified_as_current(self):
  self.reject(lambda d:item(d["exceptions"],"CONTRACT_APPEALS_BOARD").__setitem__(
   "current_actual_role_or_organizational_identity_certified",True),"Exception incorrectly became")
 def test_va_oig_not_direct_command(self):
  self.reject(lambda d:item(d["exceptions"],"OIG_INDEPENDENCE").__setitem__(
   "confirmed_report_to_or_operational_command",True),"Exception incorrectly became")
 def test_dhs_coast_guard_military_transfer_not_implied(self):
  self.reject(lambda d:item(d["directories"],"DHS-USCG").__setitem__(
   "military_command_or_delegation_proven",True),"Publisher listing promoted")
 def test_dhs_oig_historical_chart_does_not_confer_management_authority(self):
  self.reject(lambda d:item(d["directories"],"DHS-OIG").__setitem__(
   "direct_reporting_or_supervision_proven",True),"Publisher listing promoted")
 def test_historical_dhs_chart_not_2026_agency_roster(self):
  self.reject(lambda d:item(d["directories"],"DHS-FEMA").__setitem__(
   "time_scope","current_live_2026_DHS_agency_roster"),"Historical DHS chart box remapped")
 def test_hud_program_list_not_current_statutory_office_universe(self):
  self.reject(lambda d:item(d["directories"],"HUD-CPD").__setitem__(
   "independent_current_legal_first_level_identity_verified",True),"Publisher listing promoted")
 def test_usda_mission_area_agencies_not_direct_reporting(self):
  self.reject(lambda d:item(d["directories"],"AGRICULTURE-FSA").__setitem__(
   "direct_reporting_or_supervision_proven",True),"Publisher listing promoted")
 def test_source_observations_have_precise_publisher_sha(self):
  self.reject(lambda d:item(d["directories"],"HUD-GNMA").__setitem__(
   "publisher_original_sha256","1"*64),"Directory/charts must preserve")
 def test_state_historical_fam_download_gap_not_certified_coverage(self):
  self.reject(lambda d:item(d["coverage"],"COV-STATE").__setitem__(
   "remaining_fam_current_directory_gap",False),"Department source reconciliation mismatched")
 def test_department_current_first_level_counts_unknown(self):
  self.reject(lambda d:item(d["coverage"],"COV-VA").__setitem__(
   "qualified_full_adl1_department_denominator",22),"False current federal first-level")
 def test_2025_new_state_law_does_not_approve_all_15_cabinet_rosters(self):
  self.reject(lambda d:d["coverage"].__setitem__(
   "fully_qualified_current_department_count",15),"Unqualified all-Cabinet completeness")
 def test_olrc_source_is_not_a_public_atlas_admission(self):
  self.reject(lambda d:d["manifest"]["whole_government_inc17b2b_extension"].__setitem__(
   "public_atlas_admission",True),"False institutional authority")
 def test_no_mutation_of_2025_department_source_coverage(self):
  self.reject(lambda d:item(d["coverage"],"COV-STATE").__setitem__(
   "prior_2025_govman_immediate_source_observations",15),"Department source reconciliation mismatched")
 def test_distinguish_statutory_note_reference_change_and_merger(self):
  self.reject(lambda d:item(d["exceptions"],"HUMAN_RESOURCES_REFERENCES").__setitem__(
   "current_actual_role_or_organizational_identity_certified",True),"Exception incorrectly became")
 def test_dhs_112_authorization_not_executed_delegate(self):
  self.reject(lambda d:item(d["exceptions"],"AUTHORIZED_DELEGATION_NOT_EXECUTED").__setitem__(
   "confirmed_report_to_or_operational_command",True),"Exception incorrectly became")
 def test_source_only_legal_subject_link_is_not_official_graph_edge(self):
  self.reject(lambda d:item(d["legal"],"VA-VHA").__setitem__(
   "atlas_admitted",True),"Statutory source text promoted")
 def test_jurisdiction_federal_parent_cannot_be_swapped(self):
  self.reject(lambda d:item(d["legal"],"STATE-CA").__setitem__(
   "from_id","JUR-US-VA"),"Statutory relationship not tied")
 def test_closed_schema_rejects_fabricated_current_legal_effect(self):
  self.reject(lambda d:item(d["legal"],"STATE-CA").__setitem__(
   "currently_federally_commanded",True),"Schema closed object changed")
 def test_original_html_anchor_must_be_present_in_source(self):
  spec=importlib.util.spec_from_file_location("inc17b2b_source",ROOT/"scripts/inc17b2b-capture-official.py")
  mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
  origin=BASE["current"]["records"]["STATE-2651A"]["source_original_path"]
  raw=(ROOT/origin).read_bytes()
  self.assertIsNotNone(mod.verify_source("STATE-2651A",raw))
  tampered=raw.replace(b"Bureau of Human Resources",b"Bureau of H___n Resources")
  self.assertNotEqual(tampered,raw)
  with self.assertRaises(ValueError):mod.verify_source("STATE-2651A",tampered)
if __name__=="__main__":unittest.main()
