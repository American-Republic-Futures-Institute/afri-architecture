# INC-15E.1B — Amtrak: original GPO statutory text and bounded status relationship

## Disposition and source edition

This is a **primary-source capture and clause-scoped descriptive legal-status model**, not a blanket classification of Amtrak, a canonical institutional identity certification, or a completed independent legal opinion.

Official first-party source: [U.S. Government Publishing Office, United States Code, 2024 edition, 49 U.S.C. §24301](https://www.govinfo.gov/content/pkg/USCODE-2024-title49/html/USCODE-2024-title49-subtitleV-partC-chap243-sec24301.htm).

The original GPO HTML **30,123 bytes** was fetched via HTTPS by the repository's networked GitHub Actions runner, captured as exact response bytes and committed on the isolated INC-15E.1B branch, not reconstructed from search excerpts.

- Publisher edition: `USCODE-2024-title49` (the **2024 edition**, not the 2026 preliminary code).
- Download timestamp: `2026-10-25T15:21:34.476969+00:00`.
- Original SHA-256: `8cc04353f66bb3bc10e5a0102cc750bc3380e8796c1126d8f76bf4083b595f10`.
- Original Git blob SHA-1: `8896783bbb61e92a3d33f7a8a64d0fae3bb08c80`.
- [Retained 30,123-byte original](../evidence/inc15e1b-amtrak-uscode/originals/sha256/8cc04353f66bb3bc10e5a0102cc750bc3380e8796c1126d8f76bf4083b595f10.html).
- [Capture receipt, edition and HTTP provenance](../evidence/inc15e1b-amtrak-uscode/source-custody.json): HTTP 200, final first-party HTTPS URL, response MIME, last-modified header, exact raw byte length, text offsets and hashes.
- First network capture run: GitHub Actions `40206542046`, with source artifact `inc15e1b-gpo-49usc24301-original`.

**Retained in Git is not external WORM certification.** The GPO 2024 code edition also does not prove that each clause was unchanged in every later 2026 release, or demonstrate implementation by Amtrak. The archive records primary codification evidence only; not a new contemporaneous operational observation.

## Exactly what 49 U.S.C. §24301(a) supports

| Clause | What the published statutory text says | What is deliberately *not* inferred |
| --- | --- | --- |
| §24301(a)(1) | Amtrak has the section's specified **railroad carrier** classification | It is not a comprehensive identity or regulatory-power classification |
| §24301(a)(2) | Amtrak **shall be operated and managed as a for-profit corporation** | No claim that its accounts actually show profit, that a public/private ownership test is resolved, or that it is a standard private company |
| §24301(a)(3) | The statute specifies that Amtrak is **not a department, agency, or instrumentality of the United States Government**, and excludes Title 31 under the clause | No blanket claim that Amtrak is nongovernmental for constitutional-rights purposes, or that every other law or controlling interpretation is inapplicable |

The source includes enacted-law credits including Pub. L. 103-272 and later listed amendments. In particular, its editorial notes attribute the Title 31 addition to Pub. L. 105-134 §415(d)(1) (1997). Legal effective dates, interplay with other enacted laws, and any 2026 code changes must be adjudicated separately before reporting a present-day operative legal status.

### Constitutional rights are a separate legal viewpoint

**Lebron v. National Railroad Passenger Corporation**, 513 U.S. 374 (1995), addresses Amtrak's governmental status for constitutional individual-rights purposes. Congressional legal-status drafting and constitutional state-action analysis are not identical classification questions.

The new model records this as an explicit **interpretive boundary**, not as a new judicial original: the Lebron opinion has **not** been newly captured under this increment's source-original custody program. A later case-law source model must preserve the legal reasoning and relevant jurisdiction/purpose before publishing a constitutional-rights graph.

## Typed graph and historical source reconciliation

The common identity relationship registry now includes **10 types**. The additional `statutory_status_declared_for` edge has these exact endpoints:

- From: `STAT-USCODE-2024-49-24301-A` (the **2024 statutory provision**).
- To: `STAT-USCODE-2024-49-24301-AMTRAK` (the **statute-local named subject**).
- Original evidence: `INC15E1B-SRC-USCODE-2024-49-24301`, linked to the exact content-addressed GPO HTML.
- Qualification: **original 2024 statutory text replayed; independent legal review pending**.
- Direction: statutory clause → subject of the clause, *not* supervisor → subordinate, delegation, institutional succession, canonical agency equivalence, or exercised function.

The historic 2025 Government Manual publisher observation `GOVMAN-2025-12-31:160` remains intact. Its original INC-15E.1A case recorded that a statutory original had **not** yet been retained. The new [supplemental source-status transition](../model/federal/inc15e1b/amtrak-status-transition.json) appends the **2024 GPO capture event** without retroactively editing that prior research-release record. It explicitly refuses to claim legal identity equivalence between the 2025 publisher name and the 2024 statute-local subject without a separate qualification.

No new canonical agency ID, supervision or command edge, budget or corporate ownership predicate, source-to-canonical identity certificate, Atlas relation, Plan recommendation or Data Observatory public-outcome assertion is made.

## Evidence qualification metrics

| Dimension | Result |
| --- | ---: |
| Original GPO legal-section HTML preserved | **1** |
| GPO 2024 subsection-(a) source clauses replayed | **3** |
| Directed statute-to-statute-local-subject status relations | **1** |
| New cross-edition canonical legal-identity matches | **0** |
| Independently completed professional legal reviews | **0** |
| Verified current 2026 Amtrak operating conditions | **0** |
| New public Atlas admissions | **0** |
| Prior 2025 publisher total / provisional canonical links / unlinked | **231 / 50 / 181**, unchanged |

## Reproducibility and negative gates

- [Offline source verifier and initial capture CLI](../scripts/inc15e1b-capture-amtrak-original.py): rejects altered raw original, missing clause, wrong source edition, false GPO provenance and unsupported legal or public claims. Capture mode refuses to overwrite an existing source receipt.
- [Status and clause-scoped relationship model](../model/federal/inc15e1b/amtrak-legal-status.json).
- [Source-retention and qualification coverage](../model/federal/inc15e1b/amtrak-statutory-source-coverage.json).
- [Immutable previous-case source-status transition](../model/federal/inc15e1b/amtrak-status-transition.json).
- [Full original-source and crosswalk qualifier](../scripts/inc15e1b-amtrak-qualify.py) and [32 targeted tests](../tests/test_inc15e1b_amtrak_legal_status.py).
- Four closed INC-15E.1B JSON Schemas, including the exact original receipt, status, transition and coverage schemas.

Offline commands:

```sh
python3 scripts/inc15e1b-capture-amtrak-original.py verify
python3 scripts/inc15e1-identity-reconcile.py
python3 scripts/inc15e1b-amtrak-qualify.py
python3 -m unittest discover -s tests -p 'test_inc15e1b_amtrak_legal_status.py' -v
```

The first capture attempt on CI was safely rejected because the HTML heading markup differed from the strict parser. The corrected capture succeeded, and **the earlier failed run did not write source or legal-identity artifacts**.

## Remaining acceptance before legal ratification and website admission

This is a source-original-qualified **research baseline**, not a professionally reviewed legal interpretation. A legal reviewer must confirm the relevant enrolled law/Statutes at Large history and effective conditions, verify the current 2026 treatment against newer enactments, distinguish specific statutory exclusions from the constitutional status analyzed in Lebron, and review the scope of any status classification before ratification.

A subsequent Atlas adapter increment may admit only appropriate source-inspected, legally reviewed typed relationships through the **existing** renderer. Neither this repository change nor a name match should auto-publish the edge.

Issue #103 remains open for the **independent legal interpretation and current-epoch qualification** portion of acceptance; parent Issue #101 remains open for wider legally evidenced identity adjudication.
