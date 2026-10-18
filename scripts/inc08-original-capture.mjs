#!/usr/bin/env node
import {captureX08,verifyX08Bundle} from "./inc08-original-capture-core.mjs";
const [cmd,dir]=process.argv.slice(2);
if(!["--capture","--verify"].includes(cmd)||!dir)throw Error("Usage: node scripts/inc08-original-capture.mjs --capture|--verify OUTPUT_DIR");
if(cmd==="--capture"){
 const x=await captureX08(dir);
 console.log(JSON.stringify({format:x.format,count:x.issuer_original_count,unavailable:x.unavailable_count,
  captured:x.captured_sources.map(s=>({source_id:s.source_id,sha256:s.original_sha256,bytes:s.original_byte_length})),
  missing:x.unavailable_sources.map(s=>({source_id:s.source_id,reason:s.reason})),permanent_custody:false},null,2));
}else console.log(JSON.stringify(await verifyX08Bundle(dir),null,2));
