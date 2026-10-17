# Federal Source Archival Integrity and Bounded Roster Reconciliation — Increment 04B

**ARFI-COA v0.1.0 — research-only, unratified; based on PR #21, which is stacked on PR #20.**

## Decision record

Each of the four departmental organizational lists represents a **source section denominator**, not the legal current first-level organization of the department. An exact GovInfo XML publication is a fixed edition, whereas a department-operated HTML directory is mutable. The 2025 HHS organization chart was last reviewed August 21, 2025, and is not independently confirmed as the October 2026 hierarchy.

The source archive has three explicitly independent proof layers:

1. **Approved locator** — exactly eight allowlisted government URLs: four source webpages and four XML granules from GovInfo's dated 2025 Government Manual (Justice 121, Treasury 125, HHS 117, VA 126).
2. **Byte capture receipt** — GitHub Actions retrieves decoded HTTP response-body bytes into a short-lived artifact, records body SHA-256, original HTTP source, final same-origin URL, actual byte count, response MIME, ETag, Last-Modified and UTC timestamp, then independently verifies the hashes. It rejects an unexpected host, dangerous redirect, wrong MIME, wrong document marker, short/truncated payload, duplicate IDs and path-traversal attempts.
3. **Permanent archival promotion** — intentionally **NOT completed** in this PR. The CI artifact is retained for up to 90 days, not an immutable lifetime archive. Bytes and their hashes must subsequently be reviewed and committed to a controlled immutable evidence archive with signed publication manifest before claiming durable source preservation.

An XML file's response is captured as the exact **decoded HTTP response entity** delivered by the runner, not the compressed transfer bytes, a rendered webpage, or a scraped text summary. An external review needs to verify these byte captures and publisher edition/changes separately. The permanent-archive fields remain `null`. Seven verified SHA-256 receipts are independently recorded under `observed-capture-receipts.json`; one HHS HTML source is blocked. Repository archival remains incomplete.

## Bounded departmental source section counts

| Department | Published source section | Named source section entries | Official source edition / observation boundary |
|---|---|---:|---|
| Justice | [Attorney General signed departmental chart text](https://www.justice.gov/agencies/organizational-chart-text-version) | 36 | Signed February 17, 2026; site updated April 29, 2026 |
| Treasury | [Bureaus page body group](https://home.treasury.gov/about/bureaus/) | 9 | Mutable directory; not Treasury's full bureau/office/IG register |
| Health and Human Services | [HHS Organizational Charts](https://www.hhs.gov/about/organization/org-chart/index.html) | 28 linked named entries | Site last reviewed August 21, 2025; excludes unlinked Office of Secretary description |
| Veterans Affairs | [Administrations and Offices](https://department.va.gov/administrations-and-offices/) | 22 | Three administrations and nineteen staff-office listings; site updated February 25, 2026 |
| **Total — noncomparable source groups** | | **95** | **NOT an ADL-1 numerator or whole-department denominator** |

The Justice/Treasury/VA group entries cross-check original PR #21's 80 dated chart/directory records. HHS adds **28 distinct directory name candidates**, including CDC and CMS crosswalks to their existing PR #20 candidate IDs. None of the 95 names should be combined as an exhaustive inventory of those departments or interpreted as a national institutional census.

## Legal classification and effective-date uncertainties

Nine explicit review gates protect Inspector General independence, different appellate/adjudicative bodies, and unreviewed special statuses. DOJ OIG and EOIR, Treasury IG and TIGTA, VA OIG and Board of Veterans' Appeals, HHS OIG, Departmental Appeals Board, and Office of Medicare Hearings and Appeals each retain a unique research gap. An office listed below a senior official or under an HHS chart category does not establish who may delegate its statutory function, supervise its adjudication, make an appropriation obligation, or terminate the office.

Each department has an append-only-ready change-journal slot with source IDs and separate hashes. Before two verified captures exist, `change_detection_status=awaiting_two_byte_verified_captures`. Once two source versions are captured, compare exact digests and require a human source-diff review. Changed bytes do **not** automatically mean changed authorities; absence from a specific list does **not** establish legal abolition.

## Execution and source retention

```sh
# Deterministic model + synthetic negative security checks (no external network):
node scripts/validate-federal-archive04b.mjs --validate
node scripts/validate-federal-archive04b-schema.mjs
node scripts/validate-federal-archive04b.mjs --view VIEW-ARCH04B-HHS
node --test tests/federal-archive04b.test.mjs tests/federal-source-capture.test.mjs

# Real government-source capture on a networked trusted runner:
node scripts/capture-federal-official-sources.mjs --live /secure/arfi-04b-capture
node scripts/capture-federal-official-sources.mjs --verify /secure/arfi-04b-capture
```

On the designated PR branch, [`capture-official-sources.yml`](../.github/workflows/capture-official-sources.yml) runs read-only with no write-capable repository token and publishes an `arfi-federal-primary-source-capture-04b` artifact **only on success**. Any failed source fails closed and must not be labeled archived. The artifact is a **temporary review record**, not immutable preservation. Synthetic tests never count as source retrieval.

## Required acceptance to certify full departmental ADL-1

- Exact dated source edition plus original independently verified bytes and durable SHA-256 manifest.
- Explicit first-level organization definition and complete authoritative unit denominator for the *same jurisdiction and same edition*, including Inspector General, independent adjudicative and cross-reporting exceptions.
- Point-in-time predecessor/successor/name and charter reconciliation against agency instruments, legal citations and effective changes.
- Qualified legal/institutional review with provenance, reviewer, legal classification decisions, and exception accounting.
- Only after those gates are satisfied may a specific department be promoted; the federal government denominator remains independently unestablished.

**This increment certifies no ADL-1 department, issues no legal opinion, and makes no website deployment.**

## Recommended Increment 04C

Establish a **durably retained, content-addressed primary-source evidence store** (Git-tracked small textual sources with SHA-256 or separately versioned release artifacts for larger binaries), independently sign the capture manifest, reconcile source diffs with change-event IDs, and then close the full first-level enumeration gap for a single controlled department—preferably VA or Justice—before scaling the approach to the other ten. This avoids converting a partial directory into an apparently complete federal architecture.

### Verified temporary captures, October 17, 2026

GitHub Actions run [38990195886](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/38990195886) captured and SHA-256-verified **seven of eight** original response entities. Artifact [12084901808](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/38990195886/artifacts/12084901808) has zip SHA-256 `3aff191998ee6c3f28e5778f855ef0dae1758a81616dc24110d788f9b5e812ce` and expires `2027-01-15T01:17:08Z`. All seven individual original response bodies were independently downloaded and rehashed; these receipts are preserved in `model/federal/archive04b/observed-capture-receipts.json`. The original raw bytes are **not yet committed to the architecture repository**.

The HHS chart source returned **HTTP 403**. No HHS HTML capture or hash is claimed; its separate 2025 Government Manual department XML is available and verified. The official parent GovInfo XML has one package-local `Entity` root per downloaded granule, not an exhaustive subordinate agency roster. Four source-local parent IDs, XML access IDs, and received-document SHA-256s are recorded in `govman-xml-root-metadata.json`. These local IDs must not be treated as a universal government agency identifier.

The capture workflow **fails its eight-source completeness gate intentionally** while retaining the partial verified artifact. It must not be marked a passing full archive workflow or granted ADL-1.
