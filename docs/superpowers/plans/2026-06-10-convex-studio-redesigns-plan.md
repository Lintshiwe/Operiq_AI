# Convex Infrastructure & Studio Redesigns — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Convex as persistent data layer with password auth, redesign 3 Studio tools as Copilot-style composers, and add email sending via Resend.

**Architecture:** Convex Cloud for auth + data persistence. Existing TanStack Start server functions unchanged for AI calls. Redesigned tools follow the single-column composer pattern established by Email Studio. Auth gates all pages with login/signup flow.

**Tech Stack:** Convex + Convex Auth (password), Resend API, lucide-react, TanStack Start SSR

---

### Task 1: Install Convex + save env vars

**Files:**
- Modify: `.env.example`
- Modify: `.env`
- Modify: `package.json`

- [ ] **Step 1: Install Convex packages**

```bash
bun add convex@latest @convex-dev/auth
```

- [ ] **Step 2: Initialize Convex**

```bash
bunx convex init
```
(This creates `convex/` directory with schema and auth config. Choose "next-goldfish-387" deployment when prompted.)

- [ ] **Step 3: Verify convex/ folder was created**

Run: `ls convex/` — should show at minimum a schema file.

- [ ] **Step 4: Update .env.example**

Add to `.env.example`:
```bash
# Convex (data storage + auth)
CONVEX_URL=https://next-goldfish-387.convex.cloud
CONVEX_DEPLOYMENT=next-goldfish-387

# Resend (email sending)
RESEND_API_KEY=re_...
```

- [ ] **Step 5: Commit**

```bash
git add .env.example convex/ package.json bun.lock
git commit -m "feat: add Convex dependencies and init"
```

---

### Task 2: Create Convex schema (all tables)

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Write schema with all tables**

Edit `convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  threads: defineTable({
    userId: v.id("users"),
    title: v.string(),
    messages: v.array(v.object({
      id: v.string(),
      role: v.string(),
      content: v.string(),
      createdAt: v.optional(v.string()),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  emailDrafts: defineTable({
    userId: v.id("users"),
    recipient: v.optional(v.string()),
    subject: v.optional(v.string()),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
    draft: v.string(),
    sent: v.boolean(),
    sentAt: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  meetingSummaries: defineTable({
    userId: v.id("users"),
    meetingType: v.optional(v.string()),
    notes: v.string(),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  taskPlans: defineTable({
    userId: v.id("users"),
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  researchAnalyses: defineTable({
    userId: v.id("users"),
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
    output: v.string(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
});
```

- [ ] **Step 2: Push schema to Convex**

```bash
bunx convex deploy
```
Expected: "Schema deployed successfully"

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: define Convex schema with auth tables + all data models"
```

---

### Task 3: Set up Convex Auth (password-based)

**Files:**
- Create: `convex/auth.ts`
- Create: `convex/auth.config.ts`

- [ ] **Step 1: Create auth config**

Write `convex/auth.config.ts`:
```typescript
export default {
  providers: [
    {
      domain: "convex",
      applicationID: "password",
    },
  ],
};
```

- [ ] **Step 2: Create auth implementation**

Write `convex/auth.ts`:
```typescript
import { BetterAuth } from "@convex-dev/auth/server";

export const auth = new BetterAuth({
  providers: [
    // Password-based auth
    {
      type: "password",
      id: "password",
      name: "Password",
      // Convex Auth handles password hashing automatically
    },
  ],
});
```

- [ ] **Step 3: Deploy auth config**

```bash
bunx convex deploy
```

- [ ] **Step 4: Commit**

```bash
git add convex/auth.ts convex/auth.config.ts
git commit -m "feat: set up Convex Auth with password provider"
```

---

### Task 4: Create Convex mutations/queries — threads

**Files:**
- Create: `convex/threads.ts`

- [ ] **Step 1: Write threads CRUD**

Write `convex/threads.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    messages: v.array(v.object({
      id: v.string(),
      role: v.string(),
      content: v.string(),
      createdAt: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("threads", {
      userId: args.userId,
      title: args.title,
      messages: args.messages,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    threadId: v.id("threads"),
    messages: v.array(v.object({
      id: v.string(),
      role: v.string(),
      content: v.string(),
      createdAt: v.optional(v.string()),
    })),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      messages: args.messages,
      updatedAt: new Date().toISOString(),
    };
    if (args.title) patch.title = args.title;
    await ctx.db.patch(args.threadId, patch);
  },
});

export const remove = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.threadId);
  },
});

