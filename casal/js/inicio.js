/* Tela inicial: casal pixelado no sofá, TV com recadinhos, ofensiva de dias e alerta de prioridades */

const Pixel = (() => {
  const PAL = {
    O: '#1E1E1E', H: '#3B2A20', h: '#5C4233', S: '#F2C29B', s: '#D9A27C', Y: '#FFD23F', y: '#E5B520',
    R: '#7A3B1E', r: '#A0522D', B: '#FFD23F', W: '#FFFFFF', w: '#E4E4E4', G: '#2E9E5B', g: '#1F7A43',
    L: '#4CC17A', P: '#FF8FA3', K: '#C98A2E',
  };
  const SPRITES = {
    // Pessoa A: cabelo curto, blusa amarela (vista de costas)
    A: [
      '.....OOOOOO.....',
      '...OOHHHHHHOO...',
      '..OHHHhhHHHHHO..',
      '.OHHHhhHHHHHHHO.',
      '.OHHHHHHHHHHHHO.',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OSHHHHHHHHHHHHSO',
      'OSHHHHHHHHHHHHSO',
      '.OsHHHHHHHHHHsO.',
      '..OOHHHHHHHHOO..',
      '....OsSSSSsO....',
      '..OOOsSSSSsOOO..',
      '.OYYYYYYYYYYYYO.',
      'OYYYYYYYYYYYYYYO',
      'OYYYYYYYYYYYYYYO',
      'OyYYYYYYYYYYYYyO',
      'OyYYYYYYYYYYYYyO',
      'OyYYYYYYYYYYYYyO',
    ],
    // Pessoa B: cabelo comprido com lacinho amarelo, blusa branca
    B: [
      '.....OOOOOO.....',
      '...OORRRRRROO...',
      '..ORRRrrRRBRBO..',
      '.ORRRrrRRRRBBRO.',
      '.ORRRRRRRRBRBRO.',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRrRRRRRRrRRRO',
      'ORRRRRRRRRRRRRRO',
      'ORRRRRRRRRRRRRRO',
      'OWRRRRRRRRRRRRWO',
      'OWWRRRRRRRRRRWWO',
      'OWWWRRRRRRRRWWWO',
      'OwWWWRRRRRRWWWwO',
      'OwWWWWRRRRWWWWwO',
      'OwWWWWWRRWWWWWwO',
    ],
    coracao: [
      '.OO.OO.',
      'OPPOPPO',
      'OPPPPPO',
      '.OPPPO.',
      '..OPO..',
      '...O...',
    ],
    coracaoQuadro: [
      '.GG.GG.',
      'GGGGGGG',
      'GGGGGGG',
      '.GGGGG.',
      '..GGG..',
      '...G...',
    ],
  };
  // Converte a grade de caracteres em retângulos SVG (juntando pixels vizinhos da mesma cor)
  function sprite(nome, x0, y0, escala = 1) {
    let out = '';
    SPRITES[nome].forEach((linha, y) => {
      let x = 0;
      while (x < linha.length) {
        const c = linha[x];
        if (c === '.') { x++; continue; }
        let w = 1;
        while (linha[x + w] === c) w++;
        out += `<rect x="${x0 + x * escala}" y="${y0 + y * escala}" width="${w * escala}" height="${escala}" fill="${PAL[c]}"/>`;
        x += w;
      }
    });
    return out;
  }
  return { sprite, PAL };
})();

