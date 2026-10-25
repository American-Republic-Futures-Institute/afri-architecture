#!/usr/bin/env python3
"""INC-15E.1B: capture and verify *actual GPO HTTP response bytes* for 49 USC 24301.

Capture is network-only and append-only. Verify is entirely offline.
The archived 2024 edition proves an edition-scoped codified clause, not legal
identity equivalence, constitutional nongovernment status, current operations,
an independently completed legal review, or 2026 code currency.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
EDITION = "USCODE-2024-title49"
PACKAGE = "USCODE-2024-title49"
URL = "https://www.govinfo.gov/content/pkg/USCODE-2024-title49/html/USCODE-2024-title49-subtitleV-partC-chap243-sec24301.htm"
SOURCE_ID = "INC15E1B-SRC-USCODE-2024-49-24301"
PATH = Path("evidence/inc15e1b-amtrak-uscode")
RECEIPT = PATH / "source-custody.json"
MODEL = Path("model/federal/inc15e1b/amtrak-legal-status.json")
HOSTS = {"www.govinfo.gov", "govinfo.gov"}
CLAUSES = [
    ("49-USC-24301-A1", "24301(a)(1)", "statute_labels_Amtrak_railroad_carrier",
     "is a railroad carrier under section 20102(2)"),
    ("49-USC-24301-A2", "24301(a)(2)", "statute_directs_for_profit_management",
     "shall be operated and managed as a for-profit corporation"),
    ("49-USC-24301-A3", "24301(a)(3)", "statute_excludes_department_agency_instrumentality_and_title31",
     "is not a department, agency, or instrumentality of the United States Government, and shall not be subject to title 31"),
]

def require(value, reason):
    if not value:
        raise ValueError("INC-15E.1B primary-source custody rejected: " + reason)

def git_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\x00" + data).hexdigest()

def hash_sha(data):
    return hashlib.sha256(data).hexdigest()

class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

def verified_text(original):
    require(2500 < len(original) < 1000000, "source response has invalid original byte size")
    require(b"<html" in original[:3000].lower(), "publisher HTML response required")
    parser = TextOnly()
    parser.feed(original.decode("utf-8", errors="strict"))
    text = unicodedata.normalize("NFKC", " ".join(parser.parts)).replace("\u2060", "")
    text = re.sub(r"\s+", " ", text).strip()
    require("United States Code, 2024 Edition" in text, "2024 edition banner missing")
    require("24301" in text and "Status and applicable laws" in text, "correct section title absent")
    require("From the U.S. Government Publishing Office" in text or
            "Government Publishing Office" in text,
            "GPO publication attribution missing")
    marker = "§24301. Status and applicable laws"
    require(marker in text, "specific section marker missing")
    remainder = text.split(marker, 1)[1]
    # GovInfo publishes headings with markup and variable text nodes; HTMLParser
    # may insert spaces between the subsection number and its italicized title.
    # Anchor to the separately titled (b) section, not its CSS presentation.
    b = re.search(r"principal\s+office\s+and\s+place\s+of\s+business", remainder, re.I)
    require(b is not None and "status" in remainder[:140].lower(),
            "publisher section (a)/(b) conceptual headings missing")
    head = remainder[:b.start()]
    require(130 < len(head) < 2200, "subsection (a) source slice invalid")
    for idx, (_, paragraph, _, phrase) in enumerate(CLAUSES, 1):
        require(f"({idx})" in head and phrase in head,
                "source clause absent: " + paragraph)
    require(head.index(CLAUSES[0][3]) < head.index(CLAUSES[1][3]) <
            head.index(CLAUSES[2][3]), "source clause order altered")
    require("Pub. L. 105" in text and "Pub. L. 110" in text,
            "source credit or amendment references absent")
    return {"text_characters": len(text),
            "subsection_a_character_offset": text.index(marker),
            "subsection_a_excerpt_end_before_b": text.index(marker) + len(marker) + b.start(),
            "clause_offsets": {row[1]: head.index(row[3]) for row in CLAUSES}}

class OfficialRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        p = urllib.parse.urlsplit(newurl)
        require(p.scheme == "https" and (p.hostname or "").lower() in HOSTS,
                "redirect to non-GPO host blocked")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def download():
    opener = urllib.request.build_opener(OfficialRedirect)
    req = urllib.request.Request(URL, headers={
        "User-Agent": "ARFI-Institute-Statutory-Original-Custody/1.0",
        "Accept": "text/html,application/xhtml+xml;q=0.9",
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache",
    })
    with opener.open(req, timeout=35) as response:
        media = (response.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        final = urllib.parse.urlsplit(response.geturl())
        require(response.status == 200, "GPO original returned non-200")
        require(final.scheme == "https" and (final.hostname or "").lower() in HOSTS,
                "final HTML bytes were not from govinfo.gov")
        require(media in ("text/html", "application/xhtml+xml"), "unqualified publisher MIME")
        raw = response.read(1000001)
        parsed = verified_text(raw)
        header = {
            "content_type": media,
            "http_etag": response.headers.get("ETag"),
            "http_last_modified": response.headers.get("Last-Modified"),
            "http_date": response.headers.get("Date"),
            "final_official_url": response.geturl(),
        }
        return raw, parsed, header

def make_receipt(original, offsets, http):
    digest = hash_sha(original)
    path = PATH / "originals" / "sha256" / (digest + ".html")
    return {
        "model_version": "0.1.0",
        "model_family": "inc15e1b-official-gpo-original",
        "source_count": 1,
        "source_id": SOURCE_ID,
        "publisher": "U.S. Government Publishing Office",
        "source_edition": EDITION,
        "publisher_package": PACKAGE,
        "published_code_edition_year": 2024,
        "claim_scope": "2024_gpo_uscode_edition_only_not_2026_live_code",
        "official_url": URL,
        "original_repository_path": path.as_posix(),
        "original_sha256": digest,
        "git_blob_sha1": git_sha(original),
        "original_bytes": len(original),
        "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
        "independent_external_WORM_verified": False,
        "independent_professional_legal_review_complete": False,
        "source_original_git_retained": True,
        "not_current_2026_census_or_operations": True,
        "atlas_graph_admitted": False,
        "http": http,
        "text_validation": offsets,
    }

def make_status(receipt):
    return {
        "model_version": "0.1.0",
        "model_family": "inc15e1b-amtrak-clause-scoped-statutory-treatment",
        "release_status": "publisher_original_qualified_independent_legal_review_pending",
        "statutory_source_id": SOURCE_ID,
        "source_edition": EDITION,
        "official_section": "49 U.S.C. 24301(a)(1)-(3)",
        "original_source_sha256": receipt["original_sha256"],
        "original_source_git_blob_sha1": receipt["git_blob_sha1"],
        "original_source_repository_path": receipt["original_repository_path"],
        "original_source_retained": True,
        "statutory_clause_subject_id": "STAT-USCODE-2024-49-24301-AMTRAK",
        "source_publisher_observation_id": "GOVMAN-2025-12-31:160",
        "existing_canonical_institution_id": None,
        "source_observation_is_legal_identity_match": False,
        "relationship_type": "statutory_status_declared_for",
        "from_id": "STAT-USCODE-2024-49-24301-A",
        "to_id": "STAT-USCODE-2024-49-24301-AMTRAK",
        "relationship_direction": "statute_clause_to_named_legal_subject",
        "qualifies_2024_codified_clause_only": True,
        "qualifies_2026_legal_edition": False,
        "clauses": [
            {
                "id": id,
                "locator": locator,
                "observed_publisher_text": phrase,
                "predicate": predicate,
                "original_subsection_text_offset": receipt["text_validation"]["clause_offsets"][locator],
                "statutory_text_verified_from_original": True,
                "statutory_scope_only": True,
                "asserts_constitutional_status": False,
                "asserts_actual_company_profits": False,
                "asserts_operational_or_governance_execution": False,
            }
            for id, locator, predicate, phrase in CLAUSES
        ],
        "exclusions": [
            "not_categorical_private_or_nongovernment_status_for_constitutional_purposes",
            "not_a_verified_canonical_identity_link",
            "not_verified_current_2026_corporate_operations_or_financial_results",
            "not_an_ownership_or_command_or_appropriations_edge",
            "not_unconditional_all_statutes_title31_exemption_ignoring_applicable_other_laws",
            "not_a_verdict_on_USAID_OPIC_or_Federal_Reserve_IDs",
            "not_an_ARFI_Plan_recommendation_or_independent_Data_Observatory_outcome"
        ],
        "judicial_interpretation_boundary": {
            "case": "Lebron v. National Railroad Passenger Corporation, 513 U.S. 374 (1995)",
            "citation_only_not_new_original_retained": True,
            "constitutional_individual_rights_status_must_be_modeled_separately": True,
            "no_conclusion_that_Amtrak_is_private_for_every_purpose": True
        },
        "statutory_epoch_effective_date_independently_adjudicated": False,
        "independent_professional_legal_review_complete": False,
        "reviewer_id": None,
        "source_original_qualified": True,
        "canonical_identity_certified": False,
        "current_2026_operations_verified": False,
        "atlas_graph_admitted": False,
        "plan_or_data_observatory_changed": False,
    }

def capture(root=ROOT):
    require(not (root / RECEIPT).exists(), "receipt exists; append-only original must not be overwritten")
    require(not (root / MODEL).exists(), "derived edition-status model exists; refusing overwrite")
    raw, parsed, headers = download()
    receipt = make_receipt(raw, parsed, headers)
    model = make_status(receipt)
    original_path = root / receipt["original_repository_path"]
    require(not original_path.exists(), "content-addressed source original already exists")
    original_path.parent.mkdir(parents=True, exist_ok=True)
    original_path.write_bytes(raw)
    (root / RECEIPT).parent.mkdir(parents=True, exist_ok=True)
    (root / RECEIPT).write_text(json.dumps(receipt, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    (root / MODEL).parent.mkdir(parents=True, exist_ok=True)
    (root / MODEL).write_text(json.dumps(model, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    return verify(root)

def verify(root=ROOT):
    receipt = json.loads((root / RECEIPT).read_text(encoding="utf-8"))
    model = json.loads((root / MODEL).read_text(encoding="utf-8"))
    require(receipt["model_version"] == "0.1.0" and
            receipt["model_family"] == "inc15e1b-official-gpo-original" and
            receipt["source_count"] == 1 and receipt["source_id"] == SOURCE_ID and
            receipt["publisher"] == "U.S. Government Publishing Office" and
            receipt["official_url"] == URL and
            receipt["source_edition"] == EDITION and
            receipt["publisher_package"] == PACKAGE and
            receipt["published_code_edition_year"] == 2024 and
            receipt["claim_scope"] == "2024_gpo_uscode_edition_only_not_2026_live_code" and
            receipt["independent_external_WORM_verified"] is False and
            receipt["independent_professional_legal_review_complete"] is False and
            receipt["source_original_git_retained"] is True and
            receipt["not_current_2026_census_or_operations"] is True and
            receipt["atlas_graph_admitted"] is False, "source custody version and certification")
    path = receipt["original_repository_path"]
    require(re.fullmatch(r"evidence/inc15e1b-amtrak-uscode/originals/sha256/[a-f0-9]{64}\.html", path),
            "unsafe original source path")
    raw = (root / path).read_bytes()
    require(hash_sha(raw) == receipt["original_sha256"] and
            path.endswith(receipt["original_sha256"] + ".html") and
            git_sha(raw) == receipt["git_blob_sha1"] and
            len(raw) == receipt["original_bytes"], "source original raw bytes, SHA-256, or Git blob modified")
    source = verified_text(raw)
    require(source == receipt["text_validation"], "source clause offsets or exact edition changed")
    http = receipt["http"]
    require(set(http) == {"content_type", "http_etag", "http_last_modified", "http_date", "final_official_url"} and
            http["content_type"] in ("text/html", "application/xhtml+xml") and
            urllib.parse.urlsplit(http["final_official_url"]).hostname in HOSTS and
            urllib.parse.urlsplit(http["final_official_url"]).scheme == "https",
            "GPO response provenance invalid")
    require(model == make_status(receipt), "unsupported claim or source/qualifier changes in legal status model")
    return {
        "source_originals_verified": 1,
        "source_edition": EDITION,
        "byte_length": len(raw),
        "original_sha256": receipt["original_sha256"],
        "statutory_clauses_source_checked": 3,
        "statutory_2026_currency_or_external_legal_review_completed": False,
        "public_atlas_admitted": False,
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["capture", "verify"])
    args = parser.parse_args()
    try:
        result = capture() if args.mode == "capture" else verify()
        print(json.dumps(result, indent=2))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
