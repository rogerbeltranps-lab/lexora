import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../functions/proxy.js';
function fixture(overrides={}){
 const env={LEXORA_ORIGIN:'https://lexora.test',TTS_ENABLED:'true',TTS_ALLOWED_UIDS:'owner',TTS_DAILY_CHAR_LIMIT:'10',TTS_MONTHLY_CHAR_LIMIT:'20',...overrides};
 const records=new Map();let calls=0;
 const db={doc:path=>({get:async()=>({exists:records.has(path),data:()=>records.get(path)}),set:async value=>records.set(path,value),path}),runTransaction:async fn=>fn({get:async ref=>ref.get(),set:(ref,value)=>records.set(ref.path,value)})};
 const handler=createHandler({env,db,verifyToken:async token=>{if(token!=='good')throw Error();return {uid:'owner'}},google:{getClient:async()=>({request:async()=>{calls++;return {data:{audioContent:'AA=='}}}})},Timestamp:{fromMillis:ms=>({toMillis:()=>ms})}});
 async function request({origin=env.LEXORA_ORIGIN,token='good',method='POST',text='Hello',voice='Charon'}={}){
  const req={method,body:{text,voice},get:name=>({origin,authorization:'Bearer '+token}[name])};
  const res={code:200,set(){return this},status(code){this.code=code;return this},json(body){this.body=body;return this},end(){return this}};await handler(req,res);return res;
 }
 return {request,records,get calls(){return calls}};
}
test('origin, disabled state, token, UID and malformed input deny paid access',async()=>{
 assert.equal((await fixture().request({origin:'https://other.test'})).code,403);
 assert.equal((await fixture({TTS_ENABLED:'false'}).request()).code,503);
 assert.equal((await fixture().request({token:'bad'})).code,401);
 assert.equal((await fixture({TTS_ALLOWED_UIDS:''}).request()).code,403);
 const f=fixture();assert.equal((await f.request({voice:'bad'})).code,400);assert.equal(f.calls,0);
 assert.equal((await f.request({method:'OPTIONS'})).code,204);
});
test('cache hits avoid synthesis and quota reservations; over-budget requests fail',async()=>{
 const f=fixture();assert.equal((await f.request()).code,200);assert.equal(f.calls,1);
 await f.request();assert.equal(f.calls,1);assert.equal(f.records.get('ttsPrivate/budget').daily,5);
 await f.request({text:'World'});assert.equal(f.calls,2);
 assert.equal((await f.request({text:'Third'})).code,429);assert.equal(f.calls,2);
});