export const importMany = mutation({
  args: {
    userId: v.id("users"),
    threads: v.array(v.object({
      title: v.string(),
      messages: v.array(v.object({
        id: v.string(),
        role: v.string(),
        content: v.string(),
        createdAt: v.optional(v.string()),
      })),
      createdAt: v.string(),
      updatedAt: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (const thread of args.threads) {
      await ctx.db.insert("threads", {
        userId: args.userId,
        ...thread,
      });
    }
  },
});
```

- [ ] **Step 2: Deploy**

```bash
bunx convex deploy
```

- [ ] **Step 3: Commit**

```bash
git add convex/threads.ts
git commit -m "feat: add threads CRUD mutations and queries"
```

---

### Task 5: Create Convex mutations/queries — email drafts, summaries, plans, analyses

**Files:**
- Create: `convex/emailDrafts.ts`
- Create: `convex/summaries.ts`
- Create: `convex/plans.ts`
- Create: `convex/analyses.ts`

- [ ] **Step 1: Write emailDrafts CRUD**

Write `convex/emailDrafts.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDrafts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    recipient: v.optional(v.string()),
    subject: v.optional(v.string()),
    tone: v.string(),
    audience: v.string(),
    context: v.optional(v.string()),
    draft: v.string(),
    sent: v.boolean(),
    sentAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailDrafts", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const markSent = mutation({
  args: { draftId: v.id("emailDrafts"), sentAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.draftId, { sent: true, sentAt: args.sentAt });
  },
});
```

- [ ] **Step 2: Write summaries CRUD**

Write `convex/summaries.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meetingSummaries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    meetingType: v.optional(v.string()),
    notes: v.string(),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetingSummaries", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});
```

- [ ] **Step 3: Write plans CRUD**

Write `convex/plans.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskPlans")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    horizon: v.string(),
    tasks: v.string(),
    goals: v.optional(v.string()),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("taskPlans", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});
