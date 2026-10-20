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
  ["DEFENSE","DOD-10USC111B",11],
  ["JUSTICE","DOJ-CHART36",36],
  ["VA","VA-DIR22",22]
 ];
 for(const [n,id,count] of expectedPilots){
  const x=pilots.find(p=>p.id==="INC15-PILOT-"+n);
  ok(x&&x.department_id==="ORG-FED-EXE-DEP-"+n&&
   x.canonical_reference_id==="CENSUS-REF-ORG-FED-EXE-DEP-"+n&&
   x.lead_source_count===count&&
   x.counted_cohort_ids[0]==="INC15-COHORT-"+id&&
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
