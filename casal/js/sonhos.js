/* Lista de sonhos: pastas com fotos, ideias e checklist com barra de progresso */

Views.sonhos = (() => {
  const CORES = ['verde', 'amarelo', 'preto', 'branco'];
  const progresso = s => s.checklist.length ? Math.round(s.checklist.filter(c => c.feito).length / s.checklist.length * 100) : 0;

  function render(el) {
    const e = Store.get();
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>🌈 Nossos sonhos</h1><p class="sub-titulo">Cada sonho é uma pastinha: fotos de inspiração, ideias e os passos para chegar lá.</p></div>
        <button class="btn primario" id="novoSonho">＋ Novo sonho</button>
      </header>
      <div class="pastas">
        ${e.sonhos.map(s => {
          const pct = progresso(s);
          return `<button class="pasta ${s.cor || 'verde'} ${pct === 100 ? 'realizado' : ''}" data-abrir="${s.id}">
            <span class="aba"></span>
            <span class="pasta-corpo">
              ${s.fotos[0] ? `<img data-foto="${s.fotos[0]}" alt="">` : `<span class="pasta-emoji">${U.esc(s.emoji || '✨')}</span>`}
              <span class="pasta-titulo">${U.esc(s.emoji || '✨')} ${U.esc(s.titulo)}</span>
              <span class="barra"><i style="width:${pct}%"></i></span>
              <small>${pct === 100 ? '🎉 Realizado!' : `${s.checklist.filter(c => c.feito).length}/${s.checklist.length} passos · ${pct}%`} · 📷 ${s.fotos.length}</small>
            </span>
          </button>`;
        }).join('')}
        <button class="pasta nova" id="novoSonho2"><span class="aba"></span><span class="pasta-corpo"><span class="pasta-emoji">＋</span><span class="pasta-titulo">Criar pasta de sonho</span></span></button>
      </div>
    </section>`;
    Fotos.hidratar(el);
    const criar = async () => {
      const titulo = await U.pedirTexto('🌈 Novo sonho', 'Qual é o sonho?', 'Ex.: Viagem para o Japão');
      if (!titulo || !titulo.trim()) return;
      const id = U.uid();
      Store.atualizar(s => s.sonhos.push({ id, titulo: titulo.trim(), emoji: '✨', cor: CORES[s.sonhos.length % CORES.length], descricao: '', ideias: '', fotos: [], checklist: [], criado: Date.now() }));
      abrir(id);
    };
    U.$('#novoSonho', el).onclick = criar;
    U.$('#novoSonho2', el).onclick = criar;
    U.$$('[data-abrir]', el).forEach(b => b.onclick = () => abrir(b.dataset.abrir));
  }

  function abrir(id) {
    const m = U.modal({ titulo: '📂 Pasta do sonho', largo: true, corpo: '', aoFechar: () => desligar() });
    // redesenha depois que o foco já mudou de campo, para não perder o cursor
    const desligar = Store.assinar(() => setTimeout(desenhar, 0));
    const sonho = () => Store.get().sonhos.find(s => s.id === id);
    const mudar = (fn, op) => Store.atualizar(s => fn(s.sonhos.find(x => x.id === id)), op);

    function desenhar() {
      const s = sonho(); if (!s) return m.fechar();
      const pct = progresso(s);
      const ativo = document.activeElement && document.activeElement.dataset.foco;
      m.render(`
        <div class="sonho-cab">
          <input class="icone-input grande" value="${U.esc(s.emoji || '✨')}" maxlength="4" data-campo="emoji" data-foco="emoji" aria-label="Emoji">
          <input class="titulo-input" value="${U.esc(s.titulo)}" data-campo="titulo" data-foco="titulo" aria-label="Título">
          <div class="cores">${CORES.map(c => `<button class="cor ${c} ${s.cor === c ? 'ativo' : ''}" data-cor="${c}" aria-label="Cor ${c}"></button>`).join('')}</div>
        </div>
        <div class="progresso-linha grande"><div class="barra"><i style="width:${pct}%"></i></div><span>${pct}%</span></div>
        <div class="sonho-grade">
          <div>
            <h3 class="sub">📝 Sobre o sonho</h3>
            <textarea rows="3" data-campo="descricao" data-foco="descricao" placeholder="Por que esse sonho é importante pra gente?">${U.esc(s.descricao)}</textarea>
            <h3 class="sub">💡 Ideias</h3>
            <textarea rows="4" data-campo="ideias" data-foco="ideias" placeholder="Lugares, valores, links, inspirações…">${U.esc(s.ideias)}</textarea>
            <h3 class="sub">✅ Passos (checklist)</h3>
            <ul class="lista-check">
              ${s.checklist.map(c => `<li><label><input type="checkbox" data-check="${c.id}" ${c.feito ? 'checked' : ''}><span>${U.esc(c.texto)}</span></label>
                <button class="btn-icone" data-tirar="${c.id}" aria-label="Apagar">✕</button></li>`).join('')}
            </ul>
            <form class="linha-form" id="novoPasso"><input name="texto" placeholder="Novo passo (ex.: Juntar R$ 5.000)" required maxlength="100" data-foco="passo"><button class="btn">＋</button></form>
          </div>
          <div>
            <h3 class="sub">📷 Fotos e inspirações</h3>
            <label class="upload"><input type="file" accept="image/*" multiple id="subirFotos"><span>＋ Adicionar fotos</span></label>
            <div class="galeria">
              ${s.fotos.map(f => `<div class="foto"><img data-foto="${f}" alt="" data-ver="${f}"><button class="btn-icone" data-tirar-foto="${f}" aria-label="Remover foto">✕</button></div>`).join('')}
            </div>
            ${!s.fotos.length ? '<p class="vazio">Nenhuma foto ainda. Que tal uma imagem do lugar dos sonhos?</p>' : ''}
          </div>
        </div>
        <div class="botoes direita"><button class="btn perigo" id="apagarSonho">🗑️ Apagar sonho</button></div>
      `);
      Fotos.hidratar(m.el);
      if (ativo) { const a = U.$(`[data-foco="${ativo}"]`, m.el); a && a.focus(); }

      U.$$('[data-campo]', m.el).forEach(i => i.onchange = () => mudar(x => { x[i.dataset.campo] = i.value; }));
      U.$$('[data-cor]', m.el).forEach(b => b.onclick = () => mudar(x => { x.cor = b.dataset.cor; }, { registrar: false }));
      U.$$('[data-check]', m.el).forEach(c => c.onchange = () => {
        if (c.checked) { const r = c.getBoundingClientRect(); U.coracoes(r.left, r.top, 5); }
        mudar(x => { x.checklist.find(k => k.id === c.dataset.check).feito = c.checked; });
        if (progresso(sonho()) === 100) U.toast('🎉 Sonho realizado! Que orgulho de vocês!', 'festa');
      });
      U.$$('[data-tirar]', m.el).forEach(b => b.onclick = () => mudar(x => { x.checklist = x.checklist.filter(k => k.id !== b.dataset.tirar); }, { registrar: false }));
      U.$('#novoPasso', m.el).onsubmit = ev => {
        ev.preventDefault();
        const t = ev.target.texto.value.trim(); if (!t) return;
        mudar(x => x.checklist.push({ id: U.uid(), texto: t, feito: false }));
        setTimeout(() => { const i = U.$('[data-foco="passo"]', m.el); i && i.focus(); }, 0);
      };
      U.$('#subirFotos', m.el).onchange = async ev => {
        const arquivos = [...ev.target.files];
        U.toast(`Guardando ${arquivos.length} foto(s)…`);
        const ids = [];
        for (const f of arquivos) {
          try { const data = await Fotos.reduzir(f); const fid = U.uid(); await Fotos.salvar(fid, data); ids.push(fid); }
          catch (e) { U.toast('Não consegui ler uma das imagens.', 'erro'); }
        }
        if (ids.length) mudar(x => x.fotos.push(...ids));
      };
      U.$$('[data-tirar-foto]', m.el).forEach(b => b.onclick = async () => {
        if (!(await U.confirmar('Remover esta foto?'))) return;
        Fotos.apagar(b.dataset.tirarFoto);
        mudar(x => { x.fotos = x.fotos.filter(f => f !== b.dataset.tirarFoto); }, { registrar: false });
      });
      U.$$('[data-ver]', m.el).forEach(img => img.onclick = () => {
        U.modal({ titulo: '📷', largo: true, corpo: `<img class="foto-grande" data-foto="${img.dataset.ver}" alt="">`, aoAbrir: v => Fotos.hidratar(v.el) });
      });
      U.$('#apagarSonho', m.el).onclick = async () => {
        if (!(await U.confirmar(`Apagar o sonho "${s.titulo}" com todas as fotos?`))) return;
        s.fotos.forEach(f => Fotos.apagar(f));
        Store.atualizar(st => { st.sonhos = st.sonhos.filter(x => x.id !== id); }, { registrar: false });
      };
    }
    desenhar();
  }

  return { render };
})();
