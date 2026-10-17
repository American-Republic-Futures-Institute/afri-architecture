// Increment 04E: externally anchored institutional Ed25519 trust root and two-person release approval.
// No fallback to test keys, unsigned policy JSON, or self-pinned trust policy is permitted.
import {createHash,createPublicKey,verify} from "node:crypto";
const digest=b=>createHash("sha256").update(b).digest("hex");
const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const fail=x=>{throw Error("04E institutional trust rejected: "+x);};
const check=(x,y)=>{if(!x)fail(y);};
const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==="object"?
 Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;
export const canonical=x=>Buffer.from(JSON.stringify(sort(x))+"\n","utf8");
const parseUTC=x=>{
 check(typeof x==="string"&&x.endsWith("Z")&&Number.isFinite(Date.parse(x)),
  "UTC policy effective-date field required");
 return Date.parse(x);
};
const signerFingerprint=pem=>{
 const key=createPublicKey(pem);
 check(key.asymmetricKeyType==="ed25519","Ed25519 key required");
 return {key,fingerprint:digest(key.export({type:"spki",format:"der"}))};
};
const readSignature=x=>{
 check(typeof x==="string"&&/^[A-Za-z0-9+/]+={0,2}$/.test(x)&&x.length===88,
  "canonical Ed25519 signature base64 required");
 const b=Buffer.from(x,"base64");
 check(b.length===64&&b.toString("base64")===x,"invalid signature encoding");
 return b;
};
const allowedRoles=new Set(["source_custodian","qualified_statutory_counsel","records_officer","archive_recovery_operator"]);
export function verifyGovernanceTrustDecision({decisionBytes,rootSignatureBase64,rootPublicKeyPem,
 externallyPinnedRootFingerprint,asOf=new Date().toISOString()}){
 check(hash(externallyPinnedRootFingerprint),"external operator root fingerprint is mandatory");
 const raw=Buffer.isBuffer(decisionBytes)?decisionBytes:Buffer.from(decisionBytes||"");
 let doc;try{doc=JSON.parse(raw);}catch{fail("invalid governance policy JSON");}
 check(canonical(doc).equals(raw),"governance policy must be canonical exact UTF-8 bytes");
 const root=signerFingerprint(rootPublicKeyPem);
 check(root.fingerprint===externallyPinnedRootFingerprint,
  "supplied root key does not match independently established institutional fingerprint");
 check(verify(null,raw,root.key,readSignature(rootSignatureBase64)),
  "governance decision not signed by independently pinned trust root");
 check(doc?.version==="ARFI-04E-GOVERNANCE-DECISION-v1"&&doc.ratified===true&&
  /^ARFI-BOARD-[0-9A-Za-z-]{6,50}$/.test(doc.resolution_id||"")&&
  typeof doc.retention_policy_id==="string"&&doc.retention_policy_id.length>=8,
  "signed decision must have explicit governing resolution and ratified retention policy");
 const now=parseUTC(asOf);
 check(parseUTC(doc.effective_at)<=now&&parseUTC(doc.expires_at)>now,
  "governance resolution not currently effective");
 check(parseUTC(doc.minimum_retain_until)>now,
  "governance decision lacks valid future minimum retention");
 check(doc.approved_storage&&
   /^[0-9]{12}$/.test(doc.approved_storage.account_id||"")&&
   typeof doc.approved_storage.bucket==="string"&&doc.approved_storage.bucket.length>3&&
   typeof doc.approved_storage.region==="string"&&
   typeof doc.approved_storage.kms_key_arn==="string"&&
   doc.approved_storage.kms_key_arn.startsWith("arn:aws:kms:"+doc.approved_storage.region+":"+
     doc.approved_storage.account_id+":key/")&&
   doc.require_storage_data_event_audit===true&&doc.require_independent_replica===true,
   "root-signed custody decision must bind storage account, KMS, audit and independent replica");
 check(Array.isArray(doc.signers)&&doc.signers.length>=2&&
  Array.isArray(doc.revocations),"root-signed enrollment and revocation ledger required");
 const ids=new Set(),fp=new Set(),validated=[];
 for(const x of doc.signers){
  check(allowedRoles.has(x.role)&&typeof x.signer_id==="string"&&
   /^[A-Z0-9_-]{6,80}$/.test(x.signer_id),"unapproved signer role or identity");
  check(!ids.has(x.signer_id),"duplicated signer ID");ids.add(x.signer_id);
  const key=signerFingerprint(x.public_key_spki_pem);
  check(hash(x.public_key_spki_sha256)&&
   x.public_key_spki_sha256===key.fingerprint&&!fp.has(key.fingerprint),
   "signer key fingerprint mismatch or reused across roles");
  fp.add(key.fingerprint);
  const pop=Buffer.from("ARFI-04E-SIGNER-ENROLLMENT\n"+doc.resolution_id+"\n"+
   x.signer_id+"\n"+x.role+"\n"+key.fingerprint+"\n");
  check(verify(null,pop,key.key,readSignature(x.proof_of_possession_base64)),
   "role signer has not proven possession of private Ed25519 key");
  check(parseUTC(x.valid_from)<=now&&parseUTC(x.valid_until)>now,
   "signer validity interval expired or not started");
  check(!doc.revocations.some(y=>y.signer_id===x.signer_id&&parseUTC(y.effective_at)<=now),
   "root-signed ledger revokes active signer");
  validated.push({signer_id:x.signer_id,role:x.role,fingerprint:key.fingerprint,key:key.key});
 }
 check(validated.some(x=>x.role==="source_custodian")&&
  validated.some(x=>x.role==="qualified_statutory_counsel"),
  "must enroll separate custodian and qualified legal reviewer");
 return {decision:doc,root_fingerprint:root.fingerprint,signers:validated,
  decision_sha256:digest(raw),institutional_trust_root_verified:true};
}
export function verifySeparatedReleaseApprovals({trustedDecision,releaseIndexBytes,approvals}){
 check(trustedDecision?.institutional_trust_root_verified===true,
  "release requires root-verified governance decision");
 const raw=Buffer.isBuffer(releaseIndexBytes)?releaseIndexBytes:Buffer.from(releaseIndexBytes||"");
 let index;try{index=JSON.parse(raw);}catch{fail("invalid release manifest");}
 check(canonical(index).equals(raw),"release index must be deterministic UTF-8 JSON");
 check(index?.release_version==="ARFI-EVIDENCE-04E-v1"&&
  index?.policy_id===trustedDecision.decision.retention_policy_id&&
  Array.isArray(index.sources)&&index.sources.length>=1,
  "release source index/policy mismatch");
 check(index.sources.every(s=>/^[a-f0-9]{64}$/.test(s.sha256||"")&&
   s.object_key==="sha256/"+s.sha256.slice(0,2)+"/"+s.sha256&&
   Number.isSafeInteger(s.bytes)&&s.bytes>0&&
   typeof s.version_id==="string"&&s.version_id.length>=3)&&
   new Set(index.sources.map(s=>s.sha256)).size===index.sources.length,
   "signed release index must bind exact unique object bytes, keys and version IDs");
 check(Array.isArray(approvals)&&approvals.length===2,"two independent approvals required");
 const roles=["source_custodian","qualified_statutory_counsel"];
 const signable=Buffer.from("ARFI-04E-RELEASE-APPROVAL\n"+
  trustedDecision.decision.resolution_id+"\n"+digest(raw)+"\n");
 const seen=new Set();
 for(const role of roles){
  const approval=approvals.find(x=>x.role===role);
  check(approval&&typeof approval.signer_id==="string","missing role approval "+role);
  const signer=trustedDecision.signers.find(x=>x.signer_id===approval.signer_id&&x.role===role);
  check(signer&&!seen.has(signer.fingerprint),"unapproved signer or repeated principal");
  check(verify(null,signable,signer.key,readSignature(approval.signature_base64)),
   "invalid legal/custodian role signature");
  seen.add(signer.fingerprint);
 }
 check(seen.size===2,"two distinct institutional signing keys required");
 return {release_manifest_sha256:digest(raw),approved_roles:roles,
  cryptographic_approvals_verified:2,qualified_human_credentials_reviewed_externally:false,
  approved_source_refs:index.sources,
  protected_storage_verified:false,VA_ADL1_approved:false};
}
// Neither checked source bytes nor signatures constitute a protected archive without independent live provider checks.
export function assembleProtectedEvidenceProof({trustedDecision,releaseApproval,verifiedObjects,
 expectedSourceCount,requiredReplica=false}){
 check(trustedDecision?.institutional_trust_root_verified===true&&
  releaseApproval?.cryptographic_approvals_verified===2,
  "approved root and two human role signatures required");
 check(Array.isArray(verifiedObjects)&&verifiedObjects.length===expectedSourceCount&&
  expectedSourceCount>0,"all release originals must have verified protected object versions");
 const signedSources=releaseApproval.approved_source_refs;
 check(Array.isArray(signedSources)&&signedSources.length===expectedSourceCount,
  "live object set must match precisely the signed source index");
 const hashes=new Set();
 for(const x of verifiedObjects){
  check(x?.method==="authenticated_read_of_exact_version"&&
   x.object_lock_verified===true&&x.versioning_verified===true&&x.customer_KMS_verified===true&&
   x.retention_mode==="COMPLIANCE"&&hash(x.content_sha256),
   "untrusted or noncompliant protected object proof");
  const approved=signedSources.find(s=>s.sha256===x.content_sha256);
  check(approved&&approved.version_id===x.version_id&&
   approved.object_key===x.key&&approved.bytes===x.bytes_verified,
   "live source object not bound to exact signed release manifest version");
  const storage=trustedDecision.decision.approved_storage;
  check(x.account_id===storage.account_id&&x.bucket===storage.bucket&&
   x.region===storage.region&&x.kms_key_arn===storage.kms_key_arn,
   "independently verified AWS account/bucket/KMS differ from signed governance policy");
  check(Date.parse(x.retention_until)>=Date.parse(trustedDecision.decision.minimum_retain_until),
   "object retention below signed institutional policy");
  check(!hashes.has(x.content_sha256),"duplicate source digest in release");hashes.add(x.content_sha256);
  check(x.CloudTrail_data_events_verified===true,
   "independent storage data-event audit evidence required");
  check(x.replica_verified===true,"independent immutable replica proof required");
  if(requiredReplica)check(x.replica_verified===true,"independently verified replica required");
 }
 return {protected_primary_objects_verified:verifiedObjects.length,
  governance_root_and_two_approvals_verified:true,
  independent_provider_version_reads_verified:true,
  release_status:"cryptographic_and_provider_preconditions_only_not_institutional_certification",
  release_qualified:false,independent_human_qualification_review_pending:true,
  VA_ADL1_approved:false,legal_classifications_certified:false};
}
