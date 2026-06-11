<div align="center">
  <img src="public/logo-icon.png" alt="Operiq AI" width="100" />

  # Operiq AI

  **Workplace Productivity Assistant**

  [![Live](https://img.shields.io/badge/live-operiq--ai.netlify.app-10a37f)](https://operiq-ai.netlify.app)
  [![Built with React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org)
  [![Convex](https://img.shields.io/badge/Convex-backend-ee3424)](https://convex.dev)
  [![Netlify](https://img.shields.io/badge/Netlify-deployed-00c7b7)](https://netlify.com)

</div>

---

## Project Overview

Operiq AI is an AI-powered workplace productivity platform that automates repetitive professional tasks. It helps knowledge workers reclaim time lost to administrative work by providing intelligent assistance for email drafting, meeting summarization, task planning, research analysis, and conversational AI.

Professionals spend up to 60% of their time on administrative and communication tasks. Operiq AI tackles this by integrating large language models, voice processing, and intelligent tool execution into a single, cohesive workspace.

---

## Features

### Smart Email Generator
Generate context-based professional emails with tone variations (formal, informal, persuasive) and audience adaptation (client, manager, team). Powered by AI with structured prompt engineering.

### Meeting Notes Summarizer
Convert lengthy meeting notes into concise summaries. Extracts key discussion points, decisions made, and action items with assigned responsibilities and deadlines.

### AI Task Planner
Generate structured daily or weekly plans with task prioritization using urgency/importance frameworks. Suggests time optimization strategies based on workload.

### AI Research Assistant
Summarize articles, reports, or topics with key insights and recommendations. Simplifies complex information for quick understanding. Integrated with live web search.

### AI Chatbot Interface
Interactive multi-turn assistant with persistent conversation threads. Features include:
- **Agent mode** with autonomous tool execution (web search, URL fetch, image generation, video generation)
- **Voice input** via microphone recording with ElevenLabs speech-to-text
- **Voice output** with text-to-speech playback on AI responses
- **Image generation** via Hugging Face FLUX
- **Video generation** via Hugging Face HunyuanVideo
- **File upload** for document and image analysis
- **Thread sharing** with invite links for collaboration

### Code Studio
AI-assisted code generation, debugging, and review. Create projects from prompts, refactor code, and get architecture guidance.

### Billing & Plans
- **Free tier** — 50 AI requests/day, 5 image generations/day, 50 MB storage
- **Pro tier** — 500 AI requests/day, 50 images/day, 500 MB storage (R19/month demo)
- **Enterprise tier** — Unlimited AI, unlimited images, 5 GB storage (R99/month demo)
- Usage tracking with automatic period reset and rate limiting

---

## Tools Used

### AI & Machine Learning
| Tool | Purpose |
|---|---|
| OpenAI-compatible API | Primary text generation (GPT-4o, Claude, Llama, Nemotron) |
| Hugging Face Inference API | Image generation (FLUX.1-schnell) and video generation (HunyuanVideo) |
| ElevenLabs API | Speech-to-text (Scribe v1) and text-to-speech (Flash v2.5) |
| DuckDuckGo | Web search integration for the agent tool system |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TanStack Start / Router | Latest | SSR, file-system routing, type-safe navigation |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui | Latest | Accessible component library |
| lucide-react | Latest | SVG icon library |
| Vite | 6.x | Build tool and dev server |

### Backend
| Technology | Purpose |
|---|---|
| Convex | Real-time reactive backend: ACID-compliant database, authentication, file storage, serverless functions |
| TypeScript | Type safety across full stack |
| @convex-dev/auth | Password-based authentication with session management |

### Infrastructure
| Technology | Purpose |
|---|---|
| Netlify | Global CDN, edge functions, serverless function hosting |
| Bun | Package manager and runtime |
| Resend | Transactional email delivery |

---

## Setup Instructions

### Prerequisites
- [Bun](https://bun.sh) (package manager)
- [Convex](https://convex.dev) account (database backend)
- [Netlify](https://netlify.com) account (deployment, optional for local dev)
- API keys for AI services (see `.env.example`)

### Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required variables:
```
AI_API_KEY=           # OpenAI-compatible API key
AI_BASE_URL=          # API base URL (defaults to OpenAI)
HUGGINGFACE_TOKEN=    # Hugging Face inference token
ELEVENLABS_API_KEY=   # ElevenLabs API key
VITE_CONVEX_URL=      # Convex deployment URL
RESEND_API_KEY=       # Resend email API key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Lintshiwe/flowdesk-ai.git
cd flowdesk-ai

# Install dependencies
bun install

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Convex Backend

```bash
# Initialize Convex (first time)
npx convex dev

# Deploy Convex functions to production
npx convex deploy
```

### Netlify Deployment

```bash
# Build for Netlify
bun run build:netlify

# Deploy to production
bunx netlify deploy --prod
```

### Project Structure

```
src/
  routes/        # TanStack Start file-system routes
    api/         # API endpoints (chat, huggingface, elevenlabs, resend)
  components/    # Shared React components
  lib/           # Utilities, tools, models, config
    tools/       # Agent tool registry (web_search, fetch_url, generate_image, generate_video)
convex/          # Convex backend functions and schema
  schema.ts      # Database table definitions
  billing.ts     # Billing plans, usage tracking, period reset
  emailDrafts.ts # Email generation
  summaries.ts   # Meeting summary generation
  plans.ts       # Task plan generation
  analyses.ts    # Research analysis generation
  sharedChats.ts # Thread sharing with invite tokens
  profiles.ts    # User profile management
public/          # Static assets (logo, images)
```

---

## License

Copyright (c) 2025 Operiq AI. All rights reserved. Proprietary and confidential.
