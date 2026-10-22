import importlib.util,unittest
from pathlib import Path
from copy import deepcopy
BASE=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location("ocr_original",BASE/"scripts/inc15c6f-validate-original-custody.py")
v=importlib.util.module_from_spec(s);s.loader.exec_module(v)
class OCROriginals(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.c,cls.cap,cls.raw=v.load()
 def test_signed_2026_notice_and_historical_2023_source_exact(self):
  x=v.verify(self.c,self.cap,self.raw)
  self.assertEqual(x["retained_original_notice_editions"],2)
  self.assertEqual(x["OCR_notice_effective_date"],"2026-06-28")
  self.assertFalse(x["ASE_ASCRA_implemented_verified"])
  self.assertIsNone(x["current_HHS_first_level_denominator"])
 def reject(self,change):
  c,cap,raw=deepcopy((self.c,self.cap,self.raw))
  change(c,cap,raw)
  with self.assertRaisesRegex(ValueError,"INC-15C.6F OCR original custody rejected"):
   v.verify(c,cap,raw)
 def test_mutated_original_pdf(self):self.reject(lambda c,cap,r:r.update(ocr_2026=r["ocr_2026"][:-10]+b"wrongbytes!"))
 def test_forged_git_blob(self):self.reject(lambda c,cap,r:c["originals"][0].update(git_blob_sha1="0"*40))
 def test_forged_2026_effective_date(self):self.reject(lambda c,cap,r:c["originals"][1].update(organization_effective_date="2026-05-14"))
 def test_forged_2023_edition(self):self.reject(lambda c,cap,r:c["originals"][0].update(fr_pages="91 FR 39626-39627"))
 def test_2026_does_not_enact_FY2026_ASE(self):self.reject(lambda c,cap,r:c.update(FY2026_ASE_or_FY2027_ASCRA_implemented_by_notice=True))
 def test_OCR_is_not_complete_HHS_roster(self):self.reject(lambda c,cap,r:c.update(source_notice_establishes_entire_HHS_roster=True))
 def test_unknown_whole_HHS_first_level_denominator(self):self.reject(lambda c,cap,r:c.update(HHS_2026_legal_first_level_denominator=6))
 def test_source_notice_is_not_case_specific_delegation(self):self.reject(lambda c,cap,r:c.update(signed_case_specific_OCR_delegates_inferred=True))
 def test_worm_custody_not_certified(self):self.reject(lambda c,cap,r:c.update(independent_external_WORM_custody_verified=True))
 def test_original_does_not_mint_institution_id(self):self.reject(lambda c,cap,r:c.update(canonical_institution_ids_added=6))
 def test_forged_source_epoch_and_url(self):self.reject(lambda c,cap,r:cap["source_probes"][1].update(requested_official_url="https://example.org/notice.pdf"))
 def test_acquisition_legal_authority_rejected(self):self.reject(lambda c,cap,r:cap["source_probes"][1].update(department_command_or_adjudicative_authority_certified=True))
 def test_2023_original_not_substituted_for_2026(self):self.reject(lambda c,cap,r:r.update(ocr_2026=r["ocr_2023"]))
 def test_new_unsigned_field_rejected(self):self.reject(lambda c,cap,r:c.update(current_OCR_signed_delegate_count=6))
if __name__=="__main__":unittest.main()
