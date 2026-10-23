"""INC-15D.8 — 2025 Government Manual original source, hierarchy and authority tests."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15d8",ROOT/"scripts/inc15d8-govman-reconcile.py")
m=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
p7=m.prior
p6=p7.prior
p5=p6.prior

COPY=set([
 m.ORIGINAL,m.govman.LINKS,m.govman.X12,*m.govman.OUTPUTS.values(),
 p5.CURATION,p5.DISPOSITIONS,p5.COVERAGE,
 p6.CURATION,p6.DISPOSITIONS,p6.COVERAGE,
 p7.CURATION,p7.DISPOSITIONS,p7.COVERAGE,
 m.CURATION,m.DISPOSITIONS,m.COVERAGE,m.MANIFEST,m.CANONICAL,m.X12,
 p6.SEEDS,p6.GRANULES,p6.UNITS,p6.COMMERCE_SOURCE,p6.COMMERCE_SNAPSHOTS,
 p6.ED_CHART,p6.DEPARTMENTS,p6.IDENTITIES
])


def closed_schema(value,schema,label="root"):
 if "const" in schema:
  assert value==schema["const"],label+" constant"
 if "enum" in schema:
  assert value in schema["enum"],label+" enumeration"
 if "type" in schema:
  types=schema["type"] if type(schema["type"]) is list else [schema["type"]]
  checks={"object":lambda x:type(x) is dict,"array":lambda x:type(x) is list,
          "integer":lambda x:type(x) is int,"string":lambda x:type(x) is str,
          "boolean":lambda x:type(x) is bool,"null":lambda x:x is None}
  assert any(checks[t](value) for t in types),label+" type"
 if type(value) is dict:
  assert set(schema.get("required",())).issubset(value),label+" missing fields"
  props=schema.get("properties",{})
  if schema.get("additionalProperties") is False:
   assert set(value).issubset(props),label+" additional properties"
  for key,rule in props.items():
   if key in value:closed_schema(value[key],rule,label+"."+key)
 if type(value) is list:
  assert len(value)>=schema.get("minItems",0),label+" minItems"
  assert len(value)<=schema.get("maxItems",len(value)),label+" maxItems"
  if "items" in schema:
   for k,entry in enumerate(value):closed_schema(entry,schema["items"],label+"."+str(k))


class IndependentPublisherSecondTranche(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.out=m.expected(ROOT)
  cls.rows=cls.out[m.DISPOSITIONS]["items"]
  cls.by_id={r["source_entity_local_id"]:r for r in cls.rows}
  cls.coverage=cls.out[m.COVERAGE]

 def scratch(self):
  context=tempfile.TemporaryDirectory(prefix="inc15d8_source_contract_")
  root=Path(context.name)
  for path in COPY:
   full=root/path
   full.parent.mkdir(parents=True,exist_ok=True)
   shutil.copyfile(ROOT/path,full)
  return context,root

 def reject(self,path,mutation,match="INC-15D.8 source/canonical contract rejected"):
  scope,root=self.scratch()
  with scope:
   obj=m.get(root,path)
   mutation(obj)
   (root/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",
                          encoding="utf-8")
   with self.assertRaisesRegex(ValueError,match):
    m.run(root)

 def test_15_of_15_original_XML_entries_are_accounted_for(self):
  res=m.run(ROOT)
  self.assertEqual(res["tranche_entries_accounted"],15)
  self.assertEqual([r["source_entity_local_id"] for r in self.rows],list(m.IDS))
  self.assertEqual(len({r["source_entity_key"] for r in self.rows}),15)
  self.assertEqual(res["newly_legally_qualified_canonical_ids"],0)
  self.assertEqual(res["qualified_legal_control_edges"],0)

 def test_category_numbers_still_62_17_45_and_whole_231_50_181(self):
  res=m.run(ROOT)
  self.assertEqual((res["independent_publisher_category_entries"],
                    res["independent_category_provisional_links"],
                    res["independent_category_unlinked_source_entries"]),(62,17,45))
  self.assertEqual((res["whole_edition_source_entries"],
                    res["prior_canonical_links"],res["prior_unlinked_entries"]),(231,50,181))
  self.assertEqual(res["cumulative_independent_category_source_dispositions"],30)
  self.assertEqual(res["remaining_independent_publisher_entries_not_reconciled"],15)

 def test_previous_28_plus_15_plus_15_cohorts_are_not_reclassified(self):
  self.assertEqual(self.coverage["prior_28_15D5_dispositions_unchanged"],28)
  self.assertEqual(self.coverage["prior_15_15D6_dispositions_unchanged"],15)
  self.assertEqual(self.coverage["prior_15_15D7_dispositions_unchanged"],15)
  self.assertEqual(self.coverage["prior_50_whole_edition_canonical_matches_changed"],0)
  self.assertEqual(self.coverage["prior_181_whole_edition_unlinked_records_recategorized_as_canonical"],0)

 def test_12_source_level_zero_publisher_entities(self):
  root_rows=[r for r in self.rows if r["published_parent_key"] is None]
  self.assertEqual(len(root_rows),12)
  self.assertTrue(all(r["publisher_element_tag"]=="Entity" and
                      r["published_depth"]==0 and
                      r["publisher_original_xpath"]==
                       "/GovernmentManual/Entity[@EntityId='"+r["source_entity_local_id"]+"']"
                      for r in root_rows))

 def test_foundation_three_components_keep_exact_2025_hierarchy(self):
  parent=self.by_id["157"]
  self.assertIsNone(parent["published_parent_key"])
  self.assertIs(parent["foundation_group_publisher_entry"],True)
  self.assertEqual(parent["disposition"],m.GROUP)
  for expected_order,local in enumerate(m.ARTS,1):
   x=self.by_id[local]
   self.assertEqual(x["published_parent_key"],m.FOUNDATION)
   self.assertEqual(x["published_order"],expected_order)
   self.assertEqual(x["published_depth"],1)
   self.assertEqual(x["publisher_element_tag"],"SubEntityLevelOne")
   self.assertEqual(x["publisher_original_xpath"],
                    "/GovernmentManual/Entity[@EntityId='157']/Childrens/SubEntityLevelOne[@EntityId='"+local+"']")
   self.assertIs(x["publisher_nested_foundation_component"],True)
   self.assertEqual(x["disposition"],m.NESTED)
  self.assertEqual({i:self.by_id[i]["published_name"] for i in m.ARTS},{
   "208":"National Endowment for the Arts",
   "209":"National Endowment for the Humanities",
   "210":"Institute of Museum and Library Services"})

 def test_foundation_parentage_is_not_a_statutory_control_delegation(self):
  for local in ["157",*m.ARTS]:
   x=self.by_id[local]
   self.assertIs(x["publisher_nesting_not_proof_of_statutory_parentage"],True)
   self.assertIsNone(x["qualified_legal_parent_institution"])
   self.assertIs(x["legal_supervision_or_delegation_verified"],False)
   self.assertIs(x["congressional_appropriation_authority_verified"],False)

 def test_amtrak_publisher_corporation_not_a_certified_government_agency(self):
  x=self.by_id["160"]
  self.assertEqual(x["published_name"],"National Railroad Passenger Corporation (AMTRAK)")
  self.assertEqual(x["disposition"],m.CORPORATE)
  self.assertIs(x["corporation_named_amtrak_source_entry"],True)
  self.assertIs(x["corporate_form_or_ownership_legal_review_pending"],True)
  self.assertIs(x["corporate_or_federal_agency_subtype_verified"],False)
  self.assertIs(x["original_statute_or_charter_for_this_record_retained"],False)
  self.assertIsNone(x["canonical_institutional_identity"])

 def test_board_commission_publisher_titles_do_not_verify_oversight(self):
  for local in ("148","152","155","156","158","159","162","164"):
   x=self.by_id[local]
   self.assertIs(x["board_or_commission_oversight_verified"],False)
   self.assertIs(x["legal_supervision_or_delegation_verified"],False)
   self.assertIs(x["operational_command_exercised_verified"],False)

 def test_all_entries_retained_original_sha_blob_and_disclaimer(self):
  for x in self.rows:
   self.assertEqual(x["source_original_sha256"],m.SHA)
   self.assertEqual(x["source_original_git_blob_sha1"],m.BLOB)
   self.assertEqual(x["publisher_category"],m.CATEGORY)
   self.assertEqual(x["publisher_category_scope"],"independent_publisher")
   self.assertIs(x["original_mission_text_not_statutory_authority"],True)
   self.assertIsNone(x["canonical_institutional_identity"])
   self.assertIsNone(x["qualified_legal_parent_institution"])

 def test_all_15_no_legal_canonical_current_authority_or_public_promotion(self):
  for x in self.rows:
   for field in ("specific_current_2026_legal_identity_verified",
      "corporate_or_federal_agency_subtype_verified",
      "original_statute_or_charter_for_this_record_retained",
      "legal_supervision_or_delegation_verified","board_or_commission_oversight_verified",
      "congressional_appropriation_authority_verified",
      "operational_command_exercised_verified","independent_legal_review_complete",
      "adl1_certified","external_worm_original_verified",
      "atlas_graph_admitted","plan_or_data_observatory_inference_created"):
    self.assertIs(x[field],False,x["source_entity_key"]+"."+field)

 def test_three_closed_source_schemas(self):
  for kind,path in (("curation",m.CURATION),("dispositions",m.DISPOSITIONS),
                    ("coverage",m.COVERAGE)):
   schema=json.loads((ROOT/("schemas/inc15d8-govman-2025-"+kind+".schema.json")).read_text())
   self.assertEqual(schema["$schema"],"https://json-schema.org/draft/2020-12/schema")
   self.assertIs(schema["additionalProperties"],False)
   closed_schema(m.get(ROOT,path),schema,path)
   if kind=="dispositions":
    props=schema["properties"]["items"]["items"]["properties"]
    self.assertEqual(props["legal_supervision_or_delegation_verified"]["const"],False)
    self.assertEqual(props["atlas_graph_admitted"]["const"],False)
    self.assertEqual(props["corporate_or_federal_agency_subtype_verified"]["const"],False)

 def test_original_publisher_byte_corruption_fails(self):
  context,root=self.scratch()
  with context:
   f=root/m.ORIGINAL
   buf=bytearray(f.read_bytes());buf[22222]^=1;f.write_bytes(buf)
   with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
    m.run(root)

 def test_wrong_original_sha_fails(self):
  self.reject(m.CURATION,lambda a:a.update(source_original_sha256="a"*64))

 def test_wrong_2025_source_edition_fails(self):
  self.reject(m.CURATION,lambda a:a.update(source_edition="GOVMAN-2026-01-01"))

 def test_forged_current_statutory_identity_fails(self):
  self.reject(m.CURATION,lambda a:a["items"][0].update(
   charter_or_statutory_original_qualified=True))

 def test_forged_existing_canonical_source_match_fails(self):
  self.reject(m.CURATION,lambda a:a["items"][0].update(
   proposed_canonical_component_id="ORG-FED-EXE-IND-FAKE"))

 def test_wrong_foreign_or_noncohort_source_local_key_fails(self):
  self.reject(m.CURATION,lambda a:a["items"][0].update(
   source_entity_local_id="189",source_entity_key="GOVMAN-2025-12-31:189"))

 def test_duplicate_publisher_observation_fails(self):
  self.reject(m.CURATION,lambda a:a["items"][1].update(
   source_entity_local_id=a["items"][0]["source_entity_local_id"],
   source_entity_key=a["items"][0]["source_entity_key"]))

 def test_missing_member_of_15_fails(self):
  self.reject(m.CURATION,lambda a:a["items"].pop())

 def test_source_grouping_and_ordinal_cannot_be_reordered(self):
  self.reject(m.CURATION,lambda a:a["items"][0].update(
   source_tranche_position=15))

 def test_wrong_parent_of_Arts_endowment_is_denied(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="208").update(published_parent_key=None))

 def test_foundation_level_one_turned_into_top_level_denied(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="209").update(expected_publisher_tag="Entity"))

 def test_forged_Arts_publisher_child_XML_xpath_denied(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="210").update(
    source_xml_xpath="/GovernmentManual/Entity[@EntityId='210']"))

 def test_foundation_group_must_not_be_qualified_as_command_parent(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="157").update(
    signed_supervision_or_delegation_qualified=True))

 def test_foundation_child_cannot_gain_appropriations(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="208").update(
    budget_or_appropriation_power_qualified=True))

 def test_Amtrak_not_reclassified_as_ordinary_executive_agency(self):
  self.reject(m.CURATION,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="160").update(disposition=m.NORMAL))

 def test_Amtrak_legal_corporate_ownership_may_not_be_inferred(self):
  self.reject(m.DISPOSITIONS,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="160").update(
    corporate_or_federal_agency_subtype_verified=True))

 def test_board_title_does_not_certify_operational_oversight(self):
  self.reject(m.DISPOSITIONS,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="152").update(
    board_or_commission_oversight_verified=True))

 def test_prior_15D7_historical_Federal_Reserve_boundary_cannot_change(self):
  self.reject(p7.DISPOSITIONS,lambda a:next(x for x in a["items"]
   if x["source_entity_local_id"]=="147").update(
    composite_federal_reserve_system_not_board_of_governors=False),
    "INC-15D.7 source disposition rejected")

 def test_prior_15D6_Education_grouping_must_not_change(self):
  self.reject(p6.DISPOSITIONS,lambda a:next(x for x in a["items"]
   if x["publisher_local_id"]=="269").update(
    publisher_parentage_does_not_establish_legal_supervision=False),
    "INC-15D.6 reconciliation rejected")

 def test_prior_15D5_duties_must_not_change(self):
  self.reject(p5.DISPOSITIONS,lambda a:a["items"][0].update(
    statutory_authority_verified=True),"INC-15D.5 reconciliation rejected")

 def test_prior_2025_canonical_crosswalk_must_not_change(self):
  self.reject(m.govman.OUTPUTS["crosswalk"],lambda a:a["items"][0].update(
    canonical_id=None),"INC-15D.5 reconciliation rejected")

 def test_manifest_cannot_invent_canonical_legal_or_atlas_claim(self):
  self.reject(m.MANIFEST,lambda a:a["federal_institutional_breadth_15d8_extension"].update(
    new_canonical_identity_links=15,atlas_graph_admission=True))

 def test_coverage_must_not_reduce_181_unlinked_entities(self):
  self.reject(m.COVERAGE,lambda a:a.update(
    whole_edition_unlinked_source_entries=166))

 def test_false_statutory_parent_edges_must_not_be_published(self):
  self.reject(m.DISPOSITIONS,lambda a:a.update(
    qualified_statutory_parent_child_edges=3))

if __name__=="__main__":
 unittest.main()
