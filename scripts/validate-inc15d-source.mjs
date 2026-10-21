#!/usr/bin/env node
import {loadINC15DSource,validateINC15DSource} from './inc15d-source-custody-core.mjs';
try{console.log(JSON.stringify(validateINC15DSource(loadINC15DSource()),null,2));}
catch(e){console.error(String(e?.message||e));process.exitCode=1;}
