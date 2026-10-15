// Article I architecture regression tests. All mutation tests should fail closed.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateArticleI} from "../scripts/article-i-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function fixture(){
 return {
  manifest:read("model/federal/manifest.json"),
  models:{
   clauses:read("model/constitutional/article-i-clauses.json"),
   qualifications:read("model/constitutional/article-i-qualifications.json"),
   capabilityLinks:read("model/constitutional/article-i-capability-links.json")
  },
  provisions:read("model/constitutional/provisions.json").items,
  norms:read("model/constitutional/norms.json").items,
  bindings:read("model/constitutional/bindings.json").items,
  capabilities:read("model/federal/capabilities.json").items,
  sources:read("model/federal/sources.json").items
 };
}
const problems=f=>validateArticleI(f).errors;
const expectFailure=(f,substr)=>assert.ok(problems(f).some(x=>x.includes(substr)),substr+"\n"+JSON.stringify(problems(f)));
test("Article I clause coverage and qualified power/capability links",()=>{
 const r=validateArticleI(fixture());
 assert.deepEqual(r.errors,[]);
 assert.equal(r.counts.clauses,53);
 assert.equal(r.counts.qualifications,103);
 assert.equal(r.counts.capability_links,42);
 assert.equal(r.counts.mapped_congressional_powers,30);
});
test("every one of the 18 enumerated-power clauses has a traceable capability",()=>{
 const f=fixture();
 for(let i=1;i<=18;i++){
  const id="CONST-US-ART-01-SEC-08-CL-"+String(i).padStart(2,"0");
  assert.ok(f.models.clauses.items.find(x=>x.provision_id===id)?.capability_link_ids.length,id);
 }
});
test("removal of any clause creates an inventory failure",()=>{
 const f=fixture();f.models.clauses.items=f.models.clauses.items.filter(x=>x.id!=="AI-CL-05-03");
 expectFailure(f,"Missing Article I clause CONST-US-ART-01-SEC-05-CL-03");
});
test("rejects dangling normative effects",()=>{
 const f=fixture();f.models.clauses.items[0].norm_ids=["NORM-US-CONST-NONEXISTENT"];
 expectFailure(f,"Incorrect norm provenance");
});
test("rejects dangling qualification references",()=>{
 const f=fixture();f.models.clauses.items[0].qualification_ids=["AI-QUAL-NONEXISTENT"];
 expectFailure(f,"Unresolved clause qualifier");
});
test("rejects unqualified power-to-capability mappings",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].qualification_ids=[];
 expectFailure(f,"Unqualified power-capability mapping");
});
test("rejects a power alignment with invented federal capabilities",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].capability_id="CAP-FED-99";
 expectFailure(f,"Unknown federal capability");
});
test("rejects claimed agency delegations in capability alignments",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].relationship_type="authorizes_agency";
 expectFailure(f,"Functional alignment incorrectly treated as delegation");
});
test("detects incomplete mapping of an enumerated power",()=>{
 const f=fixture();f.models.capabilityLinks.items=f.models.capabilityLinks.items.filter(l=>l.power_norm_id!=="NORM-US-CONST-P12");
 const item=f.models.clauses.items.find(x=>x.id==="AI-CL-08-12");item.capability_link_ids=[];
 expectFailure(f,"Congressional power without capability alignment NORM-US-CONST-P12");
});
test("rejects deleted army two-year appropriation constraint",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AI-QUAL-08-12-TWO-YEAR-ARMY-FUNDING");
 expectFailure(f,"Missing critical Article I constitutional safeguard AI-QUAL-08-12-TWO-YEAR-ARMY-FUNDING");
});
test("rejects deletion of state-reserved militia officer and training authority",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AI-QUAL-08-16-STATE-OFFICER-APPOINTMENT");
 expectFailure(f,"Missing critical Article I constitutional safeguard AI-QUAL-08-16-STATE-OFFICER-APPOINTMENT");
});
test("rejects loss of income tax apportionment exception",()=>{
 const f=fixture();f.models.qualifications.items=f.models.qualifications.items.filter(q=>q.id!=="AI-QUAL-09-04-AMENDMENT-16");
 expectFailure(f,"Missing critical Article I constitutional safeguard AI-QUAL-09-04-AMENDMENT-16");
});
test("rejects attempts to reanimate pre-1808 importation restrictions",()=>{
 const f=fixture();f.models.qualifications.items.find(q=>q.id==="AI-QUAL-09-01-PRE-1808-HISTORICAL").effect_status="operative";
 expectFailure(f,"Expired importation clause reactivated");
});
test("rejects applying historical three-fifths formula as a live norm",()=>{
 const f=fixture();f.models.qualifications.items.find(q=>q.id==="AI-QUAL-02-03-THREE-FIFTHS-HISTORIC").effect_status="operative";
 expectFailure(f,"Superseded apportionment language reactivated");
});
test("preserves Seventeenth Amendment partial replacement",()=>{
 const f=fixture();f.provisions.find(p=>p.id==="CONST-US-ART-01-SEC-03-CL-01").effect_status="superseded";
 expectFailure(f,"Seventeenth Amendment incorrectly suppresses all Senator composition/tenure rules");
});
test("denies state-only power treated as congressional authority",()=>{
 const f=fixture();f.models.capabilityLinks.items[0].power_norm_id="NORM-US-CONST-AI-04-01-STATE-ELECTIONS";
 expectFailure(f,"Mapped noncongressional power");
});
test("rejects fabricated amendment overlay with no amendment anchor",()=>{
 const f=fixture();const x=f.models.qualifications.items.find(q=>q.origin==="amendment_overlay");x.source_provision_ids=[x.source_provision_ids[0]];
 expectFailure(f,"Unsubstantiated amendment overlay");
});
test("verifies complete published model allowlist",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(x=>!x.includes("article-i-capability-links"));
 expectFailure(f,"Missing publication manifest entry");
});
