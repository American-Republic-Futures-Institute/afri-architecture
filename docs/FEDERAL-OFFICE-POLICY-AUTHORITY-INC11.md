# INC-11 — Federal Office, Authority and Policy Metamodel

**ARFI-COA research contract v0.1.0 · October 18, 2026 · Source-bounded / unratified.**

## Objective and classification boundary

Connect existing federal institutions to official offices and positions, legal/policy instruments, source-backed authority assertions, dated instrument events, and unresolved evidence gates. This increment establishes a common modeling contract, not a full federal census, legal opinion, regulatory publication, agency operating authorization, verified individual delegation, or binding institute policy.

X11 records are *classification overlays*, not newly invented government bodies. The earlier ORG-FED, X05, X06, X07 and FSTAT source identities remain authoritative and unchanged. The canonical federal manifest retains its original baseline date, while INC-11 records carry individually dated source observation or event fields.

## Six model families

| Family | What is represented | What is not inferred |
|---|---|---|
| Offices | A statutory Under Secretary for Benefits position and a policy-named VA Office of Budget candidate | Confirmed incumbent, organizational ADL-1, actual lawful delegation |
| Instruments | Codified laws, one enacted appropriation, one internal VA funds-control policy | Internal policy as a CFR regulation or specific execution authority |
| Claims | Six directed, instrument-backed assertions with sources, jurisdiction, dates, and qualification gaps | Legal correctness of a particular current governmental action |
| Events | Publisher-reported P.L. 118-42 enactment and 2024 VA policy approval | Automatic revocation, continuing effect or signed implementation |
| Gaps | Missing office/legal classification, original delegation, FY2025 execution and independent counsel review | Absence of evidence proves wrongdoing or nonexistence |
| Viewpoints | Three reproducible read-only selections of the above canonical IDs | Diagram-derived power or complete institutional coverage |

The statutory source, executive agency policy, official organizational position and individual delegated authority are separate types. Future modeling will support appropriately sourced executive orders, presidential memoranda, administrative rules, CFR provisions, congressional rules, agency guidance, adjudicative instruments and directives, each with proper legal force and supersession semantics; these are deliberately not fabricated as examples in this bounded increment.

## Bounded, source-backed exemplars

**VA statutory and fiscal context.** Official 38 U.S.C. § 306 (SRC-X06-38-306) establishes the Under Secretary for Benefits' role and VBA headship, but does not identify an incumbent or prove a signed individual fiscal delegation. P.L. 118-42 div. A title II (SRC-X06-PL118-42) supplies enacted FY2025 Compensation and Pensions budget authority, whose availability starts October 1, 2024. The enactment date is March 9, 2024. 31 U.S.C. § 1301 (SRC-X05-31-1301) is a separate purpose limitation. VA Volume II Chapter 03 (SRC-X07-VA-FUNDS2024), approved July 17, 2024, describes an internal funds-control procedure; it does not prove an Office of Budget's complete current legal placement, signed FMA/TDA, AAWS/iFAMS transaction, Treasury payment or general rulemaking force. The existing X06–X10 fiscal and independent qualification gates remain intact.

**Department of Education federalism boundary.** Official 20 U.S.C. § 3403 (SRC-FSTAT-ED-3403) is a bounded statutory source on State/local educational control, but the time-limited historical subsection and current legal effect need review. The modeled edge establishes neither federal curricular command nor a decision that any particular agency action is unlawful.

Each claim records its supporting primary source IDs and applicable outstanding research questions; the validator rejects claims whose legal instrument classification does not match the predicate.

## Temporal and legal safeguards

- Source observation dates, publisher-reported enactment/approval events and fiscal availability dates are separate fields.
- Unknown legal effective intervals or supersession are left unresolved rather than assumed.
- A legal instrument is not a verified signer, account-specific apportionment, lawful individual obligation or approved beneficiary decision.
- Absence of a source original is an evidence gap, not evidence of illegality.
- No private beneficiary, personnel or confidential operational data is modeled.
- Cryptographic source retention, human institutional adoption, qualified counsel review and any individual exercise of power remain independent gates.

## Verification and publication

Six collections are listed in the existing canonical manifest. A closed JSON Schema draft 2020-12 contract is enforced through an explicitly bounded keyword evaluator plus independent source/relationship validators; it is not a general-purpose 2020-12 interpreter.

Run these commands at repository root:

    node scripts/validate-inc11.mjs
    node scripts/validate-inc11.mjs --view VIEW-X11-VA-POLICY-WORKFLOW
    node --test tests/inc11.test.mjs

The adversarial suite rejects substituted law or policy, fabricated delegation, missing provenance, altered legal dates, removed review qualifications, nonexistent graph IDs and authority promotion. The website may publish the three views later, from an immutable architecture commit, labeling them source-bounded and unratified. No website files are part of this PR.

**Next increment:** establish a comprehensive source-versioned denominator methodology for federal institutions, focusing on Congress, EOP, subordinate departments, independent bodies and the judiciary, without asserting ADL-1 before legal/structural qualification.
