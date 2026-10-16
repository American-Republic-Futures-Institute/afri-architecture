# Federal Statutory Enabling Authority — Department of Homeland Security and Education Pilots

**ARFI-COA v0.1.0 | 2026-10-16 | Primary U.S. Code research snapshot; awaiting legal review**

## Why codified law follows Constitutional authority

The Constitution (principally the powers of Congress to enact laws and the executive structure) is **not** a standalone warrant for every Cabinet department or agency action. Actual institutions and bounded authorities must be demonstrated from enacted laws and their effective versions, executive delegations and other applicable legal constraints. Constitutional context is kept as its own reference family; citations to Article I/II **do not themselves establish the statutory department**.

Model chain:

```text
Federal Constitution (allocation/context)
 → Congress lawmaking institution
 → enacted Public Laws and current U.S. Code codifications (distinct)
 → DHS or Education department
 → section-specific establishment/mission/Secretary transfer/delegation rule
 → affirmative conditions + restrictions + temporal status
 → functional FEAF candidate alignment
 → unverified appropriation/program-specific delegation/legal-effect review
```

## DHS (Homeland Security Act, as amended)

Official codification sources as of Oct 7, 2026:

- [6 U.S.C. § 111](https://uscode.house.gov/us/usc/119-118/t6/s111/) establishes the Department; sets a counterterrorism/emergency coordination mission; expressly protects nonsecurity functions (subsection (b)(1)(E)), economic security (F), civil rights and civil liberties (G), and the investigative/prosecutorial primacy of law-enforcement agencies with jurisdiction (b)(2), subject to specific statutory exceptions.
- [6 U.S.C. § 112](https://uscode.house.gov/us/usc/119-118/t6/s112/) creates the Senate-confirmed Secretary, provides internal direction, and permits **conditional** delegation, not transfer of unlimited governmental powers or new authority over State institutions.

**Critical distinction:** § 111(b) mission text is not an independent program-specific surveillance power, prosecutorial jurisdiction, or an appropriation. Individual component delegations and powers must be separately sourced.

## Department of Education (Department of Education Organization Act / GEPA)

- [20 U.S.C. § 3411](https://uscode.house.gov/us/usc/119-118/t20/s3411/) establishes the Department and the Senate-confirmed Secretary.
- [20 U.S.C. § 3471(a)](https://uscode.house.gov/us/usc/119-118/t20/s3471/) permits exercise of available legal authorities for lawfully transferred functions, not a new universal national education power.
- [20 U.S.C. § 3403(a), (b)](https://uscode.house.gov/us/usc/119-118/t20/s3403/) protect State and local roles and limit federal education policy control; **except to the extent authorized by law** must be faithfully preserved.
- [20 U.S.C. § 1232a](https://uscode.house.gov/us/usc/119-118/t20/s1232a/) in the distinct General Education Provisions Act limits what an applicable federal education program may be construed to authorize concerning curricula, instruction, administration, staff and educational materials.
- The time-limited original 20 U.S.C. § 3403(c) funding-transition provision **expired**; it is not a contemporary agency veto or continuous prohibition.

These are statutory legal boundaries distinct from philosophical views of education and from the Institute's proposed future policies. Operational education programs require their own substantive authorizing law and funding review.

## Data and quality gates

Eight new collection families under `model/federal/statutory-*.json` provide original primary-source registry, three **separate code groups**, six named codified sections, six bounded department authority records, twelve explicit legal limitations (one historically expired), two functional capability links, two complete *model chains*, and two **declarative** publication views.

A model chain means the *selected links are present*, not that every DHS/ED power has been researched. Each trace says `appropriation_verified=false`, `program_implementation_authorized=false`, `citator_review_complete=false`, and `full_department_powers_inventoried=false`. Future implementation dossiers must fill missing program authority, delegation documents, appropriations, agency rules, judicial doctrines and outcome evidence.

Source-of-truth: `afri-architecture`. The website uses an immutable SHA and provides the source inspector, independently versioned comments, review notices, and optional publication releases. **No State government becomes a federal subdivision.** The website renderer is outside this repository and is *not* modified by these files.

## Reproducible gates

```sh
node scripts/validate.mjs
node scripts/validate-constitution.mjs
node scripts/validate-federal-statutes.mjs
node --test tests/federal-statutes.test.mjs
```
