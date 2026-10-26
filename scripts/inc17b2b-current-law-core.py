#!/usr/bin/env python3
"""INC-17B.2B official source-epoch and institutional relationship qualification.

This validates publisher-original bytes and source-scoped legal TEXT, while
retaining the independent legal-effect, actual organization, identity and
website-admission gates. All relationships are research-only, not Atlas edges.
"""
from __future__ import annotations
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path
import re
import sys
import unicodedata

ROOT=Path(__file__).resolve().parents[1]
FAMILIES={
 "epochs":"model/wholegov/inc17b2b-epoch-crosswalk.json",
 "legal":"model/wholegov/inc17b2b-legal-relations.json",
 "directories":"model/wholegov/inc17b2b-publisher-crosswalks.json",
 "exceptions":"model/wholegov/inc17b2b-legal-exceptions.json",
 "coverage":"model/wholegov/inc17b2b-qualification-ledger.json"
}
SOURCES={
 "current":"evidence/inc17b2b-olrc-119-124/source-custody.json",
 "historical":"evidence/inc17b2a-statutory-originals/source-custody.json",
 "prior_legal":"model/wholegov/inc17b2a-statutory-boundary-candidates.json",
 "prior_coverage":"model/wholegov/inc17b2a-department-qualification.json",
 "cabinet":"model/federal/executive-departments.json",
 "VA":"model/federal/department-structure/units.json",
 "DHS":"model/federal/coverage/components.json",
 "chart":"model/federal/inc15c2-dhs-chart-boxes.json",
 "manifest":"model/federal/manifest.json",
 "schema":"schemas/inc17b2b-current-law-source-crosswalk.schema.json"
}
OLD_KEYS={"STATE-2651A":"INC17B2A-SRC-STATE-2651A",
"USDA-2202":"INC17B2A-SRC-USDA-2202",
"HUD-3532":"INC17B2A-SRC-HUD-3532",
"HUD-3533":None,"VA-301":"INC17B2A-SRC-VA-301",
"DHS-111":"INC17B2A-SRC-DHS-111","DHS-112":"INC17B2A-SRC-DHS-112"}
PRIORITY={"STATE":1,"AGRICULTURE":1,"HUD":2,"VA":1,"DHS":2}
HISTORICAL_CHART="DHS-CHART-2025"
VALID_RELATIONS={
 "statutory_text_designates_department_head",
 "statutory_text_places_bureau_within_department",
 "statutory_text_prescribes_officer_position",
 "statutory_text_prescribes_position_class_count",
 "statutory_text_enumerates_department_composition",
 "statutory_text_affirms_existing_department"
}
def load(root=ROOT):
 def read(path):return json.loads((root/path).read_text(encoding="utf-8"))
 d={k:read(p) for k,p in FAMILIES.items()}
 d.update({k:read(p) for k,p in SOURCES.items()})
 return d
def check_schema(o,s,errors,where):
 if "const" in s and o!=s["const"]:errors.append("Schema fixed value changed: "+where)
 if "type" in s:
  expected=s["type"] if isinstance(s["type"],list) else [s["type"]]
  actual=("null" if o is None else "boolean" if isinstance(o,bool) else
          "array" if isinstance(o,list) else "object" if isinstance(o,dict) else
          "integer" if isinstance(o,int) else "number" if isinstance(o,float) else
          "string" if isinstance(o,str) else "unknown")
  if actual not in expected:errors.append("Schema type changed: "+where)
  if actual=="string" and len(o)<s.get("minLength",0):
   errors.append("Schema string empty: "+where)
  if actual=="array":
   if len(o)<s.get("minItems",0):errors.append("Schema required records missing: "+where)
   for i,v in enumerate(o):check_schema(v,s.get("items",{}),errors,where+"["+str(i)+"]")
  if actual=="object":
   if s.get("additionalProperties") is False and set(o)!=set(s.get("required",[])):
    errors.append("Schema closed object changed: "+where)
   for k,v in o.items():
    if k in s.get("properties",{}):check_schema(v,s["properties"][k],errors,where+"/"+k)
