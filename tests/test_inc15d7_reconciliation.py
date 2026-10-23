"""INC-15D.7 — preserved source originals, source-only identities and denial tests."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15d7",ROOT/"scripts/inc15d7-govman-reconcile.py")
m=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
FILES=set([
 m.ORIGINAL,m.govman.LINKS,m.govman.X12,*m.govman.OUTPUTS.values(),
 m.prior.prior.CURATION,m.prior.prior.DISPOSITIONS,m.prior.prior.COVERAGE,
 m.prior.CURATION,m.prior.DISPOSITIONS,m.prior.COVERAGE,
 m.CURATION,m.DISPOSITIONS,m.COVERAGE,m.MANIFEST,m.CANONICAL,m.IDENTITIES,
 m.prior.DEPARTMENTS,m.prior.SEEDS,m.prior.GRANULES,m.prior.UNITS,
 m.prior.COMMERCE_SOURCE,m.prior.COMMERCE_SNAPSHOTS,m.prior.ED_CHART,
])


def closed_schema(value,schema,where="root"):
 if "const" in schema:
  assert value==schema["const"],where+" invariant"
 if "enum" in schema:
  assert value in schema["enum"],where+" enum"
 if "type" in schema:
  ts=schema["type"] if isinstance(schema["type"],list) else [schema["type"]]
  mappings={
   "object":lambda x:type(x) is dict,"array":lambda x:type(x) is list,
   "string":lambda x:type(x) is str,"integer":lambda x:type(x) is int,
   "boolean":lambda x:type(x) is bool,"null":lambda x:x is None}
  assert any(mappings[t](value) for t in ts),where+" type"
 if type(value) is dict:
  assert set(schema.get("required",())).issubset(value),where+" fields absent"
  props=schema.get("properties",{})
  if schema.get("additionalProperties") is False:
   assert set(value).issubset(props),where+" fields added"
  for key,contract in props.items():
   if key in value:closed_schema(value[key],contract,where+"."+key)
 if type(value) is list:
  assert len(value)>=schema.get("minItems",0),where+" min"
  assert len(value)<=schema.get("maxItems",len(value)),where+" max"
  if "items" in schema:
   for idx,row in enumerate(value):
    closed_schema(row,schema["items"],where+"."+str(idx))


class IndependentGovManReconciliation(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.generated=m.expected(ROOT)
  cls.dispositions=cls.generated[m.DISPOSITIONS]
  cls.coverage=cls.generated[m.COVERAGE]
  cls.rows=cls.dispositions["items"]
  cls.id_map={r["source_entity_local_id"]:r for r in cls.rows}

 def temp_repo(self):
  folder=tempfile.TemporaryDirectory(prefix="inc15d7_neg_")
  root=Path(folder.name)
  for path in FILES:
   dest=root/path
   dest.parent.mkdir(parents=True,exist_ok=True)
   shutil.copyfile(ROOT/path,dest)
  return folder,root

 @staticmethod
 def write(root,path,obj):
  (root/path).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

 def reject(self,path,mutate,pattern="INC-15D.7 source disposition rejected"):
  folder,root=self.temp_repo()
  with folder:
   obj=m.read(root,path)
   mutate(obj)
   self.write(root,path,obj)
   with self.assertRaisesRegex(ValueError,pattern):
    m.run(root)

 def test_15_of_15_first_unlinked_independent_source_rows(self):
  summary=m.run(ROOT)
  self.assertEqual(summary["inc15d7_source_dispositions"],15)
  self.assertEqual(summary["independent_category_unlinked_entries_outside_tranche"],30)
  self.assertEqual(summary["new_legal_entity_identifications"],0)
  self.assertEqual(summary["atlas_edges_admitted"],0)
  self.assertEqual([v["source_entity_local_id"] for v in self.rows],list(m.TRANCHE_IDS))
  self.assertEqual(len({r["source_entity_key"] for r in self.rows}),15)

 def test_original_directory_category_counts_remain_62_17_45(self):
  summary=m.run(ROOT)
  self.assertEqual((summary["independent_publisher_category_records"],
                    summary["prior_canonical_links_in_category"],
                    summary["prior_unlinked_category_entries"]),(62,17,45))
  self.assertEqual((summary["whole_edition_records"],
                    summary["earlier_provisional_canonical_links"],
                    summary["earlier_unlinked_source_entries"]),(231,50,181))
  self.assertEqual(self.coverage["earlier_28_INC15D5_dispositions_preserved"],28)
  self.assertEqual(self.coverage["earlier_15_INC15D6_dispositions_preserved"],15)
  self.assertEqual(self.coverage["earlier_181_unlinked_entries_reclassified_as_canonical"],0)

 def test_exact_Publisher_Entity_source_xpath_and_no_parent(self):
  for row in self.rows:
   self.assertEqual(row["publisher_category"],m.CATEGORY)
   self.assertEqual(row["publisher_category_scope"],"independent_publisher")
   self.assertEqual(row["publisher_element_tag"],"Entity")
   self.assertEqual(row["publisher_depth"],0)
   self.assertIsNone(row["published_parent_key"])
   self.assertEqual(row["publisher_original_xpath"],
                    "/GovernmentManual/Entity[@EntityId='"+row["source_entity_local_id"]+"']")
   self.assertEqual(row["publisher_original_sha256"],m.SHA)
   self.assertEqual(row["publisher_original_git_blob_sha1"],m.BLOB)

 def test_historical_CNCS_is_not_automatically_identified_with_successor(self):
  row=self.id_map["133"]
  self.assertEqual(row["published_name"],"Corporation for National and Community Service")
  self.assertEqual(row["disposition"],m.HISTORICAL_DISPOSITION)
  self.assertIs(row["historical_name_current_successor_unverified"],True)
  self.assertIsNone(row["existing_canonical_id"])
  self.assertIsNone(row["unverified_alias_candidate_id"])
  self.assertEqual(self.coverage["historical_corporation_name_auto_mapped_to_successor"],False)

 def test_federal_reserve_system_not_automatically_board_of_governors(self):
  row=self.id_map["147"]
  self.assertEqual(row["published_name"],"Federal Reserve System")
  self.assertEqual(row["disposition"],m.SYSTEM_DISPOSITION)
  self.assertIs(row["composite_federal_reserve_system_not_board_of_governors"],True)
  self.assertIsNone(row["existing_canonical_id"])
  self.assertFalse(self.coverage["federal_reserve_system_auto_mapped_to_board"])

 def test_13_plain_1_historical_1_composite_exact_accounting(self):
  self.assertEqual(
   {d:sum(x["disposition"]==d for x in self.rows) for d in
    (m.NORMAL,m.HISTORICAL_DISPOSITION,m.SYSTEM_DISPOSITION)},
   {m.NORMAL:13,m.HISTORICAL_DISPOSITION:1,m.SYSTEM_DISPOSITION:1})
  self.assertEqual(self.coverage["source_dispositions_accounted"] if
                   "source_dispositions_accounted" in self.coverage else
                   self.coverage["selected_entries_accounted"],15)

 def test_no_publisher_mission_promoted_to_authority(self):
  for row in self.rows:
   self.assertIs(row["publisher_mission_text_not_legal_authority"],True)
   self.assertIs(row["directory_grouping_not_entity_legal_classification"],True)
   self.assertIs(row["publisher_mission_text_present"],True)
   self.assertIsNone(row["existing_canonical_id"])
   self.assertIsNone(row["unverified_alias_candidate_id"])

 def test_every_no_legal_operational_budget_or_atlas_flag(self):
  for row in self.rows:
   for field in (
    "legal_agency_or_corporation_subtype_certified","current_organization_2026_verified",
    "legal_identity_certified","statutory_original_independently_captured_for_this_entity",
    "appropriation_or_fiscal_authority_verified","oversight_or_reporting_chain_verified",
    "legal_delegation_or_command_verified","actual_statutory_action_observed",
    "adl1_certified","independent_legal_review_complete",
    "external_worm_custody_certified","atlas_graph_admitted",
    "plan_or_observatory_inference_created"):
    self.assertIs(row[field],False,row["source_entity_key"]+"."+field)
  self.assertIsNone(self.coverage["present_day_federal_legal_institution_denominator"])

 def test_three_closed_contract_schemas_with_no_hidden_fields(self):
  for part,path in (("curation",m.CURATION),("dispositions",m.DISPOSITIONS),
                    ("coverage",m.COVERAGE)):
   v=m.read(ROOT,path)
   spec=json.loads((ROOT/("schemas/inc15d7-govman-2025-"+part+".schema.json")).read_text())
   self.assertFalse(spec["additionalProperties"])
   self.assertEqual(spec["$schema"],"https://json-schema.org/draft/2020-12/schema")
   closed_schema(v,spec,path)
   if part=="dispositions":
    props=spec["properties"]["items"]["items"]["properties"]
    self.assertEqual(props["atlas_graph_admitted"]["const"],False)
    self.assertEqual(props["legal_identity_certified"]["const"],False)
    self.assertEqual(props["legal_delegation_or_command_verified"]["const"],False)
    self.assertEqual(props["appropriation_or_fiscal_authority_verified"]["const"],False)

 def test_original_xml_byte_tampering_fails(self):
  folder,root=self.temp_repo()
  with folder:
   src=root/m.ORIGINAL
   payload=bytearray(src.read_bytes());payload[11111]^=1;src.write_bytes(payload)
   with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
    m.run(root)

 def test_wrong_source_edition_sha_fails(self):
  self.reject(m.CURATION,lambda d:d.update(source_original_sha256="f"*64),
              "curation scope, source edition")

 def test_missing_one_of_15_rows_fails(self):
  self.reject(m.CURATION,lambda d:d["items"].pop(),"curation scope, source edition")

 def test_duplicate_source_entity_key_fails(self):
  self.reject(m.CURATION,lambda d:d["items"][1].update(
   source_entity_local_id=d["items"][0]["source_entity_local_id"],
   source_entity_key=d["items"][0]["source_entity_key"]),"duplicate edition-local source ID")

 def test_foreign_government_manual_source_ID_fails(self):
  self.reject(m.CURATION,lambda d:d["items"][0].update(
   source_entity_local_id="189",source_entity_key="GOVMAN-2025-12-31:189"),
   "missing or foreign entries")

 def test_publisher_mission_is_not_legal_authority(self):
  self.reject(m.DISPOSITIONS,lambda d:d["items"][0].update(
   publisher_mission_text_not_legal_authority=False),"committed original-source-derived")

 def test_statutory_authority_or_budget_cannot_be_promoted(self):
  self.reject(m.DISPOSITIONS,lambda d:d["items"][1].update(
   legal_delegation_or_command_verified=True,
   appropriation_or_fiscal_authority_verified=True),"committed original-source-derived")

 def test_unqualified_federal_entity_subtype_must_not_be_certified(self):
  self.reject(m.DISPOSITIONS,lambda d:d["items"][2].update(
   legal_agency_or_corporation_subtype_certified=True),"committed original-source-derived")

 def test_CNCS_successor_status_cannot_be_promoted(self):
  self.reject(m.CURATION,lambda d:next(x for x in d["items"] if
   x["source_entity_local_id"]=="133").update(
   official_successor_identity_verified=True),"existing canonical identity, legal subtype")

 def test_CNCS_cannot_be_silently_reclassified_as_generic_publisher(self):
  self.reject(m.CURATION,lambda d:next(x for x in d["items"] if
   x["source_entity_local_id"]=="133").update(disposition=m.NORMAL),
   "historical name, system label")

 def test_federal_reserve_board_identity_not_equated(self):
  self.reject(m.CURATION,lambda d:next(x for x in d["items"] if
   x["source_entity_local_id"]=="147").update(
   federal_reserve_board_equivalence_verified=True),"existing canonical identity, legal subtype")

 def test_federal_reserve_record_not_generic_or_bypass(self):
  self.reject(m.CURATION,lambda d:next(x for x in d["items"] if
   x["source_entity_local_id"]=="147").update(disposition=m.NORMAL),
   "historical name, system label")

 def test_alias_candidate_must_not_be_converted_to_canonical(self):
  self.reject(m.CURATION,lambda d:d["items"][0].update(
   provisional_alias_target_id="ORG-FED-EXE-IND-FAKE"),
   "existing canonical identity, legal subtype")

 def test_wrong_2025_XML_path_for_named_entity_fails(self):
  self.reject(m.CURATION,lambda d:d["items"][0].update(
   source_xml_xpath="/GovernmentManual/Entity[@EntityId='147']"),
   "historical name, system label")

 def test_cannot_add_unreviewed_2026_currentness(self):
  self.reject(m.DISPOSITIONS,lambda d:d["items"][5].update(
   current_organization_2026_verified=True),"committed original-source-derived")

 def test_prior_28_and_15_reconciliations_cannot_be_modified(self):
  self.reject(m.prior.COVERAGE,lambda d:d.update(
   previous_50_canonical_name_links_modified=1),
   "INC-15D.6 reconciliation rejected")

 def test_50_existing_2025_canonical_crosswalk_links_preserved(self):
  self.reject(m.govman.OUTPUTS["crosswalk"],lambda d:d["items"][0].update(
   canonical_id=None),"INC-15D.5 reconciliation rejected")

 def test_manifest_refuses_false_canonical_or_atlas_admission(self):
  self.reject(m.MANIFEST,lambda d:d["federal_institutional_breadth_15d7_extension"].update(
   new_canonical_id_matches=15,atlas_graph_admitted=True),
   "incorrect manifest research publication contract")

 def test_cannot_claim_15_legal_agencies_or_new_status_in_coverage(self):
  self.reject(m.COVERAGE,lambda d:d["items"][0].update(
   legally_qualified_15_federal_agencies=True),
   "committed original-source-derived")

 def test_existing_independent_canonical_model_tampering_rejected(self):
  self.reject(m.CANONICAL,lambda d:d["items"][0].update(
   branch_id="BR-FED-JUD"),"existing independent organization classification")

if __name__=="__main__":
 unittest.main()
