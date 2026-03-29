# Build Plan

Eight sequential phases. Each phase is fully deployed to production before the next begins.

---

## Phase 0 — Foundation
**Goal:** Working deployment with empty tree.

### Tasks
- [ ] Register domain (nasab.org or nasab.app) — **manual: buy domain**
- [ ] Create Supabase project (production + local dev) — **manual: supabase.com**
- [ ] Create Vercel project and connect GitHub repo — **manual: vercel.com**
- [x] Scaffold Next.js 16 project with TypeScript, Tailwind CSS v4, shadcn/ui
- [x] Configure next-intl for Arabic (default) and English
- [x] Set up `app/[locale]/` routing structure
- [x] Write and apply initial database migrations (persons, users, audit_log)
- [x] Enable RLS on all tables with base policies
- [x] Configure Supabase Auth (email + Google) — callback route added; OAuth providers enabled in Supabase dashboard (manual)
- [x] Set up `middleware.ts` for i18n + auth session refresh
- [ ] Configure environment variables on Vercel — **manual: copy from `.env.local.example`**
- [ ] Deploy and verify blank homepage renders in Arabic and English — **manual: after Vercel deploy**
- [x] Seed database with Prophet Muhammad (pbuh) as root node — `supabase/seed.sql` ready

**Deliverable:** Live URL showing a blank bilingual homepage.

---

## Phase 1 — Tree MVP
**Goal:** Interactive tree visible to the public.

### Tasks
- [ ] Install and configure React Flow + D3.js
- [ ] Build `TreeCanvas` component with zoom/pan
- [ ] Build `PersonNode` custom node (Arabic/English name, branch colour, generation badge)
- [ ] Implement D3 hierarchical layout algorithm in a Web Worker
- [ ] Build `DetailPanel` (slide-in with full biography)
- [ ] Build `BranchFilter` sidebar
- [ ] Build `SearchOverlay` with Arabic diacritic-insensitive matching
- [ ] Add 20–50 historical seed nodes covering first 8 generations
- [ ] Mobile-responsive layout
- [ ] Basic SEO (metadata, OpenGraph images for key persons)

**Deliverable:** Public tree viewable at nasab.org/tree with real data.

---

## Phase 2 — Urdu PDF Digitisation
**Goal:** Import handwritten shajra documents into the tree.

### Tasks
- [ ] Set up Google Cloud Vision API credentials
- [ ] Build PDF → image pipeline (server-side, poppler)
- [ ] Build OCR extraction service (`lib/ocr/vision.ts`)
- [ ] Build Urdu name/relationship parser (`lib/ocr/parser.ts`)
- [ ] Create `ocr_jobs` table with migration
- [ ] Build admin OCR correction UI (`/admin/ocr/[job_id]`)
- [ ] Build bulk import from approved OCR job
- [ ] Test with sample Urdu shajra documents

**Deliverable:** Admin can upload a PDF and import names after review.

---

## Phase 3 — User Accounts
**Goal:** Users can register and manage profiles.

### Tasks
- [ ] Build registration and login pages (email + Google)
- [ ] Build user dashboard (`/dashboard`)
- [ ] Build profile settings page
- [ ] Build submission form (`/submit`) with file upload
- [ ] Create `submissions` table with migration and RLS
- [ ] Email notifications via Resend (submission received)
- [ ] Submission status tracking in dashboard

**Deliverable:** Users can register, log in, and submit lineage claims.

---

## Phase 4 — Verification System
**Goal:** Verifiers can review and approve submissions.

### Tasks
- [ ] Build verifier dashboard (`/admin/submissions`)
- [ ] Build submission detail + PDF review panel
- [ ] Implement status transition logic (pending → under_review → approved/rejected)
- [ ] Build evidence request workflow
- [ ] Auto-create `persons` record on approval
- [ ] Email notifications for all status changes
- [ ] Build role management UI (admin assigns verifiers)
- [ ] Audit log for all verification actions

**Deliverable:** End-to-end verified submission flow working.

---

## Phase 5 — Public API
**Goal:** External developers can query the tree.

### Tasks
- [ ] Build `/api/v1/` REST endpoints (persons, search, branches, tree)
- [ ] Implement Upstash rate limiting (100 req/min per IP)
- [ ] Write OpenAPI spec
- [ ] Build API documentation page
- [ ] API key system for higher rate limits

**Deliverable:** Documented public API live at nasab.org/api.

---

## Phase 6 — Institutional Partnerships
**Goal:** Verified organisations can contribute data.

### Tasks
- [ ] Institutional account type with verified badge
- [ ] Bulk import API for partner databases
- [ ] White-label tree embed (`<iframe>` + JS widget)
- [ ] Partnership application form

**Deliverable:** First institutional partner integrated.

---

## Phase 7 — Scale & Polish
**Goal:** Production-hardened, full-featured platform.

### Tasks
- [ ] Urdu language support
- [ ] Persian language support
- [ ] Academic citation export (BibTeX, Chicago)
- [ ] Advanced analytics dashboard
- [ ] Performance audit (Lighthouse 90+ on all pages)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security penetration test
- [ ] React Native mobile app

**Deliverable:** Platform ready for institutional and academic use.
