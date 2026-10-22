#!/usr/bin/env python3
"""INC-15C.6H dated official legal citation research, NOT delegated authority.

FDA removed 21 CFR 5.1105 effective 2026-06-15; a later HHS OGC source
cited it on 2026-09-29. Source-version conflict != FDA counsel dissolution.
1997 OIG/OCIG counsel, EO 14215 and post-repeal FDA chart remain distinct,
explicitly source-scoped observations.
"""
from __future__ import annotations
import hashlib,importlib.util,json,re,sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
SOURCES={
 "cfr_2025_21_5":("d821dcb01c90f90d4d6d543c777124175908fdb8b04ffd4fecb7af1814a4d245",228136,"2025-04-01",None),
 "fda_rule_2026":("70df495934558185f9d19b3e83f13882dc0351f25cc225ab1e2d85fb3adc2310",251677,"2026-06-15","2026-06-15"),
 "oig_fr_1997_issue":("75d648c24c18802812128e2708fe29340458b274d522d8e97ef38129bac1fe0d",2124538,"1997-06-05",None),
 "eo_14215_2025":("1399f0857b1e4fe2b4c7fa9c3bb2fde0ee199ea372c47cdf4f3fecddc2994593",15803,"2025-02-18",None),
 "fda_chart_2026":("181fd936025d6c739c45dbd329366efcc7695f55d8e160e38c4c403d43793e32",31184,"2026-10-13",None),
}
SOURCE_MANIFEST="evidence/hhs-counsel-source-editions/receipts/source-custody.json"
OGC_SHA="e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76"
MODEL={
 "inc15c6h-counsel-authority-source-editions":("09a0684e432d52cf3142ded502660efd50fcd54f","a085eb87eeb562a99a72a114f464c7c1763a3e69",6),
 "inc15c6h-counsel-citation-status-transitions":("980e7a897e366c7dce21e4f8223afc9ba6778506","9d62c9de89ccb0db6bc7dbc015132db385e0b81b",17),
 "inc15c6h-oig-1997-counsel-history":("2b06eb005bdfce06b64dba5a92b0466bc6dce533","f86fff1d6bd6dfcba032debedb1dd20788bce89b",11),
 "inc15c6h-counsel-source-coverage":("db2959efd90e95feaeecccfffb45e828eb4829a7","12a162e9c97c6cf4e1193b1c041a779a127fd40c",14),
 "inc15c6h-counsel-authority-boundaries":("cf03bc281b01a9affc700a4fc44caf8cdaf3a9bf","c141fdd274acfc6a20e75b63d9b632101d2da544",11),
}
PRIOR={
 "model/federal/inc15c3-hhs-directory-reconciliation.json":"37d06d6341a560a0689654819816e1396624b890",
 "model/federal/inc15c6g-ogc-institutional-interfaces.json":"7ac31879e5673fd3354ee8cd057455e320dbc177",
}
def reject(msg):raise ValueError("INC-15C.6H REJECTED: "+msg)
def check(cond,msg):
 if not cond:reject(msg)
def blob(data):return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\x00"+data).hexdigest()
def read(rel,root=BASE):return (root/rel).read_bytes()
def load(rel,root=BASE):return json.loads(read(rel,root))
def kind(v):
 if v is None:return"null"
 if type(v) is bool:return"boolean"
 if type(v) is int:return"integer"
 if type(v) is str:return"string"
 if type(v) is list:return"array"
 if type(v) is dict:return"object"
 return"unknown"
def closed(m,s,n,count):
 check(s.get("$schema")=="https://json-schema.org/draft/2020-12/schema" and
  s.get("additionalProperties") is False and s.get("type")=="object" and
  set(s["required"])==set(m)==set(s["properties"]),
  "closed source edition schema root mismatched: "+n)
 for k,v in m.items():
  rule=s["properties"][k]
  if "const" in rule:check(v==rule["const"],"source metadata or legal qualification altered: "+k)
 rows=m["items"];a=s["properties"]["items"]
 check(len(rows)==count and a["minItems"]==count and a["maxItems"]==count
  and a["items"]["additionalProperties"] is False and
  len({x["id"] for x in rows})==count,"source cohort count/identity duplicate: "+n)
 for x in rows:
  props=a["items"]["properties"]
  check(set(x)==set(props)==set(a["items"]["required"]),"unknown or missing legally material source property")
  for field,v in x.items():
   rule=props[field]
   if "const" in rule:check(v==rule["const"],"forged source-constant status "+field)
   if "enum" in rule:check(v in rule["enum"],"unsupported source status "+field)
   if "type" in rule:
    options=rule["type"] if isinstance(rule["type"],list) else [rule["type"]]
    check(kind(v) in options,"source field has invalid type "+field)
   if "pattern" in rule:check(isinstance(v,str) and re.search(rule["pattern"],v),"invalid identity "+field)
