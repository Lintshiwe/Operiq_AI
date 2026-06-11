/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * HuggingFace image/video generation actions.
 * These run as Convex actions so they can make outbound API calls
 * (not possible from TanStack Start API routes on Netlify edge).
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/* ------------------------------------------------------------------ */
/*  generateImage — Stable Diffusion XL                               */
/* ------------------------------------------------------------------ */

export const generateImage = action({
  args: {
    prompt: v.string(),
    negative_prompt: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; image?: string; error?: string }> => {
    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return { success: false, error: "HUGGINGFACE_TOKEN not configured" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: args.prompt,
            parameters: {
              negative_prompt: args.negative_prompt,
              width: args.width ?? 512,
              height: args.height ?? 512,
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HF API error (${response.status}): ${errorText}` };
      }

      // HF returns image bytes directly
      const imageBuffer = await response.arrayBuffer();
      const base64 = btoa(
        Array.from(new Uint8Array(imageBuffer))
          .map((b) => String.fromCharCode(b))
          .join(""),
      );

      return { success: true, image: `data:image/png;base64,${base64}` };
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return { success: false, error: "Request timed out after 60s" };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    } finally {
      clearTimeout(timeout);
    }
  },
});

/* ------------------------------------------------------------------ */
/*  generateVideo — HunyuanVideo                                       */
/* ------------------------------------------------------------------ */

export const generateVideo = action({
  args: {
    prompt: v.string(),
    num_frames: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; video?: string; error?: string }> => {
    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return { success: false, error: "HUGGINGFACE_TOKEN not configured" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/tencent/HunyuanVideo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: args.prompt,
            parameters: {
              num_frames: args.num_frames ?? 25,
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HF API error (${response.status}): ${errorText}` };
      }

      // HF returns video bytes directly
      const videoBuffer = await response.arrayBuffer();
      const base64 = btoa(
        Array.from(new Uint8Array(videoBuffer))
          .map((b) => String.fromCharCode(b))
          .join(""),
      );

      return { success: true, video: `data:video/mp4;base64,${base64}` };
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return { success: false, error: "Request timed out after 60s" };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    } finally {
      clearTimeout(timeout);
    }
  },
});
