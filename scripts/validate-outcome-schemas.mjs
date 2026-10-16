#!/usr/bin/env node
import {validateSchemaPublication} from "./outcome-schema-validator.mjs";
const result=validateSchemaPublication();
if(result.errors.length){
 console.error("INC-07 schema-shape validation FAILED");
 for(const error of result.errors)console.error(" - "+error);
 process.exitCode=1;
}else console.log("INC-07 publication schemas validated",result.files,"documents");
