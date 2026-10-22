#!/usr/bin/env python3
"""INC-15C.6E exact source edition and lifecycle validation.

Original ARPA-H HTML is reproducible; HHS FY2026 and FY2027 GDM PDFs are
UNARCHIVED public publisher web-text observations after HTTP 403 to source runner.
No proposal-as-implementation or budget-as-legal-authority inference.
"""
from __future__ import annotations
import hashlib,importlib.util,json,sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
PINNED={
 "inc15c6e-hhs-budget-proposal-epochs":("52b659cb97a1cd697e94b142cdf9e3a5d6898310","2781989c4ef3a828138bd7dabe05176d93f41c8d",{"items":6}),
 "inc15c6e-arpah-live-office-observations":("f3509c74158bb0d02a37e8d2fa72f5541ff1f2ef","7c6867e9f9ae6b1ce6403acf7f146abbc89b9856",{"office_items":10,"timeline_items":4,"items":14}),
 "inc15c6e-hhs-source-lifecycle-coverage":("62ba502bb2af468c1da2e73065dc38e42be12bbd","1df5cb465aabf298709eb96a8a6cc519316290d2",{"source_items":6,"exception_items":4,"items":10})
}
PUBLISHER_OFFICES=(
 "Business Innovation Division","Comptroller Division","Division of International Affairs",
 "Division of Government Relations and Strategy","Office of Information Technology and Data Innovation",
 "Office of Commercialization","Strategic Affairs Office","Health Science Futures",
 "Proactive Health","Scalable Solutions"
)
TIMELINE=(
 ("2025-10-20","October 20, 2025","Alicia Jackson"),
 ("2025-09-25","September 25, 2025","Scalable Solutions"),
 ("2024-12-19","December 19, 2024","Proactive Health"),
 ("2023-09-29","September 29, 2023","Resilient Systems")
)
EXCEPTION_IDS=("INC15C6-HHS-EXCEPTION-DAB","INC15C6-HHS-EXCEPTION-OMHA",
 "INC15C6-HHS-EXCEPTION-ARPAH","INC15C6-HHS-EXCEPTION-OIG")
SOURCE_STATUS=("hhs_fy2026_gdm","hhs_fy2027_gdm","arpah_people","arpah_timeline",
 "dab_overview","omha_chart")
LIFECYCLE={"observed_at_publisher","proposed_not_implemented","historical_superseded",
           "implemented_primary_source_qualified","unresolved"}
def fail(msg):raise ValueError("INC-15C.6E model rejected: "+msg)
def chk(cond,msg):
 if not cond:fail(msg)
