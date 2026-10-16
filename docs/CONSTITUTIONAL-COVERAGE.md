# Constitution Decomposition — Coverage and Release Gates

**2026-10-15 research increment.**

## Included

- One U.S. Constitution root and original Preamble, seven Articles, 21 numbered Article Sections.
- All 27 ratified Amendments and their 33 numbered Amendment Sections.
- All eighteen **Article I, Section 8 enumerated-power Clauses**, plus selected additional clauses important to institutional/rights traceability.
- 109 atomic **candidate textual norm summaries** and typed institution/actor associations.
- Explicit amendment-driven change events, source references and declarative viewpoints.
- Legacy constitutional authority anchors updated to reference provisions without changing their stable IDs.

## Intentional limitations

1. This is **not** a full, clause-by-clause verbatim reproduction of every Article or Amendment. Source locators and NARA transcripts remain authoritative. Numerous Article sections are currently `structure_only`.
2. No assertion that enumerated power alone creates an agency: department-specific statutes and promulgated regulations remain future work.
3. Judicial doctrine and administrative interpretations are deferred. Material case-law holdings, incorporated rights, sovereign-immunity scope and standards of scrutiny must not be guessed from bare text.
4. Some aggregate Article/Amendment sections have `modified_in_part` to preserve original text and defer exact textual-span consolidation.
5. Amendment ratification dates do not automatically express the different effective/transition dates of particular sections.
6. Actor-class bindings are candidates pending verification; they must never imply that State institutions are administratively subordinate to federal branches.

## Acceptance

- Deterministic model counts, IDs, hierarchy, source references, authority link compatibility, actor bindings, historical-repeal safeguard and viewpoint references.
- Negative regression tests must demonstrate failure on false operative authority from a repealed amendment and on broken constitutional graph integrity.
- No website or rendering implementation.

## Article III expansion — October 15, 2026

Article I, II and III detailed analytical layers are now separately recorded. Article III includes all 5 conventionally numbered original Clauses (3 in §2, 2 in §3) and three **unnumbered** Section 1 semantic segments. It adds nine Section 2 Clause 1 judicial subject-matter categories, narrow Eleventh Amendment overlays, explicit Supreme Court original vs appellate traceability, Article III-only judicial tenure/pay safeguards, a separated jury trial and criminal venue structure, and stringent treason evidence/punishment controls.

Scope limitation: jurisdictional categories do not substitute for federal jurisdictional statutes, court-creating acts, presidential/Senate appointment procedures, or judicial precedent. No model record determines the constitutionality of a live dispute or law. Details: [ARTICLE-III-ARCHITECTURE.md](ARTICLE-III-ARCHITECTURE.md).

## Federalism source-model increment — October 15, 2026

The historical Article IV fugitive-service provision is preserved but never activated as current law. Article IV and VI federal–State relations and Amendments X, XI and XIV are now decomposed into 20 semantic units, 72 qualifications, 40 legal relations, 9 explicit protected interests and 45 capability alignments. Seven newly classified federal capabilities complete the bridge from constitutional text to L3. Human legal review, complete judicial doctrine, State institutional catalogs and enabling statutes remain required follow-on scopes. See [FEDERALISM-ARCHITECTURE.md](FEDERALISM-ARCHITECTURE.md).

## Ratified amendment completion — October 15, 2026

All 27 ratified amendments and the 33 original numbered sections are now decomposed via 126 analytically distinct, explicitly nonofficial spans. Timeline coverage: 27 ratification/adoption records, 15 special date/repeal/ratification condition events. The amendment-specific register adds 172 textual/historical qualifications, 126 Article/prior-amendment effect/context cross-references and 114 operative functional capability links, excluding 12 repealed or historically fulfilled analytical spans. Every record remains research pending legal review, not a statement of adjudicated precedent. [Detailed coverage and exceptions](AMENDMENT-DECOMPOSITION.md).

## Judicial precedent source seed — 2026-10-16

18 official U.S. Supreme Court decisions, 20 particular holdings, 30 original-provision/norm links, 10 explicit subsequent-treatment edges, 20 case-law status assessments, 20 holding-specific jurisdiction applicability profiles, and six model-only viewpoints. Published source registry separates 18 opinion sources from seven official legal research/explanatory sources. All conclusions remain pending full opinion pinpoint and professional citator review. Historical, overruled and issue-specific precedents cannot be relabeled as active original constitutional grants. [Details](JUDICIAL-PRECEDENT-ARCHITECTURE.md).

## Judicial source audit and expanded doctrine coverage — October 16, 2026

Eight additional official Supreme Court opinions expand holding-level coverage to 26 cases, 29 holdings, 44 constitutional links and 29 preliminary legal applicability/status records. Congress, executive power, standing, Second Amendment and Fourteenth Amendment marriage rights are added. All interpretations remain derivative court law, not original constitutional clauses; no comprehensive citator review was conducted. [See judicial doctrine coverage](JUDICIAL-PRECEDENT-ARCHITECTURE.md).

## Articles IV–VII comprehensive original-text architecture (2026-10-16)

Cross-indexing existing Articles IV/VI federalism semantic units and adding separately sourced, nonofficial Article V/VII analytic spans completes the initial original-text architectural coverage of all seven original Articles. This is source-traceable research, not authoritative current legal interpretation. See [Articles IV–VII Architecture](docs/ARTICLES-IV-VII-ARCHITECTURE.md). Run `node scripts/validate-article-iv-vii.mjs` and `node --test tests/article-iv-vii.test.mjs`.
