// Kids Learning Hub — Service Worker
// Optimised for GitHub Pages: bantipatel.github.io/kids-hub/

const CACHE_NAME = 'kids-hub-v2';
const BASE = '/kids-hub';

const PRECACHE_URLS = [
  BASE + '/kids-learning-hub.html',
  BASE + '/manifest.json',
  BASE + '/icon-120.png',
  BASE + '/icon-152.png',
  BASE + '/icon-180.png',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
  BASE + '/splash-1290x2796.png',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap',
  // All OpenMoji emoji images used in the game
  ...[
    '1F34E','26BD','1F431','1F436','1F418','1F41F','1F347','1F3A9',
    '1F368','1FAB8','1FA81','1F981','1F412','1FAB9','1F989','1F427',
    '1F451','1F308','2600','1F405','2602','1F30B','1F349','1F3B8',
    '1F9AC','1F993','1F404','1F986','1F438','1F41D','1F40D','1F434',
    '1F437','1F411','1F414','1F42F','1F43B','1F99C','1F43A'
  ].map(h => `https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/${h}.svg`)
];

// ── Install: cache everything ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache local files (critical — must succeed)
      await cache.addAll([
        BASE + '/kids-learning-hub.html',
        BASE + '/manifest.json',
      ]);
      // Cache remote assets (best-effort — failures won't block install)
      await Promise.allSettled(
        PRECACHE_URLS
          .filter(u => u.startsWith('http'))
          .map(u => cache.add(u).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first (works offline) ──
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'error') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve the app shell
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + '/kids-learning-hub.html');
        }
      });
    })
  );
});
