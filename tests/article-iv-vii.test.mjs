import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleIVVII} from "../scripts/article-iv-vii-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["article-iv-vii-units","article-iv-vii-qualifications","article-iv-vii-actor-links","article-iv-vii-capability-links","article-iv-vii-viewpoints"];
function fixture(){return {
 manifest:read("model/federal/manifest.json"),
 models:Object.fromEntries(families.map(k=>[k,read("model/constitutional/"+k+".json")])),
 provisions:read("model/constitutional/provisions.json").items,norms:read("model/constitutional/norms.json").items,
 actors:read("model/constitutional/actors.json").items,bindings:read("model/constitutional/bindings.json").items,
 capabilities:read("model/federal/capabilities.json").items,
 institutions:["legislative","executive-leadership","executive-departments","executive-independent","judiciary"].flatMap(x=>read("model/federal/"+x+".json").items),
 federalismUnits:read("model/constitutional/federalism-units.json").items,
 federalismQualifications:read("model/constitutional/federalism-qualifications.json").items,
 federalismRelations:read("model/constitutional/federalism-relationships.json").items,
 federalismCapabilities:read("model/constitutional/federalism-capability-links.json").items,
 sourceIds:read("model/federal/sources.json").items.map(x=>x.id)
};}
const at=(d,f,id)=>{const r=d.models[f].items.find(x=>x.id===id);assert(r,"Missing "+id);return r;};
const item=(d,k,id)=>{const r=d[k].find(x=>x.id===id);assert(r,"Missing "+id);return r;};
function fails(d,part){const e=validateArticleIVVII(d).errors;assert(e.some(x=>x.includes(part)),"Expected diagnostic '"+part+"'; errors:\n"+e.join("\n"));}
test("baseline retains article IV and VI federalism references and adds V and VII analytical spans",()=>{const r=validateArticleIVVII(fixture());assert.deepEqual(r.errors,[]);assert.deepEqual([r.counts.articleIV,r.counts.articleV,r.counts.articleVI,r.counts.articleVII],[10,9,3,3]);assert.equal(r.counts.analyticalSegments,12);});
test("all original seven articles remain separately identified",()=>{const f=fixture();assert.equal(f.provisions.filter(p=>p.unit==="article").length,7);assert.equal(f.models["article-iv-vii-viewpoints"].items.length,4);});
test("Article IV fugitive service may not become operational",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-IV-02-03").current_effect_status="operative";fails(f,"Article IV/VI crosswalk changed");});
test("Article IV fugitive service requires Thirteenth Amendment crosswalk",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-IV-02-03-01").source_provision_ids=["CONST-US-ART-04-SEC-02-CL-03"];fails(f,"not linked to Thirteenth Amendment");});
test("Article IV nonofficial section segments are not fake numbered clauses",()=>{const f=fixture();item(f,"provisions","CONST-US-ART-04-SEC-04-SEG-01").unit="article_clause";fails(f,"Article IV/VI crosswalk changed");});
test("Existing Article IV full faith unit must not drift from federalism",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-IV-01-01").existing_federalism_unit_id="FED-UNIT-IV-01-02";fails(f,"Article IV/VI crosswalk changed");});
test("Existing Article VI supremacy limitation must not drift from federalism",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-VI-02").existing_federalism_qualification_ids=[];fails(f,"source relation silently diverges");});
test("No new current power can arise from Article IV obsolete historic unit",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-IV-02-03").capability_link_ids=["A47-CAP-V-01"];fails(f,"Duplicate Article IV/VI relations");});
test("Article V Congressional proposal requires two-thirds both Houses not regular bill",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-01-01").qualification_kind="majority_passage";fails(f,"Critical Article V");});
test("Article V State convention applications cannot ratify amendment",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-02-01").qualification_kind="ratification_already_done";fails(f,"Critical Article V");});
test("Article V convention call requires threshold-qualified applications",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-03-01").qualification_kind="unconditional_presidential_order";fails(f,"Critical Article V");});
test("Article V proposing convention is not a ratifying convention",()=>{const f=fixture();at(f,"article-iv-vii-actor-links","A47-ACTOR-V-04").actor_id="ACT-US-STATE-RATIFYING-CONVENTIONS";fails(f,"Critical Article V");});
test("Article V State legislative ratification is distinct from convention mode",()=>{const f=fixture();at(f,"article-iv-vii-actor-links","A47-ACTOR-V-05").actor_id="ACT-US-STATE-RATIFYING-CONVENTIONS";fails(f,"Critical Article V");});
test("Article V conventions retain three-fourths-State ratification threshold",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-06-01").qualification_kind="two_thirds_states";fails(f,"Critical Article V");});
test("Article V Congress chooses among ratification modes",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-07-01").qualification_kind="state_exec_chooses";fails(f,"Critical Article V");});
test("Article V pre-1808 limitation cannot be revived as current",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-V-08").current_effect_status="operative";fails(f,"Original Article V/VII clause invented or mislabeled");});
test("Article V 1808 exception cannot receive functional capability",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-V-08").capability_link_ids=["A47-CAP-V-09"];fails(f,"Expired constitutional process revived");});
test("Article V equal suffrage protects affected State consent",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-V-09-01").qualification_kind="none_required";fails(f,"Critical Article V");});
test("Article VII nine original states threshold is historical",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-VII-02").current_effect_status="operative";fails(f,"Expired constitutional process revived");});
test("Article VII threshold cannot be treated as a current ratification route",()=>{const f=fixture();at(f,"article-iv-vii-qualifications","A47-QUAL-VII-02-01").qualification_kind="current_nine_of_fifty";fails(f,"Article VII historical ratification");});
test("Article VII historical State conventions cannot be given present amendment powers",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-VII-01").actor_link_ids=["A47-ACTOR-V-04"];fails(f,"Expired constitutional process revived");});
test("Article V and VII spans must not be invented 1787 numbered Clauses",()=>{const f=fixture();item(f,"provisions","CONST-US-ART-05-SEG-01").unit="article_clause";fails(f,"Original Article V/VII clause invented");});
test("Article V source locator must identify nonofficial unit",()=>{const f=fixture();item(f,"provisions","CONST-US-ART-05-SEG-02").source_locator="Article V original Clause 2";fails(f,"Original Article V/VII clause invented");});
test("Article V functional category cannot authorize agency without statute",()=>{const f=fixture();at(f,"article-iv-vii-capability-links","A47-CAP-V-01").link_semantics="grants_delegated_agency_power";fails(f,"improperly mapped as agency delegation");});
test("Article V procedural actors cannot become subordinates of federal executive",()=>{const f=fixture();at(f,"article-iv-vii-actor-links","A47-ACTOR-V-02").actor_relationship_classification="federal_department_subordinate";fails(f,"procedural actor classified");});
test("Article V ratification norms cannot be rebound to State executive",()=>{const f=fixture();at(f,"article-iv-vii-actor-links","A47-ACTOR-V-06").actor_id="ACT-US-STATE-EXE";fails(f,"Critical Article V");});
test("Article V claims must not omit official original-text provenance",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-V-05").source_ids=["SRC-NO-SUCH-SOURCE"];fails(f,"lacks verified NARA source");});
test("All original provision references must exist",()=>{const f=fixture();at(f,"article-iv-vii-units","A47-UNIT-VI-02").provision_id="CONST-US-ART-06-CL-999";fails(f,"Article IV/VI crosswalk changed");});
test("Article IV/VII model completeness cannot be fabricated in manifest",()=>{const f=fixture();f.manifest.articles_iv_vii_completion_extension.article_vii_units=44;fails(f,"claimed coverage incorrect");});
test("Existing federalism model must remain externally versioned",()=>{const f=fixture();f.models["article-iv-vii-units"].model_version="2.0.0";fails(f,"invalid collection");});
test("Reject missing canonical manifest registration",()=>{const f=fixture();f.manifest.models=f.manifest.models.filter(x=>x!=="model/constitutional/article-iv-vii-qualifications.json");fails(f,"missing manifest model");});
test("Reject a completed public renderer claim from architecture data",()=>{const f=fixture();at(f,"article-iv-vii-viewpoints","VIEW-A47-V").publication_status="deployed_live";fails(f,"illegally claims deployed view");});
