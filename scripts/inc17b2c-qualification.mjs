import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
 identities:'model/wholegov/inc17b2c-identity-candidates.json',dispositions:'model/wholegov/inc17b2c-relationship-dispositions.json',ledger:'model/wholegov/inc17b2c-pilot-coverage.json',
 legal:'model/wholegov/inc17b2b-legal-relations.json',publisher:'model/wholegov/inc17b2b-publisher-crosswalks.json',old:'model/wholegov/inc17b2b-qualification-ledger.json',
 custody:'evidence/inc17b2b-olrc-119-124/source-custody.json',departments:'model/federal/executive-departments.json',ontology:'model/wholegov/ontology.json',manifest:'model/federal/manifest.json',exceptions:'model/wholegov/inc17b2b-legal-exceptions.json'
};
export function load(root=ROOT){return Object.fromEntries(Object.entries(P).map(([k,v])=>[k,JSON.parse(fs.readFileSync(path.join(root,v),'utf8'))]));}
export function validate(d){
 const errors=[],fail=s=>errors.push(s);
 const dept=new Set(d.departments.items.map(x=>x.id)),prefix='ORG-FED-EXE-DEP-';
 const ontology=new Set(d.ontology.items.filter(x=>x.record_type==='relationship').map(x=>x.kind));
 const laws=new Map(d.legal.items.map(x=>[x.id,x])),pubs=new Map(d.publisher.items.map(x=>[x.id,x]));
 const old=new Map(d.old.items.map(x=>[x.canonical_department_id,x]));
 const identities=d.identities.items,identIDs=new Set(identities.map(x=>x.id));
 if(dept.size!==15||d.departments.items.length!==15)fail('cabinet root invariant');
 if(identities.length!==4||identIDs.size!==4||d.identities.atlas_admitted!==false)fail('VA correspondence count or admission');
 const wanted=new Set(['VHA','VBA','NCA','BVA'].map(x=>'WG17B2C-VA-'+x));
 for(const i of identities){
  if(!wanted.has(i.id)||i.canonical_parent_id!==prefix+'VA'||i.kind!=='organizational_component'||i.jurisdiction!=='federal'||i.canonical_component_id!==null)fail('canonical component identity promotion');
  if(i.legal_effective_from!==null||i.legal_effective_to!==null||i.predecessor_id!==null||i.successor_id!==null||i.historical_aliases?.length!==0||i.statute_law_through!=='2026-10-15'||i.directory_observed_at!=='2026-10-26')fail('historical/effective-date identity promotion');
  if(i.independent_legal_review!==false||i.atlas_admitted!==false||i.qualification!=='cross_source_text_and_name_correspondence_only')fail('unreviewed identity/Atlas admission');
  if(i.id==='WG17B2C-VA-BVA'&&i.role!=='adjudicatory_board_not_management_command')fail('VA Board adjudication boundary');
  const law=laws.get(i.statutory_relation_id),p=pubs.get(i.publisher_observation_id);
  if(!law||!p){fail('missing original source relation');continue;}
  if(law.to_id!==i.source_local_subject_id||law.from_id!==i.canonical_parent_id||law.subject_label!==i.name||p.publisher_observed_name!==i.name||p.independently_source_qualified_statutory_relation_id!==law.id||p.prior_canonical_component_candidate_id!==i.prior_provisional_candidate_id||law.previously_recorded_source_component_candidate_id!==i.prior_provisional_candidate_id||law.independent_department_directory_source_key!==p.publisher_original_key)fail('cross-source identity binding changed');
  for(const [proof,sourceKey,anchor] of [[i.statutory_evidence,law.currently_qualified_publisher_source_key,law.legal_clause_body_anchor],[i.directory_evidence,p.publisher_original_key,p.source_body_or_chart_label_anchor]]){
   const s=d.custody.records[sourceKey];
   if(!s||proof.key!==sourceKey||proof.original_url!==s.original_official_url||proof.original_path!==s.source_original_path||proof.sha256!==s.source_original_sha256||proof.git_blob_sha1!==s.source_git_blob_sha1||proof.anchor!==anchor)fail('original SHA/Git blob or legal anchor drift');
  }
  if(i.statute_locator!=='38 U.S.C. 301(c)'||i.directed_membership.kind!=='statutorily_part_of'||i.directed_membership.from!==i.source_local_subject_id||i.directed_membership.to!==i.canonical_parent_id||i.directed_membership.reverse_query!=='has_statutorily_named_constituent')fail('directed membership or reverse traversal invalid');
 }
 if([...wanted].some(x=>!identIDs.has(x)))fail('VA candidate missing');
 const pred={statutory_text_designates_department_head:'has_position',statutory_text_places_bureau_within_department:'statutorily_part_of',statutory_text_prescribes_officer_position:'has_position',statutory_text_prescribes_position_class_count:'has_position',statutory_text_enumerates_department_composition:'statutorily_part_of',statutory_text_affirms_existing_department:null};
 if(d.dispositions.legal.length!==28||new Set(d.dispositions.legal.map(x=>x.source_relation_id)).size!==28||d.dispositions.publisher.length!==23||new Set(d.dispositions.publisher.map(x=>x.source_observation_id)).size!==23)fail('source disposition population drift');
 for(const a of d.dispositions.legal){
  const x=laws.get(a.source_relation_id);if(!x){fail('missing legal text reference');continue;}
  const p=pred[x.legal_relation_type];
  if(a.parent_id!==x.from_id||a.subject_id!==x.to_id||a.source_key!==x.currently_qualified_publisher_source_key||a.source_sha256!==x.current_original_sha256||a.locator!==x.claimed_source_legal_locator||a.source_text_type!==x.legal_relation_type||a.candidate_ontology_kind!==p||a.from!==(p==='statutorily_part_of'?x.to_id:p?x.from_id:null)||a.to!==(p==='statutorily_part_of'?x.from_id:p?x.to_id:null)||a.identity_candidate_id!==(identities.find(i=>i.statutory_relation_id===x.id)?.id??null))fail('typed law source/direction invalid');
  if(p&&!ontology.has(p))fail('unknown ontology kind');
  if(a.temporal_effective_interval!==null||a.source_only!==true||a.independent_legal_review!==false||a.command_certified!==false||a.delegation_executed!==false||a.direct_supervision_certified!==false||a.atlas_admitted!==false)fail('unreviewed authority/command promotion');
  if(x.id==='WG17B2B-REL-VA-BCA'&&a.exception!=='board_successor_unresolved')fail('VA Board of Contract Appeals improperly assumed current');
  if(x.id==='WG17B2B-REL-DHS-DEPARTMENT'&&a.exception!=='no_self_edge')fail('DHS self-edge improperly created');
 }
 for(const a of d.dispositions.publisher){
  const x=pubs.get(a.source_observation_id);if(!x){fail('missing directory/chart observation');continue;}
  if(a.parent_id!==x.canonical_department_id||a.source_key!==x.publisher_original_key||a.source_sha256!==x.publisher_original_sha256||a.label!==x.publisher_observed_name||a.source_era!==x.time_scope||a.candidate_ontology_kind!=='publisher_listing_of'||a.source_listing_only!==true)fail('publisher era/source drift');
  if(a.legal_membership_certified!==false||a.direct_supervision_certified!==false||a.command_certified!==false||a.atlas_admitted!==false)fail('source directory/chart became legal command');
 }
 if(!['statutorily_part_of','has_position','publisher_listing_of'].every(x=>ontology.has(x)))fail('ontology predicate drift');
 if(d.dispositions.legal_effect_certified!==false||d.dispositions.atlas_admitted!==false||d.dispositions.added_public_graph_edges!==0)fail('research relationship Atlas promotion');
 if(d.ledger.items.length!==15||new Set(d.ledger.items.map(x=>x.canonical_department_id)).size!==15||d.ledger.items.some(x=>!dept.has(x.canonical_department_id)))fail('all 15 canonical Cabinet roots required');
 const pilotSet=new Set(['VA','STATE','HUD','AGRICULTURE','DHS'].map(x=>prefix+x));
 if(d.ledger.cabinet_roots_preserved!==15||d.ledger.priority_pilot_ids.length!==5||d.ledger.priority_pilot_ids.some(x=>!pilotSet.has(x))||d.ledger.cross_source_VA_correspondences!==4||d.ledger.certified_current_ADL1_departments!==0||d.ledger.complete_current_first_level_denominator!==null||d.ledger.atlas_admitted!==false)fail('fabricated Cabinet completeness');
 for(const a of d.ledger.items){
  const x=old.get(a.canonical_department_id);
  if(!x||a.prior_coverage_id!==x.id||a.source_text_relations!==x.current_olrc_textual_relationships_verified||a.source_only_chart_or_directory_observations!==x.bounded_publisher_directory_or_chart_observations||a.pilot!==pilotSet.has(a.canonical_department_id))fail('coverage source join drift');
  if(JSON.stringify(a.identity_candidate_ids)!==JSON.stringify(identities.filter(i=>i.canonical_parent_id===a.canonical_department_id).map(i=>i.id)))fail('fabricated identity coverage');
  if(a.current_first_level_denominator!==null||a.legal_effect_reviewed!==false||a.first_level_certified!==false||a.command_certified!==false||a.atlas_admitted!==false)fail('false current ADL1 or Atlas certification');
  if(a.pilot&&(a.exception_ids.length===0||a.exception_ids.some(id=>!d.exceptions.items.some(e=>e.id===id&&e.canonical_department_id===a.canonical_department_id))))fail('critical pilot exception dropped');
  if(typeof a.next_gate!=='string'||a.next_gate.length<50)fail('unresolved gap hidden');
 }
 const paths=['model/wholegov/inc17b2c-identity-candidates.json','model/wholegov/inc17b2c-relationship-dispositions.json','model/wholegov/inc17b2c-pilot-coverage.json'];
 if(paths.some(x=>!d.manifest.models.includes(x))||d.manifest.whole_government_inc17b2c_extension?.public_atlas_admission!==false)fail('manifest publication admission invalid');
 return {errors,summary:{Cabinet:15,pilots:5,VA_cross_source:4,legal_text:28,publisher_observations:23,ADL1_certified:0,public_edges:0}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const r=validate(load());console.log(JSON.stringify(r,null,2));if(r.errors.length)process.exitCode=1;}
