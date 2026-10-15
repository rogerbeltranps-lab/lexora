// Shared validation is deliberately independent of cloud SDKs for offline tests.
export const VOICES = ['Charon','Orus','Aoede','Kore','Leda','Achernar'];
export function validate(body) {
  if (!body || typeof body.text !== 'string' || !body.text.trim() || Buffer.byteLength(body.text, 'utf8') > 1000 || !VOICES.includes(body.voice)) {
    throw Object.assign(new Error('Invalid text or voice'), {status:400});
  }
  return {text:body.text.trim(), voice:`en-US-Chirp3-HD-${body.voice}`};
}
export function reserve(usage, count, dayLimit, monthLimit, now = new Date()) {
  const day = now.toISOString().slice(0,10), month = day.slice(0,7);
  const daily = usage.day === day ? usage.daily : 0;
  const monthly = usage.month === month ? usage.monthly : 0;
  if (!(dayLimit > 0 && monthLimit > 0) || daily + count > dayLimit || monthly + count > monthLimit) {
    throw Object.assign(new Error('Narration character limit reached'), {status:429});
  }
  return {day,month,daily:daily+count,monthly:monthly+count};
}
