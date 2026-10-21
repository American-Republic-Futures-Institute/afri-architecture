import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {loadINC15C3,validateINC15C3,SOURCE_PIN} from "../scripts/inc15c3-validation-core.mjs";
const clone=x=>structuredClone(x),load=()=>loadINC15C3();
const row=(d,code)=>d.model.items.find(x=>x.source_abbreviation===code);
const bad=/INC-15C\.3 HHS source rejected:/;

test("HHS publisher index reconciles 28 previous IDs plus ARPA-H as a 29th unratified linked-name candidate",()=>{
 const d=load(),x=validateINC15C3(d);
 assert.equal(x.sourcePin,SOURCE_PIN);
 assert.equal(x.reusedHistoricalNames,28);
 assert.equal(x.boundedPublisherIndexNames,29);
 assert.equal(x.newlyObservedName,"ARPA-H");
 assert.equal(x.separatePublisherHeadingsAndLeadership,5);
 assert.equal(x.legallyCertifiedFirstLevelInstitutions,0);
 assert.equal(x.verifiedCrossGovernmentMissionEdges,0);
 assert.equal(x.currentFirstLevelDenominator,null);
 assert.equal(d.model.items.length,29);
 assert.equal(row(d,"ARPA-H").original_arch04b_id,null);
 assert.equal(row(d,"ARPA-H").published_position,9);
 assert.equal(row(d,"ARPA-H").legally_qualified_unit_id,null);
 assert.equal(row(d,"OIG").source_research_kind,"independent_inspector_general_statutory_review");
 assert.deepEqual(["DAB","OMHA"].map(x=>row(d,x).source_research_kind),
  ["administrative_adjudication_requires_statutory_review","administrative_adjudication_requires_statutory_review"]);
 assert.equal(d.model.original_official_html_sha256,null);
 assert.equal(d.model.govman_granule_is_separate_source_population,true);
});
const reject=[
 ["fictitious HHS current legal first-level denominator",d=>d.model.current_complete_department_first_level_denominator=29],
 ["source index name count promoted to 28",d=>d.model.bounded_publisher_index_linked_name_records=28],
 ["extra legal institution certification",d=>d.model.adl1_certified_count=1],
 ["claim raw HHS HTML archived",d=>d.model.original_official_html_bytes_archived=true],
 ["invented publisher original SHA",d=>d.model.original_official_html_sha256="a".repeat(64)],
 ["fake independent legal review",d=>d.model.independent_legal_review_complete=true],
 ["fabricated mission cross-agency edges",d=>d.model.mission_cross_agency_relations_verified_count=5],
 ["fabricated line of reporting",d=>d.model.current_reporting_chain_certified_count=29],
 ["source URL swapped",d=>d.model.official_publisher_url="https://other.example/hhs"],
 ["source edition changed",d=>d.model.page_last_reviewed_as_reported="2026-10-21"],
 ["invented original qualified institutional identity",d=>row(d,"ARPA-H").legally_qualified_unit_id="ORG-FED-EXE-HHS-ARPAH"],
 ["cross-department parent to DoD",d=>row(d,"CDC").published_heading_not_legal_parent="Department of Defense"],
 ["source role guessed as signed authority",d=>row(d,"FDA").legally_delegated_authority_verified=true],
 ["false interagency mission link",d=>row(d,"CDC").other_agency_dependency_verified=true],
 ["unreviewed mission assigned",d=>row(d,"CMS").mission_assignment_verified=true],
 ["OIG placed in command chain",d=>row(d,"OIG").operational_reporting_verified=true],
 ["OIG independence kind discarded",d=>row(d,"OIG").source_research_kind="operating_division_candidate"],
 ["DAB adjudicative status discarded",d=>row(d,"DAB").source_research_kind="departmental_staff_office_candidate"],
 ["OMHA adjudicative status discarded",d=>row(d,"OMHA").source_research_kind="operating_division_candidate"],
 ["ARPAH original historical ID invented",d=>row(d,"ARPA-H").original_arch04b_id="ARCH04B-HHS-ARPAH"],
 ["ARPAH made as earlier entry",d=>row(d,"ARPA-H").previously_modeled=true],
 ["ARPAH moved out of observed list",d=>row(d,"ARPA-H").published_position=17],
 ["duplicated old agency ID",d=>row(d,"NIH").original_arch04b_id="ARCH04B-HHS-CDC"],
 ["renamed source original",d=>row(d,"ASPR").source_name="Secret Oversight Authority"],
 ["removed an original named entry",d=>d.model.items.pop()],
 ["inserted unreviewed HHS agency",d=>d.model.items.push(clone(d.model.items[0]))],
 ["Office of Secretary counted as named agency",d=>d.model.ancillary_publisher_features[0].counted_as_directory_link=true],
 ["Chief of Staff assigned a confirmed officeholder",d=>d.model.ancillary_publisher_features[4].officeholder_name_verified=true],
 ["new untyped model field",d=>row(d,"NIH").direct_regulatory_command_certified=true],
 ["co-edited schema and record invent command",d=>{
  const r=row(d,"NIH");r.signed_operational_command=true;
  const rule=d.schema.properties.items.items;
  rule.required.push("signed_operational_command");
  rule.properties.signed_operational_command={type:"boolean"};
 }],
 ["manifest current legal department denominator",d=>d.manifest.federal_institutional_breadth_15c3_extension.current_legal_first_level_department_denominator=29],
 ["manifest source original promotion",d=>d.manifest.federal_institutional_breadth_15c3_extension.publisher_html_original_bytes_verified=true],
 ["manifest new authority field",d=>d.manifest.federal_institutional_breadth_15c3_extension.current_agency_command_certified=true],
 ["manifest family omitted",d=>d.manifest.models=d.manifest.models.filter(x=>x!=="model/federal/inc15c3-hhs-directory-reconciliation.json")],
 ["tampered earlier original HHS role in memory",d=>d.originals["model/federal/archive04b/hhs-source-entries.json"].items[0].provisional_kind="executed_command"],
 ["tampered GovMan root in memory",d=>d.originals["model/federal/archive04b/govman-xml-root-metadata.json"].items.find(x=>x.id==="ARCH04B-XML-ROOT-HHS").agency_name="Nonexistent Dept"],
 ["missing original model",d=>delete d.sourceBytes["model/federal/archive04b/hhs-source-entries.json"]]
];
for(const [title,mutate]of reject)test("HHS rejects "+title,()=>{
 const d=clone(load());mutate(d);assert.throws(()=>validateINC15C3(d),bad);
});
test("original Git checksum and original bytes co-forgery cannot qualify",()=>{
 const d=clone(load()),p="model/federal/archive04b/hhs-source-entries.json";
 d.sourceBytes[p]+=" ";
 const b=Buffer.from(d.sourceBytes[p],"utf8");
 const forged=createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
 assert.match(forged,/^[a-f0-9]{40}$/);
 d.originals[p]=JSON.parse(d.sourceBytes[p]);
 assert.throws(()=>validateINC15C3(d),/immutable source Git tree digest mismatch/);
});
