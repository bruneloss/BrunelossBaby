/* Agenda compartilhada (inspirada no Google Agenda): mês, semana e lista */

const Agenda = (() => {
  const TIPOS = {
    evento: { icone: '📌', nome: 'Evento' },
    aniversario: { icone: '🎂', nome: 'Aniversário' },
    data: { icone: '💖', nome: 'Data importante' },
    rotina: { icone: '🔁', nome: 'Rotina' },
  };
  const REPETIR = { nao: 'Não repete', diario: 'Todo dia', semanal: 'Toda semana', mensal: 'Todo mês', anual: 'Todo ano' };

  function bate(ev, d) {
    if (d < ev.data || (ev.ate && d > ev.ate)) return false;
    const dt = U.parse(d), ini = U.parse(ev.data);
    switch (ev.repetir) {
      case 'diario': return true;
      case 'semanal': return (ev.dias && ev.dias.length ? ev.dias : [ini.getDay()]).includes(dt.getDay());
      case 'mensal': return dt.getDate() === ini.getDate();
      case 'anual': return dt.getDate() === ini.getDate() && dt.getMonth() === ini.getMonth();
      default: return d === ev.data;
    }
  }

  /* Ocorrências entre duas datas (inclusive), incluindo contas a vencer */
  function entre(ini, fim, { contas = true } = {}) {
    const res = [];
    const evs = Store.get().agenda;
    for (let d = ini; d <= fim; d = U.addDias(d, 1)) {
      evs.forEach(ev => { if (bate(ev, d)) res.push({ data: d, ev }); });
      // contas: processa uma vez por mês do intervalo
      if (contas && (U.parse(d).getDate() === 1 || d === ini)) {
        const ym = d.slice(0, 7);
        Contas.doMes(ym).forEach(c => {
          const dia = `${ym}-${pad(Math.min(c.dia, U.diasNoMes(ym)))}`;
          if (dia >= ini && dia <= fim) res.push({ data: dia, conta: c, ev: { id: 'c' + c.id, titulo: `${c.nome} (${U.money(c.valorMes)})`, tipo: 'conta', pessoa: c.responsavel, diaTodo: true } });
        });
      }
    }
    return res.sort((a, b) => a.data.localeCompare(b.data) || (a.ev.diaTodo ? -1 : 1) - (b.ev.diaTodo ? -1 : 1) || (a.ev.inicio || '').localeCompare(b.ev.inicio || ''));
  }
  const proximos = dias => entre(U.hoje(), U.addDias(U.hoje(), dias), { contas: false });

  return { TIPOS, REPETIR, entre, proximos, bate };
})();

