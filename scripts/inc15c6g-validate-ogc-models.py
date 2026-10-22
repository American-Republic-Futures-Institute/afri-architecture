#!/usr/bin/env python3
"""Validate INC-15C.6G HHS OGC original, 39 units, 22 roles, 39 typed relations.

Edition-scoped publisher statements are not legal command, individual delegation,
or a complete HHS organizational census. Exact GovInfo bytes require a pinned
source hash set only after independent source acquisition and review.
"""
from __future__ import annotations
import hashlib, importlib.util, json, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OGC="INC15C3-HHS-LINK-OGC"
PINNED_SOURCE_SHA256="e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76"
PINNED_SOURCE_BYTES=204358
FILES={
 "inc15c6g-ogc-hierarchy":("42d9e184816e1fb892bcd8a2cf7e75a2fbd1d173","2ddf71dc05c55f3f1d756163f44bea4995ac8af7",39),
 "inc15c6g-ogc-role-classes":("9674cc427626acd4af77821ea72019fea9659e76","4b1941aff1a7e4e36f58cbbf8027875c226edd09",22),
 "inc15c6g-ogc-institutional-interfaces":("7ac31879e5673fd3354ee8cd057455e320dbc177","51d968c246a1e3b6eb70e2a4d3b7db369ec3a49d",39),
 "inc15c6g-ogc-source-coverage":("d2129611d758ff854149a91c9fba63a0699d64a8","e8bb030f421e4c427a2d34a328ffde29c068f464",11)
}
DIVISION_CODES=("ARPAH","CMSD","CFAD","CPD","ETH","FDD","GLD","DPTD","PHD","NCLID","UACLRD")
OLR_CODES=("OLR-BUD","OLR-CORR","OLR-HCS","OLR-IT","OLR-LI","OLR-PPP")
NESTED={
 "CMSD":("CMSD-LIT","CMSD-PR","CMSD-PI","CMSD-PE"),
 "CPD":("CPD-CR","CPD-HIP"),
 "ETH":("ETH-AP","ETH-PA"),
 "FDD":("FDD-LIT","FDD-PR"),
 "GLD":("GLD-CE","GLD-PFI"),
 "DPTD":("DPTD-GA","DPTD-HIT","DPTD-PR","DPTD-PEH"),
 "PHD":("PHD-IHS","PHD-NIH","PHD-PHS")
}
TYPE_COUNTS={
 "publisher_described_legal_services_client":23,
 "individual_child_legal_representation":1,
 "case_scoped_OGC_complex_litigation_service":1,
 "department_wide_professional_ethics_service":1,
 "department_wide_legal_services_domain":1,
 "express_statutory_jurisdiction_legal_counsel_carveout":1,
 "FDA_ChiefCounsel_administrative_location_only":1,
 "FDA_ChiefCounsel_professional_reporting":1,
 "CMSD_professional_reporting_via_CLO":1,
 "case_specific_adverse_client_representation_exclusion":2,
 "internal_OGC_conflicted_legal_function_separation":1,
 "duty_location_non_organizational_and_limited_site_administration":1,
 "General_Counsel_direct_professional_reporting":1,
 "binding_legal_advice_source_scope_with_external_citation":1,
 "publisher_reports_secretarial_ethics_role_delegations":1,
 "OGC_predecessor_statement_rescission_source_bound":1
}
def check(c,msg):
 if not c:raise ValueError("INC-15C.6G REJECTED: "+msg)
