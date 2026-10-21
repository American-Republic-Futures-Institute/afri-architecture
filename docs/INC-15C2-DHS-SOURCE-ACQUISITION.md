# INC-15C.2 — Official DHS FY2024 APR byte-custody acquisition gate

Issue: [INC-15C.2 #52](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/52). Predecessor: [INC-15C.1 merged PR #51](https://github.com/American-Republic-Futures-Institute/afri-architecture/pull/51), merge `c722e7493f8fa6a4bb3f5d56b9b8d1bf82be0976`.

## Qualification status — authentic original obtained and chart transcribed; current legal census remains unqualified

The source-acquisition tool **successfully retrieved the exact original PDF** from the registered `/2025-02/` DHS HTTPS URL using GitHub Actions and preserved 17,622,005 bytes as a versioned content-addressed Git evidence object. SHA-256: `d48f661bf9d6643409585451a2dc49f53358fe869dd40d182344f0bed58e4175`; Git blob: `bdbcbc4a6045eebef852daeceeb154be15c48684`. The separately published `model/federal/inc15c2-dhs-chart-boxes.json` enumerates **34 source diagram boxes**. Previous INC-15C.1 unqualified source-study flags remain historically unchanged, while this new record states the new independently verified source bytes and bounds.

The capture and Git receipt do **not** attest independent WORM custody, human legal review, current DHS first-level membership or ADL-1. The current departmental legal denominator remains `null` and legally certified institutions remain `0`.

The authoritative report being sought is the DHS *Annual Performance Report FY2024*, stated publication date January 17, 2025. The source reference `CENSUS-SRC-DHS-CHART-2025` previously recorded:

1. `https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf`
2. Independently indexed DHS-hosted alternate **edition candidate**, `https://www.dhs.gov/sites/default/files/2025-01/2025_0117_dhs_annual_performance_report_fy2024.pdf`

Both paths must be treated as **separate, unverified potential byte editions** until acquired and compared. Shared filenames or indexed text do not establish byte identity. The second locator must not silently replace the source snapshot's first locator.

Earlier public-source readers returned HTTP 403 for both URLs and the local container lacked external DNS resolution. A GitHub Actions runner **did successfully capture** the registered `/2025-02/` original on 2026-10-21; capture receipt and exact original are retained under `evidence/dhs-fy2024/`. The alternate `/2025-01/` URL remains **unacquired and unproven byte-identical**; no historical revision is inferred from that separate locator.

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

## Completed and remaining source-qualification gates

1. **Completed:** official `2025-02` DHS-hosted PDF original acquired with exact decoded SHA-256, byte count, HTTP final URL and no redirect; authenticated original and capture receipts preserved in versioned Git at `evidence/dhs-fy2024/`. Temporary CI artifacts are *additional* evidence, not the primary retained original.
2. **Completed:** physical PDF page 24 visually inspected, parsed and reconciled. The independent chart workpaper `model/federal/inc15c2-dhs-chart-boxes.json` describes **34 colored source boxes**, ten linked to previous `CENSUS-COMP-DHS-*` and `X12-OBS-*` identifiers, **24 additional source-only boxes**, and Inspector General and Coast Guard distinctions.
3. **Outstanding:** authenticate independent WORM custody/signer and human evidence/legal review. Git versioning with a verified source SHA-256 **is not** independent WORM storage or legal authority certification.
4. **Outstanding:** acquire/compare the distinct `2025-01` official candidate URL before stating that the two potential editions have byte-identical histories. Publisher report PDF metadata indicates February 4 modification despite stated January 17 publication; do not infer an amendment without evidence.
5. **Outstanding and separately scoped:** legally qualify DHS first-level current institutional membership, statutory delegated powers and ADL-1, if ever supported by comprehensive independently reviewed evidence. The 34-box figure is a historical source-diagram denominator, not the department's full present-day legal first-level population.

## Stop condition

An official HTTP 403 or source acquisition failure is evidence that the *research environment is blocked*, **not** evidence that a source was independently captured or that its chart population was independently verified. Do not merge a claim that original PDF custody or chart enumeration is complete without retained bytes and an actual page review. If blocked, leave [issue #52](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/52) open, preserve the probe attempt and move to another publisher-qualified INC-15C department until DHS can be independently acquired.

This increment does not change production website code, jurisdiction models, powers, or detailed policy analysis.
