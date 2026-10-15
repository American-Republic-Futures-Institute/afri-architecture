// Article II safety and regression tests. These include intentionally invalid changes.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleII} from "../scripts/article-ii-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
  return {
    manifest:read("model/federal/manifest.json"),
    models:{
      units:read("model/constitutional/article-ii-units.json"),
      qualifications:read("model/constitutional/article-ii-qualifications.json"),
      capabilityLinks:read("model/constitutional/article-ii-capability-links.json")
    },
    provisions:read("model/constitutional/provisions.json").items,
    norms:read("model/constitutional/norms.json").items,
    bindings:read("model/constitutional/bindings.json").items,
    capabilities:read("model/federal/capabilities.json").items,
    actors:read("model/constitutional/actors.json").items,
    sources:read("model/federal/sources.json").items,
    articleIQualifications:read("model/constitutional/article-i-qualifications.json").items
  };
}
const inspect=f=>validateArticleII(f).errors;
function mustFail(f,why){
  const e=inspect(f);
  assert.ok(e.some(x=>x.includes(why)), why+"\n"+JSON.stringify(e));
}
test("complete Article II structural, normative and capability baseline",()=>{
  const out=validateArticleII(fixture());
  assert.deepEqual(out.errors,[]);
  assert.equal(out.counts.units,17);
  assert.equal(out.counts.numbered_clauses,11);
  assert.equal(out.counts.section3_analytic_segments,5);
  assert.equal(out.counts.qualifications,71);
  assert.equal(out.counts.capability_links,40);
  assert.equal(out.counts.mapped_norms,37);
});
test("no fabricated official Section 3 clause citations",()=>{
  const f=fixture();
  assert.ok(f.provisions.filter(x=>x.id.startsWith("CONST-US-ART-02-SEC-03-SEG-")).every(x=>x.citation==="U.S. Const. art. II, § 3"));
  assert.ok(!f.provisions.some(x=>/^CONST-US-ART-02-SEC-03-CL-/.test(x.id)));
});
test("rejects adding a fictitious clause to Article II Section 3",()=>{
  const f=fixture();f.provisions.find(x=>x.id==="CONST-US-ART-02-SEC-03-SEG-01").unit="article_clause";
  mustFail(f,"Analytic Section 3 text represented as fictitious numbered clause");
});
test("rejects fabricated Section 3 clause citation",()=>{
  const f=fixture();f.provisions.find(x=>x.id==="CONST-US-ART-02-SEC-03-SEG-01").citation="U.S. Const. art. II, § 3, cl. 1";
  mustFail(f,"Invented official clause citation");
});
test("rejects a missing original Article II numbered clause",()=>{
  const f=fixture();f.models.units.items=f.models.units.items.filter(x=>x.id!=="AII-UNIT-01-08");
  mustFail(f,"Missing Article II unit AII-UNIT-01-08");
});
test("rejects retiring the surviving four-year term",()=>{
  const f=fixture();f.provisions.find(x=>x.id==="CONST-US-ART-02-SEC-01-CL-01").effect_status="superseded";
  mustFail(f,"Four-year tenure incorrectly marked repealed");
});
test("rejects reactivation of original elector ballots",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-01-03-CURRENT-BALLOT-TWELFTH").effect_status="operative";
  mustFail(f,"Superseded Article II ballots treated as operative law");
});
test("rejects a historic Article II clause tied directly to current capability",()=>{
  const f=fixture();f.models.units.items.find(x=>x.id==="AII-UNIT-01-03").capability_link_ids=["AII-CAP-0001"];
  mustFail(f,"Superseded Article II text used as operative capability");
});
test("rejects a fictional appointment power assigned to the President instead of Congress",()=>{
  const f=fixture();const b=f.bindings.find(x=>x.norm_id==="NORM-US-CONST-AII-02-02-INFERIOR-OFFICER-ALLOCATION");b.target_id="ORG-FED-EXE-PRESIDENT";
  mustFail(f,"Article II power allocated to wrong constitutional actor");
});
test("rejects treaty supermajority incorrectly applied to appointments",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-02-02-TREATY-SENATE-TWO-THIRDS").applies_to_norm_ids.push("NORM-US-CONST-025");
  mustFail(f,"Treaty two-thirds threshold incorrectly applied to appointments");
});
test("rejects missing Senate treaty two-thirds constraint",()=>{
  const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AII-QUAL-02-02-TREATY-SENATE-TWO-THIRDS");
  mustFail(f,"Missing critical Article II safeguard AII-QUAL-02-02-TREATY-SENATE-TWO-THIRDS");
});
test("rejects unbounded Commander-in-Chief power divorced from Article I",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-02-01-CONGRESSIONAL-WAR-POWERS").article_i_qualification_ids=[];
  mustFail(f,"Interbranch limit lost Article I trace");
});
test("rejects removal of the impeachment exception to the pardon power",()=>{
  const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AII-QUAL-02-01-CLEMENCY-IMPEACHMENT-EXCEPTION");
  mustFail(f,"Missing critical Article II safeguard AII-QUAL-02-01-CLEMENCY-IMPEACHMENT-EXCEPTION");
});
test("rejects unlimited recess appointment commissions",()=>{
  const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(x=>x.id!=="AII-QUAL-02-03-COMMISSIONS-EXPIRE-NEXT-SESSION");
  mustFail(f,"Missing critical Article II safeguard AII-QUAL-02-03-COMMISSIONS-EXPIRE-NEXT-SESSION");
});
test("rejects loss of the Twenty-Fifth Amendment succession overlay",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-01-06-VP-VACANCY-NOMINATION").applies_to_norm_ids=["NORM-US-CONST-AII-01-06-CONGRESS-DOUBLE-VACANCY"];
  mustFail(f,"Missing critical Article II safeguard AII-QUAL-01-06-VP-VACANCY-NOMINATION");
});
test("rejects conflating Section 2 vacancy and Section 3 inability",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-01-06-VOLUNTARY-INABILITY").source_provision_ids=["CONST-US-ART-02-SEC-01-CL-06","CONST-US-AMD-25-SEC-02"];
  mustFail(f,"Vice-presidential vacancy incorrectly treated as presidential disability");
});
test("rejects loss of separation-of-powers restriction on Take Care duty",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-03-04-NO-INDEPENDENT-APPROPRIATION").article_i_qualification_ids=[];
  mustFail(f,"Interbranch limit lost Article I trace");
});
test("rejects unqualified capability alignment",()=>{
  const f=fixture();f.models.capabilityLinks.items[0].qualification_ids=[];
  mustFail(f,"Article II unqualified capability mapping");
});
test("rejects labeling capability alignments as direct agency delegations",()=>{
  const f=fixture();f.models.capabilityLinks.items[0].relationship_type="authorizes_agency";
  mustFail(f,"Article II mapping improperly grants agency authority");
});
test("rejects missing federal capability",()=>{
  const f=fixture();f.models.capabilityLinks.items[0].capability_id="CAP-FED-999";
  mustFail(f,"Unknown federal capability");
});
test("rejects dangling Article I constitutional constraint",()=>{
  const f=fixture();f.models.qualifications.items.find(x=>x.id==="AII-QUAL-02-01-CONGRESSIONAL-WAR-POWERS").article_i_qualification_ids=["AI-QUAL-MISSING"];
  mustFail(f,"Dangling Article I constitutional limit");
});
test("rejects amendment overlay unsupported by an amendment",()=>{
  const f=fixture();const q=f.models.qualifications.items.find(x=>x.id==="AII-QUAL-01-06-VP-VACANCY-NOMINATION");q.source_provision_ids=["CONST-US-ART-02-SEC-01-CL-06"];
  mustFail(f,"Unsupported Article II amendment overlay");
});
test("rejects unknown constitutional norm in a qualification",()=>{
  const f=fixture();f.models.qualifications.items[0].applies_to_norm_ids=["NORM-US-CONST-NOT-REAL"];
  mustFail(f,"Dangling Article II qualification norm");
});
test("rejects missing publication of Article II capability registry",()=>{
  const f=fixture();f.manifest.models=f.manifest.models.filter(x=>x!=="model/constitutional/article-ii-capability-links.json");
  mustFail(f,"Missing Article II publication manifest entry");
});
