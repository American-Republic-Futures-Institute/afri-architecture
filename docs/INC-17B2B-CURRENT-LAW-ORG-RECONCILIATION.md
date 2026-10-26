# INC-17B.2B — October 2026 OLRC reconciliation and bounded Cabinet relationships

**Disposition:** source-verified research-model increment, **not** independent legal-effect adjudication, completed current ADL-1 institutional hierarchy, organizational command, or public Atlas admission. Extends [INC-17B.2A](INC-17B2A-DEPARTMENT-STATUTORY-QUALIFICATION.md) without rewriting its prior legal editions or changing canonical department identities.

**Primary law-through point:** Office of the Law Revision Counsel (OLRC), **Public Law 119-124, October 15, 2026**. The exact seven OLRC section HTTP HTML originals and three departmental original HTML response entities are archived in `evidence/inc17b2b-olrc-119-124/originals/sha256/`, with the original-byte receipts in `source-custody.json`. One official State FAM source was unavailable via the automated capture runner; it remains an unresolved source, **not an absence of organizational structure**.

## Verified current-release statutory text, separate prior editions

| Canonical department | OLRC 2026 section original | Prior archive | Source-based reconciliation |
|---|---|---|---|
| State | 22 U.S.C. §2651a | GPO 2024 §2651a | **Material revision**, including Public Law 119-60 (Dec. 18, 2025); new subsection (q) bureau definitions, changed Consular Affairs language, and statutory-note references to Human Resources |
| Agriculture | 7 U.S.C. §2202 | GPO 2023 §2202 | Department/Secretary authority statement remains; no full first-level agency enumeration |
| HUD | 42 U.S.C. §§3532, 3533 | OLRC through PL 119-120 §3532 only | Secretary plus statutory Deputy Secretary, seven Assistant Secretary *positions*, and General Counsel; neither §3533 nor HUD's program list proves all offices are staffed or a complete organization |
| Veterans Affairs | 38 U.S.C. §301 | GPO 2024 §301 | Seven named composition categories remain in the current published Code section, with further nonenumerated categories; the referenced VA Board of Contract Appeals has unresolved current operational and successor status |
| Homeland Security | 6 U.S.C. §§111, 112 | GPO 2024 §§111,112 | Department/Secretary legal text remains; §112's permission to delegate does **not** establish an actual executed delegation or 2026 agency-level command |

All seven current section originals are fixed at the **same** OLRC publication release point; prior 2023/2024 GPO and PL 119-120 originals remain distinct archival editions. The OLRC release point is not itself a statute's legal **effective date**, a completed citator or signed legal review. The publication does not automatically prove current operations on October 26, 2026.

## Changes requiring relationship reclassification

### State — Public Law 119-60 (2025)

The current §2651a(g) materially revises Consular Affairs language compared with the archived 2024 original. Section §2651a(q) now includes **ten named statutory bureaus**, including Diplomatic Technology and Human Resources. OLRC's notes reproduce statutory reference-deeming language that references to the former Bureau of Global Talent Management are to refer to the Bureau of Human Resources.

This does **not** mean that a legacy record can be overwritten with a new ID, or that all employee transfers, supervisory changes and operations are independently confirmed. A legal reference-deeming rule should be a **time-/source-qualified alias rule**, not an unconditional institutional-identity or employment-migration claim.

Section §2651a(i)(4) also limits conclusions about the Cyberspace and Digital Policy Bureau's reporting arrangement: initial statutory placement and conditions for subsequent placement do not establish which arrangement is currently exercised. Section §2651a(a)(3)(B) expressly limits Secretary authority concerning Inspector General and Chief Financial Officer powers.

Model the departmental source text as typed *statutory-inclusion candidates*, with date, original hash and statute locator; defer actual `reports_to`, `supervises`, `currently_operated_as` and `delegates_to` edges until documented independently.

### VA — cross-source concordance is not hierarchy

The current §301(c) names VA components including VHA, VBA, NCA and the Board of Veterans' Appeals. Each name is corroborated in the captured October 2026 VA Administrations and Offices page, which groups the first three under **Administrations** and the Board under **Staff Offices**. This provides **four independently sourced name concordances** linked to prior `DEPT04-UNIT-VA-*` provisional candidate IDs. Those candidate IDs have **not** been silently promoted into globally certified canonical legal member IDs.

