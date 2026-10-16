// Judicial-precedent legal boundary regressions: test data tampering must fail closed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateJudicialPrecedent} from "../scripts/judicial-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 const rows={courts:"courts",sources:"sources",cases:"cases",holdings:"holdings",interpretations:"interpretations",treatments:"treatments",statusAssessments:"status-assessments",applicability:"applicability",viewpoints:"viewpoints"};
 const fed=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities"];
 return {manifest:read("model/federal/manifest.json"),
  models:Object.fromEntries(Object.entries(rows).map(([k,file])=>[k,read("model/judicial/"+file+".json")])),
  provisions:read("model/constitutional/provisions.json").items,
  norms:read("model/constitutional/norms.json").items,
  actors:read("model/constitutional/actors.json").items,
  federalInstitutions:fed.flatMap(k=>read("model/federal/"+k+".json").items)};
}
const found=(f,k,id)=>f.models[k].items.find(x=>x.id===id);
const status=(f,id)=>f.models.statusAssessments.items.find(x=>x.holding_id===id);
const cap=(f,id)=>f.models.applicability.items.find(x=>x.holding_id===id);
const h=x=>"HOLD-US-SCOTUS-"+x+"-01";
const c=x=>"CASE-US-SCOTUS-"+x;
function reject(f,msg){
 const r=validateJudicialPrecedent(f);
 assert.ok(r.errors.some(e=>e.includes(msg)),msg+"\n"+r.errors.join("\n"));
}
test("initial 18-case judicial precedent dataset passes every legal provenance gate",()=>{
 const r=validateJudicialPrecedent(fixture());assert.deepEqual(r.errors,[]);
 assert.deepEqual(r.counts,{courts:1,official_opinion_sources:18,supporting_sources:7,cases:18,holdings:20,constitutional_links:30,treatments:10,status_assessments:20,applicability:20,viewpoints:6});
});
test("Supreme Court case registry contains two distinct Marbury holdings and two McCulloch holdings",()=>{
 const f=fixture();
 assert.equal(f.models.holdings.items.filter(x=>x.case_id===c("MARBURY-1803")).length,2);
 assert.equal(f.models.holdings.items.filter(x=>x.case_id===c("MCCULLOCH-1819")).length,2);
});
test("reject missing necessary Supreme Court institutional court",()=>{
 const f=fixture();f.models.courts.items=[];reject(f,"U.S. Supreme Court institutional register missing");
});
test("reject U.S. Supreme Court modeled as State appellate judiciary",()=>{
 const f=fixture();f.models.courts.items[0].court_system="state";reject(f,"Supreme Court federal precedent rank altered");
});
test("reject opinion citation with inaccurate original decision date",()=>{
 const f=fixture();found(f,"cases",c("BROWN-1954")).decided_on="1954-05-18";reject(f,"Judicial decision date or case missing");
});
test("reject case claiming CRS analysis as controlling court opinion",()=>{
 const f=fixture();found(f,"cases",c("BROWN-1954")).opinion_source_ids=["SRC-JUD-ANALYSIS-CONAN-ANTICOMMANDEERING"];reject(f,"Judicial case cites secondary material as controlling opinion");
});
test("reject opinion source being changed to unofficial domain but labeled Government Printing Office",()=>{
 const f=fixture();found(f,"sources","SRC-JUD-OPINION-MARBURY-1803").url="https://not-a-court.invalid/marbury";reject(f,"Official United States Reports source not government publisher");
});
test("reject modern 2024 official Court opinion falsely from private blog",()=>{
 const f=fixture();found(f,"sources","SRC-JUD-OPINION-LOPER-BRIGHT-2024").url="https://unreviewed.invalid/opinion";reject(f,"Modern Court opinion not official PDF");
});
test("reject decision case pointing to a different valid court opinion date",()=>{
 const f=fixture();found(f,"cases",c("HANS-1890")).opinion_source_ids=["SRC-JUD-OPINION-EX-PARTE-YOUNG-1908"];reject(f,"Judicial case cites secondary material as controlling opinion");
});
test("reject case claiming final comprehensive verification of opinion instead of research candidate",()=>{
 const f=fixture();f.models.cases.items[0].opinion_text_review_status="fully_citator_verified";reject(f,"Invalid case provenance or premature legal certification");
});
test("reject improperly binding every legal issue in every jurisdiction automatically",()=>{
 const f=fixture();f.models.cases.items[0].court_authority_scope="binding_in_every_case_on_every_question";reject(f,"Overbroad Supreme Court nationwide holding scope");
});
test("reject empty constitutional provision links on an opinion holding",()=>{
 const f=fixture();f.models.holdings.items[0].constitutional_provision_ids=[];reject(f,"Judicial holding constitutional text/norm links not paired");
});
test("reject holding norm cross-reference to an unrelated constitutional provision",()=>{
 const f=fixture();f.models.holdings.items[0].constitutional_norm_ids[0]="NORM-US-CONST-070";reject(f,"Judicial holding links unrelated constitutional norm");
});
test("reject nonexistent constitutional amendment provision claimed as judicial opinion source",()=>{
 const f=fixture();f.models.holdings.items[0].constitutional_provision_ids[0]="CONST-US-AMD-99";reject(f,"Judicial holding links unrelated constitutional norm");
});
test("reject case holding mislabeled as formal dissent or unchecked opinion authority",()=>{
 const f=fixture();f.models.holdings.items[0].opinion_role="dissent_not_controlling";reject(f,"Unreviewed judicial holding or opinion role asserted controlling");
});
test("reject case judicial review holding upgraded to enacted constitutional amendment",()=>{
 const f=fixture();f.models.interpretations.items[0].derivative_status="ratified_constitutional_text";reject(f,"Judicial interpretation presented as express ratified constitutional text");
});
test("reject Loper Bright's APA statute holding represented as original Article III constitutional text",()=>{
 const f=fixture();const i=f.models.interpretations.items.find(x=>x.case_id===c("LOPER-BRIGHT-2024"));i.relation_kind="court_interprets_constitutional_provision";reject(f,"Statutory holding falsely elevated to direct constitutional interpretation");
});
test("reject Chevron deference represented as judicially verified current constitutional authority",()=>{
 const f=fixture();const i=f.models.interpretations.items.find(x=>x.case_id===c("CHEVRON-1984"));i.relation_kind="court_interprets_constitutional_provision";reject(f,"Statutory holding falsely elevated to direct constitutional interpretation");
});
test("reject interpretation missing part of a multi-provision holding crosswalk",()=>{
 const f=fixture();f.models.interpretations.items=f.models.interpretations.items.filter(x=>x.holding_id!==h("MARTIN-1816"));reject(f,"Judicial holding missing independently typed cross-Article link");
});
test("reject opinion-based mapping without its original opinion as evidence",()=>{
 const f=fixture();f.models.interpretations.items[0].evidence_source_ids=["SRC-JUD-OPINION-BROWN-1954"];reject(f,"Judicial doctrine claims unrelated opinion");
});
test("reject an invented later-treatment relation with reversed chronology",()=>{
 const f=fixture();const t=f.models.treatments.items[0];t.treating_case_id=c("HANS-1890");t.treating_holding_id=h("HANS-1890");reject(f,"Precedent treatment chronology or polarity invalid");
});
test("reject a treatment link from a later case to unrelated holding within other case",()=>{
 const f=fixture();const t=f.models.treatments.items[0];t.treating_holding_id=h("MCCULLOCH-1819");reject(f,"Precedent treatment references a wrong case holding");
});
test("reject later treatment sourced from older opinion instead of newer Court decision",()=>{
 const f=fixture();f.models.treatments.items[0].source_ids=["SRC-JUD-OPINION-HANS-1890"];reject(f,"Judicial treatment source is not the later decision opinion");
});
test("reject reversal of Dobbs overruling Roe to mere reaffirmation",()=>{
 const f=fixture();const t=f.models.treatments.items.find(x=>x.treating_case_id===c("DOBBS-2022")&&x.treated_case_id===c("ROE-1973"));t.relationship_type="reaffirms_and_applies";reject(f,"Missing express overruling");
});
test("reject erasure of Dobbs express Casey overruling",()=>{
 const f=fixture();f.models.treatments.items=f.models.treatments.items.filter(x=>!(x.treating_case_id===c("DOBBS-2022")&&x.treated_case_id===c("CASEY-1992")));reject(f,"Missing express overruling");
});
test("reject erasure of Loper Bright express Chevron overruling",()=>{
 const f=fixture();f.models.treatments.items=f.models.treatments.items.filter(x=>x.treated_case_id!==c("CHEVRON-1984"));reject(f,"Missing express overruling");
});
test("reject Brown being mislabeled a full case-wide overrule of Plessy in all fields",()=>{
 const f=fixture();const t=f.models.treatments.items.find(x=>x.treating_case_id===c("BROWN-1954"));t.relationship_type="expressly_overrules";reject(f,"Brown/Plessy educational limit flattened to case-wide reversal");
});
test("reject Ex parte Young exception falsely converted into outright overruling Hans",()=>{
 const f=fixture();const t=f.models.treatments.items.find(x=>x.treating_case_id===c("EX-PARTE-YOUNG-1908"));t.relationship_type="expressly_overrules";reject(f,"State officer prospective relief exception removed");
});
test("reject later treatment record claiming case-wide reversal when merely reaffirmed",()=>{
 const f=fixture();const t=f.models.treatments.items.find(x=>x.relationship_type==="extends_doctrine");t.does_not_imply_whole_case_overruling=false;reject(f,"Holding-specific treatment erroneously generalized to case-wide overruling");
});
test("reject treating a later case's date as preceding older case",()=>{
 const f=fixture();const t=f.models.treatments.items[0];t.effective_on="1800-01-01";reject(f,"Precedent treatment chronology or polarity invalid");
});
test("reject missing case-specific current status assessment",()=>{
 const f=fixture();f.models.statusAssessments.items=f.models.statusAssessments.items.filter(x=>x.holding_id!==h("CHEVRON-1984"));reject(f,"Missing holding-level status assessment");
});
test("reject Roe being marked current good law after express overruling",()=>{
 const f=fixture();status(f,h("ROE-1973")).classification="no_adverse_treatment_identified_in_seed_only";reject(f,"Precedent status inconsistent with sourced subsequent holdings");
});
test("reject Chevron status inferred without Loper Bright treatment",()=>{
 const f=fixture();status(f,h("CHEVRON-1984")).modeled_treatment_ids=[];reject(f,"Precedent status missing directed treatment edge");
});
test("reject asserting comprehensive citator check despite no citator workflow",()=>{
 const f=fixture();f.models.statusAssessments.items[0].comprehensive_citator_review_completed=true;reject(f,"Incomplete legal citator wrongly claimed fully current controlling precedent");
});
test("reject asserting that a holding is affirmatively verified binding without legal review",()=>{
 const f=fixture();f.models.statusAssessments.items[0].current_binding_effect_verified=true;reject(f,"Incomplete legal citator wrongly claimed fully current controlling precedent");
});
test("reject removing the citator uncertainty explanation for public publication",()=>{
 const f=fixture();f.models.statusAssessments.items[0].caveat="Fully approved";reject(f,"Unsafe or missing uncertainty disclaimer");
});
test("reject deleting jurisdiction and applicability projection",()=>{
 const f=fixture();f.models.applicability.items=f.models.applicability.items.filter(x=>x.holding_id!==h("GIDEON-1963"));reject(f,"Holding-specific jurisdiction applicability inventory missing");
});
test("reject governing people outside the case issue scope",()=>{
 const f=fixture();cap(f,h("MARBURY-1803")).bounded_issue_scope="all_litigation";reject(f,"Judicial holding jurisdiction or precedent projection has wrong identity");
});
test("reject adding State law as nationwide binding Supreme Court scope",()=>{
 const f=fixture();cap(f,h("BROWN-1954")).precedential_role="court_controls_all_state_constitutional_law";reject(f,"Judicial applicability claims unsupported blanket nationwide precedent");
});
test("reject treating an expressly overruled Chevron rule as currently binding",()=>{
 const f=fixture();cap(f,h("CHEVRON-1984")).binding_status="not_certified_current_controlling_pending_citator_review";reject(f,"Overruled or unverified holding improperly labeled currently binding");
});
test("reject assigning Ninth Amendment State-only coverage to Chevron statutory APA doctrine",()=>{
 const f=fixture();cap(f,h("CHEVRON-1984")).legal_question_family="federal_constitutional_question";reject(f,"Statutory precedent mistaken for a ratified constitutional rule");
});
test("reject changing case-specific governmental addressee after judicial scope analysis",()=>{
 const f=fixture();cap(f,h("MURPHY-2018")).government_addressee_actor_ids=["ACT-US-FED"];reject(f,"Judicial precedent binding actor scope expanded or changed");
});
test("reject a judicial viewpoint moved into the architecture data repo as website renderer",()=>{
 const f=fixture();f.models.viewpoints.items[0].publication_owner="afri-architecture";reject(f,"Judicial viewpoint incorrectly implies website-renderer ownership");
});
test("reject omission of one judicial register from manifest",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(x=>!x.endsWith("/judicial/applicability.json"));reject(f,"Missing judicial publication model applicability");
});
