/* Armazenamento: estado compartilhado do casal, preferências do aparelho, fotos e sincronização */

const TAREFAS_PADRAO = [
  ['🍽️', 'Lavar a louça'], ['🛏️', 'Arrumar a cama'], ['🧹', 'Varrer o chão'], ['🧺', 'Lavar roupa'],
  ['👕', 'Estender / recolher roupa'], ['🗑️', 'Tirar o lixo'], ['🍳', 'Fazer o almoço'], ['🥘', 'Fazer o jantar'],
  ['🚽', 'Limpar o banheiro'], ['🧽', 'Limpar a cozinha'], ['🪴', 'Regar as plantas'], ['🐾', 'Cuidar do pet'],
  ['🛒', 'Ir ao mercado'], ['👔', 'Passar roupa'], ['🪶', 'Tirar o pó'], ['📦', 'Organizar a casa'],
];

/* Decoração padrão da casa (bonecos, sofá, TV, rack, música) */
const CASA_PADRAO = () => ({
  A: { pele: 'branco', cabelo: 'castanho', penteado: 'curto', acessorio: 'nenhum', roupa: 'amarelo', corAcessorio: 'vermelho' },
  B: { pele: 'branco', cabelo: 'ruivo', penteado: 'longo', acessorio: 'laco', roupa: 'branco', corAcessorio: 'amarelo' },
  sofa: { estilo: 'arredondado', cor: 'verde' },
  tv: { estilo: 'tubo', cor: 'verde' },
  rack: { estilo: 'redondo', cor: 'preto' },
  musica: { faixa: null },
  votos: {},
  planta: '',
  parede: 'menta',
  piso: 'mel',
  relax: { parede: 'creme', tapete: 'verde', piso: 'claro' },
});

/* Preferências só deste aparelho (quem está usando, config de sincronização) */
const Local = (() => {
  const KEY = 'casal.local.v1';
  let p = {};
  try { p = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { p = {}; }
  if (!p.deviceId) p.deviceId = U.uid();
  const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  salvar();
  return { get: () => p, set: (k, v) => { p[k] = v; salvar(); } };
})();

const Store = (() => {
  const KEY = 'casal.estado.v1';
  const padrao = () => ({
    versao: 1,
    _atualizado: 0,
    casal: { A: 'Amor 1', B: 'Amor 2', desde: '' },
    diasAtivos: [],
    mensagens: [],
    prioridades: [],
    tarefas: { modelos: TAREFAS_PADRAO.map(([icone, nome]) => ({ id: U.uid(), icone, nome })), dias: {} },
    mercado: [],
    sonhos: [],
    financas: {},
    contas: [],
    agenda: [],
    indicacoes: [],
    amor: { total: 0, dias: {} },
    casa: CASA_PADRAO(),
  });
  const migrar = e => {
    const p = padrao();
    for (const k in p) if (e[k] === undefined) e[k] = p[k];
    e.casal = { ...p.casal, ...e.casal };
    e.tarefas = { ...p.tarefas, ...e.tarefas };
    e.casa = { ...p.casa, ...e.casa };
    e.amor = { ...p.amor, ...e.amor };
    return e;
  };
  let estado;
  try { const raw = localStorage.getItem(KEY); estado = raw ? migrar(JSON.parse(raw)) : padrao(); } catch (e) { estado = padrao(); }

  const subs = new Set();
  const emit = () => subs.forEach(f => f(estado));
  const salvarLocal = () => {
    try { localStorage.setItem(KEY, JSON.stringify(estado)); }
    catch (e) { U.toast('⚠️ Sem espaço para salvar no navegador. Faça um backup.', 'erro'); }
  };

  function streak() {
    const set = new Set(estado.diasAtivos);
    let d = U.hoje();
    if (!set.has(d)) d = U.addDias(d, -1);
    let n = 0;
    while (set.has(d)) { n++; d = U.addDias(d, -1); }
    return n;
  }

  /* Toda alteração passa por aqui. registrar=true conta o dia na ofensiva. */
  function atualizar(fn, { registrar = true } = {}) {
    fn(estado);
    let novoDia = false;
    const h = U.hoje();
    if (registrar && !estado.diasAtivos.includes(h)) { estado.diasAtivos.push(h); novoDia = true; }
    estado._atualizado = Date.now();
    salvarLocal();
    Sync.enviar();
    emit();
    if (novoDia) {
      const n = streak();
      U.toast(`❤️‍🔥 <b>${n} ${n === 1 ? 'dia seguido' : 'dias seguidos'}</b>! Ofensiva do casal mantida 💚`, 'festa');
    }
  }

  function substituir(novo, { silencioso = false } = {}) {
    estado = migrar(novo);
    salvarLocal();
    emit();
    if (!silencioso) Sync.enviar();
  }

  const nome = p => p === 'A' ? estado.casal.A : p === 'B' ? estado.casal.B : 'Ambos';

  return {
    get: () => estado, atualizar, substituir, streak, nome, padrao,
    assinar: f => (subs.add(f), () => subs.delete(f)),
    resetar: () => { const n = padrao(); n._atualizado = Date.now(); substituir(n); },
  };
})();

/* Fotos ficam no IndexedDB (cabem bem mais que no localStorage) */
const Fotos = (() => {
  let dbp;
  const cache = new Map();
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('casal-fotos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fotos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (modo, fn) => {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction('fotos', modo);
      const req = fn(t.objectStore('fotos'));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  };
  async function salvar(id, dataUrl, { enviar = true } = {}) {
    cache.set(id, dataUrl);
    await tx('readwrite', s => s.put(dataUrl, id));
    if (enviar) Sync.enviarFoto(id, dataUrl);
  }
  async function obter(id) {
    if (cache.has(id)) return cache.get(id);
    let v = await tx('readonly', s => s.get(id)).catch(() => null);
    if (!v) { v = await Sync.baixarFoto(id); if (v) await salvar(id, v, { enviar: false }); }
    if (v) cache.set(id, v);
    return v;
  }
  async function apagar(id) { cache.delete(id); await tx('readwrite', s => s.delete(id)); Sync.apagarFoto(id); }

  /* Reduz a imagem para economizar espaço */
  async function reduzir(file) {
    let d = await reduzirCom(file, 1000, 0.75);
    if (d.length > 240000) d = await reduzirCom(file, 760, 0.62);
    if (d.length > 240000) d = await reduzirCom(file, 560, 0.55);
    return d;
  }
  function reduzirCom(file, max, q) {
    return new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', q));
      };
      img.onerror = rej;
      img.src = url;
    });
  }
  /* Preenche <img data-foto="id"> depois de renderizar */
  function hidratar(raiz = document) {
    U.$$('img[data-foto]', raiz).forEach(async img => {
      const v = await obter(img.dataset.foto);
      if (v) img.src = v; else img.classList.add('sem-foto');
    });
  }
  return { salvar, obter, apagar, reduzir, hidratar };
})();

