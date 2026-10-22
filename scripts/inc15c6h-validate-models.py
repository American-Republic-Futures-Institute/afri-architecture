#!/usr/bin/env python3
"""INC-15C.6H: closed historical/operative source editions, citation transitions,
1997 OIG source-local OCIG roster, and authority-status nonpromotion.
The 2025 CFR citation was repealed before the 2026 OGC publication.
"""
from __future__ import annotations
import hashlib,importlib.util,json,sys
from pathlib import Path

BASE=Path(__file__).resolve().parents[1]
FAMILIES={
 "inc15c6h-counsel-authority-source-editions":("7badbe2de98572812f41901f36261f8b89380df1","4d1c102ad0e373d0358cec19304dbf1ac7a1c209",6),
 "inc15c6h-counsel-citation-status-transitions":("9b9a5746df2b700527a92935c00148059e1b7660","3802fb4222516e49c991719e52314930ed5dff2c",17),
 "inc15c6h-oig-1997-counsel-history":("2b06eb005bdfce06b64dba5a92b0466bc6dce533","f86fff1d6bd6dfcba032debedb1dd20788bce89b",11),
 "inc15c6h-counsel-source-coverage":("db2959efd90e95feaeecccfffb45e828eb4829a7","9cd9697c533f8a645e29ef64a6e787aa63fc4160",14)
}
BASELINES={
 "model/federal/inc15c3-hhs-directory-reconciliation.json":"37d06d6341a560a0689654819816e1396624b890",
 "model/federal/inc15c6g-ogc-institutional-interfaces.json":"7ac31879e5673fd3354ee8cd057455e320dbc177"
}
SHA={
 "CFR2025":"d821dcb01c90f90d4d6d543c777124175908fdb8b04ffd4fecb7af1814a4d245",
 "FDA2026":"70df495934558185f9d19b3e83f13882dc0351f25cc225ab1e2d85fb3adc2310",
 "OIG1997":"75d648c24c18802812128e2708fe29340458b274d522d8e97ef38129bac1fe0d",
 "EO2025":"1399f0857b1e4fe2b4c7fa9c3bb2fde0ee199ea372c47cdf4f3fecddc2994593",
 "FDACHART2026":"181fd936025d6c739c45dbd329366efcc7695f55d8e160e38c4c403d43793e32",
 "OGC2026":"e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76"
}
CODES_TOP=["AFA","AFC","AFE","AFF","AFG","AFH","AFJ"]
CODES_OCIG=["AFG-ADVICE","AFG-CIVIL","AFG-ADMIN","AFG-INDUSTRY"]
ORIGINAL_KEYS={"CFR2025":"cfr_2025_21_5","FDA2026":"fda_rule_2026","OIG1997":"oig_fr_1997_issue","EO2025":"eo_14215_2025","FDACHART2026":"fda_chart_2026"}
def reject(msg):
 raise ValueError("INC-15C.6H model rejected: "+msg)
def ok(cond,msg):
 if not cond:reject(msg)
def gitblob(data):
 return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()
def read_json(path,root=BASE):
 return json.loads((root/path).read_text(encoding="utf-8"))
def classof(x):
 if x is None:return "null"
 if type(x) is bool:return "boolean"
 if type(x) is int:return "integer"
 if type(x) is str:return "string"
 if type(x) is list:return "array"
 if type(x) is dict:return "object"
 return "invalid"
def check_closed_model(name,root):
 expected,schema_sha,count=FAMILIES[name]
 model_path="model/federal/"+name+".json"
 schema_path="schemas/"+name+".schema.json"
 raw=(root/model_path).read_bytes()
 schraw=(root/schema_path).read_bytes()
 ok(gitblob(raw)==expected and gitblob(schraw)==schema_sha,
    "source-verified model or strict schema Git digest changed: "+name)
 m=json.loads(raw);sch=json.loads(schraw)
 ok(sch.get("$schema")=="https://json-schema.org/draft/2020-12/schema"
   and sch.get("type")=="object" and sch.get("additionalProperties") is False
   and set(sch["required"])==set(m)==set(sch["properties"]),
   "closed source edition schema root")
 for k,value in m.items():
  rule=sch["properties"][k]
  if k!="items" and "const" in rule:
   ok(value==rule["const"],"source semantic boundary root metadata changed: "+k)
 rows=m["items"];rule=sch["properties"]["items"]
 ok(type(rows) is list and len(rows)==count and rule["minItems"]==count
    and rule["maxItems"]==count and len({x["id"] for x in rows})==count
    and rule["items"]["additionalProperties"] is False,
    "incorrect source population or duplicate record IDs")
 for row in rows:
  fields=rule["items"]["properties"]
  ok(set(row)==set(fields)==set(rule["items"]["required"]),"injected source or legal field")
  for key,v in row.items():
   spec=fields[key]
   if "const" in spec:ok(v==spec["const"],"fixed legal status altered "+key)
   if "type" in spec:
    valid=spec["type"] if isinstance(spec["type"],list) else [spec["type"]]
    ok(classof(v) in valid,"invalid source type "+key)
   if "enum" in spec:ok(v in spec["enum"],"forbidden citation lifecycle value "+key)
 return m

