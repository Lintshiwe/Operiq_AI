/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

export const MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra",  description: "Mistral Large — Most capable" },
  { id: "operiq-pro",    label: "Operiq Pro",    description: "Llama 3.3 70B — Balanced & Recommended" },
  { id: "operiq-plus",   label: "Operiq Plus",   description: "Nemotron Super 49B — Fast & capable" },
  { id: "operiq-nano",   label: "Operiq Nano",   description: "Nemotron Nano 9B — Quick" },
  { id: "operiq-mini",   label: "Operiq Mini",   description: "Nemotron Mini 4B — Quickest" },
];

export const MODEL_STORAGE_KEY = "operiq-chat-model";

export const CODE_MODELS = [
  { id: "operiq-ultra",  label: "Operiq Ultra", description: "Mistral Large — Best for projects" },
  { id: "operiq-plus",   label: "Operiq Plus",  description: "Nemotron Super 49B — Balanced" },
  { id: "operiq-pro",    label: "Operiq Pro",   description: "Llama 3.3 70B — Fast" },
  { id: "operiq-mini",   label: "Operiq Mini",  description: "Nemotron Mini 4B — Quick questions" },
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
