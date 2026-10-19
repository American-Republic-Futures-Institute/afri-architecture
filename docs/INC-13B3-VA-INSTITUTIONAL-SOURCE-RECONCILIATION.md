# INC-13B3 — VA first-level institutional source reconciliation

**ARFI-COA · Research only / unratified · October 19, 2026**

**Original model baseline:** `b52d99f5dc8c36803dd4c3298795f75c1ece707a` (merged INC-13A/B1/B2). This increment reconciles existing VA research models and evidence receipts; it does not update a source edition, certify controlling 2026 law, grant signed authority, establish current complete institutional membership, or issue an ADL-1 certificate.

## Source populations — bounded, overlapping, never summed

| Source cohort | Dated scope | Count | Qualification |
| --- | --- | ---: | --- |
| 04C VA directory | Updated 2026-02-25; captured 2026-10-17 | 3 administration and 19 staff-office headings = 22 | Complete only within these bounded publisher headings |
| 38 U.S.C. §301(c) | 2024 fixed-code original; separately a preliminary 2026 locator | 9 clauses: 7 named + 2 open residual classes | Not a present-day legal citator or operating-office census |
| 04F candidate research | Mixed directory, FOM and statutory editions | 25: 22 directory-linked + 3 outside | Overlaps the directory; not a current first-level population |
| 04E/04F legal review cases | Distinct open jurisdiction questions | 6 cases | Not 6 additional VA institutions |
| 04D Board/CBCA history | Reported 2007-01-06 transition | 1 candidate event | Neither complete legal succession nor implied repeal of §301(c)(7) |
| 04B/04D source receipts | Prior temporary captures and unavailable CBCA source | 5 recorded SHA-256 receipts + 1 missing | No qualified WORM custody or institutionally signed archive |

**These denominators may not be added.** The complete present-day VA first-level denominator is unknown. Verified present-day first-level admissions and certified ADL-1 entities remain zero.

## Record-level reconciliation

- **Directory:** All 22 `X13B3-DIR-*` rows retain the prior 04C publisher heading ID, 04A department unit ID and typed relation ID, INC-12 observation ID, 04F candidate ID, date, and captured SHA-256 receipt reference. Original 04A source grouping parentage is distinct from legal reporting, supervision, command and delegation. The VA Inspector General's `independent_oversight_display_placement_not_command` source relationship remains distinct from the other 21 generic directory groupings.
- **Statutory composition:** Nine `X13B3-STAT-*` rows link 04C preliminary §301(c) clauses to their 04D fixed-2024 statute crosswalks, original receipts, and explicit directory overlap. Four clauses match bounded directory candidates: VHA, VBA, NCA and BVA. Office of the Secretary, Veterans' Canteen Service and former VA Board of Contract Appeals are outside the 22 heading count; residual clauses (8) and (9) are open classes, not lists of active units.
- **Candidate research:** The 25 `X13B3-CAND-*` rows retain exact predecessor ID, original 04F candidate ID, directory membership (nullable), source edition/receipt, historical classification and unreviewed flags. The 22 directory-linked units overlap directory observations; Secretary, Canteen and former Board are outside the source directory—not three certified current first-level agencies.
- **Special legal cases:** Six `X13B3-LEGAL-*` rows link the 04D legal identity to its 04E issue and 04F counsel packet. Their `relationship_kind_candidate` fields are research questions, not signed orders, jurisdiction determinations, or lawful authority grants.
- **History:** `X13B3-HISTORY-2007` distinguishes former VA Board of Contract Appeals and external GSA Civilian Board of Contract Appeals. The 2007 event is publisher-reported; the CBCA source original remains uncaptured. Do not infer statutory repeal, automatic office succession, or current VA membership.
- **Evidence:** Six evidence rows preserve five previously observed digests/receipts from the 04B/04D captures and one explicitly null/missing CBCA source. 04F qualified custody/replication, independent legal-signature verification and current-source revalidation remain false.

## Specific authority and independence boundaries

- **Veterans' Canteen Service:** separate statutory service / autonomy questions in 38 U.S.C. §§301(c)(6), 7808; not merely a missing staff-office heading.
- **Board of Veterans' Appeals:** §301(c)(5), §§7101/7104; administrative placement must not imply direction of independent appellate merits outcomes.
- **OEDCA:** §319 reporting and impartial merits decision questions require qualified legal review, not an inferred power from the staff-office directory.
- **Inspector General:** 5 U.S.C. §§402–403 independent oversight and head supervision have distinct constraints; a directory grouping is not operational command.
- **Former VA Board / CBCA:** printed 2024 §301(c)(7), 41 U.S.C. §7105 and reported 2007 predecessor history have different effect/temporal scopes. Earlier D04D used a VA research field for CBCA; this model retains its old ID while recording its source-classified external GSA relationship, without claiming a completed good-law review.

## Source integrity and ADL-1 review boundaries

All 23 predecessor model files are pinned to immutable Git blob SHAs at the original baseline commit. The validator recomputes each Git blob digest and rejects edited originals or mismatched in-memory source data. These **architecture-repository bytes are not original official government documents**; digest controls do not satisfy a government-source authenticity, public-law citator, signed archival, or legal review obligation.

The directory receipt and two FOM / two fixed-code SHA-256 receipts reproduce earlier temporary-source capture metadata only. Neither restoration of original government bytes nor qualified independent WORM/provider custody was conducted in this increment. The CBCA original-source gap remains open. All nine VA 04E mandatory gates and INC-13A VA pilot qualifications remain unmet; no institutional or counsel decision is asserted.

## Validation and future publication

Node.js 22, from the repository root:

```sh
node scripts/validate-inc13b3.mjs
node scripts/validate-inc13b3.mjs --view directory
node scripts/validate-inc13b3.mjs --view statutes
node scripts/validate-inc13b3.mjs --view legal
node scripts/validate-inc13b3.mjs --view history
node --test tests/inc13b3.test.mjs
```

Exact-head CI runs eight closed JSON Schema families, 23 immutable source blob checks, original 04C/04D/04E/04F/INC-12/INC-13A crosswalks, legal nonpromotion, and adversarial falsification. All projected records are read-only research outputs, not governmental adjudications.

**Future INC-13D:** publish a source-SHA-pinned Atlas VA inspector showing original source IDs, qualifier categories, legal open questions, effective-versus-observed time, historical transitions, evidence hashes and missing originals. `website_publication_enabled` remains `false` until an independently qualified website PR explicitly admits the models.

## Remaining external acceptance

Independently verify controlling current legal editions, original-byte custody, historical successor distinctions, missing original retrieval, authenticated human counsel/agency review, source retention/recovery governance, and separately qualified same-date first-level membership. Only an explicit future versioned review contract could positively promote ADL-1.
