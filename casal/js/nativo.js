/* Integração com o app Android (APK): widgets, animações da semana e avisos (notificações) */

const Nativo = (() => {
  const ponte = window.AndroidPonte || null;
  const API = window.CONFIG_AVISOS || null;
  const noApp = !!ponte;

  /* ---------- avisos para o celular do outro ---------- */
  function avisar(tipo, texto = '') {
    const { codigo, eu } = Local.get();
    if (!API || !codigo || !eu || Sync.modo() !== 'firebase') return;
    // text/plain evita a checagem extra do navegador (CORS); o servidor lê o JSON
    fetch(API + '/avisar', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify({ casa: codigo, de: eu, tipo, texto: String(texto).slice(0, 300) }) }).catch(() => {});
  }

  /* ---------- dados do widget (mesmas contas da tela inicial) ---------- */
  function dadosWidget() {
    const e = Store.get();
    const msgs = e.mensagens || [];
    const ult = msgs[msgs.length - 1];
    return {
      ofensiva: Store.streak(),
      ativoHoje: (e.diasAtivos || []).includes(U.hoje()),
      recado: ult ? ult.texto : '',
      recadoAutor: ult ? Store.nome(ult.autor) : '',
      prioridades: (e.prioridades || []).filter(p => !p.feito).length,
    };
  }

  /* ---------- 10 animações do casal (uma por semana de ofensiva) ---------- */
  const W = 64, H = 40;
  const MINI = {
    coracao: ['.OO.OO.', 'OPPOPPO', 'OPPPPPO', '.OPPPO.', '..OPO..', '...O...'],
    nota: ['..OO', '..O.', '..O.', 'OOO.', 'OOO.'],
    z: ['OOO', '..O', '.O.', 'O..', 'OOO'],
    estrela: ['.Y.', 'YYY', '.Y.'],
    caneca: ['OOOO.', 'OYYOO', 'OYYO.O', 'OYYOO', 'OOOO.'],
    pipoca: ['.W.W.W.W.', 'OWRWRWRWO', 'ORWRWRWRO', '.ORWRWRO.', '..OOOOO..'],
    lua: ['.YYY.', 'YYY..', 'YY...', 'YYY..', '.YYY.'],
  };
  const PAL = { O: '#1E1E1E', P: '#FF5C85', Y: '#FFD23F', W: '#FFFFFF', R: '#E04848' };
  const mini = (n, x, y, cor) => Pixel.grade(MINI[n], cor ? { ...PAL, O: cor, P: cor } : PAL, x, y);

  // cada animação devolve, para o quadro f (0..3), deslocamentos dos bonecos e enfeites
  const ANIMS = [
    f => ({ a: [0, f % 2], b: [0, (f + 1) % 2], fx: mini('coracao', 29, 6 - f) }),                                     // aconchego
    f => ({ a: [f >= 2 ? 4 : 0, 0], rostoA: f >= 1 ? 'dir' : null, fx: f >= 2 ? mini('coracao', 29, 7 - (f - 2) * 3) : '' }), // beijinho
    f => ({ a: [0, 0], b: [0, 0], fx: mini('pipoca', 28, 24) + [[30, 20 - f], [34, 18 + f % 2], [32, 16 - f]].map(([x, y]) => Pixel.rect(x, y, 1, 1, '#FFFFFF') + Pixel.rect(x, y + 1, 1, 1, '#FFE680')).join('') }), // pipoca
    f => ({ a: [f % 2 ? 1 : -1, f % 2], b: [f % 2 ? -1 : 1, (f + 1) % 2], fx: mini('nota', f % 2 ? 6 : 52, 4 + f % 2) }),  // dancinha
    f => ({ a: [0, f % 2], b: [0, (f + 1) % 2], fx: mini('nota', 26 + f * 2, 10 - f * 2) + mini('nota', 40 - f, 4 + f) }), // música
    f => ({ a: [0, 1], b: [-2, 1], fx: mini('z', 46 + f, 10 - f * 2) + (f > 1 ? mini('z', 50, 3) : '') }),                // soneca
    f => ({ a: [0, 0], b: [0, 0], fx: mini('coracao', 8, 14 - f * 3) + mini('coracao', 30, 8 - f) + mini('coracao', 50, 16 - f * 3) }), // corações
    f => ({ a: [0, 0], b: [0, 0], fx: mini('caneca', 25 + (f >= 2 ? 3 : 0), 14) + mini('caneca', 35 - (f >= 2 ? 3 : 0), 14) + (f >= 2 ? mini('estrela', 31, 9 - (f - 2)) : '') }), // brinde
    f => ({ a: [0, f % 2 ? 0 : 2], b: [0, f % 2 ? 2 : 0], fx: [...Array(12)].map((_, i) => Pixel.rect((i * 13 + f * 7) % 62, (i * 7 + f * 5) % 24, 1, 2, ['#E04848', '#FFD23F', '#3C8DDE', '#3DB56A', '#F28DB2'][i % 5])).join('') }), // comemoração
    f => ({ a: [0, 0], b: [-1, 0], noite: true, fx: mini('lua', 52, 3) + [[6, 4], [18, 9], [40, 3], [30, 12], [10, 14]].map(([x, y], i) => (i + f) % 3 ? mini('estrela', x, y) : Pixel.rect(x + 1, y + 1, 1, 1, '#FFD23F')).join('') }), // estrelas
  ];

  function cenaSVG(c, anim, f) {
    const q = ANIMS[anim](f);
    const r = [], O = '#1E1E1E';
    const parede = q.noite ? '#24305E' : Pixel.parede(c.parede);
    r.push(Pixel.rect(0, 0, W, H, parede));
    if (!q.noite) for (let x = 2; x < W; x += 8) r.push(Pixel.rect(x, 0, 3, 28, Pixel.escurecer(parede, 0.05)));
    r.push(q.fx || '');
    const [ax, ay] = q.a || [0, 0], [bx, by] = q.b || [0, 0];
    r.push(`<g transform="translate(${14 + ax} ${12 + ay})">${Pixel.desenharPersonagem(c.A, 0, 0, q.rostoA || null)}</g>`);
    r.push(`<g transform="translate(${34 + bx} ${12 + by})">${Pixel.desenharPersonagem(c.B)}</g>`);
    // encosto do sofá na frente dos bonecos
    const sofa = Pixel.cor(c.sofa.cor);
    Pixel.caixa(r, 2, 27, 60, 16, O, sofa, 2);
    r.push(Pixel.rect(4, 28, 56, 1, Pixel.clarear(sofa, 0.25)));
    if (anim === 2 || anim === 7) r.push(q.fx); // pipoca e canecas ficam na frente do sofá
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${r.join('')}</svg>`;
  }

  function svgParaPng(svg) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        res(cv.toDataURL('image/png').split(',')[1]);
      };
      img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  async function quadros() {
    const c = Cena.casa();
    const todas = [];
    for (let a = 0; a < ANIMS.length; a++) {
      const fr = [];
      for (let f = 0; f < 4; f++) fr.push(await svgParaPng(cenaSVG(c, a, f)));
      todas.push(fr);
    }
    return todas;
  }

  /* ---------- liga tudo quando está dentro do APK ---------- */
  let ultimoWidget = '', ultimaDeco = '', ultimaCfg = '', timer = null;
  function sincronizar() {
    if (!noApp) return;
    const { codigo, eu } = Local.get();
    const cfg = window.CONFIG_FIREBASE || Local.get().firebase;
    if (codigo && eu && cfg) {
      const json = JSON.stringify({ casa: codigo, eu, apiKey: cfg.apiKey, projectId: cfg.projectId, api: API || '' });
      if (json !== ultimaCfg) { ultimaCfg = json; try { ponte.configurar(json); } catch (e) {} }
    }
    const w = JSON.stringify(dadosWidget());
    if (w !== ultimoWidget) { ultimoWidget = w; try { ponte.widget(w); } catch (e) {} }
    const c = Cena.casa();
    const deco = JSON.stringify([c.A, c.B, c.sofa, c.parede]);
    if (deco !== ultimaDeco) {
      ultimaDeco = deco;
      quadros().then(q => { try { ponte.quadros(JSON.stringify(q)); } catch (e) {} }).catch(() => {});
    }
  }

  function iniciar() {
    if (!noApp) return;
    document.documentElement.classList.add('no-app');
    Store.assinar(() => { clearTimeout(timer); timer = setTimeout(sincronizar, 800); });
    setTimeout(sincronizar, 1500);
  }

  return { iniciar, avisar, noApp, cenaSVG, quadros, notificacoes: () => noApp && ponte.notificacoes && ponte.notificacoes() };
})();
