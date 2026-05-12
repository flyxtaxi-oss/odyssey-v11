// ==============================================================================
// AI Engine — Intelligence Layer for Odyssey.ai
// Cache, Rate Limiting, Conversation Memory, Model Routing
// ==============================================================================

// ─── In-Memory Response Cache (LRU-like) ─────────────────────────────────────
type CacheEntry = {
    response: string;
    timestamp: number;
    hits: number;
};

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const CACHE_MAX_SIZE = 200;
const responseCache = new Map<string, CacheEntry>();

function getCacheKey(messages: Array<{ role: string; content: string }>, persona: string): string {
    const last3 = messages.slice(-3);
    const raw = `${persona}::${last3.map(m => `${m.role}:${m.content}`).join("|")}`;
    // Simple hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return `jarvis_${hash}`;
}

export function getCachedResponse(messages: Array<{ role: string; content: string }>, persona: string): string | null {
    const key = getCacheKey(messages, persona);
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        responseCache.delete(key);
        return null;
    }
    entry.hits++;
    return entry.response;
}

export function setCachedResponse(messages: Array<{ role: string; content: string }>, persona: string, response: string): void {
    // Evict oldest if at capacity
    if (responseCache.size >= CACHE_MAX_SIZE) {
        const oldest = [...responseCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) responseCache.delete(oldest[0]);
    }
    const key = getCacheKey(messages, persona);
    responseCache.set(key, { response, timestamp: Date.now(), hits: 0 });
}

// ─── Rate Limiter (Token Bucket) ─────────────────────────────────────────────
type RateBucket = {
    tokens: number;
    lastRefill: number;
};

const RATE_LIMIT_MAX = 20;        // 20 requests
const RATE_LIMIT_WINDOW = 60_000; // per minute
const RATE_LIMIT_REFILL = RATE_LIMIT_MAX / (RATE_LIMIT_WINDOW / 1000); // tokens/sec
const rateBuckets = new Map<string, RateBucket>();

export function checkRateLimit(userId: string = "anonymous"): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    let bucket = rateBuckets.get(userId);

    if (!bucket) {
        bucket = { tokens: RATE_LIMIT_MAX, lastRefill: now };
        rateBuckets.set(userId, bucket);
    }

    // Refill tokens
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + elapsed * RATE_LIMIT_REFILL);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
        const resetMs = Math.ceil((1 - bucket.tokens) / RATE_LIMIT_REFILL * 1000);
        return { allowed: false, remaining: 0, resetMs };
    }

    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens), resetMs: 0 };
}

// ─── Personal Knowledge Graph (Context Window) ───────────────────────────────
type KnowledgeGraph = {
    profile: {
        profession?: string;
        incomeLevel?: string;
        familyStatus?: string;
        location?: string;
    };
    preferences: Record<string, string>; // e.g. "food": "spicy", "tone": "direct"
    goals: Array<{ title: string; status: string }>;
    constraints: string[]; // e.g. "végétalien", "budget < 50€/jour"
    keyFacts: Array<{ fact: string; confidence: number; updatedAt: number }>;
    summary: string;
    lastInteraction: number;
};

// En mémoire vive pour l'instant (à remplacer par Supabase RLS)
const knowledgeStore = new Map<string, KnowledgeGraph>();

export function getMemoryContext(userId: string): string {
    const kg = knowledgeStore.get(userId);
    if (!kg) return "";

    const parts: string[] = ["=== KNOWLEDGE GRAPH ==="];

    // Profile
    const profileParts = [];
    if (kg.profile.profession) profileParts.push(`Profession: ${kg.profile.profession}`);
    if (kg.profile.location) profileParts.push(`Localisation: ${kg.profile.location}`);
    if (kg.profile.incomeLevel) profileParts.push(`Revenus: ${kg.profile.incomeLevel}`);
    if (kg.profile.familyStatus) profileParts.push(`Famille: ${kg.profile.familyStatus}`);
    if (profileParts.length > 0) parts.push(`[Profil] ${profileParts.join(" | ")}`);

    // Preferences & Constraints
    const prefs = Object.entries(kg.preferences).map(([k, v]) => `${k}: ${v}`);
    if (prefs.length > 0) parts.push(`[Préférences] ${prefs.join(", ")}`);
    if (kg.constraints.length > 0) parts.push(`[Contraintes] ${kg.constraints.join(", ")}`);

    // Goals & Facts
    const activeGoals = kg.goals.filter(g => g.status === 'active').map(g => g.title);
    if (activeGoals.length > 0) parts.push(`[Objectifs Actifs] ${activeGoals.join(", ")}`);

    if (kg.keyFacts.length > 0) {
        const highConfidenceFacts = kg.keyFacts.filter(f => f.confidence > 0.7).map(f => f.fact);
        parts.push(`[Faits Établis] ${highConfidenceFacts.join(" | ")}`);
    }

    if (kg.summary) parts.push(`[Contexte Récent] ${kg.summary}`);

    return parts.join("\n");
}

