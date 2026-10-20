#!/usr/bin/env node
// Source-scoped federal institution census completeness report; no legal promotion.
import {loadINC15,validateINC15} from "./inc15-validation-core.mjs";
try{
 const report=validateINC15(loadINC15());
 process.stdout.write(JSON.stringify(report,null,2)+"\n");
}catch(error){
 process.stderr.write(String(error?.message||error)+"\n");
 process.exitCode=1;
}
