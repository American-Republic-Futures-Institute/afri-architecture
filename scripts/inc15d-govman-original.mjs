#!/usr/bin/env node
// Usage: node scripts/inc15d-govman-original.mjs probe|verify ABSOLUTE_OUTPUT_DIR
import fs from 'node:fs/promises';
import path from 'node:path';
import {captureGovmanOriginal, verifyGovmanReceipt} from './inc15d-govman-acquisition-core.mjs';
const [operation, directory] = process.argv.slice(2);
if (!['probe', 'verify'].includes(operation) || !directory || !path.isAbsolute(directory)) {
 console.error('Usage: node scripts/inc15d-govman-original.mjs probe|verify ABSOLUTE_OUTPUT_DIR');
 process.exit(2);
}
try {
 const result = operation === 'probe' ?
  await captureGovmanOriginal({outputDir: directory}) :
  await verifyGovmanReceipt({outputDir: directory,
   receipt: JSON.parse(await fs.readFile(path.join(directory, 'capture-receipt.json'), 'utf8'))});
 console.log(JSON.stringify(result, null, 2));
 // A blocked source should not pass a source-acquisition gate.
 if (operation === 'verify' && result.source_acquired === false) process.exitCode = 3;
 if (operation === 'probe' && result.status === 'blocked_original_bytes_unavailable') process.exitCode = 3;
} catch (e) { console.error(String(e?.stack || e)); process.exitCode = 1; }
