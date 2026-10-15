import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function setup(){
 const requests=[],nodes=[];let stopped=0;
 class Context {state='running';destination={};resume(){return Promise.resolve()}createBuffer(){return {}}async decodeAudioData(){return {duration:.01}}createBufferSource(){const node={playbackRate:{value:1},connect(){},disconnect(){},start(){if(node.onended)queueMicrotask(()=>node.onended?.())},stop(){stopped++}};nodes.push(node);return node}}
 const window={AudioContext:Context,lexoraTtsToken:async()=>'id-token'};
 const sandbox={window,TextEncoder,Uint8Array,AbortController,atob,setTimeout,clearTimeout,localStorage:{getItem:()=> 'https://example.test/chirp'},fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({audio:'AA=='})}}};
 vm.runInNewContext(readFileSync(new URL('../chirp.js',import.meta.url),'utf8'),sandbox);
 return {api:window.lexoraChirp,requests,nodes,get stopped(){return stopped}};
}
test('gesture unlock, bounded Unicode chunks, cache reuse and voice cache separation',async()=>{
 const {api,requests}=setup();api.unlock();const text='😀'.repeat(300);
 await api.speak(text,{voice:'Kore'});assert.equal(requests.length,2);
 assert.ok(requests.every(r=>Buffer.byteLength(r.text)<=1000));
 await api.speak(text,{voice:'Kore',speed:1.2});assert.equal(requests.length,2);
 await api.speak(text,{voice:'Charon'});assert.equal(requests.length,4);
});
test('cancelled work sends no request and playback requires gesture unlock',async()=>{
 const {api,requests}=setup();await assert.rejects(api.speak('Hello'),/Tap Play/);
 api.unlock();await api.speak('Hello',{cancelled:()=>true});assert.equal(requests.length,0);
});
test('stop aborts pending synthesis without starting stale playback',async()=>{
 const state=setup();state.api.unlock();
 const pending=state.api.speak('Hello',{status:()=>state.api.stop()});
 await pending;assert.equal(state.nodes.length,1);
});
