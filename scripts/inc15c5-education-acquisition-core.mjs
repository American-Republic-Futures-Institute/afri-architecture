// INC-15C.5 original ED FY2024 coordinating-structure PDF acquisition. No legal authority claims.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const SOURCE_ID='INC15C5-ED-FY2024-APR-CHART';
export const EDITION='FY2024';
export const PUBLISHER_POSTED='2025-01-15';
export const URLS=Object.freeze([
 'https://www.ed.gov/media/document/fy-2024-annual-agency-performance-report-109331.pdf',
 'https://www.ed.gov/sites/ed/files/2025-01/FY2024-Annual-Agency-Performance-Report.pdf',
 'https://files.eric.ed.gov/fulltext/ED673614.pdf'
]);
export const MAX_BYTES=25*1024*1024;
const sha=b=>createHash('sha256').update(b).digest('hex');
const fail=m=>{throw Error('INC-15C.5 PDF rejected: '+m)};
const allowed=u=>{
 try{
  const x=new URL(u);
  if(x.protocol!=='https:'||x.username||x.password||x.search||x.hash||x.port)return false;
  return URLS.includes(x.href)||(
   x.hostname==='ed.gov'&&URLS.some(p=>{
    const t=new URL(p);
    return t.hostname==='www.ed.gov'&&t.pathname===x.pathname;
   })
  );
 }catch{return false;}
};
export const isApprovedUrl=allowed;
export const isPdf=b=>Buffer.isBuffer(b)&&b.length>=1024&&b.length<=MAX_BYTES&&
 /^%PDF-1\.[0-9]/.test(b.subarray(0,16).toString('latin1'))&&
 b.subarray(-4096).toString('latin1').includes('%%EOF');
const sample=at=>({
 record_type:'INC15C5-ED-FY2024-APR-OFFICIAL-PDF-ORIGINAL-ACQUISITION',
 source_id:SOURCE_ID,edition:EDITION,publisher:'U.S. Department of Education',
 official_publisher_posted_on:PUBLISHER_POSTED,attempted_at_utc:at,
 source_allowlist:[...URLS],attempts:[],
 status:'blocked_no_official_pdf_bytes',selected_source_url:null,selected_distribution_type:null,
 original_sha256:null,original_byte_count:null,artifact_relative_path:null,
 pdf_header_and_eof_verified:false,pdf_render_inspected:false,
 storage_tier:'no_original_archived',git_original_custody_verified:false,
 independent_worm_custody_verified:false,
 extracted_chart_box_count:null,chart_population_exhaustive_verified:false,
 complete_current_ED_first_level_denominator:null,
 independent_legal_review_complete:false,
 legal_composition_or_command_delegation_verified:false
});
const closed=(obj,template)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&
 JSON.stringify(Object.keys(obj).sort())===JSON.stringify(Object.keys(template).sort());
