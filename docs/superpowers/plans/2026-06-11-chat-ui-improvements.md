# Chat UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add timestamps to chat messages, user avatar/profile in sidebar, logout button, real profile editing in settings, and consistent timestamps across all chat pages.

**Architecture:** Simple frontend enhancements using existing Convex hooks, shadcn/ui components, and lucide-react icons. No new dependencies needed.

**Tech Stack:** React 19, TanStack Start, Tailwind v4, shadcn/ui, Convex, lucide-react

---

### Task 1: Add `timeAgo` helper utility

**Files:**
- Create: `src/lib/time.ts`

- [ ] **Step 1: Create helper function**

```typescript
export function timeAgo(date: Date | string | number): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  return new Date(date).toLocaleDateString();
}
```

---

### Task 2: Add timestamps to assistant chat messages

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

- [ ] **Step 2: Import `timeAgo`**

Add to imports at top:
```tsx
import { timeAgo } from "@/lib/time";
```

- [ ] **Step 3: Modify message rendering loop (~line 768)**

Change the message rendering to add timestamps below each bubble. For user messages, add timestamp inside the same div. For AI messages, add timestamp within the flex column.

```tsx
{messages.map((m) => {
  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const isUser = m.role === "user";
  return (
    <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {isUser ? (
        <div className="flex flex-col items-end gap-0.5">
          <div className="max-w-[80%] rounded-2xl bg-card text-foreground px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap border border-border">
            {text}
          </div>
          <span className="text-[11px] text-muted-foreground/60 px-1">
            {timeAgo(m.createdAt ?? Date.now())}
          </span>
        </div>
      ) : (
        <div className="flex gap-3 w-full">
          <Logo variant="ai-avatar" className="mt-0.5 size-7 shrink-0" />
          <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-[15px] leading-relaxed">
            <MarkdownView>{text || "..."}</MarkdownView>
            <span className="text-[11px] text-muted-foreground/60">
              {timeAgo(m.createdAt ?? Date.now())}
            </span>
          </div>
        </div>
      )}
    </div>
  );
})}
```

---

### Task 3: Add user avatar to AppShell sidebar

**Files:**
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 4: Add imports**

Add to imports:
```tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
```

- [ ] **Step 5: Add user query and avatar section at bottom of sidebar**

Inside `AppShell` component, after the nav items section and before the closing `</aside>` for desktop sidebar:

```tsx
function UserProfile() {
  const user = useQuery(api.users.me);

  if (user === undefined) {
    return (
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const name = user.name || user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      to="/settings"
      className="flex items-center gap-2.5 px-3 py-2.5 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors"
    >
      <Avatar className="size-8">
        <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-sidebar-foreground truncate">{name}</span>
    </Link>
  );
}
```

Place `<UserProfile />` at the bottom of both desktop and mobile sidebars.

---

### Task 4: Add logout button to AppShell

**Files:**
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 6: Add imports**

```tsx
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
```

- [ ] **Step 7: Add logout button component**

```tsx
function LogoutButton() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        signOut();
        navigate({ to: "/login" });
      }}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
    >
      <LogOut className="size-4" strokeWidth={1.75} />
      Sign out
    </button>
  );
}
```

Place `<LogoutButton />` below the user profile in both desktop and mobile sidebars.

---

### Task 5: Update Contact section in settings with real data

**Files:**
- Modify: `src/routes/settings.tsx`

- [ ] **Step 8: Add imports for Dialog, Input, Button**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
```

- [ ] **Step 9: Replace hardcoded ContactSection with real data**

```tsx
function ContactSection() {
  const user = useQuery(api.users.me);
  const updateProfile = useMutation(api.users.updateProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (user === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const name = user.name || user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile({ name: editName });
      setEditOpen(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-accent text-accent-foreground text-lg font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(user.name || "");
              setSaveError(null);
              setEditOpen(true);
            }}
          >
            Edit name
          </Button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://linkedin.com/in/lintshiwe-ntoampi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="LinkedIn"
          >
            <LinkedinIcon className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">LinkedIn</span>
            <ExternalLink className="size-3 text-muted-foreground" strokeWidth={1.75} />
          </a>
          <a
            href="https://github.com/Lintshiwe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="GitHub"
          >
            <GithubIcon className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="size-3 text-muted-foreground" strokeWidth={1.75} />
          </a>
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="Email"
          >
            <Mail className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span className="hidden sm:inline">Email</span>
          </a>
        </div>

        <button className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">
          <Trash2 className="inline size-3.5 mr-1" strokeWidth={1.75} />
          Delete account
        </button>
      </div>

      {/* Edit name dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit name</DialogTitle>
            <DialogDescription>Update your display name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
            />
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !editName.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

### Task 6: Add timestamps to code page

**Files:**
- Modify: `src/routes/code.tsx`

- [ ] **Step 10: Import `timeAgo`**

```tsx
import { timeAgo } from "@/lib/time";
```

- [ ] **Step 11: Add timestamps to code messages**

Modify the message rendering loop (around line 126) to add timestamps:

```tsx
{messages.map((m) => (
  <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
    {m.role === "assistant" && (
      <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
        <div className="size-2 rounded-full bg-accent" />
      </div>
    )}
    <div className={`flex flex-col gap-0.5 max-w-[85%] ${
      m.role === "user"
        ? "bg-accent/10 text-foreground rounded-2xl rounded-tr-md px-4 py-2.5"
        : "text-foreground"
    }`}>
      {m.role === "user" ? (
        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
      ) : (
        <div className="prose-flow text-sm">
          <MarkdownView>{m.content}</MarkdownView>
        </div>
      )}
      <span className={`text-[11px] text-muted-foreground/60 ${m.role === "user" ? "text-right px-1" : ""}`}>
        {timeAgo(m.createdAt ?? Date.now())}
      </span>
    </div>
  </div>
))}
```

---

### Task 7: Verification

- [ ] **Step 12: Run build**

```bash
bun run build
```

Expected: Build completes without errors. Convex type errors from backend changes are acceptable.

---
