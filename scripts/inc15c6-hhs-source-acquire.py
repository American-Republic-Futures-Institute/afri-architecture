#!/usr/bin/env python3
"""INC-15C.6 - exact official HHS publisher source acquisition, not legal qualification.

Two DIFFERENT source populations are probed independently. A 2024 strategy PDF
cannot substitute for the 2025-reviewed public organization-index HTML.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

SOURCES = {
    "hhs_org_index": {
        "source_id": "INC15C6-HHS-ORG-INDEX-HTML",
        "url": "https://www.hhs.gov/about/organization/org-chart/index.html",
        "kind": "hhs_official_index_html",
        "source_edition": "HHS_html_page_last_reviewed_2025-08-21_prior_research_attribution",
        "extension": ".html",
        "max_bytes": 12_000_000,
        "required_markers": ("HHS Organizational Charts", "Office of Inspector General"),
    },
    "hhs_strategy_2024": {
        "source_id": "INC15C6-HHS-GLOBAL-STRATEGY-2024-PDF",
        "url": "https://www.hhs.gov/sites/default/files/the-global-strategy-of-the-us-department-of-health-and-human-services.pdf",
        "kind": "independent_hhs_2024_report_appendix_a_chart_pdf",
        "source_edition": "2024_Global_Strategy_publication",
        "extension": ".pdf",
        "max_bytes": 35_000_000,
        "required_markers": (),
    },
    "hhs_oig_chart": {
        "source_id": "INC15C6-HHS-OIG-OFFICE-CHART-HTML",
        "url": "https://oig.hhs.gov/about-oig/organization-chart/",
        "kind": "independent_hhs_oig_organization_chart_html",
        "source_edition": "HHS_OIG_publisher_observed_2026-10-21_original_no_editional_date_asserted",
        "extension": ".html", "max_bytes": 12_000_000,
        "required_markers": ("Organization Chart", "Office of Audit Services"),
    },
    "hhs_oig_2025_pdf": {
        "source_id": "INC15C6-HHS-OIG-CHART-2025-PDF",
        "url": "https://oig.hhs.gov/documents/root/9810/2025-oig-org-chart-web.pdf",
        "kind": "official_hhs_oig_dated_2025_12_23_chart_pdf",
        "source_edition": "HHS_OIG_org_chart_as_of_2025-12-23_as_printed",
        "extension": ".pdf", "max_bytes": 35_000_000,
        "required_markers": (),
    },
    "hhs_dab_chart": {
        "source_id": "INC15C6-HHS-DAB-CHART-HTML",
        "url": "https://www.hhs.gov/about/agencies/orgchart/dab/index.html",
        "kind": "hhs_dab_adjudicative_chart_html",
        "source_edition": "HHS_DAB_publisher_page_last_reviewed_2025-08-21_prior_web_attribution",
        "extension": ".html", "max_bytes": 12_000_000,
        "required_markers": ("Departmental Appeals Board", "Administrative Law Judges"),
    },
    "hhs_omha_chart": {
        "source_id": "INC15C6-HHS-OMHA-CHART-HTML",
        "url": "https://www.hhs.gov/about/agencies/omha/about/organizational-chart/index.html",
        "kind": "hhs_omha_medicaid_medicare_appeals_chart_html",
        "source_edition": "HHS_OMHA_publisher_page_last_reviewed_2026-01-12_prior_web_attribution",
        "extension": ".html", "max_bytes": 12_000_000,
        "required_markers": ("Office of Medicare Hearings and Appeals", "Chief Administrative Law Judge"),
    },
    "hhs_aspr_chart": {
        "source_id": "INC15C6-HHS-ASPR-OFFICE-CHART-PDF",
        "url": "https://aspr.hhs.gov/AboutASPR/ProgramOffices/Documents/ASPR-Organizational-Chart.pdf",
        "kind": "hhs_aspr_organization_chart_pdf_separate_office_population",
        "source_edition": "HHS_ASPR_pdf_publisher_document_date_to_verify_from_original",
        "extension": ".pdf", "max_bytes": 35_000_000,
        "required_markers": (),
    },
}
RECEIPT_VERSION = "inc15c6_publisher_source_probe_v1"
USER_AGENT = "ARFI-Research-Source-Retention/1.0 (https://arfinstitute.org)"
DIRECT_HOSTS = {"www.hhs.gov", "hhs.gov", "oig.hhs.gov", "aspr.hhs.gov"}


class SourceFailure(Exception):
    pass


def utcnow():
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def approved_url(url, source):
    try:
        parsed = urllib.parse.urlsplit(url)
        expected = urllib.parse.urlsplit(source["url"])
        return (parsed.scheme == "https" and parsed.hostname in DIRECT_HOSTS
                and parsed.hostname in (expected.hostname, expected.hostname.replace("www.", ""))
                and parsed.port is None and not parsed.username and not parsed.password
                and not parsed.query and not parsed.fragment and parsed.path == expected.path)
    except (ValueError, AttributeError):
        return False


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def network_transport(url, source):
    opener = urllib.request.build_opener(NoRedirect())
    hops = []
    current = url
    for _ in range(4):
        if not approved_url(current, source):
            raise SourceFailure("unapproved HTTPS source/redirect destination")
        request = urllib.request.Request(current, headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html" if source["extension"] == ".html" else "application/pdf",
        }, method="GET")
        try:
            response = opener.open(request, timeout=24)
        except urllib.error.HTTPError as exc:
            response = exc
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            raise SourceFailure("transport: "+str(exc)[:160]) from exc
        with response as stream:
            status = stream.status or stream.code
            if status in (301, 302, 303, 307, 308):
                target = stream.headers.get("Location")
                if not target or len(hops) >= 2:
                    raise SourceFailure("redirect missing or too many redirects")
                nxt = urllib.parse.urljoin(current, target)
                if not approved_url(nxt, source):
                    raise SourceFailure("redirect outside exact HHS source path")
                hops.append(nxt)
                current = nxt
                continue
            if status != 200:
                raise SourceFailure("HTTP_"+str(status))
            content_type = stream.headers.get("Content-Type", "").split(";")[0].lower().strip()
            allowed = ({"text/html", "application/xhtml+xml"} if source["extension"] == ".html"
                       else {"application/pdf", "application/octet-stream"})
            if content_type not in allowed:
                raise SourceFailure("unexpected Content-Type "+content_type)
            claimed = stream.headers.get("Content-Length")
            if claimed and (not claimed.isdigit() or int(claimed) > source["max_bytes"]):
                raise SourceFailure("Content-Length exceeds allowed bound")
            chunks, size = [], 0
            while True:
                block = stream.read(65536)
                if not block:
                    break
                size += len(block)
                if size > source["max_bytes"]:
                    raise SourceFailure("decoded body exceeds allowed bound")
                chunks.append(block)
            return {"bytes": b"".join(chunks), "final_url": current,
                    "content_type": content_type, "redirect_chain": hops}
    raise SourceFailure("redirect cap reached")


def validate_bytes(blob, source):
    if not isinstance(blob, bytes) or len(blob) < 1000 or len(blob) > source["max_bytes"]:
        raise SourceFailure("source body outside bounded range")
    if source["extension"] == ".pdf":
        if not re.match(rb"^%PDF-1\.[0-9]", blob[:20]) or b"%%EOF" not in blob[-4096:]:
            raise SourceFailure("publisher PDF header/trailer invalid")
    else:
        head = blob[:15000].lower()
        if not (b"<!doctype html" in head or b"<html" in head):
            raise SourceFailure("publisher original not recognizable HTML")
        body = blob.decode("utf-8", errors="replace")
        if not all(marker in body for marker in source["required_markers"]):
            raise SourceFailure("publisher HTML does not contain the required source index markers")
    return hashlib.sha256(blob).hexdigest()


def capture(out: Path, transport=network_transport, clock=utcnow):
    out.mkdir(parents=True, exist_ok=True)
    records = []
    for key, source in SOURCES.items():
        rec = {
            "record_type": RECEIPT_VERSION, "key": key, "source_id": source["source_id"],
            "requested_official_url": source["url"], "publisher": "U.S. Department of Health and Human Services",
            "source_edition_attribution": source["source_edition"],
            "source_kind": source["kind"], "retrieved_at_utc": clock(),
            "result": "blocked_no_original_bytes", "failure": None, "final_url": None,
            "content_type": None, "redirect_chain": [],
            "original_relative_path": None, "original_sha256": None, "original_byte_count": None,
            "retrieval_tier": "no_source_archived", "git_original_custody_verified": False,
            "independent_worm_custody_verified": False,
            "source_directory_edition_fully_extracted": False,
            "current_hhs_first_level_legal_denominator": None,
            "independent_legal_review_complete": False,
            "department_command_or_adjudicative_authority_certified": False,
            "cross_edition_population_addition_authorized": False,
        }
        try:
            result = transport(source["url"], source)
            if not approved_url(result["final_url"], source):
                raise SourceFailure("unapproved returned final URL")
            raw = result["bytes"]
            checksum = validate_bytes(raw, source)
            suffix = source["extension"]
            rel = "originals/"+key+"/sha256/"+checksum+suffix
            target = out / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as handle:
                handle.write(raw)
            rec.update({
                "result": "transient_original_captured", "final_url": result["final_url"],
                "content_type": result["content_type"],
                "redirect_chain": result.get("redirect_chain", []),
                "original_relative_path": rel, "original_sha256": checksum,
                "original_byte_count": len(raw), "retrieval_tier": "github_runner_artifact_only"
            })
        except (SourceFailure, OSError, KeyError, TypeError, ValueError) as err:
            rec["failure"] = str(err)[:200]
        records.append(rec)
    receipts = {"contract_version": RECEIPT_VERSION, "source_probes": records,
                "same_edition_or_bytes_asserted": False, "federal_legal_roster_complete": False,
                "legal_first_level_denominator": None, "independent_worm_qualification": False}
    (out / "capture-receipt.json").write_text(json.dumps(receipts, indent=2)+"\n", encoding="utf-8")
    return receipts


def verify(out: Path):
    data = json.loads((out / "capture-receipt.json").read_text(encoding="utf-8"))
    if set(data) != {"contract_version", "source_probes", "same_edition_or_bytes_asserted",
                     "federal_legal_roster_complete", "legal_first_level_denominator",
                     "independent_worm_qualification"} or (
        data["contract_version"] != RECEIPT_VERSION or
        data["same_edition_or_bytes_asserted"] is not False or
        data["federal_legal_roster_complete"] is not False or
        data["legal_first_level_denominator"] is not None or
        data["independent_worm_qualification"] is not False or
        len(data["source_probes"]) != len(SOURCES)
    ):
        raise SourceFailure("closed source-receipt contract violated")
    for rec, (key, source) in zip(data["source_probes"], SOURCES.items()):
        mandatory = {"record_type", "key", "source_id", "requested_official_url", "publisher",
          "source_edition_attribution", "source_kind", "retrieved_at_utc", "result", "failure",
          "final_url", "content_type", "redirect_chain", "original_relative_path",
          "original_sha256", "original_byte_count", "retrieval_tier",
          "git_original_custody_verified", "independent_worm_custody_verified",
          "source_directory_edition_fully_extracted", "current_hhs_first_level_legal_denominator",
          "independent_legal_review_complete",
          "department_command_or_adjudicative_authority_certified",
          "cross_edition_population_addition_authorized"}
        if (set(rec) != mandatory or rec["record_type"] != RECEIPT_VERSION
            or rec["key"] != key or rec["source_id"] != source["source_id"]
            or rec["requested_official_url"] != source["url"]
            or rec["source_edition_attribution"] != source["source_edition"]
            or rec["source_kind"] != source["kind"]
            or rec["publisher"] != "U.S. Department of Health and Human Services"
            or rec["git_original_custody_verified"] is not False
            or rec["independent_worm_custody_verified"] is not False
            or rec["source_directory_edition_fully_extracted"] is not False
            or rec["current_hhs_first_level_legal_denominator"] is not None
            or rec["independent_legal_review_complete"] is not False
            or rec["department_command_or_adjudicative_authority_certified"] is not False
            or rec["cross_edition_population_addition_authorized"] is not False):
            raise SourceFailure("source record or legal guardrail forged: "+key)
        if rec["result"] == "transient_original_captured":
            checksum = rec["original_sha256"]
            expected = "originals/"+key+"/sha256/"+checksum+source["extension"]
            if (rec["failure"] is not None or rec["original_relative_path"] != expected or
                rec["retrieval_tier"] != "github_runner_artifact_only" or
                not isinstance(checksum, str) or not re.fullmatch("[0-9a-f]{64}",checksum) or
                not approved_url(rec["final_url"], source)):
                raise SourceFailure("forged source capture receipt")
            original = (out / expected).read_bytes()
            if (validate_bytes(original,source) != checksum or
                len(original) != rec["original_byte_count"]):
                raise SourceFailure("acquired publisher original modified")
        elif rec["result"] == "blocked_no_original_bytes":
            if (rec["original_relative_path"] is not None or rec["original_sha256"] is not None or
                rec["original_byte_count"] is not None or rec["final_url"] is not None or
                rec["retrieval_tier"] != "no_source_archived" or not rec["failure"]):
                raise SourceFailure("blocked source falsely qualified")
        else:
            raise SourceFailure("unknown publisher acquisition state")
    return {"verified":True,"sources":{r["key"]:{
        "status":r["result"],"bytes":r["original_byte_count"],"sha256":r["original_sha256"],
        "failure":r["failure"]} for r in data["source_probes"]},
        "legal_first_level_denominator":None}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command",choices=("probe","verify"))
    parser.add_argument("folder",type=Path)
    args = parser.parse_args()
    if not args.folder.is_absolute():
        raise SystemExit("require absolute artifact directory")
    try:
        result = capture(args.folder) if args.command == "probe" else verify(args.folder)
        print(json.dumps(result, indent=2))
    except (SourceFailure, OSError, ValueError) as exc:
        print(str(exc),file=sys.stderr)
        sys.exit(1)
