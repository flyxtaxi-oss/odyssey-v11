import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  availableProviders,
  hasAnyProvider,
  selectModel,
  providerStatus,
  withProviderFailover,
} from "../ai-providers";

// ==============================================================================
// Provider chain
// ==============================================================================
//
// This module decides which LLM answers a user's question about visas and
// taxes. Two failure modes matter:
//
//   - Selecting a provider whose key is absent → the request fails at runtime
//     instead of falling through to one that works.
//   - Returning a model when nothing is configured → callers assume they can
//     generate, and the "never invent" guarantee in /api/jarvis breaks.
//
// Env is mutated per-test and restored afterwards.

const ALL_KEYS = [
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GROQ_API_KEY",
  "CEREBRAS_API_KEY",
  "MISTRAL_API_KEY",
  "OPENROUTER_API_KEY",
  "ZHIPU_API_KEY",
  "MOONSHOT_API_KEY",
  "DEEPSEEK_API_KEY",
  "GITHUB_MODELS_TOKEN",
  "NVIDIA_API_KEY",
  "TOGETHER_API_KEY",
  "STEPFUN_API_KEY",
];

let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  saved = {};
  for (const k of ALL_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  // Model overrides must not leak between tests either.
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("ODYSSEY_MODEL_")) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  }
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("provider availability", () => {
  it("reports nothing available when no key is set", () => {
    expect(hasAnyProvider()).toBe(false);
    expect(availableProviders("fast")).toHaveLength(0);
    expect(selectModel("fast")).toBeNull();
  });

  it("returns null rather than a model when unconfigured — callers must refuse, not invent", () => {
    expect(selectModel("fast")).toBeNull();
    expect(selectModel("reasoning")).toBeNull();
    expect(selectModel("vision")).toBeNull();
  });

  it("activates a provider as soon as its key appears", () => {
    process.env.GROQ_API_KEY = "test-key";

    expect(hasAnyProvider()).toBe(true);
    expect(availableProviders("fast").map((p) => p.id)).toContain("groq");
  });

  it("never selects a provider whose key is missing", () => {
    process.env.ZHIPU_API_KEY = "test-key";

    const ids = availableProviders("fast").map((p) => p.id);
    expect(ids).toEqual(["zhipu"]);
    expect(selectModel("fast")?.provider).toBe("zhipu");
  });

  it("skips providers that cannot serve the requested capability", () => {
    // Only Google declares a vision model; the rest are text-only.
    process.env.GROQ_API_KEY = "test-key";
    process.env.DEEPSEEK_API_KEY = "test-key";

    expect(availableProviders("vision")).toHaveLength(0);
    expect(selectModel("vision")).toBeNull();
    expect(selectModel("fast")).not.toBeNull();
  });

  it("prefers Google when several providers are configured", () => {
    process.env.TOGETHER_API_KEY = "test-key";
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    expect(selectModel("fast")?.provider).toBe("google");
  });

  it("treats a blank key as absent", () => {
    process.env.GROQ_API_KEY = "   ";
    expect(hasAnyProvider()).toBe(false);
  });
});

describe("model id overrides", () => {
  it("uses the env override instead of the built-in default", () => {
    process.env.ZHIPU_API_KEY = "test-key";
    expect(selectModel("fast")?.modelId).toBe("glm-4-flash");

    // Providers rename models regularly; an override must fix that without a deploy.
    process.env.ODYSSEY_MODEL_ZHIPU_FAST = "glm-4.5-flash";
    expect(selectModel("fast")?.modelId).toBe("glm-4.5-flash");
  });

  it("can enable a capability a provider has no default for", () => {
    process.env.GROQ_API_KEY = "test-key";
    expect(selectModel("vision")).toBeNull();

    process.env.ODYSSEY_MODEL_GROQ_VISION = "llama-4-scout-17b-16e-instruct";
    expect(selectModel("vision")?.provider).toBe("groq");
  });
});

describe("failover", () => {
  it("explains how to fix the problem when nothing is configured", async () => {
    await expect(withProviderFailover("fast", async () => "ok")).rejects.toThrow(
      /Aucun fournisseur/
    );
  });

  it("moves to the next provider when the first throws", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    process.env.GROQ_API_KEY = "test-key";

    const tried: string[] = [];
    const { result, provider } = await withProviderFailover("fast", async (_model, meta) => {
      tried.push(meta.provider);
      // Free tiers return 429 often enough that this is the normal path.
      if (meta.provider === "google") throw new Error("429 rate limited");
      return "réponse";
    });

    expect(tried).toEqual(["google", "groq"]);
    expect(provider).toBe("groq");
    expect(result).toBe("réponse");
  });

  it("surfaces every failure when all providers fail", async () => {
    process.env.GROQ_API_KEY = "test-key";
    process.env.DEEPSEEK_API_KEY = "test-key";

    await expect(
      withProviderFailover("fast", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow(/Tous les fournisseurs/);
  });

  it("stops at the first success without trying the rest", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
    process.env.GROQ_API_KEY = "test-key";

    let calls = 0;
    await withProviderFailover("fast", async () => {
      calls++;
      return "ok";
    });

    expect(calls).toBe(1);
  });
});

describe("providerStatus diagnostics", () => {
  it("never leaks key values", () => {
    process.env.GROQ_API_KEY = "sk-super-secret-value";

    const json = JSON.stringify(providerStatus());
    expect(json).not.toContain("sk-super-secret-value");
  });

  it("lists missing providers with the env var needed to enable them", () => {
    const status = providerStatus();

    expect(status.configured).toHaveLength(0);
    expect(status.missing.length).toBeGreaterThan(5);
    expect(status.missing.every((p) => p.envKey && p.freeTier)).toBe(true);
  });

  it("reports which provider is active per capability", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";

    const status = providerStatus();
    expect(status.activeFor.fast).toBe("google");
    expect(status.activeFor.vision).toBe("google");
  });
});
