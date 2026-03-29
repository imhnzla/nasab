# Build Log — Phase 0: Foundation

**Goal:** Working deployment with empty tree, auth, and base database.

## Status: In Progress — code complete, pending external setup (domain, Supabase project, Vercel)

---

## Progress Entries

### 2026-03-29 — Initial project setup & tech stack upgrade
- Created complete folder structure matching CLAUDE.md architecture
- Created `.claude/` workspace: settings.json, 8 agent docs, 10 command docs, 5 hooks
- Created all config files: package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .gitignore, .gitattributes, .env.example, eslint.config.mjs, prettier.config.mjs, jest.config.ts, jest.setup.ts
- Upgraded entire tech stack to latest stable releases:
  - Next.js 14 → **16.2.1** (async params as Promises in all dynamic routes)
  - React 18 → **19.2.4**
  - TypeScript 5 → **6.0** (`types: []` default, `rootDir` explicit, ES2022 target)
  - Tailwind CSS v3 → **v4.1** (CSS-first via `@import "tailwindcss"` + `@theme {}`, no tailwind.config.ts)
  - next-intl v3 → **v4.8.3** (new routing.ts / navigation.ts / request.ts split, `defineRouting`, `createNavigation`, `hasLocale`)
  - tRPC v10 → **v11.15**
  - Zod v3 → **v4.3.6** (`z.uuid()`, `z.url()`, `z.email()` are now top-level, not string methods)
  - reactflow → **@xyflow/react 12.10** (renamed package, new import paths)
  - @supabase/supabase-js → **2.100.1**, @supabase/ssr → **0.9.0**
  - Removed: `tailwindcss-rtl` (built-in to Tailwind v4), `autoprefixer` (handled by @tailwindcss/postcss)
- Created all stub page/component/router files scaffolded for Phases 1–7
- Created all translation stubs: messages/ar.json, messages/en.json
- Created all tRPC router stubs with Zod v4 schema patterns
- Created lib/utils.ts (cn() helper for shadcn/ui)

---

## Checklist

- [ ] Domain registered — **manual**
- [ ] Supabase project created (production) — **manual**
- [ ] Supabase local dev configured — **manual**
- [ ] Vercel project created and linked to GitHub — **manual**
- [x] Next.js 16.2 project scaffolded (TypeScript 6.0, Tailwind v4, shadcn/ui)
- [x] next-intl configured (ar default, en secondary)
- [x] `app/[locale]/` routing structure in place
- [x] `middleware.ts` for i18n + auth session refresh
- [x] Initial migrations written (persons, users, audit_log) — apply with `npx supabase db push`
- [x] RLS enabled on all tables — policies in `20260329000001_rls_policies.sql`
- [x] Supabase Auth callback route (`/api/auth/callback`) — enable Google OAuth in dashboard manually
- [ ] Environment variables set on Vercel — **manual: copy `.env.local.example`**
- [x] Homepage styled and renders in Arabic and English (RTL/LTR, fonts, hero, features)
- [x] Root person seeded — `supabase/seed.sql` (run via `npx supabase db reset`)

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-29 | Split migrations into `_initial_schema.sql` and `_rls_policies.sql` | Easier to review security policies separately from schema |
| 2026-03-29 | Load Google Fonts via `next/font` (Amiri, Noto Naskh Arabic, Cormorant Garamond, Inter) | Performance: self-hosted, no layout shift |
| 2026-03-29 | Auth callback at `/api/auth/callback` | Standard Supabase SSR pattern for PKCE code exchange |
| 2026-03-29 | Wire all tRPC routers immediately (with TODO stubs) | Type safety for AppRouter available across the app from Phase 0 |
