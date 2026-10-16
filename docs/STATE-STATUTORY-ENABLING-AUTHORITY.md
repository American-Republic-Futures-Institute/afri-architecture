# State Statutory Enabling Authority — Virginia and Nebraska Pilot

**ARFI-COA v0.1.0 | Research snapshot 2026-10-16 | Unratified and pending qualified legal review**

## Why this increment exists

The [independent State institutional model](STATE-INSTITUTIONAL-ARCHITECTURE.md) previously separated constitutions, jurisdictions, branches, norms and institutions, but deliberately did not infer powers exercised under enacted statutes. This increment introduces eight source-backed statutory collections without replacing the original constitutional model.

The research sequence is:

```text
State Constitution / distinct State legislature
    -> codified State statute and specific section
    -> constituted Court of Appeals
    -> section-specific establishment or appellate jurisdiction authority
    -> jurisdiction exceptions, review/selection rules and temporal limits
    -> descriptive State judicial capability
    -> incomplete authority review / no certified appropriation
```

## Virginia: statute-enabled lower appellate court

Virginia Constitution art. VI, § 1 recognizes the State judicial system, with courts established by law. The Court of Appeals of Virginia is modeled as a **statutorily constituted** court, not falsely listed as directly named in that constitutional section.

- [Va. Code § 17.1-400, 2026 updates](https://law.lis.virginia.gov/vacodeupdates/title17.1/section17.1-400/) indexes organizational law and the September 1, 2026 increase from 17 to 21 authorized judges. Staffing is **not** authority over every appeal.
- [Va. Code § 17.1-405](https://law.lis.virginia.gov/vacode/title17.1/chapter4/section17.1-405/) is the selected statutory final-civil-jurisdiction anchor. Subsection A(3) is linked to the exception in § 17.1-406(B).
- [Va. Code § 17.1-406](https://law.lis.virginia.gov/vacode/title17.1/chapter4/section17.1-406/) distinguishes criminal appellate and direct-Supreme-Court cases. Not every category is comprehensively modeled.

## Nebraska: constitutionally recognized appellate court plus enacted procedures

[Nebraska Constitution art. V, § 1](https://nebraskalegislature.gov/laws/articles.php?article=V-1) expressly includes an appellate court in the State judiciary, but that alone cannot substitute for enacted organization or jurisdiction.

- [Neb. Rev. Stat. § 24-1101](https://nebraskalegislature.gov/laws/statutes.php?statute=24-1101) provides organizational creation, six judges and three-judge panels.
- [Neb. Rev. Stat. § 24-1106](https://nebraskalegislature.gov/laws/statutes.php?statute=24-1106) defines selected jurisdiction, exclusions, direct review and Supreme Court removal authority.

## Catalog and website integration

Eight new collections are registered under `model/state/`: `statutory-sources`, `statutes`, `statutory-provisions`, `statutory-powers`, `statutory-conditions`, `statutory-capabilities`, `statutory-traces`, and `statutory-viewpoints`. Their stable identifiers and `state_statutory_extension` metadata are indexed by the existing canonical manifest. The existing constitutional citations and prior State identities are preserved.

The architecture repo is **not** the website renderer; the consumer must use immutable-commit snapshots, source-specific evidence, explicit incomplete legal-review notices, and `(element_id, commit_sha)` comment anchors. No production rendering or user-comment feature is claimed by this work.

This is a *selected* court authority slice. It does not verify complete court jurisdiction, State budgets/appropriations, current professional legal citator status, 50-State statutes, or direct governmental implementation authority. Historic amendment detail and litigation may alter the applicable result. Qualified counsel should confirm current legal applicability before any reform recommendation is advanced as executable.

## Verification

```sh
node scripts/validate.mjs
node scripts/validate-state.mjs
node --test tests/state.test.mjs
node scripts/validate-state-statutes.mjs
node --test tests/state-statutes.test.mjs
```

The dedicated regressions reject cross-State courts, federal agency substitutions, invented legal grants, missing exceptional jurisdiction, invalid primary citations, falsely certified appellate legal effect and fabricated website deployment.
