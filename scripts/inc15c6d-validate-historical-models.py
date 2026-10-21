#!/usr/bin/env python3
"""Reconcile immutable, nonadditive HHS historical publisher cohorts; no legal promotion."""
import hashlib
import json
from pathlib import Path
import sys

BASE=Path(__file__).resolve().parents[1]
DOCS={
 "inc15c6d-hhs-historical-source-office-observations":("5e6fcccf675aef26c816404bef49f9a07a2bc06e","dc4fdf0313a6f7c7073b3e8951184be264b769be",19),
 "inc15c6d-arpah-fy2025-organization-chart":("b79eaca5c51237590ff6620d952aadd15e6beab4","05168f4673fb3d91efceecaf043ea50a7c0c3667",15),
 "inc15c6d-hhs-historical-source-coverage":("8de831f4c35723a3457ab51ab6331b3648c995ee","6e1e5870aad611e56d3efa3cd741df0b1f76a71e",5)
}
NOTICE_EXPECTED={
 "dab_2012_notice":("2012-03-02",6,"INC15C6-HHS-EXCEPTION-DAB",
  ("Immediate Office of the Chair","Appellate Division","Civil Remedies Division",
  "Medicare Operations Division","Alternative Dispute Resolution Division","Operations Division")),
 "omha_2005_notice":("2005-06-23",6,"INC15C6-HHS-EXCEPTION-OMHA",
  ("Office of Medicare Hearings and Appeals, Immediate Office",
   "Medicare Hearings and Appeals Field Offices",
   "Medicare Hearings and Appeals Mid-Atlantic Field Office",
   "Medicare Hearings and Appeals Mid-West Field Office",
   "Medicare Hearings and Appeals Western Field Office",
   "Medicare Hearings and Appeals Southern Field Office")),
 "omha_2015_notice":("2015-01-20",4,"INC15C6-HHS-EXCEPTION-OMHA",
  ("Medicare Hearings and Appeals Chief Judge's Office","Office of Operations",
  "Office of Programs","Medicare Hearings and Appeals Field Offices")),
 "arpah_2022_notice":("2022-05-27",3,"INC15C6-HHS-EXCEPTION-ARPAH",
  ("Advanced Research Projects Agency for Health","Acquisition and Contracting Office","Comptroller's Office"))
}
ARPA_EXPECTED=(
 "ARPA-H Office of the Director","Health Equity Dissemination and Implementation",
 "Health Data Office","Treatment Innovation Office",
 "Health Promotion & Disease Detection Office","Systems Technology Office",
 "Health Resources & Policy Office","Acquisition & Contracting Office",
 "Innovation & Entrepreneurship Office","Comptroller's Office",
 "Strategic Resources Office","Strategic Planning Office",
 "Legislative and Governmental Affairs Office","Engagement & Communications Office",
 "Equity & Inclusion Office"
)
SOURCE_SHA={
 "dab_2012_notice":"cefec870f1670f7bdaea68445a11b0be204fcd42466b2f3dd40ec63819e42369",
 "omha_2005_notice":"9fc58a57771e26b3d897203c6510bff9f33a11387f7de6b4e996b8600f6fbe42",
 "omha_2015_notice":"a3b7d5a3a92c9768ee4820e4cb56251317691c54a0d596a55139cd7c73e8eb91",
 "arpah_2022_notice":"57fc6ee11be04104e0bfd9a2d4a61aae867dc3d9cfae892256ce1bf42650b86a",
 "arpah_fy2025_cj":"1e325bfe20151762242c7f59a5df21f0113c8644f431aec5debb22f5671493d1"
}
def ensure(ok,msg):
 if not ok:raise ValueError("INC-15C.6D model rejected: "+msg)
