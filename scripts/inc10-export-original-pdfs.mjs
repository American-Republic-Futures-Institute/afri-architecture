#!/usr/bin/env node
// Code-reviewed government source original transfer. Never log unapproved/missing PDF bytes.
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
const root=process.argv[2];if(!root)throw Error("Need captured originals path");
const d=JSON.parse(fs.readFileSync(path.join(root,"receipts.json"),"utf8"));
const expected=new Map([
 ["TREASURY-CS-FY25-VA-CH42",["eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089",662885]],
 ["OMB-FY27-VA-APPENDIX-2025ACTUAL",["6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da",514363]]
]);
if(d.format!=="ARFI-INC10-PRIMARY-PDF-ORIGINAL-UNSIGNED-v1"||
 d.source_records.length!==2||d.legal_or_accounting_qualification!==false||
 d.institutionally_approved_dual_WORM_storage!==false)throw Error("incorrect unsigned source receipt");
const hash=x=>createHash("sha256").update(x).digest("hex");
for(const [id,[digest,size]] of expected){
 const rec=d.source_records.find(x=>x.id===id);
 if(!rec||rec.original_pdf_sha256!==digest||rec.original_pdf_bytes!==size||
 rec.stored_original_body_path!=="originals/sha256/"+digest+".pdf"||
 rec.temporary_artifact_signed!==false||rec.institutional_immutable_custody_verified!==false||
 rec.independent_signature_verified!==false)throw Error("exact source issuer receipt spoof "+id);
 const body=fs.readFileSync(path.join(root,rec.stored_original_body_path));
 if(body.length!==size||hash(body)!==digest||!body.subarray(0,5).equals(Buffer.from("%PDF-")))
  throw Error("original PDF changed or corrupted "+id);
 const encoded=body.toString("base64"),chunkSize=3000,count=Math.ceil(encoded.length/chunkSize);
 console.log("INC10_ORIGINAL_BEGIN|"+id+"|"+digest+"|"+size+"|"+count);
 for(let i=0;i<count;i++)
  console.log("INC10_ORIGINAL_CHUNK|"+id+"|"+i+"|"+encoded.slice(i*chunkSize,(i+1)*chunkSize));
 console.log("INC10_ORIGINAL_END|"+id+"|"+count);
}
