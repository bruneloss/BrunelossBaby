#!/usr/bin/env bash
# Chave de assinatura do APK: criada uma vez e guardada no KV da Cloudflare.
# Assim toda versão nova instala por cima da anterior (mesma assinatura).
set -euo pipefail
cd "$(dirname "$0")/.."
W="npx --yes wrangler@3.78.12"
KV=adbe79ce4b6a4e2690e5c7b0bf426bb1
ARQ="$RUNNER_TEMP/cantinho.jks"
if $W kv key get android_chave --namespace-id "$KV" > "$RUNNER_TEMP/chave.b64" 2>/dev/null && [ -s "$RUNNER_TEMP/chave.b64" ] && ! grep -q "Value not found" "$RUNNER_TEMP/chave.b64"; then
  base64 -d "$RUNNER_TEMP/chave.b64" > "$ARQ"
  SENHA=$($W kv key get android_senha --namespace-id "$KV")
  echo "Usando a chave de assinatura guardada."
else
  SENHA=$(openssl rand -hex 16)
  keytool -genkeypair -v -keystore "$ARQ" -alias cantinho -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$SENHA" -keypass "$SENHA" -dname "CN=Nosso Cantinho, O=Casal, C=BR"
  base64 -w0 "$ARQ" > "$RUNNER_TEMP/chave.b64"
  $W kv key put android_chave --namespace-id "$KV" --path "$RUNNER_TEMP/chave.b64"
  $W kv key put android_senha "$SENHA" --namespace-id "$KV"
  echo "Chave de assinatura nova criada e guardada."
fi
echo "::add-mask::$SENHA"
echo "KEYSTORE_ARQUIVO=$ARQ" >> "$GITHUB_ENV"
echo "KEYSTORE_SENHA=$SENHA" >> "$GITHUB_ENV"
