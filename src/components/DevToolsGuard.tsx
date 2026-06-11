/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Detects DevTools via window-size difference and shows a security overlay.
 * Uses a conservative threshold (250px) to avoid false positives from
 * browser toolbars, bookmarks bars, or side panels.
 */
export function DevToolsGuard() {
  const [detected, setDetected] = useState(false);
  const lockedRef = useRef(false);

  useEffect(() => {
    // Only active in production builds
    if (!import.meta.env.PROD) return;

    function checkSize() {
      if (lockedRef.current) return;

      const threshold = 250;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        lockedRef.current = true;
        setDetected(true);
      }
    }

    // Run once on mount, then every 10 seconds — not too aggressive
    checkSize();
    const interval = setInterval(checkSize, 10_000);

    // Also check on resize (debounced by the interval)
    window.addEventListener("resize", checkSize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkSize);
    };
  }, []);

  function handleReload() {
    window.location.reload();
  }

  if (!detected) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <img
            src="/logo-full.png"
            alt="Operiq AI"
            className="h-10 opacity-80"
          />
        </div>

        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Session Terminated
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed">
          Developer tools have been detected. For security reasons, this session
          has been terminated.
        </p>

        <Button onClick={handleReload} className="inline-flex items-center gap-2">
          <RotateCcw className="size-4" />
          Reload
        </Button>
      </div>
    </div>
  );
}
