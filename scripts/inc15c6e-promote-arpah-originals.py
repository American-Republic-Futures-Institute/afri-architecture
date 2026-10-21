#!/usr/bin/env python3
"""Promote two exact observed ARPA-H HTML source originals, never HHS blocked PDFs."""
from __future__ import annotations
import hashlib,importlib.util,json,sys,tempfile
from pathlib import Path
from zipfile import ZipFile
ROOT=Path(__file__).resolve().parents[1]
DEST="evidence/hhs-arpah-2026-observation"
SOURCE_RUN=39694381413
ARTIFACT=12389997023
SOURCES={
 "arpah_people":("149e49bd3f1593b82027e7151414d907a6960cf03f22450ef6c4f9bcbfc20646",63246,"9602a7f609a623afd1f05c17ede6f6c907164416",("Our People","Mission Offices","Health Science Futures")),
 "arpah_timeline":("b30fa39c015976657905299a7aee3ee888dc3bfcaffde4f55e0431684e9bdcb3",56301,"d007f32fab4557f968e1145281001fe15af7c93a",("Our Story","October 20, 2025","September 25, 2025")),
}
PROBE_ORDER=("hhs_fy2026_gdm","hhs_fy2027_gdm","arpah_people","arpah_timeline","dab_overview","omha_chart")
def member(k):return "originals/"+k+"/sha256/"+SOURCES[k][0]+".html"
def sha(b):return hashlib.sha256(b).hexdigest()
def gitsha(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
def verify_zip(archive):
 with ZipFile(archive) as z:
  ms=[x for x in z.infolist() if not x.is_dir()]
  if len(ms)!=3 or set(x.filename for x in ms)!={"capture-receipt.json",*(member(k) for k in SOURCES)}:
   raise ValueError("unexpected archive member set; fail closed")
  if any(x.file_size>16000000 or x.filename.startswith("/") or ".." in Path(x.filename).parts for x in ms):
   raise ValueError("unsafe zip member")
  capture=z.read("capture-receipt.json");originals={k:z.read(member(k)) for k in SOURCES}
 with tempfile.TemporaryDirectory() as td:
  root=Path(td)
  (root/"capture-receipt.json").write_bytes(capture)
  for k,v in originals.items():
   f=root/member(k);f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(v)
  sp=importlib.util.spec_from_file_location("inc15c6e_acq",ROOT/"scripts/inc15c6e-hhs-source-acquire.py")
  mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
  result=mod.verify(root)
  if result["verified"] is not True:raise ValueError("original capture verification failed")
 a=json.loads(capture)
 if [x["key"] for x in a["source_probes"]]!=list(PROBE_ORDER) or a["same_edition_or_bytes_asserted"] is not False or a["legal_first_level_denominator"] is not None:
  raise ValueError("not exactly six source probe editions, or authority inflated")
 for rec in a["source_probes"]:
  k=rec["key"]
  if k in SOURCES:
   h,n,blob,markers=SOURCES[k];raw=originals[k]
   if rec["result"]!="transient_original_captured" or rec["original_sha256"]!=h or rec["original_byte_count"]!=n or len(raw)!=n or sha(raw)!=h or gitsha(raw)!=blob:
    raise ValueError("original HTML source hash/size/receipt changed: "+k)
   txt=raw.decode("utf-8")
   if not all(x in txt for x in markers):raise ValueError("missing observed HTML office/dated event")
  else:
   if rec["result"]!="blocked_no_original_bytes" or rec["failure"]!="HTTP_403" or rec["original_sha256"] is not None or rec["original_byte_count"] is not None:
    raise ValueError("blocked HHS official page or budget PDF falsely admitted: "+k)
 return capture,originals
def promote(archive):
 capture,originals=verify_zip(archive)
 root=ROOT/DEST
 for k,v in originals.items():
  f=root/member(k);f.parent.mkdir(parents=True,exist_ok=True)
  if f.exists() and f.read_bytes()!=v:raise ValueError("Git original source path collision")
  f.write_bytes(v)
 receipt=root/"receipts";receipt.mkdir(parents=True,exist_ok=True)
 cap=receipt/"capture-receipt.json"
 if cap.exists() and cap.read_bytes()!=capture:raise ValueError("acquisition record changed")
 cap.write_bytes(capture)
 record={
  "record_type":"inc15c6e_arpah_live_html_git_custody_v1",
  "source_probe_workflow_run":SOURCE_RUN,
  "source_probe_artifact_id":ARTIFACT,
  "originals":[{"source_key":k,"sha256":v[0],"bytes":v[1],"git_blob_sha1":v[2],
    "path":DEST+"/"+member(k),"source_edition":"retrieved_2026-10-21_not_verified_effective_edition"}
   for k,v in SOURCES.items()],
  "source_page_effective_date_independently_qualified":False,
  "hhs_fy2026_gdm_original_custodied":False,
  "hhs_fy2027_gdm_original_custodied":False,
  "dab_current_html_custodied":False,
  "omha_current_html_custodied":False,
  "personnel_page_proves_organizational_reorganization":False,
  "budget_proposal_is_implemented_reorganization":False,
  "independent_worm_custody_verified":False,
  "legal_first_level_hhs_denominator":None,
  "operational_reporting_or_adjudicative_authority_verified":False
 }
 manifest=receipt/"git-custody.json"
 val=json.dumps(record,indent=2)+"\n"
 if manifest.exists() and manifest.read_text()!=val:raise ValueError("Git custody record overwritten")
 manifest.write_text(val)
 return record
if __name__=="__main__":
 if len(sys.argv)!=2:sys.exit("Usage: python scripts/inc15c6e-promote-arpah-originals.py ABSOLUTE_ZIP")
 print(json.dumps(promote(Path(sys.argv[1])),indent=2))
