# INC-15C.6 — HHS Office of Inspector General internal organization and exceptional institutional boundaries

**Status:** source-backed descriptive research; original HHS-wide organizational HTML and independently qualified legal first-level structure still unavailable. Parent: [INC-15C #50](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/50); execution [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66).

## Source custody and dates

See [INC-15C.6 original OIG custody](INC-15C6-HHS-OIG-ORIGINAL-CUSTODY.md). Two exact official OIG originals have Git content custody:

1. OIG organizational page `https://oig.hhs.gov/about-oig/organization-chart/`, retrieved from the publisher during this increment, original SHA-256 `97fd0513471e013ee8de2534f81184621c7babb7bf2f1d3181f935df275300a6`. **Its HTML has no independently established as-of date equal to the PDF date.**
2. One-page OIG chart at `https://oig.hhs.gov/documents/root/9810/2025-oig-org-chart-web.pdf`, **as of December 23, 2025**, SHA-256 `068fa03980a4add3be412750ce63b0cc435c3d77f54a1153347b19e1200dc3ea`. The exact PDF was rendered and visually inspected independently.

The seven-source probe permanently distinguishes these from blocked original HHS-wide chart HTML, HHS DAB and OMHA HTML, Global Strategy PDF, and rejected redirected ASPR PDF. It is false to assert those other originals were acquired. The original HTML's six OIG office group headings are separately reconciled with six visually related **leadership position columns** in the dated PDF. Those role titles cannot be promoted to six statutory office IDs.

## OIG source office groups — six headings, not six HHS first-level agencies

| Publisher OIG HTML heading | PDF-related 2025 leadership column | PDF column |
| --- | --- | ---: |
| Immediate Office of Inspector General | Deputy Inspector General for Immediate Office, Chief of Staff | 1 |
| Office of Audit Services | Deputy Inspector General for Audit Services | 2 |
| Office of Evaluation and Inspections | Deputy Inspector General for Evaluation and Inspections | 4 |
| Office of Management and Policy | Deputy Inspector General for Management and Policy | 6 |
| Office of Investigations | Deputy Inspector General for Investigations | 5 |
| Office of Counsel to the Inspector General | Chief Counsel to the Inspector General | 3 |

The PDF separately depicts Inspector General, Principal Deputy Inspector General, Senior Counselor, subordinate Assistant IG positions, advisors and IT/data leadership positions. Repeated identical role titles are **not individual legal offices** and do not justify independently certified position slots. Diagram lines are published visual structure, not proof of statutory powers, supervisory order, signed delegation or adjudicative jurisdiction. Office membership is research-only beneath the earlier `INC15C3-HHS-LINK-OIG` predecessor, and no canonical suboffice IDs have been minted.

## HHS exceptional institutional identities

`model/federal/inc15c6-hhs-institutional-exception-boundaries.json` preserves the existing publisher-index identities and historical exceptions, without changing predecessor IDs:

| Existing source identity | Source-specific treatment | Publisher-original status |
| --- | --- | --- |
| `INC15C3-HHS-LINK-OIG` | Inspector General audit, investigation and evaluation **oversight boundary**, independent legal examination required | Own HHS OIG original HTML and PDF preserved; HHS-wide chart still unavailable |
| `INC15C3-HHS-LINK-DAB` | Departmental Appeals Board **adjudication boundary**; do not assume organizational placement proves appellate jurisdiction | DAB chart HTML request HTTP 403; public publisher text observed, original not retained |
| `INC15C3-HHS-LINK-OMHA` | Medicare administrative hearing **adjudication boundary**; publishing a reporting line does not certify ALJ case control | OMHA chart HTML request HTTP 403; original not retained |
| `INC15C3-HHS-LINK-ARPA-H` | Separately named health-research entity; HHS index identity remains provisional, no automatic NIH identity collapse | Original HHS index blocked; ARPA-H public FAQ locator is not a retained publisher original |

Public reference locators for further qualification: [DAB chart](https://www.hhs.gov/about/agencies/orgchart/dab/index.html), [OMHA chart](https://www.hhs.gov/about/agencies/omha/about/organizational-chart/index.html), [ARPA-H FAQ](https://arpa-h.gov/about/faqs), and [HHS OIG](https://oig.hhs.gov/about-oig/organization-chart/). Each unarchived link is explicitly **source text / research locator only**, not source-original custody.

**Edition accounting:** The HHS 2025-reviewed index has 29 published names; the separately retained 2025 Government Manual HHS subtree contains 11 source nodes; the separately retained OIG HTML has six *internal OIG office group headings*. The four exceptions are a **subset** of the HHS 29-name index. None of 29 + 11 + 6 + 4 can be added for a federal organizational total. These are overlapping populations, different levels and different editions.

## Machine checks

- `model/federal/inc15c6-hhs-oig-source-office-groups.json` — six anchored publisher HTML office groups, separate 2025 role columns, all canonical IDs null.
- `model/federal/inc15c6-hhs-institutional-exception-boundaries.json` — exactly four unchanged exceptional source identities and their original-byte custody qualifiers.
- Both have closed JSON Schema 2020-12 contracts. `scripts/inc15c6-hhs-model-validation-core.mjs` pins 29-name HHS source index, prior 11-to-29 crosswalk, original ARCH04B predecessor blobs, HHS OIG original bytes and the new manifest entry. It enforces that no 2025 directory publication or OIG chart asserts a complete 2026 legal department roster.
- Positive and adversarial tests reject source/edition swaps, department first-level denominator inflation, false OIG subordinate command, unreviewed DAB/OMHA adjudication jurisdiction, invented ARPA-H ID, unauthorized schema fields, or new current legal reporting lines.

```sh
node scripts/validate-inc15c6-oig-original.mjs
node scripts/validate-inc15c6-model.mjs
node --test tests/inc15c6-hhs-oig-custody.test.mjs tests/inc15c6-hhs-model.test.mjs
```

**Acceptance is scoped:** original OIG sources and six internal groups are source-preserved; full HHS original HTML, direct HHS departmental chart, present-day legal census, independent statutory oversight/adjudication classification, external WORM archive and current officeholder/staffing details remain unresolved. These are not reasons to invent organizational membership or give higher confidence to the dated group labels.

The architecture remains descriptive and source-evidenced. Policy modeling, website, and ARFI data repo are unchanged.
