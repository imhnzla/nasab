---
name: tree-visualisation
description: Use for all genealogical tree rendering work — React Flow nodes/edges, D3.js layouts, zoom/pan, branch filtering, node detail panels, and PNG/image export. Invoke when working in components/tree/.
tools: Bash, Read, Edit, Write, Glob, Grep
---

# Tree Visualisation Agent

You are a specialist in interactive genealogical tree rendering for NASAB using @xyflow/react and D3.js.

## Package: @xyflow/react v12

**IMPORTANT**: The package was renamed from `reactflow` to `@xyflow/react` in v12. Always use the new name.

```ts
// CORRECT (v12+)
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  useStore,
} from '@xyflow/react'
import { getBezierPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/react'
import type {
  NodeProps,
  EdgeProps,
  NodeTypes,
  EdgeTypes,
  Connection,
  NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// WRONG (old v11)
import ReactFlow from 'reactflow' // ❌
import 'reactflow/dist/style.css' // ❌
```

## Architecture

### Page → Client wrapper pattern (Phase 1)

```
app/[locale]/(public)/tree/page.tsx          ← Server component (fetches persons from Supabase)
app/[locale]/(public)/tree/TreePageClient.tsx ← Client wrapper (ReactFlowProvider + all state)
```

**Always** keep the tree page split this way:

- `page.tsx`: `async` server component, fetches `persons` with `createClient()`, passes to client wrapper
- `TreePageClient.tsx`: `'use client'`, wraps everything in `<ReactFlowProvider>`, owns state

### Key Files (Premium 2D — `premium-2d` branch)

| File                                      | Responsibility                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `components/tree/TreeCanvas.tsx`          | ReactFlow wrapper: dark void theme, nodeTypes/edgeTypes, MiniMap with branch colours, dot-grid SVG overlay         |
| `components/tree/PersonNodeCard.tsx`      | LOD-aware person card — 4 zoom modes: dot / compact / full / inspect; LOD via `useStore(s=>s.transform[2])`        |
| `components/tree/WifeNodeCard.tsx`        | Lapis blue wife card — hidden below ZOOM_DOT, compact below ZOOM_COMPACT, full card with marriage date at full zoom |
| `components/tree/PremiumEdges.tsx`        | Four custom edge components: ParentChildEdge, FatherToWifeEdge, WifeToChildEdge, MarriageArcEdge                   |
| `components/tree/BranchFilter.tsx`        | Toggle buttons for Hasanid/Husaynid/Hashemite + All; inline `style` for dynamic branch colours                     |
| `components/tree/DetailPanel.tsx`         | Fixed right-side slide-in panel; uses `useLocale()` for bio language; parses `sources` jsonb                       |
| `components/tree/SearchOverlay.tsx`       | Cmd+K modal; debounced `trpc.search.fuzzy.useQuery`; `prepareForSearch()` for Arabic normalisation                 |
| `components/tree/ExportButton.tsx`        | `toPng(ref, { pixelRatio: 2, cacheBust: true })` from `html-to-image`; loading spinner state                       |
| `lib/workers/layout.worker.ts`            | Web Worker: Modified Reingold-Tilford; wife grouping; multi-root; lateral entry detection                          |
| `lib/tree/types.ts`                       | Shared types: all FlowNode types, FamilyEdge, Branch, BRANCH_COLOURS, WifeNodeData, LayoutNode                     |
| `lib/tree/constants2d.ts`                 | All design tokens: COLOUR palette, layout geometry, node sizes, LOD breakpoints, edge colours                      |

## Shared Types (lib/tree/types.ts)

