#!/usr/bin/env python3
"""Verify captured VA HTML h2/h3 headings. A directory heading is not a legal reporting edge."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys

class Headings(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.active = None
        self.stack = []
        self.text = []
        self.headings = []

    def handle_starttag(self, tag, attrs):
        if tag in ("h2", "h3") and self.active is None:
            self.active, self.stack, self.text = tag, [tag], []
        elif self.active is not None and tag not in ("br", "img", "hr", "meta", "input"):
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if self.active is None:
            return
        if tag in self.stack:
            while self.stack:
                if self.stack.pop() == tag:
                    break
        if not self.stack:
            value = re.sub(r"\s+", " ", "".join(self.text)).strip()
            if value:
                self.headings.append((self.active, value))
            self.active = None

    def handle_data(self, value):
        if self.active is not None:
            self.text.append(value)

def extract(data):
    parser = Headings()
    parser.feed(data.decode("utf-8"))
    groups = {"Administrations": [], "Staff Offices": []}
    current, secretary = None, False
    for tag, text in parser.headings:
        if tag == "h2":
            current = text if text in groups else None
            secretary = secretary or text == "Office of the Secretary"
        elif tag == "h3" and current:
            groups[current].append(text)
    return groups, secretary

def normalize(x):
    return re.sub(r"\s+", " ", x).strip().replace("’", "'")

def verify(data, model, digest):
    actual = hashlib.sha256(data).hexdigest()
    if actual != digest:
        raise ValueError("source SHA-256 mismatch: " + actual)
    sections, secretary = extract(data)
    if not secretary:
        raise ValueError("Office of Secretary h2 heading missing")
    for group, count in [("Administrations", 3), ("Staff Offices", 19)]:
        observed = sections[group]
        if len(observed) != count:
            raise ValueError("%s expected %s but got %s" % (group, count, len(observed)))
        expected = sorted((x["source_relative_heading_ordinal"], normalize(x["name"]))
                          for x in model if x["source_heading"] == group)
        seen = list(enumerate((normalize(x) for x in observed), 1))
        if seen != expected:
            raise ValueError("VA heading identity/order mismatch for "+group)
    return {"status": "captured_source_section_verified_not_ADL1",
            "sha256": actual, "administrations": 3, "staff_offices": 19,
            "source_section_entries": 22, "office_of_secretary_separate_heading": True,
            "whole_department_first_level_denominator": None,
            "legal_authorities_inferred": 0}

if __name__ == "__main__":
    p=argparse.ArgumentParser()
    p.add_argument("source_html",type=Path)
    p.add_argument("directory_model_json",type=Path)
    p.add_argument("--sha256",required=True)
    args=p.parse_args()
    try:
        model=json.loads(args.directory_model_json.read_text(encoding="utf-8"))["items"]
        print(json.dumps(verify(args.source_html.read_bytes(),model,args.sha256),indent=2))
    except (KeyError,ValueError,UnicodeError) as e:
        print("VA source verification rejected:",e,file=sys.stderr)
        sys.exit(1)
