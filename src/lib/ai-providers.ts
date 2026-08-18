// ==============================================================================
// AI PROVIDER CHAIN — free-tier first, with automatic failover
// ==============================================================================
//
// Odyssey answers questions about visas, taxes and relocation. Two properties
// matter more than raw model quality:
//
//   1. It must never invent an answer. A confident wrong statement about a visa
//      requirement is worse than no answer at all.
//   2. It must not fall over when one provider rate-limits. Every provider here
//      has a free tier, and free tiers throttle aggressively.
//
// So providers are tried in order and the first one that is configured AND
// responds is used. Ordering is by free-tier generosity and latency, not by
// model benchmark scores — a working answer from a smaller model beats a 429
// from a bigger one.
//
// ─── Where to get a key ──────────────────────────────────────────────────────
// Free, no credit card:
//   GOOGLE_GENERATIVE_AI_API_KEY  aistudio.google.com/apikey   ← start here
//   GROQ_API_KEY                  console.groq.com/keys
//   CEREBRAS_API_KEY              cloud.cerebras.ai
//   MISTRAL_API_KEY               console.mistral.ai
//   OPENROUTER_API_KEY            openrouter.ai/keys           (ids ending :free)
//   ZHIPU_API_KEY                 z.ai — glm-4-flash is free
//   GITHUB_MODELS_TOKEN           github.com/settings/tokens   (any GitHub account)
//
// Free credits on signup, open-weight models:
//   MOONSHOT_API_KEY              platform.moonshot.ai         (Kimi)
//   DEEPSEEK_API_KEY              platform.deepseek.com
//   NVIDIA_API_KEY                build.nvidia.com
//   TOGETHER_API_KEY              api.together.ai
//
// Add one key and the feature works. Add several and you get failover for free:
// when one free tier returns 429, the next provider serves the request.

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ProviderId =
  | "google"
  | "groq"
  | "cerebras"
  | "mistral"
  | "openrouter"
  | "zhipu"
  | "moonshot"
  | "deepseek"
  | "github"
  | "nvidia"
  | "together"
  | "stepfun";

/** What a model is being asked to do. Drives which model id we pick. */
export type Capability = "fast" | "reasoning" | "vision";

type ProviderSpec = {
  id: ProviderId;
  label: string;
  /** Env var holding the key. Absent key ⇒ provider is skipped. */
  envKey: string;
  /** Free-tier note, surfaced in diagnostics so limits are not a surprise. */
  freeTier: string;
  baseURL?: string;
  models: Record<Capability, string | null>;
};

/**
 * Model ids in this space are renamed every few months (`glm-4-flash` →
 * `glm-4.5-flash`, dated suffixes on Kimi previews, Groq retiring older Llama
 * builds). Hardcoding them guarantees a future outage that needs a deploy to
 * fix — on a provider the user may not even be using.
 *
 * So every id below is a DEFAULT that an env var can override:
 *   ODYSSEY_MODEL_<PROVIDER>_<CAPABILITY>   e.g. ODYSSEY_MODEL_ZHIPU_FAST
 *
 * A renamed model becomes a one-line .env change, and until then failover moves
 * on to the next configured provider rather than breaking the feature.
 */
function modelOverride(id: ProviderId, capability: Capability): string | undefined {
  const key = `ODYSSEY_MODEL_${id.toUpperCase()}_${capability.toUpperCase()}`;
  return process.env[key]?.trim() || undefined;
}

function resolveModel(p: ProviderSpec, capability: Capability): string | null {
  return modelOverride(p.id, capability) ?? p.models[capability];
}

/**
 * Ordered by: free-tier generosity, then latency.
 * Google first — the most generous free tier and the only one here with vision.
 */
