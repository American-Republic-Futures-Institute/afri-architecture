// INC-13B2 DOJ source-chart reconciliation: source placement never grants statutory power.
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const DEPT="ORG-FED-EXE-DEP-JUSTICE",SRC="DEPT04-SRC-DOJ-CHART-2026",SNAP="DEPT04-SNAPSHOT-JUSTICE";
const ID_UNITS="model/federal/department-structure/units.json";
const conditions=[
"outside_selected_36_connector_chart_source_group","current_full_department_first_level_roster",
"signed_individual_delegations","supervision_and_operational_command","independent_IG_statutory_authority",
"adjudicatory_independence_or_jurisdiction","original_bytes_and_verified_signed_instrument",
"current_legal_effect_or_historical_successions"];
const uniq=x=>Array.isArray(x)&&new Set(x).size===x.length;
export function loadINC13B2(){
 return {model:read("model/federal/inc13b2-doj-chart.json"),inputs:{
  units:read(ID_UNITS),relationships:read("model/federal/department-structure/relationships.json"),
  x12:read("model/federal/x12-observations.json"),snapshots:read("model/federal/department-structure/source-snapshots.json"),
  sourceRegistry:read("model/federal/department-structure/source-registry.json"),
  coverage:read("model/federal/department-structure/coverage-ledger.json"),
  pilots:read("model/federal/inc13a-pilots.json"),manifest:read("model/federal/manifest.json")}};
}
export function validateINC13B2(model,inputs){
 const errors=[],fail=x=>errors.push("INC13B2 "+x);
 const scope=model?.source_scope;
 const snapshot=inputs.snapshots?.items?.find(x=>x.id===SNAP);
 const source=inputs.sourceRegistry?.items?.find(x=>x.id===SRC);
 const coverage=inputs.coverage?.items?.find(x=>x.department_id===DEPT);
 const pilot=inputs.pilots?.items?.find(x=>x.id==="X13A-PILOT-JUSTICE");
 if(model?.model_family!=="inc13b2-doj-chart"||model?.model_version!=="0.1.0"||model?.department_id!==DEPT||
  model?.status!=="source_bounded_unratified"||model?.inc13a_pilot_id!=="X13A-PILOT-JUSTICE"||
  model?.complete_department_first_level_denominator!==null||model?.adl1_certified_count!==0||
  model?.independent_institutional_review_complete!==false||JSON.stringify(model?.explicit_scope_exclusions)!==JSON.stringify(conditions))
  fail("false institutional completeness, authority or research scope");
 if(scope?.id!=="X13B2-SCOPE-DOJ-2026"||scope?.source_id!==SRC||scope?.snapshot_id!==SNAP||
  scope?.signed_chart_date!=="2026-02-17"||scope?.publisher_page_last_updated!=="2026-04-29"||
  scope?.observed_on!=="2026-10-16"||scope?.source_group_record_count!==36||
  scope?.complete_publisher_source_group!==true||scope?.current_complete_first_level_denominator!==null||
  scope?.full_operational_hierarchy_verified!==false||scope?.original_source_bytes_archived!==false||
  scope?.signed_chart_signature_independently_validated!==false||
  scope?.independently_reviewed_legal_effect!==false)
  fail("invalid bounded chart and edition metadata");
 if(snapshot?.source_id!==SRC||snapshot?.department_id!==DEPT||
  snapshot?.edition!=="signed_chart_date_2026-02-17"||snapshot?.observed_on!=="2026-10-16"||
  snapshot?.source_group_record_count!==36||snapshot?.complete_source_group_extracted!==true||
  snapshot?.complete_department_first_level_known!==false||
  snapshot?.signed_source_instrument_independently_validated!==false||
  snapshot?.qualified_institutional_review_complete!==false||
  snapshot?.individual_statutory_delegations_verified!==false)
  fail("original snapshot assertion drift");
 if(source?.published_or_last_updated!=="2026-04-29"||source?.retrieved_on!=="2026-10-16"||
  source?.raw_source_bytes_archived!==false||source?.raw_source_sha256!==null||
  source?.qualified_legal_review!==false||!source?.url?.startsWith("https://www.justice.gov/"))
  fail("official publisher/custody source drift");
 if(coverage?.complete_first_level_denominator!==null||coverage?.current_adl1_certified!==false||
  coverage?.source_archival_bytes_verified!==false||
  coverage?.legal_and_institutional_review_complete!==false||
  !coverage?.source_roster_snapshot_ids?.includes(SNAP))fail("department census qualification falsely promoted");
 if(pilot?.canonical_department_id!==DEPT||pilot?.adl1_certified!==false||
  pilot?.complete_first_level_denominator!==null||pilot?.independent_legal_review_complete!==false||
  pilot?.gate_results?.length!==9||
  pilot?.gate_results?.some(x=>x.status==="met"||x.reviewer_id!==null||x.review_decision_id!==null))
  fail("inherited INC13A qualification gates changed");
 const originals=(inputs.units?.items||[]).filter(x=>x.department_id===DEPT);
 const edges=(inputs.relationships?.items||[]).filter(x=>x.snapshot_id===SNAP);
 const prior=(inputs.x12?.items||[]).filter(x=>x.source_snapshot_id===SNAP);
 if(originals.length!==36||edges.length!==36||prior.length!==36||
  !uniq(originals.map(x=>x.id))||!uniq(edges.map(x=>x.id))||!uniq(prior.map(x=>x.id)))fail("unexpected original group denominator");
 const byUnit=new Map(originals.map(x=>[x.id,x])),byEdge=new Map(edges.map(x=>[x.from_id,x])),byPrior=new Map(prior.map(x=>[x.source_record_id,x]));
 const rows=model?.reconciled_observations;
 if(!Array.isArray(rows)||rows.length!==36||!uniq(rows.map(x=>x.id))||
  !uniq(rows.map(x=>x.original_record_id)))fail("incomplete, duplicated or invented source observation");
 const rowByOrig=new Map((Array.isArray(rows)?rows:[]).map(x=>[x.original_record_id,x]));
 for(const u of originals){
  const e=byEdge.get(u.id),p=byPrior.get(u.id),x=rowByOrig.get(u.id);
  if(!e||!p||!x){fail("missing one-to-one original chart join "+u.id);continue;}
  if(e.id!==p.relation_source_id||e.to_id!==u.parent_ref||p.observed_parent_id!==u.parent_ref||
   e.relationship_type!=="dated_organizational_chart_connector_not_power"||
   u.original_published_relation_verified_in_named_slice!==true||u.direct_operational_command_verified!==false||
   u.statutory_delegation_verified!==false||u.adl_evidenced!==0||
   e.delegated_power_proven!==false||e.authorized_actor_id!==null||
   e.direct_military_or_civilian_command_proven!==false||e.legally_valid_adl1_claim!==false||
   p.confirmed_command!==false||p.confirmed_supervision!==false||p.confirmed_delegation!==false||
   p.adl1_eligible!==false||p.source_record_adl!==0)fail("original chart, legacy review or legal qualification drift "+u.id);
  if(x.id!=="X13B2-OBS-"+u.id||x.source_collection!==ID_UNITS||
   x.original_source_relation_id!==e.id||x.inc12_observation_id!==p.id||
   x.source_snapshot_id!==SNAP||JSON.stringify(x.source_ids)!==JSON.stringify([SRC])||
   x.primary_source_id!==SRC||
   x.source_relation_class!=="dated_organizational_chart_connector_not_power"||
   x.source_observed_on!==snapshot?.observed_on||x.source_observed_parent_id!==u.parent_ref||
   x.publisher_reported_supervisor_role_id!==null||
   x.source_classification!==u.structural_class||x.source_group!==u.group||
   x.source_locator!==u.source_locator||x.edition_chart_dated_on!=="2026-02-17"||
   x.publisher_page_updated_on!=="2026-04-29"||
   x.legal_effective_on!==null||x.original_source_bytes_verified!==false||
   x.verified_signed_delegation!==false||x.specific_operational_command_established!==false||
   x.independent_legal_review_complete!==false||x.adl1_certified!==false)
   fail("crosswalk changed sourced parent, identity, time, authority or review "+u.id);
 }
 if(rows?.some(x=>!byUnit.has(x.original_record_id)))fail("invented cross-department chart observation");
 const find=id=>byUnit.get("DEPT04-UNIT-JUSTICE-"+id);
 if(find("AG")?.parent_ref!==DEPT||
  find("DAG")?.parent_ref!==find("AG")?.id||
  find("ASG")?.parent_ref!==find("DAG")?.id||
  find("OIG")?.structural_class!=="independent_oversight_position_only"||
  ["USPC","EOIR","FCSC"].some(id=>find(id)?.structural_class!=="adjudicatory_or_commission_review_needed"))
  fail("Attorney General ancestry, IG independence or adjudication review boundary");
 if(inputs.manifest?.models?.filter(x=>x==="model/federal/inc13b2-doj-chart.json").length!==1||
  inputs.manifest?.federal_doj_13b2_reconciliation_extension?.source_group_count!==36||
  inputs.manifest?.federal_doj_13b2_reconciliation_extension?.adl1_certified_count!==0)
  fail("canonical manifest source and nonpromotion registration");
 return {errors,root_id:DEPT,source_group_count:36,source_relationships:36,inc12_reconciled_observations:36,
  current_first_level_denominator:null,adl1_certified_count:0,independently_verified_signed_chart:false,
  legal_review_complete:false,disposition:"published_chart_connectors_only"};
}
export function projectINC13B2(data){
 const report=validateINC13B2(data.model,data.inputs);
 if(report.errors.length)throw Error(report.errors.join("; "));
 return {root_id:DEPT,source_snapshot_id:SNAP,source_record_id:SRC,
  source_timeline:data.model.source_scope,
  nodes:data.model.reconciled_observations,
  edges:data.model.reconciled_observations.map(x=>({id:x.original_source_relation_id,
   from_id:x.original_record_id,to_id:x.source_observed_parent_id,relationship_type:x.source_relation_class,
   source_id:SRC,as_observed_on:x.source_observed_on,legal_effective_on:null})),
  coverage:report,warning:"Chart connector is not legal supervision, executed delegation, operational command, complete roster or certified ADL-1."};
}
