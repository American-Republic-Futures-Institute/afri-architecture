// INC-15D.1: verify complete official XML original in Git without legal qualification.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const ORIGINAL_SHA='c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138';
export const GIT_BLOB='195c46a67c87ae85f1dedd423250900f119a041a';
export const XML_PATH='evidence/govman-2025/originals/sha256/c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138.xml';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const keys=(o,k)=>o&&typeof o==='object'&&!Array.isArray(o)&&eq(Object.keys(o).sort(),[...k].sort());
const requireClaim=(condition,reason)=>{if(!condition)throw Error('INC-15D Git custody rejected: '+reason);};
const hash256=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
export function loadINC15DSource(){
 return {original:read(XML_PATH),
  capture:JSON.parse(read('evidence/govman-2025/receipts/capture-receipt.json')),
  custody:JSON.parse(read('evidence/govman-2025/receipts/repository-custody.json'))};
}
export function validateINC15DSource({original,capture,custody}){
 requireClaim(Buffer.isBuffer(original)&&original.length===8138096&&
  hash256(original)===ORIGINAL_SHA&&blob(original)===GIT_BLOB,
  'publisher original byte length, SHA-256 or Git blob mismatch');
 requireClaim(original.subarray(0,20).toString('utf8').startsWith('<?xml version')&&
  original.includes(Buffer.from('<GovernmentManual>'))&&
  original.includes(Buffer.from('</GovernmentManual>')),
  'source transport signature mismatch (not a semantic parser)');
 const expectedCaptureKeys=['id','package_id','official_source_url','publication_date',
  'retrieval_attempt_at_utc','final_source_url','media_type','status','failure_reason',
  'original_sha256','original_byte_count','original_relative_path','source_storage_tier',
  'independent_durable_custody_verified','published_directory_extracted',
  'source_observation_count','canonical_identity_crosswalk_reviewed',
  'whole_federal_legal_institution_denominator','current_first_level_institution_denominator',
  'any_legal_or_command_authority_certified'];
 requireClaim(keys(capture,expectedCaptureKeys)&&
  capture.id==='INC15D-GOVMAN-2025-FULL-ISSUE-XML'&&
  capture.package_id==='GOVMAN-2025-12-31'&&
  capture.publication_date==='2025-12-31'&&
  capture.official_source_url==='https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31.xml'&&
  capture.final_source_url===capture.official_source_url&&
  capture.media_type==='application/xml'&&
  capture.status==='captured_transient_pending_repository_and_independent_custody'&&
  capture.original_sha256===ORIGINAL_SHA&&
  capture.original_byte_count===8138096&&
  capture.original_relative_path==='originals/sha256/'+ORIGINAL_SHA+'.xml'&&
  capture.source_storage_tier==='temporary_runner_artifact_only'&&
  capture.failure_reason===null&&
  capture.independent_durable_custody_verified===false&&
  capture.published_directory_extracted===false&&
  capture.source_observation_count===null&&
  capture.canonical_identity_crosswalk_reviewed===false&&
  capture.whole_federal_legal_institution_denominator===null&&
  capture.current_first_level_institution_denominator===null&&
  capture.any_legal_or_command_authority_certified===false,
  'historical acquisition receipt mutated or inflated');
 const expectedCustodyKeys=['record_type','publisher_package','source_publication_date',
  'retrieval_artifact_id','retrieval_workflow_run_id','original_sha256','original_byte_count',
  'git_blob_sha1','git_repository_original_path','source_entries_parsed_at_promotion',
  'publisher_entry_count_legal_institution_denominator','independent_worm_custody_verified',
  'human_legal_review_complete','current_first_level_denominator',
  'operational_command_or_delegation_certified'];
 requireClaim(keys(custody,expectedCustodyKeys)&&
  custody.record_type==='inc15d_govman_2025_repository_original_custody'&&
  custody.publisher_package===capture.package_id&&
  custody.source_publication_date===capture.publication_date&&
  custody.retrieval_artifact_id===12372126121&&
  custody.retrieval_workflow_run_id===39655760881&&
  custody.original_sha256===ORIGINAL_SHA&&
  custody.original_byte_count===8138096&&
  custody.git_blob_sha1===GIT_BLOB&&
  custody.git_repository_original_path===XML_PATH&&
  custody.source_entries_parsed_at_promotion===231&&
  custody.publisher_entry_count_legal_institution_denominator===false&&
  custody.independent_worm_custody_verified===false&&
  custody.human_legal_review_complete===false&&
  custody.current_first_level_denominator===null&&
  custody.operational_command_or_delegation_certified===false,
  'Git custody record mutated, false WORM or legal authority claim');
 return {source:'GOVMAN-2025-12-31',originalBytes:original.length,
  sha256:ORIGINAL_SHA,gitBlob:GIT_BLOB,publisherNodeObservation:231,
  currentLegalFirstLevelDenominator:null,independentWormCustody:false};
}
