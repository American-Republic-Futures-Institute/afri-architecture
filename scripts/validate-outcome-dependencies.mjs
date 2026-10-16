#!/usr/bin/env node
import {validateOutcomes} from "./outcome-dependency-validation-core.mjs";
const {errors,summary}=validateOutcomes();
if(errors.length){
  console.error("INC-07 national outcome dependency validation FAILED");
  for(const x of errors)console.error(" - "+x);
  process.exitCode=1;
}else console.log("INC-07 national outcome graph VALID",JSON.stringify(summary));
