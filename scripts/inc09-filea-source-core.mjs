// INC-09 strict signed-account boundary: authentic Treasury published File A ZIP and exact cents.
// No use of floating point for statement-of-resources financial arithmetic.
import {createHash} from "node:crypto";
import {inflateRawSync} from "node:zlib";
export const SOURCE_PINS=Object.freeze({
 ZIP:{sha:"3ce45767c959f1d3575fc073c47c6a712888fb689b4d39ddbf8fa81f5a7febe0",size:859,
  member:"FY2025P01-P12_All_TAS_AccountBalances_2026-10-18_H16M49S10_1.csv"},
 CSV:{sha:"e7f8508491ea56275aceda89e5d91f9c6466ac13d251ec0b86c21294cc1b8a2a",size:1943},
 SNAPSHOT:{sha:"81f15a17121e594cdf2f05947f84af4d77a9cb4e026e1f713853f90194dc0108",size:320},
 HISTORY:{sha:"ae3892cce28468ef20484b1e0ccda087ed57ee7724b1ff7a527624e76141096d",size:363}
});
export const FIELDS=Object.freeze([
"owning_agency_name","reporting_agency_name","submission_period",
"allocation_transfer_agency_identifier_code","agency_identifier_code",
"beginning_period_of_availability","ending_period_of_availability","availability_type_code",
"main_account_code","sub_account_code","treasury_account_symbol","treasury_account_name",
"agency_identifier_name","allocation_transfer_agency_identifier_name","budget_function","budget_subfunction",
"federal_account_symbol","federal_account_name","budget_authority_unobligated_balance_brought_forward",
"adjustments_to_unobligated_balance_brought_forward_cpe","budget_authority_appropriated_amount",
"borrowing_authority_amount","contract_authority_amount","spending_authority_from_offsetting_collections_amount",
"total_other_budgetary_resources_amount","total_budgetary_resources","obligations_incurred",
"deobligations_or_recoveries_or_refunds_from_prior_year","unobligated_balance","gross_outlay_amount",
"status_of_budgetary_resources_total","last_modified_date"]);
const fail=message=>{throw Error("INC09 File A original failed verification: "+message)};
export const hashSHA256=bytes=>createHash("sha256").update(bytes).digest("hex");
export const moneyCents=value=>{
 if(typeof value!=="string"||!/^(-?)([0-9]+)\.([0-9]{2})$/.test(value))fail("invalid original cents notation "+value);
 const m=value.match(/^(-?)([0-9]+)\.([0-9]{2})$/);
 return (m[1]==="-"?-1n:1n)*(BigInt(m[2])*100n+BigInt(m[3]));
};
const crc32=data=>{
 let crc=0xffffffff;
 for(const n of data){crc^=n;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
};
export function extractFileAOriginal(zip){
 const p=SOURCE_PINS;
 if(!Buffer.isBuffer(zip)||zip.length!==p.ZIP.size||hashSHA256(zip)!==p.ZIP.sha)
  fail("original government publisher ZIP size or SHA-256");
 if(zip.readUInt32LE(0)!==0x04034b50)fail("ZIP local file signature");
 let tail=-1;
 for(let i=zip.length-22;i>=0;i--)if(zip.readUInt32LE(i)===0x06054b50){tail=i;break;}
 if(tail<0||zip.readUInt16LE(tail+10)!==1||zip.readUInt16LE(tail+8)!==1||
   zip.readUInt16LE(tail+4)!==0||zip.readUInt16LE(tail+6)!==0||
   zip.readUInt16LE(tail+20)!==0)fail("unexpected ZIP end of central directory");
 const cd=zip.readUInt32LE(tail+16);
 if(cd+46>zip.length||zip.readUInt32LE(cd)!==0x02014b50)fail("missing ZIP central header");
 const flags=zip.readUInt16LE(cd+8),method=zip.readUInt16LE(cd+10),crc=zip.readUInt32LE(cd+16),
   csize=zip.readUInt32LE(cd+20),size=zip.readUInt32LE(cd+24),
   n=zip.readUInt16LE(cd+28),extra=zip.readUInt16LE(cd+30),comment=zip.readUInt16LE(cd+32),
   loc=zip.readUInt32LE(cd+42);
 const filename=zip.subarray(cd+46,cd+46+n).toString("utf8");
 if(filename!==p.ZIP.member||flags!==0||method!==8||crc!==0x16ceab54||
    size!==p.CSV.size||csize!==633||extra!==0||comment!==0||
    loc+30>zip.length||zip.readUInt32LE(loc)!==0x04034b50)
  fail("ZIP member identity, checksum, method or bounds changed");
 const dataStart=loc+30+zip.readUInt16LE(loc+26)+zip.readUInt16LE(loc+28);
 if(dataStart+csize>cd)fail("ZIP body escaped local original file");
 const member=inflateRawSync(zip.subarray(dataStart,dataStart+csize),{maxOutputLength:6000});
 if(member.length!==size||crc32(member)!==crc||hashSHA256(member)!==p.CSV.sha)
  fail("government CSV member CRC, content-size or SHA-256 mismatch");
 return member;
}
export function parseFileACSV(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length!==SOURCE_PINS.CSV.size||
   hashSHA256(bytes)!==SOURCE_PINS.CSV.sha)fail("CSV content-addressed original not exact");
 let data=bytes.toString("utf8"),rows=[],cols=[],field="",quoted=false;
 if(data.startsWith("\uFEFF"))data=data.slice(1);
 for(let i=0;i<data.length;i++){
  const char=data[i];
  if(quoted){if(char==='"'&&data[i+1]==='"'){field+='"';i++}
   else if(char==='"')quoted=false;else field+=char;
  }else if(char==='"'){if(field)fail("unexpected quoted field");quoted=true;}
   else if(char===","){cols.push(field);field="";}
   else if(char==="\n"){cols.push(field.replace(/\r$/,""));rows.push(cols);cols=[];field="";}
   else field+=char;
 }
 if(quoted)fail("unterminated CSV quote");
 if(field||cols.length){cols.push(field);rows.push(cols)}
 const headers=rows.shift();
 if(JSON.stringify(headers)!==JSON.stringify(FIELDS))fail("unexpected source File A column schema");
 if(rows.length!==2)fail("two government Treasury-account rows required");
 const parsed=rows.map(v=>{
  if(v.length!==FIELDS.length)fail("CSV row count mismatch");
  return Object.fromEntries(FIELDS.map((k,i)=>[k,v[i]]));
 });
 if(new Set(parsed.map(x=>x.treasury_account_symbol)).size!==2)
  fail("duplicate agency Treasury Account Symbols");
 return parsed;
}
export const EXPECTED_ACCOUNT_ROWS=Object.freeze({
 "036-X-0102-000":{
  budget_authority_unobligated_balance_brought_forward:440868818073,
  adjustments_to_unobligated_balance_brought_forward_cpe:87876024853,
  budget_authority_appropriated_amount:21255257900000,
  total_other_budgetary_resources_amount:0,
  total_budgetary_resources:21784002742926,
  obligations_incurred:20314422669736,
  deobligations_or_recoveries_or_refunds_from_prior_year:87876024853,
  unobligated_balance:1469580073190,gross_outlay_amount:20151035530281,
  status_of_budgetary_resources_total:21784002742926
 },
 "036-2020/2020-0102-000":{
  budget_authority_unobligated_balance_brought_forward:124504720245,
  adjustments_to_unobligated_balance_brought_forward_cpe:-124504720245,
  budget_authority_appropriated_amount:0,total_other_budgetary_resources_amount:0,
  total_budgetary_resources:0,obligations_incurred:0,
  deobligations_or_recoveries_or_refunds_from_prior_year:2440000000,
  unobligated_balance:0,gross_outlay_amount:0,status_of_budgetary_resources_total:0
 }
});
export function validateFileAOriginals({zip,csv,snapshot,history}){
 const got=extractFileAOriginal(zip);
 if(!Buffer.isBuffer(csv)||!got.equals(csv))fail("committed CSV does not equal government ZIP member");
 const rows=parseFileACSV(csv);
 for(const row of rows){
  if(row.owning_agency_name!=="Department of Veterans Affairs"||
     row.reporting_agency_name!=="Department of Veterans Affairs"||
     row.agency_identifier_code!=="036"||row.federal_account_symbol!=="036-0102"||
     row.main_account_code!=="0102"||row.sub_account_code!=="000"||
     row.submission_period!=="FY2025P12"||row.last_modified_date!=="2026-05-15")
    fail("source agency, TAS, period or reported source modification date");
  if(!EXPECTED_ACCOUNT_ROWS[row.treasury_account_symbol])
    fail("unexpected or historically conflated Treasury Account Symbol");
  for(const [key,value] of Object.entries(EXPECTED_ACCOUNT_ROWS[row.treasury_account_symbol]))
   if(moneyCents(row[key])!==BigInt(value))
    fail("source original accounting value changed "+row.treasury_account_symbol+"/"+key);
 }
 const no=rows.find(x=>x.treasury_account_symbol==="036-X-0102-000"),
   old=rows.find(x=>x.treasury_account_symbol==="036-2020/2020-0102-000");
 if(no.availability_type_code!=="X"||no.beginning_period_of_availability!==""||
    old.beginning_period_of_availability!=="2020"||old.ending_period_of_availability!=="2020")
  fail("reporting-period availability conflated");
 if(moneyCents(no.total_budgetary_resources)!==
    moneyCents(no.budget_authority_appropriated_amount)+
    moneyCents(no.budget_authority_unobligated_balance_brought_forward)+
    moneyCents(no.adjustments_to_unobligated_balance_brought_forward_cpe)||
    moneyCents(no.total_budgetary_resources)!==
    moneyCents(no.obligations_incurred)+moneyCents(no.unobligated_balance)||
    moneyCents(old.budget_authority_unobligated_balance_brought_forward)+
    moneyCents(old.adjustments_to_unobligated_balance_brought_forward_cpe)!==0n)
  fail("fiscal year resource/funds balances do not reconcile");
 const json=(bytes,pin)=>{if(!Buffer.isBuffer(bytes)||bytes.length!==pin.size||
   hashSHA256(bytes)!==pin.sha)fail("government API original bytes not hash pinned");
   return JSON.parse(bytes.toString("utf8"));};
 const api=json(snapshot,SOURCE_PINS.SNAPSHOT);
 const historyObj=json(history,SOURCE_PINS.HISTORY);
 const value=(name,expected)=>{
  const v=api?.results?.[name];
  if(!Number.isFinite(v)||!Number.isSafeInteger(Math.round(v*100))||
    Math.round(v*100)!==expected)fail("official FY2025 account snapshot does not match source File A "+name);
 };
 for(const [key,v]of Object.entries({
  outlay:20151035530281,budget_authority:21784002742926,
  obligated:20314422669736,unobligated:1469580073190,
  balance_brought_forward:528744842926,appropriations:21255257900000
 }))value(key,v);
 const dates=[
 ["2026-05-15T19:07:25.440001+00:00","2026-05-15T19:07:25.469881+00:00"],
 ["2025-11-17T16:43:54.101665+00:00","2025-11-17T16:45:30.990273+00:00"]
 ];
 if(historyObj?.page_metadata?.total!==2||historyObj.results?.length!==2||
  historyObj.results.some((x,i)=>x.publication_date!==dates[i][0]||
    x.certification_date!==dates[i][1]))
  fail("VA fiscal-period certification history byte identity or ordered dates changed");
 return {rows,api,certification_history:historyObj.results,
  evidence_status:"Treasury_published_agency_File_A_and_API_source_hash_verified_not_original_signed_SF133_GTAS"};
}
