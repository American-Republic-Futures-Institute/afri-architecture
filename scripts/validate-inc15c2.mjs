#!/usr/bin/env node
import {loadINC15C2,validateINC15C2} from "./inc15c2-chart-validation-core.mjs";
try{
 console.log(JSON.stringify(validateINC15C2(loadINC15C2()),null,2));
}catch(err){
 console.error(err instanceof Error?err.message:String(err));
 process.exitCode=1;
}