function cenaSVG() {
  const r = [];
  const R = (x, y, w, h, c, extra = '') => r.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${extra}/>`);
  // caixa com cantos "pixelados" arredondados
  const caixa = (x, y, w, h, borda, cor) => {
    R(x + 2, y, w - 4, h, borda); R(x + 1, y + 1, w - 2, h - 2, borda); R(x, y + 2, w, h - 4, borda);
    R(x + 2, y + 1, w - 4, h - 2, cor); R(x + 1, y + 2, w - 2, h - 4, cor);
  };

  // Parede com listras e piso de madeira amarelinho
  R(0, 0, 160, 72, '#E5F6EB');
  for (let x = 3; x < 160; x += 10) R(x, 0, 4, 68, '#D6EFDF');
  for (let x = 8; x < 160; x += 20) for (let y = 6; y < 66; y += 14) R(x, y, 1, 1, '#FFFFFF');
  R(0, 66, 160, 2, '#FFFFFF'); R(0, 68, 160, 1, '#1E1E1E');
  R(0, 69, 160, 31, '#F6D77A');
  for (let y = 74; y < 100; y += 6) R(0, y, 160, 1, '#E6C155');
  for (let i = 0; i < 8; i++) R((i * 23 + (i % 2) * 9) % 160, 69 + (i % 5) * 6, 1, 5, '#E6C155');

  // Quadro com coração
  caixa(10, 14, 22, 20, '#1E1E1E', '#FFFFFF');
  r.push(Pixel.sprite('coracaoQuadro', 14, 18, 2));
  R(20, 10, 2, 4, '#1E1E1E');

  // Planta
  R(6, 46, 3, 8, '#2E9E5B'); R(10, 42, 3, 12, '#1F7A43'); R(14, 47, 3, 7, '#2E9E5B');
  R(4, 44, 4, 3, '#4CC17A'); R(12, 39, 4, 4, '#4CC17A'); R(15, 45, 4, 3, '#4CC17A');
  caixa(4, 53, 16, 15, '#1E1E1E', '#FFD23F'); R(6, 56, 12, 1, '#E5B520');

  // Luminária com brilho
  r.push('<circle cx="147" cy="34" r="14" fill="#FFD23F" opacity=".22" class="brilho"/>');
  R(146, 34, 2, 34, '#1E1E1E'); R(141, 66, 12, 3, '#1E1E1E');
  R(140, 26, 14, 2, '#1E1E1E'); R(139, 28, 16, 6, '#1E1E1E'); R(141, 28, 12, 5, '#FFD23F'); R(140, 33, 14, 1, '#1E1E1E');

  // Rack da TV
  caixa(44, 52, 72, 16, '#1E1E1E', '#3A3A3A');
  R(47, 56, 31, 9, '#2B2B2B'); R(82, 56, 31, 9, '#2B2B2B');
  R(61, 60, 3, 1, '#FFD23F'); R(96, 60, 3, 1, '#FFD23F');

  // TV retrô com antena
  for (let i = 0; i < 8; i++) { R(72 - i, 8 - i, 1, 1, '#1E1E1E'); R(88 + i, 8 - i, 1, 1, '#1E1E1E'); }
  R(63, 0, 2, 2, '#FFD23F'); R(95, 0, 2, 2, '#FFD23F');
  caixa(42, 8, 76, 44, '#1E1E1E', '#2E9E5B');
  R(45, 11, 70, 38, '#1E1E1E');
  R(46, 12, 68, 36, '#0E2A1A');
  R(108, 49, 2, 2, '#FFD23F'); R(112, 49, 2, 2, '#FF5A5A');
  R(56, 52, 4, 1, '#1E1E1E'); R(100, 52, 4, 1, '#1E1E1E');

  // Casal (de costas) e coraçãozinho
  r.push(`<g class="pessoa-a">${Pixel.sprite('A', 58, 50)}</g>`);
  r.push(`<g class="pessoa-b">${Pixel.sprite('B', 86, 50)}</g>`);
  r.push(`<g class="coracao-bob">${Pixel.sprite('coracao', 77, 57)}</g>`);

  // Sofá (visto de trás)
  R(14, 97, 132, 3, 'rgba(0,0,0,.18)');
  caixa(13, 71, 15, 28, '#1E1E1E', '#2E9E5B'); R(15, 73, 11, 2, '#4CC17A');
  caixa(132, 71, 15, 28, '#1E1E1E', '#2E9E5B'); R(134, 73, 11, 2, '#4CC17A');
  caixa(23, 66, 114, 33, '#1E1E1E', '#3DB56A');
  R(25, 67, 110, 3, '#5FD08A');
  R(52, 71, 1, 26, '#2A8A4F'); R(108, 71, 1, 26, '#2A8A4F');
  [38, 66, 94, 122].forEach(x => R(x, 82, 2, 2, '#2A8A4F'));
  R(20, 98, 4, 2, '#1E1E1E'); R(136, 98, 4, 2, '#1E1E1E');

  return `<svg class="cena-svg" viewBox="0 0 160 100" shape-rendering="crispEdges" aria-hidden="true">${r.join('')}</svg>`;
}

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
    el.innerHTML = `
    <section class="inicio">
      <div class="cena">
        ${cenaSVG()}
        <button class="tv-tela" id="tvTela" aria-label="Recadinhos do dia na TV">
          <span class="tv-msg"></span><span class="tv-autor"></span>
        </button>
        <button class="ofensiva ${ativoHoje ? '' : 'apagada'}" id="ofensiva" aria-label="Dias seguidos usando o app">
          <span class="fogo">🔥</span><b>${n}</b><small>${n === 1 ? 'dia' : 'dias'}</small>
        </button>
        <button class="alerta ${alertas ? 'piscando' : 'calmo'}" id="alerta" aria-label="Prioridades do dia">
          <svg viewBox="0 0 16 15" shape-rendering="crispEdges"><path d="M7 0h2v1h1v2h1v2h1v2h1v2h1v2h1v3H0v-3h1V9h1V7h1V5h1V3h1V1h1z" fill="#1E1E1E"/><path d="M7 2h2v2h1v2h1v2h1v2h1v2h1v1H2v-1h1v-2h1V8h1V6h1V4h1z" fill="${alertas ? '#FF3B3B' : '#9BD9B0'}"/><rect x="7" y="5" width="2" height="4" fill="#fff"/><rect x="7" y="10" width="2" height="2" fill="#fff"/></svg>
          ${alertas ? `<span class="badge">${alertas}</span>` : ''}
        </button>
        <div class="nomes-sofa"><span class="tag a">${U.esc(e.casal.A)}</span><span class="tag b">${U.esc(e.casal.B)}</span></div>
      </div>
      ${resumoHoje()}
    </section>`;

    U.$('#tvTela', el).onclick = abrirMensagens;
    U.$('#alerta', el).onclick = abrirPrioridades;
    U.$('#ofensiva', el).onclick = abrirOfensiva;
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
            Store.atualizar(s => s.mensagens.push({ id: U.uid(), data: U.hoje(), autor, texto, criado: Date.now() }));
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
            desenhar(); U.$('input[name=texto]', m.el).focus();
          };
          U.$$('[data-feito]', m.el).forEach(c => c.onchange = () => {
            const li = c.closest('li'); li.classList.add('saindo');
            const r = c.getBoundingClientRect(); U.coracoes(r.left, r.top, 5);
            setTimeout(() => {
              Store.atualizar(s => {
                const p = s.prioridades.find(x => x.id === c.dataset.feito); p.feito = true; p.feitoEm = U.hoje();
                const limite = U.addDias(U.hoje(), -30);
                s.prioridades = s.prioridades.filter(x => !x.feito || x.feitoEm >= limite);
              });
              desenhar();
            }, 380);
          });
          U.$$('[data-desfazer]', m.el).forEach(c => c.onchange = () => {
            Store.atualizar(s => { const p = s.prioridades.find(x => x.id === c.dataset.desfazer); p.feito = false; delete p.feitoEm; });
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
      titulo: '🔥 Ofensiva do casal',
      corpo: `
        <div class="ofensiva-grande ${set.has(h) ? '' : 'apagada'}"><span>🔥</span><b>${n}</b><p>${n === 1 ? 'dia seguido' : 'dias seguidos'}</p></div>
        <p class="centro">${set.has(h) ? 'Vocês já registraram algo hoje. Mandaram bem! 💚' : 'Registrem qualquer coisa hoje (um recado, uma tarefa, um item…) para manter a ofensiva!'}</p>
        <div class="cal-ofensiva">
          ${SEMANA_LETRA.map(l => `<span class="cab">${l}</span>`).join('')}
          ${dias.map(d => `<span class="${set.has(d) ? 'on' : ''} ${d === h ? 'hoje' : ''} ${d > h ? 'futuro' : ''}">${U.parse(d).getDate()}</span>`).join('')}
        </div>
        <div class="stats-linha"><div><b>${set.size}</b><small>dias usando o app</small></div><div><b>${recorde}</b><small>maior ofensiva</small></div></div>`,
    });
  }

  return { render, sair: () => clearInterval(tvTimer), totalAlertas };
})();
