# INC-15C.6 — Original HHS OIG HTML and dated 2025 chart custody

**Research status:** exact original publisher bytes archived in Git, but HHS-wide original organizational HTML remains blocked. **Issue:** [#66](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/66).

## Source acquisition and retained original editions

The original HHS organizational-index HTML `https://www.hhs.gov/about/organization/org-chart/index.html` returned **HTTP 403**. The official HHS 2024 Global Strategy PDF, official DAB and OMHA subcharts also returned HTTP 403. The ASPR PDF attempted a redirect outside the exact allowlist, so no ASPR original was admitted. The negative results are in `evidence/hhs-oig-2025/receipts/source-probe.json`.

Two **independent original** HHS OIG sources were successfully acquired from `oig.hhs.gov` in [source run #39668188500](https://github.com/American-Republic-Futures-Institute/afri-architecture/actions/runs/39668188500), artifact `12378132516`:

| Source | Publisher, edition / observation | Original bytes | SHA-256 |
| --- | --- | ---: | --- |
| [Official HHS OIG organization page](https://oig.hhs.gov/about-oig/organization-chart/) | HHS OIG, observed on retrieval; **not** certified as a December 2025 HTML edition | 41,739 | `97fd0513471e013ee8de2534f81184621c7babb7bf2f1d3181f935df275300a6` |
| [HHS OIG organization chart PDF](https://oig.hhs.gov/documents/root/9810/2025-oig-org-chart-web.pdf) | Official printed edition **as of December 23, 2025** | 545,208 | `068fa03980a4add3be412750ce63b0cc435c3d77f54a1153347b19e1200dc3ea` |

The exact files are retained in `evidence/hhs-oig-2025/originals/` with SHA-256-addressed filenames. Git blob SHA-1 values are `5e4281689da34a32add7adc6f522f276bb11fef7` (HTML) and `56504a9092deb5d7b44c8c3e6261e11d5a7e8fd8` (PDF). These Git hashes are **not** independent archive/WORM attestations. Two distinct receipts retain acquisition attempts and Git-preservation facts.

The one-page source PDF was independently rendered and inspected (physical page 1). It explicitly distinguishes **Inspector General and Principal Deputy Inspector General leadership positions** from six chief office/leadership columns and many repeated, subordinate *position titles*. Identically named Assistant Inspector General positions are **not** six independent statutory agencies. The six office names from the OIG HTML are: Immediate Office of Inspector General; Office of Audit Services; Office of Evaluation and Inspections; Office of Management and Policy; Office of Investigations; Office of Counsel to the Inspector General.

The OIG source populations do not replace the 29-entry HHS organization index or 11-entry 2025 Government Manual HHS subtree. The complete HHS legal first-level denominator remains `null`; neither historical nor current OIG legal organization, OIG subordination, IG independence under governing law, statutory delegation, adjudicative jurisdiction or signed fiscal control has been independently certified in this research increment.

## Reproducibility and qualification

The source promotion replays the original seven-source acquisition receipt, enforces exact two-original ZIP membership and SHA-256 sizes, validates the PDF page and printed as-of date, and stores original publisher HTML. `scripts/inc15c6-hhs-oig-custody-core.mjs` verifies both preserved original SHA-256 digests, Git blobs, closed source-acquisition and Git-custody receipts, and the six OIG HTML office headings. Negative tests reject tampering, forged direct HHS HTML source custody, DAB/OMHA source impersonation, false complete legal counts, WORM qualification and OIG subordinate command assertions.

```sh
node scripts/validate-inc15c6-oig-original.mjs
node --test tests/inc15c6-hhs-oig-custody.test.mjs
```

Separate derived source-office crosswalk/model work must remain distinct from original-source custody; do **not** infer that the OIG's published internal chart proves the independent statutory, appellate or command status of other HHS offices. The source PDF reports a chart layout, while the web page describes six internal OIG groups. Mission/function descriptions remain edition-attributed publisher text until independently classified under [INC-16 #56](https://github.com/American-Republic-Futures-Institute/afri-architecture/issues/56).

No ARFI data-repository, website, or reform-policy changes.
