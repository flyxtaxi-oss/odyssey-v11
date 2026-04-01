// ==============================================================================
// OFFLINE DATABASE — IndexedDB Wrapper for Odyssey.v11
// Enables offline-first functionality with automatic sync
// ==============================================================================

const DB_NAME = "odyssey-offline";
const DB_VERSION = 1;

export type StoreName =
  | "posts"
  | "simulations"
  | "skills"
  | "checkins"
  | "conversations"
  | "sync-queue";

interface SyncQueueItem {
  id: string;
  store: StoreName;
  action: "create" | "update" | "delete";
  data: unknown;
  timestamp: number;
  retryCount: number;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Posts store
        if (!db.objectStoreNames.contains("posts")) {
          const postsStore = db.createObjectStore("posts", { keyPath: "id" });
          postsStore.createIndex("created_at", "created_at", { unique: false });
        }

        // Simulations store
        if (!db.objectStoreNames.contains("simulations")) {
          const simStore = db.createObjectStore("simulations", { keyPath: "id" });
          simStore.createIndex("user_id", "user_id", { unique: false });
        }

        // Skills store
        if (!db.objectStoreNames.contains("skills")) {
          const skillsStore = db.createObjectStore("skills", { keyPath: "id" });
          skillsStore.createIndex("user_id", "user_id", { unique: false });
        }

        // Checkins store
        if (!db.objectStoreNames.contains("checkins")) {
          const checkinStore = db.createObjectStore("checkins", { keyPath: "id" });
          checkinStore.createIndex("user_id", "user_id", { unique: false });
        }

        // Conversations store
        if (!db.objectStoreNames.contains("conversations")) {
          const convStore = db.createObjectStore("conversations", { keyPath: "id" });
          convStore.createIndex("user_id", "user_id", { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains("sync-queue")) {
          db.createObjectStore("sync-queue", { keyPath: "id" });
        }
      };
    });
  }

  // ─── CRUD Operations ───────────────────────────────────────────────────────

  async get<T>(store: StoreName, id: string): Promise<T | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readonly");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readonly");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(store: StoreName, data: T & { id: string }): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(store: StoreName, id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(store: StoreName): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readwrite");
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ─── Sync Queue ─────────────────────────────────────────────────────────────

  async addToSyncQueue(
    store: StoreName,
    action: "create" | "update" | "delete",
    data: unknown
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      store,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.put("sync-queue", queueItem);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return this.getAll<SyncQueueItem>("sync-queue");
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete("sync-queue", id);
  }

  async incrementRetryCount(id: string): Promise<void> {
    const item = await this.get<SyncQueueItem>("sync-queue", id);
    if (item) {
      item.retryCount++;
      await this.put("sync-queue", item);
    }
  }

  // ─── User-specific Queries ─────────────────────────────────────────────────

  async getByUserId<T>(store: "simulations" | "skills" | "checkins" | "conversations", userId: string): Promise<T[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], "readonly");
      const objectStore = transaction.objectStore(store);
      const index = objectStore.index("user_id");
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ─── Cache Management ──────────────────────────────────────────────────────

  async cachePosts(posts: unknown[]): Promise<void> {
    for (const post of posts) {
      await this.put("posts", post as { id: string });
    }
  }

  async cacheSimulations(simulations: Array<{ id: string; [key: string]: unknown }>, userId: string): Promise<void> {
    for (const sim of simulations) {
      await this.put("simulations", { ...sim, user_id: userId });
    }
  }

  async getCachedPosts<T>(): Promise<T[]> {
    return this.getAll<T>("posts");
  }

  async getCachedSimulations<T>(userId: string): Promise<T[]> {
    return this.getByUserId<T>("simulations", userId);
  }

  // ─── Connection Status ─────────────────────────────────────────────────────

  isOnline(): boolean {
    return navigator.onLine;
  }

  async sync(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline()) {
      return { success: 0, failed: 0 };
    }

    const queue = await this.getSyncQueue();
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        // Attempt to sync with server
        const response = await fetch(`/api/${item.store}`, {
          method: item.action === "delete" ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await this.removeFromSyncQueue(item.id);
          success++;
        } else {
          await this.incrementRetryCount(item.id);
          failed++;
        }
      } catch {
        await this.incrementRetryCount(item.id);
        failed++;
      }
    }

    return { success, failed };
  }
}

// ─── Singleton Export ────────────────────────────────────────────────────────

export const offlineDB = new OfflineDB();

// ─── React Hook ──────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";

export function useOfflineDB() {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    offlineDB.init().then(() => setIsReady(true));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sync = useCallback(async () => {
    if (isOnline) {
      return offlineDB.sync();
    }
    return { success: 0, failed: 0 };
  }, [isOnline]);

  return {
    db: offlineDB,
    isReady,
    isOnline,
    sync,
  };
}
