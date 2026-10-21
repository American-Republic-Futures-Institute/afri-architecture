# INC-15C.5 — FY2024 Department of Education coordinating-structure chart

**Status:** source-original-backed, source-bounded research; no statutory, command, legal-first-level or current-structure certification. **Parent:** [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50). **Execution issue:** [#62](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/62).

## Preserved official federal source

The Department of Education's *FY 2024 Annual Agency Performance Report* was published on **January 15, 2025**, and describes the **FY2024 departmental coordinating structure** on physical PDF page **10**, printed document page **5**. This is not a 2026 office roster or an exhaustive contemporary legal organizational directory.

The two official Department URL variants were HTTP **403** when probed. The PDF was retrieved instead from the U.S. Department of Education's official ERIC repository:
- Distribution: `https://files.eric.ed.gov/fulltext/ED673614.pdf`
- Distribution source classification: **official ED ERIC repository reproduction, not direct ED.gov publisher bytes**.
- Retained original: `evidence/education-fy2024/originals/sha256/0af9a9f4e11ddce14fffd467317d9e4c531e9931edb43abcb3ddb8e4fa6291b7.pdf`
- Original bytes: **5,675,466**; PDF format: **1.6**; 146 physical PDF pages.
- Original distribution SHA-256: `0af9a9f4e11ddce14fffd467317d9e4c531e9931edb43abcb3ddb8e4fa6291b7`.
- Git content blob SHA-1: `82eb949fa6b61c4483a188f9e75b3e73a86ae49b`.
- Acquisition run: `39663546563`, source artifact `12375557273`; separate acquisition and Git-retention receipts preserve the original attempt and classification.

The exact source's chart page was **rendered and visually inspected**. The printed chart text says it depicts the Department's *coordinating structure in FY2024*, not its complete legally established institution list. Git custody exists; independent signed/WORM custody and source comparison to the inaccessible ED.gov primary copy are explicitly **not established**.

## Original figure population and identity crosswalk

The diagram has **19 filled organization/grouping boxes**; each is transcribed exactly once with its observed PDF-page rectangle coordinates. The layout partitions are visual display cohorts, not legal command or supervision. The source census is:

| Cohort | Box count |
| --- | ---: |
| Secretary's Office and White House Initiatives side-group | 2 |
| Deputy Secretary label and five offices in deputy-column grouping | 6 |
| Seven central office or oversight labels | 7 |
| Under Secretary label and three office labels | 4 |
| **Whole bounded figure** | **19** |

Ten chart labels are explicitly reconciled to existing `CENSUS-COMP-ED-*` references and their `X12-OBS-CENSUS-COMP-ED-*` observations: OESE, OPE, OSERS, OCTAE, OCR, OELA, IES, FSA, OFO and OIG. Nine additional labels are **source observations only**: Secretary, Deputy Secretary, Under Secretary, White House Initiatives grouping, Chief Information Officer, Communications and Outreach, Planning/Evaluation/Policy Development, General Counsel, and Legislation/Congressional Affairs.

The chart's `White House Initiatives` box refers to **five named initiatives only in the report's footnote**. They are *not five additional figure boxes*, and this increment does not certify them as independent federal legal institutions. The `Office of Inspector General` box is preserved as an **independent oversight exception**, never subordinate departmental command or a Secretary's power to direct inspection findings. No current officeholders are transcribed.

The Government Manual's `GOVMAN-2025-12-31:115` department root is reconciled to the existing stable `ORG-FED-EXE-DEP-EDUCATION`, but its six-item federally aided corporations subtree is an **entirely different publisher population**, not the Department's office chart. Neither its five subentries nor the 2024 chart may be summed with the separate October 2026 office directory research records.

## Model and validation

- `model/federal/inc15c5-education-fy2024-chart-boxes.json` — 19 immutable source-page observations, exact coordinates, source-only grouping, ten prior X12 links, explicit unresolved legal identity and authority fields.
- `schemas/inc15c5-education-fy2024-chart-boxes.schema.json` — closed 2020-12 schema; all fields required, 19 entries bounded, authority inference fields constrained false.
- `scripts/validate-inc15c5-chart.mjs` — retained-PDF SHA and Git blob validation, pinned legacy component/X12 source hashes, exact figure transcription, Inspector General exclusion, White House grouping and Government Manual cross-epoch disjointness.
- `tests/inc15c5-education-chart.test.mjs` — positive figure replay and hostile mutations for missing/extra boxes, chart name/position tampering, stale/cross-branch canonical identity reuse, false delegated command, role promotion, and fabricated WORM/ED.gov originals.

Run:

```sh
node scripts/validate-inc15c5-original.mjs
node scripts/validate-inc15c5-chart.mjs
node --test tests/inc15c5-education-custody.test.mjs tests/inc15c5-education-chart.test.mjs
```

The **only counted denominator** is 19 *publisher figure boxes in this exact FY2024 edition*. **Current legal first-level institution denominator: null.** No direct Department original, legal review signoff, complete current chart, formal command/reporting graph or policy is asserted.

## Next source work

Acquire a separately dated 2025/2026 Education organization chart or office index original, document any revisions and effective dates, and reconcile the changed organization without erasing the FY2024 source. The official March 17, 2025 chart declares updates in progress; it must remain its own source edition. HHS publisher original HTML and legal classification are independent unresolved source-custody work. Mission/function and interagency relationships remain [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56).

No website, data-repository or policy-model changes.
