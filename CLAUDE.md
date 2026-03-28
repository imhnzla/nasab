# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NASAB** (نسب) is a non-profit web platform for preserving, verifying, and visualising the lineage of Prophet Muhammad (peace be upon him). Non-discriminatory (equal Sunni/Shia rigour), source-cited, verification-first, bilingual Arabic/English.

See [`docs/project-overview.md`](docs/project-overview.md) for full vision and mission. Full technical specification is in `NASAB_Architecture.pdf`.

## Development Commands

```bash
npm run dev                  # Next.js dev server
npm run build                # Production build
npm run lint                 # ESLint
npm test                     # Test suite (--testPathPattern=<name> for single test)
npx supabase db push         # Apply pending migrations
npx supabase db reset        # Reset local DB + re-seed (local only — confirm first)
npx supabase gen types typescript --local > lib/supabase/types.ts
npx supabase migration new <name>
```

## Technology Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS + RTL plugin · shadcn/ui · next-intl · tRPC · Zod · Supabase (PostgreSQL, Auth, Storage) · React Flow + D3.js · Resend · Google Cloud Vision · Vercel

Full rationale: [`docs/tech-stack.md`](docs/tech-stack.md)

## Architecture

### Folder Structure (planned)
```
app/[locale]/          # i18n routing (ar default, en secondary)
  layout.tsx           # Sets <html lang dir>
  (public)/tree/       # Interactive family tree
  (auth)/dashboard/    # User dashboard
  admin/               # Verifier/admin panel
components/
  tree/                # React Flow tree (TreeCanvas, PersonNode, DetailPanel, BranchFilter)
  ui/                  # shadcn/ui components
  forms/               # Submission, auth forms
  admin/               # Review panels, audit log, role manager
lib/
  supabase/            # client.ts (browser), server.ts (SSR), types.ts (generated)
  i18n/                # config.ts, hijri.ts, arabic.ts
  ocr/                 # vision.ts, parser.ts (Phase 2)
server/
  trpc/                # routers/, context.ts, middleware.ts, root.ts
supabase/
  migrations/          # SQL files named YYYYMMDDHHMMSS_description.sql
  seed.sql
messages/
  ar.json              # Arabic (canonical — write first)
  en.json              # English (must mirror every key in ar.json)
```

### Database (4 core tables)
- **persons** — Tree nodes: `name_ar` (canonical), `name_en`, `father_id`, `branch`, `scholarly_tradition`, `generation`, dates (Hijri + Gregorian), `sources` (jsonb), `is_verified`
- **submissions** — Lineage claims: status (`pending→under_review→approved/rejected`), `proof_documents`, `verifier_id`
- **users** — Extended profiles: `role` (`user/verifier/admin/superadmin`), `preferred_locale`
- **audit_log** — Immutable change ledger: insert-only

Full schema with SQL: [`docs/schema.md`](docs/schema.md)

### API Layers
- **tRPC** (`/api/trpc/`) — internal, type-safe, for the Next.js frontend
- **REST v1** (`/api/v1/`) — public, read-only without auth, rate-limited at 100 req/min per IP

Full API design: [`docs/api.md`](docs/api.md)

### Key Architectural Decisions
- Arabic `name_ar` is the canonical source of truth; English is transliteration
- Where Sunni/Shia traditions differ, both versions are shown side-by-side with sources
- No separate backend server — Next.js API routes handle everything
- All database access goes through tRPC/API routes — never direct Supabase client from browser
- Supabase `service_role` key is server-only, never in client bundle

## Rules

### TypeScript
- `strict: true` in tsconfig — no `any`, explicit return types on all exported functions
- Zod schemas for all API inputs, co-located with their tRPC router

### Database & Security
- Every Supabase table must have `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY` before shipping
- Never use `service_role` key in client-side code
- All file uploads validate MIME type server-side (PDF only for submissions)
- API routes verify user role before any write operation

### Data Integrity
- Every `persons` record must have at least one entry in `sources`
- All person records must have both `name_ar` and `name_en`
- Generation must equal `father.generation + 1`
- `scholarly_tradition` must be set on every node (`sunni`, `shia`, or `both`)