def validate(root=BASE):
 for p,pin in PRIOR.items():
  check(blob(read(p,root))==pin,"upstream HHS institution identities or OGC legal service boundary mutated: "+p)
 models={}
 for n,(model_sha,schema_sha,count) in MODEL.items():
  path="model/federal/"+n+".json";sp="schemas/"+n+".schema.json"
  raw=read(path,root);sch=read(sp,root)
  check(blob(raw)==model_sha and blob(sch)==schema_sha,"pinned source model or schema co-forgery: "+n)
  m=json.loads(raw);s=json.loads(sch)
  closed(m,s,n,count);models[n]=m
 epochs=models["inc15c6h-counsel-authority-source-editions"]
 timeline=models["inc15c6h-counsel-citation-status-transitions"]
 oig=models["inc15c6h-oig-1997-counsel-history"]
 coverage=models["inc15c6h-counsel-source-coverage"]
 boundaries=models["inc15c6h-counsel-authority-boundaries"]
 check(epochs["source_edition_rows"]==6 and epochs["new_publisher_originals_retained"]==5
  and epochs["no_new_canonical_institutions"]==0
  and epochs["fda_removed_section"]=="21 CFR 5.1105" and
  epochs["fda_effective_removal_date"]=="2026-06-15" and
  epochs["outdated_citation_OGC_source_date"]=="2026-09-29"
  and epochs["separately_identified_2026_OGC_notice_effective_date"] is None
  and epochs["whole_HHS_current_legal_first_level_denominator"] is None
  and epochs["all_rows_nonadditive_source_editions"] is True,
  "2026 OGC notice falsely enacted FDA rule or added HHS legal institution")
 entries={x["id"]:x for x in epochs["items"]}
 check(len(entries)==6 and set(entries)=={
  "INC15C6H-EDITION-CFR2025","INC15C6H-EDITION-FDA2026",
  "INC15C6H-EDITION-OIG1997","INC15C6H-EDITION-EO2025",
  "INC15C6H-EDITION-FDACHART2026","INC15C6H-EDITION-OGC2026"},
  "six exact publisher source epochs changed")
 src_map={"cfr_2025_21_5":"CFR2025","fda_rule_2026":"FDA2026",
  "oig_fr_1997_issue":"OIG1997","eo_14215_2025":"EO2025",
  "fda_chart_2026":"FDACHART2026"}
 manifest=load(SOURCE_MANIFEST,root)
 check(set(manifest["originals"])==set(SOURCES) and
  manifest["WORM_external_certified"] is False and
  manifest["HHS_first_level_legal_denominator"] is None and
  manifest["no_canonical_id_added"] is True,
  "five edition original custody manifest incomplete or promoted legal authority")
 for k,(sha,size,published,effective) in SOURCES.items():
  receipt=manifest["originals"][k]
  raw=read("evidence/hhs-counsel-source-editions/"+receipt["original_path"],root)
  check(len(raw)==size and hashlib.sha256(raw).hexdigest()==sha and
   receipt["original_sha256"]==sha and receipt["original_bytes"]==size and
   receipt["original_git_blob_sha1"]==blob(raw) and
   receipt["published_date"]==published and receipt["distinct_effective_date"]==effective and
   receipt["general_HHS_legal_authority_qualified"] is False and
   receipt["WORM_independently_verified"] is False,
   "original publisher bytes or legally qualified date changed: "+k)
  record=entries["INC15C6H-EDITION-"+src_map[k]]
  check(record["official_publisher_source_key"]==k and
   record["retained_original_sha256"]==sha and
   record["original_byte_count"]==size and
   record["original_publisher_git_blob_sha1"]==blob(raw) and
   record["source_publication_or_edition_date"]==published and
   record["separately_express_effective_date"]==effective and
   record["original_is_preserved_and_integrity_verified"] is True and
   record["external_independent_WORM_custody"] is False and
   record["independent_exhaustive_legal_and_statutory_review_completed"] is False,
   "source edition falsely claims effective law, professional counsel dissolution or independent custody")
 ogc=entries["INC15C6H-EDITION-OGC2026"]
 check(ogc["retained_original_sha256"]==OGC_SHA and
  ogc["original_repository_relative_path"].endswith(OGC_SHA+"/2026-19903.pdf") and
  hashlib.sha256(read(ogc["original_repository_relative_path"],root)).hexdigest()==OGC_SHA and
  ogc["separately_express_effective_date"] is None,
  "previous OGC original/scope or independent effective date changed")
 check(timeline["source_rows"]==17 and
  timeline["FDA_CFR_section_revoked"]=="21 CFR 5.1105" and
  timeline["signed_removal_effective_date"]=="2026-06-15" and
  timeline["erroneous_HHS_citation_date"]=="2026-09-29" and
  timeline["obsolete_CFR_citation_is_not_current_authority"] is True and
  timeline["FDA_OCC_existence_abolition_from_CFR_removal_unproven"] is True and
  timeline["no_HHS_IG_legal_direction_from_general_counsel_inferred"] is True and
  timeline["no_ALJ_case_or_appellate_control_inferred"] is True and
  timeline["new_canonical_federal_institution_ids"]==0,
  "dated citation status incorrectly confers agency command or retains revoked CFR")
 cit={x["id"]:x for x in timeline["items"]}
 for x in timeline["items"]:
  record=entries.get(x["source_edition_id"])
  check(record is not None and x["source_original_sha256"]==record["retained_original_sha256"]
   and x["source_original_git_blob_sha1"]==record["original_publisher_git_blob_sha1"]
   and x["source_epoch_or_publication_date"]==record["source_publication_or_edition_date"]
   and x["legal_instrument_additional_independent_qualification_complete"] is False and
   x["signed_delegation_to_named_individual_established"] is False and
   x["legal_authority_over_independent_OIG_or_ALJ_inferred"] is False and
   x["distinct_HHS_new_agency_ID"] is None,
   "citation not anchored to same immutable original or unsupported professional authority")
 check(cit["INC15C6H-CITATION-03"]["express_legal_effective_date"]=="2026-06-15" and
  cit["INC15C6H-CITATION-03"]["target_reference"]=="21 CFR 5.1105" and
  cit["INC15C6H-CITATION-06"]["citation_status"]=="removed_before_citing_edition" and
  cit["INC15C6H-CITATION-06"]["express_legal_effective_date"] is None and
  cit["INC15C6H-CITATION-15"]["publisher_section_or_paragraph"]=="Section 8(b)(i)-(ii) and 8(c)" and
  cit["INC15C6H-CITATION-07"]["source_epoch_or_publication_date"]=="2026-10-13",
  "revocation/citation/EO 14215 §8(b) or post-repeal chart chronology invalid")
 check(oig["historical_OIG_top_level_component_labels"]==7 and
  oig["historical_OCIG_internal_source_labels"]==4 and
  oig["source_historical_unit_observations_total"]==11 and
  oig["original_1997_full_issue_sha256"]==SOURCES["oig_fr_1997_issue"][0] and
  oig["independently_declared_effective_date"] is None and
  oig["current_2026_OIG_roster_equivalence_independently_certified"] is False and
  oig["historical_OCIG_part_of_OGC_ongoing_supervision_claim"] is False and
  oig["new_canonical_federal_agency_identifiers"]==0,
  "1997 OIG historical structure inflated into current HHS")
 main_oig=[x for x in oig["items"] if x["parent_edition_identity"]=="INC15C3-HHS-LINK-OIG"]
 counsel_oig=[x for x in oig["items"] if x["parent_edition_identity"]=="INC15C6H-OIG1997-AFG"]
 check({x["publisher_source_code"] for x in main_oig}=={"AFA","AFC","AFE","AFF","AFG","AFH","AFJ"} and
  {x["publisher_source_code"] for x in counsel_oig}==
  {"AFG-ADVICE","AFG-CIVIL","AFG-ADMIN","AFG-INDUSTRY"},
  "OIG 1997 seven main and OCIG four subordinate original labels changed")
 check(boundaries["source_relationship_count"]==11 and
  boundaries["removed_regulation_5_1105_as_of_date"]=="2026-06-15" and
  boundaries["source_OGC_citation_after_removal"]=="2026-09-29" and
  boundaries["FDA_post_repeal_observation_epoch"]=="2026-10-13" and
  boundaries["FDA_counsel_institution_abolition_established"] is False and
  boundaries["OGC_supervisory_override_of_OIG_counsel"] is False and
  boundaries["ALJ_case_control_by_OGC_or_OIG_derived"] is False and
  boundaries["current_HHS_first_level_legal_denominator"] is None and
  boundaries["no_new_legal_institutions_created"]==0,
  "authority edge illegally inferred from source legal service or repealed contact rule")
 for e in boundaries["items"]:
  check(e["professional_HHS_OGC_reporting_not_abolished_by_information_rule"] is True and
   e["HHS_OIG_counsel_not_supervised_by_OGC"] is True and
   e["no_synthetic_signed_delegation_or_ALJ_control"] is True and
   e["normative_policy_model_created"] is False and
   e["new_canonical_federal_agency_identifier"] is None,
   "improper general supervisory command or policy assertion")
 check(coverage["source_coverage_registers"]==14 and
  coverage["HHS_current_first_level_legal_denominator"] is None and
  coverage["source_records_and_legal_identifications_additive"] is False and
  coverage["newly_certified_canonical_HHS_institutions"]==0 and
  coverage["current_status_of_revoked_21_CFR_5_1105"]=="removed_effective_2026-06-15",
  "HHS population false addition or revoked law current")
 check(all(x["additive_across_citation_epochs"] is False and
    x["any_distinct_agency_implied_by_record"] is False and
    x["independent_legal_authority_assertion"] is False for x in coverage["items"]),
    "nonadditive source population declared law or present-day whole-HHS count")
 check(not any("inc15c6h-ocig-1997-internal-components.json" in n for n in load("model/federal/manifest.json",root)["models"]),
  "duplicate OCIG source era model retained")
 ext=load("model/federal/manifest.json",root)
 q=ext.get("federal_institutional_breadth_15c6h_extension",{})
 check(len(ext["models"])==305 and len(set(ext["models"]))==305 and
  all("model/federal/"+n+".json" in ext["models"] for n in MODEL) and
  q.get("newly_custodied_official_originals")==5 and
  q.get("new_source_versioned_citation_records")==17 and
  q.get("new_typed_authority_boundary_records")==11 and
  q.get("2026_OGC_notice_citing_removed_5_1105_publication_date")=="2026-09-29" and
  q.get("whole_HHS_current_legal_first_level_denominator") is None and
  q.get("new_canonical_agency_identifiers_added")==0,
  "architecture manifest lacks qualified 5-source nonadditive citation states")
 # Source-specific extraction, exact official URLs, and date/identity statements
 # are independently rechecked in the archival validator, not merely our models.
 spec=importlib.util.spec_from_file_location("c6h_source",root/"scripts/inc15c6h-capture-source-editions.py")
 module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 try:validated=module.validate(manifest,root/"evidence/hhs-counsel-source-editions")
 except Exception as exc:reject("official original publisher bytes or source receipt invalid: "+str(exc))
 check(validated["publisher_source_originals"]==5 and
  validated["whole_HHS_legal_roster_denominator"] is None,"source archive validation false")
 return {"original_publisher_sources":6,"five_new_source_originals":5,
  "edition_local_citation_records":17,"1997_OIG_and_OCIG_historical_units":11,
  "authority_boundary_relationships":11,"nonadditive_source_cohorts":14,
  "removed_CFR_5_1105_effective":"2026-06-15",
  "post_repeal_FDA_chart_edition":"2026-10-13",
  "HHS_legal_first_level_denominator":None,"new_canonical_federal_institutions":0}
if __name__=="__main__":
 try:print(json.dumps(validate(),indent=2))
 except Exception as exc:
  print(str(exc),file=sys.stderr);sys.exit(1)
