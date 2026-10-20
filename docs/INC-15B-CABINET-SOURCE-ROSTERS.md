# INC-15B — Cabinet-wide publisher edition register and Treasury/Commerce first-level source reconciliation

**Status:** original-source-model pinned **unratified research**. This is a workstream under [INC-15 #46](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/46), specifically [INC-15B #48](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/48). No actual legal first-level denominator, individual officeholder appointment, command chain, signed delegation, or ADL-1 certification is established.

**Predecessor immutable architecture edition:** `414704cd8eb749696387be95613772df90ef64ac`. Fifteen original input model files are checked against independent Git-tree blob SHAs at that exact commit; source metadata and crosswalk IDs must agree with the pinned bytes. These Git identities **do not independently archive or authenticate the original publisher pages**.

## Fifteen-department publisher-source coverage registry

`model/federal/inc15b-cabinet-sources.json` preserves all original fifteen `ORG-FED-EXE-DEP-*` canonical IDs in their prior catalog order and links to the INC-15A Cabinet crosswalk. It is source-scoped and never a government-wide census.

| Department source population | Source observation entries | Original source population |
| --- | ---: | --- |
| Defense | 11 | 10 U.S.C. 111(b) statutory composition categories, including two residual classes |
| Justice | 36 | Dated DOJ chart connector observations (existing INC-13B2) |
| Veterans Affairs | 22 | Directory administration/staff headings (existing INC-13B3) |
| Treasury | 9 | Published body **Bureaus**-section headings, observed 2026-10-16 |
| Commerce | 13 | Published **Bureaus**-section headings, observed 2026-10-16, including two leadership offices |
| Other ten Cabinet departments | **Unknown** | A bounded, directly reconciled first-level publisher cohort has not been established in this increment |

The five counts reflect **different source populations**, not independent sets of staffed agencies. They **must not be summed** into a federal institutional denominator. The source dates are retained separately: a page's claimed published/updated date can be null even when its retrieved/observed date is 2026-10-16. In particular, the Treasury and Commerce pages are mutable and no independent original custody is claimed.

## New crosswalk: 22 Treasury and Commerce original-source records

`model/federal/inc15b-roster-crosswalks.json` records exactly **nine Treasury** and **thirteen Commerce** source-unit observations from the earlier `department-structure/units.json`. For each observation, it preserves the original `DEPT04-UNIT-*` ID, original descriptive relationship and direction, original publisher source and edition snapshot, original heading and structural type, source locator and its existing `X12-OBS-*` record.

Only **four** of the 22 observations have older `EXP-SEED-*` *candidate* links: Treasury IRS and Bureau of the Fiscal Service; Commerce NIST and NOAA. These are candidate-to-source alignments, **not** four independently verified legal organizational identities.

The other eighteen observations retain their original source identity and an explicit **null canonical legally qualified unit identity**. None is assigned a new institutional ID merely because it appears on a webpage.

Source-specific exceptions are material:

- Treasury's nine-row “Bureaus” content cohort includes **two inspector general offices** (Treasury IG and TIGTA) whose page placement is not agency command or direction.
- Commerce's thirteen-row “Bureaus” content cohort includes the **Office of the Secretary** and **Office of the Under Secretary for Economic Affairs**. These are classified in the source data as leadership offices listed in a bureau category, **not** proven statutory bureaus.
- DOJ's 36 chart observations and VA's 22 directory headings remain owned by earlier reconciliations, and are not republished as 58 new current legal members.

## Four non-additive original-source partitions

`model/federal/inc15b-source-partitions.json` reconciles the **80** original Department-structure records: DOJ 36, VA 22, Treasury 9, Commerce 13. All 80 already have INC-12 source observation links. **Only 22** receive new INC-15B crosswalk records. The other 58 remain associated with their earlier, different source-specific reconciliation models. Distinct subsets within this one source model do not justify adding any counts across independent publisher cohorts, legal time periods, statutory classes or federal organization branches.

All four partitions retain their publisher source identifier, locator, snapshot, source-group completeness, source-label duplicates, overlapping earlier model candidate counts and structural classifications. Their **complete current departmental first-level denominators remain null**.

## Validation and negative security contracts

Run:

```sh
node scripts/validate-inc15b.mjs
node --test tests/inc15b.test.mjs
```

The schema is closed; 15 source model inputs must match their original byte-level Git hashes; every source/edition reference must resolve; all 22 new rows must preserve original Dept04 → X12 identity, parent/relationship type, and prior research-seed association. The validator rejects original source checksum co-forgery, false current completeness, invented missing-source counts, Treasury IG command, Commerce bureau reclassification, department reassignment, fictitious individual legal identity, independent custody assertion, unqualified ADL-1, and any inferred funding authority.

## Next research batch

Obtain/reconcile official **first-level publisher rosters for the ten remaining Cabinet departments**, each with an explicitly dated edition, source custody/status and unresolved identity queue. Then expand EOP/independent entities, legislative branch institutions and judiciary individually. A new publisher page listing alone must never be presented as an independently certified current legal organization, chain of authority or policy evaluation.
