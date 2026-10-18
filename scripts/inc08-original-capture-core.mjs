// INC-08 — bounded retrieval and temporary byte custody of VA FY2025 public records.
// Read-only HTTP. Does not certify source signatures, VA allotments, or legal powers.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
export const APPROVALS=Object.freeze([
 {id:"11366310",date:"2024-08-19",iteration:1},
 {id:"11397317",date:"2024-11-22",iteration:2},
 {id:"11403044",date:"2024-12-20",iteration:3},
 {id:"11424792",date:"2025-04-14",iteration:4}
]);
export const ORIGINALS=Object.freeze([
 {id:"SRC-X08-TREASURY-CS2025-CH42",kind:"pdf",url:"https://fiscal.treasury.gov/files/reports-statements/combined-statement/cs2025/c42.pdf",maxBytes:12582912},
 {id:"SRC-X08-VA-FUNDS-2024",kind:"html",url:"https://department.va.gov/financial-policy-documents/financial-document/chapter-03-va-funds-control/",maxBytes:4194304},
 {id:"SRC-X08-VA-SYMBOLS-2024",kind:"html",url:"https://department.va.gov/financial-policy-documents/financial-document/chapter-02-vas-budget-cycle-and-fund-symbols/",maxBytes:4194304}
]);
export const sha256=bytes=>createHash("sha256").update(bytes).digest("hex");
const reject=m=>{throw Error("INC08 source capture rejected: "+m);};
const valid=({url,host,pattern})=>{
 const u=new URL(url);
 if(u.protocol!=="https:"||u.hostname!==host||u.username||u.password||u.search||u.hash||
    !pattern.test(decodeURIComponent(u.pathname)))reject("unapproved publisher URL / path: "+url);
 return u;
};
export function officialOmbLink(indexHtml,expected){
 if(typeof indexHtml!=="string"||indexHtml.length>2500000||!indexHtml.includes("036-0102")||
    !indexHtml.includes("2025"))reject("secondary locator missing expected account and fiscal year");
 const links=[...indexHtml.matchAll(/href\s*=\s*["']([^"']+)["']/g)].map(v=>v[1].replace(/&amp;/g,"&"));
 const approved=links.flatMap(link=>{
  try{
   const u=valid({url:link,host:"apportionment-public.max.gov",pattern:/^\/Fiscal Year 2025\/Department of Veterans Affairs\/JSON\/FY2025_Agency=VA_Bureau=BP_TAFS=036-X-0102_Iteration=[1-4]_\d{4}-\d{2}-\d{2}-[\d.]+\.json$/});
   const m=decodeURIComponent(u.pathname).match(/_Iteration=(\d)_([0-9]{4}-[0-9]{2}-[0-9]{2})-/);
   return Number(m?.[1])===expected.iteration&&m?.[2]===expected.date?[u.href]:[];
  }catch{return [];}
 });
 if(approved.length!==1)reject("zero or multiple issuer URL matches for indexed version "+expected.id);
 return approved[0];
}
export async function byteFetch(url,{fetcher=fetch,kind,maxBytes,redirectDepth=0}){
 const response=await fetcher(url,{redirect:"manual",signal:AbortSignal.timeout(16000),
  headers:{accept:kind==="json"?"application/json":kind==="pdf"?"application/pdf":"text/html"}});
 if(response&&[301,302,307,308].includes(response.status)&&kind==="pdf"&&redirectDepth===0){
  // Treasury's official host may permanently/canonically redirect to www.
  // Do not follow an arbitrary redirect, path change, query or login portal.
  const next=new URL(response.headers?.get?.("location")||"",url),from=new URL(url);
  const allowed=from.hostname==="fiscal.treasury.gov"&&
   ["fiscal.treasury.gov","www.fiscal.treasury.gov"].includes(next.hostname)&&
   next.protocol==="https:"&&next.pathname===from.pathname&&
   !next.search&&!next.hash&&!next.username&&!next.password;
  if(!allowed)reject("redirect escaped the exact Treasury government issuer path: "+next.hostname+next.pathname);
  return byteFetch(next.href,{fetcher,kind,maxBytes,redirectDepth:1});
 }
 if(!response||response.status!==200||new URL(response.url||url).origin!==new URL(url).origin)
  reject("original publisher HTTP failure / redirect "+(response?.status??"unknown"));
 const len=Number(response.headers?.get?.("content-length")||0);
 if(len>maxBytes)reject("publisher claims oversized source");
 const reader=response.body?.getReader?.();
 if(!reader)reject("no readable issuer response body");
 let size=0;const chunks=[];
 while(true){
  const {done,value}=await reader.read();if(done)break;
  size+=value.length;if(size>maxBytes){await reader.cancel();reject("issuer response byte limit");}
  chunks.push(Buffer.from(value));
 }
 const bytes=Buffer.concat(chunks);
 if(bytes.length<30)reject("empty original publisher file");
 if(kind==="pdf"&&!bytes.subarray(0,5).equals(Buffer.from("%PDF-")))reject("original PDF mime spoof / HTML login");
 if(kind==="json"){let v;try{v=JSON.parse(bytes.toString("utf8"))}catch{reject("original issuer content is not JSON");}
  if(typeof v!=="object"||v===null)reject("original JSON is not an object");}
 if(kind==="html"&&!/<(?:html|!doctype html)/i.test(bytes.toString("utf8").slice(0,2500)))
  reject("official policy endpoint returned non-HTML");
 return {bytes,status:response.status,contentType:response.headers?.get?.("content-type")||null,
  lastModified:response.headers?.get?.("last-modified")||null};
}
export const artifactPath=hash=>"objects/sha256/"+hash.slice(0,2)+"/"+hash;
export async function captureX08(output,{fetcher=fetch,now=()=>new Date().toISOString()}={}){
 await fs.mkdir(output,{recursive:true,mode:0o700});
 const startedAt=now(),records=[],errors=[];
 const take=async({id,url,kind,maxBytes,discoveredFrom=null,approvedOn=null,indexFileId=null})=>{
  const expectedHost=kind==="json"?"apportionment-public.max.gov":
   id==="SRC-X08-TREASURY-CS2025-CH42"?"fiscal.treasury.gov":"department.va.gov";
  try{
   valid({url,host:expectedHost,pattern:kind==="json"?/^\/Fiscal Year 2025\/Department of Veterans Affairs\/JSON\/FY2025_Agency=VA_Bureau=BP_TAFS=036-X-0102_Iteration=[1-4]_\d{4}-\d{2}-\d{2}-[\d.]+\.json$/:
     kind==="pdf"?/^\/files\/reports-statements\/combined-statement\/cs2025\/c42\.pdf$/:
     /^\/financial-policy-documents\/financial-document\/chapter-(?:03-va-funds-control|02-vas-budget-cycle-and-fund-symbols)\/$/});
   const {bytes,status,contentType,lastModified}=await byteFetch(url,{fetcher,kind,maxBytes});
   const digest=sha256(bytes),relative=artifactPath(digest),destination=path.join(output,relative);
   await fs.mkdir(path.dirname(destination),{recursive:true});
   await fs.writeFile(destination,bytes,{flag:"wx",mode:0o600});
   records.push({source_id:id,issuer_url:url,publisher_hostname:expectedHost,discovered_from:discoveredFrom,
    reported_approval_date:approvedOn,secondary_index_file_id:indexFileId,status:"official_http_bytes_captured_to_unsigned_temporary_artifact",
    original_sha256:digest,original_byte_length:bytes.length,artifact_object_path:relative,
    content_type:contentType,last_modified_response_header:lastModified,http_status:status,
    independently_verified_OMB_signature:false,VA_allotment_instrument_verified:false,
    institutionally_governed_immutable_archive:false,original_fiscal_account_SF133_authenticated:false,
    recorded_at:startedAt});
  }catch(e){
   errors.push({source_id:id,issuer_url:url||null,reported_approval_date:approvedOn,index_file_id:indexFileId,
    status:"source_unavailable_or_unqualified",reason:String(e.message||e).slice(0,380),
    original_sha256:null,original_byte_length:null,artifact_object_path:null});
  }
 };
 for(const target of ORIGINALS)await take(target);
 for(const target of APPROVALS){
  const indexUrl="https://openomb.org/file/"+target.id;
  try{
   valid({url:indexUrl,host:"openomb.org",pattern:/^\/file\/\d{8}$/});
   const {bytes}=await byteFetch(indexUrl,{fetcher,kind:"html",maxBytes:2200000});
   const original=officialOmbLink(bytes.toString("utf8"),target);
   await take({id:"SRC-X08-OMB-"+target.id,url:original,kind:"json",maxBytes:8388608,
    discoveredFrom:indexUrl,approvedOn:target.date,indexFileId:target.id});
  }catch(e){
   errors.push({source_id:"SRC-X08-OMB-"+target.id,issuer_url:null,
    reported_approval_date:target.date,index_file_id:target.id,
    status:"official_original_not_retrievable_from_secondary_locator",
    reason:String(e.message||e).slice(0,380),original_sha256:null,
    original_byte_length:null,artifact_object_path:null});
  }
 }
 const outputDocument={
  format:"ARFI-INC08-UNSIGNED-SOURCE-BYTE-CAPTURE-v1",
  fiscal_year:2025,account:"036-0102",captured_at:startedAt,
  method:"untrusted_public_HTTP_read_only_no_repository_or_storage_write",
  issuer_original_count:records.length,unavailable_count:errors.length,
  approved_governance:false,independent_issuer_signature_qualified:false,
  production_immutable_storage:false,source_transaction_authority_proven:false,
  retention:"ephemeral_GitHub_Actions_artifact_90_days",
  captured_sources:records.sort((a,b)=>a.source_id.localeCompare(b.source_id)),
  unavailable_sources:errors.sort((a,b)=>a.source_id.localeCompare(b.source_id))
 };
 await fs.writeFile(path.join(output,"capture-receipts.json"),JSON.stringify(outputDocument,null,2)+"\n",{flag:"wx",mode:0o600});
 await verifyX08Bundle(output);
 return outputDocument;
}
export async function verifyX08Bundle(dir){
 const raw=await fs.readFile(path.join(dir,"capture-receipts.json"),"utf8");
 const receipt=JSON.parse(raw);
 if(receipt.format!=="ARFI-INC08-UNSIGNED-SOURCE-BYTE-CAPTURE-v1"||
    receipt.approved_governance!==false||receipt.production_immutable_storage!==false||
    receipt.independent_issuer_signature_qualified!==false||
    receipt.issuer_original_count+receipt.unavailable_count!==7)reject("invalid unsigned custody envelope");
 const seen=new Set();
 for(const x of receipt.captured_sources){
  if(seen.has(x.source_id)||!/^[a-f0-9]{64}$/.test(x.original_sha256)||
     x.artifact_object_path!==artifactPath(x.original_sha256)||
     x.institutionally_governed_immutable_archive!==false||
     x.independently_verified_OMB_signature!==false)reject("source SHA/qualification identity mismatch");
  seen.add(x.source_id);
  const fn=path.resolve(dir,x.artifact_object_path),root=path.resolve(dir);
  if(!fn.startsWith(root+path.sep))reject("archive path escape");
  const stat=await fs.lstat(fn);if(!stat.isFile()||stat.isSymbolicLink())reject("nonregular byte file");
  const buf=await fs.readFile(fn);
  if(buf.length!==x.original_byte_length||sha256(buf)!==x.original_sha256)
   reject("source body corrupted or missing "+x.source_id);
 }
 for(const x of receipt.unavailable_sources){
  if(seen.has(x.source_id)||x.original_sha256!==null||x.artifact_object_path!==null)
   reject("missing original improperly represented as captured "+x.source_id);
  seen.add(x.source_id);
 }
 if(seen.size!==7)reject("replay must account for exactly seven requested original sources");
 return {verified_decoded_source_bodies:receipt.issuer_original_count,
   source_unavailable:receipt.unavailable_count,independent_original_custody_approved:false};
}
