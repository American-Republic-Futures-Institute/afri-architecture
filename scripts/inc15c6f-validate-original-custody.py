#!/usr/bin/env python3
"""Revalidate exact Git originals, acquisition and distinct signed OCR notice epochs."""
from __future__ import annotations
import hashlib,json,sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
ROOT=BASE/"evidence/hhs-ocr-org-2023-2026"
ED={
 "ocr_2023":{"sha256":"7035eea1497113c5964fce2f6d3862b31c5452e34a0b80b1ee572bb50610cfad",
  "bytes":195496,"git":"26debd0afc20c528a022702d1a3b5a604b6966ed",
  "url":"https://www.govinfo.gov/content/pkg/FR-2023-03-01/pdf/2023-03892.pdf",
  "fr":"88 FR 12954-12955","pub":"2023-03-01","approved":"2023-02-10","effective":"2023-02-25"},
 "ocr_2026":{"sha256":"973323350377319d1e737d7b476ab90d18f754bd9d2505521c66b97524a22498",
  "bytes":208043,"git":"ee5086ddd4390e228a4f424505968faff91e2efb",
  "url":"https://www.govinfo.gov/content/pkg/FR-2026-06-30/pdf/2026-13142.pdf",
  "fr":"91 FR 39626-39627","pub":"2026-06-30","approved":"2026-05-14","effective":"2026-06-28"}
}
def fail(x):raise ValueError("INC-15C.6F OCR original custody rejected: "+x)
def check(x,msg):
 if not x:fail(msg)
def gitblob(raw):return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
def path(key):return "originals/"+key+"/sha256/"+ED[key]["sha256"]+".pdf"
def load(root=ROOT):
 return (json.loads((root/"receipts/git-custody.json").read_text()),
  json.loads((root/"receipts/capture-receipt.json").read_text()),
  {k:(root/path(k)).read_bytes() for k in ED})
def verify(c,cap,originals):
 root_keys={"contract","acquisition_workflow_run","acquisition_artifact_id","originals",
 "two_independent_official_source_originals_git_retained",
 "source_notice_2026_OCR_internal_organization_effective",
 "source_notice_establishes_entire_HHS_roster","FY2026_ASE_or_FY2027_ASCRA_implemented_by_notice",
 "signed_case_specific_OCR_delegates_inferred","independent_external_WORM_custody_verified",
 "HHS_2026_legal_first_level_denominator","canonical_institution_ids_added"}
 check(type(c) is dict and set(c)==root_keys and c["contract"]=="inc15c6f_GovInfo_original_2023_2026_git_custody_v1"
  and c["acquisition_workflow_run"]==39786687439 and c["acquisition_artifact_id"]==12429386599
  and c["two_independent_official_source_originals_git_retained"] is True
  and c["source_notice_2026_OCR_internal_organization_effective"] is True
  and c["source_notice_establishes_entire_HHS_roster"] is False
  and c["FY2026_ASE_or_FY2027_ASCRA_implemented_by_notice"] is False
  and c["signed_case_specific_OCR_delegates_inferred"] is False
  and c["independent_external_WORM_custody_verified"] is False
  and c["HHS_2026_legal_first_level_denominator"] is None
  and c["canonical_institution_ids_added"]==0,
  "canonical HHS or unsupported organizational authority falsely promoted")
 check(type(c["originals"]) is list and len(c["originals"])==2 and
  type(cap) is dict and set(cap)=={"contract_version","source_probes","same_edition_or_bytes_asserted",
  "federal_legal_roster_complete","legal_first_level_denominator","independent_worm_qualification"}
  and cap["contract_version"]=="inc15c6f_OCR_original_GovInfo_source_probe_v1"
  and cap["same_edition_or_bytes_asserted"] is False
  and cap["federal_legal_roster_complete"] is False
  and cap["legal_first_level_denominator"] is None and cap["independent_worm_qualification"] is False
  and type(cap["source_probes"]) is list and len(cap["source_probes"])==2
  and set(originals)==set(ED),"different prior/current official source cohort")
 for i,(k,expected) in enumerate(ED.items()):
  o=c["originals"][i];receipt=cap["source_probes"][i];raw=originals[k]
  fields={"source_key","official_govinfo_url","sha256","bytes","git_blob_sha1",
  "path","fr_pages","publication_date","secretary_approval_date","organization_effective_date","pdf_pages"}
  check(type(o) is dict and set(o)==fields and
    o["source_key"]==k and o["official_govinfo_url"]==expected["url"]
    and o["sha256"]==expected["sha256"] and o["bytes"]==expected["bytes"]
    and o["git_blob_sha1"]==expected["git"] and o["path"]=="evidence/hhs-ocr-org-2023-2026/"+path(k)
    and o["fr_pages"]==expected["fr"] and o["publication_date"]==expected["pub"]
    and o["secretary_approval_date"]==expected["approved"]
    and o["organization_effective_date"]==expected["effective"] and o["pdf_pages"]==2,
    "Git-original notice version or effective date tampered: "+k)
  check(type(raw) is bytes and len(raw)==expected["bytes"] and
    hashlib.sha256(raw).hexdigest()==expected["sha256"] and gitblob(raw)==expected["git"]
    and raw.startswith(b"%PDF-1.") and b"%%EOF" in raw[-4096:],
    "publisher original PDF bytes modified: "+k)
  check(receipt["record_type"]=="inc15c6f_OCR_original_GovInfo_source_probe_v1"
    and receipt["key"]==k and
    receipt["source_id"]==("INC15C6F-OCR-2023-ORGANIZATION" if k=="ocr_2023" else "INC15C6F-OCR-2026-ORGANIZATION")
    and receipt["source_edition_attribution"]==(
      "88_FR_12954_2023-03-01_effective_2023-02-25" if k=="ocr_2023"
      else "91_FR_39626-39627_2026-06-30_effective_2026-06-28")
    and receipt["result"]=="transient_original_captured" and
    receipt["requested_official_url"]==expected["url"]
    and receipt["final_url"]==expected["url"]
    and receipt["original_relative_path"]==path(k)
    and receipt["retrieval_tier"]=="github_runner_artifact_only"
    and receipt["source_directory_edition_fully_extracted"] is False and
    receipt["original_sha256"]==expected["sha256"] and
    receipt["original_byte_count"]==expected["bytes"] and
    receipt["git_original_custody_verified"] is False and
    receipt["independent_worm_custody_verified"] is False and
    receipt["current_hhs_first_level_legal_denominator"] is None and
    receipt["department_command_or_adjudicative_authority_certified"] is False and
    receipt["independent_legal_review_complete"] is False and
    receipt["cross_edition_population_addition_authorized"] is False,
    "acquisition falsely granted signed department legal authority: "+k)
 return {"retained_original_notice_editions":2,"OCR_notice_effective_date":"2026-06-28",
  "previous_notice_effective_date":"2023-02-25","current_HHS_first_level_denominator":None,
  "ASE_ASCRA_implemented_verified":False,"new_canonical_institution_ids":0}
if __name__=="__main__":
 try:print(json.dumps(verify(*load()),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
