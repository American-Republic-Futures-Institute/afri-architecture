import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {captureDhsOriginal,verifyDhsReceipt,DHS_REPORT_URLS,isAllowedUrl,isPdf,MAX_BYTES}
 from "../scripts/inc15c2-dhs-acquisition-core.mjs";

const fixedClock=()=>"2026-10-21T01:17:00.000Z";
const makePdf=()=>Buffer.concat([
 Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n","ascii"),
 Buffer.alloc(1400,0x20),Buffer.from("\nxref\n%%EOF\n","ascii")
]);
const mock=(scenarios)=>async (url,opts)=>{
 assert(DHS_REPORT_URLS.includes(url),"network source escaped official allowlist");
 assert.equal(opts.redirect,"manual");
 const scenario=scenarios[DHS_REPORT_URLS.indexOf(url)]||{status:403};
 if(scenario.redirect)return new Response(null,{status:302,headers:{location:scenario.redirect}});
 const status=scenario.status??200;
 if(status!==200)return new Response("unavailable",{status});
 const bytes=scenario.bytes??makePdf();
 return new Response(bytes,{status:200,headers:{"content-type":scenario.mime??"application/pdf",
  "content-length":String(scenario.length??bytes.length)}});
};
async function tempRun(f){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"arfi-inc15c2-"));
 try{return await f(dir);}finally{await fs.rm(dir,{recursive:true,force:true});}
}
const get=async(dir,scenarios)=>captureDhsOriginal({
 outputDir:dir,fetchImpl:mock(scenarios),clock:fixedClock});
const clone=structuredClone;

