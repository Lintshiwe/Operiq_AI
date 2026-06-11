/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";

const HF_VIDEO_URL =
  "https://api-inference.huggingface.co/models/tencent/HunyuanVideo";

async function hfVideoFetchWithTimeout(
  token: string,
  prompt: string,
  numFrames: number,
  retries = 1,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(HF_VIDEO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt.trim(),
        parameters: { num_frames: numFrames },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);

    // Retry once on timeout
    if (
      retries > 0 &&
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      return hfVideoFetchWithTimeout(token, prompt, numFrames, retries - 1);
    }

    throw err;
  }
}

export const Route = createFileRoute("/api/huggingface-video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          prompt?: string;
          num_frames?: number;
        } | null;

        if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
          return Response.json(
            { error: "Prompt is required" },
            { status: 400 },
          );
        }

        const numFrames = body.num_frames ?? 16;
        const token = process.env.HUGGINGFACE_TOKEN;

        if (!token) {
          return Response.json(
            { error: "HUGGINGFACE_TOKEN not configured" },
            { status: 500 },
          );
        }

        try {
          const response = await hfVideoFetchWithTimeout(
            token,
            body.prompt,
            numFrames,
          );

          if (!response.ok) {
            const errorText = await response.text();
            let errorMsg: string;
            try {
              const errJson = JSON.parse(errorText);
              errorMsg = errJson.error || errJson.message || errorText;
            } catch {
              errorMsg = errorText || `HTTP ${response.status}`;
            }
            return Response.json(
              { error: errorMsg },
              { status: response.status >= 500 ? 502 : response.status },
            );
          }

          const contentType = response.headers.get("content-type") || "";

          if (contentType.startsWith("video/")) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const dataUrl = `data:${contentType};base64,${base64}`;
            return Response.json({ success: true, video: dataUrl });
          }

          const data = await response.json();
          if (data.url || data.video_url) {
            return Response.json({
              success: true,
              video: data.url || data.video_url,
            });
          }

          return Response.json(
            { error: "Unexpected response format" },
            { status: 502 },
          );
        } catch (err) {
          if (
            err instanceof DOMException &&
            err.name === "AbortError"
          ) {
            return Response.json(
              {
                error:
                  "Video generation timed out — the model is loading. Try again in a few seconds.",
              },
              { status: 504 },
            );
          }

          console.error("Hugging Face video error:", err);
          return Response.json(
            {
              error:
                err instanceof Error
                  ? err.message
                  : "Video generation failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
