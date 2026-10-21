// INC-15D.0: official Government Manual 2025 full-issue XML custody gate.
// A publisher directory is not a legal census, delegation, or authority record.
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const PACKAGE_ID = 'GOVMAN-2025-12-31';
export const PUBLICATION_DATE = '2025-12-31';
export const OFFICIAL_URL = `https://www.govinfo.gov/content/pkg/${PACKAGE_ID}/xml/${PACKAGE_ID}.xml`;
export const MAX_BYTES = 32 * 1024 * 1024;
const FIXED_PATH = `/content/pkg/${PACKAGE_ID}/xml/${PACKAGE_ID}.xml`;
const FAIL_PREFIX = 'INC-15D original source rejected: ';
const fail = message => { throw new Error(FAIL_PREFIX + message); };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const isHex = value => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const exactly = (value, keys) => value !== null && typeof value === 'object' &&
 !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());

// Never allow arbitrary redirects, HTTP, userinfo, query parameters or path substitution.
export function isOfficialXmlUrl(candidate) {
 try {
  const u = new URL(candidate);
  return u.protocol === 'https:' && (u.hostname === 'www.govinfo.gov' || u.hostname === 'govinfo.gov') &&
   !u.username && !u.password && !u.search && !u.hash && u.port === '' && u.pathname === FIXED_PATH;
 } catch { return false; }
}
export function plausibleXml(bytes) {
 if (!Buffer.isBuffer(bytes) || bytes.length < 1024 || bytes.length > MAX_BYTES) return false;
 // This is a transport sanity test, not an XML syntax/semantic validation.
 const head = bytes.subarray(0, 256).toString('utf8').replace(/^\uFEFF/, '').trimStart();
 const tail = bytes.subarray(-256).toString('utf8').trimEnd();
 return head.startsWith('<?xml') && tail.endsWith('>') && !head.toLowerCase().includes('<html');
}
function receipt(at) {
 return {
  id: 'INC15D-GOVMAN-2025-FULL-ISSUE-XML', package_id: PACKAGE_ID,
  official_source_url: OFFICIAL_URL, publication_date: PUBLICATION_DATE,
  retrieval_attempt_at_utc: at, final_source_url: null, media_type: null,
  status: 'blocked_original_bytes_unavailable', failure_reason: null,
  original_sha256: null, original_byte_count: null, original_relative_path: null,
  source_storage_tier: 'none', independent_durable_custody_verified: false,
  published_directory_extracted: false, source_observation_count: null,
  canonical_identity_crosswalk_reviewed: false,
  whole_federal_legal_institution_denominator: null,
  current_first_level_institution_denominator: null,
  any_legal_or_command_authority_certified: false
 };
}
const RECEIPT_KEYS = Object.keys(receipt('2025-12-31T00:00:00.000Z'));
async function readBounded(response) {
 const declared = response.headers.get('content-length');
 if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_BYTES))
  fail('invalid declared original size');
 if (!response.body) fail('missing publisher body');
 const reader = response.body.getReader();
 const chunks = []; let total = 0;
 try {
  for (;;) {
   const {done, value} = await reader.read();
   if (done) break;
   total += value.byteLength;
   if (total > MAX_BYTES) fail('original exceeds 32 MiB');
   chunks.push(Buffer.from(value));
  }
 } finally { reader.releaseLock(); }
 const bytes = Buffer.concat(chunks, total);
 // Content-Length may describe compressed transfer bytes; digest the decoded XML instead.
 if (!plausibleXml(bytes)) fail('response is not plausible full-issue XML');
 return bytes;
}
async function fetchOfficial(fetchImpl) {
 let url = OFFICIAL_URL;
 for (let redirects = 0; redirects <= 2; redirects++) {
  if (!isOfficialXmlUrl(url)) fail('nonofficial URL or redirect');
  const response = await fetchImpl(url, {
   redirect: 'manual', signal: AbortSignal.timeout(45000),
   headers: {Accept: 'application/xml, text/xml', 'User-Agent': 'ARFI-Source-Evidence/1.0 (https://arfinstitute.org)'}
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
   if (redirects === 2) fail('too many official redirects');
   const loc = response.headers.get('location');
   if (!loc) fail('redirect has no location');
   const next = new URL(loc, url).href;
   if (!isOfficialXmlUrl(next)) fail('off-allowlist redirect');
   url = next; continue;
  }
  if (response.status !== 200) fail('publisher HTTP ' + response.status);
  const media = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!['application/xml', 'text/xml', 'application/octet-stream'].includes(media))
   fail('publisher non-XML MIME ' + (media || 'missing'));
  return {url, media, bytes: await readBounded(response)};
 }
 fail('redirect resolution exhausted');
}
export async function captureGovmanOriginal({outputDir, fetchImpl = fetch, clock = () => new Date().toISOString()}) {
 if (typeof outputDir !== 'string' || !path.isAbsolute(outputDir)) fail('absolute output directory required');
 await fs.mkdir(outputDir, {recursive: true});
 const r = receipt(clock());
 try {
  const {url, media, bytes} = await fetchOfficial(fetchImpl);
  const sha = digest(bytes);
  const relative = `originals/sha256/${sha}.xml`;
  await fs.mkdir(path.join(outputDir, 'originals/sha256'), {recursive: true});
  await fs.writeFile(path.join(outputDir, relative), bytes, {flag: 'wx'});
  r.status = 'captured_transient_pending_repository_and_independent_custody';
  r.failure_reason = null; r.final_source_url = url; r.media_type = media;
  r.original_sha256 = sha; r.original_byte_count = bytes.length;
  r.original_relative_path = relative; r.source_storage_tier = 'temporary_runner_artifact_only';
 } catch (e) {
  r.failure_reason = String(e?.message || e).slice(0, 350);
 }
 await fs.writeFile(path.join(outputDir, 'capture-receipt.json'), JSON.stringify(r, null, 2) + '\n', {flag: 'wx'});
 return r;
}
export async function verifyGovmanReceipt({outputDir, receipt: r}) {
 if (typeof outputDir !== 'string' || !path.isAbsolute(outputDir) || !exactly(r, RECEIPT_KEYS) ||
  r.id !== 'INC15D-GOVMAN-2025-FULL-ISSUE-XML' || r.package_id !== PACKAGE_ID ||
  r.official_source_url !== OFFICIAL_URL || r.publication_date !== PUBLICATION_DATE ||
  typeof r.retrieval_attempt_at_utc !== 'string' || !r.retrieval_attempt_at_utc ||
  r.independent_durable_custody_verified !== false ||
  r.published_directory_extracted !== false || r.source_observation_count !== null ||
  r.canonical_identity_crosswalk_reviewed !== false ||
  r.whole_federal_legal_institution_denominator !== null ||
  r.current_first_level_institution_denominator !== null ||
  r.any_legal_or_command_authority_certified !== false)
  fail('nonclosed receipt or unsupported census/authority claim');
 if (r.status === 'blocked_original_bytes_unavailable') {
  if (typeof r.failure_reason !== 'string' || !r.failure_reason || r.final_source_url !== null ||
   r.media_type !== null || r.original_sha256 !== null || r.original_byte_count !== null ||
   r.original_relative_path !== null || r.source_storage_tier !== 'none')
   fail('blocked attempt claims original custody');
  return {valid: true, source_acquired: false, independently_durable: false};
 }
 if (r.status !== 'captured_transient_pending_repository_and_independent_custody' ||
  r.failure_reason !== null || !isOfficialXmlUrl(r.final_source_url) ||
  !['application/xml', 'text/xml', 'application/octet-stream'].includes(r.media_type) ||
  !isHex(r.original_sha256) || !Number.isInteger(r.original_byte_count) ||
  r.original_byte_count < 1024 || r.original_byte_count > MAX_BYTES ||
  r.original_relative_path !== `originals/sha256/${r.original_sha256}.xml` ||
  r.source_storage_tier !== 'temporary_runner_artifact_only')
  fail('invalid acquired receipt');
 const original = await fs.readFile(path.join(outputDir, r.original_relative_path));
 if (!plausibleXml(original) || original.length !== r.original_byte_count ||
  digest(original) !== r.original_sha256) fail('original bytes absent or tampered');
 return {valid: true, source_acquired: true, independently_durable: false,
  sha256: r.original_sha256, original_byte_count: original.length};
}
