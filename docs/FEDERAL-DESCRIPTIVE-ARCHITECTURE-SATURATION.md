# ARFI federal descriptive architecture — saturation sequence

**Architecture boundary:** Describe actual United States federal institutions, offices, people-in-positions only when verifiable, missions/functions, organizational relationships, authorities as source anchors, operational interfaces, and longitudinal changes. Keep detailed **policy content, policy interpretation and policy recommendations** outside this program, in a distinct future model family.

## Five independently governed dimensions

| Dimension | Stable research question | Source-backed artifact | Invalid shortcut |
| --- | --- | --- | --- |
| Jurisdiction and institutional identity | Which federal body or office is this, during which dates, and what is its original legal/organizational source? | Canonical IDs and separately pinned publisher aliases, dates and historical transitions | Confuse an organization directory name, publication ID or current staffing with certified legal identity |
| Organizational structure | How do departments, components, offices, boards, councils and accountable positions relate? | Typed parent/composition, leadership, administrative, military, independent-oversight and adjudicative relationships | Treat a chart's indentation as a chain of command or OIG subordination |
| Missions, functions and capabilities | Which official missions/functions does each institution describe, perform, support or coordinate? | Versioned Government Manual/department mission narrative extracts, provenance, candidate FEAF-family crosswalk | Manufacture actual authority or exclusive responsibility from a mission similarity |
| Cross-government interfaces | Which duties are complementary, concurrent, supported by shared services, overseen, co-executed or intergovernmental? | Typed interfaces with direction, date, source, jurisdiction, unresolved overlap and source confidence | Assert interagency command, funding, information sharing or memorandum existence without evidence |
| Provenance, time and saturation | Which publisher populations/editions were actually acquired, parsed, crosswalked and reviewed? | Original bytes and SHA-256 when held; immutable Git source snapshots; non-additive coverage and outstanding population denominators | Add different editions or elevate a sample to a complete current government denominator |

## Source acquisition order

1. **Whole-of-federal-government identity breadth.** The Office of the Federal Register's [2025 U.S. Government Manual](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31) provides a free official starting source spanning Congress, judiciary, Executive Office, Cabinet and independent bodies. Use its granular XML and source hierarchy as *publication evidence*, not a permanent agency identity registry. Also inventory the latest edition on each renewal.
2. **Departmental first-level structures.** For each of the 15 Cabinet departments, acquire official organization charts and live department office indexes with source date, original captured bytes, published scope and explicit exceptions. Keep federal branches and sovereign State/tribal/local governments distinct.
3. **Subdepartmental office depth.** Descend office by office where independently published indexes and statutory or official organizational descriptions support the structure. Keep titles and people separate from durable organizational units.
4. **Outside-Cabinet and branches.** Reconcile EOP, independent agencies, government corporations, legislative support, courts and adjudicative boards using their original official pages, GAO descriptions, OLRC/USC structural references and dated source registers. Court jurisdiction is not managerial command.
5. **Mission and interagency crosswalks.** Align mission/function extracts from agency strategic plans, the Government Manual and official interagency governance/partnership sources to canonical institutions. Explicitly distinguish mission overlap, parallel oversight, cooperation and signed delegation; never infer edges from semantic similarity alone.

## Saturation state model

Each source population must separately report:

- `identified`: publisher URL/publication identifier known.
- `acquired`: original publisher bytes and SHA-256 actually retained and replayable, or documented lack of byte custody.
- `extracted`: a bounded page/figure/edition parsed with every source element and residual recorded.
- `crosswalked`: source IDs reconciled to prior canonical IDs or left expressly unresolved.
- `reviewed`: independent human source/legal classifications qualified to the scope claimed.
- `published`: admitted to the public architecture under conservative graph/source-boundary rules.

A source may be publishable as unratified research without full legal qualification, but it must not be called an exhaustive/current government directory. Track coverage per *publisher population* and edition, with numerators/denominators `null` where unknown; no overall completeness percentage may be calculated from the number of JSON files or selected records.

## Required source/relationship types

Required institutional variants include federal branch, Cabinet department, independent body, military department/service, combatant command, component or bureau, office/board/council/commission, position, committee, court, judicial-support body, and external sovereign/jurisdiction boundary.

Relationship types should preserve the distinctions `statutory_composition`, `published_directory_placement_only`, `administrative_supervision`, `military_command_statutory_default`, `delegation_only_with_authored_instrument`, `independent_oversight`, `adjudicative_jurisdiction`, `reports_mission_function`, `coordinates_with`, `shares_operational_service_with`, `mission_responsibility_overlap`, `cross_branch_role`, `federalism_interface`, and `historical_succession`. Existing type contracts remain authoritative; add new graph types only when reconciled to those existing types and accompanied by source-epoch review.

**Source rule:** a mission narrative may justify a candidate responsibility edge, but a stronger operation, delegation, legal duty or execution claim requires the corresponding separate evidence. Unlike stable institutional source descriptions, detailed policy instruments and their effective windows will be authored in a later policy family and must not be silently added to this census.

## Next bounded delivery

Immediate source breadth: [INC-15C.3 HHS #54](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/54), keeping separate publisher index vs Government Manual XML editions and distinguishing 28 prior research names, the additional observed ARPA-H name, non-institutional leadership labels and original custody. Then qualify HHS originals and start Education, followed by the remaining Cabinet gaps. In parallel design a **federal mission-and-interface metamodel** as a later bounded architecture PR, without adding policies or website features.

Maintain exact-head source, schema and legal-nonpromotion regression validation for every source cohort. CI/workflow logs or a local evidence manifest must accompany each accepted merge.
