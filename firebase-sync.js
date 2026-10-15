/* Lexora private, local-first cloud sync: flashcards and reviews here, EPUB books in book-sync.js. */
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {getFirestore,doc,runTransaction,onSnapshot} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import {startBookSync} from "./book-sync.js";
const config={apiKey:"AIzaSyATUuOolgUl0iod1zEIYV1zLbcvbMgrLpc",authDomain:"lexora-2d1f4.firebaseapp.com",projectId:"lexora-2d1f4",appId:"1:38390223406:web:a6f0712a38d7d98a2405bf"};
const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app);
window.lexoraTtsToken=()=>auth.currentUser?.getIdToken();
const provider=new GoogleAuthProvider();
// Always show the account chooser instead of silently reusing a previous Google session.
provider.setCustomParameters({prompt:"select_account"});
const bridge=window.lexoraSyncBridge;
const login=document.getElementById("lex-cloud-login"),logout=document.getElementById("lex-cloud-logout"),syncBtn=document.getElementById("lex-cloud-sync"),status=document.getElementById("lex-cloud-status");
let uid=null,unsubscribe=null,stopBooks=null,busy=false,queued=false,clock=null,ready=false,loginFailure="";
const message=t=>{status.textContent=t};
const booksStatus=document.getElementById("lex-cloud-books");
const booksMessage=t=>{if(booksStatus)booksStatus.textContent=t};
// Header badge, so it is visible everywhere whether cards are reaching Firestore.
const badge=document.getElementById("account-label");
const setBadge=t=>{if(badge)badge.textContent=t};
const authState=document.getElementById("lex-cloud-auth-state");
const authMessage=t=>{if(authState)authState.textContent=t};
// Sign-in screen shown at launch until the person signs in or chooses local-only mode for this session.
const gate=document.getElementById("lex-login-gate"),gateLogin=document.getElementById("lex-gate-login"),gateError=document.getElementById("lex-gate-error"),gateSkip=document.getElementById("lex-gate-skip");
const SKIP_KEY="lexora-login-skipped";
const skipped=()=>{try{return sessionStorage.getItem(SKIP_KEY)==="1"}catch{return false}};
function showGate(show){if(gate)gate.hidden=!show;document.documentElement.style.overflow=show?"hidden":""}
function gateMessage(t){if(!gateError)return;gateError.textContent=t||"";gateError.hidden=!t}
// Cross-origin isolation lets the Kokoro voice use several cores, but it breaks the Google sign-in popup. sw.js only isolates
// the app once the person is signed in or chose local mode; it takes effect the next time Lexora opens.
const ISOLATION_CACHE="lexora-flags",ISOLATION_KEY="./__lexora_isolated__",RETRY_KEY="lexora-signin-retry";
async function setIsolation(on){
 try{// Only phones, where Kokoro runs on the slow wasm path, gain from several cores; computers use the GPU and need no isolation.
 if(localStorage.getItem("lexora-narration-engine")!=="kokoro"||localStorage.getItem("lexora-isolation-off")==="1"||!/iPad|iPhone|iPod|Android/.test(navigator.userAgent))on=false;const cache=await caches.open(ISOLATION_CACHE);if(on)await cache.put(ISOLATION_KEY,new Response("1"));else await cache.delete(ISOLATION_KEY);navigator.serviceWorker?.controller?.postMessage({type:"ISOLATION"})}catch{}
}
let retrying=false;
if(gateSkip)gateSkip.onclick=()=>{try{sessionStorage.setItem(SKIP_KEY,"1")}catch{}retrying=false;showGate(false);setIsolation(true)};
const validCard=c=>c&&typeof c.id==="string"&&typeof c.term==="string"&&typeof c.definition==="string";
const timestamp=c=>Date.parse(c?.modifiedAt||"")||0;
function merge(local,remote){
 const map=new Map();
 for(const card of Array.isArray(remote?.cards)?remote.cards:[])if(validCard(card))map.set(card.id,card);
 for(const card of Array.isArray(local?.cards)?local.cards:[])if(validCard(card)){
  const previous=map.get(card.id);
  // For a legacy card without edit timestamps, keep local data when in doubt.
  if(!previous||timestamp(card)>=timestamp(previous))map.set(card.id,card);
 }
 const reviews={...(remote?.reviews||{})};
 for(const [id,review] of Object.entries(local?.reviews||{})){
  const previous=reviews[id],t=v=>Date.parse(v?.updatedAt||"")||0;
  if(!previous||t(review)>=t(previous))reviews[id]=review;
 }
 return {cards:[...map.values()],reviews};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
async function synchronize(){
 if(!uid||!bridge)return;
 if(busy){queued=true;return}
 busy=true;message("Firestore: sincronitzant...");setBadge("☁ Sincronitzant…");
 const currentUid=uid;
 try{
  const reference=doc(db,"users",currentUid,"state","lexora");
  // Transaction ensures we never replace the remote collection with only one device's cards.
  const result=await runTransaction(db,async tx=>{
   const remoteSnap=await tx.get(reference);
   const local=bridge.read();
   const merged=merge(local,remoteSnap.exists()?remoteSnap.data():null);
   tx.set(reference,{...merged,updatedAt:new Date().toISOString()});
   return merged;
  });
  if(uid===currentUid){bridge.apply(result);message("Desat a Firestore · "+result.cards.length+" flashcards · "+new Date().toLocaleTimeString());setBadge("☁ Desat al núvol")}
 }catch(e){
  console.error("Lexora cloud sync",e);
  const code=e.code||e.message;
  const hint=code==="permission-denied"?" Revisa a Firebase → Firestore → Rules que la regla de users/{userId} estigui publicada, i que App Check no estigui en mode «Enforce» per a Firestore.":code==="unavailable"?" Sense connexió; es tornarà a provar quan canviïs alguna targeta.":"";
  message("No s'ha pogut desar a Firestore: "+code+"."+hint+" Les dades locals es conserven.");setBadge("⚠ Sense sincronitzar");
 }
 finally{busy=false;if(queued){queued=false;queueSync()}}
}
function queueSync(){if(!uid||!ready)return;clearTimeout(clock);clock=setTimeout(synchronize,650)}
function authError(e){
 console.error("Lexora Google Sign-In:",e);
 const code=e?.code||"unknown";
 const hints={
  "auth/unauthorized-domain":"Falta autoritzar aquest domini a Firebase Authentication → Settings → Authorized domains.",
  "auth/popup-blocked":"El navegador ha bloquejat la finestra.",
  "auth/popup-closed-by-user":"La finestra de Google s'ha tancat abans de completar l'accés.",
  "auth/operation-not-supported-in-this-environment":"Aquest navegador o mode d'aplicació no permet aquest tipus d'inici de sessió.",
  "auth/network-request-failed":"No s'ha pogut contactar amb Google. Revisa la connexió o els bloquejadors."
 };
 loginFailure="Google Sign-In: "+code+". "+(hints[code]||e?.message||"Obre Lexora en una pestanya normal del navegador.");
 authMessage(loginFailure);gateMessage(code==="auth/popup-closed-by-user"||code==="auth/cancelled-popup-request"?"":loginFailure);
}
async function signIn(button){
 // An isolated page cannot talk to the Google popup: reopen Lexora without isolation, then the next tap signs in.
 if(window.crossOriginIsolated){button.disabled=true;authMessage("Google: preparant l'inici de sessió...");await setIsolation(false);try{sessionStorage.setItem(RETRY_KEY,"1")}catch{}location.reload();return}
 button.disabled=true;loginFailure="";gateMessage("");authMessage("Google: obrint la finestra per identificar-te...");
 try{const result=await signInWithPopup(auth,provider);authMessage("Google: sessió iniciada · "+(result.user.email||"usuari autenticat"))}
 catch(e){
  // Installed iPhone apps and some browsers cannot open popups; fall back to a full-page redirect.
  if(e?.code==="auth/popup-blocked"||e?.code==="auth/operation-not-supported-in-this-environment"){
   authMessage("Google: redirigint...");
   try{await signInWithRedirect(auth,provider);return}catch(r){authError(r)}
  }else authError(e);
 }
 finally{button.disabled=false}
}
login.onclick=()=>signIn(login);
if(gateLogin)gateLogin.onclick=()=>signIn(gateLogin);
// After that reload, show the sign-in screen with the message, wherever the first tap was made.
try{if(sessionStorage.getItem(RETRY_KEY)==="1"){sessionStorage.removeItem(RETRY_KEY);retrying=true;loginFailure="Toca «Inicia sessió amb Google» un altre cop per acabar.";authMessage(loginFailure);gateMessage(loginFailure)}}catch{}
// A redirect sign-in always returns to a non-isolated page; an isolated one cannot load Google's helper frame.
if(!window.crossOriginIsolated)getRedirectResult(auth).then(result=>{if(result?.user)authMessage("Google: sessió iniciada per redirecció · "+(result.user.email||"usuari autenticat"))}).catch(authError);

logout.onclick=async()=>{await signOut(auth);message("Sessió tancada. Les targetes locals es mantenen.")};
syncBtn.onclick=()=>synchronize();
window.addEventListener("lexora:changed",queueSync);
onAuthStateChanged(auth,async user=>{
 if(unsubscribe){unsubscribe();unsubscribe=null}
 if(stopBooks){stopBooks();stopBooks=null}
 uid=user?.uid||null;
 // The reader waits for this before deciding whether a cloud book can be downloaded.
 window.lexoraAuthKnown=true;
 if(user)stopBooks=startBookSync(db,user.uid,booksMessage);else{booksMessage("");dispatchEvent(new Event("lexora:book-cloud"))}
ready=false;showGate(!user&&(retrying||!skipped()));setIsolation(!!user||skipped());clearTimeout(clock);if(user){loginFailure="";authMessage("Google: connectat · "+(user.email||"usuari autenticat"))}else if(!loginFailure){authMessage("Google: sessió no iniciada")}
 login.hidden=!!user;logout.hidden=!user;syncBtn.hidden=!user;
 if(!user){message("Firestore: sense sincronització; les targetes es desen localment.");setBadge("Personal · local mode");return}
 message("Connectat com "+(user.email||"Google")+". Fusionant dades...");
 await synchronize();
 if(!uid||uid!==user.uid)return;
 ready=true;
 const reference=doc(db,"users",uid,"state","lexora");
 unsubscribe=onSnapshot(reference,snap=>{
  if(!snap.exists()||snap.metadata.hasPendingWrites||busy)return;
  const local=bridge.read(),merged=merge(local,snap.data());
  if(!same(local,merged))bridge.apply(merged);
  if(!same(merged,merge(snap.data(),snap.data())))queueSync();
 },err=>message("Error en rebre canvis: "+(err.code||err.message)));
});
