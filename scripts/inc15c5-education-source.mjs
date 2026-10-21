#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {acquireEducationPdf,verifyEducationReceipt} from './inc15c5-education-acquisition-core.mjs';
const [op,folder]=process.argv.slice(2);
if(!['probe','verify'].includes(op)||!folder||!path.isAbsolute(folder)){
 console.error('Usage: node scripts/inc15c5-education-source.mjs probe|verify ABSOLUTE_OUTPUT_DIR');
 process.exit(2);
}
try{
 const result=op==='probe'?
   await acquireEducationPdf({outputDir:folder}):
   await verifyEducationReceipt({outputDir:folder,
    receipt:JSON.parse(await fs.readFile(path.join(folder,'capture-receipt.json'),'utf8'))});
 console.log(JSON.stringify(result,null,2));
 if((op==='probe'&&result.status!=='captured_transient_requires_git_custody')||
    (op==='verify'&&!result.acquired))process.exitCode=1;
}catch(e){console.error(e?.stack||String(e));process.exitCode=1;}
