const CACHE_NAME = "v0.4.0";
const urlsToCache = ['/' ];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    // Clean up old versions so the user's phone doesn't run out of space
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return from cache OR fetch from network
            return response || fetch(event.request).then((fetchRes) => {
                // Optional: You could dynamically cache new assets here
                return fetchRes;
            });
        }).catch(() => {
            // If both fail (offline and not cached), 
            // for navigation requests, return the root '/' (your app shell)
            if (event.request.mode === 'navigate') {
                return caches.match('/');
            }
        })
    );
});