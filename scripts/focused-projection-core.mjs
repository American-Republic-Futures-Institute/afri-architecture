// Pure ARFI-COA focused-view compiler: reads canonical records, never makes law.
// There is no UI, source transformation, natural-language inference or policy mapping.
const arr=x=>Array.isArray(x)?x:[];
const classes=new Set(["structural","research_analysis","textual_candidate","qualification","historical_context","functional_alignment","federal_observed"]);
const statuses=new Set(["model_only_focused_view_not_website_rendered"]);
export const INDEX_PATHS=Object.freeze([
 ...["provisions","norms","actors","bindings","changes","article-i-clauses","article-i-qualifications","article-i-capability-links","article-ii-units","article-ii-qualifications","article-ii-capability-links","article-iii-units","article-iii-qualifications","article-iii-capability-links","article-iii-jurisdiction","article-iv-vii-units","article-iv-vii-qualifications","article-iv-vii-actor-links","article-iv-vii-capability-links","federalism-units","federalism-qualifications","federalism-relationships","federalism-capability-links","amendment-units","amendment-effects","amendment-qualifications","amendment-capability-links","amendment-timeline"].map(n=>"model/constitutional/"+n+".json"),
 ...["branches","legislative","executive-leadership","executive-departments","executive-independent","judiciary","capabilities","authorities","relationships","sources"].map(n=>"model/federal/"+n+".json")
]);
const rpath={
 scopes:"model/projection/scopes.json",
 rules:"model/projection/edge-rules.json",
 articles:"model/projection/article-index.json",
 amendments:"model/projection/amendment-index.json"
};
const queryFields=new Set(["scope_id","focus_ids","exclude_ids","include_record_kinds","include_relation_classes","max_hops","max_nodes","max_edges","search_text","search_mode"]);
const metadata=x=>({id:x.id,title:x.name||x.title||x.label||x.citation||x.id,kind:x.type||x.kind||x.unit||"record",domain:x.model_path.split("/")[1],
 source_ids:arr(x.source_ids),model_path:x.model_path,effect_status:x.current_effect_status||x.effect_status||x.legal_effect_status||"not_assessed",
 legal_review_status:x.review_status||x.interpretation_status||x.legal_review_status||"not_certified"});
