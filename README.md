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

## Article I complete clause coverage (2026-10-15)

The initial Article I layer now includes the original 53 clauses with 103 source-linked qualifications (conditions, exceptions, time limits, state reservations and historical overlays), 42 draft functional capability alignments, and 39 baseline federal capability types. All constitutional power mappings explicitly deny any inference of modern agency delegations.

Explore `model/constitutional/article-i-clauses.json`, `article-i-qualifications.json`, and `article-i-capability-links.json`. The complete implementation, caveats, and follow-on sequence appear in [docs/ARTICLE-I-ARCHITECTURE.md](docs/ARTICLE-I-ARCHITECTURE.md). The website repository owns all interactive rendering.

Reproduce the checks with `node scripts/validate-article-i.mjs` and `node --test tests/article-i.test.mjs`, in addition to the prior federal and constitutional validators.

## Article II executive powers and limitations (2026-10-15)

The Article II model now records **11 numbered original clauses, five analytically separated but unnumbered Section 3 functions, and one Section 4 impeachment/removal unit**. All 17 units are source-linked to discrete constitutional norms, 71 conditions and amendment overlays, and 40 candidate capability alignments. The new `article-ii-*.json` files and [detailed Article II standard](docs/ARTICLE-II-ARCHITECTURE.md) are architectural source data only.

Changes to the original constitutional text remain distinguishable from later amendments and doctrine. Run `node scripts/validate-article-ii.mjs` and `node --test tests/article-ii.test.mjs` along with earlier validators. The website continues to own visualization and publication.

## Article III judicial constitutional architecture (2026-10-15)

The canonical model now covers all Article III Sections and their judicial-vesting, judicial-tenure, compensation, federal cases/controversies, Supreme Court jurisdiction, criminal jury/venue and treason safeguards. Source files under `model/constitutional/article-iii-*.json` include **8 analytic units, 9 jurisdiction categories, 53 qualifications and 42 functional capability links**; Section 1 uses explicit ARFI semantic units, **not invented constitutional clauses**.

The authoritative modeling and publication contract is in [docs/ARTICLE-III-ARCHITECTURE.md](docs/ARTICLE-III-ARCHITECTURE.md). Validations: `node scripts/validate-article-iii.mjs` and `node --test tests/article-iii.test.mjs`. The website repository continues to own all rendering and comments.

## Federalism architecture — Articles IV, VI, Amendments X, XI and XIV

The canon now includes `model/constitutional/federalism-*.json` for **20 analytical units, 72 conditions, 40 constitutional federal–State relationships, 9 differentiated protected interests, and 45 functional capability alignments**. States are constitutional peers, not subordinate departments. The original Article IV §2 cl3 slave-service text is historical/inoperative with no active relation or capability grant. Rights of *citizens* and rights of *persons* are independently identified. See [docs/FEDERALISM-ARCHITECTURE.md](docs/FEDERALISM-ARCHITECTURE.md).

Run `node scripts/validate-federalism.mjs` and `node --test tests/federalism.test.mjs`. Architecture data and viewpoint declarations are the sole scope; website rendering remains in `afri-website`.

## Complete Constitutional Amendment Decomposition — October 15, 2026

The canonical architecture now includes all **27 ratified Amendments** with all **33 original numbered Sections preserved**, and **126 additional explicitly nonofficial analytical segments** linked to 27 time records, 15 effect/certification events, 172 textual or historical qualifications, 126 constitutional context/effect mappings and 114 **functional** (not delegating) capability links. Eighteenth Amendment repeal and finite transitional exceptions cannot create current authority. See [Amendment Decomposition](docs/AMENDMENT-DECOMPOSITION.md).

Check with `node scripts/validate-amendments.mjs` and `node --test tests/amendments.test.mjs`. Judicial doctrine and enabling statutes follow separately; website rendering remains owned by `afri-website`.

## Judicial precedent graph (initial seed, 2026-10-16)

Architecture-only **case/holding-based constitutional interpretation**, independent of original ratified text, in `model/judicial/`. Initial coverage: 18 Supreme Court cases, 20 bounded holdings, 30 constitutional traceability links, 10 directed later-case treatments, 20 holding-level provisional status assessments and 20 jurisdiction/applicability profiles. The 25 sources distinguish official Court opinions from government legal analysis. No entry implies a completed professional citator review or an unqualified holding of current binding law.

Read [Judicial Precedent Architecture](docs/JUDICIAL-PRECEDENT-ARCHITECTURE.md). Validate: `node scripts/validate-judicial.mjs` and `node --test tests/judicial.test.mjs`. Visual rendering and public commenting belong only in the website repo.

### Judicial case coverage and source-identity audit — October 16, 2026

Eight additional officially reported Supreme Court cases extend the model to **26 cases, 29 holding records, 44 constitutional links, and 29 status/applicability profiles**. Added coverage: interstate commerce, executive powers and privilege, bicameralism, Article III standing, Commerce Clause limits, D.C. Second Amendment self-defense, and Fourteenth Amendment State marriage rights. The model now validates exact GPO reporter volume/page and distinguishes the *Cooper v. Aaron* judgment date from the later opinion. No new legal effects are inferred from unreviewed subsequent decisions. All **61 judicial regressions** run in CI. [Documentation](docs/JUDICIAL-PRECEDENT-ARCHITECTURE.md).

## Independent State institutional architecture — October 16, 2026

The new `model/state/` family establishes **50 separately typed U.S. State jurisdictions** (plus a **non-State D.C. comparator**), with source-grounded pilot constitutional authority/institution models for **Virginia and Nebraska**: 2 State constitutions, 19 original State section citations, 24 State norms, 6 State branches, 19 organizational/local classes, 17 institution-to-norm links, 8 U.S. federalism overlays, 1 explicitly unverified judicial conflict link, and 6 *declarative* State viewpoints. The other **48** States remain identity-only, never fabricated as substantively modeled. No State government is under a federal organizational parent. Nebraska's unicameral legislature and Virginia's bicameral legislature, legislative Senate role of Virginia's lieutenant governor, conditional redistricting judicial fallback, and statutory-enabling-authority limits are enforced by **52 regression tests**.

See [Independent State Architecture](docs/STATE-INSTITUTIONAL-ARCHITECTURE.md). Run `node scripts/validate-state.mjs` and `node --test tests/state.test.mjs`. The website does **not yet render State institutional viewpoints**; no website changes were made.
