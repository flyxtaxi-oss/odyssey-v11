// ==============================================================================
// AI MODEL CONFIGURATION — single source of truth for model ids
// ==============================================================================
//
// Model ids were previously hardcoded at each call site ("gemini-1.5-pro-latest"
// in api/agent and api/agent/vision). That made provider upgrades a
// search-and-replace across routes, and silently pinned the app to a model
// Google has since deprecated.
//
// Override any of these with an env var to roll a new model out without a code
// change — useful when a provider retires a model mid-week.

/** Reasoning / structured-output model. Used for tool routing and planning. */
export const MODEL_REASONING =
  process.env.AI_MODEL_REASONING || "gemini-2.5-pro";

/** Fast, cheap model. Used for short conversational turns and classification. */
export const MODEL_FAST =
  process.env.AI_MODEL_FAST || "gemini-2.5-flash";

/** Multimodal model for image understanding. */
export const MODEL_VISION =
  process.env.AI_MODEL_VISION || "gemini-2.5-pro";

/**
 * Whether any LLM provider is actually configured.
 *
 * The app ships a mock-response fallback so the UI is demoable without keys.
 * That fallback is helpful in development and dangerous in production: it
 * returns invented, confident-sounding answers about visas and taxes. Routes
 * use this to refuse rather than fabricate when running in production.
 */
export function hasLlmProvider(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.STEPFUN_API_KEY ||
      process.env.ANTHROPIC_API_KEY
  );
}

/** True when serving real users without a configured provider. */
export function mockWouldMisleadUsers(): boolean {
  return process.env.NODE_ENV === "production" && !hasLlmProvider();
}
