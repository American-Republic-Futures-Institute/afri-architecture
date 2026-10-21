#!/usr/bin/env node
// Explicit source-acquisition gate; a green probe does not mean original custody.
import fs from "node:fs/promises";
import path from "node:path";
import {captureDhsOriginal,verifyDhsReceipt} from "./inc15c2-dhs-acquisition-core.mjs";

const [mode,directory,...options]=process.argv.slice(2);
if(!["probe","verify","require-original"].includes(mode)||!directory||
  options.length>0)throw Error("Usage: node scripts/inc15c2-dhs-original.mjs <probe|verify|require-original> ABSOLUTE_OUTPUT_DIR");
const outputDir=path.resolve(directory);
const receipt=mode==="probe"?
 await captureDhsOriginal({outputDir}):
 JSON.parse(await fs.readFile(path.join(outputDir,"capture-receipt.json"),"utf8"));
const validation=await verifyDhsReceipt({outputDir,receipt});
process.stdout.write(JSON.stringify({
 status:receipt.status,
 sourceOriginalAcquired:validation.source_original_acquired,
 independentPublisherOriginalCustodyQualified:false,
 completeCurrentDhsFirstLevelDenominator:null,
 adl1CertifiedCount:0,
 attempts:receipt.attempts.map(a=>({
  requestedOfficialUrl:a.requested_official_url,result:a.result,
  reason:a.reason,redirectCount:a.redirect_count
 })),
 sha256:receipt.original_sha256,bytes:receipt.original_byte_count
},null,2)+"\n");
if(mode==="require-original"&&!validation.source_original_acquired)process.exitCode=2;
