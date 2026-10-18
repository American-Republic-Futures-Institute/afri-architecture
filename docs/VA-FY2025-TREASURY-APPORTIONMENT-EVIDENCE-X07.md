# X07 — FY2025 VA Treasury account, public apportionment and funds-control evidence

**Research case:** VA Compensation and Pensions, federal account `036-0102`. Follows INC-06 `X06-TRACE-VA-2025-0102`. **Research-only, unratified.** This increment does *not* prove any lawful payment for a person or any compliance conclusion.

## Evidence accepted and provenance limits

1. **Treasury original published Combined Statement, FY2025 Chapter 42, printed p. 4**: [Bureau of the Fiscal Service PDF](https://fiscal.treasury.gov/files/reports-statements/combined-statement/cs2025/c42.pdf). Separate `AID=036 MAIN=0102 SUB=000` availability-period rows: `No Year`, `2020`, and account `Subtotal`. This evidence supports component identification, not individual source funding or an independently certified signed TAS ledger. The live government PDF's account table was inspected; the original PDF bytes were **not** captured or hashed in ARFI's immutable custody.
2. **VA fund symbols / budget cycle policy**, approved September 11, 2024: [Volume II Chapter 02](https://department.va.gov/financial-policy-documents/financial-document/chapter-02-vas-budget-cycle-and-fund-symbols/). Its Appendix C includes `0102` as no-year VBA Compensation and Pensions. This is dated policy evidence, not an executed VA account allotment.
3. **VA funds-control policy**, approved July 17, 2024: [Volume II Chapter 03](https://department.va.gov/financial-policy-documents/financial-document/chapter-03-va-funds-control/). It distinguishes Level 1 appropriations, Level 2 OMB apportionments, Level 3 allotments, further suballotments, Finance Management Allowance (FMA), Transfer of Disbursing Authority (TDA / VA Form 4-4564-6), the Apportionment and Allotment Workflow System (AAWS), and FMS/iFAMS entries. Named official classes and process requirements are documented; **no FY2025 signed instance** has been obtained.
4. **OMB public apportionments portal:** [official public archive](https://apportionment-public.max.gov/), supporting the existence of publicly posted FY2025 documents. Original document bytes **not** acquired in this increment. For the four indexed FY2025 revisions of TAFS `036-0102 /X`, [OpenOMB](https://openomb.org/search) acts strictly as an **independent third-party document index/transcription**, **not** as official government attestation. Dates/file IDs: 2024-08-19 (`11366310`), 2024-11-22 (`11397317`), 2024-12-20 (`11403044`), 2025-04-14 (`11424792`). Their URLs are indexed; one original official JSON URL is discovered for the December record but its original bytes and signatures could not be retrieved. The April record was verified by search-index metadata only. Do not infer the final FY2025 apportioned amount.
5. **December 2024 secondary transcription** ([OpenOMB file 11403044](https://openomb.org/file/11403044)): indexed Schedule line 6190 `$188,399,203,181` total budgetary resources; line 6011 `$186,719,203,181` annual basis. Its footnote explicitly warns some source resources can be rounded up and do not necessarily equal SF-133 actuals. These are *dated indexed apportionment document figures*, not FY2025 agency-executed obligations or final end-of-year receipts.

## Official Treasury FY2025 reported exact account data

All figures below are **Treasury reported USD exact to cents**, *not* a description of a specific signed warrant, obligation or payment. The report has separate historical no-year and FY2020 rows.

| Component | Beginning | Appropriations and other obligational authority | Net outlays | Balances withdrawn/other transactions | Closing |
|---|---:|---:|---:|---:|---:|
| No Year `036-X-0102-000` | $20,239,172,078.06 | $212,552,579,000.00 | $200,695,183,364.35 | $0.00 | $32,096,567,713.71 |
| Legacy 2020 `036-2020-0102-000` | $1,245,047,202.45 | $0.00 | -$24,400,000.00 | $1,269,447,202.45 | $0.00 |
| `036-0102-000` subtotal | $21,484,219,280.51 | $212,552,579,000.00 | $200,670,783,364.35 | $1,269,447,202.45 | $32,096,567,713.71 |

The verified report's to-cent accounting relation for each row is:

`beginning + reported authority - net outlays - withdrawn/other + net transfers = ending`

The row totals sum to the account subtotal. Treasury's exact net subtotal **$200,670,783,364.35** rounds to the OMB Appendix INC-06 historical FY2025 net outlay **$200,671 million**, without asserting identical treatment of every accounting entry, program subactivity or separate approved apportionment.

**Important negative claim:** the legacy FY2020 `-$24.4m` net outlay adjustment and `$1.269b` withdrawal are separate from the FY2025 new no-year appropriation; do not hide them by copying no-year net outlays into the subtotal.

## Open evidence gaps

The following seven remain **explicitly unverified**:
- Approved original OMB SF-132 and all FY2025 revisions, with signatures and source-byte SHA-256.
- Which OMB SF-132 applied at each effective date and final fiscal-year-end qualified amount.
- Account-specific signed VA FMA/TDA for actual allotments.
- AAWS / iFAMS posted funds-control and approval documentation.
- FY2025 SF-133/GTAS source and reconciled obligation ledger (distinct from Treasury cash).
- Specific beneficiary adjudication, obligating official, voucher and payment.
- Cryptographically retained immutable original-byte custody and independent approvals for official source records.

The source-enriched `X07-TAS` records qualify **the publicly reported symbols**, not the entire older `X06-GAP-TAS` claim (which also requires tranche-to-symbol mapping), and do not automatically change existing INC-06 qualified statuses.

## Developer validation

```sh
node scripts/validate-inc07-treasury.mjs
node --test tests/inc07-treasury.test.mjs tests/inc07-treasury-envelope.test.mjs
```

The schema+semantic validator checks exact cents, fiscal-period arithmetic, Treasury sum/legacy signs, seven open evidence gates, four indexed FY2025 revision dates without fabricated original custody, source host/citations, signed VA process distinctions, original Constitution, all typed edges including qualification arrays and the compatibility of INC-06 OMB rounded historical net cash. No full primary SF-132 bytes or individual payment event is represented as verified.
