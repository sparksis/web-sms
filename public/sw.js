importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

const CACHE_NAME = 'web-sms-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return fetchResponse;
      });
    })
  );
});

// --- Push Notification Logic with Secure Polling ---

self.addEventListener('push', (event) => {
  event.waitUntil(handlePushSignal());
});

async function handlePushSignal() {
  try {
    const decryptionKey = await idbKeyval.get('voipms_decryption_key');
    if (!decryptionKey) {
      return self.registration.showNotification('VoIP.ms SMS', {
        body: 'You have new messages. Sign in to view.',
        icon: '/favicon.ico',
      });
    }

    // To identify the user to the proxy when session cookie might be missing (SW background)
    // In a real app, we might store the Auth0 'sub' in IDB too.
    // For now, let's try with the session cookie first.

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1);

    const response = await fetch('/api/voipms/getSMS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Decryption-Key': decryptionKey,
      },
      body: JSON.stringify({
        method: 'getSMS',
        from: thirtyDaysAgo.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        timezone: '-5',
        all_messages: '1'
      }),
    });

    if (!response.ok) {
        // If unauthorized, it might be missing the session cookie
        return self.registration.showNotification('New Messages', {
            body: 'Incoming SMS detected. Tap to open the app.',
            icon: '/favicon.ico',
        });
    }

    const data = await response.json();
    if (data.status === 'success' && data.sms && data.sms.length > 0) {
      const latest = data.sms
        .filter(s => s.type === '1')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (latest) {
        await self.registration.showNotification(`New from ${latest.contact}`, {
          body: latest.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: latest.contact,
          data: {
            url: `/conversation/${latest.contact}`,
          },
        });
      }
    }

    const allClients = await clients.matchAll({ type: 'window' });
    for (const client of allClients) {
      client.postMessage({ type: 'REFRESH_MESSAGES' });
    }
  } catch (error) {
    console.error('Push handling error:', error);
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
