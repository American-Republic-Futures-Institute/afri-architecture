# INC-13B1 — DoD first-level source reconciliation (research only)

**Depends on:** INC-13A PR #39. **Research observation:** 2026-10-19. **Status:** source-bounded, unratified, no ADL-1 certification.

## Objective
Reconcile already canonical DoD Title 10 composition classes, public service/command names and dated GAO Defense Agency/Field Activity source observations. This is a **source-slice reconciliation**, not an authenticated current DoD structure, validated operational command chain, individual delegation or whole-department first-level denominator.

## Separate source-denominator scopes
| Source slice | Source date/edition | Bounded entries | Limitation |
|---|---|---:|---|
| 10 U.S.C. §111(b) composition | Selected 2026-10-07 codification | 11 statutory classes | Residual classes are open, not counted operating units |
| GAO-26-107781 Figure 1 | May 2026 organizational snapshot; published Sep 2026 | 19 Defense Agencies and 8 Field Activities | Not an October verified roster or signed supervision |
| Defense.gov combatant command public page | Observed Oct 16 2026 | 11 public command names | Not Unified Command Plan or assigned-forces evidence |
| Selected armed-services statutory boundaries | Selected Oct 7 2026 codification | 6 service records | Coast Guard service status and transfers are conditional; none is an additional military department |

Counts are not additive; source families overlap conceptually. No current official first-level DoD population denominator is known.

## Source distinctions
- **Statutory composition**: 10 U.S.C. §111 identifies constituent categories; §113 supplies selected Secretary authorities subject to limitations.
- **Civilian offices / OSD**: existing `model/federal/dod/offices.json` separates offices and individual appointments. `parent_id` is catalog placement, not signed delegation.
- **Military departments versus armed services**: Army, Navy and Air Force departments are distinct from their military services; Marine Corps and Space Force are not separate military departments.
- **JCS and Joint Staff**: advisory and staff entities are not assumed to exercise operational command.
- **Combatant commands**: 10 U.S.C. §§161–164 establish conditional command architecture, but directory membership proves neither current UCP assignment nor specific force transfers.
- **Defense agencies and field activities**: a GAO figure is publisher-dated evidence, not signed charter, legal supervisory relationship or a current organizational census.
- **Inspector General**: inspect as a statutory independent oversight function, not ordinary operational command.
- **Officeholders**: no personally identified occupant, active appointment, signed instruction, or private information is asserted.

## Evidence assurance and temporal handling
Retain exact existing canonical IDs and original source IDs. Preserve source edition, publisher date, observation date and legal effective period independently. Existing source URLs do not imply independently retained original bytes or WORM custody. Distinguish source complete-within-page from institutional complete-within-department. Keep INC-13A's nine gates, including independent human review and evidence custody, unmet.

## Required validation
`node scripts/validate-inc13b1.mjs` and `node --test tests/inc13b1.test.mjs` validate source sets, fixed scope denominators, original ID reuse and fail-closed legal nonpromotion. CI additions must run at the final reviewed PR head. No institutional certification results from the unit tests.

## Following increments
INC-13B2 reconciles DOJ dated first-level chart structures; INC-13B3 reconciles VA statutory/directory/historical exceptions. Both should reuse INC-13A qualification semantics. A separate Atlas publication PR must use an immutable merged architecture SHA.

## Record-level source and identity reconciliation
The model now contains **55 one-to-one source-observation crosswalks** keyed to original canonical DoD source records. Each crosswalk preserves the original record ID, its source collection, exact publisher snapshot ID, source ID set, classified relationship (statutory composition, GAO-described placement, public command-name listing, or statutory service placement), observed parent reference and source observation date. Reported GAO supervisory-role *labels* remain descriptors rather than verified present-day administrative control or signed delegation.

Seventeen existing military/civilian office-role IDs—including Secretary of Defense, Chairman of the Joint Chiefs, a combatant commander *role class*, and Inspector General—are exposed as a **separate associated-role index**, not 17 additional first-level institution records. The Inspector General remains an independent statutory oversight office; the Chairman is not represented as exercising operational command. The Coast Guard is an external DHS-service comparison with conditional transfer provisions, not an additional peacetime DoD component.

Validators deterministically join **all 55** crosswalks back to unchanged original records and validate source-family membership, cohort dates, reported parent/classification, GAO 19/8 distribution, the distinct IG and JCS roles, the Coast Guard exception and explicit absence of verified original-byte custody, effective legal interval, signed delegation, operational command or positive ADL-1 determinations. They reject added, missing, duplicated, reparented, cross-edition or falsely certified entries.
