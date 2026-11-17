/* Casa compartilhada: quem pode mexer, convite para o(a) parceiro(a) e aviso quando só dá para olhar */

const Casa = (() => {
  const LINK = 'https://claude.ai/artifact/NwstwGZofEv7yBzqrqxzse';
  let pode = null, dono = false, aviso = false;

  async function iniciar() {
    if (Sync.modo() !== 'artifact') return;
    let user = null;
    try { user = await window.claude.use('user'); } catch (e) {}
    if (!user) return;
    try { dono = await user.isOwner(); } catch (e) {}
    try { pode = await user.can('data.write'); } catch (e) { pode = null; }
    if (pode === false) semPermissao();
  }

  /* Chamado quando o banco recusa uma gravação ou o claude.ai avisa que é só leitura */
  function semPermissao() {
    pode = false;
    if (aviso) return;
    aviso = true;
    const b = document.createElement('div');
    b.className = 'faixa-aviso';
    b.innerHTML = `<span>👀 <b>Você está só visitando esta casa.</b> O que você muda aqui não fica salvo para o casal.</span>
      <button class="btn mini">Como entrar na casa</button>`;
    U.$('button', b).onclick = convite;
    document.body.insertBefore(b, U.$('main'));
  }

  async function copiar(btn) {
    try { await navigator.clipboard.writeText(LINK); btn.textContent = 'Copiado ✔'; }
    catch (e) { const i = U.$('#linkCasa'); i && (i.select(), (btn.textContent = 'Selecionado: copie com Ctrl+C')); }
  }

  function convite() {
    const artifact = Sync.modo() === 'artifact';
    const m = U.modal({
      titulo: '🏠 Convidar para a casa',
      corpo: !artifact
        ? `<p>Nesta versão (fora do claude.ai) a casa é compartilhada pela sincronização do Firebase: use o mesmo <b>código do casal</b> nos dois aparelhos, em ⚙️ Configurações.</p>`
        : `${pode === false && !dono ? `<p class="caixa-alerta">Você abriu a casa, mas ainda <b>não tem permissão para editar</b>. Peça para quem criou a casa seguir os passos abaixo com o <b>seu e-mail</b> e depois recarregue a página.</p>` : ''}
        <p>A casa é este link. Para o seu amor <b>ver e mexer junto</b>, o convite precisa ser feito por e-mail, como <b>Editor</b>:</p>
        <ol class="passos">
          <li>No topo desta página do claude.ai, toque em <b>Compartilhar</b>.</li>
          <li>Digite o <b>e-mail da conta do claude.ai</b> do seu amor.</li>
          <li>Escolha o nível <b>Editor</b> (pode editar). Os níveis <i>Leitor</i> e <i>Comentarista</i> só deixam olhar.</li>
          <li>Deixe o <b>link público desligado</b>: com ele ligado, quem é de fora só consegue ver.</li>
          <li>Mande o link abaixo. Seu amor entra com aquele e-mail e escolhe “quem é você” em ⚙️.</li>
        </ol>
        <div class="linha-form"><input id="linkCasa" readonly value="${LINK}"><button class="btn primario" id="copiarLink">Copiar link</button></div>
        <p class="dica">Por que isso? O claude.ai só deixa pessoas de fora da sua organização alterarem dados quando são convidadas por e-mail como Editor. Se o seu amor estiver na mesma organização, o nível <i>Colaborador</i> também funciona.</p>`,
    });
    const b = U.$('#copiarLink', m.el); if (b) b.onclick = () => copiar(b);
  }

  return { iniciar, semPermissao, convite, pode: () => pode, dono: () => dono, LINK };
})();
