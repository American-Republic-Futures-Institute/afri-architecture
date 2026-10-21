import test from 'node:test';
import assert from 'node:assert/strict';
import {loadINC15C6Model,validateINC15C6Model,OFFICE_ROWS,EXCEPTION_ROWS}
 from '../scripts/inc15c6-hhs-model-validation-core.mjs';
const data=loadINC15C6Model(),bad=/INC-15C\.6 HHS office model rejected:|INC-15C\.6 Git custody rejected:/;
const ex=(x,short)=>x.e.items.find(v=>v.id==='INC15C6-HHS-EXCEPTION-'+short);
const office=(x,name)=>x.o.items.find(v=>v.source_html_office_heading===name);
test('six exact retained OIG office headings and six distinct historical role column labels',()=>{
 const r=validateINC15C6Model(data);
 assert.equal(r.oigOfficesFromHtml,6);
 assert.equal(r.oigPdfDatedAsOf,'2025-12-23');
 assert.equal(r.hhsExceptionsCarriedForward,4);
 assert.equal(OFFICE_ROWS.length,6);
 assert.equal(EXCEPTION_ROWS.length,4);
});
test('OIG only has retained component-page originals, not DAB or OMHA',()=>{
 assert.equal(validateINC15C6Model(data).hhsOriginalIndexRetained,false);
 assert.equal(ex(data,'OIG').independent_component_page_raw_original_retained,true);
 assert.equal(ex(data,'DAB').independent_component_page_raw_original_retained,false);
 assert.equal(ex(data,'OMHA').independent_component_page_raw_original_retained,false);
 assert.equal(ex(data,'ARPAH').independent_component_page_raw_original_retained,false);
});
test('source-level denominators remain nonadditive and canonical IDs stable',()=>{
 const r=validateINC15C6Model(data);
 assert.equal(r.legalFirstLevelDenominator,null);
 assert.equal(r.canonicalIDsReplaced,0);
 assert.equal(r.signedAuthorityEdgesCertified,0);
 assert.equal(data.o.items.filter(x=>x.canonical_oig_suborganization_id!==null).length,0);
});
const attacks=[
 ['source HTML office count increased to invent coverage',d=>d.o.publisher_html_office_group_count=29],
 ['OIG PDF label treated as statutory office',d=>d.o.source_roles_are_distinct_from_organizational_offices=false],
 ['first OIG office automatically granted canonical identity',d=>d.o.items[0].canonical_oig_suborganization_id='ORG-FED-EXE-IND-OIG-1'],
 ['OIG executive reporting falsely certified',d=>d.o.oversight_reporting_authority_certified=true],
 ['OIG statutory protection falsely reviewed',d=>office(d,'Office of Investigations').oversight_independence_legal_review_complete=true],
 ['OIG source-based staffing invented',d=>office(d,'Office of Audit Services').current_staffing_verified=true],
 ['historical OIG role mapping changed',d=>office(d,'Office of Counsel to the Inspector General').source_pdf_column_order=1],
 ['OIG HTML original section renamed',d=>office(d,'Office of Audit Services').source_html_office_heading='Departmental Appeals Board'],
 ['OIG diagram source claimed legal command',d=>office(d,'Office of Investigations').official_org_chart_implies_signed_control=true],
 ['OIG publisher HTML and PDF falsely asserted same effective date',d=>d.o.same_effective_date_as_html_unverified=false],
 ['false department legal first level denominator',d=>d.e.whole_hhs_current_first_level_legal_denominator=29],
 ['add 29 HHS index plus 11 Government Manual plus six offices',d=>d.e.cross_population_additivity_authorized=true],
 ['assert excluded Government Manual affiliate no longer exists',d=>d.e.govman_hhs_entries_absence_is_nonexistence_proof=true],
 ['OIG currently confirmed as complete legally independent agency',d=>ex(d,'OIG').independent_inspector_general_statutory_review_complete=true],
 ['OMHA adjudicative jurisdiction certified from index URL alone',d=>ex(d,'OMHA').judicial_or_administrative_adjudication_jurisdiction_certified=true],
 ['DAB ALJ oversight subordinate to HHS Secretary command',d=>ex(d,'DAB').sworn_officer_or_fiscal_command_verified=true],
 ['DAB HTML original falsely retained',d=>ex(d,'DAB').independent_component_page_raw_original_retained=true],
 ['ARPAH has a new minting of canonical federal institution',d=>d.e.newly_minted_canonical_institution_ids=1],
 ['ARPAH HHS index classification silently replaced',d=>ex(d,'ARPAH').hhs_index_source_research_kind='certified_agency'],
 ['OIG source classified as HHS organization index original',d=>ex(d,'OIG').department_index_html_raw_original_retained=true],
 ['source HHS index entry missing',d=>d.e.items.pop()],
 ['duplicate source HHS adjudication entry',d=>d.e.items.push(structuredClone(d.e.items[0]))],
 ['source HTML SHA tampering',d=>d.o.source_html_sha256='f'.repeat(64)],
 ['source PDF source edition made 2026',d=>d.o.source_pdf_as_of_date='2026-10-21'],
 ['illegal fiscal signature from a source chart',d=>d.o.signed_delegation_certified=true],
 ['arbitrarily modify prior 29-entry research model',d=>d.rawH+=' '],
 ['arbitrarily modify prior source crosswalk',d=>d.rawC+=' '],
 ['untyped adjudication legal finding added',d=>ex(d,'DAB').federal_judicial_power_certified=true],
 ['co-edit closed schema to permit signed control',d=>{
  d.o.items[0].signed_control=true;
  d.officeSchema.properties.items.items.properties.signed_control={type:'boolean'};
  d.officeSchema.properties.items.items.required.push('signed_control');
 }],
 ['manifest legal denominator escalated',d=>d.manifest.federal_institutional_breadth_15c6_extension.legal_first_level_denominator=29],
 ['manifest claims HHS index original source obtained',d=>d.manifest.federal_institutional_breadth_15c6_extension.department_index_original_html_custodied=true],
 ['forged original OIG PDF bytes',d=>d.custody.pdf[100]^=1],
 ['forged Git custody for broader HHS chart',d=>d.custody.custody.hhs_department_index_html_custodied=true]
];
for(const [name,mutate] of attacks)test('reject '+name,()=>{
 const d=structuredClone(data);
 d.custody.html=Buffer.from(data.custody.html);
 d.custody.pdf=Buffer.from(data.custody.pdf);
 mutate(d);assert.throws(()=>validateINC15C6Model(d),bad);
});
