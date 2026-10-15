# Article II: Executive Authority, Duties, Conditions and Constitutional Checks

**ARFI-COA v0.1.0 | 2026-10-15 | Research mapping pending legal review.** 

## Method and constitutional source structure

Article II of the original U.S. Constitution contains four Sections. Original Section 1 has eight conventionally numbered clauses, Section 2 has three conventionally numbered clauses, Section 3 is a continuous text block covering several presidential functions, and Section 4 is the impeachment/removal provision. **Sections 3 and 4 are not relabeled as officially numbered clauses.** ARFI models five analytically separable functional segments within Section 3, retaining the canonical Section citation `U.S. Const. art. II, § 3`. Section 4 remains a section-level model. The 17 analytic units are therefore **11 numbered original clauses + 5 Section 3 semantic segments + 1 Section 4 text unit**.

The official original text is the National Archives transcription (`SRC-CONST-ORIGINAL-TRANSCRIPT`), and amendments are sourced from its Amendments 11–27 transcript. The Congressional Research Service *Constitution Annotated* helps identify analysis topics but must never be treated as a source of independent power or a substitute for case-law holdings.

| Section | Canonical numbered clauses | Additional ARFI analytic units | Main subjects |
|---|---:|---:|---|
| §1 | 8 | 0 | Executive vesting, term, election, eligibility, succession, compensation, oath |
| §2 | 3 | 0 | Commander in Chief, written departmental opinions, pardons, treaties, appointments |
| §3 | 0 | 5 | State of Union and recommendations, convening/adjournment, diplomatic reception, Take Care, commissions |
| §4 | 0 | 1 section-level | Impeachment, specified misconduct, constitutional removal |

## Repositories and records

- `model/constitutional/provisions.json`: original numbered clauses and named **ARFI analytic segment** anchors; stable original constitutional sections and clause IDs remain intact.
- `model/constitutional/norms.json`: normative power, duty, structure, eligibility, procedure, prohibition, and limitation records. Existing IDs (`NORM-US-CONST-018` through `029`) remain stable.
- `model/constitutional/article-ii-units.json`: one source-location/qualifier/norm/capability index per analytic unit.
- `model/constitutional/article-ii-qualifications.json`: 71 original text, historic-text and amendment-overlay restrictions and obligations. Every qualification points to exact relevant provisions and named norms.
- `model/constitutional/article-ii-capability-links.json`: 40 draft functional alignments spanning 37 active Article II norms. The relation is `functional_alignment_not_delegation`; **no power is directly conferred upon a federal agency merely by an ARFI capability mapping**.
- Existing Article I condition identifiers are reused for formal congressional checks on the President, instead of duplicating or losing those limits.
- Model evidence, changed historic texts and constitutional actors remain in canonical source and change registries; this repository has no website rendering engine.

## Executive constraints and traceability examples

**Commander in Chief:** Article II §2 cl.1 → `NORM-US-CONST-021` → conditions `AII-QUAL-02-01-MILITIA-ACTUAL-SERVICE`, `AII-QUAL-02-01-CONGRESSIONAL-WAR-POWERS` and `AII-QUAL-02-01-MILITIA-STATE-RESERVATIONS` → `CAP-FED-07` (national defense). The original text gives military command, but Article I controls war declaration, armed-forces governance, military appropriations and other legislative authorities. This is **not** a judicial resolution of every disputed conflict-of-authority question.

**Treaty authority:** Article II §2 cl.2 → `NORM-US-CONST-024` → Senate advice/consent with **two-thirds of Senators present concurring** → diplomacy capability `CAP-FED-08`. The Article II appointments process (`NORM-US-CONST-025`) is separately modeled and does **not** inherit the treaty-specific two-thirds threshold. Congress may assign certain inferior-officer appointments by law to the President, courts of law or heads of departments.

**Recess appointments:** Article II §2 cl.3 → `NORM-US-CONST-026` → recess conditions and commission expiration **at the end of the next Senate session** → `CAP-FED-41`. Judicial standards defining recesses and vacancies are deferred to the future precedent layer.

**Presidential transitions:** Article II §1 cl.6 remains `modified_in_part`. Qualifications link to **Amendment XX, Section 3** and **Amendment XXV, Sections 1–4** as distinct norms; they do not falsely assert that those provisions textually arise from Congress's power to write dual-vacancy statutes. Permanent succession, acting presidency, a vice-presidential vacancy, contested inability, written declarations, constitutional deadlines, and specified supermajority conditions remain separate.

**Take Care:** Article II §3 analytic segment 4 → `NORM-US-CONST-027` → faithful execution duty subject to Article I §9 cl.7 appropriations; does not independently authorize federal Treasury withdrawals or legislation. Doctrine on non-enforcement, presidential removal and executive supervision remains a future judicial-case/authorities increment.

**Impeachment/removal:** Article II §4 → `NORM-US-CONST-029` → Article I §2 House impeachment + §3 Senate trial, prescribed two-thirds conviction of Members present, Chief Justice in Presidential trial, limited impeachment judgment. The President's pardon power excepts cases of impeachment. Scope of "civil officers" and "high crimes and misdemeanors" is not resolved by these summaries alone.

## Amendment layers and historical safeguards

- **XII (1804):** original presidential elector balloting in Article II §1 cl.3 **superseded**, retained only as historical text. Current separate votes and contingent election derive from Amendment XII, not the original ballot clause.
- **XIV §3:** elector and office disqualification are separate constitutional amendments. Determination of current application must consider controlling precedent; this model makes no case-specific adjudication.
- **XX §§1,3:** presidential and vice presidential terms change at noon on January 20, with president-elect succession contingencies.
- **XXII §1:** presidential election-term limits supplement four-year term and original age/citizenship/residency eligibility; do not invent a new express original Article II clause.
- **XXIII §1:** District of Columbia electors supplement states' electors and retain the constitutional ceiling; DC is not reclassified as a state.
- **XXV §§1–4:** separate permanent succession, vice-presidential vacancy, voluntary inability and disputed inability. Section 4 expressly regulates written notice, four-day response, forty-eight-hour congressional convening and twenty-one-day decision timeframes.
- Earlier original provisions still operative in part are never globally marked as repealed because only certain subparts changed.

## Legal and epistemic boundaries

Every norm and link remains `textual_summary_pending_legal_review` or `research_mapping_pending_review`. No claim is made that Congress's statutory authority automatically transfers to the President; the original Constitution, amendments, relevant legislation, and controlling judicial doctrine must all be checked. The *Constitution Annotated* helps locate interpretive controversies, including the Youngstown separation-of-powers framework, recess appointments, recognition and removal powers, but **those doctrines are not mislabeled as literal constitutional text**.

## Quality gates

Run in the repository:
- `node scripts/validate.mjs` (federal baseline)
- `node scripts/validate-constitution.mjs` and `node --test tests/constitutional.test.mjs` (shared constitutional model)
- `node scripts/validate-article-i.mjs` and `node --test tests/article-i.test.mjs` (legislative constraints)
- `node scripts/validate-article-ii.mjs` and `node --test tests/article-ii.test.mjs` (Article II, including negative regression/security-of-legal-status checks)

## Subsequent increments

**Article III** deep decomposition, **federalism** across Articles IV/VI and amendments, **Amendment** completion including operative dates and text changes, **judicial interpretation** with court decisions and subsequent treatment, then **agency enabling statutes** and verified allocation/delegation provenance.
