import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { createBlankThread, loadThreads, saveThreads } from "@/lib/threads";

export const Route = createFileRoute("/assistant/")({
  head: () => ({
    meta: [
      { title: "AI Assistant · Operiq AI" },
      { name: "description", content: "Workplace-focused conversational AI assistant." },
    ],
  }),
  component: AssistantIndex,
});

function AssistantIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const threads = loadThreads();
    let target = threads[0]?.id;
    if (!target) {
      const t = createBlankThread();
      saveThreads([t]);
      target = t.id;
    }
    navigate({ to: "/assistant/$threadId", params: { threadId: target }, replace: true });
  }, [navigate]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Opening assistant…
      </div>
    </AppShell>
  );
}
