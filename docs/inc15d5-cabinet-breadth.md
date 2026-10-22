# INC-15D.5 — Interior, Labor and Transportation Cabinet publisher-entry dispositions

**Source epoch:** Government Manual `GOVMAN-2025-12-31` (publication date December 31, 2025). This is a bounded research enumeration of the original publisher's 2025 directory, **not** a verified present-day institutional census or a legal opinion.

The official 8,138,096-byte original XML is retained in this repository at [the content-addressed original](../evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml), SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`, Git blob `195c46a67c87ae85f1dedd423250900f119a041a`. Independent WORM custody remains unverified.

## Disposition and scope

All **28 of 28** originally unlinked first-level entries in the three Cabinet publisher subtrees have an explicit edition-local research disposition of `source_only_institutional_candidate_pending_statutory_confirmation`. This is not a determination that all 28 are distinct statutory entities. Their source-local keys remain tied to the 2025 publisher edition; none is promoted into ARFI's existing canonical institutional namespace.

The six old research seed correspondences are retained as **non-canonical pointers**, with five previously recorded GovInfo details pages and one unresolved Bureau of Labor Statistics granule. That granule's absence of a reconciled historic page does not imply the bureau was absent, invalid, or nonexistent.

| Qualification metric | INC-15D.5 result |
|---|---:|
| Original publisher entries within selected subtrees, excluding department roots | 28 |
| Explicit source-only dispositions accounted for | 28 |
| Previously indexed research-candidate correspondences (non-canonical) | 6 |
| Existing canonical component matches | 0 |
| New canonical institutional identities created | 0 |
| Independently source-qualified statutory authorities | 0 |
| Individually certified present-day components or command relationships | 0 |
| Public Atlas edges added | 0 |
| Earlier edition-wide provisional canonical links preserved | 50 |
| Earlier edition-wide publisher entries still unmatched to a canonical ID | 181 |

**Interpretation:** Accounting for 28 unresolved source observations does **not** subtract 28 from the prior 181 unlinked publisher entries. The underlying 50/181 canonical crosswalk and all earlier X12 identities are preserved byte-for-byte. Publisher nesting is not statutory delegation, organizational supervision, fiscal control, military command or a current agency headcount.

## Exact 2025 source-entry roster

Each key below is the full `GOVMAN-2025-12-31:<local-ID>` source identifier. The immutable XML XPath, original source checksum, original publisher parent key and 2025 sort order are in [the disposition register](../model/federal/inc15d5-govman-2025-dispositions.json). A research seed is not a canonical identity.

### Department of Interior — 10 entries

| Publisher-local key | 2025 published name | Prior non-canonical research seed |
|---|---|---|
| `298` | Bureau of Indian Affairs | `EXP-SEED-INTERIOR-BIA` |
| `299` | Bureau of Indian Education | None |
| `301` | Bureau of Land Management | None |
| `300` | Bureau of Ocean Energy Management | None |
| `302` | Bureau of Reclamation | None |
| `308` | Bureau of Safety and Environmental Enforcement | None |
| `295` | National Park Service | `EXP-SEED-INTERIOR-NPS` |
| `297` | Office of Surface Mining Reclamation and Enforcement | None |
| `294` | United States Fish and Wildlife Service | None |
| `296` | United States Geological Survey | None |

### Department of Labor — 9 entries

| Publisher-local key | 2025 published name | Prior non-canonical research seed |
|---|---|---|
| `324` | Bureau of International Labor Affairs | None |
| `325` | Bureau of Labor Statistics | `EXP-SEED-LABOR-BLS` |
| `326` | Employee Benefits Security Administration | None |
| `327` | Employment and Training Administration | None |
| `328` | Mine Safety and Health Administration | None |
| `329` | Occupational Safety and Health Administration | `EXP-SEED-LABOR-OSHA` |
| `330` | Veterans' Employment and Training Service | None |
| `331` | Wage and Hour Division | None |
| `332` | Women's Bureau | None |

### Department of Transportation — 9 entries

| Publisher-local key | 2025 published name | Prior non-canonical research seed |
|---|---|---|
| `240` | Federal Aviation Administration | `EXP-SEED-TRANSPORTATION-FAA` |
| `241` | Federal Highway Administration | None |
| `249` | Federal Motor Carrier Safety Administration | None |
| `242` | Federal Railroad Administration | None |
| `244` | Federal Transit Administration | `EXP-SEED-TRANSPORTATION-FTA` |
| `246` | Great Lakes Saint Lawrence Seaway Development Corporation | None |
| `245` | Maritime Administration | None |
| `243` | National Highway Traffic Safety Administration | None |
| `247` | Pipeline and Hazardous Materials Safety Administration | None |

## Evidence and review boundaries

1. The [curation register](../model/federal/inc15d5-govman-2025-curation.json) explicitly accounts for each 2025 key and research disposition. The directory [source replay](../scripts/inc15d-govman-directory.py) cryptographically verifies the original publisher XML before generation.
2. The [disposition register](../model/federal/inc15d5-govman-2025-dispositions.json) records source XPath, original SHA-256/Git blob, publisher name/parent, branch-compatible existing **department** anchor and older seed correspondence where available. The only retained canonical IDs are the three preexisting department root anchors.
3. The [coverage register](../model/federal/inc15d5-govman-2025-coverage.json) separately counts each cohort's source observations, corresponding earlier seeds, legal identity qualification, and Atlas publication. No aggregate "percent of U.S. government mapped" is asserted.
4. Source correspondence to `model/federal/expansion/department-seeds.json` or `model/federal/department-structure/candidate-granules.json` is a research join by **both exact name and department anchor**, never a cross-edition legal identity certificate.
5. No statute original has been individually captured and legally qualified for these 28 subordinate components. The existing departmental source reference to **5 U.S.C. § 101** supports the parent Cabinet department roster, not automatic legal identification or command authority for each listed subordinate.
6. The original 2025 XML is not proof of an organization's continued 2026 presence, direct reporting, independently enforceable powers, appropriations, military command, beneficial public outcomes or lawful exercise of any duty.

## Reproducible qualification

```sh
python3 scripts/inc15d-govman-directory.py
python3 scripts/inc15d5-govman-reconcile.py
python3 -m unittest discover -s tests -p 'test_inc15d5_reconciliation.py' -v
```

Each command reads committed artifacts; `inc15d5-govman-reconcile.py --write` is an **explicit opt-in** for deterministic local regeneration. The normal verification command rejects any mutation, missing/duplicate source key, prior canonical link rewrite, forged source checksum, wrong publisher parent/branch, invented legal authority or false ADL-1 status.

## Next bounded increment

Continue breadth-first across Commerce and Education publisher cohorts, and then independent-agency and judicial source entries. Introduce a verified per-component statutory-custody/identity review workstream only when individual primary law originals and review evidence exist. **Any Atlas admission is a separate adapter PR**. The Plan and Data Observatory remain unchanged.
