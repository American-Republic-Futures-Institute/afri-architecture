#!/usr/bin/env python3
"""INC-17B.2B: one-time original-byte custody of seven OLRC law sections.

The explicit source-release point is 119-124 (Oct 15, 2026); the archived
2023/2024 and 119-120 sources remain immutable historical editions.
Directory observations are independently bounded and optional: a 403 is a
gap, NEVER permission to infer a contemporaneous organizational hierarchy.
"""
from __future__ import annotations
import argparse
from datetime import datetime,timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
FOLDER=Path("evidence/inc17b2b-olrc-119-124")
RECEIPT=FOLDER/"source-custody.json"
RELEASE="Public Law 119-124"
RELEASE_DATE="October 15, 2026"
HOSTS={"uscode.house.gov","usc-cdn.house.gov","fam.state.gov","department.va.gov",
       "www.nifa.usda.gov","nifa.usda.gov","www.hud.gov","hud.gov"}
SOURCES={
 "STATE-2651A":{"title":22,"section":"2651a","department":"STATE",
  "must":["2651a: Organization of Department of State",
          "Bureau of Consular Affairs",
          "Bureau of Diplomatic Technology","Bureau of Human Resources",
          "Bureau of Cyberspace and Digital Policy",
          "Pub. L. 119-60"]},
 "USDA-2202":{"title":7,"section":"2202","department":"AGRICULTURE",
  "must":["2202: Executive Department; Secretary",
          "The Department of Agriculture shall be an executive department",
          "supervision and control of a Secretary of Agriculture"]},
 "HUD-3532":{"title":42,"section":"3532","department":"HUD",
  "must":["3532: Establishment of Department",
          "There is hereby established at the seat of government an executive department",
          "a Secretary of Housing and Urban Development"]},
 "HUD-3533":{"title":42,"section":"3533","department":"HUD",
  "must":["3533: Officers of Department",
          "There shall be in the Department a Deputy Secretary",
          "Assistant Secretaries","General Counsel"]},
 "VA-301":{"title":38,"section":"301","department":"VA",
  "must":["301: Department",
          "The Department is composed of the following:",
          "The Veterans Health Administration",
          "The Veterans Benefits Administration",
          "The National Cemetery Administration",
          "The Board of Veterans", "The Board of Contract Appeals"]},
 "DHS-111":{"title":6,"section":"111","department":"DHS",
  "must":["111: Executive department; mission",
          "There is established a Department of Homeland Security",
          "primary mission of the Department"]},
 "DHS-112":{"title":6,"section":"112","department":"DHS",
  "must":["112: Secretary; functions",
          "There is a Secretary of Homeland Security",
          "The Secretary is the head of the Department and shall have direction, authority, and control over it",
          "may delegate any of the Secretary"]},
}
OPTIONAL={
 "STATE-FAM-MGMT-2024":{"url":"https://fam.state.gov/FAM/01FAM/01FAM0040.html",
  "department":"STATE","must":["1 FAM 044","Bureau of Consular Affairs","Under Secretary for Management"]},
 "USDA-NIFA-AGENCY-LIST":{"url":"https://www.nifa.usda.gov/about-nifa/who-we-are/relationship-usda",
  "department":"AGRICULTURE","must":["USDA Mission Area","Farm Service Agency","National Institute of Food and Agriculture"]},
 "HUD-PROGRAM-LIST":{"url":"https://www.hud.gov/hudprograms/",
  "department":"HUD","must":["Programs of HUD","Office of Housing","Community Planning and Development"]},
 "VA-ADMIN-OFFICES":{"url":"https://department.va.gov/administrations-and-offices/",
  "department":"VA","must":["Administrations and Offices","Veterans Health Administration",
                          "Veterans Benefits Administration","National Cemetery Administration"]},
}
MAX_BYTES=2_600_000
def ensure(ok,msg):
 if not ok:raise ValueError("INC-17B.2B publisher original rejected: "+msg)
