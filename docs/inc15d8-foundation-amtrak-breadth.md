# INC-15D.8 — Arts/Foundation hierarchy, Amtrak and independent publisher entry reconciliation

## Original source and goal

This increment reconciles source records **16–30** among the **45 unlinked** entries in the 2025 Government Manual category “Executive Branch: Independent Agencies and Government Corporations”. It accounts for **15/15 edition-local publisher observations**, without creating new legal federal institutions, renaming historical organizations, or treating directory nesting as a statutory delegation.

The publisher evidence is the retained original `GOVMAN-2025-12-31` XML, SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138` (Git blob `195c46a67c87ae85f1dedd423250900f119a041a`); see [content-addressed original](../evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml).

The 2025 Government Manual is historical evidence of **what the publisher listed**, not an independent determination of 2026 current legal form, oversight, ownership, appropriations or exercised powers.

## All 15 publisher entries in exact original source order

The 2025 source has **12 top-level `Entity` records** and **three first-level `SubEntityLevelOne` records** nested under source-local entity `157`. Original `published_order` is preserved independently from tranche sequence because publisher sort order is not globally unique.

| Publisher-local ID | Published title | Original parent | Source disposition |
| --- | --- | --- | --- |
| `148` | Federal Retirement Thrift Investment Board | Top-level | source only institutional candidate pending statutory confirmation |
| `151` | Inter-American Foundation | Top-level | source only institutional candidate pending statutory confirmation |
| `152` | Merit Systems Protection Board | Top-level | source only institutional candidate pending statutory confirmation |
| `155` | National Capital Planning Commission | Top-level | source only institutional candidate pending statutory confirmation |
| `156` | National Credit Union Administration | Top-level | source only institutional candidate pending statutory confirmation |
| `157` | National Foundation on the Arts and the Humanities | Top-level | publisher composite foundation parent legal structure unreviewed |
| `208` | National Endowment for the Arts | `GOVMAN-2025-12-31:157` | publisher nested foundation component legal structure unreviewed |
| `209` | National Endowment for the Humanities | `GOVMAN-2025-12-31:157` | publisher nested foundation component legal structure unreviewed |
| `210` | Institute of Museum and Library Services | `GOVMAN-2025-12-31:157` | publisher nested foundation component legal structure unreviewed |
| `158` | National Labor Relations Board | Top-level | source only institutional candidate pending statutory confirmation |
| `160` | National Railroad Passenger Corporation (AMTRAK) | Top-level | publisher named corporation distinct legal subtype unreviewed |
| `159` | National Mediation Board | Top-level | source only institutional candidate pending statutory confirmation |
| `162` | National Transportation Safety Board | Top-level | source only institutional candidate pending statutory confirmation |
| `164` | Occupational Safety and Health Review Commission | Top-level | source only institutional candidate pending statutory confirmation |
| `166` | Office of Government Ethics | Top-level | source only institutional candidate pending statutory confirmation |

## Foundation on the Arts and the Humanities — source structure, not law

The original XML directly supports this **published directory nesting**:

```text
GOVMAN-2025-12-31:157 — National Foundation on the Arts and the Humanities
  ├── GOVMAN-2025-12-31:208 — National Endowment for the Arts
  ├── GOVMAN-2025-12-31:209 — National Endowment for the Humanities
  └── GOVMAN-2025-12-31:210 — Institute of Museum and Library Services
