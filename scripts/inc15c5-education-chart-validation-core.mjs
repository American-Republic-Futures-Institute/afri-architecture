// INC-15C.5 Education FY2024 chart: exact publisher figure, not ADL-1 certification.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadEducationOriginal,verifyEducationOriginal,SHA,BLOB,ORIGINAL} from './inc15c5-education-custody-core.mjs';
const DIR='model/federal/';
const FILE=DIR+'inc15c5-education-fy2024-chart-boxes.json';
const SOURCE_COMPONENTS=DIR+'coverage/components.json';
const SOURCE_X12=DIR+'x12-observations.json';
const ORIGINAL_COMPONENTS_GIT='e4d6f5f7bec4aa53d0aca5622615938945ca0962';
const ORIGINAL_X12_GIT='7e4b20396c545207b9847c7a4f14e593a3b30b68';
const CABINET=DIR+'inc15-cabinet-crosswalks.json';
const GOV=DIR+'inc15d-govman-2025-crosswalk.json';
const ROOT_FIELDS=[
 'model_version','model_family','department_id','branch_id',
 'prior_canonical_education_crosswalk_id','prior_govman_department_source_entity_key',
 'original_source_pdf_path','official_document_title','official_document_publisher',
 'official_report_fiscal_year','publisher_posting_date','source_distribution_url',
 'source_distribution_kind','source_original_sha256','source_original_git_blob_sha1',
 'source_pdf_physical_pages','physical_pdf_page','printed_page','source_figure_title',
 'source_figure_scope','source_figure_colored_box_count',
 'counted_white_house_initiatives_as_one_aggregate_box',
 'individually_named_footnote_initiatives_outside_figure_box_count',
 'previously_modeled_census_candidates_reconciled','previously_unmodeled_figure_labels',
 'previous_census_candidate_ids_replaced','publisher_visual_layout_grouping_only',
 'original_direct_edgov_publisher_bytes_verified','independently_certified_worm_custody',
 'chart_visual_inspection_complete','current_department_first_level_denominator',
 'independently_qualified_legal_first_level_components',
 'legal_organizational_certification_complete','operational_reporting_chain_certified',
 'inspector_general_command_subordination_inferred','statutory_delegation_certified',
 'foreign_quasi_official_govman_entities_promoted_to_ED_offices','items'
];
const ITEM_FIELDS=[
 'id','source_figure_order','source_label','source_box_left_pt','source_box_top_pt',
 'source_box_right_pt','source_box_bottom_pt','source_physical_pdf_page',
 'publisher_display_region','classification','prior_census_candidate_id',
 'prior_x12_observation_id','original_source_govman_entity_id',
 'source_layout_only_not_operational_reporting','independent_legal_identity_review_complete',
 'command_relationship_verified','statutory_delegation_verified',
 'current_first_level_organization_verified'
];
export const EXPECTED=Object.freeze([
 ['Office of the Secretary',245.85,132.98,358.65,175.13,'secretary_root','departmental_leadership_office_label',null],
 ['White House Initiatives',377.31,140.89,446.15,168.27,'secretary_side_aggregate','publisher_group_label_not_single_organization',null],
 ['Office of the Deputy Secretary',97.75,194.03,210.62,224.83,'deputy_chart_region','departmental_leadership_office_label',null],
 ['Office of the Under Secretary',414.14,194.04,527.02,224.84,'under_secretary_chart_region','departmental_leadership_office_label',null],
 ['Office of Elementary and Secondary Education',164.35,232.18,233.20,287.28,'deputy_chart_region','departmental_office_label','CENSUS-COMP-ED-OESE'],
 ['Institute of Education Sciences',255.21,232.16,324.05,287.26,'central_chart_region','departmental_office_label','CENSUS-COMP-ED-IES'],
 ['Office of Postsecondary Education',435.81,232.19,504.65,287.29,'under_secretary_chart_region','departmental_office_label','CENSUS-COMP-ED-OPE'],
 ['Office of Finance and Operations',74.47,262.42,143.32,317.52,'deputy_chart_region','departmental_office_label','CENSUS-COMP-ED-OFO'],
 ['Office for Civil Rights',346.00,262.39,414.84,317.49,'central_chart_region','departmental_office_label','CENSUS-COMP-ED-OCR'],
 ['Office of English Language Acquisition',164.35,292.45,233.20,347.62,'deputy_chart_region','departmental_office_label','CENSUS-COMP-ED-OELA'],
 ['Office of Inspector General',255.21,292.44,324.05,347.61,'central_chart_region','independent_inspector_general_oversight_label','CENSUS-COMP-ED-OIG'],
 ['Office of Career, Technical, and Adult Education',435.81,292.47,504.65,347.64,'under_secretary_chart_region','departmental_office_label','CENSUS-COMP-ED-OCTAE'],
 ['Office of the Chief Information Officer',74.47,323.00,143.32,378.17,'deputy_chart_region','departmental_office_label',null],
 ['Office of Planning, Evaluation, and Policy Development',345.86,322.95,414.70,378.12,'central_chart_region','departmental_office_label',null],
 ['Office of Special Education and Rehabilitative Services',164.35,353.15,233.20,408.25,'deputy_chart_region','departmental_office_label','CENSUS-COMP-ED-OSERS'],
 ['Office of Communications and Outreach',255.21,353.14,324.05,408.24,'central_chart_region','departmental_office_label',null],
 ['Federal Student Aid',435.81,353.16,504.65,408.26,'under_secretary_chart_region','departmental_office_label','CENSUS-COMP-ED-FSA'],
 ['Office of the General Counsel',345.86,383.42,414.70,438.52,'central_chart_region','departmental_office_label',null],
 ['Office of Legislation and Congressional Affairs',255.00,413.84,323.84,468.94,'central_chart_region','departmental_office_label',null]
]);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const parse=p=>JSON.parse(read(p));
const blob=t=>{
 const b=Buffer.from(t,'utf8');
 return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const closed=(x,names)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 eq(Object.keys(x).sort(),[...names].sort());
const fail=m=>{throw Error('INC-15C.5 chart rejected: '+m);};
const ensure=(v,m)=>{if(!v)fail(m)};
export function loadEducationChart(){
 const sourceComponents=read(SOURCE_COMPONENTS),sourceX12=read(SOURCE_X12);
 return {
  model:parse(FILE),schema:parse('schemas/inc15c5-education-fy2024-chart-boxes.schema.json'),
  manifest:parse(DIR+'manifest.json'),sourceOriginal:loadEducationOriginal(),
  sourceComponents,sourceX12,
  census:JSON.parse(sourceComponents),x12:JSON.parse(sourceX12),
  priorCabinet:parse(CABINET),govman:parse(GOV)
 };
}
export function validateEducationChart(x){
 const {model:m,schema:s,manifest:manifest,sourceOriginal,
  sourceComponents,sourceX12,census,x12,priorCabinet,govman}=x||{};
 const archived=verifyEducationOriginal(sourceOriginal);
 ensure(archived.verified===true&&archived.bytes===5675466&&!archived.directPublisherOriginalBytesQualified,
  'original ED source custody or publisher distinction not established');
 ensure(blob(sourceComponents)===ORIGINAL_COMPONENTS_GIT&&blob(sourceX12)===ORIGINAL_X12_GIT,
  'legacy census or X12 source blob changed');
 ensure(closed(m,ROOT_FIELDS)&&m.model_version==='0.1.0'&&
  m.model_family==='inc15c5-education-fy2024-chart-boxes'&&
  m.department_id==='ORG-FED-EXE-DEP-EDUCATION'&&m.branch_id==='BR-FED-EXE'&&
  m.prior_canonical_education_crosswalk_id==='INC15-XWALK-ORG-FED-EXE-DEP-EDUCATION'&&
  m.prior_govman_department_source_entity_key==='GOVMAN-2025-12-31:115'&&
  m.original_source_pdf_path===ORIGINAL&&
  m.official_document_title==='FY 2024 Annual Agency Performance Report'&&
  m.official_document_publisher==='U.S. Department of Education'&&
  m.official_report_fiscal_year==='FY2024'&&m.publisher_posting_date==='2025-01-15'&&
  m.source_distribution_url==='https://files.eric.ed.gov/fulltext/ED673614.pdf'&&
  m.source_distribution_kind==='official_ED_ERIC_repository_reproduction_not_direct_department_url'&&
  m.source_original_sha256===SHA&&m.source_original_git_blob_sha1===BLOB&&
  m.source_pdf_physical_pages===146&&m.physical_pdf_page===10&&m.printed_page===5&&
  m.source_figure_title==='FY 2024 Organization Structure'&&
  m.source_figure_scope==='Department coordinating structure in fiscal year 2024 (not exhaustive legal institution roster)'&&
  m.source_figure_colored_box_count===19&&
  m.counted_white_house_initiatives_as_one_aggregate_box===true&&
  m.individually_named_footnote_initiatives_outside_figure_box_count===5&&
  m.previously_modeled_census_candidates_reconciled===10&&
  m.previously_unmodeled_figure_labels===9&&m.previous_census_candidate_ids_replaced===0&&
  m.publisher_visual_layout_grouping_only===true&&
  m.original_direct_edgov_publisher_bytes_verified===false&&
  m.independently_certified_worm_custody===false&&
  m.chart_visual_inspection_complete===true&&
  m.current_department_first_level_denominator===null&&
  m.independently_qualified_legal_first_level_components===0&&
  m.legal_organizational_certification_complete===false&&
  m.operational_reporting_chain_certified===false&&
  m.inspector_general_command_subordination_inferred===false&&
  m.statutory_delegation_certified===false&&
  m.foreign_quasi_official_govman_entities_promoted_to_ED_offices===false,
  'source epoch, PDF figure count or statutory authority falsely promoted');
 ensure(s?.$schema==='https://json-schema.org/draft/2020-12/schema'&&
  s.additionalProperties===false&&closed(s.properties,ROOT_FIELDS)&&
  eq([...s.required].sort(),[...ROOT_FIELDS].sort())&&
  s.properties.items.minItems===19&&s.properties.items.maxItems===19&&
  s.properties.items.items.additionalProperties===false&&
  closed(s.properties.items.items.properties,ITEM_FIELDS)&&
  eq([...s.properties.items.items.required].sort(),[...ITEM_FIELDS].sort()),
  'schema should be exact closed and all fields required');
 const originalDept=priorCabinet.items.find(t=>t.canonical_institution_id===m.department_id);
 const gov=govman.items.find(t=>t.source_entity_key==='GOVMAN-2025-12-31:115');
 ensure(originalDept?.prior_x12_identity_id==='X12-IDENTITY-ORG-FED-EXE-DEP-EDUCATION'&&
  originalDept.independent_legal_review_complete===false&&
  gov?.canonical_id===m.department_id&&
  gov.identity_reconciliation_state==='provisional_explicit_source_name_or_alias'&&
  gov.legal_authority_inferred===false,
  'canonical Department predecessor or GovMan edition illegally remapped');
 ensure(Array.isArray(m.items)&&m.items.length===19&&
  new Set(m.items.map(z=>z.id)).size===19&&
  new Set(m.items.map(z=>z.source_label)).size===19,'missing/duplicate chart figure box');
 const priorById=new Map(census.items.filter(v=>v.parent_institution_id===m.department_id).map(v=>[v.id,v]));
 const priorObs=new Map(x12.items.filter(v=>v.declared_parent_id===m.department_id).map(v=>[v.id,v]));
 ensure(priorById.size===10&&priorObs.size===10,'canonical ED 10 pilot predecessors changed');
 let matched=0,ig=0,white=0;
 for(let i=0;i<EXPECTED.length;i++){
  const row=m.items[i],e=EXPECTED[i],id='INC15C5-ED-BOX-'+String(i+1).padStart(2,'0');
  ensure(closed(row,ITEM_FIELDS)&&row.id===id&&row.source_figure_order===i+1&&
   row.source_label===e[0]&&row.source_box_left_pt===e[1]&&
   row.source_box_top_pt===e[2]&&row.source_box_right_pt===e[3]&&
   row.source_box_bottom_pt===e[4]&&row.source_physical_pdf_page===10&&
   row.publisher_display_region===e[5]&&row.classification===e[6]&&
   row.prior_census_candidate_id===e[7]&&
   row.prior_x12_observation_id===(e[7]?'X12-OBS-'+e[7]:null)&&
   row.original_source_govman_entity_id===null&&
   row.source_layout_only_not_operational_reporting===true&&
   row.independent_legal_identity_review_complete===false&&
   row.command_relationship_verified===false&&
   row.statutory_delegation_verified===false&&
   row.current_first_level_organization_verified===false,
   'chart box mutated, absent, unsourced or given legal command');
  ensure(row.source_box_left_pt>=0&&row.source_box_top_pt>=0&&
   row.source_box_right_pt<=612&&row.source_box_bottom_pt<=792&&
   row.source_box_right_pt>row.source_box_left_pt&&
   row.source_box_bottom_pt>row.source_box_top_pt,'chart rectangle outside original letter page');
  if(e[7]){
   const old=priorById.get(e[7]),oldX=priorObs.get('X12-OBS-'+e[7]);
   ensure(old?.name===row.source_label&&oldX?.display_name===row.source_label&&
    oldX?.source_record_id===e[7]&&
    old.delegation_verified===false&&
    old.adl_evidenced===0&&
    oldX.confirmed_command===false,'candidate/source X12 crosswalk unbacked');
   if(e[7]==='CENSUS-COMP-ED-OIG'){
    ensure(old.kind==='independent_oversight_component'&&
     old.organizational_relation==='independent_oversight_placement_not_command',
     'independent IG is not subordinate command');
   }
   matched++;
  }
  if(e[6]==='independent_inspector_general_oversight_label')ig++;
  if(e[6]==='publisher_group_label_not_single_organization')white++;
 }
 ensure(matched===10&&ig===1&&white===1,
  'source prior candidate coverage or IG / White House grouping changed');
 const ext=manifest?.federal_institutional_breadth_15c5_extension;
 ensure(manifest?.models?.includes(FILE)&&manifest.release_status==='research_baseline_unratified'&&
  ext?.id==='ARFI-FED-INC15C5-ED-FY2024-CHART'&&
  ext.original_distribution_sha256===SHA&&ext.chart_source_box_count===19&&
  ext.reconciled_prior_census_candidates===10&&ext.new_figure_labels===9&&
  ext.current_legal_first_level_denominator===null&&
  ext.certified_legal_authority_from_chart===false&&
  ext.ED_direct_publisher_originals_verified===false&&
  ext.source_only_not_current===true&&ext.govman_federally_aided_corporations_are_department_offices===false,
  'manifest missing source model or invented ED governmental office authority');
 return {originalDistributionSha256:SHA,publisher:'U.S. Department of Education',
  source:'FY2024 ED ERIC-distributed performance report',chartBoxes:19,
  priorCensusCandidatesReconciled:10,newSourceLabels:9,
  independentOversightBoxCount:1,initiativeAggregateBoxCount:1,
  directEdGovBytesVerified:false,currentLegalFirstLevelDenominator:null,
  legalAuthorityCertified:false};
}
