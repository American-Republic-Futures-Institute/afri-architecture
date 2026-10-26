#!/usr/bin/env python3
"""INC-17B.2A: acquire six official, edition-scoped statutory HTML originals.

Networked capture is append-only and scoped to an isolated first-party feature
branch. Offline replay never contacts an external source. This captures legal
publication text, NOT legal-effect certification or a current organizational
chart, signed delegation, military command or public Atlas admission.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = Path("evidence/inc17b2a-statutory-originals")
RECEIPT = DIRECTORY / "source-custody.json"
MAX_BYTES = 2_500_000
OFFICIAL_HOSTS = {"www.govinfo.gov", "govinfo.gov", "uscode.house.gov", "usc-cdn.house.gov"}
SOURCES = {
 "INC17B2A-SRC-STATE-2651A": {
  "department": "ORG-FED-EXE-DEP-STATE", "citation": "22 U.S.C. 2651a",
  "edition": "USCODE-2024-title22",
  "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title22/html/USCODE-2024-title22-chap38-sec2651a.htm",
  "section_marker": "2651a. Organization of Department of State",
  "must": ["United States Code, 2024 Edition",
           "Department of State shall be administered",
           "supervision and direction of the Secretary of State",
           "There is in the Department of State the Bureau of Consular Affairs",
           "which shall be headed by the Assistant Secretary of State for Consular Affairs"]
 },
 "INC17B2A-SRC-USDA-2202": {
  "department": "ORG-FED-EXE-DEP-AGRICULTURE", "citation": "7 U.S.C. 2202",
  "edition": "USCODE-2023-title7",
  "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title7/html/USCODE-2023-title7-chap55-sec2202.htm",
  "section_marker": "2202. Executive Department; Secretary",
  "must": ["United States Code, 2023 Edition",
           "The Department of Agriculture shall be an executive department",
           "under the supervision and control of a Secretary of Agriculture"]
 },
 "INC17B2A-SRC-HUD-3532": {
  "department": "ORG-FED-EXE-DEP-HUD", "citation": "42 U.S.C. 3532",
  "edition": "OLRC-through-PL-119-120",
  "url": "https://uscode.house.gov/us/usc/119-120/t42/s3532/",
  "section_marker": "3532: Establishment of Department",
  "must": ["Public Law 119-120", "October 7, 2026",
           "There is hereby established at the seat of government an executive department",
           "There shall be at the head of the Department a Secretary of Housing and Urban Development",
           "The Department shall be administered under the supervision and direction of the Secretary"]
 },
 "INC17B2A-SRC-VA-301": {
  "department": "ORG-FED-EXE-DEP-VA", "citation": "38 U.S.C. 301",
  "edition": "USCODE-2024-title38",
  "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title38/html/USCODE-2024-title38-partI-chap3-sec301.htm",
  "section_marker": "301. Department",
  "must": ["United States Code, 2024 Edition", "The Department is composed of the following",
           "The Office of the Secretary", "The Veterans Health Administration",
           "The Veterans Benefits Administration", "The National Cemetery Administration",
           "The Board of Veterans' Appeals", "The Veterans' Canteen Service",
           "The Board of Contract Appeals"]
 },
 "INC17B2A-SRC-DHS-111": {
  "department": "ORG-FED-EXE-DEP-DHS", "citation": "6 U.S.C. 111",
  "edition": "USCODE-2024-title6",
  "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title6/html/USCODE-2024-title6-chap1-subchapI-sec111.htm",
  "section_marker": "111. Executive department; mission",
  "must": ["United States Code, 2024 Edition",
           "There is established a Department of Homeland Security",
           "except as specifically provided by law"]
 },
 "INC17B2A-SRC-DHS-112": {
  "department": "ORG-FED-EXE-DEP-DHS", "citation": "6 U.S.C. 112",
  "edition": "USCODE-2024-title6",
  "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title6/html/USCODE-2024-title6-chap1-subchapI-sec112.htm",
  "section_marker": "112. Secretary; functions",
  "must": ["United States Code, 2024 Edition",
           "There is a Secretary of Homeland Security",
           "The Secretary is the head of the Department and shall have direction, authority, and control over it",
           "except as otherwise provided by this chapter, may delegate"]
 }
}

def ensure(test, message):
 if not test: raise ValueError("INC-17B.2A statutory original rejected: " + message)

def sha256(data):
 return hashlib.sha256(data).hexdigest()

def blob_sha(data):
 return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\x00" + data).hexdigest()

class VisibleText(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.parts=[]
  self.skipping=0
 def handle_starttag(self,tag,attrs):
  if tag in ("script","style","noscript"): self.skipping+=1
 def handle_endtag(self,tag):
  if tag in ("script","style","noscript"): self.skipping=max(0,self.skipping-1)
 def handle_data(self,data):
  if not self.skipping:self.parts.append(data)

def text_for_original(key,original):
 ensure(isinstance(original,bytes) and 450<len(original)<MAX_BYTES, "invalid source body size: "+key)
 ensure(b"<html" in original[:5000].lower(), "must be original publisher HTML: "+key)
 parser=VisibleText()
 parser.feed(original.decode("utf-8",errors="strict"))
 text=unicodedata.normalize("NFKC"," ".join(parser.parts)).replace("\u2060","")
 text=re.sub(r"\s+"," ",text).strip()
 source=SOURCES[key]
 ensure(source["section_marker"] in text, "wrong statutory section header: "+key)
 for clause in source["must"]:
  ensure(clause in text, "missing edition or source clause "+key+": "+clause)
 # For GPO publisher, a fixed-year banner is mandatory. For OLRC, a named
 # Public Law cutoff is mandatory. Never claim a combined 2026-current source.
 ensure("Government Publishing Office" in text if source["edition"].startswith("USCODE-") else
        "Text contains those laws in effect through Public Law 119-120" in text,
        "publisher/snapshot identity not authenticated in text: "+key)
 return {"visible_text_characters":len(text),
         "required_source_anchors_count":len(source["must"]),
         "section_marker":source["section_marker"]}

class BoundedRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,request,fp,code,message,headers,newurl):
  u=urllib.parse.urlsplit(newurl)
  ensure(u.scheme=="https" and u.hostname in OFFICIAL_HOSTS,
         "publisher redirect off official hosts")
  return super().redirect_request(request,fp,code,message,headers,newurl)

def get_source(key):
 source=SOURCES[key]
 p=urllib.parse.urlsplit(source["url"])
 ensure(p.scheme=="https" and p.hostname in OFFICIAL_HOSTS,"untrusted official publisher URL")
 opener=urllib.request.build_opener(BoundedRedirect)
 request=urllib.request.Request(source["url"],headers={
  "User-Agent":"ARFI-INC17B2A-Official-Legal-Source-Custody/1.0",
  "Accept":"text/html,application/xhtml+xml;q=0.9",
  "Accept-Encoding":"identity"
 })
 with opener.open(request,timeout=40) as response:
  url=response.geturl()
  p=urllib.parse.urlsplit(url)
  media=response.headers.get("Content-Type","").split(";")[0].strip().lower()
  ensure(response.status==200 and p.scheme=="https" and p.hostname in OFFICIAL_HOSTS,
         "source not authenticated / HTTP 200: "+key)
  ensure(media in {"text/html","application/xhtml+xml"},
         "publisher did not supply source HTML: "+key)
  raw=response.read(MAX_BYTES+1)
  parsed=text_for_original(key,raw)
  metadata={"requested_official_url":source["url"],"final_official_url":url,
            "http_etag":response.headers.get("ETag"),
            "http_last_modified":response.headers.get("Last-Modified"),
            "content_type":media}
  return raw,parsed,metadata

def capture(root=ROOT):
 ensure(not (root/RECEIPT).exists(),"existing append-only receipt may not be overwritten")
 # Fetch and qualify ALL originals before any original bytes are written.
 fetched={key:get_source(key) for key in SOURCES}
 records={}
 stamp=datetime.now(timezone.utc).isoformat()
 for key,(raw,parsed,http) in fetched.items():
  digest=sha256(raw)
  dest=DIRECTORY/"originals"/"sha256"/(digest+".html")
  ensure(not (root/dest).exists(),"original hash path already exists")
  records[key]={
   "department_canonical_id":SOURCES[key]["department"],
   "statutory_citation":SOURCES[key]["citation"],
   "edition":SOURCES[key]["edition"],
   "source_original_sha256":digest,"source_original_git_blob_sha1":blob_sha(raw),
   "source_original_bytes":len(raw),"source_original_repository_path":dest.as_posix(),
   "publisher_original_html_verified":True,"publisher_claim_scope":"edition_specific_statutory_text_only",
   "publisher_text_markers":parsed,
   "acquired_at_utc":stamp,
   "source_verified_current_institutional_reporting_chain":False,
   "source_verified_actual_executed_delegation":False,
   "source_verified_current_all_agency_components":False,
   "independent_legal_review_complete":False,
   "external_WORM_custody_qualified":False,
   "atlas_public_admission":False,
   **http
  }
 for key,(raw,_,_) in fetched.items():
  p=root/records[key]["source_original_repository_path"]
  p.parent.mkdir(parents=True,exist_ok=True)
  p.write_bytes(raw)
 receipt={
  "model_version":"0.1.0",
  "model_family":"inc17b2a-bounded-official-statutory-originals",
  "source_count":len(SOURCES),
  "federal_department_count":5,
  "mixed_edition_sources_must_not_be_merged_as_one_current_law":True,
  "all_sources_are_original_publisher_HTTP_entity_bytes":True,
  "all_sources_pinned_by_sha256_and_git_blob":True,
  "all_independent_legal_reviews_pending":True,
  "new_legal_relationships_admitted":0,
  "new_atlas_public_admissions":0,
  "records":records
 }
 (root/RECEIPT).write_text(json.dumps(receipt,indent=2,sort_keys=True)+"\n",encoding="utf-8")
 return verify(root)

def verify(root=ROOT):
 obj=json.loads((root/RECEIPT).read_text(encoding="utf-8"))
 ensure(obj["model_version"]=="0.1.0" and obj["model_family"]=="inc17b2a-bounded-official-statutory-originals" and
  obj["source_count"]==6 and obj["federal_department_count"]==5 and
  obj["mixed_edition_sources_must_not_be_merged_as_one_current_law"] is True and
  obj["all_independent_legal_reviews_pending"] is True and
  obj["new_legal_relationships_admitted"]==0 and obj["new_atlas_public_admissions"]==0,
  "source receipt publication constraints")
 ensure(set(obj["records"])==set(SOURCES),"wrong source IDs/capture count")
 seen=set()
 for key,item in obj["records"].items():
  spec=SOURCES[key]
  ensure(item["department_canonical_id"]==spec["department"] and
   item["statutory_citation"]==spec["citation"] and item["edition"]==spec["edition"] and
   item["requested_official_url"]==spec["url"] and
   item["publisher_claim_scope"]=="edition_specific_statutory_text_only" and
   item["publisher_original_html_verified"] is True and
   item["independent_legal_review_complete"] is False and
   item["external_WORM_custody_qualified"] is False and
   item["source_verified_current_institutional_reporting_chain"] is False and
   item["source_verified_actual_executed_delegation"] is False and
   item["source_verified_current_all_agency_components"] is False and
   item["atlas_public_admission"] is False,
   "false publisher identity, legal review or operational certification "+key)
  p=urllib.parse.urlsplit(item["final_official_url"])
  ensure(p.scheme=="https" and p.hostname in OFFICIAL_HOSTS and
   item["content_type"] in {"text/html","application/xhtml+xml"},
   "unsafe final official publisher URL / MIME "+key)
  path=item["source_original_repository_path"]
  ensure(re.fullmatch(r"evidence/inc17b2a-statutory-originals/originals/sha256/[a-f0-9]{64}\.html",path),
   "original path outside append-only custody "+key)
  digest=Path(path).stem
  ensure(digest not in seen, "duplicate original hash between independent citations")
  seen.add(digest)
  raw=(root/path).read_bytes()
  ensure(sha256(raw)==item["source_original_sha256"]==digest and
   blob_sha(raw)==item["source_original_git_blob_sha1"] and
   len(raw)==item["source_original_bytes"],"mutated original bytes / receipt: "+key)
  ensure(item["publisher_text_markers"]==text_for_original(key,raw),
         "source marker or decoded publisher identity changed: "+key)
 return {"status":"originals_verified_not_independent_legal_review",
         "official_originals":len(SOURCES),
         "department_roots":5,
         "new_live_admissions":0}

if __name__=="__main__":
 parser=argparse.ArgumentParser()
 parser.add_argument("operation",choices=["capture","verify"])
 args=parser.parse_args()
 try:
  print(json.dumps(capture() if args.operation=="capture" else verify(),indent=2))
 except Exception as e:
  print(str(e),file=sys.stderr);sys.exit(1)
