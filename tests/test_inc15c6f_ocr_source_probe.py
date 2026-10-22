import importlib.util,json,tempfile,unittest
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"scripts/inc15c6f-ocr-source-acquire.py"
s=importlib.util.spec_from_file_location("inc15c6f_ocr_source",p)
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def source(url,spec):
 return {"bytes":b"%PDF-1.7\n"+spec["source_id"].encode()+b"x"*3000+b"\n%%EOF\n",
         "final_url":url,"content_type":"application/pdf","redirect_chain":[]}
class Sources(unittest.TestCase):
 def test_two_distinct_federal_register_editions(self):
  self.assertEqual(set(m.SOURCES),{"ocr_2023","ocr_2026"})
  self.assertTrue(m.SOURCES["ocr_2026"]["url"].endswith("/2026-13142.pdf"))
  self.assertTrue(m.SOURCES["ocr_2023"]["url"].endswith("/2023-03892.pdf"))
 def test_hosts_redirects_and_paths_exact(self):
  for x in m.SOURCES.values():
   self.assertTrue(m.approved_url(x["url"],x))
   for u in [x["url"]+"?edition=not-real",x["url"]+"#version",x["url"].replace("https://","http://"),"https://example.com/notice.pdf","https://www.govinfo.gov/content/pkg/FR-2026-06-30/pdf/2026-13141.pdf"]:
    if u==x["url"]:continue
    self.assertFalse(m.approved_url(u,x),u)
 def test_two_originals_are_nonadditive_versions(self):
  with tempfile.TemporaryDirectory() as d:
   x=m.capture(Path(d),source)
   self.assertEqual(len(x["source_probes"]),2)
   self.assertEqual(len(set(z["original_sha256"] for z in x["source_probes"])),2)
   self.assertFalse(x["same_edition_or_bytes_asserted"])
   self.assertIsNone(x["legal_first_level_denominator"])
   self.assertTrue(m.verify(Path(d))["verified"])
 def test_blocked_prior_notice_cannot_substitute_current(self):
  def get(u,s):
   if s["source_id"]=="INC15C6F-OCR-2023-ORGANIZATION":raise m.SourceFailure("HTTP_403")
   return source(u,s)
  with tempfile.TemporaryDirectory() as d:
   x=m.capture(Path(d),get)
   self.assertEqual(x["source_probes"][0]["result"],"blocked_no_original_bytes")
   self.assertIsNone(x["source_probes"][0]["original_sha256"])
   self.assertEqual(x["source_probes"][1]["result"],"transient_original_captured")
   self.assertTrue(m.verify(Path(d))["verified"])
 def test_original_corruption_detected(self):
  with tempfile.TemporaryDirectory() as d:
   x=m.capture(Path(d),source)
   f=Path(d)/x["source_probes"][1]["original_relative_path"]
   bb=bytearray(f.read_bytes());bb[150]^=1;f.write_bytes(bb)
   with self.assertRaisesRegex(m.SourceFailure,"modified"):m.verify(Path(d))
 def test_html_error_is_not_signed_source_pdf(self):
  with self.assertRaises(m.SourceFailure):
   m.validate_bytes(b"<html>"+b"Access denied"*300,m.SOURCES["ocr_2026"])
 def test_bad_redirect_rejected(self):
  def get(u,s):
   x=source(u,s);x["final_url"]="https://example.net/2026-13142.pdf";return x
  with tempfile.TemporaryDirectory() as d:
   x=m.capture(Path(d),get)
   self.assertTrue(all(v["result"]=="blocked_no_original_bytes" for v in x["source_probes"]))
 def test_legal_assertion_or_edition_mutation_fails_closed(self):
  edits=[
   lambda x:x.update(legal_first_level_denominator=6),
   lambda x:x.update(same_edition_or_bytes_asserted=True),
   lambda x:x.update(independent_worm_qualification=True),
   lambda x:x["source_probes"][1].update(independent_legal_review_complete=True),
   lambda x:x["source_probes"][1].update(department_command_or_adjudicative_authority_certified=True),
   lambda x:x["source_probes"][1].update(current_hhs_first_level_legal_denominator=6),
   lambda x:x["source_probes"][1].update(cross_edition_population_addition_authorized=True),
   lambda x:x["source_probes"][0].update(source_edition_attribution="effective_2026-06-28"),
   lambda x:x["source_probes"][1].update(ASCRA_reorganization_certified=True),
   lambda x:x["source_probes"][1].update(git_original_custody_verified=True)
  ]
  for e in edits:
   with tempfile.TemporaryDirectory() as d:
    x=m.capture(Path(d),source);e(x)
    (Path(d)/"capture-receipt.json").write_text(json.dumps(x))
    with self.assertRaises(m.SourceFailure):m.verify(Path(d))
if __name__=="__main__":unittest.main()
