// Institutional evidence promotion must fail closed until external authorized roles actually exist.
import {createHash,createPublicKey,verify} from "node:crypto";
const digest=b=>createHash("sha256").update(b).digest("hex");
const hash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const refuse=x=>{throw Error("04D protected release rejected: "+x);};
const requireThat=(x,y)=>{if(!x)refuse(y);};
const normalize=x=>Array.isArray(x)?x.map(normalize):x&&typeof x==="object"?
 Object.fromEntries(Object.keys(x).sort().map(k=>[k,normalize(x[k])])):x;
export const canonical=x=>Buffer.from(JSON.stringify(normalize(x))+"\n");
export const EXPECTED_ROLES=Object.freeze(["custodian","statutory_counsel"]);
export function releaseBlockers(trust,approvals,observed){
 const missing=[];
 if(trust?.approved_signer===null||!trust?.approved_signer)missing.push("institutional_signer_not_enrolled");
 if(trust?.signer_fingerprint_sha256===null||!hash(trust?.signer_fingerprint_sha256))missing.push("approved_public_key_not_pinned");
 if(trust?.retention_policy_id===null||!trust?.retention_policy_id)missing.push("retention_policy_not_ratified");
 if(trust?.protected_archive_location===null||!trust?.protected_archive_location)missing.push("protected_archive_destination_unprovisioned");
 if(trust?.immutable_storage_proof===null||!trust?.immutable_storage_proof)missing.push("immutable_storage_unattested");
 if(trust?.independent_custodian_approval===null||!trust?.independent_custodian_approval)missing.push("source_custodian_signature_missing");
 if(trust?.independent_legal_approval===null||!trust?.independent_legal_approval)missing.push("independent_legal_reviewer_signature_missing");
 if(trust?.fully_attested!==true)missing.push("protected_release_not_ratified");
 if(!Array.isArray(approvals)||approvals.length!==6||approvals.some(x=>x.decision!=="approved"))
  missing.push("six_independent_human_approvals_not_verified");
 if(!Array.isArray(observed)||observed.filter(x=>x.body_sha256!==null).length!==4)
  missing.push("original_FOM_and_statutory_source_receipts_incomplete");
 if(observed?.some(x=>x.original_bytes_embedded_in_architecture_repo===true&&x.durable_write_once_approved===false))
  missing.push("unprotected_repository_copy_cannot_be_called_immutable");
 return [...new Set(missing)];
}
function verifySingleSignature(signable,attestation,trust,role){
 requireThat(attestation?.role===role&&typeof attestation.signer_id==="string"&&
  typeof attestation.signature_base64==="string","missing role-specific signed approval "+role);
 const entry=trust.approved_signers?.find(x=>x.signer_id===attestation.signer_id&&
  x.role===role&&x.approved===true);
 requireThat(entry&&hash(entry.public_key_sha256)&&typeof entry.public_key_pem==="string",
  "signer not on externally approved trust roster "+role);
 const key=createPublicKey(entry.public_key_pem);
 const fingerprint=digest(key.export({type:"spki",format:"der"}));
 requireThat(key.asymmetricKeyType==="ed25519"&&fingerprint===entry.public_key_sha256,
  "institutional public-key fingerprint does not match");
 const buffer=Buffer.from(attestation.signature_base64,"base64");
 requireThat(buffer.length===64&&verify(null,signable,key,buffer),
  "Ed25519 signature invalid or bound to wrong release digest");
 return fingerprint;
}
export function verifyTwoIndependentApprovals({releaseManifestBytes,trustRegistry,attestations,approvedTrustDigest}){
 const raw=Buffer.isBuffer(releaseManifestBytes)?releaseManifestBytes:Buffer.from(releaseManifestBytes);
 requireThat(canonical(JSON.parse(raw)).equals(raw),"release manifest must use deterministic canonical UTF-8");
 requireThat(trustRegistry?.version==="ARFI-04D-TRUST-REGISTRY-v1"&&
   hash(approvedTrustDigest)&&digest(canonical(trustRegistry))===approvedTrustDigest,
  "institutional trust roster is not externally fingerprint-pinned");
 requireThat(Array.isArray(attestations)&&attestations.length===2,
  "two independent role-specific signatures required");
 const signable=Buffer.from("ARFI-04D-RELEASE-APPROVAL\n"+digest(raw)+"\n","utf8");
 const fingerprints=EXPECTED_ROLES.map(role=>{
  const item=attestations.find(x=>x.role===role);
  return verifySingleSignature(signable,item,trustRegistry,role);
 });
 requireThat(new Set(fingerprints).size===2&&
   new Set(attestations.map(x=>x.signer_id)).size===2,
  "same principal cannot self-approve evidence custody and legal review");
 return {release_manifest_sha256:digest(raw),signatures:2,
  approved_roles:EXPECTED_ROLES,signature_status:"cryptographically_valid_against_explicit_trust_roster",
  legal_competence_independently_established:false,protected_storage_independently_established:false};
}
export function verifyStorageAttestation(receipt,releaseIndex,policy){
 requireThat(receipt?.provider_verified===true&&
  typeof receipt.object_version==="string"&&receipt.object_version.length>=5&&
  receipt.lock_mode==="compliance"&&hash(receipt.provider_signed_evidence_sha256)&&
  receipt.content_sha256===releaseIndex.sha256&&
  receipt.location===policy.protected_archive_location&&
  receipt.policy_id===policy.retention_policy_id,
  "storage proof missing a provider version and ratified retention binding");
 requireThat(Number.isFinite(Date.parse(receipt.retention_until))&&
  Number.isFinite(Date.parse(policy.minimum_retention_until))&&
  Date.parse(receipt.retention_until)>=Date.parse(policy.minimum_retention_until),
  "provider retention does not meet approved minimum");
 // Provider-attestation authenticity and permissions must be independently reviewed.
 return {storage_receipt_structurally_complete:true,provider_cryptographic_authentication_pending:true};
}
export function qualifyControlledRelease({modelTrust,modelReviews,observed,releaseManifestBytes,
 trustRegistry,attestations,approvedTrustDigest,storageReceipt,releaseIndex,ratifiedPolicy}){
 const blockers=releaseBlockers(modelTrust,modelReviews,observed);
 requireThat(blockers.length===0,"blocked: "+blockers.join(", "));
 const signatures=verifyTwoIndependentApprovals({releaseManifestBytes,trustRegistry,
  attestations,approvedTrustDigest});
 const storage=verifyStorageAttestation(storageReceipt,releaseIndex,ratifiedPolicy);
 requireThat(storage.provider_cryptographic_authentication_pending===false,
  "provider storage attestation needs independent cryptographic validation");
 return {...signatures,release_qualified:true};
}
