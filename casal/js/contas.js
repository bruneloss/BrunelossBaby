/* Contas com vencimento — ligadas ao relatório financeiro e ao alerta da tela inicial */

const Contas = (() => {
  const FORMAS = ['Pix', 'Débito', 'Crédito', 'Boleto', 'Dinheiro', 'Débito automático'];
  const CATEGORIAS = ['🏠 Moradia', '💡 Energia', '🚿 Água', '🌐 Internet', '📱 Celular', '🎬 Assinaturas', '💳 Cartão', '🚗 Transporte', '🎓 Estudos', '🩺 Saúde', '📦 Outros'];

  const ativaNoMes = (c, ym) => c.recorrencia === 'unica' ? c.mes === ym : (c.mes || '0000-00') <= ym && (!c.fim || ym <= c.fim);

  function situacao(c, ym, pago) {
    if (pago) return { emoji: '✅', texto: 'Paga', classe: 'ok' };
    const dia = Math.min(c.dia, U.diasNoMes(ym));
    const dif = U.difDias(U.hoje(), `${ym}-${pad(dia)}`);
    if (dif < 0) return { emoji: '🔴', texto: `atrasada ${-dif}d`, classe: 'perigo', dif };
    if (dif === 0) return { emoji: '🟠', texto: 'vence hoje', classe: 'aviso', dif };
    if (dif <= 3) return { emoji: '🟡', texto: `vence em ${dif}d`, classe: 'aviso', dif };
    return { emoji: '⚪', texto: `dia ${dia}`, classe: 'neutro', dif };
  }

  function doMes(ym) {
    return Store.get().contas.filter(c => ativaNoMes(c, ym)).map(c => {
      const pago = !!(c.pagamentos || {})[ym];
      const valorMes = (c.valores || {})[ym] ?? c.valor;
      return { ...c, mes: ym, pago, valorMes, situacao: situacao(c, ym, pago) };
    }).sort((a, b) => a.dia - b.dia || a.nome.localeCompare(b.nome));
  }

  function alertas() {
    const ym = U.mesAtual();
    return [...doMes(U.addMes(ym, -1)), ...doMes(ym)].filter(c => !c.pago && c.situacao.dif <= 3);
  }

  /* Contas que entram como despesa fixa da pessoa no relatório financeiro */
  function paraPessoa(ym, p) {
    return doMes(ym).filter(c => c.responsavel === p || c.responsavel === 'AB')
      .map(c => ({ ...c, valorPessoa: c.responsavel === 'AB' ? c.valorMes / 2 : c.valorMes }));
  }

  function marcarPago(id, ym, v) {
    Store.atualizar(s => {
      const c = s.contas.find(x => x.id === id); if (!c) return;
      c.pagamentos = c.pagamentos || {};
      if (v) c.pagamentos[ym] = true; else delete c.pagamentos[ym];
    });
  }

  return { doMes, alertas, paraPessoa, marcarPago, FORMAS, CATEGORIAS, ativaNoMes };
})();

