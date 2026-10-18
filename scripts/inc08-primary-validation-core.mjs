// INC08: verifies original government JSON bytes and source-aware funds-control evidence.
// Hash verification is NOT authentication of OMB's digital signer, legal delegation, or WORM custody.
import {createHash} from "node:crypto";
export const FAMILIES=["sources","omb-revisions","controls","reconciliations","gaps","relationships","traces"];
const COUNTS={"sources":7,"omb-revisions":4,"controls":6,"reconciliations":6,"gaps":7,"relationships":18,"traces":1};
const ORIGINALS=[[11366310,"2024-08-19","2024-08-19-13.23.45.741825","Deputy Associate Director for National Security Programs",1,"f9b085040ea44769776b3b1334ee3dfe89ddc32141e6d3a64f23eef9e57898ad",9842,183930515000,182310515000,"2024-08-19-13.23"],[11397317,"2024-11-22","2024-11-22-18.03.14.145189","Deputy Associate Director for National Security Programs",2,"7b0c4ca0df6137b56fe182e70ffb813b205d0cfb3426b897f36e08da64972f6d",10298,188339203181,186719203181,"2024-11-22-18.03"],[11403044,"2024-12-20","2024-12-20-16.01.47.485199","Acting Deputy Associate Director for National Security Programs",3,"fe77acfbe018879b22f4c7147b18ac786602c25c1a5e80ea01c68e5fae166923",10305,188399203181,186719203181,"2024-12-20-16.01"],[11424792,"2025-04-14","2025-04-14-10.37.41.433903","Program Associate Director for National Security Programs",4,"2f821463ae0c203d019080b82be7e492637cb14061fd2549b41ed665efa0798f",12348,218641267181,216961267181,"2025-04-14-10.37"]];
const LINKS=new Map([["X08-REL-01","X07-APP-01","X08-OMB-REV-01",["X08-GAP-OMB-SIGNER"]],["X08-REL-02","X07-APP-02","X08-OMB-REV-02",["X08-GAP-OMB-SIGNER"]],["X08-REL-03","X07-APP-03","X08-OMB-REV-03",["X08-GAP-OMB-SIGNER"]],["X08-REL-04","X07-APP-04","X08-OMB-REV-04",["X08-GAP-OMB-SIGNER","X08-GAP-FISCAL-YEAREND"]],["X08-REL-05","X08-OMB-REV-01","X08-OMB-REV-02",[]],["X08-REL-06","X08-OMB-REV-02","X08-OMB-REV-03",[]],["X08-REL-07","X08-OMB-REV-03","X08-OMB-REV-04",["X08-GAP-FISCAL-YEAREND"]],["X08-REL-08","X08-OMB-REV-04","X08-REC-APRIL-6011",[]],["X08-REL-09","X08-OMB-REV-04","X08-REC-APRIL-6190",[]],["X08-REL-10","X08-OMB-REV-04","X08-REC-OMB-APRIL-VS-ACTUAL",["X08-GAP-SF133-GTAS"]],["X08-REL-11","X07-EXEC-2025-SUBTOTAL","X08-REC-TREASURY-NET-OUTLAY",[]],["X08-REL-12","X08-CTRL-OMB-SF132-SIGNATURE","X08-GAP-OMB-SIGNER",["X08-GAP-OMB-SIGNER"]],["X08-REL-13","X08-CTRL-VA-FMA-TDA","X08-GAP-VA-FMA-TDA",["X08-GAP-VA-FMA-TDA"]],["X08-REL-14","X08-CTRL-VA-AAWS-IFAMS","X08-GAP-VA-AAWS-IFAMS",["X08-GAP-VA-AAWS-IFAMS"]],["X08-REL-15","X08-CTRL-VA-SF133","X08-REC-VA-SF133-GTAS",["X08-GAP-SF133-GTAS"]],["X08-REL-16","X08-CTRL-TREASURY-GTAS","X08-REC-VA-SF133-GTAS",["X08-GAP-SF133-GTAS"]],["X08-REL-17","X08-CTRL-BENEFIT-PAYMENT","X08-GAP-BENEFICIARY-PAYMENT",["X08-GAP-BENEFICIARY-PAYMENT"]],["X08-REL-18","X08-OMB-REV-04","X08-GAP-INSTITUTIONAL-IMMUTABILITY",["X08-GAP-INSTITUTIONAL-IMMUTABILITY"]]]).map(([id,from,to,gates])=>[id,[from,to,gates]]));
const STAGES=new Map([["authority_and_account",["CONST-US-ART-01-SEC-09-CL-07","X06-ACCOUNT-VA-0102","X06-METRIC-ENACTED-FY25","X07-TAS-VA-0102-X-000"]],["OMB_original_document",["X08-OMB-REV-01","X08-OMB-REV-02","X08-OMB-REV-03","X08-OMB-REV-04"]],["artifact_and_issuer_custody",["SRC-X08-OMB-11366310","SRC-X08-OMB-11397317","SRC-X08-OMB-11403044","SRC-X08-OMB-11424792","SRC-X08-VA-FUNDS-2024","SRC-X08-VA-SYMBOLS-2024","SRC-X08-TREASURY-CS2025-CH42"]],["apportionment_arithmetic",["X08-REC-OMB-REVISION-6190","X08-REC-APRIL-6011","X08-REC-APRIL-6190","X08-REC-OMB-APRIL-VS-ACTUAL"]],["VA_allotments_and_execution",["X08-CTRL-OMB-SF132-SIGNATURE","X08-CTRL-VA-FMA-TDA","X08-CTRL-VA-AAWS-IFAMS","X08-CTRL-VA-SF133","X08-CTRL-TREASURY-GTAS","X08-CTRL-BENEFIT-PAYMENT"]],["reported_cash_and_gap",["X08-REC-TREASURY-NET-OUTLAY","X08-REC-VA-SF133-GTAS","X07-EXEC-2025-SUBTOTAL"]],["unresolved_and_governance",["X08-GAP-OMB-SIGNER","X08-GAP-FISCAL-YEAREND","X08-GAP-VA-FMA-TDA","X08-GAP-VA-AAWS-IFAMS","X08-GAP-SF133-GTAS","X08-GAP-BENEFICIARY-PAYMENT","X08-GAP-INSTITUTIONAL-IMMUTABILITY"]]]);
const REQUIRE_GAPS=["OMB-SIGNER","FISCAL-YEAREND","VA-FMA-TDA","VA-AAWS-IFAMS","SF133-GTAS",
 "BENEFICIARY-PAYMENT","INSTITUTIONAL-IMMUTABILITY"].map(x=>"X08-GAP-"+x);
