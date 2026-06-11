const CACHE_NAME = 'operiq-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo-icon.png',
  '/logo-full.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // NEVER cache API requests, Convex calls, or streaming endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('convex.cloud') ||
    url.hostname.includes('convex.site') ||
    e.request.method !== 'GET'
  ) {
    return; // Let the browser handle it normally
  }

  // Stale-while-revalidate for static assets
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((response) => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        });
        return cached || fetched;
      })
    )
  );
});