def gitblob(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
def jload(rel,root=ROOT):return json.loads((root/rel).read_text(encoding="utf-8"))
def ty(v):
 if v is None:return "null"
 if isinstance(v,bool):return "boolean"
 if type(v) is int:return "integer"
 if isinstance(v,str):return "string"
 if isinstance(v,list):return "array"
 if isinstance(v,dict):return "object"
 return "invalid"

def validate(root=ROOT):
 models={}
 for n,(expected_model,expected_schema,cnt) in FILES.items():
  mf=root/("model/federal/"+n+".json")
  sf=root/("schemas/"+n+".schema.json")
  raw=mf.read_bytes();schraw=sf.read_bytes()
  check(gitblob(raw)==expected_model and gitblob(schraw)==expected_schema,
   "source-transcribed model or closed schema Git blob changed: "+n)
  m=json.loads(raw);s=json.loads(schraw)
  check(s.get("$schema")=="https://json-schema.org/draft/2020-12/schema"
   and s.get("type")=="object" and s.get("additionalProperties") is False
   and set(s["required"])==set(m)==set(s["properties"]),
   "root schema fields or source scope not closed "+n)
  for field,val in m.items():
   if field!="items" and "const" in s["properties"][field]:
    check(val==s["properties"][field]["const"],"altered source-cohort legal boundary "+field)
  items=m["items"];rows=s["properties"]["items"]
  check(len(items)==cnt and rows["minItems"]==cnt and rows["maxItems"]==cnt
   and rows["items"]["additionalProperties"] is False and
   len({x["id"] for x in items})==cnt,"publisher research rows added/dropped/duplicate")
  for record in items:
   types=rows["items"]["properties"]
   check(set(record)==set(types)==set(rows["items"]["required"]),"invented source organizational field")
   for k,v in record.items():
    rule=types[k]
    if "const" in rule:check(v==rule["const"],"illegal source field promotion "+k)
    if "enum" in rule:check(v in rule["enum"],"unapproved source relationship type "+k)
    if "type" in rule:
     expected=rule["type"]
     check(ty(v) in (expected if isinstance(expected,list) else [expected]),"wrong source field type "+k)
  models[n]=m
 hier=models["inc15c6g-ogc-hierarchy"]
 positions=models["inc15c6g-ogc-role-classes"]
 edges=models["inc15c6g-ogc-institutional-interfaces"]
 coverage=models["inc15c6g-ogc-source-coverage"]
 check(hier["OGC_division_count"]==11 and hier["OLR_named_branch_count"]==6
  and hier["named_component_rows_total"]==39
  and hier["independently_qualified_effective_date"] is None
  and hier["current_HHS_first_level_legal_denominator"] is None
  and hier["published_satellite_offices_are_not_independent_components"] is True
  and hier["group_branch_section_and_division_counts_nonadditive"] is True
  and hier["new_canonical_federal_institutions_minted"]==0,
  "OGC publisher count mistaken for current HHS legal agency count")
 units={x["id"]:x for x in hier["items"]}
 expected_ogc=set(["INC15C6G-OGC-"+s for s in DIVISION_CODES]+["INC15C6G-OGC-IMM"])
 root_units=[x for x in hier["items"] if x["parent_edition_local_id"]==OGC]
 check(set(x["id"] for x in root_units)==expected_ogc
  and len([x for x in root_units if x["publisher_structural_type"]=="division"])==11,
  "11 OGC publisher divisions or Immediate Office root changed")
 check(set(x["edition_local_code"] for x in hier["items"] if x["parent_edition_local_id"]=="INC15C6G-OGC-OLR")==set(OLR_CODES),
  "six independently published Office of Legal Resources branches incomplete")
 check({x["edition_local_code"] for x in hier["items"] if x["parent_edition_local_id"]=="INC15C6G-OGC-IMM"}=={"OLR","GCL"},
  "Immediate Office includes OLR and legislation section; role descriptions not separate units")
 for parent,names in NESTED.items():
  check({x["edition_local_code"] for x in hier["items"] if x["parent_edition_local_id"]=="INC15C6G-OGC-"+parent}==set(names),
   "publisher nested branches/groups/sections changed: "+parent)
 for x in hier["items"]:
  check(x["parent_edition_local_id"] in units or x["parent_edition_local_id"]==OGC,
   "fabricated OGC organizational parent")
  check(x["document_number"]=="2026-19903" and x["published_on"]=="2026-09-29"
   and x["legal_effective_date"] is None and x["satellite_duty_location"] is False
   and x["new_canonical_HHS_institution_id"] is None and
   x["independent_role_appointment_and_delegation_verified"] is False and
   x["cross_HHS_supervisory_command_inferred"] is False,
   "OGC organizational notice promoted into agency command or particular role holder")
 check(positions["role_classes_transcribed"]==22 and
  positions["individual_people_and_vacancies_not_enumerated"] is True and
  positions["external_appointing_or_delegation_instruments_retrieved_and_verified"] is False
  and positions["independently_qualified_effective_date"] is None
  and positions["aggregate_current_HHS_first_level_unit_population"] is None
  and positions["no_new_canonical_agency_ids"]==0,
  "role classes converted into filled federal offices")
 for x in positions["items"]:
  check(x["linked_ogc_unit_id"] in units or x["linked_ogc_unit_id"]==OGC,
   "OGC professional role assigned to an invented office")
  check(x["currently_named_incumbent"] is None and x["headcount_or_occupied_positions_certified"] is None
   and x["independent_external_signed_delegation_instrument_retained"] is False
   and x["new_canonical_HHS_institution_id"] is None
   and x["legal_command_over_client_agency_inferred"] is False,
   "OGC role equated to individual, new agency or client command")
 check(edges["source_relationship_records"]==39 and
  edges["legal_services_client_edge_count"]==23 and
  edges["OIG_exclusion_source_qualified"] is True and
  edges["OGC_legal_direction_over_OIG_certified"] is False and
  edges["UACLRD_independent_child_representation_boundary"] is True
  and edges["satellites_not_separately_established_offices"] is True
  and edges["separately_qualified_legal_effective_date"] is None
  and edges["no_new_canonical_federal_institutions"]==0
  and edges["relationship_type_counts"]==TYPE_COUNTS,
  "typed source relations recast as legislative authority")
 prior_path="model/federal/inc15c3-hhs-directory-reconciliation.json"
 check(gitblob((root/prior_path).read_bytes())=="37d06d6341a560a0689654819816e1396624b890",
  "existing HHS source identity directory tampered or replaced")
 prior=jload(prior_path,root)
 check(any(v["id"]=="INC15C3-HHS-LINK-OGC" and v["source_name"]=="Office of the General Counsel"
    for v in prior["items"]), "canonical OGC directory identity not preserved")
 priorIDs={v["id"] for v in prior["items"]}
 tcount={}
 for x in edges["items"]:
  tcount[x["relationship_type"]]=tcount.get(x["relationship_type"],0)+1
  check(x["source_ogc_unit_id"] in units or x["source_ogc_unit_id"]==OGC,
   "source OGC office missing")
  check(x["target_existing_HHS_index_id"] in priorIDs or x["target_existing_HHS_index_id"] is None,
   "invented HHS canonical agency reference")
  check(x["target_ogc_unit_id"] is None or x["target_ogc_unit_id"] in units,
   "invented intra-OGC office target")
  check(x["source_document_id"]=="2026-19903" and x["source_publication_date"]=="2026-09-29"
   and x["source_legal_effective_date"] is None and
   x["externally_cited_instrument_independently_qualified"] is False
   and x["signed_client_agency_command_transfer_verified"] is False
   and x["ALJ_case_control_or_adjudicative_decision_power_verified"] is False
   and x["independent_OIG_counsel_override_verified"] is False
   and x["named_individual_power_assignment_verified"] is False and
   x["current_whole_HHS_legal_first_level_count"] is None,
   "OGC client/legal citation recast as commanding another agency")
 check(tcount==TYPE_COUNTS,"missing/duplicated source relationship types")
 bytype=lambda typ:[x for x in edges["items"] if x["relationship_type"]==typ]
 check(bytype("express_statutory_jurisdiction_legal_counsel_carveout")[0]["target_existing_HHS_index_id"]=="INC15C3-HHS-LINK-OIG",
  "OIG independent counsel exclusion no longer anchored")
 check(bytype("internal_OGC_conflicted_legal_function_separation")[0]["target_ogc_unit_id"]=="INC15C6G-OGC-CFAD",
  "UAC legal division incorrectly collapsed into conflicting OGC division")
 check(set(x["target_existing_HHS_index_id"] for x in bytype("case_specific_adverse_client_representation_exclusion"))=={None,"INC15C3-HHS-LINK-ACF"},
  "UAC representation conflict boundary with ACF/ORR changed")
 check(set(x["target_existing_HHS_index_id"] for x in bytype("publisher_described_legal_services_client") if x["source_ogc_unit_id"]=="INC15C6G-OGC-CMSD")==
   {"INC15C3-HHS-LINK-CMS","INC15C3-HHS-LINK-OMHA","INC15C3-HHS-LINK-DAB"},
  "CMSD serving DAB/OMHA should not be converted into ALJ case control")
 check(coverage["OGC_eleven_divisions_publisher_denominator"]==11
  and coverage["OGC_nested_component_rows_nonadditive"]==39
  and coverage["prior_HHS_index_name_population"]==29
  and coverage["prior_HHS_Government_Manual_entries"]==11
  and coverage["prior_HHS_OIG_internal_groups"]==6 and
  coverage["prior_HHS_historical_notice_observations"]==34
  and coverage["prior_OCR_internal_AT10_components"]==6
  and coverage["HHS_whole_current_legal_first_level_institution_denominator"] is None
  and coverage["cross_epoch_count_addition_authorized"] is False
  and coverage["source_research_no_new_canonical_institution_ids"]==0,
  "nonadditive source-era denominators altered")
 check(len(coverage["items"])==11 and all(v["source_count_additive_to_HHS_current_legal_first_level"] is False for v in coverage["items"]),
  "source coverage used as additive legal institutional denominator")
 check(len(PINNED_SOURCE_SHA256)==64 and PINNED_SOURCE_BYTES==204358,
  "official original source has not been independently reviewed/pinned; do not merge")
 p=root/"evidence/hhs-ogc-2026-statement/receipts/acquisition.json"
 cap=json.loads(p.read_text())
 check(cap["original_sha256"]==PINNED_SOURCE_SHA256 and cap["original_byte_count"]==PINNED_SOURCE_BYTES,
  "publisher original SHA-256/bytes diverge from independently reviewed approved original")
 spec=importlib.util.spec_from_file_location("inc15c6g_original",root/"scripts/inc15c6g-ogc-original.py")
 mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 try:
  verified_original=mod.verify()
 except Exception as exc:
  raise ValueError("INC-15C.6G REJECTED: original Git source PDF or separate receipts fail independent validation: "+str(exc)) from exc
 check(verified_original["original_sha256"]==PINNED_SOURCE_SHA256,
   "original Git source PDF or separate receipts fail independent validation")
 manifest=jload("model/federal/manifest.json",root)
 ext=manifest.get("federal_institutional_breadth_15c6g_extension",{})
 check(len(manifest["models"])>=300 and len(set(manifest["models"]))==len(manifest["models"])
  and all("model/federal/"+k+".json" in manifest["models"] for k in FILES)
  and ext.get("2026_source_scoped_OGC_division_count")==11
  and ext.get("2026_source_scoped_OGC_org_component_count")==39
  and ext.get("2026_source_scoped_OGC_role_class_observations")==22
  and ext.get("2026_source_scoped_OGC_legal_service_and_boundary_relations")==39
  and ext.get("separate_OGC_legal_operative_effective_date_qualified") is None
  and ext.get("no_new_canonical_institution_ids")==0
  and ext.get("HHS_whole_legal_first_level_population") is None
  and ext.get("FY2026_ASE_and_FY2027_ASCRA_budget_proposals_not_implemented_by_OGC_notice") is True,
  "source qualification incorrectly inflated entire HHS or ASCRA/ASE proposal implementation")
 return {"original_verified":True,"source_SHA256":PINNED_SOURCE_SHA256,
  "HHS_OGC_divisions":11,"source_organizational_nodes":39,
  "OGC_roles_described":22,"typed_client_and_boundary_relations":39,
  "original_legal_effective_date":None,
  "HHS_legal_first_level_denominator":None,"new_canonical_agency_ids":0}

if __name__=="__main__":
 try:print(json.dumps(validate(),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
