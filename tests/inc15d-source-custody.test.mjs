import test from 'node:test';
import assert from 'node:assert/strict';
import {loadINC15DSource,validateINC15DSource} from '../scripts/inc15d-source-custody-core.mjs';
const d=loadINC15DSource();
const bad=/INC-15D Git custody rejected:/;
test('original GovMan XML bytes, capture receipt and Git custody fully match',()=>{
 const v=validateINC15DSource(d);assert.equal(v.originalBytes,8138096);
 assert.equal(v.publisherNodeObservation,231);assert.equal(v.currentLegalFirstLevelDenominator,null);
});
for(const [name,mutate] of [
 ['tampered official publisher bytes',x=>x.original[200]^=1],
 ['forged original SHA',x=>x.custody.original_sha256='f'.repeat(64)],
 ['forged Git original blob',x=>x.custody.git_blob_sha1='e'.repeat(40)],
 ['false independent WORM',x=>x.custody.independent_worm_custody_verified=true],
 ['false legal census denominator',x=>x.custody.current_first_level_denominator=231],
 ['false signed command',x=>x.custody.operational_command_or_delegation_certified=true],
 ['false human legal approval',x=>x.custody.human_legal_review_complete=true],
 ['source epoch substitution',x=>x.capture.publication_date='2026-12-31'],
 ['promoted transient capture',x=>x.capture.source_storage_tier='permanent_worm'],
 ['original substituted path',x=>x.custody.git_repository_original_path='evidence/fake.xml'],
 ['new untyped legal field',x=>x.custody.statutory_delegation_verified=true],
 ['fabricated source count',x=>x.custody.source_entries_parsed_at_promotion=230],
 ['fabricated independently qualified acquisition',x=>x.capture.independent_durable_custody_verified=true],
 ['preemptive legally certified agency count',x=>x.capture.current_first_level_institution_denominator=231]
])test('reject '+name,()=>{
 const x={original:Buffer.from(d.original),capture:structuredClone(d.capture),
  custody:structuredClone(d.custody)};
 mutate(x);assert.throws(()=>validateINC15DSource(x),bad);
});
