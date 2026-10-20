# INC-15A — Source-scoped federal institutional census breadth

Status: **research baseline, unratified**. This increment implements a bounded **institutional breadth and denominator contract**, not a fully reconciled government organization chart or an independent legal certification.

Canonical predecessor: [afri-architecture source baseline `359694ec26e5e65d0915485d05f2df2631ad2d15`](https://github.com/American-Republic-Futures-Institute/afri-architecture/tree/359694ec26e5e65d0915485d05f2df2631ad2d15). Original source manifest Git blob: `a92db5009ccdf5439ffe8381707b16bb372b99e6`. The source baseline had 270 manifest collection paths; this PR declares three new research collections (273 total).

## What is counted — and what is not

The new `model/federal/inc15-cohorts.json` registers **twelve source-scoped populations**. Eight have a verified **model-record count**, based on the exact original Git blob and edition; four are deliberately unknown. Counts below describe **source records within a particular publication or ARFI model**, not a deduplicated population of institutions.

| Source population | Recorded source entries | What it can support |
| --- | ---: | --- |
| Cabinet department canonical roster / 5 U.S.C. 101 lookup | 15 | Existing fifteen executive-department identities; legal name-label transcription is not independently signed off |
| Existing INC-12 ARFI institutional references | 61 | Earlier *overlapping internal model references*, never the whole federal government |
| DoD 10 U.S.C. 111(b) | 11 | Nine identified earlier component candidates and **two residual statutory classes**, not 11 staffed first-level offices |
| DOJ dated chart connector observations | 36 | Dated DOJ source-chart observations, not 36 direct reports or individual delegated powers |
| VA published directory headings | 22 | 3 administration headings plus 19 staff headings; does not prove complete current first level |
| VA statutory clauses | 9 | Statutory composition clauses with residual classes, not additional nine staffed units |
| VA cross-source candidate union | 25 | Research candidate set overlapping the preceding 22 directory entries; **must not add** |
| House and Senate appropriations directory observations | 24 | Two 12-entry publisher-page lists, with two identities already represented in INC-14; not total congressional jurisdiction |
| EOP current first-level population | **Unknown** | Existing EOP references are not an exhaustively reconciled first-level count |
| Independent bodies current first-level population | **Unknown** | Existing sampled agencies do not constitute a complete statutory or administrative universe |
| Legislative branch current first-level population | **Unknown** | Representative organizations and committee lists cannot be used as a complete branch census |
| Judicial branch current first-level population | **Unknown** | Aggregate court totals and representative references require individual court/jurisdiction identity reconciliation |

Each collection is pinned to the predecessor Git commit, source-model blob, original research snapshot (where available), and explicit source-semantic count type. No cohort is additive to any other without a future independently documented, source-matched nonoverlap proof.

The key denominator distinction is between **(a) original publisher or source-list record count**, **(b) deduplicated institutional identity count within an explicitly enumerated scope**, **(c) current qualified first-level organizational denominator**, and **(d) total whole-of-government denominator**. These are not interchangeable. For (c) and (d) the values remain **null**.

## Canonical Cabinet crosswalk

`model/federal/inc15-cabinet-crosswalks.json` ties all 15 pre-existing `ORG-FED-EXE-DEP-*` canonical IDs to their original executive-departments roster entry, INC-12 census reference and X12 identity entry. It preserves old IDs, original catalog ordering, branch and parent. It cites the official online legal name-list source (`EXP-SRC-5-USC-101`, snapshot `EXP-SNAP-5-USC-101`) but **does not claim a new independent transcription or modern legal review**. Identity reuse is not evidence of exhaustive component inventories, leadership appointments or delegated authority.

## Three source-specific department pilots

`model/federal/inc15-department-pilots.json` ties the DoD, DOJ and VA sources to their canonical Cabinet parents and existing census reference IDs. The pilots preserve mutually non-additive source populations, different edition dates and explicit exceptions:

**Defense.** Composition category is not military command. Statutory residual classes are not separate identifiable agencies. GAO's dated DAFA roster and the public combatant command identity list cannot be added to the Title 10 statutory composition population. Coast Guard's ordinarily external departmental placement and statutorily conditional wartime placement must remain explicit.

**Justice.** The 36 dated source-chart connectors are not a complete present-day first-level denominator, specific authorized delegation or legal adjudicatory jurisdiction; Inspector General oversight and adjudicator independence remain distinct from chart placement.

**Veterans Affairs.** The 22 publisher directory headings, 9 statutory clauses and 25 overlapping candidate units must not be summed. Statutory composition clauses are not automatically separate office appointments. Residual first-level populations, Inspector General standing, historical succession, legal effective dates and original source custody are not independently signed off.

## Qualification and publication boundaries

The new model families do not modify any substantive institution identity or source authority graph. The existing federal, constitutional, State and court boundary contracts remain intact. The new schema is closed and publication is subject to `node scripts/validate-inc15.mjs` and `node --test tests/inc15.test.mjs`.

The validator recomputes original canonical **Git blob hashes** for the named source model families and cross-checks their counts, source links, Cabinet identity reuse and DoD/DOJ/VA exception contracts. Git model integrity is not independent publisher-original preservation; `original source custody`, independent institution-wide legal signoff, signed human review, complete department denominators and ADL-1 remain unqualified.

## Next increment — INC-15B

Deepen federal **breadth**, beginning with one bounded per-department first-level roster, fully reconciling dated publisher records, organizational parentage, statutory subtype, staff office versus organizational class, unresolved residuals, and source version. Expand official EOP and independent agencies, congressional support offices and judiciary source populations across separate source editions. Only once the federal institutional census is source-scoped and coverage-measurable should the institute prioritize deeper offices, powers, controls, fiscal operations, documentary relationships and, later, policy analysis.

Coordination: [INC-15 issue #46](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/46) and [G02C.6 website issue #91](https://github.com/American-Republic-Futures-Institute/afri-website/issues/91).
