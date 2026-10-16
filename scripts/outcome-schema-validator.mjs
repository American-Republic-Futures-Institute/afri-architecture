// Declarative subset of JSON Schema draft 2020-12, for INC-07 publication contracts.
// Intentionally rejects unknown keyword families rather than claiming full JSON Schema conformance.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const types=new Set(["string","number","integer","boolean","null","object","array"]);
const names=["manifest","evidence","guardrails","authority-gates","options","relationships","scenarios"];
export function checkShape(value,schema,where="$"){
  const errors=[];
  const fail=what=>errors.push(where+": "+what);
  if(schema.const!==undefined&&!Object.is(value,schema.const))fail("constant mismatch");
  if(schema.enum&&!schema.enum.includes(value))fail("enum value not recognized");
  if(schema.type){
    const correct=schema.type==="null"?value===null:schema.type==="array"?Array.isArray(value):
      schema.type==="integer"?Number.isInteger(value):schema.type==="object"?value!==null&&typeof value==="object"&&!Array.isArray(value):typeof value===schema.type;
    if(!correct){fail("wrong type, expected "+schema.type);return errors;}
  }
  if(typeof value==="string"){
    if(schema.minLength!==undefined&&value.length<schema.minLength)fail("minimum length unmet");
    if(schema.pattern&&!new RegExp(schema.pattern).test(value))fail("identifier/pattern mismatch");
    if(schema.format==="uri"&&!/^https:\/\//.test(value))fail("non-HTTPS source URI");
    if(schema.format==="date"&&!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))fail("invalid date shape");
  }
  if(Array.isArray(value)){
    if(schema.minItems!==undefined&&value.length<schema.minItems)fail("too few array values");
    if(schema.items)for(let i=0;i<value.length;i++)errors.push(...checkShape(value[i],schema.items,where+"["+i+"]"));
  }
  if(value!==null&&typeof value==="object"&&!Array.isArray(value)){
    for(const key of schema.required||[])if(!Object.prototype.hasOwnProperty.call(value,key))fail("missing key "+key);
    for(const [key,v] of Object.entries(value)){
      const prop=schema.properties?.[key];
      if(prop)errors.push(...checkShape(v,prop,where+"."+key));
      else if(schema.additionalProperties===false)fail("unknown property "+key);
    }
  }
  return errors;
}
export function validateSchemaPublication(dir=root){
  const errors=[];
  for(const name of names){
    const sourcePath="model/outcomes/"+name+".json",specPath="schemas/outcome-"+name+".schema.json";
    const source=JSON.parse(fs.readFileSync(path.join(dir,sourcePath),"utf8"));
    const spec=JSON.parse(fs.readFileSync(path.join(dir,specPath),"utf8"));
    if(spec.$schema!=="https://json-schema.org/draft/2020-12/schema")errors.push(specPath+": wrong declared schema dialect");
    errors.push(...checkShape(source,spec,sourcePath));
  }
  return {errors,files:names.length};
}
