// Holding-specific ARFI judicial precedent register validation.
// Original constitutional text is authoritative source material. A judicial holding is
// derivative law, not a new Amendment or express constitutional clause.
// This research index is NOT a comprehensive legal citator.
const list=x=>Array.isArray(x)?x:[];
const date=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x));
const kPaths={
 courts:"courts",sources:"sources",cases:"cases",holdings:"holdings",
 interpretations:"interpretations",treatments:"treatments",
 statusAssessments:"status-assessments",applicability:"applicability",viewpoints:"viewpoints"
};
const basisKinds=new Set(["constitutional_interpretation","federal_statutory_interpretation_with_constitutional_context"]);
const opinionRoles=new Set(["majority","unanimous","controlling_joint_opinion","per_curiam","controlling_plurality"]);
const relationships=new Set([
 "narrow_remedial_exception","repudiates_doctrine_in_defined_context",
 "reaffirms_and_applies","reaffirms_core_modifies_test","extends_doctrine",
 "reaffirms_and_extends","expressly_overrules"
]);
const classes=new Set([
 "expressly_overruled_on_modeled_holding","qualified_or_repudiated_in_defined_scope",
 "affirmed_or_developed_in_seeded_treatment","no_adverse_treatment_identified_in_seed_only"
]);
const overruling=new Set(["expressly_overrules"]);
const narrowing=new Set(["repudiates_doctrine_in_defined_context","narrow_remedial_exception"]);
const positive=new Set(["reaffirms_and_applies","extends_doctrine","reaffirms_and_extends","reaffirms_core_modifies_test"]);
const deriveClass=incoming=>incoming.some(x=>overruling.has(x.relationship_type))
 ?"expressly_overruled_on_modeled_holding"
 :incoming.some(x=>narrowing.has(x.relationship_type))
 ?"qualified_or_repudiated_in_defined_scope"
 :incoming.some(x=>positive.has(x.relationship_type))
 ?"affirmed_or_developed_in_seeded_treatment"
 :"no_adverse_treatment_identified_in_seed_only";
