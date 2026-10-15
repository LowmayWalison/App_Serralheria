const CACHE_NAME = 'serralheria-app-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // NEVER intercept dev server, Vite internal paths, HMR, src files, node_modules, API, or local hosts
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('node_modules') ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.includes('.run.app')
  ) {
    return;
  }

  // Network-first for static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        if (
          url.pathname.startsWith('/assets/') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.ico') ||
          url.pathname === '/manifest.json'
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
