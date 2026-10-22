#!/usr/bin/env python3
"""Commit approved GovInfo OCR 2023/2026 source-original PDFs with exact edition isolation."""
from __future__ import annotations
import hashlib,importlib.util,json,subprocess,sys,tempfile
from pathlib import Path
from zipfile import ZipFile

BASE=Path(__file__).resolve().parents[1]
DEST="evidence/hhs-ocr-org-2023-2026"
RUN=39786687439
ARTIFACT=12429386599
SOURCES={
 "ocr_2023":{
  "sha256":"7035eea1497113c5964fce2f6d3862b31c5452e34a0b80b1ee572bb50610cfad",
  "bytes":195496,"git_blob_sha1":"26debd0afc20c528a022702d1a3b5a604b6966ed",
  "fr":"88 FR 12954-12955","publication_date":"2023-03-01",
  "approved":"2023-02-10","effective":"2023-02-25",
  "markers":("February 10, 2023","February 25, 2023","Office of the Director (AT)",
   "Policy Division (ATB)","Strategic Planning Division (ATE)","2023–03892")
 },
 "ocr_2026":{
  "sha256":"973323350377319d1e737d7b476ab90d18f754bd9d2505521c66b97524a22498",
  "bytes":208043,"git_blob_sha1":"ee5086ddd4390e228a4f424505968faff91e2efb",
  "fr":"91 FR 39626-39627","publication_date":"2026-06-30",
  "approved":"2026-05-14","effective":"2026-06-28",
  "markers":("May 14, 2026","June 28, 2026","Immediate Office of the Director (AT)",
   "Civil Rights Division (ATB)","Conscience and Religious Freedom Division (ATE)",
   "Pending further delegations","2026–13142")
 }
}
def key_path(k):return "originals/"+k+"/sha256/"+SOURCES[k]["sha256"]+".pdf"
def gitblob(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def approved_archive(path):
 expected={"capture-receipt.json",*(key_path(k) for k in SOURCES)}
 with ZipFile(path) as z:
  info=[x for x in z.infolist() if not x.is_dir()]
  if len(info)!=3 or set(x.filename for x in info)!=expected:raise ValueError("unexpected artifact originals or zip members")
  if any(x.file_size>35000000 or x.filename.startswith("/") or ".." in Path(x.filename).parts for x in info):
   raise ValueError("unsafe source artifact member")
  receipt=z.read("capture-receipt.json")
  raws={k:z.read(key_path(k)) for k in SOURCES}
 with tempfile.TemporaryDirectory() as d:
  dest=Path(d);(dest/"capture-receipt.json").write_bytes(receipt)
  for k,b in raws.items():
   f=dest/key_path(k);f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
  spec=importlib.util.spec_from_file_location("inc15c6f_acquire",BASE/"scripts/inc15c6f-ocr-source-acquire.py")
  src=importlib.util.module_from_spec(spec);spec.loader.exec_module(src)
  res=src.verify(dest)
  if res["verified"] is not True or set(res["sources"])!=set(SOURCES):
   raise ValueError("independent source acquisition receipt failed")
 capture=json.loads(receipt)
 if capture["legal_first_level_denominator"] is not None or capture["same_edition_or_bytes_asserted"] is not False:
  raise ValueError("source epochs promoted into federal legal census")
 for x,(k,edition) in zip(capture["source_probes"],SOURCES.items()):
  b=raws[k];sz=len(b)
  if (x["key"]!=k or x["result"]!="transient_original_captured" or
      x["original_sha256"]!=edition["sha256"] or x["original_byte_count"]!=edition["bytes"] or
      hashlib.sha256(b).hexdigest()!=edition["sha256"] or sz!=edition["bytes"] or
      gitblob(b)!=edition["git_blob_sha1"]):raise ValueError("signed official source original mismatch: "+k)
  with tempfile.TemporaryDirectory() as d:
   f=Path(d)/"official.pdf";f.write_bytes(b)
   meta=subprocess.check_output(["pdfinfo",str(f)],text=True)
   count=next((int(v.split(":",1)[1].strip()) for v in meta.splitlines() if v.startswith("Pages:")),None)
   if count!=2:raise ValueError("unexpected GovInfo original PDF page count: "+k)
   text=" ".join(subprocess.check_output(["pdftotext","-raw",str(f),"-"],text=True).split())
   if not all(t in text for t in edition["markers"]):
    raise ValueError("GovInfo original lacks required edition, effective-date or section identity: "+k)
 return receipt,raws

def promote(zip_path):
 capture,originals=approved_archive(zip_path)
 root=BASE/DEST
 for k,b in originals.items():
  f=root/key_path(k);f.parent.mkdir(parents=True,exist_ok=True)
  if f.exists() and f.read_bytes()!=b:raise ValueError("Git original existing path collision")
  f.write_bytes(b)
 receipts=root/"receipts";receipts.mkdir(parents=True,exist_ok=True)
 acq=receipts/"capture-receipt.json"
 if acq.exists() and acq.read_bytes()!=capture:raise ValueError("immutable acquisition receipt overwritten")
 acq.write_bytes(capture)
 manifest={
  "contract":"inc15c6f_GovInfo_original_2023_2026_git_custody_v1",
  "acquisition_workflow_run":RUN,"acquisition_artifact_id":ARTIFACT,
  "originals":[{"source_key":k,"official_govinfo_url":(
   "https://www.govinfo.gov/content/pkg/FR-"+v["publication_date"]+"/pdf/"+("2023-03892" if k=="ocr_2023" else "2026-13142")+".pdf"),
   "sha256":v["sha256"],"bytes":v["bytes"],"git_blob_sha1":v["git_blob_sha1"],
   "path":DEST+"/"+key_path(k),"fr_pages":v["fr"],"publication_date":v["publication_date"],
   "secretary_approval_date":v["approved"],"organization_effective_date":v["effective"],
   "pdf_pages":2} for k,v in SOURCES.items()],
  "two_independent_official_source_originals_git_retained":True,
  "source_notice_2026_OCR_internal_organization_effective":True,
  "source_notice_establishes_entire_HHS_roster":False,
  "FY2026_ASE_or_FY2027_ASCRA_implemented_by_notice":False,
  "signed_case_specific_OCR_delegates_inferred":False,
  "independent_external_WORM_custody_verified":False,
  "HHS_2026_legal_first_level_denominator":None,
  "canonical_institution_ids_added":0
 }
 p=receipts/"git-custody.json";content=json.dumps(manifest,indent=2)+"\n"
 if p.exists() and p.read_text()!=content:raise ValueError("immutable Git receipt overwritten")
 p.write_text(content)
 return manifest
if __name__=="__main__":
 if len(sys.argv)!=2:sys.exit("Usage: inc15c6f-promote-ocr-originals.py ABSOLUTE_ZIP")
 print(json.dumps(promote(Path(sys.argv[1])),indent=2))
