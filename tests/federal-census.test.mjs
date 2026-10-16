import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {CENSUS_MODEL_PATHS,validateFederalCensus,projectFederalCensus} from "../scripts/federal-census-validation-core.mjs";
import {inspectFederalCensusSchema} from "../scripts/federal-census-schema-validator.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fixture=()=>({manifest:read("model/federal/manifest.json"),
 files:Object.fromEntries(CENSUS_MODEL_PATHS.map(p=>[p,read(p)]))});
const original=fixture(),verified=validateFederalCensus(original.manifest,original.files);
const find=(f,p,id)=>{const x=f.files[p].items.find(x=>x.id===id);assert(x,"missing test fixture "+id);return x;};
const reject=(name,mutation,expected)=>test(name,()=>{
 const f=structuredClone(original);mutation(f);
 assert.throws(()=>validateFederalCensus(f.manifest,f.files),new RegExp(expected));
});
test("eight published model families satisfy strict bounded JSON Schema",()=>{
 const schema=read("schemas/federal-census.schema.json");
 const report=inspectFederalCensusSchema(schema,original.files);
 assert.deepEqual(report.errors,[]);
 assert.equal(report.model_families,8);
 const tampered=structuredClone(original.files);
 tampered["model/federal/coverage/components.json"].items[0].unknown_runtime_authority=true;
 assert(inspectFederalCensusSchema(schema,tampered).errors.some(x=>x.includes("additional property forbidden")));
 const falseGrant=structuredClone(original.files);
 falseGrant["model/federal/coverage/components.json"].items[0].delegation_verified=true;
 assert(inspectFederalCensusSchema(schema,falseGrant).errors.some(x=>x.includes("constant changed")));
 const badVersion=structuredClone(schema);
 delete badVersion.$defs.components.properties.id.pattern;
 assert(inspectFederalCensusSchema(badVersion,original.files).errors.some(x=>x.includes("missing strict item schema")));
});
test("canonical federal census has 61 references, 15 departments, no certified ADL or government-wide denominator",()=>{
 assert.equal(verified.counts.canonical_institutions,61);
 assert.equal(verified.counts.cabinet_departments,15);
 assert.equal(verified.counts.institution_classes,13);
 assert.equal(verified.counts.authorized_department_census,0);
 assert.equal(verified.canonical.size,61);
 assert.equal(verified.denominator_status,"not_established");
});
test("every ARFI institution preserves canonical provenance and has no invented external source identifier",()=>{
 const references=original.files["model/federal/coverage/institution-references.json"].items;
 assert.equal(references.length,61);
 for(const ref of references){
  const originalInstitution=verified.canonical.get(ref.institution_id);
  assert(originalInstitution);
  assert.deepEqual([...ref.source_ids].sort(),[...originalInstitution.source_ids].sort());
  assert.equal(ref.adl_evidenced,0);
  assert.equal(ref.official_external_identifier,null);
  assert.equal(ref.last_verified_at,null);
 }
});
test("nondepartment federal bodies preserve unresolved statutory legal class",()=>{
 const refs=original.files["model/federal/coverage/institution-references.json"].items;
 const independent=refs.filter(x=>x.canonical_model_path.endsWith("/executive-independent.json"));
 assert.equal(independent.length,18);
 for(const ref of independent){
  assert.equal(ref.census_class_id,"CENSUS-TYPE-EXECUTIVE-NON-DEPARTMENT-CANDIDATE");
  assert.equal(ref.legal_classification_status,"subtype_pending_specific_statute_review");
 }
});
test("DoD, DHS and Education have separate bounded component source slices",()=>{
 assert.deepEqual([verified.counts.pilot_defense,verified.counts.pilot_dhs,verified.counts.pilot_education],[9,10,10]);
 assert.equal(verified.counts.pilot_department_components,29);
 const army=verified.components.get("CENSUS-COMP-DEF-ARMY");
 assert.equal(army.kind,"military_department");
 assert.match(army.evidence_locator,/111\(b\)\(6\)/);
 const group=verified.components.get("CENSUS-COMP-DEF-COMBATANT-COMMANDS");
 assert.equal(group.kind,"component_class");
 assert.equal(group.legal_authority_status,"not_mapped");
 const ig=verified.components.get("CENSUS-COMP-DHS-OIG");
 assert.equal(ig.organizational_relation,"independent_oversight_placement_not_command");
 assert.equal(ig.delegation_verified,false);
});
test("dated Government Manual, older DHS org chart, and mutable Education directory are distinct source versions",()=>{
 const s=verified.snapshots;
 assert(s.some(x=>x.id==="CENSUS-SNAPSHOT-GOVMAN-2025-12-31"&&x.edition_date==="2025-12-31"));
 assert(s.some(x=>x.id==="CENSUS-SNAPSHOT-DHS-CHART-2025"&&x.edition_date==="2025-01-17"));
 assert(s.some(x=>x.snapshot_kind==="mutable_web_directory"&&x.immutable_url===null));
 assert(s.every(x=>x.denominator_status!=="complete"));
});
test("department-specific declarative views isolate exactly their parent and component candidates",()=>{
 for(const [name,count]of [["DEFENSE",9],["DHS",10],["EDUCATION",10]]){
  const view=projectFederalCensus(verified,"VIEW-CENSUS-"+name+"-COMPONENTS");
  assert.equal(view.elements.length,count+1);
  assert.equal(view.relationships.length,count);
  assert(view.elements.some(x=>x.id==="ORG-FED-EXE-DEP-"+name));
  assert(view.relationships.every(x=>x.delegated_statutory_power_proven===false));
  assert(view.elements.every(x=>x.legal_authority_verified===false));
 }
});
test("baseline federal census view is a subset of canonical entities, not fabricated subordinate roster",()=>{
 const v=projectFederalCensus(verified,"VIEW-CENSUS-BASELINE");
 assert.equal(v.elements.length,61);
 assert.equal(v.relationships.length,0);
 assert(v.elements.every(x=>!x.id.startsWith("CENSUS-COMP-")));
});
test("each incomplete pilot and unexplored government branch retains an explicit open gap",()=>{
 const ids=verified.gaps.map(x=>x.id);
 for(const n of ["DEFENSE","DHS","EDUCATION"])
  assert(ids.includes("CENSUS-GAP-"+n+"-FULL-STRUCTURE"));
 assert.equal(verified.counts.explicit_gaps,9);
 assert(verified.gaps.every(x=>x.denominator==="unknown"&&x.review_status==="open_research_gap"));
});
test("unknown requested viewpoint fails closed",()=>{
 assert.throws(()=>projectFederalCensus(verified,"VIEW-CENSUS-NOT-MODELLED"),/unknown unapproved/);
});
reject("dropping a Cabinet office requires reconciliation of official census",f=>{
 f.files["model/federal/executive-departments.json"].items.pop();
},"baseline model count");
reject("duplicate ARFI canonical reference is invalid",f=>{
 f.files["model/federal/coverage/institution-references.json"].items[0].institution_id=
 f.files["model/federal/coverage/institution-references.json"].items[1].institution_id;
},"census does not cover");
reject("federal branch swapping an agency into judiciary is rejected",f=>{
 find(f,"model/federal/coverage/institution-references.json","CENSUS-REF-ORG-FED-EXE-DEP-DEFENSE").branch_id="BR-FED-JUD";
},"cross-branch");
reject("inventing official external identifiers without a primary source is rejected",f=>{
 find(f,"model/federal/coverage/institution-references.json","CENSUS-REF-ORG-FED-EXE-DEP-DHS").official_external_identifier="OMB-FOO";
},"unsupported ADL");
reject("claiming full operational ADL 4 without evidence is rejected",f=>{
 find(f,"model/federal/coverage/institution-references.json","CENSUS-REF-ORG-FED-EXE-DEP-EDUCATION").adl_evidenced=4;
},"unsupported ADL");
reject("falsely marking an official edition a complete denominator is rejected",f=>{
 find(f,"model/federal/coverage/source-snapshots.json","CENSUS-SNAPSHOT-GOVMAN-2025-12-31").denominator_status="complete";
},"exaggerated source edition");
reject("DoD Joint Staff without official composition source cannot be published",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-DEF-JOINT-STAFF").source_ids=[];
},"without primary");
reject("creating unsourced Department Education office cannot pass",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-ED-OESE").source_ids=["CENSUS-SRC-FORGED"];
},"without primary");
reject("inventing executive operational chain from organizational relationship is rejected",f=>{
 find(f,"model/federal/coverage/relationships.json","CENSUS-REL-0001").operational_command_proven=true;
},"fabricated command");
reject("statutory group label cannot become an enumerated individual agency",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-DEF-DEFENSE-AGENCIES").name="Defense Agencies";
},"department-level collection");
reject("DHS Inspector General cannot become a normal command subordinate",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-DHS-OIG").organizational_relation="agency_directory_or_chart_membership";
},"inspector general");
reject("forged host is prohibited even when it imitates a federal URL",f=>{
 find(f,"model/federal/coverage/source-registry.json","CENSUS-SRC-DHS-111").url="https://uscode.house.gov.evil.test/source";
},"unsourced, undated");
reject("mutable agency website cannot be represented as immutable archival evidence",f=>{
 find(f,"model/federal/coverage/source-snapshots.json","CENSUS-SNAPSHOT-ED-DIRECTORY-2026-10-16").immutable_url="https://www.ed.gov/about/ed-offices";
},"mutable directory");
reject("a pilot cannot assert verified appropriations",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-DHS-FEMA").appropriation_verified=true;
},"incorrectly asserts lawful powers");
reject("a pilot cannot attach itself to an invented federal department",f=>{
 find(f,"model/federal/coverage/components.json","CENSUS-COMP-DHS-CISA").parent_institution_id="ORG-FED-EXE-DEP-BOGUS";
},"unknown or wrong-parent");
reject("declaring deployed UI on an architecture-only registry is prohibited",f=>{
 f.manifest.federal_institutional_census_extension.website_integration_status="deployed";
},"projection must not claim");
reject("duplicate source relationships for one component are invalid",f=>{
 find(f,"model/federal/coverage/relationships.json","CENSUS-REL-0001").from_id="CENSUS-COMP-DEF-JCS";
},"invalid relationship|duplicate component");
reject("dropping component rows cannot be hidden by changing manifest numbers",f=>{
 f.files["model/federal/coverage/components.json"].items.pop();
 f.manifest.federal_institutional_census_extension.pilot_component_candidate_count--;
},"pilot component registry");
reject("each new census collection must be registered in the canonical manifest",f=>{
 f.manifest.models=f.manifest.models.filter(x=>x!=="model/federal/coverage/components.json");
},"unregistered collection");
