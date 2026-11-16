/* Lista de compras do mercado */

Views.mercado = (() => {
  const UNIDADES = ['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'dz'];

  function render(el) {
    const e = Store.get();
    const itens = [...e.mercado].sort((a, b) => (a.comprado - b.comprado) || (a.criado - b.criado));
    const comprados = itens.filter(i => i.comprado).length;
    const pct = itens.length ? Math.round(comprados / itens.length * 100) : 0;
    el.innerHTML = `
    <section class="pagina estreita">
      <header class="pagina-topo">
        <div><h1>🛒 Lista do mercado</h1><p class="sub-titulo">Anotem o que falta e marquem no carrinho na hora da compra.</p></div>
      </header>
      <form class="form-mercado" id="novoItem">
        <input name="nome" placeholder="Item (ex.: Leite)" required maxlength="60" autofocus data-foco="novo-item" list="sugestoes">
        <input name="qtd" type="number" min="0" step="0.1" value="1" aria-label="Quantidade">
        <select name="unidade" aria-label="Unidade">${UNIDADES.map(u => `<option>${u}</option>`).join('')}</select>
        <button class="btn primario">＋</button>
        <datalist id="sugestoes">${[...new Set(e.mercado.map(i => i.nome))].map(n => `<option value="${U.esc(n)}">`).join('')}</datalist>
      </form>
      <div class="progresso-linha"><div class="barra"><i style="width:${pct}%"></i></div><span>${comprados} de ${itens.length} no carrinho</span></div>
      ${itens.length ? `
      <table class="tabela mercado">
        <thead><tr><th>✔</th><th>Item</th><th>Quantidade</th><th></th></tr></thead>
        <tbody>
        ${itens.map(i => `
          <tr class="${i.comprado ? 'comprado' : ''}">
            <td><label class="check-grande sozinho"><input type="checkbox" data-comprado="${i.id}" ${i.comprado ? 'checked' : ''} aria-label="Comprado"><span></span></label></td>
            <td class="nome-item">${U.esc(i.nome)}</td>
            <td><div class="qtd"><button class="btn-icone" data-mais="${i.id}" data-d="-1" aria-label="Menos">−</button>
              <span>${String(i.qtd).replace('.', ',')} ${U.esc(i.unidade)}</span>
              <button class="btn-icone" data-mais="${i.id}" data-d="1" aria-label="Mais">＋</button></div></td>
            <td><button class="btn-icone" data-apagar="${i.id}" aria-label="Apagar">🗑️</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="botoes">
        <button class="btn" id="copiar">📋 Copiar lista</button>
        ${comprados ? '<button class="btn" id="limpar">🧹 Tirar os comprados</button>' : ''}
      </div>` : `<div class="vazio-grande"><span>🧺</span><p>A lista está vazia.<br>Adicione o primeiro item acima!</p></div>`}
    </section>`;

    U.$('#novoItem', el).onsubmit = ev => {
      ev.preventDefault();
      const f = ev.target;
      Store.atualizar(s => s.mercado.push({ id: U.uid(), nome: f.nome.value.trim(), qtd: U.num(f.qtd.value) || 1, unidade: f.unidade.value, comprado: false, criado: Date.now() }));
      setTimeout(() => { const i = U.$('#novoItem input[name=nome]'); i && i.focus(); }, 0);
    };
    U.$$('[data-comprado]', el).forEach(c => c.onchange = () => {
      if (c.checked) { const r = c.getBoundingClientRect(); U.coracoes(r.left, r.top, 4); }
      Store.atualizar(s => { s.mercado.find(i => i.id === c.dataset.comprado).comprado = c.checked; });
    });
    U.$$('[data-mais]', el).forEach(b => b.onclick = () => Store.atualizar(s => {
      const i = s.mercado.find(x => x.id === b.dataset.mais);
      const passo = ['kg', 'L'].includes(i.unidade) ? 0.5 : ['g', 'ml'].includes(i.unidade) ? 100 : 1;
      i.qtd = Math.max(0, Math.round((i.qtd + passo * +b.dataset.d) * 10) / 10);
    }, { registrar: false }));
    U.$$('[data-apagar]', el).forEach(b => b.onclick = () =>
      Store.atualizar(s => { s.mercado = s.mercado.filter(i => i.id !== b.dataset.apagar); }, { registrar: false }));
    const limpar = U.$('#limpar', el);
    if (limpar) limpar.onclick = () => Store.atualizar(s => { s.mercado = s.mercado.filter(i => !i.comprado); }, { registrar: false });
    const copiar = U.$('#copiar', el);
    if (copiar) copiar.onclick = async () => {
      const txt = '🛒 Lista do mercado\n' + itens.filter(i => !i.comprado).map(i => `• ${i.nome} — ${i.qtd} ${i.unidade}`).join('\n');
      try { await navigator.clipboard.writeText(txt); U.toast('Lista copiada! É só colar no WhatsApp 💬'); }
      catch (e) { U.toast('Não deu para copiar automaticamente.'); }
    };
  }

  return { render };
})();
