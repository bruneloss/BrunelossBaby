/* Navegação, configurações e inicialização */

const App = (() => {
  const ROTAS = [
    ['inicio', '🏠', 'Início'], ['tarefas', '🧹', 'Tarefas'], ['mercado', '🛒', 'Mercado'], ['sonhos', '🌈', 'Sonhos'],
    ['financas', '📊', 'Finanças'], ['contas', '💸', 'Contas'], ['agenda', '📅', 'Agenda'],
  ];
  let atual = null, pendente = null;
  const view = () => U.$('#view');

  function rota() { const r = location.hash.slice(1); return ROTAS.some(x => x[0] === r) ? r : 'inicio'; }

  function nav() {
    const e = Store.get(), eu = Local.get().eu;
    U.$('#menu').innerHTML = ROTAS.map(([id, ic, nome]) => `<a href="#${id}" class="${id === atual ? 'ativo' : ''}"><span class="ic">${ic}</span><span>${nome}</span>${id === 'inicio' && Views.inicio.totalAlertas() ? '<i class="ponto-alerta"></i>' : ''}</a>`).join('');
    U.$('#quemSou').innerHTML = eu ? `<span class="avatar ${eu.toLowerCase()}">${U.esc(Store.nome(eu)).slice(0, 1).toUpperCase()}</span>` : '👤';
    U.$('#quemSou').title = eu ? `Usando como ${Store.nome(eu)}` : 'Escolher quem está usando';
    const [st] = Sync.status();
    U.$('#statusSync').className = 'status-sync ' + st;
    U.$('#statusSync').title = { off: Sync.modo() === 'artifact' ? 'Offline' : 'Só neste aparelho', conectando: 'Conectando…', on: 'Sincronizado', erro: 'Erro na sincronização' }[st];
  }

  /* Renderiza a tela atual preservando o campo com foco (útil em tabelas editáveis) */
  function render() {
    const r = rota();
    if (r !== atual) { Views[atual]?.sair?.(); atual = r; window.scrollTo(0, 0); }
    const ativo = document.activeElement;
    const foco = ativo && ativo.dataset ? ativo.dataset.foco : null;
    const sel = foco && ativo.selectionStart != null ? [ativo.selectionStart, ativo.selectionEnd] : null;
    const y = window.scrollY;
    Views[r].render(view());
    window.scrollTo(0, y);
    if (foco) {
      const novo = U.$(`#view [data-foco="${CSS.escape(foco)}"]`);
      if (novo) { novo.focus({ preventScroll: true }); if (sel) try { novo.setSelectionRange(...sel); } catch (e) {} }
    }
    nav();
    document.title = `${ROTAS.find(x => x[0] === r)[2]} · Nosso Cantinho`;
  }
  // agrupa várias alterações e espera o foco mudar de campo antes de redesenhar
  const agendar = () => { clearTimeout(pendente); pendente = setTimeout(render, 0); };

  function config() {
    const desenhar = m => {
      const e = Store.get(), L = Local.get();
      const [st, det] = Sync.status();
      m.render(`
        <h3 class="sub">💑 O casal</h3>
        <form class="form-grade" id="fCasal">
          <label>Nome 1<input name="A" value="${U.esc(e.casal.A)}" maxlength="24" required></label>
          <label>Nome 2<input name="B" value="${U.esc(e.casal.B)}" maxlength="24" required></label>
          <label>Juntos desde (opcional)<input type="date" name="desde" value="${e.casal.desde || ''}"></label>
          <div class="botoes larga"><button class="btn primario">Salvar nomes</button></div>
        </form>
        <h3 class="sub">📱 Quem está usando este aparelho?</h3>
        <div class="segmentado grande">
          ${['A', 'B'].map(p => `<button class="${L.eu === p ? 'ativo ' + p.toLowerCase() : ''}" data-eu="${p}">${U.esc(Store.nome(p))}</button>`).join('')}
        </div>
        ${Sync.modo() === 'artifact' ? `
        <h3 class="sub">🔄 Dados compartilhados</h3>
        <p class="dica">Os dados ficam guardados no claude.ai e aparecem para vocês dois. Para o seu amor usar, compartilhe este link pelo botão <b>Compartilhar</b> do claude.ai, com permissão para editar.</p>
        <p>Status: <span class="tag ${st === 'on' ? 'ok' : st === 'erro' ? 'perigo' : 'neutro'}">${{ off: 'offline', conectando: 'conectando…', on: 'sincronizado ✔', erro: 'sem conexão' }[st]}</span> ${det ? `<small>${U.esc(det)}</small>` : ''}</p>
        ` : `
        <h3 class="sub">🔄 Usar nos dois celulares (sincronização)</h3>
        <p class="dica">Sem sincronização, os dados ficam só neste navegador. Para ver tudo nos dois aparelhos, crie um projeto gratuito no Firebase (veja o passo a passo no arquivo <b>LEIAME.md</b>) e cole aqui a configuração. Use o <b>mesmo código do casal</b> nos dois aparelhos.</p>
        <p>Status: <span class="tag ${st === 'on' ? 'ok' : st === 'erro' ? 'perigo' : 'neutro'}">${{ off: 'só neste aparelho', conectando: 'conectando…', on: 'sincronizado ✔', erro: 'erro' }[st]}</span> ${det ? `<small>${U.esc(det)}</small>` : ''}</p>
        <form class="form-grade" id="fSync">
          <label class="larga">Código do casal (combinem um código difícil de adivinhar)<input name="codigo" value="${U.esc(L.codigo || '')}" placeholder="ex.: nos-dois-${Math.random().toString(36).slice(2, 8)}" pattern="[A-Za-z0-9_\\-]{6,}" title="Pelo menos 6 letras, números, - ou _"></label>
          <label class="larga">Configuração do Firebase (firebaseConfig)<textarea name="cfg" rows="5" placeholder='{ apiKey: "...", authDomain: "...", projectId: "...", ... }'>${L.firebase ? U.esc(JSON.stringify(L.firebase, null, 1)) : ''}</textarea></label>
          <div class="botoes larga">${L.firebase ? '<button type="button" class="btn" id="desligarSync">Desligar</button>' : ''}<button class="btn primario">Conectar</button></div>
        </form>`}
        <h3 class="sub">💾 Backup</h3>
        <div class="botoes">
          <button class="btn" id="exportar">⬇️ Baixar backup</button>
          <label class="btn">⬆️ Restaurar backup<input type="file" accept=".json,application/json" id="importar" hidden></label>
          <button class="btn perigo" id="apagarTudo">🗑️ Apagar tudo</button>
        </div>`);

      U.$('#fCasal', m.el).onsubmit = ev => {
        ev.preventDefault(); const f = ev.target;
        Store.atualizar(s => { s.casal.A = f.A.value.trim(); s.casal.B = f.B.value.trim(); s.casal.desde = f.desde.value; });
        U.toast('Nomes salvos 💚'); desenhar(m);
      };
      U.$$('[data-eu]', m.el).forEach(b => b.onclick = () => { Local.set('eu', b.dataset.eu); nav(); desenhar(m); agendar(); });
      const fs = U.$('#fSync', m.el);
      if (fs) fs.onsubmit = ev => {
        ev.preventDefault(); const f = ev.target;
        const cfg = lerConfig(f.cfg.value);
        if (!cfg || !cfg.apiKey || !cfg.projectId) return U.toast('Não reconheci a configuração. Cole o bloco firebaseConfig inteiro.', 'erro');
        const codigo = f.codigo.value.trim() || f.codigo.placeholder.replace('ex.: ', '');
        Local.set('firebase', cfg); Local.set('codigo', codigo);
        U.toast('Conectando… a página vai recarregar.');
        setTimeout(() => location.reload(), 700);
      };
      const des = U.$('#desligarSync', m.el);
      if (des) des.onclick = () => { Local.set('firebase', null); location.reload(); };
      U.$('#exportar', m.el).onclick = exportar;
      U.$('#importar', m.el).onchange = ev => importar(ev.target.files[0]);
      U.$('#apagarTudo', m.el).onclick = async () => {
        if (await U.confirmar('Apagar TODOS os dados do casal? Isso não pode ser desfeito (faça um backup antes).')) { Store.resetar(); m.fechar(); U.toast('Tudo zerado.'); }
      };
    };
    U.modal({ titulo: '⚙️ Configurações', aoAbrir: desenhar });
  }

  // Aceita tanto JSON quanto o objeto JavaScript copiado do console do Firebase
  function lerConfig(txt) {
    try { return JSON.parse(txt); } catch (e) {}
    const cfg = {}; let m;
    const re = /(\w+)\s*:\s*["']([^"']+)["']/g;
    while ((m = re.exec(txt))) cfg[m[1]] = m[2];
    return Object.keys(cfg).length ? cfg : null;
  }

  async function exportar() {
    const e = Store.get();
    const fotos = {};
    for (const s of e.sonhos) for (const id of s.fotos) { const v = await Fotos.obter(id); if (v) fotos[id] = v; }
    U.baixar(`nosso-cantinho-${U.hoje()}.json`, JSON.stringify({ app: 'nosso-cantinho', estado: e, fotos }));
  }
  async function importar(file) {
    if (!file) return;
    try {
      const dados = JSON.parse(await file.text());
      if (!dados.estado) throw new Error('arquivo inválido');
      if (!(await U.confirmar('Substituir os dados atuais pelos do backup?', { ok: 'Substituir' }))) return;
      for (const [id, v] of Object.entries(dados.fotos || {})) await Fotos.salvar(id, v);
      dados.estado._atualizado = Date.now();
      Store.substituir(dados.estado);
      U.toast('Backup restaurado 💚');
    } catch (err) { U.toast('Não consegui ler esse backup.', 'erro'); }
  }

  function boasVindas() {
    const m = U.modal({
      titulo: '💚 Bem-vindos ao Nosso Cantinho!',
      corpo: `<p>Um cantinho só de vocês para recados, tarefas, sonhos, finanças e agenda.</p>
        <form class="form-grade" id="fBV">
          <label>Seu nome<input name="A" required maxlength="24" autofocus placeholder="Ex.: Bruno"></label>
          <label>Nome do seu amor<input name="B" required maxlength="24" placeholder="Ex.: Ana"></label>
          <div class="botoes larga"><button class="btn primario">Começar ✨</button></div>
        </form>
        <p class="dica">Já começaram no outro celular? Feche esta janela e vá em ⚙️ → Sincronização.</p>`,
    });
    U.$('#fBV', m.el).onsubmit = ev => {
      ev.preventDefault(); const f = ev.target;
      Local.set('eu', 'A');
      Store.atualizar(s => { s.casal.A = f.A.value.trim(); s.casal.B = f.B.value.trim(); });
      m.fechar();
    };
  }

  async function iniciar() {
    U.$('#config').onclick = config;
    U.$('#quemSou').onclick = config;
    U.$('#statusSync').onclick = config;
    window.addEventListener('hashchange', render);
    Store.assinar(agendar);
    Sync.ouvir(() => nav());
    render();
    // espera os dados compartilhados antes de decidir entre boas-vindas e "quem é você?"
    await Sync.iniciar();
    const e = Store.get();
    const semNomes = e.casal.A === 'Amor 1' && e.casal.B === 'Amor 2';
    if (!Local.get().eu && semNomes && !e.diasAtivos.length) boasVindas();
    else if (!Local.get().eu) config();
    // vira o dia com o app aberto: redesenha (ofensiva/agenda)
    let dia = U.hoje();
    setInterval(() => { if (U.hoje() !== dia) { dia = U.hoje(); render(); } }, 60000);
  }

  return { render, iniciar };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.iniciar); else App.iniciar();