def blob(raw):return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()
def read(p,root=BASE):return (root/p).read_bytes()
def load(p,root=BASE):return json.loads(read(p,root))
def validate(root=BASE):
 objs={}
 for k,(mhash,shash,lists) in PINNED.items():
  m="model/federal/"+k+".json";s="schemas/"+k+".schema.json"
  mb=read(m,root);sb=read(s,root)
  chk(blob(mb)==mhash and blob(sb)==shash,
      "source immutable research model or typed closed schema tampered: "+k)
  model=json.loads(mb);schema=json.loads(sb)
  chk(schema.get("$schema")=="https://json-schema.org/draft/2020-12/schema" and
   schema.get("type")=="object" and schema.get("additionalProperties") is False and
   set(schema.get("properties",{}))==set(model) and
   set(schema.get("required",[]))==set(model),
   "root closed schema missing or source edition added: "+k)
  for n,count in lists.items():
   spec=schema["properties"][n]
   chk(spec.get("minItems")==count and spec.get("maxItems")==count and
    spec["items"]["additionalProperties"] is False and
    isinstance(model[n],list) and len(model[n])==count and
    len({r["id"] for r in model[n]})==count and
    all(set(v)==set(spec["items"]["required"])==set(spec["items"]["properties"])
        for v in model[n]),"model cohort missing/duplicated/off-schema: "+k+"/"+n)
   for record in model[n]:
    for attr,rule in spec["items"]["properties"].items():
     if "const" in rule: chk(record[attr]==rule["const"],"source authority field mutation")
     if "enum" in rule:chk(record[attr] in rule["enum"],"invalid lifecycle enum")
     if "type" in rule:
      v=record[attr];typ=rule["type"];typ=[typ] if isinstance(typ,str) else typ
      kind=("null" if v is None else "boolean" if isinstance(v,bool)
        else "integer" if type(v) is int else "array" if isinstance(v,list)
        else "string" if isinstance(v,str) else "unsupported")
      chk(kind in typ,"schema type violation: "+attr)
  objs[k]=model
 budget=objs["inc15c6e-hhs-budget-proposal-epochs"]
 people=objs["inc15c6e-arpah-live-office-observations"]
 cover=objs["inc15c6e-hhs-source-lifecycle-coverage"]
 chk(budget["source_edition_count"]==2 and budget["proposal_records_count"]==6 and
   budget["original_hhs_budget_pdf_bytes_in_git"] is False and
   budget["budget_request_is_authority_instrument"] is False and
   budget["independent_effective_date_or_statutory_reorganization_certified"] is False and
   budget["current_HHS_legal_first_level_denominator"] is None and
   budget["new_canonical_institutions_created"]==0 and
   budget["source_era_reporting_and_budget_levels_are_not_additive"] is True and
   set(budget["approved_lifecycle_states"])==LIFECYCLE,
   "FY2026/27 GDM source proposal unapproved legal organization")
 planned={x["id"]:x for x in budget["items"]}
 chk(len(planned)==6 and
   planned["INC15C6E-FY2026-ENFORCEMENT"]["proposal_named_target"]=="Assistant Secretary for Enforcement" and
   planned["INC15C6E-FY2027-CIVIL_RIGHTS_APPEALS"]["proposal_named_target"]=="Assistant Secretary for Civil Rights and Appeals",
   "distinct HHS proposal target labels changed")
 chk(planned["INC15C6E-FY2026-ENFORCEMENT"]["planned_later_publisher_record"]==
      "FY2027:civil_rights_appeals" and
   planned["INC15C6E-FY2026-ENFORCEMENT"]["planned_later_relationship"]==
     "revised_functional_proposal_not_proven_same_legal_office",
   "FY2026/FY2027 proposal changed to legal identity equivalence")
 for x in budget["items"]:
  edition=x["publisher_fiscal_budget_edition"]
  chk(edition in ("FY2026","FY2027") and
   x["lifecycle_state"]=="proposed_not_implemented" and
   x["source_original_sha256"] is None and
   x["source_original_bytes_custodied"] is False and
   x["source_public_web_text_verified"] is True and
   x["source_pdf_physical_page"]==6 and
   x["source_original_pdf_url"]==
    ("https://www.hhs.gov/sites/default/files/fy-2026-gdm-cj.pdf" if edition=="FY2026"
      else "https://www.hhs.gov/sites/default/files/fy-2027-gdm-cj.pdf") and
   x["target_canonical_legal_institution_id"] is None and
   x["operative_instrument_url"] is None and x["independent_effective_date"] is None and
   x["enacted_or_implemented_organizational_transfer_verified"] is False and
   x["adjudicative_case_control_or_statutory_powers_transferred_verified"] is False and
   x["departmental_supervisory_command_verified"] is False,
   "budget public web text unlawfully made operative source: "+x["id"])
 chk(people["publisher_snapshot_retrieved_on"]=="2026-10-21" and
  people["observed_people_page_office_labels"]==10 and
  people["observed_timeline_event_mentions"]==4 and
  people["publisher_html_snapshot_is_effective_date"] is False and
  people["people_page_is_personnel_listing_not_legal_office_census"] is True and
  people["present_day_hhs_legal_first_level_denominator"] is None and
  people["FY2025_budget_14_to_8_plan_verified_implemented"] is False and
  people["new_canonical_institution_ids"]==0,
  "ARPA-H directory/timeline wrongly qualified legal organization")
 sp=importlib.util.spec_from_file_location("source",root/"scripts/inc15c6e-validate-original-custody.py")
 mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod)
 c,a,raw=mod.load(root/"evidence/hhs-arpah-2026-observation")
 chk(mod.validate(c,a,raw)["retained_arpah_original_html_sources"]==2,
     "original ARPA-H bytes and source receipt mismatch")
 html=raw["arpah_people"].decode("utf8");timeline=raw["arpah_timeline"].decode("utf8")
 chk(tuple(x["source_office_name"] for x in people["office_items"])==PUBLISHER_OFFICES,
   "ARPA-H original ten section office labels changed")
 for x in people["office_items"]:
  chk(x["source_provenance_role_text"] in html and
   x["source_office_name"] in html and
   x["observed_office_lifecycle_state"]=="observed_at_publisher" and
   x["independent_source_legal_office_id"] is None and
   x["independent_written_legal_qualification_complete"] is False,
   "ARPA-H staff role original source mismatch or illegal office ID")
  chk(x["command_budget_delegation_verified"] is False and
      x["currently_active_legal_institution_verified"] is False,
      "publisher people named office promoted into statutory command")
 for x,expected in zip(people["timeline_items"],TIMELINE):
  date,heading,subject=expected
  chk(x["publisher_event_date"]==date and x["source_date_heading"]==heading and
   x["source_event_subject"]==subject and heading in timeline and subject in timeline and
   x["historical_publisher_event_not_current_institution_certification"] is True and
   x["canonical_2026_legal_office_id"] is None,
   "ARPA-H historical timeline changed into current organizational statement")
 chk(cover["source_edition_count"]==6 and
   cover["official_publisher_HTML_originals_retained"]==2 and
   cover["source_original_pdf_count"]==0 and
   cover["prior_hhs_index_name_population"]==29 and
   cover["prior_govman_hhs_subentries"]==11 and
   cover["prior_oig_internal_office_groups"]==6 and
   cover["prior_historical_source_observation_rows"]==34 and
   cover["additive_government_institution_count"] is None and
   cover["complete_current_legal_HHS_first_level_denominator"] is None and
   cover["budget_request_organizational_change_not_implementation"] is True and
   cover["independent_statutory_or_legal_implementation_review_complete"] is False and
   cover["no_cross_edition_organization_counts_additive"] is True and
   cover["minted_canonical_ids"]==0,
   "HHS edition-local observations improperly added to agency census")
 chk(tuple(x["publisher_source_key"] for x in cover["source_items"])==SOURCE_STATUS and
    tuple(x["unchanged_exception_id"] for x in cover["exception_items"])==EXCEPTION_IDS,
    "HHS original sources or exception canonical IDs changed")
 for x in cover["source_items"]:
  k=x["publisher_source_key"]
  original=k in ("arpah_people","arpah_timeline")
  chk(x["exact_original_bytes_in_git"] is original and
    x["original_sha256"]==(None if not original else
      ("149e49bd3f1593b82027e7151414d907a6960cf03f22450ef6c4f9bcbfc20646" if k=="arpah_people"
        else "b30fa39c015976657905299a7aee3ee888dc3bfcaffde4f55e0431684e9bdcb3")) and
    x["original_bytes"]==(None if not original else (63246 if k=="arpah_people" else 56301)) and
    x["operative_reorganization_instrument_verified"] is False and
    x["publisher_public_text_cannot_confer_signed_authority"] is True,
    "source-original custody or legal assertion inflated: "+k)
 for x in cover["exception_items"]:
  chk(x["independently_verified_legal_reporting_change"] is False and
      x["budget_proposal_parent_office_implemented"] is False and
      x["current_canonical_legal_office_identifier"] is None and
      x["independent_adjudicative_or_inspector_general_power_certified"] is False,
      "HHS exception authority incorrectly promoted")
 for entry,families in ((people,("office_items","timeline_items")),(cover,("source_items","exception_items"))):
  expected=[(family,record["id"]) for family in families for record in entry[family]]
  chk(len(entry["items"])==len(expected),"catalog source-pointer count altered")
  for pointer,(family,record_id) in zip(entry["items"],expected):
   chk(pointer["record_family"]==family and
       pointer["source_record_id"]==record_id and
       pointer["id"]=="INC15C6E-INDEX-"+record_id and
       pointer["nonadditive_index_pointer_only"] is True and
       pointer["canonical_institution_id"] is None,
       "catalog index pointer incorrectly treated as additional legal organization")
 for name,h in (("model/federal/inc15c3-hhs-directory-reconciliation.json","37d06d6341a560a0689654819816e1396624b890"),
                ("model/federal/inc15c6-hhs-institutional-exception-boundaries.json","3669a7aa2dd04f6b4fe07e916449a1728bb569b7"),
                ("model/federal/inc15c6d-hhs-historical-source-coverage.json","8de831f4c35723a3457ab51ab6331b3648c995ee")):
  chk(blob(read(name,root))==h,"historical HHS source identity base changed")
 mf=load("model/federal/manifest.json",root)
 e=mf.get("federal_institutional_breadth_15c6e_extension")
 chk(len(mf["models"])>=293 and len(set(mf["models"]))==len(mf["models"]) and
   all("model/federal/"+k+".json" in mf["models"] for k in PINNED) and
    e["official_ARPAH_HTML_originals_retained"]==2 and e["HHS_budget_PDF_originals_retained"]==0 and
    e["distinct_FY2026_and_FY2027_GDM_budget_proposal_editions"]==2 and
    e["legal_first_level_denominator"] is None and
    e["certified_implementation_of_budget_reorganization"] is False and
    e["FY2026_ASE_FY2027_ASCRA_identity_equivalence_qualified"] is False and
    e["current_legal_reporting_or_adjudicative_control_qualified"] is False and
    e["existing_canonical_HHS_identifiers_replaced"]==0,
    "ARFI manifest claims unproven present-day HHS legal organization")
 return {"budget_proposal_epochs":2,"budget_research_records":6,
  "ARPAH_staff_page_office_names":10,"ARPAH_timeline_events":4,
  "retained_current_ARPAH_official_HTML_sources":2,
  "HHS_GDM_original_PDFs_custodied":0,
  "certified_budget_based_reorganization":False,
  "current_HHS_legal_first_level_denominator":None,
  "new_canonical_institution_ids":0}
if __name__=="__main__":
 try:print(json.dumps(validate(),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
