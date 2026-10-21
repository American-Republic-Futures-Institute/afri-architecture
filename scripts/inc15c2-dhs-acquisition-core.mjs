// INC-15C.2 official PDF original-byte acquisition. Never substitute scraped text.
import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const DHS_REPORT_URLS=Object.freeze([
 "https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf",
 "https://www.dhs.gov/sites/default/files/2025-01/2025_0117_dhs_annual_performance_report_fy2024.pdf"
]);
export const SOURCE_ID="CENSUS-SRC-DHS-CHART-2025";
export const MAX_BYTES=40*1024*1024;
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const defined=(x)=>x!==null&&x!==undefined;
export const isAllowedUrl=url=>typeof url==="string"&&DHS_REPORT_URLS.includes(url);
export const isPdf=bytes=>{
 if(!Buffer.isBuffer(bytes)||bytes.length<1024||bytes.length>MAX_BYTES)return false;
 if(!bytes.subarray(0,8).toString("ascii").match(/^%PDF-[12]\.[0-9]/))return false;
 return bytes.subarray(-4096).toString("latin1").includes("%%EOF");
};
const baseReceipt=(timestamp)=>({
 id:"INC15C2-DHS-FY2024-OFFICIAL-PDF-PROBE",
 source_id:SOURCE_ID,source_edition:"FY2024",original_published_on:"2025-01-17",
 attempted_at_utc:timestamp,allowlisted_urls:[...DHS_REPORT_URLS],
 attempts:[],status:"blocked_original_publisher_bytes_unavailable",
 acquired_url:null,original_sha256:null,original_byte_count:null,
 artifact_relative_path:null,
 storage_tier:"no_original_archived",independent_durable_custody_verified:false,
 original_pdf_page_24_inspected:false,full_chart_population_reconciled:false,
 original_census_candidates_unchanged:true,current_dhs_first_level_denominator:null,
 independent_legal_review_complete:false,adl1_certified_count:0
});
const RECEIPT_FIELDS=Object.keys(baseReceipt("2000-01-01T00:00:00.000Z")).sort();
const ATTEMPT_FIELDS=Object.keys(attempt("https://www.dhs.gov","http_rejected","HTTP_403","2000-01-01T00:00:00.000Z",0)).sort();
const closed=(obj,expected)=>obj&&typeof obj==="object"&&!Array.isArray(obj)&&
 JSON.stringify(Object.keys(obj).sort())===JSON.stringify(expected);
