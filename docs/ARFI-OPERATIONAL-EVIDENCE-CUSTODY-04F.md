# Increment 04F — Operational Evidence Custody

Status: **engineering research implementation; no ratified ARFI governance or certified archive**.

## Original-source preservation and deadlines

| Publisher sources | Original bytes | Original Actions artifact | Artifact expires (UTC) |
|---|---:|---|---|
| Justice/Treasury/VA HTML and four fixed Government Manual XML granules | 7 | Run 38990195886, artifact 12084901808 | 2027-01-15 01:17:08 |
| VA FOM Volumes 1 and 2 and 2024 U.S. Code §§301 and 7105 | 4 | Run 39042644962, artifact 12104846619 | 2027-01-15 14:53:06 |

Total: **11 original decoded publisher response bodies, 44,171,747 bytes**. The preservation queue stores exactly 11 full SHA-256 values, byte lengths, origin URLs, capture run/artifact IDs and historical source editions. Do not silently substitute current live publisher pages for the captured historical bytes.

Two *other* original pages remain unavailable: the HHS organizational chart returned HTTP 403; the specific CBCA history original at /board/index.html was not captured. The 2025 HHS Government Manual XML *is* among the seven verified originals but cannot take the missing HHS chart's provenance identity.

The VA FOM printed cover year (2023), March 2025 PDF modification and publisher update, and 2026 VA directory observation are separate temporal facts. Keep them separate.

## Reproduce the exact source replay

Prerequisites: Node.js 22, authorized GitHub CLI artifact access, enough local disk for two original archives and staged objects. These are public-source evidence files but are not approved permanent records custody.

    gh run download 38990195886 --repo American-Republic-Futures-Institute/afri-architecture --name arfi-federal-primary-source-capture-04b --dir ./evidence/04b
    gh run download 39042644962 --repo American-Republic-Futures-Institute/afri-architecture --name arfi-04d-va-fom-and-law-original-bytes-UNRATIFIED --dir ./evidence/04d
    node scripts/operational-custody-04f.mjs --validate
    node scripts/operational-custody-04f.mjs --schema
    node scripts/operational-custody-04f.mjs --stage ./evidence/04b ./evidence/04d ./evidence/04f-candidate
    node scripts/operational-custody-04f.mjs --verify ./evidence/04f-candidate
    node scripts/operational-custody-04f.mjs --release-readiness

The staging tool verifies the original 04B and 04D capture manifests, the 7+4 exact original bytes, the explicit HHS and CBCA gaps, the expected SHA-256 and source edition identities, and post-copy integrity. It creates new content-addressed objects and a canonical **unsigned** release-candidate.json. The two *original capture manifests* are copied into capture-manifests/04b.json and capture-manifests/04d.json; their SHA-256 values are bound into the candidate. No signing keys are created, no AWS objects are provisioned and no historical provenance is overwritten.

The PR workflow stages the same originals and uploads a 90-day Actions artifact named arfi-04f-eleven-original-source-bytes-UNSIGNED-NOT-WORM. It is useful as an interim contingency copy before the historic artifacts expire, but GitHub Actions retention is **not** immutable storage, independent escrow or a board-approved archival policy. Download and transfer this artifact to an institution-approved custody environment before it expires.

## Mandatory institutional authorization

Before promoting this package into qualified ARFI archival custody:

1. Confirm ARFI's legally authorized governing body, voting authority and quorum. Adopt a board-approved records schedule, source retention/hold terms, custodian appointment, professional independent counsel and successor/revocation procedures. The [04E governance adoption package](ARFI-INSTITUTIONAL-TRUST-GOVERNANCE-RESOLUTION-04E.md) is a draft only.
2. Establish an offline Ed25519 governance root controlled outside CI. Distribute its SPKI SHA-256 fingerprint out-of-band and enroll distinct source custodian, qualified statutory reviewer and archive recovery operator signers under independently witnessed key ceremonies. No private key material goes in GitHub.
3. Have the signed governance decision specify a *primary* and a separate-account *replica* source archive, KMS keys, retention minimum, CloudTrail signed digest log delivery and independent auditors. Compliance-mode Object Lock and bucket versioning must be enabled; do not rely on ordinary repository Git history or 90-day artifact retention.
4. Transfer all 11 original bytes, preserve original metadata, read back every exact object version from primary and replica, and recalculate all SHA-256 digests. The signed source release index must bind the primary and replica version IDs for each original; different principals must sign the *same canonical index bytes*.
5. Verify signed CloudTrail digest/log chains, S3 object data-event selectors and *actual relevant object events*, including primary and replica read/write events. Separately conduct a documented interruption, key rotation and regional/provider outage recovery exercise. Obtain an independently signed recovery record.
6. After external custody and counsel approval, submit a distinct institutional archival acceptance decision. Do not auto-promote the model from research-only based on a successful technical check.

## Read-only operational checks after authorized activation

These tools exist but have **not** been run against an ARFI-operated storage environment:

    ARFI_TRUST_ROOT_SHA256=<external-root-SPKI-hash> node scripts/operational-readonly-qualification-04f.mjs --verify-provider board-decision.json board-decision.sig root-public.pem signed-release-index.json two-approvals.json primary-audit-profile replica-audit-profile

The signed board decision must include an independently controlled approved_replica alongside approved_storage. The release index must include source_id, SHA256, byte_count, content-addressed object key, primary version_id and replica_version_id. The verifier checks the 04E signed root/role approvals and performs actual read-only S3 calls against both separately controlled accounts. It never signs an institutional legal or archival decision.

For each primary or replica audit trail:

    node scripts/operational-readonly-qualification-04f.mjs --audit-trail <CloudTrail-ARN> <START-UTC> <END-UTC> <SOURCE-BUCKET> <AUDITOR-PROFILE>

This checks active trail delivery, enabled integrity validation, S3 object data-event selectors, and validates the signed CloudTrail log/digest chain via the official AWS CLI. AWS documentation describes the required original-log-location and digest validation contract: https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html . A valid digest chain alone does **not** demonstrate that every source version produced a specific log event. The output expressly leaves object-event coverage, outage recovery and institutional certification false.

## Acceptance gates and next increment

Engineering gate: exact all-eleven original byte replay, deterministic index, original capture metadata preservation, source exceptions, security regressions and exact-head CI.

Operational gate: independent governance ratification, root/key enrollment, two approved role signatures, 11 immutable primary versions, 11 separately controlled replica versions, authenticated per-object audit delivery, recovered bytes under failure, and signed independent release approvals. All remain externally blocked until actual evidence exists.

VA ADL-1 gate: first establish a complete effective-date organizational denominator, reconcile 38 U.S.C. §301(c) residual categories and six special legal opinions, then secure nine separate qualification decisions. No numeric ADL-1 completeness percentage is currently justified.

**Next increment 04G:** finish current-effective-law VA roster reconciliation, independent counsel and institutional qualification, and legal ADL-1 certification decisions separately from technical source archiving.
