import importlib.util, json, shutil, tempfile, unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('inc15c6d_historical',BASE/'scripts/inc15c6d-validate-historical-models.py')
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class HistoricalHHS(unittest.TestCase):
 def test_original_complete_bounded_replay(self):
  z=v.verify(BASE)
  self.assertEqual(z['notice_source_observations'],19)
  self.assertEqual(z['arpa_h_budget_chart_boxes'],15)
  self.assertEqual(z['nonadditive_source_observations'],34)
  self.assertEqual(z['new_canonical_ids'],0)
  self.assertIsNone(z['current_hhs_legal_first_level_denominator'])
  self.assertFalse(z['arpa_h_eight_office_plan_verified_implemented'])
 def mutate(self,fn):
  with tempfile.TemporaryDirectory(prefix='arfi_inc15c6d_negative_') as td:
   root=Path(td)
   paths=['model/federal/inc15c6-hhs-institutional-exception-boundaries.json',
          'model/federal/manifest.json']
   paths+=['model/federal/'+x+'.json' for x in v.DOCS]
   paths+=['schemas/'+x+'.schema.json' for x in v.DOCS]
   for path in paths:
    dst=root/path;dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(BASE/path,dst)
   fn(root)
   with self.assertRaisesRegex(ValueError,'INC-15C.6D model rejected'):
    v.verify(root)
 def change(self,path,fn):
  def op(root):
   target=root/path;x=json.loads(target.read_text());fn(x)
   target.write_text(json.dumps(x,indent=2)+'\n')
  self.mutate(op)
 def test_false_dab_current_jurisdiction(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x['items'][0].update(statutory_or_adjudication_authority_certified=True))
 def test_false_omha_court_reporting(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x['items'][7].update(operational_supervision_certified=True))
 def test_false_2026_hhs_legal_count(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x.update(hhs_current_legal_first_level_denominator=34))
 def test_2005_2015_omha_office_coalescence(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x['items'][12].update(source_edition='2005-06-23'))
 def test_source_notice_label_replaced(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x['items'][4].update(source_label='Department of Justice Appeals Board'))
 def test_arpa_budget_plan_falsely_realized(self):
  self.change('model/federal/inc15c6d-arpah-fy2025-organization-chart.json',
    lambda x:x.update(independently_verified_implementation_of_eight_office_chart=True))
 def test_arpa_office_count_silently_shrunk_to_eight(self):
  self.change('model/federal/inc15c6d-arpah-fy2025-organization-chart.json',
    lambda x:x['items'].pop())
 def test_arpa_chart_manually_qualified_not_current_office(self):
  self.change('model/federal/inc15c6d-arpah-fy2025-organization-chart.json',
    lambda x:x['items'][2].update(present_day_still_active_verified=True))
 def test_historical_counts_cannot_be_added_to_hhs_29(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-coverage.json',
    lambda x:x.update(source_scoped_populations_not_additive=False))
 def test_historical_coverage_cannot_grant_alj_control(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-coverage.json',
    lambda x:x['items'][1].update(current_mission_or_adjudicative_authority_certified=True))
 def test_unsupported_added_signed_delegation_rejected(self):
  self.change('model/federal/inc15c6d-hhs-historical-source-office-observations.json',
    lambda x:x['items'][0].update(signed_statutory_delegation_verified=True))
 def test_schema_coforge_cannot_bypass_original_record_pin(self):
  def alter(root):
   p=root/'model/federal/inc15c6d-arpah-fy2025-organization-chart.json'
   z=json.loads(p.read_text());z['items'][1]['realized_eight_office_reorganization_verified']=True
   p.write_text(json.dumps(z,indent=2)+'\n')
   p=root/'schemas/inc15c6d-arpah-fy2025-organization-chart.schema.json'
   z=json.loads(p.read_text());z['properties']['items']['items']['properties']['realized_eight_office_reorganization_verified']={'const':True}
   p.write_text(json.dumps(z,indent=2)+'\n')
  self.mutate(alter)
 def test_replacing_predecessor_hhs_exception_blobs_rejected(self):
  self.change('model/federal/inc15c6-hhs-institutional-exception-boundaries.json',
    lambda x:x.update(hhs_indexed_name_population=30))
 def test_manifest_current_hhs_legal_denominator_inflation(self):
  self.change('model/federal/manifest.json',
    lambda x:x['federal_institutional_breadth_15c6d_extension'].update(present_day_federal_or_hhs_legal_first_level_denominator=34))
if __name__=='__main__':unittest.main()
