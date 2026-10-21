import unittest,importlib.util
from copy import deepcopy
from pathlib import Path
P=Path(__file__).resolve().parents[1]/"scripts/inc15c6e-validate-original-custody.py"
s=importlib.util.spec_from_file_location("c6e",P);v=importlib.util.module_from_spec(s);s.loader.exec_module(v)
class Custody(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.c,cls.a,cls.raw=v.load()
 def test_two_ARPAH_originals_with_exact_hash(self):
  result=v.validate(self.c,self.a,self.raw)
  self.assertEqual(result["retained_arpah_original_html_sources"],2)
  self.assertFalse(result["reorganization_implementation_qualified"])
 def reject(self,edit):
  c,a,raw=deepcopy((self.c,self.a,self.raw))
  edit(c,a,raw)
  with self.assertRaisesRegex(ValueError,"INC-15C.6E custody rejected"):
   v.validate(c,a,raw)
 def test_mutated_html(self):self.reject(lambda c,a,r:r.update(arpah_people=r["arpah_people"][:-10]+b"CORRUPT!!!"))
 def test_forged_git_blob(self):self.reject(lambda c,a,r:c["originals"][0].update(git_blob_sha1="a"*40))
 def test_forged_HHS_budget_raw_custody(self):self.reject(lambda c,a,r:c.update(hhs_fy2026_gdm_original_custodied=True))
 def test_forged_FY2027_budget_original(self):self.reject(lambda c,a,r:c.update(hhs_fy2027_gdm_original_custodied=True))
 def test_forged_OMHA_original(self):self.reject(lambda c,a,r:c.update(omha_current_html_custodied=True))
 def test_personnel_not_signed_reorganization(self):self.reject(lambda c,a,r:c.update(personnel_page_proves_organizational_reorganization=True))
 def test_budget_proposal_not_implemented(self):self.reject(lambda c,a,r:c.update(budget_proposal_is_implemented_reorganization=True))
 def test_not_independent_WORM(self):self.reject(lambda c,a,r:c.update(independent_worm_custody_verified=True))
 def test_current_legal_denominator_null(self):self.reject(lambda c,a,r:c.update(legal_first_level_hhs_denominator=29))
 def test_HTML_effective_date_unknown(self):self.reject(lambda c,a,r:c.update(source_page_effective_date_independently_qualified=True))
 def test_mutated_source_status(self):self.reject(lambda c,a,r:a["source_probes"][0].update(original_sha256="x"*64))
 def test_tampered_edition(self):self.reject(lambda c,a,r:c["originals"][0].update(source_edition="effective_2026-10-21"))
 def test_unapproved_authority_field(self):self.reject(lambda c,a,r:c.update(finalized_OMHA_reporting_order=True))
if __name__=="__main__":unittest.main()
