# Technology Stack

## Overview

NASAB is built on a modern full-stack JavaScript/TypeScript architecture with a managed Postgres backend. There is no separate backend server — Next.js handles both frontend and API.

## Stack Table

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 16.2.1 | Vercel-native, i18n routing, RSC, async params |
| Runtime | React | 19.2.4 | Server Actions, stable concurrent features |
| Language | TypeScript | 6.0 | Strict mode, `types: []` default, ES2022 target |
| Tree Visualisation | @xyflow/react | 12.10.2 | Renamed from `reactflow`; production-grade graph rendering |
| Layout Algorithm | D3.js | 7.9.0 | `d3.hierarchy()` for tree layout |
| Styling | Tailwind CSS | 4.1 | CSS-first config (`@theme {}`), built-in RTL, no plugin needed |
| Component Library | shadcn/ui | latest | Accessible, unstyled, customisable |
| i18n | next-intl | 4.8.3 | `defineRouting` + `createNavigation` + `hasLocale` API |
| Backend API | tRPC | 11.15 | Type-safe API, no code generation |
| Input Validation | Zod | 4.3.6 | Top-level `z.uuid()` / `z.url()` / `z.email()` (breaking v4 change) |
| ORM / DB Client | @supabase/supabase-js | 2.100.1 | Managed Postgres, RLS, realtime |
| SSR Auth | @supabase/ssr | 0.9.0 | Cookie-based session refresh in middleware |
| Authentication | Supabase Auth | — | Email + social, JWT, SSR cookies |
| File Storage | Supabase Storage | — | Private buckets, signed URLs |
| Server State | TanStack Query | 5.95.0 | Used by tRPC React adapter |
| Email | Resend | 6.9.4 | Transactional, Arabic email support |
| OCR | Google Cloud Vision | — | Nastaliq Urdu handwriting recognition |
| Deployment | Vercel | — | Zero-config Next.js, global CDN |
| Analytics | Vercel Analytics + Plausible | — | Privacy-respecting, no cookies |
| Image Export | html-to-image | 1.11.13 | Client-side PNG of tree canvas |
| Rate Limiting | @upstash/ratelimit | 2.0.8 | Edge-compatible, Vercel-native |

## Why These Choices

### Next.js over separate frontend/backend
Single deployment unit, shared TypeScript types, native i18n routing with `app/[locale]/`, Vercel integration with zero config.

### Supabase over raw Postgres or other databases
- Built-in Row Level Security (essential for multi-role access)
- Managed auth with SSR support
- Storage buckets for proof documents
- Type generation via `supabase gen types typescript`

### tRPC over REST for internal API
End-to-end type safety without writing separate type definitions. The public REST API (`/api/v1/`) is for external consumers only.

### @xyflow/react over custom SVG
Handles 1000+ nodes with built-in zoom/pan, minimap, and custom node/edge rendering. Package renamed from `reactflow` to `@xyflow/react` in v12 — always use the new name.

### Tailwind CSS v4 (CSS-first)
Arabic-first design requires RTL support throughout. Tailwind v4 has **built-in** `rtl:`/`ltr:` variants and logical properties — no external plugin needed. Config lives in `globals.css` via `@import "tailwindcss"` and `@theme {}` block; `tailwind.config.ts` is deleted.

### next-intl v4 routing split
Config is split into three files: `lib/i18n/routing.ts` (`defineRouting`), `lib/i18n/navigation.ts` (`createNavigation` exports), `lib/i18n/request.ts` (`getRequestConfig`). Old v3 `config.ts` pattern is gone.

### Zod v4 breaking changes
`z.string().uuid()`, `z.string().url()`, `z.string().email()` are **removed** — use top-level `z.uuid()`, `z.url()`, `z.email()` instead.

## Environment Variables

```bash
# Public (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private (server-only)
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
GOOGLE_CLOUD_VISION_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
