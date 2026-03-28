# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NASAB** (نسب) is a non-profit web platform for preserving, verifying, and visualizing the lineage of Prophet Muhammad (peace be upon him). It connects living descendants worldwide with scholarly rigor and full bilingual (Arabic/English) support.

See `NASAB_Architecture.pdf` for the full product and technical specification.

## Development Commands

Once the project is scaffolded (Phase 0), standard commands will be:

```bash
npm run dev       # Next.js development server
npm run build     # Production build
npm run lint      # ESLint
npm test          # Test suite
npx supabase db push   # Apply database migrations
npx supabase db reset  # Reset local database with seed data
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Tree Visualization | React Flow + D3.js |
| Styling | Tailwind CSS + shadcn/ui (with RTL plugin) |
| i18n | next-intl |
| Backend | Next.js API Routes + tRPC |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Email | Resend |
| OCR | Google Cloud Vision API (for Urdu PDF digitisation) |
| Deployment | Vercel |

## Architecture

### Folder Structure (planned)
```
app/[locale]/          # i18n routing via next-intl
components/
  tree/                # React Flow tree visualization
  ui/                  # shadcn/ui components
  forms/               # Submission and auth forms
lib/
  supabase/            # Supabase client + server helpers
  i18n/                # Translation files and config
supabase/
  migrations/          # SQL migration files
  seed.sql             # Seed data (historical tree nodes)
```

### Database Schema (4 core tables)
- **persons** — Tree nodes: Arabic/English names, father FK, branch (`hasanid`/`husaynid`/`hashemite`), scholarly tradition (`sunni`/`shia`/`both`), generation number, dates, biography, sources
- **submissions** — User lineage claims with proof documents and status (`pending`/`under_review`/`approved`/`rejected`)
- **users** — Extended profiles with roles: `user`, `verifier`, `admin`, `superadmin`
- **audit_log** — Immutable change history for all tree modifications

### Key Architectural Decisions
- Arabic names are the canonical source of truth; English is transliteration
- Where Sunni/Shia traditions differ on a lineage, both are shown side-by-side with sources
- Public API is read-only; write access requires authentication
- Rate limiting: 100 req/min per IP on all API routes
- No separate backend server — Next.js API routes handle everything

### Verification Workflow
User submits lineage claim with proof docs → assigned verifier reviews → accepted proof types: physical shajra PDFs, official certificates, scholar attestations → approved submissions become verified tree nodes.

## Build Phases
The project follows 8 phases defined in the architecture doc:
- **Phase 0**: Foundation — Supabase, Next.js, i18n, Vercel setup
- **Phase 1**: Tree MVP — interactive visualization
- **Phase 2**: Urdu PDF Import — OCR digitisation pipeline
- **Phase 3**: User Accounts
- **Phase 4**: Verification System
- **Phase 5**: Public API
- **Phase 6**: Institutional Partnerships
- **Phase 7**: Scale & Polish

## i18n & RTL
- Default locale: Arabic (`ar`, RTL)
- Secondary locale: English (`en`, LTR)
- All routes are prefixed: `app/[locale]/`
- Tailwind RTL plugin handles layout mirroring
- Hijri and Gregorian dates shown together for historical figures

## Brand Colors
- Navy `#0D1B2A`, Gold `#C9A84C`, Cream `#F5ECD7`, Deep Green `#1B5E20`
