/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/elevenlabs-stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "ELEVENLABS_API_KEY not configured" },
            { status: 500 },
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return Response.json(
            { error: "Expected multipart/form-data with audio field" },
            { status: 400 },
          );
        }

        const audioFile = formData.get("audio");
        if (!audioFile || !(audioFile instanceof File)) {
          return Response.json(
            { error: "Missing audio file in form field 'audio'" },
            { status: 400 },
          );
        }

        // Forward to ElevenLabs
        const elevenLabsForm = new FormData();
        elevenLabsForm.append("audio", audioFile);
        elevenLabsForm.append("model_id", "scribe_v1");

        const sttResponse = await fetch(
          "https://api.elevenlabs.io/v1/speech-to-text",
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
            },
            body: elevenLabsForm,
          },
        );

        if (!sttResponse.ok) {
          const errorText = await sttResponse.text();
          return Response.json(
            { error: `ElevenLabs STT error: ${errorText}` },
            { status: sttResponse.status },
          );
        }

        const result = (await sttResponse.json()) as {
          text?: string;
          confidence?: number;
        };

        return Response.json({
          text: result.text ?? "",
          confidence: result.confidence ?? 0,
        });
      },
    },
  },
});
