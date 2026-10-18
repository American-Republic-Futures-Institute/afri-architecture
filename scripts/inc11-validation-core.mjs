// INC-11 source-bounded federal office, legal instrument and administrative policy semantics.
// A documented relation, source capture or passing CI does not create a legally effective delegation.
export const INC11_FAMILIES=Object.freeze(["offices","instruments","claims","events","gaps","viewpoints"]);
const INSTRUMENT_PINS=new Map([
 ["X11-INST-VA-38-306",["codified_statute","38 U.S.C. § 306","SRC-X06-38-306",null,null]],
 ["X11-INST-VA-PL11842",["enacted_public_law","P.L. 118-42 div. A title II","SRC-X06-PL118-42","2024-03-09","2024-10-01"]],
 ["X11-INST-USC31-1301",["codified_statute","31 U.S.C. § 1301","SRC-X05-31-1301",null,null]],
 ["X11-INST-VA-FUNDS-2024",["internal_agency_policy","VA Volume II Chapter 03, sections 0301–0305","SRC-X07-VA-FUNDS2024","2024-07-17",null]],
 ["X11-INST-ED-20-3403",["codified_statute","20 U.S.C. § 3403","SRC-FSTAT-ED-3403",null,null]]
]);
const CLAIM_PINS=new Map([
 ["X11-CLAIM-VA-HEADSHIP",["X11-OFFICE-VA-UNDERSEC-BENEFITS","X06-ACTOR-VBA","statutory_headship_context","X11-INST-VA-38-306"]],
 ["X11-CLAIM-CONGRESS-VA-ENACTMENT",["ORG-FED-LEG-CONGRESS","X06-APP-PL11842-FY25","enacted_appropriation_context","X11-INST-VA-PL11842"]],
 ["X11-CLAIM-VA-PURPOSE",["X06-ACCOUNT-VA-0102","X06-CTRL-PURPOSE","statutory_limit_context","X11-INST-USC31-1301"]],
 ["X11-CLAIM-ED-STATE-LIMIT",["ORG-FED-EXE-DEP-EDUCATION","FSTAT-PROV-ED-20-3403","statutory_limit_context","X11-INST-ED-20-3403"]],
 ["X11-CLAIM-VA-BUDGET-POLICY",["X11-OFFICE-VA-BUDGET","X07-CTRL-AAWS","policy_described_workflow","X11-INST-VA-FUNDS-2024"]],
 ["X11-CLAIM-VA-ALLOTMENT-POLICY",["X11-OFFICE-VA-BUDGET","X07-CTRL-ALLOTMENT","policy_described_workflow","X11-INST-VA-FUNDS-2024"]]
]);
const INSTRUMENT_KIND_BY_PREDICATE={
 statutory_headship_context:"codified_statute",
 enacted_appropriation_context:"enacted_public_law",
 statutory_limit_context:"codified_statute",
 policy_described_workflow:"internal_agency_policy"
};
const REQUIRED_GAPS=["X11-GAP-VA-DELEGATION","X11-GAP-VA-OFFICE",
 "X11-GAP-VA-EXECUTION","X11-GAP-ED-CURRENTNESS","X11-GAP-LEGAL-REVIEW"];
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>Array.isArray(a)&&new Set(a).size===a.length;
const dateOK=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const typeOf=x=>x===null?"null":Array.isArray(x)?"array":typeof x;
// Narrow implementation of the specific JSON Schema 2020-12 constraints below,
// not a claim to implement the complete JSON Schema 2020-12 specification.
function checkRule(v,r,path,defs,errors){
 if(r.$ref){const name=r.$ref.split("/").pop(),def=defs[name];
  if(!def)errors.push(path+" missing schema definition "+name);
  else checkRule(v,def,path,defs,errors);
  return;
 }
 if(Object.hasOwn(r,"const")&&!Object.is(v,r.const))errors.push(path+" expected schema constant");
 if(r.enum&&!r.enum.some(x=>equal(x,v)))errors.push(path+" invalid schema enum");
 if(r.type&&!([].concat(r.type).includes(typeOf(v))))errors.push(path+" wrong schema type");
 if(r.pattern&&typeof v==="string"&&!new RegExp(r.pattern).test(v))errors.push(path+" invalid pattern");
 if(r.minLength!==undefined&&typeof v==="string"&&v.length<r.minLength)errors.push(path+" empty text");
 if(r.type==="object"&&typeOf(v)==="object"){
  for(const name of r.required||[])if(!Object.hasOwn(v,name))errors.push(path+" missing "+name);
  for(const [k,val]of Object.entries(v)){
   if(!Object.hasOwn(r.properties||{},k)){
    if(r.additionalProperties===false)errors.push(path+" unknown property "+k);
   }else checkRule(val,r.properties[k],path+"."+k,defs,errors);
  }
 }
 if(r.type==="array"&&Array.isArray(v)){
  if(v.length<(r.minItems||0))errors.push(path+" array too short");
  if(r.uniqueItems===true&&new Set(v.map(x=>JSON.stringify(x))).size!==v.length)
   errors.push(path+" duplicate array member");
  if(r.items)for(const [i,item]of v.entries())checkRule(item,r.items,path+"["+i+"]",defs,errors);
 }
}
export function validateInc11Schema(schema,collections){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  !schema.$defs||!Array.isArray(schema.oneOf)||schema.oneOf.length!==INC11_FAMILIES.length)
  errors.push("INC11 invalid schema dialect or family wrappers");
 for(const fam of INC11_FAMILIES){
  const def=schema?.$defs?.[fam],wrapper=schema?.oneOf?.find(x=>x.properties?.model_family?.const==="inc11-"+fam);
  if(!def||def.additionalProperties!==false||!wrapper||wrapper.additionalProperties!==false||
   wrapper.properties?.items?.items?.$ref!=="#/$defs/"+fam||
   !Array.isArray(def.required)||!Object.keys(def.properties||{}).every(k=>def.required.includes(k))){
   errors.push("INC11 schema must close all required record fields for "+fam);
   continue;
  }
  checkRule(collections?.[fam],wrapper,"inc11/"+fam,schema.$defs,errors);
 }
 return {errors,validated_families:INC11_FAMILIES.length};
}
export function validateINC11({manifest,collections,recordIndex=new Map(),sourceIndex=new Map(),schema}){
 const errors=[],bad=msg=>errors.push("INC11 "+msg),refs=new Map(recordIndex),sources=new Map(sourceIndex),data={};
 const extension=manifest?.federal_office_policy_authority_11_extension;
 if(extension?.id!=="ARFI-FED-INC11-OFFICE-POLICY-AUTHORITY"||
  extension?.release_status!=="unratified_research"||extension?.model_families!==6||
  extension?.source_bounded_claims!==6||
  extension?.independent_legal_review_complete!==false||
  extension?.individual_delegations_proven!==false||
  extension?.whole_federal_coverage_certified!==false)bad("missing or unjustified manifest extension");
 if(!manifest?.federal_operational_lineage_06_extension||
  !manifest?.federal_treasury_execution_07_extension||
  !manifest?.federal_fiscal_reporting_reconciliation_10_extension)
  bad("missing source-bounded federal research prerequisites");
 const sr=validateInc11Schema(schema,collections);errors.push(...sr.errors);
 for(const fam of INC11_FAMILIES){
  const expected="model/federal/x11-"+fam+".json",c=collections?.[fam],items=c?.items;
  if(!Array.isArray(items)||c.model_family!=="inc11-"+fam||c.model_version!=="0.1.0"||
   manifest?.models?.filter(x=>x===expected).length!==1)bad("family, version or manifest registration "+fam);
  data[fam]=Array.isArray(items)?items:[];
  for(const x of data[fam]){
   if(!x?.id||refs.has(x.id))bad("missing or duplicated canonical ID "+x?.id);
   if(x?.id)refs.set(x.id,x);
  }
 }
 const by=fam=>new Map(data[fam].map(x=>[x.id,x]));
 const offices=by("offices"),ins=by("instruments"),claims=by("claims"),gaps=by("gaps"),events=by("events");
 const head="X11-OFFICE-VA-UNDERSEC-BENEFITS",budget="X11-OFFICE-VA-BUDGET";
 if(!offices.has(head)||!offices.has(budget))bad("missing required office or position research overlay");
 for(const x of data.offices){
  if(!refs.has(x.department_id)||x.department_id!=="ORG-FED-EXE-DEP-VA"||
   x.named_incumbent_id!==null||x.individual_delegation_verified!==false||
   x.whole_department_adl1_qualified!==false||x.review_status!=="unratified_source_bounded")
   bad("office identity or unearned powers "+x.id);
  if(x.existing_canonical_ref!==null&&!recordIndex.has(x.existing_canonical_ref))bad("unknown canonical office crosswalk "+x.id);
  if(x.associated_unit_ref!==null&&!recordIndex.has(x.associated_unit_ref))bad("unknown organizational unit "+x.id);
  if(!x.source_ids?.length||!x.source_ids.every(s=>sources.has(s)))bad("unreferenced office source "+x.id);
  if(!dateOK(x.reference_as_of))bad("invalid dated office snapshot "+x.id);
 }
 if(offices.get(head)?.existing_canonical_ref!=="X06-ACTOR-UNDERSEC-BENEFITS"||
  offices.get(head)?.associated_unit_ref!=="X06-ACTOR-VBA"||
  offices.get(head)?.office_kind!=="statutory_position_reference"||
  !equal(offices.get(head)?.source_ids,["SRC-X06-38-306"])||
  offices.get(budget)?.existing_canonical_ref!==null||
  offices.get(budget)?.office_kind!=="policy_named_administrative_unit_candidate"||
  !equal(offices.get(budget)?.source_ids,["SRC-X07-VA-FUNDS2024"]))
  bad("statutory role and administrative candidate boundary mutated");
 for(const [id,pin]of INSTRUMENT_PINS){
  const x=ins.get(id);
  if(!x||x.instrument_kind!==pin[0]||x.citation!==pin[1]||
   !equal(x.source_ids,[pin[2]])||x.reported_event_on!==pin[3]||
   x.fiscal_availability_from!==pin[4]||x.canonical_source_or_instrument_ref===null)
   bad("official-law or policy source classification altered "+id);
 }
 for(const x of data.instruments){
  if(!x.source_ids?.length||!x.source_ids.every(s=>sources.has(s))||
   (!refs.has(x.canonical_source_or_instrument_ref)&&!sources.has(x.canonical_source_or_instrument_ref))||
   !dateOK(x.source_observed_on)||
   (x.reported_event_on!==null&&!dateOK(x.reported_event_on))||
   (x.fiscal_availability_from!==null&&!dateOK(x.fiscal_availability_from))||
   (x.reported_event_on!==null&&x.reported_event_on>x.source_observed_on)||
   x.original_byte_qualified!==false||x.complete_legal_citator_review!==false||
   x.individual_action_supported!==false||x.arfi_ratified!==false)
   bad("source identity, dated scope or unearned authority "+x.id);
  if(x.instrument_kind==="internal_agency_policy"&&
   (x.legal_effect_class!=="published_internal_controls_not_public_regulation_or_signed_allotment"||
    x.fiscal_availability_from!==null))
   bad("internal policy promoted to generally binding statute "+x.id);
  if(x.instrument_kind==="enacted_public_law"&&
     x.legal_effect_class!=="enacted_account_authority_not_individual_obligation")
   bad("enacted law relabeled as individual execution "+x.id);
 }
 for(const [id,pin]of CLAIM_PINS){
  const x=claims.get(id);
  if(!x||!equal([x.from_id,x.to_id,x.predicate,x.instrument_id],pin))
   bad("exemplar source-backed claim changed "+id);
 }
 for(const x of data.claims){
  const i=ins.get(x.instrument_id);
  if(!refs.has(x.from_id)||!refs.has(x.to_id)||!i||
   INSTRUMENT_KIND_BY_PREDICATE[x.predicate]!==i.instrument_kind||
   !x.source_ids?.length||!x.source_ids.every(s=>i.source_ids.includes(s)&&sources.has(s))||
   !unique(x.qualification_gap_ids)||!x.qualification_gap_ids.length||
   !x.qualification_gap_ids.every(id=>gaps.has(id)&&gaps.get(id).verified===false)||
   !dateOK(x.reference_as_of)||x.jurisdiction!=="US_federal"||
   !x.statement?.trim()||x.actual_delegation_verified!==false||
   x.individual_government_action_verified!==false||
   x.independently_qualified_legal_effect!==false||
   x.assertion_status!=="source_bounded_research_unratified")
   bad("invalid authority edge, qualification or unearned power "+x.id);
 }
 for(const id of REQUIRED_GAPS)if(!gaps.has(id))bad("required unresolved evidence gap removed "+id);
 for(const x of data.gaps){
  if(x.verified!==false||x.qualified_legal_review_complete!==false||
   x.signed_official_instrument_sha256!==null||x.review_status!=="open_unverified"||
   !x.source_ids?.length||!x.source_ids.every(s=>sources.has(s))||
   !x.affected_ids?.length||!x.affected_ids.every(id=>refs.has(id))||
   !x.required_evidence?.trim())bad("evidence gap concealed or falsely qualified "+x.id);
 }
 for(const x of data.events){
  const i=ins.get(x.instrument_id);
  if(!i||x.event_on!==i.reported_event_on||!dateOK(x.event_on)||
   !equal(x.source_ids,i.source_ids)||x.individual_delegation_event_verified!==false||
   x.independently_verified_current_effect!==false||x.supersession_verified!==false||
   x.publisher_event_only!==true)bad("policy event promoted to authority or action "+x.id);
  if((i?.instrument_kind==="internal_agency_policy"&&x.event_kind!=="agency_policy_approval_reported")||
     (i?.instrument_kind==="enacted_public_law"&&x.event_kind!=="public_law_enactment_reported"))
   bad("instrument lifecycle event category mismatch "+x.id);
 }
 if(events.size!==2||!events.has("X11-EVENT-VA-FUNDS-2024-APPROVAL")||
  !events.has("X11-EVENT-VA-PL11842-ENACTMENT"))bad("missing published legislative/policy events");
 for(const x of data.viewpoints){
  if(!refs.has(x.root_id)||!x.additional_node_ids?.every(id=>refs.has(id))||
   !x.claim_ids?.length||!x.claim_ids.every(id=>claims.has(id))||
   !x.qualification_gap_ids?.length||!x.qualification_gap_ids.every(id=>gaps.has(id))||
   !x.claim_ids.some(id=>claims.get(id)?.from_id===x.root_id||claims.get(id)?.to_id===x.root_id)||
   !x.interpretation?.trim())bad("viewpoint missing root, evidence or qualification "+x.id);
 }
 return {errors,checked_families:INC11_FAMILIES.length,checked_records:INC11_FAMILIES.reduce((n,f)=>n+data[f].length,0),
  checked_claims:data.claims.length,checked_sources:sourceIndex.size};
}
export function projectINC11(collections,id){
 const v=collections.viewpoints?.items.find(x=>x.id===id);
 if(!v)throw Error("Unknown source-bounded INC11 viewpoint: "+id);
 const claims=v.claim_ids.map(id=>collections.claims.items.find(x=>x.id===id));
 const gaps=v.qualification_gap_ids.map(id=>collections.gaps.items.find(x=>x.id===id));
 const instruments=[...new Set(claims.map(x=>x.instrument_id))].map(id=>collections.instruments.items.find(x=>x.id===id));
 return {view_id:v.id,root_id:v.root_id,title:v.title,interpretation:v.interpretation,
  node_ids:[v.root_id,...v.additional_node_ids],claims,instruments,unresolved_qualifications:gaps,
  authority_certified:false,model_status:"source_bounded_research_unratified"};
}
