#!/usr/bin/env node
// INC-09 preliminary public account-source discovery. USAspending only; no signed-instrument claims.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
const urls=[
 ["federal_account","https://api.usaspending.gov/api/v2/federal_accounts/036-0102/"],
 ["account_fy2025","https://api.usaspending.gov/api/v2/federal_accounts/4649/fiscal_year_snapshot/2025/"],
 ["agency_submission_fy2025p12","https://api.usaspending.gov/api/v2/reporting/agencies/036/2025/12/submission_history/"]
];
const dir=process.argv[2];if(!dir)throw Error("Output directory required");
await fs.mkdir(dir,{recursive:true,mode:0o700});
const sha=x=>createHash("sha256").update(x).digest("hex");
const receipts=[];
for(const [name,url] of urls){
 try{
  const u=new URL(url);
  if(u.protocol!=="https:"||u.hostname!=="api.usaspending.gov"||u.search||u.hash||u.username||u.password)throw Error("host allowlist failed");
  const resp=await fetch(url,{redirect:"manual",headers:{accept:"application/json"},signal:AbortSignal.timeout(16000)});
  if(resp.status!==200||new URL(resp.url||url).origin!==u.origin)throw Error("HTTP "+resp.status+" or redirected source");
  const len=Number(resp.headers.get("content-length")||0);if(len>1000000)throw Error("excessive source body");
  const chunks=[];let size=0;
  for await(const chunk of resp.body){
   size+=chunk.length;if(size>1000000)throw Error("excessive streamed source body");
   chunks.push(Buffer.from(chunk));
  }
  const body=Buffer.concat(chunks),data=JSON.parse(body.toString("utf8"));
  if(!data||typeof data!=="object"||Array.isArray(data))throw Error("non-object original response");
  const digest=sha(body);await fs.writeFile(path.join(dir,name+"-"+digest+".json"),body,{flag:"wx",mode:0o600});
  const entry={id:name,url,http_status:200,sha256:digest,byte_count:size,
   response_content_type:resp.headers.get("content-type"),retrieved_at:new Date().toISOString(),
   is_official_publisher_HTTP_snapshot:true,is_signed_SF133_original:false,is_raw_GTAS_submission:false,
   is_signed_VA_FMA_or_TDA:false,is_verified_WORM_custody:false,
   object_path:name+"-"+digest+".json",top_level_fields:Object.keys(data).slice(0,45)};
  receipts.push(entry);
  const shallow=Object.fromEntries(Object.entries(data).filter(([,v])=>
   v===null||["string","number","boolean"].includes(typeof v)).slice(0,36));
  console.log(JSON.stringify({id:name,status:"source_bytes_received",...entry,scalar_fields:shallow}).slice(0,8000));
 }catch(e){
  const entry={id:name,url,status:"not_acquired_or_not_qualified",reason:String(e.message||e).slice(0,500),
   sha256:null,byte_count:null,object_path:null};
  receipts.push(entry);console.log(JSON.stringify(entry));
 }
}
await fs.writeFile(path.join(dir,"receipts.json"),JSON.stringify({
 format:"ARFI-INC09-UNSIGNED-PUBLIC-ACCOUNT-DISCOVERY-v1",fiscal_year:2025,
 account:"036-0102",source_snapshot_count:receipts.filter(r=>r.sha256).length,
 signed_SF133_acquired:false,raw_GTAS_submission_acquired:false,signed_VA_allotment_acquired:false,
 provider_archival_governance_ratified:false,receipts},null,2)+"\n",{flag:"wx"});
