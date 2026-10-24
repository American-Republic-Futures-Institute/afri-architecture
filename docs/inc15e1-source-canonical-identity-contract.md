# INC-15E.1 — Source-to-canonical identity and typed relationship interoperability

## Scope and current evidence

This implements the source-qualified identity-contract portion of [Issue #101](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/101). It is **not** completed legal identity adjudication. The existing government descriptive architecture is unchanged, as are the Plan, independent Data Observatory and public Atlas renderer.

The retained GovInfo **Government Manual 2025-12-31 original XML** (SHA-256 c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138; Git blob 195c46a67c87ae85f1dedd423250900f119a041a) proves exactly four source-local publisher observations for this pilot. The only newly source-qualified directional relationship is **publisher_listing_of** from the original 2025 publisher edition to each observation. These are not new canonical institution IDs or public Atlas edges.

| Original source-local key | Published name | Specific unresolved identity / legal qualification |
| --- | --- | --- |
| GOVMAN-2025-12-31:169 | Overseas Private Investment Corporation | Historic label, candidate DFC transition question; **no legal successor equivalence** |
| GOVMAN-2025-12-31:147 | Federal Reserve System | The existing Board canonical ID ORG-FED-EXE-IND-FED does **not** stand for the entire published system |
| GOVMAN-2025-12-31:160 | National Railroad Passenger Corporation (AMTRAK) | Needs qualified statutory subtype; neither an ordinary executive agency classification nor a categorical private-only conclusion follows from the directory |
| GOVMAN-2025-12-31:180 | United States Agency for International Development | Cannot infer **2026** legal continuity, abolition, transfer, staffing or actual operations from a 2025 publisher entry |

## Primary-law research locators that are **not** captured statutory originals

- [22 U.S.C. § 9683](https://uscode.house.gov/us/usc/119-120/t22/s9683/) — transfer-of-functions source to obtain and qualify.
- [22 U.S.C. § 9684](https://uscode.house.gov/us/usc/119-120/t22/s9684/) — historical OPIC termination/transition condition source to obtain and qualify.
- [12 U.S.C. § 221](https://uscode.house.gov/us/usc/119-121/t12/s221/) — Federal Reserve statutory terms.
- [49 U.S.C. § 24301](https://uscode.house.gov/view.xhtml?req=%28title%3A49+section%3A24301+edition%3Aprelim%29) — Amtrak-specific status and applicable law.

**No original bytes from these legal sources are retained in this increment.** The links are research locators, not legal custody receipts or proof of independently reviewed statutory succession, status or command. A source-link alone never enables statutory relationship publication. No 2026 USAID status assertion is made.

## Nine directed relationship predicates and independent evidence gates

| Type | From → to | Evidence required for assertion |
| --- | --- | --- |
| publisher_listing_of | Official publisher edition → original source observation | Hash-verified retained directory original; publisher source only |
| identity_candidate_of | Source observation → existing canonical institution | Research comparison, **not** legal identity certification |
| name_variant_of | Historical institution → canonical institution | Original official identity/alias source, review |
| historical_predecessor_of | Historical entity → specified successor | Retained original transition law, exact scope and effective time |
| legal_successor_of | Qualified successor → historical predecessor | Retained and reviewed enacted law; no name-based inference |
| statutorily_part_of | Statutory component → legally identified parent | Specific original law, not publisher nesting |
| supervises | Legal supervisor → supervised legal body | Specific statute and scope; not generic institutional placement |
| delegates_to | Delegating authority → delegated actor | Original lawful delegation, scope, conditions and dates |
| public_service_provided_by | Qualified public service → identified provider | Legal basis plus independently captured actual service evidence |

Relationship types have explicit endpoint kinds, direction, evidence class and legal predicate qualification. Institutional parentage, fiscal authority, command, independent execution, and a measured citizen outcome must **never** be inferred from publisher mission text, name similarity or directory placement.

## Existing Atlas compatibility

[The adapter contract](../model/federal/inc15e1/atlas-adapter-contract.json) provides the future additive edge projection: endpoints, type, original evidence identifier and edition, source qualification, legal effective date if proved, and source-inspection status. The required inspector shows original publisher, original path, SHA, exact source-local XPath, source date, review state and publisher-versus-legal qualification.

**This increment admits zero relationships to the public Atlas** and does not modify its renderer. Every admission requires a separate website PR and schema/source validation.

## Source-coverage report (independent dimensions)

| Dimension | Current evidence |
| --- | ---: |
| Publisher observations in this specific 2025 edition | 231 |
| Previously provisionally linked to canonical names | 50 |
| Still canonically unlinked | 181 |
| Unlinked entries with explicit source-only dispositions | 88 |
| Unlinked entries without such dispositions | 93 |
| Independent-category source dispositions | 45/45; **still canonically unlinked** |
| Bounded original-edition observations in identity pilot | 4 |
| New certified legal identities, successor relations or statutory organizational subtypes | **0** |
| Captured new statutory original instruments | **0** |
| Verified 2026 entity operations, public Atlas edges or independently measured outcomes | **0** |

**231 is an original publisher-entry denominator, not a whole-federal-government legal institution count.** Government Manual categories include quasi-official and international entries.

## Reproducibility and follow-on acceptance

Source models and contracts:
- [Nine relationship types](../model/federal/inc15e1/relationship-type-registry.json)
- [Publisher original and four unretained statute locators](../model/federal/inc15e1/source-evidence.json)
- [Four distinct identity case decisions](../model/federal/inc15e1/identity-adjudications.json)
- [Four publisher-only source edges](../model/federal/inc15e1/relationship-candidates.json)
- [Independent evidence dimensions](../model/federal/inc15e1/evidence-dimensions.json)
- [Future Atlas adapter](../model/federal/inc15e1/atlas-adapter-contract.json)
- [Deterministic validator](../scripts/inc15e1-identity-reconcile.py), [adversarial tests](../tests/test_inc15e1_identity_reconciliation.py) and six closed source schemas under schemas/inc15e1-.

Run in a full repo checkout using Python 3: execute scripts/inc15d9-govman-reconcile.py, then scripts/inc15e1-identity-reconcile.py, then Python unittest discovery with pattern test_inc15e1_identity_reconciliation.py. The verifier recursively replays all INC-15D.5–.9 original-source retention and qualification gates.

**Outstanding legal-adjudication gate:** separately archive dated **official original** statutory instruments with exact bytes, publisher/source-release identity, SHA-256, Git blob, retrieval receipts, section/paragraph scope, effective/amendment dates, and independent legal review. Only then can a later source-qualified PR establish a limited statutory predecessor, corporate status or other directed legal predicate. Keep original publisher observations and existing canonical IDs immutable. Later, a separate website PR may admit specifically reviewed relationships; no Plan or Data Observatory policy/outcome claims are automatically created.
