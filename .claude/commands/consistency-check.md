# consistency-check

Audit the entire codebase for internal consistency across source files, docs, .claude/ agents/commands, and CLAUDE.md.

Usage: `/consistency-check`

## Instructions

Run a structured audit across all four layers and report every inconsistency found. For each one, state the two conflicting values and ask the user which to keep before making any changes.

---

## Layer 1 — Version Numbers

Check that all version references are consistent across:

- `package.json` — authoritative source of truth
- `CLAUDE.md` Technology Stack line
- `docs/tech-stack.md` Stack Table
- `.claude/agents/*.md` — any inline version mentions
- `docs/build-plan.md` — any version references in task checklists

Flag any mismatch between actual `package.json` version and a documented version number.

---

## Layer 2 — File & Folder Structure

Check that file paths mentioned in docs match what actually exists on disk:

1. **CLAUDE.md folder structure block** — does every listed file/path exist?
2. **`docs/i18n.md`** — does `lib/i18n/` listing match actual files?
3. **`.claude/agents/i18n-rtl.md`** — same check
4. **`components.json`** — does `tailwind.config` point to a file that exists?
5. **`next.config.ts`** — does the `createNextIntlPlugin` argument path exist?
6. **All import paths in stub files** — do referenced modules exist?

Report any reference to a file that does not exist (deleted, renamed, or never created).

---

## Layer 3 — Breaking API Patterns

Search source files and agent docs for outdated patterns that break with current versions:

### Zod v4
- `z.string().uuid()` → should be `z.uuid()`
- `z.string().url()` → should be `z.url()`
- `z.string().email()` → should be `z.email()`

### next-intl v4
- `import { createMiddleware } from 'next-intl/middleware'` → correct
- Any references to old `lib/i18n/config.ts` as primary config → should point to `routing.ts`
- `useLocale()` from `next-intl/client` → should be from `next-intl`

### @xyflow/react v12
- `import ReactFlow from 'reactflow'` → should be `import { ReactFlow } from '@xyflow/react'`
- `import 'reactflow/dist/style.css'` → should be `'@xyflow/react/dist/style.css'`

### Tailwind v4
- References to `tailwind.config.ts` in any file → file is deleted, CSS-first now
- References to `tailwindcss-rtl` plugin → removed, built into v4
- `autoprefixer` in postcss config → not needed in v4

### Next.js 16
- `params: { id: string }` in route handlers → must be `params: Promise<{ id: string }>`
- `searchParams: { q: string }` in page props → must be `Promise<...>` too

---

## Layer 4 — Documentation Cross-Checks

1. **Every agent in CLAUDE.md Sub-Agents table** has a corresponding `.claude/agents/<name>.md` file
2. **Every command in CLAUDE.md Custom Commands table** has a corresponding `.claude/commands/<name>.md` file
3. **Every hook in CLAUDE.md Hooks table** has a corresponding `.claude/hooks/<name>.sh` file
4. **`messages/ar.json` and `messages/en.json`** have identical top-level keys
5. **`docs/tech-stack.md` "Why These Choices"** section doesn't reference removed packages

---

## Reporting Format

For each inconsistency found, output:

```
[SEVERITY] Category — File:line
  FOUND:    <what the file currently says>
  EXPECTED: <what it should say based on authoritative source>
  SOURCE:   <which file is the authority>
```

Severity levels:
- `[HIGH]` — will cause build/runtime errors (missing files, wrong API calls)
- `[MEDIUM]` — causes confusion or onboarding failure (wrong versions, old patterns)
- `[LOW]` — cosmetic / stale text

After listing all inconsistencies, group them into:
1. **Auto-fixable** (clear correct answer, no ambiguity) — list these and ask for a single "fix all?" confirmation
2. **Needs decision** (two valid options) — present each as a choice before fixing

Do not make any edits until the user has confirmed.
