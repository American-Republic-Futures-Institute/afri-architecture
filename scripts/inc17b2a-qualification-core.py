#!/usr/bin/env python3
"""INC-17B.2A edition-pinned, original-backed institutional text boundaries.

The collector verifies historical/edition source text; this independent
validator prevents promoting that text into a current legal first-level
agency roster, executed delegated power, supervision chain, or Atlas graph.
"""
from __future__ import annotations
import copy
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import sys
import unicodedata

ROOT=Path(__file__).resolve().parents[1]
CAPTURE_PATH=Path("scripts/inc17b2a-capture-statutes.py")
CAND=Path("model/wholegov/inc17b2a-statutory-boundary-candidates.json")
COVER=Path("model/wholegov/inc17b2a-department-qualification.json")
SCHEMA=Path("schemas/inc17b2a-statutory-qualification.schema.json")
RECEIPT=Path("evidence/inc17b2a-statutory-originals/source-custody.json")
BASE=Path("model/wholegov/inc17b-department-breadth.json")
ROOTS=Path("model/federal/executive-departments.json")
LEGACY=Path("model/federal/department-structure/candidate-granules.json")
PREV=Path("model/federal/inc15b-cabinet-sources.json")
VA=Path("model/federal/inc13b3-va-directory.json")
DHS=Path("model/federal/inc15c2-dhs-chart-boxes.json")
MANIFEST=Path("model/federal/manifest.json")
LEGAL_IDS=[
 "INC17B2A-SRC-STATE-2651A","INC17B2A-SRC-USDA-2202",
 "INC17B2A-SRC-HUD-3532","INC17B2A-SRC-VA-301",
 "INC17B2A-SRC-DHS-111","INC17B2A-SRC-DHS-112"]
PRIORITY=["STATE","AGRICULTURE","HUD","VA","DHS"]
ALLOWED_PREDICATES={
 "statutory_text_designates_department_lead","statutory_text_in_department",
 "statutory_text_department_composed_of","statutory_text_establishes_existing_department"}
ALLOWED_KINDS={"office_or_position","organizational_component","office",
               "statutory_named_component","existing_canonical_institution"}

def load(path,root=ROOT):
 return json.loads((root/path).read_text(encoding="utf-8"))

def load_context(root=ROOT):
 cfg={}
 for name,path in {"candidates":CAND,"coverage":COVER,"schema":SCHEMA,
                    "receipt":RECEIPT,"base":BASE,"roots":ROOTS,"legacy":LEGACY,
                    "previous":PREV,"va":VA,"dhs":DHS,"manifest":MANIFEST}.items():
  cfg[name]=load(path,root)
 return cfg

def exact(a,b):return a==b

def fail(errors,msg):errors.append(msg)

def check_shape(value,schema,where,errors):
 if "const" in schema and value!=schema["const"]:
  fail(errors,"schema const drift: "+where)
 if "type" in schema:
  kinds=schema["type"] if isinstance(schema["type"],list) else [schema["type"]]
  kind=("null" if value is None else "boolean" if isinstance(value,bool) else \
        "array" if isinstance(value,list) else "object" if isinstance(value,dict) else \
        "integer" if isinstance(value,int) else "number" if isinstance(value,float) else \
        "string" if isinstance(value,str) else "unhandled")
  if kind not in kinds:fail(errors,"schema type drift: "+where)
  if kind=="string" and len(value)<schema.get("minLength",0):
   fail(errors,"schema min-length drift: "+where)
  if kind=="array":
   if len(value)<schema.get("minItems",0):fail(errors,"schema empty array: "+where)
   for i,x in enumerate(value):
    check_shape(x,schema.get("items",{}),where+"/"+str(i),errors)
  if kind=="object":
   props=schema.get("properties",{})
   if schema.get("additionalProperties") is False and set(value)!=set(schema.get("required",[])):
    fail(errors,"schema closed fields drift: "+where)
   for k,v in value.items():
    if k in props:check_shape(v,props[k],where+"/"+k,errors)
    elif schema.get("additionalProperties") is False:fail(errors,"schema unexpected field: "+where+"/"+k)
 return errors