```ts
import type { Node, Edge } from '@xyflow/react'
import type { Database } from '@/lib/supabase/types'

export type PersonRow = Database['public']['Tables']['persons']['Row']
export type MarriageRow = Database['public']['Tables']['marriages']['Row']
export type Branch = NonNullable<PersonRow['branch']>

// Premium 2D palette (matches constants2d.ts BRANCH_BORDER)
export const BRANCH_COLOURS: Record<Branch, string> = {
  hasanid: '#C9943A',    // gold
  husaynid: '#1A5C3A',   // emerald
  hashemite: '#8B4513',  // amber
}

export const NODE_WIDTH = 180
export const NODE_HEIGHT = 64

// --- Node data types ---
export type PersonNodeData  = { person: PersonRow; highlighted?: boolean; dimmed?: boolean; onToggleCollapse?: (id: string)=>void; collapsedCount?: number }
export type SpouseNodeData  = { person: PersonRow; marriageId: string; marriageDate: string|null; order: number }
export type WifeNodeData    = { person: PersonRow; marriageId: string; marriageDate: string|null; orderNum: number }
export type JunctionNodeData = { husbandId: string; wifeId: string; marriageId: string; onToggleCollapse?: (id: string)=>void; collapsedCount?: number }
export type BracketNodeData = { motherName_ar: string; motherName_en: string; motherBranch: Branch|null; spanPx: number }

// --- Flow node types ---
export type PersonFlowNode  = Node<PersonNodeData, 'person'>
export type WifeFlowNode    = Node<WifeNodeData, 'wife'>
export type AnyFlowNode     = PersonFlowNode | WifeFlowNode | ...

// LayoutNode has TWO definitions:
//   1. lib/tree/types.ts → typed union (for TypeScript consumers)
//   2. lib/workers/layout.worker.ts → data: Record<string,unknown> (for structured-clone safety)
// ALWAYS import LayoutNode from the WORKER file in TreePageClient to avoid type conflicts:
import type { LayoutNode } from '@/lib/workers/layout.worker'
```

**Always import from `@/lib/tree/types`** for component types. **Import `LayoutNode` from the worker** in `TreePageClient.tsx` — never from `types.ts` — to avoid the dual-definition type conflict.

## Design System (lib/tree/constants2d.ts)

```ts
// Theme: "Illuminated Manuscript" — parchment on near-black vellum
export const COLOUR = {
  void:        '#0D0B08',  // background
  parchment:   '#F5ECD7',  // card fill
  goldPrimary: '#C9943A',  // Hasanid, parent edges
  goldLight:   '#E8C46A',  // highlights
  emerald:     '#1A5C3A',  // Husaynid, daughter accent
  lapis:       '#1B3A6B',  // wife nodes, marriage arcs
  lapisLight:  '#2E5FA3',
  amber:       '#8B4513',  // Hashemite
  dust:        '#8B7355',  // secondary text
  ink:         '#1A0F00',  // primary text on parchment
  tradGreen:   '#15803D',  // Sunni tradition strip
  tradNavy:    '#1E3A5F',  // Shia tradition strip
}

// Layout geometry
LANE_HEIGHT     = 240   // px between generation rows
WIFE_ROW_OFFSET = 110   // px below father Y to place wife row
H_GAP           = 24    // horizontal gap between sibling subtrees
WIFE_H_GAP      = 12    // gap between wife cards in a row
GROUP_GAP       = 44    // gap between sibling groups from different mothers
ROOT_GAP        = 200   // gap between separate root subtrees (e.g. Prophet + Ali)

// Node sizes
NODE_W = 160, NODE_H = 96   // person card
WIFE_W = 120, WIFE_H = 70   // wife card

// LOD zoom breakpoints
ZOOM_DOT     = 0.35   // below: coloured dot
ZOOM_COMPACT = 0.65   // below: compact (Arabic name only)
ZOOM_FULL    = 1.5    // above: inspect mode (show dates)
```

## Layout Worker (lib/workers/layout.worker.ts)

**The worker cannot import from `lib/` — it inlines its own type definitions.**

### Lateral Entry Detection

```ts
// A "lateral entry" is a person who connects to the tree ONLY via marriage,
// not via patrilineal descent. Characteristics: generation === null AND
// no father_id that exists in the dataset.
// They render as WifeNodeCard beside their husband (not PersonNodeCard).
function isLateralEntry(p: PersonRow, personMap: Map<string, PersonRow>): boolean {
  if (p.generation !== null && p.generation !== undefined) return false
  if (p.father_id && personMap.has(p.father_id)) return false
  return true
}
```

