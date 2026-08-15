const CACHE_APP_SHELL = 'biocolombia-appshell-v1';
const CACHE_DYNAMIC = 'biocolombia-dynamic-v1';
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/api.js',
  './js/router.js',
  './js/db.js',
  './js/imageCompress.js',
  './js/sync.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_APP_SHELL)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_APP_SHELL && k !== CACHE_DYNAMIC)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function cacheFirst(event) {
  return caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then((network) => {
      const copy = network.clone();
      caches.open(CACHE_DYNAMIC).then((cache) => cache.put(event.request, copy));
      return network;
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./offline.html');
      }
    });
  });
}

function staleWhileRevalidate(event) {
  return caches.match(event.request).then((cached) => {
    const fetchPromise = fetch(event.request).then((network) => {
      if (network && network.status === 200) {
        const copy = network.clone();
        caches.open(CACHE_DYNAMIC).then((cache) => cache.put(event.request, copy));
      }
      return network;
    }).catch(() => cached);
    return cached || fetchPromise;
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (req.destination === 'document' ||
        req.url.endsWith('.html') ||
        url.pathname === '/') {
      event.respondWith(
        fetch(req)
          .then((r) => {
            const copy = r.clone();
            caches.open(CACHE_APP_SHELL).then((c) => c.put(req, copy));
            return r;
          })
          .catch(() => caches.match(req).then((r) => r || caches.match('./offline.html')))
      );
      return;
    }

    if (APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/')))) {
      event.respondWith(staleWhileRevalidate(event));
      return;
    }

    if (req.destination === 'image' || req.destination === 'style' || req.destination === 'script') {
      event.respondWith(cacheFirst(event));
      return;
    }
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: 'OFFLINE' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  event.respondWith(cacheFirst(event));
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-avistamientos') {
    event.waitUntil(syncPendingAvistamientos());
  }
});

async function syncPendingAvistamientos() {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGER' });
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync-data') {
    event.waitUntil(syncPendingAvistamientos());
  }
});
