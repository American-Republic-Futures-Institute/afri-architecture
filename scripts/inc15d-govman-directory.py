#!/usr/bin/env python3
"""INC-15D.2/3/4: replay a *publisher directory*, not legal institutional authority.
The original whole-edition XML and Git custody receipt are required. Python stdlib only.
"""
from __future__ import annotations
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[1]
PACKAGE = "GOVMAN-2025-12-31"
SHA = "c1e5b58cce0a018b4995f900584605d07e473079a37d5a665a3a8ebb5d643138"
BLOB = "195c46a67c87ae85f1dedd423250900f119a041a"
ORIGINAL = f"evidence/govman-2025/originals/sha256/{SHA}.xml"
LINKS = "model/federal/inc15d-govman-2025-curated-links.json"
X12 = "model/federal/x12-identities.json"
OUTPUTS = {
 "directory": "model/federal/inc15d-govman-2025-directory.json",
 "crosswalk": "model/federal/inc15d-govman-2025-crosswalk.json",
 "coverage": "model/federal/inc15d-govman-2025-coverage.json",
}
TAGS = ["Entity", "SubEntityLevelOne", "SubEntityLevelTwo", "SubEntityLevelThree"]
COUNTS = {"Entity": 105, "SubEntityLevelOne": 87, "SubEntityLevelTwo": 35,
          "SubEntityLevelThree": 4}
CATEGORY_BRANCH = {
 "Legislative Branch": "BR-FED-LEG",
 "Judicial Branch": "BR-FED-JUD",
 "Executive Branch: The President": "BR-FED-EXE",
 "Executive Branch: Departments": "BR-FED-EXE",
 "Executive Branch: Independent Agencies and Government Corporations": "BR-FED-EXE",
 "Quasi-Official Agencies": None,
 "International Organizations": None,
}
SCOPE = {
 "Legislative Branch":"legislative_publisher",
 "Judicial Branch":"judicial_publisher",
 "Executive Branch: The President":"president_publisher",
 "Executive Branch: Departments":"cabinet_publisher",
 "Executive Branch: Independent Agencies and Government Corporations":"independent_publisher",
 "Quasi-Official Agencies":"quasi_official_publisher_not_automatically_federal",
 "International Organizations":"external_international_not_us_federal",
}
def ensure(condition, reason):
 if not condition: raise ValueError("INC-15D directory rejected: " + reason)
def compact(s):
 return " ".join((s or "").split())
def get_json(root, path):
 return json.loads((root / path).read_text(encoding="utf-8"))
def sha(data):
 return hashlib.sha256(data).hexdigest()
def blob_sha(data):
 return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()
def strict_fields(obj, fields, label):
 ensure(type(obj) is dict and set(obj)==set(fields), label+" closed fields violated")
def source_tree(root):
 raw=(root/ORIGINAL).read_bytes()
 ensure(len(raw)==8138096 and sha(raw)==SHA and blob_sha(raw)==BLOB,
        "source byte length, original SHA-256 or Git blob")
 upper=raw.upper()
 ensure(b"<!DOCTYPE" not in upper and b"<!ENTITY" not in upper and
        b"<XI:INCLUDE" not in upper, "unsafe XML entity / DTD / XInclude")
 try: doc=ET.fromstring(raw)
 except ET.ParseError as exc: raise ValueError("INC-15D directory rejected: malformed XML") from exc
 ensure(doc.tag=="GovernmentManual" and len(list(doc))==105, "wrong XML root or publisher root entry count")
 return doc
def extract_nodes(doc):
 seen=set()
 results=[]
 def walk(e, expected_parent, expected_level, xpath):
  tag=e.tag
  ensure(tag==TAGS[expected_level], "unexpected edition-local XML entity level")
  entity_id=e.get("EntityId")
  order=e.get("SortOrder")
  parent=e.get("ParentId")
  ensure(entity_id is not None and re.fullmatch(r"[1-9][0-9]*", entity_id) and
         entity_id not in seen, "invalid, duplicate or missing publisher-local EntityId")
  ensure(order is not None and re.fullmatch(r"[1-9][0-9]*", order), "invalid publisher sort order")
  ensure(parent==str(expected_parent) if expected_parent is not None else parent=="0",
         "source parent disagrees with XML containment")
  seen.add(entity_id)
  name=compact(e.findtext("AgencyName"))
  category=compact(e.findtext("Category"))
  ensure(bool(name) and category in CATEGORY_BRANCH, "source name or publisher category unknown")
  kind=compact(e.findtext("EntityType"))
  ensure(kind==("Parent" if expected_level==0 else tag), "publisher XML type inconsistent")
  mission=e.find("MissionStatement")
  mission_text=compact(" ".join(mission.itertext())) if mission is not None else ""
  key=f"{PACKAGE}:{entity_id}"
  location=(xpath + f"/{tag}[@EntityId='{entity_id}']")
  results.append({
   "id":f"INC15D-OBS-{entity_id}",
   "source_entity_key":key, "source_entity_local_id":entity_id,
   "edition_local_only":True, "source_element_tag":tag,
   "published_kind":kind, "published_name":name,
   "published_category":category,"publisher_category_scope":SCOPE[category],
   "published_parent_key":f"{PACKAGE}:{parent}" if expected_parent is not None else None,
   "directory_nesting_only":True, "published_order":int(order),
   "published_depth":expected_level, "source_xml_xpath":location,
   "source_original_sha256":SHA,
   "mission_statement_as_published":mission_text if mission_text else None,
   "mission_text_is_legal_authority":False,
   "current_organization_verified":False,
   "independent_legal_review_complete":False
  })
  subs=e.findall("Childrens")
  ensure(len(subs)<=1, "unexpected repeated children container")
  if subs:
   ensure(expected_level < 3, "publisher hierarchy depth exceeds supported grammar")
   for child in subs[0]:
    ensure(child.tag==TAGS[expected_level+1], "unexpected nested XML entry type")
    walk(child,entity_id,expected_level+1,location+"/Childrens")
 for child in doc:
  walk(child,None,0,"/GovernmentManual")
 count=Counter(x["source_element_tag"] for x in results)
 ensure(dict(count)==COUNTS and len(results)==231, "publisher entry population changed")
 ensure(len(set(x["source_entity_key"] for x in results))==231,"duplicate source entity key")
 return results
