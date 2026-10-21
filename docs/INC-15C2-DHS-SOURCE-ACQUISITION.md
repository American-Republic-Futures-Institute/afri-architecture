# INC-15C.2 — Official DHS FY2024 APR byte-custody acquisition gate

Issue: [INC-15C.2 #52](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/52). Predecessor: [INC-15C.1 merged PR #51](https://github.com/American-Republic-Futures-Institute/afri-architecture/pull/51), merge `c722e7493f8fa6a4bb3f5d56b9b8d1bf82be0976`.

## Qualification status — acquisition infrastructure only, not the completed census

This is a *read-only source-acquisition and evidence-verification tool*, not a new authenticated agency cohort. It must not change the previous model's `original_publisher_pdf_sha256=null`, `original_publisher_custody_qualified=false`, current DHS first-level denominator `null`, or `adl1_certified_count=0` until a **different** independently qualified evidence and chart-reconciliation increment.

The authoritative report being sought is the DHS *Annual Performance Report FY2024*, stated publication date January 17, 2025. The source reference `CENSUS-SRC-DHS-CHART-2025` previously recorded:

1. `https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf`
2. Independently indexed DHS-hosted alternate **edition candidate**, `https://www.dhs.gov/sites/default/files/2025-01/2025_0117_dhs_annual_performance_report_fy2024.pdf`

Both paths must be treated as **separate, unverified potential byte editions** until acquired and compared. Shared filenames or indexed text do not establish byte identity. The second locator must not silently replace the source snapshot's first locator.

A public-source reader reported HTTP 403 at both URLs; container DNS resolution was unavailable, and a direct download tool also failed. These are **environment-specific failures** only; a separate GitHub Actions runner performs independent live attempts and emits its own timestamped receipt.

## Procedure

```sh
node --test tests/inc15c2-dhs-acquisition.test.mjs
node scripts/inc15c2-dhs-original.mjs probe "$PWD/.inc15c2-run"
node scripts/inc15c2-dhs-original.mjs verify "$PWD/.inc15c2-run"
node scripts/inc15c2-dhs-original.mjs require-original "$PWD/.inc15c2-run"
```

The first two probe/verify commands succeed for an authenticated **blocked-research receipt** as well as for a captured PDF; the **require-original** command fails with exit status 2 if no decoded original PDF was acquired. A green CI probe or JSON receipt is not independent publisher-original custody certification.

The acquisition allows only exact two HTTPS DHS.gov PDF URLs and same-allowlist redirects (maximum two), never accepts PDF content from a third-party mirror, never rewrites source provenance, bounds decoded bytes to 40 MiB, checks PDF version header and trailing EOF, calculates SHA-256 over actual decoded PDF bytes, and refuses HTML, redirects to off-domain resources, incomplete PDFs, and forged legal/ADL assertions. Returned capture receipts distinguish:

- `blocked_original_publisher_bytes_unavailable`: no PDF bytes, checksum, file path, chart review, or source-qualified original.
- `captured_transient_requires_independent_durable_promotion`: exact temporary PDF bytes and SHA-256 held in an Actions artifact or local workspace, **not yet** a durable source original, legally reviewed organization, or chart-complete cohort.

GitHub Actions workflow `.github/workflows/inc15c2-dhs-source-probe.yml` tests these controls and attempts the publisher endpoints. It uploads a **30-day temporary workflow artifact** containing a JSON receipt and, if downloaded, the exact PDF under `originals/sha256/<actual-digest>.pdf`. Downloadable workflow artifacts expire and must not be mistaken for independent WORM preservation.

## Next acceptance gates if the original is obtained

1. Independently verify the publisher TLS source, PDF MIME/structure, real SHA-256, decoded byte count, final URL and redirects; **also** compare the `2025-01` and `2025-02` URLs when obtainable. Preserve any differences as separate editions.
2. Retain authenticated original PDF bytes in an approved permanent content-addressed archive. Produce an independently verifiable archive receipt, evidence location, access controls, reviewer identity and immutable Git commit for the *receipt* (not a fabricated Git blob identity). Temporary CI artifacts alone are insufficient.
3. Render and visually inspect the report's printed organizational chart (nominal page 24; physical PDF page may differ). Transcribe **all** chart heads/classes/residuals from that exact retained edition, including leadership offices, support units, independent IG placement and conditional Coast Guard relationships.
4. Crosswalk every observed chart entry against the ten historical ARFI records in `model/federal/inc15c1-dhs-source-reconciliation.json`; separately record nonmatches rather than forcing a count of ten. Retain the original `CENSUS-COMP-DHS-*` and `X12-OBS-*` identifiers.
5. The resulting denominator, if established, is for a **source edition's defined chart population**, never the present-day legal first-level membership denominator by implication. Current legal review, departmental denominator and ADL-1 remain independent release gates.

## Stop condition

An official HTTP 403 or source acquisition failure is evidence that the *research environment is blocked*, **not** evidence that a source was independently captured or that its chart population was independently verified. Do not merge a claim that original PDF custody or chart enumeration is complete without retained bytes and an actual page review. If blocked, leave [issue #52](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/52) open, preserve the probe attempt and move to another publisher-qualified INC-15C department until DHS can be independently acquired.

This increment does not change production website code, jurisdiction models, powers, or detailed policy analysis.
