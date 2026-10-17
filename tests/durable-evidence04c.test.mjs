import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {generateKeyPairSync} from "node:crypto";
import {canonical,sha256,signRegistry,verifyRegistry
} from "../scripts/durable-evidence-registry-04c-core.mjs";
const ids=["ARCH04B-DOJ-HTML","ARCH04B-TREASURY-HTML","ARCH04B-VA-HTML",
 "ARCH04B-GOVMAN-JUSTICE-XML","ARCH04B-GOVMAN-TREASURY-XML",
 "ARCH04B-GOVMAN-HHS-XML","ARCH04B-GOVMAN-VA-XML"];
const artifact=async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),"arfi-04c-"));
 const entries=[];
 for(let i=0;i<ids.length;i++){
  const data=Buffer.from(("Official source fixture "+ids[i]+"; ").repeat(12));
  const digest=sha256(data),key="sha256/"+digest.slice(0,2)+"/"+digest;
  await fs.mkdir(path.dirname(path.join(root,key)),{recursive:true});
  await fs.writeFile(path.join(root,key),data);
  entries.push({source_id:ids[i],source_url:"https://www.govinfo.gov/test/"+ids[i],
   sha256:digest,byte_count:data.length,source_observed_at:"2026-10-17T01:17:00Z",
   prior_artifact_manifest_sha256:"f".repeat(64),object_key:key,media_type:"text/html"});
 }
 const index={version:"ARFI-EVIDENCE-REGISTRY-04C-1",
  archive_identity:"ARFI-2026-10-17-04B-TO-04C",
  lineage_capture_run_id:38990195886,lineage_artifact_id:12084901808,
  staging_status:"content_addressed_locally_not_durably_published",
  verified_capture_count:7,missing_capture_count:1,
  whole_source_universe_complete:false,legal_review_complete:false,
  VA_ADL1_certified:false,source_bytes_signer_trusted:false,entries,
  missing:[{source_id:"ARCH04B-HHS-HTML",
   source_url:"https://www.hhs.gov/about/organization/org-chart/index.html",
   status:"blocked_HTTP_403_no_original_bytes",no_inferred_repeal:true}]};
 await fs.writeFile(path.join(root,"index.json"),canonical(index));
 return {root,index};
};
const withArchive=async fn=>{
 const x=await artifact();try{await fn(x);}finally{await fs.rm(x.root,{recursive:true,force:true});}
};
test("seven distinct content-addressed object bytes are independently hashed",async()=>{
 await withArchive(async({root})=>{
  const r=await verifyRegistry({directory:root});
  assert.equal(r.bytes_verified,7);
  assert.deepEqual(r.missing_sources,["ARCH04B-HHS-HTML"]);
  assert.equal(r.signature_status,"unsigned_untrusted");
  assert.equal(r.VA_ADL1_certified,false);
 });
});
test("an unsigned byte-perfect evidence snapshot cannot pass trusted signoff",async()=>{
 await withArchive(async({root})=>{
  await assert.rejects(()=>verifyRegistry({directory:root,requireTrustedSignature:true}),
   /trusted signing identity required/);
 });
});
test("Ed25519 detached signature validates only when corresponding issuer is explicitly allowlisted",async()=>{
 await withArchive(async({root})=>{
  const {privateKey,publicKey}=generateKeyPairSync("ed25519");
  const x=await signRegistry({directory:root,
   privateKeyPem:privateKey.export({format:"pem",type:"pkcs8"}),signerId:"ARFI-TEST-CUSTODIAN"});
  await assert.rejects(()=>verifyRegistry({directory:root}),/signer key not enrolled|institutional signer/);
  const trust={version:"ARFI-TRUST-POLICY-04C-1",
   approved_signers:[{id:"ARFI-TEST-CUSTODIAN",approved:true,
    fingerprint_sha256:x.public_key_spki_sha256,
    public_key_pem:publicKey.export({type:"spki",format:"pem"})}]};
  const result=await verifyRegistry({directory:root,trustPolicy:trust,requireTrustedSignature:true});
  assert.equal(result.signature_status,"allowlisted_signer_cryptographically_verified");
  assert.equal(result.durable_retention_proven,false);
  assert.equal(result.VA_ADL1_certified,false);
 });
});
test("detached signature cannot be verified under a different institutional key",async()=>{
 await withArchive(async({root})=>{
  const a=generateKeyPairSync("ed25519"),b=generateKeyPairSync("ed25519");
  const signed=await signRegistry({directory:root,
   privateKeyPem:a.privateKey.export({type:"pkcs8",format:"pem"}),signerId:"unit-custodian"});
  await assert.rejects(()=>verifyRegistry({directory:root,
   trustPolicy:{version:"ARFI-TRUST-POLICY-04C-1",
    approved_signers:[{id:"unit-custodian",approved:true,
      fingerprint_sha256:signed.public_key_spki_sha256,
      public_key_pem:b.publicKey.export({type:"spki",format:"pem"})}]}}),
   /Ed25519 signature or pinned signer mismatch/);
 });
});
test("one-byte change to original object fails byte-level digest verification",async()=>{
 await withArchive(async({root,index})=>{
  const target=path.join(root,index.entries[0].object_key);
  await fs.appendFile(target,"corruption");
  await assert.rejects(()=>verifyRegistry({directory:root}),/SHA-256 mismatch/);
 });
});
test("a path-traversal attempt in an object locator fails closed",async()=>{
 await withArchive(async({root,index})=>{
  index.entries[0].object_key="../secrets";
  await fs.writeFile(path.join(root,"index.json"),canonical(index));
  await assert.rejects(()=>verifyRegistry({directory:root}),/tampered content-addressed/);
 });
});
test("an index cannot claim legal approval or full archive by flipping metadata",async()=>{
 await withArchive(async({root,index})=>{
  index.VA_ADL1_certified=true;
  await fs.writeFile(path.join(root,"index.json"),canonical(index));
  await assert.rejects(()=>verifyRegistry({directory:root}),/fabricated custody/);
 });
});
test("source absence never becomes inferred official abolition",async()=>{
 await withArchive(async({root,index})=>{
  index.missing[0].no_inferred_repeal=false;
  await fs.writeFile(path.join(root,"index.json"),canonical(index));
  await assert.rejects(()=>verifyRegistry({directory:root}),/HHS webpage/);
 });
});
test("index filename cannot be silently re-signed and overwritten",async()=>{
 await withArchive(async({root})=>{
  const key=generateKeyPairSync("ed25519").privateKey.export({type:"pkcs8",format:"pem"});
  await signRegistry({directory:root,privateKeyPem:key,signerId:"unit-custodian"});
  await assert.rejects(()=>signRegistry({directory:root,privateKeyPem:key,signerId:"unit-custodian"}));
 });
});
test("canonical JSON is deterministically key-ordered",()=>{
 assert.equal(canonical({b:2,a:1}).toString(),'{\"a\":1,\"b\":2}\n');
});
