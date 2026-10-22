import importlib.util,json,shutil,tempfile,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("ocr_models",BASE/"scripts/inc15c6f-validate-ocr-models.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class OCRPublishedOrganization(unittest.TestCase):
 def test_operative_OCR_composition_and_2023_supersession(self):
  s=v.validate(BASE)
  self.assertEqual(s["OCR_internal_organizational_components"],6)
  self.assertEqual(s["prior_2023_component_labels"],6)
  self.assertEqual(s["operative_OCR_effective_date"],"2026-06-28")
  self.assertEqual(s["amendment_clauses"],9)
  self.assertEqual(s["bounded_typed_source_relations"],13)
  self.assertEqual(s["new_canonical_federal_institutions"],0)
  self.assertIsNone(s["whole_HHS_legal_first_level_denominator"])
 def mutate(self,path,change,second=None):
  with tempfile.TemporaryDirectory(prefix="arfi_inc15c6f_") as td:
   root=Path(td)
   fs=["model/federal/manifest.json",
       "model/federal/inc15c3-hhs-directory-reconciliation.json",
       "model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
       "model/federal/inc15c6e-hhs-source-lifecycle-coverage.json",
       "scripts/inc15c6f-validate-original-custody.py"]
   fs += ["model/federal/"+k+".json" for k in v.FAMILIES]
   fs += ["schemas/"+k+".schema.json" for k in v.FAMILIES]
   for f in fs:
    dest=root/f;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(BASE/f,dest)
   shutil.copytree(BASE/"evidence/hhs-ocr-org-2023-2026",root/"evidence/hhs-ocr-org-2023-2026")
   for f,fn in [(path,change)]+([] if second is None else [second]):
    target=root/f;o=json.loads(target.read_text());fn(o);target.write_text(json.dumps(o,indent=2)+"\n")
   with self.assertRaisesRegex(ValueError,"INC-15C.6F OCR model rejected"):
    v.validate(root)
 def test_2026_effective_date_not_approval_date(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x.update(source_2026_notice_effective_date="2026-05-14"))
 def test_2023_superseded_text_not_erased_agency(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"][0].update(edition_local_status="ceased_legal_existence"))
 def test_ATB_policy_not_same_label_as_2026_civil_rights(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"][2].update(publisher_organization_label="Civil Rights Division"))
 def test_2026_ATE_conscience_division_not_2023_strategy(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"][11].update(publisher_organization_label="Strategic Planning Division"))
 def test_2026_six_component_statement_required(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"].pop())
 def test_no_canonical_institution_ids_from_OCR_internal_components(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"][9].update(new_canonical_legal_institution_id="ORG-FED-EXE-HHS-OCR-NEW"))
 def test_no_cross_epoch_proven_legal_identity_merger(self):
  self.mutate("model/federal/inc15c6f-ocr-dated-organization-epochs.json",
              lambda x:x["items"][8].update(same_legal_office_identity_across_2023_2026_certified=True))
 def test_AT20_only_targeted_amendments_not_entire_republication(self):
  self.mutate("model/federal/inc15c6f-ocr-2026-notice-clauses.json",
              lambda x:x.update(chapter_AT20_targeted_amendments_not_entire_republication=False))
 def test_source_IX_delegation_continuation_not_new_delegation(self):
  self.mutate("model/federal/inc15c6f-ocr-2026-notice-clauses.json",
              lambda x:x["items"][8].update(new_individual_signed_delegations_proved=True))
 def test_clause_V_original_subsection_not_2023_policy(self):
  self.mutate("model/federal/inc15c6f-ocr-2026-notice-clauses.json",
              lambda x:x["items"][4].update(source_amendment_classification="continues_prior_policy_division"))
 def test_signed_deputy_reporting_is_not_Alj_case_control(self):
  self.mutate("model/federal/inc15c6f-ocr-typed-source-relationships.json",
              lambda x:x["items"][8].update(legally_signed_cross_HHS_reporting_or_command_verified=True))
 def test_OCR_composition_is_six_internal_only(self):
  self.mutate("model/federal/inc15c6f-ocr-typed-source-relationships.json",
              lambda x:x["items"][1].update(source_subject_id="INC15C6-HHS-EXCEPTION-DAB"))
 def test_no_undeclared_budget_implementations(self):
  self.mutate("model/federal/inc15c6f-ocr-typed-source-relationships.json",
              lambda x:x.update(signed_budget_ASCRA_ASE_parent_organizational_transfers=1))
 def test_no_fake_effective_date_on_relation(self):
  self.mutate("model/federal/inc15c6f-ocr-typed-source-relationships.json",
              lambda x:x["items"][6].update(source_statement_effective_date="2026-06-30"))
 def test_original_pdf_publisher_sha_pin(self):
  self.mutate("model/federal/inc15c6f-ocr-2026-notice-clauses.json",
              lambda x:x.update(source_original_sha256="0"*64))
 def test_previous_HHS_budget_planning_not_rewritten(self):
  self.mutate("model/federal/inc15c6e-hhs-budget-proposal-epochs.json",
              lambda x:x["items"][0].update(lifecycle_state="implemented_primary_source_qualified"))
 def test_schema_and_record_coforgery_denied(self):
  f="model/federal/inc15c6f-ocr-dated-organization-epochs.json"
  sch="schemas/inc15c6f-ocr-dated-organization-epochs.schema.json"
  self.mutate(f,lambda x:x["items"][0].update(plenary_authority_to_direct_HHS=True),
    (sch,lambda x:x["properties"]["items"]["items"]["properties"].update(plenary_authority_to_direct_HHS={"const":True})))
 def test_current_HHS_legal_roster_count_remains_null(self):
  self.mutate("model/federal/manifest.json",
    lambda x:x["federal_institutional_breadth_15c6f_extension"].update(**{"2026_legal_HHS_first_level_denominator":6}))
if __name__=="__main__":unittest.main()
