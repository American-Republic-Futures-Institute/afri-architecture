# Federal Institutional Coverage Expansion — Increment 03

**ARFI-COA 0.1.0 · 2026-10-16 · Proposed research baseline · Not a legal opinion or certified government census.**

## Decision

This increment is independently branched from the merged federal census (PR #18). It does not include or supersede the open DoD institutional authority work in PR #19. Original 61 `ORG-FED-*` canonical institution IDs, the 29 Department of Defense/DHS/Education first-level candidates, and every existing identity crosswalk remain unchanged.

The finite **denominator is 58 of ARFI's 61 previously catalogued federal institution identities**, explicitly excluding the three department pilot roots. This is not a claim that 58 institutions comprise all other federal organizations. The full U.S. Government Manual institutional denominator and current first-level organizational denominators have **not** been extracted and reconciled.

## Bounded structural coverage

| Family | Previously identified ARFI reference identities in scope | First-level selected candidate seeds | Whole-institution ADL-1 certified |
|---|---:|---:|---:|
| Other 12 Cabinet departments | 12 | 24 (two source-index candidates per department) | 0 |
| President / VP / EOP and its seven pre-existing components | 10 | 0 additional; existing EOP parent relationships referenced | 0 |
| Selected nondepartment federal bodies | 18 | 0; legal classification explicitly unresolved | 0 |
| Congress, chambers and legislative support bodies | 9 | 4 sample Armed Services/Appropriations committees | 0 |
| Judiciary, court groups and judicial support bodies | 9 | 13 named U.S. appellate court candidates | 0 |
| **Total** | **58** | **41** | **0** |

All 58 existing canonical references now have a bounded expansion pointer and a typed *research-only* containment/affiliation edge, and all 41 selected seed units have their own typed source-context edge. The resulting 99-relationship atlas does **not** prove current reporting hierarchies, military command, lawful delegation, oversight power, court jurisdiction, or spending authority.

### Why the denominators are separated

- The **15 executive departments** have a definable statutory identity universe under [5 U.S.C. §101](https://uscode.house.gov/us/usc/119-118/t5/s101/), as displayed by OLRC through Public Law 119-120 (October 7, 2026). Three are PR #18 pilots; twelve form this increment's department reference slice.
- The remaining **46 cross-branch references** are ARFI's pre-existing selected institutions, not an exhaustive legal enumeration of those branches or independent agencies.
- **24 department components** are preliminary research candidates indexed to the [2025 U.S. Government Manual](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31). Exact individual granule/page citations, present-day first-level classification, source-to-component matching, and formal legal supervision remain unverified.
- **EOP:** The independent Government Manual [2024 EOP section](https://www.govinfo.gov/app/details/GOVMAN-2024-12-31/GOVMAN-2024-12-31-098) establishes a dated *historical* reference context only. Do not infer these 2024 components remain identical in October 2026.
- **Congress:** The [119th House Rules and Manual](https://www.govinfo.gov/app/details/HMAN-119) and [Senate's 119th committee directory](https://www.senate.gov/committees/index.htm) provide separate, time-qualified committee research slices. Neither proves a support agency reports administratively to a congressional chamber or that any particular subcommittee has a modeled statutory power.
- **Judiciary:** The U.S. Courts' [Court Role and Structure](https://www.uscourts.gov/about-federal-courts/court-role-and-structure) describes **13 federal courts of appeals, 94 district courts and 90 bankruptcy courts**. This increment seeds the thirteen appellate names as candidates but does not enumerate the district and bankruptcy courts or claim verified individual court jurisdiction. Article I tribunals must not be included as regular Article III courts without separate legal classification.

## Model and source contract

Nine new manifest-registered families live in `model/federal/expansion/`: `sources`, `snapshots`, `roster`, `department-seeds`, `crossbranch-seeds`, `relationships`, `coverage-ledger`, `gaps`, and `viewpoints`. Their fields are closed to undocumented additions by `schemas/federal-expansion.schema.json`; the validation engine independently enforces canonical ID reuse, source-URL integrity, edition limitations, branch/parent consistency, ADL non-promotion, legal limits, denominator arithmetic and explicit gaps.

Six declarative read-only views are available:

- `VIEW-EXP-ALL`: complete *selected 58-reference slice* with research candidates, three constitutional branch anchors and typed edges.
- `VIEW-EXP-DEPARTMENTS`: twelve nonpilot department references and 24 candidate units; may be narrowed to one department.
- `VIEW-EXP-EOP`, `VIEW-EXP-INDEPENDENT`, `VIEW-EXP-CONGRESS`, `VIEW-EXP-JUDICIARY`: separate legal/institutional domains, not one invented hierarchy.

Publication integration remains **not implemented**. Do not use these records to advertise completeness percentages for the entire federal government.

## Test and inspection

```sh
node scripts/validate-federal-expansion.mjs --validate
node scripts/validate-federal-expansion.mjs --view VIEW-EXP-ALL
node scripts/validate-federal-expansion.mjs --view VIEW-EXP-DEPARTMENTS --root ORG-FED-EXE-DEP-TREASURY
node scripts/validate-federal-expansion.mjs --view VIEW-EXP-CONGRESS
node scripts/validate-federal-expansion.mjs --view VIEW-EXP-JUDICIARY
node scripts/validate-federal-expansion-schema.mjs
node --test tests/federal-expansion.test.mjs
```

Regressions must reject mixed jurisdiction/branch parentage, invented legal or external identifiers, official-host source substitution, unsupported ADL promotion, a fabricated current EOP, false whole-of-government completion, mistaken independent-agency legal classification, unsupported appropriations, unverified appellate jurisdiction, and any closed gaps without source reconciliation.

## Next research increments

1. Retrieve and hash precise individual GovInfo granules, then reconcile each department's complete first-level roster and distinguish direct organizational containment from directory proximity.
2. Reconcile modern EOP organization with a dated contemporaneous primary source, statutory/EO basis for specific offices, and temporal name events.
3. Classify all 18 selected nondepartment bodies according to their governing laws and reconcile a source-complete, clearly defined external census; do not treat independence as a uniform legal category.
4. Model House and Senate separately at committee/subcommittee/rules/oversight depth, then distinguish legislative agencies by their actual statutory governance.
5. Pin individual appellate/district/bankruptcy court identities, judicial districts, territorial jurisdiction, Article I tribunals, and procedural appeal routes to competent legal sources.
6. Once reviewed, connect confirmed institutions to separate statutory, fiscal, program, operational and public-outcome model families through lawful authority traces. This increment does not add those powers.

**No ADL-1 completion, source-level human/citator review, enacted appropriation, agency delegation, official source identifier or website rendering is declared.**
