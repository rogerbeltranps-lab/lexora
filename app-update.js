/* Temporary, user-initiated PWA updater. Does not touch IndexedDB or localStorage. */
(()=>{"use strict";
const button=document.getElementById("lex-update-check"),status=document.getElementById("lex-update-status");
if(!button||!status)return;
const VERSION="2026-10-15 · 26";
const FILES=["index.html","narration.js","firebase-sync.js","book-sync.js","dictionary.js","speech.js","reader-selection.js","reader-keys.js","app-update.js","audio-check.js","sw.js","manifest.webmanifest"];
// Show which version is running, so it is clear whether an update arrived.
status.textContent="Versió instal·lada: "+VERSION+". "+status.textContent;
button.addEventListener("click",async()=>{
 button.disabled=true;button.textContent="Actualitzant…";status.textContent="Comprovant els fitxers nous…";
 try{
  // Fetch fresh application shell before navigating. No persistent user data is deleted.
  const base=new URL("./",location.href);
  const target=new URL("index.html",base);
  target.searchParams.set("update",String(Date.now()));
  const response=await fetch(target.href,{cache:"no-store"});
  if(!response.ok)throw Error("Servidor HTTP "+response.status);
  // Refresh the browser's HTTP cache for every app file, not only index.html.
  await Promise.all(FILES.map(f=>fetch(new URL(f,base).href,{cache:"reload"}).catch(()=>null)));
  if("serviceWorker"in navigator){
   const registration=await navigator.serviceWorker.getRegistration(base.href);
   if(registration){
    await registration.update();
    if(registration.waiting)registration.waiting.postMessage({type:"SKIP_WAITING"});
   }
  }
  // Only clear Lexora's application-shell Cache Storage entries, never personal data.
  if("caches"in window){
   const keys=await caches.keys();
   await Promise.all(keys.filter(k=>k.startsWith("lexora-shell-")).map(k=>caches.delete(k)));
  }
  status.textContent="Versió comprovada. Obrint Lexora actualitzada…";
  location.replace(target.href);
 }catch(e){
  status.textContent="No s'ha pogut actualitzar. Comprova la connexió i torna-ho a provar. ("+String(e.message||e)+")";
  button.textContent="Torna-ho a provar";button.disabled=false;
 }
});
})();