import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck2, Loader2 } from "lucide-react";
import { AppShell, PageHeader, AIDisclaimer } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting } from "@/lib/ai.functions";
import { EmptyState, SkeletonLines } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Intelligence · FlowDesk AI" },
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
      <PageHeader
        eyebrow="Meeting Intelligence"
        title="From raw notes to clear decisions."
        description="Paste a transcript or rough notes. We surface the summary, decisions, owners, and deadlines."
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 surface-card p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary">
              <CalendarCheck2 className="size-4" />
            </span>
            <h2 className="font-display text-lg font-semibold">Notes / transcript</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Paste meeting content</Label>
            <Textarea
              id="notes"
              rows={16}
              placeholder="Topics discussed, who said what, decisions, dates…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button onClick={onRun} disabled={loading || notes.trim().length < 20} className="w-full">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing…</> : "Generate briefing"}
          </Button>
          <AIDisclaimer />
        </div>

        <div className="lg:col-span-3 surface-card p-6 min-h-[480px] flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-4">Briefing</h2>
          {!output && !loading && (
            <EmptyState
              title="Your meeting briefing will appear here"
              hint="Drop in notes from your last call — we'll structure them into a clear executive briefing."
            />
          )}
          {loading && <SkeletonLines />}
          {output && <MarkdownView>{output}</MarkdownView>}
        </div>
      </div>
    </AppShell>
  );
}
