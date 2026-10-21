#!/usr/bin/env node
import {loadEducationOriginal,verifyEducationOriginal} from './inc15c5-education-custody-core.mjs';
try{console.log(JSON.stringify(verifyEducationOriginal(loadEducationOriginal()),null,2));}
catch(e){console.error(String(e?.message||e));process.exitCode=1;}