### i18n
- Every translation key added to `ar.json` must also be added to `en.json` in the same commit
- Use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) — never `ml-`/`mr-` directly
- Directional icons must carry `rtl:rotate-180`

### Autonomy
Claude should freely edit files and commit. Confirm with the user before:
- `git push`
- `supabase db reset` (destroys local data)
- Any migration that drops columns or tables
- Creating or modifying verifier/admin roles

## Docs Index

| File | Contents |
|------|----------|
| [`docs/project-overview.md`](docs/project-overview.md) | Vision, mission, principles, target audience |
| [`docs/tech-stack.md`](docs/tech-stack.md) | Full stack table + rationale, env vars |
| [`docs/features.md`](docs/features.md) | Feature list by phase, user roles |
| [`docs/build-plan.md`](docs/build-plan.md) | 8-phase roadmap with task checklists |
| [`docs/schema.md`](docs/schema.md) | Full SQL schema with RLS policies |
| [`docs/api.md`](docs/api.md) | REST v1 endpoints + tRPC router overview |
| [`docs/i18n.md`](docs/i18n.md) | Locale routing, RTL rules, date formatting |
| [`docs/verification-workflow.md`](docs/verification-workflow.md) | 10-step submission → approval process |
| [`docs/brand.md`](docs/brand.md) | Colours, typography, naming, tone |
| [`docs/build-logs/phase-{0-7}.md`](docs/build-logs/) | Per-phase progress logs |

## Sub-Agents

Specialised agents in `.claude/agents/` — invoke them for focused work:

| Agent | Use When |
|-------|----------|
| `db-supabase` | Migrations, RLS policies, schema changes, seed data |
| `tree-visualisation` | React Flow nodes, D3 layout, tree canvas, PNG export |
| `i18n-rtl` | Translations, RTL layout, Hijri dates, Arabic text |
| `verification-workflow` | Submission pipeline, verifier UI, status transitions |
| `auth-security` | Supabase Auth, RLS, role guards, middleware |
| `admin-dashboard` | Verifier/admin UI, audit log, PDF viewer, role manager |
| `ocr-pdf-pipeline` | Google Cloud Vision, Urdu PDF digitisation |
| `api-trpc` | tRPC routers, REST v1 endpoints, rate limiting, Zod schemas |

## Custom Commands

| Command | Purpose |
|---------|---------|
| `/scaffold-phase <n>` | Scaffold all files and migrations for a build phase |
| `/add-person` | Add a verified historical person to the tree |
| `/verify-submission <id>` | Walk through the verification workflow for a submission |
| `/export-tree <format>` | Export tree as JSON or CSV |
| `/seed-tree` | Seed foundational historical tree data |
| `/run-migration <name>` | Create and apply a new Supabase migration safely |
| `/translate <key> <ar> <en>` | Add/update i18n translation keys |
| `/check-rls` | Audit all tables for RLS coverage |
| `/digitise-shajra <path>` | Start OCR pipeline for an Urdu PDF |

## Hooks (Automated)

Configured in `.claude/settings.json`, run automatically:

| Hook | Trigger | Action |
|------|---------|--------|
| `format-lint.sh` | After any file edit | Prettier + ESLint fix |
| `typecheck.sh` | After any `.ts`/`.tsx` edit | `tsc --noEmit` |
| `run-tests.sh` | After any source file edit | Related tests only |
| `auto-commit.sh` | When Claude finishes a task | `git add -A && git commit` |

## Build Phases

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Foundation (Supabase, Next.js, i18n, Vercel) | Not started |
| 1 | Tree MVP (interactive visualisation) | Not started |
| 2 | Urdu PDF Import (OCR pipeline) | Not started |
| 3 | User Accounts (auth, dashboard, submission form) | Not started |
| 4 | Verification System (verifier review, approval flow) | Not started |
| 5 | Public API (REST v1, rate limiting, docs) | Not started |
| 6 | Institutional Partnerships | Not started |
| 7 | Scale & Polish (Urdu/Persian, mobile app) | Not started |

Start with `/scaffold-phase 0`.
