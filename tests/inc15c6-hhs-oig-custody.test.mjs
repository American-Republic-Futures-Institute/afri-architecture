import test from 'node:test';
import assert from 'node:assert/strict';
import {loadInc15c6OigOriginal,validateInc15c6OigOriginal} from '../scripts/inc15c6-hhs-oig-custody-core.mjs';
const source=loadInc15c6OigOriginal(),bad=/INC-15C\.6 Git custody rejected:/;
test('official HHS OIG 2025 original HTML and PDF retain exact SHA-256, Git blobs and research only status',()=>{
 const r=validateInc15c6OigOriginal(source);
 assert.equal(r.htmlOfficeHeadingCount,6);
 assert.equal(r.datedChartAsOf,'2025-12-23');
 assert.equal(r.widerHhsIndexOriginalArchived,false);
 assert.equal(r.hhsLegalFirstLevelDenominator,null);
});
for(const [name,edit] of [
 ['HTML original byte change',s=>s.html[1024]^=1],
 ['PDF original byte change',s=>s.pdf[2048]^=1],
 ['fake OIG HTML hash',s=>s.custody.oig_html_original_sha256='0'.repeat(64)],
 ['fake PDF chart date',s=>s.custody.oig_pdf_as_of_date='2026-12-23'],
 ['claim full HHS original indexed HTML',s=>s.custody.hhs_department_index_html_custodied=true],
 ['claim original HHS DAB chart',s=>s.custody.hhs_dab_official_html_custodied=true],
 ['claim original HHS OMHA chart',s=>s.custody.hhs_omha_official_html_custodied=true],
 ['claim independent WORM',s=>s.custody.independent_worm_custody_verified=true],
 ['claim certified HHS legal first-level denominator',s=>s.custody.complete_current_hhs_first_level_denominator=29],
 ['claim OIG legally subordinate to department',s=>s.custody.inspector_general_subordination_or_signed_delegation_verified=true],
 ['claim OIG source is legally ratified',s=>s.custody.independent_legal_review_complete=true],
 ['claim old HHS index was acquired',s=>s.sourceProbe.source_probes[0].result='transient_original_captured'],
 ['falsify historic DAB download receipt',s=>s.sourceProbe.source_probes[4].original_sha256='1'.repeat(64)],
 ['swap original source artifact ID',s=>s.custody.source_acquisition_artifact_id=12345],
 ['promote repeated OIG positions into a new institution',s=>s.custody.new_legal_organization_count=6],
 ['false cross-source edition equivalence',s=>s.sourceProbe.same_edition_or_bytes_asserted=true],
 ['replace 2025 PDF with undated source claim',s=>s.custody.oig_pdf_physical_pages=null],
 ['claim original OIG PDF source was never blocked as strategy',s=>s.sourceProbe.source_probes[1].result='transient_original_captured']
])test('reject '+name,()=>{
 const s={html:Buffer.from(source.html),pdf:Buffer.from(source.pdf),
  custody:structuredClone(source.custody),sourceProbe:structuredClone(source.sourceProbe)};
 edit(s);assert.throws(()=>validateInc15c6OigOriginal(s),bad);
});
