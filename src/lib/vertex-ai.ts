// ==============================================================================
// VERTEX AI / GEMINI — Advanced AI Features for Odyssey.v11
// Optimized routing: Gemini for speed, Claude for depth
// ==============================================================================

import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText } from "ai";

// ─── Model Configuration ─────────────────────────────────────────────────────

export type AIModel = "gemini-fast" | "gemini-pro" | "claude-haiku" | "claude-sonnet";

interface ModelConfig {
  id: AIModel;
  provider: "google" | "anthropic";
  model: string;
  maxTokens: number;
  temperature: number;
  useCase: string;
  costPer1kTokens: number;
}

const MODELS: Record<AIModel, ModelConfig> = {
  "gemini-fast": {
    id: "gemini-fast",
    provider: "google",
    model: "gemini-2.0-flash-exp",
    maxTokens: 2048,
    temperature: 0.7,
    useCase: "Quick responses, brainstorming, simple queries",
    costPer1kTokens: 0.0001,
  },
  "gemini-pro": {
    id: "gemini-pro",
    provider: "google",
    model: "gemini-1.5-pro-latest",
    maxTokens: 8192,
    temperature: 0.7,
    useCase: "Complex reasoning, code generation, analysis",
    costPer1kTokens: 0.0035,
  },
  "claude-haiku": {
    id: "claude-haiku",
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    maxTokens: 4096,
    temperature: 0.7,
    useCase: "Fast Claude responses, cost-effective",
    costPer1kTokens: 0.00025,
  },
  "claude-sonnet": {
    id: "claude-sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 8192,
    temperature: 0.7,
    useCase: "Deep analysis, creative writing, complex tasks",
    costPer1kTokens: 0.003,
  },
};

// ─── Smart Model Router ──────────────────────────────────────────────────────

export interface RoutingDecision {
  model: AIModel;
  reason: string;
  estimatedCost: number;
}

export function routeModel(
  query: string,
  complexity: "low" | "medium" | "high" = "medium",
  preference?: "speed" | "quality" | "cost"
): RoutingDecision {
  const lowerQuery = query.toLowerCase();

  // Check for complex patterns
  const isComplex =
    complexity === "high" ||
    lowerQuery.includes("analyse") ||
    lowerQuery.includes("stratégie") ||
    lowerQuery.includes("code") ||
    lowerQuery.includes("compare") ||
    lowerQuery.length > 500;

  const isSimple =
    complexity === "low" ||
    lowerQuery.length < 100 ||
    lowerQuery.match(/^(bonjour|salut|merci|ok|d'accord)/);

  // Route based on preference
  if (preference === "speed" || isSimple) {
    return {
      model: "gemini-fast",
      reason: "Fast response for simple query",
      estimatedCost: 0.0001,
    };
  }

  if (preference === "cost" && !isComplex) {
    return {
      model: "claude-haiku",
      reason: "Cost-effective option",
      estimatedCost: 0.00025,
    };
  }

  if (isComplex || preference === "quality") {
    // Alternate between Claude and Gemini for quality
    const useClaude = Math.random() > 0.3; // 70% Claude for quality
    return {
      model: useClaude ? "claude-sonnet" : "gemini-pro",
      reason: "High complexity task - using best model",
      estimatedCost: useClaude ? 0.003 : 0.0035,
    };
  }

  // Default
  return {
    model: "gemini-pro",
    reason: "Balanced performance",
    estimatedCost: 0.0035,
  };
}

// ─── Message Type ────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── Optimized AI Generation ─────────────────────────────────────────────────

export interface AIGenerationOptions {
  messages: ChatMessage[];
  model?: AIModel;
  system?: string;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export async function generateAIResponse(options: AIGenerationOptions & { stream: false }): Promise<string>;
export async function generateAIResponse(options: AIGenerationOptions & { stream: true }): Promise<ReadableStream>;
export async function generateAIResponse(
  options: AIGenerationOptions
): Promise<string | ReadableStream> {
  const { messages, model = "gemini-pro", system, stream = false } = options;
  const config = MODELS[model];

  const modelInstance =
    config.provider === "google"
      ? google(config.model)
      : anthropic(config.model);

  if (stream) {
    const result = streamText({
      model: modelInstance,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      system,
    });
    
    // Convert to ReadableStream
    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
  }

  const result = await generateText({
    model: modelInstance,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    system,
  });

  return result.text;
}

// ─── Multi-Modal Features (Gemini Vision) ────────────────────────────────────

export interface ImageAnalysisRequest {
  imageBase64: string;
  prompt: string;
  mimeType?: string;
}

export async function analyzeImage(request: ImageAnalysisRequest): Promise<string> {
  const { imageBase64, prompt, mimeType = "image/jpeg" } = request;

  const result = await generateText({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image",
            image: `data:${mimeType};base64,${imageBase64}`,
          },
        ] as unknown as string, // Type assertion for SDK compatibility
      },
    ],
  });

  return result.text;
}

// ─── Cost Tracking ───────────────────────────────────────────────────────────

interface UsageTracker {
  totalTokens: number;
  totalCost: number;
  requests: number;
}

const usageStore = new Map<string, UsageTracker>();

export function trackUsage(userId: string, model: AIModel, tokens: number): void {
  const config = MODELS[model];
  const cost = (tokens / 1000) * config.costPer1kTokens;

  const current = usageStore.get(userId) || {
    totalTokens: 0,
    totalCost: 0,
    requests: 0,
  };

  usageStore.set(userId, {
    totalTokens: current.totalTokens + tokens,
    totalCost: current.totalCost + cost,
    requests: current.requests + 1,
  });
}

export function getUsage(userId: string): UsageTracker | null {
  return usageStore.get(userId) || null;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { MODELS };
export type { ModelConfig, ChatMessage };
