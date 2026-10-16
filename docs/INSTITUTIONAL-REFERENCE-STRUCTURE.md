# INC-06 — Government Institutional Reference Structure and Shared Capabilities

**ARFI-COA reference overlay v0.1.0 | 2026-10-16 | Research baseline, unratified**  
**Architecture repository:** `afri-architecture` (canonical machine-readable models)  
**Manuscript:** [The Republic We Build](https://github.com/American-Republic-Futures-Institute/afri-plan-therepublicwebuild) (narrative, public dialogue and research)  
**Plan snapshot linked by commit:** `173476efd1e66988d7f51f67526025d007e44e93`

## 1. Purpose and boundary

INC-06 creates a **reference view**, not a new government organization chart or source of legal authority. It provides stable navigation through the currently modeled legislative, executive and judicial federal branches and links selected national outcome domains to **shared candidate capabilities**. Source catalog records remain canonical.

The architecture separates three relationships:

1. **Recorded structure** — existing institution and catalog containment (the `BR-FED-*` and `ORG-FED-*` records, with independently dated sources). A `parent_id` may be a navigational grouping, **not** an operational command or legal delegation.
2. **Proposed functional relevance** — shared capabilities that could support national outcomes. This is an ARFI research hypothesis, not a current government mission assignment.
3. **Legal authority** — a narrower question that requires specific controlling constitutional, statutory, regulatory or validly delegated text, including jurisdiction, conditions, limitations and remedies. This overlay does not populate or authorize such edges.

Federal institutional baselines retain `0.1.0` and their existing `observed` / `descriptive_candidate` status. The plan's underlying outcomes remain unratified. The overlay does not amend the U.S. Constitution or the charter.

## 2. Federal navigation structure

The [view selectors](../model/reference/institution-view.json) refer to existing catalog files rather than copying 61 institutional records.

| Reference view | Source catalog | Coverage and interpretation |
| --- | --- | --- |
| Legislative branch | `model/federal/legislative.json` | Congress, House, Senate, selected support and research institutions. Congressional subcommittees and all Member offices are **not** comprehensively enumerated. |
| Executive leadership and EOP | `model/federal/executive-leadership.json` | President, Vice President, EOP and seven selected components. Vice President's Senate role is a **separate functional relationship**, not erased by executive catalog classification. |
| Cabinet departments | `model/federal/executive-departments.json` | **15** statutory departments, including Education, Defense, HHS, Treasury and Homeland Security. This is **not** a claim that all subordinate agency functions have been mapped. |
| Independent federal bodies | `model/federal/executive-independent.json` | Selected independent entities, including the Federal Reserve Board, FTC and FCC. Classification is **not** evidence of direct presidential control over independent decisions. |
| Federal judiciary | `model/federal/judiciary.json` | Supreme Court, appellate and district groups, specialized courts and judicial administration. Groupings are **not** a fabricated appellate command hierarchy. An Article I tribunal in a judicial-facing catalog does not become an Article III court. |

The existing baseline reports **three branches and 15 executive departments**. The overlay adds **zero new named federal agencies or offices** and must not imply extra branches.

**State and other governments are not children of this federal tree.** A separate State model identifies 50 member States and selected Virginia and Nebraska institutional pilots. The District of Columbia remains a distinct comparator, not the fifty-first State. Tribal nations, territories and local governments require their own lawful institutional models; the reference view marks those organizational inventories as *research pending* rather than inventing them.

## 3. Source-of-truth contract

| File | Responsibility |
| --- | --- |
| [Reference manifest](../model/reference/manifest.json) | Version, unratified status, governance constraints and source contract |
| [Institution selector views](../model/reference/institution-view.json) | Nonduplicating navigation across existing federal records and jurisdiction boundaries |
| [Domain contract](../model/reference/domain-contract.json) | Snapshot of **four** plan domains' stable candidate outcome/capability/progress identifiers |
| [Shared capabilities](../model/reference/shared-capabilities.json) | Eight candidate reusable enablers, explicit risks and FEAF family pointers |
| [Domain-capability links](../model/reference/capability-relationships.json) | **29** trace hypotheses linking shared capabilities to domain capability IDs and human outcomes |
| [Institution-candidate links](../model/reference/institution-candidates.json) | **24** potential subjects for research into government contributions; no assigned powers |
| `schemas/*reference*.json` and associated files | JSON Schema publication shape contracts |
| [Validation core](../scripts/reference-validation-core.mjs) and [regression tests](../tests/reference.test.mjs) | Referential, integrity, sovereignty, false-authority and publication-safety checks |

The `domain-contract` explicitly pins the manuscript commit. It copies **only stable identifiers** necessary for cross-repository referential integrity, not whole passages or presumed accepted policy. If a manuscript domain or ID changes, publish a new contract revision and inspect every impacted link before adoption.

The model is designed for a future API, website and graph renderer. **It does not create a website, register a government program, or grant a person access to any protected data.**

## 4. Shared candidate capabilities (not new federal powers)

| Stable identifier | Reusable function | Direct domain intersections |
| --- | --- | --- |
| `CAP-XDOM-001` | Privacy-preserving information stewardship | Education, healthcare, economy, digital privacy |
| `CAP-XDOM-002` | Essential-service continuity and recovery | Healthcare, economic infrastructure, cyber resilience |
| `CAP-XDOM-003` | Lifelong skill and workforce development | Education, clinical workforce, economic mobility, cyber skills |
| `CAP-XDOM-004` | Independent evidence and outcome measurement | Education, healthcare, prosperity, cybersecurity |
| `CAP-XDOM-005` | Transparent public finance and stewardship | Education, healthcare, economic stability |
| `CAP-XDOM-006` | Accessible participation and meaningful remedies | Education, healthcare, household participation, cyber recovery |
| `CAP-XDOM-007` | Resilient infrastructure and productive supply networks | Medical continuity, production, cyber-physical operations |
| `CAP-XDOM-008` | Secure identity, verification and restoration | Learning, health information, commerce, digital identity |

Capabilities are defined as **abilities the nation or its communities may need**. They are not offices, new programs, funding mandates or implied delegations. A capability may involve multiple sectors and jurisdictions; no institution is assigned as its exclusive owner.

These overlays use FEAF-v2 reference-model **families** (Performance, Business, Data, Application, Infrastructure and Security) as analytical labels. They do not claim full taxonomy conformance, government certification or any automatic connection to an official federal enterprise architecture.

## 5. Examples of cross-domain traceability

**Clinical continuity under cyber stress:** `CAP-XDOM-002` points to `HLT-C08` and `CYB-C06/C07` as possible enabling capabilities, and to citizen outcomes `HLT-O08` and `CYB-O01`. HHS, DHS and Energy are **research subjects** for their *existing* lawfully authorized functions; this connection creates no cross-department command authority.

**Meaningful learning and workforce mobility:** `CAP-XDOM-003` links `EDU-C06/C08`, `EPR-C03` and `HLT-C05`. The Education and Labor departments are plausible research contributors but the federal government is not thereby assigned general curriculum control.

**Resilient and rights-preserving data use:** `CAP-XDOM-001` supports student, health, market and personal-information objectives. Privacy, consent, purpose limits and lawful remedies remain guardrails even where a proposed data-sharing tool improves operational performance.

**Public finance without monetary-policy conflation:** `CAP-XDOM-005` is relevant to education access, household medical affordability and fiscal stability. The Federal Reserve Board, Treasury and Congressional Budget Office have different existing roles. This model does **not** treat the Federal Reserve as a Treasury subordinate or legislative appropriator.

## 6. Institutional future-role record contract

An eventual office profile must contain:

- **Institution identity:** canonical `ORG-FED-*`, State, tribal or territorial identifier (as available); lawful formal name; branch/jurisdiction; source snapshot; and known naming uncertainty.
- **Present competence:** existing mission and clearly identified law/delegation where verified; otherwise an explicit research-pending field.
- **Citizen outcomes:** one or more proposed human outcome IDs with rationale for why the institution could have a role.
- **Capabilities and interfaces:** a nonduplicated capability reference and relevant neighboring actors; distinguish internal operations, coordination, oversight, appeal and service provision.
- **Choices under consideration:** preserve, adapt, coordinate, move a function through **lawful** change, or consider other models; none adopted automatically.
- **Accountability and rights:** public access, remedies, due process, privacy, constitutional limitations, state/tribal/territorial relationships and independence.
- **Evidence, alternatives and open decisions:** sources, limits, conflicting options, public comments, review history, and a decision record.

See the [institutional template in the plan repository](https://github.com/American-Republic-Futures-Institute/afri-plan-therepublicwebuild/blob/main/manuscript/_templates/INSTITUTIONAL_PROFILE_TEMPLATE.md). Draft profiles may refer to these IDs but must not copy catalog facts and silently change them.

## 7. Adversarial and nonfunctional review requirements

A reviewable future increment must demonstrate:

- **Authority isolation:** changing a `candidate_enabler_of` relationship or `potential_study_contributor` link must not create an observed legal power.
- **Model integrity:** unique IDs, existing institutional references, real domain outcome IDs, recognized three branches, 15 Cabinet departments and no invented courts/tribal departments.
- **Federalism:** States, tribal nations, territories and localities are distinct perspectives, not subordinate offices of the federal executive branch.
- **Jurisdiction-specific judicial roles:** a courtroom dispute, a congressional oversight request and an agency's routine program administration cannot be reduced to a single 'reports to' relationship.
- **Rights:** explicitly assess privacy, due process, public information, accessible participation, remedies and risks of disproportionate impact.
- **Economic and operational effects:** shared systems may increase efficiency but may also centralize failure, create privacy risk or shift cost across domains.
- **Evidence neutrality:** an attractive proposed future state is not empirical proof that a particular public agency is deficient or that an alternative will work.
- **Public review:** preserve dissent, meaningful responses and unresolved decisions without quietly ratifying preferred models.

The validation core rejects malformed identifiers, missing domain links, mismatched jurisdiction, accidental capability ownership and invented powers. Source verification and human legal/subject review remain separate release gates.

## 8. Future architecture increments

**INC-07** can expand this initial common model into a national outcomes dependency graph, distinguishing *supports*, *depends on*, *conflicts with*, *constrained by* and *requires legal authority* relationship semantics with explicit evidence and uncertainty. Add legal source edges only after enactment and applicability are verified.

**Office-level expansion** should proceed incrementally from bounded federal catalogs and separate State/tribal/territorial source records. Do not fabricate a full government organization tree for the sake of visual completeness.

**Website publication** can render an institutional/office browser from the same machine-readable records and link to corresponding outcome chapters and public comments. The website is a renderer and participant interface, not the canonical architecture store.

*Institutional reference structure and capability overlay are unratified research. They are neither an adopted national reform program nor an official United States Government architecture.*
