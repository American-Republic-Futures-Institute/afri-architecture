#!/usr/bin/env node
// Emit only original public OMB JSON as base64 logs for human-reviewed, source-SHA-pinned
// repository import. No secrets, actions credentials, source HTML or personal records.
import fs from "node:fs/promises";
import path from "node:path";
import {sha256,verifyX08Bundle} from "./inc08-original-capture-core.mjs";
const root=process.argv[2];if(!root)throw Error("Usage: node scripts/inc08-export-omb.mjs ARTIFACT_DIR");
const receipt=JSON.parse(await fs.readFile(path.join(root,"capture-receipts.json"),"utf8"));
await verifyX08Bundle(root);
const APPROVED=new Map([
 ["SRC-X08-OMB-11366310",["f9b085040ea44769776b3b1334ee3dfe89ddc32141e6d3a64f23eef9e57898ad",9842]],
 ["SRC-X08-OMB-11397317",["7b0c4ca0df6137b56fe182e70ffb813b205d0cfb3426b897f36e08da64972f6d",10298]],
 ["SRC-X08-OMB-11403044",["fe77acfbe018879b22f4c7147b18ac786602c25c1a5e80ea01c68e5fae166923",10305]],
 ["SRC-X08-OMB-11424792",["2f821463ae0c203d019080b82be7e492637cb14061fd2549b41ed665efa0798f",12348]]
]);
for(const [id,[expected,nbytes]] of APPROVED){
 const entry=receipt.captured_sources.find(x=>x.source_id===id);
 if(!entry||entry.original_sha256!==expected||entry.original_byte_length!==nbytes)
  throw Error("INC08 raw government-original SHA pin not satisfied "+id);
 const data=await fs.readFile(path.join(root,entry.artifact_object_path));
 if(data.length!==nbytes||sha256(data)!==expected)throw Error("INC08 original export hash mismatch "+id);
 const original=JSON.parse(data);
 if(original.FileId!==Number(id.split("-").at(-1))||original.FiscalYear!=="2025"||
   !original.ScheduleData?.every(x=>x.CgacAgency==="036"&&x.CgacAcct==="0102"&&x.AvailabilityTypeCode==="X"))
   throw Error("INC08 original issuer account/fiscal year identity mismatch "+id);
 const b64=data.toString("base64"),chunk=1600,total=Math.ceil(b64.length/chunk);
 console.log("INC08_ORIGINAL_BEGIN|"+id+"|"+expected+"|"+nbytes+"|"+total);
 for(let i=0;i<total;i++)console.log("INC08_ORIGINAL_CHUNK|"+id+"|"+i+"|"+b64.slice(i*chunk,(i+1)*chunk));
 console.log("INC08_ORIGINAL_END|"+id+"|"+total);
}
