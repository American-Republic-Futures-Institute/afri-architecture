#!/usr/bin/env node
// INC-15C.1: source-scoped historical DHS chart reconciliation, not ADL-1.
import {loadINC15C1,validateINC15C1} from "./inc15c1-validation-core.mjs";
try{
 process.stdout.write(JSON.stringify(validateINC15C1(loadINC15C1()),null,2)+"\n");
}catch(error){
 process.stderr.write(String(error?.message||error)+"\n");
 process.exitCode=1;
}
