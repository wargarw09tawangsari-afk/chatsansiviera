const CACHE_NAME = 'chatsansiviera-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'
];

// 1. Install Service Worker dan Cache Aset Statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache dibuka');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Ambil Data dari Cache saat Offline atau Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Jangan cache request ke Google Apps Script (karena data chat harus real-time)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Kembalikan dari cache jika ada, jika tidak ambil dari internet
      return response || fetch(event.request);
    })
  );
});

// 3. Update Cache jika ada versi baru
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
});