def gitblob(raw):return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()
def load(relative,root=BASE):return json.loads((root/relative).read_text(encoding="utf8"))
def verify(root=BASE):
 models={}
 for name,(expected_model_blob,expected_schema_blob,count) in DOCS.items():
  path="model/federal/"+name+".json";schema_path="schemas/"+name+".schema.json"
  data=(root/path).read_bytes();schemas=(root/schema_path).read_bytes()
  ensure(gitblob(data)==expected_model_blob and gitblob(schemas)==expected_schema_blob,
   "source-bounded registered model or closed schema mutated: "+name)
  obj=json.loads(data);schema=json.loads(schemas)
  ensure(schema["$schema"]=="https://json-schema.org/draft/2020-12/schema" and
    schema["type"]=="object" and schema["additionalProperties"] is False and
    set(schema["properties"])==set(obj) and set(schema["required"])==set(obj) and
    schema["properties"]["items"]["minItems"]==count and schema["properties"]["items"]["maxItems"]==count and
    schema["properties"]["items"]["items"]["additionalProperties"] is False and
    len(obj["items"])==count,"closed schema count/fields or bounded scope changed")
  item_schema=schema["properties"]["items"]["items"]
  keys=set(item_schema["properties"])
  ensure(set(item_schema["required"])==keys and all(set(it)==keys for it in obj["items"]),
    "unapproved institution authority field or missing source record")
  models[name]=obj
 notice,arpa,coverage=(models[k] for k in DOCS)
 ensure(notice["source_observation_count"]==19 and notice["historical_official_notices"]==4
  and notice["hhs_current_legal_first_level_denominator"] is None
  and notice["current_legal_identifications_certified"]==0
  and notice["signed_delegation_or_operational_command_certified"]==0
  and notice["new_canonical_institution_ids_minted"]==0
  and notice["cross_edition_counts_nonadditive"] is True,
  "legal completeness claimed from historical notice")
 by={}
 for o in notice["items"]:by.setdefault(o["source_key"],[]).append(o)
 ensure(set(by)==set(NOTICE_EXPECTED),"source notice added/dropped")
 for key,(edition,count,prior,names) in NOTICE_EXPECTED.items():
  rows=by[key]
  ensure(len(rows)==count and tuple(o["source_label"] for o in rows)==names,
    "historic publisher names, order or count mismatch "+key)
  for row in rows:
   ensure(row["source_edition"]==edition and row["prior_hhs_exception_reference"]==prior
    and row["source_original_sha256"]==SOURCE_SHA[key]
    and row["source_pdf_physical_page"] in (1,2,3)
    and row["office_name_source_evidence_only"] is True
    and row["canonical_office_id"] is None
    and row["present_day_office_exists_verified"] is False
    and row["statutory_or_adjudication_authority_certified"] is False
    and row["operational_supervision_certified"] is False,
    "office source epoch or legal status promoted "+key)
 ensure(arpa["source_original_sha256"]==SOURCE_SHA["arpah_fy2025_cj"]
  and arpa["source_pdf_physical_pages"]==51 and arpa["source_chart_pdf_physical_page"]==6
  and arpa["as_printed_chart_box_count"]==15
  and arpa["as_printed_office_labels_beneath_director"]==14
  and arpa["source_footnote_proposes_reducing_offices_from"]==14
  and arpa["source_footnote_proposes_reducing_offices_to"]==8
  and arpa["independently_verified_implementation_of_eight_office_chart"] is False
  and arpa["current_legal_first_level_denominator"] is None
  and arpa["newly_minted_canonical_office_ids"]==0,
  "ARPA-H proposed organizational consolidation unlawfully promoted")
 ensure(tuple(x["publisher_text_label"] for x in arpa["items"])==ARPA_EXPECTED,
  "ARPA-H original 15 chart boxes changed")
 for i,x in enumerate(arpa["items"]):
  ensure(x["source_chart_box_position"]==i+1 and x["original_source_pdf_physical_page"]==6
    and x["source_visual_parent_box_id"]==(None if i==0 else "INC15C6D-ARPAH-FY2025-BOX-01")
    and x["confirmed_current_legal_office_id"] is None
    and x["present_day_still_active_verified"] is False
    and x["realized_eight_office_reorganization_verified"] is False
    and x["reporting_or_budget_delegation_verified"] is False
    and x["source_manual_visual_transcription"] is True,
    "ARPA-H chart entry arbitrarily certified")
 counts=[6,6,4,3,15]
 ensure(coverage["five_original_pdf_source_editions"]==5
  and coverage["historical_publisher_research_observations"]==34
  and coverage["current_hhs_legal_first_level_denominator"] is None
  and coverage["source_scoped_populations_not_additive"] is True
  and coverage["executed_arpah_eight_office_plan_certified"] is False
  and [x["source_scoped_observation_count"] for x in coverage["items"]]==counts,
  "source coverage partition arithmetic or legal boundaries changed")
 for x in coverage["items"]:
  ensure(x["retained_original_verified_in_git"] is True and
   x["no_addition_across_different_editions"] is True and
   x["current_organizational_denominator"] is None and
   x["all_reported_labels_legally_qualified"] is False and
   x["current_mission_or_adjudicative_authority_certified"] is False,
   "source labels promoted into current government hierarchy")
 original=(root/"model/federal/inc15c6-hhs-institutional-exception-boundaries.json").read_bytes()
 ensure(gitblob(original)=="3669a7aa2dd04f6b4fe07e916449a1728bb569b7",
  "four HHS exception predecessor source identities changed")
 old=json.loads(original)
 ensure(old["hhs_indexed_name_population"]==29 and old["edition_local_govman_hhs_subentries"]==11
  and old["oig_publisher_internal_office_groups"]==6
  and len(old["items"])==4,"source population no longer consistent with predecessors")
 m=load("model/federal/manifest.json",root)
 paths=["model/federal/"+key+".json" for key in DOCS]
 ext=m.get("federal_institutional_breadth_15c6d_extension")
 ensure(all(path in m["models"] for path in paths) and
  ext["id"]=="ARFI-FED-INC15C6D-DAB-OMHA-ARPAH-HISTORICAL-EDITIONS"
  and ext["historical_source_observations_total_nonadditive"]==34
  and ext["present_day_federal_or_hhs_legal_first_level_denominator"] is None
  and ext["current_jurisdiction_or_delegation_verified"] is False
  and ext["arpa_h_14_to_8_implementation_certified"] is False
  and ext["newly_minted_canonical_institution_ids"]==0,
  "model manifest incorrectly certifies present-day HHS legal structure")
 return {"five_historical_source_editions":5,"notice_source_observations":19,
  "arpa_h_budget_chart_boxes":15,"nonadditive_source_observations":34,
  "new_canonical_ids":0,"current_hhs_legal_first_level_denominator":None,
  "arpa_h_eight_office_plan_verified_implemented":False}

if __name__=="__main__":
 try: print(json.dumps(verify(),indent=2))
 except Exception as e: print(str(e),file=sys.stderr);sys.exit(1)
