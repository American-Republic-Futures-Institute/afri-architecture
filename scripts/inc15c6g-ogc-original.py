#!/usr/bin/env python3
"""Acquire and revalidate exact official 2026-19903 GovInfo original; fail closed.

Only the HHS OGC notice segments of this five-page Federal Register PDF are
in scope. Publication is NOT a verified distinct legal effective date.
"""
from __future__ import annotations
import hashlib, json, os, re, subprocess, sys, urllib.request
from pathlib import Path
from urllib.error import HTTPError, URLError

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE / "evidence/hhs-ogc-2026-statement"
URL = "https://www.govinfo.gov/content/pkg/FR-2026-09-29/pdf/2026-19903.pdf"
DOCUMENT = "2026-19903"
EXPECTED_PAGES = 5
PINNED_SHA256 = "e779cb68e4641730a00043a78b08c06a4a2db243c8987c27dd723287224e9f76"
PINNED_BYTE_COUNT = 204358
PINNED_GIT_BLOB_SHA1 = "43c99b2f51ba8d99f0a789ddc8446098883793b3"
MAX_BYTES = 12000000
MUST_CONTAIN = (
    "Office of the General Counsel",
    "There are 11 divisions in the Office of the General Counsel",
    "Office of Legal Resources includes six branches",
    "Unaccompanied Alien Children Legal Representation Division",
    "Satellite offices are not separate organizational components",
    "Office of the Counsel to the Inspector General",
    "of-functions",
)
class SourceError(Exception):
    pass

class RejectRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, hdrs, newurl):
        raise SourceError("redirect not permitted: " + str(newurl))

def sha(raw): return hashlib.sha256(raw).hexdigest()
def gitblob(raw): return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\x00" + raw).hexdigest()
def source_path(digest): return ROOT / "originals" / "sha256" / digest / (DOCUMENT + ".pdf")
def checked_original(raw):
    if not isinstance(raw, bytes) or not (40000 < len(raw) <= MAX_BYTES):
        raise SourceError("PDF original content length outside approved bounds")
    if len(raw)!=PINNED_BYTE_COUNT or sha(raw)!=PINNED_SHA256 or gitblob(raw)!=PINNED_GIT_BLOB_SHA1:
        raise SourceError("original publisher PDF differs from independently reviewed byte and SHA-256/Git pins")
    if not raw.startswith(b"%PDF-1.") or b"%%EOF" not in raw[-4096:]:
        raise SourceError("not an original PDF")
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / (DOCUMENT + ".pdf")
        p.write_bytes(raw)
        meta = subprocess.check_output(["pdfinfo", str(p)], text=True)
        match = re.search(r"^Pages:\s+(\d+)\s*$", meta, re.M)
        if not match or int(match.group(1)) != EXPECTED_PAGES:
            raise SourceError("unexpected Federal Register physical page count")
        extracted = subprocess.check_output(["pdftotext", "-raw", str(p), "-"], text=True)
        flattened = " ".join(extracted.split())
        missing = [m for m in MUST_CONTAIN if m not in flattened]
        if missing: raise SourceError("original PDF has missing HHS source clauses: " + repr(missing))
        if not re.search(r"separation-\s*of-functions", flattened, re.I):
            raise SourceError("FDA source separation-of-functions qualifier missing")
        if not re.search(r"2026[\-–]19903", flattened):
            raise SourceError("document number missing or not matching official edition")
        if "61422" not in flattened or "61426" not in flattened:
            raise SourceError("published Federal Register pages missing")
        return extracted, flattened

def fixed_claims():
    return {
        "original_source": URL, "fr_document_number": DOCUMENT,
        "publication_date": "2026-09-29", "fr_citation": "91 FR 61422-61426",
        "publication_pages": [61422,61423,61424,61425,61426],
        "physical_pdf_pages": EXPECTED_PAGES,
        "publisher_source": "GovInfo GPO Federal Register",
        "source_scope": "OGC statement only; adjacent printed unrelated notices excluded",
        "distinct_operative_effective_date": None,
        "dated_proposal_not_presented_as_implemented_HHS_parent": True,
        "internal_divisions_publisher_denominator": 11,
        "whole_HHS_first_level_legal_denominator": None,
        "existing_canonical_institution_ids_changed": 0,
        "legal_services_not_general_command": True,
        "OIG_independent_counsel_exception_preserved": True,
        "individual_written_delegations_independently_qualified": False,
        "prior_OGC_statements_rescinded_not_all_HHS_statements": True,
        "external_WORM_custody_verified": False,
    }

