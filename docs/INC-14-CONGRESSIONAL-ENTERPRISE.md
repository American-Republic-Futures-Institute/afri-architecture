# INC-14 — Congressional Enterprise Architecture, bounded 119th-Congress pilot

**Release status:** Unratified research baseline. **Observation date:** 2026-10-19. **Decomposition:** ADL-0 (not ADL-1). The nine previously selected congressional/legislative-support canonical IDs, including Congress, House, Senate, CBO, GAO, CRS, GPO, Architect of the Capitol, and Library of Congress, retain their existing identities. The four DoD-derived defense committee labels remain only statutory-name crosswalk candidates, not verified current chamber procedure.

## Model boundaries and denominators

The 119th-Congress pilot records **eight selected offices/committees** (four House, four Senate): two Appropriations committees, their two Military Construction/Veterans Affairs subcommittees, House Clerk's Office of Legislative Operations, Secretary of Senate, House Speaker and Senate President pro tempore offices. No incumbent identities are inferred. The complete congressional universe, standing/select/joint committee and subcommittee totals, House/Senate staff complement, office-holder roster, and source-specific first-level hierarchy are **not** independently denominated. Every pilot node has ADL-1 false.

The publisher-anchored source register includes Article I, 119th House Rules and H. Res. 5, Senate Standing Rules XXV/XXVI, Clerk House committee profiles, official Appropriations pages from each chamber, Secretary/Clerk functions, nonbinding CRS R42843 (edition 18), GovInfo law index, and Public Law 119-31 metadata. Distinguish issuer rule publication date, observation date, enacted-law approval date, official source-byte custody, and independent legal review. These source locators have *no retained independent original-byte hash evidence*.

## Separate instrument, oversight and fiscal claims

The constitutional branch assignment, chamber-adopted rules, committee-directory listing, codified statute, enacted appropriation, individual committee proceedings, subpoena authority, GAO support and executive funds control are not interchangeable. Committee membership, subject-matter jurisdiction and House/Senate referral procedures are never modeled as direct command or a signed legal delegation. Published subcommittee jurisdictions are bounded research context; a subcommittee hearing notice does not certify a subpoena, appropriation enactment or executive payment.

Four explicit fiscal boundary records represent House and Senate Appropriations deliberations, a possible enacted federal appropriation, and the downstream executive VA spending-evidence boundary. No appropriations amount, TAS, OMB apportionment, agency allotment, actual obligation, outlay, payee record, or GAO recommendation is fabricated. The 119th Congress fiscal perspective does *not* amend the earlier VA FY2025 account evidence.

## Legislative workflow template versus real event history

A **14-stage conditional House-originated template**, with 14 source-qualified potential transitions, runs from House introduction/referral/committee/floor to Senate referral/committee/floor, optional bicameral reconciliation, identical-text approval in **both chambers**, enrollment, presentment, constitutional presidential disposition, and enactment/publication or conditional two-thirds veto override. This is a *generic possible procedural path*, not the only legislative path, and no template stage is certified completed for any actual bill. Committee bypasses, non-House origin, Senate special procedures, reconciliation details, constitutional no-signature exceptions and other branches require later modeling. **Publication never itself grants lawmaking power or verifies appropriations.**

Separately, the GovInfo [Public Law 119-31](https://www.govinfo.gov/app/details/PLAW-119publ31) record reports three specific H.R. 1815 history points: House passage **2025-05-19**, Senate passage **2025-07-15**, and presidential approval **2025-07-30**. The first two are *publisher-summarized*, not original journal and enrolled-version custody; the third is a signed-law publication history marker, not independent verification of the President's original signature. No committee referral, hearing, amendment, appropriation, vote tally or complete individual-bill workflow is inferred. Importantly, **this law is not an appropriations act**.

## Twelve separately registered model families

`x14-sources`, `x14-nodes`, `x14-instruments`, `x14-relationships`, `x14-stages`, `x14-transitions`, `x14-observations`, `x14-fiscal`, `x14-history`, `x14-coverage`, `x14-gaps`, and `x14-views`. All records use closed JSON Schema and source-ref, canonical-ID, scope/ADL, date, role, conditional legal-process and no-delegation validators. The validator anchors exact original official publisher URL IDs, so substitution within the same official host is rejected. It also crosschecks preserved constitutional and DoD-side canonical references.

```sh
node scripts/validate-inc14.mjs
node scripts/validate-inc14.mjs --view VIEW-X14-HOUSE
node scripts/validate-inc14.mjs --view VIEW-X14-SENATE
node scripts/validate-inc14.mjs --view VIEW-X14-PROCESS
node scripts/validate-inc14.mjs --view VIEW-X14-FISCAL
node --test tests/inc14.test.mjs
```

## Follow-on architecture

A second congressional increment should capture full 119th House and Senate committee/office authoritative denominators and original-binary source custody, qualify House Rule X and Senate XXV/XXVI with independent parliamentary/legal analysis, connect the 10 U.S.C. §101 defense committee definitions without reassigning statutory powers, expand alternate lawmaking branches and judicially reviewable checks, and select an appropriations bill with authenticated actions, signed enactment and exact fiscal account crosswalk. Only then consider supported ADL-1 promotion. A separate website PR will be needed to present these models in the Atlas, pinned to the architecture merge SHA.
