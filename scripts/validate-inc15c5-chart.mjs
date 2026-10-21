#!/usr/bin/env node
import {loadEducationChart,validateEducationChart} from './inc15c5-education-chart-validation-core.mjs';
try{console.log(JSON.stringify(validateEducationChart(loadEducationChart()),null,2));}
catch(e){console.error(String(e?.message||e));process.exitCode=1;}
