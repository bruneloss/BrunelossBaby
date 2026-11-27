/* Lembretes agendados: 9h (contas e agenda) e 20h30 (ofensiva em risco), horário de Brasília */
import { lerCasa, enviarParaCasa } from './casa.js';
import * as M from './mensagens.js';

const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const brasilia = (dias = 0) => new Date(Date.now() - 3 * 3600e3 + dias * 86400e3);
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const diasNoMes = ym => { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
const nome = (e, p) => p === 'A' ? e.casal?.A : p === 'B' ? e.casal?.B : 'vocês dois';

// mesmas regras do app (aba Contas)
const ativaNoMes = (c, ym) => c.recorrencia === 'unica' ? c.mes === ym : (c.mes || '0000-00') <= ym && (!c.fim || ym <= c.fim);
function contasDoDia(e, data) {
  const ym = data.slice(0, 7);
  return (e.contas || []).filter(c => ativaNoMes(c, ym) && !(c.pagamentos || {})[ym]
    && `${ym}-${pad(Math.min(c.dia, diasNoMes(ym)))}` === data)
    .map(c => ({ ...c, valor: (c.valores || {})[ym] ?? c.valor }));
}

// mesmas regras do app (aba Agenda)
function bate(ev, d) {
  if (d < ev.data || (ev.ate && d > ev.ate)) return false;
  const dt = parse(d), ini = parse(ev.data);
  switch (ev.repetir) {
    case 'diario': return true;
    case 'semanal': return (ev.dias && ev.dias.length ? ev.dias : [ini.getUTCDay()]).includes(dt.getUTCDay());
    case 'mensal': return dt.getUTCDate() === ini.getUTCDate();
    case 'anual': return dt.getUTCDate() === ini.getUTCDate() && dt.getUTCMonth() === ini.getUTCMonth();
    default: return d === ev.data;
  }
}

function ofensiva(e, hoje) {
  const set = new Set(e.diasAtivos || []);
  let d = set.has(hoje) ? hoje : ymd(new Date(parse(hoje).getTime() - 86400e3)), n = 0;
  while (set.has(d)) { n++; d = ymd(new Date(parse(d).getTime() - 86400e3)); }
  return { dias: n, ativoHoje: set.has(hoje) };
}

/** Evita mandar o mesmo lembrete duas vezes no dia. */
async function umaVez(env, chave, fn) {
  if (await env.CANTINHO.get(chave)) return;
  await fn();
  await env.CANTINHO.put(chave, '1', { expirationTtl: 2 * 86400 });
}

export async function rodarLembretes(env, cron) {
  const noite = cron.startsWith('30 23');
  const hoje = ymd(brasilia()), amanha = ymd(brasilia(1));
  let cursor;
  do {
    const lista = await env.CANTINHO.list({ prefix: 'casa:', cursor });
    cursor = lista.list_complete ? null : lista.cursor;
    for (const k of lista.keys) {
      const codigo = k.name.slice(5);
      const e = await lerCasa(env, codigo);
      if (!e) continue;
      if (noite) {
        const o = ofensiva(e, hoje);
        if (o.dias > 0 && !o.ativoHoje) await umaVez(env, `env:${codigo}:ofensiva:${hoje}`, () => enviarParaCasa(env, codigo, M.ofensiva(o.dias)));
        continue;
      }
      for (const [data, quando] of [[hoje, 'hoje'], [amanha, 'amanha']]) {
        for (const c of contasDoDia(e, data)) {
          await umaVez(env, `env:${codigo}:conta:${c.id}:${data}:${quando}`, () => enviarParaCasa(env, codigo, M.conta(c, quando, nome(e, c.responsavel) || 'vocês dois')));
        }
      }
      for (const ev of (e.agenda || []).filter(ev => bate(ev, hoje))) {
        await umaVez(env, `env:${codigo}:agenda:${ev.id}:${hoje}`, () => enviarParaCasa(env, codigo, M.agenda(ev, nome(e, ev.pessoa) || 'vocês dois')));
      }
    }
  } while (cursor);
}
