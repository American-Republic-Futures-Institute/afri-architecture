import test from "node:test";
import assert from "node:assert/strict";
import {generateKeyPairSync,sign,createHash} from "node:crypto";
import {canonical,releaseBlockers,verifyTwoIndependentApprovals,
 verifyStorageAttestation,qualifyControlledRelease} from "../scripts/controlled-release-04d-core.mjs";
const digest=x=>createHash("sha256").update(x).digest("hex");
function mock(){
 const bytes=canonical({manifest_version:"ARFI-04D-TEST",status:"research_unratified",sources:4});
 const trust={version:"ARFI-04D-TRUST-REGISTRY-v1",approved_signers:[]},approvals=[];
 const message=Buffer.from("ARFI-04D-RELEASE-APPROVAL\n"+digest(bytes)+"\n");
 for(const role of ["custodian","statutory_counsel"]){
  const keys=generateKeyPairSync("ed25519"),id="TEST-"+role;
  const pem=keys.publicKey.export({type:"spki",format:"pem"});
  const fingerprint=digest(keys.publicKey.export({type:"spki",format:"der"}));
  trust.approved_signers.push({signer_id:id,role,approved:true,public_key_pem:pem,public_key_sha256:fingerprint});
  approvals.push({signer_id:id,role,signature_base64:sign(null,message,keys.privateKey).toString("base64")});
 }
 return {bytes,trust,approvals,fingerprint:digest(canonical(trust))};
}
test("canonical bytes are independently deterministic across object field order",()=>{
 assert.equal(canonical({z:1,a:2}).toString(),'{\"a\":2,\"z\":1}\n');
});
test("two distinct role-specific Ed25519 signatures verify under a pinned external trust roster",()=>{
 const m=mock();
 const result=verifyTwoIndependentApprovals({releaseManifestBytes:m.bytes,trustRegistry:m.trust,
  attestations:m.approvals,approvedTrustDigest:m.fingerprint});
 assert.equal(result.signatures,2);
 assert.equal(result.legal_competence_independently_established,false);
 assert.equal(result.protected_storage_independently_established,false);
});
test("an arbitrary unpinned signing trust registry is rejected",()=>{
 const m=mock();
 assert.throws(()=>verifyTwoIndependentApprovals({releaseManifestBytes:m.bytes,trustRegistry:m.trust,
  attestations:m.approvals,approvedTrustDigest:"1".repeat(64)}),/trust roster is not externally fingerprint-pinned/);
});
test("a second signature by the first same signer is not an independent approval",()=>{
 const m=mock();
 m.approvals[1]=m.approvals[0];
 assert.throws(()=>verifyTwoIndependentApprovals({releaseManifestBytes:m.bytes,trustRegistry:m.trust,
  attestations:m.approvals,approvedTrustDigest:m.fingerprint}),/missing role-specific signed approval/);
});
test("modified release manifest invalidates signed approval",()=>{
 const m=mock(),different=canonical({manifest_version:"ARFI-04D-TEST",status:"accepted",sources:4});
 assert.throws(()=>verifyTwoIndependentApprovals({releaseManifestBytes:different,trustRegistry:m.trust,
  attestations:m.approvals,approvedTrustDigest:m.fingerprint}),/Ed25519 signature invalid/);
});
test("unreviewed signer public-key substitution is rejected",()=>{
 const m=mock(),keys=generateKeyPairSync("ed25519");
 m.trust.approved_signers[0].public_key_pem=keys.publicKey.export({type:"spki",format:"pem"});
 assert.throws(()=>verifyTwoIndependentApprovals({releaseManifestBytes:m.bytes,trustRegistry:m.trust,
  attestations:m.approvals,approvedTrustDigest:digest(canonical(m.trust))}),/public-key fingerprint/);
});
test("a storage receipt without provider proof cannot claim immutable archiving",()=>{
 assert.throws(()=>verifyStorageAttestation({}, {sha256:"a".repeat(64)},{}),/storage proof missing/);
});
test("a structurally plausible WORM claim remains unverified without cryptographic provider attestations",()=>{
 const receipt={provider_verified:true,object_version:"version-12",lock_mode:"compliance",
  provider_signed_evidence_sha256:"a".repeat(64),content_sha256:"b".repeat(64),
  location:"s3://example/arfi",policy_id:"retention-policy-v1",retention_until:"2099-01-01"};
 const r=verifyStorageAttestation(receipt,{sha256:"b".repeat(64)},{
  protected_archive_location:"s3://example/arfi",retention_policy_id:"retention-policy-v1",
  minimum_retention_until:"2045-01-01"});
 assert.equal(r.storage_receipt_structurally_complete,true);
 assert.equal(r.provider_cryptographic_authentication_pending,true);
});
test("unapproved retention policy always blocks release even with valid synthetic signatures",()=>{
 const m=mock(),model={approved_signer:null,signer_fingerprint_sha256:null,
  retention_policy_id:null,protected_archive_location:null,immutable_storage_proof:null,
  independent_custodian_approval:null,independent_legal_approval:null,fully_attested:false};
 assert(releaseBlockers(model,[],[]).length>=6);
 assert.throws(()=>qualifyControlledRelease({modelTrust:model,modelReviews:[],observed:[],
  releaseManifestBytes:m.bytes,trustRegistry:m.trust,attestations:m.approvals,
  approvedTrustDigest:m.fingerprint,storageReceipt:{},releaseIndex:{},ratifiedPolicy:{}}),/blocked:/);
});
