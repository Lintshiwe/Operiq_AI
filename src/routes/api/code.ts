/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

        const res = await fetch(`${convexUrl}/code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: body.messages?.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
            model:
              request.headers.get("x-operiq-model") || "gpt-4o-mini",
          }),
        });

        const data = await res.json();
        return Response.json(data);
      },
    },
  },
});
