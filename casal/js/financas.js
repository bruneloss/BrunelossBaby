/* Relatório financeiro do casal — mês a mês, no modelo da planilha (renda, despesas fixas, variáveis, investimentos) */

const Fin = (() => {
  const TIPOS_GASTO = ['Pix', 'Débito', 'Crédito', 'Dinheiro', 'Vale alimentação'];
  const FORMAS = ['Pix', 'Débito', 'Crédito', 'Boleto', 'Dinheiro', 'Débito automático'];
  const vazio = () => ({ rendas: [], fixas: [], variaveis: [], investimentos: [] });

  const dados = (ym, p) => (Store.get().financas[ym] || {})[p] || vazio();
  const garantir = (s, ym, p) => {
    s.financas[ym] = s.financas[ym] || {};
    return (s.financas[ym][p] = s.financas[ym][p] || vazio());
  };

  function calc(ym, p) {
    const d = dados(ym, p);
    const ehVale = x => x.tipo === 'vale' || x.tipo === 'Vale alimentação';
    const rendaConta = U.soma(d.rendas.filter(r => !ehVale(r)), r => r.valor);
    const rendaVale = U.soma(d.rendas.filter(ehVale), r => r.valor);
    const fixasManuais = U.soma(d.fixas, f => f.valor);
    const contas = Contas.paraPessoa(ym, p);
    const fixasContas = U.soma(contas, c => c.valorPessoa);
    const varConta = U.soma(d.variaveis.filter(v => !ehVale(v)), v => v.valor);
    const varVale = U.soma(d.variaveis.filter(ehVale), v => v.valor);
    const investido = U.soma(d.investimentos, i => i.valor);
    const fixas = fixasManuais + fixasContas;
    const gastos = fixas + varConta + varVale;
    return {
      d, contas, rendaConta, rendaVale, renda: rendaConta + rendaVale, fixas, fixasContas, varConta, varVale, investido, gastos,
      utilizadoConta: fixas + varConta + investido, saldoConta: rendaConta - fixas - varConta - investido, saldoVale: rendaVale - varVale,
      saldo: rendaConta + rendaVale - gastos - investido,
    };
  }

  /* Total acumulado por destino de investimento até o mês (igual à coluna "Total" da planilha) */
  function acumulado(ym, pessoas) {
    const tot = {};
    Object.keys(Store.get().financas).filter(m => m <= ym).forEach(m => pessoas.forEach(p => {
      dados(m, p).investimentos.forEach(i => {
        const k = (i.destino || 'Sem destino').trim();
        tot[k] = (tot[k] || 0) + (Number(i.valor) || 0);
      });
    }));
    return tot;
  }

  return { TIPOS_GASTO, FORMAS, dados, garantir, calc, acumulado, vazio };
})();

