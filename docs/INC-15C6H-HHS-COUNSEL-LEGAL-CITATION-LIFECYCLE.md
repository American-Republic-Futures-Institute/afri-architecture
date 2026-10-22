# INC-15C.6H — HHS counsel authority-source lifecycle

**Status:** Source-versioned descriptive institutional architecture, not an independent legal opinion, policy position, completed authority inventory or complete current HHS institutional census.

[Issue #85](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/85). Predecessor [INC-15C.6G #82](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/82). Parents [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66) and [#70](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/70) remain open.

## Five newly retained original publisher editions

| Original retained source | Original date | Source qualification |
| --- | --- | --- |
| [FDA final rule, FR Doc 2026-11998](https://www.govinfo.gov/content/pkg/FR-2026-06-15/pdf/2026-11998.pdf), 91 FR 35884–35886 | published **and expressly effective June 15, 2026** | Removes **21 CFR §§ 5.1105 and 5.1110**, revises **§ 5.1100** directing readers to FDA website and Staff Manual Guides |
| [2025 Title 21 CFR Part 5 official edition](https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol1/pdf/CFR-2025-title21-vol1-part5.pdf) | April 1, 2025 edition | § 5.1105 primarily provides the FDA Chief Counsel **mailing address**; a contemporaneous footnote describes FDA administrative placement and HHS OGC affiliation; not an individual signed legal-power delegation |
| [1997 official entire Federal Register issue](https://www.govinfo.gov/content/pkg/FR-1997-06-05/pdf/FR-1997-06-05.pdf) | published June 5, 1997 | **FR Doc 97-14611**, **62 FR 30859–30865**, within 251-page whole issue. Only the HHS OIG statement is qualified; adjacent agency notices/other pages are not OIG. Source records consolidated historical OGC Inspector General Division and litigation-coordination functions into **OCIG (AFG)** under OIG |
| [Executive Order 14215](https://www.govinfo.gov/content/pkg/DCPD-202500277/html/DCPD-202500277.htm) | issued February 18, 2025 | Section 7 President/Attorney General legal interpretation direction, read with **Section 8 applicable-law and statutory-authority limitations**; not an unqualified independent transfer of the Secretary's authority to HHS OGC |
| [FDA organization chart, text version](https://www.fda.gov/about-fda/fda-organization-charts/fda-overview-organization-chart-text-version) | **October 13, 2026 source-publisher edition** | FDA Chief Counsel office is observed **reporting to HHS General Counsel** and **advising the FDA Commissioner**, after FDA removed § 5.1105 |

The sixth primary source is the already-retained [September 29, 2026 HHS OGC restatement (FR Doc 2026-19903)](https://www.govinfo.gov/content/pkg/FR-2026-09-29/pdf/2026-19903.pdf), original SHA-256 `e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76`.

**Original-byte custody:** the five additional originals are preserved under `evidence/hhs-counsel-source-editions/originals/`, with an independently replayed, byte-addressed `receipts/source-custody.json`. Source validator checks immutable per-edition SHA-256, Git blob, size, selected textual markers, PDF physical page counts, publisher allowlisted URLs and source-local effective-date qualifications. The 1997 source retained is the **whole original issue**, not a falsely relabeled seven-page original of the HHS notice. WORM-external archival certification remains `false`. Do not equate source custody with a legally independent adjudication of organizational powers.

## The dated citation conflict and its limits

| Date | Official-source fact | Legal-status disposition |
| --- | --- | --- |
| **April 1, 2025** | Title 21 CFR includes § 5.1105 (FDA OCC address and footnote describing HHS OGC affiliation) | `operative_at_edition` for the historical publisher edition; not proof of a current 2026 delegation |
| **June 15, 2026** | FDA final rule explicitly removes § 5.1105 and § 5.1110 | `operative_at_edition`, expressly effective regulatory text |
| **June 15, 2026** | FDA final rule rewrites § 5.1100 to point to website/Staff Manual Guides | `operative_at_edition`; public organizational information source updated |
| **September 29, 2026** | HHS OGC notice cites removed § 5.1105 while describing OCC administrator at FDA and professionally within OGC | **`removed_before_citing_edition`** for the source citation; cannot label the removed section as currently operative authority |
| **October 13, 2026** | FDA current chart explicitly publishes OCC reporting to HHS General Counsel and advising Commissioner | **`publisher_described_organizational_placement`**; supports continuing office/reporting observation independently of the revoked CFR contact-information section |

Crucial distinction: **removal of a regulatory provision describing an office's contact address does not by itself abolish the office**. The FDA rule neither affirmatively abolishes OCC nor independently certifies every official's legal chain or delegated powers. The later FDA chart and OGC notice are positive publisher observations for the reporting relationship. The status conflict pertains to the **outdated § 5.1105 citation as authority**, not a proved contradiction about the office's existence.

The FDA chart originally retrieved in a preceding research pass described a September 16 edition. Its subsequently preserved October 13 original is **a different, later publisher version**, which controls this increment's source attribution. The earlier snapshot's bytes were not retained, so no independent historical original certification is asserted for September 16.

## Historical OIG / OCIG source boundaries

In **62 FR 30859–30865**, the June 5, 1997 Office of Inspector General notice describes Chapter AF as having **seven historical organizational components**, including OCIG coded **AFG**. Its `AFG.10` specifically names **four OCIG internal functions/components**: Advice, Civil Recoveries, Administrative Litigation, and Industry Guidance. These are **eleven edition-local observations across two different organizational levels**. They are not eleven 2026 federal offices and do not prove an unchanged OCIG legal structure after subsequent statutes or organizational notices.

The statement describes consolidation from the prior OGC Inspector General Division and Office of Litigation Coordination into OCIG within OIG. The later **September 2026 HHS OGC restatement** explicitly excludes OIG-counsel matters within OIG's jurisdiction. This establishes publisher-source chronology and an express legal-services carveout. It does **not** establish independent present-day statutory powers, a general power of HHS OGC to direct OCIG, or OMHA/DAB ALJ decisional control.

## EO 14215 legal interpretation qualifier

The February 18, 2025 order's § 7 identifies President/Attorney General authoritative interpretation roles for executive-branch legal positions. Section 8 preserves statutory authorities and requires implementation consistent with applicable law. The OGC September 2026 notice states that its legal advice is binding **only to the maximum extent permitted under EO 14215**, absent Secretary reversal. These are distinct source assertions. A publisher citation is not a self-executing certification that all HHS officials, independent investigators, or adjudicators owe a broad delegation to OGC.

## Source models and verification

- `inc15c6h-counsel-authority-source-editions.json`: **six** source edition records (five new retained originals and prior September 2026 OGC).
- `inc15c6h-counsel-citation-status-transitions.json`: **17** precisely typed dated facts and citation transitions, each retaining publisher text location, source version and original SHA-256.
- `inc15c6h-oig-1997-counsel-history.json`: seven historical OIG and four nested OCIG chapter components, with 2026 status explicitly **unqualified**.
- `inc15c6h-counsel-source-coverage.json`: **14** separately scoped research populations; no aggregate current-HHS denominator.
- Four strict JSON Schema contracts and source-original/previous HHS baseline Git content pins with adversarial modification tests.

Verified prior canonical references remain `INC15C3-HHS-LINK-OGC`, `INC15C3-HHS-LINK-OIG`, `INC15C3-HHS-LINK-FDA`, and the cited INC-15C.6G relationships 28–30 and 37. No new canonical HHS institution identifiers are created. **No new FY2026 Assistant Secretary for Enforcement or FY2027 Assistant Secretary for Civil Rights and Appeals implementation is inferred**.

Run:
```sh
python3 scripts/inc15c6h-capture-source-editions.py verify
python3 scripts/inc15c6h-validate-models.py
python3 -m unittest discover -s tests -p 'test_inc15c6h_models.py' -v
```

**Unresolved:** full current HHS first-level legally certified roster; complete independent current OIG counsel statute/delegation crosswalk and post-1997 amendments; FDA Staff Manual Guides' independent 2026 internal effective dates and signed administrative-delegation instruments; broader DoJ/Attorney General opinion applicability to independent agency exceptions and OGC counsel power. Remaining work stays under HHS #66/#70 and a bounded successor. No website, data repository or policy changes.
