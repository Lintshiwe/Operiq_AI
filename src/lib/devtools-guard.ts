/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useEffect } from "react";

/**
 * DevTools detection using timing-based approach.
 * When DevTools is opened, debugger statements cause measurable timing delays.
 */
function isDevToolsOpen(): boolean {
  const threshold = 160;
  const start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  const end = performance.now();
  return end - start > threshold;
}

/**
 * React component that detects DevTools and shows a security overlay.
 * Only activates in production builds.
 */
export function DevToolsGuard() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let devToolsDetected = false;

    const checkDevTools = () => {
      if (devToolsDetected) return;
      if (isDevToolsOpen()) {
        devToolsDetected = true;
        // Show full-screen overlay
        const overlay = document.createElement("div");
        overlay.id = "devtools-overlay";
        overlay.style.cssText =
          "position:fixed;inset:0;z-index:999999;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif;";
        overlay.innerHTML = `
          <img src="/logo-full.png" alt="Operiq AI" style="width:180px;margin-bottom:32px;" />
          <p style="color:#ef4444;font-size:18px;font-weight:600;margin-bottom:8px;">Developer tools detected</p>
          <p style="color:#9ca3af;font-size:14px;">This session has been terminated for security reasons.</p>
        `;
        document.body.appendChild(overlay);

        // Redirect to blank page after short delay
        setTimeout(() => {
          window.location.href = "about:blank";
        }, 3000);
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
