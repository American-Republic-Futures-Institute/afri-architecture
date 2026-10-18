// INC-06: semantic validation of historical VA FY2025 public account funding, fiscal states and legal boundaries.
// Validation establishes source consistency and arithmetic, NEVER a legal authorization or successful payment.
export const X06_FAMILIES=["sources","enactments","accounts","actors","programs","controls","metrics","outcomes","gaps","relationships","traces"];
const COUNTS={sources:11,enactments:2,accounts:1,actors:3,programs:1,controls:6,metrics:9,outcomes:2,gaps:9,relationships:32,traces:1};
const S=(id)=>"X06-METRIC-"+id;
const REQUIRED_VALUES={
 "X06-METRIC-ENACTED-FY25":212552579000,
 "X06-METRIC-BA-GROSS":212553000000,
 "X06-METRIC-AVAILABLE-RESOURCES":217841000000,
 "X06-METRIC-UNOBLIGATED-OPEN":5288000000,
 "X06-METRIC-OBLIGATIONS":203144000000,
 "X06-METRIC-OUTLAYS-GROSS":201510000000,
 "X06-METRIC-OFFSETS":839000000,
 "X06-METRIC-OUTLAYS-NET":200671000000,
 "X06-METRIC-UNOBLIGATED-CLOSE":14697000000
};
const SOURCES={
 "SRC-X06-PL118-42":"https://www.govinfo.gov/content/pkg/PLAW-118publ42/html/PLAW-118publ42.htm",
 "SRC-X06-PL119-4":"https://www.govinfo.gov/content/pkg/PLAW-119publ4/html/PLAW-119publ4.htm",
 "SRC-X06-OMB27-VA":"https://www.whitehouse.gov/wp-content/uploads/2026/04/vet_fy2027.pdf",
 "SRC-X06-38-301":"https://uscode.house.gov/us/usc/119-120/t38/s301/",
 "SRC-X06-38-306":"https://uscode.house.gov/us/usc/119-120/t38/s306/",
 "SRC-X06-38-1110":"https://uscode.house.gov/us/usc/119-120/t38/s1110/",
 "SRC-X06-31-1512":"https://uscode.house.gov/us/usc/119-120/t31/s1512/",
 "SRC-X06-31-712":"https://uscode.house.gov/us/usc/119-120/t31/s712/",
 "SRC-X06-GAO-2025":"https://www.gao.gov/products/gao-26-108789",
 "SRC-X06-VA-ORGS":"https://department.va.gov/administrations-and-offices/",
 "SRC-X06-VA-FINANCE":"https://department.va.gov/about/va-plans-budget-finances-and-performance/"
};
const EXPECTED_EDGE_CONTRACT=new Map([["X06-REL-01",["CONST-US-ART-01-SEC-09-CL-07","X06-APP-PL11842-FY25","constitutional_appropriation_requirement"]],["X06-REL-02",["CONST-US-ART-01-SEC-09-CL-07","X06-APP-PL1194-FY25","constitutional_appropriation_requirement"]],["X06-REL-03",["X06-APP-PL11842-FY25","X06-ACCOUNT-VA-0102","enacted_advance_appropriation_to_named_account"]],["X06-REL-04",["X06-APP-PL1194-FY25","X06-ACCOUNT-VA-0102","enacted_additional_appropriation_to_named_account"]],["X06-REL-05",["X06-APP-PL11842-FY25","X06-METRIC-ENACTED-FY25","contributes_to_exact_enacted_total_not_obligation"]],["X06-REL-06",["X06-APP-PL1194-FY25","X06-METRIC-ENACTED-FY25","contributes_to_exact_enacted_total_not_obligation"]],["X06-REL-07",["X06-ACCOUNT-VA-0102","X06-METRIC-BA-GROSS","OMB_fiscal_account_reporting_observation"]],["X06-REL-08",["X06-METRIC-BA-GROSS","X06-METRIC-AVAILABLE-RESOURCES","reported_budgetary_resources_context"]],["X06-REL-09",["X06-METRIC-UNOBLIGATED-OPEN","X06-METRIC-AVAILABLE-RESOURCES","reported_opening_unobligated_resources_component"]],["X06-REL-10",["X06-METRIC-AVAILABLE-RESOURCES","X06-METRIC-OBLIGATIONS","aggregate_fiscal_account_state_comparison"]],["X06-REL-11",["X06-METRIC-OBLIGATIONS","X06-METRIC-UNOBLIGATED-CLOSE","reported_unobligated_balance_reconciliation"]],["X06-REL-12",["X06-METRIC-OBLIGATIONS","X06-METRIC-OUTLAYS-GROSS","aggregate_account_obligation_outlay_distinction"]],["X06-REL-13",["X06-METRIC-OUTLAYS-GROSS","X06-METRIC-OUTLAYS-NET","gross_less_offsetting_collections_reconciliation"]],["X06-REL-14",["X06-METRIC-OFFSETS","X06-METRIC-OUTLAYS-NET","offsetting_collections_component"]],["X06-REL-15",["X06-ACCOUNT-VA-0102","X06-PROGRAM-VA-COMP-PENSIONS-FY25","federal_account_program_scope"]],["X06-REL-16",["ORG-FED-EXE-DEP-VA","X06-ACTOR-VBA","department_to_statutory_administration_context"]],["X06-REL-17",["X06-ACTOR-UNDERSEC-BENEFITS","X06-ACTOR-VBA","statutory_headship_not_individual_delegation"]],["X06-REL-18",["X06-ACTOR-VBA","X06-PROGRAM-VA-COMP-PENSIONS-FY25","responsible_administration_functional_context"]],["X06-REL-19",["X06-CTRL-APPORTIONMENT","X06-GAP-APPORTIONMENT","statutory_apportionment_prerequisite_missing_evidence"]],["X06-REL-20",["X06-CTRL-PURPOSE","X06-PROGRAM-VA-COMP-PENSIONS-FY25","appropriation_purpose_limit"]],["X06-REL-21",["X06-CTRL-ANTIDEF","X06-METRIC-AVAILABLE-RESOURCES","antideficiency_statutory_constraint"]],["X06-REL-22",["X06-CTRL-DOCUMENTATION","X06-GAP-OBLIGATION-RECORD","individual_obligation_evidence_gate"]],["X06-REL-23",["X06-CTRL-FY25-REIMBURSEMENT","X06-APP-PL11842-FY25","tranche_specific_reimbursement_limit"]],["X06-REL-24",["X06-CTRL-VETERAN-ELIGIBILITY","X06-GAP-CASE-ELIGIBILITY","claimant_specific_eligibility_gate"]],["X06-REL-25",["X06-ACCOUNT-VA-0102","X06-GAP-TAS","unverified_treasury_account_detail"]],["X06-REL-26",["X06-METRIC-OBLIGATIONS","X06-GAP-OBLIGATION-RECORD","unverified_individual_obligation_breakdown"]],["X06-REL-27",["X06-METRIC-OUTLAYS-GROSS","X06-GAP-PAYMENT-EVENT","unverified_actual_disbursement_voucher"]],["X06-REL-28",["ORG-FED-LEG-GAO","X06-OVERSIGHT-GAO-2025","general_external_program_oversight"]],["X06-REL-29",["X06-PROGRAM-VA-COMP-PENSIONS-FY25","X06-OUTPUT-FY25-RATING","reported_service_workload_not_program_effectiveness"]],["X06-REL-30",["X06-ACTOR-VA-OIG","X06-GAP-AUDIT-REMEDY","independent_oversight_context_not_certified_action"]],["X06-REL-31",["X06-PROGRAM-VA-COMP-PENSIONS-FY25","X06-GAP-TRANCHE-ATTRIBUTION","reported_account_totals_not_single_law_expenditure"]],["X06-REL-32",["X06-PROGRAM-VA-COMP-PENSIONS-FY25","X06-ACTOR-VA-OIG","independent_inspector_general_general_remit"]]]);
const GAPS=new Set(["APPORTIONMENT","ALLOTMENT","TAS","OFFICIAL-DELEGATION","OBLIGATION-RECORD","PAYMENT-EVENT","TRANCHE-ATTRIBUTION","AUDIT-REMEDY","CASE-ELIGIBILITY"].map(x=>"X06-GAP-"+x));
const STAGES=["appropriation","budget_account","program","apportionment","obligation","outlay","oversight"];
const isList=Array.isArray;
const sourceLegal=(x)=>isList(x?.source_ids)&&x.source_ids.length>0;
const hasMoney=(x)=>typeof x==="number"&&Number.isSafeInteger(x)&&x>=0;
export function validateX06({manifest,collections,records=new Map(),sourceRecords=new Map()}){
 const errors=[],bad=s=>errors.push(s),byFamily={};
 const meta=manifest?.federal_operational_lineage_06_extension;
 if(meta?.id!=="ARFI-COA-INC06-FY25-VA-COMP-001"||
    meta.exemplar_count!==1||meta.operational_relationships!==32||meta.unresolved_mandatory_gates!==9||
    meta.human_legal_review_complete!==false||meta.institutional_approval_complete!==false||
    meta.SF132_verified!==false||meta.component_TAS_verified!==false||
    meta.law_to_outlay_attribution_verified!==false||meta.individual_payment_authorized!==false||
    meta.exact_enacted_budget_authority_usd!==212552579000)
   bad("INC06 unexpected release, custody or legal certification");
 const own=new Map();
 for(const name of X06_FAMILIES){
  if(!isList(manifest?.models)||!manifest.models.includes("model/federal/x06-"+name+".json"))
   bad("INC06 missing manifest entry "+name);
  const file=collections?.[name];
  const items=isList(file?.items)?file.items:[];
  if(file?.model_version!=="0.1.0"||file?.model_family!=="inc06-"+name||items.length!==COUNTS[name])
   bad("INC06 invalid collection count or schema "+name);
  byFamily[name]=items;
  for(const item of items){
   if(!item||!/^((X06|SRC-X06)-[A-Z0-9-]+)$/.test(item.id||""))bad("INC06 malformed model ID "+name);
   if(own.has(item.id)||records.has(item.id))bad("INC06 duplicate or aliased identity "+item.id);
   own.set(item.id,item);
  }
 }
 const index=new Map([...records,...own]),smap=new Map([...sourceRecords,...byFamily.sources.map(x=>[x.id,x])]);
 const get=id=>{const item=index.get(id);if(!item)bad("INC06 dangling referenced identity "+id);return item;};
 function provenance(rec){
  if(!sourceLegal(rec))bad("INC06 absent source provenance "+rec?.id);
  for(const id of rec?.source_ids||[]){
   const src=smap.get(id);
   if(!src||!/^https:\/\//.test(src.url||""))bad("INC06 dangling or unsafe source provenance "+rec.id+"/"+id);
  }
 }
 for(const src of byFamily.sources){
  if(src.url!==SOURCES[src.id]||src.original_bytes_archived!==false||
     src.independent_legal_citator_complete!==false||
     src.evidence_status!=="official_public_reference_not_original_archival_custody")
    bad("INC06 primary evidence spoofing/custody overclaim "+src.id);
 }
 for(const rec of own.values())if(rec.type!=="federal_primary_evidence_reference")provenance(rec);
 const grants=byFamily.enactments,grantMap=new Map(grants.map(x=>[x.public_law,x]));
 const law118=grantMap.get("118-42"),law119=grantMap.get("119-4");
 if(!law118||!law119||law118.amount_usd!==182310515000||law119.amount_usd!==30242064000||
    law118.availability_start!=="2024-10-01"||law119.availability_start!=="2025-03-15"||
    law118.enactment_date!=="2024-03-09"||law119.enactment_date!=="2025-03-15"||
    law118.reimbursement_cap_usd!==22109000||law119.reimbursement_cap_usd!==null)
    bad("INC06 enacted public law amounts, dates or transfer conditions distorted");
 for(const grant of grants){
  if(grant.fiscal_year_of_availability!==2025||grant.availability_end!==null||
    grant.availability_kind!=="no_year_until_expended"||grant.account_id!=="X06-ACCOUNT-VA-0102"||
    grant.other_transfers_certified!==false||!hasMoney(grant.amount_usd))
   bad("INC06 no-year enacted funding improperly time-limited or spent "+grant.id);
 }
 if(byFamily.accounts[0]?.federal_account_symbol!=="036-0102"||
    byFamily.accounts[0]?.budget_appendix_identification_code!=="036-0102-0-1-701"||
    byFamily.accounts[0]?.exact_components_treasury_account_symbol_verified!==false||
    byFamily.accounts[0]?.attribution_to_tranche_verified!==false)
   bad("INC06 falsely elevates grouped federal account to component TAS");
 if(byFamily.programs[0]?.fiscal_year!==2025||
    byFamily.programs[0]?.administration_id!=="X06-ACTOR-VBA"||
    byFamily.programs[0]?.individual_claim_or_payment_authorized!==false||
    byFamily.programs[0]?.benefit_classification!=="multi_program_appropriation_not_only_disability_compensation")
   bad("INC06 multi-program benefits scope promoted to personal entitlement");
 const under=byFamily.actors.find(x=>x.id==="X06-ACTOR-UNDERSEC-BENEFITS");
 if(!under||under.nominated_or_confirmed_individual_verified!==false||under.individual_obligating_delegation_verified!==false)
   bad("INC06 institutional headship falsely grants named-person delegation");
 const apportion=byFamily.controls.find(x=>x.id==="X06-CTRL-APPORTIONMENT");
 if(!apportion||apportion.actual_apportionment_amount_usd!==null||apportion.official_form_sf132_verified!==false)
   bad("INC06 fabricated actual SF-132/apportionment");
 const reimburse=byFamily.controls.find(x=>x.id==="X06-CTRL-FY25-REIMBURSEMENT");
 if(!reimburse||reimburse.reimbursement_cap_usd!==22109000||
   reimburse.applies_to_tranche_id!=="X06-APP-PL11842-FY25"||
   reimburse.actual_reimbursement_amount_usd!==null)bad("INC06 tranche-limited reimbursement restriction lost");
 if(byFamily.controls.some(x=>x.exception_certified===true||x.case_specific_eligibility_verified===true))
   bad("INC06 fictional benefits or fiscal compliance exception");
 if(new Set(byFamily.gaps.map(x=>x.id)).size!==GAPS.size||
   [...GAPS].some(id=>!byFamily.gaps.some(x=>x.id===id)))
   bad("INC06 dropped mandatory legal or transaction evidence gaps");
 for(const gap of byFamily.gaps){
  if(gap.verified!==false||gap.signed_approval_id!==null||gap.resolution_date!==null||
      gap.original_document_sha256!==null||gap.cannot_infer_authority_from_adjacent_records!==true)
   bad("INC06 unknown operational record silently treated as verified "+gap.id);
 }
 const amounts=new Map(byFamily.metrics.map(x=>[x.id,x]));
 for(const [id,value]of Object.entries(REQUIRED_VALUES)){
  const m=amounts.get(id);
  if(!m||m.value_usd!==value||!hasMoney(m.value_usd)||m.unit!=="USD")
   bad("INC06 financial actual or currency altered "+id);
  if(m&&m.id!==S("ENACTED-FY25")&&(m.reported_fiscal_year!==2025||
      m.observation_class!=="historical_reported_2025_actual"||
      m.precision!=="rounded_to_nearest_million"||
      m.individual_transaction_evidenced!==false||m.source_account_level_only!==true||
      !m.source_ids.includes("SRC-X06-OMB27-VA")))
   bad("INC06 2025 actual incorrectly cast as proposed/transaction-level "+id);
 }
 const exact=amounts.get(S("ENACTED-FY25"));
 if(exact?.precision!=="exact_to_dollar_from_enacted_appropriation_texts"||
    exact?.value_usd!==(law118?.amount_usd||0)+(law119?.amount_usd||0)||
    exact?.enactment_ids?.length!==2||
    exact?.source_ids?.join(",")!=="SRC-X06-PL118-42,SRC-X06-PL119-4")
   bad("INC06 exact enacted budget authority improperly derived or converted");
 const amt=id=>amounts.get(S(id))?.value_usd||0;
 if(amt("BA-GROSS")+amt("UNOBLIGATED-OPEN")!==amt("AVAILABLE-RESOURCES")||
   amt("AVAILABLE-RESOURCES")-amt("OBLIGATIONS")!==amt("UNOBLIGATED-CLOSE")||
   amt("OUTLAYS-GROSS")-amt("OFFSETS")!==amt("OUTLAYS-NET")||
   amt("OBLIGATIONS")>amt("AVAILABLE-RESOURCES"))
   bad("INC06 gross authority, available resources, obligation or outlay reconciliation error");
 if(amounts.get(S("AVAILABLE-RESOURCES"))?.apportioned_amount_usd!==null||
    amounts.get(S("AVAILABLE-RESOURCES"))?.spendable_by_particular_official_asserted!==false||
    amounts.get(S("OBLIGATIONS"))?.specific_commitment_or_agreement_verified!==false||
    amounts.get(S("OUTLAYS-GROSS"))?.individual_transaction_evidenced!==false)
   bad("INC06 source available resources, obligation or outlay escalated to legal transaction");
 const outcome=byFamily.outcomes.find(x=>x.id==="X06-OUTPUT-FY25-RATING"),gao=byFamily.outcomes.find(x=>x.id==="X06-OVERSIGHT-GAO-2025");
 if(outcome?.count!==2849218||outcome.reported_2025_actual!==true||
    outcome.caused_by_enacted_tranche_verified!==false||gao?.specific_2025_account_amounts_audited!==false||
    gao?.reported_on!=="2025-10-29")
   bad("INC06 workload or GAO program oversight falsely proves causal efficacy or audit");
 const trace=byFamily.traces[0];
 if(trace?.id!=="X06-TRACE-VA-2025-0102"||trace?.fiscal_year!==2025||
    trace?.reporting_start!=="2024-10-01"||trace?.reporting_end!=="2025-09-30"||
    trace?.account_id!=="X06-ACCOUNT-VA-0102"||trace?.primary_inc05_context_id!=="X05-TRACE-I"||
    trace?.trace_status!=="published_aggregate_source_observation_unratified_not_transaction_certified")
   bad("INC06 lineage identity, as-of year or authority predecessor drift");
 for(const f of ["individual_expenditure_certified","actual_sf132_verified","individual_official_delegation_verified",
  "transaction_source_to_outlay_proven","budgetary_resource_entirely_free_to_obligate",
  "full_federal_tas_lineage_complete","GAO_reconciliation_audited","outcome_causation_established",
  "human_qualified_legal_review_complete","institutional_approval_signed"])
   if(trace?.[f]!==false)bad("INC06 unverifiable operational/legal certification "+f);
 if(!isList(trace?.stages)||trace.stages.map(x=>x.id).join(",")!==STAGES.join(","))
   bad("INC06 required fiscal/institutional operational stages absent");
 const visible=new Set();
 for(const stage of trace?.stages||[]){
  if(!isList(stage.record_ids)||!stage.record_ids.length||!stage.title||!stage.note)
   bad("INC06 zero-evidence trace stage "+stage.id);
  for(const id of stage.record_ids){get(id);visible.add(id);}
 }
 if(trace?.mandatory_gap_ids?.length!==GAPS.size||
    GAPS.size!==new Set(trace?.mandatory_gap_ids||[]).size||
    [...GAPS].some(id=>!visible.has(id)||!trace.mandatory_gap_ids.includes(id)))
   bad("INC06 missing unqualified operational gates in visible trace");
 if(trace?.summary_metric_ids?.length!==5||trace.summary_metric_ids.some(id=>!visible.has(id)||!amounts.has(id)))
   bad("INC06 budget state summary omits required money class");
 for(const id of ["X06-APP-PL11842-FY25","X06-APP-PL1194-FY25",
  "X06-METRIC-AVAILABLE-RESOURCES","X06-METRIC-OBLIGATIONS","X06-METRIC-OUTLAYS-GROSS","X06-METRIC-OUTLAYS-NET",
  "X06-CTRL-APPORTIONMENT","X06-CTRL-FY25-REIMBURSEMENT","X06-OUTPUT-FY25-RATING","X06-OVERSIGHT-GAO-2025"])
   if(!visible.has(id))bad("INC06 required enacted fiscal/operating node concealed "+id);
 const relationships=byFamily.relationships;
 if(trace?.relation_ids?.length!==32||new Set(trace.relation_ids).size!==32)
   bad("INC06 authority/fiscal relationship inventory incomplete");
 for(const e of relationships){
  const expected=EXPECTED_EDGE_CONTRACT.get(e.id);
  if(!expected||e.from_id!==expected[0]||e.to_id!==expected[1]||e.relationship_type!==expected[2])
   bad("INC06 canonical edge endpoint/type altered "+e.id);
  if(e.trace_id!==trace?.id||!trace.relation_ids.includes(e.id)||
   !visible.has(e.from_id)||!visible.has(e.to_id))
   bad("INC06 cross-account relation escapes canonical trace "+e.id);
  for(const f of ["role_to_person_delegation_verified","individual_obligation_authorized","apportionment_verified","individual_disbursement_verified","causal_outcome_verified"])
   if(e[f]!==false)bad("INC06 relationship fabricates certifying legal effect "+e.id+"."+f);
  if(e.assertion_status!=="verified_reference_or_reported_aggregate_not_transaction_chain")
   bad("INC06 relationship claim status unexpectedly authoritative "+e.id);
  for(const gapid of e.qualification_gap_ids||[])if(!GAPS.has(gapid)||!visible.has(gapid))
   bad("INC06 relation dropped or forged qualification "+e.id+"/"+gapid);
 }
 // Publishing these observations must preserve 7 original Articles and 27 Amendments
 // while disallowing automatically certified legal claims from any Article I fiscal edge.
 const provisions=[...records.values()].filter(x=>x.type==="constitutional_provision");
 if(provisions.filter(x=>x.unit==="article").length!==7||
   provisions.filter(x=>x.unit==="amendment").length!==27||
   records.get("CONST-US-ART-07")?.effect_status!=="expired")
   bad("INC06 constitutional source identity/effect integrity changed");
 return {errors,counts:Object.fromEntries(X06_FAMILIES.map(n=>[n,byFamily[n].length])),
  fiscalReconciliation:{exactEnactedUSD:amt("ENACTED-FY25"),ombBudgetAuthorityRoundedUSD:amt("BA-GROSS"),
   ombResourcesRoundedUSD:amt("AVAILABLE-RESOURCES"),ombObligatedRoundedUSD:amt("OBLIGATIONS"),
   ombGrossOutlaysRoundedUSD:amt("OUTLAYS-GROSS"),ombNetOutlaysRoundedUSD:amt("OUTLAYS-NET")},
  warnings:["No legal qualification or individual apportionment, obligation, outlay or effect certified."]};
}
