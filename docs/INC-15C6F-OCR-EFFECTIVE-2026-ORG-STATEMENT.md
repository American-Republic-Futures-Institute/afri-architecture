# INC-15C.6F — HHS Office for Civil Rights: effective 2026 organization, 2023 predecessor, and bounded relationships

**Architecture classification:** historical/operative, source-specific description of the *Office for Civil Rights (OCR) internal organization*. It is not a whole-HHS institutional census, a policy recommendation, or proof of the proposed Assistant Secretary for Enforcement / Assistant Secretary for Civil Rights and Appeals consolidation.

Primary issue: [#78](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/78); parent: [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66). OCR retains the preexisting publisher identity `INC15C3-HHS-LINK-OCR` under `ORG-FED-EXE-DEP-HHS`; no new canonical institution IDs are minted.

## Evidence custody and publication date

Exact GovInfo original PDF bytes are retained, not transcribed search results.

| Original Federal Register notice | Printed pages | Approved / effective | Original bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| [88 FR 12954–12955, FR Doc. 2023-03892](https://www.govinfo.gov/content/pkg/FR-2023-03-01/pdf/2023-03892.pdf), published March 1, 2023 | 12954–12955 | February 10 / February 25, 2023 | 195,496 | `7035eea1497113c5964fce2f6d3862b31c5452e34a0b80b1ee572bb50610cfad` |
| [91 FR 39626–39627, FR Doc. 2026-13142](https://www.govinfo.gov/content/pkg/FR-2026-06-30/pdf/2026-13142.pdf), published June 30, 2026 | 39626–39627 | May 14 / June 28, 2026 | 208,043 | `973323350377319d1e737d7b476ab90d18f754bd9d2505521c66b97524a22498` |

Original Git blob SHA-1 values: 2023 `26debd0afc20c528a022702d1a3b5a604b6966ed`, 2026 `ee5086ddd4390e228a4f424505968faff91e2efb`. Both source PDFs are two physical pages. Acquired by source workflow `39786687439`, artifact `12429386599`, and promoted after independent rendering/text/edition checks. Original paths under `evidence/hhs-ocr-org-2023-2026/originals/`, with *separate* acquisition and Git-custody receipts. No external WORM archive certification is asserted. OCR-specific statement sections, **not every unrelated notice occupying the printed pages**, are the qualified populations.

## What became effective on June 28, 2026

The 2026 notice explicitly says Secretary approval occurred May 14 and the OCR reorganization **took effect June 28**. It replaces Chapter AT `AT.00 Mission` and `AT.10 Organization`, and amends specified `AT.20 Functions` subsections, rather than republishing the entire 2023 functions register.

| Published local code | 2023 AT.10 edition (88 FR 12954) | Effective 2026 AT.10 edition (91 FR 39626) | Source crosswalk interpretation |
| --- | --- | --- | --- |
| AT | Office of the Director | Immediate Office of the Director | Same source code, changed published label |
| ATA | Operations and Resources Division | Operations and Resources Division | Same code and label |
| ATB | Policy Division | Civil Rights Division | Same code, changed name and described functions |
| ATC | Health Information Privacy, Data, and Cybersecurity Division | Health Information Privacy, Data, and Cybersecurity Division | Same code and label; AT.20 adds substance-use disorder confidentiality reference |
| ATD | Enforcement Division | Enforcement Division | Same code and label; amended field, intake and case functions |
| ATE | Strategic Planning Division | Conscience and Religious Freedom Division | Same code, newly published subject-matter identity/functions |

These are **six OCR-internal entries in each published AT.10 edition**. They are not 12 distinct operating offices across current time, six new federal agencies, or independently established proof that each prior office is legally identical to the subsequent code occupant. The 2023 *statement text* is superseded as of the 2026 notice; this does not itself mean the Department, its OCR identity, or all former positions legally disappeared. The 2026 publication establishes an effective-date baseline, **not independent verification of every officeholder or change through October 2026**.

## All nine notice clauses and authority limit

The 2026 original is traceable by printed page and Roman clause:

| Clause | Published operation | Printed pages |
| --- | --- | --- |
| I | Chapter AT outline identifies mission, organization and functions sections | 39626 |
| II | Replaces `AT.00` mission, including civil rights, conscience/religious freedom and health information privacy and security | 39626 |
| III | Replaces `AT.10` six-entry OCR internal organization | 39626 |
| IV | Amends Director `AT.20 A` terminology/coordination, including public affairs and intergovernmental/external affairs | 39626 |
| V | Replaces `AT.20 C` with Civil Rights Division functions; deputy director reports to OCR Director | 39626–39627 |
| VI | Adds substance use disorder patient records, 42 CFR Part 2, to `AT.20 D`; *does not* replace entire subsection | 39627 |
| VII | Replaces `AT.20 E` Enforcement Division functions (field operations, central intake, case processing and subject-matter coordination) | 39627 |
| VIII | Replaces `AT.20 F` with Conscience and Religious Freedom Division functions; deputy director reports to Director | 39627 |
| IX | Preexisting delegations/redelegations to positions of affected organizations, or successors, continue only *if consistent* with the reorganization, pending further orders | 39627 |

Clause IX is an **explicit condition on continuing existing delegations**, not an independently certified register of delegated powers or confirmation that a particular named officer has a current signed delegation. No HHS-wide command or adjudicative appeals chain is inferred from this notice.

## Typed evidence-backed relationships

`inc15c6f-ocr-typed-source-relationships.json` holds exactly 13 records of five types:

- Six `OCR_internal_organizational_composition` relationships from the existing OCR publisher reference to the six **edition-local** 2026 AT.10 entries.
- One `source_notice_effective_date` statement recording June 28, 2026.
- Three `publisher_described_reporting` observations: Deputy Directors for Civil Rights, Enforcement, and Conscience and Religious Freedom report to the OCR Director. These are **role statements**, not newly minted sovereign offices or general interagency command edges.
- One `existing_delegations_continued_subject_to_consistency` observation scoped to Roman clause IX.
- Two `publisher_described_coordination` observations for OCR Director collaboration in communications/external engagement with the Assistant Secretary for Public Affairs and the Director of the Office of Intergovernmental and External Affairs, **not command or statutory delegation**.

Function overlap or organizational visual placement cannot create certified authority edges. The publication neither establishes DAB/OMHA ALJ case control nor confirms any implementation of [FY2026 ASE / FY2027 ASCRA budget proposals](../model/federal/inc15c6e-hhs-budget-proposal-epochs.json). Previous HHS populations (29 indexed names, 11 Government Manual entries, six OIG office groups and historical notice populations) stay separate and nonadditive.

## Machine-readable architecture and qualifications

- `model/federal/inc15c6f-ocr-dated-organization-epochs.json`: twelve edition-local entries, six per source year; stable source code crosswalks and explicit epoch/identity nonpromotion.
- `model/federal/inc15c6f-ocr-2026-notice-clauses.json`: all nine Roman notice clauses and exact `AT.00`, `AT.10`, `AT.20` operational amendment types.
- `model/federal/inc15c6f-ocr-typed-source-relationships.json`: thirteen bounded source relationships; no HHS-wide organizational or delegated command certifications.
- Three closed JSON Schema Draft 2020-12 contracts and pinned original Git blobs.
- `scripts/inc15c6f-validate-ocr-models.py` and `tests/test_inc15c6f_ocr_models.py` replay the source custody and preceding HHS nonimplementation models and reject invented legal status, wrong effective dates, unsupported office identities, added powers, and source/schema co-forgery.

```sh
python3 scripts/inc15c6f-validate-original-custody.py
python3 -m unittest discover -s tests -p 'test_inc15c6f_original_custody.py' -v
python3 scripts/inc15c6f-validate-ocr-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6f_ocr_models.py' -v
```

**Unresolved:** full HHS organizational and current legally qualified first-level denominator, the original HHS department-wide organizational HTML, any later OCR operative organizational amendments, a complete current signed-delegation inventory, independent WORM, DAB/OMHA authority and complete departmental mission/interagency interfaces. These remain separate tasks under parent [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66), [#70](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/70), and subsequent [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56).

No policy, website or ARFI data-repository changes.
