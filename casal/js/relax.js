/* Relaxamento: escritório do casal com indicações de livros, filmes, jogos e séries */

const Indicacoes = (() => {
  const TIPOS = {
    livro: { nome: 'Livros', um: 'livro', icone: '📚', detalhe: 'Autor(a)', status: { quero: 'Quero ler', andamento: 'Lendo', concluido: 'Lido' } },
    filme: { nome: 'Filmes', um: 'filme', icone: '🎬', detalhe: 'Onde assistir (ex.: Netflix)', status: { quero: 'Quero ver', andamento: 'Vendo', concluido: 'Assistido' } },
    jogo: { nome: 'Jogos', um: 'jogo', icone: '🎮', detalhe: 'Plataforma (ex.: Switch, PC)', status: { quero: 'Quero jogar', andamento: 'Jogando', concluido: 'Zerado' } },
    serie: { nome: 'Séries e vídeos', um: 'série ou vídeo', icone: '💻', detalhe: 'Onde assistir', status: { quero: 'Quero ver', andamento: 'Vendo', concluido: 'Terminado' } },
  };
  const lista = tipo => (Store.get().indicacoes || []).filter(i => i.tipo === tipo);
  const corDe = t => { let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return ['#E04848', '#3C8DDE', '#F2C230', '#3DB56A', '#F28DB2', '#8E5CC8', '#F08A2E', '#8B5A35', '#2E2E2E', '#9AA0A6'][h % 10]; };
  return { TIPOS, lista, corDe };
})();

