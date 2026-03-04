// ==============================================================================
// ODYSSEY.AI — Database Types (matches supabase/schema.sql)
// ==============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    age: number | null;
                    profession: string | null;
                    family_status: string | null;
                    income_level: string | null;
                    preferences: Json | null;
                    soft_skills: Json | null;
                    reputation_score: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    age?: number | null;
                    profession?: string | null;
                    family_status?: string | null;
                    income_level?: string | null;
                    preferences?: Json | null;
                    soft_skills?: Json | null;
                    reputation_score?: number;
                };
                Update: {
                    full_name?: string | null;
                    age?: number | null;
                    profession?: string | null;
                    family_status?: string | null;
                    income_level?: string | null;
                    preferences?: Json | null;
                    soft_skills?: Json | null;
                    reputation_score?: number;
                };
            };
            badges: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    name: string;
                    description?: string | null;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                };
            };
            user_badges: {
                Row: {
                    user_id: string;
                    badge_id: string;
                    awarded_at: string;
                };
                Insert: {
                    user_id: string;
                    badge_id: string;
                };
                Update: never;
            };
            posts: {
                Row: {
                    id: string;
                    author_id: string;
                    content: string;
                    is_verified: boolean;
                    toxicity_score: number | null;
                    created_at: string;
                };
                Insert: {
                    author_id: string;
                    content: string;
                    is_verified?: boolean;
                    toxicity_score?: number | null;
                };
                Update: {
                    content?: string;
                    is_verified?: boolean;
                    toxicity_score?: number | null;
                };
            };
            leads: {
                Row: {
                    id: string;
                    user_id: string;
                    partner_type: string;
                    status: string;
                    revenue_generated: number;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    partner_type: string;
                    status?: string;
                    revenue_generated?: number;
                };
                Update: {
                    status?: string;
                    revenue_generated?: number;
                };
            };
            matches: {
                Row: {
                    id: string;
                    user_a_id: string;
                    user_b_id: string;
                    match_score: number | null;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    user_a_id: string;
                    user_b_id: string;
                    match_score?: number | null;
                    status?: string;
                };
                Update: {
                    match_score?: number | null;
                    status?: string;
                };
            };
            conversations: {
                Row: {
                    id: string;
                    user_id: string;
                    role: "user" | "assistant";
                    content: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    role: "user" | "assistant";
                    content: string;
                };
                Update: {
                    content?: string;
                };
            };
            language_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    target_language: string;
                    native_language: string;
                    current_level: string;
                    streak_days: number;
                    xp_points: number;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    target_language: string;
                    native_language: string;
                    current_level?: string;
                    streak_days?: number;
                    xp_points?: number;
                };
                Update: {
                    current_level?: string;
                    streak_days?: number;
                    xp_points?: number;
                };
            };
            language_lessons: {
                Row: {
                    id: string;
                    language: string;
                    level: string;
                    topic: string;
                    title: string;
                    scenario_prompt: string;
                    vocabulary: Json | null;
                    created_at: string;
                };
                Insert: {
                    language: string;
                    level: string;
                    topic: string;
                    title: string;
                    scenario_prompt: string;
                    vocabulary?: Json | null;
                };
                Update: {
                    level?: string;
                    topic?: string;
                    title?: string;
                    scenario_prompt?: string;
                    vocabulary?: Json | null;
                };
            };
            language_progress: {
                Row: {
                    id: string;
                    user_id: string;
                    language: string;
                    word_or_phrase: string;
                    mastery_level: number;
                    next_review_at: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    language: string;
                    word_or_phrase: string;
                    mastery_level?: number;
                    next_review_at?: string;
                };
                Update: {
                    mastery_level?: number;
                    next_review_at?: string;
                };
            };
            user_skill_tracks: {
                Row: {
                    id: string;
                    user_id: string;
                    skill_name: string;
                    current_level: string;
                    progress_percentage: number;
                    mastery_criteria: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    skill_name: string;
                    current_level?: string;
                    progress_percentage?: number;
                    mastery_criteria?: Json | null;
                };
                Update: {
                    current_level?: string;
                    progress_percentage?: number;
                    mastery_criteria?: Json | null;
                };
            };
            skill_missions: {
                Row: {
                    id: string;
                    skill_track_id: string;
                    mission_title: string;
                    description: string;
                    difficulty: string;
                    xp_reward: number;
                    is_completed: boolean;
                    created_at: string;
                };
                Insert: {
                    skill_track_id: string;
                    mission_title: string;
                    description: string;
                    difficulty?: string;
                    xp_reward?: number;
                    is_completed?: boolean;
                };
                Update: {
                    is_completed?: boolean;
                };
            };
        };
    };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LanguageProfile = Database["public"]["Tables"]["language_profiles"]["Row"];
export type LanguageLesson = Database["public"]["Tables"]["language_lessons"]["Row"];
export type LanguageProgress = Database["public"]["Tables"]["language_progress"]["Row"];
export type UserSkillTrack = Database["public"]["Tables"]["user_skill_tracks"]["Row"];
export type SkillMission = Database["public"]["Tables"]["skill_missions"]["Row"];
