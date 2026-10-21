#!/usr/bin/env python3
"""Promote ONLY pinned original HHS OIG 2025 HTML/PDF from reviewed source artifact.

The broader HHS chart remains HTTP 403; OIG source-specific custody does not certify
the legal completeness, reporting relationships, or current organization of HHS.
"""
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from zipfile import ZipFile

REPO=Path(__file__).resolve().parents[1]
ARTIFACT_ID=12378132516
RUN_ID=39668188500
HTML_SHA="97fd0513471e013ee8de2534f81184621c7babb7bf2f1d3181f935df275300a6"
PDF_SHA="068fa03980a4add3be412750ce63b0cc435c3d77f54a1153347b19e1200dc3ea"
HTML_BYTES=41739
PDF_BYTES=545208
EDITION="2025-12-23"
PREFIX="evidence/hhs-oig-2025"
SOURCE_NAMES={
  "hhs_oig_chart":f"originals/hhs_oig_chart/sha256/{HTML_SHA}.html",
  "hhs_oig_2025_pdf":f"originals/hhs_oig_2025_pdf/sha256/{PDF_SHA}.pdf",
}
OFFICE_LABELS=(
 "Immediate Office of Inspector General","Office of Audit Services",
 "Office of Evaluation and Inspections","Office of Management and Policy",
 "Office of Investigations","Office of Counsel to the Inspector General"
)
STATUS={
 "hhs_org_index":"blocked_no_original_bytes",
 "hhs_strategy_2024":"blocked_no_original_bytes",
 "hhs_oig_chart":"transient_original_captured",
 "hhs_oig_2025_pdf":"transient_original_captured",
 "hhs_dab_chart":"blocked_no_original_bytes",
 "hhs_omha_chart":"blocked_no_original_bytes",
 "hhs_aspr_chart":"blocked_no_original_bytes",
}
class OIGHeadings(HTMLParser):
 def __init__(self):
  super().__init__();self.inside=False;self.buf=[];self.headings=[]
 def handle_starttag(self,tag,attrs):
  if tag=="h2":self.inside=True;self.buf=[]
 def handle_endtag(self,tag):
  if tag=="h2" and self.inside:
   self.headings.append(" ".join("".join(self.buf).split()))
   self.inside=False
 def handle_data(self,data):
  if self.inside:self.buf.append(data)

def sha(data):return hashlib.sha256(data).hexdigest()
def assert_eq(actual,expected,label):
 if actual!=expected:raise ValueError(label+" mismatch")

def check_artifact(archive:Path):
 with ZipFile(archive) as z:
  members=[v for v in z.infolist() if not v.is_dir()]
  expected={"capture-receipt.json",*SOURCE_NAMES.values()}
  assert_eq({m.filename for m in members},expected,"ZIP exact member set")
  assert_eq(len(members),3,"ZIP unique member count")
  if any(m.file_size>35_000_000 or m.filename.startswith("/") or ".." in Path(m.filename).parts for m in members):
   raise ValueError("unsafe or oversize ZIP entry")
  receipt_bytes=z.read("capture-receipt.json")
  originals={k:z.read(v) for k,v in SOURCE_NAMES.items()}
 with tempfile.TemporaryDirectory(prefix="inc15c6_oig_") as tmp:
  root=Path(tmp)
  (root/"capture-receipt.json").write_bytes(receipt_bytes)
  for key,name in SOURCE_NAMES.items():
   dst=root/name;dst.parent.mkdir(parents=True,exist_ok=True)
   dst.write_bytes(originals[key])
  spec=importlib.util.spec_from_file_location("inc15c6_acquisition",REPO/"scripts/inc15c6-hhs-source-acquire.py")
  parser=importlib.util.module_from_spec(spec);spec.loader.exec_module(parser)
  verified=parser.verify(root)
  assert_eq(verified["verified"],True,"original acquisition source receipt")
 receipt=json.loads(receipt_bytes)
 assert_eq([v["key"] for v in receipt["source_probes"]],list(STATUS),"probe population/order")
 for row in receipt["source_probes"]:
  assert_eq(row["result"],STATUS[row["key"]],"exact source "+row["key"]+" status")
  if row["key"] in ("hhs_org_index","hhs_strategy_2024","hhs_dab_chart","hhs_omha_chart"):
   assert_eq(row["failure"],"HTTP_403",row["key"]+" blocked source")
  if row["key"]=="hhs_aspr_chart":
   assert_eq(row["failure"],"redirect outside exact HHS source path","ASPR rejected redirect")
  if row["key"] not in SOURCE_NAMES:
   assert_eq(row["original_sha256"],None,"blocked source original digest")
 expected_info=[("hhs_oig_chart",HTML_SHA,HTML_BYTES),("hhs_oig_2025_pdf",PDF_SHA,PDF_BYTES)]
 for key,digest,length in expected_info:
  source=next(x for x in receipt["source_probes"] if x["key"]==key)
  assert_eq(source["original_sha256"],digest,key+" digest")
  assert_eq(source["original_byte_count"],length,key+" source size")
  assert_eq(len(originals[key]),length,key+" actual bytes")
  assert_eq(sha(originals[key]),digest,key+" original sha256")
 headings=OIGHeadings();headings.feed(originals["hhs_oig_chart"].decode("utf-8"))
 for label in OFFICE_LABELS:
  assert_eq(headings.headings.count(label),1,"single OIG office heading "+label)
 if not originals["hhs_oig_2025_pdf"].startswith(b"%PDF-1.") or b"%%EOF" not in originals["hhs_oig_2025_pdf"][-4096:]:
  raise ValueError("PDF original signature changed")
 with tempfile.TemporaryDirectory(prefix="inc15c6_pdf_") as t:
  temp=Path(t)/"oig.pdf";temp.write_bytes(originals["hhs_oig_2025_pdf"])
  pages=subprocess.check_output(["pdfinfo",str(temp)],text=True)
  if "Pages:           1" not in pages or "Page size:       743.558 x 482.891 pts" not in pages:
   raise ValueError("OIG publisher PDF physical page grammar changed")
  lines=subprocess.check_output(["pdftotext","-layout",str(temp),"-"],text=True)
  for label in ("Inspector General","Principal Deputy Inspector General",
                "Deputy Inspector General","Chief Counsel to the",
                "As of December 23, 2025"):
   if label not in lines:raise ValueError("OIG source chart textual locator missing "+label)
 return receipt_bytes,originals,headings.headings

