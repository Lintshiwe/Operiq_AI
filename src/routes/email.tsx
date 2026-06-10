import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Copy, Check, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Studio \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Draft polished professional emails in formal, informal or persuasive tones.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive">("formal");
  const [audience, setAudience] = useState<"client" | "manager" | "team">("client");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onGenerate() {
    if (topic.trim().length < 3) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await run({ data: { topic, context, tone, audience } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="px-6 lg:px-10 py-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Email Studio
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
              Compose with intention.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drafts that respect the reader — written in your chosen tone, for the right audience.
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
                  <Mail className="size-4" />
                </span>
                <h2 className="text-base font-semibold text-foreground">New draft</h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-sm">What is the email about?</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Following up on Q2 budget proposal"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Audience</Label>
                  <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="context" className="text-sm">Optional context</Label>
                <Textarea
                  id="context"
                  rows={5}
                  placeholder="Key points, dates, names, or background..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <Button
                onClick={onGenerate}
                disabled={loading || topic.trim().length < 3}
                className="w-full"
              >
                {loading ? <><Loader2 className="size-4 animate-spin" /> Drafting...</> : "Generate draft"}
              </Button>

              <AIDisclaimer />
            </div>

            {/* Output panel */}
            <div className="lg:col-span-3 surface-card p-5 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Draft</h2>
                {output && (
                  <Button variant="outline" size="sm" onClick={copy}>
                    {copied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
                  </Button>
                )}
              </div>

              {!output && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <Mail className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Your draft will appear here</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">Describe the email's purpose and we'll compose a thoughtful first draft.</p>
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
        AI-generated draft. Review for accuracy, tone, and potential bias before sending or acting on it.
      </p>
    </div>
  );
}
