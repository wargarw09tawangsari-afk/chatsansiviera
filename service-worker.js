const CACHE_NAME = 'chatsansiviera-v1';

// Daftar file inti aplikasi lokal yang wajib di-cache saat instalasi
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install Service Worker dan Cache Aset Lokal Utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache inti dibuka');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Fetch Event dengan Strategi Cache-First & Dynamic Caching untuk CDN/Eksternal
self.addEventListener('fetch', (event) => {
  let requestUrl = new URL(event.request.url);

  // Jangan pernah cache request ke Google Apps Script agar data chat/database real-time
  if (requestUrl.origin.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, kembalikan dari cache
      if (cachedResponse) {
        return cachedResponse;
      }

      // Jika tidak ada di cache, ambil dari jaringan (internet)
      return fetch(event.request).then((networkResponse) => {
        // Validasi response jaringan sebelum disimpan ke cache dinamis
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }

        // Clone response karena stream hanya bisa dibaca sekali
        let responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback opsional jika offline dan aset tidak ditemukan
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 3. Bersihkan Cache Lama saat ada versi baru
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});