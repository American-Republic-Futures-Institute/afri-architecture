import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DEPT04_MODEL_PATHS,DEPT04_CONTEXT_PATHS,validateDepartmentStructure,
 inspectDepartmentSchema,projectDepartmentStructure} from "../scripts/federal-department-structure-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const initial={manifest:read("model/federal/manifest.json"),
 schema:read("schemas/federal-department-structure.schema.json"),
 files:Object.fromEntries([...DEPT04_MODEL_PATHS,...DEPT04_CONTEXT_PATHS].map(p=>[p,read(p)]))};
const validated=validateDepartmentStructure(initial.manifest,initial.files,initial.schema);
const file=name=>"model/federal/department-structure/"+name+".json";
const find=(f,family,id)=>{
 const r=f.files[file(family)].items.find(x=>x.id===id);
 assert(r,"Missing fixture "+family+"/"+id);return r;
};
const negative=(description,change,reason=/Department structure rejected/)=>test(description,()=>{
 const f=structuredClone(initial);change(f);
 assert.throws(()=>validateDepartmentStructure(f.manifest,f.files,f.schema),reason);
});
test("nine external JSON Schema draft 2020-12 collection definitions reject unknown fields and wrong family selectors",()=>{
 const report=inspectDepartmentSchema(initial.schema,initial.files);
 assert.deepEqual(report.errors,[]);
 assert.equal(report.families,9);
 const f=structuredClone(initial.files);
 find({files:f},"units","DEPT04-UNIT-VA-VHA").fictitious_power="grant";
 assert(inspectDepartmentSchema(initial.schema,f).errors.some(x=>x.includes("unknown publication field")));
 const swapped=structuredClone(initial.files);
 swapped[file("govman-roots")].model_family="units";
 assert(inspectDepartmentSchema(initial.schema,swapped).errors.some(x=>x.includes("mislabeled collection")));
});
test("twelve precise December 2025 departmental GovInfo granules match canonical department names",()=>{
 assert.equal(validated.roots.size,12);
 const va=validated.roots.get("DEPT04-GOVMAN-ROOT-VA");
 assert.equal(va.granule_id,"GOVMAN-2025-12-31-126");
 const justice=validated.roots.get("DEPT04-GOVMAN-ROOT-JUSTICE");
 assert.equal(justice.granule_id,"GOVMAN-2025-12-31-121");
 assert([...validated.roots.values()].every(x=>x.source_url.includes(x.granule_id)));
});
test("all twenty-four previous candidates are reconciled without replacement or invented source granules",()=>{
 assert.equal(validated.records["candidate-granules"].length,24);
 assert.equal(validated.records["candidate-granules"].filter(x=>x.granule_resolution==="exact_official_details_page_verified").length,13);
 assert.equal(validated.records["candidate-granules"].filter(x=>x.granule_resolution==="present_in_edition_navigation_but_granule_id_not_reconciled").length,2);
 assert.equal(validated.records["candidate-granules"].filter(x=>x.granule_resolution==="individual_granule_not_verified").length,9);
 assert(validated.records["candidate-granules"].every(x=>x.full_adl1_completed===false));
});
test("four source-specific named groups reconcile 36 DoJ + 22 VA + nine Treasury + thirteen Commerce",()=>{
 assert.equal(validated.units.size,80);
 assert.equal(validated.relationships.length,80);
 const counts=Object.fromEntries(["JUSTICE","VA","TREASURY","COMMERCE"].map(c=>[c,
  [...validated.units.values()].filter(x=>x.department_id.endsWith("-"+c)).length]));
 assert.deepEqual(counts,{JUSTICE:36,VA:22,TREASURY:9,COMMERCE:13});
});
test("DOJ signed February 2026 chart connects AG to DAG, 24 DAG entries, ten Associate entries",()=>{
 const u=[...validated.units.values()].filter(x=>x.department_id.endsWith("-JUSTICE"));
 assert.equal(u.filter(x=>x.group==="chart_under_deputy").length,24);
 assert.equal(u.filter(x=>x.group==="chart_under_associate").length,10);
 assert.equal(u.find(x=>x.id==="DEPT04-UNIT-JUSTICE-DAG").parent_ref,"DEPT04-UNIT-JUSTICE-AG");
 assert.equal(u.find(x=>x.id==="DEPT04-UNIT-JUSTICE-OIG").structural_class,"independent_oversight_position_only");
});
test("VA administration source group is precisely three; staff offices remain a separate 19-unit source category",()=>{
 const u=[...validated.units.values()].filter(x=>x.department_id.endsWith("-VA"));
 assert.equal(u.filter(x=>x.group==="administrations_heading").length,3);
 assert.equal(u.filter(x=>x.group==="staff_offices_heading").length,19);
 assert(u.some(x=>x.id==="DEPT04-UNIT-VA-BVA"&&x.structural_class==="adjudicatory_office_review_needed"));
 assert(u.some(x=>x.id==="DEPT04-UNIT-VA-OIG"&&x.structural_class==="independent_oversight_position_only"));
});
test("Treasury directory's nine body headings do not include unreviewed navigation-only entity",()=>{
 const x=[...validated.units.values()].filter(u=>u.department_id.endsWith("-TREASURY"));
 assert.equal(x.length,9);
 assert(x.some(u=>u.id==="DEPT04-UNIT-TREASURY-TIGTA"));
 assert(!x.some(u=>/pandemic recovery/i.test(u.name)));
 assert.equal(x.filter(u=>u.structural_class==="independent_oversight_position_only").length,2);
});
test("Commerce source heading contains 11 institutional bureaus and two organizational offices",()=>{
 const x=[...validated.units.values()].filter(u=>u.department_id.endsWith("-COMMERCE"));
 assert.equal(x.length,13);
 assert.equal(x.filter(u=>u.structural_class==="executive_office_listed_in_bureaus_category_not_legal_bureau").length,2);
 assert(x.some(u=>u.legacy_candidate_id==="EXP-SEED-COMMERCE-NIST"));
});
test("eight entities link to preexisting PR20 candidates; no canonical government institution ID is replaced",()=>{
 const x=[...validated.units.values()].filter(u=>u.legacy_candidate_id!==null);
 assert.equal(x.length,8);
 assert.equal(new Set(x.map(u=>u.legacy_candidate_id)).size,8);
 assert(x.every(u=>u.id.startsWith("DEPT04-UNIT-")));
});
test("all source groups are explicitly older or mutable and are neither archived nor legally verified",()=>{
 const sources=validated.records["source-registry"];
 assert.equal(sources.length,5);
 assert(sources.every(s=>s.raw_source_sha256===null&&!s.raw_source_bytes_archived&&s.qualified_legal_review===false));
 assert([...validated.snapshots.values()].every(s=>!s.complete_department_first_level_known&&
  !s.full_operational_hierarchy_verified&&!s.signed_source_instrument_independently_validated));
});
test("every source relationship is properly typed, has known parent and grants zero legal authority",()=>{
 assert(validated.relationships.every(x=>x.delegated_power_proven===false&&
  x.authorized_actor_id===null&&x.direct_military_or_civilian_command_proven===false&&
  x.appropriation_verified===false&&x.legally_valid_adl1_claim===false));
 assert(validated.relationships.some(x=>x.from_id==="DEPT04-UNIT-JUSTICE-OIG"&&
  x.relationship_type==="independent_oversight_display_placement_not_command"));
});
test("whole 12-department GovInfo reference view is a root citation directory, not a certified agency chart",()=>{
 const v=projectDepartmentStructure(validated,"VIEW-DEPT04-GOVMAN-12");
 assert.equal(v.nodes.length,12);assert.equal(v.relationships.length,0);
 assert.equal(v.complete_department_adl1,false);
});
test("each four source-slice views project the bounded typed data and its own parent",()=>{
 for(const [c,n]of [["JUSTICE",36],["VA",22],["TREASURY",9],["COMMERCE",13]]){
  const v=projectDepartmentStructure(validated,"VIEW-DEPT04-"+c);
  assert.equal(v.nodes.length,n+1);assert.equal(v.relationships.length,n);
  assert(v.relationships.every(r=>r.source_review_status==="source_slice_verified_only"));
 }
});
test("all twelve departmental ADL-1 research gaps remain unresolved",()=>{
 const gaps=validated.records.gaps;
 assert.equal(gaps.length,15);
 assert(gaps.every(x=>x.resolved===false));
 const ledger=validated.records["coverage-ledger"];
 assert.equal(ledger.length,12);
 assert(ledger.every(x=>x.complete_first_level_denominator===null&&
  x.current_adl1_certified===false&&x.outside_source_slice_not_assumed_absent===true));
});
negative("official GovInfo-host wrong parent department granule cannot masquerade as a verified edition",f=>{
 find(f,"govman-roots","DEPT04-GOVMAN-ROOT-VA").granule_id="GOVMAN-2025-12-31-125";
});
negative("root official source may not silently switch to a different agency URL",f=>{
 find(f,"govman-roots","DEPT04-GOVMAN-ROOT-HHS").source_url="https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-126";
});
negative("a source record may not be replaced with another official Justice page",f=>{
 find(f,"source-registry","DEPT04-SRC-DOJ-CHART-2026").url="https://www.justice.gov/agencies/chart";
});
negative("mutable source cannot falsely claim a verified SHA-256 archive",f=>{
 find(f,"source-registry","DEPT04-SRC-TREASURY-BUREAUS-2026").raw_source_bytes_archived=true;
});
negative("signed chart may not claim an independently validated cryptographic signature",f=>{
 find(f,"source-snapshots","DEPT04-SNAPSHOT-JUSTICE").signed_source_instrument_independently_validated=true;
});
negative("13 individually verified candidate granules cannot be spoofed by nearby official records",f=>{
 find(f,"candidate-granules","DEPT04-XW-EXP-SEED-TREASURY-IRS").verified_individual_granule_id="GOVMAN-2025-12-31-254";
});
negative("a merely index-listed but unmatched BLS cannot fabricate an exact GovInfo granule",f=>{
 find(f,"candidate-granules","DEPT04-XW-EXP-SEED-LABOR-BLS").granule_resolution="exact_official_details_page_verified";
});
negative("a previously unlocated State Bureau record cannot be promoted to ADL-1",f=>{
 find(f,"candidate-granules","DEPT04-XW-EXP-SEED-STATE-CONSULAR").full_adl1_completed=true;
});
negative("cross-branch or cross-department parent reassignment fails",f=>{
 find(f,"units","DEPT04-UNIT-JUSTICE-FBI").parent_ref="ORG-FED-EXE-DEP-TREASURY";
});
negative("DOJ signed hierarchy cannot elevate a DAG-connected bureau to the Associate chain",f=>{
 find(f,"units","DEPT04-UNIT-JUSTICE-FBI").parent_ref="DEPT04-UNIT-JUSTICE-ASG";
});
negative("independent DoJ inspector general position cannot be assigned generic command status",f=>{
 find(f,"units","DEPT04-UNIT-JUSTICE-OIG").structural_class="chart_component_no_statutory_power_inferred";
});
negative("VA OIG descriptive relation may not be converted into a civilian command order",f=>{
 find(f,"relationships","DEPT04-REL-0062").direct_military_or_civilian_command_proven=true;
});
negative("statutory agency delegations cannot follow from departmental chart edges",f=>{
 f.files[file("relationships")].items[0].delegated_power_proven=true;
});
negative("appropriations cannot follow from document directory membership",f=>{
 f.files[file("relationships")].items[0].appropriation_verified=true;
});
negative("VA administrations group cannot be recategorized into adjudicatory staff offices",f=>{
 find(f,"units","DEPT04-UNIT-VA-VHA").group="staff_offices_heading";
});
negative("Commerce's two leadership offices cannot be falsely certified as ordinary statutory bureaus",f=>{
 find(f,"units","DEPT04-UNIT-COMMERCE-OS").structural_class="publisher_bureau_listing_not_verified_statutory_class";
});
negative("organization graph may not silently drop a DoJ signed-chart unit",f=>{
 f.files[file("units")].items=f.files[file("units")].items.filter(x=>x.id!=="DEPT04-UNIT-JUSTICE-OIG");
});
negative("duplicate sourced parent relations for a unit are invalid",f=>{
 f.files[file("relationships")].items[1].from_id=f.files[file("relationships")].items[0].from_id;
});
negative("government-level completeness cannot be manufactured as an 80-of-80 departmental census",f=>{
 f.manifest.federal_institutional_structure_extension.complete_department_adl1=4;
});
negative("full first-level denominator must stay unknown until external enumeration reconciles it",f=>{
 find(f,"coverage-ledger","DEPT04-COVERAGE-VA").complete_first_level_denominator=22;
});
negative("an unresolved legal review gap may not be prematurely marked resolved",f=>{
 find(f,"gaps","DEPT04-GAP-DOJ-LEGAL").resolved=true;
});
negative("website publication status cannot be set by changing a data model",f=>{
 find(f,"viewpoints","VIEW-DEPT04-JUSTICE").website_rendered=true;
});
negative("unknown fields carrying hidden effective authority are rejected by strict schema",f=>{
 find(f,"units","DEPT04-UNIT-VA-OIT").may_spend_public_money=true;
});
negative("root department identity names cannot silently be changed",f=>{
 find(f,"govman-roots","DEPT04-GOVMAN-ROOT-JUSTICE").name="Department of Military Justice";
});
negative("source family relabeling must fail",f=>{
 f.files[file("units")].model_family="govman-roots";
});
test("unapproved viewpoint fails closed",()=>{
 assert.throws(()=>projectDepartmentStructure(validated,"VIEW-DEPT04-UNAVAILABLE"),/unknown/);
});
