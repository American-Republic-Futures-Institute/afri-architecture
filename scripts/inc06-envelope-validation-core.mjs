// Enforces the JSON Schema 2020-12 subset used by INC-06; unsupported keywords are
// errors, not silently ignored. No external runtime dependency required.
const K=new Set(["$schema","title","description","type","required","properties","items","minItems","maxItems","uniqueItems","const","pattern","minLength","additionalProperties","allOf","if","then","else"]);
export const families=["sources","enactments","accounts","actors","programs","controls","metrics","outcomes","gaps","relationships","traces"];
const isObject=v=>typeof v==="object"&&v!==null&&!Array.isArray(v);
function inspect(schema,value,path,errors,structure=false){
 if(!isObject(schema)){errors.push(path+": invalid schema object");return;}
 for(const key of Object.keys(schema))if(!K.has(key))errors.push(path+": unsupported JSON Schema keyword "+key);
 if(schema.type){
  const good=schema.type==="object"?isObject(value):schema.type==="array"?Array.isArray(value):
   schema.type==="string"?typeof value==="string":schema.type==="integer"?Number.isInteger(value):
   schema.type==="number"?typeof value==="number"&&Number.isFinite(value):
   schema.type==="boolean"?typeof value==="boolean":false;
  if(!good){errors.push(path+": expected "+schema.type);return;}
 }
 if(Object.hasOwn(schema,"const")&&JSON.stringify(schema.const)!==JSON.stringify(value))errors.push(path+": const mismatch");
 if(schema.pattern&&!(new RegExp(schema.pattern,"u")).test(value))errors.push(path+": required pattern mismatch");
 if(schema.minLength!==undefined&&typeof value==="string"&&value.length<schema.minLength)errors.push(path+": string shorter than schema");
 if(isObject(value)){
  for(const key of schema.required||[])if(!Object.hasOwn(value,key))errors.push(path+"."+key+": missing required property");
  if(schema.additionalProperties===false)for(const key of Object.keys(value))if(!Object.hasOwn(schema.properties||{},key))errors.push(path+"."+key+": disallowed additional property");
  for(const [key,sub]of Object.entries(schema.properties||{}))if(Object.hasOwn(value,key))inspect(sub,value[key],path+"."+key,errors);
 }
 if(Array.isArray(value)){
  if(schema.minItems!==undefined&&value.length<schema.minItems)errors.push(path+": array shorter than schema");
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)errors.push(path+": array longer than schema");
  if(schema.uniqueItems===true&&new Set(value.map(x=>JSON.stringify(x))).size!==value.length)errors.push(path+": duplicate array value");
  if(schema.items)for(let i=0;i<value.length;i++)inspect(schema.items,value[i],path+"["+i+"]",errors);
 }
 for(const condition of schema.allOf||[]){
  if(!isObject(condition)){errors.push(path+": invalid conditional rule");continue;}
  const syntax=new Set(["if","then","else"]);
  for(const k of Object.keys(condition))if(!syntax.has(k))errors.push(path+": unsupported schema conditional "+k);
  const attempted=[];
  inspect(condition.if||{},value,path,attempted);
  const rule=attempted.length===0?condition.then:condition.else;
  if(rule)inspect(rule,value,path,errors);
 }
}
export function validateInc06Envelopes(schema,collections){
 const errors=[];
 if(schema?.$schema!=="https://json-schema.org/draft/2020-12/schema")
  errors.push("INC06 envelope claims unsupported JSON Schema revision");
 if(JSON.stringify(schema?.required)!==JSON.stringify(["model_version","model_family","items"]))
  errors.push("INC06 envelope schema required list mutated");
 if(!schema?.properties?.items?.items?.allOf?.length)
  errors.push("INC06 conditional original-source provenance rule absent");
 for(const name of families){
  const doc=collections?.[name];
  inspect(schema,doc,"inc06/"+name,errors);
  if(doc?.model_family!=="inc06-"+name)errors.push("inc06/"+name+": collection family mismatch");
 }
 return {errors,checkedFamilies:families.length};
}
