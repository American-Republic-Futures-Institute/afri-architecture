import unittest
from copy import deepcopy
from pathlib import Path
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location("custody",ROOT/"scripts/inc15c6d-validate-original-custody.py")
v=importlib.util.module_from_spec(s);s.loader.exec_module(v)
class SourceCustody(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.c,cls.a,cls.raw=v.load()
 def test_five_real_unchanged_historical_originals(self):
  result=v.validate(self.c,self.a,self.raw)
  self.assertEqual(result["originals"],5)
  self.assertEqual(result["legal_first_level_denominator"],None)
  self.assertFalse(result["proposed_arpa_h_restructure_implemented"])
 def assert_reject(self,edit):
  c,a,raw=deepcopy((self.c,self.a,self.raw))
  edit(c,a,raw)
  with self.assertRaisesRegex(ValueError,"INC-15C.6D original custody rejected"):
   v.validate(c,a,raw)
 def test_pdf_source_byte_tampering(self):
  def mutate(c,a,r):r["omha_2015_notice"]=r["omha_2015_notice"][:-10]+b"corruptedxx"
  self.assert_reject(mutate)
 def test_forged_sha256(self):self.assert_reject(lambda c,a,r:c["source_records"][0].update(original_sha256="0"*64))
 def test_forged_git_blob(self):self.assert_reject(lambda c,a,r:c["source_records"][1].update(git_blob_sha1="0"*40))
 def test_forged_first_level_denominator(self):self.assert_reject(lambda c,a,r:c.update(current_hhs_legal_first_level_denominator=29))
 def test_false_dab_jurisdiction(self):self.assert_reject(lambda c,a,r:c.update(dab_adjudication_jurisdiction_current_certified=True))
 def test_false_omha_alj_case_control(self):self.assert_reject(lambda c,a,r:c.update(omha_alj_case_control_current_certified=True))
 def test_arpa_eight_office_plan_not_completed(self):self.assert_reject(lambda c,a,r:c.update(arpah_2024_budget_eight_office_implementation_certified=True))
 def test_outside_worm_unverified(self):self.assert_reject(lambda c,a,r:c.update(independent_worm_qualification=True))
 def test_false_current_hhs_index_custody(self):self.assert_reject(lambda c,a,r:c.update(direct_hhs_current_organizational_html_retained=True))
 def test_mutated_epoch(self):self.assert_reject(lambda c,a,r:c["source_records"][0].update(publisher_edition="2026-10-21"))
 def test_mutated_original_source_url(self):self.assert_reject(lambda c,a,r:a["source_probes"][2].update(final_url="https://example.org"))
 def test_untyped_legal_field(self):self.assert_reject(lambda c,a,r:c.update(complete_legal_hhs_census=True))
 def test_source_legal_qualification_inflation(self):self.assert_reject(lambda c,a,r:a["source_probes"][4].update(independent_legal_review_complete=True))
 def test_nonadditive_original_editions(self):self.assert_reject(lambda c,a,r:a.update(same_edition_or_bytes_asserted=True))
if __name__=="__main__":unittest.main()
