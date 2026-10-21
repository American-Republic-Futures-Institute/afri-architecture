import test from "node:test";
import assert from "node:assert/strict";
import {loadINC15C4,validateINC15C4} from "../scripts/inc15c4-hhs-validation-core.mjs";
const data=loadINC15C4();
const bad=/INC-15C\.4 source overlap rejected:/;
test("11 HHS Government Manual publisher nodes crosswalk 29 HHS index links without legal certification",()=>{
 const x=validateINC15C4(data);
 assert.equal(x.candidateNamePairs,11);
 assert.equal(x.indexOnlyEntries,18);
 assert.equal(x.spellingVariants,1);
 assert.equal(x.legalIdentityCertified,0);
 assert.equal(x.legalFirstLevelDenominator,null);
 assert.equal(x.hhsOriginalHtmlIndependentlyArchived,false);
});
const pair=(d,abbr)=>d.model.items.find(x=>x.hhs_index_abbreviation===abbr);
const reject=[
 ["current HHS legal first-level denominator",d=>d.model.total_current_legal_first_level_denominator=29],
 ["invented independent legal review",d=>d.model.independently_qualified_same_legal_identity_pairs=11],
 ["invented HHS raw HTML custody",d=>d.model.independently_archived_hhs_html=true],
 ["invented HHS raw publisher SHA",d=>d.model.hhs_index_original_official_html_sha256="a".repeat(64)],
 ["fictitious direct reporting",d=>pair(d,"CDC").current_office_reporting_verified=true],
 ["fictitious CMS verified delegation",d=>pair(d,"CMS").legal_delegation_or_command_verified=true],
 ["fabricated interagency mission relationship",d=>pair(d,"NIH").mission_cross_agency_relationship_verified=true],
 ["unreviewed current first-level HHS placement",d=>pair(d,"FDA").current_first_level_placement_certified=true],
 ["wrong department original HHS label",d=>pair(d,"ACF").hhs_index_publisher_name="Department of Defense"],
 ["wrong GovMan parent",d=>pair(d,"ATSDR").govman_parent_source_key="GOVMAN-2025-12-31:114"],
 ["CMS ampersand spelling exception hidden",d=>pair(d,"CMS").name_relation="exact_publisher_name"],
 ["unbacked ARPAH GovMan entry",d=>pair(d,"ACF").govman_source_entity_key="GOVMAN-2025-12-31:999"],
 ["cross-epoch immutable HHS SHA drift",d=>d.model.hhs_index_source_blob_sha1="a".repeat(40)],
 ["misidentified official GovMan edition",d=>d.model.govman_publication_edition="GOVMAN-2026-12-31"],
 ["misleading source union count",d=>d.model.govman_only_hhs_subentry_names=1],
 ["dropped NIH original mapping",d=>d.model.items.splice(d.model.items.findIndex(x=>x.hhs_index_abbreviation==="NIH"),1)],
 ["fictitious HHS new crosswalk",d=>d.model.items.push(structuredClone(d.model.items[0]))],
 ["publisher-index-only absence claim",d=>d.model.hhs_index_only[0].disposition="HHS office ceased to exist"],
 ["historical source office role promoted to command",d=>d.model.hhs_index_only[0].independent_organizational_review_complete=true],
 ["DAB omitted from index-only residual",d=>d.model.hhs_index_only=d.model.hhs_index_only.filter(x=>x.hhs_index_abbreviation!=="DAB")],
 ["untyped signed legal authority",d=>pair(d,"CMS").signed_directive_certified=true],
 ["schema and record co-forgery",d=>{pair(d,"CMS").signed_delegation=true;d.schema.properties.items.items.properties.signed_delegation={type:"boolean"};d.schema.properties.items.items.required.push("signed_delegation");}],
 ["manifest legal denominator set",d=>d.manifest.federal_institutional_breadth_15c4_extension.current_first_level_denominator=29],
 ["source original Government Manual digest tampered",d=>d.custody.original_sha256="0".repeat(64)],
 ["source original HHS JSON changes",d=>d.rawH+=" "],
 ["source original GovMan derived JSON changes",d=>d.rawG+=" "]
];
for(const [name,mutate] of reject)test("HHS source edition overlap rejects "+name,()=>{
 const d=structuredClone(data);mutate(d);assert.throws(()=>validateINC15C4(d),bad);
});
