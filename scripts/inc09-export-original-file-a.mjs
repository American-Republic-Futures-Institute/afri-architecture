#!/usr/bin/env node
// Export verified public government File A original ZIP + exact contained CSV for reviewed Git inclusion.
// This is USAspending agency-submitted File A, NOT original raw GTAS or signed SF-133.
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
const hash=data=>createHash("sha256").update(data).digest("hex");
const root=process.argv[2];if(!root)throw Error("INC09 provide custody directory");
const metadata=JSON.parse(fs.readFileSync(path.join(root,"file-a-receipt.json"),"utf8"));
const pin="3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0";
const refuse=m=>{throw Error("INC09 original File A refused: "+m)};
if(metadata.format!=="ARFI-INC09-UNSIGNED-VA-FY2025-P12-TAS-FILEA-DOWNLOAD-v1"||
 metadata.account_code!=="036-0102"||metadata.account_internal_id!==4649||
 metadata.fiscal_period!==12||metadata.fiscal_year!==2025||
 metadata.issuer_download_received!==true||metadata.download_zip_sha256!==pin||
 metadata.raw_GTAS_ledger_authenticated!==false||metadata.agency_original_SF133_captured!==false||
 metadata.VA_signed_allotment_captured!==false||metadata.original_immutable_provider_approved!==false)
 refuse("unverified acquisition or forbidden legal assertion");
if(!/^usaspending-va-2025p12-036-0102-[a-f0-9]{64}\.zip$/.test(metadata.original_zip_path))
 refuse("ZIP basename invalid");
const file=path.join(root,metadata.original_zip_path),zip=fs.readFileSync(file);
if(zip.length!==859||hash(zip)!==pin)refuse("raw publisher archive digest or byte count");
const names=execFileSync("unzip",["-Z","-1",file],{encoding:"utf8",maxBuffer:30000}).trim().split("\n");
if(names.length!==1||!/^FY2025P01-P12_All_TAS_AccountBalances_[0-9-]+_H[0-9A-Z_]+\.csv$/.test(names[0]))
 refuse("unexpected embedded File A member or ZIP traversal");
const csv=execFileSync("unzip",["-p",file,names[0]],{encoding:"buffer",maxBuffer:100000});
if(csv.length!==1943)refuse("account CSV original length changed");
function parseCSV(v){
 const raw=v.toString("utf8").replace(/^\uFEFF/,"");let row=[],field="",quoted=false,arr=[];
 for(let i=0;i<raw.length;i++){
  const c=raw[i];
  if(quoted){if(c==='"'&&raw[i+1]==='"'){field+='"';i++}
   else if(c==='"')quoted=false;else field+=c;
  }else{
   if(c==='"')quoted=true;
   else if(c===","){row.push(field);field="";}
   else if(c==="\n"){row.push(field.replace(/\r$/,""));arr.push(row);row=[];field="";}
   else field+=c;
  }
 }
 if(quoted)refuse("unterminated quoted File A field");
 if(field||row.length){row.push(field);arr.push(row)}
 const header=arr.shift();
 if(!header||new Set(header).size!==header.length)refuse("duplicate or invalid header");
 return arr.filter(r=>r.length>1).map(row=>{if(row.length!==header.length)refuse("CSV row width mismatch");
  return Object.fromEntries(header.map((name,i)=>[name,row[i]]));});
}
const rows=parseCSV(csv);
if(rows.length!==2)refuse("not precisely two VA account symbols");
const by=new Map(rows.map(v=>[v.treasury_account_symbol,v]));
if(by.size!==2||!by.has("036-X-0102-000")||!by.has("036-2020/2020-0102-000"))
 refuse("wrong no-year or historic VA account components");
const cash=v=>{if(!/^-?[0-9]+\.[0-9]{2}$/.test(v))refuse("invalid cents notation "+v);
 const n=BigInt(v.startsWith("-")?"-"+v.replace("-","").replace(".",""):v.replace(".",""));
 return n};
