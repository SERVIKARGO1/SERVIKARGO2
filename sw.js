const CACHE='mk-cache-v4';
const CDN_URLS=[
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.23.10/babel.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap',
];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>
    Promise.allSettled(CDN_URLS.map(u=>
      fetch(u,{mode:'no-cors',credentials:'omit'}).then(r=>c.put(u,r)).catch(()=>{})
    ))
  ));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(u.includes('firebaseio.com')||u.includes('firebasestorage')||
     u.includes('nominatim')||u.includes('tile.openstreetmap')) return;
  if(u.includes('unpkg.com')||u.includes('gstatic.com')||
     u.includes('cdnjs.cloudflare')||u.includes('fonts.google')||
     u.includes('fonts.gstatic')){
    e.respondWith(caches.match(e.request).then(cached=>cached||
      fetch(e.request,{mode:'no-cors'}).then(r=>{
        caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
        return r;
      })));
    return;
  }
  e.respondWith(
    fetch(e.request).then(r=>{
      if(r&&r.ok){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
