# INC-15C.3 — HHS public organizational index reconciliation

**Research model only.** This increment broadens source-index coverage of the Department of Health and Human Services. It does **not** confer current legal first-level organization completeness, independently authenticated publisher bytes, office reporting authority, adjudicative jurisdiction or ADL-1 qualification.

## Source and original record distinction

The public official page [HHS Organizational Charts](https://www.hhs.gov/about/organization/org-chart/index.html) reports “Content last reviewed August 21, 2025.” Its visible index text was inspected October 21, 2026. Prior ARFI source model `model/federal/archive04b/hhs-source-entries.json` preserves **28** named historical source entries under source reference `ARCH04B-HHS-HTML`. The previous official HTML capture receipt was **HTTP 403 with no original response SHA**. A web reader was able to inspect the visible page text in this increment, but **not independently preserve the exact original HTML bytes**. That distinction is encoded as `original_official_html_sha256=null` and `original_official_html_bytes_archived=false`.

The directory includes **Advanced Research Projects Agency for Health (ARPA-H)**, which is missing from the earlier 28-entry source selection. This increment records ARPA-H as *one new linked-name research candidate* and reconciles all 28 original entries in their published order, accounting for the new entry at position nine. The resulting **29** entries are names on the page, **not 29 verified first-level legal organizations**.

Five other source labels are separately preserved but not promoted into the 29 names: Office of the Secretary (OS), Divisions, Secretary, Deputy Secretary, and Chief of Staff. These are a mix of section descriptions and leadership titles; they cannot be flattened into equivalent staffed organizations. Parent placement is limited to the published index heading, which is not a proven legal or command reporting relation.

The Office of Inspector General remains a distinct independent-oversight research category. The Departmental Appeals Board (DAB) and Office of Medicare Hearings and Appeals (OMHA) remain adjudication-associated research entries, not assumed executive command components. Cross-office mission responsibility and interagency dependencies remain *unassessed* until supported by separate official mission/function sources.

The separate [U.S. Government Manual, December 2025 edition](https://www.govinfo.gov/app/details/GOVMAN-2025-12-31), has a published HHS granule `GOVMAN-2025-12-31-117`. The prior repo records the corresponding XML SHA-256 `b8a29d3c43757061a74f86712738b6ddc04c4f3b4420e37d79cd9bf0d2c24ad9` **in a temporary CI artifact**. It is a **separate edition and source population**, and the granule's XML entity ID is a publication locator, not a permanent legal agency ID. Neither directory entry counts nor the XML granule are assumed to establish a full HHS first-level denominator.

## Reproducibility and fail-closed constraints

The publisher research model is `model/federal/inc15c3-hhs-directory-reconciliation.json`. It joins **28 existing `ARCH04B-HHS-*` IDs** without replacing them and introduces **one ARPA-H source observation only**. Its semantic validator independently locks six original source models to the exact previous architecture commit `2288a20a4a7ff65b0163775c776bfeb3bf34fd74`, checks 29 stable source-index labels, the five non-org labels, OIG and both adjudicative exceptions, and refuses unsupported verification flags. The JSON Schema is closed and adversarial tests reject co-edited-schema command/mission claims, new false canonical identities, current denominator inflation, false publisher custody, unqualified adjudicative/reporting edges and source-epoch changes.

Run:

```sh
node scripts/validate-inc15c3.mjs
node --test tests/inc15c3.test.mjs
```

The full existing architecture CI also runs on the exact PR head. Publication of this family does **not** automatically admit a new rendered Atlas graph; website source admissions remain separately governed.

## Next source qualification and depth increments

1. Acquire original decoded HHS index HTML from the official publisher in a controlled source capture, with SHA-256, source URL, observed retrieval time, edition timestamp and durable original bytes. Compare its actual HTML links to all 29 model names and record any additions, deletions or redirects.
2. Independently capture and retain the fixed 2025 Government Manual HHS granule. Examine the original structure and child entity details, not just the root entity metadata. Keep it as a separate edition and publisher population.
3. Extend **office-level** source indexes for HHS, Department of Education and the remaining departments. Assign a canonical legal organization ID only after resolving publication names, date, function, identity collisions, office class and qualified legal status.
4. Build stable source-backed mission/function mappings and *typed* cross-institution cooperation and dependency records, retaining actual relationship sources and distinguishing coordination, service delivery, mission overlap, oversight, intergovernmental liaison and legal delegation. Do not infer a cross-government edge from a generic similarity of names.
5. Detailed policy instruments, rule applicability, interpretations, reform outcomes and policy-effect analysis belong to a separately versioned future policy model and are not authorized by this increment.
