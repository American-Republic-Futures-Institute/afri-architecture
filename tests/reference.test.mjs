import test from "node:test";
import assert from "node:assert/strict";
import { loadReferenceData, validateReferenceData } from "../scripts/reference-validation-core.mjs";

const load = () => structuredClone(loadReferenceData());
const messages = d => validateReferenceData(d).failures.join(" | ");
const reject = (label, mutate, expected) => test(label, () => {
  const d = load(); mutate(d); assert.match(messages(d), expected);
});

test("INC-06 baseline resolves 3 branches, 15 departments, every catalog institution and 4 domains", () => {
  const res = validateReferenceData(load());
  assert.deepEqual(res.failures, []);
  assert.equal(res.summary.branches, 3);
  assert.equal(res.summary.departments, 15);
  assert.equal(res.summary.existing_institutions, 61);
  assert.equal(res.summary.domains, 4);
  assert.equal(res.summary.shared_capabilities, 8);
  assert.equal(res.summary.outcome_links, 29);
  assert.equal(res.summary.potential_contributors, 24);
});
reject("No silent ratification of institutional baseline", d => d.manifest.status="ratified",
  /must remain unratified/);
reject("No implied statutory power through reference manifest", d => d.manifest.publication_contract.authority_edge_status="authorized",
  /No authority edges/);
reject("Detect omitted Cabinet department from canonical baseline", d => {
  d.federal["model/federal/executive-departments.json"].items.pop();
}, /fifteen statutory executive departments|View expected count/);
reject("Detect excluded Congressional research-class institution", d => {
  d.view.federal_views.find(x=>x.id==="INST-VIEW-LEG").kinds.pop();
}, /View does not cover observed kind/);
reject("Prevent branch or court misclassification as cabinet office", d => {
  const record=d.federal["model/federal/judiciary.json"].items[0];
  record.branch_id="BR-FED-EXE";
}, /View misclassifies branch or institution/);
reject("Tribal government cannot be a federal subordinate", d => {
  d.view.non_federal.find(x=>x.jurisdiction_kind==="tribal_nations").federal_subordinate=true;
}, /Jurisdiction wrongly marked subordinate/);
reject("Do not invent territory organizational structure", d => {
  const x=d.view.non_federal.find(x=>x.jurisdiction_kind==="us_territories");
  x.status="fully_modeled";x.source_file="model/federal/legislative.json";
}, /Unsupported invented tribal\/territorial inventory/);
reject("D.C. cannot be reclassified as a fifty-first State", d => {
  d.view.non_federal.find(x=>x.jurisdiction_kind==="federal_district").source_file="model/state/jurisdictions.json";
}, /D\.C\. must remain non-State comparator/);
reject("Link cannot reference unknown domain capability", d => {
  d.links.items[0].domain_capability_ids=["EDU-C99"];
}, /Dangling domain capability/);
reject("Link cannot reference unknown domain outcome", d => {
  d.links.items[0].outcome_ids=["EDU-O99"];
}, /Dangling national outcome/);
reject("No duplicate cross-domain link pair", d => {
  const x=structuredClone(d.links.items[0]);x.id="XLINK-9999";d.links.items.push(x);
}, /Duplicate cross-domain link/);
reject("A shared capability needs independent rights guardrails", d => {
  d.capabilities.items[0].guardrails=[];
}, /Missing independent guardrails/);
reject("No automatic institution ownership of shared capability", d => {
  d.capabilities.items[0].owner_institution_id="ORG-FED-EXE-DEP-HHS";
}, /Government authority or owner assigned/);
reject("No FEAF certification claims from family-level mapping", d => {
  d.capabilities.items[0].feaf_mapping_status="certified_conformance";
}, /Misleading FEAF conformance/);
reject("No public mandates created by study-participation links", d => {
  d.candidates.items[0].government_power_assigned=true;
}, /Candidate used as de facto mandate/);
reject("No branch-as-service-operator candidate", d => {
  d.candidates.items[0].institution_id="BR-FED-LEG";
}, /Unknown institution or branch-as-executive/);
reject("Plan contract must remain immutable and consistent", d => {
  d.contract.commit_sha="main";
}, /Plan snapshot commit mismatch/);
reject("Outcome links are hypotheses, not enacted policies", d => {
  d.links.items[0].authority_asserted=true;
}, /Link wrongly asserts public authority/);
