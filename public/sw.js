
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch to satisfy PWA requirements.
  // In a full production app, you would handle offline caching here.
  event.respondWith(fetch(event.request));
});
