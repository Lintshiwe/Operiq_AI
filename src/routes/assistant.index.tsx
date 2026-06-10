import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "@convex-dev/auth/react";
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
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const threads = useQuery(api.threads.list);
  const create = useMutation(api.threads.create);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }
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
