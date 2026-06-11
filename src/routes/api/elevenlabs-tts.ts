/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";

const VOICE_MAP: Record<string, string> = {
  aria: "9BWtsMINqrJLrRakOkie",
  roger: "CwhRBWXzGAHq8TQ4Fs17",
  sarah: "EXAVITQu4vr4xnSDxMaL",
};

const DEFAULT_VOICE = VOICE_MAP.aria;

export const Route = createFileRoute("/api/elevenlabs-tts")({
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

        let body: { text?: string; voiceId?: string } | null;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        if (!body || typeof body.text !== "string" || !body.text.trim()) {
          return Response.json(
            { error: "Text is required" },
            { status: 400 },
          );
        }

        const voiceName = body.voiceId?.toLowerCase();
        const voiceId =
          voiceName && VOICE_MAP[voiceName]
            ? VOICE_MAP[voiceName]
            : body.voiceId || DEFAULT_VOICE;

        try {
          const ttsResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: body.text.trim(),
                model_id: "eleven_flash_v2_5",
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                },
              }),
            },
          );

          if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            let errorMsg: string;
            try {
              const errJson = JSON.parse(errorText);
              errorMsg =
                errJson.detail?.message ||
                errJson.detail ||
                errJson.message ||
                errorText;
            } catch {
              errorMsg = errorText || `HTTP ${ttsResponse.status}`;
            }
            const status =
              ttsResponse.status === 401
                ? 401
                : ttsResponse.status === 429
                  ? 429
                  : ttsResponse.status >= 400
                    ? ttsResponse.status
                    : 502;
            return Response.json({ error: errorMsg }, { status });
          }

          // Stream audio back
          return new Response(ttsResponse.body, {
            headers: {
              "Content-Type":
                ttsResponse.headers.get("content-type") || "audio/mpeg",
            },
          });
        } catch (err) {
          console.error("ElevenLabs TTS error:", err);
          return Response.json(
            {
              error:
                err instanceof Error ? err.message : "TTS generation failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
