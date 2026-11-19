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

## 📲 App no celular, sincronizado entre vocês dois (sem custo)

O Nosso Cantinho vira um **app de celular** (ícone na tela inicial, abre em tela cheia e funciona sem internet). Os dados ficam num **Firebase gratuito** (plano Spark, sem cartão). Quem cria a casa faz os 3 passos abaixo uma vez. Quem é convidado só abre o link.

### Passo 1: publicar o app (GitHub Pages, grátis)
1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `claude/couple-interactive-site-j5q8ln` (ou `main`, se fizer o merge), pasta **`/ (root)`**, e clique em **Save**.
3. Em 1–2 minutos o app fica em: **https://bruneloss.github.io/BrunelossBaby/casal/**

### Passo 2: criar o banco (Firebase, grátis)
1. Entre em <https://console.firebase.google.com> com sua conta Google e clique em **Criar um projeto** (ex.: `nosso-cantinho`). Pode desativar o Google Analytics.
2. No menu: **Criação** (Build) → **Firestore Database** → **Criar banco de dados** → local `southamerica-east1` (São Paulo) → **modo de produção**.
3. Na aba **Regras**, apague tudo, cole o conteúdo do arquivo [`firestore.rules`](firestore.rules) e clique em **Publicar**.
4. Clique na ⚙️ → **Configurações do projeto** → em **Seus apps**, clique no ícone **`</>`** (Web) → dê um nome → **Registrar app**.
5. Copie o bloco que aparece (`const firebaseConfig = { ... };`).

### Passo 3: ligar a casa e convidar
1. Abra o app no celular, digite os dois nomes e toque em **Começar**.
2. Abre a tela **⚙️ → Casa online → "Sou quem cria a casa"**: cole o bloco do Firebase e toque em **Ligar a casa online**.
3. Aparece o **link de convite** → toque em **Enviar pelo WhatsApp**.
4. Seu amor abre o link, escolhe "quem é você" e pronto: o que um faz, o outro vê.

### Instalar como app
- **Android (Chrome):** ⋮ → **Instalar app** (ou ⚙️ → **Instalar o Nosso Cantinho**).
- **iPhone (Safari):** botão **Compartilhar** → **Adicionar à Tela de Início**. No iPhone o app instalado começa vazio: abra ⚙️ → **"Recebi um link de convite"** e cole o link (vale também para quem criou a casa, usando o próprio link de convite).

**Levar os dados da versão do claude.ai:** lá, ⚙️ → **Baixar backup**; no app, ⚙️ → **Restaurar backup**.

> ⚠️ O link de convite tem o código secreto da casa: quem tiver o link entra. Mande só para o seu amor. Se os dois mudarem a mesma coisa no mesmo segundo, vale a última alteração. A cota grátis do Firebase (50 mil leituras e 20 mil gravações por dia) sobra para um casal.
