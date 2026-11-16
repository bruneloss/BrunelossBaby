/* Armazenamento: estado compartilhado do casal, preferências do aparelho, fotos e sincronização */

const TAREFAS_PADRAO = [
  ['🍽️', 'Lavar a louça'], ['🛏️', 'Arrumar a cama'], ['🧹', 'Varrer o chão'], ['🧺', 'Lavar roupa'],
  ['👕', 'Estender / recolher roupa'], ['🗑️', 'Tirar o lixo'], ['🍳', 'Fazer o almoço'], ['🥘', 'Fazer o jantar'],
  ['🚽', 'Limpar o banheiro'], ['🧽', 'Limpar a cozinha'], ['🪴', 'Regar as plantas'], ['🐾', 'Cuidar do pet'],
  ['🛒', 'Ir ao mercado'], ['👔', 'Passar roupa'], ['🪶', 'Tirar o pó'], ['📦', 'Organizar a casa'],
];

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
  });
  const migrar = e => {
    const p = padrao();
    for (const k in p) if (e[k] === undefined) e[k] = p[k];
    e.casal = { ...p.casal, ...e.casal };
    e.tarefas = { ...p.tarefas, ...e.tarefas };
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
      U.toast(`🔥 <b>${n} ${n === 1 ? 'dia seguido' : 'dias seguidos'}</b>! Ofensiva do casal mantida 💚`, 'festa');
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
  function reduzir(file, max = 1100, q = 0.78) {
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

/* Sincronização opcional via Firebase Firestore (para usar em dois celulares) */
const Sync = (() => {
  let ref = null, timer = null, status = 'off', detalhe = '';
  const ouvintes = new Set();
  const setStatus = (s, d = '') => { status = s; detalhe = d; ouvintes.forEach(f => f(s, d)); };
  const carregar = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  const V = '10.12.2';

  async function iniciar() {
    const { firebase: cfg, codigo } = Local.get();
    if (!cfg || !codigo) { setStatus('off'); return; }
    setStatus('conectando');
    try {
      await carregar(`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`);
      await carregar(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore-compat.js`);
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
      const db = firebase.firestore(app);
      ref = db.collection('casais').doc(codigo);
      ref.onSnapshot(snap => {
        if (snap.metadata.hasPendingWrites) return;
        const local = Store.get();
        if (!snap.exists) { enviar(true); setStatus('on'); return; }
        const d = snap.data();
        if ((d.atualizado || 0) > (local._atualizado || 0)) {
          try { Store.substituir(JSON.parse(d.estado), { silencioso: true }); } catch (e) { console.error(e); }
        } else if ((d.atualizado || 0) < (local._atualizado || 0)) enviar(true);
        setStatus('on');
      }, err => setStatus('erro', err.message));
    } catch (e) { setStatus('erro', e.message || String(e)); }
  }

  function enviar(agora = false) {
    if (!ref) return;
    clearTimeout(timer);
    const fazer = () => {
      const e = Store.get();
      ref.set({ estado: JSON.stringify(e), atualizado: e._atualizado || Date.now(), por: Local.get().deviceId })
        .catch(err => setStatus('erro', err.message));
    };
    agora === true ? fazer() : (timer = setTimeout(fazer, 600));
  }
  const enviarFoto = (id, data) => ref && ref.collection('fotos').doc(id).set({ data }).catch(err => setStatus('erro', err.message));
  const apagarFoto = id => ref && ref.collection('fotos').doc(id).delete().catch(() => {});
  async function baixarFoto(id) {
    if (!ref) return null;
    try { const s = await ref.collection('fotos').doc(id).get(); return s.exists ? s.data().data : null; } catch (e) { return null; }
  }
  return { iniciar, enviar, enviarFoto, apagarFoto, baixarFoto, status: () => [status, detalhe], ouvir: f => ouvintes.add(f) };
})();
