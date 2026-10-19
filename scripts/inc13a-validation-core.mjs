// INC-13A: generic federal ADL-1 structural research and qualification boundary.
// This validator never issues a legal, institutional or architectural certification.
export const BASELINE="e4252ff4e81d9b4aae52ec930a52588b61ad13ee";
export const GATE_NAMES=Object.freeze(["SCOPE","SOURCE","COHORT","STATUTE","FUNCTIONS","HISTORICAL","HUMAN","CUSTODY","AUDIT"]);
export const PILOT_NAMES=Object.freeze(["DEFENSE","JUSTICE","VA"]);
export const RELATION_CLASSES=Object.freeze([
 "source_observed_placement","statutory_composition","administrative_supervision",
 "delegated_authority","operational_command","independent_oversight",
 "adjudicative_jurisdiction","historical_succession"
]);
const uniq=xs=>Array.isArray(xs)&&new Set(xs).size===xs.length;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const kind=v=>v===null?"null":Array.isArray(v)?"array":typeof v;
const date=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&
 !Number.isNaN(Date.parse(v))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
const byId=(a)=>new Map((a||[]).map(x=>[x.id,x]));
const fail=(errors,message)=>errors.push("INC13A "+message);
const gateId=name=>"X13A-GATE-"+name;
const docPath=name=>"model/federal/inc13a-"+name+".json";
const canonId=name=>"ORG-FED-EXE-DEP-"+name;
const sourceEdition=s=>s?.edition_date||s?.edition||s?.as_of||s?.revision_id||null;
const sourceObserved=s=>s?.observed_on||s?.accessed_on||s?.retrieved_on||null;

