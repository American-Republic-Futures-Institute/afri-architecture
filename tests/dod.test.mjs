import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {DOD_MODEL_PATHS,OTHER_MODEL_PATHS,validateDod,projectDodView} from "../scripts/dod-validation-core.mjs";
import {checkDodSchema} from "../scripts/dod-schema-validator.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const fixture=()=>({manifest:read("model/federal/manifest.json"),
 files:Object.fromEntries([...DOD_MODEL_PATHS,...OTHER_MODEL_PATHS].map(p=>[p,read(p)]))});
const initial=fixture(),verified=validateDod(initial.manifest,initial.files);
const file=name=>"model/federal/dod/"+name+".json";
const find=(f,name,id)=>{
 const x=f.files[file(name)].items.find(x=>x.id===id);
 assert(x,"missing test fixture "+name+"/"+id);return x;
};
const reject=(name,change,error)=>test(name,()=>{
 const f=structuredClone(initial);change(f);
 assert.throws(()=>validateDod(f.manifest,f.files),new RegExp(error));
});
test("all nineteen public DoD collection types conform to exact versioned field contracts",()=>{
 const schema=read("schemas/dod-institutional.schema.json");
 const result=checkDodSchema(schema,initial.files);
 assert.equal(result.model_families,20);
 assert.deepEqual(result.errors,[]);
 const unauthorized=structuredClone(initial.files);
 find({files:unauthorized},"dafas","DOD-DAFA-DIA").unreviewed_contract_promotion="yes";
 assert(checkDodSchema(schema,unauthorized).errors.some(x=>x.includes("unknown publication field")));
 const overgrant=structuredClone(initial.files);
 find({files:overgrant},"fiscal-crosswalks","DOD-FISCAL-FY26-OM").appropriation_verified=true;
 assert(checkDodSchema(schema,overgrant).errors.some(x=>x.includes("constant mismatch")));
 const missingRule=structuredClone(schema);delete missingRule.$defs.offices.properties.id.pattern;
 assert(checkDodSchema(missingRule,initial.files).errors.some(x=>x.includes("missing strict record schema")));
});
test("composition includes eleven Title 10 paragraphs but does not certify all current DoD offices",()=>{
 assert.equal(verified.checks.statute_composition,11);
 assert.equal(verified.checks.complete_current_organization_claims,0);
 assert.equal(verified.extension.whole_department_adl1_certified,false);
 assert.equal(verified.components.get("CENSUS-COMP-DEF-ARMY").legacy_census_ref,"CENSUS-COMP-DEF-ARMY");
 assert(verified.components.has("DOD-STAT-CLASS-OTHER-DESIGNATED"));
 assert(verified.components.has("DOD-STAT-CLASS-SUBORDINATE-ELEMENTS"));
});
test("GAO May 2026 DAFA census has 19 agencies, 8 field activities, 8 combat-support designations",()=>{
 assert.equal(verified.checks.defense_agencies,19);
 assert.equal(verified.checks.field_activities,8);
 assert.equal(verified.checks.combat_support,8);
 assert.equal(verified.dafas.size,27);
 for(const code of ["DIA","DHA","DLA","DTRA","DCMA","DISA","NGA","NSA"])
  assert.equal(verified.dafas.get("DOD-DAFA-"+code).combat_support_agency,true);
 assert([...verified.dafas.values()].every(x=>x.current_october_2026_name_verified===false));
});
test("three renamed agency aliases preserve older GAO identity, not duplicate operating units",()=>{
 assert.equal(verified.data["name-events"].length,3);
 assert(verified.data["name-events"].every(x=>x.canonical_node_id_unchanged===true));
});
test("Coast Guard normally remains DHS and Space Force remains within Department Air Force",()=>{
 const service=verified.services;
 assert.equal(service.filter(x=>x.currently_part_of_dod_by_general_law).length,5);
 assert.equal(service.find(x=>x.id==="DOD-SERVICE-COAST").institutional_parent_id,"ORG-FED-EXE-DEP-DHS");
 assert.equal(service.find(x=>x.id==="DOD-SERVICE-SPACE").institutional_parent_id,"CENSUS-COMP-DEF-AIR-FORCE");
 assert(service.every(x=>x.operational_command_assignment_inferred===false));
});
test("only SecDef to 11 public CCDR candidates has default, legally qualified command relationship",()=>{
 const edges=verified.relationships.filter(x=>x.operational_command_established===true);
 assert.equal(edges.length,11);
 assert(edges.every(x=>x.relationship_type==="conditional_statutory_combatant_command_chain"));
 assert(edges.every(x=>x.from_id==="DOD-ROLE-SECDEF"));
 assert(edges.every(x=>x.qualifications.includes("DOD-COND-PRESIDENT-OVERRIDE")));
 assert.equal(verified.roles.get("DOD-ROLE-CHAIRMAN").military_command_role_verified,false);
 assert(verified.commands.every(x=>x.individual_mission_boundary_or_force_allocation_verified===false));
});
test("DIA and NSA are excluded from 10 USC 192(a) supervision; not the other DAFAs",()=>{
 const edges=verified.relationships.filter(x=>x.relationship_type==="dated_chart_supervision_not_individual_delegation");
 assert.equal(edges.length,27);
 for(const x of edges){
  const exempt=["DOD-DAFA-DIA","DOD-DAFA-NSA"].includes(x.to_id);
  assert.equal(x.statutory_192_a_supervision_applies,!exempt);
  assert.deepEqual(x.qualifications,exempt?["DOD-COND-DAFA-SUPERVISION-EXCEPTION"]:[]);
 }
});
test("IG statutory independence is not Chairman military command or general supervision",()=>{
 assert.equal(verified.roles.get("DOD-ROLE-DOD-IG").category,"statutorily_independent_oversight_office");
 assert.equal(verified.relationships.find(x=>x.relationship_type==="independent_statutory_ig_oversight_not_command").operational_command_established,false);
});
test("source-mapped statutory power actors distinguish President, combatant commander and Chairman",()=>{
 assert.equal(verified.powers.get("DOD-POWER-PRESIDENT-CCMD-ESTABLISH").authorized_actor_id,"ORG-FED-EXE-PRESIDENT");
 assert.equal(verified.powers.get("DOD-POWER-CCDR-COMMAND").authorized_actor_id,"DOD-CCMD-ROLE");
 assert(verified.powers.get("DOD-POWER-CHAIRMAN-MIL-ADVICE").condition_ids.includes("DOD-COND-CHAIRMAN-NOCOMMAND"));
 assert.equal(verified.checks.authority_chains,9);
});
test("annual Congress-wide notice is distinct from four defense-committee reports",()=>{
 assert.equal(verified.checks.congressional_committees,4);
 for(const x of verified.data["congressional-crosswalks"]){
  const defense=["DOD-PROV-10-192-C","DOD-PROV-10-193-A"].includes(x.provision_id);
  assert.equal(x.recipient_committee_ids.length,defense?4:0);
  assert.equal(x.operational_reporting_compliance_verified,false);
 }
});
test("FY26 Defense-wide categories are budget requests and not legally available appropriation",()=>{
 assert.equal(verified.checks.fiscal_proposal_categories,4);
 assert.equal(verified.checks.verified_enacted_appropriations,0);
 for(const x of verified.fiscal){
  assert.equal(x.appropriation_verified,false);
  assert.equal(x.enacted_appropriation_act_id,null);
  assert.equal(x.treasury_account_symbol,null);
  assert.equal(x.spent_or_obligated_derived,false);
 }
});
test("each of the eight bounded institutional, constitutional and authority viewpoints has only cited data",()=>{
 assert.equal(verified.views.length,8);
 for(const x of verified.views){
  const p=projectDodView(verified,x.id);
  assert(p.nodes.length>0);
  assert.equal(p.status,"data_contract_only_not_web_rendered");
  assert(p.relationships.every(e=>e.source_ids.length>0));
 }
 const dafa=projectDodView(verified,"VIEW-DOD-DAFA");
 assert(dafa.nodes.some(x=>x.id==="DOD-DAFA-DIA"));
 assert(!dafa.nodes.some(x=>x.id==="DOD-CCMD-AFRICOM"));
 const cc=projectDodView(verified,"VIEW-DOD-COMMAND");
 assert(cc.nodes.some(x=>x.id==="DOD-CCMD-AFRICOM"));
 assert(!cc.nodes.some(x=>x.id==="DOD-DAFA-DIA"));
});
test("seven textual military and fiscal constitutional contexts map only to Congress and President",()=>{
 const links=verified.data["constitutional-context"];
 assert.equal(links.length,7);
 assert.equal(verified.checks.constitution_context_links,7);
 assert.equal(links.filter(x=>x.competent_actor_id==="ORG-FED-LEG-CONGRESS").length,6);
 assert.equal(links.filter(x=>x.competent_actor_id==="ORG-FED-EXE-PRESIDENT").length,1);
 assert(links.every(x=>x.individual_dod_agency_power_derived===false));
 assert(links.every(x=>x.appropriations_derived===false));
 const graph=projectDodView(verified,"VIEW-DOD-CONSTITUTION");
 assert.equal(graph.nodes.length,21);
 assert.equal(graph.relationships.length,14);
 assert(graph.relationships.every(x=>x.legal_authority_proven===false));
 assert(graph.nodes.some(x=>x.id==="CONST-US-ART-02-SEC-02-CL-01"));
 assert(graph.nodes.some(x=>x.id==="CONST-US-ART-01-SEC-09-CL-07"));
});
test("authority viewpoint publishes source-cited actor → power → statute → limitation chains, not disconnected icons",()=>{
 const v=projectDodView(verified,"VIEW-DOD-AUTHORITY");
 assert(v.relationships.length>=50);
 assert(v.nodes.some(n=>n.id==="ORG-FED-EXE-PRESIDENT"));
 assert(v.relationships.some(e=>e.from_id==="DOD-ROLE-CHAIRMAN"&&e.to_id==="DOD-POWER-CHAIRMAN-MIL-ADVICE"&&
   e.relationship_type==="bounded_statutory_role_authority"));
 assert(v.relationships.some(e=>e.from_id==="DOD-POWER-CHAIRMAN-MIL-ADVICE"&&e.to_id==="DOD-COND-CHAIRMAN-NOCOMMAND"&&
   e.relationship_type==="explicit_statutory_limitation"));
 assert(v.relationships.some(e=>e.from_id==="DOD-POWER-SECDEF-DIRECTION"&&e.to_id==="DOD-PROV-10-113-B"&&
   e.relationship_type==="bounded_statutory_legal_basis"));
 assert(v.relationships.some(e=>e.from_id==="DOD-TRACE-MILDEPT-ARMY"&&e.to_id==="DOD-POWER-SEC-ARMY-MANAGE"));
 assert(v.relationships.every(e=>e.source_ids.length>0&&e.legal_authority_proven===false));
});
test("Congress view maps separate report actors and recipients without implying reports were submitted",()=>{
 const v=projectDodView(verified,"VIEW-DOD-CONGRESS");
 assert.equal(v.relationships.length,14);
 assert(v.nodes.some(x=>x.id==="ORG-FED-LEG-CONGRESS"));
 assert(v.relationships.some(x=>x.from_id==="DOD-CONG-LINK-01"&&x.to_id==="ORG-FED-LEG-CONGRESS"));
 assert(v.relationships.some(x=>x.from_id==="DOD-CONG-LINK-04"&&x.to_id==="DOD-CONG-HOUSE-APP"));
 assert(v.relationships.every(x=>x.legal_authority_proven===false));
});
test("Fiscal view visibly links proposed FY2026 spending categories to federal fiscal constraints without creating appropriations",()=>{
 const v=projectDodView(verified,"VIEW-DOD-FISCAL");
 assert.equal(v.relationships.length,10);
 assert(v.relationships.some(x=>x.from_id==="DOD-FISCAL-FY26-OM"&&x.to_id==="DOD-COND-PURPOSE-RULE"));
 assert(v.relationships.some(x=>x.from_id==="DOD-FISCAL-FY26-OM"&&x.to_id==="DOD-COND-ANTIDEFICIENCY"));
 assert(v.relationships.some(x=>x.from_id==="DOD-COND-PURPOSE-RULE"&&x.to_id==="DOD-PROV-31-1301-A"));
 assert(v.relationships.every(x=>x.source_ids.length>0&&x.legal_authority_proven===false));
});
test("GAO DAFA view visibly connects CSA readiness flags to Chairman and 27 chart memberships",()=>{
 const v=projectDodView(verified,"VIEW-DOD-DAFA");
 assert.equal(v.relationships.filter(x=>x.relationship_type==="designated_combat_support_agency_subject_to_readiness_review").length,8);
 assert.equal(v.relationships.filter(x=>x.relationship_type==="dated_chart_supervision_not_individual_delegation").length,27);
 assert.equal(v.relationships.filter(x=>x.relationship_type==="categorized_under_statutory_composition_class").length,27);
 assert(v.nodes.some(n=>n.id==="DOD-ROLE-CHAIRMAN"));
 assert(v.relationships.every(x=>x.operational_command_established===false));
});
test("conditional Coast Guard placement is visible against canonical DHS identity in Armed Services view",()=>{
 const v=projectDodView(verified,"VIEW-DOD-SERVICES");
 assert(v.nodes.some(x=>x.id==="ORG-FED-EXE-DEP-DHS"));
 assert(v.relationships.some(x=>x.from_id==="DOD-SERVICE-COAST"&&x.to_id==="ORG-FED-EXE-DEP-DHS"));
 assert(v.relationships.some(x=>x.from_id==="DOD-SERVICE-SPACE"&&x.to_id==="CENSUS-COMP-DEF-AIR-FORCE"));
});
test("derived source edges have deterministic IDs across repeated projections and retain immutable cited URLs",()=>{
 const a=projectDodView(verified,"VIEW-DOD-AUTHORITY");
 const b=projectDodView(verified,"VIEW-DOD-AUTHORITY");
 assert.deepEqual(a.relationships.map(x=>x.id),b.relationships.map(x=>x.id));
 assert.equal(new Set(a.relationships.map(x=>x.id)).size,a.relationships.length);
 assert(a.relationships.every(x=>x.derived_from_canonical_record===true));
 assert(a.nodes.every(n=>Array.isArray(n.source_ids)&&Array.isArray(n.source_urls)));
 assert(a.nodes.flatMap(n=>n.source_urls).every(x=>x.startsWith("https://")));
});
test("20 bounded DoD collections retain canonical manifest and unresolved gap declarations",()=>{
 assert.equal(DOD_MODEL_PATHS.length,20);
 for(const p of DOD_MODEL_PATHS)assert(initial.manifest.models.includes(p));
 assert.equal(verified.checks.open_gaps,11);
 assert.equal(verified.extension.public_current_roster_reconciled,false);
 assert.equal(verified.extension.legal_citator_review_complete,false);
});
reject("missing GAO DAFA changes 19 plus eight source-bounded roster",f=>{f.files[file("dafas")].items.pop();},"27 DAFA");
reject("defense field activity cannot masquerade as defense agency",f=>{find(f,"dafas","DOD-DAFA-DTIC").category="defense_agency";},"27 DAFA");
reject("combat support agency cannot invent military command authority",f=>{find(f,"offices","DOD-ROLE-CHAIRMAN").military_command_role_verified=true;},"military adviser");
reject("DAFA historical name cannot be claimed current by unsupported evidence",f=>{find(f,"dafas","DOD-DAFA-DHRA").current_october_2026_name_verified=true;},"falsely establishes");
reject("forged source publisher domain rejected",f=>{find(f,"source-registry","DOD-SRC-10-162").url="https://uscode.house.gov.evil.test/t10/s162";},"nonofficial");
reject("changing GAO May 2026 as-of to October 2026 rejected",f=>{find(f,"source-snapshots","DOD-SNAPSHOT-DAFA-MAY-2026").as_of="2026-10-16";},"DAFA source era");
reject("mutable public command website cannot become immutable evidence",f=>{find(f,"source-snapshots","DOD-SNAPSHOT-COMBATANT-PUBLIC-WEB-2026-10-16").immutable_publication_ref="fake";},"must not claim immutable");
reject("Chairman cannot be granted direct combatant command",f=>{const e=f.files[file("relationships")].items.find(x=>x.relationship_type==="chairman_principal_military_adviser_not_commander");e.operational_command_established=true;},"operational command inferred");
reject("DAFA chart supervision cannot become operational chain of command",f=>{const e=f.files[file("relationships")].items.find(x=>x.relationship_type==="dated_chart_supervision_not_individual_delegation");e.operational_command_established=true;},"operational command inferred");
reject("SecDef combatant command chain cannot omit President exception",f=>{const e=f.files[file("relationships")].items.find(x=>x.relationship_type==="conditional_statutory_combatant_command_chain");e.qualifications=[];},"unconditional");
reject("DIA subsection 192 supervision exception cannot disappear",f=>{const e=f.files[file("relationships")].items.find(x=>x.to_id==="DOD-DAFA-DIA"&&x.relationship_type==="dated_chart_supervision_not_individual_delegation");e.statutory_192_a_supervision_applies=true;},"exclusion of DIA/NSA");
reject("NSA exception cannot apply to unrelated Defense Logistics Agency",f=>{const e=f.files[file("relationships")].items.find(x=>x.to_id==="DOD-DAFA-DLA"&&x.relationship_type==="dated_chart_supervision_not_individual_delegation");e.qualifications=["DOD-COND-DAFA-SUPERVISION-EXCEPTION"];},"exclusion of DIA/NSA");
reject("DoD inspector general cannot become ordinary OSD subordinate",f=>{find(f,"offices","DOD-ROLE-DOD-IG").category="osd_supervisory_office";},"military adviser or IG");
reject("Coast Guard cannot be made default DoD armed service",f=>{find(f,"armed-services","DOD-SERVICE-COAST").currently_part_of_dod_by_general_law=true;},"five DoD armed services");
reject("Space Force cannot be moved under Department Army",f=>{find(f,"armed-services","DOD-SERVICE-SPACE").institutional_parent_id="CENSUS-COMP-DEF-ARMY";},"placement incorrectly");
reject("agency rename cannot fork its source identity",f=>{find(f,"name-events","DOD-NAME-EVENT-DHRA-2026").canonical_node_id_unchanged=false;},"renamed agency");
reject("Secretary statutory authority cannot use invented provision",f=>{find(f,"powers","DOD-POWER-SECDEF-DIRECTION").provision_id="DOD-PROV-FORGED";},"unsupported legal authority");
reject("first amendment descriptive relation cannot grant military power",f=>{find(f,"capability-links","DOD-CAP-ADVICE").status="legally_proven";},"function alignment");
reject("FY2026 President budget request cannot become enacted appropriation",f=>{find(f,"fiscal-crosswalks","DOD-FISCAL-FY26-OM").appropriation_verified=true;},"budget request cannot");
reject("Treasury account cannot be invented from spending proposal",f=>{find(f,"fiscal-crosswalks","DOD-FISCAL-FY26-PROC").treasury_account_symbol="097-0100";},"budget request cannot");
reject("annual report to Congress cannot be narrowed to four committees",f=>{find(f,"congressional-crosswalks","DOD-CONG-LINK-01").recipient_committee_ids=["DOD-CONG-HOUSE-ASC"];},"congressional recipient");
reject("congressional report delivery cannot be asserted on unpublished evidence",f=>{find(f,"congressional-crosswalks","DOD-CONG-LINK-04").operational_reporting_compliance_verified=true;},"report delivery");
reject("role-specific statutory Secretary power cannot have wrong actor",f=>{find(f,"authority-traces","DOD-TRACE-MILDEPT-NAVY").actor_id="DOD-ROLE-SEC-ARMY";},"multi-actor");
reject("statutory citation cannot be omitted from official legal provision",f=>{find(f,"statutory-provisions","DOD-PROV-10-152-C").source_ids=[];},"section-level official citation");
reject("whole-DoD ADL-1 cannot be asserted from partial GAO roster",f=>{f.manifest.dod_institutional_authority_extension.whole_department_adl1_certified=true;},"extension incorrectly claims");
reject("website rendering cannot be certified in architecture-only PR",f=>{find(f,"viewpoints","VIEW-DOD-AUTHORITY").rendering_status="deployed";},"invalid unsourced");
reject("DoD new component cannot replace old census identifier",f=>{find(f,"statutory-composition","CENSUS-COMP-DEF-NAVY").legacy_census_ref="DOD-COMP-NEW-NAVY";},"original census ID");
reject("unsupported legal interpretation cannot claim complete citator",f=>{f.manifest.dod_institutional_authority_extension.legal_citator_review_complete=true;},"extension incorrectly claims");
reject("individual DAFA charter cannot be fabricated from GAO organization chart",f=>{find(f,"dafas","DOD-DAFA-DLA").individual_charter_or_delegation_verified=true;},"falsely establishes");
reject("President's constitutional Commander-in-Chief clause cannot be assigned to Congress",f=>{
 find(f,"constitutional-context","DOD-CONTEXT-COMMANDER").competent_actor_id="ORG-FED-LEG-CONGRESS";
},"constitution-statutory crosswalk invents");
reject("Article I Army raising clause cannot independently grant agency authority",f=>{
 find(f,"constitutional-context","DOD-CONTEXT-ARMIES").individual_dod_agency_power_derived=true;
},"constitution-statutory crosswalk invents");
reject("original constitutional witness cannot be substituted with an unreviewed source",f=>{
 find(f,"constitutional-context","DOD-CONTEXT-APPROPRIATIONS").source_ids=["DOD-SRC-FY26-DEFENSE-WIDE"];
},"constitution-statutory crosswalk invents");
reject("FY2026 budget request cannot supply appropriations under the Constitution",f=>{
 find(f,"constitutional-context","DOD-CONTEXT-APPROPRIATIONS").appropriations_derived=true;
},"constitution-statutory crosswalk invents");

