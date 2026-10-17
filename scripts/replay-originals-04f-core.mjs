// ARFI 04F original-byte archival preparation. No keys, providers, legal approval, or permanent retention.
// Stages exactly the 11 explicitly source-pinned original HTTP entity bodies into a temporary content-addressed bundle.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {verifyCaptureArchive} from "./federal-source-archive-core.mjs";
import {canonical} from "./verify-institutional-trust-04e-core.mjs";
const sha=b=>createHash("sha256").update(b).digest("hex");
const err=s=>{throw Error("04F replay rejected: "+s);};
const check=(v,s)=>{if(!v)err(s);};
const pattern=/^[a-f0-9]{64}$/;
const copyKey=h=>"objects/sha256/"+h.slice(0,2)+"/"+h;
const indexKey=h=>"sha256/"+h.slice(0,2)+"/"+h;
const expectedPath=row=>"bytes/"+row.source_id+(row.collection==="04B"?
  (row.source_id.endsWith("-XML")?".xml":".html"):(row.source_id.includes("FOM")?".pdf":".html"));
const keys=new Set(["source_id","sha256","bytes","source_url","source_edition","captured_at","capture_run_id",
 "capture_artifact_id","capture_artifact_name","capture_artifact_expires_at",
 "original_capture_path","object_key","bundle_object_path"]);