def reconcile(root,entries):
 curation=get_json(root,LINKS)
 strict_fields(curation,["model_version","model_family","source_package_id",
  "original_sha256","link_status","total_source_directory_entries",
  "current_legal_first_level_denominator","items"],"curation")
 ensure(curation["source_package_id"]==PACKAGE and curation["original_sha256"]==SHA and
  curation["model_family"]=="inc15d-govman-2025-curated-links" and
  curation["total_source_directory_entries"]==231 and
  curation["current_legal_first_level_denominator"] is None and
  curation["link_status"]=="explicit_research_curation_not_independent_identity_or_legal_review",
  "curation scope/edition altered")
 old=get_json(root,X12)["items"]
 canon={x["canonical_id"]:x for x in old}
 by_source={x["source_entity_local_id"]:x for x in entries}
 maps={}
 used=set()
 for x in curation["items"]:
  strict_fields(x,["source_entity_local_id","publisher_name","canonical_id","disposition"],"link")
  eid=x["source_entity_local_id"]
  cid=x["canonical_id"]
  ensure(eid in by_source and eid not in maps and cid in canon and cid not in used,
         "unknown, duplicated or overlapping canonical link")
  ensure(x["publisher_name"]==by_source[eid]["published_name"],"source publisher name changed")
  ensure(x["disposition"]=="provisional_name_or_edition_alias_same_subject_pending_identity_review",
         "link promoted to certified authority")
  branch=CATEGORY_BRANCH[by_source[eid]["published_category"]]
  ensure(branch is not None and canon[cid]["branch_id"]==branch,
         "cross-branch or international identity impersonation")
  ensure(canon[cid]["adl1_certified"] is False and
         canon[cid]["independent_legal_review_complete"] is False,
         "cannot modify historically qualified identities without explicit review")
  maps[eid]=x
  used.add(cid)
 ensure(len(maps)==50,"explicit curated edition crosswalk lost required records")
 rows=[]
 for e in entries:
  x=maps.get(e["source_entity_local_id"])
  canonical=x["canonical_id"] if x is not None else None
  c=canon[canonical] if canonical is not None else None
  rows.append({
   "id":"INC15D-XWALK-"+e["source_entity_local_id"],
   "source_entity_key":e["source_entity_key"],
   "publisher_name":e["published_name"],
   "publisher_category":e["published_category"],
   "canonical_id":canonical,
   "previous_x12_identity_id":c["id"] if c else None,
   "canonical_model_path":c["canonical_model_path"] if c else None,
   "identity_reconciliation_state":
    "provisional_explicit_source_name_or_alias" if c else
    ("external_international_unmatched" if e["published_category"]=="International Organizations"
     else "quasi_official_unmatched" if e["published_category"]=="Quasi-Official Agencies"
     else "unresolved_publisher_directory_entry"),
   "review_status":"research_only_not_independently_qualified",
   "legal_identity_certified":False,"legal_authority_inferred":False,
   "command_delegation_inferred":False,
  })
 return rows
