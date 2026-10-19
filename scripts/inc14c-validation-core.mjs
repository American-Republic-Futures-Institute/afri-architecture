import fs from "node:fs";
export const FAMILIES=Object.freeze(["sources","units","denominators","rules","oversight","measure","actions","fiscal","crosswalks","history","gaps","views"]);
const PREFIX="model/federal/";
const SOURCES={"X14C-SRC-HOUSE-APP":"https://clerk.house.gov/committees/AP00","X14C-SRC-SENATE-APP":"https://www.appropriations.senate.gov/subcommittees","X14C-SRC-HOUSE-RULE-X":"https://rules.house.gov/sites/evo-subsites/rules.house.gov/files/documents/houserules119thupdated.pdf","X14C-SRC-SENATE-XXV-XXVI":"https://www.rules.senate.gov/rules-of-the-senate","X14C-SRC-HOUSE-V281":"https://clerk.house.gov/Votes/2025281","X14C-SRC-HOUSE-V285":"https://clerk.house.gov/Votes/2025285","X14C-SRC-SENATE-V616":"https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00616.htm","X14C-SRC-SENATE-V618":"https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00618.htm","X14C-SRC-GOVINFO-37":"https://www.govinfo.gov/app/details/PLAW-119publ37","X14C-SRC-GOVINFO-TEXT":"https://www.govinfo.gov/content/pkg/PLAW-119publ37/html/PLAW-119publ37.htm","X14C-SRC-HOUSE-HRES5":"https://rules.house.gov/resources","X14C-SRC-DOD-101":"https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title10-section101&num=0&edition=prelim","X14C-SRC-CONSTITUTION":"https://constitution.congress.gov/browse/article-1/","X14C-SRC-GAO":"https://www.gao.gov/about","X14C-SRC-CBO":"https://www.cbo.gov/about/overview"};
const UNITS={"X14C-UNIT-HOUSE-AGRICULTURE":{"name":"Agriculture, Rural Development, Food and Drug Administration, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-CJS":{"name":"Commerce, Justice, Science, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-DEFENSE":{"name":"Defense","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-ENERGY":{"name":"Energy and Water Development and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-FSGG":{"name":"Financial Services and General Government","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-HOMELAND":{"name":"Homeland Security","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-INTERIOR":{"name":"Interior, Environment, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-LHHS":{"name":"Labor, Health and Human Services, Education, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-LEGISLATIVE":{"name":"Legislative Branch","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14-NODE-HOUSE-MILCON":{"name":"Military Construction, Veterans Affairs, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-FOREIGN":{"name":"National Security, Department of State, and Related Programs","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-HOUSE-THUD":{"name":"Transportation, Housing and Urban Development, and Related Agencies","parent":"X14-NODE-HOUSE-APP","chamber":"ORG-FED-LEG-HOUSE","source":"X14C-SRC-HOUSE-APP"},"X14C-UNIT-SENATE-AGRICULTURE":{"name":"Agriculture, Rural Development, Food and Drug Administration, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-CJS":{"name":"Commerce, Justice, Science, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-DEFENSE":{"name":"Defense","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-ENERGY":{"name":"Energy and Water Development","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-FSGG":{"name":"Financial Services and General Government","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-HOMELAND":{"name":"Homeland Security","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-INTERIOR":{"name":"Interior, Environment, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-LHHS":{"name":"Labor, Health and Human Services, Education, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-LEGISLATIVE":{"name":"Legislative Branch","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14-NODE-SENATE-MILCON":{"name":"Military Construction, Veterans Affairs, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-FOREIGN":{"name":"State, Foreign Operations, and Related Programs","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"},"X14C-UNIT-SENATE-THUD":{"name":"Transportation, Housing and Urban Development, and Related Agencies","parent":"X14-NODE-SENATE-APP","chamber":"ORG-FED-LEG-SENATE","source":"X14C-SRC-SENATE-APP"}};
const RULES={"X14C-RULE-HOUSE-X-1":{"locator":"Rule X clause 1","kind":"subject_matter_jurisdiction","source":"X14C-SRC-HOUSE-RULE-X","chamber":"ORG-FED-LEG-HOUSE"},"X14C-RULE-HOUSE-X-2":{"locator":"Rule X clause 2","kind":"general_oversight_rule","source":"X14C-SRC-HOUSE-RULE-X","chamber":"ORG-FED-LEG-HOUSE"},"X14C-RULE-HOUSE-XI-2M":{"locator":"Rule XI clause 2(m)","kind":"committee_subpoena_procedure","source":"X14C-SRC-HOUSE-RULE-X","chamber":"ORG-FED-LEG-HOUSE"},"X14C-RULE-SENATE-XXV":{"locator":"Rule XXV","kind":"subject_matter_jurisdiction","source":"X14C-SRC-SENATE-XXV-XXVI","chamber":"ORG-FED-LEG-SENATE"},"X14C-RULE-SENATE-XXVI-1":{"locator":"Rule XXVI paragraph 1","kind":"committee_investigation_hearing_subpoena_framework","source":"X14C-SRC-SENATE-XXV-XXVI","chamber":"ORG-FED-LEG-SENATE"},"X14C-RULE-SENATE-XXVI-2":{"locator":"Rule XXVI paragraph 2","kind":"committee_rules_publication","source":"X14C-SRC-SENATE-XXV-XXVI","chamber":"ORG-FED-LEG-SENATE"},"X14C-RULE-SENATE-XXVI-8":{"locator":"Rule XXVI paragraph 8","kind":"legislative_oversight_with_exceptions","source":"X14C-SRC-SENATE-XXV-XXVI","chamber":"ORG-FED-LEG-SENATE"}};
const EVENTS={"X14C-ACTION-HOUSE-281":{"date":"2025-09-19","chamber":"ORG-FED-LEG-HOUSE","kind":"house_bill_passage","roll":281,"yeas":217,"nays":212,"source":"X14C-SRC-HOUSE-V281"},"X14C-ACTION-SENATE-616":{"date":"2025-11-10","chamber":"ORG-FED-LEG-SENATE","kind":"senate_substitute_amendment_agreed","roll":616,"yeas":60,"nays":40,"source":"X14C-SRC-SENATE-V616"},"X14C-ACTION-SENATE-618":{"date":"2025-11-10","chamber":"ORG-FED-LEG-SENATE","kind":"senate_passage_as_amended","roll":618,"yeas":60,"nays":40,"source":"X14C-SRC-SENATE-V618"},"X14C-ACTION-HOUSE-285":{"date":"2025-11-12","chamber":"ORG-FED-LEG-HOUSE","kind":"house_concurrence_in_senate_amendment","roll":285,"yeas":222,"nays":209,"source":"X14C-SRC-HOUSE-V285"},"X14C-ACTION-LAW-37":{"date":"2025-11-12","chamber":null,"kind":"presidential_approval_record","roll":null,"yeas":null,"nays":null,"source":"X14C-SRC-GOVINFO-37"}};
const HOUSE="ORG-FED-LEG-HOUSE",SENATE="ORG-FED-LEG-SENATE";
const err=s=>{throw Error("INC14C "+s)};
const check=(v,s)=>{if(!v)err(s)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const type=x=>x===null?"null":Array.isArray(x)?"array":typeof x;
const unique=a=>Array.isArray(a)&&a.length===new Set(a).size;
const sameIds=(records,anchors,label,project)=>{
 check(records.length===Object.keys(anchors).length&&unique(records.map(x=>x.id)),label+" count/duplicate identity");
 for(const r of records)check(Object.hasOwn(anchors,r.id)&&eq(project(r),anchors[r.id]),label+" source anchor changed "+r.id);
};
const refIds=(arr,ids)=>Array.isArray(arr)&&arr.length>0&&unique(arr)&&arr.every(x=>ids.has(x));
function verifyField(value,rule,location){
 if(Object.hasOwn(rule,"const"))check(eq(value,rule.const),"locked schema qualification "+location);
 if(rule.enum)check(rule.enum.some(v=>eq(v,value)),"enum "+location);
 if(rule.type)check([].concat(rule.type).includes(type(value)),"field type "+location);
 if(rule.minLength&&typeof value==="string")check(value.length>=rule.minLength,"empty field "+location);
 if(rule.pattern&&typeof value==="string")check(new RegExp(rule.pattern).test(value),"pattern "+location);
 if(Array.isArray(value)){
  if(rule.uniqueItems)check(unique(value),"duplicate list "+location);
  if(rule.items?.type)check(value.every(y=>type(y)===rule.items.type),"list values "+location);
 }
}
export function validateINC14CSchema(schema,data){
 check(schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&schema.oneOf?.length===12&&
 Object.keys(schema.$defs||{}).length===12,"schema registry");
 for(const fam of FAMILIES){
  const d=schema.$defs[fam],w=schema.oneOf.find(x=>x.properties?.model_family?.const==="inc14c-"+fam);
  check(d?.additionalProperties===false&&w?.additionalProperties===false&&
   eq([...d.required].sort(),Object.keys(d.properties).sort())&&
   w.properties?.items?.items?.$ref==="#/$defs/"+fam&&
   w.properties?.model_version?.const==="0.1.0","closed schema "+fam);
  for(const r of data[fam]){
   check(eq(Object.keys(r).sort(),[...d.required].sort()),"unexpected or missing field "+r.id);
   for(const [key,rule]of Object.entries(d.properties))verifyField(r[key],rule,r.id+"."+key);
  }
 }
}
export function validateINC14C({manifest,schema,data,legislative,priorUnits,priorCoverage,priorDOD}){
 const ext=manifest?.congressional_coverage_authority_14c_extension;
 check(manifest.model_version==="0.1.0"&&manifest.release_status==="research_baseline_unratified"&&
   ext?.id==="ARFI-FED-INC14C-CONGRESS"&&ext.congress===119&&ext.observed_on==="2026-10-19"&&
   ext.source_bounded_house_appropriations_subcommittees===12&&
   ext.source_bounded_senate_appropriations_subcommittees===12&&
   ext.official_roll_call_records===4&&ext.official_published_approval_records===1&&
   ext.complete_house_or_senate_institutional_denominator_verified===false&&
   ext.source_page_denominators_are_global===false&&
   ext.actual_complete_bill_route_verified===false&&
   ext.legal_effect_independently_qualified===false&&
   ext.enacted_law_means_executed_spending===false&&ext.adl1_certified_count===0&&
   ext.status==="source_bounded_unratified_research","manifest qualification");
 const d={};
 for(const f of FAMILIES){
  const path=PREFIX+"x14c-"+f+".json",v=data[f];
  check(manifest.models.filter(x=>x===path).length===1&&v?.model_version==="0.1.0"&&
   v?.model_family==="inc14c-"+f&&Array.isArray(v.items),"missing or duplicated family "+f);
  d[f]=v.items;
 }
 validateINC14CSchema(schema,d);
 check(unique(Object.values(d).flat().map(x=>x.id)),"global duplicate identity");
 const old=new Map(priorUnits.map(x=>[x.id,x])),can=new Map(legislative.map(x=>[x.id,x]));
 check(can.size===9&&can.has(HOUSE)&&can.has(SENATE)&&can.has("ORG-FED-LEG-GAO")&&can.has("ORG-FED-LEG-CBO")&&
  old.has("X14-NODE-HOUSE-APP")&&old.has("X14-NODE-SENATE-APP")&&
  old.has("X14-NODE-HOUSE-MILCON")&&old.has("X14-NODE-SENATE-MILCON")&&
  priorCoverage.length===1&&priorCoverage[0].whole_congress_entity_denominator===null&&
  priorCoverage[0].adl1_certified_count===0&&priorDOD.length===4&&
  priorDOD.every(x=>!x.current_committee_rules_verified),"canonical old identities or inherited gaps modified");
 sameIds(d.sources,SOURCES,"source locator",r=>r.url);
 const sources=new Set(d.sources.map(x=>x.id));
 for(const s of d.sources)check(s.observed_on==="2026-10-19"&&
  /^https:\/\//.test(s.url)&&s.original_sha256===null&&
  s.source_edition_bytes_archived===false&&
  s.current_rules_effect_independently_reviewed===false,"original source custody or legal review promoted");
 sameIds(d.units,UNITS,"Appropriations subcommittee",r=>({
  name:r.name,parent:r.parent_id,chamber:r.chamber_id,source:r.source_ids[0]}));
 for(const u of d.units){
  check(refIds(u.source_ids,sources)&&u.source_ids.length===1&&
   (u.chamber_id===HOUSE||u.chamber_id===SENATE)&&
   u.parent_id==="X14-NODE-"+u.chamber_id.split("-").at(-1)+"-APP"&&
   u.source_directory_relationship_only===true&&u.first_level_chamber_unit===false&&
   u.current_rules_jurisdiction_certified===false&&u.executive_supervision_inferred===false&&
   u.individually_executed_subpoena===false&&u.adl1_certified===false,
   "cross-chamber placement or unsupported subcommittee powers "+u.id);
  if(u.preexisting_canonical_id!==null)check(u.id===u.preexisting_canonical_id&&old.has(u.id),
   "MilCon VA canonical identity displaced");
  else check(!old.has(u.id),"new unit duplicated old identity");
 }
 check(d.denominators.length===2&&unique(d.denominators.map(x=>x.scope)),"source scope identity");
 for(const chamber of ["HOUSE","SENATE"]){
  const q=d.denominators.find(x=>x.id==="X14C-DENOM-"+chamber+"-APP");
  check(q?.congress===119&&q.scope==="X14-NODE-"+chamber+"-APP"&&
  q.denominator_kind==="publisher_page_listed_subcommittees"&&
  eq(q.source_ids,["X14C-SRC-"+chamber+"-APP"])&&
  q.observation_date==="2026-10-19"&&q.publisher_listing_count===12&&
  q.captured_identity_count===12&&q.covered_identity_count===12&&
  d.units.filter(x=>x.chamber_id==="ORG-FED-LEG-"+chamber).length===12&&
  q.source_page_bounded_listing_reconciled===true&&
  q.independently_archived_source_verified===false&&
  q.current_global_chamber_office_denominator===null&&
  q.complete_chamber_committee_roster_denominator===null&&
  q.complete_current_legal_roster_qualified===false&&q.adl1_certified_count===0,
  "source-specific page denominator promoted to congressional-wide census "+chamber);
 }
 sameIds(d.rules,RULES,"House/Senate procedural pinpoint",r=>({
  locator:r.locator,kind:r.rule_relation_kind,source:r.source_ids[0],chamber:r.chamber_id}));
 for(const r of d.rules)check(refIds(r.source_ids,sources)&&r.source_ids.length===1&&
  r.instrument_class==="chamber_adopted_or_continuing_rule"&&
  r.procedural_requirement_observed===true&&r.individual_action_executed===false&&
  r.legislative_jurisdiction_exhaustively_adjudicated===false&&
  r.executive_command_authorized===false&&r.current_effect_independently_reviewed===false,
  "chamber rule promoted to exercised powers "+r.id);
 const ruled=new Set(d.rules.map(x=>x.id));
 const actors=new Set([...can.keys(),...old.keys()]);
 check(d.oversight.length===6&&unique(d.oversight.map(x=>x.id)),"oversight records");
 for(const o of d.oversight)check(actors.has(o.actor_id)&&
  (o.rule_ref_id===null||ruled.has(o.rule_ref_id))&&refIds(o.source_ids,sources)&&
  o.specific_hearing_or_subpoena_record_id===null&&
  o.executive_supervision_proven===false&&o.subpoena_actually_issued===false&&
  o.independent_parliamentary_review_qualified===false,
  "oversight hearing/subpoena falsely executed "+o.id);
 check(d.measure.length===1&&d.measure[0].id==="X14C-MEASURE-HR5371"&&
  d.measure[0].bill_number==="H.R. 5371"&&d.measure[0].public_law==="119-37"&&
  d.measure[0].law_approved_on==="2025-11-12"&&
  d.measure[0].fiscal_year===2026&&d.measure[0].appropriations_division==="D"&&
  eq(d.measure[0].source_ids,["X14C-SRC-GOVINFO-37","X14C-SRC-GOVINFO-TEXT"])&&
  d.measure[0].enacted_division_D_text_identified===true&&
  d.measure[0].complete_legislative_action_chain_verified===false&&
  d.measure[0].committee_referral_chain_verified===false&&
  d.measure[0].enrolled_bytes_custodied===false&&
  d.measure[0].specific_TAS_allocation_verified===false&&
  d.measure[0].agency_obligation_or_payment_verified===false,
  "appropriations measure authority or action chain falsified");
 sameIds(d.actions,EVENTS,"official chamber vote or approval",r=>({
  date:r.action_on,chamber:r.chamber_id,kind:r.action_kind,roll:r.roll_call_number,
  yeas:r.yeas,nays:r.nays,source:r.source_ids[0]}));
 for(const a of d.actions)check(a.measure_id==="X14C-MEASURE-HR5371"&&
  refIds(a.source_ids,sources)&&a.source_ids.length===1&&
  a.action_question_verified_in_publisher===true&&
  a.enactment_inferred_from_single_vote===false&&a.committee_referral_verified===false&&
  a.original_binary_retained===false&&
  a.signed_presidential_instrument_independently_reconciled===false,
  "source-backed roll call converted into committee action or executive authority");
 check(d.fiscal.length===1&&d.fiscal[0].measure_id===d.measure[0].id&&
  eq(d.fiscal[0].source_ids,["X14C-SRC-GOVINFO-TEXT"])&&
  d.fiscal[0].fiscal_year===2026&&d.fiscal[0].division_id==="DIVISION D"&&
  d.fiscal[0].appropriations_authority_status==="enacted_published_division_D"&&
  d.fiscal[0].va_related_provisions_present===true&&
  ["specific_budget_account_TAS","enacted_account_amount_cents","apportionment_identifier",
  "signed_allotment_identifier","obligation_id","payment_id"].every(k=>d.fiscal[0][k]===null)&&
  d.fiscal[0].treasury_reconciliation_verified===false&&
  d.fiscal[0].authorized_executive_payment_inferred===false&&
  d.fiscal[0].fy2025_VA_lineage_misrepresented===false&&
  d.fiscal[0].independent_fiscal_legal_qualification===false,
  "fiscal authority confused with executive FY2026 cash execution");
 check(d.crosswalks.length===2&&
  d.crosswalks.every(x=>priorDOD.some(y=>y.id===x.source_definition_id&&
   y.parent_chamber_id===(x.id.includes("HOUSE")?HOUSE:SENATE))&&
   old.has(x.canonical_committee_node_id)&&
   x.statutorily_subject_classification_only===undefined&&
   x.statutory_subject_classification_only===true&&
   x.current_committee_rules_qualified===false&&
   x.subcommittee_jurisdiction_qualified===false&&x.executive_command_authorized===false),
  "DoD statutory naming becomes committee jurisdiction");
 check(d.history.length===1&&d.history[0].institutional_observation_on==="2026-10-19"&&
  d.history[0].comparative_prior_roster_available===false&&
  d.history[0].legal_succession_reconciliation_complete===false&&
  d.history[0].retired_unit_successors_certified===false&&
  d.history[0].directory_revision_hash_available===false&&
  d.history[0].independent_signed_original_custody===false,"historical successor promoted");
 check(d.gaps.length===8&&d.gaps.every(x=>refIds(x.source_ids,sources)&&
  x.resolved===false&&x.independent_signoff===false&&
  x.original_custody_qualified===false&&x.adl1_promotion_allowed===false),
  "human qualification or source custody gap suppressed");
 check(d.views.length===5&&d.views.every(v=>v.source_commit_policy==="exact_immutable_merge_commit"&&
  v.research_evidence_only===true&&v.full_congress_current_roster_claim===false&&
  v.adl1_certified===false&&v.automatic_legal_power===false&&
  v.actual_executive_outlay_claim===false),"publishing model makes unsupported authority claims");
 return {families:FAMILIES.length,source_records:d.sources.length,
 house_subcommittees:12,senate_subcommittees:12,
 bounded_denominators:2,procedural_rule_granules:d.rules.length,
 real_roll_calls:4,official_public_law_approval_records:1,
 source_scope_complete:true,whole_congress_complete:false,adl1_certified:0,
 unresolved_evidence_gaps:d.gaps.length,actual_executive_payments_verified:0};
}
export function projectINC14C(snapshot,viewId){
 const d=Object.fromEntries(FAMILIES.map(x=>[x,snapshot.data[x].items]));
 const v=d.views.find(x=>x.id===viewId);check(v,"unregistered view "+viewId);
 const house=viewId==="VIEW-X14C-HOUSE-ROSTER",senate=viewId==="VIEW-X14C-SENATE-ROSTER";
 const entities=house?d.units.filter(x=>x.chamber_id===HOUSE):
  senate?d.units.filter(x=>x.chamber_id===SENATE):
  viewId==="VIEW-X14C-RULES-OVERSIGHT"?[...d.rules,...d.oversight]:
  viewId==="VIEW-X14C-HR5371"?[...d.measure,...d.actions]:
  [...d.measure,...d.fiscal];
 return {view:v,units:entities,source_records:d.sources,
  coverage:d.denominators,qualification_gaps:d.gaps,
  research_only:true,adl1_certified:false,executive_payments_verified:0};
}
