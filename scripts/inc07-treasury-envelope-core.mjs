// Declarative X07 schema is a hard validation gate, including conditional source provenance.
export const X07_SCHEMA_FAMILIES=["sources","tas","apportionments","controls","execution","gaps","relationships","traces"];
const K=new Set(["$schema","title","description","type","required","properties","items","minItems","maxItems","uniqueItems","minLength","const","pattern","additionalProperties","allOf","if","then","else"]);
const obj=x=>typeof x==="object"&&x!==null&&!Array.isArray(x);
const accept=(schema,value,path,errors)=>{
 if(!obj(schema)){errors.push(path+": invalid JSON schema");return;}
 for(const k of Object.keys(schema))if(!K.has(k))errors.push(path+": unsupported schema keyword "+k);
 if(schema.type){
  const okay=schema.type==="object"?obj(value):schema.type==="array"?Array.isArray(value):
   schema.type==="string"?typeof value==="string":schema.type==="integer"?Number.isInteger(value):
   schema.type==="number"?typeof value==="number"&&Number.isFinite(value):schema.type==="boolean"?typeof value==="boolean":false;
  if(!okay){errors.push(path+": expected "+schema.type);return;}
 }
 if(Object.hasOwn(schema,"const")&&JSON.stringify(value)!==JSON.stringify(schema.const))errors.push(path+": const mismatch");
 if(schema.pattern&&(typeof value!=="string"||!new RegExp(schema.pattern,"u").test(value)))errors.push(path+": string pattern mismatch");
 if(schema.minLength!==undefined&&typeof value==="string"&&value.length<schema.minLength)errors.push(path+": empty or short string");
 if(obj(value)){
  for(const key of schema.required||[])if(!Object.hasOwn(value,key))errors.push(path+"."+key+": missing required field");
  if(schema.additionalProperties===false)for(const key of Object.keys(value))if(!Object.hasOwn(schema.properties||{},key))errors.push(path+"."+key+": unexpected field");
  for(const [key,v]of Object.entries(schema.properties||{}))if(Object.hasOwn(value,key))accept(v,value[key],path+"."+key,errors);
 }
 if(Array.isArray(value)){
  if(schema.minItems!==undefined&&value.length<schema.minItems)errors.push(path+": missing array items");
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)errors.push(path+": excessive array items");
  if(schema.uniqueItems===true&&new Set(value.map(x=>JSON.stringify(x))).size!==value.length)errors.push(path+": duplicate array item");
  if(schema.items)for(let i=0;i<value.length;i++)accept(schema.items,value[i],path+"["+i+"]",errors);
 }
 for(const cond of schema.allOf||[]){
  if(!obj(cond)){errors.push(path+": invalid conditional schema");continue;}
  for(const k of Object.keys(cond))if(!["if","then","else"].includes(k))errors.push(path+": invalid conditional keyword "+k);
  const result=[];accept(cond.if||{},value,path,result);
  const branch=result.length===0?cond.then:cond.else;
  if(branch)accept(branch,value,path,errors);
 }
};
export function validateX07Schema(schema,collections){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema")
  errors.push("X07 requires schema draft 2020-12");
 if(JSON.stringify(schema?.required)!==JSON.stringify(["model_version","model_family","items"])||
    !schema?.properties?.items?.items?.allOf?.length)
  errors.push("X07 schema missing mandatory envelope/conditional provenance contract");
 for(const fam of X07_SCHEMA_FAMILIES){
  const file=collections?.[fam];accept(schema,file,fam,errors);
  if(file?.model_family!=="inc07-federal-treasury-"+fam)errors.push("X07 collection family mismatch "+fam);
 }
 return {errors,validatedFamilies:X07_SCHEMA_FAMILIES.length};
}
