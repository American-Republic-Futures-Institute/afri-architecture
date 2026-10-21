import test from "node:test";
import assert from "node:assert/strict";
import {loadINC15C2,validateINC15C2,ORIGINAL_SHA256,ORIGINAL_GIT_BLOB_SHA,ORIGINAL_BYTES}
 from "../scripts/inc15c2-chart-validation-core.mjs";

const initial=loadINC15C2();
const dup=()=>({
 ...initial,
 model:structuredClone(initial.model),
 schema:structuredClone(initial.schema),
 manifest:structuredClone(initial.manifest),
 gitReceipt:structuredClone(initial.gitReceipt),
 transientReceipt:structuredClone(initial.transientReceipt)
});
const fail=/INC-15C\.2 chart rejected:/;
const item=(d,id)=>d.model.items.find(x=>x.id.endsWith("-"+id));
const extension=d=>d.manifest.federal_institutional_breadth_15c2_extension;

test("original signed HTTPS source report bytes match SHA-256, Git blob and both Git receipts",()=>{
 const r=validateINC15C2(dup());
 assert.equal(r.source_original_sha256,ORIGINAL_SHA256);
 assert.equal(r.source_github_blob,ORIGINAL_GIT_BLOB_SHA);
 assert.equal(r.evidence_pdf_bytes,ORIGINAL_BYTES);
 assert.deepEqual(r.source_boxes_by_legend,{
  executive:13,operational:8,support_and_oversight:13});
 assert.equal(r.chart_figure_boxes,34);
 assert.equal(r.old_source_candidates_matched,10);
 assert.equal(r.new_source_only_boxes,24);
 assert.equal(r.current_DHS_first_level_denominator,null);
 assert.equal(r.independent_WORM_custody_verified,false);
 assert.equal(r.adl1_certified_count,0);
});
test("known source boxes match legacy X12 IDs; new chart-only boxes do not create canonical institutions",()=>{
 const d=dup();
 const matched=d.model.items.filter(x=>x.prior_inc15c1_candidate_id!==null);
 const unmatched=d.model.items.filter(x=>x.prior_inc15c1_candidate_id===null);
 assert.equal(matched.length,10);
 assert.equal(unmatched.length,24);
 assert(matched.every(x=>x.prior_inc12_observation_id?.startsWith("X12-OBS-CENSUS-COMP-DHS-")));
 assert(unmatched.every(x=>x.prior_inc12_observation_id===null&&
   x.prior_descriptive_relation_id===null&&x.source_only_unratified_candidate));
 assert.equal(item(d,"OIG").independent_oversight_exception,true);
 assert.equal(item(d,"USCG").conditional_coast_guard_military_placement,true);
 assert.equal(d.model.items[1].contains_multiple_office_titles,true);
});
for(const [name,mutate] of [
 ["invented current DHS denominator",d=>d.model.current_DHS_first_level_denominator=34],
 ["invented current completed institutional census",d=>d.model.complete_current_DHS_institutional_census=true],
 ["chart office promoted to actual legal identity",d=>item(d,"GENERAL-COUNSEL").source_only_unratified_candidate=false],
 ["chart office assigned original DHS candidate without source",d=>item(d,"GENERAL-COUNSEL").prior_inc15c1_candidate_id="CENSUS-COMP-DHS-OGC"],
 ["legacy CBP X12 replaced",d=>item(d,"CBP").prior_inc12_observation_id="X12-OBS-FAKE"],
 ["legacy FLETC relation swapped",d=>item(d,"FLETC").prior_descriptive_relation_id="CENSUS-REL-0010"],
 ["Inspector General independence removed",d=>item(d,"OIG").independent_oversight_exception=false],
 ["OIG source class promoted to operational",d=>item(d,"OIG").chart_legend_class="operational_component"],
 ["Coast Guard military placement exception removed",d=>item(d,"USCG").conditional_coast_guard_military_placement=false],
 ["Secretary-Deputy multi-office box misclassified",d=>d.model.items[1].contains_multiple_office_titles=false],
 ["report complete source box count changed",d=>d.model.figure_box_count=35],
 ["source first-level scope rewritten",d=>d.model.chart_scope_statement="All current DHS offices and legal departments"],
 ["report published date rewritten",d=>d.model.source_claimed_publication_date="2026-10-20"],
 ["PDF modified date rewritten",d=>d.model.pdf_metadata_modified_utc="2025-01-17T00:00:00Z"],
 ["source hash forged",d=>d.model.source_original_sha256="a".repeat(64)],
 ["Git blob checksum forged",d=>d.model.source_original_git_blob_sha="b".repeat(40)],
 ["original publisher hostname substituted",d=>d.model.captured_official_url="https://bad.example/report.pdf"],
 ["source PDF physical page changed",d=>d.model.physical_pdf_page_number=25],
 ["source observation row missing",d=>d.model.items.pop()],
 ["duplicate first chart box inserted",d=>d.model.items[1].id=d.model.items[0].id],
 ["source chart row positions reordered",d=>d.model.items.reverse()],
 ["newly invented off-chart office",d=>d.model.items[10].chart_label="Office of Nonexistent Authority"],
 ["chart color classification changed",d=>d.model.items[0].chart_legend_class="operational_component"],
 ["chart coordinate altered",d=>d.model.items[0].box_top_left_x_pt=510.51],
 ["operational command forged",d=>item(d,"CBP").operational_command_verified=true],
 ["statutory delegation forged",d=>item(d,"FEMA").statutory_delegation_verified=true],
 ["human legal review forged",d=>d.model.independent_legal_review_complete=true],
 ["ADL-1 certified count forged",d=>d.model.adl1_certified_count=1],
 ["independent WORM original custody forged",d=>d.model.independent_WORM_custody_verified=true],
 ["manifest legal-certification claim changed",d=>extension(d).status="legally_certified_full_DHS_structure"],
 ["manifest registered SHA altered",d=>extension(d).source_original_sha256="x".repeat(64)],
 ["manifest arbitrary office-certification key added",d=>extension(d).complete_legal_organization=true],
 ["chart-only source extra field forged",d=>d.model.items[0].executed_command=true],
 ["schema and source row jointly add command authority",d=>{
  d.model.items[0].executed_command=true;
  const s=d.schema.properties.items.items;
  s.required.push("executed_command");s.properties.executed_command={type:"boolean"};
 }],
 ["Git evidence receipt falsely upgraded to WORM",d=>d.gitReceipt.independent_WORM_custody_verified=true],
 ["Git receipt first-level denominator upgraded",d=>d.gitReceipt.current_first_level_DHS_denominator=34],
 ["transient receipt falsely claims original durable custody",d=>d.transientReceipt.independent_durable_custody_verified=true],
 ["transient receipt false source chart inspection",d=>d.transientReceipt.original_pdf_page_24_inspected=true]
]){
 test("INC-15C.2 rejects "+name,()=>{
  const d=dup();mutate(d);
  assert.throws(()=>validateINC15C2(d),fail);
 });
}
test("original PDF bit-flip invalidates independently pinned raw PDF digest",()=>{
 const d=dup();d.sourceBytes=Buffer.from(initial.sourceBytes);
 d.sourceBytes[3071]^=1;
 assert.throws(()=>validateINC15C2(d),/original DHS PDF bytes/);
});
