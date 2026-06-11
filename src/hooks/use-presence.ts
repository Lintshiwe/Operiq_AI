/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * React hook for real-time presence tracking on a thread.
 * Calls the heartbeat mutation every 30 seconds while the component is mounted.
 */

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Hook that sends a heartbeat for the current user on a given thread.
 * Automatically starts on mount and cleans up on unmount.
 *
 * Usage:
 * ```tsx
 * usePresence(threadId);
 * ```
 */
export function usePresence(threadId: string | undefined): void {
  const heartbeat = useMutation(api.presence.heartbeat);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!threadId) return;

    // Send initial heartbeat immediately
    heartbeat({ threadId } as { threadId: string }).catch((err) =>
      console.warn("Presence heartbeat failed:", err),
    );

    // Send heartbeat on interval
    intervalRef.current = setInterval(() => {
      heartbeat({ threadId } as { threadId: string }).catch((err) =>
        console.warn("Presence heartbeat failed:", err),
      );
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [threadId, heartbeat]);
}