```

Each subentry retains its own publisher ID, precise XPath, source order and **source-local** parent key. The directory hierarchy must not be upgraded into a certified legal parent/child relationship, operational command chain, appropriations authority, controlling board or executed supervision. Such an assertion requires individual statutory-original custody and qualified institutional review.

The parent `157` remains an unratified publisher entry rather than a freely transferable umbrella authority. The three nested component entries remain separate source observations; no canonical IDs or legal ownership have been inferred.

## Amtrak — corporate source name is not legal subtype evidence

The original publisher label for local ID `160` is **“National Railroad Passenger Corporation (AMTRAK)”**. The printed word *Corporation* and placement within the independent-agency/corporation directory are only publisher observations.

This increment does **not** classify Amtrak as an ordinary executive agency, resolve its precise statutory/charter status, infer federal ownership, identify any direct governing command relationship, or assert congressional fiscal power. Those require separately retained, dated original legal instruments and an explicit reviewer-qualified canonical identity disposition.

Similarly, the labels *Board* and *Commission* on other entries are not themselves evidence of a statutory oversight, supervision or command interface. Their existence as publisher names is recorded without authority conclusions.

## Coverage accounting — not a legal institution census

| Coverage partition | Count |
| --- | ---: |
| All publisher entries in the original Government Manual edition | 231 |
| Original provisional source-to-canonical links | 50 |
| Original unlinked publisher entries | 181 |
| Entries within the independent-agency/corporation source category | 62 |
| Prior provisional canonical links within that category | 17 |
| Original unlinked entries within that category | 45 |
| INC-15D.7 first independent-source tranche accounted | 15 |
| **INC-15D.8 second independent-source tranche accounted** | **15** |
| Cumulative independent publisher entries explicitly disposed | 30 |
| Independent-category unlinked publisher entries outside both tranches | 15 |
| Previous source-only dispositions (INC-15D.5 and .6) preserved | 43 |
| New federal canonical organizational IDs or source links | 0 |
| Independently legally qualified original statutes/charters for these entries | 0 |
| Atlas relationships admitted | 0 |

**Important:** The original crosswalk stays at **50 linked / 181 unlinked** whole edition and **17 linked / 45 unlinked** independent publisher category. A descriptive source-entry disposition never subtracts from an unlinked identity count.

## Reproducibility and qualification

Artifacts:
- [Manual source-local curation](../model/federal/inc15d8-govman-2025-curation.json) — original identifiers, exact names, individual classifications and nonpromotion.
- [Machine-derived 15-entry ledger](../model/federal/inc15d8-govman-2025-dispositions.json) — original source tree, byte hashes, published order, legal qualifiers.
- [Source coverage and unresolved identity register](../model/federal/inc15d8-govman-2025-coverage.json) — independent and whole-edition metrics.
- [Deterministic original XML replay validator](../scripts/inc15d8-govman-reconcile.py).
- [Closed JSON Schemas](../schemas/inc15d8-govman-2025-curation.schema.json), [dispositions](../schemas/inc15d8-govman-2025-dispositions.schema.json), [coverage](../schemas/inc15d8-govman-2025-coverage.schema.json).
- [Adversarial source/identity/authority tests](../tests/test_inc15d8_reconciliation.py).

```sh
python3 scripts/inc15d-govman-directory.py
python3 scripts/inc15d5-govman-reconcile.py
python3 scripts/inc15d6-govman-reconcile.py
python3 scripts/inc15d7-govman-reconcile.py
python3 scripts/inc15d8-govman-reconcile.py
python3 -m unittest discover -s tests -p 'test_inc15d8_reconciliation.py' -v
```

These checks run against the repository's original GovInfo XML **without network fetches** and reject source byte tampering, altered publisher parentage, false government agency or corporate subtype, invented statutory command/oversight/fiscal powers, changed earlier source-cohort dispositions, and premature Atlas publication.

An explicit `--write` can regenerate **only the two derived INC-15D.8 source registers** from curated inputs; normal validation refuses drift.

## Next source tranche

Continue with the final 15 still-unlinked publisher records in this category, including historically named organizations and agencies whose current federal legal status cannot be established from 2025 publisher entries alone. That will close **edition-local source disposition coverage**, not the broader legal identity reconciliation and not the eventual whole-government architecture.

The Plan, Data Observatory, existing canonical IDs, public Atlas renderer, and earlier HHS–DHS statutory interface graph remain unchanged.