const FORBIDDEN=["source_signature_cryptographically_verified","independent_OMB_approval_signer_authenticated",
 "institutional_immutable_custody_verified"];
const sha=v=>createHash("sha256").update(v).digest("hex");
const originalPath=hash=>"evidence/va-fy2025/omb-originals/sha256/"+hash+".json";
function fail(errors,msg){errors.push("INC08 "+msg)}
export function validateX08({manifest,collections,originalBytes=new Map(),ancestors=new Map(),ancestorSources=new Map()}){
 const errors=[],records=new Map(ancestors),sources=new Map(ancestorSources),by={},f=(msg)=>fail(errors,msg);
 const ext=manifest?.federal_primary_execution_custody_08_extension;
 if(ext?.id!=="ARFI-FED-X08-VA-COMP-PENSIONS-2025"||
   ext.parent_trace_id!=="X07-TRACE-VA-2025-0102"||
   ext.source_omb_original_count!==4||ext.original_response_bytes_git_sha_verified_count!==4||
   ext.OMB_original_JSON_bytes_retained_in_git!==true||ext.OMB_signature_cryptographically_verified!==false||
   ext.OMB_fy_end_final_revisions_authenticated!==false||ext.VA_specific_FMA_TDA_originals_received!==false||
   ext.SF133_GTAS_originals_received!==false||ext.individual_treasury_payment_authenticated!==false||
   ext.legally_certified_OMB_apportionment_amount!==false||
   ext.independent_archival_primary_replica_verified!==false||ext.independent_legal_review_completed!==false||
   ext.mandatory_unresolved_gaps!==7||
   ext.temporary_OMB_capture_artifact_id!==12142155167)
   f("canonical source/retention extension mutated or claims independent approval");
 if(manifest?.federal_treasury_execution_07_extension?.id!=="ARFI-FED-X07-VA-ACCOUNT-0102-FY2025")
   f("missing published X07 official Treasury predecessor");
 if(new Set(manifest.models||[]).size!==manifest.models?.length)f("manifest duplicate model path");
 for(const name of FAMILIES){
  const file=collections?.[name],items=Array.isArray(file?.items)?file.items:[];
  by[name]=items;
  if(file?.model_version!=="0.1.0"||file?.model_family!=="inc08-"+name||
   !manifest?.models?.includes("model/federal/x08-"+name+".json")||items.length!==COUNTS[name])
   f("invalid closed research family, schema or count "+name);
  for(const item of items){
   if(typeof item?.id!=="string"||!item.title||!item.type||
      !(/^(SRC-X08|X08)-[A-Z0-9-]+$/.test(item.id))||records.has(item.id))
    f("malformed or duplicate canonical record "+item?.id);
   records.set(item.id,item);
   if(name==="sources")sources.set(item.id,item);
  }
 }
 const request=new Map(by.sources.map(x=>[x.id,x])),docs=new Map(by["omb-revisions"].map(x=>[x.id,x]));
 const sourceHosts=new Map([
  ["SRC-X08-VA-FUNDS-2024","https://department.va.gov/financial-policy-documents/financial-document/chapter-03-va-funds-control/"],
  ["SRC-X08-VA-SYMBOLS-2024","https://department.va.gov/financial-policy-documents/financial-document/chapter-02-vas-budget-cycle-and-fund-symbols/"],
  ["SRC-X08-TREASURY-CS2025-CH42","https://fiscal.treasury.gov/files/reports-statements/combined-statement/cs2025/c42.pdf"]]);
 for(const [id,url] of sourceHosts){
  const s=request.get(id);
  if(s?.publisher_url!==url||s.permanent_original_custody_complete!==false||
   s.source_signature_cryptographically_verified!==false||s.independent_document_edition_approved!==false||
   s.capture_run_id!==39141512347||s.capture_artifact_id!==12142155167)
   f("VA/Treasury ephemeral government source evidence misattributed "+id);
 }
 if(request.get("SRC-X08-TREASURY-CS2025-CH42")?.source_obtained_into_temporary_artifact!==false||
    request.get("SRC-X08-TREASURY-CS2025-CH42")?.temporary_original_sha256!==null)
    f("unretrieved Treasury original was falsely archived");
 for(const id of ["SRC-X08-VA-FUNDS-2024","SRC-X08-VA-SYMBOLS-2024"]){
  const s=request.get(id);
  if(s?.source_obtained_into_temporary_artifact!==true||
     !/^[a-f0-9]{64}$/.test(s.temporary_original_sha256)||s.original_document_git_path!==null)
   f("VA mutable policy page incorrectly certified as a pinned permanent source "+id);
 }
 for(const [num,date,timestamp,approver,iteration,digest,size,total,annual,suffix] of ORIGINALS){
  const sid="SRC-X08-OMB-"+num,id="X08-OMB-REV-"+String(iteration).padStart(2,"0");
  const src=request.get(sid),r=docs.get(id),git=originalPath(digest);
  const url="https://apportionment-public.max.gov/Fiscal%20Year%202025/Department%20of%20Veterans%20Affairs/JSON/FY2025_Agency%3DVA_Bureau%3DBP_TAFS%3D036-X-0102_Iteration%3D"+iteration+"_"+suffix+".json";
  if(src?.publisher!=="Office of Management and Budget"||src.publisher_original_host!=="apportionment-public.max.gov"||
      src.publisher_url!==url||src.source_official_job_title!==approver||
      src.source_approval_timestamp!==timestamp||src.approved_on_source_date!==date||
      src.original_response_sha256!==digest||src.original_response_bytes!==size||
      src.repository_original_path!==git||src.original_body_is_in_git!==true||
      src.capture_artifact_id!==12142155167||
      FORBIDDEN.some(key=>src[key]!==false))
   f("original issuer/locator/original SHA custody incorrect "+sid);
  if(r?.file_id!==num||r.fiscal_year!==2025||r.TAS!=="036-X-0102"||
      r.account_title!=="Disability Compensation Benefits"||r.iteration!==iteration||
      r.publisher_approval_timestamp!==timestamp||r.publisher_approval_date!==date||
      r.publisher_approver_title!==approver||r.original_sha256!==digest||
      r.original_bytes!==size||r.original_git_path!==git||
      r.line_6190_approved_resources_usd!==total||r.line_6011_annual_basis_usd!==annual||
      r.line_1270_advance_appropriation_usd!==182310515000||
      r.line_1200_additional_appropriation_usd!==(iteration===4?30242064000:0)||
      r.line_1000_brought_forward_unobligated_usd!==(iteration===1?null:4408688181)||
      r.source_signature_cryptographically_verified!==false||
      r.OMB_staff_member_person_verified!==false||r.final_asof_2025_09_30_control_amount_qualified!==false||
      r.actual_VA_allotment_amount_verified!==false)
   f("OMB original publication amount, dated issuer identity or legal status altered "+id);
  const b=originalBytes.get(git);
  if(!Buffer.isBuffer(b)||b.length!==size||sha(b)!==digest){
   f("INC08 original byte source missing or SHA256 tampered "+git);continue;
  }
  let obj;try{obj=JSON.parse(b.toString("utf8"))}catch{f("corrupted original published JSON "+id);continue;}
  const expectedName=decodeURIComponent(new URL(url).pathname.split("/").at(-1)).replace(/\.json$/,"");
  if(obj.FileId!==num||obj.FileName!==expectedName||obj.FiscalYear!=="2025"||
    obj.ApprovalTimestamp!==timestamp||obj.ApproverTitle!==approver||
    obj.Folder!=="Department of Veterans Affairs"||
    !Array.isArray(obj.ScheduleData)||!obj.ScheduleData.length||
    !obj.ScheduleData.every(v=>v.CgacAgency==="036"&&v.CgacAcct==="0102"&&
      v.AvailabilityTypeCode==="X"&&v.Iteration===String(iteration)))
   f("wrong official original file identity, account or timestamp "+id);
  const line=n=>obj.ScheduleData.filter(x=>x.LineNumber===String(n)&&x.LineSplit===(n===1000?"A":""));
  const get=n=>{const v=line(n);if(v.length!==1||!Number.isSafeInteger(v[0].ApprovedAmount)){f("missing original OMB schedule line "+id+"/"+n);return null}return v[0].ApprovedAmount;};
  if(get(6190)!==total||get(6011)!==annual||get(1270)!==182310515000||get(1920)!==total)
   f("original OMB source line 6190, 6011, 1270 or 1920 was falsified "+id);
  if(iteration===4){
   if(get(1200)!==30242064000||get(1000)!==4408688181||
      [6012,6013,6014,6015].map(get).reduce((a,b)=>a+(b||0),0)!==1680000000)
    f("April OMB P.L.119-4 funding or recovery line arithmetic changed");
  }
 }
 const controls=new Set(["OMB-SF132-SIGNATURE","VA-FMA-TDA","VA-AAWS-IFAMS","VA-SF133",
   "TREASURY-GTAS","BENEFIT-PAYMENT"].map(x=>"X08-CTRL-"+x));
 if(new Set(by.controls.map(x=>x.id)).size!==6||by.controls.some(x=>!controls.has(x.id)||
  x.actual_fy2025_account_signed_document_captured!==false||
  x.individual_official_delegation_verified!==false||x.effective_account_amount_usd!==null||
  x.instrument_original_sha256!==null||x.source_period_qualified!==false))
   f("VA signing, allotment, SF133 or GTAS instrument forged");
 const recon=new Map(by.reconciliations.map(x=>[x.id,x]));
 const expectedRecon=[
  ["OMB-REVISION-6190",218641267181,188399203181],
  ["APRIL-6011",216961267181,216961267181],
  ["APRIL-6190",218641267181,218641267181],
  ["OMB-APRIL-VS-ACTUAL",218641267181,217841000000],
  ["TREASURY-NET-OUTLAY",null,200671000000],
  ["VA-SF133-GTAS",null,null]
 ];
 for(const [name,value,cmp] of expectedRecon){
  const x=recon.get("X08-REC-"+name);
  if(!x||x.observed_usd!==value||x.comparison_usd!==cmp||
     x.individual_payment_proven!==false||x.FMA_TDA_allotment_approved!==false||
     x.SF133_GTAS_agreement_authenticated!==false||x.is_published_authority_not_payment!==true)
   f("INC08 source temporal or accounting comparison forged "+name);
 }
 if(recon.get("X08-REC-TREASURY-NET-OUTLAY")?.treasury_reported_exact_net_outlays_cents!==20067078336435||
   ancestors.get("X07-EXEC-2025-SUBTOTAL")?.net_outlays_cents!==20067078336435||
   ancestors.get("X06-METRIC-OUTLAYS-NET")?.value_usd!==200671000000||
   Math.round(20067078336435/100000000)!==200671)
   f("Treasury exact cents to OMB rounded amount failed");
 if(216961267181!==212552579000+4408688181||218641267181!==216961267181+1680000000||
    ancestors.get("X06-METRIC-ENACTED-FY25")?.value_usd!==212552579000)
   f("source original April apportionment arithmetic does not reconcile parent enacted funding");
 if(recon.get("X08-REC-OMB-APRIL-VS-ACTUAL")?.review_status!=="explicit_temporal_noncomparability_missing_SF133"||
   recon.get("X08-REC-VA-SF133-GTAS")?.review_status!=="blocked_until_original_agency_reports_and_account_mappings")
   f("dated OMB approved plan improperly equated with year-end SF133 or actuals");
 const gaps=new Set(by.gaps.map(x=>x.id));
 if(gaps.size!==7||REQUIRE_GAPS.some(x=>!gaps.has(x)))f("missing seven independent operational/custody review gates");
 for(const x of by.gaps)if(x.verified!==false||x.original_signed_instrument_sha256!==null||
  x.qualifying_reviewer_identity!==null||x.review_decision_signature!==null||
  x.effective_on_date!==null||x.external_WORM_copy_version_id!==null)
   f("unreviewed OMB signatures, instruments or WORM custody approved without evidence "+x.id);
 const tr=by.traces[0];
 if(tr?.id!=="X08-TRACE-VA-2025-0102"||tr.parent_trace_id!=="X07-TRACE-VA-2025-0102"||
  tr.account_id!=="X06-ACCOUNT-VA-0102"||tr.source_fiscal_year!==2025||
  tr.four_OMB_json_origins_sha_verified!==true||tr.independent_official_signatures_authenticated!==false||
  tr.FY2025_yearend_effective_apportionment_proven!==false||tr.VA_FMA_TDA_fund_distribution_verified!==false||
  tr.VA_SF133_GTAS_original_ledger_verified!==false||tr.individual_federal_payment_event_verified!==false||
  tr.institutional_immutable_custody_complete!==false||tr.independent_legal_review_complete!==false||
  JSON.stringify(tr.relationship_ids)!==JSON.stringify([...LINKS.keys()])||
  JSON.stringify(tr.mandatory_open_gap_ids)!==JSON.stringify(REQUIRE_GAPS))
    f("X08 source chain missing parent, linked gateways or fraudulently finalized");
 const visible=new Set();
 for(const stage of tr?.stages||[]){
  const expected=STAGES.get(stage.id);
  if(!expected||JSON.stringify(stage.record_ids)!==JSON.stringify(expected))f("stage-local evidence qualification removed or moved "+stage.id);
  for(const id of stage.record_ids||[]){
   if(!records.has(id))f("unrecognized stage-local source/authority record "+id);
   visible.add(id);
  }
 }
 if(tr?.stages?.length!==7||STAGES.size!==7||REQUIRE_GAPS.some(id=>!visible.has(id)))
  f("incomplete source, original approvals or unreviewed instruments trace");
 for(const edge of by.relationships){
  const e=LINKS.get(edge.id);
  if(!e||edge.from_id!==e[0]||edge.to_id!==e[1]||
   JSON.stringify(edge.qualification_gate_ids)!==JSON.stringify(e[2])||
   !visible.has(edge.from_id)||!visible.has(edge.to_id)||edge.trace_id!==tr?.id)
   f("typed account source relations or independent gate removed "+edge.id);
  for(const key of ["original_OMB_approval_signature_verified","VA_signed_allotment_verified",
   "individual_payment_authorized","source_to_payment_causal_proven"])
   if(edge[key]!==false)f("linked research asserts unsigned payment/OMB approval "+edge.id);
 }
 for(const name of FAMILIES.filter(x=>x!=="sources"))for(const x of by[name]){
  if(x.source_ids!==undefined)for(const sid of x.source_ids)
   if(!sources.has(sid))f("unknown source issuer provenance "+x.id+"/"+sid);
 }
 const con=[...ancestors.values()].filter(x=>x.type==="constitutional_provision");
 if(con.filter(x=>x.unit==="article").length!==7||con.filter(x=>x.unit==="amendment").length!==27||
  ancestors.get("CONST-US-ART-07")?.effect_status!=="expired")
   f("original Constitution altered by fiscal evidence increment");
 return {errors,records:Object.fromEntries(FAMILIES.map(k=>[k,by[k]?.length||0])),
  verified_original_OMB_publisher_JSON_bytes:4,temporary_artifact_id:12142155167,
  unresolved_operational_or_legal_gates:7,reporting_boundary:"four original government JSON source bodies and within-document arithmetic only; no signed SF132, VA allotment, agency SF133, GTAS or transaction authority certified"};
}
