/* Motor de pixel art: personagens personalizáveis, móveis, cores e ícones */

const Pixel = (() => {
  /* ---------- cores ---------- */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const paraHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const misturar = (a, b, t) => { const x = hex(a), y = hex(b); return paraHex(x.map((v, i) => v + (y[i] - v) * t)); };
  const clarear = (c, t = 0.3) => misturar(c, '#FFFFFF', t);
  const escurecer = (c, t = 0.25) => misturar(c, '#000000', t);

  /* As 10 cores comuns usadas em sofá, TV, rack, roupas e acessórios */
  const CORES = {
    verde: ['Verde', '#3DB56A'], amarelo: ['Amarelo', '#F2C230'], vermelho: ['Vermelho', '#E04848'],
    laranja: ['Laranja', '#F08A2E'], rosa: ['Rosa', '#F28DB2'], roxo: ['Roxo', '#8E5CC8'],
    azul: ['Azul', '#3C8DDE'], marrom: ['Marrom', '#8B5A35'], cinza: ['Cinza', '#9AA0A6'], preto: ['Preto', '#2E2E2E'],
  };
  const EXTRAS = { branco: ['Branco', '#F4F4F4'] };
  const cor = k => (CORES[k] || EXTRAS[k] || CORES.verde)[1];

  const PELES = {
    branco: ['Branca', '#F6D2B8', '#E2AE8C'], pardo: ['Parda', '#D59E6A', '#B57E4C'],
    amarelo: ['Amarela', '#F2D19C', '#D9B277'], negro: ['Negra', '#8A5638', '#6B3F27'],
  };
  const CABELOS = {
    loiro: ['Loiro', '#E2B94F', '#F4D884'], preto: ['Preto', '#2A2124', '#4A3B40'],
    ruivo: ['Ruivo', '#B5481F', '#D8693A'], caramelo: ['Caramelo', '#9A6233', '#C08552'],
    castanho: ['Castanho', '#4E3322', '#6E4B34'],
  };
  const PENTEADOS = { curto: 'Curto', cacheado: 'Cacheado', longo: 'Longo', coque: 'Coque' };
  const ACESSORIOS = { nenhum: 'Nenhum', presilha: 'Presilha', rabico: 'Rabicó', arco: 'Arco', laco: 'Laço', bone: 'Boné', flor: 'Flor' };

  /* ---------- desenho ---------- */
  // Grade de caracteres -> retângulos SVG (junta pixels vizinhos da mesma cor)
  function grade(linhas, pal, x0 = 0, y0 = 0, esc = 1) {
    let out = '';
    linhas.forEach((linha, y) => {
      let x = 0;
      while (x < linha.length) {
        const c = linha[x];
        if (c === '.' || !pal[c]) { x++; continue; }
        let w = 1;
        while (linha[x + w] === c) w++;
        out += `<rect x="${x0 + x * esc}" y="${y0 + y * esc}" width="${w * esc}" height="${esc}" fill="${pal[c]}"/>`;
        x += w;
      }
    });
    return out;
  }
  const sobrepor = (base, camada, inicio = 0) => {
    const r = base.slice();
    camada.forEach((l, i) => {
      const y = inicio + i; if (y >= r.length) return;
      r[y] = [...r[y]].map((c, x) => (l[x] && l[x] !== '.' ? l[x] : c)).join('');
    });
    return r;
  };

  /* ---------- personagem (visto de costas), 16 x 28 ---------- */
  const CORPO = [
    '.....OSSSSO.....',
    '...OOOsSSsOOO...',
    '..OTTTTTTTTTTO..',
    '.OTTTTTTTTTTTTO.',
    'OTTOTTTTTTTTOTTO',
    'OTTOTTTTTTTTOTTO',
    'OTTOTTTTTTTTOTTO',
    'OtTOTTTTTTTTOTtO',
    'OSSOttttttttOSSO',
    '.OO.OPPPPPPO.OO.',
    '....OPPPPPPO....',
    '....OPPOOPPO....',
    '....OPPOOPPO....',
    '....OPPOOPPO....',
    '....OKKOOKKO....',
    '....OOOOOOOO....',
  ];
  const CABECAS = {
    curto: [
      '.....OOOOOO.....',
      '...OOHHHHHHOO...',
      '..OHHHhhHHHHHO..',
      '.OHHHhhHHHHHHHO.',
      '.OHHHHHHHHHHHHO.',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OSHHHHHHHHHHHHSO',
      'OSHHHHHHHHHHHHSO',
      '.OsHHHHHHHHHHsO.',
      '..OOsSSSSSSsOO..',
    ],
    longo: [
      '.....OOOOOO.....',
      '...OOHHHHHHOO...',
      '..OHHHhhHHHHHO..',
      '.OHHHhhHHHHHHHO.',
      '.OHHHHHHHHHHHHO.',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OHHHhHHHHHHhHHHO',
      'OHHHHHHHHHHHHHHO',
    ],
    cacheado: [
      '....OO.OO.OO....',
      '..OOHHOHHOHHOO..',
      '.OHHhHHHHhHHHHO.',
      'OHHHHHhHHHHHhHHO',
      'OHhHHHHHHhHHHHHO',
      'OHHHHhHHHHHHhHHO',
      'OHHHHHHHhHHHHHHO',
      'OHhHHHHHHHHHhHHO',
      'OHHHHHhHHHHHHHHO',
      'OHHhHHHHHHhHHHHO',
      '.OHHHHhHHHHHHHO.',
      '..OHOHHOHHOHOO..',
    ],
    coque: [
      '.....OOOOOO.....',
      '....OHHhHHHO....',
      '....OHhHHHHO....',
      '...OOOxxxxOOO...',
      '.OOHHHHHHHHHHOO.',
      'OHHHhhHHHHHHHHHO',
      'OHHhhHHHHHHHHHHO',
      'OHHHHHHHHHHHHHHO',
      'OSHHHHHHHHHHHHSO',
      'OSHHHHHHHHHHHHSO',
      '.OsHHHHHHHHHHsO.',
      '..OOsSSSSSSsOO..',
    ],
  };
  // Cabelo que cai pelas costas (linhas a partir da 12)
  const CAIMENTO = {
    longo: [
      '..OHHHHHHHHHHO..',
      '..OHHHHHHHHHHO..',
      '..OHHHHHHHHHHO..',
      '...OHHHHHHHHO...',
      '...OHHhHHhHHO...',
      '...OHHHHHHHHO...',
      '....OHHHHHHO....',
      '.....OOOOOO.....',
    ],
    cacheado: [
      '..OHHO....OHHO..',
      '..OOO......OOO..',
    ],
  };
  const ENFEITES = {
    presilha: { inicio: 2, l: ['..........OXXO..', '..........OxXO..', '...........OO...'] },
    arco: { inicio: 2, l: ['.OOOOOOOOOOOOOO.', 'OXXXXXXXXXXXXXXO', 'OxxxxxxxxxxxxxxO'] },
    laco: { inicio: 0, l: ['.........OO.OO..', '........OXXOXXO.', '........OXxXxXO.', '.........OO.OO..'] },
    bone: { inicio: 0, l: ['.....OOOOOO.....', '...OOXXXXXXOO...', '..OXXXXXXXXXXO..', '.OXXXXXxXXXXXXO.', '.OXXXXXXXXXXXXO.', 'OxxxxxxxxxxxxxxO', 'OOOOOOOOOOOOOOOO'] },
    flor: { inicio: 1, l: ['...OXO..........', '..OXYXO.........', '...OXO..........'] },
    rabico: { inicio: 8, l: ['......OXXO......', '......OxxO......', '......OHHO......', '......OHHO......', '......OHhO......', '......OHHO......', '.......OO.......'] },
  };

  function personagem(cfg = {}) {
    const p = { pele: 'branco', cabelo: 'castanho', penteado: 'curto', acessorio: 'nenhum', roupa: 'amarelo', corAcessorio: 'vermelho', ...cfg };
    const pele = PELES[p.pele] || PELES.branco, cab = CABELOS[p.cabelo] || CABELOS.castanho;
    let linhas = [...(CABECAS[p.penteado] || CABECAS.curto), ...CORPO];
    if (CAIMENTO[p.penteado]) linhas = sobrepor(linhas, CAIMENTO[p.penteado], 12);
    const enf = ENFEITES[p.acessorio];
    if (enf) linhas = sobrepor(linhas, enf.l, enf.inicio);
    const roupa = cor(p.roupa), acc = cor(p.corAcessorio);
    const pal = {
      O: '#1E1E1E', H: cab[1], h: cab[2], S: pele[1], s: pele[2], T: roupa, t: escurecer(roupa, 0.2),
      P: '#34407A', K: '#1E1E1E', X: acc, x: escurecer(acc, 0.25), Y: '#FFD23F', W: '#FFFFFF',
    };
    if (p.penteado === 'coque' && !enf) pal.x = escurecer(cab[1], 0.3);
    return { linhas, pal };
  }
  const desenharPersonagem = (cfg, x = 0, y = 0) => { const s = personagem(cfg); return grade(s.linhas, s.pal, x, y); };

  /* ---------- caixas ---------- */
  function caixa(r, x, y, w, h, borda, fill, raio = 2) {
    if (raio <= 0) { r.push(rect(x, y, w, h, borda), rect(x + 1, y + 1, w - 2, h - 2, fill)); return; }
    for (let i = 0; i < raio + 1; i++) r.push(rect(x + raio - i, y + i, w - 2 * (raio - i), h - 2 * i, borda));
    for (let i = 0; i < raio; i++) r.push(rect(x + raio - i, y + 1 + i, w - 2 * (raio - i), h - 2 - 2 * i, fill));
  }
  const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;

  /* ---------- sofá (encosto y 66–99) ---------- */
  const SOFAS = { quadrado: 'Quadrado', arredondado: 'Arredondado', ondulado: 'Ondulado' };
  function sofa(estilo, corK) {
    const r = [], c = cor(corK), cl = clarear(c, 0.25), ce = escurecer(c, 0.2), cb = escurecer(c, 0.12), O = '#1E1E1E';
    r.push(rect(14, 97, 132, 3, 'rgba(0,0,0,.18)'));
    const raio = estilo === 'quadrado' ? 0 : estilo === 'ondulado' ? 2 : 3;
    caixa(r, 13, 71, 15, 28, O, cb, raio); r.push(rect(15, 73, 11, 2, cl));
    caixa(r, 132, 71, 15, 28, O, cb, raio); r.push(rect(134, 73, 11, 2, cl));
    if (estilo === 'ondulado') {
      // três almofadas arredondadas formando ondas no topo
      [[23, 40], [61, 38], [97, 40]].forEach(([x, w]) => { caixa(r, x, 64, w, 16, O, c, 4); r.push(rect(x + 4, 65, w - 8, 2, cl)); });
      r.push(rect(23, 72, 114, 27, O)); r.push(rect(24, 72, 112, 26, c));
      r.push(rect(61, 66, 1, 31, ce)); r.push(rect(98, 66, 1, 31, ce));
    } else {
      caixa(r, 23, 66, 114, 33, O, c, raio);
      r.push(rect(25, 67, 110, 3, cl));
      r.push(rect(52, 71, 1, 26, ce)); r.push(rect(108, 71, 1, 26, ce));
      if (estilo !== 'quadrado') [38, 66, 94, 122].forEach(x => r.push(rect(x, 82, 2, 2, ce)));
    }
    r.push(rect(20, 98, 4, 2, O), rect(136, 98, 4, 2, O));
    return r.join('');
  }

  /* ---------- TV: devolve o desenho e a área da tela ---------- */
  const TVS = { tubo: 'De tubo', plana: 'Tela plana' };
  function tv(estilo, corK) {
    const r = [], c = cor(corK), O = '#1E1E1E', ce = escurecer(c, 0.25);
    if (estilo === 'plana') {
      caixa(r, 36, 9, 88, 42, O, O, 1);
      r.push(rect(38, 11, 84, 38, '#0E2A1A'));
      r.push(rect(36, 49, 88, 2, c));
      r.push(rect(76, 51, 8, 2, O), rect(70, 52, 20, 1, c));
      r.push(rect(118, 49, 2, 1, '#7CFFB0'));
      return { svg: r.join(''), tela: { x: 38, y: 11, w: 84, h: 38 } };
    }
    // TV de tubo com antena e painel de botões
    for (let i = 0; i < 8; i++) { r.push(rect(70 - i, 8 - i, 1, 1, O), rect(86 + i, 8 - i, 1, 1, O)); }
    r.push(rect(61, 0, 2, 2, '#FFD23F'), rect(93, 0, 2, 2, '#FFD23F'));
    caixa(r, 38, 8, 84, 44, O, c, 3);
    r.push(rect(40, 10, 80, 2, clarear(c, 0.3)));
    caixa(r, 41, 11, 64, 38, O, '#0E2A1A', 3);
    r.push(rect(107, 14, 12, 34, ce));
    caixa(r, 109, 16, 8, 8, O, '#FFD23F', 2); r.push(rect(112, 17, 2, 3, O));
    caixa(r, 109, 26, 8, 8, O, '#FFFFFF', 2); r.push(rect(110, 29, 3, 2, O));
    for (let y = 37; y < 47; y += 2) r.push(rect(109, y, 8, 1, O));
    r.push(rect(50, 52, 4, 2, O), rect(106, 52, 4, 2, O));
    return { svg: r.join(''), tela: { x: 43, y: 13, w: 60, h: 34 } };
  }

  /* ---------- rack (y 52–68) ---------- */
  const RACKS = { madeira: 'Madeira', quadrado: 'Quadrado', redondo: 'Redondo' };
  function rack(estilo, corK) {
    const r = [], c = cor(corK), ce = escurecer(c, 0.22), cl = clarear(c, 0.2), O = '#1E1E1E';
    if (estilo === 'madeira') {
      caixa(r, 42, 53, 76, 14, O, c, 1);
      for (let y = 56; y < 66; y += 3) r.push(rect(44, y, 72, 1, ce));
      [[46, 32], [82, 32]].forEach(([x, w]) => { r.push(rect(x, 57, w, 7, O), rect(x + 1, 58, w - 2, 5, cl), rect(x + w / 2 - 2, 60, 4, 1, O)); });
      r.push(rect(45, 67, 3, 2, O), rect(112, 67, 3, 2, O));
    } else if (estilo === 'redondo') {
      caixa(r, 42, 52, 76, 14, O, c, 5);
      r.push(rect(48, 53, 64, 2, cl));
      [62, 80, 98].forEach(x => { r.push(rect(x - 1, 58, 4, 4, O), rect(x, 59, 2, 2, '#FFD23F')); });
      r.push(rect(48, 66, 2, 3, O), rect(110, 66, 2, 3, O));
    } else {
      caixa(r, 42, 52, 76, 16, O, c, 0);
      r.push(rect(43, 53, 74, 2, cl));
      [67, 92].forEach(x => r.push(rect(x, 55, 1, 12, O)));
      [[55, 59], [79, 59], [104, 59]].forEach(([x, y]) => r.push(rect(x, y, 3, 1, O)));
    }
    return r.join('');
  }

  /* ---------- ícones pixelados da barra de cima (12 x 12) ---------- */
  const ICONES = {
    inicio: ['.....OO.....', '....OYYO....', '...OYYYYO...', '..OYYYYYYO..', '.OYYYYYYYYO.', 'OOOOOOOOOOOO', '.OWWWWWWWWO.', '.OWGGWWOOWO.', '.OWGGWWOROO.', '.OWWWWWOROO.', '.OWWWWWOROO.', '.OOOOOOOOOO.'],
    tarefas: ['.........OO.', '........ORO.', '.......ORO..', '......ORO...', '.....ORO....', '....OKO.....', '..OOKKOO....', '.OYYYYYYO...', 'OYYOYYOYO...', 'OYOYYOYYO...', 'OYYOYYOYO...', '.OOOOOOO....'],
    mercado: ['OO..........', '.O..........', '.OOOOOOOOOOO', '.OGGGGGGGGO.', '.OGRRGGYYGO.', '.OGRRGGYYGO.', '..OGGGGGGO..', '..OOOOOOOO..', '...O....O...', '..OOO..OOO..', '..OKO..OKO..', '..OOO..OOO..'],
    sonhos: ['.....OO.....', '.....OY.....', '....OYYO....', 'OOOOOYYOOOOO', 'OYYYYYYYYYYO', '.OYYYYYYYYO.', '..OYYYYYYO..', '..OYYYYYYO..', '.OYYYOOYYYO.', '.OYYO..OYYO.', 'OYOO....OOYO', 'OO........OO'],
    financas: ['.........OOO', '........OYYO', '........OYYO', '....OOO.OYYO', '....OGGOOYYO', '....OGGOOYYO', 'OOO.OGGOOYYO', 'ORROOGGOOYYO', 'ORROOGGOOYYO', 'ORROOGGOOYYO', 'ORROOGGOOYYO', 'OOOOOOOOOOOO'],
    contas: ['OOOOOOOOOOOO', 'OGGGGGGGGGGO', 'OGOOGGGGOOGO', 'OGOGGOOGGOGO', 'OGGGOYYOGGGO', 'OGGGOYYOGGGO', 'OGOGGOOGGOGO', 'OGOOGGGGOOGO', 'OGGGGGGGGGGO', 'OOOOOOOOOOOO', '............', '............'],
    agenda: ['..O....O....', 'OOOOOOOOOOOO', 'ORRRRRRRRRRO', 'ORRRRRRRRRRO', 'OOOOOOOOOOOO', 'OWWWWWWWWWWO', 'OWOOWWOOWWWO', 'OWOOWWOOWWWO', 'OWWWWWWWWWWO', 'OWOOWWGGWWWO', 'OWOOWWGGWWWO', 'OOOOOOOOOOOO'],
    relax: ['............', '..OOOOOOOO..', '.OKKKKKKKKO.', 'OKKOKKKKYKKO', 'OKOOOKKKKKRO', 'OKKOKKKKGKKO', 'OKKKKKKKKKKO', 'OKKOOOOOOKKO', '.OOO....OOO.', '............', '............', '............'],
    config: ['....OOOO....', '..O.OWWO.O..', '.OWOWWWWOWO.', '..OWWOOWWO..', 'OOWWO..OWWOO', 'OWWO....OWWO', 'OWWO....OWWO', 'OOWWO..OWWOO', '..OWWOOWWO..', '.OWOWWWWOWO.', '..O.OWWO.O..', '....OOOO....'],
    coracao: ['............', '.OOO...OOO..', 'OPPPO.OPPPO.', 'OPWPPOPPPPO.', 'OPPPPPPPPPO.', 'OPPPPPPPPPO.', '.OPPPPPPPO..', '..OPPPPPO...', '...OPPPO....', '....OPO.....', '.....O......', '............'],
    pincel: ['.........OO.', '........OYYO', '.......OYYO.', '......OYYO..', '.....OKKO...', '....OKKO....', '...OOOO.....', '..ORRO......', '.ORRRO......', 'ORRRO.......', 'ORRO........', 'OO..........'],
  };
  const PAL_ICONE = { O: '#1E1E1E', Y: '#FFD23F', W: '#FFFFFF', G: '#3DB56A', R: '#E04848', K: '#6B6B6B', P: '#FF6B8B' };
  const icone = (nome, classe = 'pix-icone') =>
    `<svg class="${classe}" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${grade(ICONES[nome], PAL_ICONE)}</svg>`;

  return {
    grade, sobrepor, personagem, desenharPersonagem, caixa, rect, sofa, tv, rack, icone,
    CORES, PELES, CABELOS, PENTEADOS, ACESSORIOS, SOFAS, TVS, RACKS, cor, clarear, escurecer, misturar,
  };
})();
