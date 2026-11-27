/* API usada pelo app: registrar o celular e avisar o outro (recado, beijinho, prioridade) */
import { lerCasa, aparelhos, chaveCasa, enviarParaCasa } from './casa.js';
import * as M from './mensagens.js';

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', ...CORS } });

export async function tratar(request, env, rota) {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (request.method !== 'POST') return resposta({ erro: 'use POST' }, 405);
  let b;
  try { b = JSON.parse(await request.text()); } catch (e) { return resposta({ erro: 'json inválido' }, 400); }

  if (rota === 'registrar') {
    const { casa, pessoa, aparelho, token } = b;
    if (!['A', 'B'].includes(pessoa) || !token || !aparelho) return resposta({ erro: 'dados incompletos' }, 400);
    if (!(await lerCasa(env, casa))) return resposta({ erro: 'casa não encontrada' }, 404);
    const reg = await aparelhos(env, casa);
    reg.aparelhos[String(aparelho).slice(0, 64)] = { token: String(token).slice(0, 400), pessoa, em: Date.now() };
    await env.CANTINHO.put(chaveCasa(casa), JSON.stringify(reg));
    return resposta({ ok: true });
  }

  if (rota === 'avisar') {
    const { casa, de, tipo, texto } = b;
    if (!['A', 'B'].includes(de) || !['recado', 'beijo', 'prioridade'].includes(tipo)) return resposta({ erro: 'dados inválidos' }, 400);
    // limite simples contra exagero: 120 avisos por hora por casa
    const hora = 'lim:' + casa + ':' + new Date().toISOString().slice(0, 13);
    const usados = Number(await env.CANTINHO.get(hora)) || 0;
    if (usados >= 120) return resposta({ erro: 'muitos avisos, tente mais tarde' }, 429);
    const e = await lerCasa(env, casa);
    if (!e) return resposta({ erro: 'casa não encontrada' }, 404);
    await env.CANTINHO.put(hora, String(usados + 1), { expirationTtl: 7200 });
    const nomeDe = (de === 'A' ? e.casal?.A : e.casal?.B) || 'Seu amor';
    const msg = tipo === 'recado' ? M.recado(nomeDe, texto) : tipo === 'beijo' ? M.beijo(nomeDe) : M.prioridade(nomeDe, texto);
    const enviados = await enviarParaCasa(env, casa, msg, de === 'A' ? 'B' : 'A');
    return resposta({ ok: true, enviados });
  }

  return resposta({ erro: 'rota desconhecida' }, 404);
}
