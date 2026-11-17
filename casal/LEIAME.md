# 💚 Nosso Cantinho

Site para o casal usar junto: recadinhos na TV, ofensiva de dias, prioridades, tarefas, mercado, sonhos, finanças, contas e agenda.

Ele é feito só com HTML, CSS e JavaScript, sem instalação nem servidor próprio.

## Como abrir

- **Mais fácil — link do claude.ai:** <https://claude.ai/artifact/NwstwGZofEv7yBzqrqxzse>
  Os dados ficam guardados no claude.ai e são compartilhados entre vocês dois automaticamente (sem Firebase).
  **Para o seu amor entrar na casa e editar junto:** em **Compartilhar**, convide o e-mail da conta claude.ai dele(a) como **Editor** e deixe o **link público desligado**. Pessoas de fora da sua organização só conseguem salvar alterações assim; pelo link público (ou como Leitor/Comentarista) elas só veem. Dentro do site: ⚙️ → **Convidar meu amor para a casa**.
  Para atualizar essa versão, publique `casal/artifact.html` junto com as pastas `css/` e `js/`.

- **No computador:** abra o arquivo `casal/index.html` no navegador.
- **No celular (recomendado):** publique pelo GitHub Pages:
  1. No GitHub, abra o repositório e vá em **Settings → Pages**.
  2. Em *Source*, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)` e salve.
  3. O site fica em `https://<seu-usuario>.github.io/<repositorio>/casal/`.
  4. No celular, abra o link e use **"Adicionar à tela inicial"** para ele virar um "app".

## O que tem em cada aba

| Aba | O que faz |
|---|---|
| 🏠 **Início** | Casal pixelado no sofá vendo TV. **A TV** mostra os recadinhos do dia, um de cada vez (toque nela para escrever). **O quadro no sofá** mostra a ofensiva 🔥, os dias seguidos em que vocês registraram algo (igual ao Duolingo). **O alerta vermelho** pisca quando há prioridades do dia ou contas vencendo. Marque para concluir. |
| 🧹 **Tarefas** | Duas colunas com o nome de cada um (dá para editar o nome ali mesmo). Arraste as tarefas comuns para quem vai fazer. No celular também dá para tocar e escolher. Arraste de volta para a lista para remover. "Repetir dia anterior" copia a divisão de ontem. |
| 🛒 **Mercado** | Tabela com item, quantidade (+/−) e check de comprado. Tem botão para copiar a lista e mandar no WhatsApp. |
| 🌈 **Sonhos** | Cada sonho é uma pasta com fotos, descrição, ideias e checklist com barra de progresso. |
| 📊 **Finanças** | Segue o modelo da planilha: **Renda** (recebido / utilizado / atual, separando conta e vale alimentação), **Despesas fixas**, **Despesas variáveis**, **Investimentos** (com total acumulado por destino). Tem uma visão por pessoa e a visão **Casal**, com o comparativo e o resumo do ano. "Copiar do mês anterior" repete a renda e as despesas fixas. |
| 💸 **Contas** | Contas com dia de vencimento, valor (ajustável por mês), forma de pagamento e quem paga (um, outro ou ambos, dividido). **Ligações:** entram automaticamente nas despesas fixas de quem paga, aparecem no alerta 🚨 quando faltam 3 dias ou menos (ou se estão atrasadas) e também aparecem na agenda. |
| 🛋️ **Relaxamento** | Escritório do casal: estante de livros, computadores (séries), videogame e estante de DVDs. Toque nos móveis para indicar livros, filmes, séries e jogos um para o outro, marcar o andamento e dar estrelas. As estantes enchem conforme as indicações. |
| 📅 **Agenda** | Visões de mês, semana e lista, no estilo do Google Agenda. Tipos: evento, aniversário (repete todo ano), data importante e rotina (escolha os dias da semana). Cores: verde para a pessoa 1, amarelo para a pessoa 2 e preto para os dois. |

Na sala também dá para: **decorar** (🖌️ Decorar: pele, cabelo, penteado, acessório e roupa de cada boneco; estilo e cor do sofá, da TV e do rack), **tocar o seu boneco** para agir, **tocar no seu amor** para dar um beijinho, **regar a planta** (ela murcha se ninguém regar no dia) e escolher um disco no **toca-discos** (músicas 8-bit originais, com 👍/👎). O **coração no quadro** mostra o nível de amor: enche com recados, tarefas, beijinhos e outras interações do dia, e os pontos somam para subir de nível.

Em ⚙️ **Configurações**: nomes, "juntos desde", quem está usando o aparelho, sincronização e backup.

## Onde os dados ficam

Por padrão, tudo fica **salvo no navegador** do aparelho (localStorage; as fotos ficam no IndexedDB). Use ⚙️ → **Baixar backup** de vez em quando.

## Casa compartilhada com link de convite (recomendado para editar juntos)

No claude.ai, quem é de fora da sua organização só consegue **ver** o link. Para os dois **editarem juntos**, use esta versão no GitHub Pages com um banco Firebase gratuito. Você só configura uma vez:

### 1. Criar o banco (Firebase, grátis)
1. Acesse <https://console.firebase.google.com> e clique em **Criar projeto** (pode desativar o Google Analytics).
2. No menu da esquerda: **Criação → Firestore Database → Criar banco de dados**. Escolha `southamerica-east1` e o **modo de produção**.
3. Na aba **Regras**, apague tudo, cole o texto abaixo e clique em **Publicar**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /casais/{codigo} {
         allow read, write: if codigo.size() >= 10;
         match /fotos/{foto} { allow read, write: if codigo.size() >= 10; }
       }
     }
   }
   ```
4. Clique na engrenagem ⚙️ → **Configurações do projeto** → em "Seus apps", clique no ícone **`</>`** (Web), dê um nome e registre.
5. Copie o bloco `firebaseConfig = { ... }` que aparece.

### 2. Colocar a configuração no site
Abra o arquivo **`casal/js/config.js`** e troque `window.CONFIG_FIREBASE = null;` pelo bloco copiado:
```js
window.CONFIG_FIREBASE = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```
Você pode editar direto no GitHub (abra o arquivo e clique no lápis ✏️) ou me pedir que eu coloque.

### 3. Publicar no GitHub Pages
1. No repositório, vá em **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch (a `main`, depois do merge) e a pasta `/ (root)`. Salve.
3. Em 1–2 minutos o site fica em `https://<seu-usuario>.github.io/<repositório>/casal/`.
   (No plano gratuito do GitHub, o Pages exige repositório público.)

### 4. Criar a casa e convidar
1. Abra o site, digite os dois nomes e clique em **Começar**. A casa é criada e aparece o **link de convite**.
2. Mande o link (botão **Enviar pelo WhatsApp**). Quem abrir por ele entra na mesma casa e escolhe "quem é você".
3. O convite fica sempre em ⚙️ → **Convidar meu amor para a casa**. A bolinha ao lado do ⚙️ fica verde quando está sincronizado.

**Levar os dados do claude.ai para cá:** na versão do claude.ai, ⚙️ → **Baixar backup**; no site novo, ⚙️ → **Restaurar backup**.

> ⚠️ O link de convite contém o código secreto da casa: quem tiver o link entra. Mande só para o seu amor. Se dois editarem a mesma coisa no mesmo segundo, vale a última alteração.
