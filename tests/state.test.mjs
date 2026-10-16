import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateState} from "../scripts/state-validation-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const families=["jurisdictions","nonstate-comparators","sources","constitutions","provisions","norms","actors","branches","institutions","relationships","federalism-links","judicial-links","viewpoints"];
function fixture(){
 return {
  manifest:read("model/federal/manifest.json"),
  models:Object.fromEntries(families.map(name=>[name,read("model/state/"+name+".json")])),
  federalInstitutions:["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","authorities","capabilities"].flatMap(name=>read("model/federal/"+name+".json").items),
  federalProvisions:read("model/constitutional/provisions.json").items,
  judicialCases:read("model/judicial/cases.json").items,
  judicialHoldings:read("model/judicial/holdings.json").items,
  judicialStatus:read("model/judicial/status-assessments.json").items
 };
}
const items=(f,kind)=>f.models[kind].items;
function row(f,kind,id){const r=items(f,kind).find(x=>x.id===id);assert(r,"Missing fixture "+kind+":"+id);return r;}
function fails(f,part){
 const e=validateState(f).errors;
 assert(e.some(x=>x.includes(part)),"Expected diagnostic '"+part+"'; got:\n"+e.join("\n"));
}
test("State institution foundation validates 50 independent States and separate federal-district comparator",()=>{
 const result=validateState(fixture());
 assert.deepEqual(result.errors,[]);
 assert.deepEqual(result.pilotStates,["VA","NE"]);
 assert.deepEqual(result.counts,{
 jurisdictions:50,"nonstate-comparators":1,sources:17,constitutions:2,provisions:19,norms:24,actors:2,branches:6,institutions:19,relationships:17,
 "federalism-links":8,"judicial-links":1,viewpoints:6
 });
 assert.equal(result.renderingStatus,"not_implemented_in_architecture_repo");
});
test("remaining 48 States are identified but not falsely declared institutionally modeled",()=>{
 const f=fixture();
 assert.equal(items(f,"jurisdictions").filter(x=>x.institutional_coverage==="jurisdiction_identity_only_no_institution_claims").length,48);
 assert(!items(f,"branches").some(x=>x.jurisdiction_id==="JUR-US-CA"));
});
test("D.C. is never a 51st State, not automatically a Tenth Amendment State institution",()=>{
 const f=fixture();
 assert.equal(items(f,"jurisdictions").length,50);
 assert.equal(row(f,"nonstate-comparators","JUR-US-DC-NONSTATE").is_member_state,false);
 assert(!items(f,"federalism-links").some(x=>x.jurisdiction_id==="JUR-US-DC-NONSTATE"));
});
test("reject Census State identity mismatch",()=>{
 const f=fixture();row(f,"jurisdictions","JUR-US-VA").fips_state_code="11";
 fails(f,"Missing or misclassified Census State identity JUR-US-VA");
});
test("reject D.C. inserted into member States",()=>{
 const f=fixture();items(f,"jurisdictions").push({...row(f,"jurisdictions","JUR-US-VA"),id:"JUR-US-DC",usps_code:"DC",fips_state_code:"11"});
 fails(f,"D.C. inaccurately promoted to a 51st State");
});
test("reject District comparator relabeled member State",()=>{
 const f=fixture();row(f,"nonstate-comparators","JUR-US-DC-NONSTATE").is_member_state=true;
 fails(f,"D.C. non-State comparator invalid");
});
test("reject jurisdiction-only State upgraded without a sourced constitution",()=>{
 const f=fixture();row(f,"jurisdictions","JUR-US-WY").institutional_coverage="limited_pilot_source_backed";
 fails(f,"Unreviewed State modeled as institutionally complete JUR-US-WY");
});
test("reject invented California State constitutional instrument without legal review",()=>{
 const f=fixture();row(f,"jurisdictions","JUR-US-CA").state_constitution_id="CONST-STATE-CA";
 fails(f,"Unreviewed State Constitution implied JUR-US-CA");
});
test("reject falsely declaring pilot States fully modeled",()=>{
 const f=fixture();f.manifest.state_institutional_extension.fully_modelled_state_count=2;
 fails(f,"State coverage metadata overclaims");
});
test("reject State jurisdiction label reusing a federal institution identity",()=>{
 const f=fixture();row(f,"branches","BR-STATE-VA-LEG").id="BR-FED-LEG";
 fails(f,"State record uses federal actor identity");
});
test("reject duplicate State record IDs across collections",()=>{
 const f=fixture();row(f,"branches","BR-STATE-VA-LEG").id="JUR-US-VA";
 fails(f,"Cross-collection State identity collision JUR-US-VA");
});
test("reject unknown future manifest family absence for State sources",()=>{
 const f=fixture();f.manifest.models=f.manifest.models.filter(p=>p!=="model/state/sources.json");
 fails(f,"Missing registered State model model/state/sources.json");
});
test("reject missing primary State source for source-located Virginia section",()=>{
 const f=fixture();row(f,"provisions","STATE-PROV-VA-ART-III-SEC-1").source_ids=["SRC-STATE-CENSUS-CODES"];
 fails(f,"State provision lacks primary State constitutional text");
});
test("reject pointing Nebraska primary legal section to an unrelated third-party URL",()=>{
 const f=fixture();row(f,"sources","SRC-STATE-NE-CONST-III").url="https://unofficial.example.com/constitution";
 fails(f,"State primary-law text is not linked to its official publisher");
});
test("reject State source switching to non-HTTPS address",()=>{
 const f=fixture();row(f,"sources","SRC-STATE-VA-CONST-III").url="http://law.lis.virginia.gov/constitution";
 fails(f,"Invalid or undated State source");
});
test("reject State source with a nonexistent provenance ID",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-EXE-GOVERNOR").source_ids=["SRC-STATE-UNKNOWN"];
 fails(f,"Unknown State source");
});
test("reject State constitutional section citation mislabeled as federal Constitution",()=>{
 const f=fixture();row(f,"provisions","STATE-PROV-VA-ART-V-SEC-1").citation="U.S. Const. art. II, § 1";
 fails(f,"State constitutional section citation invalid");
});
test("reject Virginia constitutional article source substituted with another article",()=>{
 const f=fixture();row(f,"provisions","STATE-PROV-VA-ART-IV-SEC-1").source_ids=["SRC-STATE-VA-CONST-V"];
 fails(f,"State provision sources incorrect constitutional Article");
});
test("reject an invented source provision in state legal norm",()=>{
 const f=fixture();row(f,"norms","NORM-STATE-VA-ART-V-SEC-1-01").provision_id="STATE-PROV-VA-ART-X-SEC-999";
 fails(f,"State norm has false jurisdiction or source provision");
});
test("reject State provision asserted as definitive controlling judicial opinion",()=>{
 const f=fixture();row(f,"provisions","STATE-PROV-NE-ART-III-SEC-1").review_status="fully_adjudicated";
 fails(f,"State original text research described as controlling judicial law");
});
test("reject original Virginia marriage restriction resurrected as a current power",()=>{
 const f=fixture();row(f,"provisions","STATE-PROV-VA-ART-I-SEC-15-A").legal_effect_review_status="enforceable";
 fails(f,"Virginia marriage provision falsely activated");
});
test("reject Virginia marriage-restriction State norm granted enforcement capacity",()=>{
 const f=fixture();row(f,"norms","NORM-STATE-VA-ART-I-SEC-15-A-01").legal_effect_status="fully_enforceable";
 fails(f,"Superseded State rights restriction used as current delegated authority");
});
test("Virginia establishes a bicameral General Assembly; Nebraska establishes exactly one legislative chamber",()=>{
 const f=fixture();
 assert.equal(row(f,"institutions","ORG-STATE-VA-LEG-SENATE").kind,"legislative_chamber");
 assert.equal(row(f,"institutions","ORG-STATE-VA-LEG-HOUSE").kind,"legislative_chamber");
 assert.equal(row(f,"institutions","ORG-STATE-NE-LEG-LEGISLATURE").kind,"unicameral_legislature");
});
test("reject Nebraska Legislature becoming bicameral",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-NE-LEG-LEGISLATURE").kind="legislature";
 fails(f,"Nebraska unicameral legislative authority incorrectly modeled");
});
test("reject invented second Nebraska legislative chamber",()=>{
 const f=fixture();items(f,"institutions").push({...row(f,"institutions","ORG-STATE-VA-LEG-SENATE"),id:"ORG-STATE-NE-LEG-SENATE",jurisdiction_id:"JUR-US-NE",branch_id:"BR-STATE-NE-LEG",parent_id:"BR-STATE-NE-LEG"});
 fails(f,"Nebraska unicameral legislative authority incorrectly modeled");
});
test("reject removing Virginia House of Delegates from General Assembly",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-LEG-HOUSE").parent_id="BR-STATE-VA-LEG";
 fails(f,"Virginia bicameral legislature lost its two State chambers");
});
test("reject moving Virginia Lieutenant Governor into legislature's organizational parent",()=>{
 const f=fixture();const v=row(f,"institutions","ORG-STATE-VA-EXE-LIEUTENANT-GOVERNOR");v.parent_id="ORG-STATE-VA-LEG-GENERAL-ASSEMBLY";v.branch_id="BR-STATE-VA-LEG";
 fails(f,"Virginia Lieutenant Governor Senate role silently changed executive branch office parentage");
});
test("reject department branch promoted to federal branch parent",()=>{
 const f=fixture();row(f,"branches","BR-STATE-VA-JUD").parent_id="BR-FED-JUD";
 fails(f,"Independent State branch misclassified under federal hierarchy");
});
test("reject State Supreme Court parent as federal Supreme Court",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-JUD-SUPREME-COURT").parent_id="ORG-FED-JUD-SCOTUS";
 fails(f,"State organization improperly subordinate to federal authority");
});
test("reject State institution moved into other State's hierarchy",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-EXE-GOVERNOR").parent_id="BR-STATE-NE-EXE";
 fails(f,"State institution parent or provision crosses jurisdiction");
});
test("reject cyclic State institutional containment",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-LEG-GENERAL-ASSEMBLY").parent_id="ORG-STATE-VA-LEG-SENATE";
 fails(f,"Cyclic State institutional containment");
});
test("reject treating Virginia Court of Appeals as constitutionally named court without enabling statute",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-JUD-COURT-APPEALS").institutional_basis="express_state_constitutional_text";
 fails(f,"State Court of Appeals asserted direct constitutional statute-free enabling powers");
});
test("reject Virginia Court of Appeals without its source evidence",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-JUD-COURT-APPEALS").source_ids=["SRC-STATE-VA-CONST-VI"];
 fails(f,"State statutory court incorrectly treated as directly named in Constitution");
});
test("reject Attorney General given unsourced agency statutory delegation",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-EXE-ATTORNEY-GENERAL").statutory_delegation_claim="granted";
 fails(f,"State institution silently obtained enabling statute delegation");
});
test("reject Virginia county/local framework pretending to be federal subordinate",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-SPECIAL-LOCAL-GOVERNMENT-CLASSES").parent_id="BR-FED-EXE";
 fails(f,"State organization improperly subordinate to federal authority");
});
test("reject Virginia local government aggregate as single agency",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-SPECIAL-LOCAL-GOVERNMENT-CLASSES").institutional_basis="express_state_constitutional_text";
 fails(f,"Virginia local-government types falsely collapsed");
});
test("reject Nebraska people's direct popular initiative removed",()=>{
 const f=fixture();items(f,"relationships").find(x=>x.from_id==="ACT-STATE-NE-PEOPLE").from_id="ORG-STATE-NE-LEG-LEGISLATURE";
 fails(f,"Nebraska popular initiative and referendum removed");
});
test("reject conflating Virginia redistricting fallback with executive initiative",()=>{
 const f=fixture();items(f,"relationships").find(x=>x.relationship_kind==="contingent_state_redistricting_fallback").relationship_kind="vested_state_executive_power";
 fails(f,"Virginia redistricting judiciary contingent review lost");
});
test("reject State relationship with a norm in another State",()=>{
 const f=fixture();items(f,"relationships")[0].to_norm_id="NORM-STATE-NE-ART-III-SEC-1-01";
 fails(f,"Unlawful cross-State institutional power relation");
});
test("reject making State federalism links federal administrative hierarchy",()=>{
 const f=fixture();items(f,"federalism-links")[0].legal_role_classification="federal_subordinate_department";
 fails(f,"State federalism crosswalk falsely creates federal organization");
});
test("reject attaching a State constitutional link to nonexistent U.S. law",()=>{
 const f=fixture();items(f,"federalism-links")[0].federal_provision_id="CONST-US-AMENDMENT-999";
 fails(f,"State federalism crosswalk falsely creates federal organization");
});
test("reject federalism link missing Fourteenth Amendment limits",()=>{
 const f=fixture();f.models["federalism-links"].items=f.models["federalism-links"].items.filter(x=>!(x.jurisdiction_id==="JUR-US-VA"&&x.federal_provision_id==="CONST-US-AMD-14-SEC-01"));
 fails(f,"State federalism source boundary incomplete VA");
});
test("reject federalism relationship conferring unauthorized statutory agency power",()=>{
 const f=fixture();items(f,"federalism-links")[0].statutory_delegation_claim="conferred";
 fails(f,"State federalism crosswalk falsely creates federal organization");
});
test("reject Virginia marriage federal precedent pointer to unrelated case",()=>{
 const f=fixture();items(f,"judicial-links")[0].federal_case_id="CASE-US-SCOTUS-YOUNGSTOWN-1952";
 fails(f,"State text conflict lacks distinct cited judicial holding");
});
test("reject treating Virginia marriage bar as enforceable despite case link",()=>{
 const f=fixture();items(f,"judicial-links")[0].never_operational_permission=false;
 fails(f,"Unverified State judicial interpretation certified enforceable");
});
test("reject pretending a complete judicial citator review has occurred",()=>{
 const f=fixture();f.judicialStatus.find(x=>x.holding_id==="HOLD-US-SCOTUS-OBERGEFELL-2015-01").current_binding_effect_verified=true;
 fails(f,"Unverified State judicial interpretation certified enforceable");
});
test("reject removing State source viewpoint provenance",()=>{
 const f=fixture();row(f,"viewpoints","VIEW-STATE-VA-INSTITUTIONS").source_ids=[];
 fails(f,"Missing State provenance");
});
test("reject an unimplemented State viewpoint claiming the website already renders it",()=>{
 const f=fixture();row(f,"viewpoints","VIEW-STATE-NE-UNICAMERAL").review_status="already_live";
 fails(f,"State viewpoint falsely claims live website implementation");
});
test("reject State viewpoint citing nonexistent original U.S. constitutional clause",()=>{
 const f=fixture();row(f,"viewpoints","VIEW-STATE-FEDERALISM-BOUNDARY").federal_constitutional_root_ids=["CONST-US-ART-15"];
 fails(f,"State viewpoint cites nonexistent U.S. original Constitution provision");
});
test("state JSON Schema covers all thirteen model collections without representing views as a frontend",()=>{
 const schema=read("schemas/state-institutional.schema.json");
 assert.equal(schema.$schema,"https://json-schema.org/draft/2020-12/schema");
 assert.equal(schema.oneOf.length,13);
 for(const family of families){
  const item=schema.$defs[family],collection=schema.$defs[family+"Collection"];
  assert(item?.additionalProperties===false,"Missing strict JSON Schema for "+family);
  assert(collection?.properties?.items?.items?.$ref==="#/$defs/"+family);
  assert(item.required.includes("id"));
  for(const entry of items(fixture(),family))for(const field of item.required)assert(Object.hasOwn(entry,field),family+"."+field+" missing on "+entry.id);
 }
});

test("reject institution moved under another State jurisdiction root even if ID is a permitted jurisdiction",()=>{
 const f=fixture();row(f,"institutions","ORG-STATE-VA-SPECIAL-REDISTRICTING-COMMISSION").parent_id="JUR-US-NE";
 fails(f,"State institution parent crosses State jurisdiction root");
});
test("reject relationship source unrelated to referenced State constitutional section",()=>{
 const f=fixture();row(f,"relationships","STATE-REL-0001").source_ids=["SRC-STATE-NE-CONST-II"];
 fails(f,"State relationship cites unrelated constitutional section evidence");
});
