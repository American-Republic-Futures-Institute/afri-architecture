# Articles IV–VII: Complete Original-Text Decomposition and Authority Boundaries

**ARFI-COA v0.1.0 | 2026-10-16 | Research; unratified; no qualified legal citator review**

## Completion boundary

All seven original U.S. Constitutional Articles now have dedicated source-location and semantic modeling coverage. Article IV (10 textual functions) and VI (3 clauses) are **cross-references to the existing validated federalism family**, not second copies of legal grants. Article V (9) and Article VII (3) gain distinct, unnumbered analytical spans under their existing Article roots. These spans do **not** claim to be original numbered Clauses or Sections.

The new model stores exactly 25 Article IV–VII units, 25 original-text constraints, 8 procedural actor links, 8 limited functional capability associations, and 4 declarative viewpoints. Ratified Amendment I–XXVII decomposition and State institutional data remain separately authoritative.

## Article IV — Four Sections, 10 source-linked analytical units

The existing `FED-UNIT-IV-*` architecture covers full faith and credit (one duty and congressional proof/effect rule), citizens' interstate privileges, extradition, historical fugitive service, State admission, territory/property, republican form and protection against invasion/domestic violence. Exactly five are originally numbered Clauses; five are **nonofficial semantic segments**. These crosswalks do not recast State constitutions as subordinate to federal agencies.

The fugitive service text in art. IV §2 cl. 3 remains published historical text but is *superseded by Amendment XIII*. No actor/capability may be activated from that unit. Privileges of **citizens** under art. IV §2 must not be confused with rights of **persons** under the Fourteenth Amendment. No unlimited executive policing powers arise from the Guarantee Clause's domestic-violence protection language.

## Article V — Nine semantic spans, none numbered by the 1787 text

1. Two-thirds approval in **each House** of Congress for a congressional proposal.
2. Applications of legislatures of **two-thirds of States** as the necessary predicate to the proposing convention route.
3. Congressional obligation to call a convention on constitutionally sufficient applications; application validity disputes are not decided here.
4. The proposing convention's role is **proposal**, not automatic adoption.
5. Ratification by State legislatures in three-fourths of States if Congress selects that mode.
6. Ratification by State conventions in three-fourths of States if Congress selects that mode.
7. Congress chooses the ratification mode. Proposal, ratification and certification are different processes.
8. The original restriction on amendments **before 1808** touching art. I §9 clauses 1 and 4 is *expired*; it cannot create current law.
9. Equal State suffrage in the Senate remains protected unless the affected State consents; the unit cannot be circumvented by an ordinary statute.

An Article V proposing convention, a State ratifying convention, and a convention that ratified the original Constitution have **different constitutional roles and stable IDs**. The new capability `CAP-FED-58` concerns conditional amendment-process coordination, not ordinary bill passage or delegated agency power. No role is inferred for presidential signing under Article V.

## Article VI — Three existing textual Clauses

1. Continuity of preconstitutional debts: a legal-recognition rule, not a standing spending or borrowing appropriation.
2. Supremacy: the Constitution; federal laws made **in pursuance** of it; treaties made **under U.S. authority**; and the obligation of State judges despite contrary State law. No blanket primacy for unconstitutional laws.
3. Federal/State public-officer oaths and the explicit federal-office **no religious test** protection. State religious-test constitutional doctrine requires separate judicial analysis, not an invented fourth original text Clause.

## Article VII — Three nonofficial historical spans

State ratifying **conventions**, the original **nine-State** threshold, and effect **between the original ratifying States**. The original threshold was historically satisfied on June 21, 1788. No current State admission, constitutional amendment, or State-executive delegation can be constructed from Article VII.

## Provenance and publication

Primary original text: [National Archives transcription](https://www.archives.gov/founding-docs/constitution-transcript).
Congressional interpretive research: [Article V overview](https://constitution.congress.gov/browse/essay/artV-1/ALDE_00000507/), [Article V unamendable subjects](https://constitution.congress.gov/browse/essay/artV-5/ALDE_00013059/).
The historical original threshold: [National Archives constitutional interpretation](https://www.archives.gov/founding-docs/constitution/what-does-it-say).

No doctrine is described as professionally citator-confirmed. Actor association and functional mapping are descriptive research. The architecture repository owns versioned source data and validators; **afri-website** owns all renderers and comments. Website consumers must pin an immutable Git commit and show the legal review status.

## Validation

```sh
node scripts/validate-constitution.mjs
node scripts/validate-federalism.mjs
node scripts/validate-article-iv-vii.mjs
node --test tests/article-iv-vii.test.mjs
```
