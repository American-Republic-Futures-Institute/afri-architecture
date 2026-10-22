# INC-16A — Federal mission and interface interoperability contract

Status: proposed descriptive architecture proof; unratified research.

Parent: [INC-16](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56)
Related: INC-15 federal breadth and INC-15D Government Manual identity crosswalk.

## Architectural separation

- **Architecture** represents government as documented by official source editions, with time, provenance and qualification states.
- **Plan** separately represents recommended or hypothetical future arrangements.
- **Data Observatory** separately represents independently observed conditions and results.
- No Plan proposal or Observatory correlation can silently become a factual institutional or legal relationship.

## Reusable source-qualified starting point

The retained **2025-12-31 Government Manual** XML and the INC-15D crosswalk provide:

| Source record | Existing canonical institution | What is qualified |
| --- | --- | --- |
| GOVMAN-2025-12-31:117 / INC15D-OBS-117 | ORG-FED-EXE-DEP-HHS | Dated publisher mission description and provisional identity crosswalk |
| GOVMAN-2025-12-31:118 / INC15D-OBS-118 | ORG-FED-EXE-DEP-DHS | Dated publisher mission description and provisional identity crosswalk |

Source: `model/federal/inc15d-govman-2025-directory.json`, `inc15d-govman-2025-crosswalk.json`; original SHA-256 `c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138`.

Those descriptions mention HHS public-health emergency preparedness and DHS disaster resilience, respectively. **Shared subject matter does not prove that the departments coordinate, transfer authority, jointly operate a program, or share responsibility.** The Government Manual directory is not a legal delegation instrument.

## Proposed interoperable record families

1. **Source observation:** source ID, original checksum, publisher, source-local key, exact edition, original text/locator and custody state.
2. **Canonical identity link:** source-local entity key to existing immutable canonical institution or office ID, match method, disambiguation, effective period, reviewer qualification and unresolved status.
3. **Descriptive function:** neutral predicate, scope, official quoted passage, source era, responsible subject reference and strictly limited assertion type (`publisher_describes_mission` versus independently qualified `assigned_responsibility`).
4. **Interface relationship:** stable edge ID; from/to canonical IDs; relationship class (coordination, supervision, administrative support, service delivery, oversight, delegation), direction, actual source passage, dates, legal/operational review states and unresolved exceptions.
5. **Viewpoint projection:** source-rooted node/edge selection and filters, with qualified/unqualified and historic/current badges and an inspector that opens source evidence.
6. **Public-service interface:** only after independent evidence, link a qualified function to a named program/service, affected population and Observatory measurements. A measurement is not proof of causation.

## Minimum tests / no-promotion rules

- Reject a source-local publisher key used as a permanent institutional ID.
- Reject cross-branch or external/international canonical identity assignments without explicit legal basis.
- Reject a dated publisher directory hierarchy or mission statement being relabeled as current legal supervision, military command, statutory delegation or exclusive functional responsibility.
- Preserve every previously issued canonical ID; prevent duplicate edges under aliases or editions.
- Reject source mismatches, absent/altered original hashes and claims of WORM certification or ADL-1 without independent evidence.
- Require an explicit published adapter allowlist: a file being in the architecture manifest does not automatically authorize Atlas admission.
- Report separately: publisher observations, provisional identity matches, legally certified identities, qualified functions, verified interfaces and public graph admissions.

## Increment acceptance plan

**16A: departmental mission facts.** Add dated, exact-passage function observations for HHS and DHS, using the retained original and existing canonical identity crosswalk; write schemas and negative tests. No inferred HHS-to-DHS interface.

**16B: one genuine interagency interface.** Obtain, retain and verify a primary official instrument that actually describes a specific HHS/DHS coordination role; distinguish published duties from legally operative delegation and demonstrated implementation. Represent qualified edge and unresolved claims separately.

**16C: public graph admission.** Create a separate version-pinned afri-website adapter PR that admits only qualified IDs, source-observation facts and explicitly allowed relationships into the existing Atlas. Do not rebuild the graph renderer.

**16D: citizen/public-service vertical slice.** Trace an independently evidenced service to beneficiary group and Observatory evidence, and permit Plan overlays only with explicit proposal status and legal-constraint references.

## Exit criteria for INC-16 proof

Two canonical institution roots; at least one source-qualified function for each; one independently source-qualified **actual interagency interface**; exact versioned source inspection; graph projection without fabricated authority; regression tests for legal and temporal non-promotion. Current federal legal denominator and actual outcomes remain unknown until independently established.

This document is a scope and admission contract, not an assertion that these acceptance conditions are already met.
