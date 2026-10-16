# INC-07 — Integrated National Outcomes and Dependency Architecture

**ARFI-COA v0.1.0 | 16 October 2026 | Draft research, unratified**  
**Canonical model:** [`model/outcomes/`](../model/outcomes/)  
**Prior baseline:** [INC-06 shared capability and institution reference](INSTITUTIONAL-REFERENCE-STRUCTURE.md)  
**Manuscript counterpart:** [The Republic We Build, Part IV](https://github.com/American-Republic-Futures-Institute/afri-plan-therepublicwebuild)

## 1. Purpose and constitutional discipline

This increment makes **cross-domain relationships explicit** without converting ARFI research into a federal program or legislative agenda. A useful national architecture must show that outcomes can depend on many capabilities, that an intervention may benefit some people while harming others, and that a proposed change may not be lawfully available to the institution someone expects to carry it out.

The model is intentionally **smaller than an entire national government**. It draws from only four already published *unratified* domain chapters: education (`DOM-02`), health (`DOM-03`), economy/work (`DOM-05`), and cybersecurity/privacy (`DOM-12`). These contain **39 candidate human outcome IDs**, plus eight candidate shared capabilities defined in INC-06. Extending the graph to remaining domains requires sourced, versioned change, not guessed entities.

Neither the Constitutional text nor the institutional baseline should be interpreted as automatically assigning one institution responsibility for every outcome. An ARFI-defined public objective does not create a legal entitlement or a statutory program.

## 2. Data and authority layers

| Layer | Existing or new source | Meaning | Prohibited inference |
| --- | --- | --- | --- |
| L0 — Foundation | Unratified first principles and legal primary sources | Values and constraints; separate legal text versus proposed norms | ARFI principle = binding constitutional law |
| L1 — Institutions | Canonical Federal and State models plus legal provenance | Descriptive institution identity, jurisdiction and sourced powers where independently verified | A parent or functional link is an agency delegation |
| L2 — Outcomes | Pinned manuscript chapters | Conditions in people's lives worth assessing | An outcome promises a particular provider, appropriation or enforceable entitlement |
| L3 — Capabilities | INC-06 `CAP-XDOM-*` catalogue | Candidate abilities shared across independent public/private actors | Capability implies single national owner or control |
| L4 — Options | INC-07 `OPT-07-*` records | **Hypothetical** alternatives for tradeoff analysis | A scenario is adopted policy, lawful mandate, forecast or implementation schedule |

The [manifest](../model/outcomes/manifest.json) pins two immutable baselines:

- **Plan manuscript:** `d856e926f4180225fc74cb57ba770b6189016be3`, after the INC-06 publication.
- **Architecture:** `ac04222e2f543e12c1c460d6d5581a33ba9b4d2a`, after the INC-06 capability catalogue was merged.

This increment is an overlay. It does not mutate any underlying constitutional, State, judicial, federal, or INC-06 capability records.

## 3. Typed relationships and their strictly limited claims

The graph has **five distinct relationship types**. They are not interchangeable.

| Relationship | Allowed direction | Interpretive meaning | Key safety rule |
| --- | --- | --- | --- |
| `supports` | Shared capability → proposed public outcome | A capability *may* contribute to that outcome | Not a causal effect estimate, KPI result or claim that an institution has authority |
| `depends_on` | Proposed outcome → candidate capability (or future sourced outcome dependency) | A condition *plausibly* needs another condition or ability | Not a proof of necessity; circular chains in pure dependencies are rejected |
| `conflicts_with` | **Hypothetical option** → proposed public outcome | A design *may* create harmful consequences for that outcome | **Never** represent two rights or public outcomes as fundamentally incompatible without specifying the intervention and mechanism |
| `constrained_by` | Hypothetical option or candidate capability → distinct safeguard | A legal or normative guardrail should bound consideration | The guardrail's record declares whether it is existing legal text, mixed, or an unratified proposed standard |
| `requires_legal_authority` | Hypothetical option → **unsatisfied** legal research gate | Specific legal actor, jurisdiction, method and limitations must be verified | A link **never** asserts enactment, lawful delegation or permission to act |

Every edge records an evidence-reference set, plain-language causal/structural rationale, unresolved uncertainty, possible disconfirming evidence, unratified status, and `authority_asserted:false`.

The `conflicts_with` edge is an explicit **conditional risk statement**, not a policy endorsement or a claim that people must choose between liberty and safety. For example, *mandatory centralized identity* may impair access and privacy; *accessible verification with minimal data* may avoid much of that tension. The underlying values of safety and liberty need not be inherently opposed.

## 4. Model families and registered volumes

| File | Status | Contents |
| --- | --- | --- |
| [Evidence](../model/outcomes/evidence.json) | Sources and scope caveats | Nine bounded source/provenance records, including primary constitutional text, Congressional Research Service research, NIST methods and pinned ARFI source snapshots |
| [Guardrails](../model/outcomes/guardrails.json) | Pending legal/public review | Ten distinctly labeled constitutional, normative and jurisdictional constraints |
| [Authority gates](../model/outcomes/authority-gates.json) | Unsatisfied | Nine statutory, fiscal, privacy, federalism, property, security, speech and constitutional-route research checkpoints |
| [Options](../model/outcomes/options.json) | Hypothetical, not endorsed | Ten research alternatives covering data sharing, digital identity, education funding, tax, healthcare ownership, cyber assistance, industry support, credentials, public attribution and evidence publication |
| [Typed relationships](../model/outcomes/relationships.json) | Unratified hypotheses | **92** edges: 16 supports; 12 depends_on; 12 conditional conflicts; 31 safeguard constraints; 21 unresolved authority gates |
| [Scenarios](../model/outcomes/scenarios.json) | Qualitative stress tests | Nine cross-domain scenarios with expected benefit, potential harm, evidence needed, authority gates and explicit non-inference |

The evidence register distinguishes:
- primary **constitutional text** (reliable as text; current interpretive reach still requires qualified analysis);
- official **legal research** (not itself enacted law);
- official **technical guidance** (not a universal mandate);
- ARFI's **proposed research hypotheses** (not measured causal claims).

NARA original constitutional texts: [Constitution](https://www.archives.gov/founding-docs/constitution-transcript), [Bill of Rights](https://www.archives.gov/founding-docs/bill-of-rights-transcript), [later amendments](https://www.archives.gov/founding-docs/amendments-11-27). The [CRS report on constitutional limits of federal spending conditions](https://www.congress.gov/crs_external_products/R/PDF/R46827/R46827.2.pdf) identifies notice, relatedness, anti-coercion and other considerations; those must still be tested under controlling law and an actual proposed grant. [NIST CSF 2.0](https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20) provides flexible security *outcome* concepts, not an ARFI policy authorization.

## 5. Worked traces and independent concerns

### A. Essential-care continuity during a communications and power disruption

`HLT-O08` (service continuity) → `depends_on` → `CAP-XDOM-002` (service recovery). The same candidate capability → `supports` → `CYB-O01` (cyber-resilient essential services). `CAP-XDOM-007` also supports health and economic outcomes through infrastructure and supply resilience.

Under a hypothetical expanded response option (`OPT-07-06`), the graph additionally highlights `conflicts_with` to civil-liberty outcome `CYB-O06`, `constrained_by` the civilian/military and privacy guards, and `requires_legal_authority` an **unresolved** cyber assistance gate. The graph does not grant DoD general domestic policing authority or give CISA control over private facilities.

### B. Digital identification that improves fraud control but excludes users

`OPT-07-02` is a **hypothetical centralized mandatory credential**, not an approved proposal. Potential identity integrity benefits require measurement; foreseeable risk links point to individual privacy (`CYB-O03`) and access to learning (`EDU-O06`). Guards identify data minimization, accessibility and contestable error, while separate gates require actual legal authority.

An alternative could be federated, narrow-purpose verification with multiple practical recovery methods; its own risks are also modeled. **No option is immune from review merely because it sounds privacy preserving.**

### C. Congress considering a new education funding condition

`OPT-07-03` is linked to possible learning evidence benefits and the risks of statistical gaming, learner data exposure and loss of local agency. It remains subject to specific grant authority and constitutionally bounded funding conditions. The Tenth Amendment alone is not a complete grant-law test; the law and relevant precedent must be reviewed.

### D. Proposed taxation or public-service ownership change

`OPT-07-04` and `OPT-07-05` remain undecided. A possible tax faces classification, administration, appropriations and distributional questions; a proposed care-facility acquisition faces public-use, compensation, patient continuity and fiscal obligations. A target national outcome does not automatically validate either intervention.

### E. Information authenticity without official ideological approval

`OPT-07-09` examines bounded origin disclosures and risks of compelled speech or viewpoint policing. `CYB-O07` is a public **ability to assess provenance**; `CYB-O08` is independent judgment and lawful expression. An information-integrity architecture must not turn the graph's labels into a state determination of permissible belief.

## 6. Scenario design, not prediction

Each [stress scenario](../model/outcomes/scenarios.json) states:
1. A **hypothetical trigger**, actors or service conditions.
2. A plausible benefit and an **adverse pathway**.
3. Specific outcomes, shared capabilities, graph edges, safeguards and *unsatisfied* legal research gates.
4. Data and testimony that would be necessary to evaluate the idea.
5. Explicitly prohibited conclusions, such as the claim that government already has the power, that a numeric benefit is proven, or that adoption is required.

These are qualitative adversarial thought experiments. They are **not** agent-based simulations, predictive risk forecasts, formal verification of an intervention, or measured cost-benefit analyses. The model records both the ability to adapt and the capacity to be corrected.

## 7. Security, constitutional and research risk model

| Abuse/failure mode | Preventive rule | Regression/validation gate |
| --- | --- | --- |
| Treating a proposed option as legally enacted | Option status must remain hypothetical; `government_action_authorized=false` | Detects status mutation |
| Treating a legal review question as a permit | Authority gate `satisfied=false`, `authorizes_action=false` | Rejects authorization mutation |
| Claiming rights inherently conflict | `conflicts_with` can originate **only** from an explicit proposed option | Rejects outcome–outcome conflicts |
| Conflating a hypothesis with observed causality | Every edge is candidate/unknown-effect with independent review pending | Rejects effect-strength promotion |
| Poisoned links or evidence references | Stable ID regex and referential checks against pinned domain/capability catalog and constitutional records | Detects dangling/out-of-type nodes |
| Concealing that a proposal requires legal review | Every option must have conflict, guardrail and authority-gate links | Rejects incomplete options |
| Inadvertently creating a circular dependency order | Validate `depends_on` subgraph as acyclic | Rejects circular dependency mutation |
| Calling a paper scenario a calibrated simulator | `probability=not_estimated`; `effect_quantification=not_estimated` | Rejects quantitative prediction |
| Omitting State, private or public rights constraints | Record constitutionally distinct guards, alternative evidence and public-review requirements | Specialist validation remains pending |

The baseline test suite includes deliberate **malicious and accidental mutations** in its negative regressions. Passing them establishes structural integrity, not clinical, economic or legal correctness.

## 8. Interface and future research contract

A public interface should make traces readable from either an outcome or a government institution without inventing agency control. Proposed options require clear **open/not-endorsed** labeling and visible alternatives, adverse effects, legal questions, data limits and public comment references.

The canonical model remains in `afri-architecture`. The plan repository owns the prose; the website will render and collect comments under moderation/review gates but **must not publish changes directly into authoritative models**.

Future INC-08 should package a transparent public review corpus with issue identifiers, source editions, unresolved options, public responses, versioned editorial changes and accessible discussion mechanisms. The national graph can grow as more domain chapters and verified institutional legal sources are developed.

## 9. Acceptance boundary

Run the following with Node 22 or later and no third-party package dependencies:

```sh
node scripts/validate-outcome-dependencies.mjs
node --test tests/outcomes.test.mjs
```

The existing [architecture workflow](../.github/workflows/validate.yml) runs the prior federal, constitutional, State and institutional-reference validations as well. The seven [JSON Schema contracts](../schemas/) describe the portable publication shape; semantic and referential safety checks remain mandatory.

**Human review outstanding:** legal specialists, State/tribal/territorial authorities, affected civil-liberties and patient communities, economists and clinicians, educators, infrastructure operators, independent statisticians and public participants.

The graph tells a reader which hypotheses deserve attention. It does **not** decide what Americans must do.
