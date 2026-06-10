import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { AppShell, PageHeader, AIDisclaimer } from "@/components/AppShell";
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
      { title: "Email Studio · FlowDesk AI" },
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
      <PageHeader
        eyebrow="Email Studio"
        title="Compose with intention."
        description="Drafts that respect the reader — written in your chosen tone, for the right audience."
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 surface-card p-6 space-y-5 h-fit">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary">
              <Mail className="size-4" />
            </span>
            <h2 className="font-display text-lg font-semibold">New draft</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic">What is the email about?</Label>
            <Input
              id="topic"
              placeholder="e.g. Following up on Q2 budget proposal"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="context">Optional context</Label>
            <Textarea
              id="context"
              rows={5}
              placeholder="Key points, dates, names, or background…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <Button onClick={onGenerate} disabled={loading || topic.trim().length < 3} className="w-full">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Drafting…</> : "Generate draft"}
          </Button>

          <AIDisclaimer />
        </div>

        {/* Output */}
        <div className="lg:col-span-3 surface-card p-6 min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Draft</h2>
            {output && (
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
              </Button>
            )}
          </div>

          {!output && !loading && (
            <EmptyState
              title="Your draft will appear here"
              hint="Describe the email's purpose and we'll compose a thoughtful first draft."
            />
          )}
          {loading && <SkeletonLines />}
          {output && <MarkdownView>{output}</MarkdownView>}
        </div>
      </div>
    </AppShell>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-secondary">
        <span className="font-display text-lg">·</span>
      </div>
      <p className="mt-4 font-display text-lg text-foreground">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">{hint}</p>
    </div>
  );
}

export function SkeletonLines() {
  return (
    <div className="space-y-3 animate-pulse">
      {[90, 75, 95, 60, 80, 70].map((w, i) => (
        <div key={i} className="h-3 rounded bg-muted" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}
