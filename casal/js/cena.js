/* Sala de estar: desenho da cena (com a decoração escolhida) e as animações dos personagens */

const Cena = (() => {
  const ASSENTO = { A: [58, 50], B: [86, 50] };
  const EM_PE = 40;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const casa = () => ({ ...CASA_PADRAO(), ...(Store.get().casa || {}) });

  function svg() {
    const c = casa();
    const r = [];
    const R = (x, y, w, h, cor) => r.push(Pixel.rect(x, y, w, h, cor));
    const O = '#1E1E1E';

    // parede listrada e piso de madeira
    R(0, 0, 160, 72, '#E5F6EB');
    for (let x = 3; x < 160; x += 10) R(x, 0, 4, 68, '#D6EFDF');
    for (let x = 8; x < 160; x += 20) for (let y = 6; y < 66; y += 14) R(x, y, 1, 1, '#FFFFFF');
    R(0, 66, 160, 2, '#FFFFFF'); R(0, 68, 160, 1, O);
    R(0, 69, 160, 31, '#F6D77A');
    for (let y = 74; y < 100; y += 6) R(0, y, 160, 1, '#E6C155');
    for (let i = 0; i < 8; i++) R((i * 23 + (i % 2) * 9) % 160, 69 + (i % 5) * 6, 1, 5, '#E6C155');

    // quadro com o coração do nível de amor
    Pixel.caixa(r, 10, 12, 22, 22, O, '#FFFFFF');
    R(20, 8, 2, 4, O);
    r.push(`<g transform="translate(12 15) scale(2)">${Amor.coracaoSVG(Amor.medidor())}</g>`);

    // planta: murcha se ninguém regou hoje
    const regada = c.planta === U.hoje();
    if (regada) {
      R(6, 44, 3, 10, '#2E9E5B'); R(10, 39, 3, 15, '#1F7A43'); R(14, 45, 3, 9, '#2E9E5B');
      R(4, 42, 4, 3, '#4CC17A'); R(12, 36, 4, 4, '#4CC17A'); R(15, 43, 4, 3, '#4CC17A'); R(13, 35, 2, 1, '#FF8FA3'); R(5, 41, 2, 1, '#FF8FA3');
    } else {
      R(6, 48, 3, 6, '#7FA34A'); R(10, 44, 3, 10, '#6B8F3A'); R(14, 49, 3, 5, '#7FA34A');
      R(3, 49, 4, 2, '#A8C266'); R(12, 42, 4, 3, '#A8C266'); R(16, 50, 4, 2, '#A8C266');
      r.push('<g class="gota-sede">'); R(3, 36, 2, 1, '#3C8DDE'); R(2, 37, 4, 3, '#3C8DDE'); R(3, 40, 2, 1, '#3C8DDE'); R(3, 37, 1, 1, '#FFFFFF'); r.push('</g>');
    }
    Pixel.caixa(r, 4, 53, 16, 15, O, '#FFD23F'); R(6, 56, 12, 1, '#E5B520');

    // luminária
    r.push('<circle cx="151" cy="32" r="13" fill="#FFD23F" opacity=".22" class="brilho"/>');
    R(150, 34, 2, 33, O); R(145, 66, 12, 3, O);
    R(144, 24, 14, 2, O); R(143, 26, 16, 6, O); R(145, 26, 12, 5, '#FFD23F'); R(144, 31, 14, 1, O);

    // rack e TV
    r.push(Pixel.rack(c.rack.estilo, c.rack.cor));
    const tv = Pixel.tv(c.tv.estilo, c.tv.cor);
    r.push(tv.svg);

    // toca-discos sobre o móvel de discos
    const tocando = !!Musica.atual();
    Pixel.caixa(r, 125, 55, 18, 13, O, '#8B5A35', 1);
    ['#E04848', '#3C8DDE', '#F2C230', '#3DB56A', '#F28DB2', '#8E5CC8'].forEach((cor, i) => R(127 + i * 2, 58, 2, 8, cor));
    R(127, 57, 14, 1, '#5E3B22');
    Pixel.caixa(r, 125, 49, 18, 7, O, '#F4F4F4', 1);
    r.push(`<g class="disco ${tocando ? 'gira' : ''}">`);
    R(129, 49, 8, 1, O); R(128, 50, 10, 2, '#2A2A2A'); R(129, 52, 8, 1, O);
    R(132, 50, 2, 2, '#FFD23F');
    r.push('</g>');
    R(140, 47, 1, 4, '#9AA0A6'); R(138, 50, 3, 1, '#9AA0A6');
    if (tocando) r.push('<g class="notinhas"><text x="131" y="44" font-size="6">♪</text><text x="137" y="40" font-size="5">♫</text></g>');

    // personagens (camada antes do sofá: o encosto esconde o corpo)
    ['A', 'B'].forEach(p => {
      const [x, y] = ASSENTO[p];
      r.push(`<g id="ator-${p}" class="ator" style="transform: translate(${x}px, ${y}px)"><g class="corpo">${Pixel.desenharPersonagem(c[p])}</g><g class="extra"></g></g>`);
    });
    r.push('<g id="efeitos"></g>');

    r.push(Pixel.sofa(c.sofa.estilo, c.sofa.cor));
    return { svg: `<svg class="cena-svg" viewBox="0 0 160 100" shape-rendering="crispEdges" aria-hidden="true">${r.join('')}</svg>`, tela: tv.tela };
  }

  /* ---------- animações ---------- */
  let ocupado = false;
  const ator = p => document.getElementById('ator-' + p);
  async function mover(el, x, y, ms, andando = true) {
    el.classList.toggle('andando', andando);
    el.style.transition = `transform ${ms}ms linear`;
    el.style.transform = `translate(${x}px, ${y}px)`;
    await sleep(ms);
    el.classList.remove('andando');
  }
  const posicao = el => { const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform) || []; return [+m[1] || 0, +m[2] || 0]; };
  async function andarAte(el, x) { const [x0] = posicao(el); await mover(el, x, EM_PE, Math.max(200, Math.abs(x - x0) * 22)); }
  async function levantar(p) { const el = ator(p); const [x] = ASSENTO[p]; await mover(el, x, EM_PE, 260, false); return el; }
  async function sentar(p) { const el = ator(p); const [x, y] = ASSENTO[p]; await andarAte(el, x); await mover(el, x, y, 260, false); }

  async function cena(fn) {
    if (ocupado) return false;
    ocupado = true; App.segurar(true);
    try { await fn(); } finally { ocupado = false; App.segurar(false); }
    return true;
  }

  function regar(p) {
    return cena(async () => {
      const el = await levantar(p);
      await andarAte(el, 23);
      const extra = U.$('.extra', el);
      // regador e gotinhas caindo na planta
      extra.innerHTML = Pixel.rect(-7, 15, 6, 5, '#3C8DDE') + Pixel.rect(-6, 14, 4, 1, '#1E1E1E') + Pixel.rect(-11, 13, 4, 2, '#3C8DDE')
        + Pixel.rect(-2, 16, 2, 1, '#1E1E1E') + '<g class="gotas">' + Pixel.rect(-12, 17, 1, 2, '#7CC4FF') + Pixel.rect(-14, 21, 1, 2, '#7CC4FF') + Pixel.rect(-11, 24, 1, 2, '#7CC4FF') + '</g>';
      await sleep(1700);
      extra.innerHTML = '';
      await sentar(p);
    });
  }

  function beijar(p) {
    const o = p === 'A' ? 'B' : 'A';
    return cena(async () => {
      const el = ator(p), [x, y] = ASSENTO[p];
      const dir = p === 'A' ? 1 : -1;
      await mover(el, x + dir * 8, y - 2, 320, false);
      const ef = document.getElementById('efeitos');
      if (ef) ef.innerHTML = `<g class="beijo-sobe">${Pixel.grade(['.OO.OO.', 'OPPOPPO', 'OPPPPPO', '.OPPPO.', '..OPO..', '...O...'], { O: '#1E1E1E', P: '#FF5C85' }, 77, 40)}</g>`;
      ator(o)?.classList.add('pula');
      await sleep(900);
      ator(o)?.classList.remove('pula');
      if (ef) ef.innerHTML = '';
      await mover(el, x, y, 320, false);
    });
  }

  function irAoTocaDiscos(p) {
    return cena(async () => {
      const el = await levantar(p);
      await andarAte(el, 108);
      el.classList.add('pula'); await sleep(700); el.classList.remove('pula');
      await sentar(p);
    });
  }

  return { svg, regar, beijar, irAoTocaDiscos, ocupado: () => ocupado, casa };
})();
