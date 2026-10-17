# Federal Cabinet Department Structural Evidence — Increment 04

**ARFI-COA v0.1.0 · Research snapshot October 16, 2026 · Source-bounded and unratified.**

## Architectural and legal boundary

This increment is **stacked on open draft PR #20**, not yet merged into `main`. PR #19 remains a separate DoD source/statutory research branch. The original 61 canonical `ORG-FED-*` identities, 24 nonpilot Cabinet department research candidates, and original census identifiers are preserved. New `DEPT04-*` IDs are *source-granule pointers and historical directory entries*, not new statutory federal entities or duplicate canonical organizational records. Eight entries link back to the corresponding PR #20 selected candidate IDs.

ARFI models **dated organization-source evidence**, not a claim of complete present-day Department of Justice, Treasury, Veterans Affairs, Commerce, or other federal organization hierarchies. An official webpage section with a countable list is a bounded source-group denominator. It cannot be used as the complete legally constituted first-level institution denominator.

The **2025 U.S. Government Manual is a dated publication**, with a distinct official GovInfo granule for each of the 12 remaining Cabinet departments. Its descriptive organizational entries are not authority, appropriations, operational command, or proof that constituent organizations were unchanged by October 2026.

## Twelve directly attributable official Government Manual department granules

| Existing canonical federal department | GOVMAN 2025 granule |
|---|---|
| Agriculture | [322](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-322) |
| Commerce | [113](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-113) |
| Energy | [116](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-116) |
| Health and Human Services | [117](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-117) |
| Housing and Urban Development | [119](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-119) |
| Justice | [121](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-121) |
| Labor | [323](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-323) |
| State | [123](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-123) |
| Transportation | [124](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-124) |
| Veterans Affairs | [126](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-126) |
| Interior | [120](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-120) |
| Treasury | [125](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-125) |

The original 24 source-candidate names are also reconciled without replacing their stable IDs: **13 have individually checked official Government Manual granule detail locators, 2 appear in the edition navigation but lack reconciled individual IDs, and 9 are explicitly unreconciled**. This status describes publication-locator research, not a definitive judgment that a unit does or does not exist.

## Four bounded organizational source group extractions

| Department | Original publication/official webpage | Exactly captured items | What can be inferred |
|---|---|---:|---|
| Justice | [Official organizational chart text](https://www.justice.gov/agencies/organizational-chart-text-version), signed February 17, 2026; webpage updated April 29, 2026 | 36 | Attorney General; Deputy Attorney General; 24 chart-connected roles/units below Deputy (including the Associate); 10 chart-connected roles/units below Associate. Chart connection is not legal delegation. |
| Veterans Affairs | [VA Administrations and Offices](https://department.va.gov/administrations-and-offices/), updated February 25, 2026 | 22 | Three Administrations and 19 separately listed Staff Offices. The Board of Veterans' Appeals and OIG retain separate legal-class review. |
| Treasury | [Bureaus page](https://home.treasury.gov/about/bureaus/) main content | 9 | Nine names from the primary page's body headings, not the navigation sidebar or every Treasury office. The IG and TIGTA are not interchangeable with operational bureaus. |
| Commerce | [Bureaus and offices](https://www.commerce.gov/bureaus-and-offices) “Bureaus” section | 13 | Eleven listed bureau/administration/service organizations and two leadership offices (OS, OUS/EA) appearing in the bureau section. This website category is not a statutory legal-subtype classification. |
| **Total** | **Four source-page sections** | **80** | **Zero department-wide ADL-1 completion claims** |

Each entry retains a named source section, source-edition context, identity label, canonical department link, provisional structural class, prior ARFI candidate reference when applicable, and a typed descriptive graph edge. Inspector General entries cannot accidentally become generalized command authority through their visual placement.

## Source integrity and unresolved epistemic limits

The 2025 Manual **GovInfo granule metadata and official titles** were individually checked for each of the twelve department roots and thirteen selected candidates. However, original XML, PDF or complete web-response bytes have **not been copied into a locally hash-verified source archive**. Their `raw_source_sha256` fields remain `null`. The 2026 official organization and directory webpages are mutable; recorded update/signature dates reflect the publisher's own statements and have not been converted into immutable publication assertions.

The 36-node DOJ chart describes a dated signed organization diagram, **not proof of individually signed statutory delegations, present organization, or legality of direct executive control over each listed office**. Specifically, DOJ and VA Inspector General placements are descriptive only. Treasury's main body contains nine entries, while other navigation items may exist; the body-only denominator does not prove all Treasury entities. Commerce deliberately distinguishes `OS` and `OUS/EA` from statutory bureaus.

**No source implies: departmental reorganization, presidential legal power, military command, judicial jurisdiction, agency independence, appropriations, program authority, personnel incumbency, endorsed policy, website deployment, or ADL-1 certification.**

## Data, projection and regression contract

Nine self-contained and manifest-registered model families under `model/federal/department-structure/`: `source-registry`, `govman-roots`, `candidate-granules`, `source-snapshots`, `units`, `relationships`, `coverage-ledger`, `viewpoints`, `gaps`.

Strict JSON Schema 2020-12: `schemas/federal-department-structure.schema.json`. Semantic validation is fail-closed: `scripts/federal-department-structure-core.mjs`; independent CLI: `scripts/validate-federal-department-structure.mjs`.

```sh
node scripts/validate-federal-department-structure.mjs --validate
node scripts/validate-federal-department-structure.mjs --view VIEW-DEPT04-GOVMAN-12
node scripts/validate-federal-department-structure.mjs --view VIEW-DEPT04-JUSTICE
node scripts/validate-federal-department-structure.mjs --view VIEW-DEPT04-VA
node scripts/validate-federal-department-structure.mjs --view VIEW-DEPT04-TREASURY
node scripts/validate-federal-department-structure.mjs --view VIEW-DEPT04-COMMERCE
node scripts/validate-federal-department-structure-schema.mjs
node --test tests/federal-department-structure.test.mjs
```

Negative regressions block changed official granule IDs, source substitutions, fabricated original source hashes, read-only view promotion, invented legal powers and fiscal authorities, ADL-1 advancement, DoJ branch reassignment and IG reclassification.

## Next bounded increments

1. **04B:** Source-document byte capture (GovInfo XML, signed official organizational chart, 2026 mutable webpages) with secure source pins, content SHA-256 and source/version change journal.
2. **04C:** Reconcile complete **defined first-level organizational** rosters for Treasury, Justice, HHS and VA against each department's official current charts, explicit predecessor/successor events, statute/charter references, and dated independent review.
3. **04D:** Apply the reconciled pattern to other eight departments (State, Interior, Agriculture, Commerce, Labor, HUD, Transportation, Energy).
4. **05+:** EOP and nondepartment agency legal organizational forms; separate branch-specific Congress/court inventories; then legal delegations, appropriations, fiscal programs and operational activity.

**Human legal/institutional signoff is not complete, and no ADL-1 certification or production website release is authorized in this increment.**
