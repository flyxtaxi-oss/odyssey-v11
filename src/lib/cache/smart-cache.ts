import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

/**
 * JARVIS Smart Cache — bounded, expiring, serverless-safe LLM response cache.
 *
 * Why this exists: LLM calls are the app's only per-request money cost. Two
 * users asking "quel visa pour le Portugal ?" should cost one call, not two.
 *
 * Design constraints learned the hard way:
 *  - Vercel's filesystem is READ-ONLY except os.tmpdir(). Writing to
 *    process.cwd() throws in production while working fine locally.
 *  - Entries must expire. A cached answer about visa rules that never goes
 *    stale is worse than no cache — it serves outdated legal information.
 *  - The cache must be bounded, or a long-running instance leaks memory.
 *  - Writes must not block the request. Disk persistence is a nice-to-have,
 *    correctness of the in-memory layer is not.
 */

const TTL_MS = Number(process.env.JARVIS_CACHE_TTL_MS) || 6 * 60 * 60 * 1000; // 6h
const MAX_ENTRIES = Number(process.env.JARVIS_CACHE_MAX_ENTRIES) || 500;

/** Serverless filesystems are read-only outside the temp dir. */
const CACHE_FILE_PATH = path.join(os.tmpdir(), "jarvis-cache.json");

interface CacheEntry {
  prompt: string;
  timestamp: number;
  response: unknown;
}

let memCache = new Map<string, CacheEntry>();
let persistenceDisabled = false;

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp > TTL_MS;
}

// ─── Boot: warm from disk, dropping anything already stale ───────────────────
if (typeof window === "undefined") {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CACHE_FILE_PATH, "utf-8")) as Record<string, CacheEntry>;
      for (const [key, entry] of Object.entries(raw)) {
        if (entry && typeof entry.timestamp === "number" && !isExpired(entry)) {
          memCache.set(key, entry);
        }
      }
    }
  } catch {
    // A corrupt or unreadable cache must never prevent the app from booting.
    memCache = new Map();
  }
}

// ─── Persistence: debounced, async, failure-tolerant ─────────────────────────

let flushTimer: NodeJS.Timeout | null = null;

function scheduleFlush() {
  if (typeof window !== "undefined" || persistenceDisabled || flushTimer) return;

  // Coalesce bursts of writes into one disk hit, off the request path.
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const snapshot = Object.fromEntries(memCache);
    fs.promises
      .writeFile(CACHE_FILE_PATH, JSON.stringify(snapshot), "utf-8")
      .catch(() => {
        // Read-only filesystem or quota: fall back to memory-only for the
        // rest of this instance's life rather than logging on every request.
        persistenceDisabled = true;
      });
  }, 2000);

  // Don't hold the process open just to flush a cache.
  flushTimer.unref?.();
}

/** Drop expired entries, then evict oldest-first until under the size cap. */
function evict() {
  for (const [key, entry] of memCache) {
    if (isExpired(entry)) memCache.delete(key);
  }

  if (memCache.size <= MAX_ENTRIES) return;

  const byAge = [...memCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  for (const [key] of byAge.slice(0, memCache.size - MAX_ENTRIES)) {
    memCache.delete(key);
  }
}

/**
 * Build a cache key.
 *
 * `scope` isolates entries that must not be shared between callers — pass a
 * user id whenever the prompt carries personal context, otherwise one user's
 * answer can be served to another.
 */
export function generateCacheKey(
  prompt: string,
  systemInstruction?: string,
  tools?: string[],
  scope?: string
): string {
  const payload = JSON.stringify({ prompt, systemInstruction, tools, scope });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function getCachedResponse(
  prompt: string,
  systemInstruction?: string,
  tools?: string[],
  scope?: string
): unknown | null {
  const key = generateCacheKey(prompt, systemInstruction, tools, scope);
  const entry = memCache.get(key);

  if (!entry) return null;

  if (isExpired(entry)) {
    memCache.delete(key);
    return null;
  }

  return entry.response;
}

export function setCachedResponse(
  prompt: string,
  response: unknown,
  systemInstruction?: string,
  tools?: string[],
  scope?: string
) {
  const key = generateCacheKey(prompt, systemInstruction, tools, scope);
  memCache.set(key, { prompt, timestamp: Date.now(), response });
  evict();
  scheduleFlush();
}

export function clearSmartCache() {
  memCache.clear();
  scheduleFlush();
}

/** Observability: surfaced by /api/jarvis so cache health is measurable. */
export function getCacheStats() {
  let expired = 0;
  for (const entry of memCache.values()) if (isExpired(entry)) expired++;

  return {
    entries: memCache.size,
    expired,
    maxEntries: MAX_ENTRIES,
    ttlMs: TTL_MS,
    persistence: persistenceDisabled ? "memory-only" : "disk",
  };
}
