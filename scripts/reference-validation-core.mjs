// ARFI INC-06: validate non-authoritative institution views and shared-capability references.
// This module never grants legal authority or calls network services.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (root, p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const federalFiles = [
  "model/federal/branches.json",
  "model/federal/legislative.json",
  "model/federal/executive-leadership.json",
  "model/federal/executive-departments.json",
  "model/federal/executive-independent.json",
  "model/federal/judiciary.json",
];

export function loadReferenceData(root = repositoryRoot) {
  const federal = Object.fromEntries(federalFiles.map(p => [p, read(root, p)]));
  return {
    manifest: read(root, "model/reference/manifest.json"),
    view: read(root, "model/reference/institution-view.json"),
    contract: read(root, "model/reference/domain-contract.json"),
    capabilities: read(root, "model/reference/shared-capabilities.json"),
    links: read(root, "model/reference/capability-relationships.json"),
    candidates: read(root, "model/reference/institution-candidates.json"),
    federal,
    stateJurisdictions: read(root, "model/state/jurisdictions.json"),
    stateComparators: read(root, "model/state/nonstate-comparators.json"),
  };
}

export function validateReferenceData(d) {
  const failures = [];
  const insist = (ok, message) => { if (!ok) failures.push(message); };
  const unique = xs => new Set(xs).size === xs.length;
  const isText = x => typeof x === "string" && x.trim().length > 0;
  const items = x => Array.isArray(x?.items) ? x.items : [];
  const exactKeys = (given, expected) => given.length === expected.length &&
    expected.every(v => given.includes(v));

  insist(d.manifest?.standard === "ARFI-COA", "Reference standard must be ARFI-COA");
  insist(d.manifest?.status === "research_baseline_unratified", "Reference model must remain unratified");
  insist(d.manifest?.version === "0.1.0", "Unknown reference model version");
  insist(d.manifest?.source_catalog === "model/federal/manifest.json", "Reference must use canonical federal catalog");
  insist(/^([0-9a-f]{40})$/.test(d.manifest?.plan_contract?.commit_sha ?? ""), "Plan contract must use an immutable commit SHA");
  insist(d.manifest?.plan_contract?.authoritative_content_status === "draft_unratified", "Imported plan is not ratified");
  insist(d.manifest?.publication_contract?.authority_edge_status === "not_asserted", "No authority edges permitted");
  const requiredModels = [
    "institution-view", "domain-contract", "shared-capabilities",
    "capability-relationships", "institution-candidates"
  ].map(x => "model/reference/" + x + ".json");
  insist(exactKeys(d.manifest?.models ?? [], requiredModels), "Manifest must list exact overlay model files");
  const groups = [d.view,d.contract,d.capabilities,d.links,d.candidates];
  insist(groups.every(x => x?.version === d.manifest?.version), "Cross-model version mismatch");

  const federalActors = Object.entries(d.federal ?? {}).flatMap(([file, data]) =>
    items(data).map(actor => ({...actor, source_file:file})));
  const actorIds = federalActors.map(x => x.id);
  const actors = new Map(federalActors.map(x => [x.id, x]));
  insist(unique(actorIds), "Duplicate canonical federal actor");
  const branches = federalActors.filter(x => x.type === "branch");
  insist(exactKeys(branches.map(x => x.id),
    ["BR-FED-LEG","BR-FED-EXE","BR-FED-JUD"]), "Exactly three constitutional branches required");
  const depts = federalActors.filter(x => x.kind === "executive_department");
  insist(depts.length === 15, "Exactly fifteen statutory executive departments expected");
  insist(depts.every(x => x.parent_id === "BR-FED-EXE"), "Cabinet departments not grouped under executive branch");
  insist(d.view?.semantics?.legal_power?.includes("insufficient"), "View must disclaim legal power from membership");

  const covered = [];
  const viewIds = (d.view?.federal_views ?? []).map(x => x.id);
  insist(unique(viewIds), "Duplicate reference view ID");
  for (const v of d.view?.federal_views ?? []) {
    insist(actors.has(v.branch_id) && actors.get(v.branch_id)?.type === "branch", "Unknown branch in " + v.id);
    insist(Array.isArray(v.files) && v.files.length > 0, "Missing source files in " + v.id);
    insist(v.coverage === "existing_catalog_only" || v.coverage === "selected_non_exhaustive" || v.coverage === "existing_aggregates_only" || v.coverage === "fifteen_cabinet_departments_only",
      "Unknown coverage status in " + v.id);
    for (const file of v.files ?? []) {
      insist(Object.prototype.hasOwnProperty.call(d.federal ?? {}, file), "View source does not exist: " + file);
      const candidates = items(d.federal?.[file]);
      insist(candidates.length > 0, "View source is empty: " + file);
      for (const actor of candidates) {
        insist(v.kinds?.includes(actor.kind), "View does not cover observed kind " + actor.kind + " in " + v.id);
        insist(actor.branch_id === v.branch_id && actor.type === "institution", "View misclassifies branch or institution " + actor.id);
        if (v.kinds?.includes(actor.kind) && actor.branch_id === v.branch_id) covered.push(actor.id);
      }
      if (typeof v.expected_count === "number") insist(candidates.length === v.expected_count, "View expected count differs: " + v.id);
    }
  }
  insist(unique(covered), "An institution appears in more than one federal view");
  insist(exactKeys(covered, federalActors.filter(x=>x.type === "institution").map(x=>x.id)), "Not all existing federal institutions have a reference view");
  const scopes = d.view?.non_federal ?? [];
  insist(scopes.length === 5 && unique(scopes.map(x=>x.id)), "Expected five distinct non-federal scope categories");
  for (const kind of ["member_states","federal_district","tribal_nations","us_territories","local_government"])
    insist(scopes.some(x=>x.jurisdiction_kind === kind), "Missing independent jurisdiction category " + kind);
  for (const s of scopes) {
    insist(s.federal_subordinate === false, "Jurisdiction wrongly marked subordinate to federal branch: " + s.id);
    if (s.jurisdiction_kind === "tribal_nations" || s.jurisdiction_kind === "us_territories")
      insist(s.status === "research_pending" && s.source_file === null, "Unsupported invented tribal/territorial inventory");
  }
  insist(items(d.stateJurisdictions).length === 50, "State jurisdiction inventory must cover the 50 States");
  insist(scopes.find(x=>x.jurisdiction_kind==="member_states")?.source_file === "model/state/jurisdictions.json", "Member States must use State model");
  insist(scopes.find(x=>x.jurisdiction_kind==="federal_district")?.source_file === "model/state/nonstate-comparators.json", "D.C. must remain non-State comparator");
  for (const p of d.view?.publication_views ?? []) {
    insist(isText(p.id) && Array.isArray(p.selector_ids), "Malformed publication view");
    for (const id of p.selector_ids ?? []) insist([...viewIds,...scopes.map(x=>x.id)].includes(id), "Publication view dangling selector " + id);
  }

  const domains = d.contract?.domains ?? [];
  const domainMap = new Map(domains.map(x=>[x.id,x]));
  insist(exactKeys(domains.map(x=>x.id), ["DOM-02","DOM-03","DOM-05","DOM-12"]), "Expected four imported manuscript domains");
  insist(d.contract?.commit_sha === d.manifest?.plan_contract?.commit_sha, "Plan snapshot commit mismatch");
  insist(d.contract?.status === "source_snapshot_unratified", "Domain contract cannot become ratified implicitly");
  insist(d.contract?.repository === d.manifest?.plan_contract?.repository, "Plan repository mismatch");
  for (const dmn of domains) {
    insist(isText(dmn.plan_path) && dmn.plan_path.startsWith("manuscript/"), "Domain plan file path missing: " + dmn.id);
    for (const [name,kind] of [["outcome_ids","O"],["capability_ids","C"],["progress_ids","P"]]) {
      const records = dmn[name] ?? [];
      insist(records.length > 0 && unique(records), "Missing/duplicate " + name + ": " + dmn.id);
      for (const id of records) insist(/^[A-Z]{3}-(O|C|P)[0-9]{2}$/.test(id) && id.includes("-"+kind), "Malformed domain ref " + id);
    }
  }
  const capRecords = items(d.capabilities);
  const capIds = capRecords.map(x=>x.id), capMap = new Map(capRecords.map(x=>[x.id,x]));
  insist(capRecords.length >= 4 && unique(capIds), "Shared capabilities missing or duplicated");
  insist(d.capabilities?.status === "candidate_shared_capabilities_unratified", "Shared capability catalog cannot be ratified");
  for (const c of capRecords) {
    insist(/^CAP-XDOM-[0-9]{3}$/.test(c.id), "Bad shared capability ID");
    insist(isText(c.name) && c.definition?.length >= 35, "Incomplete shared capability " + c.id);
    insist(c.status === "research_hypothesis_unratified", "Shared capability wrongly adopted as fact " + c.id);
    insist(c.government_power_assigned === false && c.owner_institution_id === null, "Government authority or owner assigned to " + c.id);
    insist(c.feaf_mapping_status === "reference_family_only_not_certified", "Misleading FEAF conformance " + c.id);
    insist(Array.isArray(c.feaf_reference_model_families) && c.feaf_reference_model_families.length > 0, "Missing FEAF reference for " + c.id);
    insist(Array.isArray(c.guardrails) && c.guardrails.length >= 2 && c.guardrails.every(isText), "Missing independent guardrails " + c.id);
  }
  const links = items(d.links);
  insist(d.links?.status === "conceptual_traces_unratified", "Outcome links cannot be adopted policy");
  insist(unique(links.map(x=>x.id)) && unique(links.map(x=>x.shared_capability_id+"|"+x.domain_id)), "Duplicate cross-domain link");
  for (const l of links) {
    insist(/^XLINK-[0-9]{4}$/.test(l.id), "Malformed capability link ID " + l.id);
    insist(capMap.has(l.shared_capability_id), "Dangling shared capability link " + l.id);
    const domain = domainMap.get(l.domain_id);
    insist(!!domain, "Dangling domain link " + l.id);
    for (const id of l.domain_capability_ids ?? [])
      insist(!!domain?.capability_ids?.includes(id), "Dangling domain capability " + l.id + ": " + id);
    for (const id of l.outcome_ids ?? [])
      insist(!!domain?.outcome_ids?.includes(id), "Dangling national outcome " + l.id + ": " + id);
    insist(l.outcome_ids?.length > 0 && l.domain_capability_ids?.length > 0 && isText(l.rationale), "Incomplete cross-domain trace " + l.id);
    insist(l.relationship_type === "candidate_enabler_of" && l.status === "research_hypothesis_unratified" && l.authority_asserted === false, "Link wrongly asserts public authority " + l.id);
  }
  for (const id of capIds) insist(new Set(links.filter(x=>x.shared_capability_id===id).map(x=>x.domain_id)).size >= 2, "Non-shared capability incorrectly placed in shared catalog " + id);
  const candidateRecords = items(d.candidates);
  insist(unique(candidateRecords.map(x=>x.id)) && unique(candidateRecords.map(x=>x.shared_capability_id+"|"+x.institution_id)), "Duplicate institutional candidate");
  insist(d.candidates?.status === "research_connections_not_assignments", "Institution link catalog attempts authority assignment");
  for (const c of candidateRecords) {
    insist(/^ICAND-[0-9]{4}$/.test(c.id), "Malformed institution candidate ID " + c.id);
    insist(capMap.has(c.shared_capability_id), "Dangling candidate capability " + c.id);
    insist(actors.get(c.institution_id)?.type === "institution", "Unknown institution or branch-as-executive " + c.institution_id);
    insist(c.relation === "potential_study_contributor" && c.current_legal_authority === "not_verified_by_this_model" &&
      c.government_power_assigned === false && c.status === "research_candidate_unratified", "Candidate used as de facto mandate " + c.id);
    insist(isText(c.rationale), "Candidate needs a specific reason " + c.id);
  }
  return {failures, summary:{
    branches:branches.length,departments:depts.length,existing_institutions:covered.length,
    domains:domains.length,shared_capabilities:capRecords.length,outcome_links:links.length,
    potential_contributors:candidateRecords.length,independent_jurisdiction_scopes:scopes.length
  }};
}

export function validateReference(root = repositoryRoot) {
  return validateReferenceData(loadReferenceData(root));
}
