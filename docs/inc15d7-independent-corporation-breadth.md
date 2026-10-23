# INC-15D.7 — Independent Agencies and Government Corporations (publisher breadth, tranche 1)

## Purpose

This increment records **15 of 15** first, previously unlinked, top-level `GOVMAN-2025-12-31` publisher entries within the original **“Executive Branch: Independent Agencies and Government Corporations”** directory category. It is a descriptive, 2025 edition-local source-identity reconciliation, **not** a census of today's independent legal bodies, an ADL-1 completion certificate, a statute-based command model, or a proposed reform.

The retained GovInfo publisher XML is the source of truth for what **the publisher represented in its edition**, original SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`, Git blob `195c46a67c87ae85f1dedd423250900f119a041a`. See [retained publisher original](../evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml).

## Source-entry roster and disposition

The 15 publisher rows are original top-level `Entity` elements with null published parent, exact immutable source-local XPath, publisher display position and original SHA/Git blob retained. The term “independent agency or government corporation” is a **publisher directory category**; no individual statutory subtype, agency autonomy, oversight, appropriations or contemporary structure is certified by its category placement.

| 2025 local ID | Original publisher label | Source-only disposition |
| --- | --- | --- |
| `127` | Administrative Conference of the United States | Publisher organizational candidate; legal/current identity unverified |
| `321` | Consumer Financial Protection Bureau | Publisher organizational candidate; legal/current identity unverified |
| `132` | Consumer Product Safety Commission | Publisher organizational candidate; legal/current identity unverified |
| `133` | Corporation for National and Community Service | Historical organization name; successor or later naming unverified |
| `134` | Defense Nuclear Facilities Safety Board | Publisher organizational candidate; legal/current identity unverified |
| `136` | Equal Employment Opportunity Commission | Publisher organizational candidate; legal/current identity unverified |
| `137` | Export-Import Bank of the United States | Publisher organizational candidate; legal/current identity unverified |
| `138` | Farm Credit Administration | Publisher organizational candidate; legal/current identity unverified |
| `141` | Federal Election Commission | Publisher organizational candidate; legal/current identity unverified |
| `142` | Federal Housing Finance Agency | Publisher organizational candidate; legal/current identity unverified |
| `143` | Federal Labor Relations Authority | Publisher organizational candidate; legal/current identity unverified |
| `146` | Federal Mine Safety and Health Review Commission | Publisher organizational candidate; legal/current identity unverified |
| `144` | Federal Maritime Commission | Publisher organizational candidate; legal/current identity unverified |
| `145` | Federal Mediation and Conciliation Service | Publisher organizational candidate; legal/current identity unverified |
| `147` | Federal Reserve System | System-level identity, not a certified governing board equivalence |

## Specific identity controls

The **Corporation for National and Community Service** (`GOVMAN-2025-12-31:133`) is held under its source edition's **exact historical label**. This observation does not certify a successor, rename, dissolution, contemporary institution or assignment of federal power. A present-day alias must be established through a separately retained, dated official source and reviewed canonical identity disposition.

The **Federal Reserve System** (`GOVMAN-2025-12-31:147`) is represented by the publisher's **system-level label**. It is **not** automatically equivalent to the Board of Governors, a Reserve Bank, an operating office, an appropriations actor, a legal delegated authority, or a singular command entity. No such identity or oversight edge was created.

All 15 other legal/subtype attributes remain in their evidence-qualified unknown state. The 2025 publisher mission paragraphs are publisher descriptions, not independent proof of codified delegations, action execution or constitutional authority.

## Independent source-coverage accounting

| Metric | Status |
| --- | ---: |
| Whole 2025 Government Manual original source entries | 231 |
| Whole edition existing provisional canonical links | 50 |
| Whole edition entries without canonical links | 181 |
| Independent agency/corporation category source entries | 62 |
| Existing provisional independent-category canonical links | 17 |
| Independent-category source entries without canonical links | 45 |
| Edition-local entries accounted for in INC-15D.7 | 15 |
| Independent-category unlinked entries outside this tranche | 30 |
| Existing source-only dispositions preserved from INC-15D.5 | 28 |
| Existing source-only dispositions preserved from INC-15D.6 | 15 |
| Newly instantiated canonical institution IDs | 0 |
| Independently certified legal subtype, statute, current-day entity | 0 |
| Atlas relationships published | 0 |

The old 45 or 181 unlinked counters are **not reduced** by this research accounting. The 30 count is only the source category entries outside the bounded tranche; it is not the count of modern unmodeled independent federal agencies.

## Provenance, contracts and reproducibility

- [Curated source identities and dispositions](../model/federal/inc15d7-govman-2025-curation.json): exact 15 source local IDs and individual review interpretation.
- [Regenerated source-derived evidence register](../model/federal/inc15d7-govman-2025-dispositions.json): original XPath, published order, publisher category and source checksum/Git blob, all failed-qualification controls per observation.
- [Coverage and nonpromotion register](../model/federal/inc15d7-govman-2025-coverage.json): 62/17/45/15/30 and 231/50/181 independent accounting.
- [Deterministic replay validator](../scripts/inc15d7-govman-reconcile.py) and [negative test suite](../tests/test_inc15d7_reconciliation.py): replay original XML; preserve both earlier tranches; reject incorrect categories and source local IDs, renamed historical entities, Federal Reserve Board equivalence, fabricated 2026 currentness, fiscal/command/oversight powers, changes to original canonical identity references or premature public Atlas publication.
- [Closed JSON schemas](../schemas/inc15d7-govman-2025-dispositions.schema.json) and corresponding curation and coverage schemas.

Run from a full repository checkout:

```sh
python3 scripts/inc15d-govman-directory.py
python3 scripts/inc15d5-govman-reconcile.py
python3 scripts/inc15d6-govman-reconcile.py
python3 scripts/inc15d7-govman-reconcile.py
python3 -m unittest discover -s tests -p 'test_inc15d7_reconciliation.py' -v
```

The verifier is offline and checks the original retained publisher bytes. `--write` is an explicit opt-in to regenerate the two derived research files; ordinary validation rejects drift.

## Separate follow-on authority and publication

Remaining independent-agency/corporation publisher entries include nested source groupings and potentially different historical epochs or institution types. Later source-to-canonical promotions require source-original custody and separate institutional/legal review, **not name similarity alone**. Typed, directional public-Atlas edges likewise require a separate admission contract. The Plan and independent Data Observatory are unchanged.
