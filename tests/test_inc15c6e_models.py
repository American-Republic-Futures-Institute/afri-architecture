import importlib.util,json,shutil,tempfile,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("inc15c6e_models",BASE/"scripts/inc15c6e-validate-models.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class StatusModels(unittest.TestCase):
 def test_source_originals_and_proposal_status_pass(self):
  x=v.validate(BASE)
  self.assertEqual(x["budget_proposal_epochs"],2)
  self.assertEqual(x["budget_research_records"],6)
  self.assertEqual(x["ARPAH_staff_page_office_names"],10)
  self.assertEqual(x["ARPAH_timeline_events"],4)
  self.assertFalse(x["certified_budget_based_reorganization"])
  self.assertIsNone(x["current_HHS_legal_first_level_denominator"])
 def modify(self,path,change,also=None):
  with tempfile.TemporaryDirectory(prefix="arfi_c6e_models_") as td:
   root=Path(td)
   relative=["model/federal/manifest.json","model/federal/inc15c3-hhs-directory-reconciliation.json",
     "model/federal/inc15c6-hhs-institutional-exception-boundaries.json",
     "model/federal/inc15c6d-hhs-historical-source-coverage.json",
     "scripts/inc15c6e-validate-original-custody.py"]
   for k in v.PINNED:
    relative+=["model/federal/"+k+".json","schemas/"+k+".schema.json"]
   for loc in relative:
    dst=root/loc;dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(BASE/loc,dst)
   shutil.copytree(BASE/"evidence/hhs-arpah-2026-observation",
                   root/"evidence/hhs-arpah-2026-observation")
   for loc,fn in [(path,change)]+([] if also is None else [also]):
    f=root/loc
    d=json.loads(f.read_text());fn(d);f.write_text(json.dumps(d,indent=2)+"\n")
   with self.assertRaisesRegex(ValueError,"INC-15C.6E model rejected"):
    v.validate(root)
 def test_FY2026_proposal_not_decree(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][0].update(lifecycle_state="implemented_primary_source_qualified"))
 def test_FY2027_ASCRA_not_certified_successor(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][3].update(target_canonical_legal_institution_id="ORG-FED-EXE-HHS-ASCRA"))
 def test_FY2026_ASE_not_signed_legal_source(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][0].update(operative_instrument_url="https://hhs.gov/fake-order"))
 def test_FY2027_updated_budget_not_FY2026(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][3].update(source_original_pdf_url="https://www.hhs.gov/sites/default/files/fy-2026-gdm-cj.pdf"))
 def test_HHS_GDM_PDF_403_not_custodied(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][3].update(source_original_bytes_custodied=True))
 def test_unverified_jurisdiction_not_transferred(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][0].update(adjudicative_case_control_or_statutory_powers_transferred_verified=True))
 def test_original_arpah_personnel_not_2026_legal_roster(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o.update(current_office_hierarchy_exhaustiveness_verified=True))
 def test_arpah_2024_budget_not_executed(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o.update(FY2025_budget_14_to_8_plan_verified_implemented=True))
 def test_arpah_observed_office_no_signed_order(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o["office_items"][0].update(independent_source_legal_office_id="NEW-CANONICAL-1"))
 def test_arpah_publisher_role_text_pin(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o["office_items"][8].update(source_provenance_role_text="Chancellor, Proactive Health"))
 def test_arpah_2025_timeline_cannot_claim_2026(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o["timeline_items"][1].update(publisher_event_date="2026-09-25"))
 def test_arpah_second_original_timeline_hash_pin(self):
  self.modify("model/federal/inc15c6e-arpah-live-office-observations.json",
   lambda o:o.update(original_timeline_page_sha256="0"*64))
 def test_DAB_OMHA_unretained_raw_must_remain_null(self):
  self.modify("model/federal/inc15c6e-hhs-source-lifecycle-coverage.json",
   lambda o:o["source_items"][4].update(exact_original_bytes_in_git=True))
 def test_existing_hhs_OIG_exception_not_collapsed(self):
  self.modify("model/federal/inc15c6e-hhs-source-lifecycle-coverage.json",
   lambda o:o["exception_items"][3].update(budget_proposal_parent_office_implemented=True))
 def test_29_names_not_additive_with_11_and_6(self):
  self.modify("model/federal/inc15c6e-hhs-source-lifecycle-coverage.json",
   lambda o:o.update(additive_government_institution_count=46))
 def test_full_manifest_no_current_agency_count(self):
  self.modify("model/federal/manifest.json",
   lambda o:o["federal_institutional_breadth_15c6e_extension"].update(legal_first_level_denominator=40))
 def test_schema_and_record_coforge_not_accepted(self):
  self.modify("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
   lambda o:o["items"][0].update(legal_organizational_completeness=True),
   ("schemas/inc15c6e-hhs-budget-proposal-epochs.schema.json",
    lambda o:o["properties"]["items"]["items"]["properties"].update(legal_organizational_completeness={"const":True})))
if __name__=="__main__":unittest.main()