test("exact two official DHS FY2024 PDF URLs are immutable and limited to DHS.gov",()=>{
 assert.equal(DHS_REPORT_URLS.length,2);
 assert(DHS_REPORT_URLS.every(isAllowedUrl));
 assert(DHS_REPORT_URLS.every(x=>x.endsWith("/2025_0117_dhs_annual_performance_report_fy2024.pdf")));
 for(const bad of [
  "http://www.dhs.gov/sites/default/files/example.pdf",
  "https://www.dhs.gov.evil.test/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf",
  "https://www.dhs.gov/sites/default/files/2025-02/2025_0117_dhs_annual_performance_report_fy2024.pdf?token=secret",
  "https://example.com/report.pdf"
 ])assert.equal(isAllowedUrl(bad),false);
});
test("both official HTTP 403 responses preserve blocked custody with null checksum",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{status:403},{status:403}]);
  assert.equal(r.status,"blocked_original_publisher_bytes_unavailable");
  assert.deepEqual(r.attempts.map(a=>a.reason),["HTTP_403","HTTP_403"]);
  assert.equal(r.original_sha256,null);
  assert.equal(r.artifact_relative_path,null);
  assert.equal(r.independent_durable_custody_verified,false);
  assert.equal(r.original_pdf_page_24_inspected,false);
  assert.equal(r.current_dhs_first_level_denominator,null);
  assert.equal((await verifyDhsReceipt({outputDir:dir,receipt:r})).source_original_acquired,false);
  assert.equal((await fs.readdir(dir)).length,1);
 });
});
test("approved January location is attempted only after the recorded February source fails",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{status:403},{}]);
  assert.equal(r.status,"captured_transient_requires_independent_durable_promotion");
  assert.equal(r.attempts.length,2);
  assert.equal(r.attempts[0].reason,"HTTP_403");
  assert.equal(r.acquired_url,DHS_REPORT_URLS[1]);
  assert.match(r.original_sha256,/^[a-f0-9]{64}$/);
  assert.equal(r.original_byte_count,makePdf().length);
  const v=await verifyDhsReceipt({outputDir:dir,receipt:r});
  assert.equal(v.verified,true);
  assert.equal(v.source_original_acquired,true);
  assert.equal(v.original_publisher_custody_qualified,false);
  assert.equal(r.full_chart_population_reconciled,false);
 });
});
test("first official URI may capture without rewriting prior DHS source metadata",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{},{}]);
  assert.equal(r.acquired_url,DHS_REPORT_URLS[0]);
  assert.equal(r.attempts.length,1);
  assert.equal((await verifyDhsReceipt({outputDir:dir,receipt:r})).source_original_acquired,true);
 });
});
test("third-party redirect is denied and cannot authenticate source PDF",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{redirect:"https://attacker.example/malware.pdf"},{status:403}]);
  assert.equal(r.status,"blocked_original_publisher_bytes_unavailable");
  assert.match(r.attempts[0].reason,/redirect outside exact DHS government PDF allowlist/);
  assert.equal(r.original_sha256,null);
  await verifyDhsReceipt({outputDir:dir,receipt:r});
 });
});
test("same publisher exact allowlist redirect can retain original government provenance",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{redirect:DHS_REPORT_URLS[1]},{}]);
  assert.equal(r.acquired_url,DHS_REPORT_URLS[1]);
  assert.equal(r.attempts[0].redirect_count,1);
  assert.equal((await verifyDhsReceipt({outputDir:dir,receipt:r})).source_original_acquired,true);
 });
});
test("redirect loop bounded and cannot promote fake official original",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{redirect:DHS_REPORT_URLS[0]},{status:403}]);
  assert.equal(r.status,"blocked_original_publisher_bytes_unavailable");
  assert.match(r.attempts[0].reason,/too many redirects/);
 });
});
for(const [name,one] of [
 ["HTML body with PDF MIME", {bytes:Buffer.from("<html>not a pdf</html>"),mime:"application/pdf"}],
 ["HTML MIME with valid PDF body",{bytes:makePdf(),mime:"text/html"}],
 ["unrecognized binary text",{bytes:Buffer.alloc(1400,0x20),mime:"application/octet-stream"}],
 ["oversized claimed content length",{bytes:makePdf(),length:MAX_BYTES+1}]
]){
 test("reject "+name+" without source custody promotion",async()=>{
  await tempRun(async dir=>{
   const r=await get(dir,[one,{status:403}]);
   assert.equal(r.status,"blocked_original_publisher_bytes_unavailable");
   assert.equal(r.original_sha256,null);
   assert.equal(r.original_byte_count,null);
   assert.equal((await verifyDhsReceipt({outputDir:dir,receipt:r})).source_original_acquired,false);
  });
 });
}
test("a valid PDF header with missing EOF marker is not a captured original",()=>{
 const x=makePdf();
 assert.equal(isPdf(x),true);
 assert.equal(isPdf(x.subarray(0,x.length-6)),false);
 assert.equal(isPdf(Buffer.concat([Buffer.from("%NOTPDF\n"),x])),false);
});
test("captured original PDF modification invalidates exact SHA-256 and byte-count receipt",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{}]);
  const p=path.join(dir,r.artifact_relative_path);
  const b=await fs.readFile(p);
  b[64]^=1;
  await fs.writeFile(p,b);
  await assert.rejects(verifyDhsReceipt({outputDir:dir,receipt:r}),/missing, invalid or tampered/);
 });
});
test("missing PDF bytes reject a forged successful retention receipt",async()=>{
 await tempRun(async dir=>{
  const r=await get(dir,[{}]);
  await fs.rm(path.join(dir,r.artifact_relative_path));
  await assert.rejects(verifyDhsReceipt({outputDir:dir,receipt:r}),/ENOENT/);
 });
});
for(const [name,mutate] of [
 ["blocked source with forged SHA-256",d=>d.original_sha256="a".repeat(64)],
 ["blocked source with forged PDF bytes",d=>d.original_byte_count=1480],
 ["blocked source declared source original captured",d=>d.status="captured_transient_requires_independent_durable_promotion"],
 ["fake chart complete",d=>d.full_chart_population_reconciled=true],
 ["fake chart image review",d=>d.original_pdf_page_24_inspected=true],
 ["invented current denominator",d=>d.current_dhs_first_level_denominator=10],
 ["forged ADL-1 certificate count",d=>d.adl1_certified_count=1],
 ["forged independent legal review",d=>d.independent_legal_review_complete=true],
 ["forged durable original PDF retention",d=>d.independent_durable_custody_verified=true],
 ["extra publisher identity claim",d=>d.signed_publisher_source_authenticity=true],
 ["extra attack field in attempt log",d=>d.attempts[0].endorsed_as_authentic=true],
 ["mutated official source URL",d=>d.allowlisted_urls[0]="https://attacker.example/x.pdf"],
 ["altered source edition",d=>d.source_id="CENSUS-SRC-DHS-CHART-2026"],
 ["rewritten HTTP status",d=>d.attempts[0].result="received_pdf"],
 ["redirect outside known DHS",d=>d.attempts[0].requested_official_url="https://attacker.example/report.pdf"]
]){
 test("research-only receipt rejects "+name,async()=>{
  await tempRun(async dir=>{
   const orig=await get(dir,[{status:403},{status:403}]);
   const d=clone(orig);mutate(d);
   await assert.rejects(verifyDhsReceipt({outputDir:dir,receipt:d}),
     /INC-15C\.2 evidence rejected:/);
  });
 });
}
