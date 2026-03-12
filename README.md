<p align="center">
  <h1 align="center">🚀 Odyssey.ai — Life Operating System</h1>
  <p align="center">
    <strong>The first AI-powered Life OS. Expatriation, finance, career, networking — all powered by J.A.R.V.I.S., your personal AI.</strong>
  </p>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_15-black?logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white" />
</p>

---

## ✨ Features

### 🧠 J.A.R.V.I.S. — AI Command Center
- **Spotlight-style** command bar (`⌘K`) for natural language interaction
- Smart Model Routing (Claude Sonnet / Gemini Pro / Gemini Flash)
- LRU Response Cache (30min TTL, 200 entries)
- Token Bucket Rate Limiting (20 req/min)
- Conversational Memory with fact extraction

### ⚡ Action Engine
- Restaurant search (Google Places API ready, mock fallback)
- Booking system with human-in-the-loop confirmation
- Action receipts and audit trail
- Zod-validated tool schemas

### 📊 Dashboard
- Bento-grid layout with animated counters
- Odyssey Score with 5-axis performance tracking
- Real-time activity timeline
- Glassmorphism UI with Framer Motion animations

### 🌍 Language Lab
- Placement test (A1 → C2)
- Spaced Repetition System (SRS) flashcards
- AI-powered roleplay scenarios
- Streak tracking and progress dashboard

### 🚀 Skill Accelerator
- Custom learning tracks (30/60/90 days)
- Daily AI-generated missions
- XP system with level progression
- Badge achievements

### 🌐 Internationalization (i18n)
- Full support for **French**, **English**, and **Dutch**
- Auto language detection from user messages
- Per-locale JARVIS personality

### 🛡️ Security
- Anti prompt-injection detection (25+ patterns)
- Input sanitization & web content quarantine
- Human-in-the-loop for all dangerous actions
- Row Level Security (RLS) on Supabase
- Security headers (CSP, XSS Protection, HSTS)
- Audit logging

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL + RLS) |
| **AI Models** | Claude Sonnet 4, Gemini 2.5 Pro/Flash |
| **Hosting** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/flyxtaxi-oss/odyssey-v11.git
cd odyssey-v11

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers (at least one required for live mode)
ANTHROPIC_API_KEY=sk-ant-xxx          # For Claude Sonnet
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy-xxx  # For Gemini

# Optional
GOOGLE_PLACES_API_KEY=your_key        # For real restaurant search
```

### Database Setup

1. Create a project on [Supabase](https://supabase.com)
2. Go to SQL Editor
3. Paste and run the contents of `supabase/schema.sql`

---

## 📁 Project Structure

```
odyssey/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── jarvis/             # JARVIS chat interface
│   │   ├── simulator/          # Life simulator
│   │   ├── safezone/           # Social network
│   │   ├── language/           # Language Lab
│   │   ├── skills/             # Skill Accelerator
│   │   ├── settings/           # User settings
│   │   └── api/                # API routes
│   │       ├── agent/          # Action Engine (plan + execute)
│   │       ├── jarvis/         # AI chat endpoint
│   │       ├── language/       # Language Lab API
│   │       ├── skills/         # Skill Accelerator API
│   │       └── dashboard/      # Dashboard data
│   ├── components/
│   │   ├── CommandCenter.tsx   # ⌘K Spotlight bar
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── lib/
│       ├── ai-engine.ts        # AI routing, cache, memory
│       ├── action-engine.ts    # Tool registry & execution
│       ├── i18n.ts             # Internationalization
│       ├── security.ts         # Anti-injection & audit
│       ├── supabase.ts         # Database client
│       └── database.types.ts   # TypeScript DB types
├── supabase/
│   └── schema.sql              # Full database schema
├── public/                     # Static assets
└── docs/                       # Documentation
```

---

## 🔒 Security Model

| Measure | Implementation |
|---------|---------------|
| Human-in-the-loop | Confirmation required for ALL real-world actions |
| Prompt Injection | 25+ pattern detection with severity scoring |
| Input Sanitization | HTML stripping, null byte removal, length limits |
| Web Quarantine | External content isolated in marked blocks |
| RGPD / GDPR | Opt-in memory, data export, account deletion |
| API Keys | `.env.local` only, never committed to code |
| Database | Row Level Security (RLS) on all tables |
| Audit Trail | Every action logged with timestamp and result |

---

## 📄 License

This project is private and proprietary. © 2026 Jibril — All rights reserved.

---

<p align="center">
  Built with ❤️ by <strong>Jibril</strong> — powered by <strong>Odyssey.ai</strong>
</p>
