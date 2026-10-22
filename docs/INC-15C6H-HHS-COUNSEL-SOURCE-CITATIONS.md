# INC-15C.6H — Dated FDA/OGC/OIG counsel-source and legal-citation crosswalk

**Architecture scope:** Descriptive, edition-specific interpretation of official publisher records, not policy design, a legal opinion, or certification of a contemporary entire HHS legal organizational roster. Implements [#85](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/85) under HHS source-depth parents [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66) and [#70](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/70).

## Original source custody

All five new sources are retained by SHA-256 address and Git blob in `evidence/hhs-counsel-source-editions/originals/`, with an independently replayable `receipts/source-custody.json`:

| Publisher edition and scope | Publication or edition | Original SHA-256 | Original bytes |
| --- | --- | --- | ---: |
| [2025 21 CFR Part 5 official historical PDF](https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol1/pdf/CFR-2025-title21-vol1-part5.pdf), § 5.1105 and footnote | Apr. 1, 2025 edition | `d821dcb01c90f90d4d6d543c777124175908fdb8b04ffd4fecb7af1814a4d245` | 228,136 |
| [FDA final rule FR Doc 2026-11998](https://www.govinfo.gov/content/pkg/FR-2026-06-15/pdf/2026-11998.pdf), 91 FR 35884–35886 | Jun. 15, 2026, **effective the same day** | `70df495934558185f9d19b3e83f13882dc0351f25cc225ab1e2d85fb3adc2310` | 251,677 |
| [Full official Federal Register issue, June 5, 1997](https://www.govinfo.gov/content/pkg/FR-1997-06-05/pdf/FR-1997-06-05.pdf), specific OIG FR Doc 97-14611, 62 FR 30859–30865 | Jun. 5, 1997 | `75d648c24c18802812128e2708fe29340458b274d522d8e97ef38129bac1fe0d` | 2,124,538 |
| [Executive Order 14215](https://www.govinfo.gov/content/pkg/DCPD-202500277/html/DCPD-202500277.htm), §7 and §8(b) | Issued Feb. 18, 2025 (Federal Register Feb. 24) | `1399f0857b1e4fe2b4c7fa9c3bb2fde0ee199ea372c47cdf4f3fecddc2994593` | 15,803 |
| [FDA Overview Organization Chart, text edition](https://www.fda.gov/about-fda/fda-organization-charts/fda-overview-organization-chart-text-version), Chief Counsel (DCAA) | Oct. 13, 2026 | `181fd936025d6c739c45dbd329366efcc7695f55d8e160e38c4c403d43793e32` | 31,184 |

The sixth underlying original is the prior retained [September 29, 2026 HHS OGC restatement](https://www.govinfo.gov/content/pkg/FR-2026-09-29/pdf/2026-19903.pdf), SHA-256 `e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76`, under `evidence/hhs-ogc-2026-statement/`. Its independently specified distinct legal effective date remains `null`.

The 1997 source is the **entire 251-page Federal Register issue**, not a misleadingly labeled original individual OIG article: only **62 FR 30859–30865, FR Doc 97-14611** supplies the OIG architecture. Raw FDA chart HTML is an **October 13, 2026 publisher observation**, not a signed CFR authority or an archived original of the superseded September 16 chart. Original custody is Git custody, **not externally verified WORM**.

## The legally material source-version conflict

| Date | Primary-source action | Legal/source disposition |
| --- | --- | --- |
| April 1, 2025 edition | 21 CFR §5.1105 describes the Office of the Chief Counsel's mailing address; its editorial footnote identifies FDA administrative placement and HHS OGC membership | Historically published regulatory text and editorial source claim; NOT current post-repeal regulation |
| June 15, 2026 | FDA final rule revises §5.1100 and **removes §§5.1105 and 5.1110**, effective immediately | The previous CFR sections are no longer operative **on and after this effective date**. Revised §5.1100 points to FDA's website and Staff Manual Guides |
| September 29, 2026 | HHS OGC source states FDA Chief Counsel is administratively in the Office of the FDA Commissioner and professionally within HHS OGC, but cites **21 CFR §5.1105** | The cited CFR section had already been removed. Its citation is obsolete; the notice's organizational statement remains a publisher-described relationship subject to independent legal qualification |
| October 13, 2026 | FDA publisher chart separately states that the Office of the Chief Counsel **reports directly to HHS General Counsel** and **advises the FDA Commissioner** | Post-repeal corroboration of a described professional reporting/advisory relationship; not proof of an individually signed delegation or of §5.1105's continued existence |

**Interpretation boundary:** Removing a CFR **organizational information and address provision** does **not itself abolish FDA's Office of the Chief Counsel** or prove its HHS professional relationship ended. Conversely, the later FDA chart does **not resurrect the repealed text** or replace missing signed appointment/delegation instruments. The canonical references `INC15C3-HHS-LINK-OGC` and `INC15C3-HHS-LINK-FDA` remain unchanged.

## Historical OIG counsel and its distinct jurisdiction

The 1997 HHS OIG Chapter AF statement published **seven OIG main organizational components** (AFA, AFC, AFE, AFF, AFG, AFH and AFJ) and **four AFG/OCIG subordinate counsel components** (Advice, Civil Recoveries, Administrative Litigation, Industry Guidance). These are retained as **11 edition-local publisher observations**, not 11 independent contemporary federal institutions.

1997 OCIG counsel provides legal services to the Inspector General and OIG units; the 2026 OGC restatement expressly excepts OIG matters solely within OIG jurisdiction. The OIG 1997 historical organization, December 2025 publisher group names, and September 2026 OGC counsel exception are independently scoped source populations. They must not be summed, treated as the same edition, or used to infer present-day OIG statutory completeness. The 1997 OCIG source also describes coordination with HHS OGC; that is not an OGC legal supervisory override.

## EO 14215 and law-dependent interpretation

The HHS OGC September 2026 mission invokes [Executive Order 14215](https://www.govinfo.gov/content/pkg/DCPD-202500277/html/DCPD-202500277.htm) with the qualifying language **“to the maximum extent permitted.”** The order's **§7** describes presidential and Attorney General interpretation rules. Its **§8(b)** (not §8(a)'s severability clause) expressly preserves authority granted by law and requires implementation consistent with applicable law.

This increment records the actual source language and version. It **does not** certify the applicability of every executive-order provision to every agency action, the constitutionality or legal sufficiency of executive directives, or any specific individual attorney's signed authority.

## Architecture datasets

Five nonadditive research collections are registered, moving the catalog from **300 to 305**:

| Model | Grain and population |
| --- | --- |
| `inc15c6h-counsel-authority-source-editions.json` | Six exact original publisher editions |
| `inc15c6h-counsel-citation-status-transitions.json` | Seventeen versioned citation assertions and status changes |
| `inc15c6h-oig-1997-counsel-history.json` | Seven historical OIG and four subordinate OCIG organizational mentions |
| `inc15c6h-counsel-authority-boundaries.json` | Eleven typed historical/publisher-specific interfaces and legal limits |
| `inc15c6h-counsel-source-coverage.json` | Fourteen nonadditive source-cohort registers |

All have closed JSON Schema Draft 2020-12 definitions. Each source-derived record must retain original SHA-256/Git source identity and publisher epoch. `21 CFR 5.1105` has machine-readable `removed_before_citing_edition` status in the September 2026 OGC crosswalk. Issued/extracted publisher text is distinguished from independently qualified legal authority and from contemporary agency operational reality.

```sh
python3 scripts/inc15c6h-capture-source-editions.py verify
python3 scripts/inc15c6h-validate-counsel-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6h_counsel_models.py' -v
```

## Known unresolved matters

No current independently qualified signed FDA OCC appointment or delegation, comprehensive HHS OIG delegation inventory, operative post-1997 OCIG organizational statement, independent legal interpretation of EO 14215 across HHS programs, or full contemporary legal first-level HHS organizational denominator is established. OGC does not gain DAB/OMHA ALJ appellate command or OIG investigative supervision from a legal-services statement. Nothing in this increment executes FY2026 ASE or FY2027 ASCRA budget proposals.

**Next architecture research:** current primary-source versioned OIG/OCIG statutory and organizational qualification, FDA current Staff Manual Guides and signed legal-delegation sources, then broader INC-16 mission and cross-institution interface qualification. No ARFI policy, data repository, or website changes.