def promote(archive):
 receipt_bytes,originals,headings=check_artifact(archive)
 base=REPO/PREFIX
 for key,source_path in SOURCE_NAMES.items():
  dest=base/source_path
  dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists() and dest.read_bytes()!=originals[key]:
   raise ValueError("preexisting Git evidence would be overwritten: "+str(dest))
  dest.write_bytes(originals[key])
 receipts=base/"receipts";receipts.mkdir(parents=True,exist_ok=True)
 acquisition=receipts/"source-probe.json"
 if acquisition.exists() and acquisition.read_bytes()!=receipt_bytes:
  raise ValueError("preexisting source probe receipt cannot be replaced")
 acquisition.write_bytes(receipt_bytes)
 blob_sha={}
 for key,original in SOURCE_NAMES.items():
  raw=base/original
  blob_sha[key]=subprocess.check_output(["git","hash-object",str(raw)],text=True).strip()
 rec={
  "record_type":"inc15c6_hhs_oig_2025_git_custody",
  "source_acquisition_workflow_run":RUN_ID,
  "source_acquisition_artifact_id":ARTIFACT_ID,
  "oig_html_original_sha256":HTML_SHA,
  "oig_html_original_bytes":HTML_BYTES,
  "oig_html_git_blob_sha1":blob_sha["hhs_oig_chart"],
  "oig_html_repository_path":f"{PREFIX}/{SOURCE_NAMES['hhs_oig_chart']}",
  "oig_html_edition":"observed_at_capture_not_a_certified_2025_html_snapshot",
  "oig_pdf_original_sha256":PDF_SHA,
  "oig_pdf_original_bytes":PDF_BYTES,
  "oig_pdf_git_blob_sha1":blob_sha["hhs_oig_2025_pdf"],
  "oig_pdf_repository_path":f"{PREFIX}/{SOURCE_NAMES['hhs_oig_2025_pdf']}",
  "oig_pdf_as_of_date":"2025-12-23",
  "oig_pdf_physical_pages":1,
  "oig_html_source_office_headings":list(OFFICE_LABELS),
  "hhs_department_index_html_custodied":False,
  "hhs_dab_official_html_custodied":False,
  "hhs_omha_official_html_custodied":False,
  "hhs_strategy_2024_pdf_custodied":False,
  "aspr_pdf_original_custodied":False,
  "independent_worm_custody_verified":False,
  "independent_legal_review_complete":False,
  "complete_current_hhs_first_level_denominator":None,
  "inspector_general_subordination_or_signed_delegation_verified":False,
  "oig_legal_internal_organization_independently_certified":False
 }
 loc=receipts/"git-custody.json"
 text=json.dumps(rec,indent=2)+"\n"
 if loc.exists() and loc.read_text()!=text:
  raise ValueError("OIG source custody receipt not immutable")
 loc.write_text(text)
 return rec

if __name__=="__main__":
 if len(sys.argv)!=2:raise SystemExit("Usage: inc15c6-promote-oig-original.py /absolute/path/source-artifact.zip")
 result=promote(Path(sys.argv[1]))
 print(json.dumps(result,indent=2))
