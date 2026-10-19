#!/usr/bin/env node
import {loadINC13B3,validateINC13B3,projectINC13B3} from "./inc13b3-validation-core.mjs";
try{
 const data=loadINC13B3();
 const result=validateINC13B3(data);
 if(result.errors.length){console.error(JSON.stringify(result,null,2));process.exitCode=1;}
 else{
  const idx=process.argv.indexOf("--view");
  const view=idx<0?null:process.argv[idx+1]||"overview";
  console.log(JSON.stringify(view?projectINC13B3(data,view):result,null,2));
 }
}catch(err){console.error("INC13B3 validation or I/O error:",err.message);process.exitCode=1;}
