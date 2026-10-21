#!/usr/bin/env node
// HHS publisher-index source research, not legal first-level certification.
import {loadINC15C3,validateINC15C3} from "./inc15c3-validation-core.mjs";
try{
 console.log(JSON.stringify(validateINC15C3(loadINC15C3()),null,2));
}catch(e){
 console.error(String(e?.message||e));
 process.exitCode=1;
}
