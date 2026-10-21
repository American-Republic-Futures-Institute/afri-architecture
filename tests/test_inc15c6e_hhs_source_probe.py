import tempfile,unittest,json
from pathlib import Path
import importlib.util
SPEC=importlib.util.spec_from_file_location('hhs2026',Path(__file__).resolve().parents[1]/'scripts/inc15c6e-hhs-source-acquire.py')
p=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(p)
def fixture(url,source):
 if source["extension"]==".pdf":
  body=b"%PDF-1.7\n"+source["source_id"].encode()+b"X"*2500+b"\n%%EOF\n"
  typ="application/pdf"
 else:
  body=(b"<!DOCTYPE html><html><head><title>Our People</title></head><body>"+
        b"Organizational Overview Departmental Appeals Board "+
        b"Office of Medicare Hearings and Appeals Chief Administrative Law Judge "+
        b"Our People Mission Offices Health Science Futures October 20, 2025 September 25, 2025"+
        source["source_id"].encode()+b"X"*2000+b"</body></html>")
  typ="text/html"
 return {"bytes":body,"final_url":url,"content_type":typ,"redirect_chain":[]}
class SourceProbe(unittest.TestCase):
 def test_source_count_and_exact_hosts(self):
  self.assertEqual(len(p.SOURCES),6)
  for key,s in p.SOURCES.items():
   self.assertTrue(p.approved_url(s["url"],s))
   for bad in [s["url"].replace("https://","http://"),s["url"]+"?override=1",
     s["url"]+"#fragment",s["url"].replace("://","://evil.",1),
     "https://unapproved.gov/organization.html"]:
    self.assertFalse(p.approved_url(bad,s),bad)
 def test_per_source_original_preservation(self):
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),fixture)
   self.assertEqual(len(o["source_probes"]),6)
   self.assertEqual(len(set(x["original_sha256"] for x in o["source_probes"])),6)
   self.assertTrue(p.verify(Path(d))["verified"])
 def test_hhs_budget_403_cannot_be_arpah_page_original(self):
  def selective(url,s):
   if s["kind"].startswith("hhs_budget_request"):raise p.SourceFailure("HTTP_403")
   return fixture(url,s)
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),selective)
   self.assertEqual([x["result"] for x in o["source_probes"][:2]],["blocked_no_original_bytes"]*2)
   self.assertTrue(all(x["original_sha256"] is None for x in o["source_probes"][:2]))
   self.assertTrue(p.verify(Path(d))["verified"])
 def test_all_blocked_no_legal_inference(self):
  def blocked(*a):raise p.SourceFailure("HTTP_403")
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),blocked)
   self.assertIsNone(o["legal_first_level_denominator"])
   self.assertFalse(o["same_edition_or_bytes_asserted"])
   self.assertTrue(p.verify(Path(d))["verified"])
 def test_untrusted_redirect_rejected(self):
  def redirect(u,s):
   r=fixture(u,s);r["final_url"]="https://evil.example/"+s["source_id"];return r
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),redirect)
   self.assertEqual(sum(x["result"]=="blocked_no_original_bytes" for x in o["source_probes"]),6)
 def test_html_challenge_not_original(self):
  with self.assertRaises(p.SourceFailure):
   p.validate_bytes(b"<html>"+b"Challenge"*900,p.SOURCES["arpah_people"])
 def test_pdf_challenge_not_original(self):
  with self.assertRaises(p.SourceFailure):
   p.validate_bytes(b"<html>"+b"Challenge"*900,p.SOURCES["hhs_fy2026_gdm"])
 def test_tampered_original_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),fixture)
   f=Path(d)/o["source_probes"][0]["original_relative_path"]
   b=bytearray(f.read_bytes());b[101]^=1;f.write_bytes(b)
   with self.assertRaisesRegex(p.SourceFailure,"modified"):p.verify(Path(d))
 def test_false_implemented_reorganization_or_legal_authority_rejected(self):
  acts=[
   lambda r:r.update(legal_first_level_denominator=29),
   lambda r:r.update(same_edition_or_bytes_asserted=True),
   lambda r:r["source_probes"][0].update(department_command_or_adjudicative_authority_certified=True),
   lambda r:r["source_probes"][0].update(independent_legal_review_complete=True),
   lambda r:r["source_probes"][1].update(implemented_ASCRA_2026=True),
   lambda r:r["source_probes"][2].update(git_original_custody_verified=True),
   lambda r:r["source_probes"][4].update(current_hhs_first_level_legal_denominator=29),
   lambda r:r["source_probes"][5].update(cross_edition_population_addition_authorized=True)]
  for change in acts:
   with tempfile.TemporaryDirectory() as d:
    o=p.capture(Path(d),fixture);change(o)
    (Path(d)/"capture-receipt.json").write_text(json.dumps(o))
    with self.assertRaises(p.SourceFailure):p.verify(Path(d))
 def test_false_publisher_epoch_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   o=p.capture(Path(d),fixture);o["source_probes"][0]["source_edition_attribution"]="2026_implemented"
   (Path(d)/"capture-receipt.json").write_text(json.dumps(o))
   with self.assertRaises(p.SourceFailure):p.verify(Path(d))
 def test_size_bound(self):
  with self.assertRaises(p.SourceFailure):
   p.validate_bytes(b"x"*35000001,p.SOURCES["hhs_fy2026_gdm"])
if __name__=="__main__":unittest.main()
