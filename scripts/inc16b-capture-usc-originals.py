#!/usr/bin/env python3
"""INC-16B: capture *publisher-original HTTP entity bytes*, never derived legal text.

Capture must be executed in a networked, trusted environment; verify is offline.
Git retention is not external WORM certification or independent legal advice.
"""
import argparse
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
import pathlib
import re
import sys
import unicodedata
import urllib.request
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
EVIDENCE = pathlib.Path("evidence/inc16b-uscode")
RECEIPT = EVIDENCE / "source-custody.json"
RELEASE = "Public Law 119-120"
DATE = "October 7, 2026"
HOSTS = {"uscode.house.gov", "usc-cdn.house.gov"}
SOURCES = {
 "INC16A-SRC-USC-6-467": {
  "section": "6 U.S.C. 467(b)(2)-(3)",
  "urls": [
    "https://uscode.house.gov/us/usc/119-118/t6/s467/",
    "https://usc-cdn.house.gov/us/usc/119-118/t6/s467/",
    "https://uscode.house.gov/us/usc/119-120/t6/s467/"
  ],
  "must": [
    "467: Coordination with the Department of Health and Human Services",
    "During the period in which the Secretary of Health and Human Services",
    "the Department of Homeland Security, the Department of Justice",
    "all relevant agencies, including the Department of Homeland Security",
    "shall keep the Secretary of Health and Human Services and the Director of the Centers for Disease Control and Prevention"
  ]
 },
 "INC16A-SRC-USC-42-300HH": {
  "section": "42 U.S.C. 300hh(b)",
  "urls": [
    "https://uscode.house.gov/us/usc/119-120/t42/s300hh/",
    "https://usc-cdn.house.gov/us/usc/119-120/t42/s300hh/"
  ],
  "must": [
    "300hh: Public health and medical preparedness and response functions",
    "in collaboration with the Secretary of Veterans Affairs, the Secretary of Transportation",
    "the Secretary of Homeland Security",
    "shall establish an interagency agreement",
    "remain under the command and control of the Secretary of Defense"
  ]
 }
}

def ensure(condition, reason):
 if not condition: raise ValueError("INC-16B original source rejected: "+reason)

class Visible(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.parts=[];self.skip=0
 def handle_starttag(self, tag, attrs):
  if tag in ("script","style","noscript"):self.skip+=1
 def handle_endtag(self, tag):
  if tag in ("script","style","noscript"):self.skip=max(0,self.skip-1)
 def handle_data(self, data):
  if not self.skip:self.parts.append(data)

def normalized(original):
 ensure(2000<len(original)<1500000,"official page byte budget")
 ensure(b"<html" in original[:2000].lower(),"HTML publisher original required")
 parser=Visible()
 parser.feed(original.decode("utf-8",errors="strict"))
 text=unicodedata.normalize("NFKC"," ".join(parser.parts))
 return re.sub(r"\s+"," ",text).replace("\u2060","").strip()

def check_contents(key, original):
 txt=normalized(original)
 cfg=SOURCES[key]
 ensure(RELEASE in txt and DATE in txt,
        "expected immutable release point / law-through date absent from publisher HTML: "+key)
 for item in cfg["must"]:
  ensure(item in txt,"statutory clause / identity text absent: "+key+" / "+item)
 return len(txt)

def sha(data):
 return hashlib.sha256(data).hexdigest()

def blob_sha(data):
 return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\x00"+data).hexdigest()

class OfficialRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self, req, fp, code, msg, headers, newurl):
  u=urllib.parse.urlsplit(newurl)
  ensure(u.scheme=="https" and (u.hostname or "").lower() in HOSTS,"unauthorized redirect "+newurl)
  return super().redirect_request(req,fp,code,msg,headers,newurl)

def download(key):
 cfg=SOURCES[key]; errors=[]
 opener=urllib.request.build_opener(OfficialRedirect)
 for requested in cfg["urls"]:
  u=urllib.parse.urlsplit(requested)
  ensure(u.scheme=="https" and u.hostname in HOSTS,"untrusted source URL")
  try:
   req=urllib.request.Request(requested,headers={
    "User-Agent":"ARFI-Institute-Primary-Source-Custodian/1.0 (research source capture)",
    "Accept":"text/html,application/xhtml+xml;q=0.9","Accept-Encoding":"identity"})
   with opener.open(req,timeout=20) as response:
    final=response.geturl()
    parsed=urllib.parse.urlsplit(final)
    ensure(parsed.scheme=="https" and parsed.hostname in HOSTS,"off-host source response")
    ensure(response.status==200,"non-success HTTP")
    media=response.headers.get("Content-Type","").split(";")[0].lower()
    ensure(media in ("text/html","application/xhtml+xml"),"not official HTML")
    raw=response.read(1500001)
    check_contents(key,raw)
    return raw,requested,final,media,response.headers.get("ETag")
  except Exception as exc:
   errors.append(type(exc).__name__+":"+str(exc)[:170])
 raise RuntimeError("No qualifying official publisher response for "+key+": "+"; ".join(errors))

