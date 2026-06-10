/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// NOTE: Security headers middleware temporarily disabled while debugging SSR 500
// const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
//   const response = await next();
//   response.headers.set("X-Frame-Options", "DENY");
//   ...
// });

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));