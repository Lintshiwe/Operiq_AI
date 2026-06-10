import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Loader2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planTasks } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner \u00b7 Operiq AI" },
      { name: "description", content: "Generate prioritized daily and weekly plans." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState("");
  const [goals, setGoals] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (tasks.trim().length < 5) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await run({ data: { horizon, tasks, goals } });
      setOutput(res.text);
    } catch (e) {
      toast.error("Could not generate the plan.");
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
              Task Planner
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
              A calmer way to plan the day.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              List your tasks. We'll prioritize them, propose time blocks, and suggest small improvements.
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
                  <ListChecks className="size-4" />
                </span>
                <h2 className="text-base font-semibold text-foreground">Plan inputs</h2>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Horizon</Label>
                <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily plan</SelectItem>
                    <SelectItem value="weekly">Weekly plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tasks" className="text-sm">Tasks (one per line)</Label>
                <Textarea
                  id="tasks"
                  rows={9}
                  placeholder={"Finalize Q3 forecast\nReview design doc\nCall with vendor..."}
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goals" className="text-sm">Goals / context (optional)</Label>
                <Textarea
                  id="goals"
                  rows={3}
                  placeholder="Deep-work mornings, presenting Thursday..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <Button onClick={onRun} disabled={loading || tasks.trim().length < 5} className="w-full">
                {loading ? <><Loader2 className="size-4 animate-spin" /> Planning...</> : "Generate plan"}
              </Button>
              <AIDisclaimer />
            </div>

            {/* Output panel */}
            <div className="lg:col-span-3 surface-card p-5 min-h-[400px] flex flex-col">
              <h2 className="text-base font-semibold text-foreground mb-4">Plan</h2>
              {!output && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="size-12 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <ListChecks className="size-5" />
                  </div>
                  <p className="mt-4 font-semibold text-foreground">Your plan will appear here</p>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">Add your tasks and we'll structure them into a prioritized schedule with rationale.</p>
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
        AI-generated plan. Review for feasibility and adjust based on your actual workload.
      </p>
    </div>
  );
}
