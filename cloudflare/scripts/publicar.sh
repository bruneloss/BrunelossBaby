#!/usr/bin/env bash
# Publica na Cloudflare: lembretes agendados + site com o APK e a API de avisos.
set -euo pipefail
cd "$(dirname "$0")/.."
W="npx --yes wrangler@3.78.12"
PROJETO=brunelossbaby-cantinho

echo "== Lembretes diários (Worker com Cron)"
$W deploy
printf '%s' "$FIREBASE_SERVICE_ACCOUNT" | $W secret put FIREBASE_SERVICE_ACCOUNT

echo "== Site do APK + API de avisos (Pages)"
cp ../android/app/build/outputs/apk/release/app-release.apk pages/publico/nosso-cantinho.apk
printf '{"versao": %s, "nome": "1.0.%s", "apk": "/nosso-cantinho.apk"}\n' "$VERSAO_CODIGO" "$VERSAO_CODIGO" > pages/publico/versao.json
cd pages
$W pages project create "$PROJETO" --production-branch main 2>/dev/null || echo "(projeto já existe)"
printf '%s' "$FIREBASE_SERVICE_ACCOUNT" | $W pages secret put FIREBASE_SERVICE_ACCOUNT --project-name "$PROJETO"
$W pages deploy --project-name "$PROJETO" --branch main --commit-dirty=true
$W pages project list | grep -i "$PROJETO" || true
