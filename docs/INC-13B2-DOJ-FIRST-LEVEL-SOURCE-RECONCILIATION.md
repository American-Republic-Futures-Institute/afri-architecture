# INC-13B2 — DOJ dated first-level institutional source reconciliation

**Status:** research-only, unratified. **Source scope:** DOJ organizational chart, signed-chart date **2026-02-17** as described by its public website; page last updated **2026-04-29**; observed **2026-10-16**. The purported chart signing has **not** been independently cryptographically verified. No complete-current-DOJ census or ADL-1 claim.

## Purpose
Continue the merged INC-13A nine-gate qualification contract and INC-13B1 immutable source/identity/temporal/nonpromotion methodology. Reconcile **36 source-slice unit observations**, their **36 dated descriptive chart connectors**, and **36 existing INC-12 observation identities** one-to-one. This is the complete *declared source group*, not all DOJ institutions and not 36 independently certified first-level organizations.

## Immutable source identity and temporal dimensions
- Original source: `DEPT04-SRC-DOJ-CHART-2026` in the federal department-structure official-source registry, publisher Department of Justice, public text organizational chart.
- Source snapshot: `DEPT04-SNAPSHOT-JUSTICE` in `model/federal/department-structure/source-snapshots.json`.
- Capture: web publisher indicates Feb 17 signed-chart date, April 29 webpage update, Oct 16 observation. These are three **different** temporal properties; no operational legal-effective date is inferred.
- Each observation retains canonical `DEPT04-UNIT-JUSTICE-*`, original `DEPT04-REL-*` chart relation, and `X12-OBS-*` first-census identity. No existing office, role, canonical person, or source snapshot is replaced.
- The source webpage is mutable. Its claim to a signed chart is not authenticated individual delegation, current government organizational legal effect, independently preserved original bytes, or complete current staffing.

## Explicit relationship semantics
- `source_observed_parent_id` records only the exact published organizational-chart connector.
- The chart's Attorney General, Deputy Attorney General, and Associate Attorney General relationships are not standalone evidence of executed statutory delegations, action-by-incumbent or governing supervisory orders.
- FBI, BOP, USMS, ATF, other bureaus and policy/legal divisions remain distinguished by their original source classifications. Chart position does not prove program enforcement powers, executive fiscal control, or specific court-review pathways.
- Inspector General `DEPT04-UNIT-JUSTICE-OIG` remains an independent oversight research class even if positioned beneath another office in the chart; no loss of Inspector General Act protections is inferred.
- Three chart observations requiring adjudicatory/commission legal review are **not** declared to be legally subordinated adjudicators by their drawn connectors.
- Complete source-group extraction is not certified first-level departmental population. The merged INC-13A nine qualification gates remain unmet; review and evidence-original custody are separate.

## Acceptance contract
`node scripts/validate-inc13b2.mjs`, `node scripts/validate-inc13b2.mjs --view`, and `node --test tests/inc13b2.test.mjs` must pass exact-head CI. Reject changed publisher date/edition, missing/duplicate unit, wrong original `X12` pointer or relation ID, reparenting, cross-department or cross-branch substitution, purported legal command/delegation, false signature custody, changed Inspector General classification, false ADL-1 certification and complete-department denominator inventions. Publication in Atlas is a separate source-pinned website increment.

## Bounded source exceptions
- **Office of the Inspector General** (`DEPT04-UNIT-JUSTICE-OIG`): independent_oversight_position_only; chart connector only, original parent `DEPT04-UNIT-JUSTICE-DAG`
- **U.S. Parole Commission** (`DEPT04-UNIT-JUSTICE-USPC`): adjudicatory_or_commission_review_needed; chart connector only, original parent `DEPT04-UNIT-JUSTICE-DAG`
- **Executive Office for Immigration Review** (`DEPT04-UNIT-JUSTICE-EOIR`): adjudicatory_or_commission_review_needed; chart connector only, original parent `DEPT04-UNIT-JUSTICE-DAG`
- **Foreign Claims Settlement Commission** (`DEPT04-UNIT-JUSTICE-FCSC`): adjudicatory_or_commission_review_needed; chart connector only, original parent `DEPT04-UNIT-JUSTICE-ASG`

**Next:** INC-13B3 VA statutory composition and overlapping historical/directory first-level research. No direct cross-family organization name matching or automatic historical succession is permitted.
