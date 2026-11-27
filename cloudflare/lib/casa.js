/* Ler a casa no Firestore e os celulares registrados (guardados no KV da Cloudflare) */
import { enviarFCM } from './fcm.js';

export async function lerCasa(env, codigo) {
  if (!/^[A-Za-z0-9_-]{10,80}$/.test(codigo || '')) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/casais/${encodeURIComponent(codigo)}?key=${env.FIREBASE_API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const doc = await r.json();
  try { return JSON.parse(doc.fields.estado.stringValue); } catch (e) { return null; }
}

export const chaveCasa = codigo => 'casa:' + codigo;

export async function aparelhos(env, codigo) {
  return (await env.CANTINHO.get(chaveCasa(codigo), 'json')) || { aparelhos: {} };
}

/** Envia para os celulares da casa (opcional: só de uma pessoa). Remove celulares que desinstalaram. */
export async function enviarParaCasa(env, codigo, dados, soPessoa = null) {
  const reg = await aparelhos(env, codigo);
  let enviados = 0, mudou = false;
  for (const [id, a] of Object.entries(reg.aparelhos)) {
    if (soPessoa && a.pessoa !== soPessoa) continue;
    const r = await enviarFCM(env, a.token, dados);
    if (r === 'ok') enviados++;
    if (r === 'invalido') { delete reg.aparelhos[id]; mudou = true; }
  }
  if (mudou) await env.CANTINHO.put(chaveCasa(codigo), JSON.stringify(reg));
  return enviados;
}
