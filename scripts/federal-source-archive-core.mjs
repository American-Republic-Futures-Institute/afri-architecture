// Evidence capture contract: full decoded HTTP response entity bytes, never a scraped or summarized page.
import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const CAPTURE_MAX_BYTES=3_000_000;
export const CAPTURE_IDS=Object.freeze([
 "ARCH04B-DOJ-HTML","ARCH04B-TREASURY-HTML","ARCH04B-HHS-HTML","ARCH04B-VA-HTML",
 "ARCH04B-GOVMAN-JUSTICE-XML","ARCH04B-GOVMAN-TREASURY-XML","ARCH04B-GOVMAN-HHS-XML","ARCH04B-GOVMAN-VA-XML"
]);
export const EXPECTED_URLS=Object.freeze({
 "ARCH04B-DOJ-HTML":"https://www.justice.gov/agencies/organizational-chart-text-version",
 "ARCH04B-TREASURY-HTML":"https://home.treasury.gov/about/bureaus/",
 "ARCH04B-HHS-HTML":"https://www.hhs.gov/about/organization/org-chart/index.html",
 "ARCH04B-VA-HTML":"https://department.va.gov/administrations-and-offices/",
 "ARCH04B-GOVMAN-JUSTICE-XML":"https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-121.xml",
 "ARCH04B-GOVMAN-TREASURY-XML":"https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-125.xml",
 "ARCH04B-GOVMAN-HHS-XML":"https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-117.xml",
 "ARCH04B-GOVMAN-VA-XML":"https://www.govinfo.gov/content/pkg/GOVMAN-2025-12-31/xml/GOVMAN-2025-12-31-126.xml"
});
export const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const validHash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
export function assertTargets(sources){
 if(!Array.isArray(sources)||sources.length!==8)throw Error("exact eight approved government sources required");
 const ids=sources.map(x=>x.id);
 if(new Set(ids).size!==8||CAPTURE_IDS.some(id=>!ids.includes(id)))throw Error("missing or unexpected source IDs");
 for(const s of sources){
  if(s.url!==EXPECTED_URLS[s.id]||s.archival_status!=="capture_pending_ci_artifact"||
    s.archived_sha256!==null||s.archived_at!==null||s.archived_size_bytes!==null||
    s.bytes_embedded_in_repository!==false)throw Error("unapproved source URL or premature archival claim: "+s.id);
  const u=new URL(s.url);
  if(u.protocol!=="https:"||u.username||u.password||u.port||u.search||u.hash||
    !["www.justice.gov","home.treasury.gov","www.hhs.gov","department.va.gov","www.govinfo.gov"].includes(u.hostname))
   throw Error("source URL disallowed by strict government-host policy");
 }
 return true;
}
async function fetchBounded(s,fetchImpl){
 const origin=new URL(s.url).origin;let current=s.url;let response;
 for(let i=0;i<=3;i++){
  response=await fetchImpl(current,{redirect:"manual",signal:AbortSignal.timeout(45000),
   headers:{"Accept":s.media_type==="application/xml"?"application/xml,text/xml;q=0.9":"text/html,application/xhtml+xml;q=0.9",
     "User-Agent":"ARFI-Institutional-Evidence/0.1 (noncommercial research; https://arfinstitute.org)"}});
  if([301,302,303,307,308].includes(response.status)){
   if(i===3)throw Error("too many redirects "+s.id);
   const location=response.headers.get("location");
   if(!location)throw Error("redirect missing location "+s.id);
   const u=new URL(location,current);
   if(u.origin!==origin||u.protocol!=="https:"||u.username||u.password||
     u.search||u.hash)throw Error("redirect escaped pinned official host "+s.id);
   current=u.href;continue;
  }
  break;
 }
 if(!response.ok||response.status!==200)throw Error("official source returned HTTP "+response.status+" "+s.id);
 const mime=(response.headers.get("content-type")||"").split(";")[0].trim().toLowerCase();
 const allowed=s.media_type==="application/xml"?
  ["application/xml","text/xml","application/octet-stream"]:
  ["text/html","application/xhtml+xml"];
 if(!allowed.includes(mime))throw Error("unexpected source MIME "+s.id+" "+mime);
 const declared=Number(response.headers.get("content-length")||"0");
 if(declared>CAPTURE_MAX_BYTES)throw Error("declared response exceeds maximum "+s.id);
 // Limit actual decoded response-body bytes, not just Content-Length.
 const stream=response.body?.getReader();
 if(!stream)throw Error("response has no byte stream "+s.id);
 const pieces=[];let received=0;
 try{
  for(;;){
   const {done,value}=await stream.read();if(done)break;
   received+=value.byteLength;
   if(received>CAPTURE_MAX_BYTES)throw Error("actual response exceeds maximum "+s.id);
   pieces.push(value);
  }
 }catch(error){await stream.cancel().catch(()=>{});throw error;}
 if(received<100)throw Error("implausibly short official document "+s.id);
 const data=Buffer.concat(pieces.map(b=>Buffer.from(b)),received);
 if(!data.toString("utf8").toLocaleLowerCase("en-US").includes(s.expected_marker.toLocaleLowerCase("en-US")))
  throw Error("expected document identity marker absent "+s.id);
 return {data,final_url:current,content_type:mime,
  etag:response.headers.get("etag"),last_modified:response.headers.get("last-modified")};
}
export async function captureOfficialSources({sources,outputDir,fetchImpl=fetch,capturedAt=()=>new Date().toISOString(),allowPartial=false}){
 assertTargets(sources);
 const records=[],errors=[];
 await fs.mkdir(path.join(outputDir,"bytes"),{recursive:true});
 for(const s of sources){
  let result;
  try{result=await fetchBounded(s,fetchImpl);}
  catch(err){
   if(!allowPartial)throw err;
   errors.push({source_id:s.id,status:"not_archived",
    reason:String(err?.message||err).slice(0,500),source_url:s.url});
   continue;
  }
  const extension=s.media_type==="application/xml"?"xml":"html";
  const filename=s.id+"."+extension,relativePath="bytes/"+filename;
  await fs.writeFile(path.join(outputDir,relativePath),result.data,{flag:"wx"});
  const captured_at=capturedAt();
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(captured_at))throw Error("invalid capture clock");
  const digest=hash(result.data);
  records.push({
   source_id:s.id,source_url:s.url,final_url:result.final_url,
   source_edition:s.edition,captured_at,content_type:result.content_type,
   response_entity_encoding:"decoded_body_bytes_from_fetch",
   relative_path:relativePath,byte_count:result.data.length,sha256:digest,
   etag:result.etag,last_modified:result.last_modified,
   identity_marker_verified:true,independent_legal_review_completed:false,
   current_department_first_level_complete:false
  });
 }
 const archive={version:"ARFI-EVIDENCE-CAPTURE-0.1.0",
  scope:"eight_explicit_official_website_2025_govman_and_dated_department_org_group_sources",
  archival_status:errors.length?
   "github_actions_partial_artifact_missing_sources_requires_followup":
   "github_actions_artifact_temporary_requires_durable_retention_promotion",
  primary_bytes_archived_in_repository:false,
  captures:records,uncaptured_sources:errors,
  capture_complete:errors.length===0&&records.length===8};
 await fs.writeFile(path.join(outputDir,"archive-manifest.json"),JSON.stringify(archive,null,2)+"\n",{flag:"wx"});
 await verifyCaptureArchive(outputDir,archive);
 return archive;
}
export async function verifyCaptureArchive(root,manifest){
 if(manifest?.version!=="ARFI-EVIDENCE-CAPTURE-0.1.0"||
  manifest.primary_bytes_archived_in_repository!==false||
  !Array.isArray(manifest.captures)||!Array.isArray(manifest.uncaptured_sources)||
  manifest.captures.length+manifest.uncaptured_sources.length!==8||
  manifest.capture_complete!==(manifest.uncaptured_sources.length===0&&manifest.captures.length===8)||
  manifest.archival_status!==(manifest.capture_complete?
   "github_actions_artifact_temporary_requires_durable_retention_promotion":
   "github_actions_partial_artifact_missing_sources_requires_followup"))
   throw Error("archival manifest schema / completeness rejected");
 const missing=new Set();
 for(const e of manifest.uncaptured_sources){
  if(!CAPTURE_IDS.includes(e.source_id)||missing.has(e.source_id)||
   e.status!=="not_archived"||e.source_url!==EXPECTED_URLS[e.source_id]||
   typeof e.reason!=="string"||!e.reason)
   throw Error("invalid, duplicate or unbounded missing-source record");
  missing.add(e.source_id);
 }
 const seen=new Set();
 for(const c of manifest.captures){
  if(seen.has(c.source_id)||!CAPTURE_IDS.includes(c.source_id)||
   c.source_url!==EXPECTED_URLS[c.source_id]||
   !validHash(c.sha256)||!Number.isSafeInteger(c.byte_count)||
   c.byte_count<100||c.byte_count>CAPTURE_MAX_BYTES||
   c.relative_path!=="bytes/"+c.source_id+(c.source_id.endsWith("-XML")?".xml":".html")||
   c.identity_marker_verified!==true||c.independent_legal_review_completed!==false||
   c.current_department_first_level_complete!==false)
    throw Error("unverified or tampered source receipt "+c.source_id);
  if(missing.has(c.source_id))throw Error("same source cannot be both archived and missing");
  seen.add(c.source_id);
  const realpath=path.resolve(root,c.relative_path),dir=path.resolve(root,"bytes");
  if(path.dirname(realpath)!==dir)throw Error("archive path traversal attempt");
  const raw=await fs.readFile(realpath);
  if(raw.length!==c.byte_count||hash(raw)!==c.sha256)
   throw Error("archive bytes SHA-256 mismatch "+c.source_id);
 }
 if([...CAPTURE_IDS].some(id=>!seen.has(id)&&!missing.has(id)))throw Error("missing required source accounting");
 return {files:manifest.captures.length,verified_sha256:manifest.captures.length,
  uncaptured:manifest.uncaptured_sources.length,complete:manifest.capture_complete,
  verification_status:manifest.capture_complete?
  "exact_eight_captured_response_bytes_verified_not_permanent_repository_archive":
  "partial_captured_bytes_verified_some_official_sources_unavailable"};
}
export function validateResearchCaptureAcceptance(report,manifest){
 if(!report||!manifest)throw Error("research capture acceptance requires independently verified archive receipts");
 const allowed=new Set(CAPTURE_IDS);
 const received=new Set((manifest.captures||[]).map(x=>x.source_id));
 const exceptions=manifest.uncaptured_sources||[];
 if(report.complete===true){
  if(report.verified_sha256!==8||report.uncaptured!==0||received.size!==8||
   CAPTURE_IDS.some(id=>!received.has(id)))throw Error("complete research receipts inconsistent");
  return {research_integrity_passed:true,archival_completeness:true,
   missing_official_originals:[],legal_review_complete:false,durable_archive_complete:false};
 }
 const hhs=exceptions.length===1?exceptions[0]:null;
 if(report.verified_sha256!==7||report.uncaptured!==1||
   hhs?.source_id!=="ARCH04B-HHS-HTML"||
   hhs.source_url!==EXPECTED_URLS["ARCH04B-HHS-HTML"]||
   !/official source returned HTTP 403 ARCH04B-HHS-HTML/.test(hhs.reason||"")||
   [...allowed].some(id=>id!=="ARCH04B-HHS-HTML"&&!received.has(id))||
   received.has("ARCH04B-HHS-HTML")||received.size!==7)
  throw Error("research source acceptance rejected: unexpected missing source, missing HHS 403 exception, or inconsistent verified bytes");
 return {research_integrity_passed:true,archival_completeness:false,
  missing_official_originals:["ARCH04B-HHS-HTML"],legal_review_complete:false,
  durable_archive_complete:false};
}
export function compareCapturedVersions(previous,current){
 if(!previous||!current||previous.source_id!==current.source_id||
  !validHash(previous.sha256)||!validHash(current.sha256))
  throw Error("change detection requires same source ID and two verified digests");
 return {source_id:current.source_id,old_sha256:previous.sha256,new_sha256:current.sha256,
  content_changed:previous.sha256!==current.sha256,
  source_version_changed:previous.source_edition!==current.source_edition,
  organizational_absence_or_repeal_inferred:false,
  legal_authority_changed_inferred:false,action:"qualified_source_diff_review_required_if_changed"};
}
