#!/usr/bin/env node
// INC-09 public DATA Act File A request. Reproducible FY2025 VA, FA 036-0102 ID 4649.
// USAspending File A is agency-submitted/account reporting, not signed original SF-133/GTAS.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
const allowedHosts=new Set(["api.usaspending.gov","files.usaspending.gov"]);
const output=process.argv[2];if(!output)throw Error("Provide output directory");
await fs.mkdir(output,{recursive:true,mode:0o700});
const payload={account_level:"treasury_account",file_format:"csv",
 filters:{agency:"VA",federal_account:"4649",fy:"2025",period:"12",
  submission_types:["account_balances"]}};
const digest=b=>createHash("sha256").update(b).digest("hex");
function verifyURL(value,hosts=allowedHosts){
 const url=new URL(value);
 if(url.protocol!=="https:"||!hosts.has(url.hostname)||url.username||url.password||
    url.port||url.hash)throw Error("INC09 unapproved issuer or source locator "+value);
 return url;
}
async function read(url,{method="GET",data,limit=900000}={}){
 verifyURL(url);
 const res=await fetch(url,{method,redirect:"manual",signal:AbortSignal.timeout(20000),
   headers:{"accept":"application/json",...(data?{"content-type":"application/json"}:{})},
   body:data?JSON.stringify(data):undefined});
 if(res.status!==200||verifyURL(res.url||url).origin!==verifyURL(url).origin)
  throw Error("INC09 official account endpoint returned "+res.status+" without a valid body");
 const hint=Number(res.headers.get("content-length")||0);
 if(hint>limit)throw Error("INC09 file exceeds configured public aggregate ceiling");
 let size=0;const chunks=[];
 for await(const chunk of res.body){size+=chunk.length;if(size>limit)throw Error("INC09 received oversized response");chunks.push(Buffer.from(chunk));}
 const bytes=Buffer.concat(chunks);
 if(bytes.length===0)throw Error("INC09 empty official source response");
 return {bytes,body:JSON.parse(bytes.toString("utf8")),status:res.status};
}
const rec={format:"ARFI-INC09-UNSIGNED-VA-FY2025-P12-TAS-FILEA-DOWNLOAD-v1",
 source:"U.S. Treasury USAspending.gov public API",requested_at:new Date().toISOString(),
 account_code:"036-0102",account_internal_id:4649,fiscal_year:2025,fiscal_period:12,
 required_source_type:"TAS_AccountBalances_File_A",query:payload,
 issuer_download_received:false,download_zip_sha256:null,raw_GTAS_ledger_authenticated:false,
 agency_original_SF133_captured:false,VA_signed_allotment_captured:false,
 document_signed_by_US_Treasury:false,original_immutable_provider_approved:false,
 status:"unavailable",records:[]};
try{
 const requestURL="https://api.usaspending.gov/api/v2/download/accounts/";
 const request=await read(requestURL,{method:"POST",data:payload});
 const p=request.body;
 rec.api_post_reply_sha256=digest(request.bytes);
 rec.api_post_reply_size=request.bytes.length;
 rec.status_url=p.status_url||null;rec.file_url=p.file_url||null;
 rec.public_zip_name=p.file_name||null;
 console.log("INC09_REQUEST_METADATA "+JSON.stringify({status_url:p.status_url,file_url:p.file_url,file_name:p.file_name,keys:Object.keys(p),request:p.download_request}).slice(0,2200));
 if(!p.status_url||!p.file_name)throw Error("INC09 job URL or name absent");
 const statusURL=verifyURL(new URL(p.status_url,requestURL).href,new Set(["api.usaspending.gov"])).href;
 if(!statusURL.startsWith("https://api.usaspending.gov/api/v2/download/status"))
  throw Error("INC09 unexpected job-status path");
 for(let i=0;i<23;i++){
  const result=await read(statusURL);
  const s=result.body;
  const state=String(s.status??s.state??s.message??"unknown");
  rec.latest_status=state;
  if(i===0||i%4===0||/finish|complet|ready|error|fail/i.test(state))
    console.log("INC09_STATUS "+JSON.stringify({poll:i,state,keys:Object.keys(s).slice(0,20),file_url:s.file_url||null}).slice(0,1400));
  if(/error|fail/i.test(state))throw Error("INC09 government data download failed: "+state);
  if(/finish|complet|ready/i.test(state)){
   const fileURL=s.file_url||p.file_url;
   const u=verifyURL(new URL(fileURL,requestURL).href);
   if(!/^\/(?:generated_downloads|csv_downloads)\//.test(u.pathname))
    throw Error("INC09 unexpected ZIP path "+u.pathname);
   // File stream may be large despite narrow account filter; bound decompression downstream.
   const response=await fetch(u,{redirect:"manual",signal:AbortSignal.timeout(30000),
    headers:{accept:"application/zip"}});
   if(response.status!==200||verifyURL(response.url||u.href).origin!==u.origin)
    throw Error("INC09 ZIP publisher response "+response.status);
   let count=0;const parts=[];
   for await(const chunk of response.body){
    count+=chunk.length;if(count>18000000)throw Error("INC09 public ZIP exceeds 18MB");
    parts.push(Buffer.from(chunk));
   }
   const bytes=Buffer.concat(parts);
   if(bytes.length<22||bytes.readUInt32LE(0)!==0x04034b50)throw Error("INC09 download not ZIP archive");
   rec.issuer_download_received=true;rec.status="public_file_a_zip_received_no_independent_GTAS_source_signature";
   rec.download_zip_sha256=digest(bytes);rec.zip_bytes=bytes.length;
   rec.original_zip_path="usaspending-va-2025p12-036-0102-"+rec.download_zip_sha256+".zip";
   await fs.writeFile(path.join(output,rec.original_zip_path),bytes,{flag:"wx",mode:0o600});
   console.log("INC09_ORIGINAL_ZIP "+JSON.stringify({sha256:rec.download_zip_sha256,bytes:rec.zip_bytes,file:rec.original_zip_path,status:rec.status}));
   break;
  }
  if(i<22)await new Promise(resolve=>setTimeout(resolve,5000));
 }
 if(!rec.issuer_download_received)rec.status="government_file_a_download_not_ready_within_115_seconds";
}catch(e){
 rec.error=String(e.message||e).slice(0,600);console.log("INC09_UNQUALIFIED_SOURCE "+rec.error);
}
await fs.writeFile(path.join(output,"file-a-receipt.json"),JSON.stringify(rec,null,2)+"\n",{flag:"wx",mode:0o600});
console.log("INC09_FINAL "+JSON.stringify({status:rec.status,zip_received:rec.issuer_download_received,sha256:rec.download_zip_sha256,error:rec.error||null}));
