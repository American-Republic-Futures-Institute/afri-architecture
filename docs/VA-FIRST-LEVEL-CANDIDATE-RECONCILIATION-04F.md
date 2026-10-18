# Increment 04F — VA First-Level Candidate and Legal Docket Reconciliation

**Source-bounded candidate union only. Not a verified department-wide first-level denominator.**

The first interoperable register links the published VA directory subset (three Administrations plus 19 Staff Office headings) to the VA FOM source anchors and fixed 2024 U.S. Code 38 U.S.C. §301(c). The original VA directory HTML SHA-256 is 40d3130d0484607014295318fd3d9aefacc5462ac34332f89a902c99c4e96c24.

| Candidate population | Count | Boundary |
|---|---:|---|
| Captured directory Administration headings | 3 | Source description only |
| Captured directory Staff Office headings | 19 | Includes BVA/OEDCA/OIG; not a direct-report legal assertion |
| Secretary's office, Veterans' Canteen Service, historical VA Board of Contract Appeals | 3 | Source-named outside directory subset; contemporary legal type unresolved |
| **Distinct source-named candidates** | **25** | **Not** the validated first-level VA population |
| §301(c)(8) and (9) residual categories | 2 | Open-ended; cannot be replaced with a finite assumed count |
| Civilian Board of Contract Appeals | 1 distinct GSA institution | **Excluded** from VA first-level membership |

The candidate records in model/federal/inc04f/va-first-level-candidates.json preserve predecessor IDs, dated source references, original receipt IDs and unverified direct-report/legal-authority flags. No directory listing is treated as statutory command, fiscal delegation or independent adjudication authorization.

The former VA contract-appeals board must not be presented as a definitively current independent operating unit, nor can the 2007 candidate successor event silently repeal the still-published 38 U.S.C. §301(c)(7) in the captured 2024 text. The FOM's seven Assistant Secretary roles and five other key officials are leadership classifications, not twelve automatically disjoint first-level agencies.

## Six outstanding independent legal-review packets

| Review packet | Recorded principal issue | Mandatory qualified decision |
|---|---|---|
| F04F-CASE-CANTEEN | 38 U.S.C. §301(c)(6), §§7801/7808 | Unit autonomy, Secretary oversight, financial and operational powers |
| F04F-CASE-VABCA | §301(c)(7), 2007 transition | Current effective text, historical Board successor/transfer and any unrepealed provisions |
| F04F-CASE-CBCA | 41 U.S.C. §7105(b),(e) | Separate GSA status, jurisdiction and VA nonmembership |
| F04F-CASE-OIG | 5 U.S.C. §403 | Inspector General independence and qualified general supervision |
| F04F-CASE-BVA | 38 U.S.C. §§7101, 7104 | Administrative supervision vs. appellate merits adjudication |
| F04F-CASE-OEDCA | 38 U.S.C. §319 | Direct reporting and independent discrimination-complaint decisions |

For each packet, obtain exact controlling current legal text as of a stated date, independently archived primary bytes, effective-date amendment/citator review, qualified counsel identity and independent signed finding. Present only a *proposed* legal authority relationship until accepted.

## Completion method

Reconcile each of the 25 observed identities to a dated source and independently determined parent/successor. Enumerate all relevant offices and activities under the two open residual statutory clauses; show every excluded, renamed, abolished or subordinate office with direct source support. Preserve reporting, case outcome control, appropriations and statutory delegation as distinct modeled relationships. An absence from a webpage is not proof of abolition.

After an independently approved complete denominator is available, calculate source and institutional coverage on the *same effective date*. Require all nine prior ADL-1 gates, a signed model-commit/source-set decision and a separate publication review. Until then the first-level denominator remains null and no ADL-1 certification is issued.

    node scripts/operational-custody-04f.mjs --view candidates
    node scripts/operational-custody-04f.mjs --view legal
    node scripts/operational-custody-04f.mjs --view exceptions
    node scripts/operational-custody-04f.mjs --view gates
