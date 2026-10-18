# INC-05 — Constitutional Authority and Institutional Powers Crosswalk

**Research status: source-bounded, unratified, not a legal opinion or authority certificate.**

## Scope

Three exemplar six-stage pathways traverse **constitution → actor → enabling law / case law → office → function → oversight and unresolved remedy**, without inventing a new grant of authority:

1. **Article I:** Congress's enumerated fiscal powers and Article I §9 cl.7 constraint; 31 U.S.C. §§1301 (purpose), 1341 (amount and advance obligations), and 1501 (documentary support). GAO oversight is institutional context only. **No enacted specific appropriation, Treasury Account Symbol, obligation or expenditure is verified.**
2. **Article II:** President as Commander in Chief and Take Care duty; 10 U.S.C. §113(b) SecDef direction/control and §162(b) conditional combatant chain; existing canonical DoD role/function IDs. *Youngstown* is a distinct analogy for constitutional executive-power limits, not an operation-specific holding, a universal military constraint, or a substitute for a contemporary Unified Command Plan.
3. **Article III:** Article III judicial vesting, subject-matter and original/appellate jurisdiction; 28 U.S.C. §§1331 and 1254; separate *Marbury* judicial-review doctrine and *Lujan* standing context. **No individual justiciable claim, waiver of sovereign immunity, remedy or certiorari grant is certified.**

The 2026-10-07 OLRC source locators are linked in `model/federal/x05-sources.json`. Official-source references are not immutable original-byte archival custody; full current-effectiveness and independent citator review remain incomplete.

## Data contract

The six `model/federal/x05-*.json` collections are registered in the canonical manifest:

- `sources`: five bounded Title 28 / Title 31 official publication pointers.
- `statutes`: five scoped source-located legislative instruments.
- `functions`: four research-only functional contexts.
- `gates`: nine mandatory unresolved source, fiscal, legal and operational questions.
- `relationships`: 27 directed typed cross-domain source claims, each with independent evidence and false operational-authority flags.
- `traces`: exactly three approved-for-engineering-research **exemplar definitions**. Each has six stage selectors using original canonical record IDs, explicit source IDs, edge IDs and gates.

No original Article or Amendment files, existing federal/DoD/judicial IDs, officeholds or grants are modified. No source record represents a particular action as lawful solely because it is linked to an institution. A budget request is never an enacted appropriation.

## Publication and review boundary

The website's `/architecture/authority/` is the intended Atlas presentation of the three exemplar chains, with read-only immutable-commit pins. Publishing the model as **research** after website CI is distinct from professional legal qualification or Institute policy adoption. A user must be able to view **all six steps**, source records, explicit uncertainty and historical legal qualifiers. No automatic LLM interpretation or policy command execution.

Publication must fail closed when the original source commit cannot be loaded, the release model changes, a relationship links an out-of-scope actor, any required gate disappears, or an assertion is upgraded to signed individual delegation, enacted spending authority, current controlling precedent or case-specific entitlement.

## Engineering acceptance

```sh
node scripts/validate-inc05-crosswalk.mjs
node --test tests/inc05-crosswalk.test.mjs
```

The full architecture test workflow runs alongside these checks. Qualified counsel, public comment, completeness certification, legally effective timelines, individual instruments and protected original-byte retention remain separate approval requirements.

## Source and legal research follows

- U.S. Constitution: https://www.archives.gov/founding-docs/constitution-transcript
- 10 U.S.C. §§113, 162: existing `DOD-PROV-10-113-B`, `DOD-PROV-10-162-B` canonical records and official OLRC source pointers
- 28 U.S.C. §§1331, 1254; 31 U.S.C. §§1301, 1341, 1501: five new official OLRC locators
- *Marbury v. Madison*, *Youngstown Sheet & Tube Co. v. Sawyer*, *Lujan v. Defenders of Wildlife*: existing holding IDs and GovInfo original-opinion pointers

**Next slice:** enacted, account-specific appropriation→program→obligation→outlay trace and independent statutory/constitutional signoff, built on this shared typed contract. 