def check_originals(root,errors):
 for key,script in (("119-124","scripts/inc17b2b-capture-official.py"),
                    ("historic","scripts/inc17b2a-capture-statutes.py")):
  spec=importlib.util.spec_from_file_location("qualification_"+key.replace("-","_"),root/script)
  mod=importlib.util.module_from_spec(spec)
  try:
   spec.loader.exec_module(mod)
   mod.verify(root)
  except Exception as exc:
   errors.append("Official "+key+" source bytes or retained legal section invalid: "+str(exc))
def source_section(mod,raw,section):
 return mod.section_body(mod.visible_text(raw),section)
def validate(d,root=ROOT,replay_originals=True):
 errors=[]
 def fail(msg):errors.append(msg)
 if replay_originals:check_originals(root,errors)
 sources=d["current"]["records"]
 old=d["historical"]["records"]
 if d["current"]["legal_source_release"]!="Public Law 119-124" or \
    d["current"]["legal_source_release_date"]!="October 15, 2026" or \
    d["current"]["required_legal_originals"]!=7 or \
    d["current"]["optional_directory_originals_qualified"]!=3 or \
    d["current"]["optional_directory_gaps"]!=1 or \
    "STATE-FAM-MGMT-2024" not in d["current"]["directory_unavailable"]:
  fail("Immutable 119-124 legal and department source epoch accounting invalid")
 if set(OLD_KEYS).difference(sources) or len(d["schema"].get("oneOf",[]))!=5:
  fail("Expected seven OLRC section identities or closed five-family schemas missing")
 for name,relative in FAMILIES.items():
  model=d[name]
  if d["manifest"]["models"].count(relative)!=1:fail("Research model manifest missing or duplicated: "+relative)
  s=next((x for x in d["schema"]["oneOf"] if x.get("properties",{}).get("model_family",{}).get("const")==model.get("model_family")),None)
  if not s or s.get("additionalProperties") is not False or \
    s.get("properties",{}).get("items",{}).get("items",{}).get("additionalProperties") is not False:
   fail("Model lacks closed source schema: "+name)
  else:check_schema(model,s,errors,name)
  if model.get("model_version")!="0.1.0" or model.get("atlas_admitted") is not False:
   fail("Unratified source family was publicly admitted or changed version: "+name)
 ext=d["manifest"].get("whole_government_inc17b2b_extension",{})
 if ext.get("contract")!="INC-17B.2B" or ext.get("originals_retained")!=10 or \
    ext.get("current_original_statutory_sections")!=7 or \
    ext.get("public_atlas_admission") is not False or \
    ext.get("new_legal_effect_adjudications")!=0 or \
    ext.get("new_canonical_components")!=0 or \
    ext.get("source_relation_count")!=28 or \
    ext.get("live_graph_edges_added")!=0:
  fail("False institutional authority or source family admission in manifest")
 roots={x["id"] for x in d["cabinet"]["items"]}
 if len(roots)!=15:fail("Existing canonical Cabinet root identities changed")
 existing=set(x["id"] for x in d["VA"]["items"])|set(x["id"] for x in d["DHS"]["items"])
 prevLegal={x["id"]:x for x in d["prior_legal"]["items"]}
 prevCoverage={x["canonical_department_id"]:x for x in d["prior_coverage"]["items"]}
 chart=d["chart"];chartRows={x["id"]:x for x in chart["items"]}
 if len(prevCoverage)!=15 or len(prevLegal)!=15 or len(chartRows)!=34 or \
    d["prior_coverage"]["fully_qualified_current_department_roster_count"]!=0:
  fail("Prior canonical, VA, DHS and statute source worksets modified")
 # Recompute seven source epochs and edition-specific custody identity, no
 # "as of Oct 26" claim inferred from the law-through date.
 epochRows=d["epochs"]["items"]
 if len(epochRows)!=7 or len({x["current_source_key"] for x in epochRows})!=7:
  fail("Seven source-epoch crosswalk rows required")
 for x in epochRows:
  key=x["current_source_key"];current=sources.get(key)
  oldKey=OLD_KEYS.get(key);older=old.get(oldKey) if oldKey else None
  if current is None:fail("Unknown official OLRC source: "+key);continue
  if x["canonical_department_id"]!=current["canonical_department_id"] or \
     x["current_original_sha256"]!=current["source_original_sha256"] or \
     x["current_original_git_blob_sha"]!=current["source_git_blob_sha1"] or \
     x["current_source_citation"]!=current["source_citation"] or \
     x["current_law_through_date"]!="2026-10-15" or \
     x["current_olrc_edition"]!="Public Law 119-124" or \
     x["prior_source_key"]!=oldKey or \
     x["prior_publisher_edition"]!=(older["edition"] if older else None) or \
     x["prior_original_sha256"]!=(older["source_original_sha256"] if older else None) or \
     x["prior_original_git_blob_sha"]!=(older["source_original_git_blob_sha1"] if older else None):
   fail("Invalid original or historical source crosswalk: "+key)
  if x["canonical_id_unchanged"] is not True or \
     x["source_originals_retained_on_both_sides"] is not bool(older) or \
     x["statute_reissue_not_asserted_to_be_effective_date"] is not True or \
     x["independently_adjudicated_legal_effective_interval"] is not None or \
     x["complete_current_organizational_roster_certified"] is not False or \
     x["no_inferred_command_or_executed_delegation"] is not True or x["atlas_admitted"] is not False:
   fail("Epoch revision incorrectly became an effective/current administrative power: "+key)
 if d["epochs"]["current_release_publisher_original_count"]!=7 or \
    d["epochs"]["new_independently_legally_certified_orgs"]!=0 or \
    d["epochs"]["source_release"]!="Public Law 119-124":
  fail("Epoch snapshot falsely certified legal entities or dates")
 # Explicit legal text source validation; inspect actual statute BODY after
 # publisher navigation, not HTML title, introductory jump links or footnotes.
 legal=d["legal"];rows=legal["items"]
 if len(rows)!=28 or legal["source_verified_legal_relation_count"]!=28 or \
    legal["dual_source_statute_and_directory_name_concordances"]!=4 or \
    legal["legal_adjudication_or_permanent_canonical_member_certifications_added"]!=0 or \
    legal["graph_legal_authority_edges_admitted"]!=0 or \
    legal["source_local_subject_ids_not_canonical"] is not True:
  fail("Current release legal source rows falsely promoted or miscounted")
 curModuleSpec=importlib.util.spec_from_file_location("inc17b2b_capturer",root/"scripts/inc17b2b-capture-official.py")
 curMod=importlib.util.module_from_spec(curModuleSpec)
 curModuleSpec.loader.exec_module(curMod)
 sections={}
 def text_for(key):
  if key not in sections:
   p=root/sources[key]["source_original_path"]
   sections[key]=source_section(curMod,p.read_bytes(),sources[key]["source_citation"].split()[-1])
  return sections[key]
 ids=set();subjects=set();counts={};dual=0
 priorName={x["source_subject_label"]:x for x in prevLegal.values()}
 for x in rows:
  key=x["currently_qualified_publisher_source_key"]
  r=sources.get(key)
  if x["id"] in ids or x["to_id"] in subjects or x["to_id"].startswith("ORG-"):
   fail("Duplicate or falsely global canonical subject identity: "+x["id"])
  ids.add(x["id"]);subjects.add(x["to_id"])
  counts[x["from_id"]]=counts.get(x["from_id"],0)+1
  if not r or r["source_kind"]!="federal_statutory_release_section" or \
     x["from_id"] not in roots or x["from_id"]!=r["canonical_department_id"] or \
     x["current_original_sha256"]!=r["source_original_sha256"] or \
     x["claimed_source_legal_locator"]!=r["source_citation"] or \
     x["current_olrc_release"]!="Public Law 119-124":
   fail("Statutory relationship not tied to canonical department and retained original: "+x["id"]);continue
  if x["legal_relation_type"] not in VALID_RELATIONS or \
     x["legal_clause_body_anchor"] not in text_for(key):
   fail("Relationship predicate not supported within codified section body: "+x["id"])
  previous=x["prior_2023_or_2024_proposition_id"]
  if previous is not None and (previous not in prevLegal or \
     prevLegal[previous]["canonical_department_id"]!=x["from_id"]):
   fail("Unqualified historical claim joins new legal relationship: "+x["id"])
  cand=x["previously_recorded_source_component_candidate_id"]
  if cand is not None and cand not in existing:
   fail("Fabricated existing institutional candidate ID: "+x["id"])
  directory=x["independent_department_directory_source_key"]
  if x["current_department_listing_name_corroborated"]:
   dual+=1
   if x["from_id"]!="ORG-FED-EXE-DEP-VA" or directory!="VA-ADMIN-OFFICES" or \
      cand not in {f"DEPT04-UNIT-VA-{q}" for q in ["VHA","VBA","NCA","BVA"]} or \
      x["verification_tier"]!="current_olrc_text_and_bounded_department_directory":
    fail("Dual-source current department identity claimed without appropriate evidence: "+x["id"])
  elif directory is not None or x["verification_tier"]!="current_olrc_citation_text_only":
   fail("Unqualified cross-source organizational identity promotion: "+x["id"])
  if any(x[k] is not False for k in (
    "legally_determined_current_organization_identity",
    "first_level_immediate_organizational_reporting_verified",
    "independent_professional_legal_review_complete",
    "operationally_executed_delegation_verified",
    "current_org_chart_completeness_certified","atlas_admitted")) or \
     x["legal_effective_date_independently_adjudicated"] is not None or \
     x["legal_composition_is_not_reporting_command"] is not True:
   fail("Statutory source text promoted to present-day command, legal effect or public graph: "+x["id"])
 expected={f"ORG-FED-EXE-DEP-{k}":n for k,n in [
 ("STATE",14),("AGRICULTURE",1),("HUD",4),("VA",7),("DHS",2)]}
 if counts!=expected or len(ids)!=28 or len(subjects)!=28 or dual!=4:
  fail("Illegal cross-source statutory component count or duplicate subject")
 # Independent legal provenance and source-specific limited directory crosswalks.
 dirrows=d["directories"]["items"]
 if len(dirrows)!=23 or d["directories"]["observation_count"]!=23 or \
    d["directories"]["agency_and_program_entries_from_three_2026_original_pages"]!=13 or \
    d["directories"]["prior_retained_fy2024_DHS_chart_boxes_reused"]!=10 or \
    d["directories"]["current_legally_certified_first_level_units_added"]!=0 or \
    d["directories"]["source_observations_do_not_add_statutory_authority"] is not True:
  fail("Mixed original publisher observations wrongly treated as a legal hierarchy")
 directoryCounts={}
 for x in dirrows:
  key=x["publisher_original_key"]
  directoryCounts[key]=directoryCounts.get(key,0)+1
  isChart=key==HISTORICAL_CHART
  original=(chart if isChart else sources.get(key))
  if not original:fail("Missing source original for directory listing: "+x["id"]);continue
  origHash=original["source_original_sha256"]
  origPath=original["source_original_git_path"] if isChart else original["source_original_path"]
  if x["publisher_original_sha256"]!=origHash or x["publisher_original_repository_path"]!=origPath or \
     x["canonical_department_id"] not in roots:
   fail("Directory/charts must preserve source exact hash and canonical department: "+x["id"])
  if isChart:
   box=chartRows.get(x["original_chart_box_id"])
   if not box or x["source_body_or_chart_label_anchor"]!=box["chart_label"] or \
      x["publisher_observed_name"]!=box["chart_label"] or \
      x["time_scope"]!="FY2024_report_published_2025_not_current_2026":
    fail("Historical DHS chart box remapped as current legal supervisor: "+x["id"])
  else:
   if x["original_chart_box_id"] is not None or \
      x["time_scope"]!="publisher_page_observed_2026-10-26_not_full_department_roster":
    fail("Mutable department directory treated as historical chart or perpetual organization: "+x["id"])
   raw=(root/origPath).read_bytes()
   if x["source_body_or_chart_label_anchor"] not in curMod.visible_text(raw):
    fail("Directory item absent from original publisher response: "+x["id"])
  if x["prior_canonical_component_candidate_id"] is not None and \
     x["prior_canonical_component_candidate_id"] not in existing:
   fail("Directory name minted a nonexistent component candidate: "+x["id"])
  id=x["independently_source_qualified_statutory_relation_id"]
  if id is not None and id not in ids:
   fail("Directory observation unsupported by previously source-verified legal statement: "+x["id"])
  if any(x[k] is not False for k in (
     "independent_current_legal_first_level_identity_verified",
     "direct_reporting_or_supervision_proven",
     "military_command_or_delegation_proven",
     "current_organizational_completeness_proven","atlas_admitted")) or \
     x["source_grouping_relation"]!="publisher_directory_or_historical_chart_only":
   fail("Publisher listing promoted to command, legal identity or Atlas: "+x["id"])
 if directoryCounts!={"USDA-NIFA-AGENCY-LIST":5,"HUD-PROGRAM-LIST":4,
     "VA-ADMIN-OFFICES":4,HISTORICAL_CHART:10}:
  fail("Publisher populations joined or missing without source boundaries")
 # Fixed scope of exceptions and incompatible effective law/current operations.
 exceptions=d["exceptions"]["items"]
 if len(exceptions)!=11 or d["exceptions"]["exception_count"]!=11 or \
    d["exceptions"]["unqualified_OIG_Coast_Guard_or_board_control_edges_added"]!=0 or \
    d["exceptions"]["independently_qualified_effective_dates_added"]!=0 or \
    d["exceptions"]["source_change_is_not_entity_merger"] is not True:
  fail("Critical temporal or independence exceptions absent")
 idsE=set()
 for x in exceptions:
  k=x["primary_source_key"];prior=chart if k==HISTORICAL_CHART else sources.get(k)
  if not prior:fail("Missing exception original "+x["id"]);continue
  if x["id"] in idsE:fail("Duplicated legal boundary exception "+x["id"])
  idsE.add(x["id"])
  if x["canonical_department_id"]!=("ORG-FED-EXE-DEP-"+x["id"].split("-")[2]) or \
     x["primary_original_sha256"]!=prior["source_original_sha256"]:
   fail("Exception source/hash or departmental identity altered: "+x["id"])
  if k==HISTORICAL_CHART:
   if x["source_text_or_chart_anchor"] not in [b["chart_label"] for b in chart["items"]]:
    fail("Unverified original historical chart exception: "+x["id"])
  else:
   originalPath=prior["source_original_path"]
   whole=curMod.visible_text((root/originalPath).read_bytes())
   if x["source_text_or_chart_anchor"] not in whole:
    fail("Exception text not in original publisher HTML: "+x["id"])
  if any(x[y] is not False for y in ("independent_legal_counsel_adjudicated",
      "confirmed_report_to_or_operational_command",
      "current_actual_role_or_organizational_identity_certified","atlas_admitted")) or \
     x["legal_effective_date_established"] is not None or \
     x["source_only_exception_not_a_live_graph_relationship"] is not True:
   fail("Exception incorrectly became exercised authority or an executed command: "+x["id"])
 if not {"WG17B2B-EXC-VA-CONTRACT_APPEALS_BOARD",
         "WG17B2B-EXC-DHS-COAST_GUARD_CONDITIONAL_TRANSFER",
         "WG17B2B-EXC-DHS-OIG_INDEPENDENCE",
         "WG17B2B-EXC-STATE-HUMAN_RESOURCES_REFERENCES"}.issubset(idsE):
  fail("High-consequence Board, Coast Guard, Inspector General and State rename exceptions missing")
 # The architecture remains a bounded source census, no 2026 complete ADL1.
 ledger=d["coverage"];covRows=ledger["items"]
 if len(covRows)!=15 or len({x["canonical_department_id"] for x in covRows})!=15 or \
    ledger["federal_department_roots"]!=15 or ledger["priority_roots_with_seven_current_originals"]!=5 or \
    ledger["olrc_current_originals_count"]!=7 or ledger["departmental_originals_captured_2026"]!=3 or \
    ledger["departmental_source_access_gap_count"]!=1 or \
    ledger["unique_source_qualified_but_unratified_statutory_relationships"]!=28 or \
    ledger["dual_source_concordances"]!=4 or ledger["source_only_publisher_observations"]!=23 or \
    ledger["fully_qualified_current_department_count"]!=0 or \
    ledger["full_current_ADL1_department_denominator"] is not None or \
    ledger["original_source_admission_does_not_infer_legal_effect"] is not True or \
    ledger["live_graph_new_legally_qualified_relations"]!=0:
  fail("Unqualified all-Cabinet completeness or invented legal effects")
 for row in covRows:
  id=row["canonical_department_id"];older=prevCoverage.get(id)
  if not older:fail("Original Cabinet root absent in reconciliation: "+id);continue
  key=id.split("-")[-1]
  legalNames=[x["currently_qualified_publisher_source_key"] for x in rows if x["from_id"]==id]
  obsNames=[x["publisher_original_key"] for x in dirrows if x["canonical_department_id"]==id]
  expectedKeys=([x for x in OLD_KEYS if sources[x]["canonical_department_id"]==id] if key in PRIORITY else [])
  expectedDirectories={"AGRICULTURE":["USDA-NIFA-AGENCY-LIST"],"HUD":["HUD-PROGRAM-LIST"],
    "VA":["VA-ADMIN-OFFICES"],"DHS":[HISTORICAL_CHART]}.get(key,[])
  if row["id"]!="WG17B2B-COV-"+key or \
     row["previous_inc17b2a_qualification_id"]!=older["id"] or \
     row["prior_2025_govman_immediate_source_observations"]!=older["govman_2025_immediate_publisher_entry_count"] or \
     row["current_119_124_original_section_keys"]!=expectedKeys or \
     row["retained_or_previous_agency_directory_source_keys"]!=expectedDirectories or \
     row["current_olrc_textual_relationships_verified"]!=len(legalNames) or \
     row["bounded_publisher_directory_or_chart_observations"]!=len(obsNames) or \
     row["dual_source_current_olrc_2026_department_directory_name_concordances"]!=sum(
      x["current_department_listing_name_corroborated"] for x in rows if x["from_id"]==id) or \
     row["remaining_fam_current_directory_gap"] is not (key=="STATE"):
   fail("Department source reconciliation mismatched old canonical identifiers: "+id)
  if any(row[k] is not False for k in (
     "full_current_department_hierarchy_source_qualified",
     "amendment_repeal_and_successor_legal_effect_independently_reviewed",
     "department_organization_current_to_2026_10_26_certified",
     "present_day_direct_supervision_or_command_verified","atlas_admitted")) or \
     row["qualified_full_adl1_department_denominator"] is not None or \
     row["legal_source_relationships_approved_for_public_atlas"]!=0:
   fail("False current federal first-level count, legal effect or Atlas promotion: "+id)
 return {"errors":errors,"summary":{
  "OLRC_through":"Public Law 119-124 (2026-10-15)","current_original_sections":7,
  "new_original_department_pages":3,"agency_source_access_gaps":1,
  "retained_existing_DHS_chart_boxes":34,"bounded_department_observations":23,
  "sourced_statutory_relationship_candidates":28,"VA_two_source_name_concordances":4,
  "critical_legal_operational_exceptions":11,
  "actual_current_ADL1_denominator":None,"new_canonical_component_ids":0,
  "new_admitted_legal_or_command_edges":0}}
if __name__=="__main__":
 result=validate(load())
 print(json.dumps({"status":"source_qualified_not_independently_legally_adjudicated" if not result["errors"] else "invalid",**result},indent=2))
 if result["errors"]:sys.exit(1)
