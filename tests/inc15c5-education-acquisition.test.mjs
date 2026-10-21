import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {URLS,MAX_BYTES,isApprovedUrl,isPdf,acquireEducationPdf,verifyEducationReceipt}
 from '../scripts/inc15c5-education-acquisition-core.mjs';
const fixture=Buffer.concat([Buffer.from('%PDF-1.7\n'),Buffer.alloc(3200,32),Buffer.from('\n%%EOF\n')]);
const fake=(bytes=fixture,status=200,media='application/pdf')=>async()=>new Response(bytes,{
 status,headers:{'content-type':media}
});
async function useTemp(fn){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'inc15c5-'));
 try{return await fn(dir)}finally{await fs.rm(dir,{recursive:true,force:true})}
}
test('exact official host/path allowlist and no scheme, spoofing or query substitution',()=>{
 assert.equal(isApprovedUrl(URLS[0]),true);
 assert.equal(isApprovedUrl(URLS[2]),true);
 for(const bad of ['http://www.ed.gov/media/document/fy-2024-annual-agency-performance-report-109331.pdf',
 'https://attacker.example/fulltext/ED673614.pdf','https://www.ed.gov.evil.com/'+URLS[0].split('/').at(-1),
 URLS[0]+'?edition=changed',URLS[0]+'#fragment',
 'https://www.ed.gov/media/document/some-other-document.pdf']){
 assert.equal(isApprovedUrl(bad),false,bad);
 }
});
test('strict PDF header/trailer and byte limits',()=>{
 assert(isPdf(fixture));assert.equal(isPdf(Buffer.from('<html>%%EOF</html>')),false);
 assert.equal(isPdf(Buffer.alloc(1024)),false);
 assert.equal(isPdf(Buffer.concat([Buffer.from('%PDF-1.7'),Buffer.alloc(2000)])),false);
 assert.equal(isPdf(Buffer.alloc(MAX_BYTES+1)),false);
});
test('approved publisher original kept as transient with exact checksum',async()=>useTemp(async dir=>{
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:fake()});
 assert.equal(receipt.status,'captured_transient_requires_git_custody');
 assert.equal(receipt.selected_distribution_type,'direct_department_publisher_url');
 const verified=await verifyEducationReceipt({outputDir:dir,receipt});
 assert.equal(verified.acquired,true);assert.equal(verified.bytes,fixture.length);
 assert.equal(receipt.independent_worm_custody_verified,false);
 assert.equal(receipt.complete_current_ED_first_level_denominator,null);
}));
test('unavailable direct publisher paths may select explicitly named ERIC distribution',async()=>useTemp(async dir=>{
 const outcomes=[403,404,200];let n=0;
 const response=async()=>new Response(outcomes[n]===200?fixture:'unavailable',{
  status:outcomes[n++],headers:{'content-type':n===3?'application/pdf':'text/plain'}
 });
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:response});
 assert.equal(receipt.selected_distribution_type,'official_ED_ERIC_repository_reproduction_not_direct_department_url');
 assert.equal(receipt.attempts.length,3);
 assert.equal((await verifyEducationReceipt({outputDir:dir,receipt})).acquired,true);
}));
test('fail closed if every approved official source is unavailable',async()=>useTemp(async dir=>{
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:async()=>new Response('blocked',{status:403})});
 assert.equal(receipt.status,'blocked_no_official_pdf_bytes');
 assert.equal(receipt.original_sha256,null);
 assert.deepEqual(await verifyEducationReceipt({outputDir:dir,receipt}),{verified:true,acquired:false});
}));
test('reject fabricated legal denominator or transient WORM custody',async()=>useTemp(async dir=>{
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:fake()});
 for(const mutate of [x=>x.complete_current_ED_first_level_denominator=22,
 x=>x.legal_composition_or_command_delegation_verified=true,
 x=>x.independent_worm_custody_verified=true,
 x=>x.chart_population_exhaustive_verified=true,x=>x.extracted_chart_box_count=25,
 x=>x.git_original_custody_verified=true]){
 const copy=structuredClone(receipt);mutate(copy);
 await assert.rejects(verifyEducationReceipt({outputDir:dir,receipt:copy}),/PDF rejected/);
 }
}));
test('tampering with original PDF bytes is detected',async()=>useTemp(async dir=>{
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:fake()});
 const file=path.join(dir,receipt.artifact_relative_path);
 const changed=Buffer.from(await fs.readFile(file));changed[100]^=0x01;
 await fs.writeFile(file,changed);
 await assert.rejects(verifyEducationReceipt({outputDir:dir,receipt}),/changed after capture/);
}));
test('unapproved redirect cannot fetch external source',async()=>useTemp(async dir=>{
 let count=0;const redir=async()=>{count++;return new Response(null,{status:302,
  headers:{location:'https://attacker.example/source.pdf'}})};
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:redir});
 assert.equal(count,3);assert.equal(receipt.status,'blocked_no_official_pdf_bytes');
 assert.equal((await verifyEducationReceipt({outputDir:dir,receipt})).acquired,false);
}));
test('blocked receipt cannot claim original bytes',async()=>useTemp(async dir=>{
 const receipt=await acquireEducationPdf({outputDir:dir,fetchImpl:async()=>new Response('403',{status:403})});
 receipt.original_sha256='a'.repeat(64);
 await assert.rejects(verifyEducationReceipt({outputDir:dir,receipt}),/PDF rejected/);
}));
test('original custody never permits silently replacing a pre-existing file',async()=>useTemp(async dir=>{
 const first=await acquireEducationPdf({outputDir:dir,fetchImpl:fake()});
 await assert.rejects(acquireEducationPdf({outputDir:dir,fetchImpl:fake()}),/EEXIST/);
 assert.equal((await verifyEducationReceipt({outputDir:dir,receipt:first})).acquired,true);
}));
