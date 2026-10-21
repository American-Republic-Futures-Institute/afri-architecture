import tempfile, unittest, json
from pathlib import Path
import importlib.util
SPEC=importlib.util.spec_from_file_location('probe',Path(__file__).resolve().parents[1]/'scripts/inc15c6d-hhs-source-acquire.py')
p=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(p)
def good(url,source):
    return {'bytes':b'%PDF-1.7\n'+source['source_id'].encode()+b'X'*2500+b'\n%%EOF\n',
            'final_url':url,'content_type':'application/pdf','redirect_chain':[]}
class SourceContract(unittest.TestCase):
 def test_exact_https_allowlist(self):
  for s in p.SOURCES.values():
   self.assertTrue(p.approved_url(s['url'],s))
   for invalid in [s['url']+'?tamper=1',s['url']+'#2',s['url'].replace('https://','http://'),s['url'].replace('://','://attacker.'),'https://attacker.gov/test.pdf']:
    self.assertFalse(p.approved_url(invalid,s),invalid)
 def test_five_independent_edition_source_receipts(self):
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),good)
   self.assertEqual(len(r['source_probes']),5)
   self.assertEqual(len({x['original_sha256'] for x in r['source_probes']}),5)
   self.assertTrue(all(x['result']=='transient_original_captured' for x in r['source_probes']))
   self.assertTrue(p.verify(Path(td))['verified'])
 def test_blocked_omha_cannot_inherit_arpa_pdf_custody(self):
  def get(u,s):
   if s['source_id']=='INC15C6D-OMHA-2005-FR-NOTICE':raise p.SourceFailure('HTTP_403')
   return good(u,s)
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),get)
   self.assertEqual(r['source_probes'][1]['result'],'blocked_no_original_bytes')
   self.assertIsNone(r['source_probes'][1]['original_sha256'])
   self.assertEqual(r['source_probes'][4]['result'],'transient_original_captured')
   self.assertTrue(p.verify(Path(td))['verified'])
 def test_all_blocked_no_legal_assertions(self):
  def blocked(u,s):raise p.SourceFailure('HTTP_403')
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),blocked)
   self.assertEqual(sum(v['result']=='blocked_no_original_bytes' for v in r['source_probes']),5)
   self.assertIsNone(r['legal_first_level_denominator'])
   self.assertFalse(r['same_edition_or_bytes_asserted'])
   self.assertTrue(p.verify(Path(td))['verified'])
 def test_html_antibot_not_valid_pdf(self):
  with self.assertRaises(p.SourceFailure):
   p.validate_bytes(b'<!doctype html><html>'+b'blocked'*400,p.SOURCES['dab_2012_notice'])
 def test_redirect_must_stay_on_exact_official_document(self):
  def spoof(u,s):
   d=good(u,s);d['final_url']='https://malicious.example/content.pdf';return d
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),spoof)
   self.assertTrue(all(v['result']=='blocked_no_original_bytes' for v in r['source_probes']))
 def test_retained_bytes_tamper_detected(self):
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),good)
   f=Path(td)/r['source_probes'][0]['original_relative_path']
   z=bytearray(f.read_bytes());z[100]^=1;f.write_bytes(z)
   with self.assertRaisesRegex(p.SourceFailure,'modified'):p.verify(Path(td))
 def test_fake_power_roster_epoch_or_worm_rejected(self):
  mutations=[
   lambda r:r.update(legal_first_level_denominator=29),
   lambda r:r.update(same_edition_or_bytes_asserted=True),
   lambda r:r.update(independent_worm_qualification=True),
   lambda r:r['source_probes'][0].update(git_original_custody_verified=True),
   lambda r:r['source_probes'][1].update(department_command_or_adjudicative_authority_certified=True),
   lambda r:r['source_probes'][4].update(source_directory_edition_fully_extracted=True),
   lambda r:r['source_probes'][4].update(implemented_arpah_eight_office_reorganization=True),
   lambda r:r['source_probes'][2].update(current_hhs_first_level_legal_denominator=12)
  ]
  for change in mutations:
   with tempfile.TemporaryDirectory() as td:
    r=p.capture(Path(td),good);change(r)
    (Path(td)/'capture-receipt.json').write_text(json.dumps(r))
    with self.assertRaises(p.SourceFailure):p.verify(Path(td))
 def test_untyped_new_legal_field_rejected(self):
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),good);r['source_probes'][0]['signed_alj_control']=True
   (Path(td)/'capture-receipt.json').write_text(json.dumps(r))
   with self.assertRaises(p.SourceFailure):p.verify(Path(td))
 def test_wrong_source_url_rejected(self):
  with tempfile.TemporaryDirectory() as td:
   r=p.capture(Path(td),good);r['source_probes'][0]['requested_official_url']='https://www.govinfo.gov/fake.pdf'
   (Path(td)/'capture-receipt.json').write_text(json.dumps(r))
   with self.assertRaises(p.SourceFailure):p.verify(Path(td))
 def test_pdf_size_cap(self):
  with self.assertRaises(p.SourceFailure):p.validate_bytes(b'X'*35000001,p.SOURCES['dab_2012_notice'])
if __name__=='__main__': unittest.main()
