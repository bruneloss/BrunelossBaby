/* Nível de amor: cada interação do casal enche o coração do dia e soma pontos para subir de nível */

const Amor = (() => {
  const MOTIVOS = {
    recado: '💌 Recadinhos', tarefa: '🧹 Tarefas', prioridade: '🚨 Prioridades', beijo: '💋 Beijinhos',
    rega: '🪴 Planta regada', musica: '🎵 Música', indicacao: '🎬 Indicações', conta: '💸 Contas pagas',
    mercado: '🛒 Mercado', sonho: '🌈 Passos dos sonhos',
  };
  const NIVEIS = ['Paquera', 'Ficando', 'Namorinho', 'Grudinho', 'Casal fofo', 'Parceiros de vida', 'Almas gêmeas', 'Amor lendário'];
  const POR_NIVEL = 150;
  const META_DIA = 100;

  const dia = (s, d = U.hoje()) => {
    s.amor = s.amor || { total: 0, dias: {} };
    return (s.amor.dias[d] = s.amor.dias[d] || { pts: 0, motivos: {}, beijos: {}, rega: {} });
  };

  /* Use dentro de Store.atualizar. Pontos negativos desfazem (ex.: desmarcar tarefa). */
  function somar(s, pts, motivo) {
    const d = dia(s);
    const antes = d.pts;
    d.pts = Math.max(0, d.pts + pts);
    const real = d.pts - antes;
    d.motivos[motivo] = Math.max(0, (d.motivos[motivo] || 0) + real);
    s.amor.total = Math.max(0, (s.amor.total || 0) + real);
    return real;
  }

  const hoje = () => (Store.get().amor?.dias || {})[U.hoje()] || { pts: 0, motivos: {}, beijos: {}, rega: {} };
  const medidor = () => Math.min(100, Math.round(hoje().pts / META_DIA * 100));
  function nivel() {
    const total = Store.get().amor?.total || 0;
    const n = Math.floor(total / POR_NIVEL) + 1;
    return { n, nome: NIVEIS[Math.min(n - 1, NIVEIS.length - 1)], total, prog: Math.round((total % POR_NIVEL) / POR_NIVEL * 100), falta: POR_NIVEL - (total % POR_NIVEL) };
  }

  function abrir() {
    const nv = nivel(), m = medidor(), h = hoje();
    const dias = [...Array(7)].map((_, i) => U.addDias(U.hoje(), i - 6));
    const pd = d => Math.min(100, Math.round((((Store.get().amor?.dias || {})[d] || {}).pts || 0) / META_DIA * 100));
    U.modal({
      titulo: '💗 Nível de amor',
      corpo: `
        <div class="amor-topo">
          <svg class="amor-coracao" viewBox="0 0 13 11" shape-rendering="crispEdges">${coracaoSVG(m)}</svg>
          <div><small>Nível ${nv.n}</small><h3>${nv.nome}</h3>
            <div class="barra rosa"><i style="width:${nv.prog}%"></i></div>
            <small>${nv.total} pontos de amor · faltam ${nv.falta} para o próximo nível</small></div>
        </div>
        <h3 class="sub">Coração de hoje: ${m}%</h3>
        ${Object.keys(h.motivos).filter(k => h.motivos[k] > 0).length ? `<ul class="lista-amor">${Object.entries(h.motivos).filter(([, v]) => v > 0).map(([k, v]) => `<li><span>${MOTIVOS[k] || k}</span><b>+${v}</b></li>`).join('')}</ul>`
          : '<p class="vazio">Ainda vazio hoje. Mandem um recadinho, deem um beijinho no sofá ou concluam uma tarefa!</p>'}
        <h3 class="sub">Últimos 7 dias</h3>
        <div class="amor-semana">${dias.map(d => `<div><span class="col"><i style="height:${pd(d)}%"></i></span><small>${SEMANA_LETRA[U.parse(d).getDay()]}</small></div>`).join('')}</div>
        <p class="dica">Pontos: recado +12, tarefa ou prioridade +8, beijinho +6 (até 6 por pessoa no dia), regar a planta +10, indicação concluída +12, conta paga +4, passo de sonho +6, música +3.</p>`,
    });
  }

  /* Coração 13x11 que enche de baixo para cima */
  function coracaoSVG(pct) {
    const L = ['..OOO...OOO..', '.OXXXO.OXXXO.', 'OXXXXXOXXXXXO', 'OXXXXXXXXXXXO', 'OXXXXXXXXXXXO', '.OXXXXXXXXXO.',
      '..OXXXXXXXO..', '...OXXXXXO...', '....OXXXO....', '.....OXO.....', '......O......'];
    const cheias = Math.round(pct / 100 * 9); // linhas internas 1..9
    const linhas = L.map((l, y) => l.replace(/X/g, y >= 10 - cheias ? 'P' : 'V'));
    return Pixel.grade(linhas, { O: '#1E1E1E', P: '#FF5C85', V: '#FFE1E9' });
  }

  return { somar, dia, medidor, nivel, abrir, coracaoSVG, MOTIVOS };
})();
