/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { keys: ["Cmd", "K"], description: "Open keyboard shortcuts panel" },
  { keys: ["Cmd", "/"], description: "Open keyboard shortcuts panel" },
  { keys: ["Cmd", "Enter"], description: "Send message / Generate" },
  { keys: ["Cmd", "N"], description: "New chat" },
  { keys: ["Cmd", "Shift", "N"], description: "New thread" },
  { keys: ["Esc"], description: "Close panel / cancel" },
];

export function KeyboardShortcuts({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-1">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <kbd
                      className={cn(
                        "inline-flex items-center justify-center rounded border border-border bg-card px-2 py-0.5 text-xs font-mono text-foreground shadow-sm",
                        k === "Cmd" && "min-w-[40px]"
                      )}
                    >
                      {k}
                    </kbd>
                    {j < s.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
