# Constitutional Amendments — Complete Ratified Amendment Decomposition

**ARFI-COA v0.1.0 | 2026-10-15 | Research classification pending legal review.**

## Architecture and evidence policy

This increment decomposes all **27 ratified amendments**. It retains each canonical amendment root and all **33 formally numbered amendment sections** from the existing register. It then adds **126 internally defined semantic segments** with stable IDs. These segments express analytically distinct rights, responsibilities, thresholds, institutional roles or historical conditions; they are **not original constitutional clauses or newly numbered Sections**.

Original constitutional amendments and dates are grounded in National Archives primary texts:

- https://www.archives.gov/founding-docs/bill-of-rights-transcript — original amendments I through X.
- https://www.archives.gov/founding-docs/amendments-11-27 — amendments XI through XXVII; ratification dates, legal text and NARA historical notes.
- https://www.archives.gov/federal-register/constitution — Article V ratification and later administrative certification; ratification itself establishes adoption.
- https://www.congress.gov/crs_external_products/LSB/HTML/LSB10985.html — CRS summary of delayed effective date for the Eighteenth Amendment.
- https://prologue.blogs.archives.gov/2016/04/11/a-record-setting-amendment/ — NARA explanation of May 1992 Twenty-Seventh Amendment adoption and later certification.

Model conclusions are text-bound research interpretations **pending legal review**. No graph node or edge is a substitute for a judicial holding, ratified reform proposal, enabling statute, administrative delegation or determination in a real case.

### All 27 amendments and their semantic decomposition

| Amendment | Analytical segments | Substantive focus |
|---|---:|---|
| I | 6 | Religion; speech; press; assembly; petition |
| II | 2 | Prefatory militia clause; keeping/bearing arms |
| III | 2 | Peacetime owner consent; wartime lawful quartering |
| IV | 3 | Reasonable searches/seizures; warrants and particularity |
| V | 7 | Grand jury and exception; double jeopardy; self-incrimination; federal due process; takings |
| VI | 7 | Criminal trial speed, publicity, jury, notice, confrontation, witnesses, counsel |
| VII | 2 | Civil jury amount threshold and re-examination |
| VIII | 3 | Bail; fines; punishments |
| IX | 1 | Unenumerated rights retained by people |
| X | 2 | Powers reserved to States and people |
| XI | 2 | Specified suits against States, plaintiff classes |
| XII | 8 | Elector ballots, counting, House/Senate contingent elections, eligibility |
| XIII | 3 | Abolition, convicted-crime exception, congressional enforcement |
| XIV | 18 | Citizenship; State privileges; person rights; representation; qualifications; debt; enforcement |
| XV | 4 | Voting protection against race, color, prior servitude and enforcement |
| XVI | 2 | Income tax and apportionment exception |
| XVII | 5 | Senate popular elections, qualification, vacancy procedures, historic transition |
| XVIII | 4 | Repealed national prohibition, deferred start, concurrent enforcement, old deadline |
| XIX | 2 | Voting rights irrespective of sex; enforcement |
| XX | 12 | Changed federal term/session dates; presidential transition; ratification/effect delays |
| XXI | 3 | Repeal of XVIII; conditional State alcohol laws; historical State convention prerequisite |
| XXII | 4 | Presidential election limits; >2-year rule; historic grandfather and ratification |
| XXIII | 4 | D.C. presidential electors/cap; enforcement |
| XXIV | 3 | Federal election poll taxes; enforcement |
| XXV | 13 | Presidential succession; VP vacancy; voluntary/disputed inability and congressional voting limits |
| XXVI | 3 | Voting rights ages 18+; enforcement |
| XXVII | 1 | Intervening House election before congressional pay laws take effect |

## Canonical records and interpretation contract

| File | Entries | Responsibility |
|---|---:|---|
| model/constitutional/amendment-units.json | 126 | Semantic child provisions with stable parent amendment/section, norm and timeline IDs |
| model/constitutional/amendment-timeline.json | 27 amendments + 15 events | Ratification, dates of legal effect, repeal, historical transition, certification and Article V provenance |
| model/constitutional/amendment-effects.json | 126 | Amendment → original Article / prior amendment crosswalk with labeled text-change vs contextual relationship |
| model/constitutional/amendment-qualifications.json | 172 | Constitutional conditions, source scope, thresholds, historic exceptions and review-only caveats |
| model/constitutional/amendment-capability-links.json | 114 | Functional alignment for *currently operative* amendment norms, never statutory agency delegation |
| model/constitutional/provisions.json | 27 original amendment roots + 33 original amendment sections + 126 amendment analytic segments | Canonical source hierarchy plus preexisting Article I–VI model |
| model/constitutional/norms.json | 126 new amendment norms | Typed power, right, restriction, procedure and historical-effect candidates |
| model/constitutional/changes.json | Three further ratified-change records | Congressional term timing and compensation transitions, in addition to existing changes |
| schemas/constitutional-amendments.schema.json | five model collection structures | Portable JSON Schema for consumers; semantic integrity tested separately |
| scripts/validate-amendments.mjs | one CLI | Full cross-model integrity, timeliness, source status and historical effect validation |

