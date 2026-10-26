"use strict";
/* Real Chromium source-pinned production UI, no mocked response or skip. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
const {execFileSync}=require("node:child_process");
const {existsSync}=require("node:fs");
const ORIGIN=process.env.ARFI_PUBLIC_ORIGIN||"https://www.arfinstitute.org";
function browserBinary(){
 for(const bin of ["google-chrome","google-chrome-stable","chromium","chromium-browser"]){
  try{return execFileSync("which",[bin],{encoding:"utf8"}).trim();}catch{}
 }
 return existsSync(chromium.executablePath())?chromium.executablePath():null;
}
async function main(){
 const path=browserBinary();
 if(!path)throw Error("Chromium is required; browser gate cannot silently skip");
 const resp=await fetch(ORIGIN+"/api/architecture?catalog=1",{signal:AbortSignal.timeout(20000)});
 assert.equal(resp.status,200);
 const cat=await resp.json(),commit=cat.commit;
 assert.match(commit,/^[0-9a-f]{40}$/);
 const browser=await chromium.launch({executablePath:path,headless:true,
  args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const target of [
   {label:"focused-desktop",width:1365,height:900,view:"SCOPE-CONST-AMD-01",scopeCount:34},
   {label:"focused-mobile",width:390,height:844,view:"SCOPE-CONST-AMD-01",scopeCount:34},
   {label:"federal-desktop",width:1365,height:900,view:"VIEW-FED-OVERVIEW",scopeCount:null}
  ]){
   const page=await browser.newPage({viewport:{width:target.width,height:target.height},
    reducedMotion:"reduce"});
   const errors=[],api=[];
   page.on("pageerror",e=>errors.push(String(e.message||e)));
   page.on("response",res=>{
    try{const p=new URL(res.url()).pathname;
     if(p.startsWith("/api/architecture")||p.startsWith("/api/focused-architecture"))
      api.push({path:p,status:res.status()});
    }catch{}
   });
   const doc=await page.goto(ORIGIN+"/architecture/?view="+encodeURIComponent(target.view),
    {waitUntil:"domcontentloaded",timeout:45000});
   assert.equal(doc?.status(),200,"Architecture page HTTP status");
   await page.locator("#loading").waitFor({state:"hidden",timeout:75000});
   const state=await page.evaluate(()=>({
    errorVisible:document.getElementById("error-state")?.hidden===false,
    errorMessage:document.getElementById("error-message")?.textContent,
    count:document.getElementById("graph-count")?.textContent,
    focusedScopes:document.querySelectorAll("button[data-scope]").length,
    sourceStatus:document.getElementById("focused-scope-status")?.textContent,
    canvases:[...document.querySelectorAll("#graph canvas")].filter(c=>{
     const r=c.getBoundingClientRect();return c.width>0&&c.height>0&&r.width>0&&r.height>0;
    }).length
   }));
   assert.equal(state.errorVisible,false,state.errorMessage);
   assert.match(state.count||"",/^[1-9]\d* elements/);
   assert(state.canvases>0,"Missing visible Cytoscape canvas");
   assert.deepEqual(errors,[],"Browser uncaught JavaScript errors");
   if(target.scopeCount!==null){
    assert.equal(state.focusedScopes,target.scopeCount);
    assert(state.sourceStatus?.includes(commit.slice(0,12)),
     "Focused source SHA does not match public catalog");
    assert(api.some(x=>x.path.startsWith("/api/focused-architecture")&&x.status===200),
     "Focused browser API did not return 200");
   }else assert(api.some(x=>x.path.startsWith("/api/architecture")&&x.status===200));
   console.log(JSON.stringify({status:"healthy",scenario:target.label,commit,
    graph:state.count,visibleCanvases:state.canvases,focusedScopes:state.focusedScopes,
    uncaughtPageErrors:errors.length,api}));
   await page.close();
  }
 }finally{await browser.close();}
}
main().catch(e=>{console.error("ARFI browser FAILED:",String(e.stack||e));process.exitCode=1;});
