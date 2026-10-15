// Pure constitutional-model integrity checker. No rendering or network I/O.
const ALLOWED_UNITS = new Set(["constitution","preamble","article","article_section","article_clause","article_section_segment","amendment","amendment_section"]);
const ALLOWED_EFFECTS = new Set(["operative","mixed","modified_in_part","superseded","repealed","expired","interpretive_context"]);
const ALLOWED_KINDS = new Set(["power","duty","prohibition","right","structural_allocation","procedure","jurisdiction","eligibility","reservation","limitation","historic_repealed"]);
const ALLOWED_BINDINGS = new Set(["confers_power_on","imposes_duty_on","restricts","protects","assigns_function_to","affects_jurisdiction_of","defines_eligibility_for","reserves_power_to"]);
const ARCHIVE_ONLY = new Set(["repealed","superseded","expired"]);
const required = (o,keys)=>keys.filter(k=>!Object.hasOwn(o||{},k));
const array=x=>Array.isArray(x)?x:[];
const validateDate=s=>typeof s==="string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export function validateConstitutionCatalog(catalog){
 const errors=[],push=s=>errors.push(s);
 const m=catalog.manifest, files=catalog.models||{},sources=catalog.sources||[],external=catalog.external_ids||[];
 const mandatory=["actors","provisions","norms","bindings","changes","viewpoints"];
 if(!m || m.model_standard!=="ARFI-COA") push("Unrecognized architecture manifest");
 const sf=new Set(sources.map(s=>s.id)),ef=new Set(external);
 if(sf.size!==sources.length)push("Duplicate source identifier");
 const filesDeclared=new Set(array(m?.models));
 for(const name of mandatory){
  if(!filesDeclared.has("model/constitutional/"+name+".json"))push("Missing constitutional model in publication manifest: "+name);
  if(!files[name] || files[name].model_version!=="0.1.0" || !Array.isArray(files[name].items))push("Invalid model collection: "+name);
 }
 const all=Object.fromEntries(mandatory.map(k=>[k,array(files[k]?.items)]));
 const counts=Object.fromEntries(mandatory.map(k=>[k,all[k].length]));
 const idSets={};
 for(const name of mandatory){
  idSets[name]=new Set;
  for(const rec of all[name]){
   if(typeof rec.id!=="string" || rec.id.length===0){push("Missing identifier in "+name);continue;}
   if(idSets[name].has(rec.id))push("Duplicate "+name+" ID: "+rec.id);
   idSets[name].add(rec.id);
   if(rec.source_ids){
    if(!Array.isArray(rec.source_ids)||!rec.source_ids.length)push("Invalid source list "+rec.id);
    for(const ref of array(rec.source_ids))if(!sf.has(ref))push("Unknown source "+ref+" for "+rec.id);
   }
  }
 }
 const provisions=new Map(all.provisions.map(p=>[p.id,p])),actors=new Map(all.actors.map(a=>[a.id,a])),
 norms=new Map(all.norms.map(n=>[n.id,n]));
 const validTargets=new Set([...external,...idSets.actors]);
 if(all.provisions.filter(p=>p.unit==="article").length!==7)push("Expected exactly seven original Articles");
 if(all.provisions.filter(p=>p.unit==="amendment").length!==27)push("Expected exactly 27 ratified Amendments");
 if(all.provisions.filter(p=>p.unit==="article_section").length!==21)push("Expected 21 numbered original Article Sections");
 if(all.provisions.filter(p=>p.unit==="amendment_section").length!==33)push("Expected 33 numbered Amendment Sections");
 if(all.provisions.filter(p=>p.id.startsWith("CONST-US-ART-01-SEC-08-CL-")).length!==18)push("Expected 18 Article I, Section 8 clauses");
 if(!provisions.has("CONST-US") || !provisions.has("CONST-US-PREAMBLE"))push("Missing constitutional document/preamble");
 if(provisions.get("CONST-US")?.parent_id!==null)push("Constitution root must have null parent");
 for(const p of all.provisions){
  for(const miss of required(p,["type","unit","label","parent_id","citation","source_ids","effect_status","decomposition_status"]))push("Missing provision "+p.id+"."+miss);
  if(p.type!=="constitutional_provision" || !ALLOWED_UNITS.has(p.unit))push("Bad provision unit/type "+p.id);
  if(!ALLOWED_EFFECTS.has(p.effect_status))push("Invalid operative status "+p.id);
  if(p.id!=="CONST-US" && !provisions.has(p.parent_id))push("Dangling provision parent "+p.id);
  if(p.unit==="article" && p.parent_id!=="CONST-US")push("Article not under document: "+p.id);
  if(p.unit==="amendment" && p.parent_id!=="CONST-US")push("Amendment not under document: "+p.id);
  if(p.unit==="article_section" && provisions.get(p.parent_id)?.unit!=="article")push("Article section with invalid parent "+p.id);
  if(p.unit==="article_clause" && !["article_section","article"].includes(provisions.get(p.parent_id)?.unit))push("Article clause with invalid parent "+p.id);
  if(p.unit==="article_section_segment" && provisions.get(p.parent_id)?.unit!=="article_section")push("Article segment has invalid parent "+p.id);
  if(p.unit==="amendment_section" && provisions.get(p.parent_id)?.unit!=="amendment")push("Amendment section invalid parent "+p.id);
  if(p.unit==="amendment" && !validateDate(p.ratified_on))push("Amendment missing valid ratification date "+p.id);
  const traversed=new Set([p.id]);let next=p.parent_id;
  while(next && provisions.has(next)){
   if(traversed.has(next)){push("Provision ancestry cycle "+p.id);break;}
   traversed.add(next);next=provisions.get(next).parent_id;
  }
 }
 if(provisions.get("CONST-US-AMD-18")?.effect_status!=="repealed")push("Eighteenth Amendment must be marked repealed");
 if(provisions.get("CONST-US-AMD-21")?.effect_status!=="operative")push("Twenty-First Amendment must be operative");
 for(const a of all.actors){
  for(const miss of required(a,["type","name","description","status","source_ids"]))push("Missing actor "+a.id+"."+miss);
  if(a.type!=="constitutional_actor_class")push("Not an actor class "+a.id);
  if(!/^ACT-US-[A-Z0-9-]+$/.test(a.id))push("Invalid actor ID "+a.id);
 }
 if(all.norms.length<80)push("Constitutional norm coverage below 80");
 for(const n of all.norms){
  for(const miss of required(n,["type","norm_kind","name","summary","provision_ids","effect_status","interpretation_status","source_ids","qualifications"]))push("Missing norm "+n.id+"."+miss);
  if(n.type!=="constitutional_norm" || !ALLOWED_KINDS.has(n.norm_kind))push("Bad norm kind/type "+n.id);
  if(!["operative","modified_in_part","repealed","superseded","expired"].includes(n.effect_status))push("Bad norm current effect "+n.id);
  if(n.interpretation_status!=="textual_summary_pending_legal_review")push("Unreviewed norm asserted as doctrine "+n.id);
  if(!Array.isArray(n.provision_ids)||!n.provision_ids.length)push("Norm without provisions "+n.id);
  for(const pid of array(n.provision_ids))if(!provisions.has(pid))push("Unknown provision for norm "+n.id+": "+pid);
  if(n.effect_status==="operative"&&array(n.provision_ids).length && array(n.provision_ids).every(pid=>ARCHIVE_ONLY.has(provisions.get(pid)?.effect_status)))push("Operative norm derived solely from inoperative provisions "+n.id);
 }
 const seenBinding=new Set;
 for(const b of all.bindings){
  for(const miss of required(b,["type","norm_id","target_id","relationship_type","assertion_status","source_ids"]))push("Missing binding "+b.id+"."+miss);
  if(b.type!=="constitutional_actor_binding" || !ALLOWED_BINDINGS.has(b.relationship_type))push("Invalid binding type "+b.id);
  if(!norms.has(b.norm_id))push("Unknown binding norm "+b.id);
  if(!validTargets.has(b.target_id))push("Unknown binding actor/institution "+b.id+":"+b.target_id);
  if(b.assertion_status!=="textual_mapping_candidate")push("Unaudited binding asserted as ratified interpretation "+b.id);
  if(norms.has(b.norm_id)&&ARCHIVE_ONLY.has(norms.get(b.norm_id).effect_status))push("Historical/superseded norm may not have current actor binding "+b.id);
  const k=[b.norm_id,b.target_id,b.relationship_type].join("|");
  if(seenBinding.has(k))push("Duplicate semantic binding "+k);
  seenBinding.add(k);
 }
 for(const ch of all.changes){
  for(const miss of required(ch,["type","change_kind","amending_provision_id","affected_provision_ids","status","source_ids"]))push("Missing change "+ch.id+"."+miss);
  if(ch.type!=="constitutional_change"||ch.status!=="ratified_record")push("Unrecognized change "+ch.id);
  const source=provisions.get(ch.amending_provision_id);
  if(!source || (!ch.amending_provision_id.startsWith("CONST-US-AMD-")))push("Change without ratified amendment "+ch.id);
  if(!Array.isArray(ch.affected_provision_ids) || !ch.affected_provision_ids.length)push("Change without target "+ch.id);
  for(const pid of array(ch.affected_provision_ids))if(!provisions.has(pid))push("Unknown change target "+ch.id+":"+pid);
 }
 const repeal=all.changes.find(x=>x.change_kind==="repeals"&&x.amending_provision_id==="CONST-US-AMD-21-SEC-01");
 if(!repeal || !array(repeal.affected_provision_ids).includes("CONST-US-AMD-18"))push("Absent Amendment XXI repeal linkage");
 for(const v of all.viewpoints){
  if(v.type!=="constitutional_viewpoint"||v.status!=="descriptive_candidate")push("Invalid constitutional viewpoint "+v.id);
  for(const id of array(v.root_ids))if(!provisions.has(id))push("Viewpoint missing provision "+v.id+":"+id);
  for(const k of array(v.include_norm_kinds))if(!ALLOWED_KINDS.has(k))push("Viewpoint references invalid kind "+v.id+":"+k);
 }
 for(const auth of array(catalog.legacy_authorities)){
  if(!auth.provision_ids?.length)push("Legacy authority missing constitutional provenance "+auth.id);
  for(const id of array(auth.provision_ids))if(!provisions.has(id))push("Legacy authority points at missing provision "+auth.id+":"+id);
 }
 const major=["SRC-CONST-ORIGINAL-TRANSCRIPT","SRC-CONST-BILL-OF-RIGHTS-TRANSCRIPT","SRC-CONST-LATER-AMENDMENTS"];
 for(const id of major)if(!sf.has(id))push("Missing primary constitutional source "+id);
 return {errors,counts,model_version:"0.1.0",constitutional_document:"CONST-US"};
}
