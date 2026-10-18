#!/usr/bin/env node
// INC10 constrained original-source PDF acquisition. No presumption of legal-signature custody.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
const SOURCES=[
 {id:"TREASURY-CS-FY25-VA-CH42",url:"https://fiscal.treasury.gov/system/files/files/reports-statements/combined-statement/cs2025/c42.pdf",
  host:"fiscal.treasury.gov",path:"/system/files/files/reports-statements/combined-statement/cs2025/c42.pdf",maxBytes:12000000,
  scope:"official_Treasury_Combined_Statement_FY2025_VA_Chapter42_account_level_net_outlays"},
 {id:"OMB-FY27-VA-APPENDIX-2025ACTUAL",url:"https://www.whitehouse.gov/wp-content/uploads/2026/04/vet_fy2027.pdf",
  host:"www.whitehouse.gov",path:"/wp-content/uploads/2026/04/vet_fy2027.pdf",maxBytes:16000000,
  scope:"OMB_FY2027_appendix_FY2025_historical_actual_account_offsetting_collections"}
];
const output=process.argv[2];if(!output)throw Error("Provide evidence output directory");
await fs.mkdir(output,{recursive:true,mode:0o700});
const sha=x=>createHash("sha256").update(x).digest("hex");
const receipts=[];
for(const target of SOURCES){
 const rec={id:target.id,issuer_url:target.url,issuer_host:target.host,publisher_document_scope:target.scope,
  captured_at:new Date().toISOString(),temporary_artifact_signed:false,
  original_pdf_sha256:null,original_pdf_bytes:null,
  stored_original_body_path:null,independent_signature_verified:false,
  institutional_immutable_custody_verified:false,status:"unretrieved",reason:null};
 try{
  const url=new URL(target.url);
  if(url.protocol!=="https:"||url.hostname!==target.host||url.pathname!==target.path||
    url.search||url.hash||url.username||url.password)throw Error("unapproved issuer URL");
  const response=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(25000),headers:{accept:"application/pdf"}});
  if(response.status!==200||new URL(response.url||url.href).origin!==url.origin)
   throw Error("original publisher returned HTTP "+response.status+" or redirect; never replace PDF with landing page");
  const sizeHint=Number(response.headers.get("content-length")||0);
  if(sizeHint>target.maxBytes)throw Error("source issuer claimed excessive body");
  let size=0;const chunks=[];
  for await(const part of response.body){
   size+=part.length;if(size>target.maxBytes)throw Error("original exceeds maximum source size");
   chunks.push(Buffer.from(part));
  }
  const body=Buffer.concat(chunks);
  if(body.length<500||!body.subarray(0,5).equals(Buffer.from("%PDF-"))||
    !body.subarray(Math.max(0,body.length-2048)).toString("latin1").includes("%%EOF"))
   throw Error("official link did not return a complete original PDF body");
  const digest=sha(body),rel="originals/sha256/"+digest+".pdf";
  await fs.mkdir(path.join(output,"originals/sha256"),{recursive:true});
  await fs.writeFile(path.join(output,rel),body,{flag:"wx",mode:0o600});
  rec.original_pdf_sha256=digest;rec.original_pdf_bytes=body.length;
  rec.stored_original_body_path=rel;rec.status="source_original_PDF_bytes_recorded_in_unsigned_temporary_artifact";
  console.log("INC10_CAPTURE "+JSON.stringify({id:rec.id,digest:rec.original_pdf_sha256,bytes:rec.original_pdf_bytes,
   host:target.host,scope:rec.publisher_document_scope}));
 }catch(e){
  rec.reason=String(e.message||e).slice(0,420);
  rec.status="unavailable_or_redirected_original_not_captured";
  console.log("INC10_UNAVAILABLE "+JSON.stringify({id:rec.id,reason:rec.reason}));
 }
 receipts.push(rec);
}
const envelope={format:"ARFI-INC10-PRIMARY-PDF-ORIGINAL-UNSIGNED-v1",
 fiscal_year:2025,VA_account:"036-0102",publication_status:"research_original_byte_capture",
 human_document_edition_review:false,legal_or_accounting_qualification:false,
 institutionally_approved_dual_WORM_storage:false,source_records:receipts};
await fs.writeFile(path.join(output,"receipts.json"),JSON.stringify(envelope,null,2)+"\n",{flag:"wx",mode:0o600});
let validated=0;
for(const entry of receipts){
 if(entry.original_pdf_sha256!==null){
  const bytes=await fs.readFile(path.join(output,entry.stored_original_body_path));
  if(bytes.length!==entry.original_pdf_bytes||sha(bytes)!==entry.original_pdf_sha256)throw Error("INC10 failed original receipt replay");
  validated++;
 }
}
console.log("INC10_VERIFIED "+JSON.stringify({originals:validated,missing:receipts.length-validated,
 institutional_archive_authorized:false,signed_SF133:false,source_account_netting_certified:false}));
