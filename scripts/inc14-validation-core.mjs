import fs from "node:fs";
export const FAMILIES=Object.freeze(["sources","nodes","instruments","relationships","stages","transitions","observations","fiscal","history","coverage","gaps","views"]);
const PREFIX="model/federal/";
const HOUSE="ORG-FED-LEG-HOUSE",SENATE="ORG-FED-LEG-SENATE",CONGRESS="ORG-FED-LEG-CONGRESS";
const ROOTS=new Set([HOUSE,SENATE,CONGRESS]);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const type=x=>x===null?"null":Array.isArray(x)?"array":typeof x;
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
const date=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const assert=(ok,msg)=>{if(!ok)throw Error("INC14 "+msg);};
function schemaField(value,schema,loc,defs){
 if(schema.$ref)return schemaField(value,defs[schema.$ref.split("/").at(-1)],loc,defs);
 if(Object.hasOwn(schema,"const"))assert(equal(value,schema.const),"fixed qualification changed "+loc);
 if(schema.enum)assert(schema.enum.some(x=>equal(x,value)),"enum changed "+loc);
 if(schema.type)assert([].concat(schema.type).includes(type(value)),"schema type "+loc);
 if(schema.pattern&&typeof value==="string")assert(new RegExp(schema.pattern).test(value),"schema pattern "+loc);
 if(schema.minLength&&typeof value==="string")assert(value.length>=schema.minLength,"schema empty "+loc);
 if(Array.isArray(value)){
  if(schema.minItems)assert(value.length>=schema.minItems,"schema list empty "+loc);
  if(schema.uniqueItems)assert(unique(value.map(x=>JSON.stringify(x))),"schema duplicate array "+loc);
  if(schema.items)for(const [i,v]of value.entries())schemaField(v,schema.items,loc+"["+i+"]",defs);
 }
 if(schema.type==="object"&&type(value)==="object"){
  for(const key of schema.required||[])assert(Object.hasOwn(value,key),"missing required field "+loc+"."+key);
  for(const [key,v]of Object.entries(value)){
   assert(Object.hasOwn(schema.properties||{},key)||schema.additionalProperties!==false,"unexpected field "+loc+"."+key);
   if(schema.properties?.[key])schemaField(v,schema.properties[key],loc+"."+key,defs);
  }
 }
}
export function validateINC14Schema(schema,data){
 assert(schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  Object.keys(schema.$defs||{}).length===FAMILIES.length&&schema.oneOf?.length===FAMILIES.length,
  "missing schema family registry");
 for(const fam of FAMILIES){
  const inner=schema.$defs[fam],wrapper=schema.oneOf.find(x=>x.properties?.model_family?.const==="inc14-"+fam);
  assert(inner?.additionalProperties===false&&wrapper?.additionalProperties===false&&
   wrapper.properties?.items?.items?.$ref==="#/$defs/"+fam&&
   equal([...inner.required].sort(),Object.keys(inner.properties).sort()),
   "open/invalid family schema "+fam);
  schemaField(data[fam],wrapper,fam,schema.$defs);
 }
}
const SOURCES={"X14-SRC-CONSTITUTION":"https://constitution.congress.gov/browse/article-1/","X14-SRC-HOUSE-RULES":"https://rules.house.gov/house-rules-119th-congress","X14-SRC-HOUSE-HRES5":"https://rules.house.gov/bill/119/h-res-5","X14-SRC-SENATE-RULES":"https://www.rules.senate.gov/rules-of-the-senate","X14-SRC-HOUSE-COMMITTEES":"https://clerk.house.gov/Committees","X14-SRC-HOUSE-MILCON":"https://appropriations.house.gov/subcommittees/military-construction-veterans-affairs-and-related-agencies-119th-congress","X14-SRC-SENATE-MILCON":"https://www.appropriations.senate.gov/subcommittees/military-construction-veterans-affairs-and-related-agencies","X14-SRC-SENATE-RULE25":"https://www.senate.gov/about/origins-foundations/committee-system/committee-rules.htm","X14-SRC-HOUSE-CLERK":"https://clerk.house.gov/About/ViewOLODetails","X14-SRC-SENATE-SECRETARY":"https://www.senate.gov/about/officers-staff/secretary-of-the-senate.htm","X14-SRC-CRS-R42843":"https://www.congress.gov/crs_external_products/R/PDF/R42843/R42843.18.pdf","X14-SRC-GOVINFO-LAWS":"https://www.govinfo.gov/app/collection/plaw","X14-SRC-PLAW11931":"https://www.govinfo.gov/app/details/PLAW-119publ31"};
const NODES={"X14-NODE-HOUSE-APP":{"name":"House Committee on Appropriations","parent":"ORG-FED-LEG-HOUSE","chamber":"ORG-FED-LEG-HOUSE","kind":"standing_committee"},"X14-NODE-SENATE-APP":{"name":"Senate Committee on Appropriations","parent":"ORG-FED-LEG-SENATE","chamber":"ORG-FED-LEG-SENATE","kind":"standing_committee"},"X14-NODE-HOUSE-MILCON":{"name":"House Appropriations Subcommittee, Military Construction VA Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","kind":"appropriations_subcommittee"},"X14-NODE-SENATE-MILCON":{"name":"Senate Appropriations Subcommittee, Military Construction VA Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","kind":"appropriations_subcommittee"},"X14-NODE-HOUSE-CLERK-OPS":{"name":"House Clerk Office of Legislative Operations","parent":"ORG-FED-LEG-HOUSE","chamber":"ORG-FED-LEG-HOUSE","kind":"legislative_support_office"},"X14-NODE-SENATE-SECRETARY":{"name":"Secretary of Senate office","parent":"ORG-FED-LEG-SENATE","chamber":"ORG-FED-LEG-SENATE","kind":"legislative_support_office"},"X14-NODE-HOUSE-SPEAKER":{"name":"Speaker of House constitutional office","parent":"ORG-FED-LEG-HOUSE","chamber":"ORG-FED-LEG-HOUSE","kind":"chamber_constitutional_office"},"X14-NODE-SENATE-PRO-TEM":{"name":"President pro tempore constitutional Senate office","parent":"ORG-FED-LEG-SENATE","chamber":"ORG-FED-LEG-SENATE","kind":"chamber_constitutional_office"}};
const INSTRUMENTS={"X14-INSTR-ARTICLE-I":{"kind":"constitutional_text","source":"X14-SRC-CONSTITUTION"},"X14-INSTR-HOUSE-119":{"kind":"chamber_adopted_rules","source":"X14-SRC-HOUSE-RULES"},"X14-INSTR-SENATE-STANDING":{"kind":"chamber_continuing_rules","source":"X14-SRC-SENATE-RULES"},"X14-INSTR-HOUSE-DIRECTORY":{"kind":"publisher_directory_not_law","source":"X14-SRC-HOUSE-MILCON"},"X14-INSTR-SENATE-DIRECTORY":{"kind":"publisher_directory_not_law","source":"X14-SRC-SENATE-MILCON"},"X14-INSTR-CRS-PROCESS":{"kind":"nonbinding_congressional_research","source":"X14-SRC-CRS-R42843"},"X14-INSTR-PUBL11931":{"kind":"specific_enacted_law_metadata","source":"X14-SRC-PLAW11931"},"X14-INSTR-GPO-SLIP":{"kind":"government_publication_register","source":"X14-SRC-GOVINFO-LAWS"}};
const LINKS={"X14-REL-HOUSE-APP":{"from":"X14-NODE-HOUSE-APP","to":"ORG-FED-LEG-HOUSE","kind":"publisher_listed_chamber_committee","sources":["X14-SRC-HOUSE-COMMITTEES"]},"X14-REL-SENATE-APP":{"from":"X14-NODE-SENATE-APP","to":"ORG-FED-LEG-SENATE","kind":"senate_rules_and_directory_committee","sources":["X14-SRC-SENATE-RULES","X14-SRC-SENATE-MILCON"]},"X14-REL-HOUSE-SUB":{"from":"X14-NODE-HOUSE-MILCON","to":"X14-NODE-HOUSE-APP","kind":"publisher_listed_subcommittee","sources":["X14-SRC-HOUSE-MILCON"]},"X14-REL-SENATE-SUB":{"from":"X14-NODE-SENATE-MILCON","to":"X14-NODE-SENATE-APP","kind":"publisher_listed_subcommittee","sources":["X14-SRC-SENATE-MILCON"]},"X14-REL-HOUSE-CLERK":{"from":"X14-NODE-HOUSE-CLERK-OPS","to":"ORG-FED-LEG-HOUSE","kind":"publisher_listed_chamber_support","sources":["X14-SRC-HOUSE-CLERK"]},"X14-REL-SENATE-SECRETARY":{"from":"X14-NODE-SENATE-SECRETARY","to":"ORG-FED-LEG-SENATE","kind":"publisher_listed_chamber_support","sources":["X14-SRC-SENATE-SECRETARY"]},"X14-REL-HOUSE-SPEAKER":{"from":"X14-NODE-HOUSE-SPEAKER","to":"ORG-FED-LEG-HOUSE","kind":"constitutionally_named_office","sources":["X14-SRC-CONSTITUTION"]},"X14-REL-SENATE-PRO-TEM":{"from":"X14-NODE-SENATE-PRO-TEM","to":"ORG-FED-LEG-SENATE","kind":"constitutionally_named_office","sources":["X14-SRC-CONSTITUTION"]}};
const STAGES={"X14-STAGE-INTRO":"ORG-FED-LEG-HOUSE","X14-STAGE-HOUSE-REF":"ORG-FED-LEG-HOUSE","X14-STAGE-HOUSE-COM":"X14-NODE-HOUSE-APP","X14-STAGE-HOUSE-FLOOR":"ORG-FED-LEG-HOUSE","X14-STAGE-SENATE-REF":"ORG-FED-LEG-SENATE","X14-STAGE-SENATE-COM":"X14-NODE-SENATE-APP","X14-STAGE-SENATE-FLOOR":"ORG-FED-LEG-SENATE","X14-STAGE-RECONCILE":"ORG-FED-LEG-CONGRESS","X14-STAGE-IDENTICAL":"ORG-FED-LEG-CONGRESS","X14-STAGE-ENROLL":"X14-NODE-HOUSE-CLERK-OPS","X14-STAGE-PRESENT":"ORG-FED-EXE-PRESIDENT","X14-STAGE-DISPOSITION":"ORG-FED-EXE-PRESIDENT","X14-STAGE-OVERRIDE":"ORG-FED-LEG-CONGRESS","X14-STAGE-PUBLICATION":"ORG-FED-LEG-GPO"};
const TRANSITIONS={"X14-TRANS-INTRO-HOUSE-REF":{"from":"X14-STAGE-INTRO","to":"X14-STAGE-HOUSE-REF","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-HOUSE-REF-HOUSE-COM":{"from":"X14-STAGE-HOUSE-REF","to":"X14-STAGE-HOUSE-COM","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-HOUSE-COM-HOUSE-FLOOR":{"from":"X14-STAGE-HOUSE-COM","to":"X14-STAGE-HOUSE-FLOOR","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-HOUSE-FLOOR-SENATE-REF":{"from":"X14-STAGE-HOUSE-FLOOR","to":"X14-STAGE-SENATE-REF","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-SENATE-REF-SENATE-COM":{"from":"X14-STAGE-SENATE-REF","to":"X14-STAGE-SENATE-COM","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-SENATE-COM-SENATE-FLOOR":{"from":"X14-STAGE-SENATE-COM","to":"X14-STAGE-SENATE-FLOOR","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-SENATE-FLOOR-RECONCILE":{"from":"X14-STAGE-SENATE-FLOOR","to":"X14-STAGE-RECONCILE","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-RECONCILE-IDENTICAL":{"from":"X14-STAGE-RECONCILE","to":"X14-STAGE-IDENTICAL","condition":"requires_separate_house_and_senate_approval_of_identical_text"},"X14-TRANS-IDENTICAL-ENROLL":{"from":"X14-STAGE-IDENTICAL","to":"X14-STAGE-ENROLL","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-ENROLL-PRESENT":{"from":"X14-STAGE-ENROLL","to":"X14-STAGE-PRESENT","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-PRESENT-DISPOSITION":{"from":"X14-STAGE-PRESENT","to":"X14-STAGE-DISPOSITION","condition":"conditional_nonautomatic_procedure"},"X14-TRANS-DISPOSITION-PUBLICATION":{"from":"X14-STAGE-DISPOSITION","to":"X14-STAGE-PUBLICATION","condition":"only_if_constitutionally_enacted"},"X14-TRANS-DISPOSITION-OVERRIDE":{"from":"X14-STAGE-DISPOSITION","to":"X14-STAGE-OVERRIDE","condition":"only_if_veto_and_override_path_applicable"},"X14-TRANS-OVERRIDE-PUBLICATION":{"from":"X14-STAGE-OVERRIDE","to":"X14-STAGE-PUBLICATION","condition":"two_thirds_approval_both_chambers_and_enacted"}};
const PUBLISHED={"X14-OBS-PL11931-HOUSE":{"date":"2025-05-19","event":"house_passage","stage":"X14-STAGE-HOUSE-FLOOR"},"X14-OBS-PL11931-SENATE":{"date":"2025-07-15","event":"senate_passage","stage":"X14-STAGE-SENATE-FLOOR"},"X14-OBS-PL11931-APPROVAL":{"date":"2025-07-30","event":"presidential_approval","stage":"X14-STAGE-DISPOSITION"}};

function matches(records,anchors,label,project){
 assert(records.length===Object.keys(anchors).length&&unique(records.map(x=>x.id)),
   label+" bounded source record count or duplicate identity");
 for(const r of records)assert(Object.hasOwn(anchors,r.id)&&equal(project(r),anchors[r.id]),
  label+" publisher-anchored record altered "+r.id);
}
const coreNames=["sources","nodes","instruments","relationships","stages","transitions","observations","fiscal","history","coverage","gaps","views"];
export function validateINC14({manifest,schema,data,legislative,executive,x12scope,dod}){
 validateINC14Schema(schema,data);
 const ext=manifest?.congressional_enterprise_14_extension;
 assert(manifest?.release_status==="research_baseline_unratified"&&manifest.model_version==="0.1.0",
  "baseline ratification is prohibited");
 assert(ext?.id==="ARFI-FED-INC14-CONGRESS"&&ext.congress_number===119&&
  ext.research_observed_on==="2026-10-19"&&ext.status==="bounded_unratified_research"&&
  ext.new_institutional_observations===8&&ext.source_count===13&&ext.workflow_stages===14&&
  ext.specific_bill_history_points===3&&ext.complete_institutional_denominator_verified===false&&
  ext.all_chamber_rules_qualified===false&&ext.complete_enactment_chain_verified===false&&
  ext.legislative_control_means_executive_spending===false&&ext.adl1_certified_count===0,
  "manifest unsupported legislative authority or coverage promotion");
 for(const family of coreNames)
  assert(manifest.models.filter(x=>x===PREFIX+"x14-"+family+".json").length===1&&
   data[family]?.model_family==="inc14-"+family&&data[family]?.model_version==="0.1.0",
   "missing manifest-registered congress model "+family);
 const m=Object.fromEntries(coreNames.map(f=>[f,data[f].items]));
 assert(unique(Object.values(m).flat().map(x=>x.id)),"duplicate congressional identity");
 const can=new Map(legislative.map(x=>[x.id,x]));
 assert(can.size===9&&[HOUSE,SENATE,CONGRESS,"ORG-FED-LEG-GAO","ORG-FED-LEG-CBO","ORG-FED-LEG-GPO"].every(id=>can.has(id)),
  "existing nine canonical legislative references not preserved");
 assert(executive.some(x=>x.id==="ORG-FED-EXE-PRESIDENT"),
  "canonical President must be an executive and not congressional office");
 assert(x12scope?.family==="legislative"&&x12scope.canonical_selected_count===9&&
  x12scope.complete_current_first_level_denominator===null&&x12scope.adl1_certified_count===0,
  "historical INC12 legislative denominator or qualification tampered");
 matches(m.sources,SOURCES,"source locator",r=>r.url);
 const src=new Map(m.sources.map(x=>[x.id,x]));
 for(const s of m.sources)
  assert(s.observed_on==="2026-10-19"&&(s.edition_on===null||date(s.edition_on))&&
   /^https:\/\//.test(s.url)&&s.original_sha256===null&&s.original_custody_verified===false&&
   s.source_status==="official_publisher_locator_not_independent_legal_qualification",
   "unqualified original source or edition promoted "+s.id);
 matches(m.nodes,NODES,"institutional unit",r=>({
  name:r.name,parent:r.parent_id,chamber:r.chamber_id,kind:r.record_class}));
 const nodes=new Map(m.nodes.map(x=>[x.id,x]));
 const sourcesExist=x=>x.length>0&&unique(x)&&x.every(id=>src.has(id));
 for(const n of m.nodes){
  assert(sourcesExist(n.source_ids)&&n.observed_on==="2026-10-19"&&
   (ROOTS.has(n.parent_id)||nodes.has(n.parent_id))&&
   n.verified_current_complete_first_level===false&&
   n.independently_verified_role_incumbent===false&&
   n.executive_authority_implied===false&&n.adl1_certified===false,
   "office placement implies qualified officeholder, command or complete roster "+n.id);
  if(nodes.has(n.parent_id))assert(nodes.get(n.parent_id).chamber_id===n.chamber_id,
   "cross-chamber committee child "+n.id);
 }
 matches(m.instruments,INSTRUMENTS,"typed governing instrument",r=>({kind:r.instrument_kind,source:r.source_ids[0]}));
 for(const i of m.instruments)
  assert(i.source_ids.length===1&&src.has(i.source_ids[0])&&i.as_of==="2026-10-19"&&
   i.independently_qualified_current_legal_effect===false&&
   i.signed_operational_delegation_proven===false,
   "publisher directory promoted to enacted law or individual power "+i.id);
 matches(m.relationships,LINKS,"institutional relationship",r=>({
  from:r.from_id,to:r.to_id,kind:r.relation_kind,sources:r.source_ids}));
 for(const r of m.relationships)
  assert(nodes.has(r.from_id)&&r.to_id===nodes.get(r.from_id).parent_id&&
   sourcesExist(r.source_ids)&&r.observed_on==="2026-10-19"&&
   r.signed_delegation_verified===false&&r.supervision_power_verified===false&&
   r.executive_payment_authorized===false&&r.independent_legal_review_qualified===false,
   "committee placement falsely generates supervision, delegation, or spending "+r.id);
 assert(m.relationships.length===m.nodes.length&&m.nodes.every(n=>
  m.relationships.filter(r=>r.from_id===n.id).length===1),"missing original placement link");
 // 10 USC 101 definitional source is NOT a chamber rules or signed subpoena authority.
 assert(dod.length===4&&dod.every(x=>x.current_committee_rules_verified===false),
  "inherited DOD defense committee current rules were silently certified");
 matches(m.stages,STAGES,"process stage actor",r=>r.actor_ref_id);
 for(const s of m.stages)
  assert(s.workflow_id==="X14-FLOW-HOUSE-ORIGIN-PATTERN"&&
   sourcesExist(s.source_ids)&&s.stage_is_proposed_template===true&&
   s.completed_for_any_actual_bill===false&&s.actual_bill_event_id===null,
   "generic stage falsely recorded as a completed action "+s.id);
 matches(m.transitions,TRANSITIONS,"conditional flow transition",r=>({from:r.from_id,to:r.to_id,condition:r.condition}));
 const st=new Set(m.stages.map(x=>x.id));
 for(const t of m.transitions)
  assert(st.has(t.from_id)&&st.has(t.to_id)&&sourcesExist(t.source_ids)&&
   t.constitutes_legislative_enactment===false&&t.automatic_government_authorization===false&&
   t.specific_measured_bill_event===false,
   "process template transition promoted to an actual act "+t.id);
 assert(m.transitions.find(x=>x.id==="X14-TRANS-RECONCILE-IDENTICAL")?.condition===
  "requires_separate_house_and_senate_approval_of_identical_text"&&
  m.transitions.find(x=>x.id==="X14-TRANS-OVERRIDE-PUBLICATION")?.condition===
  "two_thirds_approval_both_chambers_and_enacted","enactment or override prerequisite missing");
 matches(m.observations,PUBLISHED,"real published legislative history",r=>({
  date:r.event_on,event:r.event_kind,stage:r.stage_id}));
 for(const r of m.observations)
  assert(r.measure_id==="HR1815-119"&&r.publisher_record_id==="PLAW-119publ31"&&
   r.source_ids.length===1&&r.source_ids[0]==="X14-SRC-PLAW11931"&&
   r.independent_journal_sequence_verified===false&&
   r.original_signed_action_evidence_verified===false&&
   r.committee_referral_proven===false&&r.appropriations_act_proven===false,
   "one published act cannot prove unrelated appropriations or full congressional events "+r.id);
 assert(m.fiscal.length===4&&unique(m.fiscal.map(x=>x.actor_ref_id)),"bounded fiscal viewpoints not unique");
 for(const f of m.fiscal)
  assert(sourcesExist(f.source_ids)&&f.specific_enacted_TAS_id===null&&
   f.appropriation_value_cents===null&&f.signed_executive_allotment===false&&
   f.obligation_verified===false&&f.payment_verified===false&&
   f.legislative_committee_cannot_disburse===true,
   "legislative appropriation conflated with VA executive obligation or payment "+f.id);
 assert(m.history.length===1&&m.history[0].event_on==="2025-01-03"&&
  m.history[0].source_ids[0]==="X14-SRC-HOUSE-HRES5"&&
  m.history[0].independent_original_rules_reconciliation===false&&
  m.history[0].committee_succession_inferred===false&&
  m.history[0].full_historical_chamber_roster_certified===false,
  "House rules history cannot fabricate current institutional succession");
 const c=m.coverage[0];
 assert(m.coverage.length===1&&c.congress_number===119&&
  c.canonical_selected_legislative_count===9&&c.source_sliced_institutional_units===m.nodes.length&&
  c.house_committee_pilot_count===1&&c.senate_committee_pilot_count===1&&
  c.source_sliced_subcommittee_count===2&&c.complete_chamber_office_denominator===null&&
  c.whole_congress_entity_denominator===null&&c.complete_119th_committee_roster_verified===false&&
  c.complete_staff_and_leadership_roster_verified===false&&
  c.fully_audited_specific_measure_workflows===0&&
  c.publisher_history_points===3&&c.adl1_certified_count===0&&
  c.independent_parliamentary_review_complete===false,
  "coverage denominator or legislative ADL1 prematurely promoted");
 assert(m.gaps.length===8&&unique(m.gaps.map(x=>x.id))&&
  m.gaps.every(g=>g.coverage_ref_id===c.id&&sourcesExist(g.source_ids)&&
   g.confirmed_resolved===false&&g.adl1_promotion_permitted===false&&
   g.independent_signoff===false),"evidence gaps suppressed");
 assert(m.views.length===4&&unique(m.views.map(x=>x.id))&&
  m.views.every(v=>ROOTS.has(v.root_id)&&v.source_commit_policy==="immutable_exact_sha"&&
   v.read_only===true&&v.complete_congress_scope_certified===false&&
   v.live_legislative_transaction_verified===false&&
   v.independent_legal_authority_certified===false&&v.adl1_certified===false&&
   v.model_display_nonbinding===undefined),
  "publication view asserts unqualified lawmaking or completeness");
 return {models:FAMILIES.length,sources:m.sources.length,
  new_units:m.nodes.length,process_stages:m.stages.length,conditional_transitions:m.transitions.length,
  published_history_points:m.observations.length,complete_denominator:null,adl1_count:0,
  unqualified_gaps:m.gaps.length};
}
export function projectINC14(snapshot,id){
 const m=Object.fromEntries(FAMILIES.map(f=>[f,snapshot.data[f].items]));
 const view=m.views.find(v=>v.id===id);assert(view,"unknown INC14 viewpoint "+id);
 const which=view.view_kind;
 const units=which==="institutional"?m.nodes.filter(n=>n.chamber_id===view.root_id):m.nodes;
 const relations=which==="institutional"?m.relationships.filter(r=>units.some(n=>n.id===r.from_id)):
  which==="workflow"?m.transitions:which==="fiscal"?m.fiscal:[];
 return {view,units,relationships:relations,source_records:m.sources,
  governing_instruments:m.instruments,
  unresolved_evidence_gaps:m.gaps,measure_history:m.observations,
  coverage:m.coverage[0],source_commit_policy:"immutable_exact_sha",
  qualified_legal_current_effect:false,verified_individual_authority:false,adl1_certified:false};
}
