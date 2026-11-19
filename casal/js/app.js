/* Navegação, configurações e inicialização */

const App = (() => {
  const ROTAS = [
    ['inicio', '🏠', 'Início'], ['tarefas', '🧹', 'Tarefas'], ['mercado', '🛒', 'Mercado'], ['sonhos', '🌈', 'Sonhos'],
    ['financas', '📊', 'Finanças'], ['contas', '💸', 'Contas'], ['agenda', '📅', 'Agenda'], ['relax', '🛋️', 'Relaxamento'],
  ];
  let atual = null, pendente = null, segurando = false, adiado = false;
  /* Enquanto um boneco anda pela sala, não redesenha a tela (senão a animação some) */
  function segurar(v) {
    segurando = v;
    // um redesenho já agendado também espera a animação terminar (senão o boneco "duplica")
    if (v && pendente) { clearTimeout(pendente); pendente = null; adiado = true; }
    if (!v && adiado) { adiado = false; agendar(); }
  }
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
  const agendar = () => {
    if (segurando) { adiado = true; return; }
    clearTimeout(pendente);
    pendente = setTimeout(() => { pendente = null; if (segurando) adiado = true; else render(); }, 0);
  };

  /* A música escolhida é do casal: se o outro trocar, troca aqui também */
  function sincronizarMusica() {
    const f = Store.get().casa?.musica?.faixa || null;
    if (!f) { if (Musica.atual()) Musica.parar(); return; }
    if (f !== Musica.atual() && !Musica.mudo()) Musica.tocarQuandoPuder(f);
  }

  function config() {
    const desenhar = m => {
      const e = Store.get(), L = Local.get();
      const [st, det] = Sync.status();
      m.render(`
        <button class="btn primario largo" id="abrirConvite">🏠 Convidar meu amor para a casa</button>
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
        ${Sync.configFixa() ? `<h3 class="sub">🔄 Casa online</h3><p>Status: <span class="tag ${st === 'on' ? 'ok' : st === 'erro' ? 'perigo' : 'neutro'}">${{ off: 'ainda sem casa', conectando: 'conectando…', on: 'sincronizado ✔', erro: 'erro' }[st]}</span> ${det ? `<small>${U.esc(det)}</small>` : ''}</p>` : `
        <h3 class="sub">🔄 Casa online (os dois celulares juntos)</h3>
        <p>Status: <span class="tag ${st === 'on' ? 'ok' : st === 'erro' ? 'perigo' : 'neutro'}">${{ off: 'só neste aparelho', conectando: 'conectando…', on: 'sincronizado ✔', erro: 'erro' }[st]}</span> ${det ? `<small>${U.esc(det)}</small>` : ''}</p>
        <details class="caixa-detalhe" ${L.firebase ? '' : 'open'}><summary><b>Recebi um link de convite</b></summary>
          <form class="linha-form" id="fEntrar"><input name="link" placeholder="Cole aqui o link de convite" required><button class="btn primario">Entrar</button></form>
        </details>
        <details class="caixa-detalhe" ${L.firebase ? '' : 'open'}><summary><b>Sou quem cria a casa</b> (cola a configuração do Firebase)</summary>
          <p class="dica">Crie o projeto gratuito no Firebase (passo a passo no <b>LEIAME.md</b>) e cole aqui o bloco <code>firebaseConfig</code>. Depois é só mandar o link de convite.</p>
          <form class="form-grade" id="fSync">
            <label class="larga">Configuração do Firebase<textarea name="cfg" rows="5" placeholder='const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... };'>${L.firebase ? U.esc(JSON.stringify(L.firebase, null, 1)) : ''}</textarea></label>
            <div class="botoes larga">${L.firebase ? '<button type="button" class="btn" id="desligarSync">Desligar</button>' : ''}<button class="btn primario">Ligar a casa online</button></div>
          </form>
        </details>`}`}
        ${App.podeInstalar() ? `<h3 class="sub">📲 App no celular</h3>${App.textoInstalar()}` : ''}
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
      U.$('#abrirConvite', m.el).onclick = () => Casa.convite();
      U.$$('[data-eu]', m.el).forEach(b => b.onclick = () => { Local.set('eu', b.dataset.eu); nav(); desenhar(m); agendar(); });
      const fs = U.$('#fSync', m.el);
      if (fs) fs.onsubmit = ev => {
        ev.preventDefault(); const f = ev.target;
        const cfg = lerConfig(f.cfg.value);
        if (!cfg || !cfg.apiKey || !cfg.projectId) return U.toast('Não reconheci a configuração. Cole o bloco firebaseConfig inteiro.', 'erro');
        Local.set('firebase', cfg);
        Sync.novoCodigoSeFaltar();
        Local.set('mostrarConvite', true);
        U.toast('Ligando a casa… o app vai recarregar.');
        setTimeout(() => location.reload(), 700);
      };
      const fe = U.$('#fEntrar', m.el);
      if (fe) fe.onsubmit = ev => {
        ev.preventDefault();
        if (!Sync.lerConvite(ev.target.link.value.trim())) return U.toast('Esse link não parece um convite. Copie o link inteiro que seu amor mandou.', 'erro');
        U.toast('Entrando na casa… o app vai recarregar.');
        setTimeout(() => location.reload(), 700);
      };
      const inst = U.$('#instalarApp', m.el);
      if (inst) inst.onclick = instalar;
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

  /* Instalar como app: Android/Chrome mostram o pedido; no iPhone é pelo menu Compartilhar */
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedidoInstalar = e; });
  const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ehIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const podeInstalar = () => !instalado() && Sync.modo() !== 'artifact' && 'serviceWorker' in navigator;
  const textoInstalar = () => pedidoInstalar
    ? '<button class="btn primario largo" id="instalarApp">📲 Instalar o Nosso Cantinho</button>'
    : ehIphone()
      ? '<p class="dica">No iPhone: abra no <b>Safari</b>, toque em <b>Compartilhar</b> (quadrado com seta) e em <b>Adicionar à Tela de Início</b>. No app instalado, se pedir, cole de novo o link de convite.</p>'
      : '<p class="dica">No Android: abra no <b>Chrome</b>, toque nos <b>⋮</b> e em <b>Instalar app</b> (ou "Adicionar à tela inicial").</p>';
  async function instalar() {
    if (!pedidoInstalar) return;
    pedidoInstalar.prompt();
    await pedidoInstalar.userChoice.catch(() => {});
    pedidoInstalar = null;
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
        <p class="dica">Seu amor já criou a casa? Abra pelo <b>link de convite</b>, ou cole o link em ⚙️ → Casa online.</p>`,
    });
    U.$('#fBV', m.el).onsubmit = ev => {
      ev.preventDefault(); const f = ev.target;
      Local.set('eu', 'A');
      Store.atualizar(s => { s.casal.A = f.A.value.trim(); s.casal.B = f.B.value.trim(); });
      m.fechar();
      if (!Sync.temConfig() && Sync.modo() !== 'artifact') setTimeout(config, 400); // próximo passo: ligar a casa online
      // com o banco configurado, já cria a casa e mostra o convite
      if (Sync.modo() !== 'artifact' && Sync.temConfig()) Sync.criarCasa().then(() => Casa.convite());
    };
  }

  async function iniciar() {
    U.$('#config').onclick = config;
    U.$('#quemSou').onclick = config;
    U.$('#statusSync').onclick = config;
    window.addEventListener('hashchange', render);
    Store.assinar(agendar);
    Store.assinar(sincronizarMusica);
    Musica.ouvir(() => { if (rota() === 'inicio') agendar(); });
    Sync.ouvir(() => nav());
    render();
    // espera os dados compartilhados antes de decidir entre boas-vindas e "quem é você?"
    await Sync.iniciar();
    await Casa.iniciar();
    if (Local.get().mostrarConvite && Sync.linkConvite()) { Local.set('mostrarConvite', false); Casa.convite(); }
    sincronizarMusica();
    const e = Store.get();
    const semNomes = e.casal.A === 'Amor 1' && e.casal.B === 'Amor 2';
    if (!Local.get().eu && semNomes && !e.diasAtivos.length) boasVindas();
    else if (!Local.get().eu) config();
    // vira o dia com o app aberto: redesenha (ofensiva/agenda)
    let dia = U.hoje();
    setInterval(() => { if (U.hoje() !== dia) { dia = U.hoje(); render(); } }, 60000);
  }

  return { render, iniciar, segurar, podeInstalar, textoInstalar };
})();

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.iniciar); else App.iniciar();