IDs follow an explicit nonofficial scheme: original Amendment XXV §4 remains CONST-US-AMD-25-SEC-04. An internal segment within that section is CONST-US-AMD-25-SEC-04-SEG-06, with citation to *Amendment XXV, §4*, **not** to fictitious Amendment XXV Section 4 Clause 6.

The website is the presentation and public-commentary owner. No website code or server API was implemented here.

## Amendment timeline: ratification, operative effect, completed transitions

Every one of the 27 timeline records carries an original ratification date, adoption date, constitutional Article V anchor, ratification channel, primary source IDs, current lifecycle and any applicable special events. Ratification is **not** the same as later ceremonial or administrative publication.

**Eighteenth Amendment (Prohibition):** Ratified January 16, 1919. Its substantive ban was delayed for one year. The CRS chronology reports an effective date of **January 17, 1920**; a separate NARA exhibit gives January 16, 1920. That one-day source discrepancy is explicitly flagged for legal/historical review rather than silently flattened. Amendment XXI repealed Amendment XVIII effective December 5, 1933. **None of the four Eighteenth Amendment analytical segments has an operative federal capability alignment, binding legal actor assignment, or current prohibition.** Section 3's seven-year ratification requirement was completed, not reopened.

**Twentieth Amendment:** Ratified January 23, 1933. Sections 1 and 2 expressly became legally effective **October 15, 1933**. This is different from the first congressional January 3 term transition (1935) and first presidential January 20 transition (1937). Section 6 is a fulfilled historical ratification prerequisite. Remaining succession and contingent-election rules must be kept distinct from both the Twelfth and Twenty-Fifth Amendments.

**Twenty-First Amendment:** Ratified December 5, 1933. Section 1 repealed Amendment XVIII; Section 2 separately protects certain State-law boundaries on liquor delivery/importation, subject to controlling federal constitutional jurisprudence. Section 3 required State *conventions* within seven years; the satisfied ratification process is not ongoing.

**Twenty-Second Amendment:** Original incumbent and then-current-term exceptions are historically bounded. The amendment's contemporary two-election and more-than-two-years rules are recorded distinctly, and the initial seven-year ratification condition is not repeated as a present restriction.

**Twenty-Seventh Amendment:** Proposed September 25, 1789, ratified and legally effective **May 7, 1992**, certified **May 18, 1992**. The compensation rule requires an intervening House election before a law varying congressional compensation may take effect. Certification does not substitute for the adoption date.

Other amendments default to adoption upon constitutionally sufficient ratification; later modifications of older text are represented as separate legal change events, not as deletion of the original historical document.

## Amendment content examples: rights, limits, procedures and scope

**I–X: the Bill of Rights.** Six separately traceable First Amendment text components preserve the different protections for religion, speech, press, peaceable assembly and petition. Original Fifth Amendment federal due process and Fourteenth Amendment State due process are linked as **distinct legal addressees**. The Sixth Amendment's jury district, the Seventh Amendment's common-law civil jury threshold, and the Fourth Amendment's sworn probable-cause and particularity requirements remain explicit. Ninth Amendment retained rights and Tenth Amendment reservations are not themselves a license to invent a new unrestricted enumerated governmental authority. Later State applicability, substantive doctrine and constitutional incorporation require sourced precedent.

**XII:** Presidential and vice-presidential balloting, electoral lists and contingent House and Senate elections remain separately identifiable. The House State-delegation quorum, Senate quorum, and majority rules are explicit qualifications. The original Article II presidential voting procedure remains superseded, not revived by a timeline import.

