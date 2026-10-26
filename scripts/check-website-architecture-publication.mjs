#!/usr/bin/env node
/* Cross-repository public-architecture publication contract; read-only. */
import assert from "node:assert/strict";
const ORIGIN=new URL(process.env.ARFI_PUBLIC_ORIGIN||"https://www.arfinstitute.org");
assert.equal(ORIGIN.protocol,"https:");
const EXPECTED=process.env.ARFI_EXPECTED_COMMIT||"";
if(EXPECTED&&!/^[a-f0-9]{40}$/.test(EXPECTED))throw Error("Expected SHA not complete");
async function fetchJson(path,query,expectedStatus=200){
 const url=new URL(path,ORIGIN);
 for(const [k,v] of Object.entries(query||{}))url.searchParams.set(k,String(v));
 const res=await fetch(url,{headers:{Accept:"application/json","Cache-Control":"no-cache",
  "User-Agent":"ARFI-Architecture-Publisher-Consumer-Watchdog"},
  redirect:"follow",signal:AbortSignal.timeout(25000)});
 assert.equal(res.status,expectedStatus,url.pathname+" expected HTTP "+expectedStatus+" got "+res.status);
 assert.match(res.headers.get("content-type")||"",/application\/json/,
  "Expected JSON for "+url.pathname);
 const data=await res.json();
 if(expectedStatus===200){
  assert.match(data.commit||"",/^[a-f0-9]{40}$/);
  assert.equal(data.commit,res.headers.get("x-architecture-commit"));
  assert.equal(res.headers.get("x-architecture-stale"),"0");
 }
 return data;
}
async function onePass(){
 const cat=await fetchJson("/api/architecture",{catalog:"1"});
 const commit=cat.commit;
 if(EXPECTED)assert.equal(commit,EXPECTED,"Website source commit does not match publisher release");
 assert(Array.isArray(cat.entries)&&cat.entries.length>=1000,"Public Atlas unexpectedly lost existing entries");
 assert(Array.isArray(cat.viewpoints)&&cat.viewpoints.length>=3);
 assert(Array.isArray(cat.unrenderedModelFamilies),"Missing source model admission inventory");
 const focused=await fetchJson("/api/focused-architecture",{catalog:"1",commit});
 assert.equal(focused.commit,commit);
 assert.equal(focused.scopes?.length,34,"Seven Articles plus 27 Amendments required");
 for(const view of ["VIEW-FED-OVERVIEW","VIEW-STATE-VA","VIEW-JUD-RIGHTS-INTERPRETATIONS"]){
  const payload=await fetchJson("/api/architecture",{view,commit});
  assert.equal(payload.commit,commit);
  assert.equal(payload.viewpoint?.id,view);
  assert(payload.elements?.length>0,"Empty "+view);
  assert(Array.isArray(payload.relationships),"No typed relationships "+view);
 }
 for(const root_id of ["ORG-FED-EXE-DEP-STATE","ORG-FED-EXE-DEP-VA",
   "ORG-FED-EXE-DEP-DHS","ACT-US-PEOPLE"]){
  const payload=await fetchJson("/api/architecture",{root_id,radius:"1",limit:"32",commit});
  assert.equal(payload.commit,commit);
  assert.equal(payload.root_id,root_id);
  assert(payload.elements?.some(x=>x.id===root_id),"Missing canonical root "+root_id);
 }
 const q=JSON.stringify({scope_id:"SCOPE-CONST-AMD-01"});
 const projection=await fetchJson("/api/focused-architecture",{q,commit});
 assert.equal(projection.scope_id,"SCOPE-CONST-AMD-01");
 assert.equal(projection.commit,commit);
 assert(projection.elements.some(x=>x.id==="CONST-US-AMD-01"));
 assert(projection.relationships.every(x=>x.legal_authority_proven===false),
  "Research connection falsely promoted into legal authority");
 const rejected=await fetchJson("/api/focused-architecture",
  {catalog:"1",unexpected_caller:"1"},400);
 assert.match(rejected.error||"",/Unsupported query parameter/);
 console.log(JSON.stringify({status:"healthy",commit,publicEntries:cat.entries.length,
  focusedScopes:focused.scopes.length,viewpointsChecked:3,rootsChecked:4,
  projectedNodes:projection.elements.length,projectedEdges:projection.relationships.length,
  unknownParametersRejected:true,checkedAt:new Date().toISOString()}));
}
const retry=Math.min(180000,Math.max(0,Number(process.env.ARFI_SOURCE_RETRY_MS||0)));
const begun=Date.now();
for(;;){
 try{await onePass();break;}catch(e){
  if(Date.now()-begun>=retry){console.error("ARFI publication FAILED:",e.message);process.exitCode=1;break;}
  console.warn("Publication pending source promotion:",e.message);
  await new Promise(resolve=>setTimeout(resolve,10000));
 }
}
