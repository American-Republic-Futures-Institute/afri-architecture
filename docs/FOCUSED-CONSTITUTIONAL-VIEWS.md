# Original Constitutional Articles IV–VII and Focused View Contract

**ARFI-COA v0.1.0 · 2026-10-16 · Research data increment, not a website UI or new legal opinion**

## Status audit — no duplicate constitutional authorities

All **seven** original Articles already existed in the canonical constitutional provision hierarchy. Articles I, II, and III have dedicated source-unit model families. Articles IV–VII were previously modeled in the validated \`article-iv-vii-*\` collections and original federalism crosswalks but not in the website-consumed ten-item \`model/constitutional/viewpoints.json\` registry.

This increment **does not pretend Articles IV–VII were missing source law**, and it does not duplicate constitutional provisions or create new constitutional powers. It gives every original Article and all 27 ratified Amendments a consistent, independent, source-pinned data selection contract. Historic nonoperative clauses remain accessible as historical text.

| Original Article | Canonical analytical units | Source family | Focused scope |
| --- | ---: | --- | --- |
| Article I | 53 selected numbered clauses | \`article-i-clauses.json\` | \`SCOPE-CONST-ART-01\` |
| Article II | 17 clauses/segments | \`article-ii-units.json\` | \`SCOPE-CONST-ART-02\` |
| Article III | 8 clauses/segments | \`article-iii-units.json\` | \`SCOPE-CONST-ART-03\` |
| Article IV | 10 source-aligned functions | \`article-iv-vii-units.json\` and original federalism model | \`SCOPE-CONST-ART-04\` |
| Article V | 9 **nonofficial** analytical spans | \`article-iv-vii-units.json\` | \`SCOPE-CONST-ART-05\` |
| Article VI | 3 original clauses | \`article-iv-vii-units.json\` and original federalism model | \`SCOPE-CONST-ART-06\` |
| Article VII | 3 historical **nonofficial** spans | \`article-iv-vii-units.json\` | \`SCOPE-CONST-ART-07\` |

These unit inventories are **research decomposition**, not a claim that every textual issue, interpretive holding, modern statute, executive regulation or limitation is fully mapped. The indexes preserve the old stable source IDs and their explicitly bounded effect statuses. See [Articles IV–VII Architecture](ARTICLES-IV-VII-ARCHITECTURE.md) and [Constitutional Metamodel](CONSTITUTIONAL-METAMODEL.md).

## Publication of flexible, composable selections

New canonical, **nonrendered** model collections:

- \`model/projection/article-index.json\`: seven original Article roots with references to their source-catalog records, analytic units, and constitutional norm IDs. It stores **IDs only**, not duplicate text or invented authority.
- \`model/projection/amendment-index.json\`: 27 independent ratified-amendment roots, each with analytic unit IDs and ratification/effect metadata from the canonical publication.
- \`model/projection/scopes.json\`: **34 saved logical view definitions** (Articles I–VII and Amendments I–XXVII), built around one canonical constitutional root each. These are *not* added to the existing renderer's broad \`VIEW-CONST-AMENDMENT-EFFECTS\` or its existing 10 viewpoints.
- \`model/projection/edge-rules.json\`: **53 typed source-field relationship projection rules**. Each derived edge retains a generating model record and its original evidence IDs, with an explicit class: structural, research analysis, textual candidate, qualification, historical context, functional alignment, or observed federal relationship.

All four are registered in \`model/federal/manifest.json\`. The website's current architecture Atlas can continue consuming its existing, supported family; the separate \`model/projection/\` namespace is deliberately **model-only** pending an explicit viewer implementation.

A source record, provenance citation, legal review status, and original historic effect are immutable inputs. A viewpoint is a **selection/query over those inputs**, not a new underlying law record. Stable model record IDs remain suitable for source-commit-bound public discussion anchoring. The canonical commit SHA is supplied by the consuming publication service; a worktree-local query must not misrepresent itself as a verified published SHA.

### Query contract

\`schemas/focused-view-query.schema.json\` and \`scripts/focused-projection-core.mjs\` define a deliberately **typed, bounded** projection:

\`\`\`json
{
  "scope_id": "SCOPE-CONST-AMD-01",
  "focus_ids": ["ORG-FED-EXE-DEP-DEFENSE"],
  "exclude_ids": ["ORG-FED-EXE-DEP-EDUCATION"],
  "max_hops": 4,
  "include_relation_classes": [
    "structural", "research_analysis", "qualification",
    "textual_candidate", "historical_context",
    "functional_alignment", "federal_observed"
  ]
}
\`\`\`

This requests a source-backed view of the **First Amendment** together with the Department of Defense, excluding Education. It does **not** assert that the Amendment automatically creates, directly regulates, or delegates authority to that Department. If no explicit typed model connection exists, \`connections[].status\` is \`not_evidenced_within_selected_models\`, accompanied by a caution that incomplete modeling cannot prove legal absence.

A search-only query can use \`search_text\` with \`search_mode=all|any\` to discover canonical record labels/IDs. It never uses lexical similarity, shared keywords, vector distance or a model-generated guess as an authority edge. Interpreting a natural-language search into those explicit filters is a **separate, deferred application increment**.

## Scope containment and evidence semantics

1. A selected \`CONST-US-ART-04\` or \`CONST-US-AMD-01\` includes **only its source hierarchy descendants**, not sibling Articles or all other amendments in an oversized default viewpoint.
2. An explicit multiple-root query composes the focused subgraphs; an individual root may be a source constitutional provision, official governmental institution or capability. It never rewrites those model records.
3. Only declared field-reference relationships and their named semantic classifications may expand the graph. Structural containment is **not command authority**. Functional alignments are **not delegated executive powers**. Candidate norm/actor bindings are **not professionally certified judicial doctrine**.
4. Eligibility, section-specific conditions, expired/superseded provisions and present research status remain on canonical nodes. Filters may hide a qualifier from a particular *display*, but cannot convert an unbounded visual summary into an unconditional constitutional or statutory power. The projection tracks \`hidden_qualifications\`.
5. Source input and projection budgets are explicit. Unknown query properties, invented root IDs, invalid relationship classes, excessive node/edge scopes, dangling source references and missing core legal-effect flags fail closed.
6. No current policy corpus, proposed reform policy relationships, governance disposition, freeform AI search engine, source-text edits, source-side UI layout, canvas positions, or deployed webpage is introduced.

## Repeatable verification

\`\`\`sh
node scripts/validate-focused-projections.mjs --validate
node --test tests/focused-projection.test.mjs

node scripts/validate-focused-projections.mjs --query examples/projection/first-amendment.json
node scripts/validate-focused-projections.mjs --query examples/projection/first-amendment-defense.json
node scripts/validate-focused-projections.mjs --query examples/projection/article-iv.json
\`\`\`

Outputs are source-graph **data**, for later UI use. For user-defined views, author a small JSON query file with validated canonical IDs; no new constitutional content or source file needs to be created. An eventual personal saved-view system can persist such definitions separately while binding retrieval to the exact published commit.

The legal model still needs verified statute-level delegations, current judicial opinions and professional review before operational policy conclusions can be drawn.
