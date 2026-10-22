#!/usr/bin/env node
import {loadINC16A,validateINC16A} from "./inc16a-validation-core.mjs";
try {process.stdout.write(JSON.stringify(validateINC16A(loadINC16A()),null,2)+"\n");}
catch(error){process.stderr.write(String(error?.message||error)+"\n");process.exitCode=1;}
