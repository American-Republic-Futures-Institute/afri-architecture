#!/usr/bin/env node
// Independent exact-body source export for reviewed Git upload. No inferred signed approval.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
const expected=[["TREASURY-CS-FY25-VA-CH42","eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089",662885],["OMB-FY27-VA-APPENDIX-2025ACTUAL","6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da",514363]];
const dir=process.argv[2];if(!dir)throw Error("INC10 evidence dir required");
const receipts=JSON.parse(await fs.readFile(path.join(dir,"receipts.json"),"utf8"));
if(receipts.format!=="ARFI-INC10-PRIMARY-PDF-ORIGINAL-UNSIGNED-v1"||
  receipts.human_document_edition_review!==false||
  receipts.institutionally_approved_dual_WORM_storage!==false)throw Error("Unsupported custody envelope");
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
for(const [id,digest,length] of expected){
 const x=receipts.source_records.find(s=>s.id===id);
 if(!x||x.original_pdf_sha256!==digest||x.original_pdf_bytes!==length||
  x.stored_original_body_path!=="originals/sha256/"+digest+".pdf"||
  x.independent_signature_verified!==false||x.institutional_immutable_custody_verified!==false)
  throw Error("Incorrect original issuer receipt "+id);
 const buf=await fs.readFile(path.join(dir,x.stored_original_body_path));
 if(buf.length!==length||sha(buf)!==digest||!buf.subarray(0,5).equals(Buffer.from("%PDF-")))
   throw Error("Incorrect issuer response body "+id);
 const base64=buf.toString("base64"),chunk=3000,count=Math.ceil(base64.length/chunk);
 console.log("INC10_BLOB_BEGIN|"+id+"|"+digest+"|"+length+"|"+count);
 for(let i=0;i<count;i++)console.log("INC10_BLOB_CHUNK|"+id+"|"+i+"|"+base64.slice(i*chunk,(i+1)*chunk));
 console.log("INC10_BLOB_END|"+id+"|"+count);
}