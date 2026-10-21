import copy
from pathlib import Path
import importlib.util
import json
import tempfile
import unittest

SCRIPT=Path(__file__).resolve().parents[1]/"scripts/inc15c6-hhs-source-acquire.py"
spec=importlib.util.spec_from_file_location("hhs_probe",SCRIPT)
h=importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)

HTML=("<!DOCTYPE html><html><head><title>HHS Organizational Charts</title></head>"
      "<body><h1>HHS Organizational Charts</h1><p>Office of Inspector General</p>"
      +("Publisher chart and offices " * 65)+"</body></html>").encode()
PDF=b"%PDF-1.7\n"+b"x"*2000+b"\n%%EOF\n"

def positive(url,source):
 return {"bytes":HTML if source["extension"]==".html" else PDF,
         "final_url":url, "content_type":"text/html" if source["extension"]==".html" else "application/pdf",
         "redirect_chain":[]}

class HHSProbe(unittest.TestCase):
 def test_exact_allowlist(self):
  for source in h.SOURCES.values():
   self.assertTrue(h.approved_url(source["url"],source))
   for alt in [source["url"].replace("https://","http://"),
               source["url"]+"?edition=2026",source["url"]+"#current",
               source["url"].replace("www.hhs.gov","www.hhs.gov.evil.org"),
               "https://evil.org/source.html"]:
    self.assertFalse(h.approved_url(alt,source),alt)
 def test_different_editions_and_source_types(self):
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),positive)
   self.assertEqual(len(obj["source_probes"]),2)
   self.assertEqual({x["result"] for x in obj["source_probes"]},{"transient_original_captured"})
   self.assertNotEqual(obj["source_probes"][0]["original_sha256"],obj["source_probes"][1]["original_sha256"])
   self.assertTrue(h.verify(Path(d))["verified"])
 def test_failed_hhs_index_does_not_promote_pdf_as_html(self):
  def only_pdf(u,s):
   if s["extension"]==".html":raise h.SourceFailure("HTTP_403")
   return positive(u,s)
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),only_pdf)
   self.assertEqual(obj["source_probes"][0]["result"],"blocked_no_original_bytes")
   self.assertEqual(obj["source_probes"][0]["original_sha256"],None)
   self.assertEqual(obj["source_probes"][1]["result"],"transient_original_captured")
   self.assertTrue(h.verify(Path(d))["verified"])
 def test_all_blocked_does_not_assert_bytes_or_legal_census(self):
  def blocked(u,s):raise h.SourceFailure("HTTP_403")
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),blocked)
   self.assertTrue(all(r["original_sha256"] is None for r in obj["source_probes"]))
   self.assertIsNone(obj["legal_first_level_denominator"])
   self.assertTrue(h.verify(Path(d))["verified"])
 def test_html_bot_challenge_rejected_as_original_directory(self):
  def spoofed(u,s):
   if s["extension"]==".html":
    return {"bytes":b"<!DOCTYPE html><html>"+b"blocked"*300+b"</html>",
      "final_url":u,"content_type":"text/html","redirect_chain":[]}
   return positive(u,s)
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),spoofed)
   self.assertEqual(obj["source_probes"][0]["result"],"blocked_no_original_bytes")
 def test_pdf_fake_binary_rejected(self):
  def spoofed(u,s):
   if s["extension"]==".pdf":
    return {"bytes":b"<html>"+b"challenge"*300,"final_url":u,
       "content_type":"application/pdf","redirect_chain":[]}
   return positive(u,s)
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),spoofed)
   self.assertEqual(obj["source_probes"][1]["result"],"blocked_no_original_bytes")
 def test_redirect_to_untrusted_source_rejected(self):
  def spoofed(u,s):
   obj=positive(u,s);obj["final_url"]="https://attacker.org/copy.pdf"
   return obj
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),spoofed)
   self.assertTrue(all(x["result"]=="blocked_no_original_bytes" for x in obj["source_probes"]))
 def test_modified_bytes_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),positive)
   file=Path(d)/obj["source_probes"][0]["original_relative_path"]
   raw=bytearray(file.read_bytes());raw[250]^=1;file.write_bytes(raw)
   with self.assertRaisesRegex(h.SourceFailure,"modified"):h.verify(Path(d))
 def test_false_authority_and_unreviewed_roster_rejected(self):
  for alteration in [
   lambda x:x["source_probes"][0].update(current_hhs_first_level_legal_denominator=29),
   lambda x:x["source_probes"][0].update(department_command_or_adjudicative_authority_certified=True),
   lambda x:x["source_probes"][0].update(independent_worm_custody_verified=True),
   lambda x:x["source_probes"][1].update(git_original_custody_verified=True),
   lambda x:x.update(same_edition_or_bytes_asserted=True),
   lambda x:x.update(legal_first_level_denominator=29),
   lambda x:x["source_probes"][1].update(source_directory_edition_fully_extracted=True),
   lambda x:x["source_probes"][0].update(approved_publisher_delegation=True)]:
   with tempfile.TemporaryDirectory() as d:
    obj=h.capture(Path(d),positive)
    alteration(obj)
    (Path(d)/"capture-receipt.json").write_text(json.dumps(obj))
    with self.assertRaises(h.SourceFailure):h.verify(Path(d))
 def test_source_forgery_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),positive)
   obj["source_probes"][0]["requested_official_url"]="https://www.hhs.gov/fake"
   (Path(d)/"capture-receipt.json").write_text(json.dumps(obj))
   with self.assertRaisesRegex(h.SourceFailure,"forged"):h.verify(Path(d))
 def test_html_bytes_not_current_legal_authority(self):
  with tempfile.TemporaryDirectory() as d:
   obj=h.capture(Path(d),positive)
   self.assertFalse(obj["federal_legal_roster_complete"])
   self.assertIsNone(obj["legal_first_level_denominator"])
   self.assertFalse(obj["independent_worm_qualification"])
 def test_oversized_sources_rejected(self):
  with self.assertRaises(h.SourceFailure):
   h.validate_bytes(b"A"*(h.SOURCES["hhs_org_index"]["max_bytes"]+1),
                    h.SOURCES["hhs_org_index"])

if __name__=="__main__":unittest.main()
