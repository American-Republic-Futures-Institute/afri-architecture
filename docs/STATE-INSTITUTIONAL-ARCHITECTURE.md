# Independent State Institutional Architecture — State Sovereignty, Legal Authority, and Constitutional Boundaries

**ARFI-COA v0.1.0 | 2026-10-16 | Research model; selected original text pending qualified legal review.**

## Scope and completion boundary

The original U.S. Constitution, the 27 ratified amendments, and the federal judicial-precedent register do **not** describe the internal organizational structure, constitutional powers and law-enforcement agencies of individual States. That requires **separate State constitutions and State statutory enabling authorities**.

This increment creates:
- **50 uniquely named member-State jurisdictions**, identified with U.S. Census/ANSI two-character USPS abbreviations and two-digit FIPS codes.
- **One explicitly non-State federal-district comparator: the District of Columbia**, FIPS 11. It is not numbered as a 51st member State and receives no State organizational tree or reserved-power link.
- **Two bounded institutional pilot slices**: Virginia and Nebraska, each with their own published original State constitution, three separately identified State branches, State-specific constitutional sections, source-indexed institutional roles, and State-specific legal constraints.
- **Forty-eight unmodeled State organizational trees**: the jurisdictions are known but no invented office, legislative chamber, constitutional article, local-government structure or delegated agency authority is associated with them.

This is the first State institutional **modeling foundation**, not an exhaustive inventory of U.S. State/local offices, tribal institutions, territories, or substantive State statutory law. All State model records have stable identifiers and primary-source provenance; summaries remain reviewed-source *candidates*, not binding legal opinions.

## Source and authority hierarchy

Do not conflate the following four legal layers:

1. **Original State constitutional text**: Sections of a State's independently enacted State Constitution. ID prefix `STATE-PROV-*`; the State citation belongs to the relevant State, not to the U.S. Constitution.
2. **State institutional structure and textual norms**: Evidence-linked State organizations, branches and bounded explanations (`BR-STATE-*`, `ORG-STATE-*`, `NORM-STATE-*`). An organization being shown under a State-government grouping does not alone prove an agency-specific delegation.
3. **Superior and parallel federal constitutional constraints**: Cross-jurisdiction `STATE-FED-LINK-*` pointers to authentic U.S. constitutional sources (Article IV, Article VI, Amendments X and XIV). These are typed legal constraints and relationships **not parent-child organizational edges**.
4. **Source-cited judicial interpretation**: A separate `STATE-JUD-LINK-*` link connects an original State provision to the existing federal judicial **case AND issue-specific holding**. A summary without legal citator review is never automatically current controlling law. State and federal enabling statutes follow in a later increment.

**Authority chain for future ARFI reform traceability:**

    State jurisdiction
      -> Original State constitution and provision (source ID and citation)
      -> State textual norm / procedural condition
      -> State branch / institution / constitutional actor
      -> Functional or institutional relation (never inferred federal command)
      -> US Constitution federalism/rights overlay
      -> Judicial holding + verified subsequent treatment (as applicable)
      -> State enabling statute / agency delegation (NOT YET MODELED)
      -> Local program or capability (NOT YET AUTHORIZED BY THIS INCREMENT)

The U.S. Constitution's Supremacy Clause concerns the Constitution, treaties and **federal laws made in pursuance of the Constitution**. It does **not** transform a governor or State judge into a subordinate federal employee or convert broad federal policy into unconditional State agency authority. The Tenth Amendment is reservation context, not an independently enumerated unlimited State institutional power.

