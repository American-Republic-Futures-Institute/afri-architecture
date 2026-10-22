#!/usr/bin/env python3
"""INC-15C.6F OCR: validate two exact signed source epochs, operative internal office
composition, published functions and explicitly bounded types of relationship.
Never infer HHS-wide agency reorganization, budget implementation, or ALJ power.
"""
from __future__ import annotations
import hashlib,importlib.util,json,sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
FAMILIES={
 "inc15c6f-ocr-dated-organization-epochs":("c681ed88f14a6d7d7766243808e6af882587669a","0161a4c033b73dc13af419a66f240881079d8caf",12),
 "inc15c6f-ocr-2026-notice-clauses":("d8b1e49ea318bf3cb5036ac6ef22fc1a905c234f","4796593d534e2be3c0061461fdb303ee8ca9974f",9),
 "inc15c6f-ocr-typed-source-relationships":("255689a81a81be83e6e5224f4bd90ff4f7b8c557","2fa72ee374c0384dad19aaa332fc964f21c9691a",13)
}
EXPECTED_2023=[
 ("AT","Office of the Director"),("ATA","Operations and Resources Division"),
 ("ATB","Policy Division"),("ATC","Health Information Privacy, Data, and Cybersecurity Division"),
 ("ATD","Enforcement Division"),("ATE","Strategic Planning Division")]
EXPECTED_2026=[
 ("AT","Immediate Office of the Director"),("ATA","Operations and Resources Division"),
 ("ATB","Civil Rights Division"),("ATC","Health Information Privacy, Data, and Cybersecurity Division"),
 ("ATD","Enforcement Division"),("ATE","Conscience and Religious Freedom Division")]
SOURCE_SHA={"2023":"7035eea1497113c5964fce2f6d3862b31c5452e34a0b80b1ee572bb50610cfad",
 "2026":"973323350377319d1e737d7b476ab90d18f754bd9d2505521c66b97524a22498"}
CHANGES={
 "I":"chapter_outline_reaffirmed","II":"replaces_entire_mission_text",
 "III":"replaces_entire_internal_organization_section","IV":"amends_director_function_text",
 "V":"replaces_C_subsection_functions","VI":"amends_D_subsection_part2",
 "VII":"replaces_E_subsection_functions","VIII":"replaces_F_subsection_functions",
 "IX":"conditional_continuation_of_existing_delegations"
}
EDGE_TYPES={
 "OCR_internal_organizational_composition":6,
 "source_notice_effective_date":1,
 "publisher_described_reporting":3,
 "existing_delegations_continued_subject_to_consistency":1,
 "publisher_described_coordination":2
}
def fail(msg):raise ValueError("INC-15C.6F OCR model rejected: "+msg)
def check(cond,msg):
 if not cond:fail(msg)
def gitblob(raw):return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()
def read(path,root=BASE):return (root/path).read_bytes()
def load(path,root=BASE):return json.loads(read(path,root))
def typeok(value,allowed):
 types=allowed if isinstance(allowed,list) else [allowed]
 t=("null" if value is None else "boolean" if type(value) is bool
    else "integer" if type(value) is int else "string" if type(value) is str
    else "array" if type(value) is list else "object" if type(value) is dict else "invalid")
 return t in types
