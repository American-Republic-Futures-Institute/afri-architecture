"""INC-15D whole-edition publisher census: source replay and negative legal/identity gates."""
import copy
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
PARSER=ROOT/"scripts/inc15d-govman-directory.py"
spec=importlib.util.spec_from_file_location("inc15d_directory",PARSER)
g=importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

def schema_subset(value, schema, label="root"):
    """Validate all JSON Schema keywords actually authored in INC-15D schemas."""
    if "const" in schema:
        assert value==schema["const"], label+" violates const"
    if "enum" in schema:
        assert value in schema["enum"], label+" violates enum"
    ty=schema.get("type")
    if ty is not None:
        ok={"null":lambda x:x is None,"string":lambda x:type(x)==str,
            "boolean":lambda x:type(x)==bool,"integer":lambda x:type(x)==int,
            "object":lambda x:type(x)==dict,"array":lambda x:type(x)==list}
        types=ty if type(ty)==list else [ty]
        assert any(ok[t](value) for t in types), label+" violates declared type"
    if "pattern" in schema:
        import re
        assert re.search(schema["pattern"],value) is not None,label+" invalid pattern"
    if "minimum" in schema:
        assert value>=schema["minimum"],label+" below minimum"
    if "maximum" in schema:
        assert value<=schema["maximum"],label+" above maximum"
    if type(value)==dict:
        required=set(schema.get("required",[]))
        assert required.issubset(value),label+" missing required"
        props=schema.get("properties",{})
        if schema.get("additionalProperties") is False:
            assert not set(value).difference(props),label+" has unapproved field"
        for key,sub in props.items():
            if key in value:schema_subset(value[key],sub,label+"."+key)
    if type(value)==list:
        if "minItems" in schema:assert len(value)>=schema["minItems"],label+" too few items"
        if "maxItems" in schema:assert len(value)<=schema["maxItems"],label+" too many items"
        if "items" in schema:
            for idx,v in enumerate(value):schema_subset(v,schema["items"],label+"["+str(idx)+"]")