// A defined, closed Draft-2020-12 subset. This is not a full JSON Schema engine.
function ruleCheck(value,rule,path,defs,errors){
 if(!rule||typeof rule!=="object"){fail(errors,path+" missing schema rule");return;}
 if(rule.$ref){
  const key=rule.$ref.split("/").at(-1),definition=defs[key];
  if(!definition)fail(errors,path+" unresolved definition "+key);
  else ruleCheck(value,definition,path,defs,errors);
  return;
 }
 if(Object.hasOwn(rule,"const")&&!Object.is(value,rule.const))fail(errors,path+" schema const mismatch");
 if(rule.enum&&!rule.enum.some(x=>eq(x,value)))fail(errors,path+" schema enum violation");
 if(rule.type&&![].concat(rule.type).includes(kind(value)))fail(errors,path+" schema type mismatch");
 if(rule.pattern&&typeof value==="string"&&!new RegExp(rule.pattern).test(value))fail(errors,path+" schema pattern violation");
 if(rule.minLength!==undefined&&typeof value==="string"&&value.length<rule.minLength)fail(errors,path+" empty source metadata");
 if(rule.type==="object"&&kind(value)==="object"){
  for(const p of rule.required||[])if(!Object.hasOwn(value,p))fail(errors,path+" missing "+p);
  for(const [k,v]of Object.entries(value)){
   if(!Object.hasOwn(rule.properties||{},k)){
    if(rule.additionalProperties===false)fail(errors,path+" unknown property "+k);
   }else ruleCheck(v,rule.properties[k],path+"."+k,defs,errors);
  }
 }
 if(rule.type==="array"&&Array.isArray(value)){
  if(value.length<(rule.minItems||0)||value.length>(rule.maxItems??Number.POSITIVE_INFINITY))
   fail(errors,path+" schema array cardinality");
  if(rule.uniqueItems&&new Set(value.map(JSON.stringify)).size!==value.length)
   fail(errors,path+" duplicated schema array value");
  for(let i=0;i<value.length;i++)if(rule.items)ruleCheck(value[i],rule.items,path+"["+i+"]",defs,errors);
 }
}
export function inspectINC13ASchema(schema,models){
 const errors=[];
 const names=["gate","gate_result","relationship_claim","pilot"];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
   schema.oneOf?.length!==2||!eq(Object.keys(schema.$defs||{}).sort(),[...names].sort()))
  fail(errors,"invalid closed schema registry");
 for(const name of names){
  const rule=schema?.$defs?.[name];
  if(rule?.type!=="object"||rule.additionalProperties!==false||
    !eq([...(rule.required||[])].sort(),Object.keys(rule.properties||{}).sort()))
   fail(errors,"schema definition not closed "+name);
 }
 for(const name of ["gates","pilots"]){
  const family="inc13a-"+name,rule=schema?.oneOf?.find(x=>x.properties?.model_family?.const===family);
  if(!rule||rule.type!=="object"||rule.additionalProperties!==false||
    !eq([...(rule.required||[])].sort(),Object.keys(rule.properties||{}).sort())||
    rule.properties?.items?.items?.$ref!=="#/$defs/"+(name==="gates"?"gate":"pilot"))
   fail(errors,"schema envelope not closed "+name);
  if(rule)ruleCheck(models?.[name],rule,name,schema.$defs||{},errors);
 }
 return errors;
}
export function validateINC13A(input){
 const errors=[];
 const {manifest,schema,models,legacyGates,inc12,canonical,snapshots}=input;
 errors.push(...inspectINC13ASchema(schema,models));
 const ext=manifest?.federal_adl1_qualification_13a_extension;
 if(manifest?.release_status!=="research_baseline_unratified"||
   ext?.id!=="ARFI-FED-INC13A-ADL1-QUALIFICATION"||
   ext?.model_version!=="0.1.0"||ext?.source_baseline_commit!==BASELINE||
   ext?.qualification_gates!==9||ext?.research_pilot_departments!==3||
   ext?.certified_institutions!==0||ext?.independent_decision_verified!==false||
   ext?.complete_first_level_denominators_qualified!==false||
   ext?.website_publication_enabled!==false)
  fail(errors,"manifest falsely certifies ADL1 or changes qualification scope");
 for(const name of ["gates","pilots"]){
  if(manifest?.models?.filter(x=>x===docPath(name)).length!==1||
    models?.[name]?.model_family!=="inc13a-"+name||
    models?.[name]?.model_version!=="0.1.0"||
    !Array.isArray(models?.[name]?.items))
   fail(errors,"missing registered model "+name);
 }
 if(manifest?.federal_institutional_census_reconciliation_12_extension?.first_level_adl1_certification!==false||
   manifest?.federal_operational_custody_04f_extension?.VA_ADL1_certified!==false)
  fail(errors,"INC12/04F source baselines claim unexpected institutional certification");
 if(inc12?.scopes?.items?.some(s=>s.adl1_certified_count!==0||
   s.complete_current_first_level_denominator!==null||
   s.official_federal_population_denominator!==null))
  fail(errors,"INC12 bounded source scopes changed ADL1 or denominator semantics");
 const gates=models?.gates?.items||[],pilotRows=models?.pilots?.items||[];
 const expectedGates=GATE_NAMES.map(gateId);
 if(gates.length!==9||!uniq(gates.map(x=>x.id))||
   !eq(gates.map(x=>x.id),expectedGates))
  fail(errors,"exact nine ordered qualification gates required");
 const legacy=byId(legacyGates?.items);
 for(const name of GATE_NAMES){
  const g=gates.find(x=>x.id===gateId(name));
  const old=legacy.get("E04E-QUAL-"+name);
  if(!g||g.va04e_precedent_gate_id!=="E04E-QUAL-"+name||
    g.mandatory!==true||g.effect!=="prerequisite_only_not_automatic_ADL1_certification"||
    !g.required_evidence?.trim()||!g.review_role?.trim()||
    !old||old.status!=="not_met"||old.verified!==false||
    old.waived!==false||old.independent_reviewer_id!==null)
   fail(errors,"unreconciled VA INC04E precedent and nonwaivable gate "+name);
 }
 const expectedPilots=PILOT_NAMES.map(x=>"X13A-PILOT-"+x);
 if(pilotRows.length!==3||!uniq(pilotRows.map(x=>x.id))||
    !eq(pilotRows.map(x=>x.id),expectedPilots))
  fail(errors,"three bounded department pilots must retain stable identities");
 const canonicalById=byId(canonical?.items);
 const identityById=byId(inc12?.identities?.items);
 const observations=inc12?.observations?.items||[];
 const observationById=byId(observations);
 const observationBySourceRecord=new Map(observations.map(x=>[x.source_record_id,x]));
 const snapshotMap=byId(snapshots);
 const sourceIds=new Set(observations.flatMap(x=>x.source_ids||[]));
 const globalClaims=new Set();
 const owner=obs=>{
  const seen=new Set();
  let node=obs;
  while(node&&!seen.has(node.id)){
   seen.add(node.id);
   const parent=node.observed_parent_id;
   if(typeof parent==="string"&&parent.startsWith("ORG-FED-EXE-DEP-"))return parent;
   node=observationBySourceRecord.get(parent)||observationById.get(parent);
  }
  return null;
 };
 for(const name of PILOT_NAMES){
  const p=pilotRows.find(x=>x.id==="X13A-PILOT-"+name);
  if(!p)continue;
  const canonicalID=canonId(name),id=identityById.get("X12-IDENTITY-"+canonicalID);
  const parent=canonicalById.get(canonicalID);
  if(p.canonical_department_id!==canonicalID||
    p.census_identity_id!==id?.id||id?.canonical_id!==canonicalID||
    id?.adl1_certified!==false||id?.present_day_structure_complete!==false||
    p.source_baseline_commit!==BASELINE||
    parent?.kind!=="executive_department"||parent?.branch_id!=="BR-FED-EXE")
   fail(errors,"department identity or pinned census evidence mismatch "+name);
  if(p.scope!=="bounded_first_level_structural_qualification_pilot"||
    p.complete_first_level_denominator!==null||p.denominator_qualified!==false||
    p.independent_legal_review_complete!==false||p.adl1_certified!==false||
    p.certification_decision_id!==null||
    p.review_state!=="research_only_pending_independent_review"||
    (p.as_of_effective_date!==null&&!date(p.as_of_effective_date)))
   fail(errors,"unearned structural completeness, dated authority or certificate "+name);
  const results=p.gate_results||[];
  if(results.length!==9||!uniq(results.map(x=>x.gate_id))||
     !eq(results.map(x=>x.gate_id),expectedGates))
   fail(errors,"missing or duplicate mandatory qualification results "+name);
  for(const g of results){
   if(!g.gap?.trim()||!["not_met","under_review"].includes(g.status)||
     !Array.isArray(g.evidence_refs)||!uniq(g.evidence_refs)||
     g.evidence_refs.some(x=>!sourceIds.has(x))||
     g.reviewer_id!==null||g.reviewed_at!==null||g.review_decision_id!==null||
     (g.status==="under_review"&&g.evidence_refs.length===0))
    fail(errors,"forged gate completion, reviewer or unknown source evidence "+name+":"+g.gate_id);
  }
  for(const rel of p.research_relationships||[]){
   if(globalClaims.has(rel.id))fail(errors,"duplicated research relation "+rel.id);
   globalClaims.add(rel.id);
   const obs=observationById.get(rel.source_observation_id);
   const s=snapshotMap.get(rel.source_snapshot_id);
   const resolvedParent=obs?observationBySourceRecord.get(obs.observed_parent_id)?.id||
     obs.observed_parent_id:null;
   if(!obs||owner(obs)!==canonicalID||
     rel.subject_id!==obs.id||rel.object_id!==resolvedParent||
     rel.original_source_record_id!==obs.source_record_id||
     rel.original_relation_id!==obs.relation_source_id||
     rel.original_source_relation_type!==obs.relation_type||
     rel.source_snapshot_id!==obs.source_snapshot_id||
     !eq(rel.source_ids,obs.source_ids)||!s||
     rel.source_edition_label!==sourceEdition(s)||
     rel.source_observed_on!==sourceObserved(s)||
     !date(rel.source_observed_on))
    fail(errors,"untraceable relation/source/edition/parent "+rel.id);
   if(rel.relation_class!=="source_observed_placement"||
     rel.legal_effect!=="none_certified"||
     rel.review_state!=="research_only_unreviewed"||
     rel.independent_legal_decision_id!==null||
     rel.effective_from!==null||rel.effective_until!==null||
     rel.effective_period_status!=="unverified_not_implied_by_source_snapshot")
    fail(errors,"source placement promoted to supervision, delegation, command or operative authority "+rel.id);
  }
 }
 return {errors,source_baseline_commit:BASELINE,
  required_gates:GATE_NAMES.length,pilot_departments:pilotRows.length,
  source_bounded_research_relationships:globalClaims.size,
  qualified_first_level_denominators:0,certified_adl1_entities:0,
  disposition:"research_only_no_institutional_decision",
  independent_human_certification_performed:false};
}
export function projectINC13A(input,departmentId){
 const report=validateINC13A(input);
 if(report.errors.length)throw Error(report.errors.join("; "));
 const p=input.models.pilots.items.find(x=>x.canonical_department_id===departmentId);
 if(!p)throw Error("INC13A unknown bounded department");
 return {department_id:p.canonical_department_id,source_baseline_commit:p.source_baseline_commit,
  scope:p.scope,as_of_effective_date:p.as_of_effective_date,
  complete_first_level_denominator:null,review_state:p.review_state,
  gate_results:p.gate_results,
  research_relationships:p.research_relationships,
  gate_definitions:input.models.gates.items,
  certified_adl1:false,legal_authority_certified:false,
  notice:"Unratified structural research. Source placement is not supervision, command, delegation, complete current roster or legal certification."};
}
