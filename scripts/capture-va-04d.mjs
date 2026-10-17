import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const digest=b=>createHash("sha256").update(b).digest("hex");
const records=JSON.parse(await fs.readFile(path.join(root,"model/federal/inc04d/source-targets.json"),"utf8")).items;
const fixed={
 "D04D-SRC-FOM1":"https://department.va.gov/wp-content/uploads/2025/04/va-functional-organizational-manual-volume-1.pdf",
 "D04D-SRC-FOM2":"https://department.va.gov/wp-content/uploads/2024/06/va-functional-organizational-manual-volume-2.pdf",
 "D04D-SRC-USC38":"https://www.govinfo.gov/content/pkg/USCODE-2024-title38/html/USCODE-2024-title38-partI-chap3-sec301.htm",
 "D04D-SRC-USC41":"https://www.govinfo.gov/content/pkg/USCODE-2024-title41/html/USCODE-2024-title41-subtitleIII-chap71-sec7105.htm",
 "D04D-SRC-CBCA":"https://www.cbca.gov/board/index.html"
};
const error=m=>{throw Error("ARFI 04D source: "+m);};
const check=(condition,message)=>{if(!condition)error(message);};
const names=records.map(x=>x.id);
check(names.length===5&&new Set(names).size===5&&names.every(n=>fixed[n]),"five official source identities required");
for(const r of records)check(r.url===fixed[r.id]&&r.sha256===null&&r.archive_state==="source_not_yet_byte_verified","source pin or research state mismatch");
async function request(record){
 let url=record.url,response;
 for(let i=0;i<=3;i++){
  response=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(80000),headers:{
   Accept:record.mime==="application/pdf"?"application/pdf":"text/html",
   "User-Agent":"ARFI-Public-Primary-Source-Research/04D (https://arfinstitute.org)"}});
  if([301,302,303,307,308].includes(response.status)){
   check(i<3&&response.headers.has("location"),"redirect without safe target");
   const next=new URL(response.headers.get("location"),url);
   check(next.protocol==="https:"&&next.origin===new URL(record.url).origin&&
    !next.username&&!next.password&&!next.search&&!next.hash,"redirect escapes official origin");
   url=next.href;continue;
  }break;
 }
 check(response.status===200,"HTTP "+response.status+" "+record.id);
 const mime=(response.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
 const pdf=record.mime==="application/pdf";
 check((pdf?["application/pdf","application/octet-stream"]:["text/html","application/xhtml+xml"]).includes(mime),
  "unexpected MIME "+mime+" "+record.id);
 const limit=pdf?16000000:2000000;
 const length=Number(response.headers.get("content-length")||0);
 check(length<=limit,"source declared above byte limit");
 const reader=response.body?.getReader();check(reader,"no source body");
 const parts=[];let bytes=0;
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;
   bytes+=value.byteLength;check(bytes<=limit,"source decoded body exceeds byte limit");
   parts.push(Buffer.from(value));}
 }finally{reader.releaseLock();}
 const buffer=Buffer.concat(parts,bytes);check(bytes>100,"short non-source body");
 if(pdf){
  check(buffer.subarray(0,5).toString("ascii")==="%PDF-","not a PDF");
  check(buffer.subarray(-2048).includes(Buffer.from("%%EOF")),"truncated PDF EOF");
 }else{
  const text=buffer.toString("utf8"),marker=record.id==="D04D-SRC-USC38"?"Board of Contract Appeals":
   record.id==="D04D-SRC-USC41"?"Civilian Board of Contract Appeals":"January 6, 2007";
  check(text.includes(marker),"official source identity marker missing");
 }
 return {buffer,mime,final_url:url,etag:response.headers.get("etag"),last_modified:response.headers.get("last-modified")};
}
async function capture(output){
 await fs.mkdir(output,{recursive:false,mode:0o700});
 await fs.mkdir(path.join(output,"bytes"));
 const captures=[],unavailable=[];
 for(const r of records){
  try{
   const result=await request(r),file="bytes/"+r.id+(r.mime==="application/pdf"?".pdf":".html");
   await fs.writeFile(path.join(output,file),result.buffer,{flag:"wx",mode:0o600});
   captures.push({id:r.id,url:r.url,final_url:result.final_url,edition:r.edition,content_type:result.mime,
    sha256:digest(result.buffer),byte_count:result.buffer.length,relative_path:file,
    captured_at:new Date().toISOString(),entity_body_decoded:true,temporary_unsigned:true});
  }catch(err){unavailable.push({id:r.id,url:r.url,status:"not_captured",reason:String(err?.message||err).slice(0,400)});}
 }
 const m={version:"ARFI-04D-ORIGINAL-RECEIPTS-v1",expected_count:5,
  captures,unavailable,complete:captures.length===5,
  legal_review_complete:false,durable_storage_verified:false,trust_signer_approved:false};
 await fs.writeFile(path.join(output,"manifest.json"),JSON.stringify(m,null,2)+"\n",{flag:"wx"});
 return m;
}
async function verify(output){
 const m=JSON.parse(await fs.readFile(path.join(output,"manifest.json")));
 check(m.version==="ARFI-04D-ORIGINAL-RECEIPTS-v1"&&m.expected_count===5&&
  m.captures.length+m.unavailable.length===5&&
  m.complete===(m.captures.length===5)&&m.legal_review_complete===false&&
  m.durable_storage_verified===false&&m.trust_signer_approved===false,"source completeness or authority misrepresented");
 const seen=new Set();
 for(const r of m.captures){
  check(!seen.has(r.id)&&r.url===fixed[r.id]&&/^[a-f0-9]{64}$/.test(r.sha256),"unapproved source digest");
  seen.add(r.id);
  const file="bytes/"+r.id+(r.id.includes("FOM")?".pdf":".html");
  check(r.relative_path===file,"source path mismatch");
  const st=await fs.lstat(path.join(output,file));check(st.isFile()&&!st.isSymbolicLink(),"source file not regular");
  const raw=await fs.readFile(path.join(output,file));
  check(raw.length===r.byte_count&&digest(raw)===r.sha256,"byte-level source tampering "+r.id);
 }
 for(const r of m.unavailable){
  check(!seen.has(r.id)&&r.url===fixed[r.id]&&r.status==="not_captured","bad unavailable source");
  seen.add(r.id);
 }
 check(seen.size===5,"some source IDs not accounted for");
 return {verified:m.captures.length,blocked:m.unavailable.map(x=>x.id),complete:m.complete,permanent_archive:false};
}
const [mode,folder]=process.argv.slice(2);
check(["--capture","--verify","--require-all"].includes(mode)&&folder,"usage --capture|--verify|--require-all DIR");
const result=mode==="--capture"?await capture(path.resolve(folder)):await verify(path.resolve(folder));
console.log(JSON.stringify(result,null,2));
if(mode==="--require-all"&&!result.complete)process.exitCode=1;
