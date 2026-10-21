// INC-15C.6 — 6 source-only OIG office groups and 4 HHS exceptions.
// Original bytes retained for OIG only; no institution, authority, supervision or current roster certified.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadInc15c6OigOriginal,validateInc15c6OigOriginal,HTML_SHA,PDF_SHA,HTML_BLOB,PDF_BLOB,HTML_PATH,PDF_PATH,TITLES} from './inc15c6-hhs-oig-custody-core.mjs';
const BASE='model/federal/';
const OFFICE=BASE+'inc15c6-hhs-oig-source-office-groups.json';
const EXCEPT=BASE+'inc15c6-hhs-institutional-exception-boundaries.json';
const HHS=BASE+'inc15c3-hhs-directory-reconciliation.json';
const HHS_BLOB='37d06d6341a560a0689654819816e1396624b890';
const CROSS=BASE+'inc15c4-hhs-dual-edition-crosswalk.json';
const CROSS_BLOB='013229fc94e60109a629d02944f1d642914ee323';
const LEGACY=BASE+'archive04b/hhs-source-entries.json';
const LEGACY_BLOB='ae6b4eeb6962f4bf3ee3fc439e1f07c0ba2ecbfd';
export const OFFICE_ROWS=[
 ['IO','Immediate Office of Inspector General','immediate-office-of-inspector-general',1,'Deputy Inspector General for Immediate Office, Chief of Staff',1],
 ['OAS','Office of Audit Services','office-of-audit-services',2,'Deputy Inspector General for Audit Services',2],
 ['OEI','Office of Evaluation and Inspections','office-of-evaluation-and-inspections',3,'Deputy Inspector General for Evaluation and Inspections',4],
 ['OMP','Office of Management and Policy','office-of-management-and-policy',4,'Deputy Inspector General for Management and Policy',6],
 ['OI','Office of Investigations','office-of-investigations',5,'Deputy Inspector General for Investigations',5],
 ['OCIG','Office of Counsel to the Inspector General','office-of-counsel-to-the-inspector-general',6,'Chief Counsel to the Inspector General',3]
];
export const EXCEPTION_ROWS=[
 ['ARPA-H','Advanced Research Projects Agency for Health','publisher_linked_entry_unclassified',null,
  'special_health_research_agency_source_identity_pending_legal_qualification','https://arpa-h.gov/about/faqs',false],
 ['DAB','Departmental Appeals Board','administrative_adjudication_requires_statutory_review','ARCH04B-HHS-DAB',
  'administrative_adjudication_proceedings_boundary','https://www.hhs.gov/about/agencies/orgchart/dab/index.html',false],
 ['OIG','Office of Inspector General','independent_inspector_general_statutory_review','ARCH04B-HHS-OIG',
  'inspector_general_audit_inspection_and_investigation_boundary','https://oig.hhs.gov/about-oig/organization-chart/',true],
 ['OMHA','Office of Medicare Hearings and Appeals','administrative_adjudication_requires_statutory_review','ARCH04B-HHS-OMHA',
  'medicare_administrative_hearing_boundary','https://www.hhs.gov/about/agencies/omha/about/organizational-chart/index.html',false]
];
const fail=x=>{throw Error('INC-15C.6 HHS office model rejected: '+x)};
const check=(v,m)=>{if(!v)fail(m)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const closed=(obj,keys)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&eq(Object.keys(obj).sort(),[...keys].sort());
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const parse=p=>JSON.parse(read(p));
const blob=t=>{const b=Buffer.from(t,'utf8');return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')};
const OFFICE_FIELDS=[
 'model_version','model_family','department_canonical_id','hhs_prior_oig_source_reference',
 'hhs_prior_oig_legacy_reference','source_scope','source_html_original_path',
 'source_html_sha256','source_html_git_blob_sha1','source_html_edition',
 'source_html_acquired_in_run','source_pdf_original_path','source_pdf_sha256',
 'source_pdf_git_blob_sha1','source_pdf_as_of_date','source_pdf_physical_page',
 'publisher_html_office_group_count','pdf_chief_role_column_count',
 'source_roles_are_distinct_from_organizational_offices',
 'same_effective_date_as_html_unverified','independent_hhs_legal_office_roster_denominator',
 'current_hhs_first_level_denominator','oversight_reporting_authority_certified',
 'signed_delegation_certified','legal_identity_certified_count',
 'independent_human_review_complete','source_only_research','items'
];
const OFFICE_ITEM_FIELDS=[
 'id','source_html_office_heading','source_html_h2_anchor_id','source_html_display_order',
 'source_pdf_related_column_heading','source_pdf_column_order','office_reference_parent_source_id',
 'canonical_oig_suborganization_id','source_html_publisher_office_group',
 'source_pdf_heading_classification','candidate_same_office_family_not_independently_qualified',
 'official_org_chart_implies_signed_control','oversight_independence_legal_review_complete',
 'current_staffing_verified','operational_command_or_fiscal_delegation_verified'
];
const EXCEPT_FIELDS=[
 'model_version','model_family','department_canonical_id','prior_hhs_index_model_path',
 'prior_hhs_index_git_blob_sha1','prior_cross_edition_model_path',
 'prior_cross_edition_git_blob_sha1','prior_legal_identity_model_path',
 'prior_legal_identity_model_git_blob_sha1','oig_original_html_sha256',
 'oig_original_chart_pdf_sha256','hhs_indexed_name_population',
 'edition_local_govman_hhs_subentries','oig_publisher_internal_office_groups',
 'exceptional_index_source_records','cross_population_additivity_authorized',
 'govman_hhs_entries_absence_is_nonexistence_proof',
 'whole_hhs_current_first_level_legal_denominator','independent_legal_classification_complete',
 'newly_minted_canonical_institution_ids','legal_reporting_command_authority_certified_count',
 'statutory_independence_or_adjudication_jurisdiction_certified_count',
 'intra_hhs_adjudicative_appeal_or_review_edges_certified_count',
 'current_official_page_original_custody_complete','items'
];
const EXCEPT_ITEM_FIELDS=[
 'id','prior_inc15c3_index_source_id','prior_arch04b_source_id',
 'hhs_publisher_index_label','hhs_index_source_research_kind',
 'descriptive_architecture_boundary','related_official_component_page_url',
 'independent_component_page_raw_original_retained','department_index_html_raw_original_retained',
 'source_custody_qualification','prior_govman_2025_hhs_subentry_matched',
 'current_first_level_legal_institution_verified',
 'judicial_or_administrative_adjudication_jurisdiction_certified',
 'independent_inspector_general_statutory_review_complete','sworn_officer_or_fiscal_command_verified',
 'signed_delegated_authority_verified','current_operational_reporting_verified',
 'source_descriptive_only_not_policy_model'
];
const validateSchema=(schema,rootFields,itemFields,count,label)=>{
 check(schema?.$schema==='https://json-schema.org/draft/2020-12/schema'&&
  schema.type==='object'&&schema.additionalProperties===false&&
  closed(schema.properties,rootFields)&&eq([...schema.required].sort(),[...rootFields].sort())&&
  schema.properties.items.minItems===count&&schema.properties.items.maxItems===count&&
  schema.properties.items.items.additionalProperties===false&&
  closed(schema.properties.items.items.properties,itemFields)&&
  eq([...schema.properties.items.items.required].sort(),[...itemFields].sort()),
  label+' closed source schema changed');
};
export function loadINC15C6Model(){
 const rawH=read(HHS),rawC=read(CROSS),rawL=read(LEGACY);
 return {o:parse(OFFICE),e:parse(EXCEPT),
  officeSchema:parse('schemas/inc15c6-hhs-oig-source-office-groups.schema.json'),
  exceptionSchema:parse('schemas/inc15c6-hhs-institutional-exception-boundaries.schema.json'),
  hhs:JSON.parse(rawH),cross:JSON.parse(rawC),legacy:JSON.parse(rawL),
  rawH,rawC,rawL,
  manifest:parse(BASE+'manifest.json'),
  custody:loadInc15c6OigOriginal()};
}
export function validateINC15C6Model(d){
 const {o,e,officeSchema,exceptionSchema,hhs,cross,legacy,rawH,rawC,rawL,manifest,custody}=d||{};
 check(blob(rawH)===HHS_BLOB&&blob(rawC)===CROSS_BLOB&&blob(rawL)===LEGACY_BLOB,
  'dated HHS 29-name source, 11-name crosswalk or original source-model blob changed');
 validateInc15c6OigOriginal(custody);
 validateSchema(officeSchema,OFFICE_FIELDS,OFFICE_ITEM_FIELDS,6,'OIG');
 validateSchema(exceptionSchema,EXCEPT_FIELDS,EXCEPT_ITEM_FIELDS,4,'exceptions');
 check(closed(o,OFFICE_FIELDS)&&o.model_version==='0.1.0'&&
  o.model_family==='inc15c6-hhs-oig-source-office-groups'&&
  o.department_canonical_id==='ORG-FED-EXE-DEP-HHS'&&
  o.hhs_prior_oig_source_reference==='INC15C3-HHS-LINK-OIG'&&
  o.hhs_prior_oig_legacy_reference==='ARCH04B-HHS-OIG'&&
  o.source_scope==='OIG_internal_publisher_office_headings_and_separate_2025_pdf_role_columns_not_full_HHS_directory'&&
  o.source_html_original_path===HTML_PATH&&o.source_html_sha256===HTML_SHA&&
  o.source_html_git_blob_sha1===HTML_BLOB&&
  o.source_html_edition==='retrieval_observation_unqualified_as_of_date'&&
  o.source_html_acquired_in_run===39668188500&&
  o.source_pdf_original_path===PDF_PATH&&o.source_pdf_sha256===PDF_SHA&&
  o.source_pdf_git_blob_sha1===PDF_BLOB&&
  o.source_pdf_as_of_date==='2025-12-23'&&o.source_pdf_physical_page===1&&
  o.publisher_html_office_group_count===6&&o.pdf_chief_role_column_count===6&&
  o.source_roles_are_distinct_from_organizational_offices===true&&
  o.same_effective_date_as_html_unverified===true&&
  o.independent_hhs_legal_office_roster_denominator===null&&
  o.current_hhs_first_level_denominator===null&&
  o.oversight_reporting_authority_certified===false&&o.signed_delegation_certified===false&&
  o.legal_identity_certified_count===0&&o.independent_human_review_complete===false&&
  o.source_only_research===true,
  'OIG original custody, dated office source or current legal authority inflated');
 check(Array.isArray(o.items)&&o.items.length===6&&new Set(o.items.map(x=>x.id)).size===6,
  'OIG office heading population incomplete/duplicated');
 const html=custody.html.toString('utf8');
 for(let i=0;i<OFFICE_ROWS.length;i++){
  const [suffix,title,anchor,htmlOrd,role,pdfOrd]=OFFICE_ROWS[i],x=o.items[i];
  check(closed(x,OFFICE_ITEM_FIELDS)&&x.id==='INC15C6-OIG-OFFICE-'+suffix&&
   x.source_html_office_heading===title&&
   x.source_html_h2_anchor_id===anchor&&x.source_html_display_order===htmlOrd&&
   x.source_pdf_related_column_heading===role&&x.source_pdf_column_order===pdfOrd&&
   x.office_reference_parent_source_id==='INC15C3-HHS-LINK-OIG'&&
   x.canonical_oig_suborganization_id===null&&
   x.source_html_publisher_office_group===true&&
   x.source_pdf_heading_classification==='leadership_position_column_not_independent_institution'&&
   x.candidate_same_office_family_not_independently_qualified===true&&
   x.official_org_chart_implies_signed_control===false&&
   x.oversight_independence_legal_review_complete===false&&
   x.current_staffing_verified===false&&
   x.operational_command_or_fiscal_delegation_verified===false,
   'HHS OIG source office and separately dated PDF role misclassified');
  check(html.includes('id="'+anchor+'"')&&html.includes(title),
   'OIG observed HTML original no longer supports office anchor '+title);
 }
 check(closed(e,EXCEPT_FIELDS)&&e.model_version==='0.1.0'&&
  e.model_family==='inc15c6-hhs-institutional-exception-boundaries'&&
  e.department_canonical_id==='ORG-FED-EXE-DEP-HHS'&&
  e.prior_hhs_index_model_path===HHS&&e.prior_hhs_index_git_blob_sha1===HHS_BLOB&&
  e.prior_cross_edition_model_path===CROSS&&
  e.prior_cross_edition_git_blob_sha1===CROSS_BLOB&&
  e.prior_legal_identity_model_path===LEGACY&&
  e.prior_legal_identity_model_git_blob_sha1===LEGACY_BLOB&&
  e.oig_original_html_sha256===HTML_SHA&&e.oig_original_chart_pdf_sha256===PDF_SHA&&
  e.hhs_indexed_name_population===29&&e.edition_local_govman_hhs_subentries===11&&
  e.oig_publisher_internal_office_groups===6&&e.exceptional_index_source_records===4&&
  e.cross_population_additivity_authorized===false&&
  e.govman_hhs_entries_absence_is_nonexistence_proof===false&&
  e.whole_hhs_current_first_level_legal_denominator===null&&
  e.independent_legal_classification_complete===false&&
  e.newly_minted_canonical_institution_ids===0&&
  e.legal_reporting_command_authority_certified_count===0&&
  e.statutory_independence_or_adjudication_jurisdiction_certified_count===0&&
  e.intra_hhs_adjudicative_appeal_or_review_edges_certified_count===0&&
  e.current_official_page_original_custody_complete===false,
  'HHS exceptions or current legal certification falsely promoted');
 check(Array.isArray(e.items)&&e.items.length===4&&
  new Set(e.items.map(x=>x.id)).size===4,'HHS four exception cohort incomplete');
 const index=new Map(hhs.items.map(x=>[x.source_abbreviation,x]));
 const residual=new Map(cross.hhs_index_only.map(x=>[x.hhs_index_abbreviation,x]));
 const prior=new Map(legacy.items.map(x=>[x.id,x]));
 for(let i=0;i<EXCEPTION_ROWS.length;i++){
  const [code,name,kind,oldId,boundary,url,retained]=EXCEPTION_ROWS[i],x=e.items[i];
  const k='INC15C3-HHS-LINK-'+code,legacyRef=index.get(code),priorRef=residual.get(code);
  check(legacyRef&&priorRef&&
   legacyRef.id===k&&legacyRef.source_name===name&&
   legacyRef.source_research_kind===kind&&legacyRef.original_arch04b_id===oldId&&
   priorRef.hhs_index_source_link_id===k&&
   priorRef.disposition==='index_only_unresolved_in_govman_not_absence_proof'&&
   (oldId===null||prior.get(oldId)?.name===name),
   'source index exception ID/parent epoch mismatch or disappearance inferred');
  check(closed(x,EXCEPT_ITEM_FIELDS)&&x.id==='INC15C6-HHS-EXCEPTION-'+code.replaceAll('-','')&&
   x.prior_inc15c3_index_source_id===k&&x.prior_arch04b_source_id===oldId&&
   x.hhs_publisher_index_label===name&&x.hhs_index_source_research_kind===kind&&
   x.descriptive_architecture_boundary===boundary&&
   x.related_official_component_page_url===url&&
   x.independent_component_page_raw_original_retained===retained&&
   x.department_index_html_raw_original_retained===false&&
   x.source_custody_qualification===(retained?
    'dated_pdf_plus_unversioned_html_oig_originals_git_custodied':
    'published_public_locator_only_no_original_component_page_bytes')&&
   x.prior_govman_2025_hhs_subentry_matched===false&&
   x.current_first_level_legal_institution_verified===false&&
   x.judicial_or_administrative_adjudication_jurisdiction_certified===false&&
   x.independent_inspector_general_statutory_review_complete===false&&
   x.sworn_officer_or_fiscal_command_verified===false&&
   x.signed_delegated_authority_verified===false&&
   x.current_operational_reporting_verified===false&&
   x.source_descriptive_only_not_policy_model===true,
   'OIG, DAB, OMHA or ARPA-H exception falsely granted independent authority');
 }
 const ext=manifest?.federal_institutional_breadth_15c6_extension;
 check(manifest?.models?.includes(OFFICE)&&manifest.models.includes(EXCEPT)&&
  manifest.release_status==='research_baseline_unratified'&&
  ext?.id==='ARFI-FED-INC15C6-HHS-OIG-SOURCE-DEPTH'&&
  ext.oig_original_html_sha256===HTML_SHA&&ext.oig_original_pdf_sha256===PDF_SHA&&
  ext.oig_source_office_groups===6&&ext.hhs_exception_source_names===4&&
  ext.legal_first_level_denominator===null&&ext.canonical_ids_replaced===0&&
  ext.department_index_original_html_custodied===false&&
  ext.independent_OIG_statutory_qualification_complete===false&&
  ext.signed_command_or_delegation_certified===false&&
  ext.cross_edition_counts_nonadditive===true,
  'manifest promotes unsourced current HHS authority');
 return {sourceFamily:'INC-15C.6 HHS OIG originals + exceptions',
  oigOfficesFromHtml:6,oigPdfDatedAsOf:'2025-12-23',
  hhsExceptionsCarriedForward:4,hhsOriginalIndexRetained:false,
  legalFirstLevelDenominator:null,canonicalIDsReplaced:0,
  signedAuthorityEdgesCertified:0,independentOIGLegalClassificationComplete:false};
}
