# INC-08 — Primary OMB FY2025 Source Acquisition and Funds-Control Evidence Contract

**Scope:** U.S. Department of Veterans Affairs, Compensation and Pensions, 036-X-0102, fiscal year ended 2025-09-30. Follows [INC-07 Treasury and VA research](VA-FY2025-TREASURY-APPORTIONMENT-EVIDENCE-X07.md). **Research verification only.** Original published OMB JSON identity and SHA-256 are verified in Git, but this is not digital approval-signature verification, institutional WORM custody, independent legal advice, or beneficiary-level payment authorization.

## Real government originals committed and cryptographically checked

Four original decoded JSON publisher response bodies were fetched directly from `apportionment-public.max.gov`, validated to be original FY2025 VA / Benefits Programs / account `036-X-0102` schedule data, retained byte-for-byte in content-addressed Git files and verified in CI. They are **actual public original issuer files**, not copies of OpenOMB’s reconstructed transcription.

| Approved on (publisher JSON) | OMB FileId | SHA-256 | Body bytes | Source line 6190 USD |
|---|---:|---|---:|---:|
| 2024-08-19 | 11366310 | `f9b085040ea44769776b3b1334ee3dfe89ddc32141e6d3a64f23eef9e57898ad` | 9,842 | 183,930,515,000 |
| 2024-11-22 | 11397317 | `7b0c4ca0df6137b56fe182e70ffb813b205d0cfb3426b897f36e08da64972f6d` | 10,298 | 188,339,203,181 |
| 2024-12-20 | 11403044 | `fe77acfbe018879b22f4c7147b18ac786602c25c1a5e80ea01c68e5fae166923` | 10,305 | 188,399,203,181 |
| 2025-04-14 | 11424792 | `2f821463ae0c203d019080b82be7e492637cb14061fd2549b41ed665efa0798f` | 12,348 | 218,641,267,181 |

Original file paths: `evidence/va-fy2025/omb-originals/sha256/<sha256>.json`. The original bytes are Git-versioned with source commits and exact content SHA-256; **Git alone is not governed WORM and does not independently authenticate OMB officials.** The original publisher JSON identifies `FileId`, `FileName`, `FiscalYear`, `ApprovalTimestamp`, `ApproverTitle`, `FundsProvidedBy`, `ScheduleData` and `FootnoteData`. Identity and selected financial lines are checked against the bytes, not accepted from the label alone.

Original retrieval was recorded at [GitHub Actions run 39141512347](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/39141512347), temporary original-body artifact `12142155167`, expiring **2027-01-16T15:40:05Z**. Also contains independently hashed temporary HTML response bodies for VA’s 2024 funds-control and fund-symbol public policy pages. Those HTML pages have dynamic web rendering and their original captured page bytes are **not** treated as a signed or immutable edition. The Treasury FY2025 Chapter 42 PDF response redirected to an unrelated landing page, so a replacement or falsely asserted SHA is **not** created.

## Original OMB fund-control data — distinct chronological revisions

The four public documents are successive OMB-approved-plan descriptions with different effective approval timestamps, not equal-granularity fiscal-year end SF-133 observations. The original JSON for April 2025 records:

- `1200` current mandatory appropriation: **$30,242,064,000** (Public Law 119-4).
- `1270` advance mandatory appropriation: **$182,310,515,000** (Public Law 118-42).
- `1000` actual beginning unobligated balance: **$4,408,688,181**.
- `6011` annual basis: **$216,961,267,181** = the two original appropriation lines plus the original beginning unobligated balance.
- Lines `6012–6015` anticipated/prior-year recoveries: **$1,680,000,000**, included to reach `6190` resources **$218,641,267,181**.
- `1920` total budgetary resources equals `6190` for that dated document.
- Crucial original source footnote B1 states some budget resource lines can be rounded upward; **this does not license treating anticipated recoveries as FY2025 realized recoveries or approved VA allotments**.

The prior INC-07 OMB FY2027 Appendix shows FY2025 **historical actual** account resources of **$217,841 million rounded**, which are **not the same reporting population and date** as April’s source-approved `6190`. They must *not* be subtracted and presented as unexplained missing funds. Likewise Treasury’s FY2025 account net outlays of **$200,670,783,364.35** to cents round to the separately sourced OMB actual net outlays of **$200,671 million**, but are not an individual voucher or named-beneficiary Treasury disbursement.

## Explicit outstanding execution and source-custody evidence

- OMB original JSON bytes contain an `ApproverTitle` and `ApprovalTimestamp`, but do not establish an independently cryptographically verified official’s signature or a qualified fiscal-year-end effective SF-132 authorization.
- No actual signed FY2025 account-level VA Financial Management Allowance memorandum, Transfer of Disbursing Authority (TDA), approved AAWS posting or FMS/iFAMS allocation entry has been obtained.
- No original account-specific VA SF-133 or complete agency GTAS transmission has been obtained; the source-level difference between OMB approved apportionment planning, SF-133 account execution, Treasury Combined Statement cash and DATA Act-style spending publications remains explicit.
- No audited beneficiary-level lawful decision, individually delegated obligating official, obligation, voucher or corresponding Treasury payment has been proven.
- ARFI retention policy, institutional custody signing root, qualified counsel/custodian, protected WORM primary/replica and independently witnessed recovery/audit remain unratified/unverified. Existing 04F gates are separate and remain false.

## Deterministic acceptance and replay

```sh
node scripts/validate-inc08-primary.mjs
node --test tests/inc08-primary.test.mjs tests/inc08-original-capture.test.mjs
```

The validator reads actual original JSON Git blobs, recomputes SHA-256 over each byte stream, verifies exact original file size, OMB `FileId`, fiscal year, agency `036`, main account `0102`, no-year availability, official approved date/time/title, iteration and selected financial lines, then checks all typed relations, stage-local records, control status and seven unresolved evidence gates. Negative tests reject forged amounts, mismatched originals, source origin changes, erased gaps, fabricated signed approvals, false SF-133/GTAS status, overwritten Treasury cents and alteration of the existing Constitution.

The bounded GitHub Actions capture never follows arbitrary origin redirects, never writes to production infrastructure, and stores any fresh live bytes temporarily as **unsigned 90-day artifacts**; immutable Git originals require separate reviewed import. Document-receipt SHA and content within approved source records remain pinned even if external websites later change. Institutional custody remains a separate operational prerequisite.
