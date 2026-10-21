# INC-15D.0 — Whole-issue Government Manual original acquisition gate

**Parent:** [INC-15D #57](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/57). **Status:** acquisition plumbing only; no new source observations or legal institutions certified. **Source edition:** December 31, 2025. **Publisher:** Office of the Federal Register (NARA), distributed by GPO GovInfo.

Official landing page: <https://www.govinfo.gov/app/details/GOVMAN-2025-12-31>.
Exact raw-XML retrieval target: <https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31.xml>.

## Bounded acquisition

Run with Node.js 22 from the repository root (use an empty output directory):

```sh
node --test tests/inc15d-govman-acquisition.test.mjs
node scripts/inc15d-govman-original.mjs probe "$PWD/inc15d-run"
node scripts/inc15d-govman-original.mjs verify "$PWD/inc15d-run"
```

The capture procedure permits only HTTPS at the two official `govinfo.gov` hostnames, only the pinned whole-issue path, and no arbitrary redirects, userinfo, or query strings. It checks HTTP success, XML response media type, bounded decoded bytes, a transport-level XML signature, and stores byte-identical decoded XML at `originals/sha256/<digest>.xml`. A strict, closed capture receipt records the 2025 publication date, attempted retrieval, exact downloaded SHA-256 and original byte count. It refuses overwrite of a preexisting object. An attempt blocked by the source leaves the checksum and all observation counts `null`, with a recorded failure reason; both CLI acquisition commands exit nonzero for blocked attempts.

The read-only GitHub workflow attempts remote acquisition and uploads a **30-day temporary artifact**. A passing download-and-hash probe **does not** imply a permanent, independent WORM archive, Git source custody, publisher certification of legal classification, or full-issue census extraction. The workflow does not write the repository and cannot silently promote its own temporary output. Copying its original/receipt into the repository and verifying the source SHA/blob are separate reviewed steps.

The signature check is intentionally not a complete XML parser. No XML section or entity is admissible until an independently reviewed parser validates real XML structure against the downloaded source, and no organizational section title or publisher-local Entity ID becomes a permanent government institution identity. Model `source_observation_count`, legal whole-government denominator, and current first-level denominator all remain **null** until separate source-bounded extraction and legal review. A Manual directory nesting is not evidence of command, funding, adjudicative jurisdiction, or statutory delegation.

## Subsequent INC-15D phases (not completed here)

1. Preserve actual full-issue original bytes and SHA-256 in auditable Git content-addressed custody; record Git blob SHA separately from any independently certified durable source archive.
2. Inspect XML grammar safely (no DTD/network entity resolution); deterministically enumerate all publisher directory entities, their package-local IDs, order, category, parent source links, and explicit mission statements. Retain unmatched and nonorganizational entries rather than deleting them.
3. Reconcile against existing canonical `ORG-FED-*`, legislative, judiciary, EOP, independent, X12/INC-15 IDs without canonical reminting. Ambiguous names remain unresolved.
4. Publish per-edition, nonadditive coverage partitions and explicit unknown denominators. No present legal first-level census completion claim without independently bounded proof.
5. Add closed model schema, hostile mutation tests, exact-head validation and human review, followed by a separate future-edition refresh contract.

This increment intentionally does **not** change `model/federal/manifest.json`, publish institutions, or modify the website or data repository. Its research gate cannot be mistaken for INC-15D completion.
