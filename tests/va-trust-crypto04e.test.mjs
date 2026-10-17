import test from "node:test";
import assert from "node:assert/strict";
import {generateKeyPairSync,sign,createHash} from "node:crypto";
import {canonical,verifyGovernanceTrustDecision,verifySeparatedReleaseApprovals,
 assembleProtectedEvidenceProof} from "../scripts/verify-institutional-trust-04e-core.mjs";
const sha=x=>createHash("sha256").update(x).digest("hex");
const signer=(id,role,resolution)=>{
 const pair=generateKeyPairSync("ed25519"),pem=pair.publicKey.export({type:"spki",format:"pem"});
 const fingerprint=sha(pair.publicKey.export({type:"spki",format:"der"}));
 const msg=Buffer.from("ARFI-04E-SIGNER-ENROLLMENT\n"+resolution+"\n"+
  id+"\n"+role+"\n"+fingerprint+"\n");
 return {pair,record:{signer_id:id,role,public_key_spki_pem:pem,
   public_key_spki_sha256:fingerprint,proof_of_possession_base64:sign(null,msg,pair.privateKey).toString("base64"),
   valid_from:"2026-01-01T00:00:00Z",valid_until:"2032-01-01T00:00:00Z"}};
};
function fixture(){
 const root=generateKeyPairSync("ed25519"),resolution="ARFI-BOARD-2026-00001";
 const cust=signer("CUSTODIAN_001","source_custodian",resolution);
 const lawyer=signer("LEGAL_001","qualified_statutory_counsel",resolution);
 const decision={version:"ARFI-04E-GOVERNANCE-DECISION-v1",
  ratified:true,resolution_id:resolution,retention_policy_id:"ARFI-EVIDENCE-RETENTION-01",
  effective_at:"2026-01-01T00:00:00Z",expires_at:"2032-01-01T00:00:00Z",
  minimum_retain_until:"2030-01-01T00:00:00Z",
  approved_storage:{account_id:"123456789012",bucket:"arfi-evidence-originals",region:"us-east-1",
   kms_key_arn:"arn:aws:kms:us-east-1:123456789012:key/0000-1111-2222"},
  require_storage_data_event_audit:true,require_independent_replica:true,
  signers:[cust.record,lawyer.record],revocations:[]};
 const bytes=canonical(decision);
 const proof={decisionBytes:bytes,rootSignatureBase64:sign(null,bytes,root.privateKey).toString("base64"),
  rootPublicKeyPem:root.publicKey.export({type:"spki",format:"pem"}),
  externallyPinnedRootFingerprint:sha(root.publicKey.export({type:"spki",format:"der"})),
  asOf:"2026-10-17T15:00:00Z"};
 const hash=sha(Buffer.from("independently verified official source"));
 const index={release_version:"ARFI-EVIDENCE-04E-v1",policy_id:decision.retention_policy_id,
  sources:[{sha256:hash,bytes:43,object_key:"sha256/"+hash.slice(0,2)+"/"+hash,version_id:"VERSION-001"}]};
 const releaseBytes=canonical(index);
 const msg=Buffer.from("ARFI-04E-RELEASE-APPROVAL\n"+resolution+"\n"+sha(releaseBytes)+"\n");
 const approvals=[
  {role:"source_custodian",signer_id:cust.record.signer_id,
   signature_base64:sign(null,msg,cust.pair.privateKey).toString("base64")},
  {role:"qualified_statutory_counsel",signer_id:lawyer.record.signer_id,
   signature_base64:sign(null,msg,lawyer.pair.privateKey).toString("base64")}];
 return {proof,root,decision,cust,lawyer,releaseBytes,approvals,index};
}
test("externally pinned offline root checks board ratification, separate enrollment PoP and effective times",()=>{
 const f=fixture();
 const v=verifyGovernanceTrustDecision(f.proof);
 assert.equal(v.institutional_trust_root_verified,true);
 assert.equal(v.signers.length,2);
 assert.equal(v.decision_sha256,sha(f.proof.decisionBytes));
});
test("source release manifest is bound to different custodian/legal Ed25519 approvals",()=>{
 const f=fixture(),root=verifyGovernanceTrustDecision(f.proof);
 const r=verifySeparatedReleaseApprovals({trustedDecision:root,releaseIndexBytes:f.releaseBytes,
  approvals:f.approvals});
 assert.equal(r.cryptographic_approvals_verified,2);
 assert.equal(r.qualified_human_credentials_reviewed_externally,false);
 assert.equal(r.VA_ADL1_approved,false);
});
const badRoot=(name,change,re=/04E institutional trust rejected/)=>test(name,()=>{
 const f=fixture();change(f);
 assert.throws(()=>verifyGovernanceTrustDecision(f.proof),re);
});
badRoot("self-pinning a different root without matching external approval fails",f=>{
 f.proof.externallyPinnedRootFingerprint="b".repeat(64);
});
badRoot("board decision bytes modified after root signing are rejected",f=>{
 f.decision.ratified=false;f.proof.decisionBytes=canonical(f.decision);
});
badRoot("a noncanonical JSON decision cannot be treated as a signed exact-byte ratification",f=>{
 f.proof.decisionBytes=Buffer.from('{"resolution_id":"other"}');
});
badRoot("unapproved signer private key cannot impersonate root even with new policy bytes",f=>{
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.cust.pair.privateKey).toString("base64");
});
badRoot("role-specific proof of private-key possession must be checked",f=>{
 f.decision.signers[0].proof_of_possession_base64=sign(null,Buffer.from("fake"),f.cust.pair.privateKey).toString("base64");
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
badRoot("root-signed revocation prevents the compromised custodian signing new releases",f=>{
 f.decision.revocations.push({signer_id:"CUSTODIAN_001",effective_at:"2026-06-01T00:00:00Z"});
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
badRoot("an expired signed governance decision cannot activate trusted custody",f=>{
 f.decision.expires_at="2026-02-01T00:00:00Z";
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
badRoot("a forged root-signed policy missing CloudTrail audit cannot be accepted",f=>{
 f.decision.require_storage_data_event_audit=false;
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
badRoot("a root policy cannot omit independent replica/recovery safeguards",f=>{
 f.decision.require_independent_replica=false;
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
badRoot("missing approved AWS account binding invalidates governance policy",f=>{
 f.decision.approved_storage.account_id="123";
 f.proof.decisionBytes=canonical(f.decision);
 f.proof.rootSignatureBase64=sign(null,f.proof.decisionBytes,f.root.privateKey).toString("base64");
});
const badApproval=(name,change,re=/04E institutional trust rejected/)=>test(name,()=>{
 const f=fixture(),v=verifyGovernanceTrustDecision(f.proof);
 change(f);assert.throws(()=>verifySeparatedReleaseApprovals({
  trustedDecision:v,releaseIndexBytes:f.releaseBytes,approvals:f.approvals}),re);
});
badApproval("a changed source manifest invalidates separately signed approvals",f=>{
 f.index.sources[0].bytes=900;f.releaseBytes=canonical(f.index);
});
badApproval("replay of custodian signature as legal signature cannot satisfy independence",f=>{
 f.approvals[1]=f.approvals[0];
});
badApproval("relabeling custody signature as counsel approval fails role-bound signer verification",f=>{
 f.approvals[1].signer_id=f.approvals[0].signer_id;
});
badApproval("release index cannot point to non-content-addressed source data",f=>{
 f.index.sources[0].object_key="arbitrary";f.releaseBytes=canonical(f.index);
});
badApproval("release index cannot bind to an unversioned S3 object",f=>{
 f.index.sources[0].version_id="";f.releaseBytes=canonical(f.index);
});
test("even signed custody approvals cannot equate an unsigned data-only receipt to independent audit/replica",()=>{
 const f=fixture(),v=verifyGovernanceTrustDecision(f.proof);
 const approved=verifySeparatedReleaseApprovals({trustedDecision:v,releaseIndexBytes:f.releaseBytes,
  approvals:f.approvals});
 const h=f.index.sources[0].sha256,storage=v.decision.approved_storage;
 const proof={method:"authenticated_read_of_exact_version",object_lock_verified:true,
  versioning_verified:true,customer_KMS_verified:true,retention_mode:"COMPLIANCE",
  content_sha256:h,key:f.index.sources[0].object_key,version_id:"VERSION-001",bytes_verified:43,
  account_id:storage.account_id,bucket:storage.bucket,region:storage.region,
  kms_key_arn:storage.kms_key_arn,retention_until:"2035-01-01T00:00:00Z",
  CloudTrail_data_events_verified:false,replica_verified:false};
 assert.throws(()=>assembleProtectedEvidenceProof({trustedDecision:v,releaseApproval:approved,
  verifiedObjects:[proof],expectedSourceCount:1}),/independent storage data-event audit evidence required/);
});
