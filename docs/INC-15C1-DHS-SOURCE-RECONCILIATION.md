# INC-15C.1 — DHS edition-bound institutional source reconnaissance

**Status: unratified bounded research; source-original custody and current institutional denominator unqualified.**

Baseline: [INC-15 parent #46](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/46), [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50); immutable predecessor `f34b82c1d3ebfede1ae8b54e84c73f211f43f3bb` (merged INC-15B).

## Scope and source evidence

The original ARFI federal coverage model records **ten selected research candidates**, not a claim that DHS currently contains exactly ten first-level institutions. The candidates were attributed to the organizational chart (p. 24) in the *Department of Homeland Security FY2024 Annual Performance Report*, published **January 17, 2025**, at:

`https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf`

The original architecture publication source reference is `CENSUS-SRC-DHS-CHART-2025` and the recorded source snapshot is `CENSUS-SNAPSHOT-DHS-CHART-2025`, observed October 16, 2026. The publisher report's table of contents identifies its organizational chart on p. 24. This review found the officially indexed PDF locator, but a direct request for the publisher PDF returned **HTTP 403** in the research environment. **No decoded publisher PDF was obtained, and therefore no raw publisher-document SHA-256, byte length, original archive receipt, page-level independent image comparison, or independent first-level denominator can be attested.** No claim of the original document's contemporary legal effectiveness is made. Existing Git model blob digests do **not** establish publisher original-document custody.

The source metadata is presented as *existing prior research attribution*, not as a newly independently authenticated external source. Neither an observed URL nor a publisher-document title constitutes proof of document byte custody. Source-capture verification must be completed in a separately recorded evidence increment.

## Ten traceable original model candidates

`model/federal/inc15c1-dhs-source-reconciliation.json` reuses the exact IDs of ten existing `coverage/components.json` candidates and joins each to the authored `coverage/relationships.json` ID and the existing `x12-observations.json` observation ID:

| Original ID suffix | Observed component | Distinct handling |
| --- | --- | --- |
| CBP | U.S. Customs and Border Protection | Descriptive publisher chart placement |
| ICE | U.S. Immigration and Customs Enforcement | Descriptive publisher chart placement |
| USCIS | U.S. Citizenship and Immigration Services | Descriptive publisher chart placement |
| CISA | Cybersecurity and Infrastructure Security Agency | Descriptive publisher chart placement |
| FEMA | Federal Emergency Management Agency | Descriptive publisher chart placement |
| TSA | Transportation Security Administration | Descriptive publisher chart placement |
| USSS | U.S. Secret Service | Descriptive publisher chart placement |
| USCG | U.S. Coast Guard | Conditional military placement/transfer **not** inferred |
| FLETC | Federal Law Enforcement Training Centers | Descriptive publisher chart placement |
| OIG | DHS Office of Inspector General | **Independent oversight**, not an agency command chain |

These ten are an *overlapping, historical research selection*. The existing branch/parent remains `ORG-FED-EXE-DEP-DHS`; no new legally qualified institutional identity or currently staffed office is minted. Coast Guard movement under law and Inspector General independence are separate unresolved classification exceptions. Chart presentation does not prove reporting command, statutory delegation, fiscal execution, human appointment, operational direction, or adjudicative jurisdiction.

## Immutable provenance and research claims

The validator locks **six original model-family Git blob SHAs** against the exact predecessor commit: coverage components, descriptive relationships, X12 observations, official source registry, dated source snapshots, and the existing Cabinet publisher register. It checks one-to-one identity and relationship integrity, source/snapshot epochs, immutable type classifications, non-additivity, and the earlier null DHS source cohort. The original unqualified Cabinet entry remains unchanged; the new reconciliation is a separate publisher-attribution research cohort.

**Explicit unresolved counts:** current department-wide first-level denominator = `null`, complete publisher chart count = `null`/unverified, original PDF checksum = `null`, independent publisher byte custody = `false`, ADL-1 institutions = `0`, complete legal review = `false`. The only published numerical result is **ten previously modeled candidate references successfully traced to ten existing authorial relationships and ten INC-12 observations**. It is not a new count of proven DHS agencies.

## Validation and review

```sh
node scripts/validate-inc15c1.mjs
node --test tests/inc15c1.test.mjs
```

The closed JSON Schema and semantic validator refuse: replacing a canonical source record, prior source edition drift, original Git blob alteration, fake PDF source digest/custody, current denominator inflation, false fiscal/delegation/command/ADL-1 certification, source cross-jurisdiction reassignment, duplication, tampering with Coast Guard or OIG exceptions, loss of unresolved source custody, and jointly editing JSON Schema + data to smuggle unauthorized authority fields. The architecture's complete existing regression workflow also runs at PR head.

## Required next evidence increment — INC-15C.2

1. Acquire the official FY2024 DHS APR PDF from an independently authenticated publisher response or documented official alternate edition location. Record publisher URL, retrieval and publication/edition times, actual decoded PDF SHA-256 and byte count, and preserve the exact original artifact in durable controlled storage with a publicly verifiable receipt (respect repository binary policies).
2. Independently inspect p. 24 and reconcile its entire bounded page population against the ten prior research candidates. **Do not** infer these ten exhaust the chart until every chart class, office, unresolved residual and Inspector General placement is independently reviewed.
3. Record reviewer, source custody tier, discrepancies, temporal legal exceptions and source-bounded (not current) count only after proper evidence extraction. Keep full current first-level denominator `null` and ADL-1 unqualified absent their separate gates.
4. Extend official publisher rosters for the remaining unsourced Cabinet departments, HHS and Education next, then EOP/independents, Congress and judiciary. Do not prioritize a new Atlas feature in lieu of government-wide institutional breadth.

No production website change is part of INC-15C.1.
