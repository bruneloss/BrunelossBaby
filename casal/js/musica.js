/* Toca-discos: músicas chiptune originais geradas no navegador (Web Audio), sem arquivos externos */

const Musica = (() => {
  // Cada faixa: andamento, passos por compasso, acordes (fundamental + quinta) e melodia em notas.
  // "_" segura a nota anterior, "-" é pausa. Composições originais feitas para o app.
  const FAIXAS = {
    domingo: {
      nome: 'Sofá de Domingo', estilo: 'lo-fi tranquilo', capa: '#3DB56A', bpm: 84, passos: 8, onda: 'square', bateria: 'k.h.s.h.',
      acordes: [['C3', 'G3'], ['A2', 'E3'], ['F2', 'C3'], ['G2', 'D3'], ['C3', 'G3'], ['A2', 'E3'], ['F2', 'C3'], ['G2', 'D3']],
      melodia: 'E5 _ G5 _ E5 D5 C5 _ | C5 _ E5 _ A5 _ G5 _ | F5 _ E5 _ D5 _ C5 _ | D5 _ _ _ G4 _ _ _ | E5 _ G5 _ C6 _ B5 _ | A5 _ G5 _ E5 _ C5 _ | D5 _ F5 _ E5 _ D5 _ | C5 _ _ _ - - - -',
    },
    valsinha: {
      nome: 'Valsinha Pixel', estilo: 'valsa romântica', capa: '#F28DB2', bpm: 126, passos: 6, onda: 'triangle', bateria: 'k.h.h.',
      acordes: [['G2', 'D3'], ['D3', 'A3'], ['E3', 'B3'], ['C3', 'G3'], ['G2', 'D3'], ['D3', 'A3'], ['C3', 'G3'], ['G2', 'D3']],
      melodia: 'B4 _ D5 _ G5 _ | F#5 _ E5 _ D5 _ | E5 _ G5 _ B5 _ | A5 _ G5 _ E5 _ | D5 _ B4 _ G4 _ | A4 _ F#4 _ A4 _ | G4 _ E5 _ D5 _ | G4 _ _ _ - -',
    },
    bossa: {
      nome: 'Bossa 8-bit', estilo: 'bossa nova de fliperama', capa: '#F2C230', bpm: 112, passos: 8, onda: 'square', bateria: 'k.hk.hs.',
      acordes: [['D3', 'A3'], ['G2', 'D3'], ['C3', 'G3'], ['A2', 'E3'], ['D3', 'A3'], ['G2', 'D3'], ['C3', 'G3'], ['A2', 'E3']],
      melodia: 'A4 _ C5 _ _ F5 _ E5 | D5 _ _ B4 _ _ G4 _ | E5 _ G5 _ _ B5 _ A5 | G5 _ _ E5 _ C#5 _ _ | D5 _ F5 _ _ A5 _ G5 | F5 _ _ D5 _ _ B4 _ | C5 _ E5 _ G5 _ E5 _ | C#5 _ _ _ E5 _ _ _',
    },
    cafe: {
      nome: 'Café da Manhã', estilo: 'animadinha', capa: '#F08A2E', bpm: 132, passos: 8, onda: 'square', bateria: 'k.h.s.hh',
      acordes: [['F2', 'C3'], ['C3', 'G3'], ['D3', 'A3'], ['A#2', 'F3'], ['F2', 'C3'], ['C3', 'G3'], ['D3', 'A3'], ['A#2', 'F3']],
      melodia: 'C5 F5 A5 F5 C6 _ A5 _ | G5 _ E5 _ C5 _ E5 G5 | F5 _ D5 _ A4 _ D5 F5 | D5 _ F5 _ A#5 _ A5 G5 | A5 _ C6 _ A5 _ F5 _ | G5 E5 C5 E5 G5 _ _ _ | F5 A5 D6 _ C6 _ A5 _ | G5 _ E5 _ F5 _ _ _',
    },
    chuva: {
      nome: 'Chuva na Janela', estilo: 'calminha para relaxar', capa: '#3C8DDE', bpm: 72, passos: 8, onda: 'triangle', bateria: '........',
      acordes: [['A2', 'E3'], ['F2', 'C3'], ['C3', 'G3'], ['E2', 'B2'], ['A2', 'E3'], ['F2', 'C3'], ['C3', 'G3'], ['E2', 'B2']],
      melodia: 'E5 _ _ _ C5 _ A4 _ | F5 _ _ _ E5 _ C5 _ | G5 _ _ _ E5 _ C5 _ | G#4 _ B4 _ E5 _ _ _ | A5 _ _ _ E5 _ C5 _ | D5 _ F5 _ A5 _ G5 _ | E5 _ D5 _ C5 _ B4 _ | B4 _ _ _ - - - -',
    },
    cozinha: {
      nome: 'Dança na Cozinha', estilo: 'para dançar juntinhos', capa: '#8E5CC8', bpm: 150, passos: 8, onda: 'square', bateria: 'khshkhsh',
      acordes: [['C3', 'G3'], ['G2', 'D3'], ['A2', 'E3'], ['F2', 'C3'], ['C3', 'G3'], ['G2', 'D3'], ['A2', 'E3'], ['F2', 'C3']],
      melodia: 'C5 E5 G5 C6 G5 E5 C5 E5 | B4 D5 G5 B5 G5 D5 B4 D5 | A4 C5 E5 A5 E5 C5 A4 C5 | F4 A4 C5 F5 C5 A4 F4 A4 | E5 _ E5 _ G5 _ E5 _ | D5 _ D5 _ G5 _ B5 _ | C6 _ B5 _ A5 _ E5 _ | F5 _ A5 _ G5 _ _ _',
    },
  };

  const NOTAS = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  const freq = n => { const m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, (NOTAS[m[1]] + (m[2] - 4) * 12) / 12); };

  let ctx = null, mestre = null, timer = null, atual = null, passo = 0, proximo = 0, ruido = null;
  const ouvintes = new Set();
  let volume = 0.5;
  try { const v = parseFloat(localStorage.getItem('casal.volume')); if (!isNaN(v)) volume = v; } catch (e) {}

  function preparar() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    mestre = ctx.createGain(); mestre.gain.value = volume * 0.22; mestre.connect(ctx.destination);
    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function nota(f, t, dur, tipo, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + Math.max(0.02, dur - 0.06));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(mestre); o.start(t); o.stop(t + dur + 0.02);
  }
  function batida(tipo, t) {
    if (tipo === 'k') { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(g); g.connect(mestre); o.start(t); o.stop(t + 0.16); return; }
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = ruido; f.type = 'highpass'; f.frequency.value = tipo === 'h' ? 7000 : 1800;
    const v = tipo === 'h' ? 0.08 : 0.22, d = tipo === 'h' ? 0.04 : 0.12;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f); f.connect(g); g.connect(mestre); s.start(t); s.stop(t + d + 0.01);
  }

  // Transforma a partitura em eventos com duração (somando os "_")
  function compilar(f) {
    const toks = f.melodia.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
    const mel = [];
    toks.forEach((t, i) => {
      if (t === '_' || t === '-') return;
      let n = 1; while (toks[i + n] === '_') n++;
      mel[i] = { f: freq(t), n };
    });
    return { mel, total: toks.length };
  }

  function agendar() {
    const f = FAIXAS[atual]; if (!f) return;
    const dp = 60 / f.bpm / 2; // duração de um passo (colcheia)
    if (!f._c) f._c = compilar(f);
    while (proximo < ctx.currentTime + 0.15) {
      const i = passo % f._c.total, compasso = Math.floor(i / f.passos), p = i % f.passos;
      const m = f._c.mel[i];
      if (m) nota(m.f, proximo, m.n * dp * 0.95, f.onda, 0.18);
      const [raiz, quinta] = f.acordes[compasso % f.acordes.length];
      if (p === 0) nota(freq(raiz), proximo, dp * 2.6, 'triangle', 0.32);
      else if (p === Math.floor(f.passos / 2)) nota(freq(quinta), proximo, dp * 1.8, 'triangle', 0.26);
      else if (p === f.passos - 2) nota(freq(raiz), proximo, dp * 1.2, 'triangle', 0.2);
      const b = f.bateria[p % f.bateria.length];
      if (b && b !== '.') batida(b, proximo);
      proximo += dp; passo++;
    }
  }

  function tocar(id) {
    if (!FAIXAS[id] || !preparar()) return false;
    if (ctx.state === 'suspended') ctx.resume();
    parar(false);
    atual = id; passo = 0; proximo = ctx.currentTime + 0.08;
    timer = setInterval(agendar, 30); agendar();
    ouvintes.forEach(fn => fn());
    return true;
  }
  function parar(avisar = true) {
    clearInterval(timer); timer = null;
    if (avisar) { atual = null; ouvintes.forEach(fn => fn()); }
  }
  function setVolume(v) {
    volume = v; try { localStorage.setItem('casal.volume', String(v)); } catch (e) {}
    if (mestre) mestre.gain.value = v * 0.22;
  }

  /* O navegador só deixa tocar som depois de um toque: guarda a faixa e começa no primeiro clique */
  let pendente = null;
  function tocarQuandoPuder(id) {
    if (!id || atual === id) return;
    if (ctx && ctx.state === 'running') { tocar(id); return; }
    pendente = id; ouvintes.forEach(fn => fn());
  }
  const destravar = () => {
    if (pendente && !mudo()) { const id = pendente; pendente = null; tocar(id); }
  };
  window.addEventListener('pointerdown', destravar, true);
  window.addEventListener('keydown', destravar, true);

  const mudo = () => { try { return localStorage.getItem('casal.mudo') === '1'; } catch (e) { return false; } };
  function setMudo(v) {
    try { localStorage.setItem('casal.mudo', v ? '1' : '0'); } catch (e) {}
    if (v) parar(); else { const f = Store.get().casa?.musica?.faixa; if (f) tocar(f); }
  }

  return {
    FAIXAS, tocar, parar, tocarQuandoPuder, setVolume, setMudo, mudo,
    atual: () => atual, pendente: () => pendente, volume: () => volume, ouvir: fn => ouvintes.add(fn),
  };
})();
