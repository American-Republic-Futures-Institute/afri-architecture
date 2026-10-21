# INC-15D.2–4 — December 2025 Government Manual publisher directory

**Status:** source-original-backed, research only, unratified. **Issue:** [INC-15D #57](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/57).

## Verified source custody

The complete original source is the Office of the Federal Register's [December 31, 2025 U.S. Government Manual](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31), distributed by GovInfo, not a current legal first-level federal roster. The original XML has 8,138,096 bytes and SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`. Its independently calculated Git blob SHA-1 is `195c46a67c87ae85f1dedd423250900f119a041a`. Source, acquisition receipt, and Git custody record are preserved under `evidence/govman-2025/`. Git custody is established; separately certified WORM custody and legal review are **not**.

## Exact publisher population and distinct categories

The deterministic parser enumerates **231** explicit XML nodes: **105** top-level `Entity`, **87** `SubEntityLevelOne`, **35** `SubEntityLevelTwo`, and **4** `SubEntityLevelThree` nodes. These are publisher-directory XML entries, **not 231 independent legal institutions**. Publisher category counts below are *disjoint within this one source edition* and must never be added to department agency indexes from different publication periods.

| Publisher category | XML entity count |
| --- | ---: |
| Legislative Branch | 10 |
| Judicial Branch | 16 |
| Executive Branch: The President | 2 |
| Executive Branch: Departments | 117 |
| Executive Branch: Independent Agencies and Government Corporations | 62 |
| Quasi-Official Agencies | 8 |
| International Organizations (not U.S. federal institutions) | 16 |
| **One-edition total** | **231** |

The 15 Cabinet-root publisher subtrees contain **117** of the 231 records (including their Cabinet roots). This is a *subset* of the 231 and **must not** be added to the 231 total. The Manual is not a complete intra-department organizational chart. EOP members and other externally reported units cannot be invented to fill apparent gaps.

## Canonical identity reconciliation

- `model/federal/inc15d-govman-2025-curated-links.json` explicitly names **50** stable existing `ORG-FED-*` references, their observed source-local `EntityId`, and the exact publisher name. Every crosswalk is provisional source-name/edition-alias research, **not independent identity certification**.
- `model/federal/inc15d-govman-2025-crosswalk.json` carries **231** source-scoped records: 50 provisionally linked, **181 unresolved or external**, including source-listed international organizations. A published `Federal Reserve System` heading is **not** silently equated to the narrower `Board of Governors of the Federal Reserve System` canonical entity.
- All existing X12 and canonical IDs are retained. `GOVMAN-2025-12-31:<EntityId>` is explicitly **edition-local** and never minted as an official permanent agency ID. No automatic fuzzy name matching is permitted.
- Source `ParentId`, XML nesting, and `SortOrder` convey publication structure **only**. They do not prove command, adjudicative jurisdiction, appointment, appropriation, budget execution, statutory delegation, or current organizational placement.
- Direct `MissionStatement` XML text is preserved as publisher wording, with no automatic role/capability or cross-government coordination certification. More extensive function and interface claims remain deferred to [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56).

## Canonical artifacts and deterministic replay

`model/federal/inc15d-govman-2025-directory.json` holds all publisher entry locators, category, name, XML node kind, source-parent path, order, and any explicit mission wording. `model/federal/inc15d-govman-2025-coverage.json` has seven source-category partitions and 15 nonadditive Cabinet subtrees. All are source-version-bound, with legal first-level denominators `null`.

Replay and validate, using Python 3.11+ and no third-party dependencies:

```sh
python3 scripts/inc15d-govman-directory.py
python3 -m unittest discover -s tests -p 'test_inc15d_directory.py' -v
```

To reproduce generated JSON into a disposable checked-out branch, run `python3 scripts/inc15d-govman-directory.py --write`. Normal validation uses **read-only replay**, requiring byte-for-byte equality of the checked-in derived artifacts. Four closed JSON Schema Draft 2020-12 contracts govern curated links, directory entries, crosswalks and coverage; negative tests reject source byte mutation, duplicate canonical identifiers, invalid branch matching, fake identity names, untyped legal fields, false legal denominators, and foreign organization impersonation.

## Follow-on research gaps

Original publisher HTML custody and independent legal qualification are still incomplete for the prior HHS index; Education and remaining departmental structures still require separate chart and office source capture under [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50). The 2025 Government Manual does not close those gaps and does not establish a legal completeness denominator. Subsequent verified editions must be retained alongside this one, not silently overwrite it.

**Boundary:** This increment changes only the canonical architecture repository; no website, data ingestion, policy model, or ARFI reform recommendations.
