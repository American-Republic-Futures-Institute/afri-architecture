# Increment 04C — Durable evidence staging and VA institutional ADL-1 pilot

**ARFI-COA v0.1.0. Research-only, unratified. No certified VA ADL-1, institutional signing key, durable retained archive or website deployment.**

## Source and architecture boundary

Stacked on draft PR #22 (PR #21 → PR #20 → merged #18). DoD PR #19 is independent and not modified; PR #30 remains excluded.

Three distinct populations must never be collapsed:
- **22 named VA directory headings:** 3 Administrations plus 19 Staff Offices in the original VA HTML captured October 17, 2026 (site updated February 25, 2026). Office of the Secretary appears as a separate h2 heading, not one of these 22.
- **Nine clauses of 38 U.S.C. §301(c):** seven named composition elements and two open statutory categories. The existing VA directory matches VHA, VBA, NCA and Board of Veterans' Appeals. The Office of the Secretary appears in a separate heading; Veterans' Canteen Service and the Board of Contract Appeals are not in those 22 entries. A missing directory listing is **not evidence of statutory repeal, abolition or reassignment**.
- **Unknown complete same-as-of first-level legal and organizational denominator.** Title 38's open categories, VA OIG statutory independence, BVA adjudication, additional offices, and different source editions preclude certifying 22/22 as complete.

Sources requiring independent original-byte archiving and legal review: [VA Administrations and Offices](https://department.va.gov/administrations-and-offices/); [38 U.S.C. §301](https://www.govinfo.gov/link/uscode/38/301); [VA Functional Organization Manual v8.1 Volume 1](https://department.va.gov/wp-content/uploads/2025/04/va-functional-organizational-manual-volume-1.pdf) and [Volume 2](https://department.va.gov/wp-content/uploads/2024/06/va-functional-organizational-manual-volume-2.pdf); [VA FY2024 Agency Financial Report organizational chart](https://department.va.gov/wp-content/uploads/2024/11/2024-va-afr-section-i-managements-discussion-and-analysis.pdf). The two FOM manuals and FY2024 AFR are identified research targets only: **their source bytes, dated legal effects and current organizational differences are not archived, proven or approved by this increment.**

VA Inspector General is a separate oversight function subject to the Inspector General Act (5 U.S.C. chapter 4) and any applicable exceptions, not a source-inferred line-command subordinate. Board of Veterans' Appeals has adjudicative jurisdiction under Title 38 chapter 71 (including §7104) and must not be treated as an ordinary command office. Office of Employment Discrimination Complaint Adjudication also requires a specific controlling instrument. All require qualified legal review before publication of legal effects.

## Evidence lineage, content address and signing

Seven existing SHA-256-verified original response-body records are referenced from [GitHub Actions run 38990195886, artifact 12084901808](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/38990195886/artifacts/12084901808); four GovInfo 2025 XML granules plus Justice, Treasury and VA HTML. The HHS 2025 organizational chart has **HTTP 403** and no original-body SHA-256.

The repeatable stage CLI verifies exact eight-source accounting (seven received, one explicitly missing), each original response's recorded byte count, digest and source URL, then writes actual source bytes at content-addressed paths such as "sha256/AB/AB...digest". It signs **canonical UTF-8 index JSON** with a detached Ed25519 signature only when an institutionally authorized external private key is supplied. Verification requires explicit signer ID, pinned public key SHA-256 and approved trust-policy allowlist; bytes, origin and issuer are individually checked. All key custody is **outside Git and Action logs**.

**Cryptographic identity does not equal qualified legal approval.** No approved ARFI institutional signer/public-key registry or ratified immutable retention target has been provisioned, so staging is deliberately unsigned/untrusted and **not permanently promoted**. A GitHub artifact with 90-day retention is not a lifetime evidence archive. The proposed policy "institute lifetime plus ten years" must be ratified by governance and implemented with a versioned protected Git evidence repository or immutable write-once/object-lock store, plus source object digests, signer enrollment, retention policy and independent reviewer signoff.

### Reproduction

\`\`\`sh
gh run download 38990195886 --repo American-Republic-Futures-Institute/afri-architecture --name arfi-federal-primary-source-capture-04b --dir ./capture04b
node scripts/stage-source-registry-04c.mjs --stage ./capture04b ./staged04c
node scripts/stage-source-registry-04c.mjs --verify ./staged04c
python3 scripts/verify-va-directory-source-04c.py ./capture04b/bytes/ARCH04B-VA-HTML.html model/federal/inc04c/va-directory.json --sha256 40d3130d0484607014295318fd3d9aefacc5462ac34332f89a902c99c4e96c24
# With an externally controlled, APPROVED institute key, NEVER stored in this repository:
node scripts/stage-source-registry-04c.mjs --sign ./staged04c /secure/arfi-evidence-signing-key.pem APPROVED-SIGNER-ID
node scripts/stage-source-registry-04c.mjs --verify ./staged04c --trust /secure/approved-signer-registry.json --require-signature
\`\`\`

The 04C source-replay GitHub Action has **actions:read, contents:read**, no write-capable repo credential, and uploads staged evidence as a **temporary, unsigned** artifact. Successful staging does not certify permanent preservation or ADL-1. Source SHA-256, directory headings and the 22-item bound can be independently reproduced against the uploaded 04B response bytes.

Nine strict machine-readable research families include archive index, VA directory, section 301(c) composition, coverage, gaps, approvals, retention trust policy, authorized HHS acquisition, and temporal source versions. Five reviewer roles remain pending: institutional structure, legal authority, IG independence, evidence custodianship, and source change chronology.

## HHS source access

The original HHS chart URL returned HTTP 403 to the authorized GitHub runner. A separately accessible 2026 HHS organization overview or GovInfo 2025 XML is a **different evidence source**, not the byte-verified original chart. The only proposed next retrieval paths are a publisher-supplied file or an independently identified official public alternative with written permission where needed; retain its distinct edition/source identity. No proxy evasion, bypass of 403 or fictitious FOIA/request completion.

## Required closing gates

Unresolved VA issues include Office of Secretary, Veterans' Canteen Service, Board of Contract Appeals, open statutory composition classes, OIG, BVA, OEDCA, both March 2025 VA functional manuals, whole-department first-level denominator and unsigned/not-yet-retained original byte storage. No absence means an institution was abolished; no organizational diagram creates a statutory power.

**Next increment 04D:** provision a ratified institute signer and truly immutable source archive, ingest VA FOM plus dated Title 38 instrument bytes, trace organizational predecessors and authority exceptions, and complete the first externally reviewed VA ADL-1 denominator—if the evidence supports completeness.
