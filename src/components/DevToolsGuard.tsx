/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DevToolsGuard() {
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    let devtoolsOpen = false;

    // Detection method 1: Window size difference
    function checkSize() {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        devtoolsOpen = true;
        setDetected(true);
      }
    }

    // Detection method 2: Timing check with debugger
    function checkTiming() {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      // If devtools is open, debugger statement causes a significant delay
      if (end - start > 100) {
        devtoolsOpen = true;
        setDetected(true);
      }
    }

    // Run checks periodically
    checkSize();
    checkTiming();

    const sizeInterval = setInterval(checkSize, 2000);
    const timingInterval = setInterval(checkTiming, 3000);

    window.addEventListener("resize", checkSize);

    return () => {
      clearInterval(sizeInterval);
      clearInterval(timingInterval);
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
          Developer tools have been detected. For security reasons, this session has been terminated.
        </p>

        <Button
          onClick={handleReload}
          className="inline-flex items-center gap-2"
        >
          <RotateCcw className="size-4" />
          Reload
        </Button>
      </div>
    </div>
  );
}
