// ==============================================================================
// VALIDATION SCHEMAS — Zod Schemas for API Input Validation
// ==============================================================================

import { z } from "zod";

// ─── Common Schemas ──────────────────────────────────────────────────────────

export const UUIDSchema = z.string().uuid();

export const EmailSchema = z.string().email("Email invalide");

export const PasswordSchema = z
  .string()
  .min(6, "Mot de passe trop court (min 6 caractères)")
  .max(128, "Mot de passe trop long");

export const IdTokenSchema = z
  .string()
  .min(100, "Token invalide")
  .regex(/^[A-Za-z0-9_-]+$/, "Format de token invalide");

// ─── Post Schemas ────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(10, "Le contenu doit faire au moins 10 caractères")
    .max(5000, "Le contenu ne peut pas dépasser 5000 caractères")
    .transform((val) => val.trim()),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

// ─── Simulation Schemas ──────────────────────────────────────────────────────

export const SimulationDestinationSchema = z.enum([
  "portugal",
  "dubai",
  "thailand",
  "singapore",
  "malaysia",
  "cyprus",
  "malta",
]);

export const CreateSimulationSchema = z.object({
  destination: SimulationDestinationSchema,
  score: z.number().min(0).max(100),
  visa: z.string().min(1).max(100),
  salary: z.number().min(0),
  tax_rate: z.number().min(0).max(100),
  cost_of_living: z.number().min(0),
  climate: z.string().min(1).max(50),
  savings: z.number(),
});

export type CreateSimulationInput = z.infer<typeof CreateSimulationSchema>;

// ─── Skill Schemas ───────────────────────────────────────────────────────────

export const CreateSkillTrackSchema = z.object({
  action: z.literal("create_track"),
  skill_name: z
    .string()
    .min(2, "Nom de skill trop court")
    .max(100, "Nom de skill trop long")
    .transform((val) => val.trim()),
});

export const UpdateMissionSchema = z.object({
  action: z.literal("update_mission"),
  mission_id: z.string().min(1),
  is_completed: z.boolean(),
});

export const SkillActionSchema = z.discriminatedUnion("action", [
  CreateSkillTrackSchema,
  UpdateMissionSchema,
]);

export type SkillActionInput = z.infer<typeof SkillActionSchema>;

// ─── JARVIS Chat Schemas ─────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10000),
});

export const JarvisChatSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
  persona: z
    .enum(["sage", "strategist", "coach", "executor", "friend"])
    .default("strategist"),
});

export type JarvisChatInput = z.infer<typeof JarvisChatSchema>;

// ─── Language Lab Schemas ────────────────────────────────────────────────────

export const LanguageLessonSchema = z.object({
  target_language: z.enum(["en", "es", "de", "it", "pt", "zh", "ja", "ar"]),
  native_language: z.enum(["fr", "en", "nl"]).default("fr"),
  skill_type: z.enum(["speaking", "listening", "grammar", "vocabulary"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  content: z.string().min(10).max(10000),
});

export type LanguageLessonInput = z.infer<typeof LanguageLessonSchema>;

// ─── Check-in Schemas ────────────────────────────────────────────────────────

export const DailyCheckinSchema = z.object({
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  focus: z.number().min(1).max(10),
  notes: z.string().max(1000).optional(),
});

export type DailyCheckinInput = z.infer<typeof DailyCheckinSchema>;

// ─── Validation Helper ───────────────────────────────────────────────────────

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) =>
    `${issue.path.join(".")}: ${issue.message}`
  );

  return { success: false, errors };
}
