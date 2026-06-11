/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutTemplate,
  ArrowRight,
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates · Operiq AI" },
      { name: "description", content: "Pre-built templates for every studio tool" },
    ],
  }),
  component: TemplatesPage,
});

const CATEGORIES = ["All", "Email", "Meeting Notes", "Task Plans", "Research"];

const CATEGORY_ICONS: Record<string, typeof Mail> = {
  Email: Mail,
  "Meeting Notes": CalendarCheck2,
  "Task Plans": ListChecks,
  Research: BookOpen,
};

const TEMPLATES = [
  {
    id: "email-follow-up",
    title: "Client Follow-up",
    description: "Polite follow-up to a client who hasn't replied in a week.",
    category: "Email",
    route: "/email",
    prefill: "Draft a polite follow-up email to a client who hasn't responded to my proposal in one week. Keep it professional but warm.",
  },
  {
    id: "email-cold-outreach",
    title: "Cold Outreach",
    description: "Introduction email to a potential business partner.",
    category: "Email",
    route: "/email",
    prefill: "Write a concise cold outreach email introducing myself and my services to a potential client. Include a clear call to action.",
  },
  {
    id: "email-thank-you",
    title: "Thank You Note",
    description: "Gracious thank-you email after a meeting or interview.",
    category: "Email",
    route: "/email",
    prefill: "Draft a thank-you email after a productive meeting. Mention key takeaways and next steps.",
  },
  {
    id: "meeting-standup",
    title: "Daily Standup Notes",
    description: "Summarize what you did yesterday, today, and blockers.",
    category: "Meeting Notes",
    route: "/meetings",
    prefill: "Summarize my daily standup notes: what I completed yesterday, what I'm working on today, and any blockers.",
  },
  {
    id: "meeting-qbr",
    title: "QBR Summary",
    description: "Quarterly business review notes with decisions and action items.",
    category: "Meeting Notes",
    route: "/meetings",
    prefill: "Summarize quarterly business review meeting notes into decisions, action items, and owners.",
  },
  {
    id: "meeting-1on1",
    title: "1:1 Meeting Notes",
    description: "Structured notes for a one-on-one with your manager.",
    category: "Meeting Notes",
    route: "/meetings",
    prefill: "Structure notes for a 1:1 meeting with my manager covering wins, challenges, and career goals.",
  },
  {
    id: "plan-sprint",
    title: "Sprint Plan",
    description: "Plan a focused sprint with stories and estimates.",
    category: "Task Plans",
    route: "/planner",
    prefill: "Plan a 2-week sprint with user stories, acceptance criteria, and estimated story points.",
  },
  {
    id: "plan-workday",
    title: "Focused Workday",
    description: "Plan a productive day with deep-work blocks.",
    category: "Task Plans",
    route: "/planner",
    prefill: "Plan a focused workday with three deep-work blocks, breaks, and priority tasks.",
  },
  {
    id: "plan-project",
    title: "Project Kickoff",
    description: "Outline milestones, deliverables, and deadlines.",
    category: "Task Plans",
    route: "/planner",
    prefill: "Outline a project kickoff plan with milestones, deliverables, deadlines, and risk mitigations.",
  },
  {
    id: "research-market",
    title: "Market Research",
    description: "Research a competitor or market segment.",
    category: "Research",
    route: "/research",
    prefill: "Research the competitive landscape for AI-powered productivity tools. Identify key players, pricing, and differentiators.",
  },
  {
    id: "research-topic",
    title: "Topic Deep Dive",
    description: "Deep research on a technical or business topic.",
    category: "Research",
    route: "/research",
    prefill: "Conduct a deep research dive on the topic of remote team productivity. Find best practices, tools, and metrics.",
  },
  {
    id: "research-summary",
    title: "Article Summary",
    description: "Summarize a long article or paper into key insights.",
    category: "Research",
    route: "/research",
    prefill: "Summarize a long article into key insights, actionable takeaways, and supporting evidence.",
  },
];

function TemplatesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  function handleUse(template: (typeof TEMPLATES)[0]) {
    if (template.route === "/email" || template.route === "/meetings" || template.route === "/planner" || template.route === "/research") {
      navigate({ to: template.route as "/email" | "/meetings" | "/planner" | "/research", search: { prefill: template.prefill } });
    } else {
      navigate({ to: "/assistant" });
      toast.info("Navigate to the tool and paste the template text.");
    }
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Templates</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pre-built templates for every studio tool.</p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  selectedCategory === c
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const Icon = CATEGORY_ICONS[t.category] || FileText;
              return (
                <div
                  key={t.id}
                  className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                      <Icon className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {t.category}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleUse(t)}
                  >
                    <ArrowRight className="size-3.5 mr-1.5" />
                    Use template
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
