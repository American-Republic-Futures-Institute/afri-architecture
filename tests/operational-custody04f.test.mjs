import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {FAMILIES,PATHS,PREDECESSORS,inspect04FSchema,validate04F}
 from "../scripts/validate-operational-custody-04f-core.mjs";
import {createUnsigned04FIndex} from "../scripts/replay-originals-04f-core.mjs";
import {canonical} from "../scripts/verify-institutional-trust-04e-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const initial={
 manifest:read("model/federal/manifest.json"),
 schema:read("schemas/evidence-custody-04f.schema.json"),
 files:Object.fromEntries([...PATHS,...PREDECESSORS].map(p=>[p,read(p)]))
};
const valid=validate04F(initial.manifest,initial.files,initial.schema);
const get=(o,f,id)=>{
 const row=o.files["model/federal/inc04f/"+f+".json"].items.find(x=>x.id===id);
 assert(row,"test fixture row missing "+f+" "+id);return row;
};
const reject=(name,mutate)=>test(name,()=>{
 const m=structuredClone(initial);
 mutate(m);
 assert.throws(()=>validate04F(m.manifest,m.files,m.schema),/04F evidence qualification rejected/);
});
test("five closed 2020-12 research collection schemas preserve historical legal qualifications",()=>{
 const x=inspect04FSchema(initial.schema,initial.files);
 assert.equal(x.families,5);assert.deepEqual(x.errors,[]);
 const clone=structuredClone(initial.files);
 get({files:clone},"va-first-level-candidates","F04F-CAND-OIG").authorized_command_power="yes";
 assert(inspect04FSchema(initial.schema,clone).errors.some(x=>x.includes("unknown field")));
});
test("eleven exact original receipt pointers preserve four dated VA manual and Code sources",()=>{
 assert.equal(valid.counts.source_receipts,11);
 const x=valid.models["custody-source-queue"];
 assert.equal(x.filter(y=>y.collection==="04B").length,7);
 assert.equal(x.filter(y=>y.collection==="04D").length,4);
 assert.equal(x.reduce((n,y)=>n+y.byte_count,0),44171747);
 assert(x.every(y=>/^[a-f0-9]{64}$/.test(y.SHA256)));
 assert(x.every(y=>!y.source_bytes_reverified_04f&&!y.legal_status_certified));
});
test("unsigned candidate has stable canonical source order and never asserts institutional ratification",()=>{
 const a=createUnsigned04FIndex(valid.models["custody-source-queue"]);
 const b=createUnsigned04FIndex(valid.models["custody-source-queue"].slice().reverse());
 assert(canonical(a).equals(canonical(b)));
 assert.equal(a.original_count,11);
 assert.equal(a.governance_adopted,false);
 assert.equal(a.protected_storage_object_versions,0);
 assert.equal(a.original_HHS_HTML_not_captured,true);
 assert.equal(a.original_CBCA_HTML_not_captured,true);
 assert.equal(a.exact_original_capture_manifest_04b_sha256,null);
});
test("VA bounded directory union contains 25 distinct research leads, not a complete first-level denominator",()=>{
 assert.equal(valid.counts.VA_directory,22);
 assert.equal(valid.counts.VA_extra_named_leads,3);
 assert.equal(valid.counts.VA_source_bounded_candidates,25);
 assert.equal(valid.counts.VA_verified_first_level_denominator,null);
 assert(!valid.models["va-first-level-candidates"].some(x=>x.name==="Civilian Board of Contract Appeals"));
});
test("HHS chart and CBCA history are not substituted or silently treated as captured originals",()=>{
 const x=valid.models["unavailable-originals"];
 assert.equal(x.length,2);
 assert.deepEqual(x.map(r=>r.original_bytes_sha256),[null,null]);
 assert(x.every(r=>r.allowed_substitution===false));
});
test("ten release prerequisites and six statutory dossiers require distinct human decisions",()=>{
 assert.equal(valid.models["custody-acceptance-gates"].length,10);
 assert.equal(valid.models["va-legal-review-packets"].length,6);
 assert(valid.models["custody-acceptance-gates"].every(x=>!x.verified&&!x.waived));
 assert(valid.models["va-legal-review-packets"].every(x=>x.independent_qualified_counsel_identity===null));
});
reject("cannot substitute an unverified HHS organizational page into protected 11-source queue",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-ARCH04B-DOJ-HTML").source_id="ARCH04B-HHS-HTML";
});
reject("cannot change publisher URL without an independent original source receipt",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-ARCH04B-TREASURY-HTML").source_url="https://example.com/foo";
});
reject("cannot shorten cryptographic original source SHA256",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-D04D-SRC-USC38").SHA256="a".repeat(40);
});
reject("cannot replace source original SHA digest without independently acquired bytes",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-D04D-SRC-FOM1").SHA256="f".repeat(64);
});
reject("cannot alter source original byte count while preserving old hash",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-D04D-SRC-FOM2").byte_count=1;
});
reject("cannot change 04B source edition without source change record",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-ARCH04B-VA-HTML").source_edition="current_2026_certified";
});
reject("cannot invent another historical GitHub artifact ID",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-D04D-SRC-USC41").original_artifact_id=11;
});
reject("cannot treat an expiring temporary artifact as an immutable permanent storage version",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-ARCH04B-GOVMAN-VA-XML").primary_object_version_id="version-fake";
});
reject("cannot change a source archival legal certification to approved through a PR",x=>{
 get(x,"custody-source-queue","F04F-SOURCE-D04D-SRC-FOM1").ADL1_certified=true;
});
reject("cannot replace inaccessible HHS 403 with a fake source digest",x=>{
 get(x,"unavailable-originals","F04F-EXCEPTION-HHS").original_bytes_sha256="0".repeat(64);
});
reject("cannot substitute a different CBCA publisher page as the unavailable historical original",x=>{
 get(x,"unavailable-originals","F04F-EXCEPTION-CBCA").allowed_substitution=true;
});
reject("cannot declare the recovery exercise complete without independent audit approval",x=>{
 get(x,"custody-acceptance-gates","F04F-GATE-RECOVERY").verified=true;
});
reject("cannot bypass the independent storage replica requirement",x=>{
 get(x,"custody-acceptance-gates","F04F-GATE-REPLICA").waived=true;
});
reject("cannot treat VA Secretary office section as part of original 22 directory headings",x=>{
 get(x,"va-first-level-candidates","F04F-CAND-SECRETARY").legacy_directory_id="AR04C-VA-ROW-OGC";
});
reject("cannot treat CBCA as a VA department office",x=>{
 get(x,"va-first-level-candidates","F04F-CAND-VBA").name="Civilian Board of Contract Appeals";
});
reject("cannot silently certify Veteran Canteen Service as a contemporary first-level VA unit",x=>{
 get(x,"va-first-level-candidates","F04F-CAND-CANTEEN").inside_2026_current_first_level_legal_universe_verified=true;
});
reject("cannot infer administrative command over Board of Veterans' Appeals decisions",x=>{
 get(x,"va-legal-review-packets","F04F-CASE-BVA").adjudication_or_oversight_override_inferred=true;
});
reject("cannot fill qualified legal reviewer with fictitious name",x=>{
 get(x,"va-legal-review-packets","F04F-CASE-OIG").independent_qualified_counsel_identity="Someone";
});
reject("cannot claim complete VA first-level denominator from 25 bounded research seeds",x=>{
 x.manifest.federal_operational_custody_04f_extension.VA_verified_full_first_level_denominator=25;
});
reject("cannot claim eleven permanently archived official sources from local staging bytes",x=>{
 x.manifest.federal_operational_custody_04f_extension.approved_immutable_primary_objects=11;
});
reject("cannot publish the institutional structure while legal certification blocked",x=>{
 x.manifest.federal_operational_custody_04f_extension.public_website_published=true;
});