def acquisition_receipt(raw, extracted):
    return {
        "contract": "inc15c6g_govinfo_original_pdf_acquisition_v1",
        **fixed_claims(),
        "retrieval_outcome": "original_captured_by_GitHub_runner",
        "original_sha256": sha(raw), "original_byte_count": len(raw),
        "original_git_blob_sha1": gitblob(raw),
        "original_repo_path": str(source_path(sha(raw)).relative_to(BASE)),
        "pdftotext_raw_sha256": sha(extracted.encode("utf-8")),
    }

def custody_receipt(acq):
    return {
        "contract": "inc15c6g_govinfo_git_custody_v1",
        "upstream_acquisition_receipt_sha256": sha(json.dumps(acq, indent=2, ensure_ascii=True, sort_keys=True).encode("utf-8")+b"\n"),
        "original_git_blob_sha1": acq["original_git_blob_sha1"],
        "original_sha256": acq["original_sha256"],
        "original_repo_path": acq["original_repo_path"],
        "original_byte_count": acq["original_byte_count"],
        **fixed_claims()
    }

def encoded(obj):
    return json.dumps(obj, indent=2, ensure_ascii=True, sort_keys=True) + "\n"

def read_receipts():
    acq = json.loads((ROOT/"receipts/acquisition.json").read_text())
    custody = json.loads((ROOT/"receipts/git-custody.json").read_text())
    return acq, custody

def verify():
    acq,custody=read_receipts()
    digest=acq["original_sha256"]
    if not re.fullmatch(r"[0-9a-f]{64}",digest): raise SourceError("malformed original digest")
    p=source_path(digest)
    raw=p.read_bytes()
    extracted,_=checked_original(raw)
    expected=acquisition_receipt(raw,extracted)
    if acq!=expected: raise SourceError("source-acquisition receipt changed or PDF bytes modified")
    if custody!=custody_receipt(expected):raise SourceError("independent Git-custody receipt mismatch")
    if custody["distinct_operative_effective_date"] is not None:
        raise SourceError("publication date promoted to unverified legal effective date")
    return {"verified":True,"original_sha256":sha(raw),"original_git_blob_sha1":gitblob(raw),
            "original_bytes":len(raw),"physical_pdf_pages":EXPECTED_PAGES,
            "OGC_internal_divisions":11,"HHS_legal_denominator":None,
            "distinct_effective_date":None}

def acquire():
    if (ROOT/"receipts/acquisition.json").exists():
        return verify()
    opener=urllib.request.build_opener(RejectRedirect())
    try:
        req=urllib.request.Request(URL,headers={"User-Agent":"ARFI-source-acquisition/1.0",
            "Accept":"application/pdf"})
        with opener.open(req,timeout=25) as res:
            if res.status!=200:raise SourceError("original GovInfo PDF unavailable HTTP "+str(res.status))
            if not res.headers.get("Content-Type","").lower().startswith("application/pdf"):
                raise SourceError("non-PDF server response")
            raw=res.read(MAX_BYTES+1)
    except (HTTPError,URLError) as e:
        raise SourceError("official publisher retrieval failed: "+str(e))
    extracted,_=checked_original(raw)
    acq=acquisition_receipt(raw,extracted)
    custody=custody_receipt(acq)
    p=source_path(sha(raw));p.parent.mkdir(parents=True,exist_ok=True)
    if p.exists() and p.read_bytes()!=raw:raise SourceError("content-addressed original collision")
    p.write_bytes(raw)
    receipt_dir=ROOT/"receipts";receipt_dir.mkdir(parents=True,exist_ok=True)
    (receipt_dir/"acquisition.json").write_text(encoded(acq))
    (receipt_dir/"git-custody.json").write_text(encoded(custody))
    return verify()

if __name__=="__main__":
    try:
        if len(sys.argv)!=2 or sys.argv[1] not in ("acquire","verify"):
            raise SourceError("usage: python3 scripts/inc15c6g-ogc-original.py acquire|verify")
        print(json.dumps(acquire() if sys.argv[1]=="acquire" else verify(),indent=2))
    except Exception as exc:
        print("INC-15C.6G original custody REJECTED: "+str(exc),file=sys.stderr);sys.exit(1)
