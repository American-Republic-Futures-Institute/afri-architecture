# INC-17A — Whole-of-government institutional relationship contract

**Status:** definition-only, research unratified. **No new government offices, constitutional powers, signed delegations, actual service operations, observed citizen outcomes, or public Atlas edges.**

## Purpose
The current repository already preserves federal institutions, State constitutional structures, statutory status, congressional and fiscal authorities, judicial precedent, independent publisher originals, and unratified citizen outcomes. Those are independent domains. This increment adds a nonduplicating shared semantic layer \`model/wholegov/ontology.json\` to connect future source-qualified graph models without replacing original stable identifiers.

The ontology distinguishes **19 element kinds, 8 jurisdiction classes, 23 directed relationship kinds, 10 legacy crosswalks and 8 declarative viewpoint templates**. Its records are definitions, not government facts. The core model standard stays ARFI-COA 0.1.0.

## Nonconflation rules
- An institution, constituent component, legal office, position, current incumbent, law, authority, function, program, delivery service, population and public outcome are different records.
- Source \`parent_id\` is catalog placement, not command, statutory component status, delegated authority or appellate review.
- Federal, member-State, tribal, territorial, District, local and intergovernmental structures remain jurisdictionally distinct; D.C. is not a fifty-first State.
- A delegated power needs applicable legal text, original evidence, effect/scope and review. Military command, oversight, fiscal appropriation, obligations, and operational service execution are different predicates.
- A public benefit's target population is not proof that its outcome improved. A reported association is not a causal estimate.
- No inverse, transitive, exclusive-authority or legal/currentness inference is supplied by proximity in a diagram.

## Existing relationship interoperability
The \`crosswalk\` entries refer directly to predicates from \`model/federal/relationships.json\` and \`model/federal/inc15e1/relationship-type-registry.json\`. They preserve original source-era and review constraints and **never import a claim** by matching predicate names. The 2025 Government Manual's 231 observations, 50 provisional links and 181 unlinked observations are publisher research counts, not an independent complete ADL-1 agency denominator.

## Future navigational viewpoints
Institutional composition, authority, functions, oversight, fiscal, intergovernmental, citizen outcome, and evidence viewpoints are described. A future website adapter shall reuse immutable canonical IDs and source-qualified edges, filtered by graph category, jurisdiction, date, review status and source commit. Reverse traversal from people/outcomes to government services and offices must not imply measured impact.

The read-only \`inspectCandidateEdge\` helper rejects wrong endpoints, wrong direction, missing immutable edition, unspecific cross-jurisdiction links, unreviewed legal effect, unverified operational activity and automatic public graph admission. **It does not validate publisher originality, an actual signature or legal truth.** Those remain independent source acquisition/review and Atlas publication gates.

## Increment boundaries
1. **INC-17A (this PR):** ontology, closed JSON Schema, source/legacy crosswalk validator, negative tests, explicit manifest-only registration; no website graph edits.
2. **INC-17B:** breadth-first current/historical identity and ADL-1 coverage reconciliation, retaining unknown denominators.
3. **INC-17C:** one sourced disaster-assistance public-service chain with separate legal duty, implementation, affected population and Observatory measurements.
4. **INC-17D:** source-inspected live Atlas adapter and dynamic cross-view traversal.

Keep Plan proposals and Observatory data independently identified. Do not treat ARFI outcomes as legislated or evidence of performance without measurements.
