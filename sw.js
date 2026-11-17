// Service worker mínimo para que la app sea instalable (PWA / APK).
const CACHE = 'despachos-cbn-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// La app (pantallas) se sirve desde caché; las llamadas al backend siempre van a la red.
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('script.google.com') || url.includes('googleusercontent.com')) return; // backend: red directa
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)).catch(() => caches.match('./index.html')));
});
