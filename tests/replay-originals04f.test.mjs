import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {captureOfficialSources} from "../scripts/federal-source-archive-core.mjs";
import {createUnsigned04FIndex,replay04FOriginals,verify04FBundle}
 from "../scripts/replay-originals-04f-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const load=async p=>JSON.parse(await fs.readFile(path.join(root,p),"utf8"));
const sources=(await load("model/federal/archive04b/sources.json")).items;
const targets=(await load("model/federal/inc04d/source-targets.json")).items;
const queueOriginal=(await load("model/federal/inc04f/custody-source-queue.json")).items;
const sha=b=>createHash("sha256").update(b).digest("hex");
const fixture=async fn=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"arfi-04f-replay-"));
 try{
  const a=path.join(dir,"04b"),d=path.join(dir,"04d"),out=path.join(dir,"bundle");
  const page=async url=>{
   const x=sources.find(s=>s.url===url);
   if(!x)throw Error("unapproved fixture URL "+url);
   if(x.id==="ARCH04B-HHS-HTML")
    return new Response("publisher 403",{status:403,headers:{"content-type":"text/html"}});
   const body="<doc><title>"+x.expected_marker+"</title><body>"+
    "ARFI full encoded entity bytes are always verified against digests and immutable source paths. ".repeat(4)+"</body></doc>";
   return new Response(body,{status:200,headers:{"content-type":x.media_type}});
  };
  const manifestB=await captureOfficialSources({
   sources,outputDir:a,fetchImpl:page,allowPartial:true,capturedAt:()=>"2026-10-17T01:17:20.000Z"});
  await fs.mkdir(path.join(d,"bytes"),{recursive:true});
  const captures=[];
  for(const id of ["D04D-SRC-FOM1","D04D-SRC-FOM2","D04D-SRC-USC38","D04D-SRC-USC41"]){
   const x=targets.find(y=>y.id===id),pdf=id.includes("FOM");
   const bytes=Buffer.from(pdf?"%PDF-1.5\n"+id+"\n"+"X".repeat(180)+"\n%%EOF":
    "<!doctype html><title>"+id+"</title>"+"statutory original response ".repeat(10));
   const rel="bytes/"+id+(pdf?".pdf":".html");
   await fs.writeFile(path.join(d,rel),bytes);
   captures.push({id,url:x.url,edition:x.edition,sha256:sha(bytes),byte_count:bytes.length,
    relative_path:rel,captured_at:"2026-10-17T14:50:11.000Z"});
  }
  const manifestD={version:"ARFI-04D-ORIGINAL-RECEIPTS-v1",captures,
   unavailable:[{id:"D04D-SRC-CBCA",url:targets.find(x=>x.id==="D04D-SRC-CBCA").url,
    status:"not_captured",reason:"HTTP publisher unavailable"}],complete:false};
  await fs.writeFile(path.join(d,"manifest.json"),JSON.stringify(manifestD)+"\n");
  const queue=structuredClone(queueOriginal);
  for(const row of queue){
   const found=row.collection==="04B"?manifestB.captures.find(x=>x.source_id===row.source_id):
    captures.find(x=>x.id===row.source_id);
   assert(found,"missing expected synthetic original");
   row.SHA256=found.sha256;row.byte_count=found.byte_count;
   row.object_key="sha256/"+found.sha256.slice(0,2)+"/"+found.sha256;
   if(row.collection==="04B")row.captured_at=found.captured_at;
  }
  return await fn({a,d,out,queue,manifestB,manifestD});
 }finally{await fs.rm(dir,{recursive:true,force:true});}
};
test("replays all seven official 04B and four official 04D byte streams into content-addressed original staging",async()=>{
 await fixture(async x=>{
  const result=await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  assert.equal(result.source_originals_verified,11);
  assert.equal(result.storage_recovery_qualified,false);
  const again=await verify04FBundle({directory:x.out,queue:x.queue});
  assert.equal(result.candidate_manifest_sha256,again.candidate_manifest_sha256);
  const proposal=JSON.parse(await fs.readFile(path.join(x.out,"release-candidate.json")));
  assert.equal(proposal.original_count,11);
  assert.equal(proposal.immutable_storage_claim,false);
  assert.equal(proposal.independently_signed,false);
  assert.match(proposal.exact_original_capture_manifest_04b_sha256,/^[a-f0-9]{64}$/);
  assert.match(proposal.exact_original_capture_manifest_04d_sha256,/^[a-f0-9]{64}$/);
  assert.equal(proposal.protected_storage_object_versions,0);
  assert.equal(proposal.VA_ADL1_certified,false);
 });
});
test("replay byte manifest is reproducible when staging same immutable capture artifact twice",async()=>{
 await fixture(async x=>{
  const out2=x.out+"-repeat";
  const one=await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  const two=await replay04FOriginals({input04B:x.a,input04D:x.d,output:out2,queue:x.queue});
  assert.equal(one.candidate_manifest_sha256,two.candidate_manifest_sha256);
 });
});
test("tampering a staged source object fails independent post-stage recovery verification",async()=>{
 await fixture(async x=>{
  await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  const proposal=JSON.parse(await fs.readFile(path.join(x.out,"release-candidate.json")));
  await fs.appendFile(path.join(x.out,proposal.source_objects[0].bundle_object_path),"ATTACK");
  await assert.rejects(()=>verify04FBundle({directory:x.out,queue:x.queue}),/corrupted bundled original/);
 });
});
test("modified unsigned index is rejected instead of becoming an institutional signature",async()=>{
 await fixture(async x=>{
  await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  const index=path.join(x.out,"release-candidate.json");
  const candidate=JSON.parse(await fs.readFile(index));
  candidate.immutable_storage_claim=true;
  await fs.writeFile(index,JSON.stringify(candidate)+"\n");
  await assert.rejects(()=>verify04FBundle({directory:x.out,queue:x.queue}),/canonical UTF-8 JSON|independently pinned source receipts/);
 });
});
test("captured source metadata manifests cannot be silently modified after bundling",async()=>{
 await fixture(async x=>{
  await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  await fs.appendFile(path.join(x.out,"capture-manifests","04b.json")," ");
  await assert.rejects(()=>verify04FBundle({directory:x.out,queue:x.queue}),/must exactly match/);
 });
});
test("a new unknown archive file is rejected as possible unauthorized replacement or credential leak",async()=>{
 await fixture(async x=>{
  await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  await fs.writeFile(path.join(x.out,"surprise.txt"),"secret");
  await assert.rejects(()=>verify04FBundle({directory:x.out,queue:x.queue}),/unknown source bytes/);
 });
});
test("tampered publisher original fails before any staged release can be produced",async()=>{
 await fixture(async x=>{
  await fs.appendFile(path.join(x.a,"bytes","ARCH04B-DOJ-HTML.html"),"X");
  await assert.rejects(()=>replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue}),/SHA-256 mismatch/);
  await assert.rejects(()=>fs.stat(x.out),/ENOENT/);
 });
});
test("tampered 04D fixed edition original fails source pin before release",async()=>{
 await fixture(async x=>{
  await fs.appendFile(path.join(x.d,"bytes","D04D-SRC-USC38.html"),"X");
  await assert.rejects(()=>replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue}),/original artifact does not match pinned source hash/);
  await assert.rejects(()=>fs.stat(x.out),/ENOENT/);
 });
});
test("HHS cannot masquerade as an approved seven-source receipt through changed missing-source reason",async()=>{
 await fixture(async x=>{
  const loc=path.join(x.a,"archive-manifest.json");
  const m=JSON.parse(await fs.readFile(loc));
  m.uncaptured_sources[0].reason="retention complete";
  await fs.writeFile(loc,JSON.stringify(m)+"\n");
  await assert.rejects(()=>replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue}),/explicit HHS 403/);
 });
});
test("unsupported fifth 04D capture or omission of CBCA provenance is rejected",async()=>{
 await fixture(async x=>{
  const loc=path.join(x.d,"manifest.json");
  const m=JSON.parse(await fs.readFile(loc));
  m.unavailable=[];
  await fs.writeFile(loc,JSON.stringify(m)+"\n");
  await assert.rejects(()=>replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue}),/source exception must remain CBCA/);
 });
});
test("receipt path substitution or traversal is denied before archiving",async()=>{
 await fixture(async x=>{
  const bad=structuredClone(x.queue);
  bad[0].artifact_relative_path="../private-file";
  assert.throws(()=>createUnsigned04FIndex(bad),/unexpected source capture path/);
 });
});
test("staged symlink cannot alias a source outside the content-addressed bundle",async()=>{
 await fixture(async x=>{
  await replay04FOriginals({input04B:x.a,input04D:x.d,output:x.out,queue:x.queue});
  const index=JSON.parse(await fs.readFile(path.join(x.out,"release-candidate.json")));
  const f=path.join(x.out,index.source_objects[0].bundle_object_path);
  await fs.rm(f);
  await fs.symlink(path.join(x.a,"archive-manifest.json"),f);
  await assert.rejects(()=>verify04FBundle({directory:x.out,queue:x.queue}),/bundle source not regular/);
 });
});
