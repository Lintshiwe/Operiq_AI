import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  ArrowUpRight,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import heroImg from "@/assets/hero-workspace.jpg";
import meetingImg from "@/assets/collab-meeting.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowDesk AI — Executive Productivity, Reimagined" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings, plan your week, and research smarter with FlowDesk AI — a premium AI productivity workspace for professionals.",
      },
      { property: "og:title", content: "FlowDesk AI — Executive Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Premium AI workspace for professionals: email, meetings, planning, research, assistant.",
      },
    ],
  }),
  component: Index,
});

const MODULES = [
  {
    to: "/email",
    title: "Email Studio",
    eyebrow: "Communications",
    description:
      "Draft polished emails in formal, informal, or persuasive tones — tailored to clients, managers, or teams.",
    icon: Mail,
  },
  {
    to: "/meetings",
    title: "Meeting Intelligence",
    eyebrow: "Decisions & Actions",
    description:
      "Turn raw meeting notes into executive summaries with decisions, action items, owners, and deadlines.",
    icon: CalendarCheck2,
  },
  {
    to: "/planner",
    title: "Task Planner",
    eyebrow: "Daily & Weekly",
    description:
      "Generate prioritized plans with rationale and tailored productivity improvements for the week ahead.",
    icon: ListChecks,
  },
  {
    to: "/research",
    title: "Research Hub",
    eyebrow: "Analysis",
    description:
      "Distill long materials into executive summaries, key insights, and concrete recommendations.",
    icon: BookOpen,
  },
  {
    to: "/assistant",
    title: "AI Assistant",
    eyebrow: "Conversational",
    description:
      "A workplace-focused conversational assistant for quick answers, drafts, and thinking partners.",
    icon: MessageSquareText,
  },
];

function Index() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-secondary">
              <Sparkle className="size-3 text-accent" /> Workplace Intelligence Suite
            </p>
            <h1 className="mt-5 font-display text-5xl lg:text-7xl font-semibold leading-[1.02] text-foreground">
              The quiet operating system <span className="text-secondary">for your workday.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              FlowDesk AI turns the work around your work — emails, meeting notes, planning, and
              research — into a single, considered surface. Built for professionals who value
              precision over noise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
              >
                Open the assistant <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/email"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Try Email Studio
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: "5", v: "Workspaces" },
                { k: "1", v: "Quiet UI" },
                { k: "∞", v: "Drafts" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl font-semibold text-primary">{s.k}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-accent/10 blur-2xl" aria-hidden />
              <img
                src={heroImg}
                alt="Executive workspace at dawn with leather notebook and brass desk lamp"
                width={1600}
                height={1100}
                className="relative w-full aspect-[16/11] rounded-2xl object-cover shadow-card border border-border"
              />
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card px-4 py-3 shadow-card hidden sm:flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <div className="text-xs">
                  <p className="font-medium text-foreground">Responsible AI by default</p>
                  <p className="text-muted-foreground">Review prompts before sending.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">
              Five focused workspaces
            </p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl font-semibold text-foreground">
              Designed around how executives actually work.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Each module is a quiet, single-purpose tool — no clutter, no template dashboards, no noise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to as "/"}
                className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
                    {m.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open workspace
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Image band */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <img
            src={meetingImg}
            alt="Diverse professionals collaborating around a polished boardroom table"
            width={1400}
            height={900}
            loading="lazy"
            className="w-full aspect-[7/5] rounded-2xl object-cover border border-border shadow-card"
          />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accent">
              Responsible AI
            </p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl font-semibold text-foreground">
              Quietly powerful. Honestly limited.
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              FlowDesk AI is a thinking partner, not a replacement for judgment. Outputs may contain
              factual errors or subtle bias. Every module surfaces a clear review prompt so the final
              word stays with you.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              {[
                "Drafts are recommendations — review before sending.",
                "Sensitive decisions deserve human verification.",
                "We flag uncertainty rather than hide it.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 size-1.5 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-8 flex flex-wrap gap-3 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FlowDesk AI — Executive Productivity</p>
          <p>AI-generated content should be reviewed before use.</p>
        </div>
      </footer>
    </AppShell>
  );
}
