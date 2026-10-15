// ARFI-COA constitutional amendment safety regressions: retain historical distinctions.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateAmendments} from "../scripts/amendment-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 return {
  manifest:read("model/federal/manifest.json"),
  models:{
   units:read("model/constitutional/amendment-units.json"),
   timeline:read("model/constitutional/amendment-timeline.json"),
   effects:read("model/constitutional/amendment-effects.json"),
   qualifications:read("model/constitutional/amendment-qualifications.json"),
   capabilityLinks:read("model/constitutional/amendment-capability-links.json")
  },
  provisions:read("model/constitutional/provisions.json").items,
  norms:read("model/constitutional/norms.json").items,
  bindings:read("model/constitutional/bindings.json").items,
  changes:read("model/constitutional/changes.json").items,
  capabilities:read("model/federal/capabilities.json").items,
  sources:read("model/federal/sources.json").items
 };
}
const u=(f,id)=>f.models.units.items.find(x=>x.id===id);
const p=(f,id)=>f.provisions.find(x=>x.id===id);
const q=(f,id)=>f.models.qualifications.items.find(x=>x.id===id);
const e=(f,id)=>f.models.effects.items.find(x=>x.id===id);
const l=(f,id)=>f.models.capabilityLinks.items.find(x=>x.id===id);
const t=(f,n)=>f.models.timeline.items.find(x=>x.amendment_number===n);
function fail(f,message){
 const all=validateAmendments(f).errors;
 assert.ok(all.some(x=>x.includes(message)),message+"\n"+all.join("\n"));
}
test("complete all 27 amendments, 33 numbered Sections and 126 analytic segments",()=>{
 const v=validateAmendments(fixture());assert.deepEqual(v.errors,[]);
 assert.deepEqual(v.counts,{amendments:27,numbered_sections:33,analytical_segments:126,temporal_events:15,effects:126,qualifications:172,active_capability_links:114,historical_segments:12});
});
test("ratification data is complete and originally numbered sections are not invented",()=>{
 const f=fixture();assert.equal(f.provisions.filter(x=>x.unit==="amendment").length,27);
 assert.equal(f.provisions.filter(x=>x.unit==="amendment_section").length,33);
 assert.equal(f.provisions.filter(x=>x.unit==="amendment_segment").length+f.provisions.filter(x=>x.unit==="amendment_section_segment").length,126);
});
test("reject removal of last amendment timeline",()=>{
 const f=fixture();f.models.timeline.items=f.models.timeline.items.filter(x=>x.amendment_number!==27);
 fail(f,"Missing one or more ratified amendments in timeline");
});
test("reject altering official ratification date for Twenty-Seventh Amendment",()=>{
 const f=fixture();t(f,27).ratified_on="1992-05-18";fail(f,"Ratification date or root mismatch for Amendment 27");
});
test("reject certification treated as ratification",()=>{
 const f=fixture();t(f,27).certification_on="1992-05-07";fail(f,"Twenty-Seventh Amendment adoption vs certification date conflated");
});
test("reject treating State convention ratification as a legislature ratification for XXI",()=>{
 const f=fixture();t(f,21).ratification_mode="state_legislatures";fail(f,"Amendment ratification method incorrect 21");
});
test("reject deleting Article V amendment-process trace",()=>{
 const f=fixture();t(f,12).constitutional_ratification_basis_id="CONST-US-ART-06";fail(f,"Amendment chronology not sourced through Article V 12");
});
test("reject amendment default effect date changed from ratification",()=>{
 const f=fixture();t(f,27).default_legal_effect_start_on="1992-05-18";fail(f,"Amendment adoption/effect confused 27");
});
test("reject removal of original numbered amendment Section",()=>{
 const f=fixture();f.provisions=f.provisions.filter(x=>x.id!=="CONST-US-AMD-25-SEC-04");
 fail(f,"Missing actual amendment numbered Section 25.4");
});
test("reject missing amendment analytical provision",()=>{
 const f=fixture();f.models.units.items=f.models.units.items.filter(x=>x.id!=="AMD-UNIT-26-S01-01");
 fail(f,"126 amendment analytical segments required");
});
test("reject analytical segment presented as an official numbered clause",()=>{
 const f=fixture();p(f,"CONST-US-AMD-25-SEC-04-SEG-01").citation="U.S. Const. amend. XXV, § 4, cl. 1";
 fail(f,"Analytical amendment span presented as an official clause");
});
test("reject fictitious Section 1 in original unnumbered First Amendment",()=>{
 const f=fixture();u(f,"AMD-UNIT-01-U-01").original_section_number=1;
 fail(f,"Invented amendment clauses or incorrect numbered Section");
});
test("reject broken amendment segment source hierarchy",()=>{
 const f=fixture();p(f,"CONST-US-AMD-25-SEC-04-SEG-01").parent_id="CONST-US-AMD-20-SEC-04";
 fail(f,"Amendment segment parent/ordinal mismatch");
});
test("reject analytic provision called an actual constitutional clause",()=>{
 const f=fixture();p(f,"CONST-US-AMD-03-SEG-01").segment_kind="original_numbered_clause";
 fail(f,"Analytical amendment span presented as an official clause");
});
test("reject dormant Amendment XVIII reactivated in canonical provision",()=>{
 const f=fixture();u(f,"AMD-UNIT-18-S01-01").effect_status="operative";
 fail(f,"Historical status elevated to operative constitutional power");
});
test("reject an active capability alignment from a repealed constitutional provision",()=>{
 const f=fixture();u(f,"AMD-UNIT-18-S02-01").capability_link_ids=["AMD-CAP-0001"];
 fail(f,"Historical amendment created live authority binding");
});
test("reject an active actor binding for expired Amendment XX ratification condition",()=>{
 const f=fixture();f.bindings.push({...f.bindings[0],id:"BIND-US-CONST-9998",norm_id:u(f,"AMD-UNIT-20-S06-01").norm_id});
 fail(f,"Historical amendment created live authority binding");
});
test("reject reviving historic elected Senator transition after Amendment XVII",()=>{
 const f=fixture();u(f,"AMD-UNIT-17-U-05").lifecycle_state="current_operational";
 fail(f,"Historical status elevated to operative constitutional power");
});
test("reject grandfather exception treated as recurring after Amendment XXII",()=>{
 const f=fixture();u(f,"AMD-UNIT-22-S01-03").lifecycle_state="current_operational";
 fail(f,"Historical status elevated to operative constitutional power");
});
test("reject premature Eighteenth Amendment prohibition legal start",()=>{
 const f=fixture();u(f,"AMD-UNIT-18-S01-01").legal_effect_started_on="1919-01-16";
 fail(f,"Incorrect amendment effective-date interval");
});
test("reject treating Amendment XVIII prohibition as January 16, 1920 without CRS date",()=>{
 const f=fixture();u(f,"AMD-UNIT-18-S01-02").legal_effect_started_on="1920-01-16";
 fail(f,"Incorrect amendment effective-date interval");
});
test("reject Twenty-First Amendment repeal without 1933-12-05 effective end",()=>{
 const f=fixture();t(f,18).effect_end_on=null;
 fail(f,"Repealed Prohibition retained as current");
});
test("reject removing historical Eighteenth Amendment repeal event",()=>{
 const f=fixture();f.models.timeline.events=f.models.timeline.events.filter(x=>x.event_kind!=="amendment_repeal");
 fail(f,"Missing required amendment temporal transition 18:amendment_repeal");
});
test("reject October 1933 delayed effect replaced with ratification for Twentieth Amendment",()=>{
 const f=fixture();u(f,"AMD-UNIT-20-S01-01").legal_effect_started_on="1933-01-23";
 fail(f,"Incorrect amendment effective-date interval");
});
test("reject Twentieth Amendment January 3 Congress and January 20 President start transition conflation",()=>{
 const f=fixture();f.models.timeline.events.find(x=>x.event_kind==="historical_first_congressional_transition").applies_on="1937-01-20";
 fail(f,"Missing required amendment temporal transition 20:historical_first_congressional_transition");
});
test("reject Twentieth Amendment certification as adoption date",()=>{
 const f=fixture();t(f,20).certification_on="1933-01-23";
 fail(f,"Twentieth Amendment certification confused with adoption");
});
test("reject missing textual House contingent election State-delegation quorum",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWELFTH-HOUSE-QUORUM");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWELFTH-HOUSE-QUORUM");
});
test("reject missing Senate contingent Vice Presidential election quorum",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWELFTH-SENATE-QUORUM");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWELFTH-SENATE-QUORUM");
});
test("reject missing Thirteenth Amendment duly-convicted condition",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-THIRTEENTH-DULY-CONVICTED");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-THIRTEENTH-DULY-CONVICTED");
});
test("reject Fourteenth Amendment national-citizenship privileges applied to persons generally",()=>{
 const f=fixture();const nid=u(f,"AMD-UNIT-14-S01-03").norm_id;f.bindings.find(x=>x.norm_id===nid).target_id="ACT-US-PERSONS";
 fail(f,"Rights-holder text misclassified AMD-UNIT-14-S01-03");
});
test("reject Fourteenth Amendment person due-process reduced to citizens only",()=>{
 const f=fixture();const nid=u(f,"AMD-UNIT-14-S01-04").norm_id;f.bindings.find(x=>x.norm_id===nid).target_id="ACT-US-CITIZENS";
 fail(f,"Rights-holder text misclassified AMD-UNIT-14-S01-04");
});
test("reject Fourteenth Amendment person equal protection reduced to citizens",()=>{
 const f=fixture();const nid=u(f,"AMD-UNIT-14-S01-05").norm_id;f.bindings.find(x=>x.norm_id===nid).target_id="ACT-US-CITIZENS";
 fail(f,"Rights-holder text misclassified AMD-UNIT-14-S01-05");
});
test("reject treating an original judicial doctrine caveat as ratified amendment text",()=>{
 const f=fixture();q(f,"AMD-QUAL-SPECIAL-SECOND-MILITIA-CONTEXT").origin="ratified_amendment_text";
 fail(f,"Judicial doctrine caveat misrepresented as express amendment text");
});
test("reject a research-only caveat used to grant an operative capability",()=>{
 const f=fixture();const cap=f.models.capabilityLinks.items.find(x=>x.unit_id==="AMD-UNIT-02-U-01");cap.qualification_ids.push("AMD-QUAL-SPECIAL-SECOND-MILITIA-CONTEXT");
 fail(f,"Capability lacks applicable operative textual safeguard");
});
test("reject repeated State/federal provenance treated as a legal text change",()=>{
 const f=fixture();const context=f.models.effects.items.find(x=>x.relationship_kind==="constitutional_context_not_textual_amendment");context.classification="textually_supersedes_original_law";
 fail(f,"Context-only reference mislabeled as constitutional repeal");
});
test("reject unrelated constitutional change ID on amendment crosswalk",()=>{
 const f=fixture();f.models.effects.items[0].source_change_ids=["CHG-US-CONST-37"];
 fail(f,"False amending provision or affected source");
});
test("reject unsupported removal of congressional term start constitutional change",()=>{
 const f=fixture();f.changes=f.changes.filter(c=>c.id!=="CHG-US-CONST-36");
 fail(f,"Missing original article amendment effect CHG-US-CONST-36");
});
test("reject deleted congressional compensation transition (Amendment XXVII)",()=>{
 const f=fixture();f.changes=f.changes.filter(c=>c.id!=="CHG-US-CONST-37");
 fail(f,"Missing original article amendment effect CHG-US-CONST-37");
});
test("reject XXV Section 4 contested disability without four-day requirement",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFIFTH-FOUR-DAY");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFIFTH-FOUR-DAY");
});
test("reject XXV Section 4 contested disability without 48-hour Congress assembly",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFIFTH-FORTYEIGHT-HOUR");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFIFTH-FORTYEIGHT-HOUR");
});
test("reject XXV Section 4 contested disability without 21-day determination",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFIFTH-TWENTYONE-DAY");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFIFTH-TWENTYONE-DAY");
});
test("reject XXV Section 4 contested disability without dual two-thirds vote",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFIFTH-TWO-THIRDS-BOTH-HOUSES");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFIFTH-TWO-THIRDS-BOTH-HOUSES");
});
test("reject Vice President vacancy majority in both Houses being removed",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFIFTH-VP-MAJORITY-BOTH-HOUSES");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFIFTH-VP-MAJORITY-BOTH-HOUSES");
});
test("reject DC elector allotment without least-populous-State cap",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYTHIRD-DC-ELECTORS-CAP");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYTHIRD-DC-ELECTORS-CAP");
});
test("reject XXIV federal-office poll tax specificity removed",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYFOURTH-FEDERAL-OFFICES");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYFOURTH-FEDERAL-OFFICES");
});
test("reject citizen voting rights transformed to noncitizen-only rights under XXVI",()=>{
 const f=fixture();const nid=u(f,"AMD-UNIT-26-S01-01").norm_id;f.bindings.find(x=>x.norm_id===nid).target_id="ACT-US-PERSONS";
 fail(f,"Rights-holder text misclassified AMD-UNIT-26-S01-01");
});
test("reject omitted XXVII intervening House election requirement",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AMD-QUAL-SPECIAL-TWENTYSEVENTH-HOUSE-ELECTION");
 fail(f,"Critical constitutional amendment safeguard missing AMD-QUAL-SPECIAL-TWENTYSEVENTH-HOUSE-ELECTION");
});
test("reject creating implied agency delegation from an amendment capability mapping",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].relationship_type="agency_delegation";
 fail(f,"Amendment function mislabeled as statutory agency delegation");
});
test("reject invalid capabilities for amendment functions",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].capability_id="CAP-FED-999";
 fail(f,"Inactive/unknown amendment capability");
});
test("reject unsupported source citation in a ratified amendment record",()=>{
 const f=fixture();f.models.units.items[0].source_ids=["SRC-NONEXISTENT"];
 fail(f,"Unknown amendment provenance");
});
test("reject omission of the amendment-effects family from publication",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(x=>!x.endsWith("amendment-effects.json"));
 fail(f,"Missing amendment model manifest entry amendment-effects");
});
