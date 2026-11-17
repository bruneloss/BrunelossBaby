/* Tarefas diárias: arrastar tarefas comuns para quem vai fazer */

Views.tarefas = (() => {
  let dia = U.hoje();
  let editandoBanco = false;

  const lista = (s, d) => (s.tarefas.dias[d] = s.tarefas.dias[d] || []);

  function coluna(p) {
    const e = Store.get();
    const itens = (e.tarefas.dias[dia] || []).filter(t => t.pessoa === p);
    const feitas = itens.filter(t => t.feito).length;
    const pct = itens.length ? Math.round(feitas / itens.length * 100) : 0;
    return `
    <div class="coluna-tarefas ${p.toLowerCase()}" data-pessoa="${p}">
      <div class="coluna-topo">
        <span class="avatar ${p.toLowerCase()}">${U.esc(Store.nome(p)).slice(0, 1).toUpperCase()}</span>
        <input class="nome-pessoa" value="${U.esc(Store.nome(p))}" data-nome="${p}" data-foco="nome-${p}" aria-label="Nome" maxlength="24">
        <span class="contador">${feitas}/${itens.length}</span>
      </div>
      <div class="barra"><i style="width:${pct}%"></i></div>
      <ul class="tarefas-pessoa">
        ${itens.map(t => `
          <li class="tarefa ${t.feito ? 'feita' : ''}" data-id="${t.id}">
            <label><input type="checkbox" data-feito="${t.id}" ${t.feito ? 'checked' : ''}><span>${t.icone} ${U.esc(t.nome)}</span></label>
            <button class="btn-icone" data-tirar="${t.id}" aria-label="Remover">✕</button>
          </li>`).join('')}
      </ul>
      ${!itens.length ? '<p class="solte-aqui">Arraste tarefas para cá ⬇️</p>' : ''}
      ${pct === 100 && itens.length ? '<p class="parabens">Tudo feito! 🏆</p>' : ''}
    </div>`;
  }

  function render(el) {
    const e = Store.get();
    const doDia = e.tarefas.dias[dia] || [];
    const titulo = dia === U.hoje() ? 'Hoje' : dia === U.addDias(U.hoje(), 1) ? 'Amanhã' : dia === U.addDias(U.hoje(), -1) ? 'Ontem' : U.dataCurta(dia);
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>🧹 Tarefas diárias</h1><p class="sub-titulo">Escolham uma tarefa lá embaixo e arrastem (ou toquem) para quem vai fazer.</p></div>
      </header>
      <div class="nav-mes">
        <button class="btn-icone" data-dia="-1" aria-label="Dia anterior">‹</button>
        <h2>${titulo} <small>${U.dataLonga(dia)}</small></h2>
        <button class="btn-icone" data-dia="1" aria-label="Próximo dia">›</button>
        ${dia !== U.hoje() ? '<button class="btn mini" data-dia="0">Hoje</button>' : ''}
        <button class="btn mini" id="copiarOntem" title="Repete a divisão do dia anterior">↻ Repetir dia anterior</button>
      </div>
      <div class="duo">${coluna('A')}${coluna('B')}</div>
      <div class="banco">
        <div class="banco-topo"><h3>Tarefas comuns</h3>
          <button class="btn mini" id="editarBanco">${editandoBanco ? '✔️ Pronto' : '✏️ Editar lista'}</button></div>
        <div class="chips">
          ${e.tarefas.modelos.map(m => {
            const quem = doDia.filter(t => t.modeloId === m.id).map(t => t.pessoa);
            return `<div class="chip-tarefa ${quem.length ? 'usada' : ''}" data-modelo="${m.id}">
              <span>${m.icone} ${U.esc(m.nome)}</span>
              ${quem.map(q => `<i class="ponto ${q.toLowerCase()}"></i>`).join('')}
              ${editandoBanco ? `<button class="btn-icone" data-apagar-modelo="${m.id}" aria-label="Apagar">✕</button>` : ''}
            </div>`;
          }).join('')}
        </div>
        <form class="linha-form" id="novoModelo">
          <input name="icone" class="icone-input" value="✨" maxlength="4" aria-label="Emoji">
          <input name="nome" placeholder="Nova tarefa (ex.: Dar banho no cachorro)" maxlength="40" required>
          <button class="btn">＋ Adicionar</button>
        </form>
      </div>
    </section>`;

    U.$$('[data-dia]', el).forEach(b => b.onclick = () => { const n = +b.dataset.dia; dia = n ? U.addDias(dia, n) : U.hoje(); App.render(); });
    U.$('#editarBanco', el).onclick = () => { editandoBanco = !editandoBanco; App.render(); };
    U.$('#copiarOntem', el).onclick = () => {
      const ant = Store.get().tarefas.dias[U.addDias(dia, -1)] || [];
      if (!ant.length) return U.toast('O dia anterior não tem tarefas para repetir.');
      Store.atualizar(s => { lista(s, dia).push(...ant.map(t => ({ ...t, id: U.uid(), feito: false }))); });
    };
    U.$('#novoModelo', el).onsubmit = ev => {
      ev.preventDefault();
      const f = ev.target;
      Store.atualizar(s => s.tarefas.modelos.push({ id: U.uid(), icone: f.icone.value.trim() || '✨', nome: f.nome.value.trim() }));
    };
    U.$$('[data-apagar-modelo]', el).forEach(b => b.onclick = () =>
      Store.atualizar(s => { s.tarefas.modelos = s.tarefas.modelos.filter(m => m.id !== b.dataset.apagarModelo); }, { registrar: false }));
    U.$$('[data-nome]', el).forEach(i => i.onchange = () => {
      const v = i.value.trim(); if (v) Store.atualizar(s => { s.casal[i.dataset.nome] = v; });
    });
    U.$$('[data-feito]', el).forEach(c => c.onchange = () => {
      if (c.checked) { const r = c.getBoundingClientRect(); U.coracoes(r.left, r.top, 5); }
      Store.atualizar(s => { const t = lista(s, dia).find(x => x.id === c.dataset.feito); t.feito = c.checked; Amor.somar(s, c.checked ? 8 : -8, 'tarefa'); });
    });
    U.$$('[data-tirar]', el).forEach(b => b.onclick = () =>
      Store.atualizar(s => { s.tarefas.dias[dia] = lista(s, dia).filter(x => x.id !== b.dataset.tirar); }, { registrar: false }));

    const atribuir = (modeloId, pessoa) => {
      const m = Store.get().tarefas.modelos.find(x => x.id === modeloId); if (!m) return;
      Store.atualizar(s => lista(s, dia).push({ id: U.uid(), modeloId, icone: m.icone, nome: m.nome, pessoa, feito: false }));
    };

    // Arrastar do banco para uma pessoa (ou tocar para escolher)
    U.arrastavel(U.$('.banco', el), {
      item: '.chip-tarefa', alvo: '.coluna-tarefas',
      aoSoltar: (it, alvo, ev) => { atribuir(it.dataset.modelo, alvo.dataset.pessoa); U.coracoes(ev.clientX, ev.clientY, 4); },
      aoTocar: (it, ev) => {
        if (editandoBanco) return;
        escolherPessoa(ev, p => atribuir(it.dataset.modelo, p));
      },
    });
    // Arrastar entre as pessoas / de volta ao banco para remover
    U.arrastavel(U.$('.duo', el), {
      item: '.tarefa', alvo: '.coluna-tarefas, .banco',
      aoSoltar: (it, alvo) => Store.atualizar(s => {
        if (alvo.classList.contains('banco')) s.tarefas.dias[dia] = lista(s, dia).filter(x => x.id !== it.dataset.id);
        else lista(s, dia).find(x => x.id === it.dataset.id).pessoa = alvo.dataset.pessoa;
      }),
    });
  }

  function escolherPessoa(ev, cb) {
    U.$$('.popover').forEach(p => p.remove());
    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.innerHTML = `<small>Quem vai fazer?</small>
      <button class="btn a" data-p="A">${U.esc(Store.nome('A'))}</button>
      <button class="btn b" data-p="B">${U.esc(Store.nome('B'))}</button>`;
    pop.style.left = Math.min(ev.clientX, innerWidth - 190) + 'px';
    pop.style.top = (ev.clientY + 12) + 'px';
    document.body.appendChild(pop);
    const fora = e2 => { if (!pop.contains(e2.target)) { pop.remove(); document.removeEventListener('pointerdown', fora); } };
    setTimeout(() => document.addEventListener('pointerdown', fora), 0);
    U.$$('[data-p]', pop).forEach(b => b.onclick = () => { cb(b.dataset.p); pop.remove(); document.removeEventListener('pointerdown', fora); });
  }

  return { render };
})();
