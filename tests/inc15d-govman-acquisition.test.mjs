import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {OFFICIAL_URL,MAX_BYTES,isOfficialXmlUrl,plausibleXml,captureGovmanOriginal,
 verifyGovmanReceipt} from '../scripts/inc15d-govman-acquisition-core.mjs';
const fixture = Buffer.from('<?xml version="1.0" encoding="UTF-8"?><GovmanFixture>' +
 '<Entity id="example">not actual government evidence</Entity>'.repeat(28) + '</GovmanFixture>');
const sha = b => createHash('sha256').update(b).digest('hex');
const fake = (body=fixture, options={}) => async () => new Response(body, {
 status:options.status||200,
 headers:{'content-type':options.mime||'application/xml',...(options.headers||{})}
});
async function withDir(action) {
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'arfi-inc15d-'));
 try {return await action(dir);} finally {await fs.rm(dir,{recursive:true,force:true});}
}
async function capture(dir,fetchImpl=fake()) {
 const receipt=await captureGovmanOriginal({outputDir:dir,fetchImpl,
  clock:()=> '2026-10-21T17:00:00.000Z'});
 return receipt;
}
test('only official exact 2025 full-edition HTTPS XML URL is acceptable',()=>{
 assert.ok(isOfficialXmlUrl(OFFICIAL_URL));
 for (const u of [OFFICIAL_URL+'?changed=1',OFFICIAL_URL.replace('https:','http:'),
  OFFICIAL_URL.replace('www.govinfo.gov','www.govinfo.gov.evil.test'),
  OFFICIAL_URL.replace('.xml','-117.xml'), 'https://govinfo.gov.evil.test/a.xml'])
  assert.equal(isOfficialXmlUrl(u),false,u);
});
test('transport sanity rejects tiny, PDF, HTML and oversized document',()=>{
 assert.equal(plausibleXml(fixture),true);
 for (const b of [Buffer.from('<?xml/>'),Buffer.from('%PDF-1.7'.repeat(200)),
  Buffer.from('<html>'.repeat(200)),Buffer.alloc(MAX_BYTES+1)])
  assert.equal(plausibleXml(b),false);
});
test('read-only capture creates content-addressed original and research-only receipt',async()=>withDir(async dir=>{
 const r=await capture(dir);
 assert.equal(r.status,'captured_transient_pending_repository_and_independent_custody');
 assert.equal(r.original_sha256,sha(fixture));
 assert.equal(r.original_byte_count,fixture.length);
 assert.equal(r.source_storage_tier,'temporary_runner_artifact_only');
 assert.equal(r.current_first_level_institution_denominator,null);
 assert.equal(r.any_legal_or_command_authority_certified,false);
 assert.equal((await fs.readFile(path.join(dir,r.original_relative_path))).equals(fixture),true);
 assert.equal((await verifyGovmanReceipt({outputDir:dir,receipt:r})).source_acquired,true);
}));
test('block forged original checksum, source edition, and legal authority',async()=>withDir(async dir=>{
 const r=await capture(dir);
 for (const mutate of [x=>x.original_sha256='0'.repeat(64),
  x=>x.whole_federal_legal_institution_denominator=1,
  x=>x.any_legal_or_command_authority_certified=true,
  x=>x.independent_durable_custody_verified=true,
  x=>x.published_directory_extracted=true,
  x=>x.source_observation_count=999,
  x=>x.final_source_url='https://example.org/a.xml',
  x=>x.unreviewed_power='statutory_authority']) {
  const v=structuredClone(r); mutate(v);
  await assert.rejects(()=>verifyGovmanReceipt({outputDir:dir,receipt:v}),/INC-15D original source rejected:/);
 }
 const tampered=Buffer.from(fixture);tampered[250]^=1;
 await fs.writeFile(path.join(dir,r.original_relative_path),tampered);
 await assert.rejects(()=>verifyGovmanReceipt({outputDir:dir,receipt:r}),/absent or tampered/);
}));
test('HTTP denial remains explicitly blocked, with null observations',async()=>withDir(async dir=>{
 const r=await capture(dir,fake('unavailable',{status:403}));
 assert.equal(r.status,'blocked_original_bytes_unavailable');
 assert.match(r.failure_reason,/HTTP 403/);
 assert.equal(r.original_sha256,null);
 assert.equal((await verifyGovmanReceipt({outputDir:dir,receipt:r})).source_acquired,false);
}));
test('unsupported MIME fails closed',async()=>withDir(async dir=>{
 const r=await capture(dir,fake(fixture,{mime:'text/html'}));
 assert.equal(r.status,'blocked_original_bytes_unavailable');
 assert.match(r.failure_reason,/non-XML MIME/);
}));
test('off-domain redirect is rejected before a second request',async()=>withDir(async dir=>{
 let calls=0;
 const r=await capture(dir,async()=>{calls++;
  return new Response(null,{status:302,headers:{location:'https://example.org/evil.xml'}});
 });
 assert.equal(calls,1);
 assert.match(r.failure_reason,/off-allowlist redirect/);
}));
test('existing original path cannot be overwritten',async()=>withDir(async dir=>{
 const relative='originals/sha256/'+sha(fixture)+'.xml';
 await fs.mkdir(path.join(dir,'originals/sha256'),{recursive:true});
 await fs.writeFile(path.join(dir,relative),Buffer.alloc(fixture.length,0x58));
 const r=await capture(dir);
 assert.equal(r.status,'blocked_original_bytes_unavailable');
 assert.match(r.failure_reason,/EEXIST/);
 assert.equal((await fs.readFile(path.join(dir,relative)))[0],0x58);
}));
