// INC-15C.6 verify exact official OIG source originals and research-only custody.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const HTML_SHA='97fd0513471e013ee8de2534f81184621c7babb7bf2f1d3181f935df275300a6';
export const PDF_SHA='068fa03980a4add3be412750ce63b0cc435c3d77f54a1153347b19e1200dc3ea';
export const HTML_BLOB='5e4281689da34a32add7adc6f522f276bb11fef7';
export const PDF_BLOB='56504a9092deb5d7b44c8c3e6261e11d5a7e8fd8';
export const PREFIX='evidence/hhs-oig-2025';
export const HTML_PATH=PREFIX+'/originals/hhs_oig_chart/sha256/'+HTML_SHA+'.html';
export const PDF_PATH=PREFIX+'/originals/hhs_oig_2025_pdf/sha256/'+PDF_SHA+'.pdf';
export const TITLES=[
 'Immediate Office of Inspector General','Office of Audit Services',
 'Office of Evaluation and Inspections','Office of Management and Policy',
 'Office of Investigations','Office of Counsel to the Inspector General'
];
export const EXPECTED_SOURCE=[
 ['hhs_org_index','blocked_no_original_bytes','HTTP_403'],
 ['hhs_strategy_2024','blocked_no_original_bytes','HTTP_403'],
 ['hhs_oig_chart','transient_original_captured',null],
 ['hhs_oig_2025_pdf','transient_original_captured',null],
 ['hhs_dab_chart','blocked_no_original_bytes','HTTP_403'],
 ['hhs_omha_chart','blocked_no_original_bytes','HTTP_403'],
 ['hhs_aspr_chart','blocked_no_original_bytes','redirect outside exact HHS source path']
];
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const sameKeys=(o,k)=>o&&typeof o==='object'&&!Array.isArray(o)&&eq(Object.keys(o).sort(),[...k].sort());
const assert=(v,m)=>{if(!v)throw Error('INC-15C.6 Git custody rejected: '+m);};
const R_FIELDS=[
 'record_type','source_acquisition_workflow_run','source_acquisition_artifact_id',
 'oig_html_original_sha256','oig_html_original_bytes','oig_html_git_blob_sha1',
 'oig_html_repository_path','oig_html_edition','oig_pdf_original_sha256',
 'oig_pdf_original_bytes','oig_pdf_git_blob_sha1','oig_pdf_repository_path',
 'oig_pdf_as_of_date','oig_pdf_physical_pages','oig_html_source_office_headings',
 'hhs_department_index_html_custodied','hhs_dab_official_html_custodied',
 'hhs_omha_official_html_custodied','hhs_strategy_2024_pdf_custodied',
 'aspr_pdf_original_custodied','independent_worm_custody_verified',
 'independent_legal_review_complete','complete_current_hhs_first_level_denominator',
 'inspector_general_subordination_or_signed_delegation_verified',
 'oig_legal_internal_organization_independently_certified'
];
const SOURCE_FIELDS=[
 'record_type','key','source_id','requested_official_url','publisher',
 'source_edition_attribution','source_kind','retrieved_at_utc','result',
 'failure','final_url','content_type','redirect_chain','original_relative_path',
 'original_sha256','original_byte_count','retrieval_tier','git_original_custody_verified',
 'independent_worm_custody_verified','source_directory_edition_fully_extracted',
 'current_hhs_first_level_legal_denominator','independent_legal_review_complete',
 'department_command_or_adjudicative_authority_certified',
 'cross_edition_population_addition_authorized'
];
export function loadInc15c6OigOriginal(){
 return {html:read(HTML_PATH),pdf:read(PDF_PATH),
  custody:JSON.parse(read(PREFIX+'/receipts/git-custody.json')),
  sourceProbe:JSON.parse(read(PREFIX+'/receipts/source-probe.json'))};
}
export function validateInc15c6OigOriginal({html,pdf,custody:c,sourceProbe:s}){
 assert(Buffer.isBuffer(html)&&html.length===41739&&sha(html)===HTML_SHA&&
  blob(html)===HTML_BLOB,'OIG official HTML byte hash or Git blob mismatch');
 assert(Buffer.isBuffer(pdf)&&pdf.length===545208&&sha(pdf)===PDF_SHA&&
  blob(pdf)===PDF_BLOB&&pdf.subarray(0,9).toString('latin1').startsWith('%PDF-1.7')&&
  pdf.subarray(-4096).includes(Buffer.from('%%EOF')),'OIG dated original PDF byte hash or Git blob mismatch');
 assert(sameKeys(c,R_FIELDS)&&c.record_type==='inc15c6_hhs_oig_2025_git_custody'&&
  c.source_acquisition_workflow_run===39668188500&&c.source_acquisition_artifact_id===12378132516&&
  c.oig_html_original_sha256===HTML_SHA&&c.oig_html_original_bytes===41739&&
  c.oig_html_git_blob_sha1===HTML_BLOB&&c.oig_html_repository_path===HTML_PATH&&
  c.oig_html_edition==='observed_at_capture_not_a_certified_2025_html_snapshot'&&
  c.oig_pdf_original_sha256===PDF_SHA&&c.oig_pdf_original_bytes===545208&&
  c.oig_pdf_git_blob_sha1===PDF_BLOB&&c.oig_pdf_repository_path===PDF_PATH&&
  c.oig_pdf_as_of_date==='2025-12-23'&&c.oig_pdf_physical_pages===1&&
  eq(c.oig_html_source_office_headings,TITLES)&&
  c.hhs_department_index_html_custodied===false&&
  c.hhs_dab_official_html_custodied===false&&
  c.hhs_omha_official_html_custodied===false&&
  c.hhs_strategy_2024_pdf_custodied===false&&
  c.aspr_pdf_original_custodied===false&&
  c.independent_worm_custody_verified===false&&
  c.independent_legal_review_complete===false&&
  c.complete_current_hhs_first_level_denominator===null&&
  c.inspector_general_subordination_or_signed_delegation_verified===false&&
  c.oig_legal_internal_organization_independently_certified===false,
  'closed Git custody receipt or office authority claim mismatch');
 assert(s&&sameKeys(s,['contract_version','source_probes','same_edition_or_bytes_asserted',
  'federal_legal_roster_complete','legal_first_level_denominator','independent_worm_qualification'])&&
  s.contract_version==='inc15c6_publisher_source_probe_v1'&&
  s.same_edition_or_bytes_asserted===false&&
  s.federal_legal_roster_complete===false&&
  s.legal_first_level_denominator===null&&s.independent_worm_qualification===false&&
  Array.isArray(s.source_probes)&&s.source_probes.length===7,
  'original probe receipt truncated or unlawfully promoted');
 for(let i=0;i<EXPECTED_SOURCE.length;i++){
  const [key,status,failure]=EXPECTED_SOURCE[i],a=s.source_probes[i];
  assert(sameKeys(a,SOURCE_FIELDS)&&a.record_type===s.contract_version&&
   a.key===key&&a.result===status&&a.failure===failure&&
   a.publisher==='U.S. Department of Health and Human Services'&&
   a.git_original_custody_verified===false&&
   a.independent_worm_custody_verified===false&&
   a.source_directory_edition_fully_extracted===false&&
   a.current_hhs_first_level_legal_denominator===null&&
   a.independent_legal_review_complete===false&&
   a.department_command_or_adjudicative_authority_certified===false&&
   a.cross_edition_population_addition_authorized===false,
   'source probe changed or legal qualification fabricated: '+key);
  if(status==='blocked_no_original_bytes'){
   assert(a.original_sha256===null&&a.original_relative_path===null&&
    a.original_byte_count===null&&a.retrieval_tier==='no_source_archived',
    'blocked HHS publisher source falsely archived');
  }else{
   const isHtml=key==='hhs_oig_chart',d=isHtml?HTML_SHA:PDF_SHA;
   assert(a.original_sha256===d&&a.original_byte_count===(isHtml?41739:545208)&&
    a.retrieval_tier==='github_runner_artifact_only'&&
    a.original_relative_path==='originals/'+key+'/sha256/'+d+(isHtml?'.html':'.pdf'),
    'OIG source artifact swapped or false source epoch');
  }
 }
 const t=html.toString('utf8');
 for(const title of TITLES)assert(t.includes(title),'missing official OIG heading: '+title);
 return {oigHtmlOriginalSha256:HTML_SHA,oigPdfOriginalSha256:PDF_SHA,
  htmlOfficeHeadingCount:6,datedChartAsOf:'2025-12-23',
  widerHhsIndexOriginalArchived:false,hhsLegalFirstLevelDenominator:null,
  legalCommandOrDelegationCertified:false,independentWormCustody:false};
}
