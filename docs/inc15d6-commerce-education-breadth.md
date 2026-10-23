# INC-15D.6 — Commerce and Education 2025 Government Manual publisher-entry reconciliation

## Descriptive source and frozen edition

This increment accounts for **15/15 source-local entries** under the 2025 Department of Commerce and Department of Education Government Manual publisher subtrees. The retained [original GovInfo XML](../evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml) is 8,138,096 bytes, SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`, Git blob `195c46a67c87ae85f1dedd423250900f119a041a`. Publisher edition `GOVMAN-2025-12-31` is a historical 2025 directory, **not** a complete or current legal census of U.S. federal government institutions.

The 15 entries must not be flattened into 15 federal agencies:

| Source-derived disposition | Count | Interpretation |
| --- | ---: | --- |
| Commerce dated named publisher components | 10 | Candidate source observations; no new canonical/legal organizational identity assigned |
| Education “Federally Aided Corporations” heading | 1 | Publisher grouping header, **not** itself a federal department or agency |
| Education published entries nested beneath that heading | 4 | University/corporation-related publisher observations requiring separate legal classification; no automatic federal-agency, supervision, ownership, or statutory-delegation claim |
| **Accounted source records** | **15** | Research coverage, not independently certified legal institutions |

## Exact Commerce source roster (publisher root `GOVMAN-2025-12-31:113`)

The original XML nests the following ten **SubEntityLevelOne** entries directly under the Department of Commerce's 2025 publisher entry. A bounded prior 2026 Commerce website-model match is **not** a current legal agency certification and its mutable publisher HTML originals were not archived.

| 2025 entity ID | Published Commerce entry | Separate dated research record |
| --- | --- | --- |
| `259` | Bureau of Industry and Security | `DEPT04-UNIT-COMMERCE-BIS` |
| `260` | Economic Development Administration | `DEPT04-UNIT-COMMERCE-EDA` |
| `261` | Economics and Statistics Administration | No exact-name source match |
| `262` | International Trade Administration | `DEPT04-UNIT-COMMERCE-ITA` |
| `263` | Minority Business Development Agency | `DEPT04-UNIT-COMMERCE-MBDA` |
| `264` | National Oceanic and Atmospheric Administration | `DEPT04-UNIT-COMMERCE-NOAA` |
| `265` | National Telecommunications and Information Administration | `DEPT04-UNIT-COMMERCE-NTIA` |
| `266` | National Institute of Standards and Technology | `DEPT04-UNIT-COMMERCE-NIST` |
| `267` | National Technical Information Service | `DEPT04-UNIT-COMMERCE-NTIS` |
| `268` | United States Patent and Trademark Office | No exact-name source match |

**Evidence limit:** Eight entries have exact-name references within a bounded Commerce “Bureaus and offices” website model observed October 16, 2026. NOAA and NIST also have older, non-canonical expansion seeds and previously recorded 2025 GovInfo granule URLs. No independent custody of the **2026 mutable Commerce website HTML** exists in this repository, so these are research correspondences, not independently verified current structure.

The 2025 source names the `United States Patent and Trademark Office`; the 2026 Commerce model names the `U.S. Patent and Trademark Office`. Although a plausible name variant, this increment **does not** silently resolve those different strings into a verified identity: it records the comparison as an unreviewed alias candidate only. The 2025 `Economics and Statistics Administration` similarly has no exact-name member in the bounded 2026 model; this cannot support an inference that it no longer exists.

## Exact Education source roster (publisher root `GOVMAN-2025-12-31:115`)

The following hierarchy is preserved rather than flattening all five entries into purported Department of Education subordinate offices:

| 2025 entity ID | Publisher parent key | Published level | Publisher label | Disposition |
| --- | --- | --- | --- | --- |
| `269` | `GOVMAN-2025-12-31:115` | SubEntityLevelOne | Federally Aided Corporations | `noninstitutional_publisher_grouping_not_federal_agency` |
| `270` | `GOVMAN-2025-12-31:269` | SubEntityLevelTwo | American Printing House for the Blind | `publisher_affiliated_entry_legal_classification_unresolved` |
| `271` | `GOVMAN-2025-12-31:269` | SubEntityLevelTwo | Gallaudet University | `publisher_affiliated_entry_legal_classification_unresolved` |
| `272` | `GOVMAN-2025-12-31:269` | SubEntityLevelTwo | Howard University | `publisher_affiliated_entry_legal_classification_unresolved` |
| `274` | `GOVMAN-2025-12-31:269` | SubEntityLevelTwo | National Technical Institute for the Deaf / Rochester Institute of Technology | `publisher_affiliated_entry_legal_classification_unresolved` |

The compound source label **“National Technical Institute for the Deaf / Rochester Institute of Technology”** is exactly one publisher observation; it is **not** automatically split into two federal institutional IDs. Likewise, Howard University, Gallaudet University and the American Printing House for the Blind are listed beneath the “Federally Aided Corporations” directory heading, not newly established as federal agencies by ARFI.

The previously retained **FY2024 Department of Education** organization chart contains 19 chart-box observations. That is a different publication epoch and model family. Its chart boxes do not identify the four federally aided listings as Education offices, do not prove federal agency status, and do not authorize reverse inference of direct supervision.

## Preservation and metrics

| Metric | Post-INC-15D.6 state |
| --- | ---: |
| Source-entry dispositions accounted for in this tranche | 15/15 |
| Previously linked 2025 Government Manual entries | 50 (unchanged) |
| Previously unlinked 2025 Government Manual entries | 181 (unchanged) |
| Previously completed INC-15D.5 Commerce-unrelated dispositions | 28 (unchanged) |
| New canonical component institutional identities | 0 |
| Individually law-qualified, legally reviewed components | 0 |
| Signed command/delegation/budget relationships identified | 0 |
| Atlas admitted public links | 0 |
| Plan or Data Observatory modifications | 0 |

**The baseline's 181 unlinked entries are not reduced by 15.** The entire source-entry accounting describes edition-local source observations, not identity certification. Original X12 references, prior canonical IDs, dated organization observations and historical source qualifiers remain unchanged.

## Inspectable code and verification

- [Manual source-qualified dispositions](../model/federal/inc15d6-govman-2025-curation.json) — reviewed edition-local keys and classifications.
- [Deterministic 15-entry source observation register](../model/federal/inc15d6-govman-2025-dispositions.json) — exact original XPath, source original SHA/Git blob, publisher parent, group level, older research crosswalks, legal/nonpromotion flags.
- [Disjoint 2-cohort coverage register](../model/federal/inc15d6-govman-2025-coverage.json) — Commerce vs Education and nesting.
- [Exact replay validator](../scripts/inc15d6-govman-reconcile.py) — reparses the official XML, requires INC-15D.5 baseline stability, checks 50/181 earlier identity counts, cross-reconciles older 2026 Commerce source metadata, and rejects false statutory/publisher equivalence.
- [Negative tests](../tests/test_inc15d6_reconciliation.py) — publisher byte tampering, wrong source ID/root/parent, added institutional IDs, false 2026 HTML custody, coercion of affiliated entities into federal agency identities, FY2024 Education chart false joins, invented command/delegation, ADL-1, fiscal control, or Atlas admissions.
- [Three closed schemas](../schemas/inc15d6-govman-2025-dispositions.schema.json) and corresponding curation/coverage schemas.

```sh
python3 scripts/inc15d-govman-directory.py
python3 scripts/inc15d5-govman-reconcile.py
python3 scripts/inc15d6-govman-reconcile.py
python3 -m unittest discover -s tests -p 'test_inc15d6_reconciliation.py' -v
```

`--write` is permitted only for deliberate regeneration of source-derived register and coverage files. Regular validation is offline and rejects drift.

## Next legal-evidence gate

Additional original statute or signed publisher-office evidence must be retained and independently examined before certifying legal organizational status for individual components or affiliated corporations. Any validated typed relationships must pass an additional, separate Atlas publication adapter gate. ARFI's descriptive architecture, policy Plan and independent Data Observatory remain distinct.
