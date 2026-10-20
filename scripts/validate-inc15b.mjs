#!/usr/bin/env node
// INC-15B source-cohort admission check. No individual legal authority is certified.
import {loadINC15B,validateINC15B} from "./inc15b-validation-core.mjs";
try{
 console.log(JSON.stringify(validateINC15B(loadINC15B()),null,2));
}catch(error){
 console.error(String(error?.message||error));
 process.exitCode=1;
}
