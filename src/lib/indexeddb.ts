// ==============================================================================
// Offline Database Manager (IndexedDB)
// Sauvegarde les actions de l'utilisateur quand il n'y a pas de réseau.
// ==============================================================================

const DB_NAME = "OdysseyOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "offline_actions";

export interface OfflineAction {
  id?: number;
  endpoint: string;
  method: string;
  payload: any;
  timestamp: number;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

export async function saveOfflineAction(endpoint: string, method: string, payload: any): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      
      store.add({ endpoint, method, payload, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("❌ [IndexedDB] Failed to save offline action:", error);
  }
}