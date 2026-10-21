#!/usr/bin/env python3
"""INC-15C.6D Git original custodian, separate from unratified research models."""
from __future__ import annotations
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sys

BASE=Path(__file__).resolve().parents[1]
ROOT=BASE/"evidence/hhs-dab-omha-arpah-historical"
def module(rel,name):
 spec=importlib.util.spec_from_file_location(name,BASE/rel)
 mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 return mod
PROMOTE=module("scripts/inc15c6d-promote-historical-originals.py","inc15c6d_promotion")
SOURCE=module("scripts/inc15c6d-hhs-source-acquire.py","inc15c6d_acquirer")
def insist(ok,msg):
 if not ok:raise ValueError("INC-15C.6D original custody rejected: "+msg)
def exact(obj,fields):
 return type(obj) is dict and set(obj)==set(fields)
def raw_files():
 return {key:(ROOT/PROMOTE.original_path(key)).read_bytes() for key in PROMOTE.DOCS}
def load():
 return (json.loads((ROOT/"receipts/git-custody.json").read_text()),
         json.loads((ROOT/"receipts/capture-receipt.json").read_text()),raw_files())

def validate(capture_record,acquisition,raw):
 expected_keys={"record_type","source_probe_workflow_run","source_probe_artifact_id","source_records",
 "all_five_originals_git_retained","direct_hhs_current_organizational_html_retained",
 "independent_worm_qualification","historical_source_notice_is_current_legal_status",
 "dab_adjudication_jurisdiction_current_certified","omha_alj_case_control_current_certified",
 "arpah_2024_budget_eight_office_implementation_certified",
 "current_hhs_legal_first_level_denominator","hhs_canonical_ids_replaced"}
 c=capture_record
 insist(exact(c,expected_keys) and c["record_type"]=="inc15c6d_git_source_original_custody_v1"
  and c["source_probe_workflow_run"]==39691326721 and c["source_probe_artifact_id"]==12389115569
  and c["all_five_originals_git_retained"] is True
  and c["direct_hhs_current_organizational_html_retained"] is False
  and c["independent_worm_qualification"] is False
  and c["historical_source_notice_is_current_legal_status"] is False
  and c["dab_adjudication_jurisdiction_current_certified"] is False
  and c["omha_alj_case_control_current_certified"] is False
  and c["arpah_2024_budget_eight_office_implementation_certified"] is False
  and c["current_hhs_legal_first_level_denominator"] is None
  and c["hhs_canonical_ids_replaced"]==0,"custody manifest inflated HHS legal claims")
 insist(exact(acquisition,{"contract_version","source_probes","same_edition_or_bytes_asserted",
 "federal_legal_roster_complete","legal_first_level_denominator","independent_worm_qualification"})
  and acquisition["contract_version"]==SOURCE.RECEIPT_VERSION
  and acquisition["same_edition_or_bytes_asserted"] is False
  and acquisition["federal_legal_roster_complete"] is False
  and acquisition["legal_first_level_denominator"] is None
  and acquisition["independent_worm_qualification"] is False,"acquisition receipt source/authority altered")
 keys={"source_key","original_sha256","original_bytes","physical_pdf_pages","publisher_edition",
       "git_blob_sha1","path","source_scoped_only","authority_certified"}
 insist(type(c["source_records"]) is list and len(c["source_records"])==5
        and type(acquisition["source_probes"]) is list and len(acquisition["source_probes"])==5
        and set(raw)==set(PROMOTE.DOCS),"missing or added independent publisher source")
 for i,(key,ref) in enumerate(PROMOTE.DOCS.items()):
  sha,n,pages,marker,date,blob=ref
  d=c["source_records"][i];a=acquisition["source_probes"][i];original=raw[key]
  insist(exact(d,keys) and d["source_key"]==key and d["original_sha256"]==sha
   and d["original_bytes"]==n and d["physical_pdf_pages"]==pages
   and d["publisher_edition"]==date and d["git_blob_sha1"]==blob
   and d["path"]=="evidence/hhs-dab-omha-arpah-historical/"+PROMOTE.original_path(key)
   and d["source_scoped_only"] is True and d["authority_certified"] is False,
   "original Git custody record changed: "+key)
  insist(type(original) is bytes and len(original)==n
   and hashlib.sha256(original).hexdigest()==sha
   and hashlib.sha1(b"blob "+str(n).encode()+b"\x00"+original).hexdigest()==blob
   and re.match(br"^%PDF-1\.[0-9]",original[:16])
   and b"%%EOF" in original[-4096:],"publisher original bytes changed: "+key)
  src=SOURCE.SOURCES[key]
  insist(a["key"]==key and a["result"]=="transient_original_captured"
   and a["original_sha256"]==sha and a["original_byte_count"]==n
   and a["final_source_url"]==src["url"]
   and a["current_hhs_first_level_legal_denominator"] is None
   and a["department_command_or_adjudicative_authority_certified"] is False
   and a["independent_legal_review_complete"] is False
   and a["cross_edition_population_addition_authorized"] is False
   and a["git_original_custody_verified"] is False
   and a["independent_worm_custody_verified"] is False,
   "temporary source capture receipt mutated: "+key)
 return {"originals":5,"recovered_bytes":sum(d[1] for d in PROMOTE.DOCS.values()),
         "legal_first_level_denominator":None,"proposed_arpa_h_restructure_implemented":False}

if __name__=="__main__":
 try: print(json.dumps(validate(*load()),indent=2))
 except Exception as e:print(str(e),file=sys.stderr);sys.exit(1)
