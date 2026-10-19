#!/usr/bin/env node
import {loadINC13B1,validateINC13B1,projectINC13B1} from "./inc13b1-validation-core.mjs";
const data=loadINC13B1(),report=validateINC13B1(data.model,data.inputs);
if(report.errors.length){console.error(report.errors.join("\n"));process.exitCode=1;}
else console.log(JSON.stringify(process.argv.includes("--view")?projectINC13B1(data):report,null,2));
