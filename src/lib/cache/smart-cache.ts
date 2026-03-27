import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * JARVIS Smart Cache System (Local File-Based)
 * Saves tokens and money by caching identical LLM requests.
 */

const CACHE_FILE_PATH = path.join(process.cwd(), '.jarvis-cache.json');

// In-memory fallback
let memCache: Record<string, any> = {};

// Load cache from disk on boot
if (typeof window === 'undefined') {
    try {
        if (fs.existsSync(CACHE_FILE_PATH)) {
            const data = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
            memCache = JSON.parse(data);
        }
    } catch (e) {
        console.warn('⚠️ Could not load JARVIS cache from disk. Using clean memory cache.');
    }
}

function saveCacheToDisk() {
    if (typeof window !== 'undefined') return;
    try {
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(memCache, null, 2), 'utf-8');
    } catch (e) {
        console.error('❌ Failed to write JARVIS cache to disk', e);
    }
}

/**
 * Generates a consistent hash for a prompt and system instruction.
 */
export function generateCacheKey(prompt: string, systemInstruction?: string, tools?: string[]): string {
    const payload = JSON.stringify({ prompt, systemInstruction, tools });
    return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Retrieves a cached response if it exists.
 */
export function getCachedResponse(prompt: string, systemInstruction?: string, tools?: string[]): any | null {
    const key = generateCacheKey(prompt, systemInstruction, tools);
    if (memCache[key]) {
        console.log(`🧠 [JARVIS Cache Hit] Tokens saved for query: "${prompt.substring(0, 30)}..."`);
        return memCache[key].response;
    }
    return null;
}

/**
 * Saves a new response to the cache.
 */
export function setCachedResponse(prompt: string, response: any, systemInstruction?: string, tools?: string[]) {
    const key = generateCacheKey(prompt, systemInstruction, tools);
    memCache[key] = {
        prompt,
        timestamp: Date.now(),
        response
    };
    saveCacheToDisk();
}

/**
 * Clears the entire cache.
 */
export function clearSmartCache() {
    memCache = {};
    saveCacheToDisk();
    console.log('🧹 [JARVIS Cache] Cleared successfully.');
}