const PROVIDERS: ProviderSpec[] = [
  {
    id: "google",
    label: "Google AI Studio",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    freeTier: "Gratuit — quota quotidien généreux, seul fournisseur avec vision ici",
    models: {
      fast: "gemini-2.5-flash",
      reasoning: "gemini-2.5-pro",
      vision: "gemini-2.5-pro",
    },
  },
  {
    id: "groq",
    label: "Groq",
    envKey: "GROQ_API_KEY",
    freeTier: "Gratuit — très rapide, limité en requêtes/minute",
    baseURL: "https://api.groq.com/openai/v1",
    models: {
      fast: "llama-3.3-70b-versatile",
      reasoning: "llama-3.3-70b-versatile",
      vision: null,
    },
  },
  {
    id: "cerebras",
    label: "Cerebras",
    envKey: "CEREBRAS_API_KEY",
    freeTier: "Gratuit — latence très basse",
    baseURL: "https://api.cerebras.ai/v1",
    models: {
      fast: "llama3.1-8b",
      reasoning: "llama-3.3-70b",
      vision: null,
    },
  },
  {
    id: "mistral",
    label: "Mistral",
    envKey: "MISTRAL_API_KEY",
    freeTier: "Gratuit — bon en français, pertinent pour ce produit",
    baseURL: "https://api.mistral.ai/v1",
    models: {
      fast: "mistral-small-latest",
      reasoning: "mistral-large-latest",
      vision: null,
    },
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    freeTier: "Gratuit sur les modèles suffixés :free",
    baseURL: "https://openrouter.ai/api/v1",
    models: {
      fast: "meta-llama/llama-3.3-70b-instruct:free",
      reasoning: "deepseek/deepseek-r1:free",
      vision: null,
    },
  },
  {
    id: "zhipu",
    label: "Zhipu GLM",
    envKey: "ZHIPU_API_KEY",
    freeTier: "glm-4-flash est gratuit — clé sur z.ai ou open.bigmodel.cn",
    baseURL: "https://api.z.ai/api/paas/v4",
    models: {
      fast: "glm-4-flash",
      reasoning: "glm-4-plus",
      vision: null,
    },
  },
  {
    id: "moonshot",
    label: "Moonshot Kimi",
    envKey: "MOONSHOT_API_KEY",
    freeTier: "Crédits offerts à l'inscription — modèles Kimi (MoE open-weight)",
    baseURL: "https://api.moonshot.ai/v1",
    models: {
      fast: "moonshot-v1-8k",
      reasoning: "moonshot-v1-32k",
      vision: null,
    },
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    freeTier: "Très bon marché — deepseek-reasoner pour le raisonnement",
    baseURL: "https://api.deepseek.com/v1",
    models: {
      fast: "deepseek-chat",
      reasoning: "deepseek-reasoner",
      vision: null,
    },
  },
  {
    id: "github",
    label: "GitHub Models",
    envKey: "GITHUB_MODELS_TOKEN",
    freeTier: "Gratuit avec un compte GitHub — quota horaire",
    baseURL: "https://models.github.ai/inference",
    models: {
      fast: "openai/gpt-4o-mini",
      reasoning: "openai/gpt-4o",
      vision: null,
    },
  },
  {
    id: "nvidia",
    label: "NVIDIA NIM",
    envKey: "NVIDIA_API_KEY",
    freeTier: "Crédits gratuits — modèles open-weight hébergés",
    baseURL: "https://integrate.api.nvidia.com/v1",
    models: {
      fast: "meta/llama-3.3-70b-instruct",
      reasoning: "deepseek-ai/deepseek-r1",
      vision: null,
    },
  },
  {
    id: "together",
    label: "Together AI",
    envKey: "TOGETHER_API_KEY",
    freeTier: "Crédit offert — large catalogue open-weight",
    baseURL: "https://api.together.xyz/v1",
    models: {
      fast: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      reasoning: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
      vision: null,
    },
  },
  {
    id: "stepfun",
    label: "StepFun",
    envKey: "STEPFUN_API_KEY",
    freeTier: "Payant — conservé car déjà intégré",
    baseURL: "https://api.stepfun.com/v1",
    models: {
      fast: "step-1-8k",
      reasoning: "step-2-16k",
      vision: null,
    },
  },
];

function isConfigured(p: ProviderSpec): boolean {
  return Boolean(process.env[p.envKey]?.trim());
}

/** Providers that are configured AND can serve the requested capability. */
export function availableProviders(capability: Capability = "fast"): ProviderSpec[] {
  return PROVIDERS.filter((p) => isConfigured(p) && resolveModel(p, capability));
}