def hashes(raw):
 return hashlib.sha256(raw).hexdigest(),hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
class Visible(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.parts=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in {"script","style","noscript"}:self.skip+=1
 def handle_endtag(self,tag):
  if tag in {"script","style","noscript"}:self.skip=max(0,self.skip-1)
 def handle_data(self,content):
  if not self.skip:self.parts.append(content)
def visible_text(raw):
 ensure(500<len(raw)<MAX_BYTES,"HTML byte budget or empty source")
 ensure(b"<html" in raw[:5000].lower(),"publisher original HTML required")
 p=Visible();p.feed(raw.decode("utf-8",errors="strict"))
 s=unicodedata.normalize("NFKC"," ".join(p.parts)).replace("\u2060","")
 return re.sub(r"\s+"," ",s).strip()
def section_body(text,section):
 match=re.search(r"§\s*"+re.escape(str(section))+r"\s*[.:]",text)
 ensure(match,"correct statutory section body missing "+str(section))
 body=text[match.end():]
 end=body.find("Editorial Notes")
 if end<0:end=body.find("Statutory Notes and Related Subsidiaries")
 ensure(end>60,"OLRC section-body ending not bounded "+str(section))
 return body[:end]
def verify_source(key,raw):
 cfg=SOURCES[key] if key in SOURCES else OPTIONAL[key]
 body=visible_text(raw)
 if key in SOURCES:
  ensure(RELEASE in body and RELEASE_DATE in body,"release-point mismatch "+key)
  target=section_body(body,cfg["section"])
  ensure(cfg["must"][0] in body,"correct section banner missing "+key)
  # Legal excerpts must be in codified body, not a future-oriented editorial note.
  for anchor in cfg["must"][1:]:
   if anchor.startswith("Pub. L."):ensure(anchor in body,"amendment history not cited "+key)
   else:ensure(anchor in target,"legal clause missing in current section body "+key+": "+anchor)
 else:
  for marker in cfg["must"]:
   ensure(marker in body,"agency directory content missing "+key+": "+marker)
 return {"visible_text_characters":len(body),"bounded_statutory_section_characters":
         len(section_body(body,cfg["section"])) if key in SOURCES else None,
         "verified_marker_count":len(cfg["must"])}
class HostRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,url):
  p=urllib.parse.urlsplit(url)
  ensure(p.scheme=="https" and p.hostname in HOSTS,"redirect outside approved official publisher hosts")
  return super().redirect_request(req,fp,code,msg,headers,url)
def download(url,key):
 p=urllib.parse.urlsplit(url)
 ensure(p.scheme=="https" and p.hostname in HOSTS,"not an approved official HTTPS publisher "+url)
 opener=urllib.request.build_opener(HostRedirect)
 req=urllib.request.Request(url,headers={
  "User-Agent":"ARFI-INC17B2B-Source-Custody/1.0 (original legal and agency-source study)",
  "Accept":"text/html,application/xhtml+xml;q=0.9","Accept-Encoding":"identity"})
 with opener.open(req,timeout=30) as res:
  final=res.geturl();p=urllib.parse.urlsplit(final)
  kind=res.headers.get("Content-Type","").split(";")[0].strip().lower()
  ensure(res.status==200 and p.scheme=="https" and p.hostname in HOSTS,
         "non-200 or nonofficial response "+key)
  ensure(kind in {"text/html","application/xhtml+xml"},"publisher must return HTML "+key)
  raw=res.read(MAX_BYTES+1)
  details=verify_source(key,raw)
  return raw,details,{"final_official_url":final,"content_type":kind,
            "http_etag":res.headers.get("ETag"),
            "http_last_modified":res.headers.get("Last-Modified")}
def source_url(k):
 p=SOURCES[k]
 return f"https://uscode.house.gov/us/usc/119-124/t{p['title']}/s{p['section']}/"
