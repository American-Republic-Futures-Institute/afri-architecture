import {createHash} from "node:crypto";
// Source-bounded ARFI-COA DoD validation + deterministic research-view projection.
// Legal propositions must be directly supported; graph proximity never grants power.
export const DOD_FAMILIES=Object.freeze(["source-registry","source-snapshots","statutory-composition","dafas",
 "offices","armed-services","combatant-commands","name-events","statutory-provisions","conditions","powers",
 "relationships","congressional-committees","congressional-crosswalks","fiscal-crosswalks","capability-links",
 "authority-traces","viewpoints","gaps","constitutional-context"]);
export const DOD_MODEL_PATHS=Object.freeze(DOD_FAMILIES.map(x=>"model/federal/dod/"+x+".json"));
export const OTHER_MODEL_PATHS=Object.freeze(["model/federal/coverage/components.json",
 "model/federal/coverage/source-registry.json","model/federal/executive-leadership.json",
 "model/federal/legislative.json","model/federal/executive-departments.json",
 "model/federal/capabilities.json","model/federal/sources.json","model/constitutional/provisions.json"]);
const FAIL=x=>{throw Error("DoD model invalid: "+x);};
const check=(ok,msg)=>{if(!ok)FAIL(msg);};
const id=x=>typeof x==="string"&&/^[A-Z][A-Z0-9-]{2,160}$/.test(x);
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const unique=x=>new Set(x).size===x.length;
const items=(manifest,files,path)=>{
 check(manifest.models.includes(path),"unregistered DoD collection "+path);
 const x=files[path];check(x?.model_version==="0.1.0"&&Array.isArray(x.items),"invalid schema version or missing items "+path);
 check(x.items.every(y=>y&&id(y.id))&&unique(x.items.map(y=>y.id)),"duplicates or malformed identifier in "+path);
 return x.items;
};
const official=url=>{
 try{
  const u=new URL(url);
  if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)return false;
  return ["uscode.house.gov","files.gao.gov","www.govinfo.gov","www.defense.gov","comptroller.defense.gov"].includes(u.hostname);
 }catch{return false;}
};
const findOne=(map,key)=>{const x=map.get(key);check(!!x,"missing source record "+key);return x;};
export function validateDod(manifest,files){
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
 manifest?.release_status==="research_baseline_unratified","canonical version and release posture");
 const ext=manifest.dod_institutional_authority_extension;
 check(ext?.id==="ARFI-COA-DOD-002"&&ext.version==="0.1.0"&&
 ext.status==="source_bounded_research_unratified"&&
 ext.department_id==="ORG-FED-EXE-DEP-DEFENSE"&&
 ext.whole_department_adl1_certified===false&&ext.all_charters_reviewed===false&&
 ext.all_appropriations_verified===false&&ext.public_current_roster_reconciled===false&&
 ext.legal_citator_review_complete===false&&
 ext.website_rendering_status==="not_implemented"&&ext.policy_mapping_status==="not_implemented",
 "extension incorrectly claims whole DoD census/legal review, approved policy or website publication");
 const data={};
 for(const path of DOD_MODEL_PATHS)data[path.split("/").at(-1).replace(".json","")]=items(manifest,files,path);
 for(const path of OTHER_MODEL_PATHS)check(files[path]?.items?.length>0,"missing canonical cross-family reference "+path);
 const sources=new Map([
  ...data["source-registry"].map(x=>[x.id,x]),
  ...files["model/federal/coverage/source-registry.json"].items.map(x=>[x.id,x]),
  ...files["model/federal/sources.json"].items.map(x=>[x.id,x])
 ]);
 check(sources.size===data["source-registry"].length+files["model/federal/coverage/source-registry.json"].items.length+files["model/federal/sources.json"].items.length,
  "duplicate external citation identifiers");
 for(const s of data["source-registry"]){
  check(official(s.url)&&s.accessed_on==="2026-10-16"&&typeof s.source_version==="string"&&
   typeof s.evidence_scope==="string"&&s.evidence_scope.length>=18&&s.legal_review_status,
   "nonofficial or unfixed source "+s.id);
  if(s.type==="official_codified_statute")
   check(s.source_version==="through_public_law_119-120_2026-10-07"&&
    /^DOD-SRC-(10|14|31)-[0-9]+$/.test(s.id),"unsupported statute revision "+s.id);
 }
 const snapshots=new Map(data["source-snapshots"].map(x=>[x.id,x]));
 check(data["source-snapshots"].length===5&&data["source-snapshots"].every(x=>x.source_ids.every(id=>sources.has(id))),
  "source edition snapshot must cite official sources");
 const chart=findOne(snapshots,"DOD-SNAPSHOT-DAFA-MAY-2026");
 check(chart.as_of==="2026-05-31"&&chart.published_on==="2026-09-03"&&
  chart.immutable_publication_ref==="GAO-26-107781_Figure_1"&&
  chart.completeness==="full_figure_roster_19_plus_8_not_post_may_current",
  "DAFA source era or coverage scope was falsely promoted");
 check(findOne(snapshots,"DOD-SNAPSHOT-COMBATANT-PUBLIC-WEB-2026-10-16").immutable_publication_ref===null,
  "mutable public combatant-command roster must not claim immutable source");
 const required9=["OSD","JCS","JOINT-STAFF","DEFENSE-AGENCIES","FIELD-ACTIVITIES","ARMY","NAVY","AIR-FORCE","COMBATANT-COMMANDS"];
 const composition=data["statutory-composition"],compMap=new Map(composition.map(x=>[x.id,x]));
 check(composition.length===11&&same(composition.slice(0,9).map(x=>x.short_code),required9)&&
  composition.slice(9).every(x=>x.kind==="residual_statutory_class"&&x.is_complete_list_of_individual_members===false),
  "10 USC 111 composition missing residual legal classes or contains invented units");
 const censusSet=new Set(files["model/federal/coverage/components.json"].items.map(x=>x.id));
 for(const c of composition){
  check(c.department_id===ext.department_id&&c.source_ids.every(id=>sources.has(id))&&
   c.source_ids.includes("CENSUS-SRC-DOD-111")&&c.composition_not_command===true&&
   c.identity_validated_to_statutory_category===true&&c.snapshot_id==="DOD-SNAPSHOT-USC-2026-10-07",
   "statutory composition cannot assert command or be unsourced "+c.id);
  if(c.legacy_census_ref)check(c.legacy_census_ref===c.id&&censusSet.has(c.id),
   "original census ID must never be forked "+c.id);
 }
 const roles=new Map(data.offices.map(x=>[x.id,x]));
 check(data.offices.length===ext.office_and_role_records&&roles.size===17,
  "DoD civilian, military advisory, IG and combatant office classifications absent");
 for(const x of roles.values())check(x.personnel_individual_identified===false&&x.source_ids.every(z=>sources.has(z))&&
  x.parent_id&&x.category&&x.review_status,"official role cannot invent an incumbent "+x.id);
 check(findOne(roles,"DOD-ROLE-CHAIRMAN").military_command_role_verified===false&&
  findOne(roles,"DOD-ROLE-DOD-IG").category==="statutorily_independent_oversight_office",
  "military adviser or IG must not be typed as combatant commander");
 check(findOne(roles,"DOD-CCMD-ROLE").category==="statutory_combatant_commander_class"&&
  findOne(roles,"DOD-ROLE-SECDEF").military_command_role_verified===true,
  "combatant command cannot be transferred to statutory adviser class");
 const dafa=data.dafas,daMap=new Map(dafa.map(x=>[x.id,x]));
 const agen=dafa.filter(x=>x.category==="defense_agency"),fields=dafa.filter(x=>x.category==="dod_field_activity");
 check(dafa.length===27&&agen.length===19&&fields.length===8&&
  dafa.filter(x=>x.combat_support_agency===true).length===8&&
  ext.dafa_defense_agencies===19&&ext.dafa_field_activities===8&&ext.combat_support_agencies===8,
  "27 DAFA May 2026 GAO source counts or eight CSA flags invalid");
 for(const x of dafa){
  check(x.department_id===ext.department_id&&x.observed_as_of==="2026-05-31"&&
   x.snapshot_id===chart.id&&x.source_ids.length===1&&x.source_ids[0]==="DOD-SRC-GAO-DAFA-2026"&&
   x.current_october_2026_name_verified===false&&x.official_agency_identifier===null&&
   x.individual_charter_or_delegation_verified===false&&x.appropriation_verified===false,
   "GAO roster candidate falsely establishes 2026 current status or individual delegated power "+x.id);
  check(x.category_parent_id===(
   x.category==="defense_agency"?"CENSUS-COMP-DEF-DEFENSE-AGENCIES":"CENSUS-COMP-DEF-FIELD-ACTIVITIES"),
   "DoD agency/field activity category or parent incorrect "+x.id);
  check(roles.has(x.supervisor_role_id)&&findOne(roles,x.supervisor_role_id).category==="osd_supervisory_office",
   "missing date-specific GAO supervisory column "+x.id);
 }
 for(const name of ["DIA","NSA","DCMA","DLA","DTRA","DHA","NGA","DISA"])
  check(daMap.has("DOD-DAFA-"+name)&&findOne(daMap,"DOD-DAFA-"+name).combat_support_agency===true,
   "key combat support agency or classified-source boundary missing");
 const services=data["armed-services"];
 check(services.length===6&&services.filter(x=>x.currently_part_of_dod_by_general_law).length===5,
  "five DoD armed services and outside-DoD Coast Guard comparator required");
 const parents=new Map([
 ["ARMY","CENSUS-COMP-DEF-ARMY"],["NAVY","CENSUS-COMP-DEF-NAVY"],
 ["MARINE","CENSUS-COMP-DEF-NAVY"],["AIR","CENSUS-COMP-DEF-AIR-FORCE"],
 ["SPACE","CENSUS-COMP-DEF-AIR-FORCE"],["COAST","ORG-FED-EXE-DEP-DHS"]
 ]);
 for(const [code,p]of parents){
  const s=services.find(x=>x.id==="DOD-SERVICE-"+code);
  check(s?.institutional_parent_id===p&&
   s.currently_part_of_dod_by_general_law===(code!=="COAST")&&
   s.operational_command_assignment_inferred===false&&
   s.source_ids.every(x=>sources.has(x)),
   "Army/Navy/Marine/Air/Space service or conditional Coast Guard placement incorrectly modeled "+code);
 }
 const cmds=data["combatant-commands"];
 check(cmds.length===ext.public_combatant_command_candidates&&cmds.length===11&&
  cmds.every(x=>x.statutoric_family_id===undefined&&
   x.statutory_family_id==="CENSUS-COMP-DEF-COMBATANT-COMMANDS"&&
   x.individual_mission_boundary_or_force_allocation_verified===false&&
   x.individual_chain_exception_verification==="not_checked"&&
   x.source_ids.includes("DOD-SRC-DEFENSE-ABOUT-2026")),
  "public combatant command names cannot be converted into verified force assignments or UCP scopes");
 const renamed=data["name-events"],nameMap=new Map(renamed.map(x=>[x.institution_id,x]));
 check(renamed.length===3&&same([...nameMap.keys()],["DOD-DAFA-DHRA","DOD-DAFA-MEDIA","DOD-DAFA-TRMC"]),
  "temporal June/February 2026 identity events not preserved");
 for(const x of renamed)check(daMap.has(x.institution_id)&&x.canonical_node_id_unchanged===true&&
  x.source_ids.every(x=>sources.has(x))&&x.effective_on.startsWith("2026-"),
  "renamed agency cannot be silently replaced or detached from dated roster");
 const prov=new Map(data["statutory-provisions"].map(x=>[x.id,x]));
 check(data["statutory-provisions"].length===ext.legal_provision_records&&
  data["statutory-provisions"].length>=28&&
  [...prov.values()].every(x=>x.source_ids.length>0&&x.source_ids.every(id=>sources.has(id))&&
  x.external_citator_review_complete===false&&x.is_current_authoritative_interpretation===false&&
  x.legal_edition==="through_Pub_L_119-120_2026-10-07"),
  "section-level official citation cannot claim complete legal review");
 for(const [section,ref]of [["10-113-C","CENSUS-SRC-DOD-113"],["10-152-C","DOD-SRC-10-152"],
 ["10-162-B","DOD-SRC-10-162"],["10-192-A","DOD-SRC-10-192"],
 ["10-101-16","DOD-SRC-10-101"],["31-1341-A","DOD-SRC-31-1341"]])
  check(findOne(prov,"DOD-PROV-"+section).source_ids.includes(ref),"statutory subsection wrong or missing: "+section);
 const conditions=new Map(data.conditions.map(x=>[x.id,x]));
 check(conditions.size===ext.statutory_conditions&&conditions.size>=14,
  "required fiscal, chain-of-command and oversight limitations absent");
 for(const x of conditions.values()){
  const p=findOne(prov,x.provision_id);
  check(same(p.source_ids,x.source_ids)&&x.review_status==="source_bounded_statutory_limit_not_exhaustive_legal_review",
   "statutory condition not traceable to its published section "+x.id);
 }
 const powers=new Map(data.powers.map(x=>[x.id,x]));
 check(powers.size===ext.authority_record_count&&powers.size===12,"missing bounded authority exemplars");
 const actors=new Set([...roles.keys(),"ORG-FED-EXE-PRESIDENT"]);
 for(const x of powers.values()){
  check(actors.has(x.authorized_actor_id)&&prov.has(x.provision_id)&&x.condition_ids.every(x=>conditions.has(x))&&
   same(x.source_ids,findOne(prov,x.provision_id).source_ids)&&
   x.legal_authority_proven_for_scope===true&&
   x.individual_agency_delegation_proven===false&&x.appropriation_verified===false&&
   x.citator_review_complete===false,"unsupported legal authority, invented actor or false fiscal power "+x.id);
 }
 check(findOne(powers,"DOD-POWER-CHAIRMAN-MIL-ADVICE").condition_ids.includes("DOD-COND-CHAIRMAN-NOCOMMAND")&&
  findOne(powers,"DOD-POWER-CCDR-COMMAND").authorized_actor_id==="DOD-CCMD-ROLE"&&
  findOne(powers,"DOD-POWER-PRESIDENT-CCMD-ESTABLISH").authorized_actor_id==="ORG-FED-EXE-PRESIDENT",
  "constitutional Commander in Chief/Chairman/CCDR authority confused");
 const relations=data.relationships,known=new Set([...composition.map(x=>x.id),...dafa.map(x=>x.id),
  ...roles.keys(),...services.map(x=>x.id),...cmds.map(x=>x.id),ext.department_id]);
 check(relations.length===ext.typed_relationships&&relations.length>=100,
  "insufficient typed statutory, DAFA and command relationships");
 const TYPES=new Set(["statutory_department_composition","categorized_under_statutory_composition_class",
 "dated_chart_supervision_not_individual_delegation","designated_combat_support_agency_subject_to_readiness_review",
 "armed_service_statutory_department_placement","outside_dod_conditional_navy_service",
 "member_of_combatant_command_class","conditional_statutory_combatant_command_chain",
 "military_department_secretary_statutory_responsibility",
 "chairman_principal_military_adviser_not_commander","independent_statutory_ig_oversight_not_command"]);
 for(const x of relations){
  check(TYPES.has(x.relationship_type)&&known.has(x.from_id)&&
    (known.has(x.to_id)||x.to_id==="ORG-FED-EXE-DEP-DHS")&&
    x.source_ids.length>0&&x.source_ids.every(x=>sources.has(x))&&
    x.direct_subordinate_delegation_established===false,
   "invented organizational node or unsourced delegation "+x.id);
  if(x.legal_provision_id)check(prov.has(x.legal_provision_id),"uncited law for typed relation "+x.id);
  const canCommand=x.relationship_type==="conditional_statutory_combatant_command_chain";
  check(x.operational_command_established===canCommand,
   "operational command inferred from organizational proximity "+x.id);
  if(canCommand)check(x.from_id==="DOD-ROLE-SECDEF"&&x.to_id.startsWith("DOD-CCMD-")&&
   x.qualifications.includes("DOD-COND-PRESIDENT-OVERRIDE")&&
   x.legal_provision_id==="DOD-PROV-10-162-B",
   "unconditional or invalid combatant-command chain "+x.id);
  if(x.relationship_type==="dated_chart_supervision_not_individual_delegation"){
   const isException=["DOD-DAFA-DIA","DOD-DAFA-NSA"].includes(x.to_id);
   check(x.as_of==="2026-05-31"&&
    x.statutory_192_a_supervision_applies===!isException&&
    same(x.qualifications,isException?["DOD-COND-DAFA-SUPERVISION-EXCEPTION"]:[]),
    "10 USC 192(a)(3) exclusion of DIA/NSA illegally ignored "+x.id);
  }
  if(x.relationship_type==="chairman_principal_military_adviser_not_commander")
   check(x.operational_command_established===false&&x.qualifications.includes("DOD-COND-CHAIRMAN-NOCOMMAND"),
    "Chairman must not be assigned direct military command");
 }
 check(relations.filter(x=>x.relationship_type==="conditional_statutory_combatant_command_chain").length===11,
  "incomplete public combatant-command default chain");
 check(relations.filter(x=>x.relationship_type==="dated_chart_supervision_not_individual_delegation").length===27,
  "27 separate dated DAFA supervisorial references are required");
 check(relations.filter(x=>x.relationship_type==="designated_combat_support_agency_subject_to_readiness_review").length===8,
  "combat support agency review marks not exhaustive");
 const congress=data["congressional-committees"],commMap=new Map(congress.map(x=>[x.id,x]));
 check(congress.length===4&&ext.congressional_committee_citations===4&&
  congress.every(x=>x.source_ids.includes("DOD-SRC-10-101")&&
   ["ORG-FED-LEG-HOUSE","ORG-FED-LEG-SENATE"].includes(x.parent_chamber_id)&&
   x.current_committee_rules_verified===false&&x.exact_subcommittee_jurisdiction_not_inferred===true),
  "statutory congressional defense committee is not an assumed subcommittee");
 const reps=data["congressional-crosswalks"];
 check(reps.length===4&&reps.length===ext.congressional_reporting_crosswalks,
  "incomplete congressional reporting pathways");
 for(const x of reps){
  check(prov.has(x.provision_id)&&actors.has(x.actor_id)&&x.source_ids.every(y=>sources.has(y))&&
   x.operational_reporting_compliance_verified===false&&x.appropriations_legally_enacted===false,
   "report delivery or appropriations invented "+x.id);
  const defense=["DOD-PROV-10-192-C","DOD-PROV-10-193-A"].includes(x.provision_id);
  check(same(x.recipient_committee_ids,defense?[...commMap.keys()]:[])&&
   x.recipient_status===(defense?"statutory_congressional_defense_committees_defined_in_10_USC_101_a_16":"Congress_at_large_not_specific_defense_committees"),
   "congressional recipient invented or miscited "+x.id);
 }
 const fiscal=data["fiscal-crosswalks"];
 check(fiscal.length===ext.fy2026_budget_proposal_categories&&fiscal.length===4,
  "select exactly four FY2026 budget proposal categories for pilot");
 for(const f of fiscal)check(f.fiscal_year===2026&&f.status==="presidents_budget_request_reference_not_enacted_appropriation"&&
  f.source_ids.includes("DOD-SRC-FY26-DEFENSE-WIDE")&&f.appropriation_verified===false&&
  f.enacted_appropriation_act_id===null&&f.treasury_account_symbol===null&&
  f.obligated_amount_verified===false&&f.spent_or_obligated_derived===false&&
  f.purpose_limitation_id==="DOD-COND-PURPOSE-RULE"&&
  f.availability_limitation_id==="DOD-COND-ANTIDEFICIENCY",
  "budget request cannot certify available spending authority "+f.id);
 const caps=data["capability-links"];
 const oldCaps=new Set(files["model/federal/capabilities.json"].items.map(x=>x.id));
 check(caps.length===4&&caps.every(x=>powers.has(x.power_id)&&oldCaps.has(x.capability_id)&&
  x.appropriation_verified===false&&x.operational_effectiveness_verified===false&&
  x.status==="descriptive_capability_alignment_not_program_implementation"),
  "function alignment converted into fiscal execution or unverified service outcomes");
 const trace=data["authority-traces"];
 check(trace.length===ext.scoped_authority_traces&&trace.length===9,
  "selected complete authority pilots are missing");
 for(const t of trace){
  check(actors.has(t.actor_id)&&t.department_id===ext.department_id&&
   t.power_ids.every(p=>powers.has(p)&&powers.get(p).authorized_actor_id===t.actor_id)&&
   t.condition_ids.every(id=>conditions.has(id))&&
   t.legal_provision_ids.every(id=>prov.has(id))&&
   t.source_ids.every(id=>sources.has(id))&&
   t.full_department_authority_mapped===false&&t.fy2026_spending_power_verified===false&&
   t.role_to_individual_delegation_verified===false&&t.judicial_interpretation_completed===false,
   "multi-actor authority chain or unsupported citation "+t.id);
 }
 const contextual=data["constitutional-context"];
 const constitutionalIndex=new Map(files["model/constitutional/provisions.json"].items.map(x=>[x.id,x]));
 const officialTranscript=findOne(sources,"SRC-CONST-ORIGINAL-TRANSCRIPT");
 check(officialTranscript.url==="https://www.archives.gov/founding-docs/constitution-transcript",
  "constitutional context must preserve the National Archives primary original-text witness");
 const expectedContexts=[
 ["WAR","CONST-US-ART-01-SEC-08-CL-11","ORG-FED-LEG-CONGRESS"],
 ["ARMIES","CONST-US-ART-01-SEC-08-CL-12","ORG-FED-LEG-CONGRESS"],
 ["NAVY","CONST-US-ART-01-SEC-08-CL-13","ORG-FED-LEG-CONGRESS"],
 ["REGULATION","CONST-US-ART-01-SEC-08-CL-14","ORG-FED-LEG-CONGRESS"],
 ["APPROPRIATIONS","CONST-US-ART-01-SEC-09-CL-07","ORG-FED-LEG-CONGRESS"],
 ["NECESSARY-PROPER","CONST-US-ART-01-SEC-08-CL-18","ORG-FED-LEG-CONGRESS"],
 ["COMMANDER","CONST-US-ART-02-SEC-02-CL-01","ORG-FED-EXE-PRESIDENT"]
 ];
 check(contextual.length===ext.constitutional_context_records&&contextual.length===expectedContexts.length,
  "DoD constitutional context subset is missing");
 const constitutionalActors=new Set([...files["model/federal/legislative.json"].items,
   ...files["model/federal/executive-leadership.json"].items].map(x=>x.id));
 for(const [short,clause,actor]of expectedContexts){
  const context=contextual.find(x=>x.id==="DOD-CONTEXT-"+short);
  check(context?.constitution_id===clause&&context.competent_actor_id===actor&&
   constitutionalActors.has(actor)&&constitutionalIndex.has(clause)&&
   context.source_ids.length===1&&context.source_ids[0]==="SRC-CONST-ORIGINAL-TRANSCRIPT"&&
   prov.has(context.statutory_context_id)&&
   context.status==="contextual_connection_not_direct_statutory_delegation"&&
   context.individual_dod_agency_power_derived===false&&context.appropriations_derived===false&&
   context.full_judicial_review_complete===false,
   "constitution-statutory crosswalk invents constitutional military power or delegation: "+short);
 }
 const views=data.viewpoints;check(views.length===ext.declarative_views&&views.length===8,
  "missing independent DoD source viewpoints");
 const selectRoots=new Set([...known,...prov.keys(),...trace.map(x=>x.id),...congress.map(x=>x.id),
  ...fiscal.map(x=>x.id),...contextual.map(x=>x.id)]);
 for(const v of views)check(v.rendering_status==="data_contract_only_not_web_rendered"&&
   v.source_evidence_required===true&&v.root_ids.every(x=>selectRoots.has(x))&&
   v.max_hops<=4&&v.legal_review_status==="research_pending_citator_and_responsible_official_review",
   "invalid unsourced DoD viewpoint "+v.id);
 const gaps=data.gaps;
 check(gaps.length===ext.review_gaps&&gaps.length>=11&&gaps.every(x=>x.status==="open"&&
  x.source_ids.every(y=>sources.has(y))&&x.closure_condition.length>=50),
  "coverage ledger hides unfinished organizational/fiscal review");
 for(const required of ["DOD-GAP-DAFA-NAME-CURRENCY","DOD-GAP-FISCAL-ACCOUNT","DOD-GAP-COMBATANT-UCP","DOD-GAP-INDIVIDUAL-DELEGATION"])
 check(gaps.some(x=>x.id===required),"incomplete DoD coverage must disclose "+required);
 const congressEntity=files["model/federal/legislative.json"].items.find(x=>x.id==="ORG-FED-LEG-CONGRESS");
 check(congressEntity?.branch_id==="BR-FED-LEG","congress reporting recipient must be the real canonical legislative institution");
 const department=files["model/federal/executive-departments.json"].items.find(x=>x.id===ext.department_id);
 check(department?.kind==="executive_department"&&department.branch_id==="BR-FED-EXE",
  "missing unchanged canonical DoD department");
 return {manifest,extension:ext,data,sources,department,congressEntity,constitutionalIndex,components:compMap,dafas:daMap,roles,commands:cmds,
  services,conditions,provisions:prov,powers,relationships:relations,congressional:congress,fiscal,
  views,gaps,checks:{
   statute_composition:composition.length,defense_agencies:agen.length,field_activities:fields.length,
   combat_support:8,office_roles:roles.size,armed_services:services.length,public_commands:cmds.length,
   legal_provisions:prov.size,powers:powers.size,relationships:relations.length,statutory_limits:conditions.size,
   congressional_committees:congress.length,reporting_pathways:reps.length,fiscal_proposal_categories:fiscal.length,
   authority_chains:trace.length,constitution_context_links:contextual.length,viewpoints:views.length,open_gaps:gaps.length,
   complete_current_organization_claims:0,verified_enacted_appropriations:0}};
}
export function projectDodView(data,viewId){
 const v=data.views.find(x=>x.id===viewId);
 check(!!v,"unregistered or prohibited DoD viewpoint "+viewId);
 const nodes=new Map(),edges=[],relIds=new Set();
 const push=x=>{
  if(!x?.id)return;
  const source_ids=Array.isArray(x.source_ids)?x.source_ids:[];
  check(source_ids.every(y=>data.sources.has(y)),
   "DoD projection contains an uncited source record: "+x.id);
  const sourceUrls=source_ids.map(y=>data.sources.get(y)?.url).filter(Boolean);
  nodes.set(x.id,{id:x.id,name:x.name||x.title||x.id,kind:x.type||x.category||x.kind,
   source_ids,source_urls:sourceUrls,review_status:x.review_status||x.legal_review_status||x.status||"research_bounded",
   model_source_locator:x.legal_locator||x.source_locator||x.section_locator||null,
   legal_status:"source_bounded_research_not_independently_legally_certified"});
 };
 const emit=(from_id,to_id,relationship_type,source_ids,qualification)=>{
  check(nodes.has(from_id)&&nodes.has(to_id),"projection attempted a dangling evidentiary connection "+from_id+" -> "+to_id);
  check(Array.isArray(source_ids)&&source_ids.length>0&&source_ids.every(x=>data.sources.has(x)),
   "projection cannot infer an unsourced relationship "+relationship_type);
  const fingerprint=[v.id,from_id,to_id,relationship_type,[...new Set(source_ids)].sort().join("|")].join("/");
  const id="DOD-VIEW-EDGE-"+createHash("sha256").update(fingerprint).digest("hex").slice(0,32).toUpperCase();
  check(!relIds.has(id),"duplicate projected authority, oversight or financial edge "+id);
  relIds.add(id);
  edges.push({id,from_id,to_id,relationship_type,source_ids,legal_authority_proven:false,
   derived_from_canonical_record:true,qualification:qualification||"Research-only relation; this edge creates no new legal power."});
 };
 const original=data.relationships;
 if(v.id==="VIEW-DOD-COMPOSITION"||v.id==="VIEW-DOD-SERVICES"){
  for(const x of data.data["statutory-composition"])push(x);
  if(v.id==="VIEW-DOD-COMPOSITION")push(data.department);
 }
 if(v.id==="VIEW-DOD-DAFA"){
  for(const x of data.data.dafas)push(x);
  for(const x of data.data.offices.filter(y=>y.category==="osd_supervisory_office"||y.id==="DOD-ROLE-CHAIRMAN"))push(x);
  for(const x of data.data["statutory-composition"].filter(y=>/AGENCIES|FIELD-ACTIVITIES/.test(y.short_code)))push(x);
 }
 if(v.id==="VIEW-DOD-COMMAND"){
  for(const x of data.commands)push(x);
  for(const x of data.data.offices.filter(y=>["DOD-ROLE-SECDEF","DOD-ROLE-CHAIRMAN","DOD-CCMD-ROLE"].includes(y.id)))push(x);
  push(data.components.get("CENSUS-COMP-DEF-COMBATANT-COMMANDS"));
 }
 if(v.id==="VIEW-DOD-SERVICES")for(const x of data.services)push(x);
 if(v.id==="VIEW-DOD-AUTHORITY"){
  for(const x of data.data.offices)push(x);
  for(const x of data.data.powers)push(x);
  for(const x of data.data.conditions)push(x);
  for(const x of data.data["statutory-provisions"])push(x);
  for(const x of data.data["authority-traces"])push(x);
  push(data.congressEntity); // source referenced; no inferred legislative delegation
  push(data.department);
  push(data.data.offices.find(x=>x.id==="DOD-ROLE-SECDEF"));
  push(data.data.offices.find(x=>x.id==="DOD-CCMD-ROLE"));
  for(const x of data.data.powers){
   if(!nodes.has(x.authorized_actor_id)){
    if(x.authorized_actor_id==="ORG-FED-EXE-PRESIDENT"){
     const president={id:"ORG-FED-EXE-PRESIDENT",name:"President of the United States",
      source_ids:data.data["constitutional-context"].filter(z=>z.competent_actor_id==="ORG-FED-EXE-PRESIDENT")
       .flatMap(z=>z.source_ids),type:"constitutional_office"};
     push(president);
    }else check(false,"power assigned to a missing statutory role "+x.id);
   }
   emit(x.authorized_actor_id,x.id,"bounded_statutory_role_authority",x.source_ids,
     "Limited to a text-indexed actor/function; legal advice and individual delegated authority remain unverified.");
   const p=data.provisions.get(x.provision_id);
   emit(x.id,p.id,"bounded_statutory_legal_basis",p.source_ids);
   for(const condId of x.condition_ids){
    const c=data.conditions.get(condId);
    emit(x.id,c.id,"explicit_statutory_limitation",c.source_ids,
     "Restriction accompanies the indexed function, not a new legal authority.");
   }
  }
  for(const x of data.data["authority-traces"]){
   if(nodes.has(x.actor_id))emit(x.id,x.actor_id,"trace_has_statutory_actor",x.source_ids);
   for(const id of x.power_ids)emit(x.id,id,"trace_cites_bounded_power",x.source_ids);
  }
 }
 if(v.id==="VIEW-DOD-CONGRESS"){
  for(const x of [...data.congressional,...data.data["congressional-crosswalks"]])push(x);
  for(const x of data.data.offices.filter(y=>["DOD-ROLE-SECDEF","DOD-ROLE-CHAIRMAN"].includes(y.id)))push(x);
  push(data.congressEntity);
  for(const x of data.data["congressional-crosswalks"]){
   emit(x.actor_id,x.id,"congressional_reporting",x.source_ids,
    "Statutory reporting duty, not proof of delivered report.");
   const recipients=x.recipient_committee_ids.length?x.recipient_committee_ids:[data.congressEntity.id];
   for(const id of recipients)emit(x.id,id,"statutory_report_recipient",x.source_ids,
    "Statutorily identified recipient only; does not prove submitted, accepted or reviewed report.");
  }
 }
 if(v.id==="VIEW-DOD-FISCAL"){
  for(const x of data.fiscal)push(x);
  for(const id of ["DOD-COND-PURPOSE-RULE","DOD-COND-ANTIDEFICIENCY"]){
   const condition=data.conditions.get(id);push(condition);
   push(data.provisions.get(condition.provision_id));
  }
  for(const x of data.fiscal){
   for(const limitId of [x.purpose_limitation_id,x.availability_limitation_id])
    emit(x.id,limitId,"proposed_budget_only",[
     ...x.source_ids,...data.conditions.get(limitId).source_ids],
     "FY2026 request is not an enacted appropriation; these laws constrain future expenditures, not grant funding.");
  }
  for(const id of ["DOD-COND-PURPOSE-RULE","DOD-COND-ANTIDEFICIENCY"]){
   const condition=data.conditions.get(id);
   emit(id,condition.provision_id,"fiscal_guardrail_source_basis",condition.source_ids);
  }
 }
 if(v.id==="VIEW-DOD-CONSTITUTION"){
  for(const x of data.data["constitutional-context"]){
   push(x);push(data.constitutionalIndex.get(x.constitution_id));push(data.provisions.get(x.statutory_context_id));
  }
  for(const x of data.data["constitutional-context"]){
   emit(x.constitution_id,x.id,"constitutional_context_not_direct_statutory_delegation",
    x.source_ids,"Original constitutional text is context, not agency-specific delegation.");
   emit(x.id,x.statutory_context_id,"source_research_context_only",
    [...x.source_ids,...data.provisions.get(x.statutory_context_id).source_ids],
    "Analytical Article/Title crosswalk; no independent power or appropriation inferred.");
  }
 }
 for(const x of original.filter(x=>nodes.has(x.from_id)&&nodes.has(x.to_id)&&
   v.include_relationship_types.includes(x.relationship_type)))
  emit(x.from_id,x.to_id,x.relationship_type,x.source_ids,
   x.qualifications?.length?x.qualifications.join("; "):"Source-dated statutory or descriptive relationship; see legal authority qualification.");
 check(edges.every(e=>v.include_relationship_types.includes(e.relationship_type)),
  "view selection must declare every rendered relationship class "+v.id);
 return {model_standard:"ARFI-COA",id:v.id,title:v.title,status:v.rendering_status,
  reference_as_of:v.applicability_label,department_id:data.extension.department_id,
  nodes:[...nodes.values()].sort((a,b)=>a.id.localeCompare(b.id)),relationships:edges,
  counts:{nodes:nodes.size,relationships:edges.length},
  source_snapshot_revision:data.extension.latest_legal_codification,
  caveats:["Official dated research graph, not certified comprehensive legal interpretation.",
   "Legal command, agency oversight, congressional reporting and fiscal authority are different relationships.",
   "All derived edges are source-linked and do not create legal powers, funding authority or military command.",
   "This source subset has not been rendered or deployed to the public website."]};
}
