# Federal Institutional Census and Decomposition Contract — Increment 01

**ARFI-COA v0.1.0 · 2026-10-16 · Source-bounded research baseline, unratified.**

## Objective

Before expanding every federal department, distinguish (1) government entities cataloged by official sources, (2) the **61 existing canonical ARFI federal institution identities**, and (3) the much smaller number of organizations whose constituent composition has been individually examined. This increment establishes the data contract, dated sources, identity references, explicit gaps, and bounded departmental pilots. It does **not** claim a complete federal government census.

This is a research-completeness scale independent of ARFI's pre-existing L0–L4 *principles, institutions, outcomes, capabilities, reform* architecture.

| ADL | Research goal | Minimum evidence |
|---|---|---|
| 0 — Identified | A source has identified a candidate entity | Stable ARFI ID, official source, jurisdiction, candidate category |
| 1 — Structured | Organization documented within a declared source scope | Verified dated first-level constituents, typed organizational relations, effective status |
| 2 — Authorized | Specific authorities mapped | Applicable legal provision, actor, bounded power, legal conditions and review status |
| 3 — Implemented | Programs and fiscal links reconciled | Delegations, program authorities, implementing rules, appropriations |
| 4 — Operational | Delivery and decisions characterized | Public processes, service channels, information exchanges, remedies |
| 5 — Evidenced | Effectiveness assessed | Cost, outputs, outcomes, risks, audits, source and human review |

The new registry marks every recorded entity **ADL-0**. Even the DoD statutory components remain ADL-0 because a finite source slice is not proof that the current operational organization has been fully verified. No entity is claimed to have obtained full-organization ADL-1.

## Machine-readable collections

| New model | Responsibility |
|---|---|
| `coverage/taxonomy.json` | 13 institution classes and caveats distinguishing Cabinet, executive, military, legislative, judicial, IG and unresolved federal bodies |
| `coverage/institution-references.json` | Nonduplicating reference to all 61 existing `ORG-FED-*` records; no invented external official identifier |
| `coverage/source-registry.json` | Eight official government source references with dated citations and limitations |
| `coverage/source-snapshots.json` | Four separate edition/retrieval contexts with explicit completeness limitations |
| `coverage/components.json` | Nine statutory DoD classes/organizations, ten DHS organizations, ten Education offices |
| `coverage/relationships.json` | 29 typed component-to-department composition relations, not legal powers or command authority |
| `coverage/gaps.json` | Nine open deficits, including first-level coverage of the three pilots, the other departments, EOP, Congress, independent bodies and courts |
| `coverage/viewpoints.json` | One whole-of-baseline selection and three isolated departmental data-only viewpoints |

All eight files are included in `model/federal/manifest.json`. Existing canonical federal organization records, official sources and IDs remain unchanged. JSON schema: `schemas/federal-census.schema.json`.

The `official_external_identifier` field is `null` throughout: ARFI's stable ID must not be confused with an official Government Manual, OMB, Treasury or other external agency identifier. A future crosswalk may be created *only after* a source's identifier semantics are verified.

## Source snapshot boundaries

- [**U.S. Government Manual, December 31 2025**](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31): immutable annual federal handbook edition for future systematic enumeration. The 61 existing ARFI records are not asserted to exhaust the handbook.
- [**10 U.S.C. § 111**](https://uscode.house.gov/us/usc/119-118/t10/s111/): DoD organization classes and military departments in the cited October 7 2026 law-version context. Nine source components/groups are cataloged; *Defense Agencies* and *combatant commands* remain **classes**, not pretend agency or command rosters.
- [**DHS FY2024 Performance Report, organizational chart p. 24**](https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf): used only as a dated 2025 source for ten selected operational/support/oversight elements. It is **not** evidence of unchanged October 2026 structure. DHS Inspector General is a separately qualified oversight relationship, not a generic executive-command relation.
- [**Department of Education official offices**](https://www.ed.gov/about/ed-offices): used as a mutable web directory for ten selected offices. It is explicitly *not* falsely labeled immutable. [20 U.S.C. § 3422](https://uscode.house.gov/us/usc/119-118/t20/s3422/) separately provides Education's IG identity. Office descriptions alone do not certify statutory delegation or available appropriations.

Sources have their own publication/retrieval dates, revision basis, scope notes and official HTTPS URLs. Government Manual data and mutable live offices must not silently share a fictitious single timestamp. The existing ARFI federal manifest's earlier date is preserved for backward compatibility; this census extension carries its own `reference_as_of`.

## Relationship and presentation contract

`statutory_composition_only` means a component or category is enumerated in a legal composition provision, not that it has any specified delegated power. `agency_directory_or_chart_membership` means sourced membership, not present-day operational command. `independent_oversight_placement_not_command` explicitly protects the distinction between an Inspector General's placement and statutory independent oversight.

No relation may set `operational_command_proven` or `delegated_statutory_power_proven` to true. All component records retain `legal_authority_status: not_mapped`, `delegation_verified: false`, `appropriation_verified: false`, and unreviewed legal classifications.

`VIEW-CENSUS-BASELINE` selects the canonical 61 institutional identities; `VIEW-CENSUS-DEFENSE-COMPONENTS`, `VIEW-CENSUS-DHS-COMPONENTS` and `VIEW-CENSUS-EDUCATION-COMPONENTS` select their parents and component candidates. They are **model-only** viewpoints, not published website UX.

## Quality gates

```sh
node scripts/validate-federal-census.mjs --validate
node scripts/validate-federal-census.mjs --view VIEW-CENSUS-DEFENSE-COMPONENTS
node --test tests/federal-census.test.mjs
```

CI must also execute all prior constitutional, judicial, federal statutory, State and source graph checks. Negative tests reject invented official source identifiers, component cross-branch affiliation, unverified ADL promotions, forged source hosts, fictitious command/delegation, suppressed source gaps and unsupported claims of complete coverage.

## Subsequent independent PRs

**02: DoD ADL-1 / bounded ADL-2** — reconcile a current complete first-level roster; identify legally separate organizational, operational-command, IG oversight and military-department relationships; trace 10 U.S.C. § 111–113 and narrower powers/limitations with effective dates. Congressional authorization and fiscal authority are separate legal source collections.

**03: Broad ADL-1 government scope** — enumerate the other twelve departments and major nondepartment bodies against a declared Government Manual denominator, preserving temporal identities and source conflicts. Congress, courts and EOP require separate subtype research.

**04: Programs, budget, services, safeguards and outcomes** — add account- and program-level evidence and lawfully scoped fiscal traces before attributing outcomes or enabling reform proposals.

ARFI's canonical source model remains in `afri-architecture`. The website, policy mapping and public-comment infrastructure are unchanged by this PR.
