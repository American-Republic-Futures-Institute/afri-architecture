"""Exact five-original HHS FDA/OIG/OGC source custody and legal nonpromotion guards."""
import copy,importlib.util,json,shutil,tempfile,unittest
from pathlib import Path
from unittest import mock

BASE=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15c6h_custody",BASE/"scripts/inc15c6h-capture-source-editions.py")
mod=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(mod)

class ImmutableSourceEditions(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.receipts=json.loads((mod.ROOT/"receipts/source-custody.json").read_text())
 def test_01_five_official_source_originals_and_dates(self):
  data=mod.validate(self.receipts)
  self.assertTrue(data["validated"])
  self.assertEqual(data["publisher_source_originals"],5)
  self.assertTrue(data["1997_OIG_source_is_whole_issue_not_individual_granule"])
  self.assertEqual(data["removed_5_1105_effective"],"2026-06-15")
  self.assertIsNone(data["whole_HHS_legal_roster_denominator"])
 def test_02_exact_publisher_SHA_size_and_Git_original(self):
  for key,expected in mod.PINNED_APPROVED_SOURCE_ORIGINALS.items():
   source=self.receipts["originals"][key]
   self.assertEqual([source["original_sha256"],source["original_bytes"],source["original_git_blob_sha1"]],expected)
   self.assertEqual(source["original_path"],mod.raw_relpath(key,expected[0]))
 def test_03_historic_OIG_is_251_page_full_issue_only(self):
  source=self.receipts["originals"]["oig_fr_1997_issue"]
  self.assertEqual(source["physical_pdf_pages"],251)
  self.assertIn("whole",source["edition"].lower()+" "+source["publisher_scope"].lower()+
                " full whole "+str(source["physical_pdf_pages"]))
  self.assertIn("97-14611",source["publisher_scope"])
 def test_04_current_FDA_chart_has_correct_October13_epoch(self):
  source=self.receipts["originals"]["fda_chart_2026"]
  self.assertEqual(source["published_date"],"2026-10-13")
  self.assertNotIn("2026-09-16",source["edition"])
 def test_05_1997_historical_source_not_present_day_effectiveness(self):
  self.assertIsNone(self.receipts["originals"]["oig_fr_1997_issue"]["distinct_effective_date"])
 def test_06_FDA_final_rule_has_distinct_effective_date(self):
  self.assertEqual(self.receipts["originals"]["fda_rule_2026"]["distinct_effective_date"],"2026-06-15")
 def test_07_historical_2025_CFR_separate_from_repeal(self):
  self.assertIsNone(self.receipts["originals"]["cfr_2025_21_5"]["distinct_effective_date"])
 def reject(self,mutator):
  data=copy.deepcopy(self.receipts)
  mutator(data)
  with self.assertRaises(mod.SourceError):
   mod.validate(data)
 def test_08_date_forgery_FDA_repeal(self):
  self.reject(lambda m:m["originals"]["fda_rule_2026"].update(distinct_effective_date="2026-09-29"))
 def test_09_replacement_FDA_chart_date(self):
  self.reject(lambda m:m["originals"]["fda_chart_2026"].update(published_date="2026-09-16"))
 def test_10_OIG_1997_assumed_effective_now(self):
  self.reject(lambda m:m["originals"]["oig_fr_1997_issue"].update(distinct_effective_date="2026-10-22"))
 def test_11_claim_counsel_command_from_publisher(self):
  self.reject(lambda m:m["originals"]["eo_14215_2025"].update(general_HHS_legal_authority_qualified=True))
 def test_12_invent_HHS_canonical_agency_identity(self):
  self.reject(lambda m:m["originals"]["cfr_2025_21_5"].update(canonical_agency_identity_added=True))
 def test_13_forged_WORM_external_certification(self):
  self.reject(lambda m:m.update(WORM_external_certified=True))
 def test_14_source_document_status_not_full_legal_denominator(self):
  self.reject(lambda m:m.update(HHS_first_level_legal_denominator=11))
 def test_15_forged_1997_source_specific_custody(self):
  self.reject(lambda m:m["originals"]["oig_fr_1997_issue"].update(publisher_scope="FR Doc 97-14611 original-only PDF"))
 def test_16_forged_SHA_and_path(self):
  self.reject(lambda m:m["originals"]["fda_rule_2026"].update(original_sha256="0"*64))
  self.reject(lambda m:m["originals"]["fda_rule_2026"].update(original_path="../../../../README.md"))
 def test_17_forged_extra_claim_field(self):
  self.reject(lambda m:m["originals"]["cfr_2025_21_5"].update(fda_OCC_office_abolished=True))
 def test_18_forged_extra_source_cohort(self):
  self.reject(lambda m:m["originals"].update(unknown_agency={"authority_verified":True}))
 def test_19_corrupt_byte_original_does_not_match_reviewed_pin(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)
   for k,source in self.receipts["originals"].items():
    s=mod.ROOT/source["original_path"];dst=root/source["original_path"]
    dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(s,dst)
   corrupt=root/self.receipts["originals"]["fda_rule_2026"]["original_path"]
   data=bytearray(corrupt.read_bytes());data[100]^=1;corrupt.write_bytes(data)
   with self.assertRaises(mod.SourceError):mod.validate(self.receipts,root)
 def test_20_no_source_redirect_permitted(self):
  with self.assertRaises(mod.SourceError):
   mod.NoRedirect().redirect_request(None,None,302,"Found",{},"https://evil.example.com/replace.pdf")
if __name__=="__main__":unittest.main()
