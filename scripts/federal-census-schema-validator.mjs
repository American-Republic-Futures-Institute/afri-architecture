// Deliberately bounded JSON Schema contract verifier for ARFI census v0.1.0.
// This verifies the subset used by this generated schema; not a general 2020-12 implementation.
export const FAMILIES=Object.freeze(["taxonomy","institution-references","source-registry","source-snapshots",
 "components","relationships","gaps","viewpoints"]);
const fieldType=v=>v===null?"null":Array.isArray(v)?"array":Number.isInteger(v)?"integer":typeof v;
const passType=(v,t)=>fieldType(v)===t||(t==="number"&&typeof v==="number");
const matches=(v,t)=>Array.isArray(t)?t.some(x=>passType(v,x)):passType(v,t);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=arr=>new Set(arr.map(v=>JSON.stringify(v))).size===arr.length;
export function inspectFederalCensusSchema(schema,files){
 const errors=[];
 const fail=(path,why)=>errors.push(path+": "+why);
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema")
  fail("schema","unexpected JSON Schema dialect");
 if(!schema?.$defs||Object.keys(schema.$defs).length!==FAMILIES.length||
  !FAMILIES.every(k=>!!schema.$defs[k]))fail("schema","missing or extra declared census model family");
 if(!Array.isArray(schema?.oneOf)||schema.oneOf.length!==FAMILIES.length)
  fail("schema","expected one schema for each census model family");
 for(const [index,name]of FAMILIES.entries()){
  const def=schema?.$defs?.[name],path="model/federal/coverage/"+name+".json";
  const data=files[path];
  const wrapper=schema?.oneOf?.[index];
  if(!def||def.type!=="object"||def.additionalProperties!==false||
   !Array.isArray(def.required)||!def.required.includes("id")||!def.required.includes("type")||
   !def.properties||def.properties.id?.pattern!=="^[A-Z][A-Z0-9-]+$"){
   fail(path,"missing strict item schema/ID contract");continue;
  }
  if(!wrapper||wrapper.properties?.model_version?.const!=="0.1.0"||
   wrapper.properties?.items?.items?.$ref!=="#/$defs/"+name||
   wrapper.additionalProperties!==false)fail(path,"collection wrapper schema mismatch");
  if(!data||data.model_version!=="0.1.0"||!Array.isArray(data.items)){
   fail(path,"invalid model wrapper");continue;
  }
  for(const [i,item]of data.items.entries()){
   const key=path+"["+i+"]";
   for(const required of def.required)if(!Object.hasOwn(item,required))fail(key,"missing required "+required);
   for(const [k,value]of Object.entries(item)){
    const rule=def.properties[k],where=key+"."+k;
    if(!rule){fail(where,"additional property forbidden");continue;}
    if(Object.hasOwn(rule,"const")&&!Object.is(value,rule.const))fail(where,"constant changed");
    if(rule.enum&&!rule.enum.some(e=>same(e,value)))fail(where,"value not in enum");
    if(rule.type&&!matches(value,rule.type))fail(where,"wrong schema type");
    if(rule.pattern&&typeof value==="string"&&!new RegExp(rule.pattern).test(value))fail(where,"identifier mismatch");
    if(Array.isArray(value)){
     if(rule.uniqueItems===true&&!unique(value))fail(where,"duplicate array item");
     if(rule.items)for(const [j,itemValue]of value.entries())
      if(rule.items.type&&!matches(itemValue,rule.items.type))
       fail(where+"["+j+"]","wrong array element type");
    }
   }
  }
 }
 return {errors,model_families:FAMILIES.length};
}
