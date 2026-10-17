// Constrained data validator for DoD v0.1.0 JSON Schema families.
// Supports only the vetted keywords below; semantic/authority integrity in dod-validation-core.mjs.
import {DOD_FAMILIES} from "./dod-validation-core.mjs";
const typeOf=x=>x===null?"null":Array.isArray(x)?"array":Number.isInteger(x)?"integer":typeof x;
const validType=(x,t)=>t==="number"?typeof x==="number":typeOf(x)===t;
const good=(v,t)=>Array.isArray(t)?t.some(t=>validType(v,t)):validType(v,t);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function checkDodSchema(schema,files){
 const errors=[];const issue=(path,message)=>errors.push(path+": "+message);
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema")
  issue("schema","unsupported schema dialect");
 if(!schema?.$defs||Object.keys(schema.$defs).length!==DOD_FAMILIES.length||
  !DOD_FAMILIES.every(x=>schema.$defs[x]))issue("schema","missing or extraneous DoD model schema");
 for(const family of DOD_FAMILIES){
  const p="model/federal/dod/"+family+".json",record=files[p],spec=schema?.$defs?.[family];
  if(record?.model_version!=="0.1.0"||!Array.isArray(record?.items)){issue(p,"missing versioned data collection");continue;}
  if(!spec||spec.type!=="object"||spec.additionalProperties!==false||
   !Array.isArray(spec.required)||!spec.required.includes("id")||!spec.required.includes("type")||
   spec.properties?.id?.pattern!=="^[A-Z][A-Z0-9-]{2,160}$"){
   issue(p,"missing strict record schema and stable ARFI ID rule");continue;
  }
  for(const [i,value]of record.items.entries()){
   const location=p+"["+i+"]";
   if(!value||Array.isArray(value)||typeof value!=="object"){issue(location,"not an object");continue;}
   for(const key of spec.required)if(!Object.hasOwn(value,key))issue(location,"required "+key+" absent");
   for(const [key,v]of Object.entries(value)){
    const rule=spec.properties[key],at=location+"."+key;
    if(!rule){issue(at,"unknown publication field");continue;}
    for(const allowed of Object.keys(rule))
     if(!["type","const","enum","pattern","minItems","items"].includes(allowed))
      issue(at,"unsupported schema keyword "+allowed);
    if(rule.type!==undefined&&!good(v,rule.type))issue(at,"type mismatch");
    if(Object.hasOwn(rule,"const")&&!Object.is(v,rule.const))issue(at,"constant mismatch");
    if(rule.enum&&!rule.enum.some(x=>equal(x,v)))issue(at,"unknown classification");
    if(rule.pattern&&typeof v==="string"&&!new RegExp(rule.pattern).test(v))issue(at,"invalid source ID");
    if(Array.isArray(v)){
     if(rule.minItems!==undefined&&v.length<rule.minItems)issue(at,"missing array sources");
     for(const [j,x]of v.entries())if(rule.items?.type&&!good(x,rule.items.type))
      issue(at+"["+j+"]","array item type mismatch");
    }
   }
  }
 }
 return {model_families:DOD_FAMILIES.length,errors};
}