const valid=(x,fields,err)=>{for(const name of fields)if(!Object.hasOwn(x||{},name)||x[name]===undefined)err("Missing "+(x?.id||"record")+"."+name);};
const requiredIDs={
 "CASE-US-SCOTUS-MARBURY-1803":"1803-02-24",
 "CASE-US-SCOTUS-HANS-1890":"1890-03-03",
 "CASE-US-SCOTUS-BROWN-1954":"1954-05-17",
 "CASE-US-SCOTUS-COOPER-1958":"1958-09-12",
 "CASE-US-SCOTUS-ROE-1973":"1973-01-22",
 "CASE-US-SCOTUS-CHEVRON-1984":"1984-06-25",
 "CASE-US-SCOTUS-CASEY-1992":"1992-06-29",
 "CASE-US-SCOTUS-PRINTZ-1997":"1997-06-27",
 "CASE-US-SCOTUS-MURPHY-2018":"2018-05-14",
 "CASE-US-SCOTUS-DOBBS-2022":"2022-06-24",
 "CASE-US-SCOTUS-LOPER-BRIGHT-2024":"2024-06-28"
};
const requiredOverrules=[
 ["CASE-US-SCOTUS-DOBBS-2022","CASE-US-SCOTUS-ROE-1973"],
 ["CASE-US-SCOTUS-DOBBS-2022","CASE-US-SCOTUS-CASEY-1992"],
 ["CASE-US-SCOTUS-LOPER-BRIGHT-2024","CASE-US-SCOTUS-CHEVRON-1984"]
];
export function validateJudicialPrecedent(d){
 const errors=[],err=s=>errors.push(s),manifest=d.manifest||{},data=d.models||{},meta=manifest.judicial_precedent_extension||{};
 for(const [key,file] of Object.entries(kPaths)){
  if(data[key]?.model_version!=="0.1.0"||!Array.isArray(data[key]?.items))err("Invalid judicial register "+key);
  if(!list(manifest.models).includes("model/judicial/"+file+".json"))err("Missing judicial publication model "+file);
 }
 if(meta.review_status!=="initial_case_holding_index_not_citator_verified"||meta.seed_case_count!==18||meta.seed_holding_count!==20)
  err("Judicial publication claims unsupported citator completeness");
 const court=list(data.courts?.items),source=list(data.sources?.items),cases=list(data.cases?.items),holds=list(data.holdings?.items);
 const ints=list(data.interpretations?.items),treats=list(data.treatments?.items),st=list(data.statusAssessments?.items),apps=list(data.applicability?.items),views=list(data.viewpoints?.items);
 const courts=new Map(court.map(x=>[x.id,x])),src=new Map(source.map(x=>[x.id,x])),cs=new Map(cases.map(x=>[x.id,x])),hs=new Map(holds.map(x=>[x.id,x]));
 const prs=new Map(list(d.provisions).map(x=>[x.id,x])),nms=new Map(list(d.norms).map(x=>[x.id,x]));
 const actors=new Set([...list(d.actors).map(x=>x.id),...list(d.federalInstitutions).map(x=>x.id)]);
 const statuses=new Map(st.map(x=>[x.holding_id,x])),treatIds=new Set(treats.map(x=>x.id));
 const sourceCheck=o=>{
  for(const id of list(o.source_ids||o.opinion_source_ids||o.evidence_source_ids))if(!src.has(id))err("Unknown judicial source "+o.id+":"+id);
 };
 for(const [name,rows] of Object.entries({courts:court,sources:source,cases,holdings:holds,interpretations:ints,treatments:treats,status:st,applicability:apps,viewpoints:views})){
  const seen=new Set;
  for(const r of rows){
   if(!r?.id||seen.has(r.id))err("Duplicate or missing judicial "+name+" record "+r?.id);
   seen.add(r?.id);
   if(name!=="sources")sourceCheck(r);
  }
 }
 if(court.length<1||!courts.has("COURT-US-SCOTUS"))err("U.S. Supreme Court institutional register missing");
 for(const c of court){
  valid(c,["type","name","court_system","level","territorial_scope","vertical_precedential_role","jurisdiction_basis","source_ids","status"],err);
  if(c.type!=="judicial_court"||c.status!=="institutional_candidate_pending_legal_review")err("Court publication attributes an unreviewed institution "+c.id);
  if(c.id==="COURT-US-SCOTUS"&&(c.court_system!=="federal"||c.level!=="supreme_court"||c.vertical_precedential_role!=="last_resort_for_federal_question"))err("Supreme Court federal precedent rank altered");
  for(const id of list(c.jurisdiction_basis))if(!prs.has(id))err("Court institution references missing constitutional provision "+id);
 }
 for(const s of source){
  valid(s,["type","title","publisher","url","source_kind","source_scope","verification_status"],err);
  if(s.type!=="judicial_source"||!/^https:\/\//.test(s.url))err("Judicial source not traceable "+s.id);
  if(!["official_published_us_reports_opinion","official_supreme_court_opinion_pdf","official_explanatory_analysis_not_opinion"].includes(s.source_kind))err("Judicial source authority classification invalid "+s.id);
  if(s.source_kind==="official_published_us_reports_opinion"&&!s.url.startsWith("https://www.govinfo.gov/app/details/USREPORTS-"))err("Official United States Reports source not government publisher "+s.id);
  if(s.source_kind==="official_supreme_court_opinion_pdf"&&!s.url.startsWith("https://www.supremecourt.gov/opinions/"))err("Modern Court opinion not official PDF "+s.id);
  if(s.source_kind==="official_explanatory_analysis_not_opinion"&&s.date_decided)err("Commentary source misrepresented as Court opinion "+s.id);
 }
 if(cases.length<18||holds.length<20)err("Foundational judicial precedent inventory incomplete");
 for(const [id,day] of Object.entries(requiredIDs))if(cs.get(id)?.decided_on!==day)err("Judicial decision date or case missing "+id);
 for(const c of cases){
  valid(c,["type","name","decided_on","reporter_citation","court_id","decision_kind","subject_tags","opinion_source_ids","jurisdiction","court_authority_scope","opinion_text_review_status","source_as_of"],err);
  if(c.type!=="judicial_case"||!date(c.decided_on)||!courts.has(c.court_id)||c.opinion_text_review_status!=="indexed_official_opinion_summary_pending_human_review")err("Invalid case provenance or premature legal certification "+c.id);
  if(!list(c.opinion_source_ids).length)err("Missing primary case opinion "+c.id);
  for(const sid of list(c.opinion_source_ids)){
   const s=src.get(sid);
   if(!s||!["official_published_us_reports_opinion","official_supreme_court_opinion_pdf"].includes(s.source_kind)||s.date_decided!==c.decided_on||s.reporter_citation!==c.reporter_citation)
    err("Judicial case cites secondary material as controlling opinion or wrong decision date "+c.id);
  }
  if(c.court_id==="COURT-US-SCOTUS"&&c.court_authority_scope!=="final_us_supreme_court_federal_law_review_subject_to_controlling_holdings")err("Overbroad Supreme Court nationwide holding scope "+c.id);
 }
 const mapping=new Map;
 for(const h of holds){
  valid(h,["type","case_id","holding_summary","rule_summary","opinion_role","basis_kind","issue_scope","constitutional_provision_ids","constitutional_norm_ids","affected_actor_ids","review_status","opinion_source_ids","pinpoint_status"],err);
  const c=cs.get(h.case_id);
  if(h.type!=="judicial_holding"||!c||!opinionRoles.has(h.opinion_role)||!basisKinds.has(h.basis_kind)||h.review_status!=="preliminary_holding_summary_pending_human_legal_review")err("Unreviewed judicial holding or opinion role asserted controlling "+h.id);
  if(!list(h.constitutional_provision_ids).length||h.constitutional_provision_ids.length!==list(h.constitutional_norm_ids).length)err("Judicial holding constitutional text/norm links not paired "+h.id);
  if(!h.rule_summary||h.rule_summary.length<35)err("Judicial holding lacks bounded rule statement "+h.id);
  for(const id of list(h.affected_actor_ids))if(!actors.has(id))err("Judicial holding references nonexistent actor "+h.id+":"+id);
  for(const sid of list(h.opinion_source_ids))if(!c?.opinion_source_ids.includes(sid))err("Judicial holding cites unrelated case opinion "+h.id+":"+sid);
  if(h.pinpoint_status!=="full_opinion_indexed_pinpoint_not_verified"||h.opinion_section_reference!==null)err("Unverified legal opinion pinpoint asserted as precise "+h.id);
  const own=[];
  for(let i=0;i<h.constitutional_provision_ids.length;i++){
   const pid=h.constitutional_provision_ids[i],nid=h.constitutional_norm_ids[i];
   if(!prs.has(pid)||!nms.get(nid)?.provision_ids?.includes(pid))err("Judicial holding links unrelated constitutional norm "+h.id+":"+pid+":"+nid);
   own.push(pid+"|"+nid);
  }
  mapping.set(h.id,new Set(own));
 }
 if(ints.length<30)err("Judicial-to-constitution traceability incomplete");
 const byHolding=new Map;
 for(const i of ints){
  valid(i,["type","case_id","holding_id","constitutional_provision_id","constitutional_norm_id","relation_kind","derivative_status","created_by_case_decision_not_ratification","evidence_source_ids","review_status"],err);
  const h=hs.get(i.holding_id),k=i.constitutional_provision_id+"|"+i.constitutional_norm_id;
  if(i.type!=="judicial_constitutional_mapping"||!h||h.case_id!==i.case_id||!mapping.get(i.holding_id)?.has(k))err("Unsourced judicial doctrinal cross-reference "+i.id);
  if(i.derivative_status!=="opinion_sourced_judicial_interpretation_not_original_constitutional_text"||i.created_by_case_decision_not_ratification!==true||i.review_status!=="provisional_traceability_pending_legal_review")err("Judicial interpretation presented as express ratified constitutional text "+i.id);
  const expected=h?.basis_kind==="constitutional_interpretation"?"court_interprets_constitutional_provision":"constitutional_context_only_not_direct_textual_holding";
  if(i.relation_kind!==expected)err("Statutory holding falsely elevated to direct constitutional interpretation "+i.id);
  if(!list(i.evidence_source_ids).every(s=>h?.opinion_source_ids.includes(s)))err("Judicial doctrine claims unrelated opinion "+i.id);
  const seen=byHolding.get(i.holding_id)||[];seen.push(k);byHolding.set(i.holding_id,seen);
 }
 for(const h of holds){
  const pair=mapping.get(h.id)||new Set,actual=byHolding.get(h.id)||[];
  if(actual.length!==pair.size||new Set(actual).size!==pair.size)err("Judicial holding missing independently typed cross-Article link "+h.id);
 }
 if(treats.length<10)err("Seed treatment history missing");
 for(const t of treats){
  valid(t,["type","treating_case_id","treating_holding_id","treated_case_id","treated_holding_id","relationship_type","affected_issue_scope","qualified_effect","impact_kind","effective_on","review_status","source_ids","opinion_pinpoint_status","does_not_imply_whole_case_overruling","citations_as_legal_effect_not_original_text"],err);
  const newer=cs.get(t.treating_case_id),older=cs.get(t.treated_case_id);
  if(t.type!=="judicial_precedent_treatment"||!newer||!older||hs.get(t.treating_holding_id)?.case_id!==t.treating_case_id||hs.get(t.treated_holding_id)?.case_id!==t.treated_case_id)err("Precedent treatment references a wrong case holding "+t.id);
  if(!relationships.has(t.relationship_type)||!date(t.effective_on)||!newer||!older||t.effective_on!==newer.decided_on||t.effective_on<=older.decided_on||t.treating_case_id===t.treated_case_id)err("Precedent treatment chronology or polarity invalid "+t.id);
  if(t.review_status!=="opinion_based_treatment_pending_full_legal_review"||t.opinion_pinpoint_status!=="review_full_opinion_for_pinpoint"||t.citations_as_legal_effect_not_original_text!==true)err("Treatment falsely certified as comprehensive judicial authority "+t.id);
  if(t.does_not_imply_whole_case_overruling!==true)err("Holding-specific treatment erroneously generalized to case-wide overruling "+t.id);
  if((t.relationship_type==="expressly_overrules")!==(t.impact_kind==="overrides_defined_holding"))err("Judicial treatment effect polarity mislabeled "+t.id);
  for(const sid of list(t.source_ids))if(!newer?.opinion_source_ids.includes(sid))err("Judicial treatment source is not the later decision opinion "+t.id);
 }
 for(const [newer,older] of requiredOverrules){
  if(!treats.some(t=>t.treating_case_id===newer&&t.treated_case_id===older&&t.relationship_type==="expressly_overrules"))err("Missing express overruling "+newer+" -> "+older);
 }
 const caseToHold=slug=>holds.find(x=>x.case_id==="CASE-US-SCOTUS-"+slug)?.id;
 if(!treats.some(t=>t.treating_case_id==="CASE-US-SCOTUS-BROWN-1954"&&t.treated_case_id==="CASE-US-SCOTUS-PLESSY-1896"&&t.relationship_type==="repudiates_doctrine_in_defined_context"))err("Brown/Plessy educational limit flattened to case-wide reversal");
 if(!treats.some(t=>t.treating_case_id==="CASE-US-SCOTUS-EX-PARTE-YOUNG-1908"&&t.treated_case_id==="CASE-US-SCOTUS-HANS-1890"&&t.relationship_type==="narrow_remedial_exception"))err("State officer prospective relief exception removed from sovereign immunity doctrine");
 if(st.length!==holds.length)err("Missing holding-level status assessment");
 for(const s of st){
  valid(s,["type","holding_id","case_id","as_of","classification","modeled_treatment_ids","review_method","comprehensive_citator_review_completed","current_binding_effect_verified","assessment","caveat","legal_review_status","case_level_status_not_inferred"],err);
  const h=hs.get(s.holding_id),incoming=treats.filter(t=>t.treated_holding_id===s.holding_id);
  if(s.type!=="holding_precedential_status_assessment"||!h||s.case_id!==h.case_id||!classes.has(s.classification))err("Judicial status is not holding-specific "+s.id);
  if(s.as_of!=="2026-10-16"||s.comprehensive_citator_review_completed!==false||s.current_binding_effect_verified!==false||s.case_level_status_not_inferred!==true||s.legal_review_status!=="preliminary_unverified_beyond_seeded_sources")
   err("Incomplete legal citator wrongly claimed fully current controlling precedent "+s.id);
  if(s.review_method!=="curated_explicit_opinion_treatment_only"||!s.caveat?.includes("Do not represent absence of treatment"))err("Unsafe or missing uncertainty disclaimer "+s.id);
  if(s.classification!==deriveClass(incoming))err("Precedent status inconsistent with sourced subsequent holdings "+s.id);
  if(new Set(s.modeled_treatment_ids).size!==incoming.length||!incoming.every(t=>s.modeled_treatment_ids.includes(t.id)))err("Precedent status missing directed treatment edge "+s.id);
  for(const t of list(s.modeled_treatment_ids))if(!treatIds.has(t))err("Dangling treatment cited by precedent assessment "+s.id+":"+t);
 }
 if(apps.length!==holds.length||meta.applicability_count!==20)err("Holding-specific jurisdiction applicability inventory missing");
 const appMap=new Map(apps.map(a=>[a.holding_id,a]));
 for(const a of apps){
  valid(a,["type","holding_id","case_id","court_id","legal_question_family","judiciary_systems_to_consider","territorial_scope","precedential_role","government_addressee_actor_ids","bounded_issue_scope","precedential_status_id","binding_status","scope_note","source_ids","review_status","as_of"],err);
  const h=hs.get(a.holding_id),ca=cs.get(a.case_id),assessment=statuses.get(a.holding_id);
  if(!h||h.case_id!==a.case_id||ca?.court_id!==a.court_id||!assessment||a.precedential_status_id!==assessment.id||h.issue_scope!==a.bounded_issue_scope)
   err("Judicial holding jurisdiction or precedent projection has wrong identity "+a.id);
  if(a.type!=="judicial_holding_applicability"||a.territorial_scope!=="United States"||a.precedential_role!=="supreme_court_precedent_on_federal_question_subject_to_controlling_scope"||a.review_status!=="scope_candidate_pending_legal_review")
   err("Judicial applicability claims unsupported blanket nationwide precedent "+a.id);
  if(a.as_of!=="2026-10-16"||a.scope_note?.length<50)err("Judicial jurisdiction lacks dated factual or issue-specific limits "+a.id);
  if(JSON.stringify(a.judiciary_systems_to_consider)!=='["federal","state"]')err("U.S. Supreme Court's federal question reach incorrectly scoped "+a.id);
  const statutory=h?.basis_kind==="federal_statutory_interpretation_with_constitutional_context";
  if(a.legal_question_family!==(statutory?"federal_statutory_review_with_article_iii_context":"federal_constitutional_question"))
   err("Statutory precedent mistaken for a ratified constitutional rule "+a.id);
  if(new Set(a.government_addressee_actor_ids).size!==new Set(h?.affected_actor_ids||[]).size||!list(h?.affected_actor_ids).every(x=>a.government_addressee_actor_ids.includes(x)))
   err("Judicial precedent binding actor scope expanded or changed "+a.id);
  const expected=assessment?.classification==="expressly_overruled_on_modeled_holding"?"superseded_modeled_holding_not_current_controlling":"not_certified_current_controlling_pending_citator_review";
  if(a.binding_status!==expected)err("Overruled or unverified holding improperly labeled currently binding "+a.id);
 }
 for(const h of holds)if(!appMap.has(h.id))err("Holding missing federal/State scope assessment "+h.id);
 for(const v of views){
  valid(v,["type","name","case_topic_filters","constitutional_root_ids","include_holdings","include_judicial_treatment","include_status_assessments","scope","review_status","publication_owner"],err);
  if(v.type!=="judicial_precedent_viewpoint"||v.review_status!=="candidate_viewpoint_no_renderer"||v.publication_owner!=="afri-website")err("Judicial viewpoint incorrectly implies website-renderer ownership "+v.id);
  for(const pid of list(v.constitutional_root_ids))if(!prs.has(pid))err("Judicial viewpoint unknown constitutional root "+v.id+":"+pid);
 }
 return {errors,counts:{courts:court.length,official_opinion_sources:source.filter(s=>s.source_kind!=="official_explanatory_analysis_not_opinion").length,supporting_sources:source.filter(s=>s.source_kind==="official_explanatory_analysis_not_opinion").length,cases:cases.length,holdings:holds.length,constitutional_links:ints.length,treatments:treats.length,status_assessments:st.length,applicability:apps.length,viewpoints:views.length},review_status:"initial_precedent_index_pending_human_legal_and_comprehensive_citator_review"};
}