def coverage(entries,links):
 from collections import defaultdict
 by_cat=defaultdict(list)
 by_key={x["source_entity_key"]:x for x in entries}
 links_by_key={x["source_entity_key"]:x for x in links}
 for e in entries:by_cat[e["published_category"]].append(e)
 cov=[]
 for cat in CATEGORY_BRANCH:
  all_entries=by_cat[cat]
  count=sum(links_by_key[x["source_entity_key"]]["canonical_id"] is not None
            for x in all_entries)
  cov.append({
   "id":"INC15D-COV-CAT-"+SCOPE[cat].upper().replace("_","-"),
   "population_kind":"publisher_category",
   "publisher_partition_name":cat,
   "publisher_source_root_key":None,
   "publisher_entry_denominator":len(all_entries),
   "provisional_canonical_links":count,
   "unresolved_publisher_entries":len(all_entries)-count,
   "source_partition_extracted_within_edition":True,
   "current_legal_first_level_institution_denominator":None,
   "nonadditive_against_other_publisher_editions":True,
  })
 dept=[x for x in entries if x["published_category"]=="Executive Branch: Departments"
       and x["published_parent_key"] is None]
 ensure(len(dept)==15,"missing Cabinet publisher department")
 for d in dept:
  seen={d["source_entity_key"]}
  while True:
   children={x["source_entity_key"] for x in entries
             if x["published_parent_key"] in seen}
   if children.issubset(seen):break
   seen|=children
  count=sum(links_by_key[k]["canonical_id"] is not None for k in seen)
  cov.append({
   "id":"INC15D-COV-DEPT-"+d["source_entity_local_id"],
   "population_kind":"publisher_department_subtree",
   "publisher_partition_name":d["published_name"],
   "publisher_source_root_key":d["source_entity_key"],
   "publisher_entry_denominator":len(seen),
   "provisional_canonical_links":count,
   "unresolved_publisher_entries":len(seen)-count,
   "source_partition_extracted_within_edition":True,
   "current_legal_first_level_institution_denominator":None,
   "nonadditive_against_other_publisher_editions":True,
  })
 ensure(len(cov)==22,"category/dept coverage count wrong")
 ensure(sum(x["publisher_entry_denominator"] for x in cov if x["population_kind"]=="publisher_category")==231,
  "edition source category partition loss")
 ensure(sum(x["publisher_entry_denominator"] for x in cov if x["population_kind"]=="publisher_department_subtree")==117,
  "Cabinet tree source partition loss")
 return cov
def wrap(family,items,extra):
 return {
  "model_version":"0.1.0","model_family":family,"source_package_id":PACKAGE,
  "source_publication_date":"2025-12-31","original_source_sha256":SHA,
  "source_original_repository_path":ORIGINAL,
  "whole_federal_legal_institution_denominator":None,
  "current_first_level_institution_denominator":None,
  "independent_legal_review_complete":False,
  "independent_worm_custody_verified":False,
  **extra,"items":items
 }
def outputs(root):
 doc=source_tree(root)
 entries=extract_nodes(doc)
 links=reconcile(root,entries)
 cov=coverage(entries,links)
 counts=Counter(x["source_element_tag"] for x in entries)
 return {
 OUTPUTS["directory"]:wrap("inc15d-govman-2025-directory",entries,{
  "publisher_entry_count":231,"top_level_publisher_entries":105,
  "source_tag_counts":{k:counts[k] for k in TAGS},
  "mission_source_level":"publisher_text_not_independently_verified_mission_or_authority"
 }),
 OUTPUTS["crosswalk"]:wrap("inc15d-govman-2025-crosswalk",links,{
  "publisher_entry_count":231,"explicit_provisional_links":50,
  "unresolved_entries":181,"existing_canonical_ids_replaced":0,
  "source_local_identifiers_not_permanent":True
 }),
 OUTPUTS["coverage"]:wrap("inc15d-govman-2025-coverage",cov,{
  "publisher_entry_count":231,"source_category_partition_count":7,
  "cabinet_publisher_subtree_count":15,
  "publisher_source_category_counts":{
    x["published_category"]:sum(e["published_category"]==x["published_category"] for e in entries)
    for x in entries},
  "cross_edition_addition_authorized":False,
  "publisher_denominator_is_legal_first_level_denominator":False
 }),
 }
def encode(obj):return json.dumps(obj,ensure_ascii=False,indent=2)+"\n"
def run(root,write=False):
 data=outputs(root)
 for p,obj in data.items():
  target=root/p
  output=encode(obj)
  if write:
   target.parent.mkdir(parents=True,exist_ok=True)
   target.write_text(output,encoding="utf-8")
  else:
   ensure(target.is_file() and target.read_text(encoding="utf-8")==output,
          "generated source-derived model differs from byte-exact replay "+p)
 return {"source":PACKAGE,"publisher_entities":231,"provisional_canonical_links":50,
  "unresolved":181,"source_category_partitions":7,"cabinet_source_subtrees":15,
  "original_sha256":SHA,"legal_first_level_denominator":None,
  "status":"publisher_research_only"}
if __name__=="__main__":
 ap=argparse.ArgumentParser()
 ap.add_argument("--write",action="store_true",help="generate derived files from retained original")
 ap.add_argument("--root",type=Path,default=REPO)
 args=ap.parse_args()
 try:print(json.dumps(run(args.root.resolve(),args.write),indent=2))
 except Exception as exc:
  print("INC-15D extraction failure: "+str(exc),file=sys.stderr)
  sys.exit(1)
