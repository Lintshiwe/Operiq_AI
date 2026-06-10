/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import type { ToolDefinition } from "./types";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

export const generateImageTool: ToolDefinition = {
  name: "generate_image",
  description:
    "Generate images using Hugging Face FLUX.1-schnell (text-to-image). Provide a prompt describing the image. Supports negative prompt, width, and height.",
  parameters: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Image description/prompt for the AI image generator",
      },
      negative_prompt: {
        type: "string",
        description: "Things to avoid in the generated image",
      },
      width: {
        type: "number",
        description: "Image width in pixels (default: 1024)",
      },
      height: {
        type: "number",
        description: "Image height in pixels (default: 1024)",
      },
    },
    required: ["prompt"],
  },
  execute: async (params: Record<string, unknown>) => {
    const prompt = String(params.prompt || "");
    const negativePrompt = params.negative_prompt
      ? String(params.negative_prompt)
      : undefined;
    const width = Number(params.width) || 1024;
    const height = Number(params.height) || 1024;

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
            width,
            height,
          },
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

      if (contentType.startsWith("image/")) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const mimeType = contentType.split(";")[0] || "image/png";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return {
          success: true,
          output: dataUrl,
          metadata: { width, height },
        };
      }

      // Handle JSON responses that contain base64 image data
      const data = await response.json();

      if (data.generated_image) {
        return {
          success: true,
          output: `data:image/png;base64,${data.generated_image}`,
          metadata: { width, height },
        };
      }

      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].generated_image
      ) {
        return {
          success: true,
          output: `data:image/png;base64,${data[0].generated_image}`,
          metadata: { width, height },
        };
      }

      return {
        success: false,
        output: "",
        error: "Unexpected response format from Hugging Face API",
      };
    } catch (err) {
      return {
        success: false,
        output: "",
        error:
          err instanceof Error ? err.message : "Image generation failed",
      };
    }
  },
};
