#!/usr/bin/env node
import {loadINC15C6Model,validateINC15C6Model} from './inc15c6-hhs-model-validation-core.mjs';
try{console.log(JSON.stringify(validateINC15C6Model(loadINC15C6Model()),null,2));}
catch(e){console.error(String(e?.stack||e));process.exitCode=1;}
