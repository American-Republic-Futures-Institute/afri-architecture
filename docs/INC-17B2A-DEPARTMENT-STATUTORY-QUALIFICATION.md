# INC-17B.2A — Statutory text boundaries for five Cabinet departments

**Status:** independently downloaded original publisher text, with source SHA-256 and Git blob receipts, and separate typed source-only structural propositions. **Not** an independently reviewed current 2026 ADL-1 organizational census or an admitted live Atlas graph.

**Baseline:** INC-17B [source edition and 15 Cabinet root ledger](../model/wholegov/inc17b-department-breadth.json), merge `3a740dff60e60de2bce5a2d7cb660d1568b3e586`. **Scope of this part:** State, Agriculture, HUD, Veterans Affairs and DHS, originally selected because the 2025 Government Manual listed zero immediate nested entries at each department root. A zero source-tree count is **not** evidence of zero real government offices.

## The evidence promoted — and deliberately *not* promoted

We captured **six** official statutory-section HTML originals from GPO and OLRC:
- 22 U.S.C. §2651a, **2024 GPO** edition: State Department Secretary organization plus three named bureaus (Consular Affairs; Population, Refugees and Migration; Cyberspace and Digital Policy).
- 7 U.S.C. §2202, **2023 GPO** edition: Department of Agriculture and Secretary leadership. This one section does not enumerate every USDA component.
- 42 U.S.C. §3532, **OLRC through Public Law 119-120, October 7, 2026**: HUD establishment and Secretary's supervisory role. Other HUD offices and FHA structure require independent statutory sources, such as §3533, and cannot be inferred from §3532.
- 38 U.S.C. §301, **2024 GPO** edition: VA statutory composition categories (Office of the Secretary, VHA, VBA, NCA, Board of Veterans' Appeals, Veterans' Canteen Service, Board of Contract Appeals). The text has additional catch-all paragraphs (c)(8) and (9), so the seven named categories are neither a complete present-day component denominator nor proof all entities remain operational. In particular, do not depict the Board of Contract Appeals as a verified live operating board.
- 6 U.S.C. §§111 and 112, **2024 GPO** edition: DHS executive-department establishment and Secretary's direction/control. These provisions alone do not make all subordinate agency chart connections a legally effective command or executed delegation.

The records are historical **edition-scoped evidence**, not harmonized 2026-current law; amendments, repeals, successor legal effects and independent legal interpretation remain separate review gates. Despite the text referring to departmental direction, this release makes **no assertion that a particular authorized command or delegation was executed**. No current officeholder is modeled.

| Canonical root | Statutory sections retained | Source-text propositions | Source claim | Other dated evidence kept separate |
| --- | ---: | ---: | --- | --- |
| State | 1 | 4 | 22 U.S.C. §2651a: Secretary and three named bureaus | Two legacy publisher granule candidates; no confirmed first-level granules |
| Agriculture | 1 | 1 | 7 U.S.C. §2202: Secretary and department designation | Two prior publication-granule candidates; no complete roster |
| Housing and Urban Development | 1 | 1 | 42 U.S.C. §3532(a): Secretary and department | Two prior research candidates; no qualified present-day count |
| Veterans Affairs | 1 | 7 | 38 U.S.C. §301(c)(1)-(7): statutory composition categories | 22 dated directory entries (2026-02-25 page), original HTML custody unqualified |
| Homeland Security | 2 | 2 | 6 U.S.C. §§111(a), 112(a): department and Secretary | 34 source-chart boxes (FY2024), original report PDF archived |

Across the five roots, **15 source-text propositions** are backed by six original HTML sources. These source-local subjects do **not** create new permanent federal canonical institution IDs or live graph edges. Provenance is explicit per proposition: original section citation, exact source edition, legal clause locator, literal source-body anchor, source SHA-256 and Git blob, source-local subject kind and relationship type, old source candidate (when applicable), qualification status and missing legal verification.

## Distinguish five relationship families

