import test from "node:test";
import assert from "node:assert/strict";
import {loadINC16A,validateINC16A} from "../scripts/inc16a-validation-core.mjs";
const fresh=()=>loadINC16A();
function rejected(label,mutate){
  test(label,()=>{
    const data=fresh();
    mutate(data);
    assert.throws(()=>validateINC16A(data),/INC-16A:/);
  });
}
test("INC-16A uses already established canonical HHS/DHS roots and retained original mission text",()=>{
  const result=validateINC16A(fresh());
  assert.equal(result.canonical_department_roots,2);
  assert.equal(result.source_reported_mission_functions,9);
  assert.equal(result.directed_conditional_statutory_claims,3);
  assert.equal(result.official_code_section_sources,2);
  assert.equal(result.official_code_originals_retained,2);
  assert.equal(result.qualified_current_executed_interagency_agreements,0);
  assert.equal(result.qualified_current_operational_communications,0);
  assert.equal(result.public_atlas_edges_admitted,0);
  assert.equal(result.independent_legal_review_complete,false);
  assert.equal(result.current_legal_first_level_denominator,null);
});
rejected("reject fabricated signed HHS-DHS interagency agreement",d=>
  d.model.interfaces[2].signed_agreement_verified=true);
rejected("reject invented actual notice delivery",d=>
  d.model.interfaces[0].actual_notice_verified=true);
rejected("reject reverse statutory information duty in declared case",d=>
  d.model.interfaces[0].from_id="ORG-FED-EXE-DEP-DHS");
rejected("reject conflating declared and undeclared emergency conditions",d=>
  d.model.interfaces[1].condition="public_health_emergency_declared_under_42_USC_247d_a");
rejected("reject fabricated HHS command/transfer of other departments",d=>
  d.model.interfaces[2].operational_control_transfer_verified=true);
rejected("reject ignoring DoD statutory military command exception",d=>
  d.model.authority_boundaries[0].hhs_command_over_defense_assets_inferred=true);
rejected("reject invented legal certification",d=>
  d.model.independent_legal_review_complete=true);
rejected("reject government directory mission promoted to a signed mandate",d=>
  d.model.functions[0].legal_delegation_inferred=true);
rejected("reject publisher mission passage not in original",d=>
  d.model.functions[0].source_excerpt="new mandate invented by a model");
rejected("reject previous canonical institution displaced by a new agency ID",d=>
  d.model.canonical_links[0].existing_canonical_id="ORG-FED-EXE-DEP-HHS-REPLACEMENT");
rejected("reject moving a department relationship into a separate branch",d=>
  d.model.interfaces[0].to_id="ORG-FED-LEG-CONGRESS");
rejected("reject a fabricated official original SHA",d=>
  d.model.sources[0].original_sha256="0".repeat(64));
rejected("reject denying captured original bytes without evidence review",d=>
  d.model.sources[1].original_bytes_retained=false);
rejected("reject unsourced expanded or fabricated federal first-level denominator",d=>
  d.model.legal_first_level_denominator=200);
rejected("reject direct publication of unqualified graph relationship",d=>
  d.model.interfaces[0].public_graph_admitted=true);
rejected("reject Atlas view published before its independent adapter gate",d=>
  d.model.viewpoints[2].atlas_admitted=true);
rejected("reject replacing source cutoff without legal edition reconciliation",d=>
  d.model.sources[1].source_edition="current_forever");
rejected("reject fabricating legal relationship category in type registry",d=>
  d.model.relationship_type_registry[0].implies_command=true);
rejected("reject schema and model co-forgery that falsely certifies operational data",d=>{
  d.model.interfaces[0].actual_notice_verified=true;
  d.schema.$defs.interfaces.properties.actual_notice_verified={const:true};
});
rejected("reject schema and model co-forgery that adds a backdoor field",d=>{
  d.model.interfaces[0].unconditional_command_transfer=true;
  d.schema.$defs.interfaces.properties.unconditional_command_transfer={const:true};
});
rejected("reject manifest omission of the typed cross-government model",d=>
  d.manifest.models=d.manifest.models.filter(p=>!p.includes("inc16a-hhs-dhs-functional-interface")));

rejected("reject substituting U.S. Code original hash",d=>
 d.model.sources[1].original_sha256="f".repeat(64));
rejected("reject falsely asserting independent original WORM certification",d=>
 d.manifest.federal_descriptive_missions_16a_extension.all_statutory_originals_retained=false);
rejected("reject original receipt falsely certifying legal opinion",d=>{
 const fs=require("node:fs");
 const receiptPath=require("node:path").join(d.root,"evidence/inc16b-uscode/source-custody.json");
 const original=fs.readFileSync(receiptPath,"utf8");
 // The independent-model qualification flag is always false regardless of bytes.
 d.model.independent_legal_review_complete=true;
});
