import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEducationOriginal,verifyEducationOriginal} from '../scripts/inc15c5-education-custody-core.mjs';
const source=loadEducationOriginal(),bad=/INC-15C\.5 original custody rejected:/;
test('source byte-hash, Git blob, exact ERIC attribution and no authority',()=>{
 const a=verifyEducationOriginal(source);
 assert.equal(a.verified,true);assert.equal(a.bytes,5675466);
 assert.equal(a.directPublisherOriginalBytesQualified,false);
 assert.equal(a.legalFirstLevelDenominator,null);
});
for(const [name,change] of [
 ['modified PDF original',x=>x.original[1000]^=1],
 ['forged publisher source URL',x=>x.acquisition.selected_source_url='https://www.ed.gov/media/document/fake.pdf'],
 ['false direct Ed.gov publisher capture',x=>x.custody.direct_department_edgov_original_bytes_verified=true],
 ['false independently WORM-certified source',x=>x.custody.independent_worm_custody_verified=true],
 ['fabricated current ED first-level legal count',x=>x.custody.current_ED_department_legal_first_level_denominator=19],
 ['false legal authority from chart',x=>x.custody.authority_verified_from_chart=true],
 ['false chart transcription already admitted',x=>x.custody.chart_boxes_independently_admitted=true],
 ['fabricated direct capture before ERIC',x=>x.acquisition.attempts[0].result='received_original_pdf'],
 ['different fiscal year',x=>x.custody.publisher_report_edition='FY2026'],
 ['wrong PDF source page',x=>x.custody.fy2024_chart_physical_pdf_page=9],
 ['untyped provenance field',x=>x.custody.signed_legal_roster=true],
 ['altered Git blob',x=>x.custody.git_blob_sha1='1'.repeat(40)],
 ['altered original SHA',x=>x.acquisition.original_sha256='2'.repeat(64)],
 ['source retrieval claimed permanent',x=>x.acquisition.storage_tier='independent_WORM'],
 ['human legal review falsely asserted',x=>x.custody.independent_legal_review_complete=true]
])test('reject '+name,()=>{
 const x={original:Buffer.from(source.original),
  acquisition:structuredClone(source.acquisition),custody:structuredClone(source.custody)};
 change(x);assert.throws(()=>verifyEducationOriginal(x),bad);
});
