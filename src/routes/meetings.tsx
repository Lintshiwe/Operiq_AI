import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck2, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Intelligence \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Summarize meetings — extract decisions, action items and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (notes.trim().length < 20) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await run({ data: { notes } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Could not summarize. Try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="px-6 lg:px-10 py-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Meeting Intelligence
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
              From raw notes to clear decisions.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a transcript or rough notes. We surface the summary, decisions, owners, and deadlines.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
            {/* Form panel */}
            <div className="lg:col-span-2 surface-card p-5 space-y-4 h-fit">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <CalendarCheck2 className="size-4" />
                </span>
                <h2 className="text-base font-semibold text-foreground">Notes / transcript</h2>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm">Paste meeting content</Label>
                <Textarea
                  id="notes"
                  rows={16}
                  placeholder="Topics discussed, who said what, decisions, dates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-card border-border"
                />
              </div>
              <Button onClick={onRun} disabled={loading || notes.trim().length < 20} className="w-full">
                {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing...</> : "Generate briefing"}
              </Button>
              <AIDisclaimer />
            </div>

            {/* Output panel */}
            <div className="lg:col-span-3 surface-card p-5 min-h-[400px] flex flex-col">
              <h2 className="text-base font-semibold text-foreground mb-4">Briefing</h2>
              {!output && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <CalendarCheck2 className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Your meeting briefing will appear here</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">Drop in notes from your last call — we'll structure them into a clear executive briefing.</p>
                </div>
              )}
              {loading && (
                <div className="space-y-3 animate-pulse">
                  {[90, 75, 95, 60, 80, 70].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
              {output && (
                <div className="prose-flow flex-1">
                  <MarkdownView>{output}</MarkdownView>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="size-3.5 mt-0.5 shrink-0" />
      <p>
        AI-generated summary. Review for accuracy and potential bias before acting on it.
      </p>
    </div>
  );
}
