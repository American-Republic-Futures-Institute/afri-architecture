// INC-10 deterministic source-original VA fiscal gross/net classification contract.
// Official budget aggregates are NOT original agency vouchers, ledger records or signed SF133.
import fs from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
export const INC10_FAMILIES=["sources","offset-lines","reconciliations","gaps","relationships","traces"];
const EXPECTED_COUNTS={"sources":2,"offset-lines":10,"reconciliations":8,"gaps":9,"relationships":9,"traces":1};
const SOURCE_PINS=new Map([["SRC-X10-TREASURY-CS25-ORIGINAL","https://fiscal.treasury.gov/system/files/files/reports-statements/combined-statement/cs2025/c42.pdf","eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089",662885,"evidence/va-fy2025/inc10-originals/sha256/eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089.pdf","U.S. Treasury Bureau of the Fiscal Service"],["SRC-X10-OMB-FY27-VA-ORIGINAL","https://www.whitehouse.gov/wp-content/uploads/2026/04/vet_fy2027.pdf","6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da",514363,"evidence/va-fy2025/inc10-originals/sha256/6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da.pdf","U.S. Office of Management and Budget"]]);
const OMB_LINE_PINS=new Map([["X10-OFFSET-LINE-1930","1930",217841,10,"budget_resources_actual_rounded"],["X10-OFFSET-LINE-3010","3010",203144,10,"obligations_actual_rounded"],["X10-OFFSET-LINE-4110","4110",201510,11,"gross_outlay_actual_rounded"],["X10-OFFSET-LINE-4120","4120",-24,11,"federal_offsetting_collections_actual_rounded"],["X10-OFFSET-LINE-4123","4123",-815,11,"nonfederal_offsetting_collections_actual_rounded"],["X10-OFFSET-LINE-4130","4130",-839,11,"gross_to_net_offsets_actual_rounded"],["X10-OFFSET-LINE-4142","4142",24,11,"expired_account_offsets_budget_authority_only_rounded"],["X10-OFFSET-LINE-4143","4143",815,11,"paid_obligation_recoveries_budget_authority_only_rounded"],["X10-OFFSET-LINE-4150","4150",839,11,"budget_authority_only_offsets_actual_rounded"],["X10-OFFSET-LINE-4170","4170",200671,11,"net_outlay_actual_rounded"]]);
const RECON_PINS=new Map([["X10-REC-OMB-OFFSETS-CATEGORY",{"federal_millions":-24,"nonfederal_millions":-815,"total_offsets_millions":-839,"reported_gross_outlays_millions":201510,"reported_net_outlays_millions":200671},"source_class_and_reporting_period_verified_rounded_not_exact_cent",[],["SRC-X10-OMB-FY27-VA-ORIGINAL"]],["X10-REC-CASH-ORIGINAL",{"no_year_net_outlays_cents":20069518336435,"legacy_2020_net_outlays_cents":-2440000000,"account_subtotal_net_outlays_cents":20067078336435},"original_publisher_PDF_account_cash_receipts_replayed",[],["SRC-X10-TREASURY-CS25-ORIGINAL"]],["X10-REC-FILEA-GROSS-OMB",{"FileA_gross_cents":20151035530281,"OMB_rounded_gross_millions":201510,"absolute_difference_from_rounded_cents":35530281},"source_granularity_and_period_compatible_at_million_precision_but_different_vintage",[],["SRC-X09-TREASURY-FILEA-CSV","SRC-X10-OMB-FY27-VA-ORIGINAL"]],["X10-REC-TREASURY-NET-OMB",{"Treasury_exact_net_cents":20067078336435,"OMB_rounded_net_millions":200671,"absolute_difference_from_rounded_cents":21663565},"source_granularity_and_period_compatible_at_million_precision_but_different_vintage",[],["SRC-X10-TREASURY-CS25-ORIGINAL","SRC-X10-OMB-FY27-VA-ORIGINAL"]],["X10-REC-GROSS-NET-DELTA",{"FileA_gross_cents":20151035530281,"Treasury_net_cents":20067078336435,"observed_difference_cents":83957193846,"OMB_published_total_offsets_millions":839,"observed_difference_above_OMB_rounded_offsets_cents":57193846,"one_rounded_million_half_width_cents":50000000},"same_FY_different_measurement_basis_and_source_vintages_observed_only_OMB_total_does_not_round_from_exact_difference",["X10-GAP-EXACT-NETTING","X10-GAP-INDEPENDENT-REVIEW"],["SRC-X09-TREASURY-FILEA-CSV","SRC-X10-TREASURY-CS25-ORIGINAL","SRC-X10-OMB-FY27-VA-ORIGINAL"]],["X10-REC-RESOURCE-REVISION",{"OMB_rounded_resources_cents":21784100000000,"FileA_revised_resources_cents":21784002742926,"difference_cents":97257074,"half_million_tolerance_cents":50000000},"different_publisher_vintage_OMB_2026_04_versus_later_Treasury_FileA_modified_2026_05_15_unreconciled",["X10-GAP-OMB-RESOURCE-VINTAGE","X10-GAP-INDEPENDENT-REVIEW"],["SRC-X10-OMB-FY27-VA-ORIGINAL","SRC-X09-TREASURY-FILEA-CSV","SRC-X09-TREASURY-SUBMISSION-HISTORY"]],["X10-REC-BUDGET-OFFSETS-NOT-DOUBLE",{"gross_outlays_offset_millions":-839,"budget_authority_only_offset_millions":839,"net_budget_authority_impact_millions":0},"same_OMB_budget_account_rounded_categories_distinct_effect_no_double_count",[],["SRC-X10-OMB-FY27-VA-ORIGINAL"]],["X10-REC-HISTORIC-COMPONENT",{"Treasury_legacy_net_cents":-2440000000,"FileA_legacy_recovery_cents":2440000000},"observed_magnitude_only_incompatible_accounting_flow_semantics",["X10-GAP-VA-SF133-GTAS"],["SRC-X10-TREASURY-CS25-ORIGINAL","SRC-X09-TREASURY-FILEA-CSV"]]]);
const REL_PINS=new Map([["X10-REL-01","X10-REC-OMB-OFFSETS-CATEGORY","X10-OFFSET-LINE-4130","within_OMB_published_offset_total"],["X10-REL-02","X10-REC-OMB-OFFSETS-CATEGORY","X10-OFFSET-LINE-4170","within_OMB_published_net_cash"],["X10-REL-03","X10-REC-CASH-ORIGINAL","X07-EXEC-2025-SUBTOTAL","original_Treasury_net_cash_confirms_historical_model"],["X10-REL-04","X10-REC-FILEA-GROSS-OMB","X09-FILEA-VA-2025-NOYEAR","source_FileA_gross_OMB_rounded_context"],["X10-REL-05","X10-REC-TREASURY-NET-OMB","X07-EXEC-2025-SUBTOTAL","source_Treasury_net_OMB_rounded_context"],["X10-REL-06","X10-REC-GROSS-NET-DELTA","X10-GAP-EXACT-NETTING","exact_netting_remains_unqualified"],["X10-REL-07","X10-REC-RESOURCE-REVISION","X10-GAP-OMB-RESOURCE-VINTAGE","source_vintage_exceeds_roundoff"],["X10-REL-08","X10-REC-BUDGET-OFFSETS-NOT-DOUBLE","X10-OFFSET-LINE-4150","budget_authority_offsets_separate_from_outlays"],["X10-REL-09","X10-REC-HISTORIC-COMPONENT","X09-FILEA-VA-2025-LEGACY2020","historical_magnitude_not_a_proven_cash_transfer"]]);
const GAP_IDS=["X10-GAP-EXACT-NETTING","X10-GAP-OMB-RESOURCE-VINTAGE","X10-GAP-VA-SF133-GTAS","X10-GAP-VA-FMA-TDA","X10-GAP-VA-AAWS-IFAMS","X10-GAP-PERSONAL-PAYMENT","X10-GAP-SOURCE-SIGNATURE","X10-GAP-INDEPENDENT-REVIEW","X10-GAP-INSTITUTIONAL-WORM"];
const STAGES=new Map([["law_and_fiscal_basis",["CONST-US-ART-01-SEC-09-CL-07","X06-ACCOUNT-VA-0102","X09-TRACE-VA-FY2025-0102"]],["original_document_custody",["SRC-X10-TREASURY-CS25-ORIGINAL","SRC-X10-OMB-FY27-VA-ORIGINAL"]],["OMB_rounded_offset_categories",["X10-OFFSET-LINE-1930","X10-OFFSET-LINE-3010","X10-OFFSET-LINE-4110","X10-OFFSET-LINE-4120","X10-OFFSET-LINE-4123","X10-OFFSET-LINE-4130","X10-OFFSET-LINE-4142","X10-OFFSET-LINE-4143","X10-OFFSET-LINE-4150","X10-OFFSET-LINE-4170"]],["Treasury_account_cash",["X07-EXEC-2025-NOYEAR","X07-EXEC-2025-LEGACY2020","X07-EXEC-2025-SUBTOTAL","X10-REC-CASH-ORIGINAL"]],["reporting_crosswalks",["X10-REC-OMB-OFFSETS-CATEGORY","X10-REC-FILEA-GROSS-OMB","X10-REC-TREASURY-NET-OMB","X10-REC-GROSS-NET-DELTA","X10-REC-RESOURCE-REVISION","X10-REC-BUDGET-OFFSETS-NOT-DOUBLE","X10-REC-HISTORIC-COMPONENT"]],["legally_restricted_relations",["X10-REL-01","X10-REL-02","X10-REL-03","X10-REL-04","X10-REL-05","X10-REL-06","X10-REL-07","X10-REL-08","X10-REL-09"]],["unresolved_evidence_gates",["X10-GAP-EXACT-NETTING","X10-GAP-OMB-RESOURCE-VINTAGE","X10-GAP-VA-SF133-GTAS","X10-GAP-VA-FMA-TDA","X10-GAP-VA-AAWS-IFAMS","X10-GAP-PERSONAL-PAYMENT","X10-GAP-SOURCE-SIGNATURE","X10-GAP-INDEPENDENT-REVIEW","X10-GAP-INSTITUTIONAL-WORM"]]]);
const reject=msg=>{throw Error("INC10 original source or fiscal contract rejected: "+msg)};
const exactPath=hash=>"evidence/va-fy2025/inc10-originals/sha256/"+hash+".pdf";
const notes={
OMB:"6f5d29b72791cb918905ecaf523adf89d7c40421c28f06d64afcbdd6f9a3b8da",
TREASURY:"eaf1f003f8ec0b85c3b494d46b46eb7084b3cab5a5cd9af25a53cb999aaa0089"
};
const check=(b,why)=>{if(!b)reject(why)};
function originalPDF(s,files){
 const bytes=files?.get(s.original_path);
 check(Buffer.isBuffer(bytes)&&bytes.length===s.original_bytes&&
 sha(bytes)===s.original_sha256&&bytes.subarray(0,5).equals(Buffer.from("%PDF-")),
 "original body is absent, mismatched or not an original PDF "+s.id);
 return bytes;
}
function readIssuerTable(pdf,{page}){
 const p=execFileSync("pdftotext",["-f",String(page),"-l",String(page),"-layout","-","-"],
 {input:pdf,encoding:"utf8",maxBuffer:2000000,timeout:7000});
 if(p.length<500)reject("publisher page "+page+" lacks readable original statement");
 return p;
}
function assertOriginalIssuerRows({treasury,omb}){
 const t=readIssuerTable(treasury,{page:4});
 check(t.includes("Compensation and Pensions")&&t.includes("036   0102   000")&&
  t.includes("200,695,183,364.35")&&t.includes("-24,400,000.00")&&
  t.includes("200,670,783,364.35"),
 "Treasury original FY2025 page 4 036-0102 account cash row or original period is absent");
 const early=readIssuerTable(omb,{page:10}),later=readIssuerTable(omb,{page:11});
 const patterns=[
 ["1930",/1930s+Total budgetary resources available[^
]{0,125}217,841/],
 ["3010",/3010s+New obligations[^
]{0,135}203,144/]
 ];
 for(const [k,p]of patterns)check(p.test(early),"original OMB p10 FY2025 account 036-0102 line "+k+" differs");
 const match=[
 ["4110",/4110s+Outlays, gross[^
]{0,125}201,510/],
 ["4120",/4120s+Federal sources[^
]{0,135}-24/],
 ["4123",/4123s+Non-Federal sources[^
]{0,135}-815/],
 ["4130",/4130s+Offsets against gross[^
]{0,145}-839/],
 ["4142",/4142s+Offsetting collections credited to expired accounts[^
]{0,135}24/],
 ["4150",/4150s+Additional offsets against budget authority only[^
]{0,155}839/],
 ["4170",/4170s+Outlays, net[^
]{0,135}200,671/]
 ];
 for(const [k,p] of match)check(p.test(later),"original OMB p11 FY2025 account 036-0102 line "+k+" differs");
 check(later.includes("4143")&&later.includes("Recoveries of prior year paid obligations")&&
  later.includes("815"),"OMB p11 separate line 4143 prior-year paid-obligation recoveries source missing");
 return {Treasury_pdf_text_page:4,OMB_pdf_text_pages:[10,11],publisher_source_rows_replayed:true};
}
export function validateINC10({manifest,collections,originalBytes,ancestorRecords=new Map(),ancestorSources=new Map()}){
 const errors=[],bad=x=>errors.push("INC10 "+x),index=new Map(ancestorRecords),sources=new Map(ancestorSources);
 const e=manifest?.federal_fiscal_reporting_reconciliation_10_extension;
 if(e?.id!=="ARFI-FED-X10-VA-GROSS-NET-FY2025"||e.parent_trace_id!=="X09-TRACE-VA-FY2025-0102"||
  e.account!=="036-0102"||e.fiscal_year!==2025||e.preserved_original_government_PDF_count!==2||
  e.Treasury_pdf_source_sha256!==notes.TREASURY||e.OMB_appendix_pdf_source_sha256!==notes.OMB||
  e.source_amount_exact_cash_and_budget_millions_distinguished!==true||
  e.unresolved_source_evidence_gates!==9)
  bad("unsupported source-original canonical extension");
 const unchecked=["exact_gross_to_net_offset_original_ledger_acquired",
  "OMB_resource_vintage_explained_by_original_revision","VA_specific_signed_FMA_TDA_available",
  "VA_original_signed_SF133_GTAS_available","individual_payment_verified",
  "government_PDF_signer_crypto_authenticated","institutional_WORM_and_legal_approval"];
 for(const k of unchecked)if(e?.[k]!==false)bad("unearned independent legal/fiscal signoff "+k);
 if(manifest?.federal_va_account_reporting_09_extension?.id!=="ARFI-FED-X09-VA-COMP-PENSIONS-FY2025-FILEA"||
 manifest?.federal_primary_execution_custody_08_extension?.id!=="ARFI-FED-X08-VA-COMP-PENSIONS-2025")
 bad("broken INC08/INC09 source-lineage prerequisite");
 const grouped={};
 for(const fam of INC10_FAMILIES){
  const v=collections?.[fam],items=Array.isArray(v?.items)?v.items:[];
  grouped[fam]=items;
  if(v?.model_version!==manifest.model_version||v?.model_family!=="inc10-"+fam||
   !manifest.models?.includes("model/federal/x10-"+fam+".json")||items.length!==EXPECTED_COUNTS[fam])
   bad("unsupported X10 research collection or model register "+fam);
  for(const x of items){
   if(!/^(SRC-X10|X10)-[A-Z0-9-]+$/.test(x?.id||"")||index.has(x.id)||!x.title||!x.type)
    bad("invalid or duplicated fiscal evidence ID "+x?.id);
   index.set(x.id,x);
   if(fam==="sources")sources.set(x.id,x);
  }
 }
 const originals=new Map();
 for(const x of grouped.sources){
  const p=SOURCE_PINS.get(x.id);
  if(!p||x.url!==p[0]||x.original_sha256!==p[1]||x.original_bytes!==p[2]||
   x.original_path!==p[3]||x.publisher!==p[4]||x.original_path!==exactPath(x.original_sha256)||
   x.source_account!=="036-0102"||x.reporting_period_end!=="2025-09-30"||
   x.source_original_bytes_in_git!==true||x.original_issuer_signature_independently_authenticated!==false||
   x.institutional_WORM_qualified!==false||x.independent_accounting_opinion_complete!==false)
   bad("original government report URL, SHA256, reporting period or legal status mutated "+x.id);
  try{originals.set(x.id,originalPDF(x,originalBytes))}catch(err){bad(err.message)}
 }
 if(originals.size===2){
  try{assertOriginalIssuerRows({treasury:originals.get("SRC-X10-TREASURY-CS25-ORIGINAL"),
    omb:originals.get("SRC-X10-OMB-FY27-VA-ORIGINAL")});}
  catch(err){bad(err.message)}
 }
 const offset=new Map(grouped["offset-lines"].map(x=>[x.id,x]));
 for(const [id,code,amount,page,kind]of OMB_LINE_PINS){
  const x=offset.get(id);
  if(!x||x.OMB_line_code!==code||x.amount_reported_millions_usd!==amount||
   x.pdf_page!==page||x.kind!==kind||x.unit!=="millions_of_US_dollars"||
   x.reporting_year!==2025||x.publisher_budget_year!==2027||
   x.source_line_individually_digitally_signed!==false||
   x.exact_sub_million_amount_obtained!==false||
   x.instrument_attesting_individual_ledger_present!==false||
   JSON.stringify(x.source_ids)!==JSON.stringify(["SRC-X10-OMB-FY27-VA-ORIGINAL"]))
   bad("OMB historical line was misrepresented as exact, changed or falsely signed "+id);
 }
 const rcs=new Map(grouped.reconciliations.map(x=>[x.id,x]));
 for(const [id,amounts,status,gates,sourceIds]of RECON_PINS){
  const x=rcs.get(id);
  if(!x||JSON.stringify(x.amounts)!==JSON.stringify(amounts)||
   x.classification_status!==status||JSON.stringify(x.qualification_gap_ids)!==JSON.stringify(gates)||
   JSON.stringify(x.source_ids)!==JSON.stringify(sourceIds)||
   x.exact_offset_ledger_verified!==false||x.single_payment_causal_link_verified!==false||
   x.account_cash_and_budgetary_resources_equivalent!==false||
   x.professional_fiscal_controls_opinion_signed!==false)
   bad("fiscal source periods, amounts, status or evidence gaps falsified "+id);
 }
 const value=id=>rcs.get("X10-REC-"+id)?.amounts||{};
 const categories=value("OMB-OFFSETS-CATEGORY");
 if(categories.federal_millions+categories.nonfederal_millions!==categories.total_offsets_millions||
    categories.reported_gross_outlays_millions+categories.total_offsets_millions!==categories.reported_net_outlays_millions)
  bad("OMB same-document historical offset arithmetic incorrect");
 const cash=value("CASH-ORIGINAL");
 if(cash.no_year_net_outlays_cents+cash.legacy_2020_net_outlays_cents!==cash.account_subtotal_net_outlays_cents||
    ancestorRecords.get("X07-EXEC-2025-SUBTOTAL")?.net_outlays_cents!==cash.account_subtotal_net_outlays_cents)
  bad("Treasury exact cents, historical component or source publication mismatched");
 const gross=value("GROSS-NET-DELTA"),resource=value("RESOURCE-REVISION");
 if(gross.FileA_gross_cents-gross.Treasury_net_cents!==gross.observed_difference_cents||
    gross.observed_difference_cents-gross.OMB_published_total_offsets_millions*100000000!==
       gross.observed_difference_above_OMB_rounded_offsets_cents||
    gross.observed_difference_above_OMB_rounded_offsets_cents<=gross.one_rounded_million_half_width_cents||
    gross.observed_difference_cents!==83957193846||
    resource.OMB_rounded_resources_cents-resource.FileA_revised_resources_cents!==resource.difference_cents||
    resource.difference_cents!==97257074||
    resource.difference_cents<=resource.half_million_tolerance_cents||
    ancestorRecords.get("X09-FILEA-VA-2025-NOYEAR")?.gross_outlay_cents!==gross.FileA_gross_cents||
    ancestorRecords.get("X09-FILEA-VA-2025-NOYEAR")?.total_budgetary_resources_cents!==resource.FileA_revised_resources_cents)
  bad("exact-vs-rounded source-vintage mismatch falsely normalized, unexplained or erased");
 const g=new Set(GAP_IDS);
 if(new Set(grouped.gaps.map(x=>x.id)).size!==g.size||
  grouped.gaps.some(x=>!g.has(x.id)||x.verified!==false||
   x.primary_signed_instrument_original_sha256!==null||x.source_account_reporting_period_verified!==false||
   x.independent_auditor_id!==null||x.approved_on!==null||
   x.governmental_document_signature_verified!==false||
   x.private_internal_execution_source_available!==false||x.independently_qualified_WORM_storage!==false))
   bad("original SF133, VA signed allotment, independent review or WORM gate incorrectly closed");
 const trace=grouped.traces[0];
 if(trace?.id!=="X10-TRACE-VA-FY2025-0102"||trace.parent_trace_id!=="X09-TRACE-VA-FY2025-0102"||
    trace.official_treasury_pdf_sha256!==notes.TREASURY||trace.official_OMB_pdf_sha256!==notes.OMB||
    trace.original_PDF_source_bytes_versioned_in_Git!==true||
    trace.exact_account_level_offsets_verified!==false||
    trace.complete_FY2025_SF133_GTAS_signed_origins_received!==false||
    trace.account_specific_allotment_verified!==false||
    trace.independently_qualified_cross_source_vintage_reconciliation!==false||
    trace.institutional_WORM_signing_approved!==false||
    trace.individual_program_payment_verified!==false||
    JSON.stringify(trace.relationship_ids)!==JSON.stringify([...REL_PINS.keys()])||
    JSON.stringify(trace.reconciliation_ids)!==JSON.stringify([...RECON_PINS.keys()])||
    JSON.stringify(trace.required_open_gate_ids)!==JSON.stringify(GAP_IDS))
  bad("unqualified source chain or legal entitlement represented as verified");
 const shown=new Set();
 for(const stage of trace?.stages||[]){
  const exp=STAGES.get(stage.id);
  if(!exp||JSON.stringify(stage.record_ids)!==JSON.stringify(exp))bad("stage-local fiscal evidence or gap was removed "+stage.id);
  for(const id of stage.record_ids||[]){if(!index.has(id))bad("dangling staged source "+id);shown.add(id)}
 }
 if(trace?.stages?.length!==7||GAP_IDS.some(x=>!shown.has(x)))bad("incomplete publication / missing independent legal evidence gates");
 for(const x of grouped.relationships){
  const expected=REL_PINS.get(x.id);
  if(!expected||x.from_id!==expected[0]||x.to_id!==expected[1]||
   x.relationship_type!==expected[2]||!shown.has(x.from_id)||!shown.has(x.to_id)||
   x.exact_cash_ledger_equivalence_claimed!==false||x.authorized_individual_payment_claimed!==false||
   x.signed_appropriation_allotment_established!==false||x.qualified_financial_audit_completed!==false)
   bad("unbounded fiscal relationship or lost legal limitation "+x.id);
 }
 const constitution=[...ancestorRecords.values()].filter(x=>x.type==="constitutional_provision");
 if(constitution.filter(x=>x.unit==="article").length!==7||
   constitution.filter(x=>x.unit==="amendment").length!==27||
   ancestorRecords.get("CONST-US-ART-07")?.effect_status!=="expired")
   bad("constitutional provision legal status changed");
 return {errors,models:Object.fromEntries(INC10_FAMILIES.map(x=>[x,grouped[x].length])),
  originals_confirmed:originals.size,original_bytes:1177248,
  evidence_classification:"government_original_PDF_and_official_source_reporting_verified_without_specific_actual_offset_ledger",
  exact_gross_to_net_reconciliation_qualified:false,fiscal_year:2025,open_evidence_gates:9};
}
