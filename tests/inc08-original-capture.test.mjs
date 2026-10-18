import test from "node:test";import assert from "node:assert/strict";
import fs from "node:fs/promises";import os from "node:os";import path from "node:path";
import {captureX08,verifyX08Bundle,officialOmbLink,byteFetch,sha256} from "../scripts/inc08-original-capture-core.mjs";
const d={id:"11403044",date:"2024-12-20",iteration:3};
const u="https://apportionment-public.max.gov/Fiscal%20Year%202025/Department%20of%20Veterans%20Affairs/JSON/FY2025_Agency%3DVA_Bureau%3DBP_TAFS%3D036-X-0102_Iteration%3D3_2024-12-20-16.01.json";
const html='<!doctype html><html><body>FY2025 VA 036-0102 <a href="'+u+'">Original official JSON</a></body></html>';
test("valid OMB index yields only dated original government URL",()=>assert.equal(officialOmbLink(html,d),u));
test("host spoofing fails despite visually similar URL",()=>assert.throws(()=>officialOmbLink(html.replace("apportionment-public.max.gov","apportionment-public.max.gov.evil.test"),d),/zero or multiple/));
test("cannot accept wrong indexed iteration or approval date",()=>assert.throws(()=>officialOmbLink(html,{...d,date:"2025-04-14"}),/zero or multiple/));
test("cannot treat 2 conflicting issuer URLs as one original",()=>assert.throws(()=>officialOmbLink(html+html,d),/zero or multiple/));
test("relative path or javascript locator rejected",()=>assert.throws(()=>officialOmbLink(html.replace(u,"javascript:alert(1)"),d),/zero or multiple/));
const body=(s,headers={})=>new Response(s,{status:200,headers:{"content-type":"application/json",...headers}});
test("JSON must be parseable and not a login HTML",async()=>assert.rejects(()=>byteFetch(u,{fetcher:async()=>body("<html>log in</html>"),kind:"json",maxBytes:100000}),/not JSON/));
test("HTTP redirect is not original publisher source",async()=>assert.rejects(()=>byteFetch(u,{fetcher:async()=>new Response("",{status:302,headers:{location:"https://login.max.gov/"}}),kind:"json",maxBytes:100000}),/HTTP failure/));
test("issuer byte-size cap refuses oversized file",async()=>assert.rejects(()=>byteFetch(u,{fetcher:async()=>body("A".repeat(150)),kind:"json",maxBytes:70}),/byte limit/));
test("capture writes real unsigned byte receipts, unavailable origins remain zero digest",async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"inc08-test-"));
 const mocked=async url=>{
  if(url.includes("openomb.org/file/11403044"))return new Response(html,{status:200,headers:{"content-type":"text/html"}});
  if(url.includes("openomb.org"))throw Error("index unavailable");
  if(url.includes("apportionment-public.max.gov"))return body(JSON.stringify({issuer:"OMB",taf:"036-X-0102",fiscal_year:2025}));
  if(url.includes("fiscal.treasury.gov"))return new Response("%PDF-1.6 original chapter42 test bytes",{status:200,headers:{"content-type":"application/pdf"}});
  if(url.includes("chapter-03-va"))return new Response("<!doctype html><html>VA Funds Control source stub</html>",{status:200,headers:{"content-type":"text/html"}});
  throw Error("official host unreachable");
 };
 try{
  const receipt=await captureX08(dir,{fetcher:mocked,now:()=>"2026-10-18T15:00:00.000Z"});
  assert.equal(receipt.issuer_original_count,3);
  assert.equal(receipt.unavailable_count,4);
  assert.equal(receipt.captured_sources.find(x=>x.source_id==="SRC-X08-OMB-11403044").issuer_url,u);
  assert(receipt.unavailable_sources.every(x=>x.original_sha256===null));
  assert.equal((await verifyX08Bundle(dir)).verified_decoded_source_bodies,3);
  const x=receipt.captured_sources[0];const object=path.join(dir,x.artifact_object_path);
  await fs.appendFile(object,"altered");
  await assert.rejects(()=>verifyX08Bundle(dir),/corrupted/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test("SHA-256 is of raw decoded body bytes and is deterministic",()=>assert.equal(sha256(Buffer.from("abc")),"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
