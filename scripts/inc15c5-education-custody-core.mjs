// INC-15C.5 Education FY2024 ED-authored report retained via official ERIC distribution.
// Source custody differs from direct ED.gov publisher bytes, WORM custody, or legal status.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const SHA='0af9a9f4e11ddce14fffd467317d9e4c531e9931edb43abcb3ddb8e4fa6291b7';
export const BLOB='82eb949fa6b61c4483a188f9e75b3e73a86ae49b';
export const ORIGINAL='evidence/education-fy2024/originals/sha256/'+SHA+'.pdf';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const json=p=>JSON.parse(read(p).toString('utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const fail=m=>{throw Error('INC-15C.5 original custody rejected: '+m)};
const ensure=(cond,m)=>{if(!cond)fail(m)};
const closed=(x,y)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 eq(Object.keys(x).sort(),[...y].sort());
export function loadEducationOriginal(){
 return {original:read(ORIGINAL),
  acquisition:json('evidence/education-fy2024/receipts/original-acquisition.json'),
  custody:json('evidence/education-fy2024/receipts/git-custody.json')};
}
const ACQ_FIELDS=['record_type','source_id','edition','publisher','official_publisher_posted_on',
'attempted_at_utc','source_allowlist','attempts','status','selected_source_url',
'selected_distribution_type','original_sha256','original_byte_count','artifact_relative_path',
'pdf_header_and_eof_verified','pdf_render_inspected','storage_tier','git_original_custody_verified',
'independent_worm_custody_verified','extracted_chart_box_count',
'chart_population_exhaustive_verified','complete_current_ED_first_level_denominator',
'independent_legal_review_complete','legal_composition_or_command_delegation_verified'];
const CUSTODY_FIELDS=['id','original_document_publisher','publisher_report_edition',
'official_publisher_posting_date','distribution_url','distribution_type',
'direct_department_edgov_original_bytes_verified','original_eric_distribution_sha256',
'original_eric_distribution_byte_count','git_blob_sha1','git_path','source_capture_workflow_run',
'source_capture_artifact_id','report_pdf_physical_pages','fy2024_chart_physical_pdf_page',
'fy2024_chart_printed_report_page','chart_boxes_independently_admitted',
'current_ED_department_legal_first_level_denominator','independent_worm_custody_verified',
'independent_legal_review_complete','authority_verified_from_chart'];
export function verifyEducationOriginal({original,acquisition:a,custody:c}){
 ensure(Buffer.isBuffer(original)&&original.length===5675466&&digest(original)===SHA&&
  blob(original)===BLOB&&original.subarray(0,9).toString('latin1').startsWith('%PDF-1.6')&&
  original.subarray(-4096).toString('latin1').includes('%%EOF'),
  'retained source original byte SHA, Git blob or PDF trailer mismatch');
 ensure(closed(a,ACQ_FIELDS)&&a.record_type==='INC15C5-ED-FY2024-APR-OFFICIAL-PDF-ORIGINAL-ACQUISITION'&&
  a.source_id==='INC15C5-ED-FY2024-APR-CHART'&&a.edition==='FY2024'&&
  a.publisher==='U.S. Department of Education'&&a.official_publisher_posted_on==='2025-01-15'&&
  a.status==='captured_transient_requires_git_custody'&&
  a.selected_source_url==='https://files.eric.ed.gov/fulltext/ED673614.pdf'&&
  a.selected_distribution_type==='official_ED_ERIC_repository_reproduction_not_direct_department_url'&&
  a.original_sha256===SHA&&a.original_byte_count===5675466&&
  a.artifact_relative_path==='originals/sha256/'+SHA+'.pdf'&&
  a.pdf_header_and_eof_verified===true&&a.pdf_render_inspected===false&&
  a.storage_tier==='temporary_runner_artifact_only'&&
  a.git_original_custody_verified===false&&a.independent_worm_custody_verified===false&&
  a.extracted_chart_box_count===null&&a.chart_population_exhaustive_verified===false&&
  a.complete_current_ED_first_level_denominator===null&&
  a.independent_legal_review_complete===false&&
  a.legal_composition_or_command_delegation_verified===false&&
  Array.isArray(a.attempts)&&a.attempts.length===3&&
  a.attempts[0].result==='http_rejected'&&a.attempts[0].reason==='HTTP_403'&&
  a.attempts[1].result==='http_rejected'&&a.attempts[1].reason==='HTTP_403'&&
  a.attempts[2].result==='received_original_pdf'&&
  a.attempts[2].requested_url===a.selected_source_url,
  'acquisition attempt, direct URL fallback or unsupported publisher custody claim');
 ensure(closed(c,CUSTODY_FIELDS)&&c.id==='INC15C5-ED-ERIC-REPORT-GIT-CUSTODY'&&
  c.original_document_publisher===a.publisher&&c.publisher_report_edition===a.edition&&
  c.official_publisher_posting_date===a.official_publisher_posted_on&&
  c.distribution_url===a.selected_source_url&&
  c.distribution_type===a.selected_distribution_type&&
  c.direct_department_edgov_original_bytes_verified===false&&
  c.original_eric_distribution_sha256===SHA&&
  c.original_eric_distribution_byte_count===5675466&&
  c.git_blob_sha1===BLOB&&c.git_path===ORIGINAL&&
  c.source_capture_workflow_run===39663546563&&
  c.source_capture_artifact_id===12375557273&&
  c.report_pdf_physical_pages===146&&
  c.fy2024_chart_physical_pdf_page===10&&
  c.fy2024_chart_printed_report_page===5&&
  c.chart_boxes_independently_admitted===false&&
  c.current_ED_department_legal_first_level_denominator===null&&
  c.independent_worm_custody_verified===false&&
  c.independent_legal_review_complete===false&&
  c.authority_verified_from_chart===false,
  'Git custody receipt or authority overclaimed');
 return {verified:true,publisher:'Department of Education',distribution:'official_ED_ERIC',
  bytes:original.length,sha256:SHA,gitBlobSha1:BLOB,chartPhysicalPdfPage:10,
  sourceEdition:'FY2024',directPublisherOriginalBytesQualified:false,
  independentWormQualified:false,legalFirstLevelDenominator:null};
}