class Visible(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.data=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in ("script","style","noscript"):self.skip+=1
 def handle_endtag(self,tag):
  if tag in ("script","style","noscript"):self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.data.append(data)

def statute_body(raw,section):
 parser=Visible()
 parser.feed(raw.decode("utf-8","strict"))
 visible=re.sub(r"\s+"," ",unicodedata.normalize("NFKC"," ".join(parser.data)).replace("\u2060","")).strip()
 n=section.split()[-1]
 match=re.search(r"§\s*"+re.escape(n)+r"\s*\.",visible)
 if match is None:return ""
 remainder=visible[match.start():]
 # End before publisher editorial and explanatory notes: no authority may
 # be promoted from a note unless that note itself is a separately cited act.
 end=remainder.find("Editorial Notes")
 if end>0:return remainder[:end]
 return remainder

def validate_data(d,root=ROOT,validate_originals=True):
 errors=[]
 if validate_originals:
  spec=importlib.util.spec_from_file_location("inc17b2a_originals",root/CAPTURE_PATH)
  mod=importlib.util.module_from_spec(spec)
  spec.loader.exec_module(mod)
  try:mod.verify(root)
  except Exception as exc:fail(errors,"publisher-original replay failure: "+str(exc))
 receipt=d["receipt"];sources=receipt["records"]
 if set(sources)!=set(LEGAL_IDS) or receipt["source_count"]!=6 or receipt["federal_department_count"]!=5:
  fail(errors,"six official publisher sources and five roots required")
 if receipt["mixed_edition_sources_must_not_be_merged_as_one_current_law"] is not True or \
    receipt["new_atlas_public_admissions"]!=0 or receipt["new_legal_relationships_admitted"]!=0:
  fail(errors,"edition/custody legal-admission boundary invalid")
 schema=d["schema"]
 if schema.get("$schema")!="https://json-schema.org/draft/2020-12/schema" or len(schema.get("oneOf",[]))!=2:
  fail(errors,"missing closed two-family schema")
 for collection in ("candidates","coverage"):
  model=d[collection]
  entry=next((s for s in schema.get("oneOf",[]) if s.get("properties",{}).get("model_family",{}).get("const")==model.get("model_family")),None)
  if entry is None or entry.get("additionalProperties") is not False or \
     entry.get("properties",{}).get("items",{}).get("items",{}).get("additionalProperties") is not False:
   fail(errors,"missing closed schema for "+collection)
  else:check_shape(model,entry,collection,errors)
  if model.get("model_version")!="0.1.0" or model.get("atlas_admitted",model.get("no_website_atlas_admission")) not in (False,True):
   fail(errors,"invalid model version or public admission for "+collection)
 manifest=d["manifest"]
 for modelpath in (CAND.as_posix(),COVER.as_posix()):
  if manifest["models"].count(modelpath)!=1:
   fail(errors,"unregistered or duplicated source-only model "+modelpath)
 extension=manifest.get("whole_government_inc17b2a_extension",{})
 if extension.get("source_receipt")!=RECEIPT.as_posix() or \
    extension.get("public_atlas_admission") is not False or \
    extension.get("new_canonical_component_ids")!=0 or \
    extension.get("new_admitted_legal_edges")!=0 or \
    extension.get("originals_retained")!=6:
  fail(errors,"manifest authority/identity admission boundary");
 original_roots=d["roots"]["items"]
 byroot={x["id"]:x for x in original_roots}
 previous={x["canonical_department_id"]:x for x in d["base"]["items"]}
 prev15b={x["canonical_department_id"]:x for x in d["previous"]["items"]}
 if len(original_roots)!=15 or len(previous)!=15 or len(prev15b)!=15:
  fail(errors,"prior canonical Cabinet roster drift")
 propositions=d["candidates"];rows=propositions["items"]
 if propositions.get("candidate_statutory_text_propositions")!=15 or len(rows)!=15 or \
    propositions.get("exact_publisher_originals_retained")!=6 or \
    propositions.get("priority_department_count")!=5 or \
    propositions.get("independent_legal_adjudication_complete") is not False or \
    propositions.get("fully_qualified_current_adl1_count")!=0 or \
    propositions.get("new_canonical_institution_ids")!=0 or \
    propositions.get("new_executed_delegation_command_or_public_outcome_claims")!=0 or \
    propositions.get("atlas_admitted") is not False or \
    propositions.get("claim_time_scope")!="per_source_legal_edition_not_one_current_2026_census":
  fail(errors,"false claim of certified/current/institutional statute propositions")
 if propositions.get("source_custody_receipt")!=RECEIPT.as_posix():
  fail(errors,"statutory proposition source receipt provenance missing")
 subjects=set()
 rowids=set()
 counts={}
 text_cache={}
 legacy_ids={x["prior_candidate_id"] for x in d["legacy"]["items"]}
 legacy_ids.update(x["original_unit_candidate_id"] for x in d["va"]["items"])
 for i,x in enumerate(rows):
  sid=x["source_id"];entry=sources.get(sid)
  if x["id"] in rowids or x["source_local_subject_id"] in subjects or x["source_local_subject_id"].startswith("ORG-"):
   fail(errors,"duplicate or forged globally canonical statute subject identity "+x["id"])
  rowids.add(x["id"]);subjects.add(x["source_local_subject_id"])
  counts[x["canonical_department_id"]]=counts.get(x["canonical_department_id"],0)+1
  if not entry or x["canonical_department_id"]!=entry["department_canonical_id"] or \
     x["canonical_department_id"] not in byroot:
   fail(errors,"unverified statutory source institution endpoint "+x["id"]);continue
  if x["source_edition"]!=entry["edition"] or \
     x["exact_statutory_citation"]!=entry["statutory_citation"] or \
     x["source_original_sha256"]!=entry["source_original_sha256"] or \
     x["source_original_git_blob_sha1"]!=entry["source_original_git_blob_sha1"]:
   fail(errors,"cross-era statute text or unbacked source hashes "+x["id"])
  if x["source_subject_kind"] not in ALLOWED_KINDS or \
     x["relationship_candidate_kind"] not in ALLOWED_PREDICATES or \
     not x["clause_locator"].startswith(entry["statutory_citation"].replace(" U.S.C. "," USC ")):
   fail(errors,"untyped or out-of-scope legal proposition "+x["id"])
  if x["legacy_research_candidate_id"] is not None and x["legacy_research_candidate_id"] not in legacy_ids:
   fail(errors,"unverified old research crosswalk "+x["id"])
  if any(x[k] is not False for k in (
      "legal_currentness_2026_independently_verified",
      "legal_organization_first_level_verified","full_organizational_roster_qualified",
      "independent_professional_legal_review_complete",
      "verified_executed_delegation_or_command","atlas_admitted")) or \
     x["current_canonical_component_id"] is not None or \
     any(x[k] is not True for k in (
      "exact_source_text_replayed","source_qualified_publisher_original",
      "source_statement_valid_for_original_edition_only")):
   fail(errors,"uncertified legal powers, currentness, identity or public Atlas promotion "+x["id"])
  if x["observed_clause_text_anchor"]=="" or \
     x["source_local_subject_id"]==x["canonical_department_id"]:
   fail(errors,"missing original statutory clause or invented canonical equivalence "+x["id"])
  if sid not in text_cache:
   try:text_cache[sid]=statute_body((root/entry["source_original_repository_path"]).read_bytes(),entry["statutory_citation"])
   except Exception as exc:
    fail(errors,"unreadable statute body "+sid+": "+str(exc));continue
  if x["observed_clause_text_anchor"] not in text_cache[sid]:
   fail(errors,"clause not found inside statutory text body "+x["id"])
 # Validate the statement is actually a subordinate/position/establishment
 # class in the cited body. Source-only direction is never a legal graph edge.
 expectedCounts={("ORG-FED-EXE-DEP-"+s):n for s,n in
  [("STATE",4),("AGRICULTURE",1),("HUD",1),("VA",7),("DHS",2)]}
 if counts!=expectedCounts:
  fail(errors,"incorrect edition-scoped statutory proposition count per department")
 if len(rowids)!=15 or len(subjects)!=15:
  fail(errors,"duplicate publication-scoped subject records")
 for x in rows:
  if x["canonical_department_id"]=="ORG-FED-EXE-DEP-VA" and \
   x["source_subject_label"]=="Board of Contract Appeals" and \
   "current entity existence and successor legal effects are not verified" not in x["qualification_note"]:
   fail(errors,"historic VA contract appeals board misrepresented as current")
 # The two other research editions must remain explicitly non-additive.
 hist=d["coverage"]
 coverage=hist["items"]
 if len(coverage)!=15 or len({x["canonical_department_id"] for x in coverage})!=15 or \
    hist.get("cabinet_roots")!=15 or hist.get("priority_roots")!=5 or \
    hist.get("other_cabinet_roots")!=10 or \
    hist.get("original_legal_sections_retained")!=6 or \
    hist.get("previously_recorded_2025_publisher_direct_candidates")!=63 or \
    hist.get("added_current_certified_adl1_organizations")!=0 or \
    hist.get("newly_admitted_specific_supervision_or_command_edges")!=0 or \
    hist.get("fully_qualified_current_department_roster_count")!=0 or \
    hist.get("exact_current_federal_adl1_denominator") is not None or \
    hist.get("mixed_source_editions_are_not_a_single_2026_legal_snapshot") is not True or \
    hist.get("current_legal_effect_and_successor_review_remaining") is not True or \
    hist.get("no_website_atlas_admission") is not True:
  fail(errors,"historical edition populations added or current ADL-1 falsely certified")
 if hist.get("official_source_receipt")!=RECEIPT.as_posix() or \
    hist.get("previous_census_model")!=BASE.as_posix():
  fail(errors,"missing prior census and official source custody continuity")
 officialIds={
  "ORG-FED-EXE-DEP-STATE":["INC17B2A-SRC-STATE-2651A"],
  "ORG-FED-EXE-DEP-AGRICULTURE":["INC17B2A-SRC-USDA-2202"],
  "ORG-FED-EXE-DEP-HUD":["INC17B2A-SRC-HUD-3532"],
  "ORG-FED-EXE-DEP-VA":["INC17B2A-SRC-VA-301"],
  "ORG-FED-EXE-DEP-DHS":["INC17B2A-SRC-DHS-111","INC17B2A-SRC-DHS-112"]}
 for x in coverage:
  rootid=x["canonical_department_id"]
  prior=previous.get(rootid);old=prev15b.get(rootid)
  if not prior or not old:
   fail(errors,"missing preexisting canonical Cabinet/INC-15B record "+rootid);continue
  sc=rootid.split("-")[-1]
  expectedSrc=officialIds.get(rootid,[])
  oldSeeds=[q["prior_candidate_id"] for q in d["legacy"]["items"] if q["parent_department_id"]==rootid]
  priorHistorical=22 if sc=="VA" else 34 if sc=="DHS" else None
  historicalPaths=(["model/federal/inc13b3-va-directory.json","model/federal/department-structure/units.json"] if sc=="VA" else \
    ["model/federal/inc15c2-dhs-chart-boxes.json","model/federal/inc15c1-dhs-source-reconciliation.json"] if sc=="DHS" else [])
  snapshot="CENSUS-SNAPSHOT-DHS-CHART-2025" if sc=="DHS" else \
    "DEPT04-SNAPSHOT-VA" if sc=="VA" else None
  if x["id"]!="WG17B2A-COV-"+sc or \
     x["govman_2025_publisher_root_key"]!=prior["govman_publisher_parent_key"] or \
     x["govman_2025_immediate_publisher_entry_count"]!=prior["govman_direct_source_count"] or \
     x["govman_2025_zero_immediate_entries_is_not_absence_of_offices"] is not True or \
     x["original_edition_statutory_source_ids"]!=expectedSrc or \
     x["original_retained_legal_edition_count"]!=len(expectedSrc) or \
     x["statutory_textual_candidate_count"]!=counts.get(rootid,0) or \
     x["prior_inc15b_source_id"]!=old["publisher_source_id"] or \
     x["prior_inc15b_publisher_source_edition"]!=old["source_edition"] or \
     x["prior_research_candidate_ids"]!=oldSeeds or \
     x["other_existing_research_source_paths"]!=historicalPaths or \
     x["prior_historical_publisher_count"]!=priorHistorical or \
     x["prior_historical_source_original_retained"]!=(True if sc=="DHS" else False if sc=="VA" else None) or \
     x["prior_historical_source_snapshot"]!=snapshot or \
     x["prior_historical_original_sha256"]!=(d["dhs"]["source_original_sha256"] if sc=="DHS" else None)):
   fail(errors,"historic publisher and official statute sources misreconciled "+rootid)
  if x["priority_state"]!=("original_statutory_text_verified_current_institutional_effect_pending" if expectedSrc else "other_cabinet_source_qualification_deferred") or \
     x["current_federal_first_level_legal_roster_count"] is not None or \
     any(x[k] is not False for k in (
      "full_department_adl1_qualified",
      "current_statutory_legal_effect_and_amendment_review_complete",
      "legal_currentness_as_of_2026_10_26",
      "current_command_supervision_and_delegation_verified","atlas_admitted")) or \
     x["source_only_publisher_name_mappings_are_not_identity_certification"] is not True or \
     x["cross_edition_counts_not_additive"] is not True:
   fail(errors,"false current organization, legal control or public Atlas source promotion "+rootid)
 if sum(x["original_retained_legal_edition_count"] for x in coverage)!=6:
  fail(errors,"unattributed or duplicate statutory source editions")
 return {"errors":errors,"summary":{
    "captured_statutory_originals":6,"priority_departments":5,
    "source_textual_propositions":len(rows),
    "retained_va_directory_observations":len(d["va"]["items"]),
    "retained_dhs_chart_boxes":len(d["dhs"]["items"]),
    "current_legal_adl1_qualified":0,
    "public_atlas_admitted":False}}

def main():
 d=load_context()
 result=validate_data(d)
 print(json.dumps({"status":"valid_original_text_not_current_legal_certification" if not result["errors"] else "rejected",**result},indent=2))
 if result["errors"]:sys.exit(1)

if __name__=="__main__":
 main()
