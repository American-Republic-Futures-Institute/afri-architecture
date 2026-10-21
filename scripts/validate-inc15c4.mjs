#!/usr/bin/env node
import {loadINC15C4,validateINC15C4} from "./inc15c4-hhs-validation-core.mjs";
try{console.log(JSON.stringify(validateINC15C4(loadINC15C4()),null,2));}
catch(e){console.error(String(e?.message||e));process.exitCode=1;}