def validate(root=BASE):
 models={k:check_closed_model(k,root) for k in FAMILIES}
 source=models["inc15c6h-counsel-authority-source-editions"]
 lifecycle=models["inc15c6h-counsel-citation-status-transitions"]
 historical=models["inc15c6h-oig-1997-counsel-history"]
 coverage=models["inc15c6h-counsel-source-coverage"]
 for path,sha in BASELINES.items():
  ok(gitblob((root/path).read_bytes())==sha,"prior canonical HHS index/OGC model mutated: "+path)
 index=read_json("model/federal/inc15c3-hhs-directory-reconciliation.json",root)
 ids={x["id"] for x in index["items"]}
 ok({"INC15C3-HHS-LINK-OGC","INC15C3-HHS-LINK-OIG","INC15C3-HHS-LINK-FDA"}.issubset(ids),
    "HHS preexisting canonical identities altered")
 prior=read_json("model/federal/inc15c6g-ogc-institutional-interfaces.json",root)
 priorLinks={x["id"] for x in prior["items"]}
 ok({"INC15C6G-OGC-REL-28","INC15C6G-OGC-REL-29",
     "INC15C6G-OGC-REL-30","INC15C6G-OGC-REL-37"}.issubset(priorLinks),
    "prior OIG/FDA/EO publisher source references disappeared")
 # Independently approved original bytes and edition receipts, including 1997 full issue
 original_path="scripts/inc15c6h-capture-source-editions.py"
 spec=importlib.util.spec_from_file_location("c6h_source",root/original_path)
 module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 receipt_path=root/"evidence/hhs-counsel-source-editions/receipts/source-custody.json"
 receipts=json.loads(receipt_path.read_text())
 try:
  checked=module.validate(receipts,root/"evidence/hhs-counsel-source-editions")
 except Exception as e:
  reject("underlying exact official publisher source bytes or receipts invalid: "+str(e))
 ok(checked["publisher_source_originals"]==5 and
    checked["1997_OIG_source_is_whole_issue_not_individual_granule"] is True,
    "independent OIG issue source certification inflated")
 ok(source["source_edition_rows"]==6
   and source["new_publisher_originals_to_retain"]==5
   and source["already_retained_2026_OGC_originals"]==1
   and source["fda_removed_section"]=="21 CFR 5.1105"
   and source["fda_effective_removal_date"]=="2026-06-15"
   and source["outdated_citation_OGC_source_date"]=="2026-09-29"
   and source["separately_identified_2026_OGC_notice_effective_date"] is None
   and source["whole_HHS_current_legal_first_level_denominator"] is None
   and source["no_new_canonical_institutions"]==0,
   "source dates promoted into legal/current whole-HHS structure")
 sourceRows={x["id"].split("-")[-1]:x for x in source["items"]}
 ok(set(sourceRows)==set(SHA),"missing official counsel publisher edition")
 for key,row in sourceRows.items():
  ok(row["retained_original_sha256"]==SHA[key]
    and row["separate_HHS_current_institution_count"] is None
    and row["original_legal_authority_minted_by_source_ingestion"] is False
    and row["organizational_direct_command_inferred"] is False
    and row["independent_exhaustive_legal_and_statutory_review_completed"] is False,
    "publisher edition invented independent HHS legal authority")
  if key!="OGC2026":
   original=receipts["originals"][ORIGINAL_KEYS[key]]
   ok(row["original_publisher_url"]==original["official_url"]
     and row["source_publication_or_edition_date"]==original["published_date"]
     and row["separately_express_effective_date"]==original["distinct_effective_date"],
     "publisher epoch date or original URL changed")
  else:
   ok(row["separately_express_effective_date"] is None
      and row["original_publisher_url"]=="https://www.govinfo.gov/content/pkg/FR-2026-09-29/pdf/2026-19903.pdf",
      "OGC independent effective date invented")
 ok(sourceRows["FDACHART2026"]["source_publication_or_edition_date"]=="2026-10-13",
    "live FDA October chart replaced with unarchived Sept edition")
 ok(sourceRows["CFR2025"]["source_classification"]=="historical_operative_at_edition",
    "pre-repeal CFR section classified as currently active")
 ok(sourceRows["OGC2026"]["source_classification"]=="publisher_claim_citing_revoked_source",
    "outdated 2026 OGC legal citation artificially treated as operative section")
 # Typed dates and exact historical cross-edition conflicts.
 ok(lifecycle["source_rows"]==17 and lifecycle["signed_removal_effective_date"]=="2026-06-15"
    and lifecycle["erroneous_HHS_citation_date"]=="2026-09-29"
    and lifecycle["obsolete_CFR_citation_is_not_current_authority"] is True
    and lifecycle["FDA_OCC_existence_abolition_from_CFR_removal_unproven"] is True
    and lifecycle["no_HHS_IG_legal_direction_from_general_counsel_inferred"] is True
    and lifecycle["no_ALJ_case_or_apellate_control_inferred"] is True
    and lifecycle["current_HHS_first_level_legal_denominator"] is None
    and lifecycle["new_canonical_federal_institution_ids"]==0,
    "cross-source statement inflated into legal command or unrevoked citation")
 kinds={}
 relations={x["id"]:x for x in lifecycle["items"]}
 for i,x in enumerate(lifecycle["items"],1):
  ok(x["id"]=="INC15C6H-CITATION-"+str(i).zfill(2),"citation registry order/identity changed")
  k=x["source_edition_id"].split("-")[-1]
  ok(k in SHA and x["source_original_sha256"]==SHA[k]
      and x["legal_instrument_additional_independent_qualification_complete"] is False
      and x["signed_delegation_to_named_individual_established"] is False
      and x["legal_authority_over_independent_OIG_or_ALJ_inferred"] is False
      and x["distinct_HHS_new_agency_ID"] is None
      and x["different_source_eras_not_additive"] is True,
    "provision text incorrectly promoted to enterprise command or invented HHS agency")
  if x["predecessor_OGC_relation_id"] is not None:
   ok(x["predecessor_OGC_relation_id"] in priorLinks,"unregistered historical OGC ID crosswalk")
  kinds[x["source_observation_type"]]=kinds.get(x["source_observation_type"],0)+1
 ok(kinds==lifecycle["observation_type_counts"],"citation transition type counts drift")
 c6=relations["INC15C6H-CITATION-06"]
 ok(c6["source_edition_id"]=="INC15C6H-EDITION-OGC2026"
    and c6["target_reference"]=="21 CFR 5.1105"
    and c6["citation_status"]=="removed_before_citing_edition"
    and c6["source_epoch_or_publication_date"]=="2026-09-29"
    and lifecycle["signed_removal_effective_date"]<c6["source_epoch_or_publication_date"],
    "June15 repeal falsely classified as current on Sept29 OGC publication")
 for number,expected in [(3,"21 CFR 5.1105"),(4,"21 CFR 5.1110"),(5,"21 CFR 5.1100")]:
  row=relations["INC15C6H-CITATION-"+str(number).zfill(2)]
  ok(row["source_edition_id"]=="INC15C6H-EDITION-FDA2026"
    and row["target_reference"]==expected and row["express_legal_effective_date"]=="2026-06-15",
    "FDA effective amendatory instruction changed")
 for number in (7,8):
  row=relations["INC15C6H-CITATION-"+str(number).zfill(2)]
  ok(row["source_epoch_or_publication_date"]=="2026-10-13"
     and row["citation_status"]=="publisher_described_organizational_placement"
     and row["express_legal_effective_date"] is None,
     "FDA October snapshot promoted into signed legal effective date")
 for number in (11,12):
  row=relations["INC15C6H-CITATION-"+str(number).zfill(2)]
  ok(row["source_epoch_or_publication_date"]=="1997-06-05"
     and row["citation_status"]=="historical_publisher_claim",
     "OCIG 1997 historical structure promoted to current")
 ok(relations["INC15C6H-CITATION-13"]["predecessor_OGC_relation_id"]=="INC15C6G-OGC-REL-28",
    "OIG independent-counsel carveout lost")
 ok(relations["INC15C6H-CITATION-15"]["source_observation_type"]=="executive_order_applicable_law_exception",
    "EO §8 law-preservation carveout lost")
 ok(relations["INC15C6H-CITATION-16"]["citation_status"]=="unresolved_independent_legal_qualification",
    "OGC legal interpretations incorrectly treated as blanket settled authority")
 # 1997 edition-local structures do not claim 2026 roster.
 ok(historical["historical_OIG_top_level_component_labels"]==7
   and historical["historical_OCIG_internal_source_labels"]==4
   and historical["source_historical_unit_observations_total"]==11
   and historical["original_1997_full_issue_sha256"]==SHA["OIG1997"]
   and historical["independently_declared_effective_date"] is None
   and historical["current_OCIG_statutory_independent_legal_review_completed"] is False
   and historical["historical_OCIG_part_of_OGC_ongoing_supervision_claim"] is False
   and historical["HHS_current_legal_first_level_roster_total"] is None
   and historical["new_canonical_federal_agency_identifiers"]==0,
   "1997 OIG counsel roster incorrectly projected to 2026")
 bycode={x["publisher_source_code"]:x for x in historical["items"]}
 ok(set(bycode)==set(CODES_TOP+CODES_OCIG),"1997 source heading list altered")
 for key,row in bycode.items():
  ok(row["original_source_sha256"]==SHA["OIG1997"]
     and row["parent_edition_identity"]==("INC15C3-HHS-LINK-OIG" if key in CODES_TOP else "INC15C6H-OIG1997-AFG")
     and row["source_edition_status"]=="historical_1997_org_statement_not_current_certification"
     and row["cross_2026_office_identity_legally_equivalent_certified"] is False
     and row["canonical_legal_new_HHS_institution_id"] is None
     and row["current_subunit_roster_qualified"] is False
     and row["OGC_commands_OIG_counsel"] is False
     and row["current_statutory_authority_inferred_from_1997_notice"] is False,
    "1997 OIG OCIG historical placement illegally promoted")
 # Independently retained 2026 OGC original + source register provenance.
 receipt=read_json("evidence/hhs-ogc-2026-statement/receipts/git-custody.json",root)
 ok(receipt["original_sha256"]==SHA["OGC2026"],"prior original OGC 2026 source custody changed")
 ogc_path=root/receipt["original_repo_path"]
 ok(hashlib.sha256(ogc_path.read_bytes()).hexdigest()==SHA["OGC2026"],
    "earlier 2026 OGC publisher original changed")
 ok(coverage["source_coverage_registers"]==14
    and coverage["HHS_current_first_level_legal_denominator"] is None
    and coverage["newly_certified_canonical_HHS_institutions"]==0
    and coverage["source_records_and_legal_identifications_additive"] is False
    and coverage["current_status_of_revoked_21_CFR_5_1105"]=="removed_effective_2026-06-15"
    and coverage["OIG_research_original_1997_not_current_2026_census"] is True
    and coverage["FDA_publisher_OCC_role_still_observed_after_removal"] is True,
   "nonadditive source-era denominator became whole HHS legal count")
 ok(len(coverage["items"])==14 and all(
     x["current_HHS_first_level_denominator_increment"]==0 and
     x["additive_across_citation_epochs"] is False and
     x["independent_legal_authority_assertion"] is False
     for x in coverage["items"]),"source populations added to agency census")
 man=read_json("model/federal/manifest.json",root)
 ext=man["federal_institutional_breadth_15c6h_extension"]
 ok(len(man["models"])>=304 and len(set(man["models"]))==len(man["models"])
    and all("model/federal/"+k+".json" in man["models"] for k in FAMILIES)
    and ext["source_edition_rows"]==6 and ext["typed_source_status_transition_rows"]==17
    and ext["historic_1997_OIG_source_local_hierarchy_rows"]==11
    and ext["source_coverage_register_rows"]==14
    and ext["effective_2026_FDA_CFR_repeal_date"]=="2026-06-15"
    and ext["FDA_recent_publisher_chart_edition_date"]=="2026-10-13"
    and ext["OGC_notice_separate_legal_effective_date"] is None
    and ext["HHS_first_level_current_legal_denominator"] is None
    and ext["no_new_canonical_federal_agency_identifiers"]==0
    and ext["proposal_FY2026_ASE_FY2027_ASCRA_enacted_certified"] is False,
   "manifest status and legal-denominator qualification violated")
 return {"source_original_editions":6,"new_exact_official_originals":5,
   "effective_repeal":"2026-06-15","cited_after_removal":"2026-09-29",
   "FDA_new_chart_epoch":"2026-10-13","source_citation_statuses":17,
   "historical_OIG_OCIG_source_nodes":11,"nonadditive_source_cohorts":14,
   "new_canonical_institution_ids":0,"whole_HHS_first_level_denominator":None}

if __name__=="__main__":
 try:print(json.dumps(validate(),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
