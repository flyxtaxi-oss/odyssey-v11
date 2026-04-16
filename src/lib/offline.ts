// ==============================================================================
// Offline-First Architecture for Odyssey.ai (P0)
// Strategy: Stale-while-revalidate & Background Sync
// ==============================================================================

export type CacheStrategy = "network-first" | "cache-first" | "stale-while-revalidate";

export interface PWAConfig {
  version: string;
  strategies: Record<string, CacheStrategy>;
  backgroundSync: {
    enabled: boolean;
    queues: string[];
  };
}

export const offlineConfig: PWAConfig = {
  version: "v11.0.1",
  strategies: {
    // Les requêtes vers JARVIS nécessitent le réseau, fallback intelligent
    "/api/jarvis": "network-first",
    // Le contenu statique et les traductions (i18n) en cache prioritaire
    "/locales": "cache-first",
    // Données de profil et de dashboard
    "/api/user": "stale-while-revalidate",
  },
  backgroundSync: {
    enabled: true,
    // Actions qui seront rejouées automatiquement quand l'utilisateur retrouve du réseau
    queues: ["action_engine_tasks", "safe_zone_posts"],
  },
};

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Enregistre le Service Worker pour le support Offline de l'application.
 * À appeler côté client, idéalement dans le Layout principal (via useEffect).
 */
export function registerServiceWorker(): void {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("✅ [Odyssey Offline] Service Worker enregistré (Scope:", registration.scope, ")");
      } catch (error) {
        console.error("❌ [Odyssey Offline] Échec de l'enregistrement du SW:", error);
      }
    });
  }
}