### Algorithm: Modified Reingold-Tilford with Wife Grouping

```
Input: PersonRow[], MarriageRow[]

Step 1: Build maps
  - personMap: id → PersonRow
  - treePersons: filter out lateral entries
  - lateralMap: lateral entry persons only
  - childrenOf[fatherId] → childIds (tree persons only)
  - wivesOf[husbandId] → MarriageRow[] sorted by order_num

Step 2: Group children by mother
  - childrenByMother[personId][wifeId | null] → childIds
  - Pre-populate slots for known wives (order_num preserved)
  - Children with unknown mother → key null

Step 3: Find all patrilineal roots
  - Root = tree person with no father in dataset
  - Multiple roots (e.g. Prophet + Ali) → laid out side-by-side

Step 4: Compute subtree widths (bottom-up)
  - Leaf: max(NODE_W + H_GAP, wifeRowWidth + H_GAP)
  - Inner: sum of wife group widths + GROUP_GAP between groups + unknownChildren width

Step 5: Assign X/Y positions (top-down)
  - personX = centreX - NODE_W/2
  - personY = (generation - 1) * LANE_HEIGHT
  - Wife card: centred over her children group
  - wifeY = personY + WIFE_ROW_OFFSET
  - Multiple roots: side-by-side with ROOT_GAP

Step 6: Emit LayoutNodes
  - Person nodes (treePersons)
  - Wife nodes (lateral entries only, id = `wife-${marriage.id}`)

Step 7: Emit edges
  - fatherToWife: husband → wife node (lateral entries)
  - wifeToChild: wife node → each of her children
  - marriageArc: in-tree spouse → husband (tree persons who are also wives, e.g. Fatimah)
  - parentChild: father → child (for children NOT already wired via a wife node)
```

### Wire in TreePageClient

```ts
// ⚠ Import LayoutNode from WORKER, not from types.ts
import type { LayoutNode } from '@/lib/workers/layout.worker'

const worker = new Worker(
  new URL('/lib/workers/layout.worker.ts', import.meta.url),
  { type: 'module' }
)
worker.postMessage({ persons: filtered, marriages })  // pass both!
worker.onmessage = (e: MessageEvent<{ nodes: LayoutNode[]; edges: ... }>) => {
  setNodes(e.data.nodes as AnyFlowNode[])
  setEdges(e.data.edges)
}
```

## Node Design: Level-of-Detail (LOD)

Nodes are self-managing via `useStore` — no prop drilling needed.

```tsx
// PersonNodeCard — 4 zoom tiers
function PersonNodeCardInner({ data, selected }: NodeProps): React.ReactElement {
  const zoom = useStore((s) => s.transform[2])  // reactive zoom from React Flow store
  const { person, highlighted, dimmed, onToggleCollapse, collapsedCount } =
    data as unknown as PersonCardData  // bare NodeProps → cast internally

  // DOT mode (zoom < ZOOM_DOT = 0.35)
  if (zoom < ZOOM_DOT) return <div style={{ width:8, height:8, borderRadius:'50%', background:borderColor }} />

  // Prophet octagon (generation === 1 && !father_id STRICTLY — not generation === null)
  if (person.generation === 1 && !person.father_id) return <ProphetNode ... />

  // COMPACT mode (zoom < ZOOM_COMPACT = 0.65) — Arabic name only
  if (zoom < ZOOM_COMPACT) return <div ...>{person.name_ar}</div>

  // FULL mode + INSPECT (zoom >= ZOOM_FULL = 1.5 shows dates)
  const showDates = zoom >= ZOOM_FULL && (person.birth_date_hijri || person.death_date_hijri)
  return <div ...>
    {/* Arabic name, English name, generation badge G·n, verified ✦, tradition strip */}
    {/* Daughter left emerald accent if gender==='female' && father_id */}
    {/* Collapse button if collapsedCount or onToggleCollapse set */}
    {showDates && <p>{birth} – {death}</p>}
  </div>
}
export const PersonNodeCard = memo(PersonNodeCardInner)
```

