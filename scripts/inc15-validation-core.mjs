// INC-15A: immutable research cohort/identity qualification, not ADL-1.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const P="model/federal/";
export const PIN="359694ec26e5e65d0915485d05f2df2631ad2d15";
const MANIFEST_BLOB="a92db5009ccdf5439ffe8381707b16bb372b99e6";
export const MODELS=Object.freeze(["inc15-cohorts","inc15-cabinet-crosswalks","inc15-department-pilots"]);
const SHA=/^[a-f0-9]{40}$/,ID=/^[A-Z][A-Z0-9-]{2,174}$/;
const fail=s=>{throw Error("INC-15 source census rejected: "+s);};
const ok=(value,label)=>{if(!value)fail(label);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=x=>Array.isArray(x)&&new Set(x).size===x.length;
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const blobSha=raw=>{
 const b=Buffer.from(raw,"utf8");
 return createHash("sha1").update("blob "+b.length+String.fromCharCode(0),"utf8")
  .update(b).digest("hex");
};
const expected=Object.freeze([
 ["CABINET-5USC101","executive-departments.json",15],
 ["CANONICAL-INC12-REFERENCES","coverage/institution-references.json",61],
 ["DOD-10USC111B","dod/statutory-composition.json",11],
 ["DOJ-CHART36","inc13b2-doj-chart.json",36],
 ["VA-DIR22","inc13b3-va-directory.json",22],
 ["VA-STAT9","inc13b3-va-statutes.json",9],
 ["VA-CAND25","inc13b3-va-candidates.json",25],
 ["CONGRESS-APP24","x14c-units.json",24],
 ["EOP-NOT-DENOMINATED","executive-leadership.json",null],
 ["INDEPENDENTS-NOT-DENOMINATED","executive-independent.json",null],
 ["LEGISLATIVE-NOT-DENOMINATED","legislative.json",null],
 ["JUDICIAL-NOT-DENOMINATED","judiciary.json",null]
]);
const sourcePaths=expected.map(x=>P+x[1]);
const additional=[P+"x12-identities.json",P+"coverage/components.json",
 P+"expansion/sources.json",P+"expansion/snapshots.json",
 P+"coverage/source-registry.json",P+"coverage/source-snapshots.json",
 P+"department-structure/source-registry.json",
 P+"department-structure/source-snapshots.json",
 P+"dod/source-registry.json",P+"dod/source-snapshots.json"];
// Each digest is from the Git blob tree at immutable PIN, NOT calculated from
// the mutable working tree or copied from a cohort's own declared checksum.
const PINNED_SOURCE_BLOBS=Object.freeze({
  "model/federal/executive-departments.json": "a7557ec212e3e3123d6b4e6bc121ed734d93bfc7",
  "model/federal/coverage/institution-references.json": "e0c2a131e39a8985b52b2705f9a852977cf5628f",
  "model/federal/dod/statutory-composition.json": "85f7311d716968fd80744df70725758a7afd7680",
  "model/federal/inc13b2-doj-chart.json": "c612fce3a4e5b77eb3e7ab60fe3f5b33400da5f6",
  "model/federal/inc13b3-va-directory.json": "b827932a7b54baeb453ebf9e890199960ea8a19a",
  "model/federal/inc13b3-va-statutes.json": "3e0e2cc0bcf20197900c42e20dde33f86a6e62df",
  "model/federal/inc13b3-va-candidates.json": "26df6c0364d4c490e21162d838bbbb4115dba8b7",
  "model/federal/x14c-units.json": "be9c40e39a30f1bd04f8e7884c387fdf5d797c96",
  "model/federal/executive-leadership.json": "48300360c7616b4ca011a9b4c2ca7a7372512005",
  "model/federal/executive-independent.json": "42aee8be052acf712f4766193f3f917730029b8f",
  "model/federal/legislative.json": "ebe49aea1a33a0e6aab28e34821e8504a24f71f4",
  "model/federal/judiciary.json": "f17f31f2e0497574dae5915bbce3f1fdeeff836c",
  "model/federal/x12-identities.json": "b46d975c78d8789f2e96288b0349462e7a82597f",
  "model/federal/coverage/components.json": "e4d6f5f7bec4aa53d0aca5622615938945ca0962",
  "model/federal/expansion/sources.json": "eea865ca03483672491606eb7f6de0250b0979f7",
  "model/federal/expansion/snapshots.json": "e790add0820c70fd7081257d4fa104d393bfe9bc",
  "model/federal/coverage/source-registry.json": "7f0d6aae22c625d83dc1609cbc332335e5022bdc",
  "model/federal/coverage/source-snapshots.json": "b8d60b31ef07df7ee9cbb1fff670ccb3e102b9cc",
  "model/federal/department-structure/source-registry.json": "b91cccbe4687c4d1f7ca67cb4a513aeb096f8543",
  "model/federal/department-structure/source-snapshots.json": "15284a0e2b653703ce3b30d1a0f770c80c92389f",
  "model/federal/dod/source-registry.json": "9202f0a97c3f5b8f7f31f0471459199fb24c692c",
  "model/federal/dod/source-snapshots.json": "68fb444b46d688b87a67d2190958e3c0da810567"
});
export function loadINC15(){
 const paths=[...new Set([...sourcePaths,...additional])];
 const sourceBytes=Object.fromEntries(paths.map(p=>[p,read(p)]));
 const originals=Object.fromEntries(paths.map(p=>[p,JSON.parse(sourceBytes[p])]));
 return {manifest:JSON.parse(read(P+"manifest.json")),
  schema:JSON.parse(read("schemas/inc15-federal-breadth.schema.json")),
  models:Object.fromEntries(MODELS.map(x=>[x,JSON.parse(read(P+x+".json"))])),
  originals,sourceBytes};
}
function schemaRule(rule,value){
 if(Object.hasOwn(rule,"const"))ok(same(value,rule.const),"schema exact constant");
 if(rule.type){
  const found=value===null?"null":Array.isArray(value)?"array":
   Number.isInteger(value)?"integer":typeof value;
  ok([rule.type].flat().includes(found),"closed schema value type");
 }
 if(typeof value==="string"&&rule.minLength!==undefined)
  ok(value.length>=rule.minLength,"schema string length");
 if(Number.isInteger(value)&&rule.minimum!==undefined)
  ok(value>=rule.minimum,"schema integer lower bound");
 if(rule.type==="array"){
  ok(Array.isArray(value)&&value.length>=(rule.minItems??0)&&
   value.length<=(rule.maxItems??Infinity),"bounded schema array");
  if(rule.uniqueItems)ok(unique(value.map(x=>JSON.stringify(x))),"schema duplicate array value");
  for(const x of value)schemaRule(rule.items,x);
 }
 if(rule.type==="object"){
  ok(rule.additionalProperties===false&&value&&
   typeof value==="object"&&!Array.isArray(value),
   "closed schema object required");
  const keys=Object.keys(rule.properties||{});
  ok(unique(keys)&&same([...keys].sort(),[...(rule.required||[])].sort())&&
   same(Object.keys(value).sort(),keys.sort()),"open, missing or forged property");
  for(const k of keys)schemaRule(rule.properties[k],value[k]);
 }
}
export function validateINC15(input){
 const {manifest,schema,models,originals,sourceBytes}=input||{};
 ok(manifest?.model_standard==="ARFI-COA"&&
   manifest?.model_version==="0.1.0"&&
   manifest?.release_status==="research_baseline_unratified"&&
   Array.isArray(manifest.models)&&manifest.models.length===273&&
   unique(manifest.models),"source declaration and unratified edition");
 const extension=manifest.federal_institutional_breadth_15_extension;
 ok(extension?.source_baseline_commit===PIN&&
   extension?.source_baseline_manifest_git_blob_sha===MANIFEST_BLOB&&
   extension?.cohorts===12&&extension?.cabinet_identity_crosswalks===15&&
   extension?.department_pilots===3&&
   extension?.whole_federal_institution_denominator===null&&
   extension?.whole_federal_first_level_denominator===null&&
   extension?.independently_qualified_original_source_count===0&&
   extension?.adl1_certified_count===0&&
   extension?.legal_review_complete===false,
   "falsified INC-15 scope, denominator or legal qualification");
 for(const family of MODELS)
  ok(manifest.models.filter(x=>x===P+family+".json").length===1,
   "undeclared or repeated INC-15 model "+family);
 ok(schema?.$schema==="https://json-schema.org/draft/2020-12/schema"&&
  Array.isArray(schema.oneOf)&&schema.oneOf.length===3,
  "unrecognized closed-schema release");
 for(let n=0;n<MODELS.length;n++){
  const model=models?.[MODELS[n]];
  ok(model?.model_family===MODELS[n]&&model.model_version==="0.1.0"&&
   model.source_baseline_commit===PIN&&Array.isArray(model.items)&&
   unique(model.items.map(x=>x.id))&&model.items.every(x=>ID.test(x.id)),
   "model family/edition/source ID drift "+MODELS[n]);
  schemaRule(schema.oneOf[n],model);
 }
 ok(models["inc15-cohorts"].adl1_certified_count===0&&
  models["inc15-department-pilots"].admitted_legal_authority_count===0,
  "top-level legal authority or ADL certification cannot be promoted");
 // Source-input bytes MUST resolve to the original fixed Git tree and cannot
 // be modified with a matching self-reported checksum.
 ok(sourceBytes&&same(Object.keys(sourceBytes).sort(),Object.keys(PINNED_SOURCE_BLOBS).sort()),
  "missing, added or substituted original model file");
 for(const [p,pinned] of Object.entries(PINNED_SOURCE_BLOBS)){
  const raw=sourceBytes[p];
  ok(SHA.test(pinned)&&typeof raw==="string"&&blobSha(raw)===pinned&&
    same(JSON.parse(raw),originals?.[p]),
    "pinned-commit original Git blob mismatch "+p);
 }
 const cohorts=models["inc15-cohorts"].items,cabinet=models["inc15-cabinet-crosswalks"].items,
  pilots=models["inc15-department-pilots"].items;
 ok(cohorts.length===12&&cabinet.length===15&&pilots.length===3&&
  models["inc15-cohorts"].whole_federal_institution_denominator===null&&
  models["inc15-cohorts"].whole_federal_first_level_denominator===null&&
  models["inc15-cabinet-crosswalks"].government_first_level_denominator===null,
  "cohort or federal government completeness invented");
 const byPath=new Map();
 for(const [suffix,path,count] of expected){
  const c=cohorts.find(x=>x.id==="INC15-COHORT-"+suffix);
  const full=P+path,raw=sourceBytes?.[full],o=originals?.[full];
  ok(c&&c.source_model_path===full&&c.source_model_commit===PIN&&
   typeof raw==="string"&&SHA.test(c.source_model_blob_sha)&&
   c.source_model_blob_sha===PINNED_SOURCE_BLOBS[full]&&
   c.source_model_blob_sha===blobSha(raw)&&
   same(JSON.parse(raw),o)&&o?.model_version==="0.1.0"&&
   Array.isArray(o.items)&&unique(o.items.map(x=>x.id)),
   "source edition, Git blob or source roster drift "+full);
  ok(c.source_record_count===count&&
   c.source_scoped_roster_validated===(count!==null)&&
   (count===null||o.items.length===count)&&
   c.full_current_first_level_denominator===null&&
   c.independent_publisher_original_custody===false&&
   c.independent_legal_review_complete===false&&
   c.adl1_certified_count===0&&
   c.counts_additive_to_other_cohorts===false&&
   c.jurisdiction==="federal",
   "non-additive source denominator or legal promotion "+c.id);
  byPath.set(full,c);
 }
 ok(unique(cohorts.map(x=>x.source_model_path))&&
  same(cohorts.map(x=>x.id),expected.map(x=>"INC15-COHORT-"+x[0])),
  "missing or invented source cohorts");
 // Statutory class identity is not equivalent to a staffing slot or command.
 const statutory=originals[P+"dod/statutory-composition.json"].items;
 const components=new Map(originals[P+"coverage/components.json"].items.map(x=>[x.id,x]));
 ok(statutory.length===11&&
  statutory.filter(x=>x.kind==="residual_statutory_class"&&
   x.is_complete_list_of_individual_members===false).length===2&&
  statutory.filter(x=>components.has(x.id)).length===9,
  "DoD statutory categories accidentally converted into 11 offices");
 const refs=originals[P+"coverage/institution-references.json"].items,
  x12=originals[P+"x12-identities.json"].items,depts=originals[P+"executive-departments.json"].items;
 const byRef=new Map(refs.map(x=>[x.institution_id,x]));
 const byX12=new Map(x12.map(x=>[x.canonical_id,x]));
 const sourceMap=new Map([...originals[P+"expansion/sources.json"].items,
  ...originals[P+"coverage/source-registry.json"].items,
  ...originals[P+"department-structure/source-registry.json"].items,
  ...originals[P+"dod/source-registry.json"].items].map(x=>[x.id,x]));
 const snapshots=new Map([...originals[P+"expansion/snapshots.json"].items,
  ...originals[P+"coverage/source-snapshots.json"].items,
  ...originals[P+"department-structure/source-snapshots.json"].items,
  ...originals[P+"dod/source-snapshots.json"].items].map(x=>[x.id,x]));
 ok(depts.length===15&&refs.length===61&&x12.length===61&&
  sourceMap.has("EXP-SRC-5-USC-101")&&snapshots.has("EXP-SNAP-5-USC-101"),
  "canonical source identity baseline");
 for(const c of cohorts){
  if(c.source_id)ok(sourceMap.has(c.source_id),"undeclared publisher source "+c.id);
  if(c.source_snapshot_id)ok(snapshots.has(c.source_snapshot_id),
   "unregistered publisher snapshot "+c.id);
 }
 ok(same(cabinet.map(x=>x.canonical_institution_id),depts.map(x=>x.id)),
  "lost, inserted or reordered Cabinet institution identity");
 for(let n=0;n<depts.length;n++){
  const d=depts[n],w=cabinet[n],r=byRef.get(d.id),i=byX12.get(d.id);
  ok(r&&i&&w.id==="INC15-XWALK-"+d.id&&
   w.canonical_source_model_path===P+"executive-departments.json"&&
   w.canonical_catalog_name===d.name&&w.canonical_catalog_ordinal===n+1&&
   w.canonical_parent_id===d.parent_id&&w.branch_id===d.branch_id&&
   w.prior_inc12_reference_id===r.id&&w.prior_x12_identity_id===i.id&&
   w.source_id==="EXP-SRC-5-USC-101"&&
   w.source_snapshot_id==="EXP-SNAP-5-USC-101"&&
   w.identity_match_kind==="existing_canonical_identity_same_as_model_and_reference"&&
   w.source_label_independently_transcribed===false&&
   w.independent_legal_review_complete===false&&w.adl1_certified===false&&
   w.agency_components_complete===false,
   "Cabinet original identity or independent certification mismatch "+d.id);
 }
 const expectedPilots=[
  ["DEFENSE",["DOD-10USC111B"],11],
  ["JUSTICE",["DOJ-CHART36"],36],
  ["VA",["VA-DIR22","VA-STAT9","VA-CAND25"],22]
 ];
 const declaredCohorts=new Set(cohorts.map(x=>x.id));
 for(const [n,ids,count] of expectedPilots){
  const cohortIds=ids.map(id=>"INC15-COHORT-"+id);
  const x=pilots.find(p=>p.id==="INC15-PILOT-"+n);
  ok(x&&x.department_id==="ORG-FED-EXE-DEP-"+n&&
   x.canonical_reference_id==="CENSUS-REF-ORG-FED-EXE-DEP-"+n&&
   x.lead_source_count===count&&
   same(x.counted_cohort_ids,cohortIds)&&
   x.counted_cohort_ids.every(id=>declaredCohorts.has(id))&&
   x.source_cohorts_may_be_summed===false&&
   x.current_department_roster_complete===false&&
   x.global_first_level_denominator===null&&
   x.specific_supervisory_control_verified===false&&
   x.signed_delegation_verified===false&&
   x.publisher_original_custody_verified===false&&
   x.independent_legal_review_complete===false&&
   x.adl1_certified===false&&
   x.exceptions.length>=4&&unique(x.exceptions)&&
   byRef.has(x.department_id),
   "source-specific DoD/DOJ/VA pilot coverage or exception lost "+n);
 }
 ok(pilots.find(x=>x.id==="INC15-PILOT-VA")?.counted_cohort_ids.length===3&&
  pilots.find(x=>x.id==="INC15-PILOT-DEFENSE")?.exceptions.some(x=>x.includes("Coast_Guard"))&&
  pilots.find(x=>x.id==="INC15-PILOT-JUSTICE")?.exceptions.some(x=>x.includes("adjudicative")),
  "missing VA overlap / DoD Coast Guard / DOJ jurisdiction safeguards");
 return Object.freeze({version:"INC-15A-source-scoped-research-v1",
  original_source_commit:PIN,source_cohorts:cohorts.length,
  source_qualified_fixed_counts:cohorts.filter(x=>x.source_record_count!==null).length,
  cabinet_identity_crosswalks:cabinet.length,department_pilots:pilots.length,
  original_census_references:refs.length,whole_government_denominator:null,
  full_first_level_denominator:null,adl1_certified_count:0,
  status:"bounded_non_additive_institutional_research_not_current_legal_completeness"});
}
