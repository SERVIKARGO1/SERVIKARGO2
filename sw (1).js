// ServiKargo — Service Worker v1.0
const CACHE_NAME = 'servikargo-v1';
const ASSETS = [
  '/SERVIKARGO2/',
  '/SERVIKARGO2/index.html',
  '/SERVIKARGO2/manifest.json',
  '/SERVIKARGO2/icon-192.png',
  '/SERVIKARGO2/icon-512.png',
];

// Instalar y cachear recursos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Servir desde cache, luego red
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if(!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => cached || caches.match('/SERVIKARGO2/'));
    })
  );
});
