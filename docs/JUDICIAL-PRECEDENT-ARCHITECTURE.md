# Judicial Precedent, Constitutional Interpretation, and Holding-Level Treatment

**ARFI-COA v0.1.0 | Research baseline: October 16, 2026 | No completed citator or independent legal review**

This is a distinct **L3 judicial-interpretation graph** connected by typed references to the **original ratified Constitution** and existing Article I–VI / Amendment records. It does not rewrite original constitutional text, manufacture amendments, issue legal opinions, or infer agency delegations.

## Source hierarchy and legal correctness

1. **Ratified constitutional text**: canonical provision IDs from `model/constitutional/provisions.json`. Source authority is the Constitution and ratified amendments.
2. **Judicial majority and controlling opinions**: official U.S. Supreme Court opinions from the U.S. Government Publishing Office / United States Reports or official Supreme Court PDFs. Each case cites the opinion; every holding is a **separate, identified, bounded claim**.
3. **Subsequent treatment**: later controlling decisions may overrule, repudiate within a defined context, qualify, reaffirm or extend an earlier *particular holding*. A directed treatment edge requires a specific later decision and its opinion source.
4. **Constitution Annotated and historical analyses**: official commentary may help identify doctrine but must not be mislabeled a Court opinion or an original constitutional clause.
5. **Current precedential status**: **preliminary**, computed only from the curated treatment edges documented here. No record certifies that it is exhaustive or current good law without a professional citator and human legal review.

The seed contains **18 Supreme Court decisions, 20 separately modeled holdings, 30 holding-to-constitutional norm cross-references, 10 signed-direction treatment relationships, 20 provisional precedent status assessments and 20 applicability profiles**. Opinion sources: 18 official published Court records and seven government research/context citations.

All architectural entries are prepared for immutable-source-commit publication, stable comment targets, and independent legal review. **The website repository exclusively owns its UI, viewing, storage, API and public comments.**

## Canonical model collections

| Registry | Number of seed records | Contract |
|---|---:|---|
| `model/judicial/courts.json` | 1 | Judicial system, territorial and court hierarchy, constitutional jurisdiction basis |
| `model/judicial/sources.json` | 25 | Official opinions vs official explanatory research, publisher, URL and case date |
| `model/judicial/cases.json` | 18 | Case identity, legal citation, court, decision date, issue and opinion references |
| `model/judicial/holdings.json` | 20 | Holding summary, controlling opinion role, constitutional links and case-issue scope |
| `model/judicial/interpretations.json` | 30 | Holding→original provision + norm as **judicial interpretation**, not enacted text |
| `model/judicial/treatments.json` | 10 | Later case/holding→earlier case/holding, narrower issue scope and impact type |
| `model/judicial/status-assessments.json` | 20 | Known treatment assessment as of 2026-10-16, **citator incomplete** |
| `model/judicial/applicability.json` | 20 | Federal legal question, vertical role, geographical coverage and actual addressees |
| `model/judicial/viewpoints.json` | 6 | Read-only model publication viewpoints, not diagram rendering code |

The `schemas/judicial-precedent.schema.json` validates portable data shapes. Cross-record integrity and opinion precedent semantics are tested by `scripts/validate-judicial.mjs` and `tests/judicial.test.mjs` as an additive mandatory GitHub Actions stage.

## Seed opinion coverage by constitutional subject

| Subject | Cases and focus |
|---|---|
| Judicial review and original jurisdiction | *Marbury v. Madison* (1803): judicial review and constitutional original jurisdiction limit |
| Federal review of State court rulings | *Martin v. Hunter's Lessee* (1816): Supreme Court review of State judgments on federal questions |
| Enumerated and implied congressional power | *McCulloch v. Maryland* (1819): necessary-and-proper means and State interference with a federal instrumentality |
| Sovereign immunity and remedies | *Hans v. Louisiana* (1890); *Ex parte Young* (1908): broader immunity doctrine distinguished from prospective relief against State officers |
| Equal protection and public education | *Plessy v. Ferguson* (1896), *Brown v. Board of Education* (1954), *Cooper v. Aaron* (1958): the separate-but-equal doctrine's historical treatment and binding effect of federal constitutional judgments |
| Procedural rights and incorporation | *Gideon v. Wainwright* (1963): counsel protection in covered State felony proceedings |
| State sovereignty / anti-commandeering | *New York v. United States* (1992), *Printz v. United States* (1997), *Murphy v. NCAA* (2018): commands to State lawmaking and State executive implementation |
| Fourteenth Amendment enforcement | *City of Boerne v. Flores* (1997): Section 5 appropriate-legislation standard in context |
| Later overruling of substantive due-process doctrine | *Roe v. Wade* (1973), *Planned Parenthood v. Casey* (1992), *Dobbs v. Jackson Women's Health Organization* (2022) |
| Judicial review of agency statutory interpretation | *Chevron U.S.A. v. NRDC* (1984), *Loper Bright Enterprises v. Raimondo* (2024): later overruling of Chevron deference under the Administrative Procedure Act |

