/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSsrConvexAuth } from "@/lib/use-ssr-convex-auth";
import { createBlankThread, saveThreads, loadThreads } from "@/lib/threads";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

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
  const { isAuthenticated, isLoading: authLoading } = useSsrConvexAuth();
  const threads = useQuery(api.threads.list);
  const create = useMutation(api.threads.create);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      if (threads === undefined) return;

      if (threads.length === 0) {
        create({ title: "New conversation", messages: [] }).then((id) => {
          navigate({ to: "/assistant/$threadId", params: { threadId: id }, replace: true });
        });
      } else {
        navigate({
          to: "/assistant/$threadId",
          params: { threadId: threads[0]._id },
          replace: true,
        });
      }
    } else {
      /* Guest: create a local thread and navigate to it */
      const existing = loadThreads();
      let threadId: string;
      if (existing.length > 0) {
        threadId = existing[0].id;
      } else {
        const blank = createBlankThread();
        saveThreads([blank]);
        threadId = blank.id;
      }
      navigate({ to: "/assistant/$threadId", params: { threadId }, replace: true });
    }
  }, [threads, authLoading, isAuthenticated, create, navigate]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />
        Opening assistant…
      </div>
    </AppShell>
  );
}