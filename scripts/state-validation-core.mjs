// ARFI State institutional architecture semantic guardrails.
// Independent State constitutional structure is NOT federal administrative hierarchy.
const list=x=>Array.isArray(x)?x:[];
const text=x=>typeof x==="string"&&x.length>0;
const p=(st,article,section)=>"STATE-PROV-"+st+"-ART-"+article+"-SEC-"+section;
const expectedCodes=Object.fromEntries(("AL:01 AK:02 AZ:04 AR:05 CA:06 CO:08 CT:09 DE:10 FL:12 GA:13 HI:15 ID:16 IL:17 IN:18 IA:19 KS:20 KY:21 LA:22 ME:23 MD:24 MA:25 MI:26 MN:27 MS:28 MO:29 MT:30 NE:31 NV:32 NH:33 NJ:34 NM:35 NY:36 NC:37 ND:38 OH:39 OK:40 OR:41 PA:42 RI:44 SC:45 SD:46 TN:47 TX:48 UT:49 VT:50 VA:51 WA:53 WV:54 WI:55 WY:56").split(" ").map(x=>x.split(":")));
const families=["jurisdictions","nonstate-comparators","sources","constitutions","provisions","norms","actors","branches","institutions","relationships","federalism-links","judicial-links","viewpoints"];
const pilot=["VA","NE"];
const federalMap={
"CONST-US-AMD-10":"reserved_state_power_context_not_specific_agency_delegation",
"CONST-US-ART-06-CL-02":"applicable_federal_supremacy_conditional_on_valid_law",
"CONST-US-AMD-14-SEC-01":"federal_rights_constraint_on_state_action",
"CONST-US-ART-04-SEC-04-SEG-01":"republican_form_guarantee_context_not_administrative_command"
};
const required=(x,fields,fail)=>{for(const key of fields)if(x===undefined||x===null||!Object.hasOwn(x,key)||x[key]===undefined)fail("Missing field "+(x?.id||"record")+"."+key)};
const sourceBased=(rec,sourceIds,fail)=>{
 if(!list(rec.source_ids).length)fail("Missing State provenance "+rec.id);
 for(const id of list(rec.source_ids))if(!sourceIds.has(id))fail("Unknown State source "+rec.id+":"+id);
};
const stateOf=id=>/^((?:JUR-US|BR-STATE|ORG-STATE|ACT-STATE|CONST-STATE|STATE-PROV|NORM-STATE)-)(VA|NE)(?:-|$)/.exec(id)?.[2]||null;
export function validateState(d){
 const errors=[],fail=message=>errors.push(message),manifest=d.manifest||{},M=d.models||{},extension=manifest.state_institutional_extension||{};
 for(const name of families){
  const data=M[name],loc="model/state/"+name+".json";
  if(!list(manifest.models).includes(loc))fail("Missing registered State model "+loc);
  if(data?.model_version!==manifest.model_version||!Array.isArray(data?.items))fail("Invalid State collection/version "+name);
 }
 const all=Object.fromEntries(families.map(n=>[n,list(M[n]?.items)]));
 const map=Object.fromEntries(Object.entries(all).map(([k,items])=>[k,new Map(items.map(x=>[x.id,x]))]));
 const counted={jurisdictions:50,"nonstate-comparators":1,sources:17,constitutions:2,provisions:19,norms:24,actors:2,branches:6,institutions:19,relationships:17,"federalism-links":8,"judicial-links":1,viewpoints:6};
 for(const [key,n] of Object.entries(counted))if(all[key].length!==n)fail("State model count mismatch "+key+" (expected "+n+")");
 if(extension.id!=="ARFI-COA-STATE-INSTITUTIONS-001"||extension.review_status!=="selected_state_primary_text_and_institutions_pending_human_legal_review"||extension.state_jurisdiction_count!==50||extension.nonstate_federal_district_comparators!==1||extension.state_constitution_count!==2||extension.fully_modelled_state_count!==0||JSON.stringify(extension.pilot_state_codes)!==JSON.stringify(pilot))fail("State coverage metadata overclaims or omits jurisdictions");
 for(const [kind,rows] of Object.entries(all)){
  const seen=new Set;
  for(const r of rows){
   if(!text(r?.id)||seen.has(r.id))fail("Duplicate or missing State "+kind+" ID "+r?.id);
   seen.add(r?.id);
  }
 }
 const allData=Object.entries(all).flatMap(([key,records])=>key==="sources"?[]:records);
 const ids=new Set;
 for(const r of allData){
  if(ids.has(r.id))fail("Cross-collection State identity collision "+r.id);
  ids.add(r.id);
  if(/^ORG-FED-|^BR-FED-|^CAP-FED-|^ACT-US-/.test(r.id))fail("State record uses federal actor identity "+r.id);
 }
 const federalIds=new Set(list(d.federalInstitutions).map(x=>x.id)),constitutionalIds=new Set(list(d.federalProvisions).map(x=>x.id));
 const cases=new Map(list(d.judicialCases).map(x=>[x.id,x])),holds=new Map(list(d.judicialHoldings).map(x=>[x.id,x])),status=new Map(list(d.judicialStatus).map(x=>[x.holding_id,x]));
 for(const r of allData)if(federalIds.has(r.id)||constitutionalIds.has(r.id))fail("State entity falsely shares federal constitutional identity "+r.id);
 const sources=map.sources,sourceIds=new Set(sources.keys());
 for(const s of all.sources){
  required(s,["type","title","publisher","url","kind","scope","accessed_on","review_status"],fail);
  if(s.type!=="state_architecture_source"||!s.url?.startsWith("https://")||s.accessed_on!==extension.snapshot_date)fail("Invalid or undated State source "+s.id);
  if(s.kind==="primary_state_constitutional_text"&&!(s.url.startsWith("https://law.lis.virginia.gov/")||s.url.startsWith("https://nebraskalegislature.gov/")))fail("State primary-law text is not linked to its official publisher "+s.id);
 }
 if(sources.get("SRC-STATE-CENSUS-CODES")?.url!=="https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html")fail("Unverified State FIPS identity source");
 for(const [kind,rows] of Object.entries(all))if(kind!=="sources")for(const x of rows)sourceBased(x,sourceIds,fail);
 const stIds=new Set(all.jurisdictions.map(x=>x.id));
 if(stIds.size!==50||stIds.has("JUR-US-DC")||stIds.has("JUR-US-DC-NONSTATE"))fail("D.C. inaccurately promoted to a 51st State");
 for(const [code,fips] of Object.entries(expectedCodes)){
  const id="JUR-US-"+code,s=map.jurisdictions.get(id);
  if(!s||s.usps_code!==code||s.fips_state_code!==fips||s.sovereign_classification!=="constituent_state_not_federal_agency"||s.type!=="us_member_state_jurisdiction")fail("Missing or misclassified Census State identity "+id);
  if(s){
   const isPilot=pilot.includes(code);
   if(s.institutional_coverage!==(isPilot?"limited_pilot_source_backed":"jurisdiction_identity_only_no_institution_claims"))fail("Unreviewed State modeled as institutionally complete "+id);
   if(s.state_constitution_id!==(isPilot?"CONST-STATE-"+code:null))fail("Unreviewed State Constitution implied "+id);
  }
 }
 for(const state of all.jurisdictions){
  required(state,["id","type","name","usps_code","fips_state_code","sovereign_classification","state_constitution_id","institutional_coverage","source_ids","review_status"],fail);
  if(!expectedCodes[state.usps_code]||state.id!=="JUR-US-"+state.usps_code)fail("Unknown State jurisdiction or D.C. merged into State set "+state.id);
 }
 const dc=all["nonstate-comparators"][0];
 if(dc?.id!=="JUR-US-DC-NONSTATE"||dc?.is_member_state!==false||dc?.fips_state_code!=="11"||dc?.constitutional_status!=="federal_district_not_member_state"||stIds.has(dc?.id)||dc.type!=="nonstate_federal_district_reference")fail("D.C. non-State comparator invalid");
 for(const c of all.constitutions){
  required(c,["id","type","jurisdiction_id","name","current_source_status","article_scope_covered","source_ids","review_status"],fail);
  const st=stateOf(c.id);
  if(!pilot.includes(st)||c.id!=="CONST-STATE-"+st||c.jurisdiction_id!=="JUR-US-"+st||c.type!=="state_constitution"||c.current_source_status!=="official_published_consolidated_text")fail("State constitution represented as U.S. federal constitutional Article "+c.id);
  if(!c.source_ids.some(id=>sources.get(id)?.kind==="primary_state_constitutional_text"))fail("State constitutional instrument without original State text "+c.id);
 }
 for(const pr of all.provisions){
  required(pr,["id","type","constitution_id","jurisdiction_id","article_number","section_number","name","citation","summary","source_scope_kind","source_ids","source_status","legal_effect_review_status","review_status"],fail);
  const st=stateOf(pr.id),expected=p(st,pr.article_number,pr.section_number);
  if(!pilot.includes(st)||pr.id!==expected||pr.constitution_id!=="CONST-STATE-"+st||pr.jurisdiction_id!=="JUR-US-"+st||pr.type!=="state_constitutional_provision")fail("State original section wrongly presented as federal constitutional text "+pr.id);
  if(pr.citation!==(st==="VA"?"Va. Const. art. "+pr.article_number+", § "+pr.section_number:"Neb. Const. art. "+pr.article_number+", § "+pr.section_number))fail("State constitutional section citation invalid "+pr.id);
  if(!pr.source_ids.some(id=>sources.get(id)?.kind==="primary_state_constitutional_text"))fail("State provision lacks primary State constitutional text "+pr.id);
  if(pr.source_status!=="official_current_text_indexed"||pr.review_status!=="selected_state_original_text_summary_pending_legal_review")fail("State original text research described as controlling judicial law "+pr.id);
  const correctSource="SRC-STATE-"+st+"-CONST-"+pr.article_number;
  if(!pr.source_ids.includes(correctSource))fail("State provision sources incorrect constitutional Article "+pr.id);
  if(pr.legal_effect_review_status==="federally_enforceable_without_review")fail("State legal effect incorrectly certified "+pr.id);
 }
 const marriage=map.provisions.get(p("VA","I","15-A"));
 if(!marriage||marriage.legal_effect_review_status!=="published_text_federal_judicial_conflict_pending_legal_review"||marriage.source_scope_kind!=="historical_federal_conflict")fail("Virginia marriage provision falsely activated as State constitutional police power");
 for(const n of all.norms){
  required(n,["id","type","jurisdiction_id","provision_id","norm_kind","name","summary","source_ids","legal_effect_status","review_status"],fail);
  const pr=map.provisions.get(n.provision_id),st=stateOf(n.id);
  if(n.type!=="state_constitutional_norm"||!pr||pr.jurisdiction_id!==n.jurisdiction_id||st!==stateOf(n.provision_id)||!/^NORM-STATE-(VA|NE)-ART-[IVX]+-SEC-[0-9]+(?:-A)?-[0-9]{2}$/.test(n.id))fail("State norm has false jurisdiction or source provision "+n.id);
  if(n.review_status!=="state_textual_summary_pending_human_legal_review"||!["state_right","historic_conflict","state_power","state_procedure","state_limit","statutory_boundary","reserved_democratic_power"].includes(n.norm_kind))fail("State norm falsely adjudicated or untyped "+n.id);
  if(n.source_ids.some(id=>!pr?.source_ids.includes(id)))fail("State norm cites unrelated State original source "+n.id);
  if(n.norm_kind==="historic_conflict"&&n.legal_effect_status!=="federal_precedent_conflict_no_enforcement_authority")fail("Superseded State rights restriction used as current delegated authority "+n.id);
 }
 if(!all.norms.some(x=>x.provision_id===p("NE","III","1")&&x.norm_kind==="reserved_democratic_power"))fail("Nebraska State people's initiative right erased");
 const seps={VA:p("VA","III","1"),NE:p("NE","II","1")};
 for(const st of pilot){
  for(const [suffix,kind] of [["LEG","legislative"],["EXE","executive"],["JUD","judicial"]]){
   const id="BR-STATE-"+st+"-"+suffix,r=map.branches.get(id);
   if(!r||r.type!=="state_branch"||r.jurisdiction_id!=="JUR-US-"+st||r.branch_kind!==kind||r.parent_id!=="JUR-US-"+st||r.separation_status!=="constitutional_state_branch_not_federal_institution"||!r.source_provision_ids.includes(seps[st]))fail("Independent State branch misclassified under federal hierarchy "+id);
  }
 }
 for(const b of all.branches){
  required(b,["id","type","jurisdiction_id","branch_kind","parent_id","source_provision_ids","source_ids","separation_status","review_status"],fail);
  if(!pilot.includes(stateOf(b.id))||b.jurisdiction_id!=="JUR-US-"+stateOf(b.id))fail("Unmodeled State given invented branch "+b.id);
 }
 const validParents=new Map([...all.jurisdictions,...all.branches,...all.institutions].map(x=>[x.id,x]));
 const institutionKinds=new Set(["legislature","legislative_chamber","elected_constitutional_office","state_supreme_court","statutorily_implemented_court","state_court_aggregate","independent_state_constitutional_commission","local_government_type_aggregate","unicameral_legislature","state_constitutional_court"]);
 for(const x of all.institutions){
  required(x,["id","type","jurisdiction_id","branch_id","parent_id","name","kind","mission","institutional_basis","source_provision_ids","source_ids","status","statutory_delegation_claim"],fail);
  const st=stateOf(x.id),pr=map.provisions.get(x.source_provision_ids?.[0]),parent=validParents.get(x.parent_id);
  if(!pilot.includes(st)||x.type!=="state_institution_or_local_class"||x.jurisdiction_id!=="JUR-US-"+st||!institutionKinds.has(x.kind)||!pr||pr.jurisdiction_id!==x.jurisdiction_id||!parent||parent.jurisdiction_id&&parent.jurisdiction_id!==x.jurisdiction_id)fail("State institution parent or provision crosses jurisdiction "+x.id);
  if(!x.parent_id?.startsWith("JUR-US-")&&!x.parent_id?.startsWith("BR-STATE-")&&!x.parent_id?.startsWith("ORG-STATE-"))fail("State organization improperly subordinate to federal authority "+x.id);
  if(stateOf(x.parent_id)!==st)fail("State institution parent crosses State jurisdiction root "+x.id);
  if(x.branch_id!==null&&map.branches.get(x.branch_id)?.jurisdiction_id!==x.jurisdiction_id)fail("State institution assigned to wrong State branch "+x.id);
  if(x.branch_id===null&&!["independent_state_constitutional_commission","local_government_type_aggregate"].includes(x.kind))fail("Institution escaped State branch without constitutional cause "+x.id);
  if(x.statutory_delegation_claim==="granted")fail("State institution silently obtained enabling statute delegation "+x.id);
  if(x.statutory_delegation_claim!=="none_until_enabling_statute_linked")fail("State institution legally overclaims unreviewed powers "+x.id);
  if(x.institutional_basis==="judiciary_description_requires_statutory_enabling_chain"&&!x.source_ids.includes("SRC-STATE-VA-COURTS"))fail("State statutory court incorrectly treated as directly named in Constitution "+x.id);
  if(x.institutional_basis==="express_state_constitutional_text"&&x.source_ids.every(id=>sources.get(id)?.kind!=="primary_state_constitutional_text"))fail("State institution has no primary constitutional provenance "+x.id);
  if(!text(x.mission)||x.mission.length<30)fail("State institution without documented mission "+x.id);
  const seen=new Set([x.id]);let cursor=x.parent_id;
  while(cursor){if(seen.has(cursor)){fail("Cyclic State institutional containment "+x.id);break;}seen.add(cursor);cursor=validParents.get(cursor)?.parent_id;}
 }
 const vaSenate=map.institutions.get("ORG-STATE-VA-LEG-SENATE"),vaHouse=map.institutions.get("ORG-STATE-VA-LEG-HOUSE"),neLeg=map.institutions.get("ORG-STATE-NE-LEG-LEGISLATURE");
 if(!vaSenate||!vaHouse||vaSenate.parent_id!=="ORG-STATE-VA-LEG-GENERAL-ASSEMBLY"||vaHouse.parent_id!=="ORG-STATE-VA-LEG-GENERAL-ASSEMBLY")fail("Virginia bicameral legislature lost its two State chambers");
 if(!neLeg||neLeg.kind!=="unicameral_legislature"||all.institutions.some(x=>x.id.startsWith("ORG-STATE-NE-LEG-")&&x.id!==neLeg.id))fail("Nebraska unicameral legislative authority incorrectly modeled as bicameral");
 const ltGov=map.institutions.get("ORG-STATE-VA-EXE-LIEUTENANT-GOVERNOR");
 if(ltGov?.branch_id!=="BR-STATE-VA-EXE"||!ltGov.parent_id?.startsWith("BR-STATE-VA-EXE"))fail("Virginia Lieutenant Governor Senate role silently changed executive branch office parentage");
 const court=map.institutions.get("ORG-STATE-VA-JUD-COURT-APPEALS");
 if(court?.institutional_basis!=="judiciary_description_requires_statutory_enabling_chain"||court?.statutory_delegation_claim!=="none_until_enabling_statute_linked")fail("State Court of Appeals asserted direct constitutional statute-free enabling powers");
 const local=map.institutions.get("ORG-STATE-VA-SPECIAL-LOCAL-GOVERNMENT-CLASSES");
 if(local?.parent_id!=="JUR-US-VA"||local?.institutional_basis!=="state_local_government_framework_not_single_agency")fail("Virginia local-government types falsely collapsed into federal department or single county");
 for(const a of all.actors){
  if(a.type!=="state_constitutional_actor_class"||a.jurisdiction_id!=="JUR-US-"+stateOf(a.id)||a.review_status!=="source_limited_state_actor_class")fail("State people class misclassified as a federal agency "+a.id);
 }
 const actorIds=new Set([...map.institutions.keys(),...map.actors.keys()]);
 const enumRelations=new Set(["vested_state_legislative_power","constituent_state_legislative_chamber","subject_to_state_legislative_procedure","vested_state_executive_power","subject_to_state_office_eligibility_limit","participates_in_legislative_procedure_not_branch_containment","office_established_specific_duties_need_statute","vested_state_judicial_power","constitutionally_assigned_redistricting_function","contingent_state_redistricting_fallback","requires_state_local_government_enabling_law","vested_unicameral_state_legislative_power","people_reserve_initiative_and_referendum","state_elected_executive_structure","limited_state_court_admin_authority"]);
 for(const r of all.relationships){
  required(r,["id","type","jurisdiction_id","from_id","to_norm_id","relationship_kind","source_provision_id","source_ids","relationship_classification","review_status"],fail);
  const n=map.norms.get(r.to_norm_id),pr=map.provisions.get(r.source_provision_id);
  if(r.type!=="state_institution_norm_relationship"||!actorIds.has(r.from_id)||!n||!pr||n.provision_id!==pr.id||n.jurisdiction_id!==r.jurisdiction_id||pr.jurisdiction_id!==r.jurisdiction_id||stateOf(r.from_id)!==stateOf(pr.id))fail("Unlawful cross-State institutional power relation "+r.id);
  if(!enumRelations.has(r.relationship_kind)||r.relationship_classification!=="source_defined_state_legal_function_not_federal_delegation"||r.review_status!=="research_textual_institutional_mapping_pending_review")fail("State power link falsely represented as federal hierarchy or statutory delegation "+r.id);
  if(!list(r.source_ids).some(id=>pr?.source_ids?.includes(id)))fail("State relationship cites unrelated constitutional section evidence "+r.id);
 }
 const nePeople=all.relationships.some(x=>x.from_id==="ACT-STATE-NE-PEOPLE"&&x.relationship_kind==="people_reserve_initiative_and_referendum");
 if(!nePeople)fail("Nebraska popular initiative and referendum removed or assigned to legislature");
 if(!all.relationships.some(x=>x.from_id==="ORG-STATE-VA-JUD-SUPREME-COURT"&&x.relationship_kind==="contingent_state_redistricting_fallback"))fail("Virginia redistricting judiciary contingent review lost");
 const perState={VA:new Set,NE:new Set};
 for(const x of all["federalism-links"]){
  required(x,["id","type","jurisdiction_id","subject_id","federal_provision_id","relationship_kind","legal_role_classification","statutory_delegation_claim","source_ids","review_status"],fail);
  const st=stateOf(x.jurisdiction_id);
  if(x.type!=="state_federal_constitutional_crosswalk"||!pilot.includes(st)||x.subject_id!=="JUR-US-"+st||!constitutionalIds.has(x.federal_provision_id)||federalMap[x.federal_provision_id]!==x.relationship_kind||x.legal_role_classification!=="federalism_guardrail_not_federal_parent_or_department"||x.statutory_delegation_claim!=="none")
   fail("State federalism crosswalk falsely creates federal organization or constitutional power "+x.id);
  if(perState[st])perState[st].add(x.federal_provision_id);
 }
 for(const st of pilot)if(perState[st].size!==4||Object.keys(federalMap).some(x=>!perState[st].has(x)))fail("State federalism source boundary incomplete "+st);
 for(const link of all["judicial-links"]){
  required(link,["id","type","jurisdiction_id","state_provision_id","federal_case_id","federal_holding_id","relationship_kind","status","never_operational_permission","source_ids","review_status"],fail);
  const pr=map.provisions.get(link.state_provision_id),holding=holds.get(link.federal_holding_id),caseRecord=cases.get(link.federal_case_id);
  if(link.type!=="state_provision_judicial_interpretation_reference"||!pr||pr.jurisdiction_id!==link.jurisdiction_id||!caseRecord||!holding||holding.case_id!==caseRecord.id)fail("State text conflict lacks distinct cited judicial holding "+link.id);
  if(link.state_provision_id!==p("VA","I","15-A")||link.federal_case_id!=="CASE-US-SCOTUS-OBERGEFELL-2015"||link.federal_holding_id!=="HOLD-US-SCOTUS-OBERGEFELL-2015-01")fail("State marriage original text confused with other case or right "+link.id);
  if(link.status!=="published_conflict_research_not_citator_certified"||link.never_operational_permission!==true||link.review_status!=="holding_scope_and_current_treatment_pending_human_legal_review"||status.get(link.federal_holding_id)?.current_binding_effect_verified!==false)fail("Unverified State judicial interpretation certified enforceable or legally current "+link.id);
 }
 for(const v of all.viewpoints){
  required(v,["id","type","name","view_kind","root_ids","federal_constitutional_root_ids","publication_owner","review_status","legal_semantics","source_ids"],fail);
  if(v.type!=="state_institutional_viewpoint"||!v.id.startsWith("VIEW-STATE-")||v.publication_owner!=="afri-website"||v.review_status!=="architecture_viewpoint_only_no_website_implementation")fail("State viewpoint falsely claims live website implementation "+v.id);
  for(const id of list(v.root_ids))if(!ids.has(id))fail("State viewpoint dangling source object "+v.id+":"+id);
  for(const id of list(v.federal_constitutional_root_ids))if(!constitutionalIds.has(id))fail("State viewpoint cites nonexistent U.S. original Constitution provision "+v.id+":"+id);
 }
 return {errors,counts:Object.fromEntries(Object.entries(all).map(([key,items])=>[key,items.length])),pilotStates:pilot,legalReviewStatus:"research_state_institutions_pending_legal_review",renderingStatus:"not_implemented_in_architecture_repo"};
}