```tsx
// WifeNodeCard — lapis blue
function WifeNodeCardInner({ data }: NodeProps): React.ReactElement | null {
  const zoom = useStore((s) => s.transform[2])
  const { person, marriageDate } = data as unknown as WifeCardData

  if (zoom < ZOOM_DOT) return null          // invisible at ultra-far zoom
  if (zoom < ZOOM_COMPACT) return <div style={{ background: COLOUR.lapis, height: WIFE_H * 0.55 }}>{person.name_ar}</div>
  return <div style={{ background: COLOUR.lapis, height: WIFE_H }}>
    {marriageDate && <p>م. {marriageDate}</p>}
    {person.name_ar}
    {person.name_en}
  </div>
}
export const WifeNodeCard = memo(WifeNodeCardInner)
```

**Critical rule**: Use bare `NodeProps` (no generic parameter), then cast internally:
```ts
// CORRECT
function MyNode({ data }: NodeProps) { const d = data as unknown as MyData }

// WRONG — TypeScript constraint violation in @xyflow/react v12
function MyNode({ data }: NodeProps<MyFlowNode>) { ... }
```

## Edge Types (PremiumEdges.tsx)

```ts
// Four edge types registered in TreeCanvas:
const edgeTypes: EdgeTypes = {
  parentChild:  ParentChildEdge,   // gold bezier, parent → child
  fatherToWife: FatherToWifeEdge,  // lapis dashed straight, father → wife card
  wifeToChild:  WifeToChildEdge,   // lapis-gold bezier, wife → child
  marriageArc:  MarriageArcEdge,   // lapis dashed bezier arc, in-tree spouse → husband
}
```

## TreeCanvas Configuration

```tsx
const nodeTypes: NodeTypes = {
  person: PersonNodeCard as NodeTypes[string],
  wife:   WifeNodeCard   as NodeTypes[string],
}
const edgeTypes: EdgeTypes = { parentChild, fatherToWife, wifeToChild, marriageArc }

<ReactFlow
  nodes={nodes} edges={edges}
  nodeTypes={nodeTypes} edgeTypes={edgeTypes}
  minZoom={0.05} maxZoom={3}
  defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
  nodesDraggable={false}
  nodesConnectable={false}
  elementsSelectable={true}
  style={{ background: COLOUR.void }}
>
  {/* SVG dot grid overlay */}
  {/* MiniMap with branch colours */}
</ReactFlow>
```

## Wife Visibility Filtering

When wife nodes are toggled off in the UI, filter both nodes AND edges:

```ts
// Keep smoothstep edges (radial D3 mode) OR parentChild edges (2D mode only)
const visibleEdges = showWives
  ? allEdges
  : allEdges.filter(e => e.type === 'smoothstep' || e.type === 'parentChild')
```

## Performance Rules

1. Render at most **500 visible nodes** at once — React Flow's built-in virtualisation handles this.
2. All layout calculations run in a **Web Worker** (not on the main thread).
3. Node re-renders must be wrapped in `React.memo`.
4. `nodeTypes` and `edgeTypes` objects must be **stable references** (outside the component) to avoid full re-renders.
5. Use `useNodesState`/`useEdgesState` and `useEffect` to sync from props.
6. `fitView` on layout change: use a 80ms `setTimeout` to let React Flow commit before fitting.

## RTL Handling

- Arabic names render `dir="rtl"` inside each node.
- Use `ms-`, `me-` (logical properties) not `ml-`, `mr-` in all tree components.
- The overall canvas layout stays top-down LTR.
- `DetailPanel` switches bio text direction via `useLocale()`.

## Export

```ts
import { toPng } from 'html-to-image'
const dataUrl = await toPng(containerRef.current, { pixelRatio: 2, cacheBust: true })
```

Install: `html-to-image` (already in package.json as of Phase 1).

## Branch: premium-2d

The current active development branch is `premium-2d` (created from `3D`, not `main`).
All 3D components (TreeCanvas3D, PersonNode3D, SpouseNode3D, etc.) have been deleted from this branch.
Do NOT re-introduce React Three Fiber / @react-three/drei / @react-three/fiber on this branch.
