/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AICallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call the AI provider from within Convex functions using fetch().
 * Uses the same AI_API_KEY, AI_BASE_URL, AI_MODEL env vars.
 */
export async function callAI(
  messages: AIMessage[],
  options: AICallOptions = {},
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured");
  }

  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = options.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "";
}
