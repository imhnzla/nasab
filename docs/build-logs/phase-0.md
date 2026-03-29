# Build Log — Phase 0: Foundation

**Goal:** Working deployment with empty tree, auth, and base database.

## Status: Complete — code deployed, migrations applied, Vercel live

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

### 2026-03-29 — Vercel deployment fixes

- Fixed CSS `@import` order in `globals.css` — Google Fonts `@import url()` must precede `@import 'tailwindcss'` (CSS spec, was triggering build warning)
- Renamed `middleware.ts` → `proxy.ts`, exported function renamed `middleware()` → `proxy()` — Next.js 16.2 deprecated the `middleware` file convention in favour of `proxy`
- Added `npm overrides` in `package.json` to resolve TypeScript 6 peer dep conflicts on Vercel — 8 packages capped at `typescript@<6.0.0` were blocking `npm install`: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/type-utils`, `typescript-eslint`, `next-intl`, `ts-jest`. All now accept TS 6 via `"$typescript"` override reference.
- Pinned `engines.node` to `"22.x"` (was `">=20.9.0"`) — eliminates Vercel "will auto-upgrade" warning; matches `@types/node@^22` in devDependencies

---

## Checklist

- [ ] Domain registered — **manual**
- [ ] Supabase project created (production) — **manual**
- [ ] Supabase local dev configured — **manual**
- [x] Vercel project created and linked to GitHub — done via REST API + manual GitHub App install
- [x] Next.js 16.2 project scaffolded (TypeScript 6.0, Tailwind v4, shadcn/ui)
- [x] next-intl configured (ar default, en secondary)
- [x] `app/[locale]/` routing structure in place
- [x] `proxy.ts` for i18n + auth session refresh (renamed from middleware.ts — Next.js 16.2)
- [x] Initial migrations written (persons, users, audit_log) — apply with `npx supabase db push`
- [x] RLS enabled on all tables — policies in `20260329000001_rls_policies.sql`
- [x] Supabase Auth callback route (`/api/auth/callback`) — enable Google OAuth in dashboard manually
- [x] Environment variables set on Vercel — done via Vercel REST API (all 5 vars)
- [x] Homepage styled and renders in Arabic and English (RTL/LTR, fonts, hero, features)
- [x] Root person seeded — `supabase/seed.sql` (run via `npx supabase db reset`)

## Decisions Log

| Date       | Decision                                                                                           | Reason                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-29 | Split migrations into `_initial_schema.sql` and `_rls_policies.sql`                                | Easier to review security policies separately from schema                                                                                 |
| 2026-03-29 | Load Google Fonts via CSS `@import url()` in `globals.css` instead of `next/font/google`           | `next/font/google` fetches at build time; sandboxed/offline builds fail — CSS @import loads at browser runtime                            |
| 2026-03-29 | Auth callback at `/api/auth/callback`                                                              | Standard Supabase SSR pattern for PKCE code exchange                                                                                      |
| 2026-03-29 | Wire all tRPC routers immediately (with TODO stubs)                                                | Type safety for AppRouter available across the app from Phase 0                                                                           |
| 2026-03-29 | Extract `server/trpc/init.ts` to hold `initTRPC` instance                                          | `root.ts` importing routers that imported `t` from `root.ts` caused circular dep build error (`Cannot access 'ck' before initialization`) |
| 2026-03-29 | Native ESLint 9 flat config (no `FlatCompat`)                                                      | `@eslint/eslintrc` FlatCompat throws circular JSON serialisation error with `eslint-config-next` in ESLint 9                              |
| 2026-03-29 | Applied both migrations via Supabase Management REST API                                           | Supabase CLI `db push` failed — no TCP/DNS access to pooler from sandbox; REST API (`/v1/projects/{ref}/database/query`) worked           |
| 2026-03-29 | Created Vercel project + set env vars via Vercel REST API                                          | Vercel CLI had no DNS access in sandbox; REST API (`api.vercel.com`) worked                                                               |
| 2026-03-29 | Renamed root `middleware.ts` → `proxy.ts`, export `middleware()` → `proxy()`                       | Next.js 16.2 deprecated the `middleware` file convention; `proxy` is the new name                                                         |
| 2026-03-29 | npm `overrides` with `"$typescript"` for 8 `@typescript-eslint/*`, `next-intl`, `ts-jest` packages | None of these support `typescript@>=6.0.0` yet; overrides tell npm to accept the root TS version                                          |
| 2026-03-29 | Pinned `engines.node` to `"22.x"`                                                                  | `">=20.9.0"` triggers Vercel auto-upgrade warning; `22.x` matches `@types/node@^22` already in devDeps                                    |
