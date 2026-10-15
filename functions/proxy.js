import {createHash} from 'node:crypto';
import {validate, reserve} from './policy.js';
export function createHandler({db,google,verifyToken,Timestamp,env=process.env}) {
 return async (req,res) => {
  const origin = env.LEXORA_ORIGIN;
  res.set('Cache-Control','no-store');
  if (!origin || req.get('origin') !== origin) return res.status(403).json({error:'Origin denied'});
  res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');
  res.set('Access-Control-Allow-Headers','Authorization, Content-Type');res.set('Access-Control-Allow-Methods','POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  try {
    if (env.TTS_ENABLED !== 'true') throw Object.assign(new Error('Cloud narration is disabled'),{status:503});
    const token = req.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    let user;
    try {user = await verifyToken(token || '');} catch {throw Object.assign(new Error('Sign in to use cloud narration'),{status:401});}
    if (!(env.TTS_ALLOWED_UIDS || '').split(',').includes(user.uid)) throw Object.assign(new Error('Cloud narration is not enabled for this account'),{status:403});
    const {text,voice} = validate(req.body);
    const hash = createHash('sha256').update(JSON.stringify([user.uid,voice,text,'MP3-v1'])).digest('hex');
    const clip = db.doc(`ttsClips/${hash}`), cached = await clip.get();
    if (cached.exists && cached.data().expiresAt.toMillis() > Date.now()) return res.json({audio:cached.data().audio});
    // Global atomic reservation survives restarts and concurrent instances. Failures remain charged
    // against the cap because an interrupted Google request may still have been billed. No retries.
    await db.runTransaction(async tx => {
      const ref = db.doc('ttsPrivate/budget'), snap = await tx.get(ref);
      const usage = reserve(snap.data() || {}, Array.from(text).length, Number(env.TTS_DAILY_CHAR_LIMIT), Number(env.TTS_MONTHLY_CHAR_LIMIT));
      tx.set(ref,usage);
    });
    const client = await google.getClient();
    const result = await client.request({url:'https://texttospeech.googleapis.com/v1/text:synthesize',method:'POST',timeout:20000,retry:false,data:{input:{text},voice:{languageCode:'en-US',name:voice},audioConfig:{audioEncoding:'MP3'}}});
    const audio = result.data.audioContent;
    if (typeof audio !== 'string' || !audio.length || audio.length > 700000) throw new Error('Invalid audio response');
    // Cache writes failing must not hide audio already paid for.
    await clip.set({audio,expiresAt:Timestamp.fromMillis(Date.now()+30*86400000)}).catch(()=>{});
    res.json({audio});
  } catch (error) {
    const status = error.status || 502;
    res.status(status).json({error:status===502?'Cloud voice unavailable':error.message});
  }
 };
}
