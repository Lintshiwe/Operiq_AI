import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Loader2 } from "lucide-react";
import { AppShell, PageHeader, AIDisclaimer } from "@/components/AppShell";
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
import { EmptyState, SkeletonLines } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner · FlowDesk AI" },
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
      <PageHeader
        eyebrow="Task Planner"
        title="A calmer way to plan the day."
        description="List your tasks. We'll prioritize them, propose time blocks, and suggest small improvements."
      />

      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 surface-card p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary">
              <ListChecks className="size-4" />
            </span>
            <h2 className="font-display text-lg font-semibold">Plan inputs</h2>
          </div>

          <div className="space-y-1.5">
            <Label>Horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily plan</SelectItem>
                <SelectItem value="weekly">Weekly plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tasks">Tasks (one per line)</Label>
            <Textarea
              id="tasks"
              rows={9}
              placeholder={"Finalize Q3 forecast\nReview design doc\nCall with vendor…"}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goals">Goals / context (optional)</Label>
            <Textarea
              id="goals"
              rows={3}
              placeholder="Deep-work mornings, presenting Thursday…"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>

          <Button onClick={onRun} disabled={loading || tasks.trim().length < 5} className="w-full">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Planning…</> : "Generate plan"}
          </Button>
          <AIDisclaimer />
        </div>

        <div className="lg:col-span-3 surface-card p-6 min-h-[480px] flex flex-col">
          <h2 className="font-display text-lg font-semibold mb-4">Plan</h2>
          {!output && !loading && (
            <EmptyState
              title="Your plan will appear here"
              hint="Add your tasks and we'll structure them into a prioritized schedule with rationale."
            />
          )}
          {loading && <SkeletonLines />}
          {output && <MarkdownView>{output}</MarkdownView>}
        </div>
      </div>
    </AppShell>
  );
}
