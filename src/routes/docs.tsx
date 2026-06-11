/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Cpu, Database, ArrowRight, Bot, Shield, ChevronRight,
  GitBranch, Layers, Zap, Lock, Server, Workflow,
} from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Technical documentation \u2014 system architecture, data flow, AI pipeline, and security.",
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
  { id: "system-architecture", title: "System Architecture", icon: <Cpu className="size-4" /> },
  { id: "software-architecture", title: "Software Architecture", icon: <Layers className="size-4" /> },
  { id: "data-flow", title: "Data Flow", icon: <ArrowRight className="size-4" /> },
  { id: "ai-pipeline", title: "AI Pipeline", icon: <Bot className="size-4" /> },
  { id: "security", title: "Security", icon: <Shield className="size-4" /> },
];

function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("system-architecture");

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Watermark */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/logo-icon.png')",
          backgroundSize: "600px",
          opacity: 0.03,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="Operiq AI" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight">Operiq AI</span>
          </a>
          <span className="text-xs text-muted-foreground font-mono">v2.0.0</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Sidebar TOC */}
        <aside className="lg:w-60 lg:min-h-[calc(100dvh-57px)] lg:border-r lg:border-border/50 lg:sticky lg:top-0">
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
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20")
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
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12 lg:py-12">
          <div className="max-w-3xl space-y-16">
            {/* Page title */}
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium">Operiq AI</p>
              <h1 className="mt-3 font-display text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                Technical Documentation
              </h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">
                A comprehensive reference for the Operiq AI platform covering system architecture, software design,
                data flow patterns, the AI pipeline, and security posture.
              </p>
            </div>

            {/* Section: System Architecture */}
            <SectionBlock id="system-architecture" title="System Architecture" icon={<Cpu className="size-5" />}>
              <SubHeading>Overview</SubHeading>
              <p>
                Operiq AI is deployed on Netlify&apos;s global edge infrastructure, combining serverless
                functions with a real-time backend powered by Convex. The frontend is a single-page
                application built with TanStack Router and React, optimized for instant navigation and
                offline resilience.
              </p>

              <SubHeading>Infrastructure Components</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Server className="size-4" />}>
                  <strong>Netlify Edge</strong> \u2014 Global CDN with edge functions for request routing,
                  authentication middleware, and geolocation-aware responses.
                </ListItem>
                <ListItem icon={<Database className="size-4" />}>
                  <strong>Convex</strong> \u2014 Real-time reactive backend providing ACID-compliant
                  database operations, scheduled functions, file storage, and built-in authentication.
                </ListItem>
                <ListItem icon={<Bot className="size-4" />}>
                  <strong>AI Providers</strong> \u2014 OpenAI (GPT-4o) and Anthropic (Claude) for text
                  generation; ElevenLabs for speech-to-text and text-to-speech; Hugging Face for video
                  generation.
                </ListItem>
                <ListItem icon={<Workflow className="size-4" />}>
                  <strong>External Services</strong> \u2014 Resend for transactional email delivery;
                  Stripe for subscription billing and payment processing.
                </ListItem>
              </ul>

              <SubHeading>Deployment Topology</SubHeading>
              <p>
                The application is deployed as a single Netlify site with preview deployments on every
                pull request. The Convex backend runs in a separate deployment with preview deployments
                mirroring the Netlify preview workflow. Environment-specific configuration is managed
                through Netlify&apos;s deploy contexts and Convex&apos;s environment variables.
              </p>
              <CodeBlock>{"NETLIFY EDGE\n  +-- CDN Cache\n  +-- Edge Functions\n  +-- Static Assets\n  |\n  +-> CONVEX (Database + Auth)\n  +-> OPENAI / ANTHROPIC (AI)\n  +-> RESEND (Email)"}</CodeBlock>
            </SectionBlock>

            {/* Section: Software Architecture */}
            <SectionBlock id="software-architecture" title="Software Architecture" icon={<Layers className="size-5" />}>
              <SubHeading>Frontend Architecture</SubHeading>
              <p>
                The frontend follows a route-based component architecture using TanStack Router with
                file-system routing. Each route is a self-contained module with its own head metadata,
                loading states, and error boundaries.
              </p>

              <SubHeading>Component Hierarchy</SubHeading>
              <CodeBlock>{"RootLayout (__root.tsx)\n  +-- ConvexAuthProvider\n        +-- DevToolsGuard\n              +-- AuthGate\n                    +-- AppShell\n                    |     +-- Sidebar\n                    |     |     +-- NavItem\n                    |     |     +-- UserMenu\n                    |     +-- Main Content\n                    |           +-- Feature Pages\n                    |           |     +-- Email Studio\n                    |           |     +-- Meeting Intelligence\n                    |           |     +-- Task Planner\n                    |           |     +-- Research Hub\n                    |           +-- AI Assistant\n                    +-- Public Routes\n                          +-- /login\n                          +-- /signup\n                          +-- /invite/:token"}</CodeBlock>

              <SubHeading>Backend Architecture</SubHeading>
              <p>
                The backend is organized into Convex modules, each handling a specific domain. Actions
                provide the bridge between Convex&apos;s deterministic functions and external APIs (AI
                providers, email services). Internal mutations and queries handle state management with
                reactive updates to connected clients.
              </p>
              <CodeBlock>{"convex/\n  +-- schema.ts              # Database schema definitions\n  +-- users.ts               # User management (queries, mutations)\n  +-- emailDrafts.ts         # Email draft generation and storage\n  +-- summaries.ts           # Meeting summary generation\n  +-- plans.ts               # Task plan generation\n  +-- analyses.ts            # Research analysis generation\n  +-- subscriptions.ts       # Stripe subscription management\n  +-- http.ts                # HTTP endpoint handlers\n  +-- _generated/\n        +-- api.ts           # Auto-generated API types"}</CodeBlock>

              <SubHeading>State Management</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Server State</strong> \u2014 Managed by Convex&apos;s reactive queries
                  (<code>useQuery</code>). Data changes automatically propagate to all connected clients
                  without manual cache invalidation.
                </ListItem>
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Client State</strong> \u2014 Local component state via React&apos;s
                  <code>useState</code> for ephemeral UI state (form inputs, loading indicators).
                </ListItem>
                <ListItem icon={<Zap className="size-4" />}>
                  <strong>Auth State</strong> \u2014 Managed via <code>@convex-dev/auth</code> with
                  ConvexAuthProvider at the root level, providing session state to all child components.
                </ListItem>
              </ul>
            </SectionBlock>

            {/* Section: Data Flow */}
            <SectionBlock id="data-flow" title="Data Flow" icon={<ArrowRight className="size-5" />}>
              <SubHeading>Request Lifecycle</SubHeading>
              <p>
                Every user interaction that requires AI processing or data persistence follows a
                consistent lifecycle designed for reliability and responsiveness.
              </p>

              <ol className="space-y-4 mt-4">
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-sm">User Action</strong>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      The user fills in a form and clicks a generation button, or sends a message to
                      the assistant.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-sm">Client-Side Validation</strong>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Input is validated on the client (minimum lengths, required fields). Invalid
                      inputs are rejected before any network request is made.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-sm">Convex Mutation</strong>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      A typed mutation is called via <code>useMutation(api.module.action)</code>. The
                      mutation validates inputs using Convex&apos;s schema validators, then delegates
                      to an action for external API calls.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-sm">AI Processing</strong>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      The Convex action calls the appropriate AI provider (OpenAI or Anthropic) with
                      a structured prompt. The prompt includes system instructions, user context,
                      and guardrails.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-semibold mt-0.5">
                    5
                  </span>
                  <div>
                    <strong className="text-sm">Persistence and Response</strong>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      The generated content is persisted to the database. The result is returned to the
                      client where it is rendered with Markdown formatting.
                    </p>
                  </div>
                </li>
              </ol>

              <SubHeading>Data Persistence</SubHeading>
              <p>
                All generated content (email drafts, meeting summaries, task plans, research analyses)
                is persisted in Convex tables. Each record includes metadata: user ID, timestamps,
                input parameters, and the generated output. This enables full audit trails and gives
                users access to their generation history.
              </p>

              <SubHeading>Real-Time Updates</SubHeading>
              <p>
                Convex queries are reactive by default. When data changes in the database, all
                subscribed clients receive the update automatically. This is used for the AI assistant
                chat, where new messages appear instantly without polling.
              </p>
            </SectionBlock>

            {/* Section: AI Pipeline */}
            <SectionBlock id="ai-pipeline" title="AI Pipeline" icon={<Bot className="size-5" />}>
              <SubHeading>Provider Selection</SubHeading>
              <p>
                Operiq AI uses a multi-provider strategy to optimize for cost, quality, and latency.
                The platform selects the appropriate model based on the task complexity and domain.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full mt-4 text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Feature</th>
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Provider</th>
                      <th className="text-left py-2 font-semibold text-foreground">Model</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/30">
                      <td className="py-2 pr-4">Email Drafting</td>
                      <td className="py-2 pr-4">OpenAI</td>
                      <td className="py-2">GPT-4o</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 pr-4">Meeting Summaries</td>
                      <td className="py-2 pr-4">Anthropic</td>
                      <td className="py-2">Claude 3.5 Sonnet</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 pr-4">Task Planning</td>
                      <td className="py-2 pr-4">Anthropic</td>
                      <td className="py-2">Claude 3.5 Sonnet</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 pr-4">Research Analysis</td>
                      <td className="py-2 pr-4">Anthropic</td>
                      <td className="py-2">Claude 3 Opus</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 pr-4">AI Assistant (chat)</td>
                      <td className="py-2 pr-4">OpenAI</td>
                      <td className="py-2">GPT-4o</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Speech-to-Text</td>
                      <td className="py-2 pr-4">ElevenLabs</td>
                      <td className="py-2">Scribe v1</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SubHeading>Prompt Engineering</SubHeading>
              <p>
                Each AI feature uses carefully crafted system prompts that define the model&apos;s role,
                output format, constraints, and quality standards. Prompts are version-controlled and
                testable.
              </p>
              <ul className="space-y-3 mt-3">
                <ListItem icon={<GitBranch className="size-4" />}>
                  <strong>System Prompts</strong> \u2014 Define the AI&apos;s persona, output structure,
                  and boundaries. For example, the email system prompt specifies professional tone,
                  proper formatting, and prohibits hallucinated information.
                </ListItem>
                <ListItem icon={<GitBranch className="size-4" />}>
                  <strong>Context Injection</strong> \u2014 User-provided context (recipient details,
                  meeting notes, research material) is injected into the prompt with clear delineation
                  from system instructions.
                </ListItem>
                <ListItem icon={<GitBranch className="size-4" />}>
                  <strong>Output Guardrails</strong> \u2014 Post-processing validates that the AI
                  output conforms to expected schemas and does not contain prohibited content.
                </ListItem>
              </ul>

              <SubHeading>Refinement Loop</SubHeading>
              <p>
                When a user requests refinements, the previous output and the user&apos;s requested changes
                are sent back to the AI as a continuation. The model receives the full context of the
                original generation plus the refinement instructions, enabling iterative improvement
                without losing context.
              </p>
            </SectionBlock>

            {/* Section: Security */}
            <SectionBlock id="security" title="Security" icon={<Shield className="size-5" />}>
              <SubHeading>Authentication</SubHeading>
              <p>
                Operiq AI uses <code>@convex-dev/auth</code> for authentication, supporting email/password
                and OAuth providers. Sessions are managed server-side with HTTP-only cookies,
                eliminating XSS-based token theft vectors.
              </p>

              <SubHeading>Authorization</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Route-Level</strong> \u2014 The <code>AuthGate</code> component wraps
                  authenticated routes. Public routes (<code>/login</code>, <code>/signup</code>,
                  <code>/invite/:token</code>) bypass authentication.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Data-Level</strong> \u2014 Convex mutations and queries verify that the
                  authenticated user has permission to access or modify the requested data. Row-level
                  security is enforced through user ID checks in every query.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>API-Level</strong> \u2014 HTTP endpoints validate authentication tokens
                  before processing requests. Rate limiting is applied at both the Convex and Netlify
                  layers.
                </ListItem>
              </ul>

              <SubHeading>Data Protection</SubHeading>
              <ul className="space-y-3">
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Encryption in Transit</strong> \u2014 All communication uses TLS 1.3.
                  Convex connections use WebSockets over WSS.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Encryption at Rest</strong> \u2014 Convex encrypts all data at rest using
                  AES-256. API keys and secrets are stored in environment variables, never in source code.
                </ListItem>
                <ListItem icon={<Lock className="size-4" />}>
                  <strong>Input Sanitization</strong> \u2014 All user inputs are validated and sanitized
                  before being passed to AI providers or stored in the database.
                </ListItem>
              </ul>

              <SubHeading>DevTools Protection</SubHeading>
              <p>
                In production, the <code>DevToolsGuard</code> component monitors for developer tools
                being opened and terminates the session if detected. This provides a defense-in-depth
                layer against casual inspection of application internals.
              </p>

              <SubHeading>Compliance</SubHeading>
              <p>
                Operiq AI is designed with privacy-first principles. User data is never shared with
                third parties. AI providers are configured to not use submitted data for model training.
                All data processing complies with applicable data protection regulations.
              </p>
            </SectionBlock>
          </div>
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
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="prose-flow prose-sm max-w-none space-y-4 text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_code]:text-accent [&_code]:bg-accent/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
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
      <span className="text-sm text-muted-foreground leading-relaxed [&_strong]:text-foreground [&_code]:text-accent [&_code]:bg-accent/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono">
        {children}
      </span>
    </li>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-[#1a1a1a] border border-border/30 p-4 text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}
