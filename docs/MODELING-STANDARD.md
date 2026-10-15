# ARFI-COA v0.1.0 — Modeling Standard

## Governing semantics

This repository represents a **descriptive institutional baseline** of the United States federal government, **not** a design to replace it. ARFI's overall architecture follows L0 principles/rights, L1 institutions/authorities, L2 outcomes, L3 capabilities, and L4 reform implementation. This increment populates primarily L1 and an initial L3 vocabulary. The L0 and L2 charter registers remain in the Plan until imported, reconciled and formally reviewed. No implicit legal linkage to a proposed principle is permitted.

| Element type | Identifier | Semantics |
|---|---|---|
| Branch | `BR-FED-*` | Constitutional branch grouping; not a management superior over all offices |
| Institution | `ORG-FED-*` | Real office, department, agency, service or aggregate institutional group |
| Authority | `AUTH-US-*` | Identified primary legal authority; limited to documented text |
| Capability | `CAP-FED-##` | ARFI descriptive function that may be performed by multiple actors |
| Relationship | `REL-FED-####` | Directed, typed claim between stable identifiers |
| Source | `SRC-*` | Public provenance with URL and access date |
| Viewpoint | `VIEW-FED-*` | Declarative subset of canonical models; never a duplicate fact source |

`parent_id` denotes **catalog containment or taxonomic grouping only**, not delegation, command, constitutional superiority, or a judicial appeal. Prefer typed edges for meaningful legal or functional relationships. Branches are mutually distinct, but actors can perform functions in another branch (e.g., Vice President as President of Senate). `status: observed` labels sourced institutional descriptions, not conclusive legal advice. `descriptive_candidate` marks early capability/viewpoint classification.

## Change management

New elements require stable IDs, concise neutral mission summaries, jurisdiction/branch classification, source IDs, and explicit limitations where a statement is legally nuanced. Name changes preserve IDs with a documented alias; genuine institutional replacement requires supersession. Versioned snapshots and PR review are mandatory for publication. No model record may assert that simulations, plans or published commentary grant government authority.

## Modeling practices

1. Maintain **canonical records, not diagram-specific copies**. Website layouts belong in `afri-website`.
2. Link mission summaries to primary government material, keeping interpretations separate from quoted legal text.
3. Verify **agency-specific enabling statutes** before adding formal `exercises_power_under` edges to a department.
4. Treat judicial appeals, Congressional oversight and Cabinet advice as **typed relations**, never `parent_id` command chains.
5. Preserve independent federal entities' legal distinctions from presidential executive departments.
6. Reference only accurate, current legal names; track aliases and effective dates where needed.
7. Do not use FEAF BRM family mapping as proof of ArchiMate/UAF formal conformance.
8. Keep political officeholders, administrative priorities, and contingent proposals outside this stable baseline or in separately dated datasets.

## Notation interoperability

FEAF v2 supplies reference-model families; ArchiMate and UAF/DoDAF supply potential interchange and special-purpose viewpoints. The ARFI JSON metamodel remains authoritative for ARFI-specific legal authority, social outcomes, temporal and editorial review semantics. No official government certification or framework endorsement is implied.