export function updateMemory(userId: string, userMessage: string, aiResponse: string): void {
    let kg = knowledgeStore.get(userId);
    if (!kg) {
        kg = {
            profile: {},
            preferences: {},
            goals: [],
            constraints: [],
            keyFacts: [],
            summary: "",
            lastInteraction: Date.now()
        };
        knowledgeStore.set(userId, kg);
    }

    kg.lastInteraction = Date.now();
    const msg = userMessage.toLowerCase();

    // --- Fact & Profile Extraction (Heuristics) ---
    if (msg.includes("je vis à") || msg.includes("j'habite")) {
        const match = userMessage.match(/(?:je vis|j'habite|je suis) (?:à|en|au) ([A-ZÀ-Ü][a-zà-ü\s]+)/i);
        if (match) kg.profile.location = match[1].trim();
    }
    if (msg.includes("je gagne") || msg.includes("mon salaire")) {
        const match = userMessage.match(/(?:je gagne|mon salaire|mes revenus?) (\d[\d\s]*€)/i);
        if (match) kg.profile.incomeLevel = match[1].trim();
    }
    if (msg.includes("je travaille comme") || msg.includes("mon métier")) {
        const match = userMessage.match(/(?:je travaille|mon job|mon métier) (?:comme|en tant que|dans) (.+)/i);
        if (match) kg.profile.profession = match[1].trim();
    }
    if (msg.includes("mon objectif") || msg.includes("je veux accomplir")) {
        const match = userMessage.match(/(?:mon objectif|je veux accomplir) (.{10,50})/i);
        if (match) {
            kg.goals.push({ title: match[1].trim(), status: 'active' });
        }
    }
    if (msg.includes("je suis allergique") || msg.includes("je ne mange pas")) {
        const match = userMessage.match(/(?:je suis allergique|je ne mange pas) (?:au|à la|aux|de) (.+)/i);
        if (match) kg.constraints.push(`Alimentation: Sans ${match[1].trim()}`);
    }

    // --- Dynamic Facts ---
    // Extract short declarative sentences as facts
    const sentences = userMessage.split(/[.?!]/);
    for (const sentence of sentences) {
        const s = sentence.trim();
        if (s.toLowerCase().startsWith("j'aime ") || s.toLowerCase().startsWith("je déteste ")) {
            const factExist = kg.keyFacts.find(f => f.fact === s);
            if (!factExist) {
                kg.keyFacts.push({ fact: s, confidence: 0.8, updatedAt: Date.now() });
            }
        }
    }

    // Update summay
    if (userMessage.length > 20) {
        kg.summary = userMessage.slice(0, 120) + (userMessage.length > 120 ? "..." : "");
    }
}

// ─── Model Router (Smart Selection) ──────────────────────────────────────────
// Architecture: StepFun-first, Gemini fallback. Anthropic removed (cost).
export type ModelConfig = {
    provider: "stepfun" | "google" | "mock";
    modelId: string;
    displayName: string;
    maxTokens: number;
    temperature: number;
    capabilities: string[];
};

// StepFun current (May 2026): step-3.5-flash is the flagship cheap+fast model,
// step3 is the multimodal MoE for deep reasoning. step-2 is deprecated.
const MODEL_CONFIGS: Record<string, ModelConfig> = {
    // StepFun Step3 — Multimodal MoE 321B for deep reasoning
    "step-3": {
        provider: "stepfun",
        modelId: "step-3",
        displayName: "Step-3 (Deep)",
        maxTokens: 4096,
        temperature: 0.7,
        capabilities: ["reasoning", "analysis", "multimodal", "code"],
    },
    // StepFun Step 3.5 Flash — flagship cheap+fast (Jan 2026)
    "step-3.5-flash": {
        provider: "stepfun",
        modelId: "step-3.5-flash",
        displayName: "Step-3.5 Flash",
        maxTokens: 2048,
        temperature: 0.7,
        capabilities: ["fast", "cheap", "general", "multilingual"],
    },
    // Google Gemini — fallback when StepFun unavailable / for free-tier multilingual
    "gemini-flash": {
        provider: "google",
        modelId: "gemini-2.5-flash-preview-05-20",
        displayName: "Neural Core Flash",
        maxTokens: 2048,
        temperature: 0.7,
        capabilities: ["fast", "multilingual", "general", "search"],
    },
    "gemini-pro": {
        provider: "google",
        modelId: "gemini-2.5-pro-preview-05-06",
        displayName: "Neural Core Pro",
        maxTokens: 4096,
        temperature: 0.7,
        capabilities: ["reasoning", "analysis", "code", "complex"],
    },
};

// Route by task: deep reasoning → Step-3 (or Gemini Pro), casual → Step-3.5 Flash.
export function selectModel(persona: string): ModelConfig {
    const stepfunKey = process.env.STEPFUN_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const deepPersonas = ["sage", "strategist"];
    const needsDeep = deepPersonas.includes(persona);

    if (needsDeep) {
        if (stepfunKey) return MODEL_CONFIGS["step-3"];
        if (googleKey) return MODEL_CONFIGS["gemini-pro"];
    }

    // Default: StepFun Flash for everything else (cheap & fast)
    if (stepfunKey) return MODEL_CONFIGS["step-3.5-flash"];
    if (googleKey) return MODEL_CONFIGS["gemini-flash"];

    return {
        provider: "mock",
        modelId: "mock-v1",
        displayName: "Odyssey Mock AI",
        maxTokens: 512,
        temperature: 0.7,
        capabilities: ["general"],
    };
}

// ─── Cache Stats (for monitoring) ────────────────────────────────────────────
export function getCacheStats(): { size: number; totalHits: number; oldestMs: number } {
    let totalHits = 0;
    let oldest = Date.now();
    for (const entry of responseCache.values()) {
        totalHits += entry.hits;
        if (entry.timestamp < oldest) oldest = entry.timestamp;
    }
    return {
        size: responseCache.size,
        totalHits,
        oldestMs: responseCache.size > 0 ? Date.now() - oldest : 0,
    };
}
