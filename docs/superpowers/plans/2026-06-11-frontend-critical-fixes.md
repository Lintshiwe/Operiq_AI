# Frontend Critical Fixes - Implementation Plan

> **Goal:** Fix all "Coming Soon" placeholders, disabled features, missing error handling, and type safety issues across the Operiq AI frontend.

---

## File Structure

| File | Changes |
|------|---------|
| `src/routes/settings.tsx` | 9 separate fixes (selects, toggles, personalization, delete account, clear data, social links, types, dialogs) |
| `src/routes/planner.tsx` | Real export download, clipboard error handling, remove `as any` |
| `src/routes/email.tsx` | Clipboard error handling, remove `as any` |
| `src/routes/meetings.tsx` | Clipboard error handling, remove `as any` |
| `src/routes/research.tsx` | Clipboard error handling, remove `as any` |
| `src/routes/assistant.$threadId.tsx` | Fix `window.isSecureContext` type safety |

---

## Task 1: Settings Page — All "Coming Soon" Placeholders

### 1.1 Language dropdowns (General section)
- Replace `DisabledSelect` with real `Select` for Language, Spoken language, Voice
- Save to localStorage with keys: `operiq-language`, `operiq-spoken-language`, `operiq-voice`
- Initialize state from localStorage

### 1.2 Personalization section
- Replace all `DisabledField` with functional inputs/textarea
- Custom instructions → localStorage `operiq-custom-instructions`
- Nickname → Convex `api.profiles.updateProfile` (mutation)
- Occupation → localStorage `operiq-occupation` (profiles table doesn't have occupation field)
- More about you → localStorage `operiq-about-me`
- "Learn more" link → `/docs` route

### 1.3 Reference toggles
- Enable `Switch` for "Reference saved memories" → localStorage `operiq-reference-memories`
- Enable `Switch` for "Reference chat history" → localStorage `operiq-reference-history`

### 1.4 Delete account button
- Add shadcn Dialog with confirmation
- Text input requiring "DELETE" to confirm
- On confirm: clear localStorage, sign out, redirect to `/login`

### 1.5 Clear all data button
- Add confirmation dialog
- On confirm: clear localStorage keys, show toast

### 1.6 Social links
- Add note "(set your links in profile)" above links
- Add LinkedIn/GitHub fields to profile edit dialog
- Save to localStorage `operiq-linkedin`, `operiq-github`

### 1.7 Type safety
- Remove `as any` from all Convex mutation calls
- Use `api.profiles.updateProfile` instead of deprecated `api.users.updateProfile`

---

## Task 2: Planner Export

- Replace Export button's `copy()` handler with `exportPlan()`
- Generate timestamped `.txt` file using Blob + URL.createObjectURL
- Include header: "Operiq AI Task Plan — Generated on [date]"

---

## Task 3: Clipboard Error Handling

- Add try/catch around `navigator.clipboard.writeText()` in:
  - `src/routes/email.tsx`
  - `src/routes/meetings.tsx`
  - `src/routes/planner.tsx`
  - `src/routes/research.tsx`
- On catch: `toast.error("Failed to copy")`

---

## Task 4: Type Safety

- Remove all `as any` from Convex mutation calls
- The `useMutation(api.*.*)` hooks already return properly typed functions

---

## Task 5: Window.isSecureContext

- Replace `window.isSecureContext` with `typeof window !== "undefined" && location.protocol === "https:"`

---

## Verification

- Run `bun run build` to check TypeScript compilation
- Check for zero errors
