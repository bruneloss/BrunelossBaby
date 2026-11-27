#!/usr/bin/env bash
# Publica na Cloudflare: primeiro o site com o APK e a API de avisos (o essencial),
# depois os lembretes agendados (se falharem, o app continua publicado).
set -euo pipefail
cd "$(dirname "$0")/.."
W="npx --yes wrangler@3.78.12"
PROJETO=brunelossbaby-cantinho
CONTA=55b9892cfff71d18ba54c2ded7f64666
API="https://api.cloudflare.com/client/v4/accounts/$CONTA"
AUT="Authorization: Bearer $CLOUDFLARE_API_TOKEN"

echo "== Site do APK + API de avisos (Pages)"
cp ../android/app/build/outputs/apk/release/app-release.apk pages/publico/nosso-cantinho.apk
printf '{"versao": %s, "nome": "1.0.%s", "apk": "/nosso-cantinho.apk"}\n' "$VERSAO_CODIGO" "$VERSAO_CODIGO" > pages/publico/versao.json
(
  cd pages
  $W pages project create "$PROJETO" --production-branch main 2>/dev/null || echo "(projeto já existe)"
  printf '%s' "$FIREBASE_SERVICE_ACCOUNT" | $W pages secret put FIREBASE_SERVICE_ACCOUNT --project-name "$PROJETO"
  $W pages deploy --project-name "$PROJETO" --branch main --commit-dirty=true
)

echo "== Endereço workers.dev (a Cloudflare exige para tarefas agendadas)"
SUB=$(curl -sS -H "$AUT" "$API/workers/subdomain" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).result?.subdomain||"")}catch(e){console.log("")}})')
if [ -z "$SUB" ]; then
  echo "Criando o endereço brunelossbaby.workers.dev…"
  curl -sS -X PUT -H "$AUT" -H "Content-Type: application/json" --data '{"subdomain":"brunelossbaby"}' "$API/workers/subdomain" | head -c 400; echo
else
  echo "Já existe: $SUB.workers.dev"
fi

echo "== Lembretes diários (Worker com Cron)"
if $W deploy && printf '%s' "$FIREBASE_SERVICE_ACCOUNT" | $W secret put FIREBASE_SERVICE_ACCOUNT; then
  echo "✔ Lembretes publicados (9h e 20h30, horário de Brasília)"
else
  echo "::warning::O app foi publicado, mas os lembretes diários não. Abra o painel da Cloudflare → Workers & Pages uma vez (isso cria o endereço workers.dev) e rode este workflow de novo."
fi