def capture():
 ensure(not (ROOT/RECEIPT).exists(),"capture is append-only and has already been completed")
 entries={}
 # Verify both first; never write partial official snapshots.
 downloads={}
 for key in SOURCES:downloads[key]=download(key)
 for key,(data,requested,final,media,etag) in downloads.items():
  digest=sha(data); p=EVIDENCE/"originals"/"sha256"/(digest+".html")
  dest=ROOT/p
  dest.parent.mkdir(parents=True,exist_ok=True)
  ensure(not dest.exists(),"existing original would be overwritten")
  dest.write_bytes(data)
  entries[key]={
   "section":SOURCES[key]["section"],
   "publisher":"Office of the Law Revision Counsel, U.S. House of Representatives",
   "requested_official_url":requested,"final_official_url":final,
   "original_repository_path":p.as_posix(),
   "original_sha256":digest,"original_bytes":len(data),"git_blob_sha1":blob_sha(data),
   "content_type":media,"http_etag":etag,
   "publisher_code_text_through":RELEASE,
   "publisher_code_text_through_date":DATE,
   "retrieved_at_utc":datetime.now(timezone.utc).isoformat(),
   "source_original_git_retained":True,
   "external_independent_WORM_verified":False,
   "legal_certification_completed":False,
   "operational_relationship_execution_verified":False
  }
 receipt={"model_family":"inc16b-official-uscode-originals",
    "model_version":"0.1.0","original_source_count":2,
    "records":entries,"publisher_release_point":RELEASE,
    "publisher_through_date":DATE,"not_external_worm_custody":True,
    "not_independent_legal_review":True,"website_atlas_admission":False}
 (ROOT/RECEIPT).parent.mkdir(parents=True,exist_ok=True)
 (ROOT/RECEIPT).write_text(json.dumps(receipt,indent=2,sort_keys=True)+"\n",encoding="utf-8")
 return verify()

def verify():
 obj=json.loads((ROOT/RECEIPT).read_text(encoding="utf-8"))
 ensure(obj["model_family"]=="inc16b-official-uscode-originals" and
   obj["original_source_count"]==2 and obj["model_version"]=="0.1.0" and
   obj["publisher_release_point"]==RELEASE and obj["publisher_through_date"]==DATE and
   obj["not_external_worm_custody"] is True and obj["not_independent_legal_review"] is True and
   obj["website_atlas_admission"] is False,"receipt status/count/release")
 ensure(set(obj["records"])==set(SOURCES),"missing/unknown first-party sources")
 for key,item in obj["records"].items():
  ensure(item["section"]==SOURCES[key]["section"] and
    item["publisher"]=="Office of the Law Revision Counsel, U.S. House of Representatives" and
    item["requested_official_url"] in SOURCES[key]["urls"] and
    item["publisher_code_text_through"]==RELEASE and
    item["publisher_code_text_through_date"]==DATE and
    item["source_original_git_retained"] is True and
    item["external_independent_WORM_verified"] is False and
    item["legal_certification_completed"] is False and
    item["operational_relationship_execution_verified"] is False,"false legal/source certification: "+key)
  source_path=item["original_repository_path"]
  ensure(re.fullmatch(r"evidence/inc16b-uscode/originals/sha256/[a-f0-9]{64}\.html",source_path),
         "unsafe original path "+key)
  raw=(ROOT/source_path).read_bytes()
  ensure(item["original_sha256"]==sha(raw) and
    pathlib.PurePosixPath(source_path).name==sha(raw)+".html" and
    item["original_bytes"]==len(raw) and
    item["git_blob_sha1"]==blob_sha(raw),"altered original bytes/hash/blob: "+key)
  ensure(urllib.parse.urlsplit(item["final_official_url"]).hostname in HOSTS and
    item["content_type"] in ("text/html","application/xhtml+xml"),
    "publisher URL/content type provenance "+key)
  check_contents(key,raw)
 return {"verified_publisher_originals":2,
   "release_point":RELEASE,"currentness_through_date":DATE,
   "independent_worm_verified":False,"legal_certification_completed":False}

if __name__=="__main__":
 parser=argparse.ArgumentParser()
 parser.add_argument("mode",choices=["capture","verify"])
 args=parser.parse_args()
 try:print(json.dumps(capture() if args.mode=="capture" else verify(),indent=2))
 except Exception as exc:print(str(exc),file=sys.stderr);sys.exit(1)
