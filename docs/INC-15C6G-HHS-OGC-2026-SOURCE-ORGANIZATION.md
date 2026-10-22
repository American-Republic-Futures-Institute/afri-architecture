# INC-15C.6G — HHS Office of the General Counsel, 2026 organizational restatement

**Scope:** Descriptive architecture with original publisher source custody. Not a Department-wide complete legal census, organizational reform proposal, or independent certification of every authority cited by the OGC notice.

Source: [GovInfo 91 FR 61422–61426, FR Doc 2026-19903 (September 29, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-09-29/pdf/2026-19903.pdf). [Publisher text edition](https://www.govinfo.gov/content/pkg/FR-2026-09-29/html/2026-19903.htm).

Parent [HHS INC-15C.6 #66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66), previous source exceptions [#70](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/70), execution [#82](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/82).

## Date and source custody

The source is an **issued organizational restatement published September 29, 2026**, filed September 28. It says issuance rescinds prior **OGC** Statements of Organization. The text does **not separately name an effective date**: the distinct legal operative effective date remains `null` rather than silently taking the publication date. No FY2026 ASE or FY2027 ASCRA department-wide budget proposal is deemed implemented.

The **full original five-physical-page Federal Register PDF** is retained at `evidence/hhs-ogc-2026-statement/originals/sha256/<digest>/2026-19903.pdf` with exact-byte acquisition and separate Git-custody receipts under `receipts/`. The digest/size are verified by `scripts/inc15c6g-ogc-original.py verify` and independently pinned in the approved model validator. Physical printed pages may include adjacent unrelated notices: **only the OGC content within 91 FR 61422–61426** is admitted to the institutional model. Independent WORM custody is not established.

## Source-local organization

The organizational hierarchy contains **39 observed edition-local labels**, strictly nested rather than counted as 39 peer federal agencies.

| Component kind | Publisher observations | Scope |
| --- | ---: | --- |
| Immediate Office of the General Counsel | 1 | II.A.1 |
| Office of Legal Resources | 1 | II.A.3 |
| OLR branches | 6 | Budget; Correspondence; Human Capital Services; Information Technology; Legal Information; Procurement, Policy and Planning |
| Legislation Section | 1 | II.A.4 |
| OGC divisions | 11 | II.B.1–11 |
| Subordinate divisional groups, branches, and sections | 19 | II.B.2–9 |
| **Total nonadditive organizational observations** | **39** | Edition-local OGC component roster only |

The official **11** OGC divisions are:

1. Advanced Research Projects Agency for Health Division
2. Centers for Medicare & Medicaid Services Division
3. Children, Families, and Aging Division
4. Civil Rights and Health Information Privacy Division
5. Ethics Division
6. Food and Drug Division (the Office of the Chief Counsel)
7. General Law Division
8. Disease Prevention and Health Information Technology Division
9. Public Health Division
10. National Complex Litigation and Investigations Division
11. Unaccompanied Alien Children Legal Representation Division

Organizational depth reflects all enumerated named group/branch/section headings, including CMSD **four** groups, CPD **two** branches, Ethics **two**, Food and Drug **two**, General Law **two**, Disease Prevention and Health IT **four** sections, and Public Health **three** branches. The source discusses additional *unnamed* General Law sections and supervisory roles without enumerating their legal unit identities; none are fabricated. OGC satellite offices are expressly **duty locations** rather than separate organizational components.

`model/federal/inc15c6g-ogc-hierarchy.json` preserves 39 hierarchically linked, ordered source observations with Section II text locators, printed page references, leader-role labels and nonpromotion flags. Existing parent remains `INC15C3-HHS-LINK-OGC`. No canonical federal institutional IDs are added.

## Leadership and position classes

`inc15c6g-ogc-role-classes.json` captures **22 types of explicitly named or described roles** (not 22 occupied federal positions or a certified authorized headcount). These include General Counsel, Principal Deputy, Deputies, CMS Chief Legal Officer, FDA Chief Counsel, OLR Director and branch leaders, legislation counsel, OGC division associates/deputies, E-Discovery counsel, and site-specific Managing Counsel.

The Ethics Associate General Counsel and Ethics Advice and Policy Deputy are described in the notice as simultaneously holding Designated Agency Ethics Official and Alternate Designated Agency Ethics Official roles **by secretarial delegation**. This is a publisher statement, not independent original-byte custody or qualification of the cited individual delegation instruments. All names of actual incumbents, signed additional written delegations, and authorized position counts remain unqualified.

## Legal-service clients and authority boundaries

`inc15c6g-ogc-institutional-interfaces.json` registers **39 typed source-derived relationships**, including **23** explicit division–client legal-service observations. They do not create or replace statutory, military, budgetary, adjudicative, or HHS agency-supervision edges.

| Scope | Source-supported description | What is *not* certified |
| --- | --- | --- |
| CMSD / CMS, OMHA, DAB | CMSD supplies legal services to all three | OMHA ALJ case control or DAB decisional authority |
| ARPA-H Division / ARPA-H | Legal services to ARPA-H | ARPA-H transfer into proposed Healthy Future office |
| CPD / OCR | Civil rights, conscience/religious freedom, HIPAA and Part 2 legal services | Replacement of effective OCR June 2026 internal organization |
| FDA Chief Counsel / FDA | Administratively within FDA Commissioner; OGC professional reporting to General Counsel | FDA professional command over OGC or automatic judicial authority |
| OIG / OCIG | OGC mission expressly carves out OIG matters within its jurisdiction; OCIG is separate | A new OGC authority to direct OIG independent counsel |
| CFAD versus UACLRD | UACLRD represents individual unaccompanied children and remains distinct from CFAD, ACF and ORR where those entities' matters conflict | OGC UAC counsel simultaneously representing opposing agency in same matter |
| Satellite Managing Counsel | Site-specific facilities/space/security administration only | Directing legal work, litigation positions or personnel supervision absent written delegation |
| Division legal-service clients | DPTD supplies named services to CDC, ATSDR, ONC, ASPR, OGA and ASPE; PHD to its published residual clients | Program policymaking authority or direct command over served agencies |

Other source relationships include ethics service, government-wide legal advice, the General Counsel's professional reporting, CMS CLO professional reporting, and notice-scoped prior OGC statement rescission. External authorities cited in the restatement—including **Executive Order 14215, 21 CFR 5.1105, and 62 FR 30859**—remain references requiring separately retained primary texts before independent authority certification. The present model retains the *notice's claims and citations*, not an independent legal opinion on those authorities.

## Nonadditive source populations and regression requirements

`inc15c6g-ogc-source-coverage.json` keeps eleven research populations independently labeled. **11 OGC divisions, 39 nested organizational observations, 22 role classes and 39 typed relationships are different grains.** None is additive to 29 HHS directory names, 11 Government Manual HHS entries, six OIG internal groups, 34 historical research observations, or six OCR June 2026 internal components. Whole-HHS legal first-level denominator remains `null`.

All four new models have closed JSON Schema Draft 2020-12 contracts, exact Git content pins, original PDF custody verification, publisher section/page locators and negative tests prohibiting:

- Reclassifying 11 OGC divisions into 11 new federal agencies;
- Treating OIG/OCIG as OGC-controlled;
- Inventing CMSD/DAB/OMHA appellate case authority from legal services;
- Conflating FDA **administrative location** with professional legal reporting;
- Defeating the UACLRD conflict-of-representation boundary;
- Counting satellites or role descriptions as organizational divisions;
- Claiming the notice enacted ASE/ASCRA federal budget proposals;
- Turning September 29 publication into an independently specified legal effective date;
- Tampering with source originals, citation links, source models or schemas together.

### Review commands

```sh
python3 scripts/inc15c6g-ogc-original.py verify
python3 scripts/inc15c6g-validate-ogc-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6g_ogc_models.py' -v
```

Merge only after exact-head full architecture CI passes and the source original's independently pinned SHA-256 and byte count match the retained acquisition and Git receipts.

Next research: independently effective HHS OGC organizational instruments and legal delegation registers; current OIG and DAB/OMHA operational legal limits; source-backed mission/interagency interfaces under [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56), preserving descriptive-vs-policy separation.

No website, data-repository, or policy-model changes.
