// ==============================================================================
// AI Router — StepFun-first, Gemini fallback for Odyssey.v11
// (Anthropic removed — cost optimization, May 2026)
// ==============================================================================

import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, streamText } from "ai";

const stepfun = createOpenAICompatible({
  name: "stepfun",
  baseURL: "https://api.stepfun.com/v1",
  apiKey: process.env.STEPFUN_API_KEY ?? "",
});

// ─── Model Configuration ─────────────────────────────────────────────────────

export type AIModel = "gemini-fast" | "gemini-pro" | "step-flash" | "step-deep";

interface ModelConfig {
  id: AIModel;
  provider: "google" | "stepfun";
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
  "step-flash": {
    id: "step-flash",
    provider: "stepfun",
    model: "step-3.5-flash",
    maxTokens: 2048,
    temperature: 0.7,
    useCase: "Ultra-cheap fast responses, high volume chat",
    costPer1kTokens: 0.0001, // ~$0.10/M input
  },
  "step-deep": {
    id: "step-deep",
    provider: "stepfun",
    model: "step-3",
    maxTokens: 4096,
    temperature: 0.7,
    useCase: "Deep reasoning, multimodal MoE",
    costPer1kTokens: 0.0006, // ~$0.57/M input
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
    !!lowerQuery.match(/^(bonjour|salut|merci|ok|d'accord)/);

  // Speed / cost / simple → StepFun Flash (cheapest, fastest)
  if (preference === "speed" || preference === "cost" || isSimple) {
    return {
      model: "step-flash",
      reason: "StepFun Flash — fast & cheap for simple queries",
      estimatedCost: 0.0001,
    };
  }

  // Complex / quality → StepFun Deep (Step-3 MoE) preferred, Gemini Pro fallback
  if (isComplex || preference === "quality") {
    return {
      model: "step-deep",
      reason: "StepFun Step-3 — MoE for complex reasoning",
      estimatedCost: 0.0006,
    };
  }

  // Default balanced
  return {
    model: "step-flash",
    reason: "Balanced StepFun default",
    estimatedCost: 0.0001,
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
  const { messages, model = "step-flash", system, stream = false } = options;
  const config = MODELS[model];

  const modelInstance =
    config.provider === "google"
      ? google(config.model)
      : stepfun(config.model);

  if (stream) {
    const result = streamText({
      model: modelInstance,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      system,
    });

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

// ─── Multi-Modal Features (Gemini Vision — StepFun vision not yet integrated) ─

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
        ] as unknown as string,
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

export { MODELS };
export type { ModelConfig, ChatMessage };
