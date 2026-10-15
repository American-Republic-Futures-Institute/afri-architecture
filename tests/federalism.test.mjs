// Model semantics regressions. Every negative case models an error the architecture must refuse.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateFederalism} from "../scripts/federalism-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 const fed=["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities"];
 return {
  manifest:read("model/federal/manifest.json"),
  models:Object.fromEntries(Object.entries({
   units:"federalism-units",qualifications:"federalism-qualifications",relationships:"federalism-relationships",rights:"federalism-rights",capabilityLinks:"federalism-capability-links"
  }).map(([k,p])=>[k,read("model/constitutional/"+p+".json")])),
  provisions:read("model/constitutional/provisions.json").items,
  norms:read("model/constitutional/norms.json").items,
  actors:read("model/constitutional/actors.json").items,
  bindings:read("model/constitutional/bindings.json").items,
  changes:read("model/constitutional/changes.json").items,
  federal_institutions:fed.flatMap(n=>read("model/federal/"+n+".json").items),
  capabilities:read("model/federal/capabilities.json").items,
  sources:read("model/federal/sources.json").items,
  articleIQualifications:read("model/constitutional/article-i-qualifications.json").items,
  articleIIQualifications:read("model/constitutional/article-ii-qualifications.json").items,
  articleIIIQualifications:read("model/constitutional/article-iii-qualifications.json").items
 };
}
const qual=(f,id)=>f.models.qualifications.items.find(x=>x.id===id),unit=(f,id)=>f.models.units.items.find(x=>x.id===id);
const rel=(f,id)=>f.models.relationships.items.find(x=>x.id===id),right=(f,id)=>f.models.rights.items.find(x=>x.id===id);
const prov=(f,id)=>f.provisions.find(x=>x.id===id);
function fails(f,reason){
 const errors=validateFederalism(f).errors;
 assert.ok(errors.some(x=>x.includes(reason)),reason+"\n"+errors.join("\n"));
}
test("complete Article IV, Article VI, X, XI and XIV federalism architecture passes",()=>{
 const r=validateFederalism(fixture());
 assert.deepEqual(r.errors,[]);
 assert.deepEqual(r.counts,{units:20,article_iv_units:10,article_vi_units:3,amendment_units:7,qualifications:72,relationships:40,protected_interests:9,capability_links:45});
});
test("requires every Article IV and Article VI original provision to be correctly anchored",()=>{
 const f=fixture();assert.equal(f.models.units.items.filter(x=>x.family==="article_iv").length,10);
 assert.equal(f.models.units.items.filter(x=>x.family==="article_vi").length,3);
 assert.equal(f.models.units.items.filter(x=>x.family==="amendment").length,7);
});
test("rejects deleted Article IV Section 4 domestic violence application unit",()=>{
 const f=fixture();f.models.units.items=f.models.units.items.filter(x=>x.id!=="FED-UNIT-IV-04-03");
 fails(f,"Missing or misattributed federalism unit FED-UNIT-IV-04-03");
});
test("rejects fictitious Article IV Section 1 numbered clause",()=>{
 const f=fixture();f.provisions.push({...prov(f,"CONST-US-ART-04-SEC-01-SEG-01"),id:"CONST-US-ART-04-SEC-01-CL-01",unit:"article_clause"});
 fails(f,"Invented numbered clause in original Article IV Section 1 or Section 4");
});
test("rejects fictitious Article IV Section 4 clause citation",()=>{
 const f=fixture();prov(f,"CONST-US-ART-04-SEC-04-SEG-02").citation="U.S. Const. art. IV, § 4, cl. 2";
 fails(f,"Artificial Article IV numbered constitutional clause");
});
test("rejects reactivating the superseded slave-service provision",()=>{
 const f=fixture();prov(f,"CONST-US-ART-04-SEC-02-CL-03").effect_status="operative";
 fails(f,"Thirteenth Amendment historical supersession lost");
});
test("rejects restoring enforcement relationships for inoperative fugitive-service text",()=>{
 const f=fixture();unit(f,"FED-UNIT-IV-02-03").relationship_ids=["FED-REL-0001"];
 fails(f,"Historical fugitive-service clause incorrectly activated");
});
test("rejects giving superseded fugitive-service norm an active capability",()=>{
 const f=fixture();unit(f,"FED-UNIT-IV-02-03").capability_link_ids=["FED-CAP-0001"];
 fails(f,"Historical fugitive-service clause incorrectly activated");
});
test("rejects deletion of Thirteenth Amendment's historic supersession trace",()=>{
 const f=fixture();qual(f,"FED-QUAL-IV-02-SLAVERY-HISTORICAL").source_provision_ids=["CONST-US-ART-04-SEC-02-CL-03"];
 fails(f,"Thirteenth Amendment historical abrogation untraced");
});
test("rejects missing state legislature consent in State admission",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-IV-03-STATE-LEGISLATURE-CONSENT");
 fails(f,"Missing critical federalism safeguard FED-QUAL-IV-03-STATE-LEGISLATURE-CONSENT");
});
test("rejects domestic violence protection modeled without State request condition",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-IV-04-DOMESTIC-LEGISLATURE-REQUEST");
 fails(f,"Missing critical federalism safeguard FED-QUAL-IV-04-DOMESTIC-LEGISLATURE-REQUEST");
});
test("rejects erasure of State executive fallback when legislature cannot convene",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-IV-04-DOMESTIC-EXECUTIVE-FALLBACK");
 fails(f,"Missing critical federalism safeguard FED-QUAL-IV-04-DOMESTIC-EXECUTIVE-FALLBACK");
});
test("rejects removal of unconditional invasion protection duty",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-IV-04-INVASION-ALL-STATES");
 fails(f,"Missing critical federalism safeguard FED-QUAL-IV-04-INVASION-ALL-STATES");
});
test("rejects State government moved into federal organizational hierarchy",()=>{
 const f=fixture();f.models.relationships.items[0].classification="subordinate_federal_agency";
 fails(f,"State governments misclassified as federal administrative subordinates");
});
test("rejects relationships without Article IV constitutional conditions",()=>{
 const f=fixture();f.models.relationships.items[0].qualification_ids=[];
 fails(f,"Unqualified federalism actor relationship");
});
test("rejects fabricated actor IDs in intergovernmental relationship",()=>{
 const f=fixture();f.models.relationships.items[0].subject_actor_id="ACT-US-NOT-EXISTS";
 fails(f,"Unknown federalism subject actor");
});
test("rejects unconditional priority for any federal statute irrespective of the Constitution",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-VI-02-LAWS-IN-PURSUANCE");
 fails(f,"Missing critical federalism safeguard FED-QUAL-VI-02-LAWS-IN-PURSUANCE");
});
test("rejects missing State judge's duty under the Supremacy Clause",()=>{
 const f=fixture();f.models.relationships.items=f.models.relationships.items.filter(x=>x.relationship_type!=="binds_state_judges");
 fails(f,"State judge supremacy duty missing");
});
test("rejects erasure of Article VI federal office no-religious-test clause",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-VI-03-NO-FEDERAL-RELIGIOUS-TEST");
 fails(f,"Missing critical federalism safeguard FED-QUAL-VI-03-NO-FEDERAL-RELIGIOUS-TEST");
});
test("rejects Tenth Amendment reservation without both States and people",()=>{
 const f=fixture();f.models.relationships.items=f.models.relationships.items.filter(x=>!(x.norm_id==="NORM-US-CONST-062"&&x.subject_actor_id==="ACT-US-PEOPLE"));
 fails(f,"Tenth Amendment State and people reservations incomplete");
});
test("rejects treating Tenth Amendment reserved powers as unconstrained delegation",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-X-NOT-DELEGATED-NOT-PROHIBITED");
 fails(f,"Missing critical federalism safeguard FED-QUAL-X-NOT-DELEGATED-NOT-PROHIBITED");
});
test("rejects removing textual claimant classes from Eleventh Amendment",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-XI-OUT-OF-STATE-OR-FOREIGN-CLAIMANTS");
 fails(f,"Missing critical federalism safeguard FED-QUAL-XI-OUT-OF-STATE-OR-FOREIGN-CLAIMANTS");
});
test("rejects erasing Article III jurisdiction link to Eleventh Amendment",()=>{
 const f=fixture();qual(f,"FED-QUAL-XI-ARTICLE-III-CONNECTION").source_provision_ids=["CONST-US-AMD-11"];
 fails(f,"Eleventh Amendment jurisdiction link missing Article III");
});
test("rejects turning XIV United States citizenship rights into general person rights",()=>{
 const f=fixture();right(f,"FED-RIGHT-06").holder_actor_id="ACT-US-PERSONS";
 fails(f,"Rights-holder or constitutional addressee incorrectly classified FED-RIGHT-06");
});
test("rejects reducing XIV State due process for persons to citizens only",()=>{
 const f=fixture();right(f,"FED-RIGHT-07").holder_actor_id="ACT-US-CITIZENS";
 fails(f,"Rights-holder or constitutional addressee incorrectly classified FED-RIGHT-07");
});
test("rejects reducing XIV equal protection from persons to citizens",()=>{
 const f=fixture();right(f,"FED-RIGHT-08").holder_actor_id="ACT-US-CITIZENS";
 fails(f,"Rights-holder or constitutional addressee incorrectly classified FED-RIGHT-08");
});
test("rejects applying Fourteenth Amendment Section 1 right to wrong constitutional addressee",()=>{
 const f=fixture();right(f,"FED-RIGHT-07").addressee_actor_id="ACT-US-FED";
 fails(f,"Rights-holder or constitutional addressee incorrectly classified FED-RIGHT-07");
});
test("rejects omission of Article V versus XIV State/federal due-process distinction",()=>{
 const f=fixture();qual(f,"FED-QUAL-XIV-01-STATE-ACTOR-DIRECT").source_provision_ids=["CONST-US-AMD-14-SEC-01"];
 fails(f,"Fifth versus Fourteenth Amendment government addressee missing");
});
test("rejects loss of XXVI age change in XIV Section 2 historical franchise representation",()=>{
 const f=fixture();qual(f,"FED-QUAL-XIV-02-ORIGINAL-MALE-VOTE-REFERENCE").effect_status="operative";
 fails(f,"Twenty-Sixth Amendment overlay lost");
});
test("rejects simplistic Section 3 disqualification disability removal",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-XIV-03-TWO-THIRDS-EACH-HOUSE");
 fails(f,"Missing critical federalism safeguard FED-QUAL-XIV-03-TWO-THIRDS-EACH-HOUSE");
});
test("rejects removal of Fourteenth Amendment barred rebellion debt",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-XIV-04-NO-REBEL-DEBTS");
 fails(f,"Missing critical federalism safeguard FED-QUAL-XIV-04-NO-REBEL-DEBTS");
});
test("rejects revived emancipation-related compensation claims",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-XIV-04-NO-ENSLAVEMENT-LOSS-COMPENSATION");
 fails(f,"Missing critical federalism safeguard FED-QUAL-XIV-04-NO-ENSLAVEMENT-LOSS-COMPENSATION");
});
test("rejects Fourteenth Amendment enforcement untethered to appropriate legislation",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="FED-QUAL-XIV-05-APPROPRIATE-LEGISLATION");
 fails(f,"Missing critical federalism safeguard FED-QUAL-XIV-05-APPROPRIATE-LEGISLATION");
});
test("rejects fabricated or unsupported cross-article condition",()=>{
 const f=fixture();qual(f,"FED-QUAL-IV-04-CROSS-DEFENSE-POWERS").cross_article_qualification_ids=["AI-QUAL-NOT-REAL"];
 fails(f,"Invalid cross-article qualification");
});
test("rejects original-text claims about unratified anti-commandeering jurisprudence",()=>{
 const f=fixture();qual(f,"FED-QUAL-VI-02-ANTI-COMMANDEERING-CASE-LAW").origin="original_text";
 fails(f,"Doctrinal boundary represented as express original text");
});
test("rejects direct agency delegation from functional federalism capability",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].relationship_type="delegates_operational_authority";
 fails(f,"Federalism capability incorrectly claimed as agency delegation");
});
test("rejects invalid capability referenced in federalism alignment",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].capability_id="CAP-FED-999";
 fails(f,"Unknown federalism capability");
});
test("rejects missing constitutional source provenance",()=>{
 const f=fixture();f.models.rights.items[0].source_ids=["SRC-NONEXISTENT"];
 fails(f,"Unknown source reference");
});
test("rejects deleted constitutional change event XIII",()=>{
 const f=fixture();f.changes=f.changes.filter(x=>x.id!=="CHG-US-CONST-13");
 fails(f,"Original fugitive-service supersession change removed");
});
test("rejects deleted constitutional change event XXVI",()=>{
 const f=fixture();f.changes=f.changes.filter(x=>x.id!=="CHG-US-CONST-26");
 fails(f,"Age-related Twenty-Sixth Amendment change removed");
});
test("rejects an omitted federalism model family from publication manifest",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(x=>!x.endsWith("federalism-rights.json"));
 fails(f,"Missing federalism publication model federalism-rights");
});