1. **Source catalog membership** — an agency listing, table box or dated directory heading is a descriptive record. It does not establish law, present-day status, direct supervision or command.
2. **Statutory composition (textual)** — a legal provision identifies an included organizational subject. Examples are 38 U.S.C. §301(c) and 22 U.S.C. §2651a(g)-(i). A formally qualified `statutorily_part_of` edge additionally requires sufficient source edition/currentness, endpoint and legal-effect review.
3. **Department-head legal designation** — the source identifies a Secretary position and statutorily described supervisory capacity. It is not an individual incumbent, actual delegated action, or universal first-level staff reporting chain.
4. **Legal delegation or military command** — requires its own proper legal instrument, effective term/scope/conditions, any executed delegation evidence, and source-qualified endpoints. Neither an org-chart arrow nor a generic delegation *authorization* proves an executed delegation.
5. **Public-service functional capability/outcome** — remains for INC-17C; describing a Secretary's statutory duties does not demonstrate benefits, rights adjudication, funding or causal outcomes for citizens.

The distinction matters even inside VA. Its 2024 codified composition lists several named entities, while the separately observed 2026 VA directory has 22 heading observations. A 2024 statutory subject and a 2026 publisher heading may refer to the same legal entity, a different class, an obsolete predecessor, or only an administrative group. They must be reconciled before asserting one current graph identity.

For DHS, the retained FY2024 report has an inspectable original SHA-256 and **34 organizational chart boxes**, while the 2024 statutory sections identify departmental establishment and the Secretary. No unreviewed direct command over FEMA, Coast Guard or any Inspector General office is inferred from chart placement; Coast Guard's conditional military transfer and separate statutory regimes require their own qualified edges.

## Source custody and verification

- `evidence/inc17b2a-statutory-originals/source-custody.json`: six named official URL/section/source edition records, exact HTTP original byte hashes and Git blobs, retrieval timestamps and claim restrictions.
- `evidence/inc17b2a-statutory-originals/originals/sha256/*.html`: exactly six original publisher HTML entities. All are append-only; capture workflow is hard-confined to its original feature branch. Git retention is **not** independent WORM certification.
- `scripts/inc17b2a-capture-statutes.py verify`: offline source body, SHA-256, source URL, metadata and paragraph-anchor replay.
- `model/wholegov/inc17b2a-statutory-boundary-candidates.json`: 15 unadmitted statutory text-to-subject propositions.
- `model/wholegov/inc17b2a-department-qualification.json`: explicit source and temporal reconciliation for **all 15** Cabinet departments, with the five priority rows advanced to original-text retention.
- `scripts/inc17b2a-qualification-core.py`: validates original text anchors inside codified **section body**, not editorial notes, plus prior canonical references and coverage source conservation.
- `schemas/inc17b2a-statutory-qualification.schema.json` and `tests/test_inc17b2a_qualification.py`: closed shape tests and adversarial source-epoch, authority, currentness, false identity/command and non-admission cases.

## Evidence gaps and next acceptance gates

**INC-17B.2B:** Source-qualified first-level legal review by jurisdiction and time. Begin with enacted membership provisions and official current agency organizational materials for State, USDA, HUD, VA and DHS. Resolve 2023/2024 statute editions against a contemporary complete legal-text through-date and applicable amendments, 2025 Government Manual versus department original chart/directories, Inspector General independence, the VA Board of Contract Appeals status and component legal designation. Determine a real, bounded ADL-1 denominator *only* for source-verified scopes.

**INC-17B.2C:** Repeat the same bounded qualification process for the other ten Cabinet roots, EOP, independent bodies/corporate exceptions, Congress and the judiciary. No global completion percentage until scope and denominator are defensibly established. Preserve 50 independent State jurisdictions and distinct tribal/local/territorial/D.C. statuses.

**INC-17D:** Do not admit these 15 source-only subjects as public Atlas graph nodes or legal edges on the strength of manifest declaration. A distinct reviewed, version-pinned adapter must trace evidence and preserve original canonical IDs, direction, provenance, context, legal and citizen-outcome viewpoints.

**Release criterion:** preserve existing live Architecture views, no 502; source original and model regression passes; no newly inferred legal powers, current actual operations, external WORM, signed delegation, public-value measurements or canonical identification.
