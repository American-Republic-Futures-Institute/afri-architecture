# DoD Institutional and Statutory Decomposition — Increment 02

**ARFI-COA v0.1.0 · 2026-10-16 · Bounded research architecture; not a legal opinion.**

## Scope and completeness boundary

Extends the federal identity census merged in PR #18 without replacing canonical identifiers. Covers 11 enumerated statutory composition categories under 10 U.S.C. §111(b), nine cross-referenced PR18 elements, 27 dated GAO Defense Agency / DoD Field Activity identities, selected civilian/Joint offices, military services, public combatant commands, bounded Title 10 functions and legal conditions, congressional oversight recipients, and FY2026 funding **proposals**.

This does not certify complete current DoD ADL-1: residual §111(b)(10)-(11) classes, OSD constituent offices, individual charters, UCP assignments and many operational units remain unresolved. No signed delegation, current classified structure, enacted appropriation or current judicial legal interpretation has been independently verified.

## Sources and evidence editions

| Official source | Edition | Only supported proposition |
|---|---|---|
| [10 U.S.C. §111](https://uscode.house.gov/us/usc/119-118/t10/s111/) and selected Titles 10, 14, 31 | Codification through Pub. L. 119-120, 2026-10-07 | Statutory composition, duties, specific command, authority, limitations; pending full citator review |
| [GAO-26-107781](https://files.gao.gov/reports/GAO-26-107781/index.html), Figure 1 | 2026-09-03 report; roster as of 2026-05 | 19 Defense Agencies, 8 Field Activities, 8 combat support flags, dated OSD/other supervisory offices; later name changes in footnotes |
| [2025 U.S. Government Manual DoD chapter](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/GOVMAN-2025-12-31-114) | 2025-12-31 | Department-level historical identity, not an October 2026 complete organization |
| [Defense.gov public organization directory](https://www.defense.gov/About/our/) | Observed 2026-10-16, mutable website | Eleven named combatant commands, not a current official Unified Command Plan or force assignments |
| [DoD FY2026 Comptroller budget materials](https://comptroller.defense.gov/BudgetMaterials/FY2026budgetjustification.aspx) | FY2026 President's budget proposal | Four selected defense-wide funding request categories, never legal appropriations |

DoD statutory references preserve the legal Department of Defense identity notwithstanding some 2026 source documents' "Department of War" labels. Three temporal naming events for DHRA, media activity and test resource management center are not treated as creation of new agencies or independently verified final renamed entities.

## Legal / institution distinction

**Composition**: 10 U.S.C. §111 defines eleven component classes/organizations. Grouped Defense Agencies, Field Activities, combatant commands, and residual categories are not individual authorized units.

**Military departments versus services**: Army, Navy and Air Force are the three military departments. Five DoD services are Army, Navy, Marine Corps, Air Force, Space Force; Marine Corps belongs to Navy, Space Force to Air Force. Coast Guard generally belongs to DHS; 14 U.S.C. §103 creates specified transfer-to-Navy conditions. The Coast Guard is a comparator, not presumed to be a normal DoD armed service.

**Advice and command**: Under §§151–152, Chairman/Joint Chiefs advice is separate from command, and §152(c) prohibits Chairman exercise of military command. §§161–164 create bounded roles for President, SecDef and combatant commanders; §162(b)'s default command chain is qualified by "unless otherwise directed by the President". A website graph must never convert OSD supervision or Joint advice into operational command.

**Defense agency supervision**: GAO Figure 1 provides chart-based supervision, not individual agency legal delegation. 10 U.S.C. §192(a)(3) excludes DIA and NSA from subsection (a) supervision: two specific edges carry that qualification. The independent DoD Inspector General must not be treated as a normal Secretary-command subunit.

**Legal authority**: Twenty-eight section/subsection propositions, fourteen recorded restrictions, twelve bounded functions and nine actor-matched authority chains are source-cited. Each legal actor and condition is explicit. Individual signed delegations and agency-level legal opinions are not fully reviewed, and any capability link is descriptive, not policy or funding authorization.

**Congress**: §101(a)(16) defines four congressional defense committees: House/Senate Armed Services, House/Senate Appropriations. §192/§193 reporting crosswalks reference those committees; other notices to Congress at large must not be incorrectly narrowed to four committees. Actual report delivery and current committee rules are not verified.

**Fiscal**: FY2026 Defense-wide Operation & Maintenance, Procurement, RDT&E, and Defense Health are proposal categories. The 31 U.S.C. §§1301 and 1341 restrictions do not authorize expenditure. No Treasury account symbol, obligation, enacted appropriation or spendable allocation has been inferred.

## Data model and declarative views

Twenty new collections under model/federal/dod/ are registered in model/federal/manifest.json and described in schemas/dod-institutional.schema.json (strict per-family JSON Schema 2020-12 structural contract):

- Source registry and source snapshots
- Statutory composition; May 2026 Defense Agencies and Field Activities; office roles; armed services; public combatant commands; temporal name events
- Statutory provisions, conditions, bounded powers, typed relationships, capability links, source authority traces
- Congressional committees and reporting crosswalks; fiscal proposal crosswalks
- Original U.S. Constitution Article I and II military/appropriations powers crosswalks with source-cited contextual, explicitly nondelegating graph relations.
- Declarative viewpoints and eleven unresolved evidence gaps

Eight model-only views exist: VIEW-DOD-COMPOSITION, VIEW-DOD-DAFA, VIEW-DOD-COMMAND, VIEW-DOD-SERVICES, VIEW-DOD-AUTHORITY, VIEW-DOD-CONGRESS and VIEW-DOD-FISCAL and VIEW-DOD-CONSTITUTION.

Each is a read-only, source-traced bounded graph. They are **not yet rendered by the public ARFI website**. The version contract and stable IDs must be honored by a subsequent independent website PR; constitutional focused views and comments remain unchanged.

### Source citation integrity and legal-edition limitation

The model now requires a **source-identity-to-locator match** in addition to an official HTTPS hostname. A statutory record for 10 U.S.C. §162 cannot be silently retargeted to an unrelated section of the official U.S. Code, and the GAO DAFA figure cannot be replaced with a different official GAO report without updating the versioned evidence contract and undergoing review.

The OLRC URL segment `/119-118/` is a citation locator, **not independently verified evidence of an immutable law edition**. When reviewed, that government page's displayed header stated *laws in effect through Public Law 119-120 (October 7, 2026)*. The model records that displayed source-version claim and review context, not a cryptographically frozen copy or a completed subsequent-law/citator check. Up-to-date legal conclusions must recheck the source text, effective amendments and controlling law. A future increment should retain exact archived statute artifacts and hashes.

## Validation

Commands:

    node scripts/validate-dod.mjs --validate
    node scripts/validate-dod.mjs --view VIEW-DOD-DAFA
    node scripts/validate-dod-schema.mjs
    node --test tests/dod.test.mjs

Negative regression coverage includes false operational command, removal of President and §192 qualifications, spoofed sources, fabricated current DAFA status, duplicate identity, unsourced legal authority, a false Coast Guard placement, IG loss of independence, conflating budget request with enacted appropriation, and declaring human legal/citator review complete without evidence.

## Later independent increments

1. Reconcile actual October 2026 DoD first-level roster and signed individual DAFA charters, OSD subordinate offices, original renaming directives and effective dates.
2. Map individual Defense Agency and Field Activity legal delegations, Defense-wide civilian authorities, congressional reporting in more detail.
3. Verify enacted fiscal-year appropriation acts, Treasury account symbols, program authorities, responsibilities, and measurable service effectiveness.
4. Integrate these researched, immutable source-pinned models into website authority explorer through a separate, validated website PR. No policy mapping in this release.

## Constitutional competence is not statutory agency authority

Seven original-text constitutional contexts are mapped to existing canonical constitutional IDs. Article I clauses 11 (declare war), 12 (raise/support armies), 13 (provide/maintain Navy), 14 (rules for armed forces), 18 (Necessary and Proper) and Article I section 9 clause 7 (appropriations) identify **Congress** as the constitutionally competent institution. Article II section 2 clause 1 identifies the **President** as Commander in Chief. All seven cite the official National Archives original Constitution transcript and selected relevant statutes, but each explicitly records that **no new individual DoD statutory agency power or appropriation is inferred** and completed doctrinal/legal review remains pending.

The constitutional view VIEW-DOD-CONSTITUTION renders seven 3-node source/context/statutory chains as explicitly descriptive provenance links with legal_authority_proven=false. This does not certify that an original-text clause independently delegates an official power or that a proposed FY2026 spending line is available money.
