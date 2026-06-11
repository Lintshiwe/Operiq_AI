/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/invite/$token")({
  component: InviteJoinPage,
});

function InviteJoinPage() {
  const { token } = useParams({ from: "/invite/$token" });
  const router = Route.useRouter();
  const joinByToken = useMutation(api.sharedChats.joinByToken);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function join() {
      try {
        const result = await joinByToken({ token });
        router.navigate({
          to: "/assistant/$threadId",
          params: { threadId: String(result.threadId) },
        });
      } catch (e: any) {
        setError(e.message || "Failed to join conversation");
      } finally {
        setLoading(false);
      }
    }
    join();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <img
            src="/logo-icon.png"
            alt="Operiq AI"
            className="mx-auto h-12 w-auto"
          />
          <p className="text-sm text-muted-foreground">
            Joining shared conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">
            Unable to join
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }

  return null;
}
