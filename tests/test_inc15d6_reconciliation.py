"""INC-15D.6 — immutable 2025 Commerce/Education publisher observation proof."""
from __future__ import annotations
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("inc15d6",ROOT/"scripts/inc15d6-govman-reconcile.py")
reconcile=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reconcile)

INPUTS=set([
 reconcile.ORIGINAL,reconcile.govman.LINKS,reconcile.govman.X12,
 *reconcile.govman.OUTPUTS.values(),
 reconcile.prior.CURATION,reconcile.prior.DISPOSITIONS,reconcile.prior.COVERAGE,
 reconcile.CURATION,reconcile.DISPOSITIONS,reconcile.COVERAGE,
 reconcile.DEPARTMENTS,reconcile.IDENTITIES,reconcile.SEEDS,
 reconcile.GRANULES,reconcile.UNITS,reconcile.COMMERCE_SOURCE,
 reconcile.COMMERCE_SNAPSHOTS,reconcile.ED_CHART,reconcile.MANIFEST
])


def schema_subset(value,schema,label="root"):
 if "const" in schema:assert value==schema["const"],label+" const"
 if "enum" in schema:assert value in schema["enum"],label+" enum"
 if "type" in schema:
  forms=schema["type"] if isinstance(schema["type"],list) else [schema["type"]]
  types={"null":lambda x:x is None,"string":lambda x:type(x) is str,
         "integer":lambda x:type(x) is int,
         "boolean":lambda x:type(x) is bool,
         "object":lambda x:type(x) is dict,
         "array":lambda x:type(x) is list}
  assert any(types[k](value) for k in forms),label+" type"
 if type(value) is dict:
  assert set(schema.get("required",[])).issubset(value),label+" required"
  fields=schema.get("properties",{})
  if schema.get("additionalProperties") is False:
   assert set(value).issubset(fields),label+" unknown field"
  for k,v in fields.items():
   if k in value:schema_subset(value[k],v,label+"."+k)
 if type(value) is list:
  assert len(value)>=schema.get("minItems",0),label+" minimum items"
  assert len(value)<=schema.get("maxItems",len(value)),label+" maximum items"
  if "items" in schema:
   for n,row in enumerate(value):schema_subset(row,schema["items"],label+"."+str(n))


