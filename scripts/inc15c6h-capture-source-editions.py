#!/usr/bin/env python3
"""INC-15C.6H: source-original preservation and fail-closed provenance.

Bounded to archival, *not* certification of general counsel power.
The 1997 PDF is the complete official Federal Register ISSUE, not a
source-specific article; only FR 30859--30865 / FR Doc 97-14611 is modeled.
"""
from __future__ import annotations
import hashlib, html, json, re, subprocess, sys, tempfile, urllib.request
from pathlib import Path
from urllib.error import URLError, HTTPError

REPO=Path(__file__).resolve().parents[1]
ROOT=REPO/"evidence/hhs-counsel-source-editions"
CONTRACT="inc15c6h_hhs_counsel_publisher_source_custody_v1"
SOURCES={
 "fda_rule_2026":{
   "url":"https://www.govinfo.gov/content/pkg/FR-2026-06-15/pdf/2026-11998.pdf",
   "type":"pdf","pages":3,"max_bytes":16000000,
   "marks":["Amendment and Revocation of Organizational Information","June 15, 2026","5.1105","5.1110","Staff Manual Guides"],
   "publisher_edition":"FR Doc 2026-11998; 91 FR 35884-35886","publication":"2026-06-15",
   "effective":"2026-06-15","scope":"FDA revision/removal of published organizational CFR sections",
 },
 "cfr_2025_21_5":{
   "url":"https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol1/pdf/CFR-2025-title21-vol1-part5.pdf",
   "type":"pdf","pages":13,"max_bytes":16000000,
   "marks":["5.1105","Chief Counsel","White Oak","General Counsel of the Department of Health and Human Services"],
   "publisher_edition":"2025 Title 21 Volume 1 Part 5, April 1 2025 edition","publication":"2025-04-01",
   "effective":None,"scope":"historical CFR 5.1105, including an editorial footnote on OCC affiliation",
 },
 "oig_fr_1997_issue":{
   "url":"https://www.govinfo.gov/content/pkg/FR-1997-06-05/pdf/FR-1997-06-05.pdf",
   "type":"pdf","pages":251,"max_bytes":65000000,
   "marks":["Office of Counsel to the Inspector General","consolidation of the Inspector General Division",
           "97-14611","30859","30865"],
   "publisher_edition":"1997-06-05 full Federal Register issue, 62 FR 30739-30978",
   "publication":"1997-06-05","effective":None,
   "scope":"specific HHS OIG FR Doc 97-14611 occupies printed 30859-30865; unrelated issue contents excluded",
 },
 "eo_14215_2025":{
   "url":"https://www.govinfo.gov/content/pkg/DCPD-202500277/html/DCPD-202500277.htm",
   "type":"html","max_bytes":1000000,
   "marks":["Executive Order 14215","February 18, 2025",
            "Rules of Conduct Guiding Federal Employees","Nothing in this order shall be construed"],
   "publisher_edition":"DCPD-202500277 official presidential-document edition",
   "publication":"2025-02-18","effective":None,
   "scope":"presidential order and express applicable-law constraints; not HHS signed delegation",
 },
 "fda_chart_2026":{
   "url":"https://www.fda.gov/about-fda/fda-organization-charts/fda-overview-organization-chart-text-version",
   "type":"html","max_bytes":2500000,
   "marks":["October 13, 2026","Office of the Chief Counsel","General Counsel of HHS","advises the Commissioner"],
   "publisher_edition":"FDA overview organization chart text version, printed October 13 2026",
   "publication":"2026-10-13","effective":None,
   "scope":"FDA publisher-observed HHS General Counsel reporting; not certified law or signed personnel instrument",
 }
}
PINNED_APPROVED_SOURCE_ORIGINALS={
  "cfr_2025_21_5": [
    "d821dcb01c90f90d4d6d543c777124175908fdb8b04ffd4fecb7af1814a4d245",
    228136,
    "b5512e303e9d0c70be97db1bb95f2b73f1ac0b04"
  ],
  "eo_14215_2025": [
    "1399f0857b1e4fe2b4c7fa9c3bb2fde0ee199ea372c47cdf4f3fecddc2994593",
    15803,
    "ff90402008c83e9f657fe478320c2f800eaa3f7e"
  ],
  "fda_chart_2026": [
    "181fd936025d6c739c45dbd329366efcc7695f55d8e160e38c4c403d43793e32",
    31184,
    "a15cc5de4fdd8e1a25c84c86d157a2b408a212ee"
  ],
  "fda_rule_2026": [
    "70df495934558185f9d19b3e83f13882dc0351f25cc225ab1e2d85fb3adc2310",
    251677,
    "cf8ee41b129b6419f4da43a9d20d6faa7b6081ac"
  ],
  "oig_fr_1997_issue": [
    "75d648c24c18802812128e2708fe29340458b274d522d8e97ef38129bac1fe0d",
    2124538,
    "5c470e91de64d390dc631c541337123df244eb10"
  ]
}