export function hasAnyProvider(): boolean {
  return PROVIDERS.some(isConfigured);
}

/** Build the SDK model handle for one provider. */
function buildModel(p: ProviderSpec, capability: Capability): LanguageModel {
  const modelId = resolveModel(p, capability);
  if (!modelId) throw new Error(`${p.label} ne gère pas « ${capability} »`);

  // Google has a first-party provider; everything else speaks the OpenAI API.
  if (p.id === "google") return google(modelId);

  const client = createOpenAICompatible({
    name: p.id,
    baseURL: p.baseURL!,
    apiKey: process.env[p.envKey]!,
  });
  return client(modelId);
}

/**
 * The model to use right now for a given capability, or null when nothing is
 * configured. Callers must handle null by refusing — never by inventing.
 */
export function selectModel(
  capability: Capability = "fast"
): { model: LanguageModel; provider: ProviderId; modelId: string } | null {
  const [first] = availableProviders(capability);
  if (!first) return null;

  return {
    model: buildModel(first, capability),
    provider: first.id,
    modelId: resolveModel(first, capability)!,
  };
}

/**
 * Run `fn` against each configured provider in turn, returning the first
 * success. Free tiers return 429 often enough that a single-provider setup
 * makes the feature feel broken; with two keys it simply moves on.
 *
 * Errors that are not worth retrying elsewhere (a malformed prompt, a schema
 * mismatch) will fail on every provider anyway, so the cost of trying is
 * bounded by the number of configured providers.
 */
/**
 * Aucun fournisseur ne peut servir la capacité demandée.
 *
 * Classe dédiée — et non un `Error` générique — parce que les routes doivent
 * distinguer « il manque une clé » (503, actionnable, ce n'est pas une panne)
 * de « le code a planté » (500). Les deux remontaient jusqu'ici en
 * « Internal Agent Error », ce qui envoyait chercher un bug là où il fallait
 * juste configurer une clé. Le cas est réel en production : StepFun déclare
 * `vision: null`, donc /api/agent/vision n'a aucun fournisseur.
 */
export class NoProviderError extends Error {
  readonly capability: Capability;

  constructor(capability: Capability) {
    super(
      `Aucun fournisseur IA configuré pour « ${capability} ». ` +
        `Ajoute une clé gratuite dans .env.local — par ex. GOOGLE_GENERATIVE_AI_API_KEY (aistudio.google.com/apikey).`
    );
    this.name = "NoProviderError";
    this.capability = capability;
  }
}

export async function withProviderFailover<T>(
  capability: Capability,
  fn: (model: LanguageModel, meta: { provider: ProviderId; modelId: string }) => Promise<T>
): Promise<{ result: T; provider: ProviderId; modelId: string }> {
  const candidates = availableProviders(capability);

  if (!candidates.length) {
    throw new NoProviderError(capability);
  }

  const failures: string[] = [];

  for (const p of candidates) {
    const modelId = resolveModel(p, capability)!;
    try {
      const result = await fn(buildModel(p, capability), { provider: p.id, modelId });
      return { result, provider: p.id, modelId };
    } catch (err) {
      failures.push(`${p.label}: ${err instanceof Error ? err.message : "erreur inconnue"}`);
    }
  }

  throw new Error(`Tous les fournisseurs ont échoué.\n${failures.join("\n")}`);
}

/**
 * Configuration report for diagnostics. Never includes key values — only
 * whether each key is present.
 */
export function providerStatus() {
  return {
    configured: PROVIDERS.filter(isConfigured).map((p) => ({
      id: p.id,
      label: p.label,
      freeTier: p.freeTier,
      capabilities: (Object.keys(p.models) as Capability[]).filter((c) => resolveModel(p, c)),
    })),
    missing: PROVIDERS.filter((p) => !isConfigured(p)).map((p) => ({
      id: p.id,
      label: p.label,
      envKey: p.envKey,
      freeTier: p.freeTier,
    })),
    activeFor: {
      fast: availableProviders("fast")[0]?.id ?? null,
      reasoning: availableProviders("reasoning")[0]?.id ?? null,
      vision: availableProviders("vision")[0]?.id ?? null,
    },
  };
}
