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
        const resend = new Resend(process.env.RESEND_API_KEY);
        try {
          const result = await resend.emails.send({ from, to, subject, text });
          return Response.json(result);
        } catch (err) {
          console.error("Resend error:", err);
          return new Response("Failed to send email", { status: 500 });
        }
      },
    },
  },
});
