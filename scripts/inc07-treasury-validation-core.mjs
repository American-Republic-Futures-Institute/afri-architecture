// INC-07 VA FY2025 account evidentiary crosswalk: no transactional permission is created.
export const X07_FAMILIES=["sources","tas","apportionments","controls","execution","gaps","relationships","traces"];
const COUNTS={"sources":9,"tas":3,"apportionments":4,"controls":5,"execution":3,"gaps":7,"relationships":21,"traces":1};
const SOURCE_URLS={"SRC-X07-TREASURY-CS25":"https://fiscal.treasury.gov/files/reports-statements/combined-statement/cs2025/c42.pdf","SRC-X07-VA-FUNDS2024":"https://department.va.gov/financial-policy-documents/financial-document/chapter-03-va-funds-control/","SRC-X07-VA-SYMBOLS2024":"https://department.va.gov/financial-policy-documents/financial-document/chapter-02-vas-budget-cycle-and-fund-symbols/","SRC-X07-OMB-PUBLIC":"https://apportionment-public.max.gov/","SRC-X07-OMB-2024-DEC-JSON":"https://apportionment-public.max.gov/Fiscal%20Year%202025/Department%20of%20Veterans%20Affairs/JSON/FY2025_Agency%3DVA_Bureau%3DBP_TAFS%3D036-X-0102_Iteration%3D3_2024-12-20-16.01.json","SRC-X07-OPENOMB-AUG24":"https://openomb.org/file/11366310","SRC-X07-OPENOMB-NOV24":"https://openomb.org/file/11397317","SRC-X07-OPENOMB-DEC24":"https://openomb.org/file/11403044","SRC-X07-OPENOMB-APR25":"https://openomb.org/file/11424792"};
const EDGE_CONTRACT=new Map([["X07-REL-01",["X06-ACCOUNT-VA-0102","X07-TAS-VA-0102-X-000","reported_no_year_TAS_component",[]]],["X07-REL-02",["X06-ACCOUNT-VA-0102","X07-TAS-VA-0102-2020-000","reported_prior_fiscal_period_component",[]]],["X07-REL-03",["X06-ACCOUNT-VA-0102","X07-TAS-VA-0102-SUBTOTAL","reported_account_aggregation_not_component",[]]],["X07-REL-04",["X07-TAS-VA-0102-X-000","X07-EXEC-2025-NOYEAR","Treasury_no_year_component_report",[]]],["X07-REL-05",["X07-TAS-VA-0102-2020-000","X07-EXEC-2025-LEGACY2020","Treasury_legacy_component_report",[]]],["X07-REL-06",["X07-TAS-VA-0102-SUBTOTAL","X07-EXEC-2025-SUBTOTAL","Treasury_account_rollup_report",[]]],["X07-REL-07",["X06-METRIC-ENACTED-FY25","X07-EXEC-2025-NOYEAR","enacted_authority_equals_reported_account_authority_not_spend_allocation",["X07-GAP-SF133-GTAS"]]],["X07-REL-08",["X06-METRIC-OUTLAYS-NET","X07-EXEC-2025-SUBTOTAL","OMB_rounded_net_outlays_match_Treasury_exact_account_cash",["X07-GAP-SF133-GTAS"]]],["X07-REL-09",["X07-APP-01","X06-ACCOUNT-VA-0102","third_party_index_points_to_FY2025_OMB_document",["X07-GAP-APPORTIONMENT-ORIGINALS"]]],["X07-REL-10",["X07-APP-02","X06-ACCOUNT-VA-0102","third_party_index_points_to_FY2025_OMB_document",["X07-GAP-APPORTIONMENT-ORIGINALS"]]],["X07-REL-11",["X07-APP-03","X06-ACCOUNT-VA-0102","third_party_transcription_of_OMB_reapportionment",["X07-GAP-APPROVED-ASOF"]]],["X07-REL-12",["X07-APP-04","X06-ACCOUNT-VA-0102","third_party_index_points_to_FY2025_OMB_document",["X07-GAP-APPROVED-ASOF"]]],["X07-REL-13",["X07-CTRL-APPROPRIATION","X07-CTRL-APPORTIONMENT","VA_policy_level_one_to_two_process",["X07-GAP-APPORTIONMENT-ORIGINALS"]]],["X07-REL-14",["X07-CTRL-APPORTIONMENT","X07-CTRL-ALLOTMENT","VA_policy_OMB_control_to_TDA",["X07-GAP-FMA-TDA"]]],["X07-REL-15",["X07-CTRL-ALLOTMENT","X07-CTRL-SUBALLOTMENT","VA_policy_TDA_to_subdivision",["X07-GAP-AAWS-TRANSACTION"]]],["X07-REL-16",["X07-CTRL-AAWS","X07-GAP-AAWS-TRANSACTION","VA_policy_AAWS_record_custody_requirement",[]]],["X07-REL-17",["X07-EXEC-2025-SUBTOTAL","X07-GAP-SF133-GTAS","account_rollup_not_SF133_or_obligation_ledger",[]]],["X07-REL-18",["X07-APP-03","X07-GAP-APPROVED-ASOF","dated_2024_revision_not_FY2025_final_approval",[]]],["X07-REL-19",["X07-EXEC-2025-NOYEAR","X07-GAP-VOUCHER-PAYMENT","no_year_aggregate_does_not_identify_claimant_disbursement",[]]],["X07-REL-20",["X07-APP-04","X07-GAP-IMMUTABLE-ORIGINALS","index_only_cannot_establish_primary_signed_custody",[]]],["X07-REL-21",["X07-CTRL-ALLOTMENT","X06-GAP-OFFICIAL-DELEGATION","VA_policy_role_not_individual_signed_delegation",["X07-GAP-FMA-TDA"]]]]);
const GAPS=new Set(["APPORTIONMENT-ORIGINALS","APPROVED-ASOF","FMA-TDA","AAWS-TRANSACTION","SF133-GTAS","VOUCHER-PAYMENT","IMMUTABLE-ORIGINALS"].map(x=>"X07-GAP-"+x));
const STAGES=["constitutional","treasury_symbols","apportionment_index","VA_funds_control","treasury_execution","reconcile","qualification"];
const STAGE_CONTENTS=new Map([["constitutional",["CONST-US-ART-01-SEC-09-CL-07","X06-METRIC-ENACTED-FY25","X06-APP-PL11842-FY25","X06-APP-PL1194-FY25","X06-ACCOUNT-VA-0102"]],["treasury_symbols",["X07-TAS-VA-0102-X-000","X07-TAS-VA-0102-2020-000","X07-TAS-VA-0102-SUBTOTAL","X06-GAP-TAS"]],["apportionment_index",["X07-APP-01","X07-APP-02","X07-APP-03","X07-APP-04","X07-GAP-APPORTIONMENT-ORIGINALS","X07-GAP-APPROVED-ASOF","X06-GAP-APPORTIONMENT"]],["VA_funds_control",["X07-CTRL-APPROPRIATION","X07-CTRL-APPORTIONMENT","X07-CTRL-ALLOTMENT","X07-CTRL-SUBALLOTMENT","X07-CTRL-AAWS","X07-GAP-FMA-TDA","X07-GAP-AAWS-TRANSACTION","X06-GAP-ALLOTMENT","X06-GAP-OFFICIAL-DELEGATION"]],["treasury_execution",["X07-EXEC-2025-NOYEAR","X07-EXEC-2025-LEGACY2020","X07-EXEC-2025-SUBTOTAL","X07-GAP-SF133-GTAS","X06-METRIC-OBLIGATIONS"]],["reconcile",["X07-EXEC-2025-NOYEAR","X07-EXEC-2025-SUBTOTAL","X06-METRIC-OUTLAYS-NET","X06-METRIC-ENACTED-FY25","X07-GAP-VOUCHER-PAYMENT","X06-GAP-PAYMENT-EVENT","X06-GAP-TRANCHE-ATTRIBUTION"]],["qualification",["X07-GAP-APPORTIONMENT-ORIGINALS","X07-GAP-APPROVED-ASOF","X07-GAP-FMA-TDA","X07-GAP-AAWS-TRANSACTION","X07-GAP-SF133-GTAS","X07-GAP-VOUCHER-PAYMENT","X07-GAP-IMMUTABLE-ORIGINALS"]]]);
const ROWS={
 "X07-EXEC-2025-NOYEAR":[2023917207806,21255257900000,20069518336435,0,3209656771371,"No Year","X07-TAS-VA-0102-X-000"],
 "X07-EXEC-2025-LEGACY2020":[124504720245,0,-2440000000,126944720245,0,"2020","X07-TAS-VA-0102-2020-000"],
 "X07-EXEC-2025-SUBTOTAL":[2148421928051,21255257900000,20067078336435,126944720245,3209656771371,"Subtotal","X07-TAS-VA-0102-SUBTOTAL"]
};
const DATES=[
 ["X07-APP-01","11366310","2024-08-19","SRC-X07-OPENOMB-AUG24"],
 ["X07-APP-02","11397317","2024-11-22","SRC-X07-OPENOMB-NOV24"],
 ["X07-APP-03","11403044","2024-12-20","SRC-X07-OPENOMB-DEC24"],
 ["X07-APP-04","11424792","2025-04-14","SRC-X07-OPENOMB-APR25"]
];
const noGrant=["individual_obligation_authorized","individual_disbursement_certified","original_OMB_SF132_signoff_qualified","VA_allotment_amount_verified","account_to_beneficiary_funding_causal_proven"];
const goodInt=n=>Number.isSafeInteger(n);
export function validateX07({manifest,collections,records=new Map(),sourceRecords=new Map()}){
 const errors=[],bad=x=>errors.push(x),by={},index=new Map(records),sm=new Map(sourceRecords);
 const extension=manifest?.federal_treasury_execution_07_extension;
 if(extension?.id!=="ARFI-FED-X07-VA-ACCOUNT-0102-FY2025"||
    extension?.treasury_component_rows!==3||extension?.apportionment_secondary_index_revisions!==4||
    extension?.relationship_count!==21||extension?.mandatory_gap_count!==7||
    extension?.treasury_exact_no_year_appropriations_cents!==21255257900000||
    extension?.treasury_exact_subtotal_net_outlays_cents!==20067078336435||
    extension?.approved_original_SF132_captured!==false||extension?.allotment_TDA_signed_evidence!==false||
    extension?.individual_payment_traced!==false||extension?.originals_cryptographically_archived!==false||
    extension?.legal_and_institutional_review_complete!==false)
    bad("X07 official-source and control-status release overclaim");
 if(manifest?.federal_operational_lineage_06_extension?.id!=="ARFI-COA-INC06-FY25-VA-COMP-001")
   bad("X07 cannot publish without canonical X06 account/fiscal predecessor");
 for(const name of X07_FAMILIES){
  const file=collections?.[name],items=Array.isArray(file?.items)?file.items:[];
  const path="model/federal/x07-"+name+".json";
  if(!manifest?.models?.includes(path)||file?.model_version!=="0.1.0"||
      file?.model_family!=="inc07-federal-treasury-"+name||items.length!==COUNTS[name])
   bad("X07 family, manifest, contract or count mismatch "+name);
  by[name]=items;
  for(const rec of items){
   if(!rec||typeof rec.id!=="string"||!(/^(?:X07|SRC-X07)-[A-Z0-9-]+$/.test(rec.id))||
     !rec.type||!rec.title)bad("X07 malformed or unsourced record "+name+" "+rec?.id);
   if(index.has(rec.id))bad("X07 duplicate canonical identity "+rec.id);
   index.set(rec.id,rec);
   if(name==="sources")sm.set(rec.id,rec);
  }
 }
 for(const s of by.sources){
  if(SOURCE_URLS[s.id]!==s.url||s.original_bytes_archived!==false||
     s.original_bytes_sha256!==null||s.independent_signing_or_authentication_qualified!==false||
     s.archived_source_retrievable_in_repo!==false||!/^https:\/\//.test(s.url))
   bad("X07 source spoofing or forged original-byte receipt "+s.id);
  if(s.id.startsWith("SRC-X07-OPENOMB-")&&
    (!s.provenance_class.startsWith("third_party_")||s.publisher!=="Protect Democracy Project / OpenOMB"))
   bad("X07 secondary apportionment index falsely presented as official OMB original "+s.id);
  if(s.id==="SRC-X07-TREASURY-CS25"&&
    s.provenance_class!=="government_publisher_original_pdf_inspected_not_archived")
   bad("X07 treasury government source custody label changed");
 }
 const resolve=id=>{if(!index.has(id))bad("X07 dangling source or record identity "+id);return index.get(id);};
 for(const name of X07_FAMILIES.filter(x=>x!=="sources"))for(const rec of by[name]){
  if(!Array.isArray(rec.source_ids)||!rec.source_ids.length)bad("X07 missing research source provenance "+rec.id);
  for(const sid of rec.source_ids||[])if(!sm.has(sid))bad("X07 unknown source citation "+rec.id+"/"+sid);
 }
 const symbols=by.tas;
 const tasm=new Map(symbols.map(x=>[x.id,x]));
 const no=tasm.get("X07-TAS-VA-0102-X-000"),legacy=tasm.get("X07-TAS-VA-0102-2020-000"),subtotal=tasm.get("X07-TAS-VA-0102-SUBTOTAL");
 if(no?.treasury_symbol_notation!=="036-X-0102-000"||
    no?.reported_period_of_availability!=="No Year"||
    no?.subaccount_code!=="000"||no?.exact_no_year_component_recognized_in_treasury_publication!==true||
    legacy?.reported_period_of_availability!=="2020"||legacy?.treasury_symbol_notation!=="036-2020-0102-000"||
    subtotal?.treasury_symbol_notation!==null||subtotal?.component_tas!==false||
    symbols.some(x=>x.federal_account_id!=="X06-ACCOUNT-VA-0102"||
      x.individual_appropriation_tranche_mapping_verified!==false))
   bad("X07 component TAS, historical availability or unknown tranche attribution distorted");
 const appMap=new Map(by.apportionments.map(x=>[x.id,x]));
 for(const [id,file,date,src] of DATES){
  const x=appMap.get(id);
  if(!x||x.OMB_file_id!==file||x.OMB_approval_date_reported!==date||
     x.source_index_id!==src||x.reporting_fiscal_year!==2025||
     x.TAFS_index_notation!=="036-0102 /X"||
     x.OMB_signed_record_verified!==false||
     x.actual_original_JSON_bytes_received!==false||
     x.FY2025_funds_actually_allotted_verified!==false||
     x.supplemental_act_tranche_attribution_verified!==false||
     x.original_document_sha256!==null)
   bad("X07 secondary OMB apportionment index promoted to signed original or actual allotment "+id);
 }
 const dec=appMap.get("X07-APP-03"),apr=appMap.get("X07-APP-04");
 if(dec?.original_publisher_JSON_url!==SOURCE_URLS["SRC-X07-OMB-2024-DEC-JSON"]||
    dec?.secondary_transcription_budgetary_resources_line_6190_usd!==188399203181||
    dec?.secondary_transcription_annual_basis_line_6011_usd!==186719203181||
    dec?.line_6190_is_obligations_or_actual_FY2025_SF133!==false||
    apr?.approval_date_evidence_type!=="secondary_search_page_index_only"||
    Object.hasOwn(apr||{},"secondary_transcription_budgetary_resources_line_6190_usd"))
   bad("X07 indexed apportionment line amounts/dates confused with original SF132 or FY2025 final");
 const controls=new Map(by.controls.map(x=>[x.id,x]));
 for(const [id,level,doc] of [
  ["APPROPRIATION",1,"enacted_public_law"],["APPORTIONMENT",2,"OMB_approved_SF132"],
  ["ALLOTMENT",3,"VA_FMA_memo_and_TDA_form_4_4564_6"],
  ["SUBALLOTMENT",4,"VA_accounting_funds_control_entry_and_record"],
  ["AAWS",null,"AAWS_document_and_FMS_or_iFAMS_audit_record"]]){
  const x=controls.get("X07-CTRL-"+id);
  if(!x||x.funds_control_level!==level||x.required_instrument_type!==doc||
      x.actual_FY2025_account_instrument_verified!==false||
      x.individual_signed_delegation_verified!==false||
      x.agency_policy_is_not_specific_execution_evidence!==true)
   bad("X07 VA funds-control policy claimed to establish a signed individual approval "+id);
 }
 const money=["opening_balance_cents","appropriations_and_other_obligational_authority_cents",
  "net_outlays_cents","balances_withdrawn_and_other_transactions_cents","closing_balance_cents"];
 const exe=new Map(by.execution.map(x=>[x.id,x]));
 for(const [id,expected]of Object.entries(ROWS)){
  const rec=exe.get(id);
  if(!rec||rec.account_component_id!==expected[6]||rec.period_of_availability!==expected[5]||
     rec.reporting_period_end!=="2025-09-30"||
     rec.amount_precision!=="reported_exact_cents"||rec.currency!=="USD"||
     rec.specific_individual_obligation_verified!==false||
     rec.individual_treasury_payment_verified!==false||
     rec.apportioned_amount_verified!==false||
     rec.source_specific_tranche_outlay_verified!==false||
     rec.other_transfers_borrowings_and_investments_net_cents!==0||
     money.some((k,i)=>!goodInt(rec[k])||rec[k]!==expected[i]))
   bad("X07 Treasury exact published FY2025 cent-level account component altered "+id);
  if(rec&&rec.opening_balance_cents+rec.appropriations_and_other_obligational_authority_cents-
     rec.net_outlays_cents-rec.balances_withdrawn_and_other_transactions_cents!==rec.closing_balance_cents)
   bad("X07 Treasury beginning plus receipts minus outlays/withdrawals does not reconcile "+id);
 }
 const a=exe.get("X07-EXEC-2025-NOYEAR"),b=exe.get("X07-EXEC-2025-LEGACY2020"),all=exe.get("X07-EXEC-2025-SUBTOTAL");
 if(a&&b&&all&&money.some(k=>a[k]+b[k]!==all[k]))
   bad("X07 2020 legacy adjustment removed from Treasury 2025 subtotal");
 const existing=records.get("X06-METRIC-OUTLAYS-NET");
 if(existing?.value_usd!==200671000000||Math.round((all?.net_outlays_cents||0)/100000000)!==200671)
   bad("X07 Treasury exact subtotal incompatible with FY2025 OMB rounded reported net outlays");
 if(records.get("X06-METRIC-ENACTED-FY25")?.value_usd!==212552579000||
    (a?.appropriations_and_other_obligational_authority_cents||0)!==21255257900000)
   bad("X07 enacted source and Treasury reported no-year authority cannot be reconciled");
 const guardIds=new Set(by.gaps.map(x=>x.id));
 if(guardIds.size!==7||[...GAPS].some(x=>!guardIds.has(x)))bad("X07 missing mandatory open documentary or legal gate");
 for(const gate of by.gaps)if(gate.evidence_received!==false||
     gate.original_document_sha256!==null||gate.independent_authentication_complete!==false||
     gate.human_legal_approval_complete!==false||
     gate.remediation_status!=="open_source_evidence_gap")
   bad("X07 missing document falsely treated as obtained or signed "+gate.id);
 const t=by.traces[0];
 if(t?.id!=="X07-TRACE-VA-2025-0102"||
    t.parent_trace_id!=="X06-TRACE-VA-2025-0102"||
    t.account_id!=="X06-ACCOUNT-VA-0102"||t.fiscal_year!==2025||
    t.as_of_fiscal_year_end!=="2025-09-30"||
    JSON.stringify(t.stages?.map(x=>x.id))!==JSON.stringify(STAGES))
   bad("X07 account trace, parent, chronological stages or year mutated");
 for(const key of ["individual_apportionment_original_verified","allotment_signed_and_distributed_verified",
  "GAO_or_agency_transaction_audit_verified","individual_payment_proven","OMB_line6190_is_account_actual",
  "year_end_final_SF132_authenticated","original_bytes_immutably_archived","independent_legal_review_qualified"])
  if(t?.[key]!==false)bad("X07 account source improperly certified a legal/spending fact "+key);
 const visible=new Set();
 for(const stage of t?.stages||[]){
  if(JSON.stringify(stage.record_ids)!==JSON.stringify(STAGE_CONTENTS.get(stage.id)))
   bad("X07 mandatory stage-local original evidence and qualification positions changed "+stage.id);
  if(!Array.isArray(stage.record_ids)||!stage.record_ids.length||!stage.title||!stage.note)
   bad("X07 required evidence stage missing original reference or limits "+stage?.id);
  for(const id of stage.record_ids||[]){resolve(id);visible.add(id);}
 }
 if(JSON.stringify(t?.mandatory_gap_ids)!==JSON.stringify([...GAPS])&&
    (t?.mandatory_gap_ids?.length!==7||[...GAPS].some(x=>!t.mandatory_gap_ids.includes(x))))
   bad("X07 mandatory publication gates omitted");
 for(const id of GAPS)if(!visible.has(id))bad("X07 missing documentary gap from inspectable trace "+id);
 const requiredMoney=["X07-EXEC-2025-NOYEAR","X07-EXEC-2025-LEGACY2020","X07-EXEC-2025-SUBTOTAL"];
 if(JSON.stringify(t?.financial_state_ids)!==JSON.stringify(requiredMoney)||requiredMoney.some(id=>!visible.has(id)))
   bad("X07 exact Treasury cash components or order omitted from financial summary");
 for(const id of [...appMap.keys(),...controls.keys(),"X06-METRIC-OUTLAYS-NET",
   "X06-METRIC-ENACTED-FY25","X06-GAP-PAYMENT-EVENT"])
   if(!visible.has(id))bad("X07 required historical public source or predecessor hidden "+id);
 if(JSON.stringify(t?.relation_ids)!==JSON.stringify([...EDGE_CONTRACT.keys()]))
   bad("X07 typed source-linked operations relation inventory changed");
 for(const edge of by.relationships){
  const exp=EDGE_CONTRACT.get(edge.id);
  if(!exp||edge.from_id!==exp[0]||edge.to_id!==exp[1]||edge.relationship_type!==exp[2]||
     edge.trace_id!==t.id||!visible.has(edge.from_id)||!visible.has(edge.to_id))
   bad("X07 typed linkage changed source, target or fiscal scope "+edge.id);
  if(!Array.isArray(edge.qualification_gap_ids)||JSON.stringify(edge.qualification_gap_ids)!==JSON.stringify(exp?.[3]))
   bad("X07 legal source qualification array absent or altered "+edge.id);
  for(const g of edge.qualification_gap_ids||[])if(!GAPS.has(g)||!visible.has(g))
   bad("X07 relation depends on hidden/unverified qualification "+edge.id+"/"+g);
  for(const flag of noGrant)if(edge[flag]!==false)
   bad("X07 source relationship falsely certifies payment or obligating authority "+edge.id+"."+flag);
 }
 const provisions=[...records.values()].filter(x=>x.type==="constitutional_provision");
 if(provisions.filter(x=>x.unit==="article").length!==7||
   provisions.filter(x=>x.unit==="amendment").length!==27||
   records.get("CONST-US-ART-07")?.effect_status!=="expired")
    bad("X07 changed original constitutional Articles, Amendments or historical legal effect");
 return {errors,counts:Object.fromEntries(X07_FAMILIES.map(n=>[n,by[n].length])),
  fiscal:{noYearAuthorityCents:a?.appropriations_and_other_obligational_authority_cents||null,
   treasuryNetSubtotalCents:all?.net_outlays_cents||null,
   OMBPublishedRoundedNetUSD:existing?.value_usd||null},
  unresolvedRecords:by.gaps.length,
  notice:"Official Treasury account-level values and indexed apportionment versions; individual SF132 signature, VA allotments and payments not certified."};
}
