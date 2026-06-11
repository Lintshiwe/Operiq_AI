/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: "share" | "mention" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
};

const STORAGE_KEY = "operiq-notifications";

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Notification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function ensureWelcomeNotification() {
  const existing = loadNotifications();
  if (existing.length === 0) {
    const welcome: Notification = {
      id: "welcome",
      type: "system",
      title: "Welcome to Operiq AI",
      body: "Get started by creating a new chat or exploring the Studio tools.",
      read: false,
      createdAt: Date.now(),
    };
    saveNotifications([welcome]);
  }
}

export function NotificationBell() {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch Convex notifications
  const convexNotifications = useQuery(api.notifications.list);
  const markReadMutation = useMutation(api.notifications.markRead);
  const markAllReadMutation = useMutation(api.notifications.markAllRead);

  useEffect(() => {
    ensureWelcomeNotification();
    setLocalNotifications(loadNotifications());
  }, []);

  // Merge Convex and localStorage notifications
  const allNotifications = useMemo(() => {
    const convexMapped: Notification[] = (convexNotifications || []).map((n) => ({
      id: n._id,
      type: (n.type as "share" | "mention" | "system") || "system",
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: new Date(n.createdAt).getTime(),
    }));
    // Combine, deduplicating by id (Convex takes priority)
    const seen = new Set<string>();
    const merged: Notification[] = [];
    for (const n of [...convexMapped, ...localNotifications]) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        merged.push(n);
      }
    }
    return merged;
  }, [convexNotifications, localNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    // Check if this is a Convex notification (has _id format)
    const isConvex = convexNotifications?.some((n) => n._id === id);
    if (isConvex) {
      markReadMutation({ notificationId: id as any }).catch(() => {});
    } else {
      const next = localNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      setLocalNotifications(next);
      saveNotifications(next);
    }
  }

  async function markAllAsRead() {
    // Mark all Convex notifications as read
    try {
      await markAllReadMutation({});
    } catch {
      // Not authenticated or no notifications
    }
    // Mark all localStorage notifications as read
    const next = localNotifications.map((n) => ({ ...n, read: true }));
    setLocalNotifications(next);
    saveNotifications(next);
    toast.success("All notifications marked as read");
  }

  function removeNotification(id: string) {
    const isConvex = convexNotifications?.some((n) => n._id === id);
    if (!isConvex) {
      const next = localNotifications.filter((n) => n.id !== id);
      setLocalNotifications(next);
      saveNotifications(next);
    }
    // Convex notifications cannot be deleted from the client side currently
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-destructive px-[3px] text-[9px] font-semibold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              allNotifications
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-2 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors",
                      !n.read && "bg-accent/5"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Mark as read"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Remove"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
