import test from "node:test";
import assert from "node:assert/strict";
import {loadINC13B3,validateINC13B3,projectINC13B3} from "../scripts/inc13b3-validation-core.mjs";
const fresh=()=>structuredClone(loadINC13B3());
const dirId="AR04C-VA-ROW-OIG",fom="model/federal/inc04d/observed-source-receipts.json";
test("INC-13B3: registered models, original SHA pins and bounded nonadditive coverage",()=>{
 const x=fresh(),r=validateINC13B3(x);
 assert.deepEqual(r.errors,[]);
 assert.equal(r.source_pin_count,23);
 assert.equal(r.directory_headings,22);assert.equal(r.directory_administrations,3);
 assert.equal(r.directory_staff_offices,19);assert.equal(r.statutory_clauses,9);
 assert.equal(r.open_residual_categories,2);assert.equal(r.statutory_directory_matches,4);
 assert.equal(r.research_candidates,25);assert.equal(r.candidate_directory_links,22);
 assert.equal(r.candidates_outside_directory,3);assert.equal(r.distinct_special_legal_cases,6);
 assert.equal(r.historical_transition_candidates,1);
 assert.equal(r.qualified_current_first_level_denominator,null);
 assert.equal(r.adl1_certified_count,0);assert.equal(r.legal_review_complete,false);
 assert.equal(r.live_original_custody_qualified,false);assert.equal(r.public_website_admitted,false);
});
test("INC-13B3: source-rooted projections preserve original authority boundaries",()=>{
 const x=fresh();
 const dir=projectINC13B3(x,"directory"),legal=projectINC13B3(x,"legal"),hist=projectINC13B3(x,"history");
 assert.equal(dir.nodes.length,22);assert.equal(dir.source_observed_edges.length,22);
 assert.equal(dir.root_id,"ORG-FED-EXE-DEP-VA");
 assert.equal(new Set(dir.nodes.map(z=>z.original_unit_candidate_id)).size,22);
 assert.equal(dir.source_observed_edges.filter(z=>z.source_relation_type==="independent_oversight_display_placement_not_command").length,1);
 assert.ok(dir.source_observed_edges.every(z=>z.legal_effective_on===null&&z.delegated_authority_verified===false));
 assert.equal(legal.unratified_legal_cases.length,6);
 assert.equal(legal.unratified_legal_cases.find(z=>z.original_identity_id==="D04D-INST-CBCA").external_GSA_body_not_VA_first_level,true);
 assert.equal(hist.historical_transition_candidates[0].operative_legal_effect_certified,false);
 for(const mode of ["overview","directory","statutes","candidates","legal","history","evidence"])
  assert.equal(projectINC13B3(x,mode).coverage.errors.length,0);
 assert.throws(()=>projectINC13B3(x,"invalid"),/Unknown INC13B3/);
});
test("INC-13B3: every directory heading links existing 04A and INC-12 evidence",()=>{
 const x=fresh(),rows=x.models.directory.items;
 const original=x.orig["model/federal/department-structure/relationships.json"].items;
 const census=x.orig["model/federal/x12-observations.json"].items;
 for(const row of rows){
  const rel=original.find(z=>z.id===row.original_department_unit_relation_id);
  const x12=census.find(z=>z.id===row.original_inc12_observation_id);
  assert.equal(rel?.from_id,row.original_unit_candidate_id);
  assert.equal(rel?.relationship_type,row.original_relation_type);
  assert.equal(x12?.relation_source_id,rel.id);
  assert.equal(row.legal_effective_on,null);assert.equal(row.direct_reporting_verified,false);
 }
});
const reject=[
 ["falsified complete department denominator",d=>d.models.scopes.items[0].complete_current_department_roster=true],
 ["false three-administration source split",d=>d.models.scopes.items[0].source_subcounts.administrations=4],
 ["invented directory heading",d=>d.models.directory.items.push({...d.models.directory.items[0],id:"X13B3-DIR-FAKE"})],
 ["missing VA administration",d=>d.models.directory.items.shift()],
 ["duplicate VA source row",d=>d.models.directory.items[1]=d.models.directory.items[0]],
 ["incorrect original directory ID",d=>d.models.directory.items[0].original_directory_id="FAKE"],
 ["forged original structural relationship",d=>d.models.directory.items[0].original_department_unit_relation_id="DEPT04-REL-FAKE"],
 ["replace INC-12 observation pointer",d=>d.models.directory.items[0].original_inc12_observation_id="X12-OBS-FAKE"],
 ["reparent chart into other federal department",d=>d.models.directory.items[0].original_04a_observed_parent_id="ORG-FED-EXE-DEP-DEFENSE"],
 ["turn directory placement into signed legal supervision",d=>d.models.directory.items[0].direct_reporting_verified=true],
 ["assert legal effective date from directory update",d=>d.models.directory.items[0].legal_effective_on="2026-02-25"],
 ["promote source heading to ADL1",d=>d.models.directory.items[0].first_level_certified=true],
 ["pretend directory original in ratified WORM archive",d=>d.models.directory.items[0].permanent_custody_qualified=true],
 ["erase OIG independent oversight edge",d=>d.models.directory.items.find(x=>x.original_directory_id===dirId).original_relation_type="dated_directory_grouping_not_direct_command"],
 ["remove BVA adjudicatory flag",d=>d.models.directory.items.find(x=>x.original_unit_candidate_id==="DEPT04-UNIT-VA-BVA").original_class="commanded_adjudicator"],
 ["remove OEDCA adjudicatory flag",d=>d.models.directory.items.find(x=>x.original_unit_candidate_id==="DEPT04-UNIT-VA-OEDCA").original_class="commanded_adjudicator"],
 ["forge statutory section identity",d=>d.models.statutes.items[0].original_clause_id="AR04C-VA-STAT-301-C-9"],
 ["certify 2026 statute from 2024 original",d=>d.models.statutes.items[0].current_2026_legality_certified=true],
 ["invent enumerated actual units from residual statute",d=>d.models.statutes.items[7].composition_claim_type="statutorily_named_category_or_office"],
 ["wrong statutory source SHA",d=>d.models.statutes.items[0].recorded_original_sha256="0".repeat(64)],
 ["invent extra VA candidate beyond F04F",d=>d.models.candidates.items.push({...d.models.candidates.items[0],id:"FAKE"})],
 ["promote former board to current VA unit",d=>d.models.candidates.items.find(x=>x.original_candidate_id==="F04F-CAND-FORMER-VABCA").current_legal_first_level_inclusion_verified=true],
 ["claim F04F candidates are disjoint current roster",d=>d.models.scopes.items[2].completeness="complete_disjoint_current_2026_roster"],
 ["reclassify external CBCA as VA unit",d=>d.models.legal.items.find(x=>x.original_identity_id==="D04D-INST-CBCA").external_GSA_body_not_VA_first_level=false],
 ["erase Canteen separate-service autonomy",d=>d.models.legal.items.find(x=>x.original_identity_id==="D04D-INST-CANTEEN").protected_distinction="ordinary_staff_department"],
 ["authorize IG oversight override",d=>d.models.legal.items.find(x=>x.original_identity_id==="D04D-INST-OIG").adjudication_or_oversight_override_authorized=true],
 ["pretend BVA merits delegation proven",d=>d.models.legal.items.find(x=>x.original_identity_id==="D04D-INST-BVA").verified_individual_delegation=true],
 ["forge counsel approval on OEDCA",d=>d.models.legal.items.find(x=>x.original_identity_id==="D04D-INST-OEDCA").independent_counsel_decision_id="SIGNED"],
 ["conflate former Board and CBCA identities",d=>d.models.history.items[0].predecessor_identity_id="D04D-INST-CBCA"],
 ["invent statutory repeal from 2007 history",d=>d.models.history.items[0].statutory_repeal_inferred=true],
 ["pretend unavailable CBCA original captured",d=>d.models.history.items[0].source_original_capture_verified=true],
 ["claim complete legal succession",d=>d.models.history.items[0].transition_scope_fully_verified=true],
 ["turn historical publisher date into legal attestation",d=>d.models.history.items[0].operative_legal_effect_certified=true],
 ["forge unavailable CBCA exception",d=>d.models.history.items[0].missing_original_exception_id="D04D-OBS-FOM1"],
 ["invent current government source verification",d=>d.models.evidence.items[0].current_legal_edition_reverified=true],
 ["invent WORM custody",d=>d.models.evidence.items[0].permanent_WORM_custody_qualified=true],
 ["invent independent source signer",d=>d.models.evidence.items[0].institutional_signer_ratified=true],
 ["wrong source custody-queue ID",d=>d.models.evidence.items[0].source_queue_id="NOT-FOUND"],
 ["fake missing CBCA source digest",d=>d.models.evidence.items.at(-1).recorded_original_sha256="1".repeat(64)],
 ["treat missing CBCA original as captured",d=>d.models.evidence.items.at(-1).source_original_captured_previously=true],
 ["erase immutable baseline source pin",d=>d.models["source-pins"].items.pop()],
 ["falsify immutable Git blob SHA",d=>d.models["source-pins"].items[0].git_blob_sha="0".repeat(40)],
 ["attempt source pin path traversal",d=>d.models["source-pins"].items[0].path="../../secrets"],
 ["tamper raw original source response",d=>d.raw[fom]=d.raw[fom]+" "],
 ["mutate existing original source data",d=>d.orig["model/federal/inc04c/va-directory.json"].items[0].source_sha256="0".repeat(64)],
 ["claim VA 04E reviewer approval",d=>d.orig["model/federal/inc04e/qualification-gates.json"].items[0].status="met"],
 ["claim INC13A VA certified",d=>d.orig["model/federal/inc13a-pilots.json"].items.find(x=>x.id==="X13A-PILOT-VA").adl1_certified=true],
 ["remove canonical model registration",d=>d.manifest.models=d.manifest.models.filter(x=>x!=="model/federal/inc13b3-va-legal.json")],
 ["fabricate manifest certified denominator",d=>d.manifest.federal_va_13b3_source_reconciliation_extension.qualified_current_first_level_denominator=55],
 ["loosen closed schema property validation",d=>d.schema.oneOf[0].additionalProperties=true],
 ["change schema baseline commit",d=>d.schema.oneOf[0].properties.source_baseline_commit.const="0".repeat(40)],
 ["allow duplicate source collection elements",d=>d.schema.oneOf[0].properties.items.uniqueItems=false],
 ["inject unmodeled power into a legal case",d=>d.models.legal.items[0].invented_power="command"]
];
for(const [name,mutate] of reject){
 test("INC-13B3 rejects "+name,()=>{
  const d=fresh();mutate(d);
  const result=validateINC13B3(d);
  assert.ok(result.errors.length>0,"Expected validation error for "+name);
 });
}
