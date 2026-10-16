import test from "node:test";
import assert from "node:assert/strict";
import {checkShape,validateSchemaPublication} from "../scripts/outcome-schema-validator.mjs";
test("Seven INC-07 JSON schema publication contracts match the source records",()=>{
 const {errors,files}=validateSchemaPublication();
 assert.equal(files,7);
 assert.deepEqual(errors,[]);
});
const shape={type:"object",required:["name","allowed"],additionalProperties:false,properties:{
 name:{type:"string",minLength:2,pattern:"^OUT-"},
 allowed:{const:false},
 refs:{type:"array",minItems:1,items:{type:"string",pattern:"^CAP-XDOM-"}}
}};
test("Schema negative: extra material fails closed",()=>{
 assert.match(checkShape({name:"OUT-A",allowed:false,hack:true},shape).join("|"),/unknown property/);
});
test("Schema negative: false is not true",()=>{
 assert.match(checkShape({name:"OUT-A",allowed:true},shape).join("|"),/constant mismatch/);
});
test("Schema negative: malformed references fail",()=>{
 assert.match(checkShape({name:"OUT-A",allowed:false,refs:["CAP-BAD"]},shape).join("|"),/pattern mismatch/);
});
test("Schema negative: minimum array cardinality enforced",()=>{
 assert.match(checkShape({name:"OUT-A",allowed:false,refs:[]},shape).join("|"),/too few array values/);
});
