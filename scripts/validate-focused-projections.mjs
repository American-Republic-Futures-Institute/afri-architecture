#!/usr/bin/env node
// Index and query canonical source records without adding viewpoint UI or policy facts.
// Use --query FILE to compose several roots and filters. Output is JSON on stdout.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {compileFocusedGraph,INDEX_PATHS,projectFocusedView} from "./focused-projection-core.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.isAbsolute(p)?p:path.join(root,p),"utf8"));
const model=read("model/federal/manifest.json");
const paths=[...INDEX_PATHS,"model/projection/scopes.json","model/projection/edge-rules.json","model/projection/article-index.json","model/projection/amendment-index.json"];
const files=Object.fromEntries(paths.map(p=>[p,read(p)]));
const graph=compileFocusedGraph(model,files);
const args=process.argv.slice(2);
if(!args.length||args.includes("--validate")){
 const generated=Array.from(graph.scopes.keys()).map(scope_id=>projectFocusedView(graph,{scope_id,max_nodes:2500,max_edges:10000}));
 const invalid=generated.filter(x=>!x.nodes.some(n=>x.root_ids.includes(n.id)));
 if(invalid.length)throw Error("A focused view has no rooted source graph");
 console.log(JSON.stringify({status:"validated_model_only",coverage:graph.coverage,scopes:graph.scopes.size,
  example_first_amendment:{nodes:generated.find(x=>x.scope_id==="SCOPE-CONST-AMD-01")?.counts.nodes,
    edges:generated.find(x=>x.scope_id==="SCOPE-CONST-AMD-01")?.counts.edges},
  ui_deployed:false,policy_mapping_included:false},null,2));
}else{
 const fileFlag=args.indexOf("--query");
 if(fileFlag<0||!args[fileFlag+1]||args.length!==2)throw Error("Expected: node scripts/validate-focused-projections.mjs --query path/to/query.json");
 const query=read(args[fileFlag+1]);
 process.stdout.write(JSON.stringify(projectFocusedView(graph,query),null,2)+"\n");
}
