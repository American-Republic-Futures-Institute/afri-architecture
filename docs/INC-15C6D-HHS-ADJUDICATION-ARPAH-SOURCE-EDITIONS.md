# INC-15C.6D — Historical HHS adjudicative and ARPA-H institutional source editions

**Disposition:** Source-original-backed historical research, not an authoritative 2026 HHS institutional roster. See [#70](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/70), parent [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66), and preservation PRs #71–72.

## Independently retained official publisher originals

Five original PDF editions are SHA-256-addressed beneath `evidence/hhs-dab-omha-arpah-historical/originals/`. Their acquisition receipt, separate Git-custody receipt, source-size, edition, page count and Git blob fingerprints are retained in `receipts/`. The acquisition artifact was independently captured by workflow `39691326721` (artifact `12389115569`). Original Git custody is established, but **independent WORM custody is not certified**.

| Source publication | Publisher original URL | Physical PDF pages | Structural extraction |
| --- | --- | ---: | --- |
| March 2, 2012 DAB organization/functions notice (FR Doc. 2012-5027) | [GovInfo](https://www.govinfo.gov/content/pkg/FR-2012-03-02/pdf/2012-5027.pdf) | 2 | Six selected historical organizational references |
| June 23, 2005 OMHA organizational establishment notice (FR Doc. 05-12468) | [GovInfo](https://www.govinfo.gov/content/pkg/FR-2005-06-23/pdf/05-12468.pdf) | 2 | Immediate office, field group and four then-named field offices |
| January 20, 2015 OMHA organizational amendment (FR Doc. 2015-00743) | [GovInfo](https://www.govinfo.gov/content/pkg/FR-2015-01-20/pdf/2015-00743.pdf) | 1 | Revised headquarters/field-office publication |
| May 27, 2022 ARPA-H establishment notice (FR Doc. 2022-11420) | [GovInfo](https://www.govinfo.gov/content/pkg/FR-2022-05-27/pdf/2022-11420.pdf) | 3 | Initial ARPA-H reference and two selected early office labels |
| FY2025 ARPA-H Congressional Justification, published 2024 | [ARPA-H](https://arpa-h.gov/sites/default/files/2024-03/ARPA-H%20FY%202025.pdf) | 51 | Exactly 15 visual chart boxes, physical PDF page 6 / printed page 2 |

The Federal Register document-specific PDFs may also display adjacent content from the printed Federal Register page. Page-count and provenance records describe the **exact downloaded PDF bytes**, while model observations refer only to the HHS source notice segments. The selected source observation set is not an independently certified exhaustive statement of every function or office in each source notice.

## Date-separated organizational evidence

The 2012 DAB statement records the Immediate Office of the Chair; Appellate, Civil Remedies, Medicare Operations, Alternative Dispute Resolution and Operations Divisions. The six research references are historical names from the source amendment, **not six separately established legal agencies or six verified current reporting relationships**.

The 2005 OMHA publication describes an Immediate Office and a group of four then-named field offices, distinct from the 2015 reorganization publication naming a Chief Judge's Office, Office of Operations, Office of Programs, and a grouped field-office population. These are **different source epochs**. Four field offices in a 2005 statement are not a claim about 2015 or 2026 field-office counts. The January 2015 change does not warrant collapsing former locations into current legal office identities.

The 2022 ARPA-H Federal Register notice announces initial establishment, effective May 24, 2022, within the NIH organizational statement as it then existed. That publication cannot independently establish present organizational location, independence, or downstream statutory reporting.

The ARPA-H FY2025 request includes **15 displayed blue chart boxes**: the Office of the Director plus **14 printed office labels** across mission and management categories. The figure's own note says ARPA-H is *adjusting* its organization chart to reduce offices **from 14 to 8**. The completed eight-office arrangement is **not demonstrated** by this source. No reconciliation forcibly collapses the original 14 labels into eight, and no current office IDs are minted.

## Model boundary and source-coverage contract

Three additional source-qualified collections are registered:

- `model/federal/inc15c6d-hhs-historical-source-office-observations.json`: 19 edition-local selected publication observations from four separate Federal Register notices.
- `model/federal/inc15c6d-arpah-fy2025-organization-chart.json`: 15 manually checked image-chart boxes from physical PDF page 6, with the **planned-not-implemented** adjustment preserved.
- `model/federal/inc15c6d-hhs-historical-source-coverage.json`: five disjoint source-edition registers. The 34 total observations are **research rows only** and cannot be interpreted as 34 current institutions, or added to the earlier HHS 29-name index, 2025 Government Manual 11-entry HHS subtree, or six OIG internal source office groups.

The existing `INC15C3-HHS-LINK-*` and `INC15C6-HHS-EXCEPTION-*` references remain stable. No canonical institution or office IDs were added. Neither current DAB appellate jurisdiction, OMHA ALJ case control, ARPA-H current HHS supervision, budget execution, signed delegation, or complete current first-level HHS institution count is independently certified.

## Validation and future qualification

All three models have closed JSON Schemas and pinned original Git blobs, source editions, historical labels and scope flags.

```sh
python3 scripts/inc15c6d-validate-original-custody.py
python3 -m unittest discover -s tests -p 'test_inc15c6d_original_custody.py' -v
python3 scripts/inc15c6d-validate-historical-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6d_historical_models.py' -v
```

Adversarial tests reject source-byte changes, time-period collapse, signed-jurisdiction overclaim, fictitious 2026 legal denominators, newly minted canonical IDs and a falsely implemented ARPA-H eight-office plan. Exact-head full-repository architecture catalog qualification is required before merge.

**Remaining research:** the direct HHS 2025 organizational-index HTML and current department-wide organizational structure remain unavailable as original publisher bytes; DAB/OMHA current organization pages are still missing exact original HTML; updated post-2024 ARPA-H implemented office structure and any subsequent Federal Register statement changes need independently retained source editions and qualified chronology. Detailed statutory interpretations and policy recommendations remain out of scope. Mission and cross-government interfaces belong to [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56).

No ARFI website or data-repository modifications were made.