## What a treatment record actually asserts

### Examples: difference between holding, scope and disposition

**Judicial review**:
- **Original:** Article III judicial vesting and Article VI supremacy appear in the ratified Constitution.
- **Case:** *Marbury*, 5 U.S. (1 Cranch) 137 (1803), articulates judicial review and the limit on enlarging Supreme Court original jurisdiction.
- **Model:** constitutional provision and norm IDs link to **judicial interpretation**, not to a fabricated express *judicial review* clause. Marbury is not the same legal proposition as all modern standing, justiciability, and statutory review law.

**Sovereign immunity**:
- *Hans*, 134 U.S. 1 (1890), developed State immunity beyond express textual categories.
- *Ex parte Young*, 209 U.S. 123 (1908), establishes a context-specific route for prospective relief against officials for ongoing federal-law violations.
- The graph uses `narrow_remedial_exception` rather than **overrules Hans**. Neither holding resolves every question of congressional immunity abrogation, waiver, retrospective damages, or relief against all officials.

**Equal protection**:
- *Plessy*, 163 U.S. 537 (1896), is a historical opinion upholding a State separate-railway-car regime.
- *Brown*, 347 U.S. 483 (1954), holds separate public schooling unconstitutional and repudiates separate-but-equal justification in **public education**.
- *Cooper*, 358 U.S. 1 (1958), reaffirms States' duty to obey Brown.
- The treatment link **cannot** be silently generalized to a case-wide analysis of every Plessy issue. Later discrimination/segregation decisions are further necessary to make a comprehensive doctrine history.

**Agency administrative law: not constitutional amendment law**:
- *Chevron*, 467 U.S. 837 (1984), articulated an agency interpretation deference framework under statutory review.
- *Loper Bright*, 603 U.S. 369 (2024), holds courts must independently interpret statutes under the APA and expressly **overrules Chevron**.
- Loper Bright explicitly does **not** automatically reopen every historical statutory decision relying on Chevron. Its Article III constitutional references are marked `constitutional_context_only_not_direct_textual_holding`, not a new Article III clause or federal agency statutory grant. Specific APA §706 traceability requires the future **statutory enabling-authority** registry.

**Fourteenth Amendment abortion-right doctrine**:
- *Roe*, 410 U.S. 113 (1973), and the controlling *Casey*, 505 U.S. 833 (1992), protection/framework appear as **historical judicial holdings**.
- *Dobbs*, 597 U.S. 215 (2022), expressly overrules the defined constitutional abortion-right framework.
- Every status is scoped to a **particular holding**, not an assertion that all opinions, dicta, other due-process rights, State statutes or federal legislation became invalid. This dataset does not adjudicate any individual's rights or medical decisions.

## Status and applicability: deliberately conservative semantics

The current seed models explicit treatments from the selected 18 cases. As of **October 16, 2026**, each holding has a separate projected status in one of four research categories:

- `expressly_overruled_on_modeled_holding`: a later seeded majority expressly overrules the specific recorded rule.
- `qualified_or_repudiated_in_defined_scope`: a later opinion establishes a specific exception or disapproves an earlier rationale in a specific context.
- `affirmed_or_developed_in_seeded_treatment`: a later seeded holding applies/reaffirms/extends the earlier doctrine.
- `no_adverse_treatment_identified_in_seed_only`: **no claim that this precedent is currently good law**; simply no adverse decision was entered in our initial curated graph.

Always show the following flags rather than implying comprehensive citator verification:

`comprehensive_citator_review_completed: false`
`current_binding_effect_verified: false`
`case_level_status_not_inferred: true`

