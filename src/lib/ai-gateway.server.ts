import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAiProvider(apiKey: string, baseUrl?: string) {
  return createOpenAICompatible({
    name: "operiq-ai",
    baseURL: baseUrl ?? "https://api.openai.com/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export function getProvider() {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("Missing AI_API_KEY environment variable");
  const baseUrl = process.env.AI_BASE_URL;
  return createAiProvider(key, baseUrl);
}
