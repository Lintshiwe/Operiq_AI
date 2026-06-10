import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeResearch } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Hub \u00b7 Operiq AI" },
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="px-6 lg:px-10 py-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Research Hub
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
              Read less. Understand more.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop in long material — reports, articles, transcripts — and get an executive distillation.
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
                  <BookOpen className="size-4" />
                </span>
                <h2 className="text-base font-semibold text-foreground">Source material</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="material" className="text-sm">Paste content</Label>
                <Textarea
                  id="material"
                  rows={14}
                  placeholder="Paste the report, article, or transcript..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="q" className="text-sm">Focus question (optional)</Label>
                <Input
                  id="q"
                  placeholder="e.g. What are the implications for pricing?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <Button onClick={onRun} disabled={loading || material.trim().length < 20} className="w-full">
                {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing...</> : "Generate analysis"}
              </Button>
              <AIDisclaimer />
            </div>

            {/* Output panel */}
            <div className="lg:col-span-3 surface-card p-5 min-h-[400px] flex flex-col">
              <h2 className="text-base font-semibold text-foreground mb-4">Analysis</h2>
              {!output && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <BookOpen className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Your analysis will appear here</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">Paste material and we'll produce a summary, insights, recommendations, and open questions.</p>
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
        AI-generated analysis. Verify key facts and consider potential biases in the source material.
      </p>
    </div>
  );
}
