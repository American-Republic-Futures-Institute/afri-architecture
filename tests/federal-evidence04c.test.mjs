import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PATHS,PRIOR,validateVA04C,inspect04cSchema,projectVA04C
} from "../scripts/validate-federal-evidence04c-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const original={manifest:read("model/federal/manifest.json"),
 schema:read("schemas/federal-evidence-registry-04c.schema.json"),
 files:Object.fromEntries([...PATHS,...PRIOR].map(p=>[p,read(p)]))};
const valid=validateVA04C(original.manifest,original.files,original.schema);
const named=f=>"model/federal/inc04c/"+f+".json";
const find=(f,family,id)=>{const x=f.files[named(family)].items.find(x=>x.id===id);
 assert(x,"unknown test fixture "+id);return x;};
const reject=(name,mutate,reason=/VA evidence registry rejected/)=>test(name,()=>{
 const f=structuredClone(original);mutate(f);
 assert.throws(()=>validateVA04C(f.manifest,f.files,f.schema),reason);
});
test("strict nine-family draft 2020-12 schemas reject undeclared legal authority fields",()=>{
 const r=inspect04cSchema(original.schema,original.files);
 assert.deepEqual(r.errors,[]);
 assert.equal(r.collections,9);
 const f=structuredClone(original.files);
 f[named("va-coverage")].items[0].official_first_level_legal_certified=true;
 assert(inspect04cSchema(original.schema,f).errors.some(x=>x.includes("unknown field")));
});
test("seven actual witnessed historical receipt identities remain pinned; HHS live HTML is absent",()=>{
 const x=valid.models["archive-index"];
 assert.equal(x.length,8);
 assert.equal(x.filter(y=>y.observed_sha256!==null).length,7);
 assert.equal(x.find(y=>y.source_id==="ARCH04B-HHS-HTML").observed_sha256,null);
 assert(x.every(y=>y.durable_object_verified===false&&y.trusted_signature_verified===false));
});
test("VA 2026 HTML reproduces precisely three administration and nineteen staff heading identities",()=>{
 assert.equal(valid.models["va-directory"].length,22);
 assert.equal(valid.models["va-directory"].filter(x=>x.source_heading==="Administrations").length,3);
 assert.equal(valid.models["va-directory"].filter(x=>x.source_heading==="Staff Offices").length,19);
 assert(valid.models["va-directory"].every(x=>x.source_sha256===
  "40d3130d0484607014295318fd3d9aefacc5462ac34332f89a902c99c4e96c24"));
});
test("VA Office of Secretary is a separate documented heading outside the 22-section denominator",()=>{
 const l=valid.models["va-coverage"][0];
 assert.equal(l.office_of_secretary_header_outside_section,true);
 assert.equal(l.source_section_total,22);
 assert.equal(l.whole_department_first_level_denominator,null);
});
test("38 USC 301(c) nine clauses cover seven names and two indefinite statutory categories",()=>{
 const s=valid.models["va-statutory-composition"];
 assert.equal(s.length,9);
 assert.equal(s.filter(x=>x.reconciliation==="open_residual_category_not_enumerated").length,2);
 assert.equal(s.filter(x=>x.reconciliation.startsWith("matched")).length,4);
 assert.equal(s.filter(x=>x.reconciliation.startsWith("not_in")).length,2);
 assert(s.every(x=>x.published_primary_legal_text_sha256===null&&
  x.first_level_legal_inclusion_reviewed===false));
});
test("Veterans Canteen Service and VA Board of Contract Appeals remain unresolved, not repealed by a directory omission",()=>{
 const s=valid.models["va-statutory-composition"];
 for(const id of ["6","7"]){
  const x=s.find(y=>y.id==="AR04C-VA-STAT-301-C-"+id);
  assert.equal(x.directory_candidate_id,null);
  assert.equal(x.existence_2026_independently_verified,false);
 }
 assert(valid.models["va-gaps"].some(x=>x.id==="AR04C-GAP-VA-CONTRACT-APPEALS"));
});
test("VA Inspector General and BVA and separate OEDCA adjudication research remain blocked",()=>{
 for(const k of ["OIG","BVA","OEDCA"]){
  const x=valid.models["va-directory"].find(x=>x.inc04a_candidate_id==="DEPT04-UNIT-VA-"+k);
  assert(x&&!x.legal_authority_verified&&!x.reporting_parent_verified);
  assert(valid.models["va-gaps"].some(y=>y.id==="AR04C-GAP-VA-"+k));
 }
});
test("five independent professional reviews cannot be inferred from CI",()=>{
 assert.equal(valid.models.approvals.length,5);
 assert(valid.models.approvals.every(x=>x.identity===null&&x.decision==="pending"&&
   x.signed_approval_proof===null&&x.not_satisfied_by_CI));
});
test("no trusted signing keys, protected archive retention or legal authority are configured",()=>{
 const policy=valid.models["trust-policy"][0];
 assert.deepEqual(policy.approved_signer_identifiers,[]);
 assert.equal(policy.retention_policy_ratified,false);
 assert.equal(policy.archived_bytes_signature_verified,false);
 assert.equal(valid.counts.certified_ADL1,0);
});
test("HHS 403 cannot be bypassed or treated as equivalent to a different 2026 overview",()=>{
 const x=valid.models["hhs-acquisition"];
 assert.equal(x.length,2);
 assert(x.every(z=>z.equivalent_to_2025_HHS_chart===false&&z.access_control_bypass_prohibited));
});
test("two March 2025 FOM volumes are temporal evidence candidates rather than proven 2026 replacements",()=>{
 const x=valid.models["va-source-versions"];
 assert.equal(x.length,4);
 assert(x.filter(v=>v.source_payload_sha256===null).length===3);
 assert(x.every(v=>v.legal_effect_from_difference===false&&v.change_event_id===null));
});
test("source section and legal composition viewpoints show different populations",()=>{
 assert.equal(projectVA04C(valid,"directory").records.length,22);
 assert.equal(projectVA04C(valid,"statutory").records.length,9);
 assert.equal(projectVA04C(valid,"gaps").records.length,11);
 assert.throws(()=>projectVA04C(valid,"complete-federal-government"),/unknown/);
});
reject("a fabricated permanent digest archive cannot change custody status",f=>{
 find(f,"archive-index","AR04C-REG-ARCH04B-VA-HTML").durable_object_verified=true;
});
reject("one altered byte digest pin cannot silently replace recorded VA original bytes",f=>{
 find(f,"archive-index","AR04C-REG-ARCH04B-VA-HTML").observed_sha256="f".repeat(64);
});
reject("missing original HHS HTML cannot be declared source-verified",f=>{
 find(f,"archive-index","AR04C-REG-ARCH04B-HHS-HTML").observed_sha256="1".repeat(64);
});
reject("HHS access-control bypass must not be an approved capture option",f=>{
 find(f,"hhs-acquisition","AR04C-HHS-AUTHORIZED-ACQUISITION").access_control_bypass_prohibited=false;
});
reject("an alternate HHS organization index is not the original dated chart",f=>{
 find(f,"hhs-acquisition","AR04C-HHS-CORROBORATING-2026-INDEX").equivalent_to_2025_HHS_chart=true;
});
reject("VA source heading candidate cannot be mislabeled as a current statutory office",f=>{
 find(f,"va-directory","AR04C-VA-ROW-OIG").statutory_subtype_verified=true;
});
reject("VA Board of Veterans Appeals cannot receive invented reporting power from a directory",f=>{
 find(f,"va-directory","AR04C-VA-ROW-BVA").reporting_parent_verified=true;
});
reject("VA adjudication cannot be certified on a heading alone",f=>{
 find(f,"va-directory","AR04C-VA-ROW-OEDCA").legal_authority_verified=true;
});
reject("wrong VA employee office cannot replace named statute's NCA",f=>{
 find(f,"va-statutory-composition","AR04C-VA-STAT-301-C-4").directory_candidate_id="DEPT04-UNIT-VA-OIG";
});
reject("Veterans Canteen Service statutory body cannot be silently declared absent or abolished",f=>{
 find(f,"va-statutory-composition","AR04C-VA-STAT-301-C-6").existence_2026_independently_verified=true;
});
reject("the VA Board of Contract Appeals name cannot be marked a proved current adjudicator",f=>{
 find(f,"va-statutory-composition","AR04C-VA-STAT-301-C-7").first_level_legal_inclusion_reviewed=true;
});
reject("open statutory catchall cannot be treated as a finite count",f=>{
 find(f,"va-statutory-composition","AR04C-VA-STAT-301-C-8").reconciliation="matched_administration";
});
reject("a false 22 of 22 complete-department headline is blocked",f=>{
 find(f,"va-coverage","AR04C-VA-BASELINE").whole_department_first_level_denominator=22;
});
reject("an incomplete directory cannot self-certify ADL1",f=>{
 find(f,"va-coverage","AR04C-VA-BASELINE").certified_adl1=true;
});
reject("professional human review cannot be fabricated from an automated check",f=>{
 f.files[named("approvals")].items[0].decision="approved";
});
reject("a fictitious signing key cannot be enrolled through research JSON",f=>{
 find(f,"trust-policy","AR04C-TRUST-POLICY").approved_signer_identifiers.push("fake-signer");
});
reject("an unratified retention schedule cannot become policy through model edit",f=>{
 find(f,"trust-policy","AR04C-TRUST-POLICY").retention_policy_ratified=true;
});
reject("an absent March 2025 manual cannot be represented as a verified hash",f=>{
 find(f,"va-source-versions","AR04C-VERSION-FOM-2025-V1").source_payload_sha256="e".repeat(64);
});
reject("VA dated source difference cannot be interpreted as abolition",f=>{
 find(f,"va-source-versions","AR04C-VERSION-VA-AFR-2024").absence_means_abolished=true;
});
reject("removal of the statutory Board of Contract Appeals gap is not legal reconciliation",f=>{
 f.files[named("va-gaps")].items=f.files[named("va-gaps")].items.filter(x=>!x.id.endsWith("CONTRACT-APPEALS"));
});
reject("a complete source archive cannot be inferred from seven of eight documents",f=>{
 f.manifest.federal_evidence_registry_extension.promoted_durable_bytes=7;
});
reject("granting any VA ADL1 authority before legal review is prohibited",f=>{
 f.manifest.federal_evidence_registry_extension.VA_ADL1_certified=true;
});
