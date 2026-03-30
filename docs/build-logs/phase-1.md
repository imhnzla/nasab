# Build Log — Phase 1: Tree MVP

**Goal:** Interactive public tree with real historical data.

## Status: Complete

---

## Progress Entries

### 2026-03-29 — Phase 1 Scaffolded

**New files created:**

| File                                                           | Purpose                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/tree/types.ts`                                            | Shared TypeScript types: `PersonRow`, `PersonFlowNode`, `FamilyEdge`, `Branch`, `BRANCH_COLOURS`, `NODE_WIDTH/HEIGHT`, layout worker I/O types |
| `public/workers/layout.worker.ts`                              | Web Worker — receives `PersonRow[]`, returns `LayoutNode[]` + `LayoutEdge[]`; custom tidy-tree algorithm (no D3 in worker context)             |
| `supabase/migrations/20260329000002_phase1_search_indexes.sql` | `pg_trgm` extension + GIN trigram indexes on `name_ar`/`name_en`; B-tree indexes on `father_id`, `branch`, `generation`                        |
| `supabase/migrations/20260329000003_search_persons_rpc.sql`    | `search_persons` SQL function (`SECURITY DEFINER`) using `%` trigram operator + `similarity()` ordering                                        |
| `lib/trpc/client.ts`                                           | `createTRPCReact<AppRouter>()` browser client                                                                                                  |
| `lib/trpc/provider.tsx`                                        | `TRPCProvider` + `QueryClientProvider` wrapper                                                                                                 |

**Components implemented:**

| File                                            | Description                                                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/tree/TreeCanvas.tsx`                | `@xyflow/react` canvas; stable `nodeTypes`/`edgeTypes` refs outside component; syncs from props via `useEffect`                                    |
| `components/tree/PersonNode.tsx`                | `memo`-wrapped; branch colour border; generation badge; verified checkmark; Arabic `dir="rtl"`                                                     |
| `components/tree/EdgeRenderer.tsx`              | `memo`-wrapped; `getBezierPath` + `BaseEdge`; `EdgeLabelRenderer` included                                                                         |
| `components/tree/DetailPanel.tsx`               | Fixed right panel; `useLocale()` for bio language; `parseSources()` type guard; backdrop close                                                     |
| `components/tree/BranchFilter.tsx`              | All/branch toggles with `aria-pressed`; inline branch colour styles                                                                                |
| `components/tree/SearchOverlay.tsx`             | 300 ms debounce; `trpc.search.fuzzy.useQuery`; `prepareForSearch()` from `lib/i18n/arabic`                                                         |
| `components/tree/ExportButton.tsx`              | `toPng()` from `html-to-image`; `pixelRatio: 2`; loading spinner                                                                                   |
| `app/[locale]/(public)/tree/page.tsx`           | Server component; fetches verified persons from Supabase; passes to `TreePageClient`                                                               |
| `app/[locale]/(public)/tree/TreePageClient.tsx` | `ReactFlowProvider` outer + `TreePageClientInner`; layout worker via `useRef<Worker>`; Cmd/Ctrl+K search; branch filter; `setCenter` pan on select |

**tRPC routers updated:**

| Router                           | Procedures                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `server/trpc/routers/persons.ts` | `list` (paginated, branch/tradition filters), `byId`, `create` (Phase 4 stub) |
| `server/trpc/routers/search.ts`  | `fuzzy` — calls `search_persons` RPC; post-filters by `scholarly_tradition`   |

**i18n keys added (ar.json + en.json):**

- `tree.loading`, `tree.search_placeholder`, `tree.zoom_in`, `tree.zoom_out`, `tree.reset_view`, `tree.no_data`
- `search.placeholder`, `search.no_results`, `search.results_count`
- `person.branch.{hasanid,husaynid,hashemite}`, `person.no_bio`, `person.view_in_tree`

---

### 2026-03-29 — Seed Data Written & Applied

**`supabase/seed.sql` rewritten with 30 historical figures across 8 generations:**

