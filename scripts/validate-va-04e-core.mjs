// ARFI Inc04E: strict research model; no CI may ratify governance, register a custodian, or certify ADL-1.
export const FAMILIES=Object.freeze(["governance-decisions","signer-enrollments","storage-targets",
 "va-legal-issues","source-temporal-index","qualification-gates","va-dossier"]);
export const PATHS=FAMILIES.map(x=>"model/federal/inc04e/"+x+".json");
export const UPSTREAM=["model/federal/inc04d/observed-source-receipts.json",
 "model/federal/inc04d/coverage.json","model/federal/inc04d/legal-identities.json",
 "model/federal/inc04c/va-statutory-composition.json"];
const fail=x=>{throw Error("04E architecture rejected: "+x);};
const check=(x,y)=>{if(!x)fail(y);};
const unique=xs=>new Set(xs).size===xs.length;
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const official=Object.freeze({
 "CANTEEN":"https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title38-section7808",
 "VABCA":"https://www.cbca.gov/decisions/predecessors.html",
 "CBCA":"https://www.govinfo.gov/content/pkg/USCODE-2024-title41/html/USCODE-2024-title41-subtitleIII-chap71-sec7105.htm",
 "OIG":"https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title5-section403",
 "BVA":"https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title38-section7104",
 "OEDCA":"https://uscode.house.gov/view.xhtml?edition=prelim&req=granuleid%3AUSC-prelim-title38-section319"
});
function match(v,rule){
 if("const" in rule&&v!==rule.const)return false;
 if(rule.enum&&!rule.enum.includes(v))return false;
 const type=v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
 if(rule.type&&!([].concat(rule.type)).includes(type))return false;
 if(type==="string"&&((rule.minLength!==undefined&&v.length<rule.minLength)||
  rule.pattern&&!new RegExp(rule.pattern).test(v)))return false;
 if(type==="array"&&(rule.uniqueItems&&!unique(v)||rule.items&&!v.every(x=>match(x,rule.items))))return false;
 if(type==="integer"&&rule.minimum!==undefined&&v<rule.minimum)return false;
 return true;
}
export function inspectSchema04E(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  schema?.additionalProperties!==false||schema.oneOf?.length!==FAMILIES.length||
  !same(schema.properties?.model_family?.enum||[],FAMILIES))
   errors.push("invalid seven-family JSON Schema dispatch");
 for(const key of FAMILIES){
  const def=schema?.$defs?.[key],path="model/federal/inc04e/"+key+".json",doc=files[path];
  const dis=schema?.oneOf?.find(x=>x.properties?.model_family?.const===key);
  if(def?.type!=="object"||def.additionalProperties!==false||
   !Array.isArray(def.required)||dis?.properties?.items?.items?.$ref!=="#/$defs/"+key){
   errors.push("collection schema missing/unsafe "+key);continue;
  }
  if(doc?.model_version!=="0.1.0"||doc.model_family!==key||!Array.isArray(doc.items)){
   errors.push("collection identity/shape mismatch "+key);continue;
  }
  for(const [i,row]of doc.items.entries()){
   for(const k of Object.keys(row)){
    if(!def.properties?.[k])errors.push("undeclared field "+key+"/"+i+"/"+k);
    else if(!match(row[k],def.properties[k]))errors.push("bad field "+key+"/"+i+"/"+k);
   }
   for(const k of def.required)if(!(k in row))errors.push("missing field "+key+"/"+i+"/"+k);
  }
 }
 return {families:FAMILIES.length,errors};
}
export function validate04E(manifest,files,schema){
 const e=manifest?.federal_institutional_trust_04e_extension;
 check(manifest?.model_standard==="ARFI-COA"&&manifest.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified"&&
  e?.id==="ARFI-COA-VA-TRUST-04E"&&e.version==="0.1.0"&&
  e.depends_on==="ARFI-COA-VA-EVIDENCE-04D"&&
  e.ratified_governance_decisions===0&&e.approved_institutional_signer_keys===0&&
  e.verified_immutable_primary_archives===0&&e.approved_external_legal_decisions===0&&
  e.pending_qualification_gates===9&&e.VA_ADL1_first_level_denominator===null&&
  e.VA_ADL1_qualified===false&&e.public_release===false&&
  e.manuals_original_hashes_preserved===2&&e.statute_2024_hashes_preserved===2&&
  e.governance_state==="requires_real_human_authorization",
  "unratified governance, source or ADL1 status was elevated");
 const s=inspectSchema04E(schema,files);
 check(s.errors.length===0,"closed schema failed: "+s.errors.slice(0,3).join(", "));
 const models=Object.fromEntries(FAMILIES.map(f=>{
  const path="model/federal/inc04e/"+f+".json";
  check(manifest.models?.includes(path),"unregistered evidence model "+path);
  const rows=files[path].items;
  check(unique(rows.map(x=>x.id)),"duplicate record IDs "+path);
  return [f,rows];
 }));
 for(const path of UPSTREAM)
  check(manifest.models?.includes(path)&&files[path]?.model_version==="0.1.0"&&
   Array.isArray(files[path].items),"04E changed an upstream source family "+path);
 const original=files[UPSTREAM[0]].items;
 check(original.filter(x=>x.body_sha256!==null).length===4&&
  original.find(x=>x.id==="D04D-OBS-FOM1")?.body_sha256===
   "d4c9bc1f84cfb08dd92df5e95e624b479f04a9f7e94abecb6e092e2748a5d523"&&
  original.find(x=>x.id==="D04D-OBS-FOM2")?.body_sha256===
   "a9900503672b48541a1639167bc0a2b2f5e7b3607c85881faa9caf0b28a90f1b"&&
  original.find(x=>x.id==="D04D-OBS-CBCA")?.body_sha256===null,
  "four original SHA-256 capture receipts or unavailable CBCA changed");
 const g=models["governance-decisions"];
 check(g.length===5&&same(g.map(x=>x.id),["RETENTION","CUSTODY","LEGAL","KEYS","STORAGE"].map(x=>"E04E-GOV-"+x))&&
  g.every(x=>x.owner_role==="governing_board"&&x.decision==="pending"&&
   x.adoption_record_id===null&&x.signed_resolution_sha256===null&&
   x.board_quorum_verified===false&&x.adopted_at===null&&x.ratified===false),
  "governance adoption cannot be fabricated");
 const k=models["signer-enrollments"];
 check(k.length===4&&same(k.map(x=>x.id),[
  "ROOT-GOVERNANCE","EVIDENCE-CUSTODIAN","INDEPENDENT-LEGAL","ARCHIVE-REVIEWER"].map(x=>"E04E-SIGNER-"+x))&&
  k.every(x=>x.signer_identity===null&&x.public_key_spki_sha256===null&&
   x.public_key_spki_pem===null&&x.proof_of_possession_signature===null&&
   x.governing_root_signature===null&&x.governance_resolution_id===null&&
   x.independent_reviewer_id===null&&x.institutionally_approved===false&&
   x.trust_state==="unenrolled"),
  "a source research PR cannot activate institutional signing identities");
 const a=models["storage-targets"];
 check(a.length===2&&same(a.map(x=>x.id),["E04E-ARCHIVE-PRIMARY","E04E-ARCHIVE-REPLICA"])&&
  a.every(x=>x.AWS_account_id===null&&x.bucket_name===null&&
   x.customer_managed_KMS_key_ARN===null&&x.object_lock_enabled_verified===false&&
   x.versioning_enabled_verified===false&&x.retention_policy_id===null&&
   x.read_only_attestation_manifest_sha256===null&&
   x.CloudTrail_data_events_verified===false&&x.backend_configured===false&&
   x.provider_proof_verified===false&&x.release_state==="blocked"),
  "unprovisioned WORM storage cannot self-attest");
 const legal=models["va-legal-issues"];
 check(legal.length===6&&same(legal.map(x=>x.id),Object.keys(official).map(x=>"E04E-LEGAL-"+x)),
  "six independent VA legal issue records required");
 for(const [k,url]of Object.entries(official)){
  const x=legal.find(y=>y.id==="E04E-LEGAL-"+k);
  check(x.official_legal_source_url===url&&x.predecessor_identity_id==="D04D-INST-"+(k==="VABCA"?"FORMER-VABCA":k)&&
   x.exact_controlling_2026_legal_edition_sha256===null&&
   x.source_citator_as_of===null&&x.executed_delegation_instrument_id===null&&
   x.effective_law_2026_verified===false&&x.jurisdiction_boundary_verified===false&&
   x.adjudication_outcome_inferred===false&&x.congressional_fiscal_authority_inferred===false&&
   x.legal_counsel_review_id===null&&x.legal_decision==="unratified_research_only",
   "VA legal authority status or official reference incorrectly promoted "+k);
 }
 check(legal.find(x=>x.id==="E04E-LEGAL-CANTEEN").qualifying_reference==="38 U.S.C. §7808"&&
   legal.find(x=>x.id==="E04E-LEGAL-OEDCA").primary_reference==="38 U.S.C. §319(a)(3)"&&
   legal.find(x=>x.id==="E04E-LEGAL-CBCA").relationship_kind_candidate.startsWith("GSA_"),
   "Canteen separate status/OEDCA direct reporting/CBCA GSA distinction lost");
 const temporal=models["source-temporal-index"];
 check(temporal.length===6&&same(temporal.map(x=>x.id),[
   "FOM1","FOM2","VA-DIRECTORY","USC38","USC41","CBCA-HISTORY"].map(x=>"E04E-TEMP-"+x))&&
  temporal.filter(x=>x.source_hash_in_predecessor_verified===true).length===5&&
  temporal.every(x=>x.source_temporal_effect_is_2026_current===false&&
   x.source_delta_to_next_edition_sha256===null&&
   x.all_legal_amendments_citator_checked===false&&
   x.office_predecessor_successor_reconciled===false&&x.reviewer_id===null),
   "historical source editions cannot prove 2026 institutional changes");
 const gates=models["qualification-gates"];
 check(gates.length===9&&same(gates.map(x=>x.id),[
   "SCOPE","SOURCE","COHORT","STATUTE","FUNCTIONS","HISTORICAL",
   "HUMAN","CUSTODY","AUDIT"].map(x=>"E04E-QUAL-"+x))&&
  gates.every(x=>x.evidence_sha256===null&&x.independent_reviewer_id===null&&
   x.verified===false&&x.waived===false&&x.status==="not_met"),
   "ADL1 gate cannot be bypassed or marked verified without a review packet");
 const d=models["va-dossier"][0];
 check(models["va-dossier"].length===1&&d.id==="E04E-VA-DOSSIER"&&
  d.directory_source_heading_total===22&&d.dated_FOM_administration_count===3&&
  d.FOM_reported_assistant_secretary_roles===7&&d.FOM_reported_key_official_roles===5&&
  d.FOM_counts_are_not_disjoint_first_level_institution_denominators===true&&
  d.statutory_composition_clauses===9&&d.open_residual_statutory_categories===2&&
  d.special_legal_research_cases===6&&d.original_FOM_PDF_receipts===2&&
  d.original_fixed_2024_law_receipts===2&&
  d.archive_provider_object_verifications===0&&d.human_approval_count===0&&
  d.full_same_as_of_first_level_denominator===null&&
  d.complete_legal_composition_certified===false&&
  d.ADL1_status==="research_only_not_qualified"&&
  d.authorized_institutional_signer===null&&d.public_website_published===false,
  "source page counts must never be converted into a complete governmental ADL1 denominator");
 return {status:"institutional_activation_pending_va_ADL1_unqualified",
  models,counts:{governance_decisions:5,approved_governance:0,source_signers_approved:0,
   original_manuals_hashed:2,statutory_sources_hashed:2,legal_cases:6,
   qualified_adl1_gates:0,first_level_denominator:null}};
}
export function projectVA04E(valid,view){
 check(["legal","sources","qualification","governance"].includes(view),"unknown VA view");
 const key={legal:"va-legal-issues",sources:"source-temporal-index",
  qualification:"qualification-gates",governance:"governance-decisions"}[view];
 return {view,items:valid.models[key],institutional_release_allowed:false,
  ADL1_certified:false,first_level_denominator:null};
}
