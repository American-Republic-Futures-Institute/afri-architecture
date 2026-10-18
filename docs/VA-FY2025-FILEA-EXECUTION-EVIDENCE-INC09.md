# INC-09 — FY2025 VA File A Original Execution Reporting and Funds-Control Reconciliation

**Account:** VA Compensation and Pensions, federal account `036-0102` (USAspending federal account ID `4649`). **Fiscal reporting window:** FY2025 period 12, ending September 30, 2025. **Source revision/availability:** the published File A TAS rows state `last_modified_date=2026-05-15`. The government-generated ZIP was retrieved October 18, 2026. These are three distinct time concepts.

**Classification:** source-backed federal government **account-level budget execution reporting**. It is not an originally executed VA FMA/TDA, independently signed SF-133 form, original raw GTAS trial-balance transmission, or beneficiary-payment approval. No specific individual official's delegation, legal compliance, overpayment or disbursement is certified by this increment.

## Real original government publisher bytes

Treasury [USAspending Custom Account Data](https://api.usaspending.gov/docs/endpoints/) permits filtering by fiscal year, period, federal account and `TAS_AccountBalances` records. This increment requested:

```json
{
  "account_level": "treasury_account",
  "file_format": "csv",
  "filters": {
    "agency": "VA",
    "federal_account": "4649",
    "fy": "2025",
    "period": "12",
    "submission_types": ["account_balances"]
  }
}
```

The public Treasury backend generated one ZIP URL, responded `finished`, and delivered the original compressed File A response. The archive's sole member is a two-row CSV. Both exact original byte streams are now stored under `evidence/va-fy2025/file-a-originals/sha256/` and rechecked in CI.

| Original issuer artifact | Content SHA-256 | Bytes |
|---|---|---:|
| Generated Treasury [File A ZIP](https://files.usaspending.gov/generated_downloads/FY2025P01-P12_VA_TAS_AccountBalances_2026-10-18_H16M49S10589937.zip) | `3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0` | 859 |
| Exact, unmodified CSV member inside the Treasury ZIP | `e7f8508491ea56275aceda89e5d91f9c6466ac13d251ec0b86c21294cc1b8a2a` | 1,943 |
| Official [FY2025 federal account snapshot JSON](https://api.usaspending.gov/api/v2/federal_accounts/4649/fiscal_year_snapshot/2025/) | `81f15a17121e594cdf2f05947f84af4d77a9cb4e026e1f713853f90194dc0108` | 320 |
| Official [VA FY2025 P12 submission/publication history JSON](https://api.usaspending.gov/api/v2/reporting/agencies/036/2025/12/submission_history/) | `ae3892cce28468ef20484b1e0ccda087ed57ee7724b1ff7a527624e76141096d` | 363 |

The source ZIP was captured in [Actions run 39146963169](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/39146963169), as an unsigned, temporary GitHub Actions evidence artifact. Exact original ZIP and member bytes were additionally placed into versioned Git objects. Account API originals were captured in earlier bounded GET-only runs and imported without normalizing their bytes.

**Agency submission provenance, not a specific signer's personal certificate:** Treasury's period-12 agency-level submission history reports a publication/certification pair from November 17, 2025 and another from May 15, 2026. They do not establish the signature, named human approving officer or nonrepudiation of either embedded File A row. The CSV itself says it was last modified May 15, 2026, even though the account's fiscal period ended September 30, 2025. Git history is **not** an approved independent WORM archive.

Treasury's [USAspending Data Sources](https://www.usaspending.gov/data/data-sources-download.pdf) explains that File A may originate from GTAS or from agency-uploaded account reporting and crosswalks with SF-133. The government-published File A is a genuine, account-specific source report, but do not call it an independently signed VA SF-133 or the complete underlying GTAS trial-balance submission.

## Source rows, exact cents

| Fiscal-year 2025 P12 field | No Year `036-X-0102-000` | Legacy `036-2020/2020-0102-000` |
|---|---:|---:|
| Opening unobligated balance | $4,408,688,180.73 | $1,245,047,202.45 |
| Adjustments to brought-forward balance | $878,760,248.53 | −$1,245,047,202.45 |
| Appropriations in reporting period | $212,552,579,000.00 | $0.00 |
| Total budgetary resources | **$217,840,027,429.26** | **$0.00** |
| Obligations incurred | $203,144,226,697.36 | $0.00 |
| Prior-year recoveries/deobligations/refunds | $878,760,248.53 | $24,400,000.00 |
| Unobligated closing balance | $14,695,800,731.90 | $0.00 |
| **Gross outlays** | **$201,510,355,302.81** | **$0.00** |

Within the original no-year File A, two exact-cent identities pass:

```text
$4,408,688,180.73 + $878,760,248.53 + $212,552,579,000.00 = $217,840,027,429.26
$203,144,226,697.36 + $14,695,800,731.90 = $217,840,027,429.26
```

The same original File A source's total budgetary resources, obligations, unobligated balance and gross outlays match the government's separate FY2025 federal account snapshot. This is **same-government-publisher consistency**, not independent validation of all primary agency bookkeeping records.

The former FY2020 File A TAS shows **$24.4 million** in `deobligations_or_recoveries_or_refunds_from_prior_year`. Treasury's prior INC-07 Combined Statement has a **negative $24.4 million** net outlay for a FY2020 component. Identical magnitude and historical account are observable, but their accounting classifications and actual transaction lineage cannot be assumed identical.

## INC-08 OMB April 2025 versus revised FY2025 File A

The official original April 14, 2025 OMB `036-X-0102` apportionment reported **$218,641,267,181** in approved-plan resource line `6190`, including $1.680 billion in *anticipated* recoveries. FY2025 File A reports **$217,840,027,429.26** resources, including **$878,760,248.53** subsequently reported adjustments.

The difference can be decomposed without inventing missing expenditures:

| Reported source contrast | Difference |
|---|---:|
| OMB April approved-plan resources less File A later reported resources | $801,239,751.74 |
| OMB anticipated recoveries less File A subsequently reported adjustments | $801,239,751.47 |
| OMB rounded opening balance less File A exact opening balance | $0.27 |
| Numerical bridge total | **$801,239,751.74** |

**Critical qualification:** the two sources are different fiscal periods/measurement classes. Their arithmetic differences do **not** establish that OMB's four projected recovery subcategories equal File A's one adjustment field, nor indicate improper expenditures. Original signed SF-133 and account-specific GTAS reporting are still needed to legally and operationally qualify the bridge.

## Gross versus net and publication-vintage mismatch

The official File A provides **gross** FY2025 account outlays $201,510,355,302.81. INC-07's published Treasury Combined Statement subtotal provides **net** FY2025 account outlays $200,670,783,364.35. The observed gross-minus-net difference is **$839,571,938.46**, while the previously modeled OMB budget appendix lists offsetting collections of **$839 million, rounded**. Without an original account netting/offset ledger and consistent source revisions, the observed difference must not be represented as an independently audited reconciliation.

The later File A source's total budgetary resources $217,840,027,429.26 differ by $972,570.74 from the earlier OMB-published rounded FY2025 figure $217,841 million. That exceeds a simple $0.5 million nearest-million tolerance. The source-vintage/reporting-basis difference remains **unresolved**, not an allegation of misuse or a fabricated precise match.

File A obligations $203,144,226,697.36 and gross outlays $201,510,355,302.81 *do* agree when rounded to the OMB FY2025 published totals of $203,144 million and $201,510 million respectively. These comparisons are limited to compatible published aggregates.

## Legally necessary execution and custody instruments still unavailable

The following **eight gates remain open**: signed VA FMA/TDA and account-specific allotments; actual VA AAWS/iFAMS postings; signed original FY2025 SF-133 and original agency GTAS submissions; source-qualified gross-to-net account bridge; beneficiary-level lawful obligation/payment; independent file-specific original signer authentication; independent financial/legal interpretation of cross-source vintages; and approved institutional WORM, separate custody, retention and audit/recovery.

Existing INC-08 and 04F unresolved legal/source governance gates remain unchanged. Capturing government account-reporting CSV does not alter the constitutional, statutory, fiscal delegation, VA authority or legal-review evidence status.

## Reproducible regression and audit

```sh
node scripts/validate-inc09.mjs
node --test tests/inc09-source.test.mjs tests/inc09-fiscal.test.mjs
```

The deterministic validator reads **original Git byte streams** and recomputes SHA-256 for four official outputs, verifies the sole ZIP member, its CRC32 and the byte-exact CSV, checks each source row's fiscal period/TAS and precise integer cents, validates the API snapshot/certification metadata, and tests typed institutional/appropriation relationships, cross-document arithmetic and all eight open gates. Tests reject fabricated signed FMA/SF-133/GTAS claims, gross/net conflation, missing legacy reporting, false roundoff matches, corrupted originals, and Article or Amendment legal-effect changes.

The separate live-source download workflow is bounded, independently rehashes any fresh government response, and records failures as missing source evidence; it cannot silently overwrite the pinned canonical original repository version.