def captured(root=ROOT):
 ensure(not (root/RECEIPT).exists(),"existing immutable receipt; never overwrite originals")
 # Primary seven must succeed before writing anything. No weaker fallback edition.
 mandatory={k:download(source_url(k),k) for k in SOURCES}
 optional={};failed={}
 for k,c in OPTIONAL.items():
  try:optional[k]=download(c["url"],k)
  except Exception as exc:failed[k]={"reason_class":type(exc).__name__,
      "source_retrieval_or_content_qualification_failed":True,
      "not_proof_an_agency_or_office_is_absent":True,
      "official_source_url":c["url"]}
 records={};now=datetime.now(timezone.utc).isoformat()
 for k,(raw,details,http) in {**mandatory,**optional}.items():
  digest,git=hashes(raw)
  p=(FOLDER/"originals"/"sha256"/(digest+".html"))
  records[k]={
   "publisher":"Office of the Law Revision Counsel, U.S. House of Representatives" if k in SOURCES else "Official federal department or agency publisher",
   "source_kind":"federal_statutory_release_section" if k in SOURCES else "dated_department_directory_or_handbook_observation",
   "canonical_department_id":"ORG-FED-EXE-DEP-"+(SOURCES[k]["department"] if k in SOURCES else OPTIONAL[k]["department"]),
   "source_citation":f"{SOURCES[k]['title']} U.S.C. {SOURCES[k]['section']}" if k in SOURCES else None,
   "law_through_public_law":RELEASE if k in SOURCES else None,
   "law_through_date":RELEASE_DATE if k in SOURCES else None,
   "publisher_snapshot_as_observed_at_utc":now,
   "original_official_url":source_url(k) if k in SOURCES else OPTIONAL[k]["url"],
   "source_original_path":p.as_posix(),"source_original_sha256":digest,
   "source_git_blob_sha1":git,"source_original_bytes":len(raw),
   "publisher_text_qualification":details,
   "source_retrieval_qualified":True,
   "current_organizational_universe_complete":False,
   "independently_reviewed_legal_effect":False,
   "verified_current_executed_reporting_delegation_or_command":False,
   "external_independent_WORM_qualified":False,
   "atlas_admitted":False,**http
  }
 for k,(raw,_,_) in {**mandatory,**optional}.items():
  p=root/records[k]["source_original_path"]
  ensure(not p.exists(),"immutable original path already exists")
  p.parent.mkdir(parents=True,exist_ok=True)
  p.write_bytes(raw)
 receipt={
  "model_version":"0.1.0","model_family":"inc17b2b-official-olrc-law-through-and-agency-originals",
  "canonical_base_commit":"dd0e18b882b99b48d58b789979e377d02dd5b707",
  "legal_source_release":RELEASE,"legal_source_release_date":RELEASE_DATE,
  "source_explicit_citations":len(SOURCES),"independent_current_legal_review_complete":False,
  "no_auto_canonical_legal_identity_promotion":True,"public_atlas_admitted":False,
  "originals_count":len(records),"required_legal_originals":len(mandatory),
  "optional_directory_originals_qualified":len(optional),
  "optional_directory_gaps":len(failed),
  "records":records,"directory_unavailable":failed
 }
 (root/RECEIPT).write_text(json.dumps(receipt,indent=2,sort_keys=True)+"\n",encoding="utf-8")
 return verify(root)
