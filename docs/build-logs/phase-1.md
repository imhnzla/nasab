# Build Log — Phase 1: Tree MVP

**Goal:** Interactive public tree with real historical data.

## Status: Scaffolded

---

## Progress Entries

### 2026-03-29 — Phase 1 Scaffolded

**New files created:**

| File                                                           | Purpose                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/tree/types.ts`                                            | Shared TypeScript types: `PersonRow`, `PersonFlowNode`, `FamilyEdge`, `Branch`, `BRANCH_COLOURS`, `NODE_WIDTH/HEIGHT`, layout worker I/O types |
| `public/workers/layout.worker.ts`                              | Web Worker stub — receives `PersonRow[]`, returns `LayoutNode[]` + `LayoutEdge[]`; TODO: D3 stratify + tree()                                  |
| `supabase/migrations/20260329000002_phase1_search_indexes.sql` | `pg_trgm` extension + GIN trigram indexes on `name_ar`/`name_en`; B-tree indexes on `father_id`, `branch`, `generation`                        |

**Updated stubs (correct TypeScript signatures added):**

| File                                         | Changes                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `components/tree/TreeCanvas.tsx`             | `TreeCanvasProps` type: nodes, edges, onNodeClick |
| `components/tree/PersonNode.tsx`             | `NodeProps<PersonFlowNode>` from @xyflow/react    |
| `components/tree/DetailPanel.tsx`            | `DetailPanelProps`: person, onClose               |
| `components/tree/BranchFilter.tsx`           | `BranchFilterProps`: activeBranches, onChange     |
| `components/tree/SearchOverlay.tsx`          | `SearchOverlayProps`: isOpen, onSelect, onClose   |
| `components/tree/EdgeRenderer.tsx`           | `EdgeProps` from @xyflow/react                    |
| `components/tree/ExportButton.tsx`           | `ExportButtonProps`: treeContainerRef, filename   |
| `app/[locale]/(public)/tree/page.tsx`        | `metadata` export with OG tags                    |
| `app/[locale]/(public)/search/page.tsx`      | `metadata` export                                 |
| `app/[locale]/(public)/person/[id]/page.tsx` | `generateMetadata` async function                 |

**i18n keys added (ar.json + en.json):**

- `tree.loading`, `tree.search_placeholder`, `tree.zoom_in`, `tree.zoom_out`, `tree.reset_view`, `tree.no_data`
- `search.placeholder`, `search.no_results`, `search.results_count`
- `person.branch.{hasanid,husaynid,hashemite}`, `person.no_bio`, `person.view_in_tree`

**Build note:** `node_modules` not installed in scaffold environment; `tsc --noEmit` raises only the pre-existing `@types/node` resolution error (unrelated to Phase 1 changes). Stubs are type-correct.

---

### 2026-03-29 — Seed Data Written

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

**Note:** Docker not available in current environment. Run `npx supabase db reset` locally to apply.

---

## Checklist

- [x] React Flow + D3.js installed and configured (already in package.json from Phase 0)
- [ ] `TreeCanvas` component built
- [ ] `PersonNode` custom node with branch colours and generation badge
- [ ] D3 hierarchical layout in Web Worker
- [ ] `DetailPanel` slide-in with full biography
- [ ] `BranchFilter` sidebar
- [ ] `SearchOverlay` with Arabic fuzzy search
- [ ] 20–50 historical seed nodes (first 8 generations)
- [ ] Mobile-responsive layout
- [ ] Basic SEO (metadata, OpenGraph)
- [ ] Tree page live at nasab.org/tree

## Persons Added

| Name (Arabic) | Name (English) | Generation | Branch | Added On |
| ------------- | -------------- | ---------- | ------ | -------- |
|               |                |            |        |          |

## Decisions Log

| Date | Decision | Reason |
| ---- | -------- | ------ |
|      |          |        |
