import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,CONTEXT,inspect04DSchema,validateVA04D} from "../scripts/validate-va-04d-core.mjs";
import {releaseBlockers} from "../scripts/controlled-release-04d-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const initial={manifest:read("model/federal/manifest.json"),schema:read("schemas/va-evidence-04d.schema.json"),
 files:Object.fromEntries([...PATHS,...CONTEXT].map(p=>[p,read(p)]))};
const v=validateVA04D(initial.manifest,initial.files,initial.schema);
const p=n=>"model/federal/inc04d/"+n+".json";
const find=(f,collection,id)=>{
 const r=f.files[p(collection)].items.find(x=>x.id===id);
 assert(r,"missing expected fixture "+id);return r;
};
const reject=(name,change)=>test(name,()=>{
 const x=structuredClone(initial);change(x);
 assert.throws(()=>validateVA04D(x.manifest,x.files,x.schema),/04D architecture rejected/);
});
test("nine external JSON Schema draft 2020-12 closed model families are strict",()=>{
 const report=inspect04DSchema(initial.schema,initial.files);
 assert.equal(report.families,9);assert.deepEqual(report.errors,[]);
 const x=structuredClone(initial.files);
 find({files:x},"legal-identities","D04D-INST-OIG").unverified_power="issue_appropriation";
 assert(inspect04DSchema(initial.schema,x).errors.some(z=>z.includes("unknown field")));
});
test("both exact PDF volumes have separately SHA256-verified original response bytes and correct pagination",()=>{
 const x=v.data["observed-source-receipts"];
 assert.equal(x.filter(z=>z.pages!==null).length,2);
 assert.equal(x.find(z=>z.id==="D04D-OBS-FOM1").pages,315);
 assert.equal(x.find(z=>z.id==="D04D-OBS-FOM2").pages,506);
 assert(x.filter(z=>z.PDF_cover_year!==null).every(z=>z.PDF_cover_year==="2023"&&
  z.PDF_last_modified_utc.startsWith("2025-03-14")));
});
test("two frozen U.S. Code 2024 originals are SHA256 witnessed, not current 2026 legal opinions",()=>{
 const x=v.data["observed-source-receipts"];
 assert.equal(x.filter(z=>z.source_publication_as_of==="GOVINFO_2024_fixed_edition").length,2);
 assert(v.data["statutory-crosswalk"].every(z=>z.code_2024_edition_only&&
  !z.year_2026_legal_effect_verified&&!z.qualified_reviewer_approved));
});
test("official CBCA narrative is a separately blocked original, not disguised as signed statutory text",()=>{
 const x=v.data["observed-source-receipts"].find(z=>z.id==="D04D-OBS-CBCA");
 assert.equal(x.body_sha256,null);assert.equal(x.response_state,"official_page_not_captured");
 assert.equal(v.data["temporal-events"][0].statute_38_301_c7_repealed_inferred,false);
});
test("six exact FOM physical PDF page anchors are not source inferred institutional authority",()=>{
 assert.equal(v.data["fom-page-anchors"].length,6);
 assert(v.data["fom-page-anchors"].every(x=>x.source_section_verified_in_original_bytes&&
  !x.authorization_or_delegation_certified&&!x.complete_first_level_census_certified));
 assert(v.data["fom-page-anchors"].some(x=>x.printed_heading.startsWith("OIG-50")));
 assert(v.data["fom-page-anchors"].some(x=>x.printed_heading.startsWith("OSVA-000")));
});
test("all nine clause IDs preserve the initial source classification and predecessor link",()=>{
 assert.equal(v.data["statutory-crosswalk"].length,9);
 assert.equal(v.data["statutory-crosswalk"].filter(x=>x.matched_directory_candidate===null).length,5);
 assert(v.data["statutory-crosswalk"].every(x=>!x.inferred_abolition&&!x.complete_first_level_proven));
});
test("six special legal identities retain VA vs GSA distinction and independent oversight",()=>{
 const x=v.data["legal-identities"];
 assert.equal(x.length,6);
 assert.equal(x.find(y=>y.id==="D04D-INST-CBCA").department,"GSA");
 assert(x.find(y=>y.id==="D04D-INST-OEDCA").basis.includes("319"));
 assert(x.find(y=>y.id==="D04D-INST-OIG").basis.includes("403"));
});
test("complete VA first-level denominator and all signing/retention ratifications remain unknown",()=>{
 assert.equal(v.data.coverage[0].directory_listed,22);
 assert.equal(v.data.coverage[0].full_department_first_level_denominator,null);
 assert.equal(v.data.coverage[0].ADL1_certified,false);
 const blocked=releaseBlockers(v.data["trust-gates"][0],v.data["review-approvals"],v.data["observed-source-receipts"]);
 assert(blocked.includes("institutional_signer_not_enrolled"));
 assert(blocked.includes("immutable_storage_unattested"));
 assert(blocked.includes("six_independent_human_approvals_not_verified"));
});
reject("new DOI-like authority field forbidden in an original FOM anchor",x=>{
 find(x,"fom-page-anchors","D04D-ANCHOR-FOM2-BVA").legal_jurisdiction="verified";
});
reject("FOM original digest cannot be swapped with a fabricated SHA",x=>{
 find(x,"observed-source-receipts","D04D-OBS-FOM1").body_sha256="f".repeat(64);
});
reject("FOM page count cannot be altered without original document evidence",x=>{
 find(x,"observed-source-receipts","D04D-OBS-FOM2").pages=505;
});
reject("VA 2025 updated PDF cannot be claimed to have a 2025 printed cover",x=>{
 find(x,"observed-source-receipts","D04D-OBS-FOM1").PDF_cover_year="2025";
});
reject("unavailable CBCA web history cannot silently be replaced with fabricated bytes",x=>{
 find(x,"observed-source-receipts","D04D-OBS-CBCA").body_sha256="e".repeat(64);
});
reject("an official federal source URL substitution cannot masquerade as same Code edition",x=>{
 find(x,"source-targets","D04D-SRC-USC38").url="https://www.govinfo.gov/content/pkg/USCODE-2024-title41/html/USCODE-2024-title41-subtitleIII-chap71-sec7105.htm";
});
reject("a statutory subsection cannot silently inherit invented agency reporting command",x=>{
 find(x,"statutory-crosswalk","D04D-CLAUSE-5").regulatory_delegation_verified=true;
});
reject("missing VA Canteen listing is not evidence the statutory service was abolished",x=>{
 find(x,"statutory-crosswalk","D04D-CLAUSE-6").inferred_abolition=true;
});
reject("historical VA contract board cannot be erased by a 2007 successor candidate",x=>{
 find(x,"temporal-events","D04D-EVENT-2007").statute_38_301_c7_repealed_inferred=true;
});
reject("candidate 2007 event cannot prematurely certify complete transfer of every function",x=>{
 find(x,"temporal-events","D04D-EVENT-2007").complete_legal_transfer_verified=true;
});
reject("adjudicative body cannot become a regular lawful executive command from its manual",x=>{
 find(x,"legal-identities","D04D-INST-BVA").command_power_verified=true;
});
reject("OEDCA Title 38 reference cannot be lost",x=>{
 find(x,"legal-identities","D04D-INST-OEDCA").basis="old_website_only";
});
reject("Independent IG cannot infer spending authority from FOM listing",x=>{
 find(x,"legal-identities","D04D-INST-OIG").fiscal_authority_verified=true;
});
reject("absent institutional signer cannot claim trust from a fabricated key fingerprint",x=>{
 find(x,"trust-gates","D04D-TRUST").signer_fingerprint_sha256="a".repeat(64);
});
reject("unratified record retention cannot be set to an arbitrary fixed duration",x=>{
 find(x,"trust-gates","D04D-TRUST").retention_policy_id="fake";
});
reject("protected WORM archive cannot be self-attested through a model flag",x=>{
 find(x,"trust-gates","D04D-TRUST").fully_attested=true;
});
reject("CI must not invent a qualified lawyer's approval",x=>{
 find(x,"review-approvals","D04D-REVIEW-STATUTORY-COUNSEL").decision="approved";
});
reject("a 22 of 22 source coverage report is not a complete government census",x=>{
 find(x,"coverage","D04D-VA-COVERAGE").full_department_first_level_denominator=22;
});
reject("ADL1 certification cannot be asserted in bounded pilot",x=>{
 find(x,"coverage","D04D-VA-COVERAGE").ADL1_certified=true;
});
reject("four temporary source digests do not prove permanent archival retention",x=>{
 x.manifest.federal_evidence_04d_extension.originals_durably_retained_count=4;
});
reject("PR24 source research cannot modify prior 04C composition clauses",x=>{
 x.files["model/federal/inc04c/va-statutory-composition.json"].items[0].directory_candidate_id="invented";
});