**XIII–XV:** The Thirteenth Amendment's abolition makes Article IV's fugitive-service clause inoperative. The narrowly worded exception references punishment for crime after due conviction; no general compulsory-service permission is inferred. Amendment XIV §1 differentiates U.S.-citizen privileges or immunities from **persons'** due process and equal protection. §2's historical voting/apportionment text and Amendment XXVI are retained with temporal distinctions; §3 disqualification, including two-thirds-of-each-House disability removal, does not adjudicate any candidate. Amendment XV explicitly addresses race, color and prior condition of servitude in voting, with federal and State addressees.

**XVI–XVII:** Congress's income-tax authority is tied to the original Article I taxing/apportionment constraints without implying repeal of all tax restrictions. The Seventeenth Amendment retains six-year Senate terms, popular election, State elector qualifications, vacancy-writ procedures and conditionally permitted temporary appointments; original elected-Senator transition language is historical.

**XIX, XXIII, XXIV and XXVI:** Each amendment protects a distinct electoral scope. Amendment XIX prohibits sex-based voting abridgment; XXIII grants capped D.C. presidential electors (not Statehood); XXIV limits poll taxes in specifically named federal contests, including primaries; XXVI prevents age-based abridgment for U.S. citizens 18 and older. These are not collapsed into a generic unrestricted federal administration of every election.

**XXV:** Permanent presidential succession, vacancies in the Vice Presidency requiring nomination and majority confirmation by **both Houses**, voluntary inability declarations, contested inability and congressional review are separate functions. Amendment XXV §4 includes the **four-day** challenge period, **48-hour** assembly requirement when not in session, **21-day** determination period, and **two-thirds vote of both Houses**. These conditions are not conflated with Senate advice-and-consent for Article II ordinary appointments.

**XXVII:** The House election must intervene before congressional compensation variation takes effect. This is modeled as a constitutional constraint on the Article I compensation provision, not a blanket prohibition on congressionally authorized remuneration.

## Traceability and classification limits

Each analytical segment has a unique amendment norm, original-text citation, timeline record, at least one text-bound or historical qualification, and a typed link to preexisting Article I–VI or prior-amendment context.

**Crosswalk classification is legally material:**
- **Explicit text modification, supersession, or repeal:** trace the amending provision, affected provision and where applicable the canonical constitutional-change record. Examples include XII → Article II electoral procedure, XIII → obsolete Article IV service text, XVI → income-tax apportionment, XVII → Senate selection, XX → terms/sessions and XXVII → compensation timing.
- **Constitutional contextual reference:** connects rights or procedures with a related branch or Article without asserting that an original section was literally deleted or rewritten. This is a relationship for public understanding, not a new court holding.
- **Historical change / ratification condition / completed transition:** remains accessible for analysis but cannot be promoted to operative statutory or agency authority.

**Capabilities are not delegations.** The 114 currently active functional alignments use the explicit relationship type functional_alignment_not_delegation. Twelve archived (repealed or completed-transition) segments have **zero active capability links**. Interpretive caveats are tagged as research boundaries and cannot serve as the sole constitutional predicate of an operative capability.

## Verification

Run the complete quality suite in the architecture repository:

    node scripts/validate.mjs
    node scripts/validate-constitution.mjs
    node scripts/validate-article-i.mjs
    node scripts/validate-article-ii.mjs
    node scripts/validate-article-iii.mjs
    node scripts/validate-federalism.mjs
    node scripts/validate-amendments.mjs
    node --test tests/constitutional.test.mjs tests/article-i.test.mjs tests/article-ii.test.mjs tests/article-iii.test.mjs tests/federalism.test.mjs tests/amendments.test.mjs

The 51 amendment regression tests include intentional invalid modifications to official numbering, dates, ratification modes, historic authority status, State/person/citizen classifications, Treaty-style voting thresholds versus amendment-specific thresholds, missing Article XXV inability conditions, interpretation source boundaries and false statutory delegations.

## Follow-on program (separate architecture increments)

1. **Judicial interpretation and source-cited doctrine:** model court, case, issue, holding, opinion, effective/controlling jurisdiction, citation, overruling/distinguishing history and reviewed doctrinal uncertainty. Do not import judicial results as if they were the original amendment text.
2. **Independent State government architecture:** branches, legislatures, courts, executives, constitutional functions, State-specific enabling authorities, consent processes, concurrent and reserved functions; prevent State agencies from appearing under a federal organizational parent.
3. **Enabling statutes and lawful delegations:** statute → section → granted authority → delegated official/agency → federal capability → operational control, with statutory amendment history, appropriations and judicial limitations.
4. **Website/public review:** publish model-family-aware validated immutable snapshots; link comments to source IDs and commit hashes. Website repo retains complete ownership of interactive rendering.