Views.agenda = (() => {
  let modo = 'mes';
  let ref = U.hoje();

  const corPessoa = p => p === 'A' ? 'a' : p === 'B' ? 'b' : 'ab';
  const iconeDe = o => o.ev.tipo === 'conta' ? (o.conta.pago ? '✅' : '💸') : Agenda.TIPOS[o.ev.tipo]?.icone || '📌';
  const pill = o => `<button class="pill ${corPessoa(o.ev.pessoa)} ${o.conta && o.conta.pago ? 'riscado' : ''}" data-ev="${o.ev.id}" data-data="${o.data}">
    ${iconeDe(o)} ${!o.ev.diaTodo && o.ev.inicio ? `<b>${o.ev.inicio}</b> ` : ''}${U.esc(o.ev.titulo)}</button>`;

  function cabecalho() {
    const d = U.parse(ref);
    let titulo;
    if (modo === 'mes') titulo = U.nomeMes(ref.slice(0, 7));
    else if (modo === 'semana') { const ini = U.addDias(ref, -d.getDay()); const fim = U.addDias(ini, 6); titulo = `${U.dataCurta(ini)} – ${U.dataCurta(fim)} · ${MESES[U.parse(fim).getMonth()]}`; }
    else titulo = 'Próximos 60 dias';
    return `
    <div class="agenda-topo">
      <button class="btn mini" data-nav="0">Hoje</button>
      <button class="btn-icone" data-nav="-1" aria-label="Anterior">‹</button><button class="btn-icone" data-nav="1" aria-label="Próximo">›</button>
      <h2>${titulo}</h2>
      <div class="segmentado">
        ${[['mes', 'Mês'], ['semana', 'Semana'], ['lista', 'Lista']].map(([k, n]) => `<button class="${modo === k ? 'ativo' : ''}" data-modo="${k}">${n}</button>`).join('')}
      </div>
    </div>`;
  }

  function vistaMes() {
    const ym = ref.slice(0, 7);
    const primeiro = `${ym}-01`;
    const ini = U.addDias(primeiro, -U.parse(primeiro).getDay());
    const fim = U.addDias(ini, 41);
    const ocs = Agenda.entre(ini, fim);
    const h = U.hoje();
    let html = `<div class="grade-mes">${SEMANA.map(s => `<div class="cab">${s}</div>`).join('')}`;
    for (let i = 0; i < 42; i++) {
      const d = U.addDias(ini, i);
      const doDia = ocs.filter(o => o.data === d);
      html += `<div class="dia ${d.slice(0, 7) !== ym ? 'fora' : ''} ${d === h ? 'hoje' : ''}" data-dia="${d}">
        <span class="num">${U.parse(d).getDate()}</span>
        ${doDia.slice(0, 3).map(pill).join('')}
        ${doDia.length > 3 ? `<button class="mais" data-dia-mais="${d}">+${doDia.length - 3} mais</button>` : ''}
      </div>`;
    }
    return html + '</div>';
  }

  function vistaSemana() {
    const ini = U.addDias(ref, -U.parse(ref).getDay());
    const dias = [...Array(7)].map((_, i) => U.addDias(ini, i));
    const ocs = Agenda.entre(ini, dias[6]);
    const h = U.hoje();
    const H = 44; // altura de uma hora em px
    const min = t => { const [a, b] = (t || '0:0').split(':').map(Number); return a * 60 + b; };
    return `
    <div class="semana">
      <div class="sem-cab"><div></div>${dias.map(d => `<div class="${d === h ? 'hoje' : ''}" data-dia="${d}"><small>${SEMANA[U.parse(d).getDay()]}</small><b>${U.parse(d).getDate()}</b></div>`).join('')}</div>
      <div class="sem-diatodo"><div><small>dia todo</small></div>${dias.map(d => `<div data-dia="${d}">${ocs.filter(o => o.data === d && (o.ev.diaTodo || !o.ev.inicio)).map(pill).join('')}</div>`).join('')}</div>
      <div class="sem-corpo" id="semCorpo">
        <div class="horas">${[...Array(24)].map((_, i) => `<div style="height:${H}px"><small>${pad(i)}:00</small></div>`).join('')}</div>
        ${dias.map(d => `<div class="sem-col ${d === h ? 'hoje' : ''}" data-dia="${d}" style="height:${H * 24}px">
          ${[...Array(24)].map((_, i) => `<i style="top:${i * H}px"></i>`).join('')}
          ${ocs.filter(o => o.data === d && !o.ev.diaTodo && o.ev.inicio).map(o => {
            const a = min(o.ev.inicio), b = Math.max(a + 30, o.ev.fim ? min(o.ev.fim) : a + 60);
            return `<button class="bloco ${corPessoa(o.ev.pessoa)}" data-ev="${o.ev.id}" data-data="${o.data}" style="top:${a / 60 * H}px;height:${(b - a) / 60 * H - 2}px">
              <b>${iconeDe(o)} ${U.esc(o.ev.titulo)}</b><small>${o.ev.inicio}${o.ev.fim ? '–' + o.ev.fim : ''}</small></button>`;
          }).join('')}
          ${d === h ? `<span class="agora" style="top:${(new Date().getHours() * 60 + new Date().getMinutes()) / 60 * H}px"></span>` : ''}
        </div>`).join('')}
      </div>
    </div>`;
  }

  function vistaLista() {
    const ocs = Agenda.entre(U.hoje(), U.addDias(U.hoje(), 60));
    if (!ocs.length) return `<div class="vazio-grande"><span>🗓️</span><p>Nada marcado nos próximos 60 dias.</p></div>`;
    const datas = [...new Set(ocs.map(o => o.data))];
    return `<div class="lista-agenda">${datas.map(d => `
      <div class="lista-dia"><div class="ld-data ${d === U.hoje() ? 'hoje' : ''}"><b>${U.parse(d).getDate()}</b><small>${MESES_CURTO[U.parse(d).getMonth()]} · ${SEMANA[U.parse(d).getDay()]}</small></div>
      <div class="ld-itens">${ocs.filter(o => o.data === d).map(o => `
        <button class="ld-item" data-ev="${o.ev.id}" data-data="${o.data}"><i class="ponto ${corPessoa(o.ev.pessoa)}"></i>
          <span class="hora">${o.ev.diaTodo || !o.ev.inicio ? 'Dia todo' : o.ev.inicio + (o.ev.fim ? '–' + o.ev.fim : '')}</span>
          <span>${iconeDe(o)} ${U.esc(o.ev.titulo)}</span><small>${U.esc(Store.nome(o.ev.pessoa))}</small></button>`).join('')}</div></div>`).join('')}</div>`;
  }

  function render(el) {
    const e = Store.get();
    el.innerHTML = `
    <section class="pagina">
      <header class="pagina-topo">
        <div><h1>📅 Agenda do casal</h1><p class="sub-titulo">Eventos, aniversários, datas importantes e rotinas — para um saber do outro.</p></div>
        <button class="btn primario" id="novoEvento">＋ Criar</button>
      </header>
      ${cabecalho()}
      <div class="legenda"><span><i class="ponto a"></i>${U.esc(e.casal.A)}</span><span><i class="ponto b"></i>${U.esc(e.casal.B)}</span><span><i class="ponto ab"></i>Nós dois</span><span>💸 Contas</span></div>
      ${modo === 'mes' ? vistaMes() : modo === 'semana' ? vistaSemana() : vistaLista()}
    </section>`;

    const sc = U.$('#semCorpo', el); if (sc) sc.scrollTop = 7 * 44;
    U.$('#novoEvento', el).onclick = () => editar(null, modo === 'lista' ? U.hoje() : ref);
    U.$$('[data-modo]', el).forEach(b => b.onclick = () => { modo = b.dataset.modo; App.render(); });
    U.$$('[data-nav]', el).forEach(b => b.onclick = () => {
      const n = +b.dataset.nav;
      if (!n) ref = U.hoje();
      else if (modo === 'mes') ref = U.addMes(ref.slice(0, 7), n) + '-01';
      else ref = U.addDias(ref, 7 * n);
      App.render();
    });
    U.$$('[data-ev]', el).forEach(b => b.onclick = ev => { ev.stopPropagation(); abrirEvento(b.dataset.ev, b.dataset.data); });
    U.$$('[data-dia-mais]', el).forEach(b => b.onclick = ev => { ev.stopPropagation(); verDia(b.dataset.diaMais); });
    U.$$('.grade-mes .dia, .sem-cab [data-dia], .sem-diatodo [data-dia]', el).forEach(c => c.onclick = () => verDia(c.dataset.dia));
    U.$$('.sem-col', el).forEach(c => c.onclick = ev => {
      if (ev.target.closest('.bloco')) return;
      const r = c.getBoundingClientRect();
      const h = Math.floor((ev.clientY - r.top) / 44);
      editar(null, c.dataset.dia, `${pad(h)}:00`);
    });
  }

  function verDia(d) {
    const ocs = Agenda.entre(d, d);
    const m = U.modal({
      titulo: `🗓️ ${U.dataLonga(d)}`,
      corpo: `${ocs.length ? `<div class="ld-itens">${ocs.map(o => `<button class="ld-item" data-ev="${o.ev.id}" data-data="${o.data}"><i class="ponto ${corPessoa(o.ev.pessoa)}"></i>
        <span class="hora">${o.ev.diaTodo || !o.ev.inicio ? 'Dia todo' : o.ev.inicio}</span><span>${iconeDe(o)} ${U.esc(o.ev.titulo)}</span></button>`).join('')}</div>` : '<p class="vazio">Nada marcado neste dia.</p>'}
        <div class="botoes"><button class="btn primario" id="addDia">＋ Adicionar neste dia</button></div>`,
    });
    U.$('#addDia', m.el).onclick = () => { m.fechar(); editar(null, d); };
    U.$$('[data-ev]', m.el).forEach(b => b.onclick = () => { m.fechar(); abrirEvento(b.dataset.ev, b.dataset.data); });
  }

  function abrirEvento(id, data) {
    if (id.startsWith('c')) {
      const c = Store.get().contas.find(x => 'c' + x.id === id);
      const ym = data.slice(0, 7);
      const pago = !!(c.pagamentos || {})[ym];
      const m = U.modal({
        titulo: '💸 Conta',
        corpo: `<p><b>${U.esc(c.nome)}</b> — ${U.money((c.valores || {})[ym] ?? c.valor)}</p><p>Vence ${U.dataLonga(data)} · paga: <b>${U.esc(Store.nome(c.responsavel))}</b></p>
          <div class="botoes"><button class="btn ${pago ? '' : 'primario'}" id="tglPago">${pago ? '↩️ Desmarcar pagamento' : '✅ Marcar como paga'}</button><a class="btn" href="#contas">Ver em Contas</a></div>`,
      });
      U.$('#tglPago', m.el).onclick = () => { Contas.marcarPago(c.id, ym, !pago); m.fechar(); };
      U.$('a', m.el).onclick = () => m.fechar();
      return;
    }
    editar(Store.get().agenda.find(x => x.id === id));
  }

  function editar(ev, data = U.hoje(), hora = '') {
    const novo = !ev;
    const e = Store.get();
    ev = ev ? U.clone(ev) : { titulo: '', data, diaTodo: !hora, inicio: hora || '19:00', fim: hora ? `${pad((+hora.slice(0, 2) + 1) % 24)}:00` : '20:00', tipo: 'evento', pessoa: Local.get().eu || 'AB', repetir: 'nao', dias: [], descricao: '', ate: '' };
    const m = U.modal({
      titulo: novo ? '＋ Novo na agenda' : '✏️ Editar',
      corpo: `
      <form class="form-grade">
        <label class="larga">Título<input name="titulo" required value="${U.esc(ev.titulo)}" placeholder="Ex.: Jantar com os amigos" autofocus></label>
        <div class="larga tipos">${Object.entries(Agenda.TIPOS).map(([k, t]) => `<label class="opcao"><input type="radio" name="tipo" value="${k}" ${ev.tipo === k ? 'checked' : ''}><span>${t.icone} ${t.nome}</span></label>`).join('')}</div>
        <label>Data<input type="date" name="data" required value="${ev.data}"></label>
        <label class="check-linha"><input type="checkbox" name="diaTodo" ${ev.diaTodo ? 'checked' : ''}> Dia inteiro</label>
        <label class="hora-campo">Início<input type="time" name="inicio" value="${ev.inicio || ''}"></label>
        <label class="hora-campo">Fim<input type="time" name="fim" value="${ev.fim || ''}"></label>
        <label>De quem é<select name="pessoa">
          <option value="A" ${ev.pessoa === 'A' ? 'selected' : ''}>${U.esc(e.casal.A)}</option>
          <option value="B" ${ev.pessoa === 'B' ? 'selected' : ''}>${U.esc(e.casal.B)}</option>
          <option value="AB" ${ev.pessoa === 'AB' ? 'selected' : ''}>Nós dois</option></select></label>
        <label>Repetir<select name="repetir">${Object.entries(Agenda.REPETIR).map(([k, n]) => `<option value="${k}" ${ev.repetir === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <div class="larga dias-semana">${SEMANA.map((s, i) => `<label class="opcao mini"><input type="checkbox" name="dias" value="${i}" ${(ev.dias || []).includes(i) ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div>
        <label class="ate-campo">Repetir até (opcional)<input type="date" name="ate" value="${ev.ate || ''}"></label>
        <label class="larga">Descrição<textarea name="descricao" rows="3" placeholder="Local, detalhes, lembretes…">${U.esc(ev.descricao)}</textarea></label>
        <div class="larga botoes">${!novo ? '<button type="button" class="btn perigo" id="apagarEv">🗑️ Apagar</button>' : ''}<button class="btn primario">Salvar</button></div>
      </form>`,
    });
    const f = U.$('form', m.el);
    const ajustar = () => {
      U.$$('.hora-campo', f).forEach(x => x.hidden = f.diaTodo.checked);
      U.$('.dias-semana', f).hidden = f.repetir.value !== 'semanal';
      U.$('.ate-campo', f).hidden = f.repetir.value === 'nao';
    };
    f.onchange = ev2 => {
      if (ev2.target.name === 'tipo') {
        if (f.tipo.value === 'aniversario') { f.repetir.value = 'anual'; f.diaTodo.checked = true; }
        if (f.tipo.value === 'data') { f.diaTodo.checked = true; }
        if (f.tipo.value === 'rotina' && f.repetir.value === 'nao') f.repetir.value = 'semanal';
      }
      ajustar();
    };
    ajustar();
    f.onsubmit = ev2 => {
      ev2.preventDefault();
      const dados = {
        titulo: f.titulo.value.trim(), tipo: f.tipo.value, data: f.data.value, diaTodo: f.diaTodo.checked,
        inicio: f.diaTodo.checked ? '' : f.inicio.value, fim: f.diaTodo.checked ? '' : f.fim.value,
        pessoa: f.pessoa.value, repetir: f.repetir.value, ate: f.repetir.value === 'nao' ? '' : f.ate.value,
        dias: U.$$('input[name=dias]:checked', f).map(x => +x.value), descricao: f.descricao.value.trim(),
      };
      if (dados.repetir === 'semanal' && !dados.dias.length) dados.dias = [U.parse(dados.data).getDay()];
      Store.atualizar(s => {
        if (novo) s.agenda.push({ id: U.uid(), autor: Local.get().eu || '', ...dados });
        else Object.assign(s.agenda.find(x => x.id === ev.id), dados);
      });
      ref = dados.data;
      m.fechar();
    };
    const ap = U.$('#apagarEv', m.el);
    if (ap) ap.onclick = () => {
      if (!U.confirmar('Apagar este item da agenda (todas as repetições)?')) return;
      Store.atualizar(s => { s.agenda = s.agenda.filter(x => x.id !== ev.id); }, { registrar: false });
      m.fechar();
    };
  }

  return { render };
})();