export function createUnsigned04FIndex(queue,originalCaptureManifests=null){
 check(Array.isArray(queue)&&queue.length===11&&new Set(queue.map(x=>x.source_id)).size===11,
  "eleven nonduplicate source receipts required");
 const sources=queue.map(r=>{
  check(pattern.test(r.SHA256)&&r.byte_count>100&&r.object_key===indexKey(r.SHA256),
   "untrusted original receipt "+r.source_id);
  check(r.artifact_relative_path===expectedPath(r),"unexpected source capture path "+r.source_id);
  return {
   source_id:r.source_id,sha256:r.SHA256,bytes:r.byte_count,
   source_url:r.source_url,source_edition:r.source_edition,
   captured_at:r.captured_at,capture_run_id:r.original_run_id,
   capture_artifact_id:r.original_artifact_id,capture_artifact_name:r.original_artifact_name,
   capture_artifact_expires_at:r.original_artifact_expires_at,
   original_capture_path:r.artifact_relative_path,object_key:r.object_key,
   bundle_object_path:copyKey(r.SHA256)
  };
 }).sort((a,b)=>a.source_id.localeCompare(b.source_id));
 return {
  format:"ARFI-04F-UNSIGNED-CUSTODY-CANDIDATE-v1",
  classification:"primary_source_original_response_byte_copy_only",
  original_count:11,source_04b_count:7,source_04d_count:4,
  exact_original_capture_manifest_04b_sha256:originalCaptureManifests?.B?sha(originalCaptureManifests.B):null,
  exact_original_capture_manifest_04d_sha256:originalCaptureManifests?.D?sha(originalCaptureManifests.D):null,
  original_HHS_HTML_not_captured:true,original_CBCA_HTML_not_captured:true,
  source_bytes_may_be_staged_without_GOV_approval:true,
  immutable_storage_claim:false,independently_signed:false,
  governance_adopted:false,qualified_legal_review_complete:false,
  VA_ADL1_certified:false,website_publication_permitted:false,
  retention_policy_id:null,approved_institutional_signer:null,
  protected_storage_object_versions:0,source_objects:sources
 };
}
function exactKeys(row){
 return Object.keys(row).sort().join("|") === [...keys].sort().join("|");
}
async function sourceBytes(root,relative){
 check(typeof root==="string"&&typeof relative==="string"&&relative.startsWith("bytes/")&&
  !relative.includes("..")&&!relative.includes("\\"),
  "untrusted input relative path");
 const base=await fs.realpath(root);
 const resolved=path.resolve(root,relative);
 check(resolved.startsWith(path.resolve(root)+path.sep),"source path traversal");
 const st=await fs.lstat(resolved);
 check(st.isFile()&&!st.isSymbolicLink(),"source must be a regular non-symlink file");
 const real=await fs.realpath(resolved);
 check(real.startsWith(base+path.sep),"source resolved outside permitted original directory");
 return await fs.readFile(real);
}
function captureMatches(row,record){
 check(record&&row.sha256===record.sha256&&row.bytes===record.byte_count&&
  row.source_url===(record.source_url||record.url)&&row.original_capture_path===record.relative_path,
  "captured manifest does not match immutable original receipt "+row.source_id);
}
function inspectCaptureIndex(original04B,original04D,index){
 const capturedB=new Map(original04B.captures.map(x=>[x.source_id,x]));
 const capturedD=new Map(original04D.captures.map(x=>[x.id,x]));
 check(original04B.captures.length===7&&
  original04B.uncaptured_sources?.length===1&&
  original04B.uncaptured_sources[0].source_id==="ARCH04B-HHS-HTML"&&
  /HTTP 403/.test(original04B.uncaptured_sources[0].reason||"")&&
  original04B.capture_complete===false,
  "04B source exception must remain explicit HHS 403");
 check(original04D.captures.length===4&&original04D.unavailable?.length===1&&
  original04D.unavailable[0].id==="D04D-SRC-CBCA"&&
  original04D.complete===false,"04D source exception must remain CBCA original");
 for(const row of index.source_objects){
  const b=row.source_id.startsWith("ARCH04B-");
  const entry=b?capturedB.get(row.source_id):capturedD.get(row.source_id);
  captureMatches(row,entry);
  if(b)check(row.source_edition===entry.source_edition,"04B publisher source edition mismatch");
  if(!b)check(row.source_edition===entry.edition&&
   typeof entry.captured_at==="string"&&Number.isFinite(Date.parse(entry.captured_at)),
   "fixed edition/missing original capture timestamp");
  else check(row.captured_at===entry.captured_at,
   "04B observed timestamp does not match original publisher receipt");
 }
}
function compareIndex(received,queue,originalCaptureManifests){
 const expected=createUnsigned04FIndex(queue,originalCaptureManifests);
 check(canonical(received).equals(canonical(expected)),
  "candidate manifest must exactly match the 11 independently pinned source receipts");
 check(received.source_objects.every(exactKeys),"extra source field in unsigned custody candidate");
 return expected;
}
async function inspectBundle(directory,queue){
 const rawB=await fs.readFile(path.join(directory,"capture-manifests","04b.json"));
 const rawD=await fs.readFile(path.join(directory,"capture-manifests","04d.json"));
 const manifests={B:rawB,D:rawD};
 const candidateRaw=await fs.readFile(path.join(directory,"release-candidate.json"));
 let candidate;
 try{candidate=JSON.parse(candidateRaw);}catch{err("unsigned index is invalid JSON");}
 check(canonical(candidate).equals(candidateRaw),"candidate index is not canonical UTF-8 JSON");
 compareIndex(candidate,queue,manifests);
 inspectCaptureIndex(JSON.parse(rawB),JSON.parse(rawD),candidate);
 const digest=sha(candidateRaw);
 for(const row of candidate.source_objects){
  check(row.bundle_object_path===copyKey(row.sha256),"wrong bundle object path");
  const relative=row.bundle_object_path,root=await fs.realpath(directory),f=path.resolve(directory,relative);
  check(f.startsWith(path.resolve(directory)+path.sep),"bundle path escapes root");
  const st=await fs.lstat(f);check(st.isFile()&&!st.isSymbolicLink(),"bundle source not regular");
  check((await fs.realpath(f)).startsWith(root+path.sep),"object symlink escaped bundle");
  const content=await fs.readFile(f);
  check(content.length===row.bytes&&sha(content)===row.sha256,"corrupted bundled original "+row.source_id);
 }
 const files=new Set();
 async function walk(d){
  for(const x of await fs.readdir(d,{withFileTypes:true})){
   const p=path.join(d,x.name);
   check(x.isFile()||x.isDirectory(),"unexpected nonregular bundle object");
   if(x.isDirectory())await walk(p);
   else files.add(path.relative(directory,p).split(path.sep).join("/"));
  }
 }
 await walk(directory);
 const wanted=["release-candidate.json","capture-manifests/04b.json","capture-manifests/04d.json",
  ...candidate.source_objects.map(x=>x.bundle_object_path)];
 check(files.size===wanted.length&&wanted.every(x=>files.has(x)),
  "bundled release contains unknown source bytes or missing files");
 return {
  candidate_manifest_sha256:digest,source_originals_verified:11,
  source_bytes:queue.reduce((n,r)=>n+r.byte_count,0),
  official_source_exceptions:["ARCH04B-HHS-HTML","D04D-SRC-CBCA"],
  verification:"actual_original_bytes_recomputed_SHA256",
  storage_recovery_qualified:false,root_trust_verified:false,
  permanent_custody_authorized:false,signed_institutional_release:false,
  legal_review_complete:false,VA_ADL1_certified:false
 };
}
export async function verify04FBundle({directory,queue}){
 return inspectBundle(path.resolve(directory),queue);
}
export async function replay04FOriginals({input04B,input04D,output,queue}){
 const a=path.resolve(input04B),d=path.resolve(input04D),destination=path.resolve(output);
 const rawB=await fs.readFile(path.join(a,"archive-manifest.json"));
 const rawD=await fs.readFile(path.join(d,"manifest.json"));
 const original04B=JSON.parse(rawB);
 const original04D=JSON.parse(rawD);
 const resultB=await verifyCaptureArchive(a,original04B);
 check(resultB.files===7&&resultB.uncaptured===1&&resultB.complete===false,
  "04B source verification no longer indicates exact seven known originals");
 const candidate=createUnsigned04FIndex(queue,{B:rawB,D:rawD});
 inspectCaptureIndex(original04B,original04D,candidate);
 await fs.mkdir(destination,{recursive:false,mode:0o700});
 try{
  for(const entry of candidate.source_objects){
   const input=entry.source_id.startsWith("ARCH04B-")?a:d;
   const bytes=await sourceBytes(input,entry.original_capture_path);
   check(bytes.length===entry.bytes&&sha(bytes)===entry.sha256,
    "original artifact does not match pinned source hash "+entry.source_id);
   const out=path.join(destination,entry.bundle_object_path);
   await fs.mkdir(path.dirname(out),{recursive:true});
   await fs.writeFile(out,bytes,{flag:"wx",mode:0o600});
  }
  await fs.mkdir(path.join(destination,"capture-manifests"));
  await fs.writeFile(path.join(destination,"capture-manifests","04b.json"),rawB,{flag:"wx",mode:0o600});
  await fs.writeFile(path.join(destination,"capture-manifests","04d.json"),rawD,{flag:"wx",mode:0o600});
  await fs.writeFile(path.join(destination,"release-candidate.json"),canonical(candidate),{flag:"wx",mode:0o600});
  return await inspectBundle(destination,queue);
 }catch(e){
  await fs.rm(destination,{recursive:true,force:true});
  throw e;
 }
}
