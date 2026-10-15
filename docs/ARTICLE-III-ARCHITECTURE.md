# Article III — Judicial Power, Constitutional Jurisdiction and Safeguards

**ARFI-COA federal architecture v0.1.0 | Research baseline, October 15, 2026 | Pending legal review**

## Scope and source hierarchy

This increment decomposes Article III of the United States Constitution into independent **constitutional provision anchors, norm claims, jurisdiction categories, qualifications, actor bindings and capability alignments**. The original Constitution remains the primary authority: [National Archives, Constitution transcription](https://www.archives.gov/founding-docs/constitution-transcript). Amendment text is separate: [National Archives, Amendments 11–27](https://www.archives.gov/founding-docs/amendments-11-27).

Official supporting materials: [U.S. Courts, Types of Federal Judges](https://www.uscourts.gov/about-federal-courts/types-federal-judges), [U.S. Courts, Court Role and Structure](https://www.uscourts.gov/about-federal-courts/court-role-and-structure), and the Library of Congress's *Constitution Annotated* essays on [diversity jurisdiction](https://constitution.congress.gov/browse/essay/artIII-S2-C1-16-1/ALDE_00013239/), [treason](https://constitution.congress.gov/browse/essay/artIII-S3-C1-1/ALDE_00013524/) and [judicial review](https://constitution.congress.gov/browse/essay/artIII-S1-3/ALDE_00013514/). These secondary explanatory materials are **not** new constitutional text or controlling holdings in the architecture.

### Exact granularity of original text

| Original Article III location | Numbered original clauses | ARFI analytic units | Subject |
|---|---:|---:|---|
| Section 1 | 0 | 3 semantic spans | Judicial vesting; good-behavior tenure; compensation |
| Section 2 | 3 | 3 canonical clauses | Federal judicial subject matter; Supreme Court original/appellate jurisdiction; criminal jury and venue |
| Section 3 | 2 | 2 canonical clauses | Definition/proof of treason; legislative punishment and limitations |
| **Total** | **5** | **8 analysis units** | |

Section 1 is a **single original paragraph**. Its three subtopics receive internally defined `CONST-US-ART-03-SEC-01-SEG-01..03` identifiers with **section-only** citations and explicit `arfi_analytic_not_numbered_clause` metadata. ARFI must **not** publish those IDs as constitutional Section 1 Clauses 1–3.

Existing source IDs `CONST-US-ART-03-SEC-02-CL-01` and `CONST-US-ART-03-SEC-02-CL-02` and old norm IDs `NORM-US-CONST-030..035` remain stable. Section 2 Clause 3 and Section 3 Clauses 1–2 now receive their own original-numbered IDs.

## Canonical architecture files

| File | Contents |
|---|---|
| `model/constitutional/article-iii-units.json` | Eight source-backed analytical units, provision/norm/qualifier/capability references |
| `model/constitutional/article-iii-qualifications.json` | 53 textual restrictions, amendment overlays, cross-branch checks, and explicitly flagged research boundaries |
| `model/constitutional/article-iii-jurisdiction.json` | Nine precisely identified jurisdiction categories in Section 2 Clause 1, separately marked for statutory grants and Eleventh Amendment effects |
| `model/constitutional/article-iii-capability-links.json` | 42 **functional alignments**, covering 35 current Article III norms; not enactments or delegated agency powers |
| `model/constitutional/provisions.json` | Expanded canonical constitutional text-location hierarchy |
| `model/constitutional/norms.json` | Existing six Article III summaries plus 29 separately traceable textual norm candidates |
| `model/constitutional/actors.json` | Specific Article III judge, Article III court, and treason-accused categories |
| `model/federal/capabilities.json` | Four additional constitutional judiciary, tenure, criminal jury/venue and treason capability categories |
| `model/federal/manifest.json` | Versioned publication contract and `article_iii_extension` |
| `schemas/article-iii.schema.json` | Portable structural integration schema |
| `scripts/validate-article-iii.mjs` and `tests/article-iii.test.mjs` | Domain-specific semantic checks and negative regression tests |

**No** website rendering, frontend, server routes, discussion database or UI configuration was added.

## Constitutional authority → qualifications → capabilities

### Article III, Section 1: judiciary and independence

**Judicial vesting.** `CONST-US-ART-03-SEC-01-SEG-01` → `NORM-US-CONST-030` and `NORM-US-CONST-AIII-01-01-INFERIOR-CREATION` → `AIII-QUAL-01-01-INFERIOR-COURTS-CONGRESS` → `CAP-FED-44` (constitutional judicial power). Congress's Article I Section 8 Clause 9 inferior-tribunals authority is separately cross-referenced. The Supreme Court is constitutionally established; the modern inferior courts and their subject-matter grants depend on congressional enactments. No statutory judicial districts are fabricated in the constitutional record.

**Good-behavior tenure.** `CONST-US-ART-03-SEC-01-SEG-02` → `NORM-US-CONST-031` plus more granular `AIII-01-02-GOOD-BEHAVIOR` → tenure qualification and Article I/II impeachment checks → `CAP-FED-45`. Legacy generic federal-court actor protection has been narrowed to **`ACT-US-ARTICLE-III-JUDGES`** so the model does not accidentally confer Article III tenure on bankruptcy, magistrate or Court of Federal Claims judges. The **Court of International Trade is Article III**, while the **Court of Federal Claims is an Article I statutory tribunal**; category labels must not conflate these courts.

**Judicial compensation.** `CONST-US-ART-03-SEC-01-SEG-03` → payment at stated times + salary non-diminution during continuance in office → `CAP-FED-45`. The prohibitions cannot be treated as identical to compensation rules for Article I judicial officers.

**Judicial review:** the Constitution **does not explicitly state** the modern judicial-review doctrine in its original Article III text. Marbury v. Madison and subsequent cases belong to a separately sourced case-law/precedent architecture, never to a fictitious express Section 1 clause.

### Article III, Section 2, Clause 1: nine jurisdictional categories

| ID | Original constitutional case or controversy category |
|---|---|
| `AIII-JUR-01` | Federal constitutional, statutory and treaty questions |
| `AIII-JUR-02` | Ambassadors, public ministers and consuls |
| `AIII-JUR-03` | Admiralty and maritime |
| `AIII-JUR-04` | Controversies involving the United States as a party |
| `AIII-JUR-05` | Controversies between two or more States |
| `AIII-JUR-06` | State versus citizens of another State **(modified in part)** |
| `AIII-JUR-07` | Citizens of different States |
| `AIII-JUR-08` | Same-State citizens with land claims under grants from different States |
| `AIII-JUR-09` | Specified controversies involving foreign States, citizens or subjects **(modified in part)** |

The first **three** are introduced as **Cases**, and the remaining **six** as **Controversies** in the original Article III paragraph. The Eleventh Amendment qualifies specified lawsuits **against** States by citizens of another State or foreign citizens/subjects; it does **not** eliminate all inter-State litigation or erase the constitutional category. Its precise text and broader sovereign-immunity jurisprudence must remain distinct.

These nine categories mark the constitutional **outer bounds** of judicial power. **`does_not_self_authorize_inferior_court_jurisdiction: true`** prevents treating any one category as automatically conferring statutory jurisdiction on all inferior courts. Congress's enacted jurisdictional statutes, sovereign-immunity laws, causes of action, and justiciability case law must be separately verified.

### Article III, Section 2, Clause 2: Supreme Court jurisdiction

`NORM-US-CONST-033` is decomposed into **Supreme Court original jurisdiction** for the specified ambassador/ministers/consuls and State-party classes; **appellate jurisdiction** in other enumerated matters; and **Congress's limited exceptions-and-regulations power** over appellate jurisdiction.

The `Exceptions and Regulations` language is tied to **appellate**, not indiscriminately to original jurisdiction. Statutory routes of review and limits on court jurisdiction remain future work. A State's party status does not bypass Eleventh Amendment and sovereign-immunity restrictions.

### Article III, Section 2, Clause 3: criminal jury and place of trial

`CONST-US-ART-03-SEC-02-CL-03` → `NORM-US-CONST-034` and four discrete rules:

- Jury trial for criminal offenses, **except cases of impeachment**.
- Trial in the State where the offense was committed.
- If the offense was not committed within any State, Congress may direct the trial location by law.
- The Sixth Amendment provides **additional** protections that must not be falsely quoted as original Article III text.

Modern doctrine on petty offenses, jury waiver, and other trial requirements is deferred to the separate precedent model.

### Article III, Section 3, Clause 1: treason

`CONST-US-ART-03-SEC-03-CL-01` → `NORM-US-CONST-035` and subnorms:

- Treason has **two enumerated forms**: levying war against the United States, or adhering to its enemies and giving aid and comfort.
- Treason conviction under the witness path requires **two witnesses to the same overt act**.
- An alternative proof path is **confession in open court**.

These requirements specifically govern **treason**, not every federal offense. Political speech or disagreement must not be automatically classified as treason by a model. Judicial application of these standards remains future case-law work.

### Article III, Section 3, Clause 2: punishment and prohibitions

`CONST-US-ART-03-SEC-03-CL-02` → Congressional power to declare treason punishment → constitutional prohibition on corruption of blood and forfeiture beyond the attainted person's lifetime → `CAP-FED-47`. Article I's ban on bills of attainder is a separate cross-linked restriction. No hereditary criminal liability or unlimited forfeiture may be inferred.

## Verification and quality gates

**Required on every PR:**

`node scripts/validate.mjs`
`node scripts/validate-constitution.mjs`
`node scripts/validate-article-i.mjs`
`node scripts/validate-article-ii.mjs`
`node scripts/validate-article-iii.mjs`
`node --test tests/constitutional.test.mjs tests/article-i.test.mjs tests/article-ii.test.mjs tests/article-iii.test.mjs`

Negative tests reject invented Section 1 clause numbers, Article I court tenure conflation, missing Eleventh Amendment constraints, false statutory jurisdiction, removal of jury and trial-location requirements, treason-proof dilution, corruption-of-blood forfeiture violations, and false elevation of judicial review doctrine to express constitutional text.

## Next roadmap

1. **Federalism:** Article IV, Article VI and the Tenth/Eleventh/Fourteenth Amendment constraints and State/federal authority interfaces.
2. **Amendments:** Finish intra-section, operative date and change-history decomposition.
3. **Judicial doctrine:** Court decisions, opinions, holdings, subsequent treatment, scope, controlling authorities and unresolved disagreements.
4. **Agency enabling statutes:** The Constitution establishes permitted powers, not every modern agency or bureau's lawful statutory delegation.
5. **Plan linkage and review:** Trace constitutional restrictions into ARFI proposed reforms, with legal-admissibility review and public commentary bound to immutable source commits.
