#!/usr/bin/env node
import { validateReference } from "./reference-validation-core.mjs";
const {failures,summary} = validateReference();
if (failures.length) {
  console.error("INC-06 institutional reference validation FAILED:");
  for (const error of failures) console.error("  - " + error);
  process.exitCode = 1;
} else {
  console.log("INC-06 institutional reference validation passed",JSON.stringify(summary));
}
