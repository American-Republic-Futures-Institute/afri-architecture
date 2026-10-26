# INC-17B — Breadth-first institutional census and source-qualified ADL-1 evidence queue

**Release status:** unratified, read-only source index. **Publisher edition:** 2025-12-31. **Canonical predecessor:** `f18c6e1ad71090e0cd2cc833fe74031f07ad5d18` (INC-17A). **No newly certified legal institutions, current supervisory relationships, government actions, or live Atlas edges.**

## Goal, legal boundaries and denominator discipline

INC-17A defines the shared semantic registry. INC-17B adds a machine-readable breadth-first crosswalk over previously established identity registers and retained original publisher records. It does **not** certify whole-of-government ADL-1 completeness. Source listings, modern legally constituted institutions, dated staff structures, publisher category names, jurisdictional actors, and officeholders remain different populations. A `parent_id` or edition-local XML nesting reflects the corresponding source's catalog structure only. Federal departments, Congress, the judiciary, agencies and independent bodies must not be modeled as one universal command hierarchy.

The 2025 Government Manual XML original is retained at `evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml` with SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138` and Git blob `195c46a67c87ae85f1dedd423250900f119a041a`. Tests replay both byte-level receipts. Git storage is **not** asserted as independently qualified WORM preservation.

### Existing ARFI canonical institutions, not the real federal institution denominator

| Original catalog family | Existing core anchors | Meaning |
| --- | ---: | --- |
| Legislative | 9 | Congress/chambers and selected legislative support institutions |
| Executive leadership/EOP | 10 | President, Vice President and selected EOP components |
| Cabinet departments | 15 | The complete 15-department canonical roster; subordinate rosters incomplete |
| Executive independent bodies | 18 | Selected canonical bodies; not the population of every legally independent institution |
| Judiciary | 9 | Selected court groups, courts and administrative structures, not all individual courts |
| **Existing canonical reference workset** | **61** | A historical/model-based workset, not a deduplicated current whole-of-government census |

All 61 existing identifiers, their original source catalog paths, recorded catalog parents, source IDs and identity-evidence states remain unchanged. None is automatically advanced from `observed` to current independently legally certified.

### Original 2025 publisher accounting — disjoint groups

| Original publisher category | Source entries | Provisional name links | Source-only dispositions | Unresolved |
| --- | ---: | ---: | ---: | ---: |
| Legislative Branch | 10 | 9 | 0 | 1 |
| Judicial Branch | 16 | 7 | 0 | 9 |
| Executive Branch: The President | 2 | 2 | 0 | 0 |
| Executive Branch: Departments | 117 | 15 | 43 | 59 |
| Executive Branch: Independent Agencies and Government Corporations | 62 | 17 | 45 | 0 |
| Quasi-Official Agencies | 8 | 0 | 0 | 8 |
| International Organizations | 16 | 0 | 0 | 16 |
| **Total** | **231** | **50** | **88** | **93** |

Here **50 + 88 + 93 = 231** is an exact, non-overlapping source-accounting identity. No source-only disposition is a new canonical institution or proof of its 2026 existence, independence, statutory powers, appropriation, successor, or reporting control. No missing publisher entry proves a current institution or legal authority is absent. International and quasi-official source categories are **not** automatically treated as U.S. federal agencies.

## Cabinet breadth-first source inventory

The Government Manual edition records **15 department publisher parent entries, 63 immediately nested entries, and 39 deeper nested entries** (117 department-section observations in all). Those counts describe XML edition placement, **not** current legal first-level government units. A zero means *no first-level entry recorded in this publisher edition*; it does not mean a department lacks bureaus, components or staff offices.

| Existing Cabinet root | First-level publisher entries | Deeper publisher entries | Prior INC-15B source coverage |
| --- | ---: | ---: | --- |
| Department of State | 0 | 0 | No INC-15B source edition |
| Department of the Treasury | 6 | 0 | Recorded prior edition (unqualified) |
| Department of Defense | 4 | 23 | Recorded prior edition (unqualified) |
| Department of Justice | 2 | 12 | Recorded prior edition (unqualified) |
| Department of the Interior | 10 | 0 | No INC-15B source edition |
| Department of Agriculture | 0 | 0 | No INC-15B source edition |
| Department of Commerce | 10 | 0 | Recorded prior edition (unqualified) |
| Department of Labor | 9 | 0 | No INC-15B source edition |
| Department of Health and Human Services | 11 | 0 | No INC-15B source edition |
| Department of Housing and Urban Development | 0 | 0 | No INC-15B source edition |
| Department of Transportation | 9 | 0 | No INC-15B source edition |
| Department of Energy | 1 | 0 | No INC-15B source edition |
| Department of Education | 1 | 4 | No INC-15B source edition |
| Department of Veterans Affairs | 0 | 0 | Recorded prior edition (unqualified) |
| Department of Homeland Security | 0 | 0 | No INC-15B source edition |

The 2026 `INC-15B` pilot registered 5 publisher source cohorts and 10 unregistered in **that earlier inventory**. Later source research (including DHS, Education, HHS, VA, DoD and DOJ) has added additional dated material. The new model carries explicit `supplemental_research_model_paths` but does not collapse overlapping editions or treat them as a legally certified present-day ADL-1 roster.

Every department receives:
- Existing immutable canonical `ORG-FED-EXE-DEP-*` identity and 2025 GovMan source parent key.
- A bounded list of immediate publisher source keys and the count of deeper descendants.
- The original INC-15B source cohort pointer (where previously recorded) and pointers to separately dated research editions.
- A qualifying evidence gap or explicitly unreviewed source-only candidate classification.
- `current_legal_first_level_denominator: null`, `complete_current_first_level_roster_qualified: false`, `atlas_admitted: false`.

For a true present-day ADL-1 qualification, acquire and compare official **original organizational source**, identify legally constituted offices and their effective periods, reconcile duplicates/reorganizations/successors, document control vs supervision vs administrative placement vs delegated power, and obtain independent review appropriate to the assertion. Military command, Inspector General independence, Article I administrative bodies, and judicial appellate review require separate legal semantics.

## Jurisdictional scope

The independent State model supplies **50 member-State jurisdiction IDs** and **19 previously modeled State institutions across Virginia (13) and Nebraska (6)**. The remaining 48 State institutional inventories are explicitly unresolved. The District of Columbia retains its separately modeled `JUR-US-DC-NONSTATE` comparator and is not the fifty-first State. Tribal nations, territories, local governments and intergovernmental bodies are recorded as **ontology category coverage gaps**, without fabricating named government IDs or a presumed uniform legal status. In particular, State institutions are never nested beneath the federal executive branch.

### Typed relationship interpretation samples (references only)

| Existing source relationship | Scope and what must **not** be inferred |
| --- | --- |
| `REL-FED-0090` | Congressional oversight of the President is not a direct managerial reporting or military-command relationship |
| `REL-FED-0096` | Appellate review of district courts is subject to jurisdiction, not administrative command |
| `STATE-FED-LINK-0001` | Virginia's Tenth Amendment federalism context is not an executive agency power of delegation |
| `STATE-FED-LINK-0005` | Nebraska's Tenth Amendment context remains separately qualified and does not make the State a federal department |

Each record preserves original direction, endpoints, source IDs and review state. None produces a new legal conclusion or new public Atlas edge.

## Model files and publication controls

Six closed, edition-scoped files under `model/wholegov/`: `inc17b-institution-anchors.json`, `inc17b-publisher-observations.json`, `inc17b-department-breadth.json`, `inc17b-jurisdiction-coverage.json`, `inc17b-relationship-boundaries.json`, `inc17b-coverage-ledger.json`.

The independent JSON Schema is `schemas/inc17b-census.schema.json`. The validator `scripts/inc17b-census-core.mjs` and adversarial tests `tests/inc17b-census.test.mjs` check unchanged canonical references, exact source SHA-256 and Git blob receipt, 231 original observations, unchanged 50/88/93 accounting, 15 Cabinet source-root mappings, publisher hierarchy, 50 State identities, 19 pilot institutions, and immutable cross-branch/jurisdiction relationship references. Tests explicitly reject legal/currentness inflation, invented organization and administrative commands, missingness inflation, and public graph admission.

The federal publisher manifest only **declares** these six new research families. A file becoming syntactically safe or manifest-declared is **not** authorization for `afri-website` to import it into the public Atlas. An independently source-qualified, separately versioned website adapter is required.

## Next verified breadth and depth increments

1. **INC-17B.2 — targeted ADL-1 legal/research qualification:** work across all 15 department roots, prioritize evidence gaps and edition conflicts, separately resolve genuine legal first-level membership from observed publisher names. Maintain a disjoint denominator for each official source edition and jurisdiction.
2. **INC-17B.3 — cross-branch/independent census:** reconcile EOP, Congress/chambers and support institutions, independent bodies/corporate variants and individual judicial structures without implied executive parentage or fabricated court totals.
3. **INC-17B.4 — federated jurisdiction expansion:** extend State pilots and define lawful evidence acquisition for local, tribal, territorial and D.C. institutional models. No assumption that all use the same constitutional architecture.
4. **INC-17C — public-value trace:** one disaster-assistance service chain, preserving source-based legal authority, service implementation, population eligibility and independently measured outcomes.
5. **INC-17D — viewpoint admission:** preserve canonical identity and source-era navigation across hierarchy, authority, capability, oversight, finance, federalism and citizens. The researcher may browse unadmitted evidence as *gaps* only, never as certified edges.

**Completion accounting:** neither a current whole-of-government organization denominator, a current first-level denominator, nor a government-wide ADL-1 completion percentage is known. In the absence of those denominators, report exactly what is sourced and what remains unresolved, rather than a fabricated percentage.
