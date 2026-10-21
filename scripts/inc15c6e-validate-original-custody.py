#!/usr/bin/env python3
"""INC-15C.6E source provenance: exact ARPA-H HTML, blocked HHS budgets.
This does not qualify publisher observation as an operative legal organization.
"""
import hashlib,importlib.util,json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
ROOT=BASE/"evidence/hhs-arpah-2026-observation"
S={
 "arpah_people":("149e49bd3f1593b82027e7151414d907a6960cf03f22450ef6c4f9bcbfc20646",63246,"9602a7f609a623afd1f05c17ede6f6c907164416"),
 "arpah_timeline":("b30fa39c015976657905299a7aee3ee888dc3bfcaffde4f55e0431684e9bdcb3",56301,"d007f32fab4557f968e1145281001fe15af7c93a")
}
ORDER=("hhs_fy2026_gdm","hhs_fy2027_gdm","arpah_people","arpah_timeline","dab_overview","omha_chart")
def err(m):raise ValueError("INC-15C.6E custody rejected: "+m)
def insist(v,m):
 if not v:err(m)
def path(k):return "originals/"+k+"/sha256/"+S[k][0]+".html"
def sha(b):return hashlib.sha256(b).hexdigest()
def gitblob(b):return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
def load(root=ROOT):
 return (
  json.loads((root/"receipts/git-custody.json").read_text()),
  json.loads((root/"receipts/capture-receipt.json").read_text()),
  {k:(root/path(k)).read_bytes() for k in S}
 )
def validate(c,a,raw):
 keys={"record_type","source_probe_workflow_run","source_probe_artifact_id","originals",
 "source_page_effective_date_independently_qualified","hhs_fy2026_gdm_original_custodied",
 "hhs_fy2027_gdm_original_custodied","dab_current_html_custodied","omha_current_html_custodied",
 "personnel_page_proves_organizational_reorganization","budget_proposal_is_implemented_reorganization",
 "independent_worm_custody_verified","legal_first_level_hhs_denominator",
 "operational_reporting_or_adjudicative_authority_verified"}
 insist(isinstance(c,dict) and set(c)==keys and
 c["record_type"]=="inc15c6e_arpah_live_html_git_custody_v1" and
 c["source_probe_workflow_run"]==39694381413 and c["source_probe_artifact_id"]==12389997023 and
 c["source_page_effective_date_independently_qualified"] is False and
 c["hhs_fy2026_gdm_original_custodied"] is False and
 c["hhs_fy2027_gdm_original_custodied"] is False and
 c["dab_current_html_custodied"] is False and c["omha_current_html_custodied"] is False and
 c["personnel_page_proves_organizational_reorganization"] is False and
 c["budget_proposal_is_implemented_reorganization"] is False and
 c["independent_worm_custody_verified"] is False and
 c["legal_first_level_hhs_denominator"] is None and
 c["operational_reporting_or_adjudicative_authority_verified"] is False,
 "custody receipt incorrectly claims original budget or current legal authority")
 insist(isinstance(c["originals"],list) and len(c["originals"])==2
  and set(raw)==set(S), "expected only two original ARPA-H snapshots")
 for record,(k,(h,n,blob)) in zip(c["originals"],S.items()):
  b=raw[k]
  insist(set(record)=={"source_key","sha256","bytes","git_blob_sha1","path","source_edition"}
   and record["source_key"]==k and record["sha256"]==h and record["bytes"]==n
   and record["git_blob_sha1"]==blob and
   record["path"]=="evidence/hhs-arpah-2026-observation/"+path(k) and
   record["source_edition"]=="retrieved_2026-10-21_not_verified_effective_edition"
   and len(b)==n and sha(b)==h and gitblob(b)==blob and
   b"<!DOCTYPE" in b[:15000],
   "Git source identity or original bytes altered: "+k)
 insist(isinstance(a,dict) and set(a)=={"contract_version","source_probes",
 "same_edition_or_bytes_asserted","federal_legal_roster_complete","legal_first_level_denominator",
 "independent_worm_qualification"} and
 a["contract_version"]=="inc15c6e_hhs_2026_original_publisher_probe_v1" and
 a["same_edition_or_bytes_asserted"] is False and a["federal_legal_roster_complete"] is False and
 a["legal_first_level_denominator"] is None and a["independent_worm_qualification"] is False and
 isinstance(a["source_probes"],list) and len(a["source_probes"])==6 and
 [x["key"] for x in a["source_probes"]]==list(ORDER),
 "six original source acquisition epochs or legal qualifications changed")
 for x in a["source_probes"]:
  k=x["key"]
  insist(x["independent_legal_review_complete"] is False and
   x["department_command_or_adjudicative_authority_certified"] is False and
   x["current_hhs_first_level_legal_denominator"] is None and
   x["cross_edition_population_addition_authorized"] is False and
   x["independent_worm_custody_verified"] is False and
   x["git_original_custody_verified"] is False,
   "source probe retroactively given legal authority: "+k)
  if k in S:
   insist(x["result"]=="transient_original_captured" and
    x["original_sha256"]==S[k][0] and x["original_byte_count"]==S[k][1] and
    x["final_url"] in ("https://arpa-h.gov/about/people","https://arpa-h.gov/about/timeline"),
    "retained ARPA-H original capture incorrect: "+k)
  else:
   insist(x["result"]=="blocked_no_original_bytes" and x["failure"]=="HTTP_403" and
    x["original_sha256"] is None and x["original_byte_count"] is None and
    x["original_relative_path"] is None,
    "blocked HHS budget/DAB/OMHA source falsely retained: "+k)
 return {"retained_arpah_original_html_sources":2,"HHS_budget_PDF_originals_archived":False,
  "current_HHS_legal_first_level_denominator":None,
  "reorganization_implementation_qualified":False}
if __name__=="__main__":
 print(json.dumps(validate(*load()),indent=2))
