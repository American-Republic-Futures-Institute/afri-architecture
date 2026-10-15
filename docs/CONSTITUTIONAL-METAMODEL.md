# Constitutional Architecture Metamodel — ARFI-COA v0.1.0

**Research draft | Updated 2026-10-15 | Not a legal opinion or adopted ARFI position.**

## Purpose and position within ARFI

The canonical `model/constitutional/` catalog models constitutional text and its described legal effects before any attempt to attribute modern governmental authority to agencies. It primarily serves **L0 legal constraints** and **L1 constitutional authorities**, while enabling later L3 capability traceability. The institute's own first principles are normative proposals, **not** constitutional law.

Constitutional decomposition is **not FEAF**. FEAF provides vocabulary for institutional capabilities but does not determine legal power. Constitutional legal traceability is authoritative before any reform/adoption decision.

## Registries and identity

| Registry | ID | Contents | Canonical role |
|---|---|---|---|
| Provisions | `CONST-US-*` | Document, Preamble, Articles, Sections, selected Clauses, Amendments, Amendment Sections | Source-grounded, immutable textual locations |
| Norms | `NORM-US-CONST-*` | Discrete textual powers, restrictions, rights, duties, procedures and jurisdictional rules | **Research summaries**, not primary-source text or judicial holdings |
| Actor classes | `ACT-US-*` | Persons, people, states, state legislatures, electors, etc. | Role types not falsely represented as federal agencies |
| Bindings | `BIND-US-CONST-*` | Typed links between a norm and an existing institution or actor class | Explicit allocation, prohibition, protection or duty |
| Changes | `CHG-US-CONST-*` | Amendment-based repeal, replacement, qualification and historical transition | Prevents obsolete rules being displayed as currently operative |
| Viewpoints | `VIEW-CONST-*` | Display-neutral selections of constitutional graph objects | Viewer contract only; no rendering engine |

Existing `AUTH-US-*` authorities remain stable legacy summary anchors and now reference one or more canonical constitutional provision IDs. An **agency-specific enabling statute** must be separately evidenced; linking a department to a broad constitutional Article is insufficient to assert a specific delegated power.

### Status axes must not be collapsed

- **Legal effect** (`operative | modified_in_part | superseded | repealed | expired | mixed`) describes whether the original clause/amendment as recorded should be read as current law. An aggregate may contain mixed operative and historical passages.
- **Interpretation status** (`textual_summary_pending_legal_review`) describes research-quality ARFI paraphrases, not the force of constitutional law. Never equate "draft" with unratified federal constitutional text.
- **Norm type** describes a power, duty, prohibition, right, procedure, jurisdiction, eligibility, reservation or limit. The same provision can generate multiple norms (e.g., taxing power and uniformity constraint).
- **Source provenance** always traces the original text to the National Archives. Judicial doctrines should be modeled in a **separate** future authoritative-citation record with case name, holding, court, date, treatment, and line of precedent.

### Examples of necessary distinctions

- **Article I Section 8:** enumerated powers are distinct from later statutes creating agencies; Necessary and Proper is connected to powers vested elsewhere, not a standalone general police power.
- **Articles I & II:** Congress has legislative/war/appropriation powers while the President is Commander in Chief and executes law. Administrative hierarchy does not grant unbounded executive authority.
- **Article III:** judicial review is primarily a matter of constitutional construction and precedent, not an express text grant that should be invented in Article III.
- **Article VI:** supremacy extends to the Constitution and laws made **in pursuance** thereof, not unconstitutional federal action.
- **Fifth versus Fourteenth Amendment due process:** different textual governmental addressees; modern incorporation doctrine requires separate case-law mapping.
- **State actors:** states, state legislatures, judges, and executives are not federal subordinates.
- **Right-holder types:** "persons", "people", and "citizens" have different textual contexts and cannot be globally equated.
- **Historical text:** original Senator selection, original Electoral College balloting and fugitive-service clauses are superseded; Eighteenth Amendment is repealed by the Twenty-First. Do not present them as current authority.
- **Amendment XVIII:** represented for historical provenance, explicitly without active actor grants or obligations.

## Document and source policy

This increment stores normalized source **locations, labels, short descriptions, scope and provenance**, not a locally edited "consolidated Constitution" or reconstructed verbatim text. The primary text resides in the National Archives source transcripts. Amendments are preserved with ratification dates and supersession links. This avoids conflating 1787 original wording with later enacted amendments.

The Constitution Annotated is used to distinguish primary text, history and judicial doctrine. It is secondary official congressional legal analysis, not itself a source of independent constitutional powers. Model case law and implementation statutes only after verifying primary citations.

## Integration contract

- Every element must have a stable identifier. Published website comments reference the identifier and immutable Git commit.
- The website owns diagrams and discussions. No canvas positions or browser code belong here.
- Viewpoints are declarative selectors. They do not copy legal facts from canonical records.
- Running `node scripts/validate-constitution.mjs` and `node --test tests/constitutional.test.mjs` must pass before the PR is merged.
- Any material legal conclusions require primary-authority verification and human legal review; no model, AI analysis or code itself creates government authority.

## Subsequent scope

1. Finish clause-level decomposition beyond selected anchors, including constitutional qualifications and exceptions.
2. Map each norm to enabling statutes, current federal institutions, and jurisdiction with dated temporal validity.
3. Build a case-law/doctrine register separate from original text, including overturned, limited, and controlling authorities.
4. Incorporate Bill of Rights state-application/incorporation doctrine through Fourteenth Amendment case law.
5. Map constraints to candidate ARFI reforms and Article VIII reform evaluation gates while preserving draft status and public dissent.
