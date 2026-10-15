(()=>{'use strict';
const field=document.getElementById('lex-chirp-endpoint'),message=document.getElementById('lex-chirp-setup');
field.value=localStorage.getItem('lexora-chirp-endpoint')||'';
document.getElementById('lex-save-chirp').onclick=()=>{
 try{
  const value=field.value.trim();
  if(value){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Use a plain HTTPS proxy URL');}
  window.lexoraSpeech?.cancel();localStorage.setItem('lexora-chirp-endpoint',value);message.textContent=value?'Narration URL saved. Choose Read & Listen to test.':'Cloud narration disabled; device voice will be used.';
 }catch(error){message.textContent=error.message}
};
})();
