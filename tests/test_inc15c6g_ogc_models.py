import importlib.util,json,shutil,tempfile,unittest
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("inc15c6g_validator",
 BASE/"scripts/inc15c6g-validate-ogc-models.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
ORG="model/federal/inc15c6g-ogc-hierarchy.json"
ROLE="model/federal/inc15c6g-ogc-role-classes.json"
EDGE="model/federal/inc15c6g-ogc-institutional-interfaces.json"
COV="model/federal/inc15c6g-ogc-source-coverage.json"

class OfficialOGCSourceBoundaries(unittest.TestCase):
 def test_exact_edition_and_govinfo_original_verified(self):
  result=v.validate(BASE)
  self.assertEqual(result["HHS_OGC_divisions"],11)
  self.assertEqual(result["source_organizational_nodes"],39)
  self.assertEqual(result["OGC_roles_described"],22)
  self.assertEqual(result["typed_client_and_boundary_relations"],39)
  self.assertIsNone(result["original_legal_effective_date"])
  self.assertIsNone(result["HHS_legal_first_level_denominator"])
  self.assertEqual(result["new_canonical_agency_ids"],0)

 def tamper(self,file,edit,also=None):
  with tempfile.TemporaryDirectory(prefix="arfi_inc15c6g_") as d:
   root=Path(d)
   files=["model/federal/manifest.json",
      "model/federal/inc15c3-hhs-directory-reconciliation.json",
      "scripts/inc15c6g-ogc-original.py"]
   for name in v.FILES:
    files.extend(("model/federal/"+name+".json","schemas/"+name+".schema.json"))
   for path in files:
    f=root/path;f.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(BASE/path,f)
   shutil.copytree(BASE/"evidence/hhs-ogc-2026-statement",
                   root/"evidence/hhs-ogc-2026-statement")
   actions=[(file,edit)]+([also] if also else [])
   for path,fn in actions:
    target=root/path
    if target.suffix==".pdf":
     raw=bytearray(target.read_bytes());fn(raw);target.write_bytes(raw)
    else:
     m=json.loads(target.read_text());fn(m);target.write_text(json.dumps(m,indent=2)+"\n")
   with self.assertRaisesRegex(ValueError,"INC-15C.6G REJECTED"):
    v.validate(root)

 def test_source_OGC_division_denominator_not_HHS_census(self):
  self.tamper(ORG,lambda m:m.update(OGC_division_count=12))
 def test_OGC_legal_date_not_same_as_published(self):
  self.tamper(ORG,lambda m:m.update(independently_qualified_effective_date="2026-09-29"))
 def test_real_legal_HHS_denominator_still_unresolved(self):
  self.tamper(COV,lambda m:m.update(HHS_whole_current_legal_first_level_institution_denominator=39))
 def test_no_synthetic_canonical_federal_institution(self):
  self.tamper(ORG,lambda m:m["items"][9].update(new_canonical_HHS_institution_id="ORG-FED-HHS-OGC-ARPAH"))
 def test_olr_six_branches_complete(self):
  self.tamper(ORG,lambda m:m["items"][2].update(edition_local_code="OLR-BRANCH-REMOVED"))
 def test_cmsd_four_group_depth_preserved(self):
  self.tamper(ORG,lambda m:m["items"][13].update(parent_edition_local_id="INC15C6G-OGC-ETH"))
 def test_false_satellite_agency_unit(self):
  self.tamper(ORG,lambda m:m["items"].append({**m["items"][0],"id":"OGC-SATELLITE-AS-AGENCY"}))
 def test_ogc_role_not_named_incumbent(self):
  self.tamper(ROLE,lambda m:m["items"][0].update(currently_named_incumbent="Unverified Appointee"))
 def test_ogc_roles_not_headcount(self):
  self.tamper(ROLE,lambda m:m.update(valid_number_of_positions_under_statute=22))
 def test_secretarial_ethics_delegation_instrument_not_presumed(self):
  self.tamper(ROLE,lambda m:m.update(externally_appointing_or_delegation_instruments_retrieved_and_verified=True))
 def test_oig_counsel_override_not_granted(self):
  self.tamper(EDGE,lambda m:m.update(OGC_legal_direction_over_OIG_certified=True))
 def test_cmsd_advice_not_dab_alj_command(self):
  self.tamper(EDGE,lambda m:m["items"][2].update(ALJ_case_control_or_adjudicative_decision_power_verified=True))
 def test_uaclr_representation_conflict_retained(self):
  self.tamper(EDGE,lambda m:m.update(UACLRD_independent_child_representation_boundary=False))
 def test_fda_admin_does_not_confer_professional_legal_command(self):
  self.tamper(EDGE,lambda m:next(x for x in m["items"] if x["relationship_type"]=="FDA_ChiefCounsel_administrative_location_only").update(signed_client_agency_command_transfer_verified=True))
 def test_cfad_not_a_canonical_HHS_entity(self):
  self.tamper(EDGE,lambda m:next(x for x in m["items"] if x["relationship_type"]=="internal_OGC_conflicted_legal_function_separation").update(target_existing_HHS_index_id="INC15C3-HHS-LINK-CFAD"))
 def test_satellite_managing_counsel_not_organization_or_litigation_supervisor(self):
  self.tamper(EDGE,lambda m:m.update(satellites_not_separately_established_offices=False))
 def test_original_official_pdf_byte_mutation(self):
  acquisition=json.loads((BASE/"evidence/hhs-ogc-2026-statement/receipts/acquisition.json").read_text())
  path=acquisition["original_repo_path"]
  self.tamper(path,lambda raw:raw.__setitem__(120,raw[120]^1))
 def test_source_pdf_forged_SHA_receipt(self):
  f="evidence/hhs-ogc-2026-statement/receipts/acquisition.json"
  self.tamper(f,lambda m:m.update(original_sha256="0"*64))
 def test_schema_plus_record_coforge_cannot_override_source(self):
  sf="schemas/inc15c6g-ogc-institutional-interfaces.schema.json"
  self.tamper(EDGE,lambda m:m["items"][0].update(departmental_command_new=True),
   (sf,lambda s:s["properties"]["items"]["items"]["properties"].update(departmental_command_new={"const":True})))
 def test_prior_canonical_HHS_index_not_replaced(self):
  self.tamper("model/federal/inc15c3-hhs-directory-reconciliation.json",
    lambda m:m["items"][21].update(source_name="New OGC Department"))
 def test_FY2026_FY2027_budget_proposals_not_enacted_by_OGC_notice(self):
  self.tamper("model/federal/manifest.json",
    lambda m:m["federal_institutional_breadth_15c6g_extension"].update(FY2026_ASE_and_FY2027_ASCRA_budget_proposals_not_implemented_by_OGC_notice=False))
if __name__=="__main__":unittest.main()
