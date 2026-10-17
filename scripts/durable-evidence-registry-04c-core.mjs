// ARFI 04C: reproducible content-addressed evidence staging. Cryptographic integrity is not legal signoff.
import fs from "node:fs/promises";
import path from "node:path";
import {createHash,createPrivateKey,createPublicKey,sign,verify} from "node:crypto";
import {verifyCaptureArchive} from "./federal-source-archive-core.mjs";
export const VERSION="ARFI-EVIDENCE-REGISTRY-04C-1";
export const sha256=b=>createHash("sha256").update(b).digest("hex");
const isHash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const fail=x=>{throw Error("Evidence registry rejected: "+x);};
const check=(x,y)=>{if(!x)fail(y);};
const sorted=x=>Array.isArray(x)?x.map(sorted):x!==null&&typeof x==="object"?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x;
export const canonical=x=>Buffer.from(JSON.stringify(sorted(x))+"\n","utf8");
const keyOf=h=>"sha256/"+h.slice(0,2)+"/"+h;
const exact=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).sort().join("|")===keys.slice().sort().join("|");
async function readObject(root,relative){
 const p=path.resolve(root,relative);
 check(p.startsWith(path.resolve(root)+path.sep),"archive object path traversal");
 const stat=await fs.lstat(p);
 check(stat.isFile()&&!stat.isSymbolicLink(),"source object must be a regular file");
 return fs.readFile(p);
}
export function validatePinnedReceipts(rows){
 check(Array.isArray(rows)&&rows.length===8,"require eight predecessor source slots");
 const seen=new Set();let valid=0,blocked=0;
 for(const x of rows){
  check(!seen.has(x.source_id),"duplicate source ID");seen.add(x.source_id);
  check(x.durable_repository_commit===null&&x.durable_object_verified===false&&
   x.trusted_signature_verified===false&&x.promoted_retention_status==="not_promoted",
   "model must not claim permanent publication or signature");
  if(x.observed_sha256===null){
   blocked++;
   check(x.source_id==="ARCH04B-HHS-HTML"&&x.observed_bytes===null&&x.immutable_object_key===null,
    "unavailable HHS original document cannot be substituted");
  }else{
   valid++;
   check(isHash(x.observed_sha256)&&Number.isSafeInteger(x.observed_bytes)&&
    x.observed_bytes>100&&x.observed_bytes<=3000000&&
    x.immutable_object_key===keyOf(x.observed_sha256),"invalid pinned content-addressed identity");
  }
 }
 check(valid===7&&blocked===1,"seven source receipts plus HHS 403 required");
 return true;
}
export async function stageRegistry({captureDirectory,outputDirectory,expected}){
 validatePinnedReceipts(expected);
 const originalManifestBytes=await fs.readFile(path.join(captureDirectory,"archive-manifest.json"));
 const original=JSON.parse(originalManifestBytes);
 const report=await verifyCaptureArchive(captureDirectory,original);
 check(report.files===7&&report.uncaptured===1&&report.complete===false,
  "seven verified captures and one denied HHS page required");
 const byId=new Map(expected.map(x=>[x.source_id,x]));
 await fs.mkdir(outputDirectory,{recursive:false,mode:0o700});
 const entries=[];
 for(const x of original.captures){
  const e=byId.get(x.source_id),raw=await readObject(captureDirectory,x.relative_path);
  check(e&&e.observed_sha256===x.sha256&&e.observed_bytes===x.byte_count&&
   e.source_url===x.source_url&&sha256(raw)===x.sha256,
   "prior capture cannot be reconciled to verified source receipt");
  const object_key=keyOf(x.sha256),p=path.join(outputDirectory,object_key);
  await fs.mkdir(path.dirname(p),{recursive:true});
  await fs.writeFile(p,raw,{flag:"wx",mode:0o600});
  entries.push({source_id:x.source_id,source_url:x.source_url,sha256:x.sha256,
   byte_count:x.byte_count,source_observed_at:x.captured_at,
   prior_artifact_manifest_sha256:sha256(originalManifestBytes),
   object_key,media_type:x.content_type});
 }
 entries.sort((a,b)=>a.source_id.localeCompare(b.source_id));
 const missing=original.uncaptured_sources.map(x=>({
  source_id:x.source_id,source_url:x.source_url,
  status:"blocked_HTTP_403_no_original_bytes",no_inferred_repeal:true}));
 check(missing.length===1&&missing[0].source_id==="ARCH04B-HHS-HTML",
  "source access gap must remain explicitly unresolved");
 const index={version:VERSION,archive_identity:"ARFI-2026-10-17-04B-TO-04C",
  lineage_capture_run_id:38990195886,lineage_artifact_id:12084901808,
  staging_status:"content_addressed_locally_not_durably_published",
  verified_capture_count:7,missing_capture_count:1,
  whole_source_universe_complete:false,legal_review_complete:false,
  VA_ADL1_certified:false,source_bytes_signer_trusted:false,entries,missing};
 await fs.writeFile(path.join(outputDirectory,"index.json"),canonical(index),{flag:"wx",mode:0o600});
 await verifyRegistry({directory:outputDirectory,expected});
 return index;
}
export async function signRegistry({directory,privateKeyPem,signerId}){
 check(/^[a-zA-Z0-9._-]{3,90}$/.test(signerId||""),"signer identifier invalid");
 const bytes=await fs.readFile(path.join(directory,"index.json"));
 check(canonical(JSON.parse(bytes)).equals(bytes),"noncanonical manifest cannot be signed");
 await verifyRegistry({directory});
 const priv=createPrivateKey(privateKeyPem);
 check(priv.asymmetricKeyType==="ed25519","only Ed25519 accepted");
 const pub=createPublicKey(priv),fingerprint=sha256(pub.export({type:"spki",format:"der"}));
 const sig={algorithm:"Ed25519",manifest_sha256:sha256(bytes),signer_id:signerId,
  public_key_spki_sha256:fingerprint,
  signature_base64:sign(null,bytes,priv).toString("base64"),
  signature_scope:"exact_canonical_index_json_bytes_no_legal_approval"};
 await fs.writeFile(path.join(directory,"signature.json"),canonical(sig),{flag:"wx",mode:0o600});
 return {signer_id:signerId,manifest_sha256:sig.manifest_sha256,public_key_spki_sha256:fingerprint};
}
export async function verifyRegistry({directory,expected=null,trustPolicy=null,requireTrustedSignature=false}){
 const indexBytes=await fs.readFile(path.join(directory,"index.json")),idx=JSON.parse(indexBytes);
 check(canonical(idx).equals(indexBytes),"manifest requires canonical UTF-8 JSON");
 check(exact(idx,["version","archive_identity","lineage_capture_run_id","lineage_artifact_id",
  "staging_status","verified_capture_count","missing_capture_count","whole_source_universe_complete",
  "legal_review_complete","VA_ADL1_certified","source_bytes_signer_trusted","entries","missing"]),
  "unknown or missing archive manifest field");
 check(idx.version===VERSION&&idx.staging_status==="content_addressed_locally_not_durably_published"&&
  idx.lineage_capture_run_id===38990195886&&idx.lineage_artifact_id===12084901808&&
  idx.legal_review_complete===false&&idx.VA_ADL1_certified===false&&
  idx.source_bytes_signer_trusted===false&&idx.whole_source_universe_complete===false&&
  idx.verified_capture_count===7&&idx.missing_capture_count===1&&
  Array.isArray(idx.entries)&&idx.entries.length===7&&Array.isArray(idx.missing)&&idx.missing.length===1,
  "fabricated custody or current VA ADL-1 state");
 const seen=new Set();
 for(const e of idx.entries){
  check(exact(e,["source_id","source_url","sha256","byte_count","source_observed_at",
    "prior_artifact_manifest_sha256","object_key","media_type"])&&
   !seen.has(e.source_id)&&isHash(e.sha256)&&isHash(e.prior_artifact_manifest_sha256)&&
   e.object_key===keyOf(e.sha256)&&Number.isSafeInteger(e.byte_count)&&
   e.byte_count>100&&e.byte_count<=3000000,"tampered content-addressed source reference");
  seen.add(e.source_id);
  const bytes=await readObject(directory,e.object_key);
  check(bytes.length===e.byte_count&&sha256(bytes)===e.sha256,"SHA-256 mismatch "+e.source_id);
 }
 check(idx.missing[0].source_id==="ARCH04B-HHS-HTML"&&
  idx.missing[0].status==="blocked_HTTP_403_no_original_bytes"&&
  idx.missing[0].no_inferred_repeal===true&&!seen.has("ARCH04B-HHS-HTML"),
  "unavailable HHS webpage cannot become a valid source");
 if(expected){
  validatePinnedReceipts(expected);
  const refs=new Map(expected.map(x=>[x.source_id,x]));
  for(const e of idx.entries){
   const r=refs.get(e.source_id);
   check(r&&r.observed_sha256===e.sha256&&r.observed_bytes===e.byte_count&&
    r.source_url===e.source_url,"source differs from pinned reviewed digest");
  }
 }
 let status="unsigned_untrusted",sig=null;
 try{sig=JSON.parse(await fs.readFile(path.join(directory,"signature.json")));}
 catch(e){if(e.code!=="ENOENT")throw e;}
 if(sig){
  check(exact(sig,["algorithm","manifest_sha256","signer_id",
   "public_key_spki_sha256","signature_base64","signature_scope"])&&
   sig.algorithm==="Ed25519"&&sig.manifest_sha256===sha256(indexBytes)&&
   isHash(sig.public_key_spki_sha256)&&
   sig.signature_scope==="exact_canonical_index_json_bytes_no_legal_approval",
   "detached signature envelope invalid");
  const signer=trustPolicy?.version==="ARFI-TRUST-POLICY-04C-1"&&
   trustPolicy.approved_signers?.find(s=>s.id===sig.signer_id&&s.approved===true);
  check(signer&&signer.fingerprint_sha256===sig.public_key_spki_sha256,
   "institutional signer key not enrolled or unapproved");
  const pub=createPublicKey(signer.public_key_pem);
  check(pub.asymmetricKeyType==="ed25519"&&
   sha256(pub.export({type:"spki",format:"der"}))===signer.fingerprint_sha256&&
   verify(null,indexBytes,pub,Buffer.from(sig.signature_base64,"base64")),
   "Ed25519 signature or pinned signer mismatch");
  status="allowlisted_signer_cryptographically_verified";
 }
 if(requireTrustedSignature&&status!=="allowlisted_signer_cryptographically_verified")
  fail("trusted signing identity required; bytes alone are not institutional approval");
 return {bytes_verified:idx.entries.length,missing_sources:idx.missing.map(x=>x.source_id),
  index_sha256:sha256(indexBytes),signature_status:status,
  durable_retention_proven:false,VA_ADL1_certified:false};
}
