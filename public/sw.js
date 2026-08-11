const CACHE_NAME = 'fintrack-cache-v2';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/favicon.svg',
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Memaksa service worker baru untuk langsung aktif
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Hapus cache lama jika versinya berbeda
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Mengambil alih halaman yang sedang terbuka
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // Strategi Network First, fallback to Cache
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Jika jaringan mati atau error, ambil dari cache
                return caches.match(event.request);
            })
    );
});
