# INC-13A — Federal ADL-1 Structural Qualification Contract

**ARFI-COA v0.1.0 · October 19, 2026 · Research baseline / unratified**

**Pilot scope:** Department of Defense (DoD), Department of Justice (DOJ), Department of Veterans Affairs (VA).
**Pinned source:** `e4252ff4e81d9b4aae52ec930a52588b61ad13ee` (merged INC-12 baseline).

## Purpose and prerequisites

This increment defines reusable intake for **Architectural Decomposition Level 1 (ADL-1)**, meaning verified first-level institutional structure for an explicitly defined scope and effective period, including identity, complete cohort boundaries, source provenance, typed relationships, legally significant exceptions and qualified review. ADL-1 is independent of ARFI's L0-L4 reference levels and does *not* establish statutory powers, funding, operational command or performance.

The INC-12 selected inventory contains 61 existing federal identifiers and 150 source observations. It does not claim a complete government denominator, current first-level rosters or certified ADL-1 institutions. The VA 04E dossier records nine mandatory *unmet* qualification gates; 04F candidate units are unapproved. DoD Title 10 composition and DOJ chart placement do not automatically authorize command, supervision or delegated power.

**Naming coexistence:** The existing X13 EOP/FTC source collections are a separate source-bounded INC-13 increment. INC-13A is an ADL-1 qualification work package and neither supersedes nor certifies that X13 work. A future architecture release should consolidate increment nomenclature without rewriting those canonical IDs.

## Nine qualification gates

| Gate | Qualification evidence requirement | Legacy VA 04E precedent |
|---|---|---|
| SCOPE | Define jurisdiction, cohort boundary, exclusions and as-of question | E04E-QUAL-SCOPE |
| SOURCE | Independently verify original government-source versions, digests and custody | E04E-QUAL-SOURCE |
| COHORT | Establish complete first-level denominator with independently resolved residuals | E04E-QUAL-COHORT |
| STATUTE | Trace statutes, applicable exceptions, constraints and relevant effective periods | E04E-QUAL-STATUTE |
| FUNCTIONS | Separate composition, supervision, delegation, command, adjudication and oversight | E04E-QUAL-FUNCTIONS |
| HISTORICAL | Reconcile aliases, redesignations, successor functions and legal history | E04E-QUAL-HISTORICAL |
| HUMAN | Secure authenticated independent legal and institutional competence decisions | E04E-QUAL-HUMAN |
| CUSTODY | Bind approved original evidence to ratified signer and retention governance | E04E-QUAL-CUSTODY |
| AUDIT | Verify independent retrieval, audit trail, integrity and disaster recovery | E04E-QUAL-AUDIT |

The generic gate crosswalk does **not** waive VA 04E's narrower legal/custody controls or its unresolved Canteen, former VA Board/CBCA, IG, BVA, OEDCA and residual statutory-composition questions. `under_review` signals that a real source is being considered, not that an independent human has qualified it. A machine-readable status is not a legal determination.

## Canonical source contract

- `model/federal/inc13a-gates.json`: nine reusable, non-waived qualification prerequisites.
- `model/federal/inc13a-pilots.json`: three DoD/DOJ/VA research scopes, each with nine unmet gates, unknown denominator, no signed decision and no certification.
- `schemas/inc13a-adl1.schema.json`: closed portable Draft 2020-12 subset for gates, pilots and research relationship claims.
- `scripts/inc13a-validation-core.mjs` and `scripts/validate-inc13a.mjs`: read-only deterministic validation and department projection.

A future relationship claim must bind its subject, object, original INC-12 observation, original record and typed relation IDs, exact source snapshot, edition label and observed date. It must separately record the claimed *legal effective* period and independent review state. Source edition, retrieval date and operational effective date are not interchangeable.

The model distinguishes `source_observed_placement`, `statutory_composition`, `administrative_supervision`, `delegated_authority`, `operational_command`, `independent_oversight`, `adjudicative_jurisdiction`, and `historical_succession`. Only source-observed placement is accepted as a research claim in INC-13A; the other relation types require independent evidence and separate admission semantics in INC-13C. A graph edge has no power to create statutory authority.

## Certification and publication boundary

Source authenticity, empirical completeness, legally effective structure, independent professional review, verified root-governed custody and ratified institutional certification are separate controls. A correctly signed artifact is not evidence that its signer had lawful competence; the 04E trust code does not establish that a governing body has been formed or has ratified a review decision.

INC-13A explicitly blocks ADL-1 certification rather than accepting a boolean, fabricated reviewer identifier or self-signed declaration. Its outputs must retain **zero qualified first-level denominators, zero certified entities and zero authenticated independent decisions**. Qualified certification requires separately controlled review/approval and a new versioned contract, not silently changing a source status.

## Reproducible acceptance

Run at the repository root under Node.js 22:

```sh
node scripts/validate-inc13a.mjs
node scripts/validate-inc13a.mjs --view ORG-FED-EXE-DEP-VA
node --test tests/inc13a.test.mjs
```

Negative tests cover changed source edition, source/relationship ID, parent, department scope, effective period, asserted statutory command/delegation, VA 04E gate waiver, unknown roster denominator, fabricated certification and unsigned review approvals. CI verifies structural and provenance consistency, not independent government or counsel approval.

## Following work

**INC-13B:** Reconcile bounded DoD/DOJ/VA first-level structures from dated authoritative sources, preserving outstanding unknowns and VA exceptional classes.

**INC-13C:** Expand legally reviewed typed composition, supervision, delegation, command, oversight and adjudication relationships.

**INC-13D:** Add source-pinned public Atlas gate/relationship inspector without UI-generated claims.

**INC-13E:** Adversarial, source-byte, API and desktop/mobile browser integration acceptance before publication.
