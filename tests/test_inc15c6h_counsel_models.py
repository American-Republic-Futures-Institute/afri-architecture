"""INC-15C.6H source and legal-boundary negative tests.

Replayed from local exact original publisher bytes without network dependency.
"""
import importlib.util,json,shutil,tempfile,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
sp=importlib.util.spec_from_file_location("c6hmodel",BASE/"scripts/inc15c6h-validate-counsel-models.py")
v=importlib.util.module_from_spec(sp);sp.loader.exec_module(v)
EP="model/federal/inc15c6h-counsel-authority-source-editions.json"
EV="model/federal/inc15c6h-counsel-citation-status-transitions.json"
OG="model/federal/inc15c6h-oig-1997-counsel-history.json"
RL="model/federal/inc15c6h-counsel-authority-boundaries.json"
CV="model/federal/inc15c6h-counsel-source-coverage.json"
def find(m,code):return next(x for x in m["items"] if x["id"]==code)

class HistoricalCounselSourceQualification(unittest.TestCase):
 def test_five_originals_and_no_false_current_legal_denominator(self):
  x=v.validate(BASE)
  self.assertEqual(x["five_new_source_originals"],5)
  self.assertEqual(x["original_publisher_sources"],6)
  self.assertEqual(x["edition_local_citation_records"],17)
  self.assertEqual(x["1997_OIG_and_OCIG_historical_units"],11)
  self.assertEqual(x["authority_boundary_relationships"],11)
  self.assertEqual(x["removed_CFR_5_1105_effective"],"2026-06-15")
  self.assertIsNone(x["HHS_legal_first_level_denominator"])
  self.assertEqual(x["new_canonical_federal_institutions"],0)
 def mutate(self,path,change,also=None):
  with tempfile.TemporaryDirectory(prefix="arfi_c6h_validation_") as d:
   root=Path(d)
   paths=["model/federal/manifest.json","scripts/inc15c6h-capture-source-editions.py"]
   paths+=list(v.PRIOR)
   for n in v.MODEL:
    paths.extend(["model/federal/"+n+".json","schemas/"+n+".schema.json"])
   for rel in paths:
    dst=root/rel;dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(BASE/rel,dst)
   shutil.copytree(BASE/"evidence/hhs-counsel-source-editions",
                   root/"evidence/hhs-counsel-source-editions")
   # Prior OGC evidence source must remain the exact original from INC-15C.6G.
   prior="evidence/hhs-ogc-2026-statement/originals/sha256/"+v.OGC_SHA+"/2026-19903.pdf"
   target=root/prior;target.parent.mkdir(parents=True,exist_ok=True)
   shutil.copyfile(BASE/prior,target)
   for filename,fn in [(path,change)]+([also] if also else []):
    p=root/filename
    if p.suffix in (".pdf",".html"):
     blob=bytearray(p.read_bytes());fn(blob);p.write_bytes(blob)
    else:
     x=json.loads(p.read_text());fn(x);p.write_text(json.dumps(x,indent=2)+"\n")
   with self.assertRaisesRegex(ValueError,"INC-15C.6H REJECTED"):
    v.validate(root)
 def test_historical_2025_cfr_section_must_not_be_current_2026(self):
  self.mutate(EV,lambda m:find(m,"INC15C6H-CITATION-6").update(citation_status="operative_at_edition"))
 def test_regulatory_removal_date_must_not_be_notice_date(self):
  self.mutate(EV,lambda m:find(m,"INC15C6H-CITATION-3").update(express_legal_effective_date="2026-09-29"))
 def test_stale_OGC_citation_identified(self):
  self.mutate(EP,lambda m:m.update(outdated_citation_OGC_source_date="2026-06-15"))
 def test_2026_fda_chart_not_pinned_to_superseded_september_edition(self):
  self.mutate(EP,lambda m:find(m,"INC15C6H-EDITION-FDACHART2026").update(source_publication_or_edition_date="2026-09-16"))
 def test_repealed_cfr_does_not_abolish_fda_counsel(self):
  self.mutate(EV,lambda m:m.update(FDA_OCC_existence_abolition_from_CFR_removal_unproven=False))
 def test_no_general_counsel_legal_override_of_OIG(self):
  self.mutate(RL,lambda m:m.update(OGC_supervisory_override_of_OIG_counsel=True))
 def test_oig_historical_roster_not_current_2026_certificate(self):
  self.mutate(OG,lambda m:m.update(current_2026_OIG_roster_equivalence_independently_certified=True))
 def test_oig_1997_seven_units_not_six_current_groups(self):
  self.mutate(OG,lambda m:m["items"].pop())
 def test_ocig_four_1997_counsel_functions_cannot_be_five(self):
  self.mutate(OG,lambda m:m.update(historical_OCIG_internal_source_labels=5))
 def test_no_alj_adjudicative_command_from_counsel_services(self):
  self.mutate(RL,lambda m:m.update(ALJ_case_control_by_OGC_or_OIG_derived=True))
 def test_presidential_order_applicable_law_is_section_8b(self):
  self.mutate(EV,lambda m:find(m,"INC15C6H-CITATION-15").update(publisher_section_or_paragraph="Section 8(a)"))
 def test_OIG_counsel_does_not_derive_entire_HHS_denominator(self):
  self.mutate(CV,lambda m:m.update(HHS_current_first_level_legal_denominator=11))
 def test_no_signed_named_attorney_delegation_from_source_registries(self):
  self.mutate(EV,lambda m:find(m,"INC15C6H-CITATION-10").update(signed_delegation_to_named_individual_established=True))
 def test_repealed_contact_law_status_source_original_tamper(self):
  receipt=json.loads((BASE/v.SOURCE_MANIFEST).read_text())
  f="evidence/hhs-counsel-source-editions/"+receipt["originals"]["fda_rule_2026"]["original_path"]
  self.mutate(f,lambda b:b.__setitem__(120,b[120]^1))
 def test_1997_source_original_not_same_as_2026_OGC_notice(self):
  receipt=json.loads((BASE/v.SOURCE_MANIFEST).read_text())
  f="evidence/hhs-counsel-source-editions/"+receipt["originals"]["oig_fr_1997_issue"]["original_path"]
  self.mutate(f,lambda b:b.__setitem__(100,b[100]^1))
 def test_cited_original_digest_in_legal_model_must_match_bytes(self):
  self.mutate(EP,lambda m:find(m,"INC15C6H-EDITION-FDA2026").update(retained_original_sha256="0"*64))
 def test_no_source_and_schema_coforgery(self):
  self.mutate(RL,lambda m:m["items"][0].update(statutorily_signed_universal_agency_command=True),
   ("schemas/inc15c6h-counsel-authority-boundaries.schema.json",
    lambda m:m["properties"]["items"]["items"]["properties"].update(statutorily_signed_universal_agency_command={"const":True})))
 def test_upstream_hhs_canonical_identity_will_not_be_redefined(self):
  path="model/federal/inc15c3-hhs-directory-reconciliation.json"
  self.mutate(path,lambda m:m["items"][0].update(source_name="A fabricated new federal agency"))
 def test_prior_ogc_alj_and_OIG_relations_still_custodied(self):
  path="model/federal/inc15c6g-ogc-institutional-interfaces.json"
  self.mutate(path,lambda m:m.update(OGC_legal_direction_over_OIG_certified=True))
 def test_1997_first_level_OIG_components_are_not_2026_department_total(self):
  self.mutate("model/federal/manifest.json",
    lambda m:m["federal_institutional_breadth_15c6h_extension"].update(whole_HHS_current_legal_first_level_denominator=7))
 def test_forged_external_WORM_certificate(self):
  self.mutate(v.SOURCE_MANIFEST,lambda m:m.update(WORM_external_certified=True))
if __name__=="__main__":unittest.main()
