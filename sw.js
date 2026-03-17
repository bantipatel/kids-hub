// Kids Learning Hub — Service Worker
// Caches all game assets for offline play

const CACHE_NAME = 'kids-hub-v1';

// Files to cache on install
const PRECACHE_URLS = [
  './kids-learning-hub.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F34E.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/26BD.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F431.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F436.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F418.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F41F.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F347.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F3A9.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F368.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1FAB8.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1FA81.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F981.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F412.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1FAB9.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F989.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F427.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F451.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F308.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2600.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F405.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/2602.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F30B.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F349.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F3B8.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F9AC.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F993.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F404.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F986.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F438.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F41D.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F40D.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F434.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F437.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F411.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F414.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F42F.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F43B.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F99C.svg',
  'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/1F43A.svg'
];

// Install — cache all assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Cache local files first (must succeed)
      return cache.addAll(['./kids-learning-hub.html', './manifest.json'])
        .then(function() {
          // Cache remote assets individually (failure of one won't block install)
          return Promise.allSettled(
            PRECACHE_URLS.filter(u => u.startsWith('http')).map(function(url) {
              return cache.add(url).catch(function(e) {
                console.warn('Could not cache:', url, e);
              });
            })
          );
        });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate — delete old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — cache-first strategy (great for offline)
self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      // Not in cache — fetch from network and cache for next time
      return fetch(event.request).then(function(response) {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        var toCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./kids-learning-hub.html');
        }
      });
    })
  );
});
