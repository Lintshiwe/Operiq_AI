import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2 } from "lucide-react";
import { AppShell, PageHeader, AIDisclaimer } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeResearch } from "@/lib/ai.functions";
import { EmptyState, SkeletonLines } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Hub · FlowDesk AI" },
      { name: "description", content: "Summarize research, surface insights, and generate recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(analyzeResearch);
  const [material, setMaterial] = useState("");
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (material.trim().length < 20) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await run({ data: { material, question } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Analysis failed. Try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Research Hub"
        title="Read less. Understand more."
        description="Drop in long material — reports, articles, transcripts — and get an executive distillation."
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 surface-card p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary">
              <BookOpen className="size-4" />
            </span>
            <h2 className="font-display text-lg font-semibold">Source material</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="material">Paste content</Label>
            <Textarea
              id="material"
              rows={14}
              placeholder="Paste the report, article, or transcript…"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q">Focus question (optional)</Label>
            <Input
              id="q"
              placeholder="e.g. What are the implications for pricing?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <Button onClick={onRun} disabled={loading || material.trim().length < 20} className="w-full">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing…</> : "Generate analysis"}
          </Button>
          <AIDisclaimer />
        </div>

        <div className="lg:col-span-3 surface-card p-6 min-h-[480px] flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-4">Analysis</h2>
          {!output && !loading && (
            <EmptyState
              title="Your analysis will appear here"
              hint="Paste material and we'll produce a summary, insights, recommendations, and open questions."
            />
          )}
          {loading && <SkeletonLines />}
          {output && <MarkdownView>{output}</MarkdownView>}
        </div>
      </div>
    </AppShell>
  );
}
