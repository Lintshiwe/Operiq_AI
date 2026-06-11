/**
 * Copyright (c) 2025 Operiq AI. Proprietary.
 * Returns the HuggingFace token so the browser can call HF directly.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/huggingface-token")({
  server: {
    handlers: {
      GET: async () => {
        const token = process.env.HUGGINGFACE_TOKEN;
        return Response.json({ token: token || null });
      },
    },
  },
});
