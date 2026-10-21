import test from 'node:test';
import assert from 'node:assert/strict';
import {loadEducationChart,validateEducationChart,EXPECTED}
 from '../scripts/inc15c5-education-chart-validation-core.mjs';
const data=loadEducationChart(),bad=/INC-15C\.5 chart rejected:|INC-15C\.5 original custody rejected:/;
const get=(d,name)=>d.model.items.find(z=>z.source_label===name);
test('complete 19 colored boxes of FY2024 ED coordinating chart',()=>{
 const r=validateEducationChart(data);
 assert.equal(r.chartBoxes,19);assert.equal(r.priorCensusCandidatesReconciled,10);
 assert.equal(r.newSourceLabels,9);assert.equal(r.independentOversightBoxCount,1);
 assert.equal(r.initiativeAggregateBoxCount,1);
 assert.equal(r.legalAuthorityCertified,false);
 assert.equal(r.currentLegalFirstLevelDenominator,null);
 assert.equal(EXPECTED.length,19);
});
test('ED 2025 Manual federally aided corporations never become FY2024 departmental offices',()=>{
 const r=validateEducationChart(data);
 assert.equal(data.model.foreign_quasi_official_govman_entities_promoted_to_ED_offices,false);
 assert.equal(data.model.prior_govman_department_source_entity_key,'GOVMAN-2025-12-31:115');
 assert.equal(data.model.items.filter(z=>z.original_source_govman_entity_id!==null).length,0);
 assert.equal(r.chartBoxes,19);
});
test('OIG source box is independent oversight and WHI is a grouping only',()=>{
 const ig=get(data,'Office of Inspector General');
 assert.equal(ig.classification,'independent_inspector_general_oversight_label');
 assert.equal(ig.prior_census_candidate_id,'CENSUS-COMP-ED-OIG');
 const initiatives=get(data,'White House Initiatives');
 assert.equal(initiatives.classification,'publisher_group_label_not_single_organization');
 assert.equal(initiatives.prior_census_candidate_id,null);
 assert.equal(data.model.individually_named_footnote_initiatives_outside_figure_box_count,5);
});
const distort=[
 ['retitle fiscal-year source as current 2026',d=>d.model.official_report_fiscal_year='FY2026'],
 ['invent 20th organization from graphic legend',d=>d.model.source_figure_colored_box_count=20],
 ['delete an actual diagram box',d=>d.model.items.pop()],
 ['duplicate a source figure box',d=>d.model.items.push(structuredClone(d.model.items[0]))],
 ['rename historical Secretary to a person',d=>get(d,'Office of the Secretary').source_label='Linda McMahon'],
 ['map OIG under operational command',d=>get(d,'Office of Inspector General').command_relationship_verified=true],
 ['treat OIG as ordinary controlled office',d=>get(d,'Office of Inspector General').classification='departmental_office_label'],
 ['convert White House initiative grouping to single office',d=>get(d,'White House Initiatives').classification='departmental_office_label'],
 ['count five initiatives as five more diagram boxes',d=>d.model.source_figure_colored_box_count=24],
 ['count ED federally aided corporations as ED chart offices',d=>d.model.foreign_quasi_official_govman_entities_promoted_to_ED_offices=true],
 ['certify a current first-level legal denominator',d=>d.model.current_department_first_level_denominator=19],
 ['assert independent WORM certification',d=>d.model.independently_certified_worm_custody=true],
 ['claim direct Ed.gov original bytes',d=>d.model.original_direct_edgov_publisher_bytes_verified=true],
 ['silently certify statutory delegation',d=>get(d,'Federal Student Aid').statutory_delegation_verified=true],
 ['silently promote operational reporting',d=>get(d,'Office of Finance and Operations').source_layout_only_not_operational_reporting=false],
 ['misplace parent branch',d=>d.model.branch_id='BR-FED-JUD'],
 ['promote a source-local GovMan affiliate into OIG identity',d=>get(d,'Office of Inspector General').original_source_govman_entity_id='GOVMAN-2025-12-31:269'],
 ['erase prior ten component links',d=>get(d,'Office of Postsecondary Education').prior_census_candidate_id=null],
 ['link unknown office to arbitrarily chosen existing canonical',d=>get(d,'Office of the General Counsel').prior_census_candidate_id='CENSUS-COMP-ED-OIG'],
 ['change source page coordinates',d=>get(d,'Office of Finance and Operations').source_box_top_pt=1],
 ['change physical PDF page',d=>get(d,'Office for Civil Rights').source_physical_pdf_page=9],
 ['assert role-level certification',d=>d.model.independently_qualified_legal_first_level_components=19],
 ['claim independent legal signoff',d=>d.model.legal_organizational_certification_complete=true],
 ['alter the original-source Git blob',d=>d.model.source_original_git_blob_sha1='a'.repeat(40)],
 ['attempt source epoch renumber',d=>d.model.prior_govman_department_source_entity_key='GOVMAN-2026-12-31:115'],
 ['mutate prior original census model',d=>d.sourceComponents+=' '],
 ['mutate prior original X12 model',d=>d.sourceX12+=' '],
 ['untyped source authority field',d=>get(d,'Office of the Under Secretary').signed_direction_certified=true],
 ['co-forge schema field and a legal claim',d=>{
   get(d,'Office of the Under Secretary').authority_tier=5;
   d.schema.properties.items.items.properties.authority_tier={type:'integer'};
   d.schema.properties.items.items.required.push('authority_tier');
 }],
 ['inflate manifest government completeness',d=>d.manifest.federal_institutional_breadth_15c5_extension.current_legal_first_level_denominator=19]
];
for(const [name,mutate] of distort)test('reject '+name,()=>{
 const d=structuredClone(data);
 d.sourceOriginal.original=Buffer.from(data.sourceOriginal.original);
 mutate(d);assert.throws(()=>validateEducationChart(d),bad);
});
