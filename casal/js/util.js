/* Utilitários gerais */
const pad = n => String(n).padStart(2, '0');
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_CURTO = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const SEMANA_LETRA = ['D','S','T','Q','Q','S','S'];

const U = {
  uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  ymd: d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  hoje: () => U.ymd(new Date()),
  parse: s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d || 1); },
  addDias: (s, n) => { const d = U.parse(s); d.setDate(d.getDate() + n); return U.ymd(d); },
  difDias: (a, b) => Math.round((U.parse(b) - U.parse(a)) / 86400000),
  mesAtual: () => U.hoje().slice(0, 7),
  addMes: (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; },
  diasNoMes: ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); },
  nomeMes: ym => { const [y, m] = ym.split('-').map(Number); return `${MESES[m - 1]} ${y}`; },
  dataCurta: s => { const d = U.parse(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; },
  dataLonga: s => { const d = U.parse(s); return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`; },
  money: v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  num: v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; },
  soma: (arr, f = x => x) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0),
  clone: o => JSON.parse(JSON.stringify(o)),

  $: (sel, el = document) => el.querySelector(sel),
  $$: (sel, el = document) => [...el.querySelectorAll(sel)],

  /* Toast */
  toast(msg, tipo = '') {
    let box = U.$('#toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + tipo;
    t.innerHTML = msg;
    box.appendChild(t);
    setTimeout(() => t.classList.add('sai'), 2600);
    setTimeout(() => t.remove(), 3100);
  },

  /* Corações flutuando (efeito fofo) */
  coracoes(x, y, n = 6) {
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'coracao-voa';
      c.textContent = ['💚', '💛', '🖤', '✨'][i % 4];
      c.style.left = x + 'px'; c.style.top = y + 'px';
      c.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      c.style.setProperty('--dy', (-60 - Math.random() * 80) + 'px');
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1100);
    }
  },

  /* Modal genérico */
  modal({ titulo, corpo, largo = false, aoAbrir, aoFechar }) {
    const fundo = document.createElement('div');
    fundo.className = 'modal-fundo';
    fundo.innerHTML = `<div class="modal ${largo ? 'largo' : ''}" role="dialog" aria-modal="true">
      <div class="modal-topo"><h2>${titulo}</h2><button class="btn-icone fechar" aria-label="Fechar">✕</button></div>
      <div class="modal-corpo"></div></div>`;
    const corpoEl = U.$('.modal-corpo', fundo);
    const fechar = () => { fundo.remove(); document.removeEventListener('keydown', esc); aoFechar && aoFechar(); };
    const esc = e => { if (e.key === 'Escape' && fundo === U.$('#modais').lastElementChild) fechar(); };
    const render = html => { corpoEl.innerHTML = typeof html === 'function' ? html() : html; };
    render(corpo);
    fundo.addEventListener('pointerdown', e => { if (e.target === fundo) fundo.dataset.fora = '1'; });
    fundo.addEventListener('click', e => { if (e.target === fundo && fundo.dataset.fora) fechar(); delete fundo.dataset.fora; });
    U.$('.fechar', fundo).onclick = fechar;
    document.addEventListener('keydown', esc);
    U.$('#modais').appendChild(fundo);
    const api = { el: corpoEl, fechar, render };
    aoAbrir && aoAbrir(api);
    const foco = U.$('[autofocus]', corpoEl); foco && setTimeout(() => foco.focus(), 30);
    return api;
  },

  /* Confirmação dentro da página (o claude.ai bloqueia confirm/prompt do navegador) */
  confirmar(msg, { ok = 'Sim, apagar', perigo = true } = {}) {
    return new Promise(res => {
      let resposta = false;
      const m = U.modal({
        titulo: 'Tem certeza?',
        corpo: `<p>${U.esc(msg)}</p><div class="botoes direita"><button class="btn" data-r="0">Cancelar</button><button class="btn ${perigo ? 'perigo' : 'primario'}" data-r="1" autofocus>${U.esc(ok)}</button></div>`,
        aoFechar: () => res(resposta),
      });
      U.$$('[data-r]', m.el).forEach(b => b.onclick = () => { resposta = b.dataset.r === '1'; m.fechar(); });
    });
  },
  /* Pergunta um texto (substitui o prompt do navegador) */
  pedirTexto(titulo, rotulo, placeholder = '') {
    return new Promise(res => {
      let resposta = null;
      const m = U.modal({
        titulo,
        corpo: `<form class="form-grade"><label class="larga">${U.esc(rotulo)}<input name="t" required maxlength="80" placeholder="${U.esc(placeholder)}" autofocus></label>
          <div class="larga botoes direita"><button class="btn primario">Criar</button></div></form>`,
        aoFechar: () => res(resposta),
      });
      U.$('form', m.el).onsubmit = ev => { ev.preventDefault(); resposta = ev.target.t.value.trim() || null; m.fechar(); };
    });
  },

  /* Arrastar e soltar com ponteiro (funciona no celular e no PC) */
  arrastavel(raiz, { item, alvo, aoSoltar, aoTocar }) {
    raiz.addEventListener('pointerdown', e => {
      const el = e.target.closest(item);
      if (!el || !raiz.contains(el) || e.target.closest('button, input, label')) return;
      if (e.button !== undefined && e.button !== 0) return;
      const x0 = e.clientX, y0 = e.clientY;
      let fantasma = null, alvoAtual = null;
      const mover = ev => {
        if (!fantasma) {
          if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 7) return;
          const r = el.getBoundingClientRect();
          fantasma = el.cloneNode(true);
          fantasma.classList.add('fantasma');
          fantasma.style.width = r.width + 'px';
          fantasma._ox = x0 - r.left; fantasma._oy = y0 - r.top;
          document.body.appendChild(fantasma);
          el.classList.add('arrastando');
          document.body.classList.add('modo-arraste');
        }
        ev.preventDefault();
        fantasma.style.left = (ev.clientX - fantasma._ox) + 'px';
        fantasma.style.top = (ev.clientY - fantasma._oy) + 'px';
        const sob = document.elementFromPoint(ev.clientX, ev.clientY);
        const a = sob && sob.closest(alvo);
        if (a !== alvoAtual) { alvoAtual && alvoAtual.classList.remove('sobre'); a && a.classList.add('sobre'); alvoAtual = a; }
      };
      const soltar = ev => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        window.removeEventListener('pointercancel', soltar);
        document.body.classList.remove('modo-arraste');
        if (fantasma) {
          fantasma.remove(); el.classList.remove('arrastando');
          alvoAtual && alvoAtual.classList.remove('sobre');
          if (alvoAtual && ev.type === 'pointerup') aoSoltar(el, alvoAtual, ev);
        } else if (ev.type === 'pointerup' && aoTocar) aoTocar(el, ev);
      };
      window.addEventListener('pointermove', mover, { passive: false });
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', soltar);
    });
  },

  /* Salvar arquivo: no claude.ai usa a capacidade "downloads"; fora dele, um link comum */
  async baixar(nome, texto, tipo = 'application/json') {
    if (window.claude && typeof window.claude.use === 'function') {
      let d = null;
      try { d = await window.claude.use('downloads'); } catch (e) {}
      if (d) {
        try { const r = await d.save({ filename: nome, data: texto }); if (r && r.status === 'saved') U.toast('Backup salvo 💾'); }
        catch (e) { if (e && e.code === 'unavailable') U.toast('Não dá para salvar arquivos aqui.', 'erro'); }
        return;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: tipo }));
    a.download = nome; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};

/* Registro das telas */
const Views = {};