| Gen | Count | Figures                                                                                                 |
| --- | ----- | ------------------------------------------------------------------------------------------------------- |
| 1   | 1     | Prophet Muhammad ibn Abdullah (pbuh)                                                                    |
| 2   | 2     | Fatimah al-Zahra, Ali ibn Abi Talib                                                                     |
| 3   | 2     | Al-Hasan ibn Ali (Hasanid root), Al-Husayn ibn Ali (Husaynid root)                                      |
| 4   | 4     | Hasan al-Muthanna, Zayd ibn al-Hasan, Amr ibn al-Hasan, Zayn al-Abidin                                  |
| 5   | 6     | Abdullah al-Kamil, Ibrahim ibn Hasan, Muhammad al-Baqir, Zayd ibn Ali, Umar al-Ashraf, Husayn al-Asghar |
| 6   | 6     | Nafs az-Zakiyya, Ibrahim ibn Abdullah, Idris I, Yahya ibn Abdullah, Jafar al-Sadiq, Yahya ibn Zayd      |
| 7   | 5     | Idris II, Musa al-Kazim, Ismail ibn Jafar, Muhammad al-Dibaj, Abdullah al-Aftah                         |
| 8   | 4     | Muhammad ibn Idris II, Ali al-Ridha, Ahmad ibn Musa (Shah Cheragh), Ibrahim ibn Musa                    |

Seed applied to production Supabase via dashboard (Docker unavailable in dev environment). UUIDs: sequential `00000000-0000-0000-0000-000000000001` through `...000000000030`.

---

### 2026-03-29 — Phase 1 Merged to Main

PR #4 merged: `claude/scaffold-phase-1-WXEe7` → `main`. All Phase 1 code, migrations, and seed data live in production branch.

---

### 2026-03-30 — Consistency Check

Ran `/consistency-check`. One [LOW] inconsistency found and fixed:

- **`docs/i18n.md` vs `layout.tsx` vs `i18n-rtl.md`**: `docs/i18n.md` had the future-proof dir check (`ar || ur || fa`); code and agent only checked `ar`. Fixed by updating `layout.tsx` and `.claude/agents/i18n-rtl.md` to match docs.

All other layers clean: versions consistent, all file paths valid, no deprecated API patterns, all agents/commands/hooks present, `ar.json`/`en.json` keys in parity.

---

## Checklist

- [x] React Flow + D3.js installed and configured
- [x] `TreeCanvas` component built
- [x] `PersonNode` custom node with branch colours and generation badge
- [x] Custom tidy-tree layout algorithm in Web Worker (no D3 in worker context)
- [x] `DetailPanel` slide-in with full biography
- [x] `BranchFilter` sidebar
- [x] `SearchOverlay` with Arabic fuzzy search (`pg_trgm`)
- [x] 30 historical seed nodes (first 8 generations)
- [ ] Mobile-responsive layout audit — deferred to Phase 7
- [x] Basic SEO (metadata, OpenGraph)
- [ ] Tree page verified live at nasab.org/tree — pending Vercel deploy confirmation

## Persons Added

All 30 persons added via `supabase/seed.sql`. See seed data table above.

## Decisions Log

| Date       | Decision                                   | Reason                                                                                                 |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 2026-03-29 | No D3 in layout worker                     | Web Workers cannot import from `lib/`; D3 not available; custom tidy-tree algorithm implemented inline |
| 2026-03-29 | Split `TreePageClient` into outer + inner  | `useReactFlow()` requires a `ReactFlowProvider` ancestor; split avoids circular dependency             |
| 2026-03-29 | `SECURITY DEFINER` SQL function for search | Supabase JS client cannot use `%` trigram operator directly; RPC call is the only way                  |
| 2026-03-29 | `father_id` for Hasan/Husayn → Fatimah     | Prophetic lineage passes through Fatimah per hadith; enables correct tree topology                     |

---

### 2026-03-30 — TypeScript Build Fix (TS2589 + TS2345)

