# Increment 04D — VA source edition ingestion, legal continuity and controlled evidence release

**Research baseline only — ARFI-COA 0.1.0. All source and legal claims remain explicitly edition- and scope-bounded.**

## Chain and boundaries

Research PR #24 is stacked on unmerged draft PR #23 → #22 → #21 → #20, above merged PR #18. DoD PR #19 is independent. PR #30 is outside this work. The legal and institutional approvals specified in the PR descriptions cannot be replaced with CI success. Nothing in this increment is approved for website publication, a government policy proposal, durable official record custody or department ADL-1 certification.

## Exact original source evidence

Four mandatory documents were captured from the official source URLs into **temporary** read-only GitHub Actions artifacts and independently rehashed from the downloaded response bytes. The hashes below are the decoded original HTTP entity bodies:

| Source | Publication and observed distinction | SHA-256 | Bytes |
|---|---|---|---:|
| [VA FOM v8.1 Volume 1](https://department.va.gov/wp-content/uploads/2025/04/va-functional-organizational-manual-volume-1.pdf) | Cover **2023**, PDF modified **2025-03-14**, VA page says updated March 2025; **315 physical PDF pages** | d4c9bc1f84cfb08dd92df5e95e624b479f04a9f7e94abecb6e092e2748a5d523 | 8,993,757 |
| [VA FOM v8.1 Volume 2](https://department.va.gov/wp-content/uploads/2024/06/va-functional-organizational-manual-volume-2.pdf) | Cover **2023**, PDF modified **2025-03-14**, VA page says updated March 2025; **506 physical PDF pages** | a9900503672b48541a1639167bc0a2b2f5e7b3607c85881faa9caf0b28a90f1b | 33,434,554 |
| [38 U.S.C. §301](https://www.govinfo.gov/content/pkg/USCODE-2024-title38/html/USCODE-2024-title38-partI-chap3-sec301.htm) | GovInfo **2024 Code edition**, not automatically 2026 effective law | d56b1ef48b0b6c85a5d68ecf2f9469b83f066c4 | 28,011 |
| [41 U.S.C. §7105](https://www.govinfo.gov/content/pkg/USCODE-2024-title41/html/USCODE-2024-title41-subtitleIII-chap71-sec7105.htm) | GovInfo **2024 Code edition**, not automatically 2026 effective law | 8e5d35b1cdc7c7fc8832bd0aacf8ecb487b7df772cd50ae3dbf4988f77cd94d7 | 18,691 |

The official [CBCA history page](https://www.cbca.gov/board/index.html) is the fifth separately allowlisted capture target. It was unavailable to the GitHub runner and remains **unhashed and unarchived**; its previously researched publisher assertions are not presented as byte-verified original evidence. CI requires the **four core PDF/statutory sources** to succeed, and reports any blocked CBCA capture distinctly.

The FOM cover-year, modification timestamp, VA index update timestamp, observed HTTP body retrieval time and historical organization effective dates are **different temporal attributes**. All must remain separate.

The four original bytes are currently in a GitHub Actions **90-day temporary evidence artifact**, not embedded in the architecture Git history or promoted to an approved immutable source registry. Capture receipts in \`model/federal/inc04d/observed-source-receipts.json\` preserve immutable document hashes, sizes, as-of editions, artifact ID, and separate nonverified legal/archival flags.

## Six independently bounded FOM research anchors

| Manual | Physical PDF page (1-based) | Source section | Evidence boundary |
|---|---:|---|---|
| Vol. 1 | 7 | Organization of the Department | Secretary, Deputy Secretary and organizational roles, descriptive only |
| Vol. 1 | 8 | Three Administrations | Publisher-reported administration roster/organization; no current certified hierarchy |
| Vol. 2 | 19 | OSVA-00 Office of the Secretary | Not counted among the original 22 directory headings |
| Vol. 2 | 33 | OSVA-000 OEDCA | Statutory adjudicative issue, not ordinary personnel command |
| Vol. 2 | 39 | BVA-01 Board of Veterans' Appeals | Appeal jurisdiction requires Title 38, not office-chart inference |
| Vol. 2 | 321 | OIG-50 Office of Inspector General | Independent oversight; ordinary command hierarchy would be incorrect |

Anchors were inspected in original captured PDF bytes and linked to the exact source hashes. They are examples sufficient to test the modeling discipline—not a complete extraction of the 821 manual pages.

## Reconciled legal research leads, not ratified legal conclusions

- **Veterans' Canteen Service:** 38 U.S.C. §301(c)(6) names the service; §7801 describes the instrumentality, and §7808 requires an independent operating unit within the Department under Secretary control/supervision. The omission from the webpage's 22 listings cannot be used to remove or diminish this legal identity. The 2026 §7808 and §7801 displays still require exact edition/effective-date legal review.
- **Former VA Board of Contract Appeals:** The 2024 38 U.S.C. §301(c)(7) still prints the VA board name, while the CBCA's official history says predecessor board functions were consolidated on January 6, 2007. The 2024 41 U.S.C. §7105(b) establishes the CBCA in **GSA**, with jurisdiction under §7105(e). A candidate historical function transfer is supported; an implicit repeal of §301(c)(7), wholesale transition of all historic VA authorities or current VA agency abolition **is not**.
- **VA OEDCA:** The captured FOM Vol. 2 p33 describes the office's independent discrimination-complaint adjudication; 38 U.S.C. §319 is the statutory anchor, including Director direct reporting to Secretary/Deputy. A directory label alone is not authority for case outcome direction.
- **VA BVA:** 38 U.S.C. §7101 describes an administrative supervision chain. Section 7104 separately provides final appellate decision jurisdiction. Descriptive department-chart membership cannot substitute for these distinct powers.
- **VA OIG:** Under 5 U.S.C. §403, qualified general establishment-head supervision is not permission to prohibit IG audits or investigations. Other statutory exceptions must be individually identified before a legal authority edge can be approved.

The statutory leads outside the two captured 2024 Code sections are verified public research references, **not captured authenticated legal edition bytes or independent legal advice**. Signed administrative delegations, legal amendments/citators and governing effective dates require qualified review.

## Three denominators remain separate

1. VA website directory subset: **3 administrations + 19 staff offices = 22** historical published headings.
2. Statutory composition: **9 clauses** of 38 U.S.C. §301(c), including **2 open-ended categories** that are not an institution roster.
3. Verified full VA first-level institutional population: **unknown**. Do not show 22/22 as full departmental ADL-1 or assume listed subdivisions exhaust a legal parent.

The six special legal identities (Canteen, former VABCA, CBCA/GSA, OIG, BVA, OEDCA) remain separate and unratified. The 2007 candidate predecessor/successor event does not itself assert a definitive legal change.

## Trusted evidence release architecture — implemented controls vs operational gates

**Implemented:** strict 2020-12 JSON Schema for nine collections, fail-closed provenance/authority validator, byte-level source capture, exact PDF page verification, independent digest check, deterministic JSON canonicalization, role-separated Ed25519 signature verification against an explicitly pinned external trust registry, release-readiness CLI, and storage-protection/retention attestation schema checks. Synthetic signing tests cannot authorize a real institute key.

**Not activated:** no approved ARFI Ed25519 signer; no institutional root-trust registry, legal reviewer/custodian signed release, ratified records retention policy, immutable object-lock/retention destination, verified protected object versions, or independently authenticated storage-provider proof. The storage proof module intentionally treats a structurally plausible provider assertion as **insufficient**, rather than falsely returning a complete permanent archive qualification.

Recommended activation sequence:
1. Ratify the public records retention policy through authorized institute governance and appoint independent evidence custodians.
2. Enroll Ed25519 institutional signing keys with pinned fingerprints and independently review custody key rotation/recovery.
3. Provision a protected immutable source store (for example S3 Object Lock compliance-mode versioning or equivalent storage with auditable retention), in a separately controlled environment. Never place signing private keys in repository content or routine PR runners.
4. Verify every original blob SHA-256, object version, signed index, approved retention deadline and storage-provider evidence from an independent identity.
5. Require distinct custodian and qualified legal reviewer approvals, with signature bound to the exact release manifest digest, before any release is marked immutable, official or ADL-1 relevant.

A GitHub branch or ordinary 90-day artifact alone **does not** prove WORM, institutional custody or source permanence.

## Reproduce the deterministic source and architectural checks

\`\`\`sh
node scripts/validate-va-04d.mjs --validate
node scripts/validate-va-04d.mjs --schema
node scripts/validate-va-04d.mjs --release-readiness
node --test tests/va-evidence04d.test.mjs tests/va-controlled-release04d.test.mjs

# Download the captured 04D artifact from GitHub Actions, then verify original bytes:
node scripts/validate-va-04d.mjs --verify-originals ./extracted-official-04d-artifact
\`\`\`

The CI report must show four mandatory SHA-256-verified sources and an explicit unavailable CBCA source without representing five out of five successful captures.

## Next increment: 04E

Establish operational custody under a **human-approved** institute signer and protected retention target, ingest authenticated dated Title 38 statutory sources for Canteen, OEDCA, BVA and IG, and reconcile VA's FOM to a complete first-level denominator and historical change ledger. Only a subsequent independent approval may certify ADL-1.
