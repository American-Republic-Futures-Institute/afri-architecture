#!/usr/bin/env node
// Public-source live capture, intentionally isolated from model CI.
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {captureOfficialSources,verifyCaptureArchive,validateResearchCaptureAcceptance} from "./federal-source-archive-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),"utf8"));
const [mode,folder]=process.argv.slice(2);
const allowPartial=process.argv.includes("--allow-partial");
if(!["--live","--verify","--require-all","--require-research"].includes(mode)||!folder)throw Error("Usage: node scripts/capture-federal-official-sources.mjs [--live|--verify|--require-all] OUT_DIR [--allow-partial]");
if(mode==="--live"){
 const src=(await read("model/federal/archive04b/sources.json")).items;
 const manifest=await captureOfficialSources({sources:src,outputDir:path.resolve(folder),allowPartial});
 console.log(JSON.stringify({status:"sha256_captured_and_verified_in_temporary_actions_artifact",
  records:manifest.captures.map(x=>({id:x.source_id,sha256:x.sha256,bytes:x.byte_count,
   observed_at:x.captured_at,source_url:x.source_url})),
  missing:manifest.uncaptured_sources,complete:manifest.capture_complete},null,2));
}else{
 const archive=JSON.parse(await fs.readFile(path.join(path.resolve(folder),"archive-manifest.json"),"utf8"));
 const check=await verifyCaptureArchive(path.resolve(folder),archive);
 console.log(JSON.stringify(check,null,2));
 if(mode==="--require-all"&&!check.complete)process.exitCode=1;
 if(mode==="--require-research"){
  const evidence=validateResearchCaptureAcceptance(check,archive);
  console.log(JSON.stringify(evidence,null,2));
 }
}