const report=(url,result,reason,redirects,at)=>({
 requested_url:url,result,reason,redirects,attempted_at_utc:at
});
const attemptFields=report(URLS[0],'failure','reason',0,'2000-01-01T00:00:00.000Z');
async function downloadApproved(url,fetchImpl,clock){
 let current=url,redirects=0;
 for(;;){
  const response=await fetchImpl(current,{
   redirect:'manual',headers:{'Accept':'application/pdf',
    'User-Agent':'ARFI-Public-Research-Source-Custody/1.0 (https://arfinstitute.org)'},
   signal:AbortSignal.timeout(30000)
  });
  if([301,302,303,307,308].includes(response.status)){
   if(redirects===2)fail('redirect limit exceeded');
   const location=response.headers.get('location');
   if(!location)fail('redirect missing destination');
   const next=new URL(location,current).href;
   if(!allowed(next))fail('redirect outside pinned government PDF allowlist');
   current=next;redirects++;continue;
  }
  if(response.status!==200)return {log:report(url,'http_rejected','HTTP_'+response.status,redirects,clock())};
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['application/pdf','application/octet-stream','binary/octet-stream'].includes(type))
   return {log:report(url,'media_type_rejected','unexpected_type_'+type,redirects,clock())};
  const declared=response.headers.get('content-length');
  if(declared&&(!/^[0-9]+$/.test(declared)||Number(declared)>MAX_BYTES))
   fail('oversized Content-Length');
  if(!response.body)fail('empty response body');
  const chunks=[];let total=0;const reader=response.body.getReader();
  try{
   while(true){
    const {done,value}=await reader.read();if(done)break;
    total+=value.byteLength;if(total>MAX_BYTES)fail('download exceeds source size cap');
    chunks.push(Buffer.from(value));
   }
  }finally{reader.releaseLock();}
  const bytes=Buffer.concat(chunks,total);
  if(!isPdf(bytes))fail('PDF signature/size/trailer incorrect');
  return {log:report(url,'received_original_pdf','validated_header_eof_and_sha256_transient',redirects,clock()),
   bytes,final_url:current};
 }
}
export async function acquireEducationPdf({outputDir,fetchImpl=fetch,clock=()=>new Date().toISOString()}){
 if(typeof outputDir!=='string'||!path.isAbsolute(outputDir))fail('absolute outputDir required');
 const receipt=sample(clock());
 await fs.mkdir(outputDir,{recursive:true});
 for(const url of URLS){
  let candidate;
  try{candidate=await downloadApproved(url,fetchImpl,clock);}
  catch(e){
   receipt.attempts.push(report(url,'error',(e?.message||String(e)).slice(0,300),0,clock()));
   continue;
  }
  receipt.attempts.push(candidate.log);
  if(!candidate.bytes)continue;
  const checksum=sha(candidate.bytes);
  const relative='originals/sha256/'+checksum+'.pdf';
  const p=path.join(outputDir,relative);
  await fs.mkdir(path.dirname(p),{recursive:true});
  await fs.writeFile(p,candidate.bytes,{flag:'wx'});
  receipt.status='captured_transient_requires_git_custody';
  receipt.selected_source_url=candidate.final_url;
  receipt.selected_distribution_type=url.includes('files.eric.ed.gov')?
   'official_ED_ERIC_repository_reproduction_not_direct_department_url':
   'direct_department_publisher_url';
  receipt.original_sha256=checksum;
  receipt.original_byte_count=candidate.bytes.length;
  receipt.artifact_relative_path=relative;
  receipt.pdf_header_and_eof_verified=true;
  receipt.storage_tier='temporary_runner_artifact_only';
  break;
 }
 await fs.writeFile(path.join(outputDir,'capture-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 return receipt;
}
export async function verifyEducationReceipt({outputDir,receipt}){
 const expected=sample('2000-01-01T00:00:00.000Z');
 if(!closed(receipt,expected)||receipt.record_type!==expected.record_type||
  receipt.source_id!==SOURCE_ID||receipt.edition!==EDITION||
  receipt.publisher!==expected.publisher||receipt.official_publisher_posted_on!==PUBLISHER_POSTED||
  JSON.stringify(receipt.source_allowlist)!==JSON.stringify(URLS)||
  typeof receipt.attempted_at_utc!=='string'||!Number.isFinite(Date.parse(receipt.attempted_at_utc))||
  !Array.isArray(receipt.attempts)||receipt.attempts.length<1||
  receipt.attempts.length>URLS.length||
  receipt.pdf_render_inspected!==false||
  receipt.git_original_custody_verified!==false||
  receipt.independent_worm_custody_verified!==false||
  receipt.extracted_chart_box_count!==null||
  receipt.chart_population_exhaustive_verified!==false||
  receipt.complete_current_ED_first_level_denominator!==null||
  receipt.independent_legal_review_complete!==false||
  receipt.legal_composition_or_command_delegation_verified!==false)
  fail('source receipt forged, unsourced count or illegal authority claimed');
 for(const [i,a] of receipt.attempts.entries()){
  if(!closed(a,attemptFields)||a.requested_url!==URLS[i]||
   !['error','http_rejected','media_type_rejected','received_original_pdf'].includes(a.result)||
   typeof a.reason!=='string'||typeof a.attempted_at_utc!=='string'||
   !Number.isInteger(a.redirects)||a.redirects<0||a.redirects>2)
   fail('unapproved source attempt');
 }
 if(receipt.status==='blocked_no_official_pdf_bytes'){
  if(receipt.selected_source_url!==null||receipt.selected_distribution_type!==null||
   receipt.original_sha256!==null||receipt.original_byte_count!==null||
   receipt.artifact_relative_path!==null||receipt.pdf_header_and_eof_verified!==false||
   receipt.storage_tier!=='no_original_archived'||
   receipt.attempts.some(x=>x.result==='received_original_pdf'))
   fail('blocked capture made false source originality claim');
  return {verified:true,acquired:false};
 }
 if(receipt.status!=='captured_transient_requires_git_custody'||
  !allowed(receipt.selected_source_url)||
  !['direct_department_publisher_url','official_ED_ERIC_repository_reproduction_not_direct_department_url']
   .includes(receipt.selected_distribution_type)||
  !/^[a-f0-9]{64}$/.test(receipt.original_sha256||'')||
  !Number.isInteger(receipt.original_byte_count)||receipt.original_byte_count<1024||
  receipt.original_byte_count>MAX_BYTES||receipt.pdf_header_and_eof_verified!==true||
  receipt.storage_tier!=='temporary_runner_artifact_only'||
  receipt.attempts.at(-1)?.result!=='received_original_pdf'||
  receipt.artifact_relative_path!=='originals/sha256/'+receipt.original_sha256+'.pdf'||
  (receipt.selected_distribution_type==='direct_department_publisher_url')!==
   ['www.ed.gov','ed.gov'].includes(new URL(receipt.selected_source_url).hostname))
  fail('transient PDF capture not approved');
 const bytes=await fs.readFile(path.join(outputDir,receipt.artifact_relative_path));
 if(!isPdf(bytes)||bytes.length!==receipt.original_byte_count||
  sha(bytes)!==receipt.original_sha256)fail('PDF original changed after capture');
 return {verified:true,acquired:true,original_sha256:receipt.original_sha256,
  bytes:bytes.length,distribution:receipt.selected_distribution_type,
  custody_status:'temporary_runner_only_no_legal_qualification'};
}
