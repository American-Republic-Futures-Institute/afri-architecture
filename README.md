# American Republic Futures Institute — National Architecture

**ARFI-COA v0.1.0 | Federal institutional baseline | As of 2026-10-15 | Research baseline / unratified**

This public repository is the canonical, model-driven source for the American Republic Futures Institute's constitutional-to-operational architecture. It contains structured **architecture data**, not the website or diagram renderer. The website repository is independently responsible for interactive views, user discussions, and the publication API.

## First scope

- Three constitutional federal branches (legislative, executive and judicial).
- Congress, House, Senate and six selected legislative support/research institutions.
- President, Vice President, Executive Office of the President and seven representative EOP components.
- **All 15 executive departments**, with concise role and mission summaries.
- Selected independent federal bodies; not an exhaustive agency directory.
- Supreme Court, appellate courts (13), district courts (94), bankruptcy courts (90), specialized courts, and judicial administration. Aggregate counts do **not** imply that the courts form a simple management hierarchy.
- Cross-referenced legal authority anchors, a provisional capability catalog, typed institutional relationships, source provenance and declarative viewpoints.

## Repository organization

```
model/federal/manifest.json          # publication and source contract
model/federal/branches.json          # constitutional branch identities
model/federal/legislative.json       # chambers and legislative support
model/federal/executive-*.json       # Presidency, EOP, departments, independent bodies
model/federal/judiciary.json         # courts and judicial support
model/federal/authorities.json       # explicit legal authority anchors
model/federal/capabilities.json      # provisional FEAF-BRM-family capability vocabulary
model/federal/relationships.json     # typed, source-backed cross-model links
model/federal/sources.json           # primary-source register
model/federal/viewpoints.json        # declarative selection semantics only
schemas/                          # JSON Schemas of catalog contract
scripts/validate.mjs              # architecture integrity validation (no renderer)
.github/workflows/validate.yml     # validation on PR / main
```

## Important modeling distinctions

- The **Constitution** establishes branches and powers. An executive department or independent agency instead also needs statutory and administrative authority; those narrower agency-specific authorities are **not yet fully mapped** in v0.1.0.
- The Department of Defense remains the **statutory** department name. “Department of War” is an authorized **secondary** title under a 2025 executive order and is modeled as an alias, not as a sixteenth department.
- The Office of the Vice President has both executive succession and Senate presiding functions; a single branch grouping does not erase those distinctions.
- Independent federal bodies are separate from the 15 Cabinet departments. The Federal Reserve Board's grouping does not imply direct presidential control of monetary-policy decisions.
- Relationships to capabilities are initial **descriptive classifications** rather than legal delegations or verified outcomes. FEAF v2 mapping is at the **Business Reference Model family level only**, not an assertion of specific BRM taxonomy conformance.
- Court aggregate groups represent court types, not a fabricated command chain. Jurisdictional appellate review is a separate, typed edge.
- All content is **descriptive**, source-linked, and **not** adopted ARFI policy or a recommendation to alter government structures.

## Reproducible checks

Requires Node.js 20+ with no third-party dependencies: `node scripts/validate.mjs`.

The validator checks JSON consistency, cross-record identifiers, organizational hierarchy, source references, fixed branch and cabinet invariants, relationships, manifest completeness, and viewpoint references. The JSON Schemas are maintained as a portable integration contract; validation script performs additional semantic checks. It does not render architecture.

## Publication contract

The website should read `manifest.json` and all referenced models at **one immutable commit SHA**; must display snapshot date, status and sources; and should key comments to `(element_id, immutable_commit_sha)`. No mutable release status is implied by `main`.

## Limits and next increments

This is an initial **top-level baseline**, not a complete United States governmental inventory. Next work should inventory subordinate bureaus, military departments and services, cabinet and independent-agency enabling statutes, congressional committees, court-by-court jurisdiction, intergovernmental interfaces, dated institutional transitions and verified FEAF taxonomy mappings. All changes must preserve stable IDs or explicitly record supersession. See `docs/MODELING-STANDARD.md` and `docs/SCOPE-AND-EVIDENCE.md`.

No license grant is declared by this bootstrap. License/public reuse terms require an explicit institute governance decision.


## Constitutional layer (2026-10-15 increment)

The architecture now contains an explicit constitutional decomposition under `model/constitutional/`. The model catalogs primary-text provision locations and separates **legal norm summaries**, **actor bindings**, and **ratified amendment change history**. These are research mappings, not official legal holdings. Original historical text may be repealed or superseded; the current effect is modeled separately.

| File | Purpose |
|---|---|
| `provisions.json` | Original Constitution, Preamble, Articles, Sections, selected Clauses, 27 Amendments |
| `norms.json` | Discrete powers, duties, restrictions, rights, eligibility and procedures |
| `actors.json` | Constitutional actor classes: states, persons, citizens, state courts, electors |
| `bindings.json` | Typed links to existing federal institutions and actor classes |
| `changes.json` | Amendment supersession, qualification and repeal relationships |
| `viewpoints.json` | Rendering-neutral constitutional architecture views |

Validate using `node scripts/validate-constitution.mjs` and `node --test tests/constitutional.test.mjs`. See `docs/CONSTITUTIONAL-METAMODEL.md` and `docs/CONSTITUTIONAL-COVERAGE.md`. The website retains exclusive responsibility for rendering and public comments.
