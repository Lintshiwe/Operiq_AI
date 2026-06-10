/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

/**
 * Returns a singleton ConvexHttpClient pointing to the project's
 * Convex deployment. Reads from VITE_CONVEX_URL (set at build time)
 * with a fallback to CONVEX_URL for non-Vite environments.
 */
export function getConvexServerClient(): ConvexHttpClient {
  if (!client) {
    const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;
    if (!url) {
      throw new Error(
        "Missing Convex URL — set CONVEX_URL or VITE_CONVEX_URL",
      );
    }
    client = new ConvexHttpClient(url);
  }
  return client;
}