function fail(message){throw new Error("Focused projection rejected: "+message)}
function ensure(x,s){if(!x)fail(s)}
function values(rec,field){const x=field==="$self"?rec.id:rec[field];return x===null||x===undefined?[]:Array.isArray(x)?x:[x]}
function sortedUnique(x){return [...new Set(x)].sort()}
function isSubset(a,b){return a.every(x=>b.includes(x))}
function assertCollection(manifest,files,path){
 ensure(manifest.models.includes(path),"unregistered collection "+path);
 const m=files[path];ensure(m?.model_version===manifest.model_version&&Array.isArray(m.items),"invalid collection "+path);
 return m.items;
}
export function compileFocusedGraph(manifest,files){
 ensure(manifest?.model_standard==="ARFI-COA"&&manifest?.release_status==="research_baseline_unratified","unratified ARFI model required");
 ensure(Array.isArray(manifest.models)&&new Set(manifest.models).size===manifest.models.length,"duplicate manifest paths");
 const ext=manifest.focused_projection_extension;
 ensure(ext?.id==="ARFI-COA-FOCUSED-PROJECTION-001"&&ext.release_status==="data_contract_only_no_website_renderer"&&ext.user_interface_status==="future_increment"&&ext.policy_mapping_status==="future_increment","projection release state cannot imply deployed UI or policy mappings");
 const scopes=assertCollection(manifest,files,rpath.scopes),rules=assertCollection(manifest,files,rpath.rules);
 const articles=assertCollection(manifest,files,rpath.articles),amendments=assertCollection(manifest,files,rpath.amendments);
 ensure(scopes.length===34&&articles.length===7&&amendments.length===27&&rules.length===ext.rule_count,"scope/index coverage incomplete");
 const idToRecord=new Map(),pathItems=new Map();
 for(const path of INDEX_PATHS){
  const items=assertCollection(manifest,files,path);pathItems.set(path,items);
  for(const record of items){
   ensure(typeof record.id==="string"&&/^[A-Z][A-Z0-9-]*$/.test(record.id),"invalid source record ID in "+path);
   ensure(!idToRecord.has(record.id),"cross-file duplicate source ID "+record.id);
   idToRecord.set(record.id,{...record,model_path:path});
  }
 }
 const rootProvision=idToRecord.get("CONST-US");
 ensure(rootProvision?.unit==="constitution","canonical original Constitution unavailable");
 const scoped=new Map();
 const sources=new Map(pathItems.get("model/federal/sources.json").map(x=>[x.id,x]));
 const articleRom=["I","II","III","IV","V","VI","VII"];
 const byId=(id,reason)=>{const x=idToRecord.get(id);ensure(!!x,reason+" "+id);return x};
 for(const [index,row]of articles.entries()){
  const art=index+1,roman=articleRom[index],root="CONST-US-ART-"+String(art).padStart(2,"0");
  ensure(row.id==="ARTICLE-INDEX-"+String(art).padStart(2,"0")&&row.root_id===root&&row.article===roman,"incorrect Article index "+art);
  const prov=byId(root,"missing Article root");ensure(prov.unit==="article","Article index not rooted at Article "+root);
  ensure(row.source_unit_count===row.source_unit_ids.length&&row.source_unit_count>0&&new Set(row.source_unit_ids).size===row.source_unit_ids.length,"Article source unit coverage missing "+roman);
  ensure(row.source_unit_ids.every(id=>idToRecord.get(id)?.model_path===row.source_model_path),"Article index crosses source catalogue "+roman);
  ensure(row.source_unit_ids.every(id=>art<=3||idToRecord.get(id).article===art),"Article IV–VII crosswalk exceeds original article "+roman);
  const definition=scopes.find(x=>x.id==="SCOPE-CONST-ART-"+String(art).padStart(2,"0"));
  ensure(definition?.root_ids?.length===1&&definition.root_ids[0]===root&&definition.source_unit_catalog===row.source_model_path,"Article focus definition missing "+roman);
 }
 for(let index=1;index<=27;index++){
  const row=amendments[index-1],root="CONST-US-AMD-"+String(index).padStart(2,"0");
  ensure(row?.id==="AMENDMENT-INDEX-"+String(index).padStart(2,"0")&&row.root_id===root&&row.amendment_number===index,"amendment index missing "+index);
  const prov=byId(root,"missing ratified amendment");ensure(prov.unit==="amendment","amendment index must reference original ratified text "+root);
  ensure(row.current_text_effect===prov.effect_status&&row.ratified_on===prov.ratified_on,"amendment chronology/status mismatch "+root);
  ensure(row.source_unit_count===row.source_unit_ids.length&&row.source_unit_count>0&&new Set(row.source_unit_ids).size===row.source_unit_count,"amendment unit count mismatch "+root);
  ensure(row.source_unit_ids.every(id=>idToRecord.get(id)?.amendment_number===index&&idToRecord.get(id)?.model_path===row.source_model_path),"amendment index crosses source records "+root);
  ensure(scopes.some(s=>s.id==="SCOPE-CONST-AMD-"+String(index).padStart(2,"0")&&s.root_ids?.[0]===root),"individual amendment view missing "+root);
 }
 for(const s of scopes){
  ensure(s.type==="focused_constitutional_scope"&&s.domain==="constitutional"&&s.scope_kind==="source_descendants"&&statuses.has(s.publication_status),"unsupported focus scope "+s.id);
  ensure(arr(s.root_ids).length===1&&idToRecord.has(s.root_ids[0]),"unresolved focus root "+s.id);
  ensure(Number.isInteger(s.default_traversal_hops)&&s.default_traversal_hops>=0&&s.default_traversal_hops<=8,"invalid scope traversal budget "+s.id);
  ensure(s.include_original_historical_text===true&&s.expand_external_capabilities===false,"focus scope must preserve history without assuming agency powers "+s.id);
  ensure(arr(s.default_include_relation_classes).every(c=>classes.has(c)),"unknown relation class "+s.id);
  ensure(arr(s.source_ids).length>0&&s.source_ids.every(id=>sources.has(id)),"scope missing official source provenance "+s.id);
  ensure(!scoped.has(s.id),"repeated focus scope "+s.id);scoped.set(s.id,s);
 }
 const edges=[],edgeIds=new Set();let total=0;
 for(const rule of rules){
  ensure(rule.type==="declarative_source_edge_rule"&&classes.has(rule.relationship_class)&&rule.legal_status==="descriptive_projection_only_not_delegated_power","invalid relationship rule "+rule.id);
  ensure(typeof rule.from_field==="string"&&typeof rule.to_field==="string"&&typeof rule.relationship_kind==="string"&&typeof rule.traversal_default==="boolean","unbounded declarative rule "+rule.id);
  const records=pathItems.get(rule.source_model_path);
  ensure(!!records,"rule uses unregistered source-model collection "+rule.id);
  for(const rec of records){
   const left=values(rec,rule.from_field),right=values(rec,rule.to_field);
   if(!left.length||!right.length)continue;
   ensure(left.length*right.length<=200,"rule creates excessive reference fan-out "+rule.id+":"+rec.id);
   for(const from_id of left)for(const to_id of right){
    ensure(typeof from_id==="string"&&typeof to_id==="string","noncanonical edge reference "+rec.id);
    byId(from_id,"missing source relationship endpoint in "+rule.id);
    byId(to_id,"missing target relationship endpoint in "+rule.id);
    if(from_id===to_id)continue;
    const id=rule.id+"-"+rec.id+"-"+String(total++);
    ensure(!edgeIds.has(id),"duplicate projected relation "+id);edgeIds.add(id);
    edges.push({id,from_id,to_id,relationship_kind:rule.relationship_kind,relationship_class:rule.relationship_class,
      source_record_id:rec.id,source_model_path:rule.source_model_path,source_ids:arr(rec.source_ids),
      traversal_default:rule.traversal_default,legal_authority_proven:false,
      reviewed_effect_status:rec.current_effect_status||rec.effect_status||"not_certified"});
   }
  }
 }
 // A valid functional crosswalk is not a verified current agency delegation.
 ensure(!edges.some(e=>e.legal_authority_proven!==false),"projection fabricated verified legal authority");
 return {manifest,files,nodes:idToRecord,edges,scopes:scoped,sourceMap:sources,
   coverage:{articles:articles.length,amendments:amendments.length,article_units:articles.reduce((n,a)=>n+a.source_unit_count,0),amendment_units:amendments.reduce((n,a)=>n+a.source_unit_count,0),rules:rules.length,derived_edges:edges.length}};
}
function queryShape(query){
 ensure(query&&typeof query==="object"&&!Array.isArray(query),"query must be a JSON object");
 for(const k of Object.keys(query))ensure(queryFields.has(k),"unknown or unsupported query field "+k);
 for(const key of ["focus_ids","exclude_ids","include_record_kinds","include_relation_classes"]){
  if(query[key]!==undefined)ensure(Array.isArray(query[key])&&query[key].length<=100&&query[key].every(x=>typeof x==="string"&&x.length<180),"invalid query filter "+key);
 }
 for(const [k,max]of [["max_hops",8],["max_nodes",2500],["max_edges",10000]]){
  if(query[k]!==undefined)ensure(Number.isInteger(query[k])&&query[k]>=0&&query[k]<=max,"invalid query budget "+k);
 }
 if(query.search_text!==undefined)ensure(typeof query.search_text==="string"&&query.search_text.length<=160,"invalid search text");
 if(query.search_mode!==undefined)ensure(["all","any"].includes(query.search_mode),"unsupported search mode");
 if(query.scope_id!==undefined)ensure(typeof query.scope_id==="string","scope_id must be literal");
 if(query.include_relation_classes!==undefined)ensure(query.include_relation_classes.every(x=>classes.has(x)),"query uses unknown relationship class");
}
function shortestPath(from,to,edges,maxHops=12){
 const adj=new Map();
 for(const e of edges){for(const [a,b]of [[e.from_id,e.to_id],[e.to_id,e.from_id]]){if(!adj.has(a))adj.set(a,[]);adj.get(a).push([b,e.id]);}}
 const seen=new Set([from]),queue=[{node:from,ids:[from],relation_ids:[]}];
 for(let i=0;i<queue.length;i++){
  const current=queue[i];if(current.ids.length>maxHops+1)continue;
  if(current.node===to)return {node_ids:current.ids,relation_ids:current.relation_ids};
  for(const [next,id]of adj.get(current.node)||[])if(!seen.has(next)){
   seen.add(next);queue.push({node:next,ids:[...current.ids,next],relation_ids:[...current.relation_ids,id]});
  }
 }
 return null;
}
export function projectFocusedView(graph,query){
 queryShape(query);
 const scope=query.scope_id?graph.scopes.get(query.scope_id):null;
 ensure(!query.scope_id||scope,"unknown source-backed scope "+query.scope_id);
 const roots=sortedUnique([...(scope?.root_ids||[]),...arr(query.focus_ids)]);
 const matched=[];
 if(query.search_text?.trim()){
  const words=query.search_text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  for(const x of graph.nodes.values()){
   const name=(metadata(x).title+" "+x.id).toLowerCase();
   if(query.search_mode==="any"?words.some(s=>name.includes(s)):words.every(s=>name.includes(s)))matched.push(x.id);
  }
  matched.sort();
  // Search only locates records. It NEVER creates a relationship from text similarity.
  if(!roots.length)roots.push(...matched.slice(0,12));
 }
 ensure(roots.length>0&&roots.length<=16,"specify 1–16 source-backed focus IDs or a selective text search");
 for(const id of roots)ensure(graph.nodes.has(id),"unknown query root "+id);
 const excluded=new Set(arr(query.exclude_ids));
 ensure(!roots.some(x=>excluded.has(x)),"a selected focus root cannot be excluded");
 const depth=query.max_hops??scope?.default_traversal_hops??3;
 const allowed=new Set(query.include_relation_classes??scope?.default_include_relation_classes??["structural","research_analysis","textual_candidate","qualification","historical_context","functional_alignment"]);
 const byOrigin=new Map(),children=new Map();
 for(const e of graph.edges){
  if(!byOrigin.has(e.from_id))byOrigin.set(e.from_id,[]);
  byOrigin.get(e.from_id).push(e);
  if(e.relationship_kind==="text_contains"){
   if(!children.has(e.from_id))children.set(e.from_id,[]);
   children.get(e.from_id).push(e.to_id);
  }
 }
 const selected=new Set(roots),frontier=[];
 for(const root of roots){
  const row=graph.nodes.get(root);
  if(row.model_path==="model/constitutional/provisions.json"){
   const todo=[root],seen=new Set(todo);
   while(todo.length){
    const current=todo.shift();
    for(const child of children.get(current)||[])if(!seen.has(child)){
     seen.add(child);todo.push(child);selected.add(child);
    }
   }
  }
 }
 for(const id of selected)frontier.push([id,0]);
 const visitedDepth=new Map(frontier);
 while(frontier.length){
  const [id,hops]=frontier.shift();if(hops>=depth)continue;
  for(const edge of byOrigin.get(id)||[]){
   if(!allowed.has(edge.relationship_class))continue;
   if(!edge.traversal_default&&query.include_relation_classes===undefined)continue;
   if(excluded.has(edge.to_id))continue;
   const next=hops+1;
   if(visitedDepth.has(edge.to_id)&&visitedDepth.get(edge.to_id)<=next)continue;
   selected.add(edge.to_id);visitedDepth.set(edge.to_id,next);frontier.push([edge.to_id,next]);
  }
 }
 const kinds=query.include_record_kinds?new Set(query.include_record_kinds):null;
 const visible=new Set([...selected].filter(id=>!excluded.has(id)&&(!kinds||kinds.has(metadata(graph.nodes.get(id)).kind))));
 const nodes=sortedUnique([...visible]).map(id=>metadata(graph.nodes.get(id)));
 const edges=graph.edges.filter(e=>visible.has(e.from_id)&&visible.has(e.to_id)&&allowed.has(e.relationship_class)).sort((a,b)=>a.id.localeCompare(b.id));
 ensure(nodes.length<=(query.max_nodes??2500),"node budget exceeded; specify a smaller explicit scope");
 ensure(edges.length<=(query.max_edges??10000),"edge budget exceeded; specify a smaller explicit scope");
 const hiddenQualificationCount=[...selected].filter(id=>!visible.has(id)&&/(?:QUAL|COND)-/.test(id)).length;
 const connections=[];
 for(let i=0;i<roots.length;i++)for(let j=i+1;j<roots.length;j++){
  const route=shortestPath(roots[i],roots[j],edges);
  connections.push({from_id:roots[i],to_id:roots[j],
   status:route?"descriptive_source_path_not_legal_conclusion":"not_evidenced_within_selected_models",
   path:route,absence_caveat:"No path in this selected graph is not proof that a right, obligation, or statutory authority is legally absent."});
 }
 const srcIds=sortedUnique(nodes.flatMap(n=>n.source_ids));
 const usedSources=srcIds.filter(id=>graph.sourceMap.has(id)).map(id=>({id,source_url:graph.sourceMap.get(id).url}));
 return {model_standard:"ARFI-COA",projection_version:"0.1.0",status:"data_projection_only_not_legal_advice",
   scope_id:scope?.id||null,root_ids:roots,matched_search_ids:matched,
   counts:{nodes:nodes.length,edges:edges.length,hidden_qualifications:hiddenQualificationCount},
   nodes,edges,connections,sources:usedSources,
   notices:["Original constitutional text and controlling law remain authoritative; displayed summaries are research candidates.",
    "Text containment is not legal delegation. Functional alignments are not statutory government powers.",
    ...(hiddenQualificationCount?["Some qualifications are hidden by filters; never interpret the selected view as unrestricted authority."]:[]),
    "A missing relationship in this incomplete source graph does not establish the absence of a constitutional right or duty."]};
}
