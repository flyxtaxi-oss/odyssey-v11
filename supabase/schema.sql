-- ==============================================================================
-- ODYSSEY.AI - SUPABASE SCHEMA (ETAPE 1)
-- ==============================================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Table: profiles (Étend auth.users de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INT,
  profession TEXT,
  family_status TEXT, -- Ex: "Marié, 2 enfants"
  income_level TEXT,
  preferences JSONB, -- Ex: { "climate": "sun", "hobbies": ["tech", "sports"] }
  soft_skills JSONB, -- Ex: ["empathy", "leadership"]
  reputation_score INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: badges (Économie des Experts Anti-Bullshit)
CREATE TABLE public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- Ex: "Expert Fisc Dubaï"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_badges (Liaison Utilisateurs <-> Badges)
CREATE TABLE public.user_badges (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Table: posts (La Safe-Zone / Preuves de Vie)
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE, -- Passera à true via Edge Function si le LLM le juge non-toxique
  toxicity_score FLOAT, -- Score donné par l'IA lors du filtre
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: leads (Modèle B2B)
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_type TEXT NOT NULL, -- Ex: "Lawyer", "Real Estate"
  status TEXT DEFAULT 'pending', -- pending, contacted, converted
  revenue_generated DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: matches (Tinder du Mentorat)
CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_a_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score FLOAT, -- Pourcentage de compatibilité calculé par l'IA
  status TEXT DEFAULT 'proposed', -- proposed, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: conversations (Mémoire J.A.R.V.I.S)
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
CREATE POLICY "Les profils sont visibles par tous" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Un utilisateur peut modifier son propre profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques Posts (Safe Zone)
CREATE POLICY "Tout le monde peut voir les posts vérifiés" ON public.posts FOR SELECT USING (is_verified = true);
CREATE POLICY "Un utilisateur peut insérer un post" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Un utilisateur peut supprimer son propre post" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Politiques Conversations (J.A.R.V.I.S)
CREATE POLICY "L'utilisateur ne voit que ses conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "L'utilisateur peut enregistrer ses messages" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques Matches
CREATE POLICY "L'utilisateur voit ses propres correspondances" ON public.matches FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "L'utilisateur peut accepter/refuser ses matches" ON public.matches FOR UPDATE USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Politiques Leads (Accès bloqué au public)
CREATE POLICY "L'utilisateur peut voir ses propres mises en relation" ON public.leads FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 3. NOUVELLES TABLES V11 (ITERATION 3)
-- ==========================================

-- Knowledge Graph (Personnalisation Avancée)
CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.constraints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL, -- dietary, financial, physical, time
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- food, travel, communication_tone, learning_style
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Loop (Routines)
CREATE TABLE public.checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  top_priority TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.weekly_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  accomplishments TEXT[],
  challenges TEXT[],
  focus_next_week TEXT,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action Engine (Traçabilité)
CREATE TABLE public.action_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  intent TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  status TEXT NOT NULL, -- completed, failed, pending
  output_data JSONB,
  error_message TEXT,
  duration_ms INT,
  undo_instructions TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations / Connectors
CREATE TABLE public.connectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- google, thefork, spotify, etc.
  status TEXT DEFAULT 'disconnected', -- connected, disconnected, error
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.oauth_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL, -- Devrait être encrypté côté applicatif
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. RLS POUR TABLES V11
-- ==========================================
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_goals_policy" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_constraints_policy" ON public.constraints FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_policy" ON public.preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_checkins_policy" ON public.checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_weekly_reviews_policy" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_action_receipts_policy" ON public.action_receipts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_connectors_policy" ON public.connectors FOR ALL USING (auth.uid() = user_id);
-- oauth_tokens réservées au backend (Edge Functions/Serveur), on peut bloquer l'accès côté client
CREATE POLICY "no_client_oauth_tokens" ON public.oauth_tokens FOR SELECT USING (false);

-- ==========================================
-- 5. TRIGGERS & FONCTIONS (Automatisations)
-- ==========================================
-- (Sera exécuté plus tard pour insérer automatiquement un Profile après un Signup Supabase Auth)
-- ==========================================
-- 6. NOUVELLES TABLES V11 (ITERATION 4 - LANGUAGE LAB)
-- ==========================================

CREATE TABLE public.language_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  current_level TEXT DEFAULT 'A1',
  streak_days INT DEFAULT 0,
  xp_points INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_language)
);

CREATE TABLE public.language_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  scenario_prompt TEXT NOT NULL,
  vocabulary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.language_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  word_or_phrase TEXT NOT NULL,
  mastery_level INT DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, language, word_or_phrase)
);

ALTER TABLE public.language_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_language_profiles_policy" ON public.language_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_language_lessons_select" ON public.language_lessons FOR SELECT USING (true);
CREATE POLICY "user_language_progress_policy" ON public.language_progress FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. NOUVELLES TABLES V11 (ITERATION 5 - SKILL ACCELERATOR)
-- ==========================================

CREATE TABLE public.user_skill_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL, -- e.g. "Sales", "Coding", "Finance"
  duration_days INT DEFAULT 30, -- 30, 60, 90
  current_day INT DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, completed, failed
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.skill_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.user_skill_tracks(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  mission_title TEXT NOT NULL,
  mission_prompt TEXT NOT NULL, -- The actual task / quiz
  is_completed BOOLEAN DEFAULT FALSE,
  score INT, -- quiz score if applicable
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_skill_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skill_tracks_policy" ON public.user_skill_tracks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_skill_missions_policy" ON public.skill_missions FOR ALL USING (auth.uid() = user_id);
