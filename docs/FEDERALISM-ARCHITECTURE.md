# Federalism — State Sovereignty, Interstate Relations, Supremacy, and Protected Rights

**ARFI-COA v0.1.0 — research classification | October 15, 2026 | Pending legal review**

## Purpose and boundaries

This increment decomposes **Article IV, Article VI, the Tenth Amendment, the Eleventh Amendment and all five Sections of the Fourteenth Amendment** into independently referenced obligations, rights, actor relationships, conditions, qualified constitutional powers, and federal capabilities.

**Original constitutional law is not an ARFI policy proposal.** Ratified text is primary. ARFI summaries, actor mappings and capability associations remain research candidates pending human legal review. No website viewer, discussion engine, API, federal statutory jurisdiction, or case-law/precedent database is implemented here.

Primary evidence:

- [National Archives — Original Constitution](https://www.archives.gov/founding-docs/constitution-transcript): Articles IV and VI, including original obsolete wording.
- [National Archives — Bill of Rights](https://www.archives.gov/founding-docs/bill-of-rights-transcript): Amendment X.
- [National Archives — Amendments XI–XXVII](https://www.archives.gov/founding-docs/amendments-11-27): Amendments XI, XIII, XIV, XXVI and the precise temporal modifications.

Secondary explanatory references (not themselves constitutional grants): Congressional Research Service/Constitution Annotated on [Supremacy](https://constitution.congress.gov/browse/essay/artVI-C2-2-2/ALDE_00013397/), [Fourteenth Amendment due process](https://constitution.congress.gov/browse/essay/amdt14-S1-3/ALDE_00013743/) and Cornell's [republication of the Constitution Annotated on Article IV §2](https://www.law.cornell.edu/constitution-conan/article-4/section-2).

### Constitutional text versus ARFI analytic segments

| Canonical source | Original conventionally numbered clauses | Additional ARFI analytic units | Covered subjects |
|---|---:|---:|---|
| Article IV §1 | 0 | 2 unnumbered semantic spans | State public acts, records and judgments; Congress's general-law implementation |
| Article IV §2 | 3 | 0 | Citizens' interstate privileges, extradition, **obsolete fugitive-service language** |
| Article IV §3 | 2 | 0 | Admission of States; federal territory/property |
| Article IV §4 | 0 | 3 unnumbered semantic spans | Republican guarantee, invasion, State-requested domestic-violence protection |
| Article VI | 3 conventional clauses | 0 | Pre-Constitution debts, supreme law, oaths and religious-test ban |
| Amendment X | 1 amendment | 1 unit | State and people retained powers |
| Amendment XI | 1 amendment | 1 unit | Specific original federal judicial power limitations |
| Amendment XIV | 5 numbered sections | 5 units | Citizenship/rights, apportionment, disqualification, public debt and congressional enforcement |
| **Total** | **8 original Article IV/VI numbered clauses** | **20 ARFI model units** | Excludes amendment subsection counts from original-clause figures |

Article IV §§1 and 4 **are not** labeled as originally numbered clauses. Each analytical anchor uses `article_section_segment` and the full original Section citation. All pre-existing constitutional element IDs are preserved.

## Source model contract

| Canonical file | Records | Purpose |
|---|---:|---|
| `model/constitutional/federalism-units.json` | 20 | Source provision → norm/conditions/relationships/capabilities |
| `model/constitutional/federalism-qualifications.json` | 72 | Preconditions, consent thresholds, supremacy validity, rights-holders, amendment overlays, expressly flagged interpretation boundaries |
| `model/constitutional/federalism-relationships.json` | 40 | Typed law/actor relationships between States, federal institutions, people/citizens and their responsible addressees |
| `model/constitutional/federalism-rights.json` | 9 | Citizen/person/State/people protected interests with different original scope and addressees |
| `model/constitutional/federalism-capability-links.json` | 45 | Functional capability alignments without implied legislative or agency delegation |

Canonical authorities remain in `provisions.json` and `norms.json`. The federal capabilities use the existing FEAF-inspired L3 catalog. There are **27 additional textual normative claims**, **41 ordinary actor bindings** and **7 new functional capability types**; all retain descriptive/research status.

Every record has a stable ID and named primary sources suitable for citation, review, model versioning and website conversation targets. The website, not this repository, owns visualization.

### Role relationship semantics

An intergovernmental graph edge is a **constitutional legal relationship**, never an assertion that a State government is administratively subordinate to the U.S. executive branch. All active `FED-REL-*` records declare `classification: legal_role_relationship_not_organizational_hierarchy`.

Actor classes are separate from federal institutions:
- `ACT-US-STATES`: the States as distinct constitutional actors.
- `ACT-US-STATE-LEG`: State legislative bodies when they have a specifically assigned consent or request role.
- `ACT-US-STATE-EXE`: State executive authority, including limited extradition/domiciliary protection requests.
- `ACT-US-STATE-JUDGES`: State judges subject to the supreme law.
- `ACT-US-CITIZENS` vs `ACT-US-PERSONS`: citizenship-limited protections versus rights held by persons.
- `ACT-US-PEOPLE`: the people where the Tenth Amendment reserves power.

## Article IV: State relationships and federal guarantees

**§1 — Full Faith and Credit.** States must give constitutional recognition to public acts, records and judicial proceedings from sister States (`NORM-US-CONST-036`). Congress may prescribe **general laws** addressing proof and effect (`NORM-US-CONST-FED-IV-01-CONGRESS-PROOF`). The text does not settle every choice-of-law or execution dispute; such doctrine belongs to a later precedent register.

**§2 cl1 — Interstate privileges and immunities.** The original guarantee is addressed to *citizens of each State* (`FED-RIGHT-01`). It differs textually and doctrinally from the Fourteenth Amendment's *privileges or immunities of citizens of the United States* (`FED-RIGHT-06`). Never merge those protected interests by label alone.

**§2 cl2 — Extradition.** The process requires a **charge**, **flight from justice**, presence **in another State**, and **demand by the executive of the originating State**. It is not a generic federal power to detain persons without criminal-process or statutory safeguards. Further statutes and judicial decisions are future sources.

**§2 cl3 — Historical fugitive-service provision.** The original slavery-related service/rendition clause was **rendered inoperative by the Thirteenth Amendment**. Canonical record `FED-UNIT-IV-02-03` and `NORM-US-CONST-FED-IV-02-HISTORICAL-SERVICE` preserve archival provenance with `effect_status: superseded`. The unit **cannot have active actor relationships or capability alignments**. The abolition of slavery is operative under Amendment XIII and binds both public and private conduct, subject to its actual textual exception. The original clause is not a legal basis for a contemporary duty or enforcement action.

**§3 cl1 — Admission of States.** Congress may admit States, but forming a State within an existing State or through the junction of States/parts requires the **consent of legislatures of States concerned and Congress**. This is not a unilateral unrestricted federal power to subdivide a State.

**§3 cl2 — Federal territory/property.** Congress may make needful rules and regulations regarding U.S. territory and property, but the clause must not prejudice claims of the United States or particular States. Private rights, indigenous sovereignty and detailed territorial jurisprudence require additional statutes, treaties and holdings; this initial model does not attempt to settle those domains.

**§4 — Guarantee and protection.** Three distinct constitutional functions:
1. The United States guarantees **a republican form of government** to every State.
2. The United States protects every State **against invasion**; this text has no same-clause State-request condition.
3. For **domestic violence**, a State-legislature application is the primary trigger; the State executive may apply **when that legislature cannot be convened**.

These are separate norms and conditional edges. Do not import the domestic-violence request requirement into the invasion guarantee or remove it from domestic violence. Congress's and President's Article I/II defense powers are linked as separate legal constraints.

## Article VI: supreme law and distributed officer obligations

**Clause 1 — Pre-Constitution debts.** The text preserves U.S. debts and engagements incurred prior to adoption as valid as under Confederation. It is not interchangeable with the post-Civil-War public debt clause of Amendment XIV §4.

**Clause 2 — Supremacy.** The Constitution, **federal laws made in pursuance thereof**, and treaties **made under U.S. authority** constitute the supreme law. State judges are bound notwithstanding contrary State constitution or law. Legal priority depends on constitutionally valid action; **a purportedly unconstitutional statute or unauthorised agency action does not gain authority merely by citing supremacy**. This clause does not create a general federal police power, nor is the anti-commandeering doctrine an express textual sentence here.

**Clause 3 — Oaths and religious qualifications.** Constitutional support oaths or affirmations apply to federal legislators, federal executive/judicial officers, State legislators and State executive/judicial officers. The explicit text bars religious tests for **federal office or public trust**. Broader protection in State-office situations requires independent First/Fourteenth Amendment doctrine; the source model does not silently generalize the Article VI clause.

## Amendments X, XI and XIV

**Tenth Amendment.** Powers neither delegated to the United States nor prohibited to States are reserved to the States respectively **or to the people**. Both recipients are modeled separately (`FED-RIGHT-03` and `FED-RIGHT-04`). The reservation does not nullify valid supreme law and is not itself a State veto of constitutionally delegated federal powers.

**Eleventh Amendment.** The express text restricts federal judicial power construed to reach specified suits **against** a State by citizens of another State or foreign citizens/subjects. `FED-RIGHT-09` denotes the narrow jurisdictional State protection, **not blanket immunity from all proceedings**. Additional sovereign immunity for other plaintiff categories or remedies must arise from actual precedent; the category does not erase interstate controversies under Article III.

**Fourteenth Amendment §1.** Distinguish:
- Citizenship of persons born/naturalized in the United States and subject to its jurisdiction; State citizenship by State residence (`FED-RIGHT-05`).
- Privileges or immunities of **U.S. citizens** against State abridgment (`FED-RIGHT-06`).
- State due process for **any person** covered by its text (`FED-RIGHT-07`).
- Equal protection for **any person within a State's jurisdiction** (`FED-RIGHT-08`).

The Fifth Amendment separately regulates federal due process. Selective incorporation, scrutiny and citizenship disputes require controlling judicial authorities.

**Fourteenth Amendment §2.** Model apportionment, the original textual franchise-denial representation condition and its exception, historical "Indians not taxed" language, and the Twenty-Sixth Amendment's modification of the earlier age reference. Historical phrases are preserved for provenance, not asserted as present racial, indigenous or age-based exclusion rules.

**Fourteenth Amendment §3.** Model prior qualifying constitutional oath, specified office and conduct categories, and Congress's removal of a disability only by **two-thirds vote of each House**. Determinations about application, eligibility and enforcement are *not made* by the architecture.

**Fourteenth Amendment §4.** Federal public debt authorized by law cannot be questioned; federal and State governments may not assume/pay certain rebellion-support obligations or claims for loss/emancipation of enslaved people. These distinct textual restrictions are **not** an autonomous spending or unlimited borrowing authorization.

**Fourteenth Amendment §5.** Congress may enact **appropriate legislation** to enforce Amendment XIV. Do not misclassify this as a blanket delegation of every State responsibility to any federal administrative agency. Case-law-specific enforcement limits follow later.

## Quality assurance and legal safety

The declarative `schemas/federalism.schema.json` expresses data types. Semantic integrity is enforced by:
- `node scripts/validate-federalism.mjs`
- `node --test tests/federalism.test.mjs`
- All previous federal, constitutional, and Article I/II/III validators and regression suites in the existing CI workflow.

The tests include negative mutation cases for inventing constitutional clauses, reviving slavery service, improperly flattening States into federal hierarchies, omitting Article IV domestic-violence consent, claiming unconditional federal supremacy, treating citizens as all persons, deleting Amendment XI restrictions, omitting Amendment XXVI history, bypassing Amendment XIV §3 two-thirds vote, and creating implied federal agency delegations.

## Next work

1. Complete **remaining amendment** intrasection provisions and their effective/repeal/supersession dates.
2. Create a separate **judicial interpretation** graph (case, holding, court, date, binding scope, reversal/limitation status, source).
3. Model **State institutions**, distinct from the federal institution registry, without treating State agencies as federal subordinates.
4. Model **specific federal and State statutory authorities** and delegation chains. Congressional grants, State duties and federal executive implementation must be legally sourced.
5. Link legally admissible authority chains and uncertainty to proposed ARFI reforms, measured outcomes, public evidence and moderated public review.
