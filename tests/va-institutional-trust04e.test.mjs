import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,UPSTREAM,validate04E,inspectSchema04E,projectVA04E
} from "../scripts/validate-va-04e-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const start={schema:read("schemas/va-evidence-04e.schema.json"),manifest:read("model/federal/manifest.json"),
 files:Object.fromEntries([...PATHS,...UPSTREAM].map(p=>[p,read(p)]))};
const ready=validate04E(start.manifest,start.files,start.schema);
const pathOf=k=>"model/federal/inc04e/"+k+".json";
const pick=(ctx,col,id)=>{
 const x=ctx.files[pathOf(col)].items.find(r=>r.id===id);
 assert(x,"fixture missing "+id);return x;
};
const reject=(name,change)=>test(name,()=>{
 const clone=structuredClone(start);
 change(clone);
 assert.throws(()=>validate04E(clone.manifest,clone.files,clone.schema),/04E architecture rejected/);
});
test("seven non-operative source and approval collections have strict 2020-12 JSON Schema shape",()=>{
 const r=inspectSchema04E(start.schema,start.files);
 assert.deepEqual(r.errors,[]);assert.equal(r.families,7);
 const clone=structuredClone(start.files);
 pick({files:clone},"va-legal-issues","E04E-LEGAL-OIG").fictitious_delegated_command=true;
 assert(inspectSchema04E(start.schema,clone).errors.some(x=>x.includes("undeclared field")));
});
test("five governance ratifications and four signer enrollments remain unapproved",()=>{
 assert.equal(ready.models["governance-decisions"].length,5);
 assert.equal(ready.models["signer-enrollments"].length,4);
 assert(ready.models["governance-decisions"].every(x=>!x.ratified&&x.adoption_record_id===null));
 assert(ready.models["signer-enrollments"].every(x=>!x.institutionally_approved));
});
test("no ARFI-controlled immutable archive or privileged role has been fabricated",()=>{
 assert.equal(ready.models["storage-targets"].length,2);
 assert(ready.models["storage-targets"].every(x=>!x.backend_configured&&!x.provider_proof_verified));
 assert.equal(ready.counts.approved_governance,0);
});
test("VA dated manual counts are not a complete, current first-level organizational denominator",()=>{
 const d=ready.models["va-dossier"][0];
 assert.equal(d.directory_source_heading_total,22);
 assert.equal(d.FOM_reported_assistant_secretary_roles,7);
 assert.equal(d.FOM_reported_key_official_roles,5);
 assert.equal(d.FOM_counts_are_not_disjoint_first_level_institution_denominators,true);
 assert.equal(d.full_same_as_of_first_level_denominator,null);
});
test("six special legal relationships retain official citation without claiming delegated decision power",()=>{
 const x=ready.models["va-legal-issues"];
 assert.equal(x.length,6);
 assert(x.every(y=>y.effective_law_2026_verified===false&&y.legal_counsel_review_id===null));
 assert(x.find(y=>y.id==="E04E-LEGAL-CANTEEN").qualifying_reference.includes("7808"));
 assert(x.find(y=>y.id==="E04E-LEGAL-OEDCA").primary_reference.includes("319(a)(3)"));
 assert(x.find(y=>y.id==="E04E-LEGAL-CBCA").relationship_kind_candidate.startsWith("GSA_"));
});
test("source edition dates are distinct from 2026 legal effectiveness and archive promotion",()=>{
 const x=ready.models["source-temporal-index"];
 assert.equal(x.length,6);
 assert.equal(x.filter(y=>y.source_hash_in_predecessor_verified).length,5);
 assert(x.every(y=>!y.source_temporal_effect_is_2026_current));
});
test("all nine VA qualification conditions remain outside automation approval",()=>{
 assert.equal(ready.models["qualification-gates"].length,9);
 assert(ready.models["qualification-gates"].every(x=>x.status==="not_met"&&!x.verified));
 assert.equal(ready.models["va-dossier"][0].ADL1_status,"research_only_not_qualified");
});
test("model projections separate legal findings, sources and non-operative governance",()=>{
 assert.equal(projectVA04E(ready,"legal").items.length,6);
 assert.equal(projectVA04E(ready,"sources").items.length,6);
 assert.equal(projectVA04E(ready,"qualification").items.length,9);
 assert.equal(projectVA04E(ready,"governance").items.length,5);
 assert.throws(()=>projectVA04E(ready,"complete"),/unknown/);
});
reject("board resolution cannot be self-ratified in a research model",x=>{
 pick(x,"governance-decisions","E04E-GOV-RETENTION").ratified=true;
});
reject("ratified archive retention cannot be falsified by adding an arbitrary signer",x=>{
 pick(x,"signer-enrollments","E04E-SIGNER-ROOT-GOVERNANCE").institutionally_approved=true;
});
reject("a signer fingerprint cannot be inserted without an institution-controlled enrollment ceremony",x=>{
 pick(x,"signer-enrollments","E04E-SIGNER-INDEPENDENT-LEGAL").public_key_spki_sha256="f".repeat(64);
});
reject("the repository may not falsely claim a live AWS storage bucket was audited",x=>{
 pick(x,"storage-targets","E04E-ARCHIVE-PRIMARY").provider_proof_verified=true;
});
reject("CloudTrail data-event monitoring cannot be inferred from bucket declaration",x=>{
 pick(x,"storage-targets","E04E-ARCHIVE-PRIMARY").CloudTrail_data_events_verified=true;
});
reject("current VA legal effect cannot be asserted from 2024 statutory text",x=>{
 pick(x,"va-legal-issues","E04E-LEGAL-CANTEEN").effective_law_2026_verified=true;
});
reject("VA OIG independence cannot imply command power over audit findings",x=>{
 pick(x,"va-legal-issues","E04E-LEGAL-OIG").adjudication_outcome_inferred=true;
});
reject("independent OEDCA decisions cannot imply broad Treasury congressional fiscal powers",x=>{
 pick(x,"va-legal-issues","E04E-LEGAL-OEDCA").congressional_fiscal_authority_inferred=true;
});
reject("the CBCA cannot be relabeled as a VA first-level subordinate",x=>{
 pick(x,"va-legal-issues","E04E-LEGAL-CBCA").relationship_kind_candidate="VA_department_first_level";
});
reject("primary U.S. Code locator cannot silently be changed without source review",x=>{
 pick(x,"va-legal-issues","E04E-LEGAL-BVA").official_legal_source_url="https://example.org/fake";
});
reject("2023 cover / March 2025 modified manual does not prove the office exists in 2026",x=>{
 pick(x,"source-temporal-index","E04E-TEMP-FOM1").source_temporal_effect_is_2026_current=true;
});
reject("missing CBCA original cannot be rewritten as hash-verified source",x=>{
 pick(x,"source-temporal-index","E04E-TEMP-CBCA-HISTORY").source_hash_in_predecessor_verified=true;
});
reject("an incomplete 2026 VA census cannot be self-qualified",x=>{
 pick(x,"va-dossier","E04E-VA-DOSSIER").ADL1_status="certified";
});
reject("VA first-level organizational denominator cannot be replaced with webpage heading count",x=>{
 pick(x,"va-dossier","E04E-VA-DOSSIER").full_same_as_of_first_level_denominator=22;
});
reject("certification gate cannot be waived through CI",x=>{
 pick(x,"qualification-gates","E04E-QUAL-HUMAN").waived=true;
});
reject("source custody gate cannot be incorrectly marked complete",x=>{
 pick(x,"qualification-gates","E04E-QUAL-CUSTODY").verified=true;
});
reject("manifest cannot declare government institutional release authorization",x=>{
 x.manifest.federal_institutional_trust_04e_extension.public_release=true;
});
reject("source provenance model cannot alter 04D original VA PDF SHA256 receipts",x=>{
 x.files["model/federal/inc04d/observed-source-receipts.json"].items.find(x=>x.id==="D04D-OBS-FOM1").body_sha256="0".repeat(64);
});
