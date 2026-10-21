# INC-15C.6E — HHS 2025–2026 publisher proposals and ARPA-H observed offices

**Scope:** descriptive enterprise architecture, **not** HHS reorganization implementation or a proposal to change federal policies. Parent [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66); execution [#74](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/74).

## Primary-source acquisition result

[Acquisition PR #75](https://github.com/American-Republic-Futures-Institute/afri-architecture/pull/75) probed six edition-specific official URLs using strict path/HTTPS and original-byte verification. [Custody PR #76](https://github.com/American-Republic-Futures-Institute/afri-architecture/pull/76) preserved two original ARPA-H HTML pages, as independently replayable bytes and acquisition/Git receipts:

| Publisher source | Edition / observation | Git original custody | Limitation |
| --- | --- | --- | --- |
| [FY2026 HHS General Departmental Management Congressional Justification](https://www.hhs.gov/sites/default/files/fy-2026-gdm-cj.pdf) | FY2026 budget request, published in 2025 | **No** — HTTP 403 to archival runner | Public publisher PDF text/page 6 reviewed separately; not a signed operative reorganization |
| [FY2027 HHS General Departmental Management Congressional Justification](https://www.hhs.gov/sites/default/files/fy-2027-gdm-cj.pdf) | FY2027 budget request, published in 2026 | **No** — HTTP 403 | Public publisher PDF text/page 6 reviewed separately; revised budget proposal only |
| [ARPA-H Our People](https://arpa-h.gov/about/people) | Raw publisher snapshot retrieved Oct. 21, 2026 | **Yes** — SHA-256 `149e49bd3f1593b82027e7151414d907a6960cf03f22450ef6c4f9bcbfc20646` | Personnel/affiliation publication, not complete organizational chart or legal roster |
| [ARPA-H Timeline](https://arpa-h.gov/about/timeline) | Raw publisher snapshot retrieved Oct. 21, 2026; dated events inside | **Yes** — SHA-256 `b30fa39c015976657905299a7aee3ee888dc3bfcaffde4f55e0431684e9bdcb3` | Event chronology, not present-day complete office count |
| [DAB Organizational Overview](https://www.hhs.gov/about/agencies/dab/about-dab/organizational-overview/index.html) | Web page last reviewed May 19, 2021; publisher text observed Oct. 2026 | **No** — HTTP 403 | Historical editorial text describes adjudication and organization without a signed current legal order |
| [OMHA Organizational Chart](https://www.hhs.gov/about/agencies/omha/about/organizational-chart/index.html) | Web page last reviewed Jan. 12, 2026 | **No** — HTTP 403 | Page says OMHA reports directly to Secretary, but this alone does not certify an independently reviewed legal command/delegation instrument |

Acquisition source run `39694381413`, artifact `12389997023`. Exact ARPA-H original Git blob SHA-1 values: `9602a7f609a623afd1f05c17ede6f6c907164416` (people) and `d007f32fab4557f968e1145281001fe15af7c93a` (timeline). Paths: `evidence/hhs-arpah-2026-observation/originals/`, with distinct receipts under `receipts/`. No external WORM certification or inferred effective date.

## Two HHS budget proposals are not a current department hierarchy

**FY2026 General Departmental Management budget** requests consolidation of the Office for Civil Rights (OCR), Office of Medicare Hearings and Appeals (OMHA), Departmental Appeals Board (DAB), and OHRP into an **Assistant Secretary for Enforcement (ASE)** structure. Separately, it discusses consolidating ARPA-H and select ASPR programs under **Assistant Secretary for a Healthy Future**, and ASPE/AHRQ/NCHS/ORI under the **Office of Strategy**.

**FY2027 General Departmental Management budget**, published in 2026, describes **updates to those earlier proposals**: a new proposed **Assistant Secretary for Civil Rights and Appeals (ASCRA)** target incorporating OCR, OMHA, DAB, OHRP, new Office for Animal Research Protections and Office of Research Integrity. It also describes separating the CIO function as a Staff Division and revising external/legislative engagement functions.

The FY2026 ASE target and FY2027 ASCRA target overlap functionally but are **not automatically the same canonical legal organization**. The source does not establish the FY2026 design was implemented, abolished or legally succeeded. Every source-budget reorganization record has `lifecycle_state: proposed_not_implemented` — meaning *implementation has not been qualified by ARFI*, not a positive claim that no implementation occurred.

Public budget PDF language, even where appearing to describe an office as an appropriation line, must not be interpreted as final appropriated authority, independently effective organizational orders, a signed ALJ direction or a judicial/adjudicative command edge. Current operative instrument identifiers, effective dates and certified target legal institution IDs remain `null`.

## Contemporary ARPA-H publisher-office names

The retained ARPA-H personnel source shows ten useful **named office/division affiliations** under staff, mission, or program manager sections:

| Source section | Publisher names | Count |
| --- | --- | ---: |
| Staff roles | Business Innovation Division; Comptroller Division; Division of International Affairs; Division of Government Relations and Strategy; Office of Information Technology and Data Innovation; Office of Commercialization; Strategic Affairs Office | 7 |
| Mission Office leadership | Health Science Futures; Proactive Health | 2 |
| Program-manager affiliation | Scalable Solutions | 1 |

Each name is anchored to a role phrase in the **exact retained HTML bytes**, not an independently certified legal office. The historical timeline separately records October 20, 2025 Alicia Jackson directorship, September 25, 2025 Scalable Solutions program launch, December 19, 2024 Proactive Health program launches and September 29, 2023 Resilient Systems program launch. Timeline mentions are distinct dated events, not proof every named mission office remains active in October 2026.

Reconcile these as **unratified edition-local observations** against the previously preserved ARPA-H FY2025 budget chart containing 14 proposed named office labels and one director root, including its *in-progress 14-to-eight reduction note*. Neither report certifies an implemented office reduction or yields a valid additive office count. No canonical legal ARPA-H office ID was created in this increment.

## Architecture implementation and validation

Three new research collections in `model/federal/`:
1. `inc15c6e-hhs-budget-proposal-epochs.json` — **6** budget proposal observations in two separate publication editions, with explicit revisions, source access receipts and unqualified operative statuses.
2. `inc15c6e-arpah-live-office-observations.json` — **10** retained HTML publisher affiliation observations plus **4** historical timeline events.
3. `inc15c6e-hhs-source-lifecycle-coverage.json` — **6** publisher acquisition populations and **4** unchanged HHS exception crosswalks.

Each collection has a closed JSON Schema in `schemas/`. The verifier pins the exact repository Git blobs, legally bounded fields, six-source acquisition receipts, two original ARPA-H HTML bytes, publisher role phrases and dated timeline headings, unchanged HHS prior source identities and nonadditive denominators. Negative tests reject fabricated FY2026/FY2027 budget-original custody, invented operative successors, assumed ARPA-H office counts, signed powers, changes to earlier canonical IDs and source/schema co-forgery.

```sh
python3 scripts/inc15c6e-validate-original-custody.py
python3 -m unittest discover -s tests -p 'test_inc15c6e_original_custody.py' -v
python3 scripts/inc15c6e-validate-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6e_models.py' -v
```

**Coverage limits:** the FY2026/FY2027 GDM PDF originals and DAB/OMHA current HTML were blocked and therefore do not have original custody. The complete HHS first-level legal denominator remains `null`; no current independent ALJ authority, signed organizational reorganization or exact federal component count was certified. Earlier HHS 29-name index, 11 Government Manual nodes, six OIG internal groups, 34 historical DAB/OMHA/ARPA-H notice/chart observations and these new records overlap and must never be summed as distinct institutions.

Next source qualification needs a published operative organizational statement, Federal Register effective instrument and independently checked effective date for the relevant 2025/2026 office changes, alongside an authorized original distribution of the currently blocked HHS budget PDFs. [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56) remains a distinct mission-and-interface research layer.

No policy, AFRI data or website changes.
