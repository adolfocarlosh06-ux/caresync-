// ============================================================
//  CareSync — Service Worker (sw.js)
//  PWA: Cache offline, notificaciones push
//  Coloca este archivo en: public/sw.js
// ============================================================

const CACHE_NAME    = 'caresync-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── Instalación: cachear recursos estáticos ────────────────
self.addEventListener('install', event => {
  console.log('[CareSync SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[CareSync SW] Cacheando recursos estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activación: limpiar caches viejos ─────────────────────
self.addEventListener('activate', event => {
  console.log('[CareSync SW] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[CareSync SW] Eliminando cache viejo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: estrategia Network First con fallback a cache ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // No interceptar llamadas a GAS API ni a Gemini
  if (url.hostname.includes('script.google.com') ||
      url.hostname.includes('generativelanguage.googleapis.com') ||
      url.hostname.includes('drive.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar en cache si es exitoso
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay red, usar cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback a la página principal
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// ── Notificaciones Push ────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  const data    = event.data.json();
  const title   = data.title   || 'CareSync';
  const options = {
    body:    data.body    || 'Tienes una notificación',
    icon:    data.icon    || '/icons/icon-192x192.png',
    badge:   data.badge   || '/icons/icon-72x72.png',
    tag:     data.tag     || 'caresync-notification',
    data:    data.data    || {},
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Click en notificación ──────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
