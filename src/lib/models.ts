/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

export const MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra",  description: "Most capable reasoning" },
  { id: "operiq-pro",    label: "Operiq Pro",    description: "Balanced performance" },
  { id: "operiq-plus",   label: "Operiq Plus",   description: "Fast & capable" },
  { id: "operiq-nano",   label: "Operiq Nano",   description: "Quick responses" },
  { id: "operiq-mini",   label: "Operiq Mini",   description: "Fastest response" },
];

export const MODEL_STORAGE_KEY = "operiq-chat-model";

export const CODE_MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra", description: "Best for complex projects" },
  { id: "operiq-plus",   label: "Operiq Plus",  description: "Balanced" },
  { id: "operiq-pro",    label: "Operiq Pro",   description: "Fast" },
  { id: "operiq-mini",   label: "Operiq Mini",  description: "Quick questions" },
];

export const CODE_MODEL_STORAGE_KEY = "operiq-code-model";

// Maps Operiq model IDs to actual provider model IDs
export const MODEL_MAP: Record<string, string> = {
  "operiq-ultra":  "mistralai/mistral-large-3-675b-instruct-2512",
  "operiq-pro":    "meta/llama-3.3-70b-instruct",
  "operiq-plus":   "nvidia/llama-3.3-nemotron-super-49b-v1",
  "operiq-nano":   "nvidia/nvidia-nemotron-nano-9b-v2",
  "operiq-mini":   "nvidia/nemotron-mini-4b-instruct",
};
