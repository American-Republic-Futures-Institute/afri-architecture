"""INC-15C.6G exact original-source, edition and legal nonpromotion tests."""
import copy,importlib.util,unittest
from pathlib import Path
from unittest import mock
P=Path(__file__).resolve().parents[1]/"scripts/inc15c6g-ogc-original.py"
spec=importlib.util.spec_from_file_location("inc15c6g_ogc_original",P)
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)

class OfficialOGCOriginal(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.acq,cls.git=v.read_receipts()
  cls.raw=v.source_path(cls.acq["original_sha256"]).read_bytes()
 def test_exact_original_source_with_five_pages(self):
  r=v.verify()
  self.assertTrue(r["verified"])
  self.assertEqual(r["original_bytes"],204358)
  self.assertEqual(r["original_sha256"],"e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76")
  self.assertEqual(r["physical_pdf_pages"],5)
  self.assertEqual(r["OGC_internal_divisions"],11)
  self.assertIsNone(r["distinct_effective_date"])
  self.assertIsNone(r["HHS_legal_denominator"])
 def test_original_blob_integrity(self):
  self.assertEqual(v.gitblob(self.raw),"43c99b2f51ba8d99f0a789ddc8446098883793b3")
 def test_pdf_bytes_tamper_rejected(self):
  raw=bytearray(self.raw);raw[250]^=1
  with self.assertRaises(v.SourceError):v.checked_original(bytes(raw))
 def test_pdf_truncation_rejected(self):
  with self.assertRaises(v.SourceError):v.checked_original(self.raw[:-4096])
 def test_not_html_block_page(self):
  with self.assertRaises(v.SourceError):v.checked_original(b"<html>access denied</html>"*8000)
 def reject(self,mutation,which):
  a=copy.deepcopy(self.acq);g=copy.deepcopy(self.git)
  mutation(a if which=="acq" else g)
  with mock.patch.object(v,"read_receipts",return_value=(a,g)):
   with self.assertRaises(v.SourceError):v.verify()
 def test_forged_effective_date_not_allowed(self):
  self.reject(lambda x:x.update(distinct_operative_effective_date="2026-09-29"),"acq")
 def test_forged_full_HHS_legal_denominator(self):
  self.reject(lambda x:x.update(whole_HHS_first_level_legal_denominator=11),"git")
 def test_forged_OIG_legal_supervision(self):
  self.reject(lambda x:x.update(OIG_independent_counsel_exception_preserved=False),"acq")
 def test_forged_individual_written_delegations(self):
  self.reject(lambda x:x.update(individual_written_delegations_independently_qualified=True),"git")
 def test_forged_git_blob_hash(self):
  self.reject(lambda x:x.update(original_git_blob_sha1="0"*40),"acq")
 def test_cross_source_or_other_document_replacement(self):
  self.reject(lambda x:x.update(fr_document_number="2026-19904"),"git")
 def test_other_HHS_statements_not_rescinded(self):
  self.reject(lambda x:x.update(prior_OGC_statements_rescinded_not_all_HHS_statements=False),"acq")
 def test_external_WORM_not_verified(self):
  self.reject(lambda x:x.update(external_WORM_custody_verified=True),"git")
 def test_source_claims_not_enacting_ASCRA_or_ASE(self):
  self.reject(lambda x:x.update(dated_proposal_not_presented_as_implemented_HHS_parent=False),"acq")

if __name__=="__main__":unittest.main()