function fail(message){throw new Error("INC-15C.2 evidence rejected: "+message);}
async function boundedPdf(response){
 const declared=response.headers.get("content-length");
 if(declared&&(!/^\d+$/.test(declared)||Number(declared)>MAX_BYTES))
  fail("official document exceeds declared size limit");
 if(!response.body)fail("official PDF returned no body");
 const reader=response.body.getReader();
 const chunks=[];let total=0;
 try{
  for(;;){
   const {done,value}=await reader.read();if(done)break;
   total+=value.byteLength;
   if(total>MAX_BYTES)fail("official PDF exceeds actual size limit");
   chunks.push(Buffer.from(value));
  }
 }finally{reader.releaseLock();}
 const bytes=Buffer.concat(chunks,total);
 if(!isPdf(bytes))fail("HTTP body fails strict PDF header, tail or size checks");
 return bytes;
}
function attempt(url,status,reason,at,redirects){
 return {requested_official_url:url,result:status,reason,attempted_at_utc:at,redirect_count:redirects};
}
async function once(url,fetchImpl,clock){
 let requested=url;let redirects=0;
 for(;;){
  const response=await fetchImpl(requested,{
   redirect:"manual",signal:AbortSignal.timeout(35000),
   headers:{Accept:"application/pdf", "User-Agent":"ARFI-Source-Evidence/1.0 (noncommercial public-document preservation; https://arfinstitute.org)"}
  });
  if([301,302,303,307,308].includes(response.status)){
   if(redirects>=2)fail("too many redirects at official publisher");
   const redirect=response.headers.get("location");
   if(!redirect)fail("redirect without Location");
   const next=new URL(redirect,requested).href;
   if(!isAllowedUrl(next))fail("redirect outside exact DHS government PDF allowlist");
   requested=next;redirects++;continue;
  }
  if(response.status!==200)
   return {log:attempt(url,"http_rejected","HTTP_"+response.status,clock(),redirects)};
  const mime=(response.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
  if(!["application/pdf","application/octet-stream"].includes(mime))
   return {log:attempt(url,"invalid_response","unexpected_MIME_"+mime,clock(),redirects)};
  const bytes=await boundedPdf(response);
  return {log:attempt(url,"received_pdf","decoded_pdf_validated_transient_only",clock(),redirects),
   bytes,finalUrl:requested};
 }
}
export async function captureDhsOriginal({outputDir,fetchImpl=fetch,clock=()=>new Date().toISOString()}){
 if(typeof outputDir!=="string"||!path.isAbsolute(outputDir))fail("absolute output directory required");
 const rec=baseReceipt(clock());
 await fs.mkdir(outputDir,{recursive:true});
 for(const url of DHS_REPORT_URLS){
  let found;
  try{found=await once(url,fetchImpl,clock);}
  catch(e){
   const reason=e instanceof Error?e.message:String(e);
   rec.attempts.push(attempt(url,"network_or_validation_failure",
    reason.slice(0,320),clock(),0));
   continue;
  }
  rec.attempts.push(found.log);
  if(!found.bytes)continue;
  const digest=hash(found.bytes);
  const relative="originals/sha256/"+digest+".pdf";
  const location=path.join(outputDir,relative);
  await fs.mkdir(path.dirname(location),{recursive:true});
  await fs.writeFile(location,found.bytes,{flag:"wx"});
  rec.status="captured_transient_requires_independent_durable_promotion";
  rec.acquired_url=found.finalUrl;
  rec.original_sha256=digest;
  rec.original_byte_count=found.bytes.length;
  rec.artifact_relative_path=relative;
  rec.storage_tier="temporary_runner_artifact_only";
  break;
 }
 await fs.writeFile(path.join(outputDir,"capture-receipt.json"),JSON.stringify(rec,null,2)+"\n",{flag:"wx"});
 return rec;
}
export async function verifyDhsReceipt({outputDir,receipt}){
 if(!closed(receipt,RECEIPT_FIELDS)||receipt.id!=="INC15C2-DHS-FY2024-OFFICIAL-PDF-PROBE"||
    receipt.source_id!==SOURCE_ID||
    JSON.stringify(receipt.allowlisted_urls)!==JSON.stringify(DHS_REPORT_URLS)||
    !Array.isArray(receipt.attempts)||receipt.attempts.length<1||
    receipt.attempts.length>DHS_REPORT_URLS.length||
    receipt.current_dhs_first_level_denominator!==null||
    receipt.adl1_certified_count!==0||receipt.independent_legal_review_complete!==false||
    receipt.original_pdf_page_24_inspected!==false||
    receipt.full_chart_population_reconciled!==false||
    receipt.independent_durable_custody_verified!==false||
    receipt.original_census_candidates_unchanged!==true)fail("missing research-only scope");
 for(let i=0;i<receipt.attempts.length;i++){
  const a=receipt.attempts[i];
  if(!closed(a,ATTEMPT_FIELDS)||a.requested_official_url!==DHS_REPORT_URLS[i]||
      !["http_rejected","invalid_response","network_or_validation_failure","received_pdf"].includes(a.result)||
      typeof a.reason!=="string"||!a.reason||
      !Number.isInteger(a.redirect_count)||a.redirect_count<0||a.redirect_count>2)
    fail("invalid official URL, redirect or attempt result");
 }
 if(receipt.status==="blocked_original_publisher_bytes_unavailable"){
  if(defined(receipt.acquired_url)||defined(receipt.original_sha256)||
      defined(receipt.original_byte_count)||defined(receipt.artifact_relative_path)||
      receipt.storage_tier!=="no_original_archived"||
      receipt.attempts.some(a=>a.result==="received_pdf"))fail("false original custody claim");
  return {verified:true,source_original_acquired:false,original_publisher_custody_qualified:false};
 }
 if(receipt.status!=="captured_transient_requires_independent_durable_promotion"||
    receipt.storage_tier!=="temporary_runner_artifact_only"||
    !isAllowedUrl(receipt.acquired_url)||
    !/^[a-f0-9]{64}$/.test(receipt.original_sha256||"")||
    !Number.isInteger(receipt.original_byte_count)||receipt.original_byte_count<1024||
    receipt.original_byte_count>MAX_BYTES||
    receipt.artifact_relative_path!=="originals/sha256/"+receipt.original_sha256+".pdf"||
    receipt.attempts.at(-1)?.result!=="received_pdf")
  fail("invalid transient capture receipt");
 const bytes=await fs.readFile(path.join(outputDir,receipt.artifact_relative_path));
 if(!isPdf(bytes)||bytes.length!==receipt.original_byte_count||
    hash(bytes)!==receipt.original_sha256)fail("original bytes missing, invalid or tampered");
 return {verified:true,source_original_acquired:true,original_publisher_custody_qualified:false,
  sha256:receipt.original_sha256,bytes:bytes.length};
}