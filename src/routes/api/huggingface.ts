/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 1024;

async function hfFetchWithTimeout(
  token: string,
  prompt: string,
  negativePrompt?: string,
  width?: number,
  height?: number,
  retries = 1,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt.trim(),
        parameters: {
          negative_prompt: negativePrompt || undefined,
          width: width ?? DEFAULT_WIDTH,
          height: height ?? DEFAULT_HEIGHT,
        },
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
      return hfFetchWithTimeout(
        token,
        prompt,
        negativePrompt,
        width,
        height,
        retries - 1,
      );
    }

    throw err;
  }
}

export const Route = createFileRoute("/api/huggingface")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          prompt?: string;
          negative_prompt?: string;
          width?: number;
          height?: number;
        } | null;

        if (!body || typeof body !== "object") {
          return Response.json(
            { error: "Invalid request body" },
            { status: 400 },
          );
        }

        const prompt = body.prompt;
        const negativePrompt = body.negative_prompt;
        const width = body.width ?? DEFAULT_WIDTH;
        const height = body.height ?? DEFAULT_HEIGHT;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
          return Response.json(
            { error: "Prompt is required and must be a non-empty string" },
            { status: 400 },
          );
        }

        const token = process.env.HUGGINGFACE_TOKEN;
        if (!token) {
          return Response.json(
            { error: "HUGGINGFACE_TOKEN not configured" },
            { status: 500 },
          );
        }

        try {
          const hfResponse = await hfFetchWithTimeout(
            token,
            prompt,
            negativePrompt,
            width,
            height,
          );

          if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            let errorMsg: string;
            try {
              const errJson = JSON.parse(errorText);
              errorMsg = errJson.error || errJson.message || errorText;
            } catch {
              errorMsg =
                errorText ||
                `Hugging Face API returned HTTP ${hfResponse.status}`;
            }
            return Response.json(
              { error: errorMsg },
              { status: hfResponse.status >= 500 ? 502 : hfResponse.status },
            );
          }

          const contentType = hfResponse.headers.get("content-type") || "";

          if (contentType.startsWith("image/")) {
            const arrayBuffer = await hfResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const mimeType = contentType.split(";")[0] || "image/png";
            const dataUrl = `data:${mimeType};base64,${base64}`;

            return Response.json({ success: true, image: dataUrl });
          }

          const data = await hfResponse.json();

          // Handle { generated_image: "base64..." } pattern
          if (data.generated_image) {
            return Response.json({
              success: true,
              image: `data:image/png;base64,${data.generated_image}`,
            });
          }

          // Handle array of generated images
          if (
            Array.isArray(data) &&
            data.length > 0 &&
            data[0].generated_image
          ) {
            return Response.json({
              success: true,
              image: `data:image/png;base64,${data[0].generated_image}`,
            });
          }

          return Response.json(
            { error: "Unexpected response format from Hugging Face API" },
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
                  "Image generation timed out — the model is loading. Try again in a few seconds.",
              },
              { status: 504 },
            );
          }

          console.error("Hugging Face API error:", err);
          return Response.json(
            {
              error:
                err instanceof Error
                  ? err.message
                  : "Image generation failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
