// ARFI amendment source-model semantic validator. Research status, not controlling legal advice.
const list=x=>Array.isArray(x)?x:[];
const pad=n=>String(n).padStart(2,"0"),amd=n=>"CONST-US-AMD-"+pad(n);
const roman=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII"];
const dates=["1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1791-12-15","1795-02-07","1804-06-15","1865-12-06","1868-07-09","1870-02-03","1913-02-03","1913-04-08","1919-01-16","1920-08-18","1933-01-23","1933-12-05","1951-02-27","1961-03-29","1964-01-23","1967-02-10","1971-07-01","1992-05-07"];
const counts=new Map([[13,2],[14,5],[15,2],[18,3],[20,6],[21,3],[22,2],[23,2],[24,2],[25,4],[26,2]]);
const paths={units:"amendment-units",timeline:"amendment-timeline",effects:"amendment-effects",qualifications:"amendment-qualifications",capabilityLinks:"amendment-capability-links"};
const active=new Set(["operative","modified_in_part"]);
const validDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
export function validateAmendments(d){
 const errors=[],bad=s=>errors.push(s),manifest=d.manifest||{},model=d.models||{};
 const must=(v,fields)=>{for(const k of fields)if(!Object.hasOwn(v||{},k)||v[k]===undefined)bad("Missing "+(v?.id||"record")+"."+k);};
 for(const [name,p] of Object.entries(paths)){
  if(model[name]?.model_version!=="0.1.0"||!Array.isArray(model[name]?.items))bad("Invalid amendment collection "+name);
  if(!list(manifest.models).includes("model/constitutional/"+p+".json"))bad("Missing amendment model manifest entry "+p);
 }
 if(manifest.amendment_decomposition_extension?.ratified_amendments!==27||manifest.amendment_decomposition_extension?.already_numbered_sections!==33)bad("Amendment coverage manifest invalid");
 const units=list(model.units?.items),timeline=list(model.timeline?.items),events=list(model.timeline?.events),effects=list(model.effects?.items),qual=list(model.qualifications?.items),capLinks=list(model.capabilityLinks?.items);
 const provisions=new Map(list(d.provisions).map(x=>[x.id,x])),norms=new Map(list(d.norms).map(x=>[x.id,x])),caps=new Set(list(d.capabilities).map(x=>x.id)),sources=new Set(list(d.sources).map(x=>x.id)),changes=new Map(list(d.changes).map(x=>[x.id,x])),bindings=list(d.bindings);
 const U=new Map(units.map(x=>[x.id,x])),T=new Map(timeline.map(x=>[x.amendment_number,x])),Q=new Map(qual.map(x=>[x.id,x])),E=new Map(effects.map(x=>[x.id,x])),C=new Map(capLinks.map(x=>[x.id,x])),EV=new Map(events.map(x=>[x.id,x]));
 for(const [name,records] of Object.entries({units,timeline,events,effects,qual,capLinks})){
  const seen=new Set();
  for(const rec of records){
   if(!rec?.id||seen.has(rec.id))bad("Duplicate/missing amendment "+name+" record "+rec?.id);
   seen.add(rec.id);
   if(!list(rec?.source_ids).length)bad("Missing amendment provenance "+rec?.id);
   for(const sid of list(rec?.source_ids))if(!sources.has(sid))bad("Unknown amendment provenance "+rec?.id+":"+sid);
  }
 }
 if(timeline.length!==27||T.size!==27)bad("Missing one or more ratified amendments in timeline");
 if([...provisions.values()].filter(x=>x.unit==="amendment").length!==27)bad("Original 27 ratified amendment roots lost");
 if([...provisions.values()].filter(x=>x.unit==="amendment_section").length!==33)bad("Original 33 amendment sections lost");
 for(let n=1;n<=27;n++){
  const r=provisions.get(amd(n)),t=T.get(n);
  if(!r||r.unit!=="amendment"||r.ratified_on!==dates[n-1]||!t||t.amendment_id!==amd(n)||t.ratified_on!==dates[n-1]||t.adopted_on!==dates[n-1])
   bad("Ratification date or root mismatch for Amendment "+pad(n));
  if(r?.decomposition_status!=="decomposed_in_initial_norm_register")bad("Undecomposed ratified amendment "+pad(n));
  if(!t)continue;
  must(t,["type","ratified_on","adopted_on","default_legal_effect_start_on","effect_status","current_lifecycle","effect_end_on","constitutional_ratification_basis_id","ratification_mode","ratification_distinct_from_certification","special_rule_ids","review_status"]);
  if(t.type!=="amendment_temporal_status"||t.id!=="AMD-TIME-"+pad(n)||t.constitutional_ratification_basis_id!=="CONST-US-ART-05")bad("Amendment chronology not sourced through Article V "+pad(n));
  if(t.default_legal_effect_start_on!==dates[n-1]||t.ratification_distinct_from_certification!==true||t.effect_status!==r?.effect_status||t.review_status!=="historical_timeline_pending_legal_review")bad("Amendment adoption/effect confused "+pad(n));
  if(t.ratification_mode!==(n===21?"state_conventions":"state_legislatures"))bad("Amendment ratification method incorrect "+pad(n));
  if(n===18&&(t.effect_end_on!=="1933-12-05"||t.current_lifecycle!=="repealed_historical"))bad("Repealed Prohibition retained as current");
  if(n!==18&&(t.effect_end_on!==null||t.current_lifecycle!=="ratified_current"))bad("Currently ratified amendment represented as repealed "+pad(n));
  if(n===20&&t.certification_on!=="1933-02-06")bad("Twentieth Amendment certification confused with adoption");
  if(n===27&&(t.certification_on!=="1992-05-18"||t.proposed_on!=="1789-09-25"))bad("Twenty-Seventh Amendment adoption vs certification date conflated");
  for(const id of list(t.special_rule_ids))if(EV.get(id)?.amendment_id!==amd(n))bad("Timeline event not linked to Amendment "+pad(n)+":"+id);
 }
 for(const [n,count] of counts)for(let i=1;i<=count;i++)if(provisions.get(amd(n)+"-SEC-"+pad(i))?.unit!=="amendment_section")bad("Missing actual amendment numbered Section "+pad(n)+"."+i);
 if(units.length!==126||[...provisions.values()].filter(x=>["amendment_segment","amendment_section_segment"].includes(x.unit)).length!==126)bad("126 amendment analytical segments required");
 if(new Set(units.map(x=>x.amendment_number)).size!==27)bad("Unmodeled amendment in analytical segment collection");
 let historicallyArchived=0;
 for(const u of units){
  must(u,["type","amendment_number","amendment_id","source_provision_id","analytic_provision_id","source_unit_kind","original_section_number","segment_number","name","summary","norm_id","effect_status","lifecycle_state","legal_effect_started_on","legal_effect_ended_on","timeline_id","qualification_ids","effect_link_ids","capability_link_ids","review_status"]);
  const n=u.amendment_number,source=provisions.get(u.source_provision_id),p=provisions.get(u.analytic_provision_id),nr=norms.get(u.norm_id),time=T.get(n);
  if(u.type!=="amendment_analysis_unit"||u.review_status!=="research_textual_summary_pending_legal_review")bad("Unreviewed amendment segment asserted controlling "+u.id);
  if(!source||!p||!nr||!time||u.amendment_id!==amd(n))bad("Broken amendment canonical ID chain "+u.id);
  if(!p)continue;
  if(p.parent_id!==u.source_provision_id||p.id!==u.source_provision_id+"-SEG-"+pad(u.segment_number))bad("Amendment segment parent/ordinal mismatch "+u.id);
  if(u.original_section_number===null){
   if(u.source_provision_id!==amd(n)||p.unit!=="amendment_segment"||u.source_unit_kind!=="unnumbered_amendment_analytic_segment")bad("Invented official amendment Section for unnumbered text "+u.id);
  }else if(u.source_provision_id!==amd(n)+"-SEC-"+pad(u.original_section_number)||p.unit!=="amendment_section_segment"||u.source_unit_kind!=="numbered_section_analytic_segment"){
   bad("Invented amendment clauses or incorrect numbered Section "+u.id);
  }
  const correctCitation="U.S. Const. amend. "+roman[n-1]+(u.original_section_number===null?"":", § "+u.original_section_number);
  if(p.citation!==correctCitation||p.segment_kind!=="arfi_analytic_not_numbered_clause"||!p.source_locator?.includes("not an original numbered clause or section"))bad("Analytical amendment span presented as an official clause "+u.id);
  if(p.amendment_number!==n||p.original_section_number!==u.original_section_number||nr?.provision_ids?.length!==1||nr?.provision_ids?.[0]!==p.id||nr.effect_status!==u.effect_status)bad("Amendment provision/norm status or citation mismatch "+u.id);
  if(nr.interpretation_status!=="textual_summary_pending_legal_review")bad("Amendment norm prematurely asserted as legal doctrine "+u.id);
  const historic=!active.has(u.effect_status);
  if(historic)historicallyArchived++;
  const lifecycle=n===18?"repealed_historical":u.effect_status==="expired"?"historical_transition_completed":"current_operational";
  if(u.lifecycle_state!==lifecycle)bad("Historical status elevated to operative constitutional power "+u.id);
  if((u.effect_status==="expired"&&p.effect_status!=="interpretive_context")||(u.effect_status==="repealed"&&p.effect_status!=="repealed")||(active.has(u.effect_status)&&p.effect_status!==u.effect_status))bad("Inconsistent legal effect of amendment segment "+u.id);
  const expectedDate=n===18&&u.original_section_number===1?"1920-01-17":n===20&&[1,2].includes(u.original_section_number)?"1933-10-15":time.default_legal_effect_start_on;
  if(u.timeline_id!==time.id||u.legal_effect_started_on!==expectedDate||u.legal_effect_ended_on!==(n===18?"1933-12-05":null))bad("Incorrect amendment effective-date interval "+u.id);
  if(!list(u.qualification_ids).length||!list(u.effect_link_ids).length)bad("Unqualified/unmapped amendment provision "+u.id);
  for(const id of list(u.qualification_ids))if(Q.get(id)?.unit_id!==u.id)bad("Dangling amendment qualifier on unit "+u.id+":"+id);
  for(const id of list(u.effect_link_ids))if(E.get(id)?.unit_id!==u.id)bad("Dangling constitutional amendment effect "+u.id+":"+id);
  for(const id of list(u.capability_link_ids))if(C.get(id)?.unit_id!==u.id)bad("Dangling amendment capability "+u.id+":"+id);
  if(historic&&(list(u.capability_link_ids).length||bindings.some(b=>b.norm_id===u.norm_id)))bad("Historical amendment created live authority binding "+u.id);
  if(!historic&&!list(u.capability_link_ids).length)bad("Active amendment provision not capability aligned "+u.id);
  if(n===18&&u.effect_status!=="repealed")bad("Eighteenth Amendment reactivated "+u.id);
 }
 if(historicallyArchived!==12)bad("Amendment historical transition inventory changed or reactivated");
 if(qual.length!==172)bad("Amendment qualifications inventory incomplete");
 for(const q of qual){
  must(q,["type","unit_id","norm_id","condition_kind","summary","source_provision_ids","effect_status","origin","review_status"]);
  const u=U.get(q.unit_id);
  if(q.type!=="amendment_constitutional_qualification"||!u||q.norm_id!==u.norm_id||!u.qualification_ids?.includes(q.id)||q.review_status!=="research_textual_summary_pending_legal_review")bad("Untrusted/dangling amendment qualifier "+q.id);
  if(!list(q.source_provision_ids).length||list(q.source_provision_ids).some(id=>!provisions.has(id)))bad("Invalid amendment qualifier provision "+q.id);
  if(q.origin==="interpretive_boundary"&&q.effect_status!=="research_boundary"||q.effect_status==="research_boundary"&&q.origin!=="interpretive_boundary")bad("Judicial doctrine caveat misrepresented as express amendment text "+q.id);
  if(u&&!active.has(u.effect_status)&&q.effect_status!=="historical_only")bad("Inactive amendment qualifier promoted to legal constraint "+q.id);
 }
 if(effects.length!==126)bad("Amendment-to-prior-text crosswalk incomplete");
 const relationKinds=new Set(["constitutional_context_not_textual_amendment","modifies_or_qualifies_prior_provision","supersedes_original_procedure","historical_transitional_reference","historical_context_no_current_authority","repeals_prior_amendment"]);
 for(const e of effects){
  must(e,["type","unit_id","norm_id","source_provision_id","target_provision_id","relationship_kind","source_change_ids","effect_status","legal_effect_started_on","legal_effect_ended_on","classification","review_status"]);
  const u=U.get(e.unit_id);
  if(e.type!=="amendment_constitutional_effect"||!u||e.norm_id!==u.norm_id||e.source_provision_id!==u.analytic_provision_id||!provisions.has(e.target_provision_id)||!u.effect_link_ids?.includes(e.id))bad("Amendment effect target or source missing "+e.id);
  if(e.review_status!=="research_effect_mapping_pending_review"||e.effect_status!==u?.effect_status||e.legal_effect_started_on!==u?.legal_effect_started_on||e.legal_effect_ended_on!==u?.legal_effect_ended_on)bad("Amendment effect wrong temporal or review status "+e.id);
  if(!relationKinds.has(e.relationship_kind))bad("Invalid constitutional amendment relation "+e.id);
  if(e.relationship_kind==="constitutional_context_not_textual_amendment"&&e.classification!=="contextual_modeling_reference_not_legal_supersession")bad("Context-only reference mislabeled as constitutional repeal "+e.id);
  if(e.relationship_kind==="historical_context_no_current_authority"&&e.classification!=="historical_only_not_authority")bad("Historic relation creates live authority "+e.id);
  if(e.relationship_kind==="repeals_prior_amendment"&&(u?.amendment_number!==21||e.target_provision_id!=="CONST-US-AMD-18"))bad("False constitutional amendment repeal "+e.id);
  for(const id of list(e.source_change_ids)){
   const ch=changes.get(id);
   if(!ch||!ch.affected_provision_ids.includes(e.target_provision_id)||![u?.amendment_id,u?.source_provision_id].includes(ch.amending_provision_id))bad("False amending provision or affected source "+e.id+":"+id);
  }
 }
 if(capLinks.length!==114)bad("Active amendment capability alignment inventory incomplete");
 const pairs=new Set;
 for(const c of capLinks){
  must(c,["type","unit_id","norm_id","capability_id","qualification_ids","relationship_type","rationale","review_status"]);
  const u=U.get(c.unit_id);
  if(c.type!=="amendment_capability_alignment"||!u||u.norm_id!==c.norm_id||!active.has(u.effect_status)||!caps.has(c.capability_id))bad("Inactive/unknown amendment capability "+c.id);
  if(c.relationship_type!=="functional_alignment_not_delegation"||c.review_status!=="research_mapping_pending_review")bad("Amendment function mislabeled as statutory agency delegation "+c.id);
  if(!list(c.qualification_ids).length||list(c.qualification_ids).some(id=>Q.get(id)?.unit_id!==c.unit_id||Q.get(id)?.effect_status!=="operative"))bad("Capability lacks applicable operative textual safeguard "+c.id);
  const pair=c.unit_id+"|"+c.capability_id;if(pairs.has(pair))bad("Duplicate amendment functional mapping "+pair);pairs.add(pair);
 }
 if(events.length!==15)bad("Missing special amendment timeline events");
 for(const ev of events){
  must(ev,["type","amendment_id","provision_id","event_kind","applies_on","summary","review_status","temporal_scope"]);
  if(ev.type!=="amendment_effect_event"||!provisions.has(ev.amendment_id)||!provisions.has(ev.provision_id)||!validDate(ev.applies_on)||ev.review_status!=="historical_timeline_pending_legal_review")bad("Unsupported temporal amendment event "+ev.id);
 }
 const event=(n,k,date)=>events.some(e=>e.amendment_id===amd(n)&&e.event_kind===k&&e.applies_on===date);
 for(const [n,k,date] of [[18,"ratification_with_delayed_substantive_start","1920-01-17"],[18,"amendment_repeal","1933-12-05"],[20,"delayed_legal_effect","1933-10-15"],[20,"historical_first_congressional_transition","1935-01-03"],[20,"historical_first_presidential_transition","1937-01-20"],[21,"repeals_prior_amendment","1933-12-05"],[27,"certification_after_adoption","1992-05-18"]])
  if(!event(n,k,date))bad("Missing required amendment temporal transition "+n+":"+k+":"+date);
 for(const [id,from,to] of [["CHG-US-CONST-35","CONST-US-AMD-20-SEC-01","CONST-US-ART-01-SEC-02-CL-01"],["CHG-US-CONST-36","CONST-US-AMD-20-SEC-01","CONST-US-ART-01-SEC-03-CL-01"],["CHG-US-CONST-37","CONST-US-AMD-27","CONST-US-ART-01-SEC-06-CL-01"]])
  if(changes.get(id)?.amending_provision_id!==from||!changes.get(id)?.affected_provision_ids?.includes(to))bad("Missing original article amendment effect "+id);
 for(const [pid,status] of [["CONST-US-ART-02-SEC-01-CL-03","superseded"],["CONST-US-ART-04-SEC-02-CL-03","superseded"],["CONST-US-AMD-18","repealed"],["CONST-US-AMD-21","operative"]])
  if(provisions.get(pid)?.effect_status!==status)bad("Supersession/repeal status not preserved "+pid);
 for(const [qid,uid] of [
 ["AMD-QUAL-SPECIAL-TWELFTH-HOUSE-QUORUM","AMD-UNIT-12-U-06"],
 ["AMD-QUAL-SPECIAL-TWELFTH-SENATE-QUORUM","AMD-UNIT-12-U-07"],
 ["AMD-QUAL-SPECIAL-THIRTEENTH-DULY-CONVICTED","AMD-UNIT-13-S01-02"],
 ["AMD-QUAL-SPECIAL-FOURTEENTH-CITIZEN-PERSON-DISTINCTION","AMD-UNIT-14-S01-03"],
 ["AMD-QUAL-SPECIAL-FOURTEENTH-PERSON-DUE-PROCESS","AMD-UNIT-14-S01-04"],
 ["AMD-QUAL-SPECIAL-FOURTEENTH-PERSON-EQUAL-PROTECTION","AMD-UNIT-14-S01-05"],
 ["AMD-QUAL-SPECIAL-FOURTEENTH-DISABILITY-TWO-THIRDS","AMD-UNIT-14-S03-04"],
 ["AMD-QUAL-SPECIAL-EIGHTEENTH-REPEALED","AMD-UNIT-18-S01-01"],
 ["AMD-QUAL-SPECIAL-TWENTIETH-SECTION-ONE-DELAY","AMD-UNIT-20-S01-01"],
 ["AMD-QUAL-SPECIAL-TWENTYFIRST-REPEALS-EIGHTEENTH","AMD-UNIT-21-S01-01"],
 ["AMD-QUAL-SPECIAL-TWENTYSECOND-GRANDFATHER","AMD-UNIT-22-S01-03"],
 ["AMD-QUAL-SPECIAL-TWENTYTHIRD-DC-ELECTORS-CAP","AMD-UNIT-23-S01-02"],
 ["AMD-QUAL-SPECIAL-TWENTYFIFTH-VP-MAJORITY-BOTH-HOUSES","AMD-UNIT-25-S02-02"],
 ["AMD-QUAL-SPECIAL-TWENTYFIFTH-FOUR-DAY","AMD-UNIT-25-S04-03"],
 ["AMD-QUAL-SPECIAL-TWENTYFIFTH-FORTYEIGHT-HOUR","AMD-UNIT-25-S04-04"],
 ["AMD-QUAL-SPECIAL-TWENTYFIFTH-TWENTYONE-DAY","AMD-UNIT-25-S04-05"],
 ["AMD-QUAL-SPECIAL-TWENTYFIFTH-TWO-THIRDS-BOTH-HOUSES","AMD-UNIT-25-S04-06"],
 ["AMD-QUAL-SPECIAL-TWENTYSIXTH-AGE-EIGHTEEN","AMD-UNIT-26-S01-01"],
 ["AMD-QUAL-SPECIAL-TWENTYSEVENTH-HOUSE-ELECTION","AMD-UNIT-27-U-01"]
 ])if(Q.get(qid)?.unit_id!==uid||!U.get(uid)?.qualification_ids?.includes(qid))bad("Critical constitutional amendment safeguard missing "+qid);
 for(const [uid,actor] of [["AMD-UNIT-14-S01-03","ACT-US-CITIZENS"],["AMD-UNIT-14-S01-04","ACT-US-PERSONS"],["AMD-UNIT-14-S01-05","ACT-US-PERSONS"],["AMD-UNIT-15-S01-01","ACT-US-CITIZENS"],["AMD-UNIT-19-U-01","ACT-US-CITIZENS"],["AMD-UNIT-24-S01-01","ACT-US-CITIZENS"],["AMD-UNIT-26-S01-01","ACT-US-CITIZENS"]])
  if(!bindings.some(b=>b.norm_id===U.get(uid)?.norm_id&&b.target_id===actor&&b.relationship_type==="protects"))bad("Rights-holder text misclassified "+uid);
 return {errors,counts:{amendments:timeline.length,numbered_sections:33,analytical_segments:units.length,temporal_events:events.length,effects:effects.length,qualifications:qual.length,active_capability_links:capLinks.length,historical_segments:historicallyArchived},status:"research_textual_summary_pending_legal_review"};
}
