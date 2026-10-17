import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ARCH04B_MODEL_PATHS,ARCH04B_CONTEXT_PATHS,validateArchive04b,
 inspectArchive04bSchema,projectArchive04b} from "../scripts/validate-federal-archive04b-core.mjs";
import {assertTargets} from "../scripts/federal-source-archive-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const initial={manifest:read("model/federal/manifest.json"),
 schema:read("schemas/federal-source-archive-04b.schema.json"),
 files:Object.fromEntries([...ARCH04B_MODEL_PATHS,...ARCH04B_CONTEXT_PATHS].map(p=>[p,read(p)]))};
const verified=validateArchive04b(initial.manifest,initial.files,initial.schema);
const filename=f=>"model/federal/archive04b/"+f+".json";
const lookup=(f,fam,id)=>{
 const x=f.files[filename(fam)].items.find(x=>x.id===id);
 assert(x,"Test fixture missing "+id);return x;
};
const reject=(name,mutate,regexp=/Federal source archive rejected|unapproved source URL|exact eight approved government sources required/)=>test(name,()=>{
 const f=structuredClone(initial);mutate(f);
 assert.throws(()=>validateArchive04b(f.manifest,f.files,f.schema),regexp);
});
test("nine strictly dispatched JSON Schema families permit no unsupported authority fields",()=>{
 const result=inspectArchive04bSchema(initial.schema,initial.files);
 assert.deepEqual(result.errors,[]);
 assert.equal(result.families,9);
 const bad=structuredClone(initial.files);
 bad[filename("hhs-source-entries")].items[0].signed_delegation=true;
 assert(inspectArchive04bSchema(initial.schema,bad).errors.some(s=>s.includes("additional field")));
});
test("eight pinned official network sources are known but NOT falsely recorded as archived",()=>{
 assert.equal(verified.data.sources.length,8);
 assertTargets(verified.data.sources);
 assert(verified.data.sources.every(x=>x.archived_sha256===null&&
  x.archival_status==="capture_pending_ci_artifact"&&!x.bytes_embedded_in_repository));
 assert.equal(verified.counts.captured_repository_source_bytes,0);
 assert.equal(verified.counts.blocked_live_HHS_capture,1);
});
test("seven real downloaded source receipts and the HHS HTTP403 gap are explicitly auditable",()=>{
 const rows=verified.data["observed-capture-receipts"];
 assert.equal(rows.length,8);
 assert.equal(rows.filter(x=>x.receipt_status==="verified_in_temporary_ci_artifact").length,7);
 assert.equal(rows.filter(x=>x.receipt_status==="blocked_official_HTTP_403").length,1);
 assert.equal(rows.find(x=>x.source_id==="ARCH04B-DOJ-HTML").decoded_entity_byte_count,60922);
 assert(rows.every(x=>x.is_permanent_archive===false&&x.source_payload_in_repository===false));
 assert.equal(verified.counts.verified_temporary_source_receipt_sha256,7);
});
test("GovInfo XML embeds source-local parent entity IDs, not universal department or component identifiers",()=>{
 const x=verified.data["govman-xml-root-metadata"];
 assert.deepEqual(Object.fromEntries(x.map(r=>[r.department_id.split("-").at(-1),r.local_entity_id])),
  {JUSTICE:"121",TREASURY:"125",HHS:"117",VA:"126"});
 assert(x.every(r=>r.XML_entity_elements_in_granule===1&&r.complete_first_level_department_denominator_verified===false));
});
test("twenty-eight source-listed HHS links distinguish clinical agencies, Secretary offices, IG and hearings",()=>{
 const v=verified.data["hhs-source-entries"];
 assert.equal(v.length,28);
 assert.equal(new Set(v.map(x=>x.id)).size,28);
 assert(v.find(x=>x.code==="OIG").provisional_kind==="independent_inspector_general_statutory_review");
 assert(v.find(x=>x.code==="DAB").provisional_kind==="administrative_adjudication_requires_statutory_review");
 assert(v.find(x=>x.code==="OMHA").provisional_kind==="administrative_adjudication_requires_statutory_review");
});
test("pre-existing HHS CDC/CMS research candidate IDs are preserved without claiming new legal roles",()=>{
 const refs=verified.data["hhs-source-entries"].filter(x=>x.legacy_candidate_id!==null);
 assert.deepEqual(refs.map(x=>x.legacy_candidate_id).sort(),["EXP-SEED-HHS-CDC","EXP-SEED-HHS-CMS"]);
 assert(refs.every(x=>x.parent_census_adl1_certified===false));
});
test("four evidence section denominators sum to ninety-five but all full departmental denominators remain unknown",()=>{
 assert.deepEqual(Object.fromEntries([...verified.ledger.values()].map(x=>
  [x.department_id.split("-").at(-1),x.counted_entries])),
  {JUSTICE:36,TREASURY:9,HHS:28,VA:22});
 assert.equal(verified.counts.named_source_group_total,95);
 assert([...verified.ledger.values()].every(x=>x.legal_first_level_denominator===null&&
  x.missing_from_group_means_officially_abolished===false));
});
test("Justice/Treasury/VA counts reconcile directly against original Inc04A source groups, not a new census",()=>{
 for(const code of ["JUSTICE","TREASURY","VA"]){
  const source=verified.oldSnapshots.find(x=>x.id==="DEPT04-SNAPSHOT-"+code);
  assert.equal(source.source_group_record_count,verified.ledger.get("ARCH04B-LEDGER-"+code).counted_entries);
 }
});
test("nine named legal classifications require independent statute/delegation review",()=>{
 assert.equal(verified.data["classification-review"].length,9);
 assert(verified.data["classification-review"].every(x=>x.statute_subsection_verified===false&&
  x.controlling_primary_legal_instrument_id===null&&
  x.legal_classification_final===false&&x.independent_reviewer_id===null));
});
test("four source history slots cannot interpret missing listed units as legal abolition",()=>{
 assert.equal(verified.data["change-journal"].length,4);
 assert(verified.data["change-journal"].every(x=>x.previous_source_artifact_hash===null&&
  x.current_source_artifact_hash===null&&
  x.missing_entity_effect==="not_observed_not_disestablished"&&x.law_change_inferred===false));
});
test("independent departmental snapshots are selectable but never present statutory command edges",()=>{
 for(const [code,n] of [["JUSTICE",36],["TREASURY",9],["HHS",28],["VA",22]]){
  const r=projectArchive04b(verified,"VIEW-ARCH04B-"+code);
  assert.equal(r.bounded_list_denominator,n);
  assert.equal(r.whole_department_denominator,null);
  assert.equal(r.authority_edges.length,0);
  assert.equal(r.website_rendered,false);
 }
});
test("unsupported views fail closed rather than reusing unrelated DOJ evidence",()=>{
 assert.throws(()=>projectArchive04b(verified,"VIEW-ARCH04B-ALL-CURRENT"),/unknown/);
});
reject("tampering with an independently verified source response digest is rejected",f=>{
 lookup(f,"observed-capture-receipts","ARCH04B-OBS-ARCH04B-GOVMAN-JUSTICE-XML").decoded_entity_sha256="e".repeat(64);
});
reject("blocked HHS HTML cannot be marked captured without original response bytes",f=>{
 lookup(f,"observed-capture-receipts","ARCH04B-OBS-ARCH04B-HHS-HTML").receipt_status="verified_in_temporary_ci_artifact";
});
reject("GovInfo package-local EntityId cannot be swapped for another federal agency identifier",f=>{
 lookup(f,"govman-xml-root-metadata","ARCH04B-XML-ROOT-HHS").local_entity_id="125";
});
reject("GovInfo XML parent element cannot become an apparently complete nested agency list",f=>{
 lookup(f,"govman-xml-root-metadata","ARCH04B-XML-ROOT-VA").complete_first_level_department_denominator_verified=true;
});
test("each of nine still-unapproved legal classification gates has a source-specific research row",()=>{
 const memo=fs.readFileSync(path.join(root,"docs/FEDERAL-LEGAL-CLASSIFICATION-INC04B.md"),"utf8");
 const gateIds=verified.data["classification-review"].map(x=>x.id);
 assert.equal(gateIds.length,9);
 for(const id of gateIds)assert(memo.includes("`"+id+"`"),"No legal source research row for "+id);
 assert.match(memo,/5 U\.S\.C\. §412/);
 assert.match(memo,/42 C\.F\.R\. §405\.1000/);
 assert(verified.data["classification-review"].every(x=>x.legal_classification_final===false&&
   x.independent_reviewer_id===null&&x.statute_subsection_verified===false));
});
reject("unrelated official source URL is not substitution for an existing government edition",f=>{
 lookup(f,"sources","ARCH04B-GOVMAN-HHS-XML").url="https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-125.xml";
});
reject("official hostname impersonation must fail",f=>{
 lookup(f,"sources","ARCH04B-HHS-HTML").url="https://www.hhs.gov.attack.invalid/about/organization/org-chart/index.html";
});
reject("a pending byte capture cannot pretend to have a verified hash",f=>{
 lookup(f,"sources","ARCH04B-HHS-HTML").archived_sha256="a".repeat(64);
});
reject("a copied agency source cannot be claimed embedded in the repository",f=>{
 lookup(f,"sources","ARCH04B-DOJ-HTML").bytes_embedded_in_repository=true;
});
reject("HHS dated source list must never be silently upgraded to a present-day first-level denominator",f=>{
 lookup(f,"denominators","ARCH04B-LEDGER-HHS").legal_first_level_denominator=28;
});
reject("out-of-scope missing HHS unit must not become assumed abolished",f=>{
 lookup(f,"denominators","ARCH04B-LEDGER-HHS").missing_from_group_means_officially_abolished=true;
});
reject("HHS Inspector General may not be converted to an ordinary operational division",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-OIG").provisional_kind="operating_division_candidate";
});
reject("an HHS administrative hearing organization cannot become a generic operational office",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-OMHA").provisional_kind="departmental_staff_office_candidate";
});
reject("an HHS Secretary directory entry cannot be made a signed power delegation",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-IOS").delegated_authority_verified=true;
});
reject("HHS records cannot be substituted with non-official invented names",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-NIH").name="National Innovation Harmonics";
});
reject("duplicate HHS named source order is not a valid dated enumeration",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-NIH").display_order=3;
});
reject("2015 HHS record cannot carry an invented 2026 review date",f=>{
 lookup(f,"hhs-source-entries","ARCH04B-HHS-NIH").source_date_context="2026-10-16_current_organization_certified";
});
reject("historical DOJ scoped count must remain 36",f=>{
 lookup(f,"denominators","ARCH04B-LEDGER-JUSTICE").counted_entries=35;
});
reject("Treasury directory scope cannot be inflated as complete department structure",f=>{
 lookup(f,"denominators","ARCH04B-LEDGER-TREASURY").current_organization_complete=true;
});
reject("2026 VA directory cannot confer BVA independent court jurisdiction",f=>{
 lookup(f,"classification-review","ARCH04B-LEGAL-VA-BVA").statute_subsection_verified=true;
});
reject("Treasury IG's chart placement cannot constitute an individual legal delegation",f=>{
 lookup(f,"classification-review","ARCH04B-LEGAL-TREASURY-OIG").explicit_delegation_instrument_verified=true;
});
reject("HHS DAB's administrative appellate status is not certified by an org chart",f=>{
 lookup(f,"classification-review","ARCH04B-LEGAL-HHS-DAB").legal_classification_final=true;
});
reject("DOJ OIG source may not silently acquire a named approving reviewer",f=>{
 lookup(f,"classification-review","ARCH04B-LEGAL-JUSTICE-OIG").independent_reviewer_id="unverified-person";
});
reject("source change detection must compare verified prior captures, not invented sha strings",f=>{
 lookup(f,"change-journal","ARCH04B-CHANGE-HHS").change_detection_status="fully_proven_2026_current";
});
reject("source absence is not evidence a department or office ceased existing",f=>{
 lookup(f,"change-journal","ARCH04B-CHANGE-JUSTICE").missing_entity_effect="officially_abolished";
});
reject("legal changes cannot be invented from raw page hash drift",f=>{
 lookup(f,"change-journal","ARCH04B-CHANGE-VA").law_change_inferred=true;
});
reject("removing source audit gaps is not review completion",f=>{
 f.files[filename("gaps")].items.pop();
});
reject("website rendering cannot be declared from modeling JSON alone",f=>{
 lookup(f,"viewpoints","VIEW-ARCH04B-HHS").website_implemented=true;
});
reject("manifest cannot promote source archival completeness or ADL-1",f=>{
 f.manifest.federal_source_archive_extension.independent_source_archive_complete=true;
});
reject("manifest cannot inflate population to claim 2026 whole-department coverage",f=>{
 f.manifest.federal_source_archive_extension.verified_whole_dept_first_level_denominator=95;
});
