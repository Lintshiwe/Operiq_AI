import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Mail,
  CalendarCheck2,
  ListChecks,
  BookOpen,
  MessageSquareText,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  History,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Generation History \u00b7 Operiq AI" },
      {
        name: "description",
        content: "View your past AI-generated emails, meeting notes, plans, and research.",
      },
    ],
  }),
  component: HistoryPage,
});

type HistoryItem = {
  id: string;
  type: "email" | "meeting" | "plan" | "research" | "chat";
  title: string;
  snippet: string;
  fullContent: string;
  createdAt: string;
  linkTo?: string;
};

const TYPE_META = {
  email: { icon: Mail, label: "Email", color: "text-blue-400 bg-blue-500/10" },
  meeting: { icon: CalendarCheck2, label: "Meeting", color: "text-amber-400 bg-amber-500/10" },
  plan: { icon: ListChecks, label: "Plan", color: "text-emerald-400 bg-emerald-500/10" },
  research: { icon: BookOpen, label: "Research", color: "text-purple-400 bg-purple-500/10" },
  chat: { icon: MessageSquareText, label: "Chat", color: "text-cyan-400 bg-cyan-500/10" },
} as const;

function HistoryPage() {
  const user = useQuery(api.users.me);
  const userId = user?._id;

  const emailDrafts = useQuery(api.emailDrafts.list, userId ? { userId } : "skip");
  const summaries = useQuery(api.summaries.list, userId ? { userId } : "skip");
  const plans = useQuery(api.plans.list, userId ? { userId } : "skip");
  const analyses = useQuery(api.analyses.list, userId ? { userId } : "skip");
  const threads = useQuery(api.threads.list);

  const loading =
    user === undefined ||
    (userId !== undefined &&
      (emailDrafts === undefined || summaries === undefined || plans === undefined || analyses === undefined || threads === undefined));

  const items = useMemo<HistoryItem[]>(() => {
    if (!emailDrafts || !summaries || !plans || !analyses || !threads) return [];

    const result: HistoryItem[] = [];

    for (const d of emailDrafts) {
      result.push({
        id: d._id,
        type: "email",
        title: d.subject || "Untitled Email",
        snippet: d.draft?.slice(0, 200) || "",
        fullContent: d.draft || "",
        createdAt: d.createdAt,
        linkTo: "/email",
      });
    }

    for (const s of summaries) {
      result.push({
        id: s._id,
        type: "meeting",
        title: s.meetingType ? `Meeting — ${s.meetingType}` : "Meeting Notes",
        snippet: s.output?.slice(0, 200) || "",
        fullContent: s.output || "",
        createdAt: s.createdAt,
        linkTo: "/meetings",
      });
    }

    for (const p of plans) {
      result.push({
        id: p._id,
        type: "plan",
        title: p.horizon ? `${p.horizon} Plan` : "Task Plan",
        snippet: p.output?.slice(0, 200) || "",
        fullContent: p.output || "",
        createdAt: p.createdAt,
        linkTo: "/planner",
      });
    }

    for (const a of analyses) {
      result.push({
        id: a._id,
        type: "research",
        title: a.question || "Research Analysis",
        snippet: a.output?.slice(0, 200) || "",
        fullContent: a.output || "",
        createdAt: a.createdAt,
        linkTo: "/research",
      });
    }

    for (const t of threads) {
      const firstMsg = t.messages?.[0];
      result.push({
        id: t._id,
        type: "chat",
        title: t.title || "Conversation",
        snippet: firstMsg?.content?.slice(0, 200) || "",
        fullContent: t.messages?.map((m) => `${m.role}: ${m.content}`).join("\n\n") || "",
        createdAt: t.createdAt,
        linkTo: `/assistant/${t._id}`,
      });
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [emailDrafts, summaries, plans, analyses]);

  if (!user) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Sign in to view your generation history.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-full flex flex-col py-8 px-4">
        <div className="w-full max-w-[720px] mx-auto space-y-6">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <History className="size-4 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Generation History</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your past AI-generated emails, meetings, plans, and research
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-8 rounded-lg" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="size-4 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground/60">No generations yet.</p>
                <p className="text-xs text-muted-foreground/40 mt-1">
                  Generate an email, meeting summary, plan, or research analysis to see it here.
                </p>
              </div>
            ) : (
              items.map((item) => <HistoryCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-accent/30">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Type badge */}
        <div className={`shrink-0 size-8 rounded-lg flex items-center justify-center ${meta.color}`}>
          <Icon className="size-4" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color.split(" ")[0]}`}>
              {meta.label}
            </span>
            <span className="text-xs text-muted-foreground/50">&middot;</span>
            <span className="text-xs text-muted-foreground/60">{dateStr} {timeStr}</span>
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5 truncate">{item.title}</p>
          {!expanded && (
            <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">{item.snippet}</p>
          )}
        </div>

        {/* Expand/Collapse */}
        <div className="shrink-0 mt-1 text-muted-foreground/40">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <div className="border-t border-border/50" />
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {item.fullContent}
          </div>
          {item.linkTo && (
            <div className="flex justify-end">
              {item.type === "chat" ? (
                <Link to="/assistant/$threadId" params={{ threadId: item.id }}>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7">
                    <ExternalLink className="size-3" />
                    Open Chat
                  </Button>
                </Link>
              ) : (
                <Link to={item.linkTo as "/email"}>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7">
                    <ExternalLink className="size-3" />
                    Open {TYPE_META[item.type as keyof typeof TYPE_META].label}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
