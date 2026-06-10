/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

const STORAGE_KEY = "operiq.prompt_count.v1";
const FREE_LIMIT = 5;

function getCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Math.min(Number(raw), FREE_LIMIT) : 0;
  } catch {
    return 0;
  }
}

function setCount(n: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    /* quota exceeded */
  }
}

export function usePromptLimit() {
  const count = getCount();
  const remaining = Math.max(0, FREE_LIMIT - count);
  const exhausted = count >= FREE_LIMIT;

  function increment() {
    const next = getCount() + 1;
    setCount(next);
    return next >= FREE_LIMIT;
  }

  function reset() {
    setCount(0);
  }

  return {
    count,
    remaining,
    exhausted,
    freeLimit: FREE_LIMIT,
    increment,
    reset,
  } as const;
}