A separate `judicial_holding_applicability` record gives the constitutional or federal statutory question, federal/State judiciary systems that may be bound by a Supreme Court precedent on **federal questions**, territorial scope, particular State/federal governmental addressees, factual/issue boundary and a cross-reference to the status. An overruled modeled holding's current applicability is explicitly denied. Other seed records are **not certified** as currently controlling until more authoritative case treatment has been reviewed.

The official court source is the **opinion of the Court**. A syllabus is useful navigational material but is *not* part of the Court's opinion. For this initial increment, opinion pinpoints remain intentionally `full_opinion_indexed_pinpoint_not_verified`: detailed pinpoint selection and judge-by-judge controlling opinion analysis are required before publishing definitive legal conclusions.

### Later court levels

Model architecture allows future `COURT-US-CIR-*` federal appellate courts, district courts and independent `COURT-US-STATE-*` supreme courts. They will need circuit-specific vertical binding, en banc/panel distinctions, geographic reach, Erie/state-law interpretation boundaries, procedural posture, plurality/MO holdings, and rules of precedent. **Do not copy the Supreme Court jurisdiction applicability default** to those court levels. The initial seed includes only one Supreme Court institutional record and does not claim a complete court system.

## Legal integrity gates

Mandatory validation on each PR:

    node scripts/validate.mjs
    node scripts/validate-constitution.mjs
    node scripts/validate-article-i.mjs
    node scripts/validate-article-ii.mjs
    node scripts/validate-article-iii.mjs
    node scripts/validate-federalism.mjs
    node scripts/validate-amendments.mjs
    node scripts/validate-judicial.mjs
    node --test tests/judicial.test.mjs

The 44 new negative and positive tests catch wrong official case dates, malformed government source citations, analyst commentary masquerading as an opinion, dangling court/constitutional identifiers, an unsupported claim of statutory doctrine as original constitutional text, reversed treatment chronology, unsourced overrules, unqualified casewide displacement, and unreviewed holdings asserted as currently controlling. The test suite must also pass **all prior** federal/constitutional/Article I–III/federalism/amendment regressions.

## Non-goals and follow-up priorities

This is a publication-ready **structured research seed**, not a production legal citator or comprehensive constitutional case-law dataset. It has not undergone independent attorney or editorial review of every source holding, pinpoint, opinion-part voting alignment or later case treatment.

1. **Citation and precedent enrichment:** cross-check official opinion exact page pinpoints, opinion parts and join votes; verify subsequent cases, vacatur, modification, overruling, rehearing and treatment through a professional citator where licensed. Include documentation of dates and reviewer sign-off.
2. **Multi-court expansion:** build federal circuit and district structure plus independent State supreme court registry, precedential binding scope and conflicts. Separate horizontal persuasive citations from controlling cases.
3. **Independent State government architecture:** constitutional responsibilities of each State's executive, legislature and courts and intra-State legal delegation.
4. **Agency enabling statutes:** U.S. Code → Title → Section → enacted effective dates → lawful grants → administrative delegation → controls, together with APA/agency review linkages.
5. **Website rendering / public comments:** the website repo may render the new viewpoints and associate discussions with immutable case/holding IDs and commit hashes. This repository never owns runtime UI or visitor content.

## Expanded constitutional holding coverage and citation audit — October 16, 2026

The initial judicial seed (18 cases / 20 holdings / 30 constitutional mappings) now includes **26 official-source cases, 29 bounded holdings, 44 constitutional mappings, 10 conserved subsequent-treatment edges, 29 holding status projections, 29 jurisdiction applicability records and 10 viewpoints**. This is an architecture publication increment, NOT a complete legal citator or professional legal determination. Every new opinion has its own published United States Reports government locator.

