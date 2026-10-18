// ARFI INC-05: pure source-bounded constitutional / federal authority crosswalk verifier.
// Passing this verifier establishes model integrity, never legal or operational authority.
const names=["sources","statutes","functions","gates","relationships","traces"];
const expected={sources:5,statutes:5,functions:4,gates:9,relationships:27,traces:3};
const EXPECTED_SOURCES={
 "SRC-X05-31-1301":"https://uscode.house.gov/us/usc/119-120/t31/s1301/",
 "SRC-X05-31-1341":"https://uscode.house.gov/us/usc/119-120/t31/s1341/",
 "SRC-X05-31-1501":"https://uscode.house.gov/us/usc/119-120/t31/s1501/",
 "SRC-X05-28-1331":"https://uscode.house.gov/us/usc/119-118/t28/s1331/",
 "SRC-X05-28-1254":"https://uscode.house.gov/us/usc/119-118/t28/s1254/"
};
const legalRoot={I:"CONST-US-ART-01-SEC-09-CL-07",II:"CONST-US-ART-02-SEC-02-CL-01",III:"CONST-US-ART-03-SEC-02-CL-01"};
const lawfulType=new Set([
 "constitutional_fiscal_allocation","constitutional_spending_condition_context","legislative_fiscal_framework_context",
 "limits_expenditure_purpose","limits_expenditure_and_obligation","requires_documentary_evidence",
 "audit_and_oversight_research_context","requires_specific_funding_instrument",
 "constitutional_commander_in_chief_role","constitutional_take_care_duty","presidential_direction_statutory_context",
 "civilian_statutory_role_scope","scoped_statutory_direction_function","conditional_combatant_chain_context",
 "descriptive_functional_alignment","requires_current_command_evidence",
 "illustrative_judicial_separation_of_powers_context","judicial_vesting_constitutional_context",
 "constitutional_judicial_subject_matter_context","statutory_federal_question_jurisdiction",
 "federal_question_function_context","court_of_appeals_review_source_context",
 "statutory_supreme_court_review_route","appellate_functional_context",
 "judicial_review_doctrine_context","standing_doctrine_research_context",
 "requires_appellate_procedural_gate"
]);
const list=x=>Array.isArray(x)?x:[];
const nonempty=x=>typeof x==="string"&&x.trim().length>0;
export function validateX05({manifest,collections,records,sourceRecords}){
 const errors=[],fail=s=>errors.push(s);
 const meta=manifest?.constitutional_authority_crosswalk_05_extension||{};
 if(meta.id!=="ARFI-COA-INC05-001"||meta.trace_count!==3||meta.relationship_count!==27||
  meta.independent_legal_review_complete!==false||meta.case_specific_operational_authority_verified!==false||
  meta.enacted_account_specific_appropriation_verified!==false||meta.qualified_website_publication!==false)
  fail("INC05 release or approval metadata unexpectedly qualified");
 const data={};
 for(const n of names){
  if(!list(manifest?.models).includes("model/federal/x05-"+n+".json"))fail("INC05 manifest omitted "+n);
  data[n]=list(collections?.[n]?.items);
  if(collections?.[n]?.model_version!=="0.1.0"||data[n].length!==expected[n])fail("INC05 collection count/version "+n);
 }
 const own=new Map();
 for(const n of names)for(const item of data[n]){
  if(!item||!/^((SRC-X05|X05)-(?:[A-Z0-9-]+))$/.test(item.id||""))fail("INC05 invalid identity "+n);
  if(own.has(item.id))fail("INC05 duplicate record "+item.id);
  if(records?.has(item.id)&&!(n==="sources"))fail("INC05 ID collision with canonical model "+item.id);
  own.set(item.id,item);
 }
 const sourceMap=new Map([...(sourceRecords||new Map()),...data.sources.map(s=>[s.id,s])]);
 for(const s of data.sources){
  if(EXPECTED_SOURCES[s.id]!==s.url||s.publisher!=="Office of the Law Revision Counsel, U.S. House of Representatives"||
   s.original_bytes_archived!==false||s.qualified_current_effective_law_review!==false||
   s.source_status!=="official_display_reference_not_immutable_custody")fail("INC05 source spoofing or custody overclaim "+s.id);
 }
 const all=new Map([...(records||new Map()),...own]);
 const refs=(item)=>{
  if(!list(item.source_ids).length)fail("INC05 missing provenance "+item.id);
  for(const id of list(item.source_ids))if(!sourceMap.has(id)||!/^https:\/\//.test(sourceMap.get(id)?.url||""))fail("INC05 unrecognized evidence "+item.id+" -> "+id);
 };
 for(const law of data.statutes){
  if(law.type!=="source_bounded_statutory_instrument"||
    !list(law.source_ids).includes(law.id.replace("X05-LAW-","SRC-X05-"))||
    law.enacted_statute_exists_as_cited!==true||law.transaction_or_individual_case_authority_verified!==false||
    law.current_asof_comprehensive_citator!==false)fail("INC05 statute fabricated permission "+law.id);
  refs(law);
 }
 for(const func of data.functions){
  if(func.verified_spending_authority!==false||func.review_status!=="source_bounded_research")
   fail("INC05 functional research upgraded to execution "+func.id);
  refs(func);
 }
 for(const gate of data.gates){
  if(gate.type!=="unsatisfied_independent_review_gate"||gate.satisfied!==false||
   gate.waived!==false||gate.approved_at!==null||gate.evidence_sha256!==null)
   fail("INC05 unresolved legal gate silently certified "+gate.id);
  refs(gate);
 }
 const byTrace=new Map(data.traces.map(x=>[x.id,x]));
 if(new Set(byTrace.keys()).size!==3||["I","II","III"].some(a=>!byTrace.has("X05-TRACE-"+a)))
  fail("INC05 three Article exemplar traces absent");
 for(const t of data.traces){
  refs(t);
  if(t.primary_provision_id!==legalRoot[t.article]||t.id!=="X05-TRACE-"+t.article)
   fail("INC05 constitutional Article context invalid "+t.id);
  for(const flag of ["qualified_legal_citator_complete","individual_delegation_verified","enacted_program_appropriation_verified","case_specific_remedy_verified","institutional_publication_certified"])
   if(t[flag]!==false)fail("INC05 trace asserts certified government authority "+t.id+"."+flag);
  if(t.review_status!=="source_bounded_research_pending_qualified_legal_review"||
    t.claim_status!=="not_case_specific_or_operational_authority")fail("INC05 trace status upgraded "+t.id);
  if(!all.has(t.primary_provision_id)||!all.has(t.subject_institution_id))fail("INC05 trace root/actor missing "+t.id);
  if(list(t.stages).length!==6||t.stages.map(s=>s.id).join(",")!=="constitution,actor,law,office,function,oversight")
   fail("INC05 six authority stages missing "+t.id);
  const scope=new Set();
  for(const s of list(t.stages)){
   if(!list(s.record_ids).length||!nonempty(s.title)||!nonempty(s.note))fail("INC05 empty authority stage "+t.id+"/"+s.id);
   for(const rid of list(s.record_ids)){
    scope.add(rid);
    if(!all.has(rid))fail("INC05 unresolvable canonical record "+t.id+" -> "+rid);
   }
  }
  const gateset=new Set(t.gate_ids);
  if(gateset.size!==3||list(t.gate_ids).some(id=>!all.has(id)||!scope.has(id)))fail("INC05 unbound or omitted legal gate "+t.id);
  const relset=new Set(t.relation_ids);
  const actual=data.relationships.filter(e=>e.trace_id===t.id);
  if(relset.size!==actual.length||actual.length<8||actual.some(e=>!relset.has(e.id)))
   fail("INC05 relationships missing from exemplar "+t.id);
  for(const e of actual){
   if(!scope.has(e.from_id)||!scope.has(e.to_id)||!all.has(e.from_id)||!all.has(e.to_id))
    fail("INC05 relationship escapes supported Article scope "+e.id);
   if(!lawfulType.has(e.relationship_type)||e.type!=="cross_domain_authority_reference_relation"||
      e.assertion_status!=="source_bounded_descriptive_relationship_unratified"||
      e.current_operational_authority_asserted!==false||e.individual_delegation_verified!==false||
      e.appropriation_verified!==false)fail("INC05 unauthorized legal inference "+e.id);
   for(const g of list(e.qualification_gate_ids))if(!gateset.has(g))fail("INC05 unrelated legal condition "+e.id);
   refs(e);
  }
 }
 // Domain-specific compulsory safeguards (a research trace must never hide these).
 const required={
 I:["X05-LAW-31-1301","X05-LAW-31-1341","X05-LAW-31-1501","X05-GATE-APPROPRIATION","X05-GATE-OBLIGATION"],
 II:["DOD-PROV-10-113-B","DOD-PROV-10-162-B","DOD-ROLE-SECDEF","X05-GATE-DOD-DELEGATION","X05-GATE-DOD-COMMAND"],
 III:["X05-LAW-28-1331","X05-LAW-28-1254","HOLD-US-SCOTUS-MARBURY-1803-01","HOLD-US-SCOTUS-LUJAN-1992-01","X05-GATE-JUSTICIABILITY"]
 };
 for(const [area,ids] of Object.entries(required)){
  const t=byTrace.get("X05-TRACE-"+area),inView=new Set(list(t?.stages).flatMap(s=>list(s.record_ids)));
  for(const id of ids)if(!inView.has(id))fail("INC05 mandatory authority/qualification omitted "+area+" -> "+id);
 }
 // Preserved existing Article and Amendment identities + historical boundaries.
 const constitutional=[...(records?.values()||[])].filter(x=>x.type==="constitutional_provision");
 if(constitutional.filter(x=>x.unit==="article").length!==7||
  constitutional.filter(x=>x.unit==="amendment").length!==27||
  constitutional.find(x=>x.id==="CONST-US-ART-07")?.effect_status!=="expired")
   fail("INC05 original constitutional integrity violated");
 return {errors,counts:{traces:data.traces.length,relationships:data.relationships.length,gates:data.gates.length,sourceReferences:data.sources.length,statutes:data.statutes.length,functions:data.functions.length}};
}
