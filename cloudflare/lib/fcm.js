/* Envio de notificações pelo Firebase Cloud Messaging (grátis), assinando com a chave de serviço */

let cache = null;
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlTexto = s => b64url(new TextEncoder().encode(s));

async function tokenDeAcesso(sa) {
  if (cache && cache.expira > Date.now() + 60000) return cache.token;
  const agora = Math.floor(Date.now() / 1000);
  const cab = b64urlTexto(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const corpo = b64urlTexto(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600,
  }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const chave = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const assinatura = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chave, new TextEncoder().encode(cab + '.' + corpo));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + cab + '.' + corpo + '.' + b64url(assinatura),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Google recusou a chave de serviço: ' + JSON.stringify(j));
  cache = { token: j.access_token, expira: Date.now() + (j.expires_in || 3600) * 1000 };
  return cache.token;
}

/** Manda uma mensagem de dados (o app mostra a notificação com o som do tipo). Devolve 'ok', 'invalido' ou 'erro'. */
export async function enviarFCM(env, token, dados) {
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const acesso = await tokenDeAcesso(sa);
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: 'POST',
    headers: { authorization: 'Bearer ' + acesso, 'content-type': 'application/json' },
    body: JSON.stringify({ message: { token, data: dados, android: { priority: 'high', ttl: '86400s' } } }),
  });
  if (r.ok) return 'ok';
  const t = await r.text();
  return r.status === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(t) ? 'invalido' : 'erro';
}
