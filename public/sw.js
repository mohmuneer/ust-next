const CACHE_VERSION = 'ust-pwa-v3';
const STATIC_CACHE = 'ust-static-v3';
const DYNAMIC_CACHE = 'ust-dynamic-v3';
const FONT_CACHE = 'ust-fonts-v3';
const IMAGE_CACHE = 'ust-images-v3';

const STATIC_ASSETS = [
  '/ust-logo.png',
  '/placeholder.svg',
];

const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  FONTS: 'cache-first',
  IMAGES: 'cache-first-network-fallback',
  API: 'network-first-cache-fallback',
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, FONT_CACHE, IMAGE_CACHE];
      return Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname.includes('/fonts/') || url.pathname.includes('fonts.googleapis.com') || url.pathname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(cacheFirstNetworkFallback(request, IMAGE_CACHE));
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstCacheFallback(request, DYNAMIC_CACHE));
    return;
  }

  if (request.destination === 'document' || url.pathname.endsWith('/') || !url.pathname.includes('.')) {
    event.respondWith(networkFirstCacheFallback(request, DYNAMIC_CACHE));
    return;
  }

  event.respondWith(networkFirstCacheFallback(request, DYNAMIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

async function cacheFirstNetworkFallback(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

async function networkFirstCacheFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok && request.destination !== 'document') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response(offlineHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UST - غير متصل</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', 'Tajawal', sans-serif; background: #f0f2f5; color: #171717; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; max-width: 400px; }
    .icon { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #038ed3, #025a87); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 40px; height: 40px; fill: white; }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #6c757d; font-size: 0.875rem; line-height: 1.6; margin-bottom: 1.5rem; }
    button { background: #038ed3; color: white; border: none; padding: 0.75rem 2rem; border-radius: 12px; font-size: 0.875rem; font-weight: bold; cursor: pointer; }
    button:hover { background: #025a87; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
    </div>
    <h1>غير متصل بالإنترنت</h1>
    <p>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى</p>
    <button onclick="location.reload()">إعادة المحاولة</button>
  </div>
</body>
</html>`;
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
  } catch (err) {
    console.error('Background sync failed:', err);
  }
}

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/ust-logo.png',
    badge: '/ust-logo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'ust-notification',
    renotify: true,
    data: data.data || {},
    actions: data.actions || [],
    dir: 'rtl',
    lang: 'ar',
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'UST', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/student/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