`npm run build` was failing with two TypeScript errors originating from three structural defects in the hand-written `lib/supabase/types.ts`. All defects stem from the same root: the type file was not conformant with `supabase-js` v2.100+ and the tRPC v11 type machinery.

**Errors:**

| Error | Location | Message |
|-------|----------|---------|
| TS2589 | `components/tree/SearchOverlay.tsx:64` | Type instantiation is excessively deep and possibly infinite |
| TS2345 | `server/trpc/routers/search.ts:27` | Argument not assignable to parameter of type `undefined` |

**Root causes (three defects, one file):**

1. **`Json` was a recursive type alias** — `type Json = ... | Json[]`. TypeScript expands recursive type aliases eagerly. `PersonRow` has `sources: Json` and `titles: Json`. When `PersonRow[]` was the tRPC procedure return type, tRPC v11's conditional type chain (`inferProcedureOutput` → `DeepPartial` → `TRPCRequestOptions`) forced TypeScript to expand `Json` at every nesting level until it hit the instantiation depth limit → TS2589. **Fix:** replaced with lazy interfaces (`interface JsonObject`, `interface JsonArray extends Array<Json>`). Interface bodies are evaluated lazily, breaking the expansion chain.

2. **`Relationships` was missing from every table** — `supabase-js` v2.100+ defines `GenericTable = { Row; Insert; Update; Relationships: GenericRelationship[] }`. Without it, each table didn't satisfy `GenericTable` → `Database['public']` didn't satisfy `GenericSchema` → `Schema = never` inside `SupabaseClient` generics → `Schema['Functions']['search_persons']['Args'] = never` → `rpc(fn, args?)` typed as `rpc(fn, undefined)` → TS2345. **Fix:** added `Relationships` tuple to all four tables.

3. **`Views` key was absent** — `GenericSchema` requires `{ Tables, Views, Functions }`. Missing `Views` triggered the same `Schema = never` cascade. **Fix:** added `Views: {}`.

**Additional architectural change — `SearchHit` lean return type:**

Even with the above fixes, returning `PersonRow[]` from the tRPC search procedure would leave the system one schema change away from regressing. `PersonRow` contains `sources: Json` and `titles: Json` which are never used by `SearchOverlay`. The procedure now returns `SearchHit[]` — a flat 7-field type with no `Json` columns. `TreePageClient.handleSearchSelect` receives `SearchHit`, resolves the full `PersonRow` from the local `persons` prop by `id`, and passes it to `setSelectedPerson` so `DetailPanel` still receives the complete row.

**`rpcArgs` pre-typing in `search.ts`:**

`supabase-js` v2.100+'s `rpc()` overload evaluates `GetRpcFunctionFilterBuilderByArgs` (a three-layer conditional type chain) as a constraint for `FilterBuilder` during inference. Under this, TypeScript can give up inferring `Args` mid-chain and default to `never`. Pre-typing the args object as `Database['public']['Functions']['search_persons']['Args']` makes the type explicit at the call site, bypassing inference entirely.

**Files changed:**

| File | Change |
|------|--------|
| `lib/supabase/types.ts` | `Json` → lazy interfaces; `PersonsRow` lifted out of `Database`; `Relationships` added to all 4 tables; `Views: {}` added; `Functions['search_persons']['Returns']` uses `unknown` for `sources`/`titles` |
| `lib/tree/types.ts` | `SearchHit` type exported (7 flat primitive fields, no `Json`) |
| `server/trpc/routers/search.ts` | Return type `PersonRow[]` → `SearchHit[]`; `rpcArgs` pre-typed; rows mapped to `SearchHit` before return |
| `components/tree/SearchOverlay.tsx` | `PersonRow` → `SearchHit` throughout; `onSelect` prop type updated |
| `app/[locale]/(public)/tree/TreePageClient.tsx` | `SearchHit` imported; `handleSearchSelect` resolves full `PersonRow` from `persons` prop via `hit.id` |

**Result:** `npx tsc --noEmit` → 0 errors. `npm run build` → clean, all 24 routes built.
