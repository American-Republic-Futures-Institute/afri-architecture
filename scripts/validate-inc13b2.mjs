#!/usr/bin/env node
import {loadINC13B2,validateINC13B2,projectINC13B2} from "./inc13b2-validation-core.mjs";
const data=loadINC13B2(),result=validateINC13B2(data.model,data.inputs);
if(result.errors.length){console.error(result.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify(process.argv.includes("--view")?projectINC13B2(data):result,null,2));
