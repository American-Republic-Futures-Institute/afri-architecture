// ARFI INC-07 typed national outcomes dependency validation (Node built-ins only).
// Validates research hypotheses and authority boundaries; cannot determine legality.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (dir,p) => JSON.parse(fs.readFileSync(path.join(dir,p),"utf8"));
const graphFiles = ["manifest","evidence","guardrails","authority-gates","options","relationships","scenarios"];
export function loadOutcomeData(dir=root){
  const graph=Object.fromEntries(graphFiles.map(n=>[n,load(dir,"model/outcomes/"+n+".json")]));
  return {
    ...graph,
    domainContract:load(dir,"model/reference/domain-contract.json"),
    sharedCapabilities:load(dir,"model/reference/shared-capabilities.json"),
    architectureReference:load(dir,"model/reference/manifest.json"),
    originalConstitution:load(dir,"model/constitutional/provisions.json"),
    amendmentUnits:load(dir,"model/constitutional/amendment-units.json")
  };
}
const types=["supports","depends_on","conflicts_with","constrained_by","requires_legal_authority"];
const allowedClasses=new Set(["existing_plan_draft","existing_architecture_draft","primary_constitutional_text","official_legal_research","technical_guidance","uncertainty_and_scenario_method"]);
const legalKind=new Set(["existing_constitutional_text_with_open_applicability","proposed_normative_safeguard_with_context_specific_law","proposed_normative_safeguard","mixed_rights_and_proposed_national_goal","legal_scope_pending"]);
const unique=arr=>new Set(arr).size===arr.length;
const isString=x=>typeof x==="string"&&x.trim().length>0;
export function validateOutcomeData(d){
  const errors=[],check=(v,msg)=>{if(!v)errors.push(msg);};
  const items=x=>Array.isArray(x?.items)?x.items:[];
  check(d.manifest?.version==="0.1.0"&&d.manifest?.status==="research_baseline_unratified","Manifest is not the declared unratified version");
  check(d.manifest?.safety?.legal_authority_assigned===false&&d.manifest?.safety?.government_action_authorized===false&&
    d.manifest?.safety?.all_proposed_options_unratified===true&&d.manifest?.safety?.quantified_effect_predictions===false,
    "The manifest must not authorize government action or claim validated effects");
  check(d.manifest?.source_contracts?.reference_baseline_commit_sha==="ac04222e2f543e12c1c460d6d5581a33ba9b4d2a","Immutable architecture baseline changed");
  check(d.manifest?.source_contracts?.plan_commit_sha==="d856e926f4180225fc74cb57ba770b6189016be3","Immutable plan manuscript baseline changed");
  check(d.manifest?.source_contracts?.domain_catalog==="model/reference/domain-contract.json","Domain contract must reuse INC-06 records");
  check(d.manifest?.source_contracts?.shared_capability_catalog==="model/reference/shared-capabilities.json","Shared capabilities must reuse INC-06 records");
  const expectedFiles=["evidence","guardrails","authority-gates","options","relationships","scenarios"].map(n=>"model/outcomes/"+n+".json");
  check(unique(d.manifest?.models??[])&&expectedFiles.length===(d.manifest?.models??[]).length&&
    expectedFiles.every(p=>d.manifest?.models?.includes(p)),"Model manifest list incomplete or duplicated");
  for(const n of graphFiles.slice(1))check(d[n]?.version==="0.1.0","Graph model version mismatch "+n);
  check(d.sharedCapabilities?.status==="candidate_shared_capabilities_unratified","Imported shared capabilities must remain unratified");
  check(d.domainContract?.status==="source_snapshot_unratified","Imported domain contract must remain unratified");
  check(d.architectureReference?.status==="research_baseline_unratified","Canonical institutional overlay must remain unratified");
  const capIds=items(d.sharedCapabilities).map(x=>x.id), caps=new Set(capIds);
  const domains=d.domainContract?.domains??[];
  const domById=new Map(domains.map(x=>[x.id,x]));
  check(domains.length===4&&unique(domains.map(x=>x.id)),"Only four pilot domains should be included");
  check(caps.size===8,"Expected 8 canonical candidate shared capabilities");

  const evidences=items(d.evidence), evIds=evidences.map(x=>x.id),evSet=new Set(evIds);
  check(unique(evIds),"Duplicate evidence ID");
  const textIds=new Set([...items(d.originalConstitution),...items(d.amendmentUnits)].map(x=>x.id));
  for(const ev of evidences){
    check(/^EVID-07-[0-9]{2}$/.test(ev.id),"Malformed evidence ID "+ev.id);
    check(allowedClasses.has(ev.evidence_class),"Unknown evidence class "+ev.id);
    check(isString(ev.title)&&isString(ev.publisher)&&/^https:\/\//.test(ev.url??""),"Missing primary provenance "+ev.id);
    check(ev.validated_causal_effect===false,"Unsupported causal validation in "+ev.id);
    check(ev.review_status==="source_access_and_substantive_applicability_review_pending","Evidence review state elevated without review "+ev.id);
    for(const cite of ev.constitutional_record_ids??[])check(textIds.has(cite),"Unrecognized constitutional record "+cite+" in "+ev.id);
    if(ev.evidence_class==="primary_constitutional_text")check((ev.constitutional_record_ids??[]).length>0,"Unscoped constitutional evidence "+ev.id);
  }
  const guards=items(d.guardrails),guardIds=guards.map(x=>x.id),guardBy=new Map(guards.map(x=>[x.id,x]));
  const gates=items(d["authority-gates"]),gateIds=gates.map(x=>x.id),gateBy=new Map(gates.map(x=>[x.id,x]));
  const opts=items(d.options),optIds=opts.map(x=>x.id),optBy=new Map(opts.map(x=>[x.id,x]));
  for(const [a,list] of [["guardrail",guardIds],["legal gate",gateIds],["option",optIds]])check(unique(list),"Duplicate "+a+" IDs");
  const knownOutcome=new Set(domains.flatMap(x=>x.outcome_ids??[]));
  check(knownOutcome.size===39,"Expected 39 candidate domain outcomes");
  const nodes=new Set([...knownOutcome,...capIds,...guardIds,...gateIds,...optIds]);
  check(nodes.size===knownOutcome.size+capIds.length+guardIds.length+gateIds.length+optIds.length,"Node ID collision across types");
  for(const g of guards){
    check(/^GUARD-07-[0-9]{2}$/.test(g.id),"Malformed guardrail ID "+g.id);
    check(legalKind.has(g.legal_character),"Unreviewed legal guardrail classification "+g.id);
    check(g.auto_grants_authority===false && g.review_status==="legal_and_public_review_pending","Guardrail falsely ratified or grants power "+g.id);
    check((g.evidence_ids??[]).length>0&&g.evidence_ids.every(x=>evSet.has(x)),"Guardrail has missing evidence "+g.id);
    for(const cite of g.constitutional_record_ids??[])check(textIds.has(cite),"Guardrail has invented constitutional record "+cite);
  }
  for(const gate of gates){
    check(/^AGATE-07-[0-9]{2}$/.test(gate.id),"Malformed legal gate ID "+gate.id);
    check(gate.satisfied===false&&gate.authorizes_action===false&&gate.legal_status==="not_verified_for_any_option","Legal gate falsely satisfied or authorization inferred "+gate.id);
    check(isString(gate.research_question)&&isString(gate.gate_kind)&&isString(gate.reviewer_role),"Legal review criteria missing "+gate.id);
    check((gate.evidence_ids??[]).length>0&&gate.evidence_ids.every(x=>evSet.has(x)),"Legal gate has unknown evidence "+gate.id);
  }
  for(const o of opts){
    check(/^OPT-07-[0-9]{2}$/.test(o.id),"Malformed option ID "+o.id);
    check(o.status==="hypothetical_option_not_recommended" && o.decision==="open" && o.government_action_authorized===false &&
      o.lawful_implementer==="not_determined" && o.causal_evidence_status==="not_established","Option ratified or framed as existing authority "+o.id);
    check(isString(o.description)&&isString(o.mechanism_hypothesis)&&o.tradeoff_review_required===true,"Missing options' uncertainty or tradeoff "+o.id);
    check((o.related_outcome_ids??[]).length>0&&o.related_outcome_ids.every(x=>knownOutcome.has(x)),"Option references nonexistent outcome "+o.id);
    for(const alt of o.contrast_option_ids??[])check(optBy.has(alt)&&alt!==o.id,"Invalid compared alternative "+alt+" for "+o.id);
  }
  const edges=items(d.relationships),edgeIds=edges.map(x=>x.id),edgeBy=new Map(edges.map(x=>[x.id,x]));
  check(unique(edgeIds),"Duplicate graph edge IDs");
  check(d.relationships?.status==="typed_research_hypotheses_unratified","Graph edge publication status must be unratified");
  check(types.every(x=>d.relationships?.relationship_types?.includes(x))&&
    (d.relationships?.relationship_types??[]).length===types.length,"Graph relationship taxonomy not exact");
  const pairs=new Set(),dependAdj=new Map();
  for(const e of edges){
    check(/^EDGE-07-[0-9]{4}$/.test(e.id),"Malformed edge ID "+e.id);
    check(types.includes(e.relationship_type),"Unsupported edge type "+e.relationship_type);
    check(nodes.has(e.from_id)&&nodes.has(e.to_id)&&e.from_id!==e.to_id,"Dangling or self-referential graph edge "+e.id);
    const fingerprint=e.relationship_type+"|"+e.from_id+"|"+e.to_id;
    check(!pairs.has(fingerprint),"Duplicated typed graph edge "+fingerprint);pairs.add(fingerprint);
    const isOut=id=>knownOutcome.has(id),isCap=id=>caps.has(id),isOpt=id=>optBy.has(id),isGuard=id=>guardBy.has(id),isGate=id=>gateBy.has(id);
    if(e.relationship_type==="supports")check(isCap(e.from_id)&&isOut(e.to_id),"Invalid supports endpoint types "+e.id);
    if(e.relationship_type==="depends_on"){
      check(isOut(e.from_id)&&(isCap(e.to_id)||isOut(e.to_id)),"Invalid depends_on endpoint types "+e.id);
      if(!dependAdj.has(e.from_id))dependAdj.set(e.from_id,[]);
      dependAdj.get(e.from_id).push(e.to_id);
    }
    if(e.relationship_type==="conflicts_with")check(isOpt(e.from_id)&&isOut(e.to_id),"Invalid conflicts_with endpoints; do not portray two public outcomes as inherently incompatible "+e.id);
    if(e.relationship_type==="constrained_by")check((isOpt(e.from_id)||isCap(e.from_id))&&isGuard(e.to_id),"Invalid constrained_by endpoints "+e.id);
    if(e.relationship_type==="requires_legal_authority")check(isOpt(e.from_id)&&isGate(e.to_id),"Invalid requires_legal_authority endpoints "+e.id);
    check(e.claim_status==="candidate_hypothesis_unratified"&&e.authority_asserted===false&&e.effect_strength==="unknown_not_quantified","Unverified effect or governmental authority claim "+e.id);
    check((e.evidence_ids??[]).length>0&&e.evidence_ids.every(id=>evSet.has(id)),"Dangling evidence for edge "+e.id);
    check(isString(e.rationale)&&isString(e.uncertainty)&&isString(e.disconfirmation_prompt),"Graph edge lacks falsifiable explanatory limits "+e.id);
  }
  // Causal dependencies are hypotheses; detect circular all-outcome claims before publishing any implied path order.
  const visitState=new Map();
  function walk(id){
    if(visitState.get(id)===1){errors.push("Cycle in depends_on-only dependency graph at "+id);return;}
    if(visitState.get(id)===2)return;
    visitState.set(id,1);
    for(const v of dependAdj.get(id)||[])if(dependAdj.has(v))walk(v);
    visitState.set(id,2);
  }
  for(const id of dependAdj.keys())if(!visitState.get(id))walk(id);
  for(const o of opts){
    const own=edges.filter(x=>x.from_id===o.id);
    for(const t of ["conflicts_with","constrained_by","requires_legal_authority"])
      check(own.some(x=>x.relationship_type===t),"Option missing "+t+" analysis "+o.id);
    for(const c of own.filter(x=>x.relationship_type==="conflicts_with"))
      check(o.related_outcome_ids.includes(c.to_id),"Conflicting outcome is outside option's acknowledged scope "+o.id);
  }
  for(const id of capIds){
    const engaged=new Set(edges.filter(e=>e.relationship_type==="supports"&&e.from_id===id)
      .map(e=>domains.find(d=>d.outcome_ids.includes(e.to_id))?.id));
    check(engaged.size>=2,"Shared capability has fewer than two domain support paths "+id);
  }
  const cases=items(d.scenarios),caseIds=cases.map(x=>x.id);
  check(unique(caseIds),"Duplicated scenario ID");
  check(d.scenarios?.status==="qualitative_stress_tests_unratified","Scenarios must remain qualitative and unratified");
  check(cases.length>=5,"Insufficient adversarial scenario diversity");
  for(const sc of cases){
    check(/^SCN-07-[0-9]{2}$/.test(sc.id)&&sc.status==="qualitative_stress_test_not_simulation","Scenario wrongly modeled as a verified simulation "+sc.id);
    check(optBy.has(sc.option_id),"Scenario has unknown option "+sc.id);
    check(sc.probability==="not_estimated"&&sc.effect_quantification==="not_estimated","Scenario publishes unjustified prediction "+sc.id);
    check(sc.outcome_ids?.length>0&&sc.outcome_ids.every(x=>knownOutcome.has(x)),"Scenario has unknown human outcome "+sc.id);
    check(sc.capability_ids?.length>0&&sc.capability_ids.every(x=>caps.has(x)),"Scenario has unknown shared capability "+sc.id);
    check((sc.edge_ids??[]).length>0&&unique(sc.edge_ids)&&sc.edge_ids.every(x=>edgeBy.has(x)),"Scenario has dangling or duplicate edges "+sc.id);
    const selected=(sc.edge_ids??[]).map(x=>edgeBy.get(x)).filter(Boolean);
    check(selected.some(e=>e.from_id===sc.option_id&&e.relationship_type==="conflicts_with"),"Scenario has no option risk edge "+sc.id);
    check(selected.some(e=>e.from_id===sc.option_id&&e.relationship_type==="requires_legal_authority"),"Scenario has no legal gating edge "+sc.id);
    const rguards=selected.filter(e=>e.from_id===sc.option_id&&e.relationship_type==="constrained_by").map(x=>x.to_id);
    const rgates=selected.filter(e=>e.from_id===sc.option_id&&e.relationship_type==="requires_legal_authority").map(x=>x.to_id);
    check(unique(sc.guardrail_ids??[])&&rguards.every(x=>sc.guardrail_ids.includes(x)) &&
      (sc.guardrail_ids??[]).every(x=>guardBy.has(x)),"Scenario missing or inventing guardrails "+sc.id);
    check(unique(sc.authority_gate_ids??[])&&rgates.every(x=>sc.authority_gate_ids.includes(x)) &&
      (sc.authority_gate_ids??[]).every(x=>gateBy.has(x)),"Scenario missing or inventing authority gates "+sc.id);
    check([sc.stress_condition,sc.potential_benefit,sc.adverse_path,sc.evidence_required,sc.prohibited_inference,sc.alternative_models].every(isString),"Scenario lacks competing pathways or methodological boundary "+sc.id);
    check(sc.review_status==="independent_public_and_expert_review_pending","Scenario review falsely completed "+sc.id);
  }
  return {errors,summary:{pilot_domains:domains.length,outcomes:knownOutcome.size,shared_capabilities:caps.size,options:opts.length,evidence:evidences.length,guardrails:guards.length,authority_gates:gates.length,edges:edges.length,edge_types:types.map(t=>({type:t,count:edges.filter(x=>x.relationship_type===t).length})),scenarios:cases.length}};
}
export function validateOutcomes(dir=root){return validateOutcomeData(loadOutcomeData(dir));}