for(const row of rows){
 if(row.agency_identifier_code!=="036"||row.main_account_code!=="0102"||
  row.sub_account_code!=="000"||row.federal_account_symbol!=="036-0102"||
  row.submission_period!=="FY2025P12"||row.last_modified_date!=="2026-05-15"||
  row.reporting_agency_name!=="Department of Veterans Affairs")
  refuse("wrong agency, account or reporting/as-of date");
}
const no=by.get("036-X-0102-000"),legacy=by.get("036-2020/2020-0102-000");
const measures=[
 ["budget_authority_unobligated_balance_brought_forward","440868818073"],
 ["adjustments_to_unobligated_balance_brought_forward_cpe","87876024853"],
 ["budget_authority_appropriated_amount","21255257900000"],
 ["total_budgetary_resources","21784002742926"],
 ["obligations_incurred","20314422669736"],
 ["deobligations_or_recoveries_or_refunds_from_prior_year","87876024853"],
 ["unobligated_balance","1469580073190"],
 ["gross_outlay_amount","20151035530281"],
 ["status_of_budgetary_resources_total","21784002742926"]
];
for(const [key,v] of measures)if(cash(no[key])!==BigInt(v))
 refuse("published source exact cents altered "+key);
if(cash(no.total_budgetary_resources)!==
 cash(no.budget_authority_unobligated_balance_brought_forward)+
 cash(no.adjustments_to_unobligated_balance_brought_forward_cpe)+
 cash(no.budget_authority_appropriated_amount))refuse("source beginning plus additions does not reconcile");
if(cash(no.total_budgetary_resources)!==cash(no.obligations_incurred)+cash(no.unobligated_balance))
 refuse("file A obligations and unobligated imbalance");
for(const [k,v] of [
 ["budget_authority_unobligated_balance_brought_forward","124504720245"],
 ["adjustments_to_unobligated_balance_brought_forward_cpe","-124504720245"],
 ["total_budgetary_resources","0"],
 ["obligations_incurred","0"],
 ["deobligations_or_recoveries_or_refunds_from_prior_year","2440000000"],
 ["gross_outlay_amount","0"]])if(cash(legacy[k])!==BigInt(v))refuse("historic 2020 component lost "+k);
const summaries={format:"ARFI-INC09-PUBLIC-FILE-A-ORIGINAL-SHA-CROSSWALK",
 original_zip_sha256:hash(zip),zip_bytes:zip.length,
 member_name:names[0],exact_csv_sha256:hash(csv),csv_bytes:csv.length,
 agency:"036",account:"0102",period:"FY2025P12",last_modified_date:"2026-05-15",
 no_year_tas:"036-X-0102-000",historical_tas:"036-2020/2020-0102-000",
 no_year_total_budgetary_resources_cents:String(cash(no.total_budgetary_resources)),
 no_year_obligations_incurred_cents:String(cash(no.obligations_incurred)),
 no_year_unobligated_balance_cents:String(cash(no.unobligated_balance)),
 no_year_gross_outlays_cents:String(cash(no.gross_outlay_amount)),
 historic_recoveries_or_deobligations_cents:String(cash(legacy.deobligations_or_recoveries_or_refunds_from_prior_year)),
 source_provenance:"government_generated_agency_File_A_not_signed_SF133_or_raw_GTAS",
 signed_VA_FMA_TDA_verified:false,independently_authenticated_GTAS_original:false,
 individual_payment_proven:false};
console.log("INC09_VALIDATED_FILE_A "+JSON.stringify(summaries));
for(const [kind,bytes] of [["ZIP",zip],["CSV",csv]]){
 const b64=bytes.toString("base64"),size=1300,count=Math.ceil(b64.length/size);
 console.log("INC09_BLOB_BEGIN|"+kind+"|"+hash(bytes)+"|"+bytes.length+"|"+count);
 for(let i=0;i<count;i++)console.log("INC09_BLOB_CHUNK|"+kind+"|"+i+"|"+b64.slice(i*size,(i+1)*size));
 console.log("INC09_BLOB_END|"+kind+"|"+count);
}
