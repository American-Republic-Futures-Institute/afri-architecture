# INC-06 — FY2025 Federal Appropriation-to-Program Operational Lineage

**One bounded real case: VA Veterans Benefits Administration Compensation and Pensions, Federal Account 036-0102; fiscal period 2024-10-01 through 2025-09-30.**

**Status:** published-source descriptive fiscal research. **NOT** legal approval, executable instruction, institutionally certified ADL1, effective individual delegation, verified apportionment, or a forensic trace of any one payment.

## Independent evidence and temporal basis

1. Congress enacted an advance appropriation of **$182,310,515,000** for fiscal 2025, available from **2024-10-01** until expended, under **P.L. 118-42**, Division A, Title II, Compensation and Pensions. The FY2025 capped reimbursement proviso is **$22,109,000** for specified expenses; no actual reimbursement transaction is claimed. [Official statute](https://www.govinfo.gov/content/pkg/PLAW-118publ42/html/PLAW-118publ42.htm).
2. Congress enacted an additional **$30,242,064,000** for the same Compensation and Pensions heading, to remain available until expended, under **P.L. 119-4, section 11110(1)**, enacted **2025-03-15**. This is a separate enactment, *not a President's request*. [Official statute](https://www.govinfo.gov/content/pkg/PLAW-119publ4/html/PLAW-119publ4.htm).
3. The exact sum of these two identifiable FY2025 enactments is **$212,552,579,000**. That exact legal amount is **not** the same data type as an OMB table rounded in millions; do not use individual tranche dollars as if tied to any reported outlay.
4. The **FY2027 OMB Budget Appendix**, published **2026-04-03**, reports **FY2025 actual** historical account 036-0102 financial observations, at **USD millions precision** (approximate dollars, not certified exact vouchers):

| Actual fiscal 2025 observation | Millions USD | OMB appendix line |
|---|---:|---|
| Gross budget authority | 212,553 | 1900 / 4090 |
| Total beginning unobligated resources (including recoveries) | 5,288 | 1070 |
| Total budgetary resources available | 217,841 | 1930 |
| New obligations, unexpired accounts | 203,144 | 0900 / 3010 |
| Remaining unexpired unobligated balance | 14,697 | 1941 |
| Gross outlays (absolute amount) | 201,510 | 3020 / 4110 |
| Offsetting collections against gross outlays | 839 | 4130 |
| Net outlays | 200,671 | 4170 / 4190 |

These cross-check at *published rounded precision*: 212,553 + 5,288 = 217,841; 217,841 - 203,144 = 14,697; and 201,510 - 839 = 200,671.

**Important:** total budgetary resources `217,841` is NOT equal to amounts certified/apportioned/released to an individual official. **FY2025 new obligations** cannot be subtracted from **FY2025 gross outlays** to estimate the unpaid part of new FY2025 obligations: outlays can liquidate earlier-year obligations. Gross vs net outlays must not be interchanged. Actual single-beneficiary payments, SF-132s, allotments, component TAS and official disbursement instruments have not been obtained. Published source [FY2027 OMB VA Appendix PDF](https://www.whitehouse.gov/wp-content/uploads/2026/04/vet_fy2027.pdf), displayed federal pages 1009–1010, PDF pages 10–11.

## Constitutional, statutory and institutional trace

- Constitution: Article I, §9 cl.7 `CONST-US-ART-01-SEC-09-CL-07`, read with INC-05 `X05-TRACE-I`.
- Department: `ORG-FED-EXE-DEP-VA`, 38 U.S.C. §301. VBA `X06-ACTOR-VBA` and headship `X06-ACTOR-UNDERSEC-BENEFITS` are grounded in 38 U.S.C. §306. A headship office is not an individual signed obligating or paying authorization. The preexisting VA ADL1 human qualification remains incomplete.
- Public program: `X06-PROGRAM-VA-COMP-PENSIONS-FY25` models the **whole Compensation and Pensions account**, including survivor, pension, burial, examination and other specified benefit activity. Disability compensation §1110 is a representative entitlement statute; **do not** project all account actuals to that one service.
- General controls: 31 U.S.C. §§1301 (purpose), 1341 (Antideficiency Act), 1501 (documentary evidence), 1512 (apportionments), and P.L. 118-42's specific FY2025 reimbursement proviso; eligible beneficiaries require applicable Title 38 review.
- Accountability: 31 U.S.C. §712 GAO authority, VA OIG independent general oversight, dated GAO testimony. Independent GAO findings relate to program governance and quality, **not** certified accounting for FY2025 Compensation and Pensions outlays. The FY2025 **2,849,218 completed compensation rating claims** is an OMB-reported service workload, not a causal outcomes metric or individual case authorization.

## Canonical model and strict gates

Eleven `model/federal/x06-*.json` families: `sources`, `enactments`, `accounts`, `actors`, `programs`, `controls`, `metrics`, `outcomes`, `gaps`, `relationships`, `traces`.

One `X06-TRACE-VA-2025-0102` with seven typed stages: **appropriation → budget account → program → apportionment → obligation → outlay → oversight**.

All nine open gaps must remain visibly unresolved until independently proven and approved: (1) actual SF-132 apportionment, (2) allotments and funds-control records, (3) component TAS and tranche, (4) individual signed delegation, (5) individual obligation documentary proof, (6) Treasury-disbursed payment event, (7) enacted-tranche-to-outlay attribution, (8) specific oversight/remedy linkage, and (9) individual statutory eligibility determination. Missing records are **unknown**, never proof that the underlying authority/action was illegal or absent.

Source evidence here is official *publication references*, **not** preserved, WORM-locked original bytes or independently ratified legal interpretation. No personal recipient records are included.

## Verify

```sh
node scripts/validate-inc06-envelope.mjs
node --test tests/inc06-envelope.test.mjs
node scripts/validate-inc06-lineage.mjs
node --test tests/inc06-lineage.test.mjs
```

The validator enforces exact enacted-law amounts and dates, six distinct historical financial values (plus complementary account and reconciliation measures), no-year statutory authority, sorted stages, referenced source IDs, mandatory controls and visibility of nine open gaps, role/appropriation separation and anti-certification flags. Negative tests target amount mutation, source spoofing, projected FY2027 values relabeled actual, signed obligations, apportionment inference, historical constitutional-effect drift, and implied outcomes causation.

The website's Authority & Evidence workbench must show all seven stages, money-state semantics, evidence URLs, and unresolved gates from the same immutable source SHA. Exact-head CI and live deployed response must pass before production merge.
