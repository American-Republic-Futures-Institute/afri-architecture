// ARFI Institutional Structure 004: source-group claims are NOT legal powers or whole-department ADL-1.
export const DEPT04_FAMILIES=Object.freeze(["source-registry","govman-roots","candidate-granules",
 "source-snapshots","units","relationships","coverage-ledger","viewpoints","gaps"]);
export const DEPT04_MODEL_PATHS=Object.freeze(DEPT04_FAMILIES.map(x=>
 "model/federal/department-structure/"+x+".json"));
export const DEPT04_CONTEXT_PATHS=Object.freeze([
 "model/federal/executive-departments.json",
 "model/federal/expansion/department-seeds.json",
 "model/federal/expansion/roster.json",
 "model/federal/coverage/source-registry.json"
]);
const fail=why=>{throw Error("Department structure rejected: "+why);};
const check=(ok,why)=>{if(!ok)fail(why);};
const identical=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const uniq=arr=>new Set(arr).size===arr.length;
const formatId=x=>typeof x==="string"&&/^[A-Z][A-Z0-9-]{2,170}$/.test(x);
const byId=arr=>new Map(arr.map(x=>[x.id,x]));
const PREFIX="https://www.govinfo.gov/app/details/GOVMAN-2025-12-31/";
const GOVMAN_ROOTS=Object.freeze({AGRICULTURE:322,COMMERCE:113,ENERGY:116,HHS:117,HUD:119,JUSTICE:121,
 LABOR:323,STATE:123,TRANSPORTATION:124,VA:126,INTERIOR:120,TREASURY:125});
