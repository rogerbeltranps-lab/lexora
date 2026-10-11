/* Lexora private, local-first cloud sync. No EPUB contents are uploaded. */
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,getRedirectResult,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {getFirestore,doc,runTransaction,onSnapshot} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
const config={apiKey:"AIzaSyATUuOolgUl0iod1zEIYV1zLbcvbMgrLpc",authDomain:"lexora-2d1f4.firebaseapp.com",projectId:"lexora-2d1f4",appId:"1:38390223406:web:a6f0712a38d7d98a2405bf"};
const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app);
const provider=new GoogleAuthProvider();
const bridge=window.lexoraSyncBridge;
const login=document.getElementById("lex-cloud-login"),logout=document.getElementById("lex-cloud-logout"),syncBtn=document.getElementById("lex-cloud-sync"),status=document.getElementById("lex-cloud-status");
let uid=null,unsubscribe=null,busy=false,queued=false,clock=null,ready=false,loginFailure="";
const message=t=>{status.textContent=t};
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
 busy=true;message("Sincronitzant...");
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
  if(uid===currentUid){bridge.apply(result);message("Sincronitzat · "+result.cards.length+" flashcards")}
 }catch(e){console.error("Lexora cloud sync",e);message("No s'ha pogut sincronitzar: "+(e.code||e.message)+". Les dades locals es conserven.")}
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
 message(loginFailure);
}
login.onclick=async()=>{
 login.disabled=true;loginFailure="";message("Obrint Google...");
 try{await signInWithPopup(auth,provider)}
 catch(e){authError(e)}
 finally{login.disabled=false}
};
const redirect=document.getElementById("lex-cloud-redirect");
if(redirect)redirect.onclick=async()=>{
 loginFailure="";message("Redirigint a Google…");
 try{await signInWithRedirect(auth,provider)}catch(e){authError(e)}
};
getRedirectResult(auth).catch(authError);

logout.onclick=async()=>{await signOut(auth);message("Sessió tancada. Les targetes locals es mantenen.")};
syncBtn.onclick=()=>synchronize();
window.addEventListener("lexora:changed",queueSync);
onAuthStateChanged(auth,async user=>{
 if(unsubscribe){unsubscribe();unsubscribe=null}
 uid=user?.uid||null;ready=false;clearTimeout(clock);if(user)loginFailure="";
 login.hidden=!!user;logout.hidden=!user;syncBtn.hidden=!user;
 if(!user){message(loginFailure||"Les targetes es desen en aquest dispositiu. Inicia sessió per sincronitzar.");return}
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
