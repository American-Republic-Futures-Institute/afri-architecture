import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={cases:'model/wholegov/inc17b2d1-transition-cases.json',gates:'model/wholegov/inc17b2d1-source-gates.json',old:'model/wholegov/inc17b2c-pilot-coverage.json',dispositions:'model/wholegov/inc17b2c-relationship-dispositions.json',custody:'evidence/inc17b2b-olrc-119-124/source-custody.json',departments:'model/federal/executive-departments.json',manifest:'model/federal/manifest.json',ontology:'model/wholegov/ontology.json'};
export function load(root=ROOT){return Object.fromEntries(Object.entries(P).map(([k,v])=>[k,JSON.parse(fs.readFileSync(path.join(root,v),'utf8'))]));}
export function validate(d){
 const errors=[],fail=m=>errors.push(m);
 const ids=new Set(d.departments.items.map(x=>x.id));
 if(ids.size!==15||d.departments.items.length!==15||d.cases.canonical_department_root_count!==15||d.gates.all_cabinet_roots_preserved!==15)fail('15 canonical Cabinet roots must remain unchanged');
 const legal=new Map(d.dispositions.legal.map(x=>[x.id,x]));
 const source=new Map(d.cases.sources.map(x=>[x.source_key,x]));
 if(d.cases.sources.length!==5||source.size!==5)fail('five source proof slots required');
 const original=new Set(['VA-301','STATE-2651A']);
 const discovery=new Set(['VA-CBCA-ABOUT','VA-CBCA-7105','STATE-PLAW-119-60']);
 if([...original,...discovery].some(k=>!source.has(k)))fail('source identity population changed');
 for(const s of d.cases.sources){
  if(!s.original_url.startsWith('https://'))fail('official source URL required');
  if(original.has(s.source_key)){
   const o=d.custody.records[s.source_key];
   if(!o||s.archival_status!=='retained_original_replay_required'||s.original_path!==o.source_original_path||s.sha256!==o.source_original_sha256||s.git_blob_sha1!==o.source_git_blob_sha1||s.original_url!==o.original_official_url||s.law_through!==o.law_through_date)fail('retained OLRC immutable source replay mismatch');
  } else if(discovery.has(s.source_key)){
   if(s.archival_status!=='official_source_identified_not_immutably_archived'||s.original_path!==null||s.sha256!==null||s.git_blob_sha1!==null||s.law_through!==null)fail('unretained external source claimed to be original');
  } else fail('unknown external source');
  const known={'VA-CBCA-ABOUT':'https://cbca.gov/board/','VA-CBCA-7105':'https://uscode.house.gov/us/usc/119-120/t41/s7105/','STATE-PLAW-119-60':'https://www.govinfo.gov/content/pkg/PLAW-119publ60/html/PLAW-119publ60.htm'};
  if(known[s.source_key]&&s.original_url!==known[s.source_key])fail('official source URL replaced without review');
  if(!s.locator||!s.observed_claim_scope)fail('claim locator missing');
 }
 const desired=new Map([['WG17B2D1-VA-BCA',{p:'ORG-FED-EXE-DEP-VA',s:'WG17B2B-SUB-VA-BCA',d:'WG17B2C-D-WG17B2B-REL-VA-BCA',e:'VA-301',new:['VA-CBCA-ABOUT','VA-CBCA-7105'],kind:'historic_adjudication_function_transfer_vs_present_codified_reference',when:'2007-01-06',rel:'function_transfer_historical_candidate_not_statutory_member_current'}],['WG17B2D1-STATE-HR',{p:'ORG-FED-EXE-DEP-STATE',s:'WG17B2B-SUB-STATE-HR',d:'WG17B2C-D-WG17B2B-REL-STATE-HR',e:'STATE-2651A',new:['STATE-PLAW-119-60'],kind:'legal_reference_deeming_vs_organizational_successor',when:'2025-12-18',rel:'reference_deeming_not_certified_legal_entity_succession'}]]);
 if(d.cases.items.length!==2||new Set(d.cases.items.map(x=>x.id)).size!==2)fail('two bounded legal transition cases required');
 for(const c of d.cases.items){
  const w=desired.get(c.id);
  if(!w||c.department_id!==w.p||c.subject_id!==w.s||c.disposition_id!==w.d||c.existing_statute_source_key!==w.e||JSON.stringify(c.independently_discovered_official_source_keys)!==JSON.stringify(w.new)||c.case_kind!==w.kind||c.source_event_date!==w.when||c.candidate_relationship!==w.rel)fail('historical or State legal identity conflation');
  if(!legal.has(c.disposition_id)||legal.get(c.disposition_id).subject_id!==c.subject_id)fail('statutory relation changed');
  if(c.legal_effective_start!==null||c.legal_effective_end!==null||c.independent_legal_review_record_id!==null||c.internal_originals_complete!==false||c.legal_successor_identity_certified!==false||c.atlas_admitted!==false||c.historic_va_board_operationally_active_2026!==null||c.review_state!=='pending_original_custody_and_independent_legal_effect_review')fail('unreviewed current legal effect or admission');
  if(c.source_event_date_is_case_specific!==true||c.bounded_evidence_interpretation.length<100||c.record_question.length<40)fail('evidence interpretation exceeds source scope');
 }
 const prior=new Map(d.old.items.map(x=>[x.canonical_department_id,x]));
 const expected=new Set(['VA','STATE','HUD','AGRICULTURE','DHS'].map(k=>'ORG-FED-EXE-DEP-'+k));
 if(d.gates.items.length!==5||d.gates.priority_roots!==5||d.gates.items.some(x=>!expected.has(x.canonical_department_id))||new Set(d.gates.items.map(x=>x.canonical_department_id)).size!==5)fail('five pilot source gates required');
 for(const x of d.gates.items){
  const p=prior.get(x.canonical_department_id);
  if(!p||!p.pilot||p.id!==x.upstream_coverage_id)fail('Cabinet pilot provenance mismatch');
  const should=d.cases.items.filter(c=>c.department_id===x.canonical_department_id).map(c=>c.id);
  if(JSON.stringify(should)!==JSON.stringify(x.source_conflict_case_ids))fail('historical case/source gate join invalid');
  if(x.local_original_custody_complete!==false||x.independent_legal_review_record_id!==null||x.directly_reported_components_adjudicated!==0||x.statutory_components_newly_admitted!==0||x.first_level_denominator!==null||x.legal_effect_verified!==false||x.current_operational_command_verified!==false||x.intergovernmental_subordination_inferred!==false||x.atlas_admitted!==false)fail('false current ADL1 or delegated federal authority');
  if(x.source_acquisition_and_legal_review_required.length<70)fail('source gap concealed');
 }
 if(d.cases.legal_effect_reviews_complete!==0||d.cases.source_originals_newly_archived!==0||d.cases.canonical_component_id_promotions!==0||d.cases.public_graph_edges_added!==0||d.cases.atlas_admitted!==false||d.gates.atlas_admitted!==false||d.gates.complete_current_first_level_denominator!==null||d.gates.admitted_new_canonical_components!==0)fail('research-only case promoted');
 if(!d.manifest.models.includes(P.cases)||!d.manifest.models.includes(P.gates)||d.manifest.whole_government_inc17b2d1_extension?.public_atlas_admission!==false)fail('unregistered or public data path');
 return {errors,summary:{Cabinet_roots:15,pilot_roots:5,transition_cases:2,discovered_external_official_sources:3,new_immutable_originals:0,admitted_authority_edges:0}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const x=validate(load());console.log(JSON.stringify(x,null,2));if(x.errors.length)process.exitCode=1;}
