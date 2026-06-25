// ================================================================
//  sw.js — Service Worker per PWA (Offline Support)
// ================================================================

const CACHE_NAME = 'kdp-factory-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/api.js',
  '/js/components/toast.js',
  '/js/components/agentStatus.js',
  '/js/views/login.view.js',
  '/js/views/register.view.js',
  '/js/views/dashboard.view.js',
  '/js/views/archive.view.js',
  '/js/views/settings.view.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Pulizia vecchia cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Non cacciare le chiamate API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Ritorna la cache o fa la chiamata di rete
        return response || fetch(event.request)
          .then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              // Salva in cache la nuova risorsa statica
              if (event.request.method === 'GET' && !event.request.url.includes('browser-sync')) {
                cache.put(event.request, fetchRes.clone());
              }
              return fetchRes;
            });
          });
      })
  );
});