def validate(root=BASE):
 models={}
 for n,(model_sha,schema_sha,count) in FAMILIES.items():
  raw=read("model/federal/"+n+".json",root)
  schraw=read("schemas/"+n+".schema.json",root)
  check(gitblob(raw)==model_sha and gitblob(schraw)==schema_sha,
    "immutable original-derived model or closed schema changed: "+n)
  obj=json.loads(raw);schema=json.loads(schraw)
  check(schema.get("$schema")=="https://json-schema.org/draft/2020-12/schema"
   and schema.get("type")=="object" and schema.get("additionalProperties") is False
   and set(schema.get("required",[]))==set(obj)
   and set(schema.get("properties",{}))==set(obj),
    "closed model root schema cannot authorize fabricated fields: "+n)
  for k,v in obj.items():
   rule=schema["properties"][k]
   if "const" in rule:check(v==rule["const"],"closed root constant changed "+k)
  arr=obj["items"];row=schema["properties"]["items"]
  check(type(arr) is list and len(arr)==count and row["minItems"]==count
   and row["maxItems"]==count and row["items"]["additionalProperties"] is False
   and len(set(x["id"] for x in arr))==count,"incorrect source model count/duplicates: "+n)
  for o in arr:
   check(set(o)==set(row["items"]["required"])==set(row["items"]["properties"]),
     "unapproved source authority field or removed evidence")
   for field,value in o.items():
    rule=row["items"]["properties"][field]
    if "const" in rule:check(value==rule["const"],"false fixed source scope: "+field)
    if "enum" in rule:check(value in rule["enum"],"unsupported source status: "+field)
    if "type" in rule:check(typeok(value,rule["type"]),"invalid source nullable/type: "+field)
  models[n]=obj
 epochs=models["inc15c6f-ocr-dated-organization-epochs"]
 clauses=models["inc15c6f-ocr-2026-notice-clauses"]
 rel=models["inc15c6f-ocr-typed-source-relationships"]
 check(epochs["source_2023_at10_label_count"]==6 and epochs["source_2026_at10_label_count"]==6
  and epochs["source_2026_notice_effective_date"]=="2026-06-28" and
  epochs["source_2023_notice_superseded_AT10_text_as_of_2026"]=="2026-06-28" and
  epochs["edition_row_count_nonadditive"]==12 and
  epochs["distinct_2026_OCR_internal_composition_entries"]==6 and
  epochs["source_2026_notice_signed_operative_internal_structure"] is True and
  epochs["legal_current_entire_HHS_first_level_denominator"] is None and
  epochs["newly_minted_canonical_federal_institutions"]==0 and
  epochs["FY2026_ASE_or_FY2027_ASCRA_implementation_certified"] is False and
  epochs["source_2026_current_through_2026_10_22_independently_verified"] is False,
  "operative OCR statement unlawfully inflated to current HHS structure")
 byyear={yr:[x for x in epochs["items"] if x["source_year"]==yr] for yr in ("2023","2026")}
 for year,expected in [("2023",EXPECTED_2023),("2026",EXPECTED_2026)]:
  observed=byyear[year]
  check(len(observed)==6 and tuple((x["publisher_organization_code"],x["publisher_organization_label"]) for x in observed)==tuple(expected),
    "source AT.10 codes or labels no longer match official publication: "+year)
  for i,row in enumerate(observed):
   code,label=expected[i];is2026=year=="2026"
   check(row["publisher_list_ordinal"]==i+1 and
    row["source_original_pdf_sha256"]==SOURCE_SHA[year] and
    row["source_reorganization_effective_date"]==("2026-06-28" if is2026 else "2023-02-25") and
    row["source_secretary_approval_date"]==("2026-05-14" if is2026 else "2023-02-10") and
    row["source_printed_page"]==("39626" if is2026 else "12954") and
    row["publisher_section"]=="AT.10 Organization" and
    row["parent_source_reference"]=="INC15C3-HHS-LINK-OCR" and
    row["id"]=="INC15C6F-OCR-"+year+"-"+code and
    row["edition_local_status"]==("implemented_primary_source_qualified" if is2026 else "historical_superseded") and
    row["preceding_edition_same_code_id"]==("INC15C6F-OCR-2023-"+code if is2026 else None) and
    row["publisher_code_continuity_observed"] is is2026 and
    row["unchanged_publisher_organization_label_from_2023"] is (is2026 and label==EXPECTED_2023[i][1]) and
    row["same_legal_office_identity_across_2023_2026_certified"] is False and
    row["new_canonical_legal_institution_id"] is None and
    row["individual_officeholder_or_budget_delegation_verified"] is False and
    row["current_2026_10_22_organizational_status_independently_recensused"] is False,
    "source-local code continuity improperly promoted into current legal identity")
 check(clauses["nine_roman_notice_clauses_reconciled"]==9
  and clauses["chapter_AT00_replaced"] is True and clauses["chapter_AT10_replaced"] is True
  and clauses["chapter_AT20_targeted_amendments_not_entire_republication"] is True
  and clauses["existing_delegations_continued_if_consistent_not_newly_issued"] is True
  and clauses["signed_individual_delegate_register_captured"] is False
  and clauses["HHS_budget_FY2026_FY2027_reorganization_qualified"] is False
  and clauses["current_HHS_full_legal_first_level_denominator"] is None
  and clauses["source_effective_date"]=="2026-06-28"
  and clauses["source_original_sha256"]==SOURCE_SHA["2026"],
   "nine-clause notice source scope or delegation nonpromotion changed")
 for x,(roman,meaning) in zip(clauses["items"],CHANGES.items()):
  check(x["source_clause_roman"]==roman and
    x["id"]=="INC15C6F-OCR-2026-CLAUSE-"+roman and
    x["source_amendment_classification"]==meaning and
    x["source_original_sha256"]==SOURCE_SHA["2026"] and
    x["effective_date"]=="2026-06-28" and
    x["operative_OCR_notice_supported"] is True and
    x["HHS_budget_proposal_organizational_transfer_enacted"] is False and
    x["new_individual_signed_delegations_proved"] is False and
    x["interagency_command_legal_instrument_identified"] is False,
   "source notice subsection or invented delegation/command")
 check(rel["relation_count"]==13 and
  rel["operative_OCR_internal_component_membership_edges"]==6 and
  rel["document_effective_date_statements"]==1 and
  rel["deputy_role_reporting_statements"]==3 and
  rel["preexisting_delegations_conditional_continuation_statements"]==1 and
  rel["publisher_coordination_statements_not_interagency_command"]==2 and
  set(rel["type_vocabulary"])==set(EDGE_TYPES) and
  rel["root_current_HHS_first_level_legal_denominator"] is None and
  rel["independent_case_specific_legal_delegations_reviewed"]==0 and
  rel["signed_budget_ASCRA_ASE_parent_organizational_transfers"]==0 and
  rel["new_canonical_institution_IDs"]==0,
  "source-derived relations illegally typed as broad organizational authority")
 tally={k:0 for k in EDGE_TYPES}
 for x in rel["items"]:
  typ=x["relation_type"];check(typ in tally,"invented statutory edge type");tally[typ]+=1
  check(x["source_2026_pdf_sha256"]==SOURCE_SHA["2026"] and
    x["source_statement_effective_date"]=="2026-06-28" and
    x["relation_operative_only_within_OCR_boundary"] is True and
    x["legally_signed_cross_HHS_reporting_or_command_verified"] is False and
    x["authority_held_by_specific_individual_or_office_verifiable_from_this_record"] is False and
    x["verified_FY2026_ASE_FY2027_ASCRA_implemented"] is False and
    x["newly_minted_canonical_institution_id"] is None and
    x["whole_federal_institution_count_effect"]==0,
    "observational role edge improperly promoted into signed authority")
 comps=[x for x in rel["items"] if x["relation_type"]=="OCR_internal_organizational_composition"]
 check(tuple(x["source_object_id"] for x in comps)==tuple("INC15C6F-OCR-2026-"+x for x,_ in EXPECTED_2026) and
   all(x["source_subject_id"]=="INC15C3-HHS-LINK-OCR" and x["source_clause_roman"]=="III" for x in comps),
   "six effective OCR internal components incomplete or wrong legal parent")
 reps=[x for x in rel["items"] if x["relation_type"]=="publisher_described_reporting"]
 check(tuple(x["source_subject_label"] for x in reps)==(
   "Deputy Director for Civil Rights","Deputy Director for Enforcement",
   "Deputy Director for Conscience and Religious Freedom") and
  all(x["source_object_label"]=="Director, Office for Civil Rights" and x["source_subject_id"] is None and x["source_object_id"] is None for x in reps),
  "specific role reporting statement converted to statutory enterprise command")
 check(tally==EDGE_TYPES,"incorrect number of typed bounded source relations")
 for filename,sha in [
   ("model/federal/inc15c3-hhs-directory-reconciliation.json","37d06d6341a560a0689654819816e1396624b890"),
   ("model/federal/inc15c6e-hhs-budget-proposal-epochs.json","52b659cb97a1cd697e94b142cdf9e3a5d6898310"),
   ("model/federal/inc15c6e-hhs-source-lifecycle-coverage.json","62ba502bb2af468c1da2e73065dc38e42be12bbd")]:
  check(gitblob(read(filename,root))==sha,"immutable previous HHS source and budget/nonimplementation baseline changed")
 spec=importlib.util.spec_from_file_location("ocr_custody",root/"scripts/inc15c6f-validate-original-custody.py")
 module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 check(module.verify(*module.load(root/"evidence/hhs-ocr-org-2023-2026"))["retained_original_notice_editions"]==2,
  "GovInfo 2023/2026 source originals or Git receipt changed")
 manifest=load("model/federal/manifest.json",root);ext=manifest.get("federal_institutional_breadth_15c6f_extension",{})
 check(len(manifest["models"])==296 and
   all("model/federal/"+k+".json" in manifest["models"] for k in FAMILIES)
   and ext.get("original_pdf_sources_verified_and_git_retained")==2
   and ext.get("2026_OCR_AT10_effective_date")=="2026-06-28"
   and ext.get("2026_operative_internal_composition_entries")==6
   and ext.get("nine_2026_notice_clauses_reconciled")==9
   and ext.get("OCR_2026_typed_source_relationships")==13
   and ext.get("2026_legal_HHS_first_level_denominator") is None
   and ext.get("FY2026_ASE_or_FY2027_ASCRA_budget_proposal_implementation_proved") is False
   and ext.get("new_canonical_federal_institution_ids")==0,
  "manifest misstates source-qualified OCR versus speculative parent reorganization")
 return {"original_official_edition_PDFs":2,"operative_OCR_effective_date":"2026-06-28",
  "OCR_internal_organizational_components":6,"prior_2023_component_labels":6,
  "amendment_clauses":9,"bounded_typed_source_relations":13,
  "new_canonical_federal_institutions":0,"whole_HHS_legal_first_level_denominator":None,
  "budget_proposed_ASE_ASCRA_reorganizations_certified":False}
if __name__=="__main__":
 try:print(json.dumps(validate(),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
