const CACHE="lexora-shell-v25-chirp",FLAGS="lexora-flags",COI="./__lexora_isolated__";const SHELL=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==FLAGS).map(k=>caches.delete(k)))));self.clients.claim()});
// Cross-origin isolation lets the Kokoro voice synthesize on several cores (SharedArrayBuffer). GitHub Pages cannot send
// the headers, so the worker adds them, but only once the page has said so: Google sign-in popups need a non-isolated page.
let isolated=null;
// Only phones need it (computers synthesize on the GPU), and a computer that kept the flag from an earlier version drops it here.
const phone=/iPad|iPhone|iPod|Android/.test(self.navigator.userAgent);
const isolation=()=>phone?(isolated??=caches.open(FLAGS).then(c=>c.match(COI)).then(r=>!!r,()=>false)):Promise.resolve(false);
self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting();if(e.data?.type==="ISOLATION")isolated=null});
function isolate(r){
 if(!r||r.type!=="basic")return r;
 const headers=new Headers(r.headers);headers.set("Cross-Origin-Opener-Policy","same-origin");headers.set("Cross-Origin-Embedder-Policy","require-corp");headers.set("Cross-Origin-Resource-Policy","same-origin");
 return new Response(r.body,{status:r.status,statusText:r.statusText,headers});
}
self.addEventListener("fetch",e=>{
 const req=e.request;if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;
 // App files: always revalidate with GitHub Pages (cheap ETag check) so a new deploy shows up immediately
 // instead of after the browser's 10-minute HTTP cache. Dictionary shards keep their own force-cache mode.
 const fresh=req.cache==="default"?fetch(req.url,{cache:"no-cache",credentials:"same-origin"}):fetch(req);
 const response=fresh.then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(()=>caches.match(req,{ignoreSearch:req.mode==="navigate"}));
 e.respondWith(Promise.all([response,isolation()]).then(([r,on])=>on?isolate(r):r));
});
