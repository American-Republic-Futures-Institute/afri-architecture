# INC-15C.4 — HHS dual-publisher edition overlap

**Status:** dated-source, research-only reconciliation. **Parent:** [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50). **No legal first-level roster is certified.**

## Two different original publisher populations

1. The official HHS web organization page was recorded by the [INC-15C.3 index](INC-15C3-HHS-DIRECTORY-RECONCILIATION.md) with **29 linked names**, 28 previously indexed and ARPA-H separately observed. Its page was last reviewed by the publisher on August 21, 2025, but the **original publisher HTML bytes remain unretained**. Prior Git source records are preserved; no independent source-byte custody or present hierarchy is claimed.
2. The fully retained **December 31, 2025 U.S. Government Manual original XML** (INC-15D) has **11 XML subentries directly below the HHS directory root** `GOVMAN-2025-12-31:117`. Its exact SHA-256 is `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`; the separate original Git custody record is retained under `evidence/govman-2025/`.

These are **different publishers' dated, differently scoped indexes**. Neither source is assumed to be the complete first-level legal HHS organization chart. The 29 and 11 should not be summed. The GOVMAN XML local `EntityId` is an edition-scoped publication key, not a legal organizational identifier.

## Reconciliation

This increment makes **11 explicit source-name candidate pairs** across the indexes. Ten have identical printed names. The CMS row differs only in publisher wording:

- HHS index: *Centers for Medicare & Medicaid Services*.
- 2025 Government Manual: *Centers for Medicare and Medicaid Services*.

The source evidence supports an **explicit provisional candidate crosswalk**, not legal identity certification. The other **18 HHS-index names have no separate subentry under the GovMan 2025 HHS root**, which is **not evidence that those bodies ceased to exist**. ARPA-H, departmental staff offices, Inspector General, Departmental Appeals Board and Office of Medicare Hearings and Appeals retain their earlier source-specific classifications and independent-research reservations.

The model is at `model/federal/inc15c4-hhs-dual-edition-crosswalk.json`; immutable prior source-model Git blobs are pinned in that record. `schemas/inc15c4-hhs-dual-edition-crosswalk.schema.json` and the standalone regression validator reject cohort inflation, old name/source rewriting, mixed source epochs, fake HTML archival claims, falsely verified reporting/delegation/mission relationships, and false current legal first-level denominators.

```sh
node scripts/validate-inc15c4.mjs
node --test tests/inc15c4.test.mjs
```

## Qualification gap

**Original publisher HHS HTML is still missing. Independent legal identity, organizational placement and HHS first-level completeness are still unverified.** No powers, appropriations, inspection/adjudication control, signed delegations, or current operational supervisory relationships are derived by comparing source names.

The next institutional depth step should obtain an original publisher organization chart or edition-controlled HHS office source, separately verify the Office of Inspector General and adjudicatory exceptions, and extend Education from a source-constrained directory rather than conflating the Government Manual's *Federally Aided Corporations* subtree with Education departmental staff offices.

No website, data or policy changes.