class Inc15D6(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.generated=reconcile.expected(ROOT)
  cls.dispositions=cls.generated[reconcile.DISPOSITIONS]
  cls.coverage=cls.generated[reconcile.COVERAGE]
  cls.by={x["publisher_local_id"]:x for x in cls.dispositions["items"]}

 @staticmethod
 def write(root,path,obj):
  (root/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

 def scratch(self):
  temp=tempfile.TemporaryDirectory(prefix="inc15d6_negative_")
  root=Path(temp.name)
  for name in INPUTS:
   d=root/name
   d.parent.mkdir(parents=True,exist_ok=True)
   shutil.copyfile(ROOT/name,d)
  return temp,root

 def reject(self,path,mutate,match="INC-15D.6 reconciliation rejected"):
  temp,root=self.scratch()
  with temp:
   x=reconcile.get(root,path)
   mutate(x)
   self.write(root,path,x)
   with self.assertRaisesRegex(ValueError,match):
    reconcile.run(root)

 def test_exact_15_records_and_preserved_2025_crosswalk(self):
  x=reconcile.run(ROOT)
  self.assertEqual(x["total_source_only_dispositions"],15)
  self.assertEqual(x["commerce_publisher_entries_accounted"],10)
  self.assertEqual(x["education_publisher_heading_entries_accounted"],1)
  self.assertEqual(x["education_affiliated_source_entries_accounted"],4)
  self.assertEqual(x["previous_provisional_canonical_links"],50)
  self.assertEqual(x["previous_unlinked_publisher_entries"],181)
  self.assertEqual(x["new_canonical_agencies"],0)
  self.assertEqual(x["atlas_edges_admitted"],0)
  self.assertEqual(len({p["source_entity_key"] for p in self.dispositions["items"]}),15)
  self.assertEqual((self.coverage["whole_edition_publisher_entries"],
                    self.coverage["previous_unlinked_181_entries_reclassified_as_canonical"],
                    self.coverage["previous_28_INC15D5_curation_records_modified"]),(231,0,0))

 def test_commerce_2025_has_ten_dated_first_level_records(self):
  cs=[x for x in self.dispositions["items"] if
      x["canonical_department_anchor_id"]==reconcile.COMMERCE]
  self.assertEqual([x["publisher_local_id"] for x in cs],list(reconcile.COMMERCE_IDS))
  for x in cs:
   self.assertEqual(x["published_parent_key"],reconcile.COMMERCE_ROOT)
   self.assertEqual(x["publisher_hierarchy_level"],1)
   self.assertEqual(x["publisher_element_tag"],"SubEntityLevelOne")
   self.assertEqual(x["disposition"],reconcile.DISPOSITIONS_ALLOWED["commerce"])
   self.assertIsNone(x["canonical_component_id"])

 def test_education_grouping_one_header_four_second_level_affiliates(self):
  heading=self.by["269"]
  self.assertEqual(heading["published_name"],"Federally Aided Corporations")
  self.assertEqual(heading["published_parent_key"],reconcile.EDUCATION_ROOT)
  self.assertEqual(heading["publisher_element_tag"],"SubEntityLevelOne")
  self.assertEqual(heading["disposition"],reconcile.DISPOSITIONS_ALLOWED["header"])
  for local in reconcile.ED_AFFILIATES:
   x=self.by[local]
   self.assertEqual(x["published_parent_key"],reconcile.EDUCATION_HEADING)
   self.assertEqual(x["publisher_hierarchy_level"],2)
   self.assertEqual(x["publisher_element_tag"],"SubEntityLevelTwo")
   self.assertEqual(x["disposition"],reconcile.DISPOSITIONS_ALLOWED["affiliate"])
   self.assertIsNone(x["canonical_component_id"])
   self.assertIs(x["affiliated_entries_not_certified_as_US_federal_agencies"],True)
   self.assertIs(x["publisher_parentage_does_not_establish_legal_supervision"],True)
  self.assertIn("Rochester Institute of Technology",self.by["274"]["published_name"])
  self.assertIs(self.by["274"]["publisher_combined_label_not_split_to_federal_agencies"],True)

 def test_the_two_snapshot_epochs_cannot_be_merged_into_ED_chart(self):
  self.assertEqual(self.coverage["commerce_observations"],10)
  self.assertEqual(self.coverage["education_publisher_heading_observations"],1)
  self.assertEqual(self.coverage["education_publisher_affiliate_observations"],4)
  ed=reconcile.get(ROOT,reconcile.ED_CHART)
  self.assertEqual(ed["official_report_fiscal_year"],"FY2024")
  self.assertEqual(len(ed["items"]),19)
  self.assertFalse(ed["foreign_quasi_official_govman_entities_promoted_to_ED_offices"])
  self.assertTrue(all(x["original_source_govman_entity_id"] is None for x in ed["items"]))

 def test_two_prior_seeds_two_previous_granules_eight_distinct_web_observations(self):
  rows=self.dispositions["items"]
  self.assertEqual({x["publisher_local_id"] for x in rows if x["prior_seed_id"]},
                   {"264","266"})
  self.assertEqual({x["publisher_local_id"] for x in rows if x["prior_govinfo_research_granule_id"]},
                   {"264","266"})
  self.assertEqual({x["publisher_local_id"] for x in rows if x["prior_exact_2026_commerce_source_unit_id"]},
                   {"259","260","262","263","264","265","266","267"})
  self.assertEqual(self.by["268"]["unqualified_name_variant_candidate"],
                   "DEPT04-UNIT-COMMERCE-USPTO")
  self.assertIsNone(self.by["268"]["prior_exact_2026_commerce_source_unit_id"])
  self.assertTrue(all(x["prior_2026_commerce_source_original_bytes_retained"] is False for x in rows))
  self.assertFalse(self.coverage["earlier_2026_commerce_web_source_original_retained"])

 def test_every_record_limits_currentness_legal_powers_and_publication(self):
  for x in self.dispositions["items"]:
   self.assertEqual(x["source_original_sha256"],reconcile.SHA)
   self.assertEqual(x["source_original_git_blob_sha1"],reconcile.BLOB)
   self.assertIn("[@EntityId='"+x["publisher_local_id"]+"']",x["publisher_original_xpath"])
   self.assertIsNone(x["canonical_component_id"])
   for f in ("2026_current_legal_organization_verified","specific_legal_identity_certified",
             "statutory_delegation_certified","budget_or_fiscal_control_certified",
             "command_relationship_verified","independent_legal_review_complete",
             "adl1_certified","atlas_graph_admitted","plan_or_observatory_inference_created"):
    self.assertIs(x[f],False,x["id"]+"."+f)

 def test_closed_edition_schemas_enforce_nonpromotion(self):
  for kind,path in (("curation",reconcile.CURATION),
                    ("dispositions",reconcile.DISPOSITIONS),
                    ("coverage",reconcile.COVERAGE)):
   schema=json.loads((ROOT/("schemas/inc15d6-govman-2025-"+kind+".schema.json")).read_text())
   self.assertEqual(schema["$schema"],"https://json-schema.org/draft/2020-12/schema")
   self.assertIs(schema["additionalProperties"],False)
   schema_subset(reconcile.get(ROOT,path),schema,path)
   if kind=="dispositions":
    row=schema["properties"]["items"]["items"]
    self.assertIs(row["additionalProperties"],False)
    self.assertEqual(row["properties"]["atlas_graph_admitted"]["const"],False)
    self.assertEqual(row["properties"]["specific_legal_identity_certified"]["const"],False)
    self.assertEqual(row["properties"]["statutory_delegation_certified"]["const"],False)
    self.assertEqual(row["properties"]["budget_or_fiscal_control_certified"]["const"],False)
   elif kind=="coverage":
    self.assertEqual(schema["properties"]["canonical_component_identities_minted"]["const"],0)

 def test_original_publisher_XML_bitflip_rejected(self):
  temp,root=self.scratch()
  with temp:
   p=root/reconcile.ORIGINAL
   b=bytearray(p.read_bytes());b[1024]^=1;p.write_bytes(b)
   with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
    reconcile.run(root)

 def test_wrong_release_sha_is_rejected(self):
  self.reject(reconcile.CURATION,lambda x:x.update(original_source_sha256="0"*64),
              "curation source edition")

 def test_fake_federal_institution_disposition_for_howard_is_rejected(self):
  self.reject(reconcile.CURATION,lambda x:next(v for v in x["items"] if
     v["source_entity_local_id"]=="272").update(
      disposition=reconcile.DISPOSITIONS_ALLOWED["commerce"]), "source alias, classification")

 def test_official_publisher_heading_may_not_become_agency(self):
  self.reject(reconcile.CURATION,lambda x:next(v for v in x["items"] if
     v["source_entity_local_id"]=="269").update(
      disposition="existing_canonical_id_match"),"unknown publisher disposition")

 def test_unreconciled_department_abbreviation_cannot_be_exact_join(self):
  self.reject(reconcile.CURATION,lambda x:next(v for v in x["items"] if
      v["source_entity_local_id"]=="268").update(
       previous_exact_commerce_unit_id="DEPT04-UNIT-COMMERCE-USPTO"),
       "source alias, classification")

 def test_duplicate_source_local_id_rejected(self):
  self.reject(reconcile.CURATION,lambda x:x["items"][1].update(
      source_entity_local_id=x["items"][0]["source_entity_local_id"]),
      "duplicate 2025 publisher entry")

 def test_cross_branch_or_wrong_department_root_rejected(self):
  self.reject(reconcile.CURATION,lambda x:x["items"][1].update(
      canonical_department_anchor_id=reconcile.EDUCATION),
      "source alias, classification")

 def test_fake_nested_education_publisher_parent_rejected(self):
  self.reject(reconcile.CURATION,lambda x:next(v for v in x["items"] if
      v["source_entity_local_id"]=="271").update(
       published_parent_key=reconcile.EDUCATION_ROOT), "source alias, classification")

 def test_foreign_or_international_local_id_rejected(self):
  self.reject(reconcile.CURATION,lambda x:x["items"][0].update(
      source_entity_local_id="189"),"15 publisher keys not accounted")

 def test_manual_curation_cannot_sneak_in_new_canonical_agency_id(self):
  self.reject(reconcile.CURATION,lambda x:x["items"][0].update(
      new_canonical_agency_id="ORG-FED-EXE-DEP-COMMERCE-FAKE"),
      "closed fields")

 def test_affiliated_composite_label_cannot_be_split_into_agencies(self):
  self.reject(reconcile.CURATION,lambda x:next(v for v in x["items"] if
      v["source_entity_local_id"]=="274").update(
       publisher_label_is_combined_organizational_reference=False),
       "source alias, classification")

 def test_old_mutable_Commerce_source_original_cannot_be_faked(self):
  self.reject(reconcile.COMMERCE_SOURCE,lambda x:next(v for v in x["items"] if
      v["id"]=="DEPT04-SRC-COMMERCE-BUREAUS-2026").update(
       raw_source_bytes_archived=True), "Commerce 2026 mutable observed")

 def test_old_Commerce_delegated_command_cannot_be_faked(self):
  self.reject(reconcile.UNITS,lambda x:next(v for v in x["items"] if
      v["id"]=="DEPT04-UNIT-COMMERCE-NIST").update(
       direct_operational_command_verified=True), "Commerce 2026 website model")

 def test_education_FY2024_chart_cannot_gain_link_to_affiliated_university(self):
  self.reject(reconcile.ED_CHART,lambda x:x["items"][0].update(
      original_source_govman_entity_id="GOVMAN-2025-12-31:272"),
      "education chart falsely linked")

 def test_past_28_item_DISP_baseline_cannot_change(self):
  self.reject(reconcile.prior.DISPOSITIONS,lambda x:x["items"][0].update(
      legal_identity_certified=True),"INC-15D.5 reconciliation rejected")

 def test_preexisting_fifty_canonical_links_cannot_change(self):
  self.reject(reconcile.govman.OUTPUTS["crosswalk"],lambda x:x["items"][0].update(
      canonical_id=None),"INC-15D.5 reconciliation rejected")

 def test_fake_legal_authority_in_generated_disposition_cannot_be_published(self):
  self.reject(reconcile.DISPOSITIONS,lambda x:x["items"][0].update(
      command_relationship_verified=True),"derived source/custody")

 def test_false_ADL_one_and_fiscal_control_denied(self):
  self.reject(reconcile.DISPOSITIONS,lambda x:x["items"][0].update(
      adl1_certified=True,budget_or_fiscal_control_certified=True),
      "derived source/custody")

 def test_manifest_cannot_claim_ten_canonical_agencies(self):
  self.reject(reconcile.MANIFEST,lambda x:x["federal_institutional_breadth_15d6_extension"].update(
      new_canonical_component_ids=10),"manifest scope, custody")

 def test_false_legal_denominator_and_atlas_publication_denied(self):
  self.reject(reconcile.COVERAGE,lambda x:x.update(
      current_first_level_institution_denominator=15,new_atlas_relationships=15),
      "derived source/custody")

if __name__=="__main__":
 unittest.main()