Views.contas = (() => {
  let mes = U.mesAtual();

  function render(el) {
    const e = Store.get();
    const lista = Contas.doMes(mes);
    const total = U.soma(lista, c => c.valorMes);
    const pago = U.soma(lista.filter(c => c.pago), c => c.valorMes);
    const porPessoa = p => U.soma(lista.filter(c => c.responsavel === p || c.responsavel === 'AB'), c => c.responsavel === 'AB' ? c.valorMes / 2 : c.valorMes);
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>💸 Contas do mês</h1><p class="sub-titulo">Vencimentos, quem paga e o que já foi pago. Tudo aparece no relatório financeiro e no alerta 🚨.</p></div>
        <button class="btn primario" id="novaConta">＋ Nova conta</button>
      </header>
      <div class="nav-mes">
        <button class="btn-icone" data-mes="-1" aria-label="Mês anterior">‹</button>
        <h2>${U.nomeMes(mes)}</h2>
        <button class="btn-icone" data-mes="1" aria-label="Próximo mês">›</button>
        ${mes !== U.mesAtual() ? '<button class="btn mini" data-mes="0">Hoje</button>' : ''}
      </div>
      <div class="tiles">
        <div class="tile"><small>Total do mês</small><b>${U.money(total)}</b></div>
        <div class="tile ok"><small>Já pago</small><b>${U.money(pago)}</b></div>
        <div class="tile aviso"><small>Falta pagar</small><b>${U.money(total - pago)}</b></div>
        <div class="tile a"><small>${U.esc(e.casal.A)} paga</small><b>${U.money(porPessoa('A'))}</b></div>
        <div class="tile b"><small>${U.esc(e.casal.B)} paga</small><b>${U.money(porPessoa('B'))}</b></div>
      </div>
      ${lista.length ? `<div class="lista-contas">${lista.map(c => `
        <div class="conta ${c.pago ? 'paga' : ''} ${c.situacao.classe}">
          <div class="conta-dia"><small>dia</small><b>${c.dia}</b></div>
          <div class="conta-info">
            <h4>${U.esc(c.nome)}</h4>
            <p><span class="tag">${U.esc(c.categoria || '📦 Outros')}</span> <span class="tag ${c.responsavel.toLowerCase()}">${c.responsavel === 'AB' ? 'Ambos (metade cada)' : U.esc(Store.nome(c.responsavel))}</span>
            <span class="tag">${U.esc(c.forma || '')}</span> ${c.recorrencia === 'unica' ? '<span class="tag">só este mês</span>' : '<span class="tag">🔁 mensal</span>'}</p>
          </div>
          <label class="conta-valor" title="Valor deste mês (pode mudar todo mês, ex.: luz)">R$ <input type="number" step="0.01" min="0" value="${c.valorMes}" data-valor="${c.id}" data-foco="valor-${c.id}"></label>
          <span class="tag ${c.situacao.classe}">${c.situacao.emoji} ${c.situacao.texto}</span>
          <label class="check-grande"><input type="checkbox" data-pago="${c.id}" ${c.pago ? 'checked' : ''}><span>Pago</span></label>
          <div class="acoes"><button class="btn-icone" data-editar="${c.id}" aria-label="Editar">✏️</button><button class="btn-icone" data-apagar="${c.id}" aria-label="Apagar">🗑️</button></div>
        </div>`).join('')}</div>`
        : `<div class="vazio-grande"><span>🧾</span><p>Nenhuma conta neste mês.<br>Cadastre aluguel, luz, internet, cartão…</p></div>`}
    </section>`;

    U.$$('[data-mes]', el).forEach(b => b.onclick = () => { const n = +b.dataset.mes; mes = n ? U.addMes(mes, n) : U.mesAtual(); App.render(); });
    U.$('#novaConta', el).onclick = () => editar();
    U.$$('[data-editar]', el).forEach(b => b.onclick = () => editar(Store.get().contas.find(c => c.id === b.dataset.editar)));
    U.$$('[data-apagar]', el).forEach(b => b.onclick = async () => {
      const c = Store.get().contas.find(x => x.id === b.dataset.apagar);
      if (await U.confirmar(`Apagar a conta "${c.nome}" de todos os meses?`)) Store.atualizar(s => { s.contas = s.contas.filter(x => x.id !== c.id); }, { registrar: false });
    });
    U.$$('[data-pago]', el).forEach(i => i.onchange = () => {
      Contas.marcarPago(i.dataset.pago, mes, i.checked);
      if (i.checked) { const r = i.getBoundingClientRect(); U.coracoes(r.left, r.top, 5); }
    });
    U.$$('[data-valor]', el).forEach(i => i.onchange = () => Store.atualizar(s => {
      const c = s.contas.find(x => x.id === i.dataset.valor); c.valores = c.valores || {}; c.valores[mes] = U.num(i.value);
    }));
  }

  function editar(c) {
    const novo = !c;
    c = c ? U.clone(c) : { nome: '', valor: '', dia: 10, responsavel: Local.get().eu || 'A', forma: 'Pix', categoria: '🏠 Moradia', recorrencia: 'mensal' };
    const e = Store.get();
    const m = U.modal({
      titulo: novo ? '＋ Nova conta' : '✏️ Editar conta',
      corpo: `
      <form class="form-grade">
        <label class="larga">Nome da conta<input name="nome" required value="${U.esc(c.nome)}" placeholder="Ex.: Aluguel, Luz, Netflix" autofocus></label>
        <label>Valor (R$)<input name="valor" type="number" step="0.01" min="0" required value="${c.valor}"></label>
        <label>Dia do vencimento<input name="dia" type="number" min="1" max="31" required value="${c.dia}"></label>
        <label>Quem paga<select name="responsavel">
          <option value="A" ${c.responsavel === 'A' ? 'selected' : ''}>${U.esc(e.casal.A)}</option>
          <option value="B" ${c.responsavel === 'B' ? 'selected' : ''}>${U.esc(e.casal.B)}</option>
          <option value="AB" ${c.responsavel === 'AB' ? 'selected' : ''}>Ambos (dividido)</option></select></label>
        <label>Forma de pagamento<select name="forma">${Contas.FORMAS.map(f => `<option ${c.forma === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
        <label>Categoria<select name="categoria">${Contas.CATEGORIAS.map(f => `<option ${c.categoria === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
        <label>Repete<select name="recorrencia">
          <option value="mensal" ${c.recorrencia === 'mensal' ? 'selected' : ''}>Todo mês</option>
          <option value="unica" ${c.recorrencia === 'unica' ? 'selected' : ''}>Só em ${U.nomeMes(c.mes || mes)}</option></select></label>
        <div class="larga botoes"><button class="btn primario">Salvar</button></div>
      </form>`,
    });
    U.$('form', m.el).onsubmit = ev => {
      ev.preventDefault();
      const f = ev.target;
      Store.atualizar(s => {
        const dados = {
          nome: f.nome.value.trim(), valor: U.num(f.valor.value), dia: Math.max(1, Math.min(31, parseInt(f.dia.value) || 1)),
          responsavel: f.responsavel.value, forma: f.forma.value, categoria: f.categoria.value, recorrencia: f.recorrencia.value,
        };
        if (novo) s.contas.push({ id: U.uid(), ...dados, mes, pagamentos: {}, valores: {} });
        else {
          const alvo = s.contas.find(x => x.id === c.id);
          Object.assign(alvo, dados);
          if (dados.recorrencia === 'unica' && !alvo.mes) alvo.mes = mes;
        }
      });
      m.fechar();
    };
  }

  return { render };
})();