| New Supreme Court decision (U.S. Reports) | Constitutional authority | Scope-specific result / express limitation |
|---|---|---|
| *Gibbons v. Ogden*, 22 U.S. (9 Wheat.) 1 (1824) | Article I Commerce and Article VI Supremacy | Interstate navigation falls within commerce; conflicting State steamboat exclusivity yields to the federal licensing law. Two separate bounded holdings. |
| *Youngstown Sheet & Tube Co. v. Sawyer*, 343 U.S. 579 (1952) | Article II executive powers and Take Care | The steel-mill seizure lacked legislative or independent constitutional authorization. Jackson's tripartite framework is a **concurrence**, not the majority holding. |
| *United States v. Nixon*, 418 U.S. 683 (1974) | Article II privilege and Article III judicial function | General presidential confidentiality claim does not defeat specific need for criminal trial evidence; military/diplomatic secrecy was not decided on this record. |
| *INS v. Chadha*, 462 U.S. 919 (1983) | Article I bicameralism / presentment | The one-House veto altering external legal rights could not bypass lawmaking procedures; not a ban on congressional oversight. |
| *Lujan v. Defenders of Wildlife*, 504 U.S. 555 (1992) | Article III cases/controversies | Injury, causation and redressability elements for federal judicial standing; not a newly numbered constitutional clause. |
| *United States v. Lopez*, 514 U.S. 549 (1995) | Article I commerce limitations | Original statute prohibiting noneconomic school-zone firearm possession lacked requisite interstate-commerce nexus. Does not adjudicate every later or amended statute. |
| *District of Columbia v. Heller*, 554 U.S. 570 (2008) | Second Amendment | Individual lawful home self-defense protection against D.C. firearm prohibition; application of the Second Amendment to States requires later distinct precedents. |
| *Obergefell v. Hodges*, 576 U.S. 644 (2015) | Fourteenth Amendment | State civil marriage licensing and recognition duties involving same-sex couples, bounded to the ruling's issues; not an all-purpose resolution of private religious-liberty questions. |

### Distinct judgment and opinion dates: Cooper v. Aaron

*Cooper v. Aaron*, 358 U.S. 1 (1958), had a **September 12, 1958 per curiam judgment** and a **September 29, 1958 reported explanatory opinion**. The existing decision date remains September 12 as recorded by GPO. The source and case now additionally record the explanatory opinion announcement date, and the case includes a procedural note. These different actions may not be flattened into a single release date. Official case document: https://www.govinfo.gov/app/details/USREPORTS-358/USREPORTS-358-1

### Legal traceability and status rules

The judicial model deliberately keeps constitutional authority and judicial decisions in **different source classes**:

- Original constitutional provision → textual norm → actor/capability boundary comes from enacted constitutional text. This is not a court holding.
- Court case → precise issue-bounded holding → normative constitutional reference → applicability and court/case facts comes from a published decision. This is not newly enacted constitutional text.
- Later case/holding → earlier treated holding → narrower or expressly overruled issue scope is represented only with an evidenced later opinion. **No new overruling is inferred** from parallel decisions or search absence.
- An indexed holding with no recorded negative treatment is **not** certified good law. Every status retains unverified, non-comprehensive citator flags and attorney-review caveats.

Government case locators in the official United States Reports must match the cited **reporter volume and first page**. The validator rejects an otherwise trusted government URL pointing to the wrong Court opinion. New negative tests also enforce Heller's D.C. scope, Lujan's Article III location, Youngstown's majority-vs-concurrence distinction, the Cooper opinion announcement date and source/case identity matching. The judicial suite now contains **61 regression tests**, and GitHub CI continues to run every prior Article I–III, federalism and amendment gate.

Every opinion text is indexed by locator, but individual majority opinion page **pinpoints and vote alignments remain unverified**. Before ARFI asserts an authoritatively controlling current rule, an independent reviewer must verify exact source passages, controlling opinion/join patterns, later modifying cases, statutory changes, and licensed citator results. Current status remains preliminary as of October 16, 2026.

The architecture repo does not contain a rendering engine. The afri-website repository owns visualization, API publication and public discussion. Future research candidates include *McDonald v. Chicago* for the State incorporation of Amendment II, *Bruen* and *Rahimi* for later Second Amendment analysis, and additional Supreme Court decisions for Article IV State relations, case/controversy doctrines and State constitutional authority.

## Applying a source-identified federal holding to State constitutional text

`model/state/judicial-links.json` now exercises the judicial source-class boundary through the State of Virginia's original published constitutional Article I §15-A and the existing `HOLD-US-SCOTUS-OBERGEFELL-2015-01` reference. The link does **not** rewrite original State text, create a new State actor power, replace a State enabling statute, or certify the current precedential effect without an independently completed legal citator review. It demonstrates why original State law and later judicial interpretation must be distinct nodes and review-status axes. See [State Institutional Architecture](STATE-INSTITUTIONAL-ARCHITECTURE.md).
