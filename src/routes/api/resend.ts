/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { Resend } from "resend";

export const Route = createFileRoute("/api/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          to: string;
          subject: string;
          text: string;
          from: string;
        };
        const { to, subject, text, from } = body;
        if (!to || !subject || !text || !from) {
          return new Response("Missing required fields", { status: 400 });
        }

        // Validate API key presence
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("Resend: RESEND_API_KEY environment variable is not configured");
          return new Response(
            "Email service is not configured. Please set RESEND_API_KEY.",
            { status: 500 },
          );
        }

        const resend = new Resend(apiKey);
        try {
          const result = await resend.emails.send({ from, to, subject, text });
          return Response.json(result);
        } catch (err) {
          const error = err as { statusCode?: number; message?: string };
          console.error("Resend error:", error);

          // Handle validation_errors from Resend (e.g., unverified domain)
          if (error.statusCode === 403) {
            return new Response(
              `Email send failed: ${error.message || "The sender domain may not be verified in Resend. Please verify your domain at https://resend.com/domains."}`,
              { status: 403 },
            );
          }

          return new Response(
            `Failed to send email: ${error.message || "Unknown error"}`,
            { status: 500 },
          );
        }
      },
    },
  },
});