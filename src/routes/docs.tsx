/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Target,
  Lightbulb,
  Cpu,
  Layers,
  GitBranch,
  Shield,
  ClipboardCheck,
  Wrench,
  FileText,
  AlertTriangle,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  ChevronRight,
  Server,
  Database,
  Bot,
  Workflow,
  Zap,
  Lock,
  Globe,
  Phone,
  Mail as MailIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Eye,
  X,
  CircleDollarSign,
  Star,
  Award,
  FileCode,
  Image,
  Film,
  Volume2,
  Mic,
  Package,
  TypeScript,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Operiq AI documentation — system architecture, prompt engineering, responsible AI, and evaluation criteria.",
      },
    ],
  }),
  component: DocsPage,
});

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: Section[] = [
  { id: "problem-statement", title: "Problem Statement", icon: <Target className="size-4" /> },
  { id: "solution-overview", title: "Solution Overview", icon: <Lightbulb className="size-4" /> },
  { id: "system-architecture", title: "System Architecture", icon: <Cpu className="size-4" /> },
  { id: "software-architecture", title: "Software Architecture", icon: <Layers className="size-4" /> },
  { id: "prompt-engineering", title: "Prompt Engineering", icon: <GitBranch className="size-4" /> },
  { id: "responsible-ai", title: "Responsible AI", icon: <Shield className="size-4" /> },
  { id: "evaluation-criteria", title: "Evaluation Criteria", icon: <ClipboardCheck className="size-4" /> },
  { id: "tools-technologies", title: "Tools & Technologies", icon: <Wrench className="size-4" /> },
  { id: "sample-prompts", title: "Sample Prompts & Outputs", icon: <FileText className="size-4" /> },
  { id: "challenges", title: "Challenges & Solutions", icon: <AlertTriangle className="size-4" /> },
];

