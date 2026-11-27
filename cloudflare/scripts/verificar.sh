#!/usr/bin/env bash
# Confere os segredos sem publicar nada (roda nas branches de trabalho).
set -uo pipefail
cd "$(dirname "$0")/.."
W="npx --yes wrangler@3.78.12"
ok=1

echo "== Chave da Cloudflare"
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then echo "::error::Segredo CLOUDFLARE_API_TOKEN não encontrado"; ok=0
else
  $W whoami 2>&1 | grep -E "associated with|Account Name|Account ID|│" | head -8 || true
  if $W pages project list >/dev/null 2>&1; then echo "✔ Acesso ao Cloudflare Pages"; else echo "::error::A chave da Cloudflare não tem permissão de Cloudflare Pages (Edit)"; ok=0; fi
  if $W kv key list --namespace-id adbe79ce4b6a4e2690e5c7b0bf426bb1 >/dev/null 2>&1; then echo "✔ Acesso ao armazenamento (KV)"; else echo "::error::A chave da Cloudflare não tem permissão de Workers KV Storage (Edit)"; ok=0; fi
fi

echo "== Chave de serviço do Firebase"
if [ -z "${FIREBASE_SERVICE_ACCOUNT:-}" ]; then echo "::error::Segredo FIREBASE_SERVICE_ACCOUNT não encontrado"; ok=0
else
  node --input-type=module -e '
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!sa.client_email || !sa.private_key) throw new Error("o JSON não parece uma chave de serviço");
    if (sa.project_id !== "nosso-cantinho-e4ca8") throw new Error("a chave é de outro projeto: " + sa.project_id);
    const b64 = b => Buffer.from(b).toString("base64url");
    const agora = Math.floor(Date.now() / 1000);
    const cab = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const corpo = b64(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 600 }));
    const { createSign } = await import("node:crypto");
    const ass = createSign("RSA-SHA256").update(cab + "." + corpo).sign(sa.private_key, "base64url");
    const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + cab + "." + corpo + "." + ass });
    const j = await r.json();
    if (!j.access_token) throw new Error("o Google recusou a chave: " + JSON.stringify(j));
    console.log("✔ Chave do Firebase válida (" + sa.client_email.split("@")[0] + "), pode mandar notificações");
  ' || { echo "::error::Problema na chave FIREBASE_SERVICE_ACCOUNT"; ok=0; }
fi

[ "$ok" = 1 ] && echo "✔ Tudo pronto para publicar" || exit 1
