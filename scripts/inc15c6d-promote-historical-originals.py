#!/usr/bin/env python3
"""Promote five independently validated official historical HHS PDF source editions.

No source allows current legal first-level counting, ALJ authority certification,
or treating ARPA-H's planned 14-to-eight office change as implementation.
"""
from __future__ import annotations
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from zipfile import ZipFile

BASE=Path(__file__).resolve().parents[1]
REPO_PATH="evidence/hhs-dab-omha-arpah-historical"
ARTIFACT_ID=12389115569
ACQUISITION_RUN=39691326721
DOCS={
 "dab_2012_notice":("cefec870f1670f7bdaea68445a11b0be204fcd42466b2f3dd40ec63819e42369",156417,2,"Departmental Appeals Board","2012-03-02","32be8eb3589562afb90efe9f104ab63f499196e2"),
 "omha_2005_notice":("9fc58a57771e26b3d897203c6510bff9f33a11387f7de6b4e996b8600f6fbe42",148382,2,"Section AK.10","2005-06-23","ad8082c53c3564cebc83fcd0df09578b24138fba"),
 "omha_2015_notice":("a3b7d5a3a92c9768ee4820e4cb56251317691c54a0d596a55139cd7c73e8eb91",190638,1,"Office of Programs","2015-01-20","19a2b346e9e3213b1de127575d11e4889c9e4b6c"),
 "arpah_2022_notice":("57fc6ee11be04104e0bfd9a2d4a61aae867dc3d9cfae892256ce1bf42650b86a",215491,3,"Establishment of the Advanced Research","2022-05-27","9d6f908fb82edeb0159def6b37762a5ee73948f9"),
 "arpah_fy2025_cj":("1e325bfe20151762242c7f59a5df21f0113c8644f431aec5debb22f5671493d1",870264,51,"reduces the organization offices from 14 to 8","FY2025_budget_request_published_2024","2eed6072be324f47320f1878121d378936bf2ce0")
}
def original_path(key):return "originals/"+key+"/sha256/"+DOCS[key][0]+".pdf"
def verify_archive(archive:Path):
 expected={"capture-receipt.json",*(original_path(k) for k in DOCS)}
 with ZipFile(archive) as z:
  files=[x for x in z.infolist() if not x.is_dir()]
  if len(files)!=6 or set(x.filename for x in files)!=expected:
   raise ValueError("non-exclusive source ZIP members; reject source promotion")
  if any(x.file_size>35000000 or x.filename.startswith("/") or ".." in Path(x.filename).parts for x in files):
   raise ValueError("unsafe ZIP member size or path")
  capture=z.read("capture-receipt.json")
  original={k:z.read(original_path(k)) for k in DOCS}
 with tempfile.TemporaryDirectory(prefix="arfi_inc15c6d_") as d:
  root=Path(d);(root/"capture-receipt.json").write_bytes(capture)
  for k,v in original.items():
   p=root/original_path(k);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
  spec=importlib.util.spec_from_file_location("inc15c6d_source",BASE/"scripts/inc15c6d-hhs-source-acquire.py")
  mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
  verified=mod.verify(root)
  if verified["verified"] is not True or len(verified["sources"])!=5:
   raise ValueError("original-source acquisition receipt verifier rejected source collection")
 cap=json.loads(capture)
 if cap["same_edition_or_bytes_asserted"] is not False or cap["legal_first_level_denominator"] is not None:
  raise ValueError("source edition incorrectly converted to legal census")
 for row,k in zip(cap["source_probes"],DOCS):
  sha,n,pages,marker,date,blob=DOCS[k]
  raw=original[k]
  if row["key"]!=k or row["result"]!="transient_original_captured" or row["original_sha256"]!=sha or row["original_byte_count"]!=n:
   raise ValueError("source receipt changed: "+k)
  if len(raw)!=n or hashlib.sha256(raw).hexdigest()!=sha or not raw.startswith(b"%PDF-1."):
   raise ValueError("publisher original changed: "+k)
  with tempfile.TemporaryDirectory(prefix="arfi_pdf_inspect_") as d:
   source=Path(d)/"source.pdf";source.write_bytes(raw)
   meta=subprocess.check_output(["pdfinfo",str(source)],text=True)
   pagesline=next((line for line in meta.splitlines() if line.startswith("Pages:")),None)
   if pagesline is None or int(pagesline.split(":",1)[1].strip())!=pages:
    raise ValueError("historical publisher PDF page count changed: "+k)
   text=subprocess.check_output(["pdftotext","-layout",str(source),"-"],text=True)
   if marker.lower() not in " ".join(text.split()).lower():
    raise ValueError("historical document identity/qualification text missing: "+k)
   if k=="arpah_fy2025_cj":
    chart=subprocess.check_output(["pdftotext","-f","6","-l","6",str(source),"-"],text=True)
    if "Organization Chart" not in chart or "14 to 8" not in chart:
     raise ValueError("ARPA-H proposed reorganization chart wrong source page")
  git_blob=hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()
  if git_blob!=blob:raise ValueError("independent expected Git original blob mismatch: "+k)
 return capture,original

def promote(archive:Path):
 acquisition,original=verify_archive(archive)
 root=BASE/REPO_PATH
 for k,data in original.items():
  path=root/original_path(k);path.parent.mkdir(parents=True,exist_ok=True)
  if path.exists() and path.read_bytes()!=data:raise ValueError("source content collision in Git")
  path.write_bytes(data)
 receipts=root/"receipts";receipts.mkdir(parents=True,exist_ok=True)
 acquisition_path=receipts/"capture-receipt.json"
 if acquisition_path.exists() and acquisition_path.read_bytes()!=acquisition:raise ValueError("acquisition receipt mutable")
 acquisition_path.write_bytes(acquisition)
 records=[{"source_key":k,"original_sha256":d[0],"original_bytes":d[1],
           "physical_pdf_pages":d[2],"publisher_edition":d[4],
           "git_blob_sha1":d[5],"path":REPO_PATH+"/"+original_path(k),
           "source_scoped_only":True,"authority_certified":False}
          for k,d in DOCS.items()]
 receipt={
  "record_type":"inc15c6d_git_source_original_custody_v1",
  "source_probe_workflow_run":ACQUISITION_RUN,
  "source_probe_artifact_id":ARTIFACT_ID,
  "source_records":records,
  "all_five_originals_git_retained":True,
  "direct_hhs_current_organizational_html_retained":False,
  "independent_worm_qualification":False,
  "historical_source_notice_is_current_legal_status":False,
  "dab_adjudication_jurisdiction_current_certified":False,
  "omha_alj_case_control_current_certified":False,
  "arpah_2024_budget_eight_office_implementation_certified":False,
  "current_hhs_legal_first_level_denominator":None,
  "hhs_canonical_ids_replaced":0
 }
 text=json.dumps(receipt,indent=2)+"\n"
 p=receipts/"git-custody.json"
 if p.exists() and p.read_text()!=text:raise ValueError("immutable custody receipt changed")
 p.write_text(text)
 return receipt

if __name__=="__main__":
 if len(sys.argv)!=2:sys.exit("Usage: inc15c6d-promote-historical-originals.py ABSOLUTE_ZIP")
 print(json.dumps(promote(Path(sys.argv[1])),indent=2))
