/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import type { ToolDefinition } from "./types";

const HF_VIDEO_URL =
  "https://api-inference.huggingface.co/models/tencent/HunyuanVideo";

export const generateVideoTool: ToolDefinition = {
  name: "generate_video",
  description:
    "Generate videos from text descriptions using Hugging Face HunyuanVideo. Provide a prompt describing the video you want to create.",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Video description/prompt for the AI video generator",
      },
      num_frames: {
        type: "number",
        description: "Number of frames to generate (default: 16)",
      },
    },
    required: ["prompt"],
  },
  execute: async (params: Record<string, unknown>) => {
    const prompt = String(params.prompt || "");
    const numFrames = Number(params.num_frames) || 16;

    if (!prompt.trim()) {
      return { success: false, output: "", error: "Prompt is required" };
    }

    const token = process.env.HUGGINGFACE_TOKEN;
    if (!token) {
      return {
        success: false,
        output: "",
        error: "HUGGINGFACE_TOKEN not configured",
      };
    }

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
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg: string;
        try {
          const errJson = JSON.parse(errorText);
          errorMsg = errJson.error || errJson.message || errorText;
        } catch {
          errorMsg = errorText || `HTTP ${response.status}`;
        }
        return {
          success: false,
          output: "",
          error: `Hugging Face API error: ${errorMsg}`,
        };
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.startsWith("video/")) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${contentType.split(";")[0]};base64,${base64}`;
        return {
          success: true,
          output: dataUrl,
          metadata: { num_frames: numFrames },
        };
      }

      // Some models return JSON with a video URL
      const data = await response.json();
      if (data.url || data.video_url) {
        return {
          success: true,
          output: data.url || data.video_url,
          metadata: { num_frames: numFrames },
        };
      }

      return {
        success: false,
        output: "",
        error: "Unexpected response format from Hugging Face video API",
      };
    } catch (err) {
      return {
        success: false,
        output: "",
        error:
          err instanceof Error ? err.message : "Video generation failed",
      };
    }
  },
};
