/* Tela inicial: casal no sofá, TV com recadinhos, ofensiva, alerta, nível de amor e toca-discos */

Views.inicio = (() => {
  let tvTimer = null, tvIdx = 0;

  const eu = () => Local.get().eu || 'A';
  const outro = p => (p === 'A' ? 'B' : 'A');

  function frasesTV() {
    const e = Store.get(), h = U.hoje();
    const hoje = e.mensagens.filter(m => m.data === h);
    if (hoje.length) return hoje.map(m => ({ texto: m.texto, autor: `de ${Store.nome(m.autor)} para ${Store.nome(outro(m.autor))}` }));
    const antigas = e.mensagens.slice(-3).reverse().map(m => ({ texto: m.texto, autor: `${Store.nome(m.autor)} • ${U.dataCurta(m.data)}` }));
    return [{ texto: 'Nenhum recadinho hoje ainda… toque na TV para escrever 💌', autor: 'canal do amor' }, ...antigas];
  }

  function prioridadesAtivas() { return Store.get().prioridades.filter(p => !p.feito); }
  function totalAlertas() { return prioridadesAtivas().length + Contas.alertas().length; }

  function resumoHoje() {
    const e = Store.get(), h = U.hoje();
    const tarefasHoje = e.tarefas.dias[h] || [];
    const tp = p => { const l = tarefasHoje.filter(t => t.pessoa === p); return `${l.filter(t => t.feito).length}/${l.length}`; };
    const pend = e.mercado.filter(i => !i.comprado).length;
    const proxContas = Contas.doMes(U.mesAtual()).filter(c => !c.pago).slice(0, 3);
    const eventos = Agenda.proximos(14).slice(0, 3);
    const juntos = e.casal.desde ? U.difDias(e.casal.desde, h) : null;
    return `
    <div class="cards-resumo">
      <a class="card-resumo" href="#tarefas"><span class="cr-icone">🧹</span><div><h4>Tarefas de hoje</h4>
        <p><span class="tag a">${U.esc(e.casal.A)} ${tp('A')}</span> <span class="tag b">${U.esc(e.casal.B)} ${tp('B')}</span></p></div></a>
      <a class="card-resumo" href="#mercado"><span class="cr-icone">🛒</span><div><h4>Mercado</h4>
        <p>${pend ? `<b>${pend}</b> ${pend === 1 ? 'item pendente' : 'itens pendentes'}` : 'Lista zerada ✨'}</p></div></a>
      <a class="card-resumo" href="#contas"><span class="cr-icone">💸</span><div><h4>Próximas contas</h4>
        ${proxContas.length ? proxContas.map(c => `<p class="linha-mini">${c.situacao.emoji} dia ${c.dia} · ${U.esc(c.nome)} · <b>${U.money(c.valorMes)}</b></p>`).join('') : '<p>Tudo pago este mês 🎉</p>'}</div></a>
      <a class="card-resumo" href="#agenda"><span class="cr-icone">📅</span><div><h4>Próximos dias</h4>
        ${eventos.length ? eventos.map(o => `<p class="linha-mini">${Agenda.TIPOS[o.ev.tipo]?.icone || '📌'} ${U.dataCurta(o.data)} · ${U.esc(o.ev.titulo)}</p>`).join('') : '<p>Agenda livre nas próximas 2 semanas</p>'}</div></a>
      ${juntos !== null && juntos >= 0 ? `<div class="card-resumo destaque"><span class="cr-icone">💞</span><div><h4>Juntos há</h4><p><b>${juntos.toLocaleString('pt-BR')}</b> dias</p></div></div>` : ''}
    </div>`;
  }

  function render(el) {
    const n = Store.streak();
    const ativoHoje = Store.get().diasAtivos.includes(U.hoje());
    const alertas = totalAlertas();
    const e = Store.get();
    const cena = Cena.svg(), t = cena.tela;
    const nv = Amor.nivel(), med = Amor.medidor();
    const faixa = Cena.casa().musica?.faixa;
    const pendente = Musica.pendente() && !Musica.atual();
    const p = eu();
    el.innerHTML = `
    <section class="inicio">
      <div class="cena">
        ${cena.svg}
        <button class="ponto-clique" id="hsPlanta" style="left:1%;top:34%;width:14%;height:35%" aria-label="Regar a planta"></button>
        <button class="ponto-clique" id="hsDisco" style="left:77.5%;top:45%;width:12.5%;height:24%" aria-label="Toca-discos"></button>
        <button class="ponto-clique" id="hsAmor" style="left:5%;top:9%;width:13.5%;height:22%" aria-label="Nível de amor"></button>
        <button class="ponto-clique" id="hsA" style="left:36.25%;top:50%;width:10%;height:16%" aria-label="${U.esc(e.casal.A)}"></button>
        <button class="ponto-clique" id="hsB" style="left:53.75%;top:50%;width:10%;height:16%" aria-label="${U.esc(e.casal.B)}"></button>
        <span class="nivel-tag">Nv ${nv.n} · ${med}%</span>
        <button class="tv-tela ${Cena.casa().tv.estilo}" id="tvTela" aria-label="Recadinhos do dia na TV" style="left:${t.x / 1.6}%;top:${t.y}%;width:${t.w / 1.6}%;height:${t.h}%">
          <span class="tv-msg"></span><span class="tv-autor"></span>
        </button>
        ${cena.topo}
        <button class="ofensiva ${ativoHoje ? '' : 'apagada'}" id="ofensiva" aria-label="Dias seguidos usando o app">
          <span class="fogo">❤️‍🔥</span><b>${n}</b><small>${n === 1 ? 'dia' : 'dias'}</small>
        </button>
        <button class="alerta ${alertas ? 'piscando' : 'calmo'}" id="alerta" aria-label="Prioridades do dia">
          <svg viewBox="0 0 16 15" shape-rendering="crispEdges"><path d="M7 0h2v1h1v2h1v2h1v2h1v2h1v2h1v3H0v-3h1V9h1V7h1V5h1V3h1V1h1z" fill="#1E1E1E"/><path d="M7 2h2v2h1v2h1v2h1v2h1v2h1v1H2v-1h1v-2h1V8h1V6h1V4h1z" fill="${alertas ? '#FF3B3B' : '#9BD9B0'}"/><rect x="7" y="5" width="2" height="4" fill="#fff"/><rect x="7" y="10" width="2" height="2" fill="#fff"/></svg>
          ${alertas ? `<span class="badge">${alertas}</span>` : ''}
        </button>
        <div class="nomes-sofa"><span class="tag a">${U.esc(e.casal.A)}</span><span class="tag b">${U.esc(e.casal.B)}</span></div>
        <div class="cena-botoes">
          <button class="chip-cena" id="btnDecorar">${Pixel.icone('pincel')} Decorar</button>
          ${faixa ? `<button class="chip-cena ${pendente ? 'pisca-suave' : ''}" id="btnSom">${Musica.atual() ? (Musica.mudo() ? '🔇' : '🎵') : '▶'} ${U.esc(Musica.FAIXAS[faixa]?.nome || '')}${pendente ? ' · toque para ouvir' : ''}</button>` : ''}
        </div>
      </div>
      <p class="dica-cena">Toque em você para agir, no seu amor para dar um beijinho, na planta para regar e no toca-discos para escolher a música.</p>
      ${resumoHoje()}
    </section>`;

    U.$('#tvTela', el).onclick = abrirMensagens;
    U.$('#alerta', el).onclick = abrirPrioridades;
    U.$('#ofensiva', el).onclick = abrirOfensiva;
    U.$('#hsAmor', el).onclick = Amor.abrir;
    U.$('#hsPlanta', el).onclick = regar;
    U.$('#hsDisco', el).onclick = abrirDiscos;
    U.$('#btnDecorar', el).onclick = () => Decorar.abrir();
    U.$('#hs' + p, el).onclick = ev => menuAcoes(ev);
    U.$('#hs' + outro(p), el).onclick = beijar;
    const som = U.$('#btnSom', el);
    if (som) som.onclick = () => {
      if (Musica.atual()) { Musica.setMudo(!Musica.mudo()); App.render(); }
      else if (faixa) { Musica.setMudo(false); Musica.tocar(faixa); }
    };
    mostrarFrase(false);
    clearInterval(tvTimer);
    tvTimer = setInterval(() => mostrarFrase(true), 5500);
  }

  function mostrarFrase(trocar) {
    const tela = U.$('#tvTela'); if (!tela) return;
    const frases = frasesTV();
    if (trocar) tvIdx++;
    const f = frases[tvIdx % frases.length];
    const aplicar = () => { U.$('.tv-msg', tela).textContent = f.texto; U.$('.tv-autor', tela).textContent = f.autor ? '— ' + f.autor : ''; };
    if (trocar && frases.length > 1) {
      tela.classList.add('chiado');
      setTimeout(() => { aplicar(); tela.classList.remove('chiado'); }, 350);
    } else aplicar();
  }

  /* ---------- Ações dos personagens ---------- */
  async function regar() {
    const p = eu();
    if (!(await Cena.regar(p))) return;
    let ganhou = 0;
    Store.atualizar(s => {
      s.casa = { ...CASA_PADRAO(), ...(s.casa || {}) };
      s.casa.planta = U.hoje();
      const d = Amor.dia(s);
      if (!d.rega[p]) { d.rega[p] = 1; ganhou = Amor.somar(s, 10, 'rega'); }
    });
    U.toast(ganhou ? '🪴 Plantinha regada! +10 de amor' : '🪴 Plantinha regada de novo. Ela agradece!');
  }

  async function beijar() {
    const p = eu();
    if (!(await Cena.beijar(p))) return;
    let ganhou = 0;
    Store.atualizar(s => {
      const d = Amor.dia(s);
      d.beijos[p] = (d.beijos[p] || 0) + 1;
      if (d.beijos[p] <= 6) ganhou = Amor.somar(s, 6, 'beijo');
    });
    Nativo.avisar('beijo');
    U.toast(ganhou ? `💋 Beijinho em ${U.esc(Store.nome(outro(p)))}! +6 de amor` : '💋 Beijinho dado! (os pontos de beijo de hoje já acabaram)');
  }

  function menuAcoes(ev) {
    U.$$('.popover').forEach(x => x.remove());
    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.innerHTML = `<small>O que ${U.esc(Store.nome(eu()))} vai fazer?</small>
      <button class="btn mini" data-a="beijo">💋 Dar um beijinho</button>
      <button class="btn mini" data-a="regar">🪴 Regar a planta</button>
      <button class="btn mini" data-a="musica">🎵 Escolher música</button>
      <button class="btn mini" data-a="decorar">🎨 Mudar meu visual</button>`;
    pop.style.left = Math.min(ev.clientX, innerWidth - 200) + 'px';
    pop.style.top = Math.min(ev.clientY + 10, innerHeight - 220) + 'px';
    document.body.appendChild(pop);
    const fechar = () => { pop.remove(); document.removeEventListener('pointerdown', fora); };
    const fora = e2 => { if (!pop.contains(e2.target)) fechar(); };
    setTimeout(() => document.addEventListener('pointerdown', fora), 0);
    U.$$('[data-a]', pop).forEach(b => b.onclick = () => {
      fechar();
      ({ beijo: beijar, regar, musica: abrirDiscos, decorar: () => Decorar.abrir(eu()) })[b.dataset.a]();
    });
  }

  /* ---------- Toca-discos ---------- */
  function abrirDiscos() {
    const m = U.modal({ titulo: '🎵 Toca-discos', aoAbrir: mm => desenhar(mm) });
    function desenhar(mm) {
      const c = Cena.casa(), votos = c.votos || {}, atual = c.musica?.faixa;
      const nota = id => { const v = votos[id] || {}; return (v.A || 0) + (v.B || 0); };
      const lista = Object.entries(Musica.FAIXAS).sort((a, b) => nota(b[0]) - nota(a[0]));
      mm.render(`
        <p class="dica">Escolha um disco: seu boneco vai até o toca-discos e a música fica tocando para vocês dois sempre que entrarem.</p>
        <ul class="discos">
          ${lista.map(([id, f]) => {
            const v = votos[id] || {}, meu = v[eu()] || 0;
            return `<li class="${id === atual ? 'atual' : ''}">
              <span class="capa" style="background:${f.capa}"><i></i></span>
              <div class="disco-info"><b>${U.esc(f.nome)}</b><small>${f.estilo}${id === atual ? ` · tocando agora` : ''}</small>
                <small class="votos">${['A', 'B'].map(q => v[q] ? `${v[q] > 0 ? '👍' : '👎'} ${U.esc(Store.nome(q))}` : '').filter(Boolean).join(' · ')}</small></div>
              <button class="btn-icone ${meu > 0 ? 'votado' : ''}" data-voto="${id}" data-v="1" aria-label="Gostei">👍</button>
              <button class="btn-icone ${meu < 0 ? 'votado' : ''}" data-voto="${id}" data-v="-1" aria-label="Não gostei">👎</button>
              <button class="btn mini ${id === atual ? '' : 'primario'}" data-tocar="${id}">${id === atual && Musica.atual() ? '■ Parar' : '▶ Tocar'}</button>
            </li>`;
          }).join('')}
        </ul>
        <label class="volume">🔈 Volume (só neste aparelho)<input type="range" min="0" max="1" step="0.05" value="${Musica.volume()}" id="vol"></label>`);
      U.$('#vol', mm.el).oninput = ev => Musica.setVolume(+ev.target.value);
      U.$$('[data-voto]', mm.el).forEach(b => b.onclick = () => {
        const id = b.dataset.voto, v = +b.dataset.v, q = eu();
        Store.atualizar(s => {
          s.casa = { ...CASA_PADRAO(), ...(s.casa || {}) };
          const vv = (s.casa.votos[id] = s.casa.votos[id] || {});
          if (vv[q] === v) delete vv[q]; else vv[q] = v;
        }, { registrar: false });
        desenhar(mm);
      });
      U.$$('[data-tocar]', mm.el).forEach(b => b.onclick = async () => {
        const id = b.dataset.tocar;
        if (id === atual && Musica.atual()) {
          Musica.parar();
          Store.atualizar(s => { s.casa = { ...CASA_PADRAO(), ...(s.casa || {}) }; s.casa.musica = { faixa: null }; }, { registrar: false });
          return desenhar(mm);
        }
        mm.fechar();
        Musica.setMudo(false);
        Musica.tocar(id);
        if (location.hash.slice(1) === 'inicio' || !location.hash) await Cena.irAoTocaDiscos(eu());
        Store.atualizar(s => {
          s.casa = { ...CASA_PADRAO(), ...(s.casa || {}) };
          s.casa.musica = { faixa: id, por: eu(), em: Date.now() };
          const d = Amor.dia(s);
          if (!d.motivos.musica) Amor.somar(s, 3, 'musica');
        });
        U.toast(`🎵 Tocando "${U.esc(Musica.FAIXAS[id].nome)}"`);
      });
    }
    return m;
  }

  /* ---------- Recadinhos ---------- */
  function abrirMensagens() {
    let autor = eu();
    U.modal({
      titulo: '📺 Recadinhos do dia',
      aoAbrir: m => {
        const desenhar = () => {
          const e = Store.get(), h = U.hoje();
          const hoje = e.mensagens.filter(x => x.data === h);
          const anteriores = e.mensagens.filter(x => x.data !== h).slice(-30).reverse();
          m.render(`
            <form class="form-msg">
              <div class="segmentado">
                ${['A', 'B'].map(p => `<button type="button" data-autor="${p}" class="${autor === p ? 'ativo' : ''}">${U.esc(Store.nome(p))} escreve</button>`).join('')}
              </div>
              <textarea name="texto" maxlength="160" rows="3" placeholder="Escreva algo fofo para ${U.esc(Store.nome(outro(autor)))}…" autofocus required></textarea>
              <button class="btn primario">Enviar para a TV 💌</button>
            </form>
            <h3 class="sub">Hoje</h3>
            ${hoje.length ? hoje.map(x => itemMsg(x, true)).join('') : '<p class="vazio">Ainda nada por hoje.</p>'}
            ${anteriores.length ? `<h3 class="sub">Dias anteriores</h3>${anteriores.map(x => itemMsg(x, false)).join('')}` : ''}
          `);
          U.$$('[data-autor]', m.el).forEach(b => b.onclick = () => { autor = b.dataset.autor; desenhar(); });
          U.$('form', m.el).onsubmit = ev => {
            ev.preventDefault();
            const texto = ev.target.texto.value.trim(); if (!texto) return;
            Store.atualizar(s => { s.mensagens.push({ id: U.uid(), data: U.hoje(), autor, texto, criado: Date.now() }); Amor.somar(s, 12, 'recado'); });
            Nativo.avisar('recado', texto);
            tvIdx = Store.get().mensagens.filter(x => x.data === U.hoje()).length - 1;
            mostrarFrase(false);
            const r = ev.target.getBoundingClientRect(); U.coracoes(r.left + r.width / 2, r.top);
            desenhar();
          };
          U.$$('[data-apagar-msg]', m.el).forEach(b => b.onclick = () => {
            Store.atualizar(s => { s.mensagens = s.mensagens.filter(x => x.id !== b.dataset.apagarMsg); }, { registrar: false });
            desenhar();
          });
        };
        desenhar();
      },
    });
  }
  const itemMsg = (x, apagar) => `
    <div class="msg ${x.autor === 'A' ? 'a' : 'b'}">
      <div><p>${U.esc(x.texto)}</p><small>${U.esc(Store.nome(x.autor))} · ${U.dataCurta(x.data)}</small></div>
      ${apagar ? `<button class="btn-icone" data-apagar-msg="${x.id}" aria-label="Apagar">🗑️</button>` : ''}
    </div>`;

  /* ---------- Prioridades ---------- */
  function abrirPrioridades() {
    U.modal({
      titulo: '🚨 Prioridades do dia',
      aoAbrir: m => {
        const desenhar = () => {
          const e = Store.get(), h = U.hoje();
          const ativas = prioridadesAtivas();
          const feitasHoje = e.prioridades.filter(p => p.feito && p.feitoEm === h);
          const contas = Contas.alertas();
          m.render(`
            <form class="linha-form"><input name="texto" placeholder="O que é prioridade hoje?" maxlength="120" autofocus required>
              <button class="btn primario">Adicionar</button></form>
            <ul class="lista-check">
              ${ativas.map(p => `<li><label><input type="checkbox" data-feito="${p.id}"><span>${U.esc(p.texto)}</span></label>
                ${p.criado !== h ? `<small class="tag aviso">desde ${U.dataCurta(p.criado)}</small>` : ''}
                <button class="btn-icone" data-apagar="${p.id}" aria-label="Apagar">✕</button></li>`).join('')}
            </ul>
            ${!ativas.length ? '<p class="vazio">Nenhuma prioridade pendente. Que dia tranquilo! 🌿</p>' : ''}
            ${contas.length ? `<h3 class="sub">💸 Contas vencendo</h3><ul class="lista-check">
              ${contas.map(c => `<li><label><input type="checkbox" data-pagar="${c.id}" data-mes="${c.mes}"><span>${U.esc(c.nome)} — <b>${U.money(c.valorMes)}</b></span></label>
                <small class="tag ${c.situacao.classe}">${c.situacao.texto}</small><small class="tag ${c.responsavel.toLowerCase()}">${U.esc(Store.nome(c.responsavel))}</small></li>`).join('')}
            </ul><p class="dica">Marcar aqui dá baixa na aba Contas e no relatório financeiro.</p>` : ''}
            ${feitasHoje.length ? `<h3 class="sub">Concluídas hoje ✔️</h3><ul class="lista-check feitas">
              ${feitasHoje.map(p => `<li><label><input type="checkbox" checked data-desfazer="${p.id}"><span>${U.esc(p.texto)}</span></label></li>`).join('')}</ul>` : ''}
          `);
          U.$('form', m.el).onsubmit = ev => {
            ev.preventDefault();
            const texto = ev.target.texto.value.trim(); if (!texto) return;
            Store.atualizar(s => s.prioridades.push({ id: U.uid(), texto, criado: U.hoje(), feito: false, autor: eu() }));
            Nativo.avisar('prioridade', texto);
            desenhar(); U.$('input[name=texto]', m.el).focus();
          };
          U.$$('[data-feito]', m.el).forEach(c => c.onchange = () => {
            const li = c.closest('li'); li.classList.add('saindo');
            const r = c.getBoundingClientRect(); U.coracoes(r.left, r.top, 5);
            setTimeout(() => {
              Store.atualizar(s => {
                const p = s.prioridades.find(x => x.id === c.dataset.feito); p.feito = true; p.feitoEm = U.hoje();
                Amor.somar(s, 8, 'prioridade');
                const limite = U.addDias(U.hoje(), -30);
                s.prioridades = s.prioridades.filter(x => !x.feito || x.feitoEm >= limite);
              });
              desenhar();
            }, 380);
          });
          U.$$('[data-desfazer]', m.el).forEach(c => c.onchange = () => {
            Store.atualizar(s => { const p = s.prioridades.find(x => x.id === c.dataset.desfazer); p.feito = false; delete p.feitoEm; Amor.somar(s, -8, 'prioridade'); });
            desenhar();
          });
          U.$$('[data-apagar]', m.el).forEach(b => b.onclick = () => {
            Store.atualizar(s => { s.prioridades = s.prioridades.filter(x => x.id !== b.dataset.apagar); }, { registrar: false });
            desenhar();
          });
          U.$$('[data-pagar]', m.el).forEach(c => c.onchange = () => {
            Contas.marcarPago(c.dataset.pagar, c.dataset.mes, true);
            U.toast('💸 Conta paga! Atualizado em Contas e Finanças.');
            desenhar();
          });
        };
        desenhar();
      },
    });
  }

  /* ---------- Ofensiva ---------- */
  function abrirOfensiva() {
    const e = Store.get(), set = new Set(e.diasAtivos), h = U.hoje();
    const n = Store.streak();
    // últimas 5 semanas, começando no domingo
    let ini = U.addDias(h, -28); ini = U.addDias(ini, -U.parse(ini).getDay());
    const dias = [];
    for (let d = ini; d <= U.addDias(h, 6 - U.parse(h).getDay()); d = U.addDias(d, 1)) dias.push(d);
    let recorde = 0, atual = 0;
    [...set].sort().forEach((d, i, arr) => { atual = i && U.difDias(arr[i - 1], d) === 1 ? atual + 1 : 1; recorde = Math.max(recorde, atual); });
    U.modal({
      titulo: '❤️‍🔥 Ofensiva do casal',
      corpo: `
        <div class="ofensiva-grande ${set.has(h) ? '' : 'apagada'}"><span>❤️‍🔥</span><b>${n}</b><p>${n === 1 ? 'dia seguido' : 'dias seguidos'}</p></div>
        <p class="centro">${set.has(h) ? 'Vocês já registraram algo hoje. Mandaram bem! 💚' : 'Registrem qualquer coisa hoje (um recado, uma tarefa, um item…) para manter a ofensiva!'}</p>
        <div class="cal-ofensiva">
          ${SEMANA_LETRA.map(l => `<span class="cab">${l}</span>`).join('')}
          ${dias.map(d => `<span class="${set.has(d) ? 'on' : ''} ${d === h ? 'hoje' : ''} ${d > h ? 'futuro' : ''}">${U.parse(d).getDate()}</span>`).join('')}
        </div>
        <div class="stats-linha"><div><b>${set.size}</b><small>dias usando o app</small></div><div><b>${recorde}</b><small>maior ofensiva</small></div></div>`,
    });
  }

  return { render, sair: () => clearInterval(tvTimer), totalAlertas, abrirDiscos };
})();