class INC15D(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.derived=g.outputs(ROOT)
        cls.directory=cls.derived[g.OUTPUTS["directory"]]
        cls.crosswalk=cls.derived[g.OUTPUTS["crosswalk"]]
        cls.coverage=cls.derived[g.OUTPUTS["coverage"]]
    def temp_copy(self):
        td=tempfile.TemporaryDirectory(prefix="inc15d_negative_")
        root=Path(td.name)
        for file in [g.ORIGINAL,g.LINKS,g.X12,*g.OUTPUTS.values()]:
            origin=ROOT/file
            dest=root/file
            dest.parent.mkdir(parents=True,exist_ok=True)
            if origin.exists():shutil.copyfile(origin,dest)
        return td,root
    def test_complete_source_edition_extracted(self):
        x=self.directory
        self.assertEqual(x["publisher_entry_count"],231)
        self.assertEqual(x["top_level_publisher_entries"],105)
        self.assertEqual(x["source_tag_counts"],g.COUNTS)
        self.assertEqual(len(x["items"]),231)
        self.assertEqual(len({r["source_entity_key"] for r in x["items"]}),231)
        self.assertTrue(all(r["edition_local_only"] and r["directory_nesting_only"]
                            and r["source_original_sha256"]==g.SHA for r in x["items"]))
        self.assertEqual(x["current_first_level_institution_denominator"],None)
    def test_existing_canonical_identity_stability_without_auto_matching(self):
        x=self.crosswalk
        self.assertEqual(x["explicit_provisional_links"],50)
        self.assertEqual(x["unresolved_entries"],181)
        self.assertEqual(x["existing_canonical_ids_replaced"],0)
        self.assertEqual(len(x["items"]),231)
        by={r["source_entity_key"]:r for r in x["items"]}
        self.assertEqual(by[g.PACKAGE+":70"]["canonical_id"],"ORG-FED-LEG-CONGRESS")
        self.assertEqual(by[g.PACKAGE+":117"]["canonical_id"],"ORG-FED-EXE-DEP-HHS")
        # Federal Reserve System != automatically the specific Federal Reserve Board of Governors
        self.assertIsNone(by[g.PACKAGE+":147"]["canonical_id"])
        self.assertIsNone(by[g.PACKAGE+":189"]["canonical_id"])
        self.assertEqual(by[g.PACKAGE+":189"]["identity_reconciliation_state"],
                         "external_international_unmatched")
        self.assertTrue(all(r["legal_identity_certified"] is False and
                            r["legal_authority_inferred"] is False and
                            r["command_delegation_inferred"] is False for r in x["items"]))
    def test_xml_only_parentage_not_command(self):
        by={r["source_entity_key"]:r for r in self.directory["items"]}
        self.assertEqual(by[g.PACKAGE+":202"]["published_parent_key"],g.PACKAGE+":70")
        self.assertEqual(by[g.PACKAGE+":275"]["published_parent_key"],g.PACKAGE+":205")
        self.assertIsNone(by[g.PACKAGE+":70"]["published_parent_key"])
        self.assertTrue(all(x["mission_text_is_legal_authority"] is False and
                            x["current_organization_verified"] is False for x in by.values()))
    def test_nonadditive_category_and_department_partitions(self):
        records=self.coverage["items"]
        cats=[x for x in records if x["population_kind"]=="publisher_category"]
        deps=[x for x in records if x["population_kind"]=="publisher_department_subtree"]
        self.assertEqual((len(cats),len(deps)),(7,15))
        self.assertEqual(sum(x["publisher_entry_denominator"] for x in cats),231)
        self.assertEqual(sum(x["publisher_entry_denominator"] for x in deps),117)
        self.assertTrue(all(x["current_legal_first_level_institution_denominator"] is None and
                            x["nonadditive_against_other_publisher_editions"] is True for x in records))
    def test_closed_schemas_and_byte_replay(self):
        for key,p in g.OUTPUTS.items():
            path=ROOT/"schemas/"/("inc15d-govman-2025-"+key+".schema.json")
            data=self.derived[p]
            schema=json.loads(path.read_text())
            self.assertEqual(schema["$schema"],"https://json-schema.org/draft/2020-12/schema")
            schema_subset(data,schema,p)
        curated=json.loads((ROOT/g.LINKS).read_text())
        schema=json.loads((ROOT/"schemas/inc15d-govman-2025-curated-links.schema.json").read_text())
        schema_subset(curated,schema,"curation")
        self.assertEqual(g.run(ROOT)["publisher_entities"],231)
    def test_source_byte_mutation_rejected(self):
        td,root=self.temp_copy()
        with td:
            f=root/g.ORIGINAL
            raw=bytearray(f.read_bytes());raw[1024]^=1;f.write_bytes(raw)
            with self.assertRaisesRegex(ValueError,"source byte length, original SHA-256"):
                g.outputs(root)
    def test_fake_publisher_name_rejected(self):
        td,root=self.temp_copy()
        with td:
            f=root/g.LINKS;x=json.loads(f.read_text())
            x["items"][0]["publisher_name"]="Invented institutional title"
            f.write_text(json.dumps(x))
            with self.assertRaisesRegex(ValueError,"source publisher name changed"):
                g.outputs(root)
    def test_wrong_branch_and_duplicate_canonical_rejected(self):
        for mutator in [lambda x:x["items"][0].update(canonical_id="ORG-FED-EXE-DEP-HHS"),
                        lambda x:x["items"][1].update(canonical_id=x["items"][0]["canonical_id"])]:
            td,root=self.temp_copy()
            with td:
                f=root/g.LINKS;x=json.loads(f.read_text());mutator(x);f.write_text(json.dumps(x))
                with self.assertRaisesRegex(ValueError,"canonical link|cross-branch"):g.outputs(root)
    def test_unknown_legal_field_and_false_legal_denominator_rejected(self):
        td,root=self.temp_copy()
        with td:
            f=root/g.LINKS;x=json.loads(f.read_text())
            x["authority_certified"]=True;f.write_text(json.dumps(x))
            with self.assertRaisesRegex(ValueError,"closed fields violated"):g.outputs(root)
        td,root=self.temp_copy()
        with td:
            f=root/g.OUTPUTS["coverage"]
            x=json.loads(f.read_text());x["current_first_level_institution_denominator"]=231
            f.write_text(json.dumps(x))
            with self.assertRaisesRegex(ValueError,"generated source-derived model differs"):g.run(root)
    def test_unmapped_external_cannot_assume_federal_authority(self):
        td,root=self.temp_copy()
        with td:
            f=root/g.LINKS;x=json.loads(f.read_text())
            x["items"][0]["source_entity_local_id"]="189"
            x["items"][0]["publisher_name"]="African Development Bank"
            f.write_text(json.dumps(x))
            with self.assertRaisesRegex(ValueError,"cross-branch"):g.outputs(root)

if __name__=="__main__":
    unittest.main()
