import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate,reserve} from '../functions/policy.js';
test('allow only named American voices and bounded UTF-8 input',()=>{
 assert.equal(validate({text:'Hello',voice:'Charon'}).voice,'en-US-Chirp3-HD-Charon');
 for(const body of [{text:' ',voice:'Charon'},{text:'Hi',voice:'other'},{text:'😀'.repeat(251),voice:'Kore'},null]) assert.throws(()=>validate(body));
 assert.doesNotThrow(()=>validate({text:'😀'.repeat(250),voice:'Kore'}));
});
test('caps fail closed, include reservations and reset at UTC boundaries',()=>{
 const date=new Date('2026-10-15T00:00:00Z');
 const usage=reserve({},90,100,200,date);
 assert.throws(()=>reserve(usage,11,100,200,date));
 assert.equal(reserve(usage,10,100,200,date).daily,100);
 assert.equal(reserve(usage,10,100,200,new Date('2026-10-16')).monthly,100);
 assert.throws(()=>reserve(usage,111,1000,200,new Date('2026-10-16')));
 assert.equal(reserve(usage,10,100,200,new Date('2026-11-01')).monthly,10);
 assert.throws(()=>reserve({},1,NaN,200,date));
 assert.throws(()=>reserve({},1,100,0,date));
});
