# INC-15C.2 — Authentic DHS original PDF and bounded organizational-chart transcription

**Status:** Source PDF captured directly from DHS.gov, cryptographically preserved in Git, Figure 1 / physical PDF p. 24 independently extracted and visually inspected; this is an **unratified research chart edition**, not independently certified legal membership, original WORM preservation, current structure, or ADL-1.

Issues: [INC-15C.2 #52](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/52), [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50). Predecessor [INC-15C.1 #51](https://github.com/American-Republic-Futures-Institute/afri-architecture/pull/51).

## Source acquisition and content-addressed retention

GitHub Actions runner downloaded the original PDF over HTTPS from the exact originally registered publisher URL:
`https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf`

- Observed original fetch: 2026-10-21T01:18:06.338Z (UTC; original capture receipt is versioned).
- SHA-256 of downloaded **decoded PDF bytes**: `d48f661bf9d6643409585451a2dc49f53358fe869dd40d182344f0bed58e4175`.
- Raw PDF bytes: **17,622,005**.
- Git blob hash of that PDF: `bdbcbc4a6045eebef852daeceeb154be15c48684`. This is a separate SHA-1 **Git object** hash, not the publisher document's SHA-256 and not a WORM signature.
- Preserved source file: `evidence/dhs-fy2024/originals/sha256/d48f661bf9d6643409585451a2dc49f53358fe869dd40d182344f0bed58e4175.pdf`.
- Immutable versioned capture and Git retention receipts: `evidence/dhs-fy2024/receipts/inc15c2-official-source-capture.json` and `evidence/dhs-fy2024/receipts/inc15c2-git-retention.json`.
- The full document reports **273 PDF pages**, `%PDF-1.7`, no encryption. PDF metadata reports creation **2025-01-16T13:57:53Z** and modification **2025-02-04T13:53:52Z**; the report claims a January 17, 2025 publication date. A February 4 modification timestamp does **not** prove a specific historical editorial change, and the unacquired `2025-01` URL must not be assumed byte-identical.
- The original report itself remains the authoritative visual source. The chart is on physical PDF page **24**, with the printed footer **pg. 24**.

Git is persistent content-addressed storage, but no independently authenticated signer, external WORM lock, human legal review, or departmental completeness certificate has been recorded. The `git-versioned` preservation fact is distinct from independent WORM custody qualification. Source status stays unratified.

## The exact bounded diagram population

The diagram states that it shows DHS, its components and **a majority** of key offices. It does **not** assert an exhaustive roster. PDF text words were extracted and matched with directly rendered colored vector rectangles; the page was visually inspected. The chart has 34 organization boxes, **excluding three legend swatches**, with 13 green boxes (Office of the Secretary / Executive Management), 8 blue operational-component boxes, and 13 purple support/oversight boxes. The top green box contains two titles, Secretary and Deputy Secretary; it is **one diagram box, not one legally interchangeable office**.

| Source chart row | Source label transcribed from Figure 1 | Legend class | Prior ARFI candidate |
| ---: | --- | --- | --- |
| 1 | Executive Secretary | Executive management | Not previously in selected ten |
| 2 | Secretary / Deputy Secretary | Executive management | Not previously in selected ten |
| 3 | Chief of Staff | Executive management | Not previously in selected ten |
| 4 | Military Advisor | Executive management | Not previously in selected ten |
| 5 | Counterterrorism Coordinator | Executive management | Not previously in selected ten |
| 6 | Office for Civil Rights and Civil Liberties | Executive management | Not previously in selected ten |
| 7 | Office of the General Counsel | Executive management | Not previously in selected ten |
| 8 | Office of Legislative Affairs | Executive management | Not previously in selected ten |
| 9 | Office of Partnership and Engagement | Executive management | Not previously in selected ten |
| 10 | Privacy Office | Executive management | Not previously in selected ten |
| 11 | Office of Public Affairs | Executive management | Not previously in selected ten |
| 12 | Office of Strategy, Policy, and Plans | Executive management | Not previously in selected ten |
| 13 | Office for State and Local Law Enforcement | Executive management | Not previously in selected ten |
| 14 | Federal Law Enforcement Training Centers | Support / oversight | `CENSUS-COMP-DHS-FLETC` |
| 15 | Science and Technology Directorate | Support / oversight | Not previously in selected ten |
| 16 | Countering Weapons of Mass Destruction Office | Support / oversight | Not previously in selected ten |
| 17 | Office of Intelligence and Analysis | Support / oversight | Not previously in selected ten |
| 18 | Office of Inspector General* | Support / oversight | `CENSUS-COMP-DHS-OIG` |
| 19 | Management Directorate | Support / oversight | Not previously in selected ten |
| 20 | Office of Homeland Security Situational Awareness | Support / oversight | Not previously in selected ten |
| 21 | Office of Health Security | Support / oversight | Not previously in selected ten |
| 22 | Office of the Immigration Detention Ombudsman | Support / oversight | Not previously in selected ten |
| 23 | Office of the Citizenship and Immigration Services Ombudsman | Support / oversight | Not previously in selected ten |
| 24 | Chief Financial Officer | Support / oversight | Not previously in selected ten |
| 25 | U.S. Customs and Border Protection | Operational | `CENSUS-COMP-DHS-CBP` |
| 26 | Cybersecurity and Infrastructure Security Agency | Operational | `CENSUS-COMP-DHS-CISA` |
| 27 | Federal Emergency Management Agency | Operational | `CENSUS-COMP-DHS-FEMA` |
| 28 | U.S. Immigration and Customs Enforcement | Operational | `CENSUS-COMP-DHS-ICE` |
| 29 | Chief Information Officer | Support / oversight | Not previously in selected ten |
| 30 | Federal Protective Service | Support / oversight | Not previously in selected ten |
| 31 | Transportation Security Administration | Operational | `CENSUS-COMP-DHS-TSA` |
| 32 | U.S. Coast Guard | Operational | `CENSUS-COMP-DHS-USCG` |
| 33 | U.S. Citizenship and Immigration Services | Operational | `CENSUS-COMP-DHS-USCIS` |
| 34 | U.S. Secret Service | Operational | `CENSUS-COMP-DHS-USSS` |

The original ten ARFI records cover **eight** source-color operational components, FLETC (purple support), and OIG (purple but **independent oversight**). Every one retains the original `CENSUS-COMP-DHS-*` ID, `CENSUS-REL-0010..0019` descriptive relation, and `X12-OBS-*` record. The other 24 chart boxes are **newly transcribed source boxes only**; they receive no canonical institution ID, validated first-level membership or operational authority from appearing on the page.

The diagram's **OIG footnote explicitly says it is independent and reports to the Secretary and Congress; its grouped position is for display purposes**. U.S. Coast Guard's conditional military placement under other legal authorities is not replaced with a command inference from this chart. The drawn reporting-like lines do not establish signed administrative delegation, military command, appropriations execution, statutory adjudication or actual October 2026 arrangements. The Management Directorate/CFO/CIO/FPS stack is likewise transcribed as placed, not promoted to verified control.

The official diagram legend combines **support components and independent oversight** in one color. Purple box count therefore cannot be treated as thirteen subordinate agencies.

## Validation and exact release boundaries

`model/federal/inc15c2-dhs-chart-boxes.json` is one ARFI-COA source edition family with **34 `items`**; its strict schema and verifier require the actual PDF SHA-256, byte count and Git object digest, exact 34 ordered labels, physical-page coordinates, source legend class, all ten previous INC-15C.1 original identity/relationship joins, and unqualified legal-custody flags.

```sh
node scripts/validate-inc15c2.mjs
node --test tests/inc15c2-chart.test.mjs
node --test tests/inc15c2-dhs-acquisition.test.mjs
```

Tests reject corrupted original bytes; swapped or duplicated legacy identities; added, moved or relabeled source boxes; false OIG subordination; removed USCG exception; fake legal authority, WORM receipts, institutional denominators or ADL-1; added legal data even when schema and source record are edited together.

**Established:** physical FY2024 diagram boxes = **34**; previously researched ten boxes reconciled = **10**; additional **source-only boxes = 24**; the origin is exact PDF SHA-256 above.

**Not established:** all DHS first-level legal institutions; complete government current structure; current DHS denominator (`null`); ADL-1 (`0`); independent WORM legal custody; separate impartial institutional/legal signoff. No current Federal enterprise architecture claims should be promoted from this source alone.

## Recommended following increment

Continue **INC-15C.3 — Independent source-custody qualification and Cabinet breadth**. Obtain a second independently retained copy or a government publisher signed/supported evidence receipt, implement human reviewer/WORM checks, and reconcile HHS and Education official first-level directories with their own source-edition denominators. Keep this DHS chart as a completed **historical source enumeration**, and separately qualify legal first-level DHS membership rather than overloading a picture count. The ten-candidate study and this chart remain nonadditive across editions.
