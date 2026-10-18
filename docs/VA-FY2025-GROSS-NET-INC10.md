# INC-10 — VA FY2025 Gross-to-Net and Source Vintage Reconciliation

**Model:** `X10-TRACE-VA-FY2025-0102`  
**Federal account:** Department of Veterans Affairs, Compensation and Pensions, `036-0102`  
**Scope:** Published U.S. Treasury fiscal-year 2025 cash, OMB FY2027 Budget Appendix FY2025 historical actuals, and Treasury USAspending FY2025 period-12 File A reporting.  
**Status:** Reproducible government original-byte research. **No original signed VA SF-133, raw certified agency GTAS, signed FMA/TDA, AAWS/iFAMS execution ledger, individual Treasury voucher or independent audit opinion has been acquired.**

## 1. Original government publications

| Government original | Exact original SHA-256 | Original bytes | Account/period/locator |
|---|---|---:|---|
| [Treasury FY2025 Combined Statement, Department of Veterans Affairs, Chapter 42](https://fiscal.treasury.gov/system/files/files/reports-statements/combined-statement/cs2025/c42.pdf) | `eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089` | 662,885 | PDF page 4, rows 036-0102-000; FY ended 2025-09-30 |
| [OMB FY2027 VA Budget Appendix](https://www.whitehouse.gov/wp-content/uploads/2026/04/vet_fy2027.pdf) | `6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da` | 514,363 | PDF pages 10–11 / printed pp. 1000–1001, FY2025 *actual*, OMB amounts in **whole millions** |

Both original government PDFs were fetched from exact, allowlisted government hostnames and paths and captured in [Actions run #39150918258](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/39150918258), then committed byte-for-byte into `evidence/va-fy2025/inc10-originals/sha256/<SHA256>.pdf`. Original SHA-256, byte counts and the relevant statement text are independently replayed by `scripts/validate-inc10.mjs` in exact-head CI.

Git persistence provides reproducible original-version custody **but is not** institutional WORM retention, a cryptographic assertion by Treasury/OMB, or qualified professional accounting verification.

## 2. Source and period distinctions

- **Treasury Combined Statement**: cash reporting for FY2025, source account `036-0102`. The no-year component publishes net outlays of **$200,695,183,364.35**; legacy FY2020 reports **−$24,400,000.00**; account subtotal is **$200,670,783,364.35**. These are published account measures, not verified individual beneficiary disbursements.
- **OMB FY2027 Appendix**: budget publication produced in April 2026, FY2025 historical *actual* column in **whole millions**. It reports both gross and net outlays, and the categories of offsets; it is not the original VA signed SF-133.
- **USAspending File A**: original Treasury-generated FY2025 period-12 account CSV with `last_modified_date=2026-05-15`, so its published source vintage postdates the OMB Appendix. File A **gross** outlays are **$201,510,355,302.81** and account budgetary resources are **$217,840,027,429.26**. A fiscal-year-period match is necessary but not sufficient for certified cross-source equivalence.
- **OMB FY2025 April apportionments (INC-08)**: dated **approved spending-plan controls**, not actual year-end appropriations, recoveries, obligations or outlays. Their reporting date and estimated line amounts must remain separate from year-end report classes.

## 3. OMB FY2025 historical offset classification

The independently preserved original OMB PDF, p. 11, Compensation and Pensions, reports:

| Budget Appendix line | 2025 actual (millions) | Interpretation |
|---|---:|---|
| 4110 | 201,510 | Gross outlays |
| 4120 | −24 | Collected offsetting collections: federal sources |
| 4123 | −815 | Collected offsetting collections: nonfederal sources |
| 4130 | **−839** | Total offsets *against gross outlays* |
| 4142 | 24 | Offsetting collections credited to expired accounts, **budget-authority-only** category |
| 4143 | 815 | Recovery of previously paid obligations in unexpired accounts, **budget-authority-only** category |
| 4150 | 839 | Additional offset against budget authority **only**; do not subtract from net outlays a second time |
| 4170 | **200,671** | Net outlays |

Within the **same OMB statement** (whole millions), `−24 − 815 = −839` and `201,510 − 839 = 200,671`. This supports the published **category definitions and within-document gross-to-net arithmetic at whole-million granularity**, not the exact $839,571,938.46 separately observed from File A and the Treasury Combined Statement.

The OMB p. 10 figure for total budgetary resources, line `1930`, is **217,841 million**; obligations line `3010` is **203,144 million**. These are part of the FY2027 budget's retrospective FY2025 estimate vintage, not a May 2026 File A snapshot.

## 4. Exact-cent fiscal comparison and remaining incompatibilities

| Comparison | Exact-cent observation | Decision |
|---|---:|---|
| File A gross outlays minus Treasury Combined Statement net outlays | **$839,571,938.46** | Observable cross-source difference. Underlying account offset collection entries **not independently obtained** |
| Observed exact gross-minus-net minus OMB reported total offsets ($839 million) | **$571,938.46** | **Outside** the ±$500,000 nearest-million interval for a *single* 839m rounded amount; cannot claim verified exact netting |
| File A FY2025 resources versus OMB FY2027 Appendix FY2025 resource line `1930` | **$972,570.74** | Outside a ±$500,000 nearest-million tolerance; possible revision/definition difference, **cause not yet verified** |
| File A FY2025 gross vs OMB whole-million gross | **$355,302.81** | Numerically compatible within OMB whole-million rounding |
| Treasury FY2025 net vs OMB whole-million net | **$216,635.65** | Numerically compatible within OMB whole-million rounding |
| Treasury legacy FY2020 net outlay and File A historical recovery | Equal **$24,400,000** magnitudes, opposite signs | Different source measures; no proven common transaction |

**Do not confuse compatible independently rounded components with a verified, sub-million exact offset category.** OMB gross and net estimates may each round independently, while OMB also publishes total offsets by category. The fact that the first two individually agree with observed gross and net does **not** establish that the 839m offset line is exact to the cent or that the source vintages match.

For resource vintage, Treasury's public VA FY2025 P12 submission history reflects certifications on 2025-11-17 and 2026-05-15. The File A original was revised 2026-05-15; the OMB FY2027 Appendix was published in April 2026. These facts establish a *plausible temporal mismatch*, but **no primary account amendment log tying the exact $972,570.74 revision to either certified submission has been obtained**.

## 5. Independent acceptance gates

The nine X10 outstanding source/legal approval gates remain explicitly false:

1. Exact account-level federal/nonfederal offset collections, refund and netting ledger.
2. Original account-specific OMB publication-vintage and May File A revision bridge.
3. Signed original VA FY2025 SF-133 and underlying original GTAS, with certifier and period.
4. Signed VA FMA/TDA account-level allotments and effective distributions.
5. Actual VA AAWS/iFAMS authorizations/postings.
6. Specific legitimate beneficiary obligation, voucher and Treasury payment record.
7. Independently authenticated official government document signing and edition.
8. Independent finance and counsel review of period/concept/source compatibility.
9. Ratified institute WORM original and replica custodianship and restoration tests.

No missing government record is treated as zero, fabricated, inferred from OMB guidance, or silently satisfied by a public summary.

## 6. Deterministic replay

```sh
node scripts/validate-inc10.mjs
node --test tests/inc10-originals-and-reconciliation.test.mjs
```

The validator recomputes SHA-256 for both repository original PDFs, verifies original size/headers, independently extracts page 4 Treasury and pages 10–11 OMB with `pdftotext`, tests the exact reported identifiers and quantities, confirms arithmetic with the prior published INC-07/INC-09 model, and rejects source substitution, double-counting offset categories, rounding overclaim, falsely closed gates, and modification of the original constitutional legal-effect status.

The separate live original-source capture does not mutate official endpoints; it preserves failed attempts as missing source evidence and cannot quietly replace an already-pinned source original.
