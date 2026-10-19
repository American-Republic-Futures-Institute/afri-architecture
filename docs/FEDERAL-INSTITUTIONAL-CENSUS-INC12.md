# INC-12 — Federal Institutional Census and Identity Reconciliation

**ARFI-COA v0.1.0, October 18, 2026. Research baseline / unratified.**

## Purpose

Create a reproducible coverage, evidence, history, and publication contract across five federal institution families: Congress and legislative support, Executive Office and constitutional executive leadership, all fifteen Cabinet departments, selected independent executive bodies, and courts and judicial support. It reconciles existing ARFI identifiers; it does not invent a complete government inventory or certify particular office powers.

## Family coverage and denominator meaning

The canonical selected register contains **61 ARFI identities**: nine legislative, ten executive-leadership/EOP, fifteen Cabinet, eighteen selected independent and nine judicial. This count is complete only relative to the preexisting selected ARFI catalog, *not* relative to the total federal government. The official whole-government population denominator and full current first-level department/branch denominators remain unknown, as do independent ADL-1 legal and structural qualification results.

Exactly **150 source observations** are reconciled one-to-one: 29 original statutory/directory component candidates, 80 bounded published departmental chart/directory entries, 24 departmental index seed candidates and seventeen congressional/court seed candidates. Cabinet observations total 133, Congress four and judiciary thirteen. These records are not 150 mutually distinct governmental entities, a first-level-only catalog, or even a full slice of every EOP/independent record: the selected source-collection universe has zero component observations for the EOP and independent family. The catalog does already have canonical EOP and independent institution references; zero observations is not absence of real government structures. A signed departmental chart connector is not individually signed statutory delegation or command.

Exactly **twelve** Government Manual 2025-12-31 granule publication IDs, already individually checked against GovInfo, are recorded as official **publication locators**. They are not external agency identity numbers, and no unverified OMB agency code, Treasury ALC, UEI or other institutional identifier is manufactured.

Four existing identity-transition observations are referenced: three GAO-described DoD names/redesignations and one candidate historical Veterans Affairs contracts-appeals function transfer. A reported same-entity name event does not create a new entity; a historical transfer does not establish a legal successor or statutory repeal. Signed original instruments, present-day legal effect and independent review remain unqualified.

## Canonical data contract

The seven files under model/federal/x12-*.json contain five research scopes, 61 nonduplicated canonical pointers, 150 source-specific structural observations, 12 dated publisher locators, four unratified history events, five mandatory research gaps, and five bounded public-view selectors.

The schema is schemas/inc12-institutional-census.schema.json. The deterministic validator joins the overlays back to the unchanged selected originals, source relationship records, snapshot IDs, and Government Manual granular citations. The structured schema implements a declared closed subset of draft 2020-12; it is not an implementation of the complete JSON Schema standard.

Run at repository root:

    node scripts/validate-inc12.mjs
    node scripts/validate-inc12.mjs --view VIEW-X12-CABINET ORG-FED-EXE-DEP-VA
    node --test tests/inc12.test.mjs

Negative tests reject invented offices, branch moves, fabricated external identifiers, false legal delegation or command, source relationship substitutions, missing family gaps, false ADL-1 certification and fabricated historical legal succession.

## Website Atlas contract

Each view requires all model and source inputs to be loaded at **one immutable architecture commit SHA** and exposes typed original evidence, source-scoped parentage, immutable source lineage, an explicit unknown full-government denominator and an unresolved review gap. A read-only selector or diagram does not certify a statutory office, delegated authority, operational supervision or a signed decision. Website integration, if implemented, must preserve those qualifications, avoid client-side fallback to a mutable main branch and carry source and legal uncertainty in the viewer.

## Next source research

Complete authoritative dated source-group denominator methods for EOP and independent agencies; independently reconcile subordinate department structure, selected official agency identifiers, committee and court subtypes, and administrative predecessor/successor histories. Only then propose qualified ADL-1 promotion. Congressional procedures and executive policy lifecycle are subsequent distinct bounded increments.
