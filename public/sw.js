const CACHE_NAME = "odyssey-v11-cache-v1.0.1"; // Aligné avec offlineConfig.version

// Fichiers critiques à mettre en cache immédiatement (Cache-First)
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  // TODO: Tu pourras ajouter tes assets statiques ici (icônes, fonts, etc.)
  "/offline" // Page de fallback si tout échoue
];

self.addEventListener("install", (event) => {
  console.log("👷 [Odyssey SW] Installation en cours...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🚀 [Odyssey SW] Activé");
  // Nettoyage des anciens caches si CACHE_NAME change
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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. API JARVIS : Network-First (L'IA a besoin d'internet, fallback sur le cache si offline)
  if (url.pathname.startsWith("/api/jarvis") || url.pathname.startsWith("/api/agent")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. API User & Dashboard : Stale-while-revalidate (Affiche le cache direct, met à jour en fond)
  if (url.pathname.startsWith("/api/user") || url.pathname.startsWith("/api/profile") || url.pathname.startsWith("/api/review")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => null); // Ignore si offline
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Statique et reste de l'app : Cache-First, fallback Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback sur la page /offline si l'utilisateur navigue sans réseau
        if (event.request.mode === "navigate") {
          return caches.match("/offline");
        }
      });
    })
  );
});

// --- Background Sync (Synchronisation hors-ligne) ---
self.addEventListener("sync", (event) => {
  console.log("🔄 [Odyssey SW] Background Sync déclenché :", event.tag);
  if (event.tag === "action_engine_tasks") {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  console.log("🚀 [Odyssey SW] Exécution des actions hors-ligne en attente...");
  
  return new Promise((resolve, reject) => {
    // On se connecte directement à la DB générée par offline-db.ts
    const request = indexedDB.open("odyssey-offline", 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("sync-queue")) return resolve();
      
      const tx = db.transaction("sync-queue", "readonly");
      const store = tx.objectStore("sync-queue");
      const getAll = store.getAll();

      getAll.onsuccess = async () => {
        const queue = getAll.result;
        for (const item of queue) {
          try {
            const response = await fetch(`/api/${item.store}`, {
              method: item.action === "delete" ? "DELETE" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            if (response.ok) {
              // Supprime l'action de la file d'attente une fois synchronisée
              const delTx = db.transaction("sync-queue", "readwrite");
              delTx.objectStore("sync-queue").delete(item.id);
            }
          } catch (err) {
            console.error(`❌ [Odyssey SW] Échec de la synchro pour ${item.id}`, err);
          }
        }
        resolve();
      };
    };
    request.onerror = () => reject();
  });
}

// ==============================================================================
// PUSH NOTIFICATIONS — Web Push API Interceptor
// ==============================================================================

self.addEventListener("push", (event) => {
  console.log("🔔 [Odyssey SW] Notification Push reçue !");
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || "JARVIS a un message important pour vous.",
    icon: "/icon.png", // Icone de l'app
    badge: "/badge.png", // Petite icône monochrome pour la barre de statut
    data: data.url || "/", // URL à ouvrir quand on clique
  };
  event.waitUntil(self.registration.showNotification(data.title || "Odyssey.ai", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Ouvre la page Odyssey correspondante (ex: /visa)
  event.waitUntil(self.clients.openWindow(event.notification.data));
});