class SourceError(ValueError):pass
def require(cond,msg):
 if not cond:raise SourceError(msg)
def sha256(b):return hashlib.sha256(b).hexdigest()
def gitblob(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()
def raw_relpath(key,digest):
 return "originals/"+key+"/sha256/"+digest+("."+"pdf" if SOURCES[key]["type"]=="pdf" else ".html")
def norm(s):
 return " ".join(html.unescape(s).replace("\u2013","-").replace("\u2014","-").replace("\xad","").split())
def extract(raw,key):
 conf=SOURCES[key]
 if conf["type"]=="pdf":
  require(raw.startswith(b"%PDF-") and b"%%EOF" in raw[-4096:],"PDF signature/EOF invalid: "+key)
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/"official.pdf";p.write_bytes(raw)
   meta=subprocess.check_output(["pdfinfo",str(p)],text=True,timeout=45)
   mt=re.search(r"^Pages:\s+(\d+)",meta,re.M)
   require(mt is not None and int(mt.group(1))==conf["pages"],"official source pages wrong: "+key)
   text=subprocess.check_output(["pdftotext","-raw",str(p),"-"],text=True,timeout=90)
 else:
  txt=raw.decode("utf-8")
  text=re.sub(r"(?is)<(script|style)\b[^>]*>.*?</\1>"," ",txt)
  text=re.sub(r"<[^>]+>"," ",text)
 words=norm(text)
 for mark in conf["marks"]:
  require(norm(mark).lower() in words.lower(),"missing source clause "+repr(mark)+" in "+key)
 return text
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  raise SourceError("unexpected redirect: "+newurl)
def acquire_url(url,expected_type,max_bytes):
 opener=urllib.request.build_opener(NoRedirect())
 req=urllib.request.Request(url,headers={"User-Agent":"ARFI-source-preservation/1.0","Accept":"application/pdf" if expected_type=="pdf" else "text/html"})
 with opener.open(req,timeout=40) as response:
  require(response.status==200,"HTTP not 200")
  ct=response.headers.get("Content-Type","").lower()
  if expected_type=="pdf":require("pdf" in ct or ct=="application/octet-stream","non-PDF publisher response")
  else:require("html" in ct or ct.startswith("text/"),"non-HTML publisher response")
  data=response.read(max_bytes+1)
 require(1000<len(data)<=max_bytes,"publisher bytes missing or oversized")
 return data
def serialize(x):return json.dumps(x,indent=2,sort_keys=True,ensure_ascii=True)+"\n"
def record(key,b,text):
 spec=SOURCES[key]
 return {"key":key,"contract":CONTRACT,"official_url":spec["url"],
    "edition":spec["publisher_edition"],"published_date":spec["publication"],
    "distinct_effective_date":spec["effective"],"publisher_scope":spec["scope"],
    "original_status":"retained_original_Git_byte_addressed",
    "original_path":raw_relpath(key,sha256(b)),"original_sha256":sha256(b),
    "original_bytes":len(b),"original_git_blob_sha1":gitblob(b),
    "original_extract_sha256":sha256(text.encode("utf-8")),
    "original_type":spec["type"],"physical_pdf_pages":spec.get("pages"),
    "WORM_independently_verified":False,"canonical_agency_identity_added":False,
    "general_HHS_legal_authority_qualified":False,
    "whole_HHS_first_level_denominator":None}
def validate(receipts,root=ROOT):
 require(type(receipts) is dict and receipts.get("contract")==CONTRACT
         and set(receipts)=={"contract","originals","scope","no_canonical_id_added","HHS_first_level_legal_denominator","WORM_external_certified"},
         "source custody manifest contract")
 require(receipts["scope"]=="HHS OGC/OIG/FDA primary source-version reconciliation, nonadditive"
         and receipts["no_canonical_id_added"] is True
         and receipts["HHS_first_level_legal_denominator"] is None
         and receipts["WORM_external_certified"] is False
         and len(receipts["originals"])==len(SOURCES),"source coverage metadata misstates legal qualification")
 for key,spec in SOURCES.items():
  rec=receipts["originals"].get(key)
  require(type(rec) is dict and rec["key"]==key and rec["official_url"]==spec["url"],"missing official publisher receipt: "+key)
  digest=rec["original_sha256"]
  require(re.fullmatch(r"[a-f0-9]{64}",digest)!=None,"bad digest")
  approved=PINNED_APPROVED_SOURCE_ORIGINALS[key]
  require(rec["original_sha256"]==approved[0] and
          rec["original_bytes"]==approved[1] and
          rec["original_git_blob_sha1"]==approved[2],
          "reviewed source-original fingerprint changed: "+key)
  require(rec["original_path"]==raw_relpath(key,approved[0]),"exact source-original path changed")
  data=(root/rec["original_path"]).read_bytes()
  require(sha256(data)==approved[0] and len(data)==approved[1] and gitblob(data)==approved[2],
          "source original PDF or HTML bytes do not match approved independent fingerprints: "+key)
  txt=extract(data,key)
  require(rec==record(key,data,txt),"publisher original changed or fabricated rights: "+key)
 return {"validated":True,"publisher_source_originals":len(SOURCES),
         "1997_OIG_source_is_whole_issue_not_individual_granule":True,
         "removed_5_1105_effective":"2026-06-15",
         "OGC_notice_reference_date":"2026-09-29",
         "whole_HHS_legal_roster_denominator":None}
def acquire():
 receipts_dir=ROOT/"receipts"
 path=receipts_dir/"source-custody.json"
 if path.exists():return validate(json.loads(path.read_text()))
 entries={}
 for key,meta in SOURCES.items():
  raw=acquire_url(meta["url"],meta["type"],meta["max_bytes"])
  extracted=extract(raw,key)
  rel=raw_relpath(key,sha256(raw));destination=ROOT/rel
  destination.parent.mkdir(parents=True,exist_ok=True)
  if destination.exists() and destination.read_bytes()!=raw:raise SourceError("existing content-addressed collision")
  destination.write_bytes(raw)
  entries[key]=record(key,raw,extracted)
 receipts={"contract":CONTRACT,"originals":entries,
   "scope":"HHS OGC/OIG/FDA primary source-version reconciliation, nonadditive",
   "no_canonical_id_added":True,"HHS_first_level_legal_denominator":None,
   "WORM_external_certified":False}
 receipts_dir.mkdir(parents=True,exist_ok=True)
 path.write_text(serialize(receipts))
 return validate(receipts)
if __name__=="__main__":
 try:
  require(len(sys.argv)==2 and sys.argv[1] in ("acquire","verify"),"usage: acquire|verify")
  value=acquire() if sys.argv[1]=="acquire" else validate(json.loads((ROOT/"receipts/source-custody.json").read_text()))
  print(serialize(value))
 except Exception as ex:
  print("INC-15C.6H SOURCE REJECTED: "+str(ex),file=sys.stderr)
  sys.exit(1)
