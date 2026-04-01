// ==============================================================================
// SERVICE WORKER — Odyssey.v11 Offline Support
// ==============================================================================

const CACHE_NAME = "odyssey-v1";
const STATIC_ASSETS = [
  "/",
  "/login",
  "/jarvis",
  "/simulator",
  "/safezone",
  "/skills",
  "/language",
  "/settings",
  "/globals.css",
  "/favicon.ico",
];

// ─── Install Event — Cache static assets ────────────────────────────────────

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Installation complete");
        return self.skipWaiting();
      })
  );
});

// ─── Activate Event — Clean old caches ──────────────────────────────────────

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("[SW] Activation complete");
        return self.clients.claim();
      })
  );
});

// ─── Fetch Event — Network-first strategy with cache fallback ───────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // API requests — Network first, no cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for API
        return new Response(
          JSON.stringify({
            error: "Offline mode",
            offline: true,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Static assets — Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Network failed, cached response is already returned
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clone response and cache it
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Network failed, try to return offline page
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

// ─── Background Sync ────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Notify all clients to sync their data
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_REQUIRED",
    });
  });
}

// ─── Push Notifications ─────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  const data = event.data?.json() || {};
  const title = data.title || "Odyssey";
  const options = {
    body: data.body || "Nouvelle notification",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: data.tag || "default",
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click ─────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event);

  event.notification.close();

  const notificationData = event.notification.data;
  let url = "/";

  if (notificationData?.url) {
    url = notificationData.url;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing client if open
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// ─── Message from Client ────────────────────────────────────────────────────

self.addEventListener("message", (event) => {
  console.log("[SW] Message from client:", event.data);

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "SYNC_NOW") {
    event.waitUntil(syncData());
  }
});

console.log("[SW] Service Worker loaded");