function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("problem-statement");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Watermark */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/logo-icon.png')",
          backgroundSize: "800px",
          opacity: 0.02,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="Operiq AI" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Operiq AI</span>
          </a>
          <span className="text-xs text-muted-foreground font-mono">v2.0.0</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden px-4 py-3 border-b border-border">
          <button
            onClick={() => setMobileSidebarOpen((v) => !v)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Toggle table of contents"
          >
            <Menu className="size-4" />
            {mobileSidebarOpen ? "Hide contents" : "Show contents"}
          </button>
        </div>

        {/* Sidebar TOC */}
        <aside className={cn(
          "lg:w-64 lg:min-h-[calc(100dvh-57px)] lg:border-r lg:border-border lg:sticky lg:top-0",
          mobileSidebarOpen ? "block" : "hidden lg:block"
        )}>
          <nav className="p-4 lg:p-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Documentation
            </p>
            <ul className="space-y-0.5">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left " +
                        (isActive
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-card")
                      }
                    >
                      <span className="shrink-0">{section.icon}</span>
                      <span className="truncate">{section.title}</span>
                      {isActive && <ChevronRight className="size-3.5 ml-auto shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8 lg:px-12 lg:py-12">
          <div className="max-w-3xl space-y-16">
            {/* Page title */}
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Operiq AI</p>
              <h1 className="mt-3 text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                Operiq AI Technical Documentation
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">
                Comprehensive documentation covering system architecture, prompt engineering,
                responsible AI practices, and evaluation alignment.
              </p>
            </div>

            {/* Section 1: Problem Statement */}
            <SectionBlock id="problem-statement" title="Problem Statement" icon={<Target className="size-5" />}>
              <p>
                Working professionals across industries spend a significant portion of their day on repetitive,
                time-consuming tasks: drafting emails, summarizing meetings, planning tasks, and researching topics.
                These activities, while necessary, divert attention from high-value strategic work and creative problem-solving.
              </p>
              <p>
                Studies show that knowledge workers can spend up to 60% of their time on administrative and
                communication tasks rather than core responsibilities. The cumulative effect is reduced productivity,
                delayed decision-making, and professional burnout.
              </p>

              <SubHeading>The Solution</SubHeading>
              <p>
                <strong>Operiq AI</strong> is an AI-driven workplace productivity platform designed to automate and
                accelerate these repetitive tasks. By leveraging large language models and intelligent automation,
                Operiq AI helps professionals reclaim their time and focus on what matters most.
              </p>

            </SectionBlock>

            {/* Section 2: Solution Overview */}
            <SectionBlock id="solution-overview" title="Solution Overview" icon={<Lightbulb className="size-5" />}>
              <p>
                Operiq AI delivers five core AI-powered productivity tools, each designed to address a specific
                workplace pain point. All tools share a unified interface philosophy: single-column composer canvas,
                intelligent AI generation, and a copy-and-refine workflow.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <FeatureCard
                  icon={<Mail className="size-5" />}
                  title="Smart Email Generator"
                  description="Draft polished business emails with selectable tone (formal, informal, persuasive) and audience (client, manager, team). Includes subject-line generation and contextual awareness."
                />
                <FeatureCard
                  icon={<CalendarCheck2 className="size-5" />}
                  title="Meeting Notes Summarizer"
                  description="Transform raw meeting notes into structured executive briefings with summaries, key decisions, action items, and deadlines. Supports meeting type classification (1:1, team sync, client call, all-hands)."
                />
                <FeatureCard
                  icon={<ListChecks className="size-5" />}
                  title="AI Task Planner"
                  description="Generate prioritized daily or weekly plans from task lists and goals. Uses Eisenhower matrix prioritization (P1/P2/P3) with time-block suggestions and productivity recommendations."
                />
                <FeatureCard
                  icon={<BookOpen className="size-5" />}
                  title="AI Research Assistant"
                  description="Distill research material into executive summaries, key insights, actionable recommendations, and open questions. Supports three depth levels: quick summary, deep analysis, and executive brief."
                />
                <FeatureCard
                  icon={<MessageSquareText className="size-5" />}
                  title="AI Chatbot Interface"
                  description="General-purpose AI assistant with streaming responses, multi-turn conversation, web search, file analysis, image generation, voice input/output, and video generation capabilities."
                />
              </div>
            </SectionBlock>

            {/* Section 3: System Architecture */}
            <SectionBlock id="system-architecture" title="System Architecture" icon={<Cpu className="size-5" />}>
              <SubHeading>Overview</SubHeading>
              <p>
                Operiq AI is deployed on Netlify&apos;s global edge infrastructure, combining server-side rendering
                with a real-time backend powered by Convex. The frontend is a single-page application built with
                TanStack Start and React 19, optimized for instant navigation and offline resilience.
              </p>

              <SubHeading>Infrastructure Components</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Server className="size-4" />}>
                  <strong>Netlify Edge</strong> — Global CDN with edge functions for request routing,
                  authentication middleware, security headers, and geolocation-aware responses.
                </ListItem>
                <ListItem icon={<Database className="size-4" />}>
                  <strong>Convex Cloud</strong> — Real-time reactive backend providing ACID-compliant
                  database operations, scheduled functions, file storage, and built-in authentication.
                </ListItem>
                <ListItem icon={<Bot className="size-4" />}>
                  <strong>AI Providers</strong> — OpenAI-compatible API (via OpenRouter) with NVIDIA-hosted
                  models (Mistral Large 3, Llama 3.3, Nemotron); ElevenLabs for TTS/STT; Hugging Face for image/video generation.
                </ListItem>
                <ListItem icon={<Workflow className="size-4" />}>
                  <strong>External Services</strong> — Resend for transactional email delivery;
                  Stripe for subscription billing (ZAR currency) and payment processing.
                </ListItem>
              </ul>

              <SubHeading>Deployment Topology</SubHeading>
              <p>
                The application deploys as a single Netlify site with SSR via a manual server function wrapper.
                Preview deployments are generated on every pull request. The Convex backend runs in a separate
                deployment with environment-specific configuration managed through deploy contexts and
                environment variables.
              </p>
              <CodeBlock>{`NETLIFY EDGE
  +-- CDN Cache
  +-- Edge Functions (security headers)
  +-- Static Assets
  |
  +-> SSR Server (TanStack Start)
        +-> API Routes (/api/chat, /api/huggingface, etc.)
        |
        +-> CONVEX (Database + Auth)
        +-> AI_PROVIDER (OpenAI-compatible API)
        +-> RESEND (Email)
        +-> ELEVENLABS (Voice)
        +-> HUGGINGFACE (Image/Video)`}</CodeBlock>

              <SubHeading>Architecture Diagrams</SubHeading>
              <div className="space-y-4 mt-4">
                <div className="border border-border rounded-xl p-4 bg-card">
                  <p className="text-sm font-medium text-muted-foreground mb-3">System Architecture Overview</p>
                  <img
                    src="/docs/operiq-architecture.png"
                    alt="Operiq AI System Architecture"
                    className="w-full rounded-lg border border-border/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className = "text-sm text-muted-foreground text-center py-8 bg-card rounded-lg";
                        placeholder.textContent = "Architecture diagram: docs/operiq-architecture.png";
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The architecture diagram above illustrates the full system topology including frontend,
                  SSR layer, API gateway, Convex backend, and external AI service integrations.
                </p>
              </div>
            </SectionBlock>

            {/* Section 4: Software Architecture */}
            <SectionBlock id="software-architecture" title="Software Architecture" icon={<Layers className="size-5" />}>
              <SubHeading>Frontend Architecture</SubHeading>
              <p>
                The frontend is built with <strong>React 19</strong>, <strong>TanStack Start</strong> (for SSR),
                <strong>TanStack Router</strong> (file-system routing), <strong>Tailwind CSS v4</strong>, and
                <strong>shadcn/ui</strong> components. Each route is a self-contained module with its own
                head metadata, loading states, and error boundaries.
              </p>

              <SubHeading>Component Hierarchy</SubHeading>
              <CodeBlock>{`RootLayout (__root.tsx)
  +-- ConvexAuthProvider
        +-- DevToolsGuard
              +-- AuthGate
                    +-- AppShell
                    |     +-- Sidebar
                    |     |     +-- NavItem (Assistant, Code)
                    |     |     +-- Studio NavItem (Email, Meetings, Planner, Research)
                    |     |     +-- UserProfile + LogoutButton
                    |     +-- Main Content
                    |           +-- Feature Pages
                    |           |     +-- Email Studio
                    |           |     +-- Meeting Intelligence
                    |           |     +-- Task Planner
                    |           |     +-- Research Hub
                    |           |     +-- Operiq Code
                    |           +-- AI Assistant
                    |           +-- Settings (General, Personalization, Billing, Storage, Contact)
                    +-- Public Routes
                          +-- /login
                          +-- /signup
                          +-- /invite/:token
                          +-- /docs`}</CodeBlock>

              <SubHeading>Backend Architecture</SubHeading>
              <p>
                The backend is organized into Convex modules, each handling a specific domain. Actions
                provide the bridge between Convex&apos;s deterministic functions and external APIs (AI
                providers, email services). Internal mutations and queries handle state management with
                reactive updates to connected clients.
              </p>
              <CodeBlock>{`convex/
  +-- schema.ts              # Database schema (users, profiles, threads, emailDrafts,
  |                         # meetingSummaries, taskPlans, researchAnalyses, sharedChats, billing)
  +-- auth.ts                # Convex Auth configuration (Password provider)
  +-- users.ts               # User management (me, updateProfile)
  +-- profiles.ts            # Profile CRUD (getProfile, updateProfile, updateAvatar)
  +-- emailDrafts.ts         # Email draft generation and storage
  +-- summaries.ts           # Meeting summary generation
  +-- plans.ts               # Task plan generation
  +-- analyses.ts            # Research analysis generation
  +-- billing.ts             # Usage tracking, plan management, subscriptions
  +-- ai.ts                  # Shared AI helper (callAI via fetch)
  +-- http.ts                # HTTP endpoint handlers
  +-- _generated/
        +-- api.ts           # Auto-generated API types

src/routes/api/
  +-- chat.ts                # Streaming chat endpoint (normal + agent mode)
  +-- code.ts                # Code generation endpoint
  +-- elevenlabs-tts.ts      # Text-to-speech streaming
  +-- elevenlabs-stt.ts      # Speech-to-text
  +-- huggingface.ts         # Image generation
  +-- huggingface-video.ts   # Video generation
  +-- resend.ts              # Email sending`}</CodeBlock>

              <SubHeading>Database Schema</SubHeading>
              <p>The Convex database schema includes the following tables (real project schema):</p>
              <CodeBlock>{`profiles          — userId, displayName, avatarUrl, createdAt
threads           — userId, title, messages[{id, role, content, createdAt}], createdAt, updatedAt
emailDrafts       — userId, recipient, subject, tone, audience, context, draft, sent, sentAt, createdAt
meetingSummaries  — userId, meetingType, notes, output, createdAt
taskPlans         — userId, horizon, tasks, goals, output, createdAt
researchAnalyses  — userId, material, question, depth, output, createdAt
sharedChats       — threadId, ownerId, token, isActive, createdAt, invitedUserIds[]
billing           — userId, plan, aiRequestsUsed, aiRequestsLimit, imagesGenerated,
                    imagesLimit, storageUsed, storageLimit, subscriptionStatus,
                    currentPeriodStart, currentPeriodEnd, createdAt`}</CodeBlock>

              <SubHeading>State Management</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Server State</strong> — Managed by Convex&apos;s reactive queries
                  (<code>useQuery</code>). Data changes automatically propagate to all connected clients
                  without manual cache invalidation.
                </ListItem>
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Client State</strong> — Local component state via React&apos;s
                  <code>useState</code> for ephemeral UI state (form inputs, loading indicators, model selection).
                </ListItem>
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Auth State</strong> — Managed via <code>@convex-dev/auth</code> with
                  ConvexAuthProvider at the root level. SSR-safe wrapper (<code>useSsrConvexAuth</code>)
                  prevents server-side crashes.
                </ListItem>
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Local Storage</strong> — Theme preference (<code>operiq-theme</code>),
                  model selection (<code>operiq-chat-model</code>, <code>operiq-code-model</code>),
                  agent mode (<code>operiq-agent-mode</code>), and user preferences (language, voice, custom instructions).
                </ListItem>
              </ul>
            </SectionBlock>

            {/* Section 5: Prompt Engineering */}
            <SectionBlock id="prompt-engineering" title="Prompt Engineering" icon={<GitBranch className="size-5" />}>
              <p>
                Prompt engineering is a core competency, representing
                <strong> 25% of the evaluation criteria</strong>. Operiq AI demonstrates structured, tested,
                and refined prompts across all AI features.
              </p>

              <SubHeading>Prompt Structure</SubHeading>
              <p>Every prompt in Operiq AI follows a consistent four-part structure:</p>
              <ul className="space-y-3 mt-3">
                <ListItem icon={<CheckCircle2 className="size-4" />}>
                  <strong>System Instructions</strong> — Define the AI&apos;s persona, role, and behavioral constraints.
                </ListItem>
                <ListItem icon={<CheckCircle2 className="size-4" />}>
                  <strong>Context Injection</strong> — User-provided data (notes, topics, material) is injected
                  with clear delineation from system instructions.
                </ListItem>
                <ListItem icon={<CheckCircle2 className="size-4" />}>
                  <strong>Output Formatting</strong> — Explicit structure requirements (markdown sections,
                  bullet lists, numbered items) ensure consistent, parseable output.
                </ListItem>
                <ListItem icon={<CheckCircle2 className="size-4" />}>
                  <strong>Guardrails</strong> — Constraints on tone, length, prohibited content, and
                  bias awareness to ensure responsible output.
                </ListItem>
              </ul>

              <SubHeading>1. Assistant System Prompt</SubHeading>
              <p>The chat assistant uses a carefully crafted system prompt that defines its personality and boundaries:</p>
              <CodeBlock>{`You are Operiq AI, a calm, precise executive productivity assistant
for working professionals.

Specialties: drafting communications, summarizing meetings, structuring
plans, distilling research, and answering workplace questions.

Be concise, professional, and well-structured. Prefer markdown with
short headings and lists.

When uncertain, say so. Remind users to review AI-generated output
before acting on it when stakes are high.

Avoid speculation about real people and avoid politically loaded
claims; flag potential bias and limitations when relevant.`}</CodeBlock>

              <SubHeading>2. Agent Mode Extension</SubHeading>
              <p>When agent mode is enabled, the system prompt is extended with ReAct (Reasoning + Acting) instructions:</p>
              <CodeBlock>{`You are Operiq AI, an autonomous agent with access to tools.
Follow this ReAct pattern:

1. THINK about what you need to do to answer the user's request.
2. If you need to fetch data or search, use the appropriate tool.
3. Observe the tool result and decide if you need more information.
4. Once you have enough information, provide a clear, helpful final answer.

Guidelines:
- Use web_search to find current information from the internet.
- Use fetch_url to retrieve content from specific web pages.
- If a tool returns insufficient results, try a different approach.
- Be concise and direct in your final answer.
- When you have enough information to answer, respond directly
  without calling more tools.`}</CodeBlock>

              <SubHeading>3. Email Generator Prompt</SubHeading>
              <p>The email generator uses a dynamic prompt that adapts to user-selected parameters:</p>
              <CodeBlock>{`System:
You are an executive communications writer for Operiq AI.
Draft a polished business email.

Constraints:
- Tone: {formal|informal|persuasive}
- Audience: {client|manager|team}
- Recipient: {user-provided} (if any)
- Subject line hint: {user-provided} (if any)
- Include a clear subject line on the first line as "Subject: ..."
- If a recipient was provided, address them appropriately
- Concise, professional, no filler. Avoid emoji.
- Use markdown.

User Input:
Email purpose: {topic}
Additional context: {context}`}</CodeBlock>

              <SubHeading>4. Meeting Summarizer Prompt</SubHeading>
              <CodeBlock>{`System:
You analyze raw meeting notes/transcripts and produce a clear
executive briefing.

Meeting type: {1:1|team-sync|client-call|all-hands}

Return markdown with exactly these sections:
## Summary
A 3-5 sentence neutral synopsis.

## Key Decisions
Bulleted list of decisions made.

## Action Items
Bulleted list — each line: **Owner** — task — due date.

## Deadlines
Bulleted list of dates and what is due.

If a section has nothing, write "_None identified_".
Be thorough and accurate. Flag any ambiguous points.

User Input:
{raw meeting notes}`}</CodeBlock>

              <SubHeading>5. Task Planner Prompt</SubHeading>
              <CodeBlock>{`System:
You are an executive productivity coach. Build a prioritized
{daily|weekly} plan.

Return markdown with:
## Prioritized Plan
A numbered schedule with suggested time blocks.
Mark each item P1 / P2 / P3.

## Rationale
Briefly explain prioritization (Eisenhower / impact-effort lens).

## Productivity Suggestions
3 concrete improvements tailored to the workload.
Consider dependencies between tasks and energy levels.

User Input:
Tasks: {task list}
Goals/Context: {goals}`}</CodeBlock>

              <SubHeading>6. Research Analysis Prompt</SubHeading>
              <CodeBlock>{`System:
You are a senior research analyst. Distill the provided material.

Analysis depth: {quick|deep|executive}

Return markdown with:
## Executive Summary
3-5 sentences.

## Key Insights
Bulleted list of the most important findings.

## Recommendations
Numbered, actionable, written for decision-makers.

## Open Questions
Bulleted list of gaps or items needing verification.

Be objective. Flag potential biases in the source material.

User Input:
Material: {research material}
Focus question: {question}`}</CodeBlock>

              <SubHeading>Prompt Refinement Loop</SubHeading>
              <p>
                When a user requests refinements, the previous output and the user&apos;s requested changes
                are sent back to the AI as a continuation. The model receives the full context of the
                original generation plus the refinement instructions, enabling iterative improvement
                without losing context. This refinement loop is available across all five studio tools.
              </p>

              <SubHeading>Model Selection</SubHeading>
              <p>
                Operiq AI uses a tiered model strategy with branded names mapped to actual provider models:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full mt-4 text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Operiq Tier</th>
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Provider Model</th>
                      <th className="text-left py-2 font-semibold text-foreground">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Operiq Ultra</td>
                      <td className="py-2 pr-4">Mistral Large 3</td>
                      <td className="py-2">Most capable reasoning</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Operiq Pro</td>
                      <td className="py-2 pr-4">Llama 3.3 70B</td>
                      <td className="py-2">Balanced performance</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Operiq Plus</td>
                      <td className="py-2 pr-4">Nemotron Super 49B</td>
                      <td className="py-2">Fast & capable</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Operiq Nano</td>
                      <td className="py-2 pr-4">Nemotron Nano 9B</td>
                      <td className="py-2">Quick responses</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Operiq Mini</td>
                      <td className="py-2 pr-4">Nemotron Mini 4B</td>
                      <td className="py-2">Fastest response</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            {/* Section 6: Responsible AI */}
            <SectionBlock id="responsible-ai" title="Responsible AI" icon={<Shield className="size-5" />}>
              <p>
                Responsible AI practices represent <strong>10% of the evaluation criteria</strong> for the
                Operiq AI implements comprehensive safeguards across
                bias mitigation, data privacy, transparency, and ethical use.
              </p>

              <SubHeading>Bias Mitigation Strategies</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Eye className="size-4" />}>
                  <strong>Prompt-Level Bias Detection</strong> — System prompts explicitly instruct the AI to
                  &quot;flag potential biases in the source material&quot; and &quot;avoid politically loaded claims&quot;.
                  The research assistant prompt includes a dedicated section for bias flagging.
                </ListItem>
                <ListItem icon={<Eye className="size-4" />}>
                  <strong>Balanced Output Structure</strong> — Meeting summaries and research analyses use
                  neutral, fact-based markdown sections. Opinions are clearly labeled as such, and
                  ambiguous points are flagged rather than resolved arbitrarily.
                </ListItem>
                <ListItem icon={<Eye className="size-4" />}>
                  <strong>Multi-Model Validation</strong> — Different model tiers (Ultra through Mini) allow
                  users to cross-check outputs across model sizes, reducing single-model bias.
                </ListItem>
              </ul>

              <SubHeading>Data Privacy</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>No Training on User Data</strong> — AI providers are configured to not use
                  submitted data for model training. All API calls include privacy-preserving headers.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Row-Level Security</strong> — Every Convex query and mutation enforces user ID
                  checks. Users can only access their own data (email drafts, meeting summaries, etc.).
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Encryption</strong> — All data is encrypted in transit (TLS 1.3) and at rest
                  (AES-256 via Convex). API keys are stored in environment variables, never in source code.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Input Sanitization</strong> — All user inputs are validated with Zod schemas
                  before being passed to AI providers or stored in the database.
                </ListItem>
              </ul>

              <SubHeading>Disclaimers and Validation</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<AlertTriangle className="size-4" />}>
                  <strong>AI Disclaimer</strong> — Every AI-generated output page includes a visible
                  disclaimer: &quot;This content was generated by AI. Please review and verify before using
                  in professional contexts.&quot;
                </ListItem>
                <ListItem icon={<AlertTriangle className="size-4" />}>
                  <strong>Uncertainty Acknowledgment</strong> — The assistant prompt explicitly instructs
                  the model to say when uncertain and to remind users to review high-stakes output.
                </ListItem>
                <ListItem icon={<AlertTriangle className="size-4" />}>
                  <strong>Output Validation</strong> — Zod schemas enforce input validation at the API
                  boundary. Post-generation, output structure is validated against expected markdown sections.
                </ListItem>
              </ul>

              <SubHeading>Limitations Acknowledged</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<XCircle className="size-4" />}>
                  <strong>Knowledge Cutoff</strong> — AI models have training knowledge cutoffs. The web
                  search tool mitigates this but cannot guarantee real-time accuracy for all queries.
                </ListItem>
                <ListItem icon={<XCircle className="size-4" />}>
                  <strong>Hallucination Risk</strong> — Like all LLMs, models may generate plausible but
                  incorrect information. The system prompts explicitly guard against hallucinating facts.
                </ListItem>
                <ListItem icon={<XCircle className="size-4" />}>
                  <strong>Context Window Limits</strong> — Very long inputs may be truncated. Users are
                  advised to break large documents into smaller chunks.
                </ListItem>
                <ListItem icon={<XCircle className="size-4" />}>
                  <strong>Not a Substitute for Professional Advice</strong> — Legal, medical, financial,
                  and other specialized advice requires human expert review. Operiq AI is a productivity
                  tool, not a professional advisor.
                </ListItem>
              </ul>

              <SubHeading>Ethical Safeguards</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Shield className="size-4" />}>
                  <strong>Content Filtering</strong> — Input and output are filtered for harmful content.
                  The system refuses requests that violate safety guidelines.
                </ListItem>
                <ListItem icon={<Shield className="size-4" />}>
                  <strong>Rate Limiting</strong> — Usage quotas prevent abuse and ensure fair access across
                  all users (free tier: 20 AI requests/day, 5 images/day).
                </ListItem>
                <ListItem icon={<Shield className="size-4" />}>
                  <strong>Transparency</strong> — All AI-generated content is clearly labeled. Users
                  always know when they are interacting with AI versus human-generated content.
                </ListItem>
              </ul>
            </SectionBlock>

            {/* Section 7: Evaluation Criteria */}
            <SectionBlock id="evaluation-criteria" title="Evaluation Criteria" icon={<ClipboardCheck className="size-5" />}>
              <p>
                Operiq AI is evaluated across six criteria. The table below
                maps each criterion to how Operiq AI addresses it.
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#10a37f]">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Criterion</th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">Weight</th>
                      <th className="text-left py-3 font-semibold text-foreground">How Operiq AI Addresses It</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Target className="size-4 text-[#10a37f]" />
                          Problem Relevance
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">20%</td>
                      <td className="py-3">
                        Addresses real workplace productivity challenges: email drafting, meeting summarization,
                        task planning, and research analysis. Targets the 60% of time professionals spend on
                        administrative tasks.
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <GitBranch className="size-4 text-[#10a37f]" />
                          Prompt Engineering
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">25%</td>
                      <td className="py-3">
                        Structured prompts with four-part architecture (system instructions, context injection,
                        output formatting, guardrails). Demonstrated across 6 prompts (assistant, agent, email,
                        meeting, planner, research). Includes refinement loop and multi-model selection.
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-[#10a37f]" />
                          Functionality Accuracy
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">25%</td>
                      <td className="py-3">
                        AI-powered generation with structured output validation (Zod schemas), streaming
                        responses, real-time data persistence, and usage tracking. All features are fully
                        functional and deployed in production.
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-[#10a37f]" />
                          Innovation / Creativity
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">15%</td>
                      <td className="py-3">
                        Multi-agent system with ReAct pattern, autonomous web search, voice input/output (TTS/STT),
                        image generation (FLUX.1), video generation, file attachment, and shared collaborative chats.
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-[#10a37f]" />
                          Responsible AI
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">10%</td>
                      <td className="py-3">
                        Bias detection in prompts, data privacy (no training on user data, row-level security),
                        AI disclaimers on all outputs, output validation, rate limiting, and transparent
                        limitation acknowledgment.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-[#10a37f]" />
                          Presentation Clarity
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#10a37f]">5%</td>
                      <td className="py-3">
                        This comprehensive documentation page with 10 structured sections, clear visual hierarchy,
                        real architecture diagrams, actual prompt examples, and evaluation alignment.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            {/* Section 8: Tools & Technologies */}
            <SectionBlock id="tools-technologies" title="Tools & Technologies" icon={<Wrench className="size-5" />}>
              <p>
                Operiq AI integrates a diverse technology stack spanning AI services, development frameworks,
                and deployment infrastructure.
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Tool / Technology</th>
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                      <th className="text-left py-2 font-semibold text-foreground">Category</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">OpenAI-Compatible API</td>
                      <td className="py-2 pr-4">Text generation, chat, reasoning</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/10 text-[#10a37f] text-xs font-medium">AI</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">NVIDIA Models (via OpenRouter)</td>
                      <td className="py-2 pr-4">Mistral Large 3, Llama 3.3, Nemotron variants</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/10 text-[#10a37f] text-xs font-medium">AI</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Hugging Face</td>
                      <td className="py-2 pr-4">Image generation (FLUX.1-schnell) and video generation</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/10 text-[#10a37f] text-xs font-medium">AI</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">ElevenLabs</td>
                      <td className="py-2 pr-4">Text-to-speech (Aria, Roger, Sarah voices) and speech-to-text (Scribe v1)</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/10 text-[#10a37f] text-xs font-medium">AI</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">DuckDuckGo API</td>
                      <td className="py-2 pr-4">Web search for agent mode and research</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10a37f]/10 text-[#10a37f] text-xs font-medium">AI</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">React 19</td>
                      <td className="py-2 pr-4">UI framework with concurrent features</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium">Frontend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">TanStack Start</td>
                      <td className="py-2 pr-4">Full-stack React framework with SSR and file-system routing</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium">Frontend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Tailwind CSS v4</td>
                      <td className="py-2 pr-4">Utility-first CSS styling</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium">Frontend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">shadcn/ui</td>
                      <td className="py-2 pr-4">Accessible UI component primitives</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium">Frontend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">TypeScript</td>
                      <td className="py-2 pr-4">Type-safe development across frontend and backend</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium">Frontend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Convex Cloud</td>
                      <td className="py-2 pr-4">Real-time database, auth, serverless functions</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">Backend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Resend</td>
                      <td className="py-2 pr-4">Transactional email API</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">Backend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Stripe</td>
                      <td className="py-2 pr-4">Subscription billing and payment processing (ZAR)</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">Backend</span></td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">Netlify</td>
                      <td className="py-2 pr-4">CDN, edge functions, SSR hosting, deploy previews</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">Infra</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Vite + Bun</td>
                      <td className="py-2 pr-4">Build tooling and package management</td>
                      <td className="py-2"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">Infra</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            {/* Section 9: Sample Prompts & Outputs */}
            <SectionBlock id="sample-prompts" title="Sample Prompts & Outputs" icon={<FileText className="size-5" />}>
              <p>
                Below are three concrete examples of prompts and their corresponding outputs from Operiq AI,
                demonstrating the quality and structure of AI-generated content.
              </p>

              <SubHeading>Example 1: Email Generation</SubHeading>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Input</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Topic:</strong> Request project deadline extension</p>
                  <p><strong>Tone:</strong> Formal</p>
                  <p><strong>Audience:</strong> Manager</p>
                  <p><strong>Context:</strong> Need 2 extra days due to unexpected API integration complexity</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Output</p>
                <CodeBlock>{`Subject: Request for Project Deadline Extension

Dear [Manager's Name],

I am writing to request a two-day extension on the current project deadline,
which is currently scheduled for [original date].

During development, we encountered unexpected complexity in the API
integration phase that requires additional time to resolve properly.
Specifically, the third-party API documentation did not cover the
authentication edge cases we discovered during testing.

I have already outlined the remaining tasks and believe that with
two additional days, we can deliver a complete and thoroughly tested
solution by [new proposed date].

Please let me know if you would like to discuss this further or if
there is any additional information I can provide.

Best regards,
[Your Name]`}</CodeBlock>
              </div>

              <SubHeading>Example 2: Meeting Summary</SubHeading>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Input</p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Meeting Type:</strong> Team Sync</p>
                  <p className="mt-1"><strong>Notes:</strong> Sarah updated the team on Q3 metrics. Revenue up 12% but churn increased to 8%. Mike suggested improving onboarding flow. Decision to hire 2 new engineers by end of Q3. Action: Sarah to prepare hiring plan by Friday. John to review onboarding analytics by Monday. Next sync: next Tuesday 10am.</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Output</p>
                <CodeBlock>{`## Summary

The team reviewed Q3 performance metrics. Revenue grew 12% but customer
churn increased to 8%. The team decided to address onboarding as a
potential churn driver and approved hiring 2 new engineers before the
end of Q3.

## Key Decisions

- Address onboarding flow as a potential driver of the 8% churn rate
- Hire 2 new engineers by end of Q3

## Action Items

- **Sarah** — Prepare hiring plan — Due: Friday
- **John** — Review onboarding analytics — Due: Monday

## Deadlines

- Friday — Hiring plan due
- Monday — Onboarding analytics review due
- End of Q3 — 2 new engineers hired

## Next Meeting

Tuesday, 10:00 AM`}</CodeBlock>
              </div>

              <SubHeading>Example 3: Research Analysis</SubHeading>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Input</p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Depth:</strong> Executive</p>
                  <p><strong>Question:</strong> Should we adopt AI for customer support?</p>
                  <p className="mt-1"><strong>Material:</strong> [Research report on AI customer support tools, cost analysis, case studies from 3 competitors, and a survey of 200 customers on chatbot preferences.]</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 mt-3">
                <p className="text-xs font-semibold text-[#10a37f] uppercase tracking-wider mb-2">Output</p>
                <CodeBlock>{`## Executive Summary

AI-powered customer support is a viable investment for the organization.
Competitors using AI tools report 40% reduction in response times and
25% cost savings on support staffing. 68% of surveyed customers are
comfortable with AI-assisted support when human escalation is available.

## Key Insights

- Competitor A reduced average response time from 4 hours to 15 minutes
- Competitor B achieved 25% cost reduction in support operations
- 68% of customers accept AI support with human fallback
- 32% of customers still prefer direct human contact for complex issues

## Recommendations

1. Adopt a hybrid AI-human support model with AI handling L1 queries
2. Implement human escalation pathways for complex or sensitive issues
3. Pilot with a limited customer segment before full rollout
4. Invest in training the AI on company-specific product knowledge

## Open Questions

- What is the training data quality for our specific product domain?
- How will we measure customer satisfaction during the pilot?
- What is the total cost of ownership including integration and maintenance?`}</CodeBlock>
              </div>
            </SectionBlock>

            {/* Section 10: Challenges & Solutions */}
            <SectionBlock id="challenges" title="Challenges & Solutions" icon={<AlertTriangle className="size-5" />}>
              <p>
                Throughout development, several technical and architectural challenges were encountered.
                The solutions implemented demonstrate practical problem-solving skills central to the programme.
              </p>

              <div className="space-y-6 mt-6">
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Lock className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Authentication in SSR</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> <code>useConvexAuth()</code> returns <code>undefined</code>
                        during server-side rendering, causing a crash when destructured.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Created <code>useSsrConvexAuth()</code> hook that returns a safe
                        default ({`isLoading: true, isAuthenticated: false`}) when the context is unavailable.
                        Updated all 6 consumer files to use the SSR-safe wrapper.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Zap className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Streaming Response Format</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> Agent mode required custom multi-step tool calling with
                        streaming, but the initial custom text stream implementation was incompatible with
                        the <code>useChat</code> hook on the frontend.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Rewrote agent mode to use AI SDK&apos;s native
                        <code>streamText()</code> with <code>maxSteps</code> and <code>toolsToAISDK()</code>.
                        This uses the standard AI SDK v1 stream protocol compatible with <code>useChat</code>
                        and <code>DefaultChatTransport</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Server className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Netlify Deployment Architecture</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> TanStack Start v1 uses SSR with dynamic asset imports
                        that esbuild bundling could not resolve, causing 500 errors in production.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Switched Netlify bundler from esbuild to <code>nft</code>
                        (node file trace), which preserves dynamic imports. Created a manual SSR function
                        wrapper that imports the server bundle and exports the fetch handler.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Database className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Convex Auth + Environment Variables</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> Convex auth required <code>SESSION_SECRET</code> for
                        production, but the deployment would fail silently without it. Additionally, environment
                        variables had to be set in both dev and production contexts in Netlify.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Added <code>SESSION_SECRET</code> to the Convex deployment
                        configuration. Documented that all Netlify env vars must be duplicated across both
                        deploy contexts. Added explicit error handling for missing configuration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <CircleDollarSign className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Usage Tracking and Billing</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> Tracking AI requests and image generations across both
                        normal chat and agent mode, with usage resets on billing period rollover.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Implemented unified usage tracker middleware
                        (<code>src/lib/usage-tracker.ts</code>) that checks limits before processing and
                        records usage after stream initiation. Added auto-reset logic that checks
                        <code>currentPeriodEnd</code> and advances the period when expired.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 size-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Bot className="size-4 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Multi-Provider Model Management</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Challenge:</strong> The application needed to present branded model names
                        (Operiq Ultra, Pro, Plus, Nano, Mini) while mapping to different actual provider
                        model IDs across both frontend and backend.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Solution:</strong> Created a shared model registry at
                        <code>src/lib/models.ts</code> with <code>MODELS</code>, <code>CODE_MODELS</code>, and
                        <code>MODEL_MAP</code>. Both frontend (model selector UI) and backend (API endpoints)
                        import from this single source of truth. Scrubbed origin model names from all
                        user-facing descriptions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <SubHeading>Architecture Decisions</SubHeading>
              <ul className="space-y-3 mt-4">
                <ListItem icon={<ArrowRight className="size-4" />}>
                  <strong>Convex over Firebase</strong> — Chose Convex for its real-time reactive queries,
                  ACID transactions, and built-in auth. Eliminates the need for separate WebSocket management.
                </ListItem>
                <ListItem icon={<ArrowRight className="size-4" />}>
                  <strong>TanStack Start over Next.js</strong> — TanStack Start provides file-system routing
                  with Vite-based builds, better TypeScript integration, and no vendor lock-in to a specific
                  hosting provider.
                </ListItem>
                <ListItem icon={<ArrowRight className="size-4" />}>
                  <strong>Serverless over Container</strong> — Netlify serverless functions with nft bundling
                  provide zero-maintenance hosting with automatic scaling, eliminating DevOps overhead.
                </ListItem>
                <ListItem icon={<ArrowRight className="size-4" />}>
                  <strong>OpenAI-Compatible API over Single Provider</strong> — Using the OpenAI-compatible
                  API format (via OpenRouter) allows switching between Mistral, Meta, and NVIDIA models
                  without code changes.
                </ListItem>
                <ListItem icon={<ArrowRight className="size-4" />}>
                  <strong>Client-Side AI over Server-Only</strong> — All AI interactions go through server
                  API routes that validate usage limits and sanitize inputs, keeping API keys secure while
                  providing streaming responses to the client.
                </ListItem>
              </ul>
            </SectionBlock>
          </div>

          {/* Footer */}
          <footer className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo-icon.png" alt="Operiq AI" className="h-6 w-6" />
                <span className="text-sm font-semibold text-foreground">Operiq AI</span>
              </div>
              <p className="text-sm text-muted-foreground text-center px-4">
                AI-powered workplace productivity platform built with React, Convex, and cutting-edge AI models.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>operiq.ai</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/60 text-center mt-6">
              &copy; 2025 Operiq AI. All rights reserved. Proprietary and confidential.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------- helpers ---------------------------------- */

function SectionBlock({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
          {icon}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_code]:text-accent [&_code]:bg-accent/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-sm font-semibold text-foreground tracking-tight">{children}</h3>
  );
}

function ListItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 mt-0.5 text-accent">{icon}</span>
      <span className="text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_code]:text-accent [&_code]:bg-accent/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
        {children}
      </span>
    </li>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-card border border-border p-4 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors">
      <div className="shrink-0 size-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