/* Sincronização: no claude.ai usa o banco compartilhado do Artifact; fora dele, Firebase (opcional) */
const Sync = (() => {
  let ref = null, timer = null, status = 'off', detalhe = '';
  let modo = 'local', adb = null, carregado = false, fila = Promise.resolve();
  let prontoRes; const pronto = new Promise(r => (prontoRes = r));
  const enviados = {};
  const ouvintes = new Set();
  const setStatus = (s, d = '') => { status = s; detalhe = d; ouvintes.forEach(f => f(s, d)); };
  const carregar = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  const V = '10.12.2';
  const CHAVES = ['casal', 'diasAtivos', 'mensagens', 'prioridades', 'tarefas', 'mercado', 'sonhos', 'contas', 'agenda', 'indicacoes', 'amor', 'casa'];

  /* Mantém os documentos pequenos: recados de até 6 meses e tarefas de até 4 meses */
  function podar(e) {
    const lm = U.addDias(U.hoje(), -180), lt = U.addDias(U.hoje(), -120);
    e.mensagens = e.mensagens.filter(m => m.data >= lm);
    for (const d in e.tarefas.dias) if (d < lt) delete e.tarefas.dias[d];
    const la = U.addDias(U.hoje(), -60);
    if (e.amor && e.amor.dias) for (const d in e.amor.dias) if (d < la) delete e.amor.dias[d];
  }
  /* Cada seção vira um documento (finanças: um por mês), para edições em abas diferentes não se atropelarem */
  function partes(e) {
    podar(e);
    const p = {};
    CHAVES.forEach(k => { p[k] = JSON.stringify(e[k]); });
    Object.keys(e.financas).forEach(ym => { p['fin-' + ym] = JSON.stringify(e.financas[ym]); });
    return p;
  }

  async function iniciarArtifact() {
    if (!window.claude || typeof window.claude.use !== 'function') return false;
    let db = null;
    try { db = await window.claude.use('db'); } catch (e) { db = null; }
    if (!db) return false;
    modo = 'artifact'; adb = db; setStatus('conectando');
    const t = setTimeout(() => { setStatus('erro', 'Os dados compartilhados ainda não responderam. Continuo tentando.'); prontoRes(); }, 10000);
    db.collection('estado').onSnapshot(snap => {
      const e = U.clone(Store.get());
      let mudou = false;
      snap.docs.forEach(d => {
        const v = (d.data() || {}).v;
        if (typeof v !== 'string' || enviados[d.id] === v) return;
        enviados[d.id] = v; mudou = true;
        try { const val = JSON.parse(v); if (d.id.startsWith('fin-')) e.financas[d.id.slice(4)] = val; else e[d.id] = val; } catch (x) {}
      });
      if (mudou) Store.substituir(e, { silencioso: true });
      if (!snap.metadata.fromCache) {
        clearTimeout(t);
        setStatus('on');
        if (!carregado) { carregado = true; enviar(true); prontoRes(); }
      }
    }, err => { clearTimeout(t); setStatus('erro', err.message); prontoRes(); });
    return true;
  }

  const configFirebase = () => Local.get().firebase || window.CONFIG_FIREBASE || null;
  const novoCodigo = () => 'casa-' + Array.from(crypto.getRandomValues(new Uint8Array(9)), b => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');

  /* Abriu pelo link de convite (?casa=CODIGO): entra na casa */
  function lerConvite() {
    try {
      const c = new URLSearchParams(location.search).get('casa');
      if (c && /^[A-Za-z0-9_-]{6,}$/.test(c) && c !== Local.get().codigo) { Local.set('codigo', c); return true; }
    } catch (e) {}
    return false;
  }

  /* Resolve quando chega a primeira resposta do banco (ou após 8 s) */
  async function iniciarFirebase() {
    lerConvite();
    const cfg = configFirebase(), { codigo } = Local.get();
    if (!cfg || !codigo) { setStatus('off'); return; }
    modo = 'firebase'; setStatus('conectando');
    let pronto1; const primeira = new Promise(r => (pronto1 = r));
    setTimeout(pronto1, 8000);
    try {
      await carregar(`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`);
      await carregar(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore-compat.js`);
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
      const db = firebase.firestore(app);
      ref = db.collection('casais').doc(codigo);
      ref.onSnapshot(snap => {
        if (snap.metadata.hasPendingWrites) return;
        const local = Store.get();
        if (!snap.exists) { enviar(true); setStatus('on'); pronto1(); return; }
        const d = snap.data();
        if ((d.atualizado || 0) > (local._atualizado || 0)) {
          try { Store.substituir(JSON.parse(d.estado), { silencioso: true }); } catch (e) { console.error(e); }
        } else if ((d.atualizado || 0) < (local._atualizado || 0)) enviar(true);
        setStatus('on'); pronto1();
      }, err => { setStatus('erro', err.message); pronto1(); });
    } catch (e) { setStatus('erro', e.message || String(e)); pronto1(); }
    return primeira;
  }

  /* Cria a casa do casal (código secreto) e começa a sincronizar */
  async function criarCasa() {
    if (!configFirebase()) return null;
    if (!Local.get().codigo) Local.set('codigo', novoCodigo());
    if (modo !== 'firebase') await iniciarFirebase();
    return Local.get().codigo;
  }
  const linkConvite = () => {
    const c = Local.get().codigo; if (!c) return null;
    return location.origin + location.pathname + '?casa=' + encodeURIComponent(c);
  };

  /* Resolve quando os dados compartilhados chegaram (ou desistiu de esperar) */
  async function iniciar() {
    if (await iniciarArtifact()) return pronto;
    return iniciarFirebase();
  }

  function enviar(agora = false) {
    clearTimeout(timer);
    if (modo === 'artifact') {
      if (!carregado) return; // nunca sobrescreve o banco antes de ler o que já existe
      const fazer = () => {
        const p = partes(Store.get());
        for (const [k, v] of Object.entries(p)) {
          if (enviados[k] === v) continue;
          enviados[k] = v;
          if (v.length > 250000) U.toast('⚠️ A seção "' + k + '" ficou grande demais. Apague itens antigos.', 'erro');
          fila = fila.then(() => adb.doc('estado/' + k).set({ v, t: Date.now() })).catch(err => {
            if (err.code === 'invalid_argument' && v.length < 250000) { enviados[k] = undefined; Casa.semPermissao(); setStatus('erro', 'Sem permissão para salvar nesta casa.'); return; }
            setStatus('erro', err.code === 'quota_exceeded' ? 'O espaço do banco encheu. Apague fotos ou dados antigos.' : err.message);
          });
        }
      };
      agora === true ? fazer() : (timer = setTimeout(fazer, 500));
      return;
    }
    if (!ref) return;
    const fazer = () => {
      const e = Store.get();
      ref.set({ estado: JSON.stringify(e), atualizado: e._atualizado || Date.now(), por: Local.get().deviceId })
        .catch(err => setStatus('erro', err.message));
    };
    agora === true ? fazer() : (timer = setTimeout(fazer, 600));
  }

  const docFoto = id => modo === 'artifact' ? adb.doc('fotos/' + id) : ref ? ref.collection('fotos').doc(id) : null;
  function enviarFoto(id, data) { const d = docFoto(id); return d ? d.set({ data }).catch(err => setStatus('erro', err.message)) : null; }
  function apagarFoto(id) { const d = docFoto(id); return d ? d.delete().catch(() => {}) : null; }
  async function baixarFoto(id) {
    const d = docFoto(id); if (!d) return null;
    try { const s = await d.get(); return s.exists ? s.data().data : null; } catch (e) { return null; }
  }
  return {
    iniciar, enviar, enviarFoto, apagarFoto, baixarFoto, criarCasa, linkConvite,
    temConfig: () => !!configFirebase(), configFixa: () => !!window.CONFIG_FIREBASE,
    status: () => [status, detalhe], ouvir: f => ouvintes.add(f), modo: () => modo,
  };
})();