def verify(root=ROOT):
 d=json.loads((root/RECEIPT).read_text(encoding="utf-8"))
 ensure(d["model_version"]=="0.1.0" and d["model_family"]=="inc17b2b-official-olrc-law-through-and-agency-originals"
        and d["canonical_base_commit"]=="dd0e18b882b99b48d58b789979e377d02dd5b707",
        "unrecognized source custody epoch")
 ensure(d["legal_source_release"]==RELEASE and d["legal_source_release_date"]==RELEASE_DATE and
        d["required_legal_originals"]==len(SOURCES) and d["source_explicit_citations"]==len(SOURCES) and
        d["originals_count"]==len(d["records"]) and
        d["optional_directory_originals_qualified"]+d["optional_directory_gaps"]==len(OPTIONAL) and
        d["independent_current_legal_review_complete"] is False and
        d["no_auto_canonical_legal_identity_promotion"] is True and d["public_atlas_admitted"] is False,
        "false legal/organizational authority or source census")
 ensure(set(SOURCES).issubset(d["records"]) and
        set(d["records"])|set(d["directory_unavailable"])==set(SOURCES)|set(OPTIONAL) and
        not set(d["records"]).intersection(d["directory_unavailable"]),
        "missing or overlapping source admission/gap")
 seen=set()
 for k,entry in d["records"].items():
  ensure(k in SOURCES or k in OPTIONAL,"unknown publisher source record")
  u=source_url(k) if k in SOURCES else OPTIONAL[k]["url"]
  ensure(entry["original_official_url"]==u and
         entry["canonical_department_id"]=="ORG-FED-EXE-DEP-"+(SOURCES[k]["department"] if k in SOURCES else OPTIONAL[k]["department"]) and
         entry["source_kind"]==("federal_statutory_release_section" if k in SOURCES else "dated_department_directory_or_handbook_observation"),
         "publisher path or source role changed "+k)
  ensure(entry["source_citation"]==(f"{SOURCES[k]['title']} U.S.C. {SOURCES[k]['section']}" if k in SOURCES else None)
         and entry["law_through_public_law"]==(RELEASE if k in SOURCES else None)
         and entry["law_through_date"]==(RELEASE_DATE if k in SOURCES else None),
         "mixed source editions incorrectly homogenized "+k)
  ensure(entry["source_retrieval_qualified"] is True and
         entry["current_organizational_universe_complete"] is False and
         entry["independently_reviewed_legal_effect"] is False and
         entry["verified_current_executed_reporting_delegation_or_command"] is False and
         entry["external_independent_WORM_qualified"] is False and
         entry["atlas_admitted"] is False,"false legal or WORM claim "+k)
  p=entry["source_original_path"]
  ensure(re.fullmatch(r"evidence/inc17b2b-olrc-119-124/originals/sha256/[0-9a-f]{64}\.html",p),
         "unsafe source path "+k)
  digest=Path(p).stem
  ensure(digest not in seen,"duplicate original between distinct publisher records")
  seen.add(digest)
  raw=(root/p).read_bytes()
  h,g=hashes(raw)
  ensure(h==digest==entry["source_original_sha256"] and
         g==entry["source_git_blob_sha1"] and len(raw)==entry["source_original_bytes"],
         "source original byte receipts no longer match "+k)
  ensure(entry["publisher_text_qualification"]==verify_source(k,raw),
         "required law-through or agency source details changed "+k)
  p2=urllib.parse.urlsplit(entry["final_official_url"])
  ensure(p2.scheme=="https" and p2.hostname in HOSTS and
         entry["content_type"] in {"text/html","application/xhtml+xml"},
         "unqualified final source URL or mime "+k)
 for k,item in d["directory_unavailable"].items():
  ensure(k in OPTIONAL and item["source_retrieval_or_content_qualification_failed"] is True and
         item["not_proof_an_agency_or_office_is_absent"] is True and
         item["official_source_url"]==OPTIONAL[k]["url"],"fabricated missingness "+k)
 return {"status":"publisher_origins_replayed_not_independent_current_legal_certification",
         "mandatory_statutes":len(SOURCES),"optional_directory_originals":d["optional_directory_originals_qualified"],
         "explicit_directory_gaps":d["optional_directory_gaps"],"new_atlas_admissions":0}
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("operation",choices=["capture","verify"])
 args=p.parse_args()
 try:print(json.dumps(captured() if args.operation=="capture" else verify(),indent=2))
 except Exception as exc:print(str(exc),file=sys.stderr);sys.exit(1)
