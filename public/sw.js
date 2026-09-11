const CACHE_NAME = 'fitfam-app-shell-v1';

// Static application shell assets for PWA installability and offline UI resilience
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Service Worker Install Event - Cache Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Service Worker Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Service Worker Fetch Event - Conservative App Shell Caching
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // EXPLICIT SECURITY BOUNDARY:
  // Never cache Firebase Auth, Firestore, Google APIs, or non-GET requests.
  if (
    event.request.method !== 'GET' ||
    requestUrl.hostname.includes('googleapis.com') ||
    requestUrl.hostname.includes('firebase') ||
    requestUrl.hostname.includes('google.com') ||
    requestUrl.hostname.includes('gstatic.com') ||
    requestUrl.pathname.includes('/__/auth/')
  ) {
    return; // Pass through to browser default network handler
  }

  // Network-First strategy for HTML navigation requests (ensures instant deployment updates)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate / Cache-First strategy for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
