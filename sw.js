const CACHE="lexora-shell-v43",SHELL=["./","./index.html","./manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(k.startsWith("lexora-shell-")||k==="lexora-flags")).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",e=>{
 const req=e.request;if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;
 const fresh=req.cache==="default"?fetch(req.url,{cache:"no-cache",credentials:"same-origin"}):fetch(req);
 e.respondWith(fresh.then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(()=>caches.match(req,{ignoreSearch:req.mode==="navigate"})));
});