Views.relax = (() => {
  const eu = () => Local.get().eu || 'A';
  const outro = p => (p === 'A' ? 'B' : 'A');

  function cenaSVG() {
    const r = [], R = (x, y, w, h, c) => r.push(Pixel.rect(x, y, w, h, c)), O = '#1E1E1E';
    const c = Cena.casa(), d = { ...CASA_PADRAO().relax, ...(c.relax || {}) };
    // parede, rodameio, piso e tapete com as cores escolhidas
    const pr = Pixel.parede(d.parede), piso = Pixel.PISOS[d.piso] || Pixel.PISOS.claro;
    R(0, 0, 160, 70, pr);
    const rm = Pixel.escurecer(pr, 0.1);
    R(0, 48, 160, 20, rm); for (let x = 2; x < 160; x += 6) R(x, 49, 1, 19, Pixel.escurecer(rm, 0.06));
    R(0, 47, 160, 1, O); R(0, 68, 160, 1, O);
    R(0, 69, 160, 31, piso[1]); for (let y = 75; y < 100; y += 6) R(0, y, 160, 1, piso[2]);
    if (d.tapete !== 'nenhum') {
      const tc = Pixel.cor(d.tapete);
      Pixel.caixa(r, 30, 82, 76, 14, O, tc, 3); R(34, 85, 68, 1, Pixel.clarear(tc, 0.25)); R(34, 92, 68, 1, Pixel.escurecer(tc, 0.2));
    }
    // janela com céu
    Pixel.caixa(r, 52, 6, 34, 24, O, '#BFE6FF', 1);
    R(56, 12, 8, 3, '#FFFFFF'); R(58, 10, 5, 2, '#FFFFFF'); R(72, 18, 9, 3, '#FFFFFF'); R(74, 16, 4, 2, '#FFFFFF');
    R(68, 7, 1, 22, O); R(53, 17, 32, 1, O);
    // relógio
    Pixel.caixa(r, 92, 8, 10, 10, O, '#FFFFFF', 2); R(96, 10, 1, 4, O); R(96, 13, 3, 1, O);

    // estante de livros (enche conforme as indicações)
    Pixel.caixa(r, 3, 12, 30, 58, O, '#8B5A35', 0);
    [13, 25, 37, 49, 61].forEach(y => R(4, y + 10, 28, 2, '#5E3B22'));
    const livros = Indicacoes.lista('livro');
    livros.slice(0, 36).forEach((l, i) => {
      const prat = Math.floor(i / 9), pos = i % 9;
      const h = 7 + (l.titulo.length % 3), y = 23 + prat * 12 - h;
      R(5 + pos * 3, y, 2, h, Indicacoes.corDe(l.titulo));
      if (l.status === 'concluido') R(5 + pos * 3, y + 1, 2, 1, '#FFD23F');
    });
    if (!livros.length) R(6, 17, 22, 5, '#A87A50');

    // mesa com dois computadores
    R(38, 54, 64, 3, O); R(39, 55, 62, 1, '#B07A47'); R(40, 57, 3, 11, O); R(97, 57, 3, 11, O);
    [[44, '#3C8DDE'], [72, '#3DB56A']].forEach(([x, tela]) => {
      Pixel.caixa(r, x, 34, 24, 17, O, O, 1);
      R(x + 2, 36, 20, 13, tela);
      for (let i = 0; i < 4; i++) R(x + 4, 38 + i * 3, 6 + ((i * 5 + x) % 9), 1, '#FFFFFF');
      R(x + 10, 51, 4, 3, O); R(x + 6, 53, 12, 1, O);
    });
    // casal sentado nas cadeiras, de costas
    r.push(`<g transform="translate(48 46)"><g class="digitando">${Pixel.desenharPersonagem(c.A)}</g></g>`);
    r.push(`<g transform="translate(76 46)"><g class="digitando dois">${Pixel.desenharPersonagem(c.B)}</g></g>`);
    [48, 76].forEach(x => { Pixel.caixa(r, x - 1, 58, 18, 12, O, '#2E2E2E', 2); R(x + 6, 70, 4, 6, O); R(x + 2, 76, 12, 2, O); });

    // mesinha do videogame com TV pequena e cartuchos
    Pixel.caixa(r, 106, 40, 24, 17, O, '#8E5CC8', 2);
    R(109, 43, 18, 11, '#0E1A3A');
    r.push('<g class="jogo-pisca">'); R(112, 49, 3, 3, '#FFD23F'); R(119, 46, 2, 2, '#E04848'); R(123, 50, 2, 2, '#3DB56A'); r.push('</g>');
    R(110, 52, 16, 1, '#3DB56A');
    Pixel.caixa(r, 104, 57, 30, 11, O, '#F4F4F4', 1); R(106, 66, 2, 3, O); R(130, 66, 2, 3, O);
    R(107, 59, 10, 3, '#9AA0A6'); R(108, 60, 2, 1, '#E04848');
    Indicacoes.lista('jogo').slice(0, 7).forEach((j, i) => R(119 + i * 2, 59, 1, 4, Indicacoes.corDe(j.titulo)));
    R(108, 63, 5, 2, O); R(115, 63, 5, 2, O);

    // estante de DVDs
    Pixel.caixa(r, 136, 14, 22, 56, O, '#2E2E2E', 0);
    [14, 25, 36, 47, 58].forEach(y => R(137, y + 10, 20, 1, '#5A5A5A'));
    Indicacoes.lista('filme').slice(0, 45).forEach((f, i) => {
      const prat = Math.floor(i / 9), pos = i % 9;
      R(138 + pos * 2, 16 + prat * 11, 1, 8, Indicacoes.corDe(f.titulo));
    });
    return `<svg class="cena-svg" viewBox="0 0 160 100" shape-rendering="crispEdges" aria-hidden="true">${r.join('')}</svg>`;
  }

  function render(el) {
    const ind = Store.get().indicacoes || [];
    const pend = ind.filter(i => i.status !== 'concluido' && (i.para === eu() || i.para === 'AB'));
    const sugestao = pend[(new Date().getDate()) % (pend.length || 1)];
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>🛋️ Relaxamento</h1><p class="sub-titulo">O cantinho de indicar livros, filmes, séries e jogos um para o outro. Toque nos móveis!</p></div>
      </header>
      <div class="cena relax">
        ${cenaSVG()}
        <button class="ponto-clique rotulo" style="left:1.5%;top:11%;width:19.5%;height:59%" data-tipo="livro"><span>📚 Livros</span></button>
        <button class="ponto-clique rotulo" style="left:26%;top:32%;width:38%;height:26%" data-tipo="serie"><span>💻 Séries</span></button>
        <button class="ponto-clique rotulo" style="left:65%;top:39%;width:19%;height:30%" data-tipo="jogo"><span>🎮 Jogos</span></button>
        <button class="ponto-clique rotulo" style="left:84.5%;top:13%;width:14.5%;height:58%" data-tipo="filme"><span>🎬 Filmes</span></button>
        <div class="cena-botoes"><button class="chip-cena" id="decorarRelax">${Pixel.icone('pincel')} Decorar</button></div>
      </div>
      ${sugestao ? `<div class="sugestao"><span>✨ Sugestão para hoje</span><b>${Indicacoes.TIPOS[sugestao.tipo].icone} ${U.esc(sugestao.titulo)}</b><small>indicado por ${U.esc(Store.nome(sugestao.por))}</small><button class="btn mini" data-tipo="${sugestao.tipo}">Ver</button></div>` : ''}
      <div class="cards-resumo">
        ${Object.entries(Indicacoes.TIPOS).map(([k, t]) => {
          const l = Indicacoes.lista(k), paraMim = l.filter(i => i.status !== 'concluido' && i.para !== i.por && (i.para === eu() || i.para === 'AB')).length;
          return `<button class="card-resumo" data-tipo="${k}"><span class="cr-icone">${t.icone}</span><div><h4>${t.nome}</h4>
            <p>${l.length} ${l.length === 1 ? 'indicação' : 'indicações'} · ${l.filter(i => i.status === 'concluido').length} ${t.status.concluido.toLowerCase()}${l.filter(i => i.status === 'concluido').length === 1 ? '' : 's'}</p>
            ${paraMim ? `<p><span class="tag b">${paraMim} esperando você</span></p>` : ''}</div></button>`;
        }).join('')}
      </div>
    </section>`;
    U.$$('[data-tipo]', el).forEach(b => b.onclick = () => abrir(b.dataset.tipo));
    U.$('#decorarRelax', el).onclick = () => Decorar.abrir('rparede', 'relax');
  }

  function abrir(tipo) {
    const T = Indicacoes.TIPOS[tipo];
    let filtro = 'todos';
    const m = U.modal({ titulo: `${T.icone} ${T.nome}`, largo: true, aoFechar: () => desligar() });
    const desligar = Store.assinar(() => setTimeout(desenhar, 0));
    function desenhar() {
      const todos = Indicacoes.lista(tipo);
      const f = {
        todos: () => true, paraMim: i => i.para === eu() || (i.para === 'AB' && i.por !== eu()),
        indiquei: i => i.por === eu(), juntos: i => i.para === 'AB',
      }[filtro];
      const itens = todos.filter(f).sort((a, b) => (a.status === 'concluido') - (b.status === 'concluido') || b.criado - a.criado);
      const ativo = document.activeElement?.dataset?.foco;
      m.render(`
        <form class="form-grade form-indicacao" id="fInd">
          <label class="larga">Título<input name="titulo" required maxlength="80" placeholder="Nome do ${T.um}" data-foco="ind-titulo"></label>
          <label>${T.detalhe}<input name="detalhe" maxlength="60" data-foco="ind-detalhe"></label>
          <label>Para quem<select name="para"><option value="${outro(eu())}">${U.esc(Store.nome(outro(eu())))}</option><option value="AB">Para nós dois</option></select></label>
          <label class="larga">Por que você indica?<input name="comentario" maxlength="160" placeholder="Uma frase que convença 😉" data-foco="ind-coment"></label>
          <label class="larga">Link (opcional)<input name="link" type="url" maxlength="300" placeholder="https://"></label>
          <div class="larga botoes direita"><button class="btn primario">＋ Indicar</button></div>
        </form>
        <div class="segmentado filtros-ind">
          ${[['todos', 'Todos'], ['paraMim', 'Para mim'], ['indiquei', 'Eu indiquei'], ['juntos', 'Nós dois']].map(([k, n]) => `<button class="${filtro === k ? 'ativo' : ''}" data-filtro="${k}">${n}</button>`).join('')}
        </div>
        ${itens.length ? `<ul class="lista-ind">${itens.map(i => {
          const minha = (i.notas || {})[eu()] || 0, dele = (i.notas || {})[outro(eu())] || 0;
          return `<li class="ind ${i.status}">
            <span class="lombada" style="background:${Indicacoes.corDe(i.titulo)}"></span>
            <div class="ind-info">
              <h4>${U.esc(i.titulo)} ${i.detalhe ? `<small>· ${U.esc(i.detalhe)}</small>` : ''}</h4>
              <p class="ind-de"><span class="tag ${i.por.toLowerCase()}">${U.esc(Store.nome(i.por))}</span> indicou para <span class="tag ${i.para.toLowerCase()}">${i.para === 'AB' ? 'vocês dois' : U.esc(Store.nome(i.para))}</span></p>
              ${i.comentario ? `<p class="ind-coment">“${U.esc(i.comentario)}”</p>` : ''}
              ${/^https?:\/\//.test(i.link || '') ? `<a href="${U.esc(i.link)}" target="_blank" rel="noopener" class="ind-link">Abrir link ↗</a>` : ''}
              <div class="ind-acoes">
                <div class="segmentado mini">${Object.entries(T.status).map(([k, n]) => `<button class="${i.status === k ? 'ativo' : ''}" data-status="${k}" data-id="${i.id}">${n}</button>`).join('')}</div>
                <span class="estrelas" title="Sua nota">${[1, 2, 3, 4, 5].map(n => `<button data-nota="${n}" data-id="${i.id}" class="${n <= minha ? 'on' : ''}" aria-label="${n} estrela${n > 1 ? 's' : ''}">★</button>`).join('')}</span>
                ${dele ? `<small>${U.esc(Store.nome(outro(eu())))}: ${'★'.repeat(dele)}</small>` : ''}
                <button class="btn-icone" data-apagar="${i.id}" aria-label="Apagar">🗑️</button>
              </div>
            </div></li>`;
        }).join('')}</ul>` : `<p class="vazio">Nada por aqui ainda. Indique o primeiro ${T.um}!</p>`}`);
      if (ativo) U.$(`[data-foco="${ativo}"]`, m.el)?.focus();

      U.$('#fInd', m.el).onsubmit = ev => {
        ev.preventDefault();
        const fm = ev.target;
        Store.atualizar(s => {
          s.indicacoes = s.indicacoes || [];
          s.indicacoes.push({ id: U.uid(), tipo, titulo: fm.titulo.value.trim(), detalhe: fm.detalhe.value.trim(), por: eu(), para: fm.para.value, comentario: fm.comentario.value.trim(), link: fm.link.value.trim(), status: 'quero', notas: {}, criado: Date.now() });
        });
        U.toast(`${T.icone} Indicação guardada na estante!`);
      };
      U.$$('[data-filtro]', m.el).forEach(b => b.onclick = () => { filtro = b.dataset.filtro; desenhar(); });
      U.$$('[data-status]', m.el).forEach(b => b.onclick = () => Store.atualizar(s => {
        const i = s.indicacoes.find(x => x.id === b.dataset.id);
        const era = i.status === 'concluido', vira = b.dataset.status === 'concluido';
        i.status = b.dataset.status;
        if (!era && vira) { Amor.somar(s, 12, 'indicacao'); i.concluidoEm = U.hoje(); }
        if (era && !vira) Amor.somar(s, -12, 'indicacao');
      }));
      U.$$('[data-nota]', m.el).forEach(b => b.onclick = () => Store.atualizar(s => {
        const i = s.indicacoes.find(x => x.id === b.dataset.id);
        i.notas = i.notas || {}; i.notas[eu()] = +b.dataset.nota;
      }, { registrar: false }));
      U.$$('[data-apagar]', m.el).forEach(b => b.onclick = async () => {
        if (!(await U.confirmar('Apagar esta indicação?'))) return;
        Store.atualizar(s => { s.indicacoes = s.indicacoes.filter(x => x.id !== b.dataset.apagar); }, { registrar: false });
      });
    }
    desenhar();
  }

  return { render, cenaSVG };
})();
