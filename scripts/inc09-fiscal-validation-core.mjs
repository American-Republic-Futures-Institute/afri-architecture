// INC-09 strict read-only money and original government File A account evidence lineage.
import {validateFileAOriginals} from "./inc09-filea-source-core.mjs";
export const FAMILIES=["sources","file-a-rows","reconciliations","controls","gaps","relationships","traces"];
const COUNTS={"sources":4,"file-a-rows":2,"reconciliations":9,"controls":6,"gaps":8,"relationships":18,"traces":1};
const SOURCES=new Map([["SRC-X09-TREASURY-FILEA-ZIP",["https://files.usaspending.gov/generated_downloads/FY2025P01-P12_VA_TAS_AccountBalances_2026-10-18_H16M49S10589937.zip","3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0",859,"evidence/va-fy2025/file-a-originals/sha256/3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0.zip","treasury_usaspending_generated_agency_submission_ZIP"]],["SRC-X09-TREASURY-FILEA-CSV",[null,"e7f8508491ea56275aceda89e5d91f9c6466ac13d251ec0b86c21294cc1b8a2a",1943,"evidence/va-fy2025/file-a-originals/sha256/e7f8508491ea56275aceda89e5d91f9c6466ac13d251ec0b86c21294cc1b8a2a.csv","treasury_generated_ZIP_member_unmodified_original_CSV"]],["SRC-X09-TREASURY-SNAPSHOT",["https://api.usaspending.gov/api/v2/federal_accounts/4649/fiscal_year_snapshot/2025/","81f15a17121e594cdf2f05947f84af4d77a9cb4e026e1f713853f90194dc0108",320,"evidence/va-fy2025/file-a-originals/sha256/81f15a17121e594cdf2f05947f84af4d77a9cb4e026e1f713853f90194dc0108.json","treasury_public_account_aggregate_API_response_JSON"]],["SRC-X09-TREASURY-SUBMISSION-HISTORY",["https://api.usaspending.gov/api/v2/reporting/agencies/036/2025/12/submission_history/","ae3892cce28468ef20484b1e0ccda087ed57ee7724b1ff7a527624e76141096d",363,"evidence/va-fy2025/file-a-originals/sha256/ae3892cce28468ef20484b1e0ccda087ed57ee7724b1ff7a527624e76141096d.json","treasury_agency_period_submission_history_API_response_JSON"]]]);
const RELS=new Map([["X09-REL-01",["X08-TRACE-VA-2025-0102","X09-FILEA-VA-2025-NOYEAR","successor_reporting_source_extends_OMB_plan",["X09-GAP-FILEA-SIGNER"]]],["X09-REL-02",["X08-OMB-REV-04","X09-REC-OMB-APRIL-PLAN-BRIDGE","April_approved_plan_to_later_reported_resources",["X09-GAP-SF133-GTAS"]]],["X09-REL-03",["X09-FILEA-VA-2025-NOYEAR","X09-REC-FILEA-RESOURCE-IDENTITY","FileA_no_year_resource_total_arithmetic",[]]],["X09-REL-04",["X09-FILEA-VA-2025-NOYEAR","X09-REC-FILEA-OBLIGATION-IDENTITY","FileA_no_year_obligation_residual_arithmetic",[]]],["X09-REL-05",["X09-FILEA-VA-2025-NOYEAR","X09-REC-ACCOUNT-SNAPSHOT-MATCH","same_publisher_federal_account_snapshot_crosscheck",[]]],["X09-REL-06",["X09-FILEA-VA-2025-NOYEAR","X09-REC-OBLIGATIONS-OMB-ROUNDED","obligations_compared_OMB_historical_rounded",[]]],["X09-REL-07",["X09-FILEA-VA-2025-NOYEAR","X09-REC-GROSS-OUTLAY-OMB-ROUNDED","gross_outlays_compared_OMB_historical_rounded",[]]],["X09-REL-08",["X09-FILEA-VA-2025-NOYEAR","X09-REC-GROSS-VS-NET-UNRECONCILED","gross_not_equal_net_source_contrast",["X09-GAP-NETTING-LEDGER"]]],["X09-REL-09",["X07-EXEC-2025-SUBTOTAL","X09-REC-GROSS-VS-NET-UNRECONCILED","Treasury_exact_net_versus_FileA_gross_cash",["X09-GAP-NETTING-LEDGER"]]],["X09-REL-10",["X09-FILEA-VA-2025-LEGACY2020","X09-REC-LEGACY2020-SAME-MAGNITUDE","legacy_FY2020_recovery_vs_Treasury_negative_outlay",["X09-GAP-SF133-GTAS"]]],["X09-REL-11",["X07-EXEC-2025-LEGACY2020","X09-REC-LEGACY2020-SAME-MAGNITUDE","historic_Treasury_component_link_no_payment_attribution",["X09-GAP-SF133-GTAS"]]],["X09-REL-12",["X09-FILEA-VA-2025-NOYEAR","X09-REC-OMB-RESOURCES-ROUNDED-DIVERGENCE","FileA_available_resources_vs_OMB_rounded_vintage",["X09-GAP-INDEPENDENT-REVIEW"]]],["X09-REL-13",["X09-CTRL-VA-ALLOTMENT","X09-GAP-VA-FMA-TDA","missing_signed_VA_FMA_TDA",["X09-GAP-VA-FMA-TDA"]]],["X09-REL-14",["X09-CTRL-VA-AAWS","X09-GAP-AAWS-IFAMS","missing_actual_VA_AAWS_iFAMS_posting",["X09-GAP-AAWS-IFAMS"]]],["X09-REL-15",["X09-CTRL-SF133","X09-GAP-SF133-GTAS","missing_original_SF133_fiscal_execution",["X09-GAP-SF133-GTAS"]]],["X09-REL-16",["X09-CTRL-GTAS","X09-GAP-SF133-GTAS","missing_agency_submitted_GTAS_original",["X09-GAP-SF133-GTAS"]]],["X09-REL-17",["X09-CTRL-NETTING","X09-GAP-NETTING-LEDGER","missing_source_level_gross_net_crosswalk",["X09-GAP-NETTING-LEDGER"]]],["X09-REL-18",["X09-CTRL-PAYMENT","X09-GAP-INDIVIDUAL-PAYMENT","missing_specific_Treasury_payment_evidence",["X09-GAP-INDIVIDUAL-PAYMENT"]]]]);
const STAGES=new Map([["legal_and_fiscal_baseline",["CONST-US-ART-01-SEC-09-CL-07","X06-ACCOUNT-VA-0102","X08-OMB-REV-04","X08-TRACE-VA-2025-0102","X07-EXEC-2025-SUBTOTAL","X07-EXEC-2025-LEGACY2020"]],["account_original_custody",["SRC-X09-TREASURY-FILEA-ZIP","SRC-X09-TREASURY-FILEA-CSV","SRC-X09-TREASURY-SNAPSHOT","SRC-X09-TREASURY-SUBMISSION-HISTORY"]],["treasury_account_balances",["X09-FILEA-VA-2025-NOYEAR","X09-FILEA-VA-2025-LEGACY2020"]],["resources_and_obligations",["X09-REC-FILEA-RESOURCE-IDENTITY","X09-REC-FILEA-OBLIGATION-IDENTITY","X09-REC-ACCOUNT-SNAPSHOT-MATCH"]],["apportionment_cash_comparisons",["X09-REC-OMB-APRIL-PLAN-BRIDGE","X09-REC-OBLIGATIONS-OMB-ROUNDED","X09-REC-GROSS-OUTLAY-OMB-ROUNDED","X09-REC-GROSS-VS-NET-UNRECONCILED","X09-REC-LEGACY2020-SAME-MAGNITUDE","X09-REC-OMB-RESOURCES-ROUNDED-DIVERGENCE"]],["execution_control_requirements",["X09-CTRL-VA-ALLOTMENT","X09-CTRL-VA-AAWS","X09-CTRL-SF133","X09-CTRL-GTAS","X09-CTRL-NETTING","X09-CTRL-PAYMENT"]],["qualification_gates",["X09-GAP-VA-FMA-TDA","X09-GAP-AAWS-IFAMS","X09-GAP-SF133-GTAS","X09-GAP-NETTING-LEDGER","X09-GAP-INDIVIDUAL-PAYMENT","X09-GAP-FILEA-SIGNER","X09-GAP-INDEPENDENT-REVIEW","X09-GAP-INSTITUTIONAL-WORM"]]]);
const NUMERIC=new Map([["X09-REC-FILEA-RESOURCE-IDENTITY",[{"opening":440868818073,"adjustments":87876024853,"appropriations":21255257900000,"source_total":21784002742926},"exact_arithmetic_verified_from_original_cents","within_original_File_A_account_row_arithmetic",[]]],["X09-REC-FILEA-OBLIGATION-IDENTITY",[{"resources":21784002742926,"obligations":20314422669736,"unobligated":1469580073190},"exact_arithmetic_verified_from_original_cents","within_original_File_A_account_row_arithmetic",[]]],["X09-REC-ACCOUNT-SNAPSHOT-MATCH",[{"resources":21784002742926,"obligations":20314422669736,"unobligated":1469580073190,"gross_outlay":20151035530281},"same_publisher_reproduction_verified_not_independent_primary_GTAS","same_publisher_account_snapshot_crosscheck",[]]],["X09-REC-OMB-APRIL-PLAN-BRIDGE",[{"OMB_approved_plan_resources":21864126718100,"FileA_reported_resources":21784002742926,"total_difference":80123975174,"OMB_anticipated_prior_recoveries":168000000000,"FileA_reported_prior_recoveries":87876024853,"estimated_vs_reported_recoveries_difference":80123975147,"OMB_rounded_opening_balance":440868818100,"FileA_reported_opening_balance":440868818073,"opening_precision_difference":27,"appropriations_both":21255257900000},"arithmetic_bridge_confirmed_comparability_and_instrument_signoff_unqualified","dated_planned_vs_reported_resource_component_arithmetic",["X09-GAP-SF133-GTAS","X09-GAP-INDEPENDENT-REVIEW"]]],["X09-REC-OBLIGATIONS-OMB-ROUNDED",[{"FileA_obligations":20314422669736,"OMB_published_rounded_obligations":20314400000000,"absolute_difference":22669736,"tolerance_nearest_million":50000000},"rounded_OMB_account_aggregate_numerically_consistent","original_fileA_obligations_to_OMB_nearest_million_report",[]]],["X09-REC-GROSS-OUTLAY-OMB-ROUNDED",[{"FileA_gross_outlays":20151035530281,"OMB_published_rounded_gross_outlays":20151000000000,"absolute_difference":35530281,"tolerance_nearest_million":50000000},"rounded_OMB_account_aggregate_numerically_consistent","original_fileA_gross_outlay_to_OMB_nearest_million_report",[]]],["X09-REC-GROSS-VS-NET-UNRECONCILED",[{"FileA_gross_outlays":20151035530281,"Treasury_combined_subtotal_net_outlays":20067078336435,"gross_minus_net_difference":83957193846,"OMB_rounded_net_outlays":20067100000000,"OMB_rounded_offsetting_collections":83900000000},"numerical_difference_observed_but_comparability_accounting_adjustments_unqualified","cross_source_gross_outlay_vs_Treasury_net_aggregates_not_source_level_netting_proof",["X09-GAP-NETTING-LEDGER","X09-GAP-SF133-GTAS"]]],["X09-REC-LEGACY2020-SAME-MAGNITUDE",[{"FileA_legacy_prior_year_recoveries":2440000000,"Treasury_legacy_net_outlays":-2440000000,"FileA_legacy_gross_outlays":0},"same_magnitude_source_observation_not_causal_transaction_link","historical_component_comparable_amount_distinct_accounting_basis",["X09-GAP-SF133-GTAS"]]],["X09-REC-OMB-RESOURCES-ROUNDED-DIVERGENCE",[{"FileA_reported_resources":21784002742926,"OMB_rounded_resources":21784100000000,"difference":97257074,"tolerance_nearest_million":50000000},"unresolved_vintage_or_reporting_scope_difference_not_fraud_inference","later_revised_fileA_available_resources_vs_earlier_OMB_historical_account_estimate",["X09-GAP-SF133-GTAS","X09-GAP-INDEPENDENT-REVIEW"]]]]);
const GAPS=["X09-GAP-VA-FMA-TDA","X09-GAP-AAWS-IFAMS","X09-GAP-SF133-GTAS","X09-GAP-NETTING-LEDGER","X09-GAP-INDIVIDUAL-PAYMENT","X09-GAP-FILEA-SIGNER","X09-GAP-INDEPENDENT-REVIEW","X09-GAP-INSTITUTIONAL-WORM"];
const CONTROL_IDS=["X09-CTRL-VA-ALLOTMENT","X09-CTRL-VA-AAWS","X09-CTRL-SF133","X09-CTRL-GTAS","X09-CTRL-NETTING","X09-CTRL-PAYMENT"];
const METRIC=Object.freeze({
 resources:21784002742926,
 obligation:20314422669736,
 unobligated:1469580073190,
 appropriations:21255257900000,
 opening:440868818073,
 adjustment:87876024853,
 gross_outlay:20151035530281,
 treasury_net:20067078336435,
 budget_omb_april:21864126718100
});
const errorsign=(errors,message)=>errors.push("INC09 "+message);
export function validateInc09({manifest,collections,raw,ancestorRecords=new Map(),ancestorSources=new Map()}){
 const errors=[],bad=msg=>errorsign(errors,msg),index=new Map(ancestorRecords),src=new Map(ancestorSources);
 let original;
 try{original=validateFileAOriginals(raw)}catch(e){bad(String(e.message||e));return {errors};}
 const extension=manifest?.federal_va_account_reporting_09_extension;
 if(extension?.id!=="ARFI-FED-X09-VA-COMP-PENSIONS-FY2025-FILEA"||
   extension.parent_trace_id!=="X08-TRACE-VA-2025-0102"||extension.federal_account!=="036-0102"||
   extension.fiscal_year!==2025||extension.fiscal_period!==12||
   extension.evidence_class!=="Treasury_USAspending_agency_File_A_account_balances_public_original"||
   extension.original_TAS_FileA_issuer_ZIP_byte_verified!==true||
   extension.original_TAS_FileA_CSV_member_byte_verified!==true||
   extension.account_API_report_original_verified!==true||
   extension.agency_period_certification_history_preserved!==true||
   extension.mandatory_evidence_gaps!==8||
   extension.official_FileA_zip_sha256!=="3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0"||
   extension.official_FileA_csv_sha256!=="e7f8508491ea56275aceda89e5d91f9c6466ac13d251ec0b86c21294cc1b8a2a"||
   extension.official_FileA_issuer_artifact_workflow_run!==39146963169)
   bad("source original, account, capture provenance or mandatory gap publication contract mutated");
 const notQualified=["FileA_independent_original_signer_signature_verified","original_VA_signed_SF133_captured",
 "original_raw_agency_GTAS_captured","actual_signed_VA_FMA_TDA_captured","agency_AAWS_iFAMS_evidence_captured",
 "individual_payment_transaction_verified","account_gross_to_net_reconciliation_qualified",
 "source_account_vintage_comparison_independently_reviewed",
 "institutionally_approved_immutable_source_custody","legal_and_finance_review_complete"];
 for(const flag of notQualified)if(extension?.[flag]!==false)bad("unearned signer, execution or WORM approval status "+flag);
 if(manifest?.federal_primary_execution_custody_08_extension?.id!=="ARFI-FED-X08-VA-COMP-PENSIONS-2025"||
    manifest?.federal_treasury_execution_07_extension?.id!=="ARFI-FED-X07-VA-ACCOUNT-0102-FY2025")
  bad("lost canonical source-account predecessor");
 for(const fam of FAMILIES){
  const path="model/federal/x09-"+fam+".json",v=collections?.[fam],items=Array.isArray(v?.items)?v.items:[];
  if(!manifest?.models?.includes(path)||v?.model_family!=="inc09-"+fam||
    v?.model_version!=="0.1.0"||items.length!==COUNTS[fam])
   bad("missing registered canonical model or count "+fam);
  for(const item of items){
   if(!item?.id||!item.type||!item.title||index.has(item.id)||
    !/^(SRC-X09|X09)-[A-Z0-9-]+$/.test(item.id))
    bad("duplicate or malformed source/model record "+item?.id);
   index.set(item.id,item);
   if(fam==="sources")src.set(item.id,item);
  }
 }
 const sourceItems=collections.sources.items, rows=collections["file-a-rows"].items,
  reconciliations=collections.reconciliations.items, controls=collections.controls.items,
  gaps=collections.gaps.items,relations=collections.relationships.items,trace=collections.traces.items[0];
 for(const x of sourceItems){
  const e=SOURCES.get(x.id);
  if(!e||x.government_publisher_url!==e[0]||x.publisher_original_response_sha256!==e[1]||
   x.original_response_bytes!==e[2]||x.original_archived_in_git_path!==e[3]||
   x.source_category!==e[4]||
   x.publisher!=="U.S. Department of the Treasury, Bureau of the Fiscal Service / USAspending.gov"||
   x.is_publisher_original_body_preserved!==true||
   x.is_signed_SF133_original!==false||x.is_original_raw_GTAS_submission!==false||
   x.is_source_file_original_signed_by_VA!==false||x.is_independently_qualified_archive_WORM!==false)
    bad("official source origin, original hash, fiscal identity or unsigned source limitations altered "+x.id);
 }
 const modelRows=new Map(rows.map(x=>[x.tas,x]));
 if(modelRows.size!==2||rows.length!==2)bad("no-year and legacy availability component count changed");
 const fieldNames=new Map([
 ["budget_authority_unobligated_balance_brought_forward","opening_unobligated_balance_cents"],
 ["adjustments_to_unobligated_balance_brought_forward_cpe","adjustment_to_unobligated_balance_cents"],
 ["budget_authority_appropriated_amount","appropriated_authority_cents"],
 ["total_other_budgetary_resources_amount","total_other_budgetary_resources_cents"],
 ["total_budgetary_resources","total_budgetary_resources_cents"],
 ["obligations_incurred","obligations_incurred_cents"],
 ["deobligations_or_recoveries_or_refunds_from_prior_year","prior_year_deobligations_recoveries_refunds_cents"],
 ["unobligated_balance","unobligated_balance_cents"],
 ["gross_outlay_amount","gross_outlay_cents"],
 ["status_of_budgetary_resources_total","resource_total_check_cents"]]);
 for(const sourceRow of original.rows){
  const x=modelRows.get(sourceRow.treasury_account_symbol);
  if(!x||x.federal_account!=="036-0102"||x.agency_identifier!=="036"||
   x.main_account!=="0102"||x.sub_account!=="000"||x.fiscal_year!==2025||
   x.submission_period!=="FY2025P12"||x.published_row_last_modified!=="2026-05-15"||
   x.source_signer_authenticated!==false||x.net_outlay_not_reported_in_FileA!==true||
   JSON.stringify(x.source_ids)!==JSON.stringify(["SRC-X09-TREASURY-FILEA-ZIP","SRC-X09-TREASURY-FILEA-CSV"]))
   bad("original account reporting TAS attribution, dates or signer status fabricated "+sourceRow.treasury_account_symbol);
  for(const [field,key] of fieldNames){
   const expected=Number(sourceRow[field].replace(".",""));
   if(!x||!Number.isSafeInteger(x[key])||x[key]!==expected)
    bad("model financial statement diverges from original CSV field "+field+" "+sourceRow.treasury_account_symbol);
  }
 }
 const cur=modelRows.get("036-X-0102-000"),old=modelRows.get("036-2020/2020-0102-000");
 if(cur?.id!=="X09-FILEA-VA-2025-NOYEAR"||
   old?.id!=="X09-FILEA-VA-2025-LEGACY2020"||
   cur?.total_budgetary_resources_cents!==METRIC.resources||
   cur?.obligations_incurred_cents!==METRIC.obligation||
   cur?.unobligated_balance_cents!==METRIC.unobligated||
   cur?.gross_outlay_cents!==METRIC.gross_outlay)
   bad("two-account Treasury no-year/legacy source identity or financial values changed");
 const rt=new Map(reconciliations.map(x=>[x.id,x]));
 for(const [id,[amounts,status,kind,gates]] of NUMERIC){
  const x=rt.get(id);
  if(!x||JSON.stringify(x.amounts_cents)!==JSON.stringify(amounts)||
   x.review_status!==status||x.reconciliation_kind!==kind||
   JSON.stringify(x.unresolved_qualification_gate_ids)!==JSON.stringify(gates)||
   x.allegation_of_missing_or_illegal_spending!==false||
   x.SF133_GTAS_original_matched!==false||
   x.signed_VA_allotment_authenticated!==false||
   x.individual_payment_proven!==false||
   x.independent_source_financial_citator_qualified!==false)
   bad("published fiscal account amounts, temporal class or payment/legal status substituted "+id);
 }
 const plan=rt.get("X09-REC-OMB-APRIL-PLAN-BRIDGE")?.amounts_cents;
 const m=plan||{};
 if(m.OMB_approved_plan_resources-m.FileA_reported_resources!==m.total_difference||
    m.OMB_anticipated_prior_recoveries-m.FileA_reported_prior_recoveries!==m.estimated_vs_reported_recoveries_difference||
    m.OMB_rounded_opening_balance-m.FileA_reported_opening_balance!==m.opening_precision_difference||
    m.estimated_vs_reported_recoveries_difference+m.opening_precision_difference!==m.total_difference||
    m.appropriations_both!==METRIC.appropriations||
    m.FileA_reported_resources!==METRIC.resources||
    m.OMB_approved_plan_resources!==METRIC.budget_omb_april||
    ancestorRecords.get("X08-OMB-REV-04")?.line_6190_approved_resources_usd!==218641267181)
  bad("original April OMB planned recovery contrast does not arithmetically bridge subsequent File A");
 if(rt.get("X09-REC-FILEA-RESOURCE-IDENTITY")?.amounts_cents?.source_total!==
    METRIC.opening+METRIC.adjustment+METRIC.appropriations||
   METRIC.resources!==METRIC.obligation+METRIC.unobligated)
    bad("original government File A resources or obligations arithmetic incorrect");
 const rounding=rt.get("X09-REC-GROSS-OUTLAY-OMB-ROUNDED")?.amounts_cents;
 if(Math.round(METRIC.gross_outlay/100000000)!==201510||
   Math.round(METRIC.obligation/100000000)!==203144||
   rounding?.absolute_difference!==35530281||
   ancestorRecords.get("X06-METRIC-OUTLAYS-GROSS")?.value_usd!==201510000000||
   ancestorRecords.get("X06-METRIC-OBLIGATIONS")?.value_usd!==203144000000)
  bad("gross and obligations OMB rounded historical amounts not independently consistent");
 if(ancestorRecords.get("X07-EXEC-2025-SUBTOTAL")?.net_outlays_cents!==METRIC.treasury_net||
    rt.get("X09-REC-GROSS-VS-NET-UNRECONCILED")?.amounts_cents?.gross_minus_net_difference!==
     METRIC.gross_outlay-METRIC.treasury_net||
    ancestorRecords.get("X06-METRIC-OFFSETS")?.value_usd!==839000000)
  bad("Treasury net versus File A gross resource reporting basis falsely aligned");
 if(rt.get("X09-REC-OMB-RESOURCES-ROUNDED-DIVERGENCE")?.amounts_cents?.difference!==
     21784100000000-METRIC.resources||
    21784100000000-METRIC.resources<=50000000)
  bad("File A and earlier OMB resource discrepancies improperly treated as nearest-million rounding");
 const controlSet=new Set(CONTROL_IDS);
 if(controls.length!==controlSet.size||
    controls.some(x=>!controlSet.has(x.id)||x.specific_original_acquired!==false||
     x.individual_signed_delegation_verified!==false||x.independent_human_finance_review_complete!==false||
     x.source_report_may_substitute_for_signed_instrument!==false))
  bad("published aggregate promoted to signed agency FMA/TDA/SF133/GTAS/payment approval");
 const gapSet=new Set(GAPS);
 if(gaps.length!==gapSet.size||gaps.some(x=>!gapSet.has(x.id)||
  x.source_original_sha256!==null||x.verified!==false||x.official_authenticating_signature!==null||
  x.specific_reviewing_officer!==null||x.specific_reporting_period_of_instrument!==null||
  x.external_immutable_primary_replica_version_ids!==null||x.independent_approval_date!==null))
  bad("false qualification of unavailable document, independent signer or government WORM");
 for(const fam of FAMILIES.filter(x=>x!=="sources")){
  for(const x of collections[fam].items){
   for(const sid of x.source_ids||[])if(!src.has(sid))bad("unresolvable provenance or wrong source owner "+x.id+"/"+sid);
   for(const gid of x.qualification_gap_ids||x.unresolved_qualification_gate_ids||[])
    if(!gapSet.has(gid))bad("unresolved explicit document gate absent "+x.id+"/"+gid);
  }
 }
 if(trace?.id!=="X09-TRACE-VA-FY2025-0102"||
   trace.parent_trace_id!=="X08-TRACE-VA-2025-0102"||
   trace.account!=="036-0102"||trace.source_report_date!=="2025-09-30"||
   trace.original_FileA_last_modified!=="2026-05-15"||
   trace.original_Treasury_FileA_ZIP_and_CSV_sha_verified!==true||
   trace.agency_period_certification_history_recorded!==true||
   JSON.stringify(trace.row_ids)!==JSON.stringify(["X09-FILEA-VA-2025-NOYEAR","X09-FILEA-VA-2025-LEGACY2020"])||
   JSON.stringify(trace.relationship_ids)!==JSON.stringify([...RELS.keys()])||
   JSON.stringify(trace.reconciliation_ids)!==JSON.stringify([...NUMERIC.keys()])||
   JSON.stringify(trace.mandatory_open_gap_ids)!==JSON.stringify(GAPS))
  bad("governed fiscal evidence trace incorrect or missing predecessor references");
 const flags=["file_specific_certifying_official_signature_verified","government_original_SF133_received",
  "agency_original_GTAS_received","actual_VA_signed_FMA_TDA_received","actual_AAWS_iFAMS_received",
  "specific_beneficiary_payment_authenticated","source_level_net_gross_ledger_reconciled",
  "institutional_immutable_custody_approved","independent_qualified_financial_review_completed"];
 for(const k of flags)if(trace?.[k]!==false)bad("unearned account source approval or individual payment "+k);
 const visible=new Set();
 for(const stage of trace?.stages||[]){
  if(JSON.stringify(stage.record_ids)!==JSON.stringify(STAGES.get(stage.id)))bad("source-derived fiscal stage scope or gate misplaced "+stage.id);
  for(const id of stage.record_ids||[]){if(!index.has(id))bad("dangling source trace "+id);visible.add(id)}
 }
 if(trace?.stages?.length!==STAGES.size||GAPS.some(x=>!visible.has(x)))bad("missing stage or unresolved execution documentary gate");
 for(const rel of relations){
  const exp=RELS.get(rel.id);
  if(!exp||rel.from_id!==exp[0]||rel.to_id!==exp[1]||
   rel.relationship_type!==exp[2]||
   JSON.stringify(rel.qualification_gap_ids)!==JSON.stringify(exp[3])||
   !visible.has(rel.from_id)||!visible.has(rel.to_id))
   bad("original File A vs institutional control/OMB/Treasury typed relationship changed "+rel.id);
  for(const f of ["individual_payment_authorized","account_allotment_document_signed",
   "SF133_original_independently_qualified","raw_GTAS_original_independently_qualified","source_to_payment_causal_proof"])
   if(rel[f]!==false)bad("unqualified legal execution claimed by typed edge "+rel.id);
 }
 const constitution=[...ancestorRecords.values()].filter(x=>x.type==="constitutional_provision");
 if(constitution.filter(x=>x.unit==="article").length!==7||
  constitution.filter(x=>x.unit==="amendment").length!==27||
  ancestorRecords.get("CONST-US-ART-07")?.effect_status!=="expired")
   bad("constitutional legal-effect model mutated by account reporting");
 return {errors,counts:COUNTS,original_bytes:{
  ZIP:859,CSV:1943,account_snapshot:320,agency_submission_history:363},
 source_qualification:"verified_Treasury_published_FileA_and_FY2025_account_reporting_not_signed_SF133_or_GTAS",
 fiscal:METRIC,mandatory_unresolved_gates:8,
 agency_history_scope:"agency_period_metadata_not_individual_file_specific_signed_custody"};
}
