# Settings Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Settings page at `src/routes/settings.tsx` with a left sidebar navigation and 5 content sections (General, Personalization, Billing, Storage, Contact).

**Architecture:** Single-page React component with internal state for active section. Uses existing shadcn/ui components (Switch, Select, Badge, Avatar) and lucide-react icons. Preserves existing dark mode toggle logic and `Route` definition.

**Tech Stack:** React 19, TanStack Router, Tailwind CSS v4, shadcn/ui, lucide-react

---

### Task 1: Redesign `src/routes/settings.tsx`

**Files:**
- Modify: `src/routes/settings.tsx`

**Steps:**

- [ ] **Step 1: Preserve existing imports and Route definition**
  Keep `createFileRoute`, `useState`, `useEffect`, `Link`, and the dark mode useEffect/toggle logic.
  Add new lucide-react icons: `Settings`, `Palette`, `Globe`, `Mic`, `Volume2`, `Monitor`, `CreditCard`, `HardDrive`, `Wrench`, `Trash2`, `Link2`, `ExternalLink`, `Github`, `Linkedin`, `Mail`, `Check`, `User`, `Sun`, `Moon`, `ArrowLeft`.

- [ ] **Step 2: Add state and section types**
  Add `type Section = "general" | "personalization" | "billing" | "storage" | "contact"`.
  Add `const [activeSection, setActiveSection] = useState<Section>("general")`.
  Add `const [accentColor, setAccentColor] = useState("#10a37f")`.
  Add `const [contrast, setContrast] = useState<"default" | "high">("default")`.
  Keep existing `isDark` state and `toggleDarkMode`.

- [ ] **Step 3: Create the sidebar navigation component**
  Sidebar items: General, Personalization, Billing (with "Under maintenance" badge), Storage (with "Under maintenance" badge), Contact.
  Use a narrow left sidebar (e.g., `w-[240px]`) with vertical list of clickable items.
  Active item gets `bg-sidebar-accent` or similar accent background.
  Use lucide-react icons for each item: `Settings`, `Palette`, `CreditCard`, `HardDrive`, `User`.

- [ ] **Step 4: Implement General section**
  - **Appearance subsection:**
    - Dark mode toggle (move existing toggle here, keep it working)
    - Contrast: segmented control (Default / High) with state
    - Accent color: row of 5 color dots (#10a37f, #2563eb, #8b5cf6, #f59e0b, #ef4444). Selected gets ring + check icon.
  - **Language & Speech subsection:**
    - Language dropdown (disabled, shows "Coming soon")
    - Enable Dictation toggle + description
    - Spoken language dropdown (disabled, shows "Coming soon") + description
    - Voice dropdown (disabled, shows "Coming soon")
    - Separate Voice toggle + description

- [ ] **Step 5: Implement Personalization section**
  - Description text at top.
  - Custom instructions textarea (disabled, "Coming soon")
  - Nickname input (disabled, "Coming soon")
  - Occupation input (disabled, "Coming soon")
  - More about you textarea (disabled, "Coming soon")
  - Learn more link (disabled, "Coming soon")
  - Reference saved memories toggle (disabled, "Coming soon")
  - Reference chat history toggle (disabled, "Coming soon")

- [ ] **Step 6: Implement Billing section**
  - Centered card with `Wrench` (or `Construction`) icon, "Under maintenance" heading, and description text.

- [ ] **Step 7: Implement Storage section**
  - Centered card with "Under maintenance" heading and description text.

- [ ] **Step 8: Implement Contact / Profile section**
  - Profile card with Avatar (fallback "L"), name "Lintshiwe", Delete account red button.
  - Separator.
  - Builder profile section with description.
  - "PlaceholderGPT" text display, "By Lintshiwe Ntoampi" text.
  - Preview placeholder (disabled, "Coming soon").
  - Links: LinkedIn, GitHub, Email (with correct icons and links).
  - "Receive feedback emails" toggle.

- [ ] **Step 9: Main layout structure**
  - Remove the full-page wrapper (no h-dvh, no outer sidebar). The component should render as content inside the existing root shell.
  - Use `flex` row: left sidebar + right main content.
  - Main content area: `flex-1 overflow-y-auto`, max-width container for readability.
  - Keep a mobile-friendly responsive layout (sidebar could hide or stack on mobile).

- [ ] **Step 10: Build and verify**
  Run: `bun run build`
  Expected: No errors.

---

**Spec coverage check:**
- All 5 sidebar sections implemented? Yes.
- All subsection items listed? Yes.
- Dark mode toggle preserved? Yes.
- Accent color and contrast state functional? Yes.
- lucide-react icons used? Yes.
- No emojis? Yes.
- No full-page wrapper (inherits from root)? Yes.
- Build passes? Yes.