The §301(c)(7) **Board of Contract Appeals** reference remains in the currently published codified text, but is not present in the captured 2026 VA directory. The conflict must be resolved using the relevant reorganization/successor provisions and actual operating evidence. Its listing is neither proof of a live VA board nor of its abolition. VA Inspector General independence must be distinguished from a staff-office heading.

### USDA and HUD — administrative list versus legal status

The archived NIFA USDA mission-area/agency listing reports named USDA agencies, but a mission-area arrangement does not establish a direct statutory first-level parent link to the Secretary. The captured HUD page groups *programs*, not a complete list of legally constituted departmental offices. Neither is an adequate ADL-1 legal denominator. The current §3533's numeric *positions* cannot be confused with current officeholder appointments.

### DHS — retain original historical chart, preserve exceptions

The previously retained DHS FY2024 Annual Performance Report contains **34 chart boxes**, including 10 referenced observations in this increment. Each such item is source-only, as of the original historical chart; it cannot be transformed by a 2026 generic Secretary headship statute into a current direct command graph. In particular, the U.S. Coast Guard's conditional military status and the independent Inspector General's powers require distinct primary law/instrument review. Section 112(b)(1) authorizes certain delegations but is not evidence any particular delegation was executed.

## Model contract

Five additive, explicitly nonadmitted model collections:

- `model/wholegov/inc17b2b-epoch-crosswalk.json` — seven original current-law/previous-edition statutory section pairings with immutable SHA and publication/temporal boundaries.
- `model/wholegov/inc17b2b-legal-relations.json` — **28** source-qualified textual relationships from existing canonical *department IDs* to expressly source-local, noncanonical subject IDs; **four** name concordances between a current OLRC provision and a separately retained current VA directory.
- `model/wholegov/inc17b2b-publisher-crosswalks.json` — **23** independently bounded source observations: five USDA agency names, four HUD program names, four VA directory headings, and ten already retained **historical** DHS chart boxes. These must **not** be counted as 23 qualified current ADL-1 legal first-level components.
- `model/wholegov/inc17b2b-legal-exceptions.json` — **11** time/authority exceptions, including State amendment and Human Resources reference-deeming, Cyberspace conditional reporting, State IG/CFO restriction, VA Board conflict/OIG, DHS Coast Guard/OIG/delegation, and HUD/USDA source classification.
- `model/wholegov/inc17b2b-qualification-ledger.json` — all **15** existing canonical Cabinet department identities, exact current OLRC coverage across five priority roots, retained publisher source populations and explicit unresolved ADL-1 denominators.

The data are validated by `scripts/inc17b2b-current-law-core.py`, `scripts/inc17b2b-capture-official.py verify`, `schemas/inc17b2b-current-law-source-crosswalk.schema.json`, and `tests/test_inc17b2b_current_law.py`. The upstream source-only INC-17B.2A and prior legal, historical custody, government census and jurisdiction gates must continue to pass.

**Never infer from this model:** completed ADL-1, legally effective reorganizations or successors, current personnel control, federalism delegation, Coast Guard military command, IG subordination, fiscal commitments, population outcomes, or independently completed legal advice.

## Next legally meaningful qualification

1. **Resolve State legal transitions**: capture original Public Law 119-60 itself for effective-date and §5132(b) identity-reference adjudication; acquire up-to-date signed organizational/reporting instruments and FAM original where available. Promote only a reviewed, date-scoped relationship; preserve predecessors and historical viewpoints.
2. **Qualify VA first-level statutory composition and real operations**: determine VHA/VBA/NCA/BVA present-day legal membership, independent functions, administrative reporting and Board of Contract Appeals disposition from law/instrument evidence. Keep all unmatched VA directory staff-office names separate.
3. **Qualify DHS component status**: obtain component-specific statutory creation/transfer/supervision law, retain conditional Coast Guard/IG boundary, and separately verify any actual delegated powers. Do not use the 34-box chart as a substitute for law.
4. **Broaden USDA and HUD**: capture statutory/regulatory basis of USDA mission-area placement and HUD offices and reconcile dated charts against original law; do not treat a program page as organization.
5. **Expand across remaining ten Cabinet roots, Congress, EOP, judiciary, and independent bodies** under parent [#110](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/110). Maintain independent State/tribal/territorial/local boundaries under [#111](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/111).

**Public Atlas control:** All five new model families are registered for provenance/audit only. They create **zero** new public live graph nodes, canonical component identities, command/delegation or source-unsupported legal edges. Adoption into the website requires a separate source-versioned, reviewed website adapter and real-browser rooted navigation acceptance.
