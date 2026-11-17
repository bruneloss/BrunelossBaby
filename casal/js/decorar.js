/* Personalização da casa: visual dos bonecos, sofá, TV e rack */

const Decorar = (() => {
  const ROUPAS = { ...Pixel.CORES, branco: ['Branco', '#F4F4F4'] };
  let aba = null;

  function opcoes(nome, lista, atual, tipo = 'texto') {
    return `<div class="opcoes" role="group" aria-label="${nome}">${Object.entries(lista).map(([k, v]) => {
      if (tipo === 'cor') return `<button class="amostra ${k === atual ? 'ativo' : ''}" data-v="${k}" style="--c:${v[1]}" title="${v[0]}" aria-label="${v[0]}"></button>`;
      if (tipo === 'pele') return `<button class="amostra ${k === atual ? 'ativo' : ''}" data-v="${k}" style="--c:${v[1]}" title="${v[0]}" aria-label="${v[0]}"></button>`;
      return `<button class="opcao-txt ${k === atual ? 'ativo' : ''}" data-v="${k}">${Array.isArray(v) ? v[0] : v}</button>`;
    }).join('')}</div>`;
  }
  const grupo = (titulo, campo, html) => `<div class="grupo-deco" data-campo="${campo}"><h4>${titulo}</h4>${html}</div>`;

  function previa(cfg) {
    return `<svg class="previa-boneco" viewBox="-2 -2 20 32" shape-rendering="crispEdges">${Pixel.desenharPersonagem(cfg)}</svg>`;
  }

  function corpo() {
    const c = Cena.casa(), e = Store.get();
    const abas = [['A', e.casal.A], ['B', e.casal.B], ['sofa', 'Sofá'], ['tv', 'TV e rack']];
    let html = `<div class="segmentado abas-deco">${abas.map(([k, n]) => `<button class="${aba === k ? 'ativo' : ''}" data-aba="${k}">${U.esc(n)}</button>`).join('')}</div>`;
    if (aba === 'A' || aba === 'B') {
      const p = { ...CASA_PADRAO()[aba], ...c[aba] };
      html += `<div class="deco-boneco">${previa(p)}<div class="deco-campos" data-alvo="${aba}">
        ${grupo('Cor da pele', 'pele', opcoes('pele', Pixel.PELES, p.pele, 'pele'))}
        ${grupo('Cor do cabelo', 'cabelo', opcoes('cabelo', Pixel.CABELOS, p.cabelo, 'pele'))}
        ${grupo('Penteado', 'penteado', opcoes('penteado', Pixel.PENTEADOS, p.penteado))}
        ${grupo('Acessório', 'acessorio', opcoes('acessorio', Pixel.ACESSORIOS, p.acessorio))}
        ${p.acessorio !== 'nenhum' ? grupo('Cor do acessório', 'corAcessorio', opcoes('cor do acessório', ROUPAS, p.corAcessorio, 'cor')) : ''}
        ${grupo('Cor da roupa', 'roupa', opcoes('roupa', ROUPAS, p.roupa, 'cor'))}
      </div></div>`;
    } else if (aba === 'sofa') {
      html += `<div class="deco-campos" data-alvo="sofa">
        ${grupo('Estilo do sofá', 'estilo', opcoes('estilo', Pixel.SOFAS, c.sofa.estilo))}
        ${grupo('Cor do sofá', 'cor', opcoes('cor', Pixel.CORES, c.sofa.cor, 'cor'))}</div>`;
    } else {
      html += `<div class="deco-campos" data-alvo="tv">
        ${grupo('Estilo da TV', 'estilo', opcoes('estilo', Pixel.TVS, c.tv.estilo))}
        ${grupo('Cor da TV', 'cor', opcoes('cor', Pixel.CORES, c.tv.cor, 'cor'))}</div>
        <div class="deco-campos" data-alvo="rack">
        ${grupo('Estilo do rack', 'estilo', opcoes('estilo', Pixel.RACKS, c.rack.estilo))}
        ${grupo('Cor do rack', 'cor', opcoes('cor', Pixel.CORES, c.rack.cor, 'cor'))}</div>`;
    }
    return html + '<p class="dica">As mudanças aparecem na sala na hora, para vocês dois.</p>';
  }

  function abrir(qual) {
    aba = qual || Local.get().eu || 'A';
    const m = U.modal({ titulo: '🎨 Decorar a casa', largo: true, aoAbrir: mm => ligar(mm) });
    function ligar(mm) {
      mm.render(corpo());
      U.$$('[data-aba]', mm.el).forEach(b => b.onclick = () => { aba = b.dataset.aba; ligar(mm); });
      U.$$('.deco-campos', mm.el).forEach(box => {
        const alvo = box.dataset.alvo;
        U.$$('.grupo-deco', box).forEach(g => U.$$('[data-v]', g).forEach(b => b.onclick = () => {
          Store.atualizar(s => {
            const base = CASA_PADRAO();
            s.casa = { ...base, ...(s.casa || {}) };
            s.casa[alvo] = { ...base[alvo], ...s.casa[alvo], [g.dataset.campo]: b.dataset.v };
          }, { registrar: false });
          ligar(mm);
        }));
      });
    }
    return m;
  }
  return { abrir };
})();
