import hashlib
import importlib.util
import unittest
from pathlib import Path
import tempfile
ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("va04c",ROOT / "scripts" / "verify-va-directory-source-04c.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
SOURCE = b"<html><h2>Office of the Secretary</h2><h3>Incumbent</h3><h2>Administrations</h2>" + b"".join(
    ("<h3>A%s</h3>"%i).encode() for i in range(1,4)) + b"<h2>Staff Offices</h2>" + b"".join(
    ("<h3>Office %s</h3>"%i).encode() for i in range(1,20))
MODEL=[{"source_heading":"Administrations","name":"A"+str(i),"source_relative_heading_ordinal":i} for i in range(1,4)] + [
    {"source_heading":"Staff Offices","name":"Office "+str(i),"source_relative_heading_ordinal":i} for i in range(1,20)]
class EvidenceSectionTests(unittest.TestCase):
    def test_22_bounded_entries(self):
        result=mod.verify(SOURCE,MODEL,hashlib.sha256(SOURCE).hexdigest())
        self.assertEqual(result["source_section_entries"],22)
        self.assertIsNone(result["whole_department_first_level_denominator"])
        self.assertTrue(result["office_of_secretary_separate_heading"])
    def test_header_relabel_rejected(self):
        with self.assertRaisesRegex(ValueError,"identity/order"):
            mod.verify(SOURCE,MODEL[:-1]+[dict(MODEL[-1],name="Altered")],hashlib.sha256(SOURCE).hexdigest())
    def test_invalid_sha_rejected(self):
        with self.assertRaisesRegex(ValueError,"SHA-256"):
            mod.verify(SOURCE,MODEL,"a"*64)
    def test_missing_source_subsection_rejected(self):
        with self.assertRaisesRegex(ValueError,"Staff Offices"):
            mod.verify(SOURCE.replace(b"<h2>Staff Offices</h2>",b"<h2>Other Offices</h2>"),
                       MODEL,hashlib.sha256(SOURCE.replace(b"<h2>Staff Offices</h2>",b"<h2>Other Offices</h2>")).hexdigest())
if __name__=="__main__":
    unittest.main()
