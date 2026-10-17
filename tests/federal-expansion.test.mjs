import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EXPANSION_MODEL_PATHS,EXPANSION_CONTEXT_PATHS,
 validateFederalExpansion,inspectExpansionSchema,projectFederalExpansion
} from "../scripts/federal-expansion-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fixture=()=>({manifest:read("model/federal/manifest.json"),
 schema:read("schemas/federal-expansion.schema.json"),
 files:Object.fromEntries([...EXPANSION_MODEL_PATHS,...EXPANSION_CONTEXT_PATHS].map(p=>[p,read(p)]))});
const initial=fixture(),model=validateFederalExpansion(initial.manifest,initial.files,initial.schema);
const file=n=>"model/federal/expansion/"+n+".json";
const find=(f,n,id)=>{
 const x=f.files[file(n)].items.find(x=>x.id===id);
 assert(x,"fixture missing "+id);return x;
};
const reject=(description,mutator,why)=>test(description,()=>{
 const f=structuredClone(initial);mutator(f);
 assert.throws(()=>validateFederalExpansion(f.manifest,f.files,f.schema),new RegExp(why));
});
test("nine strict JSON Schema 2020-12 record families validate without permissive unknown fields",()=>{
 const report=inspectExpansionSchema(initial.schema,initial.files);
 assert.equal(report.model_families,9);
 assert.deepEqual(report.errors,[]);
 const tampered=structuredClone(initial.files);
 tampered[file("roster")].items[0].government_power_certified=true;
 assert(inspectExpansionSchema(initial.schema,tampered).errors.some(x=>x.includes("additional property forbidden")));
 const wrongFamily=structuredClone(initial.files);
 wrongFamily[file("roster")].model_family="sources";
 assert(inspectExpansionSchema(initial.schema,wrongFamily).errors.some(x=>x.includes("missing collection")));
 const brokenDispatch=structuredClone(initial.schema);
 delete brokenDispatch.oneOf;
 assert(inspectExpansionSchema(brokenDispatch,initial.files).errors.some(x=>x.includes("family dispatch")));
 const bool=structuredClone(initial.files);
 bool[file("department-seeds")].items[0].direct_supervision_verified=true;
 assert(inspectExpansionSchema(initial.schema,bool).errors.some(x=>x.includes("schema property mismatch")));
});
test("all sixty-one original canonical references remain unchanged; exactly fifty-eight non-pilots are indexed",()=>{
 assert.equal(model.counts.canonical_source_refs,61);
 assert.equal(model.counts.covered_scoped_refs,58);
 assert.equal(model.counts.excluded_pilot_departments,3);
 const pilotIds=new Set(["ORG-FED-EXE-DEP-DEFENSE","ORG-FED-EXE-DEP-DHS","ORG-FED-EXE-DEP-EDUCATION"]);
 assert(model.records.roster.every(x=>!pilotIds.has(x.canonical_institution_id)));
 assert.equal(new Set(model.records.roster.map(x=>x.canonical_institution_id)).size,58);
});
test("five bounded reference denominators sum to fifty-eight without a fictitious federal denominator",()=>{
 assert.deepEqual(model.totals,{departments:12,eop:10,independent:18,legislative:9,judiciary:9});
 for(const entry of model.records["coverage-ledger"]){
  assert.equal(entry.percentage_of_total_federal_government,null);
  assert.equal(entry.individual_first_level_official_denominator,null);
  assert.equal(entry.whole_institution_adl1_certified_count,0);
  assert.equal(entry.complete_current_roster_claim,false);
 }
 assert.equal(model.counts.adls_one_certified,0);
});
test("5 USC 101 provides exactly fifteen department identities; three remain independently modeled pilots",()=>{
 const ds=model.records.roster.filter(x=>x.family==="departments");
 assert.equal(ds.length,12);
 for(const x of ds){
  assert(x.source_ids.includes("EXP-SRC-5-USC-101"));
  assert.equal(x.source_snapshot_id,"EXP-SNAP-5-USC-101");
  assert.equal(x.source_match_status,"section_level_statutory_department_identity_15_of_15");
 }
});
test("all remaining twelve Cabinet departments have two explicitly provisional Government Manual research candidates",()=>{
 const x=model.records["department-seeds"];
 assert.equal(x.length,24);
 assert.equal(new Set(x.map(i=>i.parent_department_id)).size,12);
 assert(x.every(i=>i.source_snapshot_id==="EXP-SNAP-GOVMAN-2025"));
 assert(x.every(i=>i.original_edition_item_locator_reconciled===false));
 assert(x.every(i=>i.current_2026_presence_verified===false&&i.delegation_verified===false));
 assert.equal(x.find(i=>i.id==="EXP-SEED-ENERGY-FERC").legal_subtype_status,"special_independent_regulation_needs_statutory_review");
});
test("four chamber committee seeds distinguish House manual from mutable Senate committee list",()=>{
 const x=model.records["crossbranch-seeds"].filter(i=>i.branch_id==="BR-FED-LEG");
 assert.equal(x.length,4);
 assert.equal(x.filter(i=>i.parent_id==="ORG-FED-LEG-HOUSE").length,2);
 assert.equal(x.filter(i=>i.parent_id==="ORG-FED-LEG-SENATE").length,2);
 assert(x.every(i=>i.committee_rule_and_subcommittee_jurisdiction_verified===false));
});
test("thirteen appellate court identity candidates cannot imply actual appeal jurisdiction or command",()=>{
 const x=model.records["crossbranch-seeds"].filter(i=>i.branch_id==="BR-FED-JUD");
 assert.equal(x.length,13);
 assert.equal(new Set(x.map(i=>i.name)).size,13);
 assert(x.every(i=>i.parent_id==="ORG-FED-JUD-APPEALS"));
 assert(x.every(i=>i.individual_legal_creation_and_jurisdiction_verified===false));
});
test("executive nondepartment bodies remain legally unclassified instead of presumed equally independent",()=>{
 const xs=model.records.roster.filter(x=>x.family==="independent");
 assert.equal(xs.length,18);
 assert(xs.every(x=>x.legal_subtype_verified===false&&
  x.source_match_status==="dated_handbook_category_only_individual_class_unreviewed"));
});
test("seven historical EOP component references do not silently become a contemporary verified EOP roster",()=>{
 const xs=model.records.roster.filter(x=>x.family==="eop");
 assert.equal(xs.length,10);
 assert.equal(xs.filter(x=>x.canonical_parent_id==="ORG-FED-EXE-EOP").length,7);
 assert(xs.every(x=>x.current_parentage_verified===false));
});
test("99 descriptive relationships have grounded endpoints and no inferred agency powers",()=>{
 assert.equal(model.edges.length,99);
 assert(model.edges.every(x=>x.operational_command_proven===false&&
  x.delegated_power_proven===false&&x.appropriation_verified===false&&
  x.current_direct_supervision_verified===false&&x.legal_subtype_resolved===false));
});
test("whole reference atlas projects 58 canonical references and 41 bounded seeds plus three branches",()=>{
 const v=projectFederalExpansion(model,"VIEW-EXP-ALL");
 assert.equal(v.nodes.length,102);
 assert.equal(v.relationships.length,99);
 assert.equal(v.nodes.filter(x=>x.kind==="constitutional_branch").length,3);
 assert.equal(v.render_status,"data_contract_only_not_website_rendered");
 assert(v.relationships.every(e=>v.nodes.some(n=>n.id===e.from_id)&&v.nodes.some(n=>n.id===e.to_id)));
});
test("department root filter includes only the chosen Cabinet department and its two candidates",()=>{
 const v=projectFederalExpansion(model,"VIEW-EXP-DEPARTMENTS","ORG-FED-EXE-DEP-TREASURY");
 assert.equal(v.nodes.length,4);
 assert.equal(v.relationships.length,3);
 assert(v.nodes.some(x=>x.id==="EXP-SEED-TREASURY-IRS"));
 assert(!v.nodes.some(x=>x.id==="EXP-SEED-LABOR-BLS"));
});
test("separate declarative EOP / independent / Congress / courts views stay bounded to their branch",()=>{
 for(const [id,count] of [["VIEW-EXP-EOP",11],["VIEW-EXP-INDEPENDENT",19],
  ["VIEW-EXP-CONGRESS",14],["VIEW-EXP-JUDICIARY",23]]){
  const v=projectFederalExpansion(model,id);
  assert.equal(v.nodes.length,count);
  assert(v.relationships.every(x=>x.operational_command_proven===false));
 }
});
test("all seventeen unresolved gaps remain open and indexed to a modeled branch or department",()=>{
 assert.equal(model.records.gaps.length,17);
 assert(model.records.gaps.every(x=>x.unknown_denominator&&x.adl1_complete===false));
});
reject("collection discriminator must never mislabel a roster as a source list",f=>{
 f.files[file("roster")].model_family="sources";
},"schema invalid");
reject("untrusted but official-host alternate U.S. Code section is source-ID spoofing",f=>{
 find(f,"sources","EXP-SRC-5-USC-101").url="https://uscode.house.gov/us/usc/119-118/t5/s102/";
},"source identity");
reject("untrusted official-host alternate GovInfo edition is source substitution",f=>{
 find(f,"sources","EXP-SRC-GOVMAN-2024-EOP").url="https://www.govinfo.gov/app/details/GOVMAN-2024-12-31/GOVMAN-2024-12-31-099";
},"source identity");
reject("untrusted source-domain injection is prohibited",f=>{
 find(f,"sources","EXP-SRC-SENATE-119").url="https://senate.gov.attacker.example/committees/index.htm";
},"strict schema invalid");
reject("unit names cannot silently change without editing the versioned 2025 candidate contract",f=>{
 find(f,"department-seeds","EXP-SEED-COMMERCE-NIST").name="Secret Federal Committee";
},"immutable candidate identity");
reject("appellate court names cannot be spoofed inside the court category",f=>{
 find(f,"crossbranch-seeds","EXP-SEED-DC").name="Court of Appeals for Arctic Territories";
},"immutable candidate identity");
reject("historical EOP edition cannot be redated as an October 2026 structure",f=>{
 find(f,"snapshots","EXP-SNAP-GOVMAN-2024-EOP").as_of="2026-10-16";
},"source-edition identity");
reject("mutable Senate committee webpage cannot claim immutable archived publication",f=>{
 find(f,"snapshots","EXP-SNAP-SENATE-119").is_fixed_publication=true;
},"source-edition identity");
reject("creating an invented external agency ID without source semantics fails closed",f=>{
 find(f,"roster","EXP-REF-ORG-FED-EXE-IND-FED").external_official_identifier="0001";
},"strict schema invalid");
reject("Cabinet reference cannot be transferred to judiciary",f=>{
 find(f,"roster","EXP-REF-ORG-FED-EXE-DEP-STATE").branch_id="BR-FED-JUD";
},"canonical identity remapping");
reject("agency cannot be recategorized as a Cabinet department by a model-only edit",f=>{
 find(f,"roster","EXP-REF-ORG-FED-EXE-IND-SEC").family="departments";
},"canonical identity remapping");
reject("fictitious first-level completeness for an agency is rejected",f=>{
 find(f,"roster","EXP-REF-ORG-FED-EXE-IND-NASA").adl1_completed=true;
},"strict schema invalid");
reject("direct supervisory power cannot be inferred from a department directory",f=>{
 find(f,"department-seeds","EXP-SEED-HHS-CMS").direct_supervision_verified=true;
},"strict schema invalid");
reject("a preliminary FERC office must not be legally reclassified as a general department office",f=>{
 find(f,"department-seeds","EXP-SEED-ENERGY-FERC").legal_subtype_status="fully_verified_under_secdef";
},"immutable candidate identity");
reject("a committee must not be assigned to the judicial branch",f=>{
 find(f,"crossbranch-seeds","EXP-SEED-HOUSE-ARMED").branch_id="BR-FED-JUD";
},"candidate branch mismatch");
reject("courts may not be assigned a specific unverified statutory jurisdiction",f=>{
 find(f,"crossbranch-seeds","EXP-SEED-FIRST").individual_legal_creation_and_jurisdiction_verified=true;
},"strict schema invalid");
reject("duplicate canonical pointers are invalid",f=>{
 f.files[file("roster")].items[1].canonical_institution_id=f.files[file("roster")].items[0].canonical_institution_id;
},"selected 58 references");
reject("dropping an originally listed independent establishment falsely changes denominator",f=>{
 f.files[file("roster")].items.pop();
},"selected 58 references");
reject("source slices may never claim full federal denominators",f=>{
 find(f,"snapshots","EXP-SNAP-GOVMAN-2025").complete_federal_denominator=true;
},"strict schema invalid");
reject("historical EOP edition cannot be promoted to an exhaustive 2026 roster",f=>{
 find(f,"snapshots","EXP-SNAP-GOVMAN-2024-EOP").complete_first_level_roster=true;
},"strict schema invalid");
reject("wrong department under an otherwise official organization label is rejected",f=>{
 find(f,"department-seeds","EXP-SEED-COMMERCE-NIST").parent_department_id="ORG-FED-EXE-DEP-DHS";
},"invented official department structure");
reject("fiscal appropriations cannot be inferred from a source directory",f=>{
 find(f,"relationships","EXP-REL-0001").appropriation_verified=true;
},"strict schema invalid");
reject("duplicate descriptive edges to a single component fail closed",f=>{
 find(f,"relationships","EXP-REL-0002").from_id=find(f,"relationships","EXP-REL-0001").from_id;
},"multiple inconsistent hierarchy");
reject("a fabricated 100 percent federal completeness indicator is rejected",f=>{
 find(f,"coverage-ledger","EXP-LEDGER-DEPARTMENTS").percentage_of_total_federal_government=100;
},"strict schema invalid");
reject("a missing first-level department research gap blocks publication",f=>{
 f.files[file("gaps")].items=f.files[file("gaps")].items.filter(x=>x.id!=="EXP-GAP-STATE-FULL-LEVEL-ONE");
},"open research gap");
reject("a read-only viewpoint cannot claim deployed public authority",f=>{
 find(f,"viewpoints","VIEW-EXP-JUDICIARY").website_rendered=true;
},"strict schema invalid");
reject("manifest cannot claim an exhaustive institution graph without research",f=>{
 f.manifest.federal_coverage_expansion_extension.full_federal_census_denominator_known=true;
},"scope, ADL status");
test("undeclared view and nondepartment root filters fail without changing the source graph",()=>{
 assert.throws(()=>projectFederalExpansion(model,"VIEW-EXP-ALL-CURRENT"),/unknown unapproved/);
 assert.throws(()=>projectFederalExpansion(model,"VIEW-EXP-DEPARTMENTS","ORG-FED-EXE-DEP-DEFENSE"),/root filter/);
 assert.throws(()=>projectFederalExpansion(model,"VIEW-EXP-JUDICIARY","ORG-FED-JUD-APPEALS"),/root filter/);
});