const SOURCE_URLS=Object.freeze({
 "DEPT04-SRC-GOVMAN-2025":"https://www.govinfo.gov/app/details/GOVMAN-2025-12-31",
 "DEPT04-SRC-DOJ-CHART-2026":"https://www.justice.gov/agencies/organizational-chart-text-version",
 "DEPT04-SRC-VA-ADMIN-2026":"https://department.va.gov/administrations-and-offices/",
 "DEPT04-SRC-TREASURY-BUREAUS-2026":"https://home.treasury.gov/about/bureaus/",
 "DEPT04-SRC-COMMERCE-BUREAUS-2026":"https://www.commerce.gov/bureaus-and-offices"
});
const COUNTS=Object.freeze({JUSTICE:36,VA:22,TREASURY:9,COMMERCE:13});
const PREVIOUS_PILOTS=new Set(["ORG-FED-EXE-DEP-DEFENSE","ORG-FED-EXE-DEP-DHS","ORG-FED-EXE-DEP-EDUCATION"]);
const SNAPSHOT_SOURCE={
 JUSTICE:"DEPT04-SRC-DOJ-CHART-2026",
 VA:"DEPT04-SRC-VA-ADMIN-2026",
 TREASURY:"DEPT04-SRC-TREASURY-BUREAUS-2026",
 COMMERCE:"DEPT04-SRC-COMMERCE-BUREAUS-2026"
};
const LEGACY_IDS=Object.freeze({
 "DEPT04-UNIT-JUSTICE-FBI":"EXP-SEED-JUSTICE-FBI",
 "DEPT04-UNIT-JUSTICE-BOP":"EXP-SEED-JUSTICE-BOP",
 "DEPT04-UNIT-VA-VHA":"EXP-SEED-VA-VHA",
 "DEPT04-UNIT-VA-VBA":"EXP-SEED-VA-VBA",
 "DEPT04-UNIT-TREASURY-IRS":"EXP-SEED-TREASURY-IRS",
 "DEPT04-UNIT-TREASURY-FISCAL":"EXP-SEED-TREASURY-FISCAL",
 "DEPT04-UNIT-COMMERCE-NOAA":"EXP-SEED-COMMERCE-NOAA",
 "DEPT04-UNIT-COMMERCE-NIST":"EXP-SEED-COMMERCE-NIST"
});
const FROZEN_NAMES=Object.freeze({
  "DEPT04-UNIT-JUSTICE-AG": "Office of the Attorney General",
  "DEPT04-UNIT-JUSTICE-DAG": "Office of the Deputy Attorney General",
  "DEPT04-UNIT-JUSTICE-SG": "Solicitor General",
  "DEPT04-UNIT-JUSTICE-ASG": "Associate Attorney General",
  "DEPT04-UNIT-JUSTICE-OLA": "Office of Legislative Affairs",
  "DEPT04-UNIT-JUSTICE-OLC": "Office of Legal Counsel",
  "DEPT04-UNIT-JUSTICE-OLP": "Office of Legal Policy",
  "DEPT04-UNIT-JUSTICE-OPA": "Office of Public Affairs",
  "DEPT04-UNIT-JUSTICE-OTJ": "Office of Tribal Justice",
  "DEPT04-UNIT-JUSTICE-JMD": "Justice Management Division",
  "DEPT04-UNIT-JUSTICE-FBI": "Federal Bureau of Investigation",
  "DEPT04-UNIT-JUSTICE-CRIMINAL": "Criminal Division",
  "DEPT04-UNIT-JUSTICE-DEA": "Drug Enforcement Administration",
  "DEPT04-UNIT-JUSTICE-BOP": "Bureau of Prisons",
  "DEPT04-UNIT-JUSTICE-EOUSA": "Executive Office for U.S. Attorneys",
  "DEPT04-UNIT-JUSTICE-USMS": "U.S. Marshals Service",
  "DEPT04-UNIT-JUSTICE-USAO": "U.S. Attorneys",
  "DEPT04-UNIT-JUSTICE-ATF": "Bureau of Alcohol, Tobacco, Firearms and Explosives",
  "DEPT04-UNIT-JUSTICE-NSD": "National Security Division",
  "DEPT04-UNIT-JUSTICE-OPR": "Office of Professional Responsibility",
  "DEPT04-UNIT-JUSTICE-OIG": "Office of the Inspector General",
  "DEPT04-UNIT-JUSTICE-PARDON": "Office of the Pardon Attorney",
  "DEPT04-UNIT-JUSTICE-USPC": "U.S. Parole Commission",
  "DEPT04-UNIT-JUSTICE-EOIR": "Executive Office for Immigration Review",
  "DEPT04-UNIT-JUSTICE-PRAO": "Professional Responsibility Advisory Office",
  "DEPT04-UNIT-JUSTICE-NFED": "National Fraud Enforcement Division",
  "DEPT04-UNIT-JUSTICE-OJP": "Office of Justice Programs",
  "DEPT04-UNIT-JUSTICE-COPS": "Community Oriented Policing Services (COPS)",
  "DEPT04-UNIT-JUSTICE-EOUST": "Executive Office for U.S. Trustees",
  "DEPT04-UNIT-JUSTICE-OIP": "Office of Information Policy",
  "DEPT04-UNIT-JUSTICE-OVW": "Office on Violence Against Women",
  "DEPT04-UNIT-JUSTICE-FCSC": "Foreign Claims Settlement Commission",
  "DEPT04-UNIT-JUSTICE-CRT": "Civil Rights Division",
  "DEPT04-UNIT-JUSTICE-CIV": "Civil Division",
  "DEPT04-UNIT-JUSTICE-ATR": "Antitrust Division",
  "DEPT04-UNIT-JUSTICE-ENRD": "Environment and Natural Resources Division",
  "DEPT04-UNIT-VA-NCA": "National Cemetery Administration",
  "DEPT04-UNIT-VA-VBA": "Veterans Benefits Administration",
  "DEPT04-UNIT-VA-VHA": "Veterans Health Administration",
  "DEPT04-UNIT-VA-ACMO": "Advisory Committee Management Office",
  "DEPT04-UNIT-VA-BVA": "Board of Veterans’ Appeals",
  "DEPT04-UNIT-VA-EHRM-IO": "Electronic Health Record Modernization Integration Office",
  "DEPT04-UNIT-VA-OAWP": "Office of Accountability and Whistleblower Protection",
  "DEPT04-UNIT-VA-OALC": "Office of Acquisition, Logistics, and Construction",
  "DEPT04-UNIT-VA-OCLA": "Office of Congressional and Legislative Affairs",
  "DEPT04-UNIT-VA-OEDCA": "Office of Employment Discrimination Complaint Adjudication",
  "DEPT04-UNIT-VA-OGC": "Office of General Counsel",
  "DEPT04-UNIT-VA-HRA": "Office of Human Resources and Administration",
  "DEPT04-UNIT-VA-OIT": "Office of Information and Technology",
  "DEPT04-UNIT-VA-OM": "Office of Management",
  "DEPT04-UNIT-VA-OSP": "Office of Operations, Security, and Preparedness",
  "DEPT04-UNIT-VA-OPIA": "Office of Public and Intergovernmental Affairs",
  "DEPT04-UNIT-VA-ORPM": "Office of Regulation and Policy Management",
  "DEPT04-UNIT-VA-OSDBU": "Office of Small and Disadvantaged Business Utilization",
  "DEPT04-UNIT-VA-OSA": "Office of Survivor’s Assistance",
  "DEPT04-UNIT-VA-OIG": "Office of the Inspector General",
  "DEPT04-UNIT-VA-VHO": "VA History Office",
  "DEPT04-UNIT-VA-VEO": "Veterans Experience Office",
  "DEPT04-UNIT-TREASURY-TTB": "Alcohol and Tobacco Tax and Trade Bureau",
  "DEPT04-UNIT-TREASURY-BEP": "Bureau of Engraving & Printing",
  "DEPT04-UNIT-TREASURY-FISCAL": "Bureau of the Fiscal Service",
  "DEPT04-UNIT-TREASURY-FINCEN": "Financial Crimes Enforcement Network",
  "DEPT04-UNIT-TREASURY-OIG": "The Inspector General",
  "DEPT04-UNIT-TREASURY-TIGTA": "Treasury Inspector General for Tax Administration",
  "DEPT04-UNIT-TREASURY-IRS": "Internal Revenue Service",
  "DEPT04-UNIT-TREASURY-OCC": "Office of the Comptroller of the Currency",
  "DEPT04-UNIT-TREASURY-MINT": "U.S. Mint",
  "DEPT04-UNIT-COMMERCE-BEA": "Bureau of Economic Analysis",
  "DEPT04-UNIT-COMMERCE-BIS": "Bureau of Industry and Security",
  "DEPT04-UNIT-COMMERCE-EDA": "Economic Development Administration",
  "DEPT04-UNIT-COMMERCE-ITA": "International Trade Administration",
  "DEPT04-UNIT-COMMERCE-MBDA": "Minority Business Development Agency",
  "DEPT04-UNIT-COMMERCE-NIST": "National Institute of Standards and Technology",
  "DEPT04-UNIT-COMMERCE-NOAA": "National Oceanic and Atmospheric Administration",
  "DEPT04-UNIT-COMMERCE-NTIS": "National Technical Information Service",
  "DEPT04-UNIT-COMMERCE-NTIA": "National Telecommunications and Information Administration",
  "DEPT04-UNIT-COMMERCE-CENSUS": "U.S. Census Bureau",
  "DEPT04-UNIT-COMMERCE-USPTO": "U.S. Patent and Trademark Office",
  "DEPT04-UNIT-COMMERCE-OUSEA": "Office of the Under Secretary for Economic Affairs",
  "DEPT04-UNIT-COMMERCE-OS": "Office of the Secretary"
});
const FROZEN_PARENTS=Object.freeze({
  "DEPT04-UNIT-JUSTICE-AG": "ORG-FED-EXE-DEP-JUSTICE",
  "DEPT04-UNIT-JUSTICE-DAG": "DEPT04-UNIT-JUSTICE-AG",
  "DEPT04-UNIT-JUSTICE-SG": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-ASG": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OLA": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OLC": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OLP": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OPA": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OTJ": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-JMD": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-FBI": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-CRIMINAL": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-DEA": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-BOP": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-EOUSA": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-USMS": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-USAO": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-ATF": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-NSD": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OPR": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OIG": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-PARDON": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-USPC": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-EOIR": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-PRAO": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-NFED": "DEPT04-UNIT-JUSTICE-DAG",
  "DEPT04-UNIT-JUSTICE-OJP": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-COPS": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-EOUST": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-OIP": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-OVW": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-FCSC": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-CRT": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-CIV": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-ATR": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-JUSTICE-ENRD": "DEPT04-UNIT-JUSTICE-ASG",
  "DEPT04-UNIT-VA-NCA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-VBA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-VHA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-ACMO": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-BVA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-EHRM-IO": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OAWP": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OALC": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OCLA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OEDCA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OGC": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-HRA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OIT": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OM": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OSP": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OPIA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-ORPM": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OSDBU": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OSA": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-OIG": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-VHO": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-VA-VEO": "ORG-FED-EXE-DEP-VA",
  "DEPT04-UNIT-TREASURY-TTB": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-BEP": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-FISCAL": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-FINCEN": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-OIG": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-TIGTA": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-IRS": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-OCC": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-TREASURY-MINT": "ORG-FED-EXE-DEP-TREASURY",
  "DEPT04-UNIT-COMMERCE-BEA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-BIS": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-EDA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-ITA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-MBDA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-NIST": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-NOAA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-NTIS": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-NTIA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-CENSUS": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-USPTO": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-OUSEA": "ORG-FED-EXE-DEP-COMMERCE",
  "DEPT04-UNIT-COMMERCE-OS": "ORG-FED-EXE-DEP-COMMERCE"
});
const EXACT_GRANULES=Object.freeze({
  "EXP-SEED-TREASURY-IRS": "GOVMAN-2025-12-31-255",
  "EXP-SEED-TREASURY-FISCAL": "GOVMAN-2025-12-31-254",
  "EXP-SEED-JUSTICE-FBI": "GOVMAN-2025-12-31-280",
  "EXP-SEED-JUSTICE-BOP": "GOVMAN-2025-12-31-281",
  "EXP-SEED-INTERIOR-NPS": "GOVMAN-2025-12-31-295",
  "EXP-SEED-INTERIOR-BIA": "GOVMAN-2025-12-31-298",
  "EXP-SEED-COMMERCE-NOAA": "GOVMAN-2025-12-31-264",
  "EXP-SEED-COMMERCE-NIST": "GOVMAN-2025-12-31-266",
  "EXP-SEED-LABOR-OSHA": "GOVMAN-2025-12-31-329",
  "EXP-SEED-HHS-CDC": "GOVMAN-2025-12-31-313",
  "EXP-SEED-HHS-CMS": "GOVMAN-2025-12-31-314",
  "EXP-SEED-TRANSPORTATION-FAA": "GOVMAN-2025-12-31-240",
  "EXP-SEED-TRANSPORTATION-FTA": "GOVMAN-2025-12-31-244"
});
const EXTRA_INDEX_LABELS=new Set(["EXP-SEED-LABOR-BLS","EXP-SEED-ENERGY-FERC"]);
function load(manifest,files,path){
 check(manifest.models.includes(path),"manifest omits scoped model "+path);
 const v=files[path];
 check(v?.model_version==="0.1.0"&&Array.isArray(v.items),"invalid collection "+path);
 check(v.items.every(x=>x&&formatId(x.id))&&uniq(v.items.map(x=>x.id)),
  "duplicate or malformed identifier "+path);
 if(path.startsWith("model/federal/department-structure/"))
  check(v.model_family===path.split("/").at(-1).replace(".json",""),
   "collection disguised as different research family "+path);
 return v.items;
}
function propertyValid(value,rule){
 if(Object.prototype.hasOwnProperty.call(rule,"const")&&value!==rule.const)return false;
 if(rule.enum&&!rule.enum.includes(value))return false;
 const kind=value===null?"null":Array.isArray(value)?"array":Number.isInteger(value)?"integer":typeof value;
 if(rule.type&&!([].concat(rule.type)).includes(kind))return false;
 if(kind==="string"&&((rule.minLength!==undefined&&value.length<rule.minLength)||
    (rule.pattern&&!new RegExp(rule.pattern).test(value))))return false;
 if(kind==="integer"&&rule.minimum!==undefined&&value<rule.minimum)return false;
 if(kind==="array"){
  if(rule.uniqueItems&&!uniq(value))return false;
  if(rule.items&&!value.every(x=>propertyValid(x,rule.items)))return false;
 }
 return true;
}
export function inspectDepartmentSchema(schema,files){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema"||
  schema?.additionalProperties!==false||schema.oneOf?.length!==DEPT04_FAMILIES.length||
  !identical(schema.properties?.model_family?.enum||[],DEPT04_FAMILIES))
  errors.push("schema 2020-12 dispatcher not strict or complete");
 for(const family of DEPT04_FAMILIES){
  const def=schema?.$defs?.[family];
  const v=files["model/federal/department-structure/"+family+".json"];
  const dispatch=schema?.oneOf?.find(x=>x.properties?.model_family?.const===family);
  if(dispatch?.properties?.items?.items?.$ref!=="#/$defs/"+family)
   errors.push("missing schema family dispatcher "+family);
  if(!def||def.additionalProperties!==false||!def.properties?.id?.pattern||!Array.isArray(def.required)){
   errors.push("missing strict schema definition "+family);continue;
  }
  if(v?.model_version!=="0.1.0"||v?.model_family!==family||!Array.isArray(v.items)){
   errors.push("missing or mislabeled collection "+family);continue;
  }
  for(const [i,row]of v.items.entries()){
   if(Object.keys(row).some(x=>!Object.prototype.hasOwnProperty.call(def.properties,x)))
    errors.push("unknown publication field "+family+"["+i+"]");
   for(const needed of def.required)if(!(needed in row))
    errors.push("missing required field "+family+"["+i+"]."+needed);
   for(const [key,value]of Object.entries(row))if(def.properties[key]&&!propertyValid(value,def.properties[key]))
    errors.push("field violates strict contract "+family+"["+i+"]."+key);
  }
 }
 return {families:DEPT04_FAMILIES.length,errors};
}
export function validateDepartmentStructure(manifest,files,schema){
 check(manifest?.model_standard==="ARFI-COA"&&manifest?.model_version==="0.1.0"&&
  manifest.release_status==="research_baseline_unratified","canonical release posture changed");
 const e=manifest.federal_institutional_structure_extension;
 check(e?.id==="ARFI-COA-FED-STRUCTURE-004"&&e.model_version==="0.1.0"&&
  e.predecessor==="ARFI-COA-FED-EXPANSION-003"&&e.root_departments===12&&
  e.legacy_candidate_reconciliations===24&&e.official_govman_candidate_granules_verified===13&&
  e.source_group_snapshots===4&&e.extracted_source_group_unit_records===80&&
  e.extracted_descriptive_relations===80&&e.verified_source_group_denominators===4&&
  e.complete_department_adl1===0&&e.source_bytes_archived===false&&
  e.legal_independent_review_complete===false&&e.source_roster_complete_for_government===false&&
  e.website_publication==="not_implemented"&&e.status==="research_unratified_source_bounded_no_authority_asserted",
  "fabricated ADL / archived evidence / legal authority / publication claims");
 check(manifest.federal_coverage_expansion_extension?.selected_component_seeds===24&&
  manifest.federal_institutional_census_extension?.institutional_reference_count===61,
  "unmerged predecessor source and reference contract lost");
 const schemaReport=inspectDepartmentSchema(schema,files);
 check(schemaReport.errors.length===0,"strict schema violation: "+schemaReport.errors.slice(0,4).join(", "));
 const x=Object.fromEntries(DEPT04_FAMILIES.map(f=>[f,load(manifest,files,
  "model/federal/department-structure/"+f+".json")]));
 const depts=load(manifest,files,"model/federal/executive-departments.json");
 const baselineDepts=new Map(depts.map(x=>[x.id,x]));
 const nonPilot=depts.filter(d=>!PREVIOUS_PILOTS.has(d.id));
 check(depts.length===15&&nonPilot.length===12&&Object.keys(GOVMAN_ROOTS).length===12&&
  identical(nonPilot.map(d=>d.id),Object.keys(GOVMAN_ROOTS).map(c=>"ORG-FED-EXE-DEP-"+c)),
  "15 legal department names / three prior pilot roots mismatch");
 const pSeeds=load(manifest,files,"model/federal/expansion/department-seeds.json"),orig=byId(pSeeds);
 check(pSeeds.length===24,"original 24 selected candidates not retained");
 const sources=byId(x["source-registry"]);
 check(sources.size===5&&identical([...sources.keys()],Object.keys(SOURCE_URLS)),
  "five official source slices missing or substituted");
 for(const s of sources.values()){
  check(s.url===SOURCE_URLS[s.id]&&s.retrieved_on==="2026-10-16"&&
   s.raw_source_bytes_archived===false&&s.raw_source_sha256===null&&
   s.qualified_legal_review===false,"source identity or provenance falsely advanced "+s.id);
  if(s.id==="DEPT04-SRC-GOVMAN-2025")
   check(s.published_or_last_updated==="2025-12-31"&&s.type==="official_dated_government_manual_edition",
    "fixed GovInfo edition not distinguished from mutable page");
  else if(s.id==="DEPT04-SRC-DOJ-CHART-2026")
   check(s.published_or_last_updated==="2026-04-29"&&
    s.limitations.includes("not_digital_signature"),"signed chart version or signature limitations ignored");
  else if(s.id==="DEPT04-SRC-VA-ADMIN-2026")
   check(s.published_or_last_updated==="2026-02-25",
    "VA source publication date drift");
  else check(s.published_or_last_updated===null,"undated directory assigned fictional publication date");
 }
 const roots=byId(x["govman-roots"]);
 check(roots.size===12,"all twelve original nonpilot department granules required");
 for(const d of nonPilot){
  const code=d.id.split("-").at(-1),r=roots.get("DEPT04-GOVMAN-ROOT-"+code),n=GOVMAN_ROOTS[code];
  check(r?.canonical_department_id===d.id&&r.name===d.name&&
   r.source_id==="DEPT04-SRC-GOVMAN-2025"&&
   r.govinfo_package_id==="GOVMAN-2025-12-31"&&
   r.granule_id==="GOVMAN-2025-12-31-"+n&&
   r.source_url===PREFIX+r.granule_id&&
   r.edition_date==="2025-12-31"&&r.retrieved_on==="2026-10-16"&&
   r.source_bytes_sha256===null&&r.full_subordinate_inventory_verified===false&&
   r.current_2026_organizational_status_verified===false&&
   r.statutory_delegation_verified===false&&r.legal_review_status==="not_reviewed",
   "incorrect root publication granule or unsupported current first-level authority "+d.id);
 }
 const granules=byId(x["candidate-granules"]);
 check(granules.size===24&&Object.keys(EXACT_GRANULES).length===13,
  "24 prior candidates or exact source edition crosswalk incomplete");
 for(const seed of pSeeds){
  const c=granules.get("DEPT04-XW-"+seed.id),g=EXACT_GRANULES[seed.id];
  const status=g?"exact_official_details_page_verified":
   EXTRA_INDEX_LABELS.has(seed.id)?"present_in_edition_navigation_but_granule_id_not_reconciled":
   "individual_granule_not_verified";
  check(c?.prior_candidate_id===seed.id&&c.parent_department_id===seed.parent_department_id&&
   c.candidate_label===seed.name&&c.referenced_source_id==="DEPT04-SRC-GOVMAN-2025"&&
   c.edition_date==="2025-12-31"&&c.granule_resolution===status&&
   c.verified_individual_granule_id===(g||null)&&
   c.verified_granule_detail_url===(g?PREFIX+g:null)&&
   c.source_bytes_sha256===null&&c.individual_direct_supervisor_verified===false&&
   c.legal_power_verified===false&&c.full_adl1_completed===false,
   "unverified candidate / wrong GovInfo source locator / invented individual authority "+seed.id);
 }
 const snapshot=byId(x["source-snapshots"]);
 check(snapshot.size===4&&identical([...snapshot.keys()],Object.keys(COUNTS).map(k=>"DEPT04-SNAPSHOT-"+k)),
  "four bounded independent source groups required");
 for(const [code,count]of Object.entries(COUNTS)){
  const s=snapshot.get("DEPT04-SNAPSHOT-"+code);
  check(s?.department_id==="ORG-FED-EXE-DEP-"+code&&
   s.source_id===SNAPSHOT_SOURCE[code]&&s.observed_on==="2026-10-16"&&
   s.source_group_record_count===count&&s.complete_source_group_extracted===true&&
   s.complete_department_first_level_known===false&&s.full_operational_hierarchy_verified===false&&
   s.qualified_institutional_review_complete===false&&
   s.signed_source_instrument_independently_validated===false&&
   s.individual_statutory_delegations_verified===false&&s.status==="bounded_source_group_research_not_adl1",
   "department source group falsely promoted or count mismatched "+code);
  if(code==="JUSTICE")check(s.edition==="signed_chart_date_2026-02-17",
   "DoJ signed chart cannot become timeless current legal authority");
  if(code==="VA")check(s.edition==="site_updated_2026-02-25",
   "VA February 2026 source date cannot silently change");
 }
 const units=byId(x.units);
 check(units.size===80&&Object.keys(FROZEN_NAMES).length===80&&
  identical([...units.keys()],Object.keys(FROZEN_NAMES)),
  "bounded four-scope entity set silently expanded, truncated or duplicated");
 const nodesByDept={};
 for(const u of units.values()){
  const code=u.department_id.split("-").at(-1);
  check(COUNTS[code]!==undefined&&
   u.name===FROZEN_NAMES[u.id]&&u.parent_ref===FROZEN_PARENTS[u.id]&&
   u.type==="source_extracted_structural_unit_candidate"&&
   u.source_id===SNAPSHOT_SOURCE[code]&&
   u.snapshot_id==="DEPT04-SNAPSHOT-"+code&&
   u.original_published_relation_verified_in_named_slice===true&&
   u.whole_organization_current_status_2026_verified===false&&
   u.direct_operational_command_verified===false&&u.statutory_delegation_verified===false&&
   u.legal_subtype_finalized===false&&u.adl_evidenced===0&&
   u.individual_officeholder_modeled===false&&
   u.legal_review_status==="pending_qualified_human_review"&&
   u.legacy_candidate_id===(LEGACY_IDS[u.id]||null)&&
   (u.legacy_candidate_id===null||orig.has(u.legacy_candidate_id)),
   "candidate identity, individual delegation or legal role invented "+u.id);
  check(u.parent_ref===u.department_id||units.has(u.parent_ref)&&
   units.get(u.parent_ref).department_id===u.department_id,
   "cross-agency or missing immediate parent "+u.id);
  // A published directory heading is not a legal classification. In particular,
  // the Commerce webpage mixes senior offices with bureaus; never relabel them.
  if(["DEPT04-UNIT-COMMERCE-OS","DEPT04-UNIT-COMMERCE-OUSEA"].includes(u.id))
   check(u.structural_class==="executive_office_listed_in_bureaus_category_not_legal_bureau",
    "Commerce leadership office cannot become a statutory bureau "+u.id);
  if(["DEPT04-UNIT-VA-BVA","DEPT04-UNIT-VA-OEDCA"].includes(u.id))
   check(u.structural_class==="adjudicatory_office_review_needed",
    "VA adjudicative functions must retain distinct legal review "+u.id);
  if(["DEPT04-UNIT-JUSTICE-EOIR","DEPT04-UNIT-JUSTICE-USPC"].includes(u.id))
   check(u.structural_class==="adjudicatory_or_commission_review_needed",
    "DOJ adjudicative function cannot become a generic command office "+u.id);
  if(u.structural_class==="independent_oversight_position_only")
   check(["DEPT04-UNIT-JUSTICE-OIG","DEPT04-UNIT-VA-OIG","DEPT04-UNIT-TREASURY-OIG",
    "DEPT04-UNIT-TREASURY-TIGTA"].includes(u.id),
    "independent Inspector General must not be treated as a generic bureau");
  if(code==="JUSTICE")
   check(u.source_locator.startsWith("DOJ ")&&
    (u.id==="DEPT04-UNIT-JUSTICE-AG"?u.parent_ref===u.department_id:
    u.id==="DEPT04-UNIT-JUSTICE-DAG"?u.parent_ref==="DEPT04-UNIT-JUSTICE-AG":
    u.group==="chart_under_associate"?
      u.parent_ref==="DEPT04-UNIT-JUSTICE-ASG":
      u.parent_ref==="DEPT04-UNIT-JUSTICE-DAG"),
    "DOJ dated chart connections cannot be rewritten");
  nodesByDept[code]=(nodesByDept[code]||0)+1;
 }
 check(Object.keys(COUNTS).every(c=>nodesByDept[c]===COUNTS[c]),
  "one of four organizational slice denominators is incomplete");
 check(x.units.filter(u=>u.legacy_candidate_id!==null).length===8,
  "existing canonical seed identity links lost");
 // A bounded descriptive connector is NOT necessarily legal subordination.
 const relationships=x.relationships,seen=new Set();
 check(relationships.length===80&&uniq(relationships.map(r=>r.id)),
  "one sourced, typed relation per documented candidate is required");
 for(const r of relationships){
  const unit=units.get(r.from_id),expectedType=
    unit?.structural_class==="independent_oversight_position_only"?
    "independent_oversight_display_placement_not_command":
    unit?.department_id==="ORG-FED-EXE-DEP-JUSTICE"?
    "dated_organizational_chart_connector_not_power":
    "dated_directory_grouping_not_direct_command";
  check(unit&&r.type==="sourced_descriptive_institution_relation"&&
   r.to_id===unit.parent_ref&&r.source_id===unit.source_id&&
   r.snapshot_id===unit.snapshot_id&&r.group===unit.group&&
   r.relationship_type===expectedType&&r.authorized_actor_id===null&&
   r.delegated_power_proven===false&&r.direct_military_or_civilian_command_proven===false&&
   r.appropriation_verified===false&&r.legally_valid_adl1_claim===false&&
   r.source_review_status==="source_slice_verified_only",
   "invented legal command/appropriation, false oversight or disconnected edge "+r.id);
  check(!seen.has(r.from_id),"duplicate organizational parent from a bounded source group");
  seen.add(r.from_id);
 }
 const ledger=byId(x["coverage-ledger"]);
 check(ledger.size===12,"all twelve departments require a full structural evidence ledger");
 for(const d of nonPilot){
  const code=d.id.split("-").at(-1),v=ledger.get("DEPT04-COVERAGE-"+code);
  const candidates=x["candidate-granules"].filter(g=>g.parent_department_id===d.id);
  check(v?.department_id===d.id&&v.official_govman_2025_granule_id===roots.get("DEPT04-GOVMAN-ROOT-"+code).granule_id&&
   v.selected_legacy_candidate_count===2&&
   v.individually_granule_verified_selected_candidates===candidates.filter(y=>y.verified_individual_granule_id!==null).length&&
   identical(v.source_roster_snapshot_ids,snapshot.has("DEPT04-SNAPSHOT-"+code)?["DEPT04-SNAPSHOT-"+code]:[])&&
   v.complete_first_level_denominator===null&&v.current_adl1_certified===false&&
   v.outside_source_slice_not_assumed_absent===true&&
   v.legal_and_institutional_review_complete===false&&
   v.source_archival_bytes_verified===false,
   "fabricated ADL1 denominator or incomplete department root coverage "+d.id);
 }
 const gaps=byId(x.gaps);
 check(gaps.size===15,"twelve department and three special research gaps required");
 for(const d of nonPilot)check(gaps.has("DEPT04-GAP-ADL1-"+d.id.split("-").at(-1)),
  "missing departmental structure completeness gap "+d.id);
 for(const id of ["DEPT04-GAP-ORIGINAL-BYTES","DEPT04-GAP-DOJ-LEGAL","DEPT04-GAP-MUTABLE-SOURCE-EDITION"])
  check(gaps.has(id),"missing independent methodological research gap "+id);
 for(const g of gaps.values())check(g.resolved===false&&g.required_evidence.length>=40&&
  sources.has(g.source_id)&&(!g.department_id||baselineDepts.has(g.department_id)),
  "evidence review gap incorrectly closed or ungrounded "+g.id);
 const views=byId(x.viewpoints),expectedViews=["VIEW-DEPT04-GOVMAN-12",...Object.keys(COUNTS).map(c=>"VIEW-DEPT04-"+c)];
 check(views.size===5&&identical([...views.keys()],expectedViews),
  "five approved snapshot-specific model-only viewpoints required");
 for(const v of views.values()){
  check((v.root_id===null&&v.id==="VIEW-DEPT04-GOVMAN-12"||
    Object.keys(COUNTS).some(code=>v.id==="VIEW-DEPT04-"+code&&
    v.root_id==="ORG-FED-EXE-DEP-"+code))&&
   v.model_only===true&&v.website_rendered===false&&
   v.infer_command===false&&v.infer_statutory_delegation===false&&
   v.claims_complete_department===false,
   "view cannot infer government powers, completion, or website deployment "+v.id);
 }
 const counts={dated_department_granules:12,prior_seed_reconciliations:24,
  exact_individual_candidate_granules:Object.keys(EXACT_GRANULES).length,
  named_source_group_units:units.size,source_scoped_relationships:relationships.length,
  source_roster_slices:4,source_groups_total:4,unresolved_research_gaps:15,
  legal_authorities_from_directory:0,whole_department_adl1_certified:0};
 return {status:"dated_source_slices_only_adl1_unverified",counts,records:x,units,roots,snapshots:snapshot,relationships,
  canonical_depts:baselineDepts};
}
export function projectDepartmentStructure(validated,viewId){
 const v=validated.records.viewpoints.find(x=>x.id===viewId);
 check(v,"unknown or unapproved department evidence viewpoint "+viewId);
 const roots=[...validated.roots.values()].filter(x=>v.root_id===null||x.canonical_department_id===v.root_id);
 const nodes=new Map(roots.map(x=>[x.canonical_department_id,{id:x.canonical_department_id,name:x.name,
  is_canonical:true,scope:"dated_GOVMAN_2025_department_granule",
  source_url:x.source_url,adl_level:0}]));
 if(v.root_id!==null)for(const u of validated.units.values())if(u.department_id===v.root_id)
  nodes.set(u.id,{id:u.id,name:u.name,group:u.group,kind:u.structural_class,
   source_id:u.source_id,adl_level:0,is_canonical:false,legacy_candidate_id:u.legacy_candidate_id});
 const edges=v.root_id===null?[]:validated.relationships.filter(r=>nodes.has(r.from_id)&&nodes.has(r.to_id));
 return {view_id:viewId,render_status:"data_contract_only_not_website_rendered",
  complete_department_adl1:false,source_context:"2025 GovInfo granules plus separate dated/mutable departmental directories",
  nodes:[...nodes.values()].sort((a,b)=>a.id.localeCompare(b.id)),
  relationships:edges.sort((a,b)=>a.id.localeCompare(b.id)),
  warnings:["DOJ organizational-chart connectors and other departmental listings do not confer military or civilian command, statute, delegation, appropriations, or adjudicative jurisdiction.",
   "This diagram exhausts selected published groups within four named source pages only, not each department's legal or current organizational universe.",
   "Primary original XML/source bytes and individual specialist legal review have not been archived or completed."]};
}
