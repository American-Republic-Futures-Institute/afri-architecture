# ARFI Evidence Governance Resolution and Custodian Appointment Package — 04E

**Status: BOARD/COUNSEL REVIEW DRAFT. No ARFI corporate board approval, organizational signature, retention schedule, custodian appointment or AWS account has been established through this PR.**

## 1. Proposed formal resolution (not adopted)

Organization: American Republic Futures Institute (ARFI)  
Decision instrument: ARFI-BOARD-[ASSIGNED BY AUTHORIZED SECRETARY]  
Adoption and effective date: [PENDING]  
Meeting quorum and conflicts-of-interest register: [PENDING]  
Authority to act under applicable legal organizational form, bylaws and board mandate: [PENDING]

**RESOLVED, subject to valid board approval**, that ARFI will operate a controlled primary-source evidence repository for its institutional architecture research; adopt a ratified retention schedule under an identified records policy; separately appoint custodians and qualified legal reviewers; and require two independent signatures for any protected evidence release. No source citation or architecture model is a legal opinion or published governmental authority determination.

**RESOLVED**, that the approved policy must specify the mandatory primary-source byte retention term, legal-hold and disposition procedure, cryptographic key governance, jurisdiction and permitted storage provider, periodic audit, offline backup, recovery testing, publisher takedown/copyright handling, future organizational succession and independently documented amendments.

**RESOLVED**, that all release and deletion permissions must be separated across trusted roles and that cryptographic verification **does not itself certify** ADL-1 institutional completeness, statutory competence, adjudicative jurisdiction, or actual government exercise of powers.

Board approval/signature records (blank until lawfully adopted):
- Authorized secretary and governance quorum: [REQUIRED]
- Signed formal resolution/document digest: [REQUIRED]
- Effective and expiry dates: [REQUIRED]
- Named qualified records officer / primary custodian / independent second custodian: [REQUIRED]
- Named legal reviewer with documented qualifications and conflict disclosure: [REQUIRED]
- Separately approved offline governance trust-root public-key SHA-256: [REQUIRED]
- Ratified minimum source-retention deadline and evidence-account authorization: [REQUIRED]

An unapproved document, GitHub PR merge, CI success or self-signed test key is **not** ARFI governance.

## 2. Cryptographic key ceremony and revocation

Operate entirely outside pull-request runners. Use separate offline Ed25519 governance root and role keys for source custodian and qualified statutory counsel; require identity verification, an approved scope, 64-byte Ed25519 key signatures, proof-of-possession per enrollment, time-bounded appointments, and a signed revocation ledger. Fingerprints are SHA-256 of DER-encoded public-key SubjectPublicKeyInfo (SPKI). Public trust policy bytes must be deterministically canonical JSON with newline and signed by the independently pinned root key. Private keys stay in institution-controlled hardware/offline custody and must never appear in Git.

Recovery requires a new root-signed trust decision, two independent custodians, preserved historic verification keys and auditable predecessor/successor key events. A revoked signer may not make new releases, but historic signatures can remain verifiable with explicitly dated trust records. Avoid changing source byte identities when rotating signing keys.

The operator must independently supply ARFI_TRUST_ROOT_SHA256; a root fingerprint provided inside its own policy cannot bootstrap authority. Root enrollment and independence of signers must be evidenced outside GitHub.

## 3. Immutable storage and proof of preservation

Proposed template: infra/evidence-archive-04e/main.tf, which uses AWS S3 Object Lock compliance mode, object versioning, customer-managed AWS KMS default encryption, public-access block and TLS-only policy. Variables have **no approved bucket, KMS key, retention duration or resolution** and institutional_trust_ratified defaults to false. Neither plan nor apply has occurred.

For each source original, retain:
1. Publisher URL, publication edition, observed UTC time, redirect details and exact decoded HTTP response bytes, media type, byte count and SHA-256.
2. Versioned content-addressed object key and immutable version ID, actual independent GET-by-version byte digest, encryption and KMS key, retention mode/deadline and bucket versioning/Object Lock status.
3. Independently reviewed storage-account ID, signature-bound retention policy, auditable CloudTrail S3 data events, immutable audit retention and a second account/region protected replica with verified recovery.
4. Institutionally root-trusted custodian and legal reviewer signatures on the **exact release manifest**; an independent reviewer verifies storage API responses and key identity.

Proof of AWS live Object Lock configuration comes from authenticated read operations, not a JSON field named provider_verified. The tool must reject an unsigned or mutable object, a wrong account/KMS, missing version ID, governance-mode retention and source digest mismatch. The present 04E verifier checks actual primary original bytes. Independent CloudTrail-delivery proof and second-party recovery are still required and not claimed operationally complete.

The official HHS original organizational chart previously returned HTTP 403 and remains outside any source-completeness claim until acquired by an authorized method or given a specific independently signed source-exception decision. The current CBCA history HTML capture remains separately unavailable; other CBCA official pages can be cited as *distinct* sources, never silently given the original page's digest.

## 4. Human adoption checklist

- [ ] Confirm ARFI corporate/nonprofit governance authority and lawfully convened board.
- [ ] Approve retention schedule, exceptions, legal holds and authorized geographic storage jurisdiction.
- [ ] Approve named institutionally independent evidence custodians and legal reviewer.
- [ ] Generate offline root key under dual control; preserve recovery and original fingerprint in independently trusted records.
- [ ] Obtain signer proof of possession, approved time windows and signed revocation procedures.
- [ ] Provision independent account, private immutable primary and replica storage with approved AWS KMS and audit data-event trails.
- [ ] Replay and rehash source originals against 04B/04D receipts; preserve all original bytes.
- [ ] Verify actual live protected original object versions under authorized read credentials.
- [ ] Obtain custodian+qualified legal signatures on exact release manifest.
- [ ] Run a source recovery exercise, test auditor access and incident key-rotation process.
- [ ] Obtain separate institutional/qualified legal approval before any VA ADL-1 certification or public website promotion.

## 5. Operational execution (not executed)

    node scripts/arfi-evidence-ops-04e.mjs --validate
    node scripts/arfi-evidence-ops-04e.mjs --schema
    node scripts/arfi-evidence-ops-04e.mjs --view governance

After a lawfully adopted, externally signed board decision, and with root fingerprint transferred independently:

    ARFI_TRUST_ROOT_SHA256=... node scripts/arfi-evidence-ops-04e.mjs --trust-proof approved-decision.json board-decision.sig governance-root-public.pem

After IAM account approval, a protected bucket and original version have actually been provisioned:

    ARFI_TRUST_ROOT_SHA256=... node scripts/arfi-evidence-ops-04e.mjs --s3-readonly approved-object-locator.json independent-audit-profile

The latter is a **read-only object-preservation check**, not a full publication authorization. Terraform apply, source promotion, AWS KMS authorization, independent replica testing and official legal adoption are privileged separate actions and have not occurred.
