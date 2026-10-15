# Article I: Legislative Authority, Conditions, and Capability Alignment

**ARFI-COA research baseline — 2026-10-15 | Legal review pending.**

## Purpose

This increment completes the **original Article I clause inventory** while separating actual constitutional grants of power, requirements, exceptions, restrictions, historical changes, and ARFI's functional alignment to L3 federal capabilities. The model is a research reference, not the Constitution's authoritative text, not a legal opinion, not a grant to an administrative agency, and not adopted ARFI policy.

## Inventory

| Article I Section | Clauses | Principal subject |
|---|---:|---|
| §1 | 1 | Congress and legislative vesting |
| §2 | 5 | House elections, qualifications, census, vacancies, impeachment |
| §3 | 7 | Senate composition, qualifications, procedures, impeachment |
| §4 | 2 | Election time/place/manner and assembly |
| §5 | 4 | Parliamentary authority, rules, records, adjournment |
| §6 | 2 | Compensation, privileges, disqualification, incompatibility |
| §7 | 3 | Revenue origination, bills and executive presentment, other resolutions |
| §8 | 18 | Enumerated congressional powers |
| §9 | 8 | Prohibitions and qualifications on federal power |
| §10 | 3 | Express restrictions and consent conditions on state powers |
| **Total** | **53** | First-level clause coverage |

The National Archives' original transcription (`SRC-CONST-ORIGINAL-TRANSCRIPT`) is primary. Constitution Annotated (`SRC-CONST-CONAN-ARTICLE-I`) is an official secondary guide to topical clause numbering. The original Constitution remains **unconsolidated text**. Ratified amendments are separately represented, and case-law doctrine remains separate and future scope.

## Canonical model artifacts

- `model/constitutional/provisions.json` is the authoritative **ARFI provision ID** registry. The existing 37 Article I clause IDs are preserved; 16 previously missing clauses are added.
- `article-i-clauses.json` contains **53 clause analyses**, each with an original-text provision ID, status, norm references, qualification IDs and capability-link IDs.
- `article-i-qualifications.json` contains explicitly typed, sourced conditions, exceptions, limits, reserved powers, procedural requirements and historical overlays. A record states its **affected norms**, rather than indiscriminately constraining every congressional power.
- `article-i-capability-links.json` connects current Article I congressional power norms to existing/new L3 capabilities as `functional_alignment_not_delegation`. The relationship **does not** confer executive or agency authority.

## Sample tracing: Army appropriation duration

`CONST-US-ART-01-SEC-08-CL-12` → `NORM-US-CONST-P12` (raise/support armies) → `AI-QUAL-08-12-TWO-YEAR-ARMY-FUNDING` (no appropriation longer than two years) → `CAP-FED-07` (national defense) and `CAP-FED-02` (fiscal authorization).

Article I §9 cl.7 adds the general restriction that public Treasury draws require appropriations made by law. Those are two **distinct** constitutional controls. The Navy clause does **not** repeat the Army's two-year restriction.

## Sample tracing: federal taxation

`CONST-US-ART-01-SEC-08-CL-01` → `NORM-US-CONST-006` (taxing grant) → indirect tax uniformity; cross-link to §9 cl.4 direct-tax apportionment, §9 cl.5 export-tax prohibition and Amendment XVI income-tax exception → `CAP-FED-02`/`CAP-FED-09` (fiscal functions).

No implied exemption from all constitutional limitations is asserted. Expenditure-related judicial doctrines such as coercion and clear notice require a later court-precedent model, **not** a false quotation of Article I.

## Sample tracing: federalism / militia

`CONST-US-ART-01-SEC-08-CL-16` → `NORM-US-CONST-P16` → two separate state reservations: appointment of militia officers, and authority over militia training according to Congress-prescribed discipline. These reservations are not federal administrative subordinate relationships.

## Historical and interpretation safety

- §2 cl.3 original three-fifths apportionment formula: **superseded**, retained solely as history; the decennial census and at-least-one-seat components remain represented.
- §3 cl.1 equal state Senate representation, terms and votes remain; the selection method is replaced by the Seventeenth Amendment, so the aggregate clause is **modified in part**, not wholly repealed.
- §3 cl.2 Senate vacancies are modified by the Seventeenth Amendment.
- §4 cl.2 original December meeting date is replaced by the Twentieth Amendment, while the annual convening obligation remains.
- §9 cl.1 pre-1808 migration/importation limitation and capped original tax: **historical only**; never a presently active power or obligation.
- §9 cl.4 direct tax apportionment is **modified in part** by the Sixteenth Amendment.
- §7 cl.3 the express adjournment exception is distinguished from subsequent precedent on amendments, which is deliberately not modeled as express original text.
- §10 has **state-directed** limits and certain congressional consents, not a general Congressional delegation over all state functions.

## Quality gates

Run:
`node scripts/validate.mjs`,
`node scripts/validate-constitution.mjs`,
`node scripts/validate-article-i.mjs`,
`node --test tests/constitutional.test.mjs`, and
`node --test tests/article-i.test.mjs`.

The Article I checker asserts all 53 clauses (including section-by-section counts), one-to-many sourced qualifications, every Section 8 grant mapped to L3, complete mapping of operative **congressional** power norms, absent mapping of state-only powers, no agency-delegation claims, and hard controls for two-year Army funding, militia reservations, direct-tax exceptions, export taxes, the Necessary and Proper dependency, and historical repeals. Negative tests mutate canonical records to ensure rejection.

## Later increments

1. **Article II**: presidential vesting, election and succession, foreign relations, appointments, military command, execution and impeachment. Deepen every Section and its conditional mechanics.
2. **Article III**: vesting, jurisdiction, original/appellate cases, criminal trials, treason, judicial tenure and statutory court dependencies.
3. **Federalism / Article IV and VI, Tenth/Fourteenth Amendments**: State and federal roles, limits, jurisdiction, supremacy and enforcement.
4. **Remaining amendments**: complete intra-section/clause/semantic structure and transition dates.
5. **Judicial interpretation**: precedent-specific holdings, changes, controlling authority, doctrinal scope, opinions.
6. **Agency enabling statutes**: explicit provisions → enacted authority → regulations/programs → actor functions → capabilities. This step is essential before concluding a specific agency may exercise a power.
