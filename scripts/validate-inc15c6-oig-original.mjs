#!/usr/bin/env node
import {loadInc15c6OigOriginal,validateInc15c6OigOriginal} from './inc15c6-hhs-oig-custody-core.mjs';
try{console.log(JSON.stringify(validateInc15c6OigOriginal(loadInc15c6OigOriginal()),null,2));}
catch(e){console.error(String(e?.stack||e));process.exitCode=1;}
