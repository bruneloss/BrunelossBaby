# 💚 Nosso Cantinho

Site para o casal usar junto: recadinhos na TV, ofensiva de dias, prioridades, tarefas, mercado, sonhos, finanças, contas e agenda.

Ele é feito só com HTML, CSS e JavaScript, sem instalação nem servidor próprio.

## Como abrir

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
| 📅 **Agenda** | Visões de mês, semana e lista, no estilo do Google Agenda. Tipos: evento, aniversário (repete todo ano), data importante e rotina (escolha os dias da semana). Cores: verde para a pessoa 1, amarelo para a pessoa 2 e preto para os dois. |

Em ⚙️ **Configurações**: nomes, "juntos desde", quem está usando o aparelho, sincronização e backup.

## Onde os dados ficam

Por padrão, tudo fica **salvo no navegador** do aparelho (localStorage; as fotos ficam no IndexedDB). Use ⚙️ → **Baixar backup** de vez em quando.

## Usar nos dois celulares (sincronização gratuita com Firebase)

1. Entre em <https://console.firebase.google.com> e clique em **Adicionar projeto** (o plano gratuito Spark é suficiente).
2. No menu, abra **Build → Firestore Database → Criar banco de dados** e escolha uma região, por exemplo `southamerica-east1`.
3. Na aba **Regras** do Firestore, cole o texto abaixo e publique:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /casais/{codigo} {
         allow read, write: if codigo.size() >= 6;
         match /fotos/{foto} { allow read, write: if codigo.size() >= 6; }
       }
     }
   }
   ```
4. Em **Configurações do projeto (⚙️) → Seus apps**, clique no ícone **Web `</>`** e registre um app. Copie o bloco `firebaseConfig = { ... }`.
5. No site, abra ⚙️ → **Usar nos dois celulares**:
   - cole o `firebaseConfig`;
   - escolham um **código do casal** difícil de adivinhar, por exemplo `bruno-ana-x7k29q`;
   - clique em **Conectar**.
6. Repita o passo 5 no outro celular, **com o mesmo código**. Em cada aparelho, escolha quem está usando.

A bolinha ao lado do ⚙️ fica **verde** quando está sincronizado.

> ⚠️ **Privacidade:** essas regras são simples. Qualquer pessoa que tiver a configuração do Firebase **e** o código do casal consegue ver os dados. Por isso, use um código longo e não compartilhe. Se a última alteração foi feita nos dois aparelhos ao mesmo tempo, vale a versão salva por último.