Primary U.S. references:
- [Census Bureau — ANSI/FIPS State identifiers](https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html).
- [National Archives — original U.S. Constitution](https://www.archives.gov/founding-docs/constitution-transcript).
- [National Archives — Bill of Rights, including Amendment X](https://www.archives.gov/founding-docs/bill-of-rights-transcript).
- [National Archives — Amendments XI–XXVII, including Amendment XIV](https://www.archives.gov/founding-docs/amendments-11-27).

## Virginia: separate constitutional structure

Primary State source: [Constitution of Virginia, full current published text](https://law.lis.virginia.gov/constitutionfull/), particularly Articles I–VII. The [Virginia Court System](https://www.courts.state.va.us/) provides supporting operational descriptions but does **not** independently enact the subordinate courts' statutory powers.

| Source section | Institutional/norm mapping | Important restriction |
|---|---|---|
| Va. Const. art. III, §1 | Distinct Virginia legislative, executive and judicial branches | Administrative agencies may be created and judicially reviewed under law; do not infer federal executive hierarchy |
| Art. IV, §1 | Bicameral **Virginia General Assembly**, Senate and House of Delegates | The Virginia legislature is not the U.S. Congress |
| Art. IV, §11 | State legislative enactment procedure | Executive consideration and legislative overrides follow State law |
| Art. V, §1 | Governor of Virginia | No immediately consecutive Governor term; this is not a universal State or federal rule |
| Art. V, §9 | State administrative organization | Functions and duties require law; does not automatically authorize every State department |
| Art. V, §§14–16 | Lieutenant Governor, Attorney General, Governor succession | Lieutenant Governor presides over the Senate despite belonging to a separately identified executive office; Attorney General's duties require law |
| Art. VI, §1 | Supreme Court of Virginia, lawfully constituted lower courts | Court of Appeals/circuit/district court class descriptions require separate enabling statutes and rules for individual authorities; only the top State Supreme Court is directly named in §1 |
| Art. II, §4 | State election administration | Limited by State election provisions and U.S. constitutional voting protections |
| Art. II, §6-A | Virginia Redistricting Commission; General Assembly; conditional State Supreme Court fallback | Judicial district drawing applies only when constitutionally specified process/deadline failures occur, not as a standing legislative function of the State judiciary |
| Art. VII, §§2,5 | County, **independent city**, town and regional government classes; elected local governing bodies | State constitutional and enacted law structure local power; no U.S. federal-agency parent edge |
| Art. I, §11 | State rights, due process and State anti-discrimination limits | These are distinct from, and may be supplemented by, U.S. constitutional protections |

**Special original-text / later-interpretation example:** Virginia still publishes **Article I §15-A**, containing a restrictive marriage provision. A distinct, *research-only* link points to *Obergefell v. Hodges*, 576 U.S. 644 (2015), and its specific State civil-marriage licensing/recognition holding (already in `model/judicial/holdings.json`). The original State text is preserved for historical/legal traceability; its discriminatory restriction is **never modeled as an active State government enforcement power**. The legal-effect field remains expressly subject to human review of federal supremacy, the opinion itself and subsequent treatment. This is not a claim that every question involving State marriage rules has been judicially settled.

The Virginia architecture distinguishes constitutional office *existence* from statutory *delegation*. Example: constitutional election of an Attorney General does not, standing alone, evidence each law-enforcement or investigatory function performed by that office.

## Nebraska: test against a non-bicameral State architecture

Nebraska is **not** fitted into the Virginia/Federal two-chamber legislative template. The State Legislature's own current original law specifies:
- [Neb. Const. art. II, §1](https://nebraskalegislature.gov/laws/articles.php?article=II-1): distinct legislative, executive and judicial departments, with limited express exception for supervision of people on probation/parole or in identified court programs.
- [Neb. Const. art. III, §1](https://nebraskalegislature.gov/laws/articles.php?article=III-1): legislative power vested in **one chamber**, plus direct popular constitutional **initiative and referendum** powers reserved to the people. The direct democratic powers are **not** recast as unlimited delegation to the Legislature.
- [Neb. Const. art. IV, §1](https://nebraskalegislature.gov/laws/articles.php?article=IV-1): Governor and distinct elected executive offices, terms, confirmation and department-head appointment conditions.
- [Neb. Const. art. V, §1](https://nebraskalegislature.gov/laws/articles.php?article=V-1): State Supreme Court, appellate court, district courts, county courts, and the Chief Justice's bounded State court administrative authority.

The national [NCSL State Legislative Composition report](https://www.ncsl.org/about-state-legislatures/state-partisan-composition) independently verifies the exceptional unicameral form among the **99 legislative chambers** of the 50 States.

## Canonical publication register

| Model file (under `model/state/`) | Count | Responsibility |
|---|---:|---|
| `jurisdictions.json` | 50 | Census/USPS/FIPS member-State identity, with 48 deliberately unmodeled institutions |
| `nonstate-comparators.json` | 1 | D.C. comparison, **not** member-State or Tenth Amendment State institution |
| `sources.json` | 17 | National Archives, Census, original VA/NE State law, official Virginia court description, NCSL |
| `constitutions.json` | 2 | Identifiable independent State constitutions: Virginia and Nebraska |
| `provisions.json` | 19 | Exactly cited State constitutional sections; not invented U.S. constitutional clauses |
| `norms.json` | 24 | Limited section-specific State textual norms, restrictions and procedural candidates |
| `actors.json` | 2 | State people's rights and reserved popular power classes |
| `branches.json` | 6 | Three separate State branches for each pilot; neither belongs to federal administrative graph |
| `institutions.json` | 19 | Concrete/aggregate offices, chambers, courts, commissions and local-government classes |
| `relationships.json` | 17 | Source-bound function and institutional norms, including redistricting and direct democracy |
| `federalism-links.json` | 8 | Typed Article IV/VI and Amendment X/XIV overlays, no parent-child federal control |
| `judicial-links.json` | 1 | Original Virginia State constitutional text vs specific Court case+holding, pending citator review |
| `viewpoints.json` | 6 | Declarative, **not yet implemented**, State/publication and legal-crosswalk views |

The canonical `model/federal/manifest.json` advertises each State collection under `state_institutional_extension` but retains a federal **baseline** identity. The website will not render State viewpoints until it implements a separate, model-family-aware State projector. The current website API can safely recognize unknown/new model families without taking down its existing federal/constitutional views. **Do not publish fake State graph diagrams by reinterpreting original federal relations.**

## Quality gates

    node scripts/validate-state.mjs
    node --test tests/state.test.mjs

The **50 dedicated regression tests** include deliberate bad mutations to Census/FIPS codes, an invented 51st State, executive offices put in the wrong State branch, Nebraska given a fictitious second legislative chamber, unsupported State statutory delegation, a false U.S. Supreme Court parent for Virginia courts, State-to-State cross-jurisdiction power links, invalid U.S. constitutional pointers, erased Nebraska popular initiative, destroyed redistricting conditions, and State published text improperly treated as enforceable notwithstanding distinct federal judicial precedent.

The portable [State JSON Schema](../schemas/state-institutional.schema.json) restricts all 13 object collections. The *semantic* CLI performs whole-catalog cross-reference and political-legal boundary checks. CI retains every earlier U.S. constitutional, amendment, federalism and judicial regression gate.

## Next architecture increments

1. **State enabling authority chains:** authority in State legislature/constitution → enacted State Code section → official State department/board/court → lawful delegated responsibility → State capability → funding and administrative action, including effective dates, repeal and court limits.
2. **Full 50-State institutional research:** source each State's actual constitutional vesting, governor, constitutional offices, legislative chambers (respecting differences), judicial court structure, State agencies and local home-rule/delegation restrictions. Track verified coverage separately from identity-only States.
3. **State and lower-federal precedent:** independently cite State appellate holdings and federal constitutional decisions affecting State institutions; verify controlling opinion parts and later-treatment status before promoting model boundaries to adjudicated law.
4. **District/territory/tribal models:** D.C., territories and sovereign tribal governments require independent legal ontologies and should not be implied to be U.S. member States.
5. **Public State Atlas rendering:** separate browser projector, source and authority inspector, immutable-commit review IDs and accessible text-table alternatives owned by the website repository.

This architecture is descriptive research. It is not adopted Institute policy, a judicial determination, an enforceable interpretation of State law, or a substitute for qualified review of State constitutions and statutes.
