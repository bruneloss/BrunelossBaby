/* Service worker: guarda os arquivos do app para abrir rápido e funcionar sem internet.
   Mude VERSAO quando publicar uma atualização (os celulares baixam a nova sozinhos). */
const VERSAO = 'cantinho-v4';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icones/icone-192.png', './icones/icone-512.png',   "./css/style.css",  "./js/agenda.js",  "./js/amor.js",  "./js/app.js",  "./js/casa.js",  "./js/cena.js",  "./js/config.js",  "./js/contas.js",  "./js/decorar.js",  "./js/financas.js",  "./js/inicio.js",  "./js/mercado.js",  "./js/musica.js",  "./js/nativo.js",  "./js/pixel.js",  "./js/relax.js",  "./js/sonhos.js",  "./js/store.js",  "./js/tarefas.js",  "./js/util.js"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Arquivos do app: usa a internet quando dá (sempre atualizado) e o cache quando está offline.
   O banco (Firebase) e as fontes passam direto. */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