```

- [ ] **Step 4: Write analyses CRUD**

Write `convex/analyses.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchAnalyses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const save = mutation({
  args: {
    userId: v.id("users"),
    material: v.string(),
    question: v.optional(v.string()),
    depth: v.optional(v.string()),
    output: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchAnalyses", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});
```

- [ ] **Step 5: Deploy all**

```bash
bunx convex deploy
```

- [ ] **Step 6: Commit**

```bash
git add convex/emailDrafts.ts convex/summaries.ts convex/plans.ts convex/analyses.ts
git commit -m "feat: add CRUD for email drafts, summaries, plans, analyses"
```

---

### Task 6: Add ConvexProvider to root layout

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Read current __root.tsx**

```bash
cat src/routes/__root.tsx
```

- [ ] **Step 2: Add ConvexProvider**

Import and wrap the layout:
```typescript
import { ConvexProvider } from "convex/react";

// Inside the component, wrap children:
<ConvexProvider url={import.meta.env.VITE_CONVEX_URL}>
  <Outlet />
</ConvexProvider>
```

Note: VITE_CONVEX_URL should be set in .env.local (client-accessible). We'll use `CONVEX_URL` env var mapped to `VITE_CONVEX_URL` via Vite's `define` or just prefix it with `VITE_` in `.env`.

- [ ] **Step 3: Add VITE_CONVEX_URL to .env**

```bash
echo "VITE_CONVEX_URL=https://next-goldfish-387.convex.cloud" >> .env
```

Also update `.env.example`:
```
VITE_CONVEX_URL=https://next-goldfish-387.convex.cloud
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/__root.tsx .env.example
git commit -m "feat: add ConvexProvider to root layout"
```

---

### Task 7: Create AuthGate component

**Files:**
- Create: `src/components/AuthGate.tsx`

- [ ] **Step 1: Write AuthGate**

Write `src/components/AuthGate.tsx`:
```typescript
import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-lg bg-[#10a37f] flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <div className="size-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuthGate.tsx
git commit -m "feat: create AuthGate component for route protection"
```

---

### Task 8: Create login page

**Files:**
- Create: `src/routes/login.tsx`

- [ ] **Step 1: Write login page**

Write `src/routes/login.tsx`:
```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign In \u00b7 Operiq AI" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/assistant" });
  }, [isAuthenticated]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      navigate({ to: "/assistant" });
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="size-10 rounded-xl bg-[#10a37f] flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">O</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to Operiq AI</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-foreground">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40"
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-foreground">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Sign in
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-accent hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/login.tsx
git commit -m "feat: create login page with password auth"
```

---

### Task 9: Create signup page

**Files:**
- Create: `src/routes/signup.tsx`

- [ ] **Step 1: Write signup page**

Write `src/routes/signup.tsx` — same structure as login but with `signIn("password", { email, password, flow: "signUp" })`. The page should:
- Collect email + password
- Call Convex Auth signUp flow
- Redirect to /assistant on success
- Show "Already have an account? Sign in" link

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { UserPlus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create Account \u00b7 Operiq AI" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/assistant" });
  }, [isAuthenticated]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signUp" });
      navigate({ to: "/assistant" });
    } catch (err) {
      setError("Could not create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="size-10 rounded-xl bg-[#10a37f] flex items-center justify-center mb-4">
            <span className="text-white text-lg font-bold">O</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Get started with Operiq AI</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-foreground">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40"
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-foreground">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40"
              placeholder="At least 6 characters"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm text-foreground">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent/40"
              placeholder="Repeat your password"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create account
          </button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-accent hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/signup.tsx
git commit -m "feat: create signup page with password auth"
```

---

### Task 10: Protect app pages behind AuthGate

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Wrap children in AuthGate**

In `__root.tsx`, import and wrap:
```typescript
import { AuthGate } from "@/components/AuthGate";

// In the component:
<ConvexProvider url={import.meta.env.VITE_CONVEX_URL}>
  <AuthGate>
    <div className="whatever existing wrapper">
      <Outlet />
    </div>
  </AuthGate>
</ConvexProvider>
```

- [ ] **Step 2: Verify login redirect works**

Run: `bun run dev` → navigate to `/assistant` → should redirect to `/login`

- [ ] **Step 3: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: protect routes behind AuthGate"
```

---

### Task 11: Migrate assistant threads from localStorage to Convex

**Files:**
- Modify: `src/routes/assistant.$threadId.tsx`

- [ ] **Step 1: Add Convex queries to assistant page**

Import and use Convex thread hooks:
```typescript
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "@convex-dev/auth/react";
// Replace localStorage reads with:
const threads = useQuery("threads:list", { userId: user._id });
const createThread = useMutation("threads:create");
const updateThread = useMutation("threads:update");
const deleteThread = useMutation("threads:remove");
const importThreads = useMutation("threads:importMany");
```

- [ ] **Step 2: On mount, check for localStorage threads and import**

```typescript
useEffect(() => {
  const legacy = localStorage.getItem("operiq.threads.v1");
  if (legacy && user) {
    const parsed = JSON.parse(legacy);
    if (Array.isArray(parsed) && parsed.length > 0) {
      importThreads({ userId: user._id, threads: parsed });
      localStorage.removeItem("operiq.threads.v1");
    }
  }
}, [user]);
```

- [ ] **Step 3: Replace all localStorage reads/writes with Convex calls**

Throughout the component:
- `threads` data → `useQuery("threads:list", ...)`
- Creating threads → `createThread(...)`
- Updating messages → `updateThread(...)`
- Deleting threads → `deleteThread(...)`

- [ ] **Step 4: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/assistant.$threadId.tsx
git commit -m "feat: migrate threads from localStorage to Convex"
```

---

### Task 12: Redesign Meeting Intelligence (Copilot-style)

**Files:**
- Modify: `src/routes/meetings.tsx`
- Modify: `src/lib/ai.functions.ts` (add meetingType param)

- [ ] **Step 1: Add meetingType param to backend**

In `ai.functions.ts`, update MeetingInput schema:
```typescript
const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
  meetingType: z.enum(["1:1", "team-sync", "client-call", "all-hands"]).optional(),
});
```
And update the system prompt to mention meetingType.

- [ ] **Step 2: Rewrite meetings.tsx as single-column composer**

Follow the email.tsx pattern exactly:
- Single column, max-w-[680px] centered
- Minimal header: CalendarCheck2 icon + "Meeting Intelligence" + subtitle
- Pill toggle: Meeting type — 1:1 / Team Sync / Client Call / All-Hands
- Large textarea: "Paste meeting transcript or rough notes..."
- Sparkles + "Generate briefing" button with Cmd+Enter hint
- Loading skeleton pulse animation
- Result card: AI indicator (green dot) + Copy button + markdown content
- Refine input bar: text input + SendHorizontal button
- Inline disclaimer with ShieldCheck
- Smooth scroll to result on generation

- [ ] **Step 3: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/meetings.tsx src/lib/ai.functions.ts
git commit -m "feat: redesign Meeting Intelligence as Copilot-style composer"
```

---

### Task 13: Redesign Task Planner (Copilot-style)

**Files:**
- Modify: `src/routes/planner.tsx`

- [ ] **Step 1: Rewrite planner.tsx as single-column composer**

Follow email.tsx pattern:
- Single column, max-w-[680px] centered
- Minimal header: ListChecks icon + "Task Planner" + subtitle
- Pill toggle: Daily / Weekly (replacing Select component)
- Textarea: "List your tasks (one per line)..."
- Second textarea: "Goals or context (optional)"
- Sparkles + "Generate plan" button with Cmd+Enter hint
- Loading skeleton
- Result card: AI indicator + Copy button + markdown
- Refine input bar
- Inline disclaimer with ShieldCheck

- [ ] **Step 2: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/planner.tsx
git commit -m "feat: redesign Task Planner as Copilot-style composer"
```

---

### Task 14: Redesign Research Hub (Copilot-style)

**Files:**
- Modify: `src/routes/research.tsx`
- Modify: `src/lib/ai.functions.ts` (add depth param)

- [ ] **Step 1: Add depth param to backend**

In `ai.functions.ts`, update ResearchInput schema:
```typescript
const ResearchInput = z.object({
  material: z.string().min(20).max(20000),
  question: z.string().max(1000).optional(),
  depth: z.enum(["quick", "deep", "executive"]).optional(),
});
```

- [ ] **Step 2: Rewrite research.tsx as single-column composer**

Follow email.tsx pattern:
- Single column, max-w-[680px] centered
- Minimal header: BookOpen icon + "Research Hub" + subtitle
- Pill toggle: Analysis depth — Quick Summary / Deep Analysis / Executive Brief
- Large textarea: "Paste report, article, or transcript..."
- Input field: "Focus question (optional)"
- Sparkles + "Generate analysis" button with Cmd+Enter hint
- Loading skeleton
- Result card: AI indicator + Copy button + markdown
- Refine input bar
- Inline disclaimer with ShieldCheck

- [ ] **Step 3: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/research.tsx src/lib/ai.functions.ts
git commit -m "feat: redesign Research Hub as Copilot-style composer"
```

---

### Task 15: Create Resend email sending server function

**Files:**
- Create: `src/routes/api/resend.ts`
- Modify: `.env.example`
- Modify: `.env`

- [ ] **Step 1: Create Resend API endpoint**

Write `src/routes/api/resend.ts`:
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { Resend } from "resend";

export const Route = createFileRoute("/api/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { to, subject, text, from } = await request.json() as {
          to: string;
          subject: string;
          text: string;
          from: string;
        };

        if (!to || !subject || !text || !from) {
          return new Response("Missing required fields", { status: 400 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
          const result = await resend.emails.send({
            from,
            to,
            subject,
            text,
          });
          return Response.json(result);
        } catch (err) {
          console.error("Resend error:", err);
          return new Response("Failed to send email", { status: 500 });
        }
      },
    },
  },
});
```

- [ ] **Step 2: Install resend package**

```bash
bun add resend
```

- [ ] **Step 3: Add RESEND_API_KEY to .env and .env.example**

```bash
echo "# Resend (email sending)\nRESEND_API_KEY=re_..." >> .env
```

- [ ] **Step 4: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/api/resend.ts package.json bun.lock .env.example
git commit -m "feat: add Resend email sending API endpoint"
```

---

### Task 16: Add Send button to Email Studio

**Files:**
- Modify: `src/routes/email.tsx`

- [ ] **Step 1: Add Send button to result card**

In the draft result section of email.tsx, add a "Send" button next to "Copy":
```typescript
import { Send } from "lucide-react";

// In the action buttons area:
<Button variant="ghost" size="sm" onClick={onSend} className="h-7 px-2 text-xs gap-1">
  <Send className="size-3.5" />
  Send
</Button>
```

- [ ] **Step 2: Implement onSend function**

```typescript
async function onSend() {
  if (!draft) return;
  setSending(true);
  try {
    const res = await fetch("/api/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        subject: subject,
        text: draft,
        from: userEmail, // from Convex auth
      }),
    });
    if (!res.ok) throw new Error("Send failed");
    toast.success("Email sent successfully");
    setDraft(null);
  } catch (e) {
    toast.error("Failed to send email. Check your Resend setup.");
  } finally {
    setSending(false);
  }
}
```

- [ ] **Step 3: Get user email from auth**

Use `useConvexAuth()` or `useAuthUser()` to get the signed-in user's email.

- [ ] **Step 4: Build and verify**

Run: `bun run build`
Expected: Compiles without errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/email.tsx
git commit -m "feat: add Send button to Email Studio via Resend"
```

---

### Task 17: Final build verification + cleanup

**Files:**
- All files

- [ ] **Step 1: Run full build**

```bash
bun run build
```
Expected: Client and SSR both compile without errors.

- [ ] **Step 2: Start dev server and test routes**

```bash
bun run dev
```
Test:
- http://localhost:3000/login — shows login page
- http://localhost:3000/signup — shows signup page
- Sign up → redirected to /assistant
- /assistant — threads load from Convex
- /code — works
- /email — works with Send button
- /meetings — redesigned
- /planner — redesigned
- /research — redesigned

- [ ] **Step 3: Run lint**

```bash
bun run lint
```
Expected: No errors.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final polish after Convex + redesigns integration"
```
