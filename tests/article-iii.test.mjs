// Article III architectural legal-integrity tests: preserve distinctions and fail on unsafe model changes.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleIII} from "../scripts/article-iii-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 return {
  manifest:read("model/federal/manifest.json"),
  models:{
   units:read("model/constitutional/article-iii-units.json"),
   qualifications:read("model/constitutional/article-iii-qualifications.json"),
   capabilityLinks:read("model/constitutional/article-iii-capability-links.json"),
   jurisdiction:read("model/constitutional/article-iii-jurisdiction.json")
  },
  provisions:read("model/constitutional/provisions.json").items,
  norms:read("model/constitutional/norms.json").items,
  bindings:read("model/constitutional/bindings.json").items,
  capabilities:read("model/federal/capabilities.json").items,
  actors:read("model/constitutional/actors.json").items,
  sources:read("model/federal/sources.json").items,
  articleIQualifications:read("model/constitutional/article-i-qualifications.json").items,
  articleIIQualifications:read("model/constitutional/article-ii-qualifications.json").items
 };
}
const errors=f=>validateArticleIII(f).errors;
function reject(f,word){
 const actual=errors(f);
 assert.ok(actual.some(e=>e.includes(word)),"Expected "+word+"\n"+actual.join("\n"));
}
const getq=(f,id)=>f.models.qualifications.items.find(x=>x.id===id);
const getp=(f,id)=>f.provisions.find(x=>x.id===id);
test("Article III 8 units, 5 numbered clauses, 3 unnumbered segments, 9 jurisdiction categories",()=>{
 const outcome=validateArticleIII(fixture());
 assert.deepEqual(outcome.errors,[]);
 assert.deepEqual(outcome.counts,{
  units:8,numbered_clauses:5,section1_analytic_segments:3,jurisdiction_categories:9,
  qualifications:53,capability_links:42,mapped_norms:35
 });
});
test("Sections 2 and 3 have all five original numbered clauses; Section 1 has no invented clause",()=>{
 const f=fixture();
 assert.equal(f.models.units.items.filter(x=>x.unit_kind==="numbered_clause").length,5);
 assert.ok(!f.provisions.some(p=>p.id.startsWith("CONST-US-ART-03-SEC-01-CL-")));
 assert.ok(f.provisions.filter(p=>p.id.startsWith("CONST-US-ART-03-SEC-01-SEG-")).every(p=>p.citation==="U.S. Const. art. III, § 1"));
});
test("rejects omission of Article III Section 3 Clause 2",()=>{
 const f=fixture();f.models.units.items=f.models.units.items.filter(u=>u.id!=="AIII-UNIT-03-02");
 reject(f,"Missing Article III unit AIII-UNIT-03-02");
});
test("rejects artificial Article III Section 1 original clause",()=>{
 const f=fixture();f.provisions.push({...getp(f,"CONST-US-ART-03-SEC-01-SEG-01"),id:"CONST-US-ART-03-SEC-01-CL-01",unit:"article_clause"});
 reject(f,"Invented official Section 1 clause");
});
test("rejects segment mislabeled as numbered clause",()=>{
 const f=fixture();getp(f,"CONST-US-ART-03-SEC-01-SEG-01").unit="article_clause";
 reject(f,"Invented original Article III Section 1 clause");
});
test("rejects false clause citation for Section 1 analytic segment",()=>{
 const f=fixture();getp(f,"CONST-US-ART-03-SEC-01-SEG-01").citation="U.S. Const. art. III, § 1, cl. 1";
 reject(f,"Misrepresented Section 1 semantic segment as official clause");
});
test("rejects an untraced Article III norm",()=>{
 const f=fixture();f.models.units.items[0].norm_ids=["NORM-US-CONST-MISSING"];
 reject(f,"Incorrect Article III norm/provision");
});
test("rejects missing Section 1 good behavior safeguard",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-01-02-GOOD-BEHAVIOR");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-01-02-GOOD-BEHAVIOR");
});
test("rejects deletion of Article III nondiminution safeguard",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-01-03-NO-DIMINUTION");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-01-03-NO-DIMINUTION");
});
test("rejects Article III judicial independence misapplied to Court of Federal Claims",()=>{
 const f=fixture();f.bindings.find(b=>b.norm_id==="NORM-US-CONST-031"&&b.relationship_type==="protects").target_id="ORG-FED-JUD-COFC";
 reject(f,"Article III tenure wrongly extended to non-Article-III judicial body");
});
test("rejects legacy generic federal court judges as protected article III judges",()=>{
 const f=fixture();f.bindings.find(b=>b.norm_id==="NORM-US-CONST-031"&&b.relationship_type==="protects").target_id="ACT-US-FED-COURTS";
 reject(f,"Article III tenure wrongly extended to non-Article-III judicial body");
});
test("rejects inferior-court creation power given to President instead of Congress",()=>{
 const f=fixture();f.bindings.find(b=>b.norm_id==="NORM-US-CONST-AIII-01-01-INFERIOR-CREATION").target_id="ORG-FED-EXE-PRESIDENT";
 reject(f,"Wrong congressional authority holder");
});
test("rejects the disappearance of jurisdiction category from enumeration",()=>{
 const f=fixture();f.models.jurisdiction.items=f.models.jurisdiction.items.filter(j=>j.id!=="AIII-JUR-07");
 reject(f,"Missing Article III jurisdiction category AIII-JUR-07");
});
test("rejects cases vs controversies conflation",()=>{
 const f=fixture();f.models.jurisdiction.items.find(j=>j.id==="AIII-JUR-01").matter_group="controversies";
 reject(f,"jurisdiction case/controversy family mismatch");
});
test("rejects treating a constitutional category as directly granting lower court statutory jurisdiction",()=>{
 const f=fixture();f.models.jurisdiction.items[0].does_not_self_authorize_inferior_court_jurisdiction=false;
 reject(f,"Constitutional category incorrectly claimed to authorize statutory lower-court jurisdiction");
});
test("rejects removal of Eleventh Amendment boundary from state-citizen jurisdiction",()=>{
 const f=fixture();f.models.jurisdiction.items.find(j=>j.id==="AIII-JUR-06").qualification_ids=["AIII-QUAL-02-01-STATE-OTHER-CITIZEN"];
 reject(f,"Eleventh Amendment sovereign immunity boundary missing");
});
test("rejects removal of Eleventh Amendment boundary from foreign-state-related category",()=>{
 const f=fixture();f.models.jurisdiction.items.find(j=>j.id==="AIII-JUR-09").constitutional_effect_status="operative";
 reject(f,"Eleventh Amendment sovereign immunity boundary missing");
});
test("rejects treating Article III original State-citizen jurisdiction as fully unmodified",()=>{
 const f=fixture();getp(f,"CONST-US-ART-03-SEC-02-CL-01").effect_status="operative";
 reject(f,"Eleventh Amendment qualification omitted");
});
test("rejects supremacy of unsupported jurisdiction over statutory source law",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].relationship_type="delegates_to_court";
 reject(f,"Article III function wrongly asserted as agency delegation");
});
test("rejects unqualified judicial capability",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].qualification_ids=[];
 reject(f,"Unqualified Article III capability alignment");
});
test("rejects appellate jurisdiction exceptions given to President instead of Congress",()=>{
 const f=fixture();f.bindings.find(b=>b.norm_id==="NORM-US-CONST-AIII-02-02-CONGRESS-EXCEPTIONS").target_id="ORG-FED-EXE-PRESIDENT";
 reject(f,"Wrong congressional authority holder");
});
test("rejects elimination of Supreme Court original jurisdiction safeguard",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-02-02-SUPREME-ORIGINAL");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-02-02-SUPREME-ORIGINAL");
});
test("rejects deletion of crime trial jury requirement",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-02-03-JURY-TRIAL");
 reject(f,"Dangling Article III unit qualifier");
});
test("rejects deletion of impeachment exception from jury requirement",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-02-03-IMPEACHMENT-EXCEPTION");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-02-03-IMPEACHMENT-EXCEPTION");
});
test("rejects removal of crime venue in State where crime occurred",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-02-03-CRIME-STATE-VENUE");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-02-03-CRIME-STATE-VENUE");
});
test("rejects treason convictions without same-overt-act two witness protection",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-03-01-TWO-WITNESSES-SAME-ACT");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-03-01-TWO-WITNESSES-SAME-ACT");
});
test("rejects deletion of open court confession alternative",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-03-01-CONFESSION-OPEN-COURT");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-03-01-CONFESSION-OPEN-COURT");
});
test("rejects hypothetical hereditary corruption of blood as treason punishment",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-03-02-NO-CORRUPTION-OF-BLOOD");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-03-02-NO-CORRUPTION-OF-BLOOD");
});
test("rejects deletion of life-limited treason forfeiture",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AIII-QUAL-03-02-FORFEITURE-LIFETIME");
 reject(f,"Missing critical Article III safeguard AIII-QUAL-03-02-FORFEITURE-LIFETIME");
});
test("rejects invented direct constitutional judicial-review power in Section 1",()=>{
 const f=fixture();getq(f,"AIII-QUAL-01-01-JUDICIAL-REVIEW-SEPARATE").origin="original_text";
 reject(f,"Judicial review incorrectly asserted as express constitutional text");
});
test("rejects fabricated case-law status in an unreviewed qualification",()=>{
 const f=fixture();getq(f,"AIII-QUAL-01-01-JUDICIAL-REVIEW-SEPARATE").legal_review_status="settled_court_holding";
 reject(f,"Unreviewed Article III legal claim");
});
test("rejects dangling Article I power link for Congress to create inferior courts",()=>{
 const f=fixture();getq(f,"AIII-QUAL-01-01-INFERIOR-COURTS-CONGRESS").article_i_qualification_ids=["AI-QUAL-DOES-NOT-EXIST"];
 reject(f,"Dangling Article I safeguard");
});
test("rejects dangling Article II judicial appointment Senate consent",()=>{
 const f=fixture();getq(f,"AIII-QUAL-01-01-ARTICLE-II-APPOINTMENTS").article_ii_qualification_ids=[];
 reject(f,"Judicial appointment rule lost Article II Senate participation");
});
test("rejects unsupported Eleventh Amendment overlay",()=>{
 const f=fixture();getq(f,"AIII-QUAL-02-01-ELEVENTH-AMENDMENT").source_provision_ids=["CONST-US-ART-03-SEC-02-CL-01"];
 reject(f,"Article III amendment overlay lacks amendment");
});
test("rejects a missing Article III publication family",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(x=>x!=="model/constitutional/article-iii-jurisdiction.json");
 reject(f,"Missing Article III publication entry article-iii-jurisdiction");
});
test("rejects missing source provenance for jurisdiction claim",()=>{
 const f=fixture();f.models.jurisdiction.items[0].source_ids=["SRC-NOT-REAL"];
 reject(f,"Dangling Article III source");
});
