/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

export const MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra",  description: "Most capable" },
  { id: "operiq-pro",    label: "Operiq Pro",    description: "Balanced — Recommended" },
  { id: "operiq-plus",   label: "Operiq Plus",   description: "Fast & capable" },
  { id: "operiq-nano",   label: "Operiq Nano",   description: "Quick responses" },
  { id: "operiq-mini",   label: "Operiq Mini",   description: "Quickest" },
];

export const MODEL_STORAGE_KEY = "operiq-chat-model";

export const CODE_MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra", description: "Best for projects" },
  { id: "operiq-plus",   label: "Operiq Plus",  description: "Balanced" },
  { id: "operiq-pro",    label: "Operiq Pro",   description: "Fast" },
  { id: "operiq-mini",   label: "Operiq Mini",  description: "Quick questions" },
];

export const CODE_MODEL_STORAGE_KEY = "operiq-code-model";

// Maps Operiq model IDs to actual provider model IDs
export const MODEL_MAP: Record<string, string> = {
  "operiq-ultra":  "nvidia/llama-3.1-nemotron-ultra-253b-v1",
  "operiq-pro":    "nvidia/llama-3.1-nemotron-70b-instruct",
  "operiq-plus":   "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "operiq-nano":   "nvidia/llama-3.1-nemotron-nano-8b-v1",
  "operiq-mini":   "nvidia/nemotron-mini-4b-instruct",
};
