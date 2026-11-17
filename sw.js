// Service worker "red primero": siempre trae la versión fresca de la app;
// solo usa la copia guardada si no hay internet. Evita que se quede pegada una versión vieja.
const CACHE = 'despachos-cbn-v2';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // El backend (Google) siempre va directo a la red.
  if (url.includes('script.google.com') || url.includes('googleusercontent.com')) return;
  // Resto: intenta la red primero; si falla (sin internet), usa la copia en caché.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
