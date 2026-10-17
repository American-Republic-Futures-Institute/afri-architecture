import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {captureOfficialSources,verifyCaptureArchive,compareCapturedVersions,
 assertTargets,hash,EXPECTED_URLS} from "../scripts/federal-source-archive-core.mjs";
import {fileURLToPath} from "node:url";
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const sources=JSON.parse(await fs.readFile(path.join(project,
 "model/federal/archive04b/sources.json"),"utf8")).items;
const mock=(alter={})=>async (url,options)=>{
 const item=sources.find(x=>x.url===url);
 assert(item,"Unexpected requested network location "+url);
 const settings=alter[item.id]||{};
 if(settings.redirect)return new Response(null,{status:302,headers:{location:settings.redirect}});
 if(settings.status)return new Response("ERROR",{status:settings.status,headers:{"content-type":"text/html"}});
 const mime=settings.mime||item.media_type;
 const raw=settings.noMarker?
  "<html><body>incorrect document without expected marker repeating for validity</body></html>":
  "<document><title>"+item.expected_marker+"</title><organization>Authenticated source transcript fixture with no assertion about legal authority or first-level completeness.</organization></document>";
 return new Response(raw,{status:200,headers:{"content-type":mime}});
};
const withDir=async fn=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"arfi-04b-"));
 try{return await fn(dir);}finally{await fs.rm(dir,{recursive:true,force:true});}
};
test("eight allowlisted sources cannot be retargeted to an attacker host",()=>{
 assert.equal(assertTargets(sources),true);
 const f=structuredClone(sources);
 f[0].url="https://www.justice.gov.attacker.example/agencies/chart";
 assert.throws(()=>assertTargets(f),/unapproved source URL/);
});
test("synthetic sources capture exact decoded response bytes and verify 8 cryptographic receipts",async()=>{
 await withDir(async dir=>{
  const result=await captureOfficialSources({sources,outputDir:dir,fetchImpl:mock(),
   capturedAt:()=>"2026-10-16T22:15:00.000Z"});
  assert.equal(result.captures.length,8);
  const report=await verifyCaptureArchive(dir,result);
  assert.equal(report.verified_sha256,8);
  const x=result.captures[0];
  const raw=await fs.readFile(path.join(dir,x.relative_path));
  assert.equal(hash(raw),x.sha256);
  assert.equal(result.archival_status,"github_actions_artifact_temporary_requires_durable_retention_promotion");
 });
});
test("one-byte alteration fails independent receipt verification",async()=>{
 await withDir(async dir=>{
  const archive=await captureOfficialSources({sources,outputDir:dir,fetchImpl:mock()});
  const f=archive.captures[0];
  await fs.appendFile(path.join(dir,f.relative_path),"MALICIOUS");
  await assert.rejects(()=>verifyCaptureArchive(dir,archive),/SHA-256 mismatch/);
 });
});
test("manifest path-traversal attempts cannot escape the artifact root",async()=>{
 await withDir(async dir=>{
  const archive=await captureOfficialSources({sources,outputDir:dir,fetchImpl:mock()});
  archive.captures[0].relative_path="../private.file";
  await assert.rejects(()=>verifyCaptureArchive(dir,archive),/unverified or tampered source receipt/);
 });
});
test("government source redirects to a different host are rejected",async()=>{
 await withDir(async dir=>{
  const id=sources[0].id;
  await assert.rejects(()=>captureOfficialSources({sources,outputDir:dir,
    fetchImpl:mock({[id]:{redirect:"https://example.com/not-an-official-source"}})}),/redirect escaped pinned/);
 });
});
test("missing source identity marker fails closed rather than archiving a WAF or login page",async()=>{
 await withDir(async dir=>{
  await assert.rejects(()=>captureOfficialSources({sources,outputDir:dir,
   fetchImpl:mock({[sources[0].id]:{noMarker:true}})}),/expected document identity marker absent|implausibly short/);
 });
});
test("unexpected source MIME cannot be stored as original XML",async()=>{
 await withDir(async dir=>{
  const id=sources[4].id;
  await assert.rejects(()=>captureOfficialSources({sources,outputDir:dir,
   fetchImpl:mock({[id]:{mime:"text/html"}})}),/unexpected source MIME/);
 });
});
test("external 404 cannot be interpreted as an officially abolished federal agency",async()=>{
 await withDir(async dir=>{
  const id=sources[0].id;
  await assert.rejects(()=>captureOfficialSources({sources,outputDir:dir,
   fetchImpl:mock({[id]:{status:404}})}),/returned HTTP 404/);
 });
});
test("source hash comparison records drift but NEVER equates missing source bytes with legal repeal",()=>{
 const old={source_id:"ARCH04B-HHS-HTML",sha256:"a".repeat(64),source_edition:"2025"},
  now={source_id:old.source_id,sha256:"b".repeat(64),source_edition:"2026"};
 const drift=compareCapturedVersions(old,now);
 assert.equal(drift.content_changed,true);
 assert.equal(drift.organizational_absence_or_repeal_inferred,false);
 assert.equal(drift.legal_authority_changed_inferred,false);
 assert.equal(compareCapturedVersions(now,now).content_changed,false);
 assert.throws(()=>compareCapturedVersions(old,{...now,source_id:"ARCH04B-VA-HTML"}),/same source ID/);
});
test("approved source network paths are exact and exclude query tokens",()=>{
 assert.equal(Object.keys(EXPECTED_URLS).length,8);
 assert(Object.values(EXPECTED_URLS).every(u=>new URL(u).search===""));
});
