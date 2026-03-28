# Technology Stack

## Overview

NASAB is built on a modern full-stack JavaScript/TypeScript architecture with a managed Postgres backend. There is no separate backend server — Next.js handles both frontend and API.

## Stack Table

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js (App Router) | 14+ | Vercel-native, i18n routing, RSC |
| Language | TypeScript | 5+ | Strict mode end-to-end type safety |
| Tree Visualisation | React Flow | 11+ | Production-grade graph rendering |
| Layout Algorithm | D3.js | 7+ | `d3.hierarchy()` for tree layout |
| Styling | Tailwind CSS | 3+ | RTL plugin, utility-first |
| Component Library | shadcn/ui | latest | Accessible, unstyled, customisable |
| i18n | next-intl | 3+ | App Router support, ICU messages |
| Backend API | tRPC | 11+ | Type-safe API, no code generation |
| Input Validation | Zod | 3+ | Runtime + compile-time validation |
| Database | Supabase (PostgreSQL) | 15+ | Managed Postgres, RLS, realtime |
| Authentication | Supabase Auth | — | Email + social, JWT, SSR cookies |
| File Storage | Supabase Storage | — | Private buckets, signed URLs |
| Email | Resend | — | Transactional, Arabic email support |
| OCR | Google Cloud Vision | — | Nastaliq Urdu handwriting recognition |
| Deployment | Vercel | — | Zero-config Next.js, global CDN |
| Analytics | Vercel Analytics + Plausible | — | Privacy-respecting, no cookies |
| Image Export | html-to-image | — | Client-side PNG of tree canvas |
| Rate Limiting | @upstash/ratelimit | — | Edge-compatible, Vercel-native |

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

### React Flow over custom SVG
Handles 1000+ nodes with built-in zoom/pan, minimap, and custom node/edge rendering. Eliminates significant custom engineering effort.

### Tailwind CSS with RTL plugin
Arabic-first design requires RTL support throughout. Tailwind's `rtl:` and `ltr:` variants plus `tailwindcss-rtl` plugin handle this elegantly.

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
