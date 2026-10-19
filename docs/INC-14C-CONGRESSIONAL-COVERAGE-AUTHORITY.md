# INC-14C — Congressional Institutional Coverage and Procedural Authority

**Research snapshot:** 2026-10-19. **Congress:** 119th (2025–2026). **Scope:** House/Senate Appropriations source-page subcommittee denominators; cross-chamber rules; H.R. 5371 / Public Law 119-37 actual independently identifiable publisher evidence. **Status:** unratified, legal qualification pending, zero ADL-1.

## Preservation and source registers

INC-14C extends—not alters or supersedes—the nine canonical legislative/support identities, the eight INC-14 pilot units and the 119th Congress procedure templates. Its identifiers have a separate \`X14C-\` namespace and live in **twelve** independently versioned source/model families, registered in \`model/federal/manifest.json\`. The earlier MilCon–VA unit IDs \`X14-NODE-HOUSE-MILCON\` and \`X14-NODE-SENATE-MILCON\` are **reused**, not duplicated; 22 additional bounded subcommittee references are added. A separate DoD statutory-name crosswalk maps the two Appropriations committees to existing 10 U.S.C. §101(a)(16) research candidate IDs without promoting current rules, independently signed powers or specific subcommittee jurisdiction.

**Publisher-based denominators:** the House Clerk's 119th Congress 2nd-session [Appropriations committee profile](https://clerk.house.gov/committees/AP00) lists **12** subcommittees; the Senate [Appropriations subcommittees directory](https://www.appropriations.senate.gov/subcommittees) separately lists **12**. These are complete captured *lists on those specific publisher pages*, not a reconciled complete chamber hierarchy, current authenticated incumbent roster, or whole-Congress institutional denominator. House and Senate similarly named subcommittees are different constitutional/institutional entities; notably the House foreign-operations entry is titled “National Security, Department of State, and Related Programs” whereas the Senate entry is “State, Foreign Operations, and Related Programs.” None of the 24 directory units qualifies for ADL-1; the source-page observation is not legal-authority review.

Fifteen exact-source records distinguish official House Clerk, Senate Appropriations, Rules Committee, Constitution Annotated, GAO/CBO, GovInfo statutory law, and Senate/House roll-call primary publisher **locators**. The original PDF/HTML/XML/USLM content bytes and their publisher version/hash have **not** been placed under independently approved evidence custody, despite accessible URLs and actionable published data. Publisher source titles, observation date, exact URI, legal-source instrument type, and rule pinpoint are separate fields.

## Procedural instruments — limited interpretations only

The scoped rule granules preserve the original publisher edition as observed, without independently adjudicating all current parliamentary precedents or committee-adopted rules:

- **House Rule X clause 1:** subject-matter assignments for standing committees. Rule X clause 2: general oversight, with committee-specific exceptions/limits.
- **House Rule XI clause 2(m):** committee subpoena procedures. Published rule is not an actual issued subpoena or committee decision.
- **Senate Rule XXV:** standing committees and subjects.
- **Senate Rule XXVI paragraph 1:** hearings, investigations and subpoena framework, subject to Senate/committee processes; paragraph 2: committee procedural-rule adoption/publication; paragraph 8: continuing oversight study with Appropriations/Budget exceptions under the particular clause.

The House and Senate procedure, committee rules, statutory mandates, and Article I are distinct kinds of instruments. The six oversight/research links distinguish committee legislative review, possible but **not executed** subpoena procedure, GAO audit/evaluation support, and CBO analysis/estimation support. No congressional committee is modeled as a VA commander or disbursing officer.

## Actual enacted appropriations example — H.R. 5371 / Public Law 119-37

H.R. 5371, 119th Congress, was enacted as [Public Law 119-37](https://www.govinfo.gov/app/details/PLAW-119publ37) on **November 12, 2025**. Its published statutory text includes **Division D, Military Construction, Veterans Affairs, and Related Agencies Appropriations Act, 2026**. The crosswalk distinguishes the statute's FY2026 legislative authority from the previous **FY2025 VA** evidence baseline.

Discrete first-party chamber records added to the model:

| Chamber source | Date | Event | Recorded vote |
|---|---|---|---|
| [House Clerk Roll 281](https://clerk.house.gov/Votes/2025281) | 2025-09-19 | House original bill passage | 217–212 |
| [Senate Roll 616](https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00616.htm) | 2025-11-10 | Collins substitute S.Amdt. 3937 agreed | 60–40 |
| [Senate Roll 618](https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00618.htm) | 2025-11-10 | Senate passed amended bill | 60–40 |
| [House Clerk Roll 285](https://clerk.house.gov/Votes/2025285) | 2025-11-12 | House concurred in Senate amendment | 222–209 |
| [GovInfo P.L. 119-37](https://www.govinfo.gov/app/details/PLAW-119publ37) | 2025-11-12 | Enacted-law publisher approval record | Not a chamber roll call |

This increases publisher-grounded, separately identifiable legislative events from three sparse nonappropriations observations in INC-14 to *five additional appropriation-bill event records in INC-14C*. It does **not** certify a complete measure history. The original enrolled bill bytes, introduction and referral, any actual committee consideration, rules of consideration, all parliamentary resolutions and version lineage, full bicameral journals, presidential signed original, and independent legal review still need source-specific verification. A vote is not by itself a signed enactment or appropriation. No committee referral is silently inferred from the existence of a committee.

Division D of Public Law 119-37 is a **published enacted appropriations law**. The model claims no amount for a specific Treasury account or Department of Veterans Affairs account; no FY2026 signed OMB apportionment, agency allotment, award, obligation, Treasury disbursement, or payee evidence is given. No FY2025 account number/amount is reused to fabricate FY2026 execution.

## Coverage, historical continuity and remaining qualification

Two source-page denominations, seven selected rule granules, six oversight and support relationships, five official legislative/public-law history observations, two 10 U.S.C. §101 committee-name crosswalks, and eight unresolved gates are registered. The open gates cover whole-House and whole-Senate counts, specific committee procedural rules and amendments, original full bill-route records, signed presentment records, fiscal accounts/controls/transactions, historical predecessor-successor changes, and authentic retained original bytes plus independent legal/parliamentary review.

No legal or human signoff is automated. `source_page_bounded_listing_reconciled=true` means that ARFI transcribed all publisher-listed entries **within that particular source**, not that an independently certified source census or statutory-competence analysis was completed.

## Qualification and reproducibility

```sh
node scripts/validate-inc14.mjs
node scripts/validate-inc14c.mjs
node scripts/validate-inc14c.mjs --view VIEW-X14C-HOUSE-ROSTER
node scripts/validate-inc14c.mjs --view VIEW-X14C-SENATE-ROSTER
node scripts/validate-inc14c.mjs --view VIEW-X14C-RULES-OVERSIGHT
node scripts/validate-inc14c.mjs --view VIEW-X14C-HR5371
node scripts/validate-inc14c.mjs --view VIEW-X14C-DIVISION-D
node --test tests/inc14c.test.mjs
```

All twelve JSON model families are protected by closed JSON Schema and deterministic source ID, URL, parliamentary rule pinpoint, root/chamber, identity, dated primary roll vote tally, no-executive-outlay, no-historical-succession and no-ADL-promotion guards. A future Atlas publishing PR should pin the immutable **architecture merge SHA**, not consume live branch content. INC-13A (PR #39) remains an independent institutional qualification track.