Views.financas = (() => {
  let mes = U.mesAtual();
  let quem = null; // 'A' | 'B' | 'casal'

  const SECOES = {
    rendas: { titulo: '💰 Renda', dica: 'Salário, vale alimentação, extras, ajuda da família…', colunas: [
      { campo: 'nome', rotulo: 'Origem', tipo: 'text', ph: 'Salário' },
      { campo: 'tipo', rotulo: 'Entra em', tipo: 'select', opcoes: [['conta', 'Conta / dinheiro'], ['vale', 'Vale alimentação']] },
      { campo: 'valor', rotulo: 'Recebido', tipo: 'number' }] },
    fixas: { titulo: '📌 Despesas fixas', dica: 'Gastos que se repetem. As contas da aba Contas entram aqui sozinhas 🔗', colunas: [
      { campo: 'nome', rotulo: 'Despesa', tipo: 'text', ph: 'Spotify' },
      { campo: 'valor', rotulo: 'Total', tipo: 'number' },
      { campo: 'pago', rotulo: 'Pago', tipo: 'check' },
      { campo: 'forma', rotulo: 'Forma PGT', tipo: 'select', opcoes: Fin.FORMAS.map(f => [f, f]) },
      { campo: 'dia', rotulo: 'Dia', tipo: 'number', mini: true }] },
    variaveis: { titulo: '🛍️ Despesas variáveis', dica: 'Gastos do dia a dia. Use o tipo "Vale alimentação" para descontar do vale.', colunas: [
      { campo: 'data', rotulo: 'Data', tipo: 'date' },
      { campo: 'tipo', rotulo: 'Tipo', tipo: 'select', opcoes: Fin.TIPOS_GASTO.map(f => [f, f]) },
      { campo: 'descricao', rotulo: 'Descrição', tipo: 'text', ph: 'Remédio' },
      { campo: 'valor', rotulo: 'Valor', tipo: 'number' },
      { campo: 'pago', rotulo: 'Pago', tipo: 'check' }] },
    investimentos: { titulo: '📈 Investimentos', dica: 'Quanto foi guardado e para onde. O total acumulado soma os meses anteriores.', colunas: [
      { campo: 'origem', rotulo: 'Origem', tipo: 'text', ph: 'Salário' },
      { campo: 'valor', rotulo: 'Valor', tipo: 'number' },
      { campo: 'destino', rotulo: 'Destino', tipo: 'text', ph: 'Poupança' }] },
  };

  const novaLinha = sec => ({
    rendas: { nome: '', tipo: 'conta', valor: 0 },
    fixas: { nome: '', valor: 0, pago: false, forma: 'Pix', dia: '' },
    variaveis: { data: mes === U.mesAtual() ? U.hoje() : `${mes}-01`, tipo: 'Pix', descricao: '', valor: 0, pago: true },
    investimentos: { origem: '', valor: 0, destino: '' },
  }[sec]);

  function celula(sec, linha, c) {
    const base = `data-sec="${sec}" data-id="${linha.id}" data-campo="${c.campo}" data-foco="${sec}-${linha.id}-${c.campo}" aria-label="${c.rotulo}"`;
    const v = linha[c.campo];
    if (c.tipo === 'check') return `<label class="check-grande sozinho"><input type="checkbox" ${base} ${v ? 'checked' : ''}><span></span></label>`;
    if (c.tipo === 'select') return `<select ${base}>${c.opcoes.map(([val, txt]) => `<option value="${val}" ${v === val ? 'selected' : ''}>${txt}</option>`).join('')}</select>`;
    if (c.tipo === 'number') return `<input type="number" step="${c.mini ? 1 : 0.01}" min="0" ${c.mini ? 'class="mini" max="31"' : ''} value="${v ?? ''}" ${base}>`;
    if (c.tipo === 'date') return `<input type="date" value="${v || ''}" ${base}>`;
    return `<input type="text" value="${U.esc(v)}" placeholder="${c.ph || ''}" ${base}>`;
  }

  function tabela(sec, c) {
    const S = SECOES[sec];
    const linhas = c.d[sec];
    const extra = sec === 'fixas' ? c.contas : [];
    const total = { rendas: c.renda, fixas: c.fixas, variaveis: c.varConta + c.varVale, investimentos: c.investido }[sec];
    return `
    <div class="card-fin">
      <div class="card-fin-topo"><div><h3>${S.titulo}</h3><small>${S.dica}</small></div><b class="total">${U.money(total)}</b></div>
      <div class="rolagem"><table class="tabela editavel">
        <thead><tr>${S.colunas.map(col => `<th>${col.rotulo}</th>`).join('')}<th></th></tr></thead>
        <tbody>
          ${linhas.map(l => `<tr>${S.colunas.map(col => `<td>${celula(sec, l, col)}</td>`).join('')}
            <td><button class="btn-icone" data-tirar="${sec}" data-id="${l.id}" aria-label="Apagar linha">✕</button></td></tr>`).join('')}
          ${extra.map(ct => `<tr class="linha-conta">
            <td>🔗 ${U.esc(ct.nome)}${ct.responsavel === 'AB' ? ' <small>(metade)</small>' : ''}</td><td>${U.money(ct.valorPessoa)}</td>
            <td><label class="check-grande sozinho"><input type="checkbox" data-pagar-conta="${ct.id}" ${ct.pago ? 'checked' : ''} aria-label="Pago"><span></span></label></td>
            <td>${U.esc(ct.forma || '')}</td><td>${ct.dia}</td><td><a href="#contas" class="btn-icone" title="Ver em Contas">↗</a></td></tr>`).join('')}
          ${sec === 'investimentos' ? Object.entries(Fin.acumulado(mes, [quem])).map(([k, v]) => `<tr class="linha-total"><td colspan="2">Total acumulado em <b>${U.esc(k)}</b></td><td colspan="2"><b>${U.money(v)}</b></td></tr>`).join('') : ''}
        </tbody>
      </table></div>
      <button class="btn mini" data-add="${sec}">＋ Adicionar linha</button>
    </div>`;
  }

  function pessoa(el) {
    const c = Fin.calc(mes, quem);
    const vazioMes = !c.d.rendas.length && !c.d.fixas.length && !c.d.variaveis.length && !c.d.investimentos.length;
    return `
      <div class="tiles">
        <div class="tile ok"><small>Recebido</small><b>${U.money(c.renda)}</b></div>
        <div class="tile perigo"><small>Gastos</small><b>${U.money(c.gastos)}</b></div>
        <div class="tile"><small>Investido</small><b>${U.money(c.investido)}</b></div>
        <div class="tile ${c.saldo < 0 ? 'perigo' : 'a'}"><small>Saldo atual</small><b>${U.money(c.saldo)}</b></div>
      </div>
      <div class="resumo-renda">
        <table class="tabela">
          <thead><tr><th>Renda</th><th>Recebido</th><th>Utilizado</th><th>Atual</th></tr></thead>
          <tbody>
            <tr><td>Conta / dinheiro</td><td>${U.money(c.rendaConta)}</td><td>${U.money(c.utilizadoConta)}</td><td class="${c.saldoConta < 0 ? 'neg' : ''}"><b>${U.money(c.saldoConta)}</b></td></tr>
            <tr><td>Vale alimentação</td><td>${U.money(c.rendaVale)}</td><td>${U.money(c.varVale)}</td><td class="${c.saldoVale < 0 ? 'neg' : ''}"><b>${U.money(c.saldoVale)}</b></td></tr>
          </tbody>
        </table>
      </div>
      ${vazioMes ? `<div class="aviso-copiar"><p>Mês vazio para ${U.esc(Store.nome(quem))}.</p><button class="btn" id="copiarMes">↻ Copiar renda e despesas fixas de ${U.nomeMes(U.addMes(mes, -1))}</button></div>` : ''}
      <div class="grade-fin">${['rendas', 'fixas', 'variaveis', 'investimentos'].map(s => tabela(s, c)).join('')}</div>`;
  }

  function casal() {
    const e = Store.get();
    const a = Fin.calc(mes, 'A'), b = Fin.calc(mes, 'B');
    const linha = (rot, k, cls = '') => `<tr class="${cls}"><td>${rot}</td><td>${U.money(a[k])}</td><td>${U.money(b[k])}</td><td><b>${U.money(a[k] + b[k])}</b></td></tr>`;
    const ano = mes.slice(0, 4);
    const meses = MESES_CURTO.map((_, i) => `${ano}-${pad(i + 1)}`);
    const acum = Fin.acumulado(mes, ['A', 'B']);
    return `
      <div class="tiles">
        <div class="tile ok"><small>Renda do casal</small><b>${U.money(a.renda + b.renda)}</b></div>
        <div class="tile perigo"><small>Gastos do casal</small><b>${U.money(a.gastos + b.gastos)}</b></div>
        <div class="tile"><small>Investido no mês</small><b>${U.money(a.investido + b.investido)}</b></div>
        <div class="tile ${a.saldo + b.saldo < 0 ? 'perigo' : 'a'}"><small>Saldo do casal</small><b>${U.money(a.saldo + b.saldo)}</b></div>
      </div>
      <div class="grade-fin">
        <div class="card-fin"><div class="card-fin-topo"><h3>👫 Lado a lado — ${U.nomeMes(mes)}</h3></div>
          <div class="rolagem"><table class="tabela">
            <thead><tr><th></th><th><span class="tag a">${U.esc(e.casal.A)}</span></th><th><span class="tag b">${U.esc(e.casal.B)}</span></th><th>Total</th></tr></thead>
            <tbody>
              ${linha('💰 Renda', 'renda')}${linha('📌 Despesas fixas', 'fixas')}${linha('🛍️ Variáveis (conta)', 'varConta')}
              ${linha('🍎 Variáveis (vale)', 'varVale')}${linha('📈 Investimentos', 'investido')}${linha('✨ Saldo', 'saldo', 'linha-total')}
            </tbody></table></div></div>
        <div class="card-fin"><div class="card-fin-topo"><h3>🐷 Investimentos acumulados</h3><small>Somando os dois até ${U.nomeMes(mes)}</small></div>
          ${Object.keys(acum).length ? `<table class="tabela"><tbody>${Object.entries(acum).map(([k, v]) => `<tr><td>${U.esc(k)}</td><td><b>${U.money(v)}</b></td></tr>`).join('')}</tbody></table>` : '<p class="vazio">Nenhum investimento registrado ainda.</p>'}
        </div>
        <div class="card-fin largo"><div class="card-fin-topo"><h3>📅 Resumo de ${ano}</h3><small>Casal somado, mês a mês</small></div>
          <div class="rolagem"><table class="tabela ano">
            <thead><tr><th>Mês</th><th>Renda</th><th>Gastos</th><th>Investido</th><th>Saldo</th></tr></thead>
            <tbody>${meses.map((m, i) => {
              const x = Fin.calc(m, 'A'), y = Fin.calc(m, 'B');
              const s = x.saldo + y.saldo;
              const temDados = x.renda + y.renda + x.gastos + y.gastos + x.investido + y.investido;
              return `<tr class="${m === mes ? 'atual' : ''}" data-ir-mes="${m}"><td>${MESES[i]}</td>
                <td>${temDados ? U.money(x.renda + y.renda) : '—'}</td><td>${temDados ? U.money(x.gastos + y.gastos) : '—'}</td>
                <td>${temDados ? U.money(x.investido + y.investido) : '—'}</td><td class="${s < 0 ? 'neg' : ''}">${temDados ? `<b>${U.money(s)}</b>` : '—'}</td></tr>`;
            }).join('')}</tbody></table></div></div>
      </div>`;
  }

  function render(el) {
    if (!quem) quem = Local.get().eu || 'A';
    const e = Store.get();
    const ano = +mes.slice(0, 4);
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>📊 Relatório financeiro</h1><p class="sub-titulo">Ganhos, gastos e investimentos de cada um, mês a mês.</p></div>
      </header>
      <div class="abas-mes">
        <button class="btn-icone" data-ano="-1" aria-label="Ano anterior">‹</button><b>${ano}</b><button class="btn-icone" data-ano="1" aria-label="Próximo ano">›</button>
        <div class="meses">${MESES_CURTO.map((m, i) => { const ym = `${ano}-${pad(i + 1)}`; return `<button class="${ym === mes ? 'ativo' : ''} ${ym === U.mesAtual() ? 'hoje' : ''}" data-ym="${ym}">${m}</button>`; }).join('')}</div>
      </div>
      <div class="segmentado grande">
        <button class="${quem === 'A' ? 'ativo a' : ''}" data-quem="A">${U.esc(e.casal.A)}</button>
        <button class="${quem === 'B' ? 'ativo b' : ''}" data-quem="B">${U.esc(e.casal.B)}</button>
        <button class="${quem === 'casal' ? 'ativo' : ''}" data-quem="casal">💑 Casal</button>
      </div>
      <h2 class="titulo-mes">Controle financeiro — ${U.nomeMes(mes)}</h2>
      ${quem === 'casal' ? casal() : pessoa(el)}
    </section>`;

    U.$$('[data-ym]', el).forEach(b => b.onclick = () => { mes = b.dataset.ym; App.render(); });
    U.$$('[data-ir-mes]', el).forEach(b => b.onclick = () => { mes = b.dataset.irMes; App.render(); });
    U.$$('[data-ano]', el).forEach(b => b.onclick = () => { mes = U.addMes(mes, 12 * +b.dataset.ano); App.render(); });
    U.$$('[data-quem]', el).forEach(b => b.onclick = () => { quem = b.dataset.quem; App.render(); });
    if (quem === 'casal') return;

    U.$$('[data-add]', el).forEach(b => b.onclick = () => {
      const id = U.uid();
      Store.atualizar(s => Fin.garantir(s, mes, quem)[b.dataset.add].push({ id, ...novaLinha(b.dataset.add) }));
      setTimeout(() => { const i = U.$(`[data-id="${id}"]:not(button)`); i && i.focus(); }, 0);
    });
    U.$$('[data-tirar]', el).forEach(b => b.onclick = () => Store.atualizar(s => {
      const d = Fin.garantir(s, mes, quem); d[b.dataset.tirar] = d[b.dataset.tirar].filter(x => x.id !== b.dataset.id);
    }, { registrar: false }));
    U.$$('[data-campo]', el).forEach(i => i.onchange = () => Store.atualizar(s => {
      const linha = Fin.garantir(s, mes, quem)[i.dataset.sec].find(x => x.id === i.dataset.id);
      if (!linha) return;
      linha[i.dataset.campo] = i.type === 'checkbox' ? i.checked : i.type === 'number' ? U.num(i.value) : i.value;
    }));
    U.$$('[data-pagar-conta]', el).forEach(i => i.onchange = () => Contas.marcarPago(i.dataset.pagarConta, mes, i.checked));
    const copiar = U.$('#copiarMes', el);
    if (copiar) copiar.onclick = () => {
      const ant = Fin.dados(U.addMes(mes, -1), quem);
      if (!ant.rendas.length && !ant.fixas.length) return U.toast('O mês anterior também está vazio.');
      Store.atualizar(s => {
        const d = Fin.garantir(s, mes, quem);
        d.rendas.push(...ant.rendas.map(r => ({ ...r, id: U.uid() })));
        d.fixas.push(...ant.fixas.map(f => ({ ...f, id: U.uid(), pago: false })));
      });
    };
  }

  return { render };
})();
