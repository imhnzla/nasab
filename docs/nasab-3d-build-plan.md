# NASAB — 3D Tree Enhancement Build Plan
### Features 1–5: Marriage, Spouses, 3D View, Female Members, Collapse/Expand

**Scope:** This document covers the exact implementation sequence for the five next features.
Everything is grounded in the existing codebase — file paths, type names, migration numbering,
and library versions are all taken from the live source.

---

## Pre-read: What Already Exists

Before building, know what you're extending:

| File | What it does |
|------|-------------|
| `lib/tree/types.ts` | `PersonRow`, `PersonFlowNode`, `FamilyEdge`, `BRANCH_COLOURS`, `NODE_WIDTH/HEIGHT` |
| `lib/workers/layout.worker.ts` | Pure JS tidy-tree layout — no D3 in worker, custom BFS/DFS |
| `components/tree/TreeCanvas.tsx` | `@xyflow/react` wrapper — zoom/pan, minimap, background |
| `components/tree/PersonNode.tsx` | Custom node: Arabic name, English name, branch border, generation badge |
| `components/tree/EdgeRenderer.tsx` | Bezier edge with arrow marker |
| `components/tree/DetailPanel.tsx` | Slide-in panel — bio, dates, sources, badges |
| `components/tree/BranchFilter.tsx` | Toggle sidebar for Hasanid / Husaynid / Hashemite |
| `app/[locale]/(public)/tree/TreePageClient.tsx` | Orchestrator — layout worker, filter state, panel, search |
| `server/trpc/routers/persons.ts` | `persons.list`, `persons.byId`, `persons.create` (create = TODO Phase 4) |
| `supabase/migrations/` | 4 migrations exist, numbered `20260329000000` to `20260329000003` |
| `supabase/seed.sql` | 30 persons, generations 1–8, patrilineal only, no marriages |
| `lib/supabase/types.ts` | Hand-managed types file — **regenerate after every migration** |

**Current limitations being fixed:**
- No `marriages` table — no way to represent any spouse relationship
- No `gender` column — all nodes implicitly male
- No `mother_id` — children cannot be grouped by mother
- Layout worker produces flat 2D XY positions — purely top-down tree
- `PersonNode` is always a rectangle — no visual distinction for female nodes
- No collapse/expand state — entire tree always renders

---

## Feature 1 — Marriage & Spouse Nodes

### What we're building

A `marriages` table, a `spouse` node type (oval, lighter fill), and a `marriage` edge type
(horizontal double-line). Each marriage links one husband to one wife. Multiple marriages per
person are supported from day one. The `DetailPanel` gains a "Marriages" section.

### 1.1 Database migration

Create file `supabase/migrations/20260401000000_marriages.sql`:

```sql
-- Feature 1: marriages table + persons gender + mother_id
-- Run: npx supabase db push

CREATE TABLE marriages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  husband_id       uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  wife_id          uuid NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  date_hijri       text,
  date_gregorian   date,
  order_num        integer NOT NULL DEFAULT 1,
  is_verified      boolean NOT NULL DEFAULT false,
  notes_ar         text,
  notes_en         text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marriages_unique_pair UNIQUE (husband_id, wife_id)
);

CREATE INDEX marriages_husband_id_idx ON marriages(husband_id);
CREATE INDEX marriages_wife_id_idx    ON marriages(wife_id);

CREATE TRIGGER marriages_updated_at
  BEFORE UPDATE ON marriages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE marriages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marriages_public_read" ON marriages
  FOR SELECT USING (true);

CREATE POLICY "marriages_admin_insert" ON marriages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
  );

CREATE POLICY "marriages_admin_update" ON marriages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin','superadmin'))
  );

-- Add gender and mother linkage to persons
ALTER TABLE persons
  ADD COLUMN gender      text NOT NULL DEFAULT 'male'
    CHECK (gender IN ('male', 'female', 'unknown')),
  ADD COLUMN mother_id   uuid REFERENCES persons(id) ON DELETE SET NULL,
  ADD COLUMN marriage_id uuid REFERENCES marriages(id) ON DELETE SET NULL,
  ADD COLUMN photo_url   text;

CREATE INDEX persons_gender_idx    ON persons(gender);
CREATE INDEX persons_mother_id_idx ON persons(mother_id);
```

After running: `npx supabase gen types typescript --local > lib/supabase/types.ts`
Then manually add `MarriageRow` to `lib/supabase/types.ts` following the existing `PersonsRow` pattern.

### 1.2 TypeScript types

Add to `lib/tree/types.ts`:

```typescript
// Marriage row (mirrors DB)
export type MarriageRow = {
  id: string
  husband_id: string
  wife_id: string
  date_hijri: string | null
  date_gregorian: string | null
  order_num: number
  is_verified: boolean
  notes_ar: string | null
  notes_en: string | null
  created_at: string
  updated_at: string
}

// Extended node data types
export type SpouseNodeData = {
  person: PersonRow
  marriageId: string
  marriageDate: string | null
  order: number
}

export type JunctionNodeData = {
  husbandId: string
  wifeId: string
  marriageId: string
}

export type BracketNodeData = {
  motherName_ar: string
  motherName_en: string
  motherBranch: Branch | null
  spanPx: number
}

export type SpouseFlowNode   = Node<SpouseNodeData,   'spouse'>
export type JunctionFlowNode = Node<JunctionNodeData, 'junction'>
export type BracketFlowNode  = Node<BracketNodeData,  'bracket'>

export type AnyFlowNode = PersonFlowNode | SpouseFlowNode | JunctionFlowNode | BracketFlowNode

// Extended PersonNodeData (update existing type)
export type PersonNodeData = {
  person: PersonRow
  motherBranch?: Branch | null        // dual-border: outer = mother's branch
  collapsedCount?: number             // undefined = not collapsed or no children
  onToggleCollapse?: (id: string) => void
}

// New edge subtypes
export type MarriageEdgeData    = { marriageId: string; order: number }
export type ChildEdgeData       = { marriageId: string | null }
```

### 1.3 tRPC router — marriages

Create `server/trpc/routers/marriages.ts`:

```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { t } from '../init'
import { adminProcedure } from '../middleware'
import type { Database } from '@/lib/supabase/types'

type MarriageRow = Database['public']['Tables']['marriages']['Row']

export const marriagesRouter = t.router({
  byPerson: t.procedure
    .input(z.object({ personId: z.uuid() }))
    .query(async ({ ctx, input }): Promise<MarriageRow[]> => {
      const { data, error } = await ctx.supabase
        .from('marriages')
        .select('*')
        .or(`husband_id.eq.${input.personId},wife_id.eq.${input.personId}`)
        .order('order_num', { ascending: true })
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  listAll: t.procedure
    .query(async ({ ctx }): Promise<MarriageRow[]> => {
      const { data, error } = await ctx.supabase
        .from('marriages')
        .select('*')
        .order('husband_id')
        .order('order_num')
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  create: adminProcedure
    .input(z.object({
      husband_id:     z.uuid(),
      wife_id:        z.uuid(),
      date_hijri:     z.string().optional(),
      date_gregorian: z.string().optional(),
      order_num:      z.number().int().min(1).default(1),
      notes_ar:       z.string().optional(),
      notes_en:       z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('marriages')
        .insert(input)
        .select()
        .single()
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),
})
```

Register in `server/trpc/root.ts`:
```typescript
import { marriagesRouter } from './routers/marriages'
// add to appRouter:
marriages: marriagesRouter,
```

### 1.4 Layout worker — spouse and junction position pass

The layout worker (`lib/workers/layout.worker.ts`) currently receives only `persons[]`.
Extend `LayoutWorkerInput`:

```typescript
export type LayoutWorkerInput = {
  persons:   PersonRow[]
  marriages: MarriageRow[]
}
```

After the existing `placeNode()` call produces XY positions for all persons, add a second pass:

**Spouse placement:**
Group marriages by `husband_id`. For each husband with N marriages, sort by `order_num`.
Place Wife N at:
```
x = husband.x + NODE_WIDTH + 80
y = husband.y + (order_num - 1) * (NODE_HEIGHT + 28)
```

This stacks wives vertically to the right. The husband's subtree width must be expanded
to accommodate the spouse column — add a `spouseColumnWidth` constant of `NODE_WIDTH + 100`
to any node that has at least one marriage.

**Junction placement:**
For each marriage, the junction node sits between husband and wife:
```
x = (husband.x + wife.x) / 2
y = husband.y + NODE_HEIGHT + 32
```

**Bracket placement:**
For each wife, find all children where `mother_id = wife.id AND father_id = husband.id`.
If there are any, create a bracket node at:
```
x = midpoint of leftmost and rightmost child
y = children.y - 28
spanPx = (rightmost child.x + NODE_WIDTH) - leftmost child.x
```

**Cross-branch marriages:**
Detect when `husband.branch !== wife_person.branch`. For these, emit a `crossMarriage` edge
instead of a `marriage` edge. The edge data includes both source and target positions so the
`CrossMarriageEdge` renderer knows where to float the arc.

**Edge emission:**
```typescript
// For each marriage:
emit({ id, source: husbandId, target: junctionId, type: 'marriage', data: { side: 'husband' } })
emit({ id, source: wifeId,    target: junctionId, type: 'marriage', data: { side: 'wife'    } })

// For each child of the marriage:
emit({ id, source: junctionId, target: childId, type: 'parentChild', data: { marriageId } })

// For cross-branch:
emit({ id, source: husbandId, target: wifeOriginalNodeId, type: 'crossMarriage', data: { ... } })
```

### 1.5 New components

**`components/tree/SpouseNode.tsx`**

Oval shape, female symbol, marriage date label floating above:

```typescript
'use client'
import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { SpouseFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function SpouseNodeInner({ data }: NodeProps<SpouseFlowNode>): React.ReactElement {
  const { person, marriageDate } = data
  const colour = person.branch ? BRANCH_COLOURS[person.branch] : '#D4537E'

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div style={{
        width: 160, height: 52, borderRadius: '50%',
        border: `2px solid ${colour}`,
        background: `${colour}18`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {marriageDate && (
          <span style={{
            position: 'absolute', top: -18,
            fontSize: 10, color: colour, whiteSpace: 'nowrap',
          }}>
            م. {marriageDate}
          </span>
        )}
        <p dir="rtl" style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#111827' }}>
          {person.name_ar}
        </p>
        <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{person.name_en}</p>
        {/* Female symbol */}
        <svg width="10" height="12" style={{ position: 'absolute', bottom: 4, right: 8 }}>
          <circle cx="5" cy="4" r="3.5" fill="none" stroke={colour} strokeWidth="1.2" />
          <line x1="5" y1="7.5" x2="5" y2="11" stroke={colour} strokeWidth="1.2" />
          <line x1="3" y1="9.5" x2="7" y2="9.5" stroke={colour} strokeWidth="1.2" />
        </svg>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
export const SpouseNode = memo(SpouseNodeInner)
```

**`components/tree/JunctionNode.tsx`**

Zero-size invisible node — just a dot for visual debugging, hidden in production:

```typescript
'use client'
import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

function JunctionNodeInner(): React.ReactElement {
  return (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4537E' }}>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}
export const JunctionNode = memo(JunctionNodeInner)
```

**`components/tree/BracketNode.tsx`**

SVG bracket rendered as a node with zero height and a colored horizontal line + label:

```typescript
'use client'
import React, { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { BracketFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function BracketNodeInner({ data }: NodeProps<BracketFlowNode>): React.ReactElement {
  const colour = data.motherBranch ? BRANCH_COLOURS[data.motherBranch] : '#D4537E'
  return (
    <div style={{ position: 'relative', width: data.spanPx, height: 20 }}>
      <svg width={data.spanPx} height={20} style={{ position: 'absolute', top: 0, left: 0 }}>
        <line x1={0} y1={16} x2={data.spanPx} y2={16} stroke={colour} strokeWidth={1} />
        <line x1={0}           y1={10} x2={0}           y2={16} stroke={colour} strokeWidth={1} />
        <line x1={data.spanPx} y1={10} x2={data.spanPx} y2={16} stroke={colour} strokeWidth={1} />
        <text x={data.spanPx / 2} y={10} textAnchor="middle"
              style={{ fontSize: 10, fill: colour, fontFamily: 'inherit' }}>
          {data.motherName_ar}
        </text>
      </svg>
    </div>
  )
}
export const BracketNode = memo(BracketNodeInner)
```

**`components/tree/MarriageEdge.tsx`**

Two parallel horizontal lines (double-line marriage symbol), dashed, in `#D4537E`:

```typescript
'use client'
import React, { memo } from 'react'
import { BaseEdge, getStraightPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

function MarriageEdgeInner(props: EdgeProps): React.ReactElement | null {
  const { sourceX, sourceY, targetX, targetY } = props
  const [path] = getStraightPath({ sourceX, sourceY: sourceY - 2, targetX, targetY: targetY - 2 })
  const [path2] = getStraightPath({ sourceX, sourceY: sourceY + 2, targetX, targetY: targetY + 2 })
  return (
    <>
      <path d={path}  fill="none" stroke="#D4537E" strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={path2} fill="none" stroke="#D4537E" strokeWidth={1.5} strokeDasharray="5 3" />
    </>
  )
}
export const MarriageEdge = memo(MarriageEdgeInner)
```

**`components/tree/CrossMarriageEdge.tsx`**

Floating bezier arc that rises 80px above both source and target Y. Two interlocked ring SVGs
at the midpoint mark the marriage:

```typescript
'use client'
import React, { memo } from 'react'
import { EdgeLabelRenderer } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

function CrossMarriageEdgeInner({
  sourceX, sourceY, targetX, targetY, data
}: EdgeProps): React.ReactElement | null {
  const midX = (sourceX + targetX) / 2
  const peakY = Math.min(sourceY, targetY) - 80
  const d = `M ${sourceX} ${sourceY} Q ${midX} ${peakY} ${targetX} ${targetY}`

  return (
    <>
      <path d={d} fill="none" stroke="#D4537E" strokeWidth={2} strokeDasharray="6 3" />
      {/* Interlocked rings at the arc peak */}
      <EdgeLabelRenderer>
        <div style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${midX}px, ${peakY + 10}px)`,
          pointerEvents: 'none',
        }}>
          <svg width={24} height={14}>
            <circle cx={6}  cy={7} r={5} fill="none" stroke="#D4537E" strokeWidth={1.5} />
            <circle cx={14} cy={7} r={5} fill="none" stroke="#D4537E" strokeWidth={1.5} />
          </svg>
          {data?.marriageDate && (
            <span style={{ fontSize: 10, color: '#D4537E', whiteSpace: 'nowrap', display: 'block', textAlign: 'center' }}>
              {data.marriageDate}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
export const CrossMarriageEdge = memo(CrossMarriageEdgeInner)
```

### 1.6 Register new types in TreeCanvas

```typescript
// TreeCanvas.tsx
import { SpouseNode }        from './SpouseNode'
import { JunctionNode }      from './JunctionNode'
import { BracketNode }       from './BracketNode'
import { MarriageEdge }      from './MarriageEdge'
import { CrossMarriageEdge } from './CrossMarriageEdge'

const nodeTypes: NodeTypes = {
  person:   PersonNode,
  spouse:   SpouseNode,
  junction: JunctionNode,
  bracket:  BracketNode,
}

const edgeTypes: EdgeTypes = {
  smoothstep:    EdgeRenderer,
  marriage:      MarriageEdge,
  crossMarriage: CrossMarriageEdge,
}
```

### 1.7 DetailPanel — marriages section

Add below the biography block. For each marriage, render:
- Wife's name (Arabic + English)
- Marriage date (Hijri primary, Gregorian in parentheses)
- Count of children from that union
- "Fly to" button that calls `setCenter()` on the wife's spouse node

### 1.8 Data fetch changes

In `app/[locale]/(public)/tree/page.tsx` (server component):

```typescript
const [personsResult, marriagesResult] = await Promise.all([
  supabase.from('persons').select('*').eq('is_verified', true),
  supabase.from('marriages').select('*').order('husband_id').order('order_num'),
])
// Pass both to:
<TreePageClient persons={persons} marriages={marriages} />
```

In `TreePageClient`, pass `marriages` to the layout worker:
```typescript
worker.postMessage({ persons: filtered, marriages })
```

### 1.9 Seed data additions

Append to `supabase/seed.sql`:

```sql
-- Fatima bint al-Husayn (daughter of al-Husayn, historically documented)
INSERT INTO persons (id, name_ar, name_en, father_id, gender, branch,
  scholarly_tradition, generation, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000031',
  'فاطمة بنت الحسين', 'Fatima bint al-Husayn',
  '00000000-0000-0000-0000-000000000005',
  'female', 'husaynid', 'both', 4, true
) ON CONFLICT (id) DO NOTHING;

-- Cross-branch marriage: al-Hasan al-Muthanna ↔ Fatima bint al-Husayn
INSERT INTO marriages (id, husband_id, wife_id, date_hijri, order_num, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000006',  -- al-Hasan al-Muthanna (Hasanid)
  '00000000-0000-0000-0000-000000000031',  -- Fatima bint al-Husayn (Husaynid)
  'c. 61 AH', 1, true
) ON CONFLICT DO NOTHING;

-- Link known children to their mother
UPDATE persons
SET mother_id   = '00000000-0000-0000-0000-000000000031',
    marriage_id = '00000000-0000-0000-0000-000000000101'
WHERE id IN (
  '00000000-0000-0000-0000-000000000010',  -- Abdullah al-Kamil
  '00000000-0000-0000-0000-000000000011'   -- Ibrahim ibn al-Hasan al-Muthanna
);

-- Update Fatima al-Zahra gender
UPDATE persons SET gender = 'female'
WHERE id = '00000000-0000-0000-0000-000000000002';
```

---

## Feature 2 — Multiple Wives & Children Grouped by Mother

### What we're building

Visual stacking of multiple wives, bracket labels above each wife's children group,
dual-border child nodes, and a "Show wives" toggle in the filter sidebar.

### 2.1 Layout worker — multi-wife stacking

When a husband has N wives (sorted by `order_num`):

```
Wife 1: x = husband.x + NODE_WIDTH + 80,  y = husband.y
Wife 2: x = husband.x + NODE_WIDTH + 80,  y = husband.y + (NODE_HEIGHT + 28)
Wife N: x = husband.x + NODE_WIDTH + 80,  y = husband.y + (N-1) * (NODE_HEIGHT + 28)
```

Junction for Wife N:
```
x = (husband.x + wife_N.x) / 2
y = wife_N.y + NODE_HEIGHT + 32
```

The subtree width of the husband must include the spouse column:
```
subtreeWidth += NODE_WIDTH + 100  // for any node with marriages
```

This ensures sibling subtrees don't overlap when one sibling has many wives.

Bracket node for Wife N (only when she has documented children):
```
x = midpoint of her children group
y = children[N].y - 30
spanPx = rightmost child x + NODE_WIDTH - leftmost child x
```

### 2.2 Dual-border child nodes

The layout worker tags each child's `PersonNodeData` with `motherBranch`:

```typescript
// In layout worker output
{
  id: child.id,
  type: 'person',
  position: { x, y },
  data: {
    person: child,
    motherBranch: mother?.branch ?? null,  // from marriages + persons lookup
  }
}
```

In `PersonNode.tsx`, render an inner rect when `motherBranch` is set:

```tsx
{data.motherBranch && (
  <div style={{
    position: 'absolute',
    inset: 3,
    borderRadius: 4,
    border: `1.5px solid ${BRANCH_COLOURS[data.motherBranch]}`,
    pointerEvents: 'none',
  }} />
)}
```

The outer border = father's branch. The inner border = mother's branch. At a glance
you can see both bloodlines.

### 2.3 "Show wives" toggle

Add to `BranchFilter.tsx`:

```tsx
<div style={{ borderTop: '1px solid #E5E7EB', marginTop: 12, paddingTop: 12 }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={showWives}
      onChange={e => onShowWivesChange(e.target.checked)}
    />
    Show wives
  </label>
</div>
```

In `TreePageClient`, when `showWives = false`, filter all spouse/junction/bracket nodes
from the nodes array before passing to `TreeCanvas`.

---

## Feature 3 — 3D Layered View

### What we're building

A React Three Fiber scene where each generation is a flat translucent plane, nodes float
on plane surfaces, parent-child drops are dashed lines between planes, and marriage arcs
float above planes. The user orbits and scrolls through centuries. Detail panel stays as HTML.

### 3.1 Install dependencies

```bash
npm install @react-three/fiber @react-three/drei three
npm install -D @types/three
```

These are compatible with React 19 and Next.js 16. Three.js r158+ supports React 19's
concurrent renderer. Always import from `'three'` — never from CDN in Next.js.

### 3.2 View mode state

In `TreePageClient.tsx`:

```typescript
const searchParams = useSearchParams()
const router = useRouter()
const [viewMode, setViewMode] = useState<'2d' | '3d'>(
  searchParams.get('view') === '3d' ? '3d' : '2d'
)

function toggleView() {
  const next = viewMode === '2d' ? '3d' : '2d'
  setViewMode(next)
  router.replace(`?view=${next}`, { scroll: false })
}
```

Toolbar button:
```tsx
<button onClick={toggleView} className="...">
  {viewMode === '2d' ? '3D ↗' : '2D ↙'}
</button>
```

Render:
```tsx
{viewMode === '2d'
  ? <TreeCanvas nodes={nodes} edges={edges} onNodeClick={handleNodeClick} />
  : <TreeCanvas3D persons={persons} marriages={marriages} nodes={nodes}
                  onNodeClick={handleNodeClick} />
}
```

### 3.3 Dynamic import (required)

Three.js uses `window` — must be client-only:

```typescript
// At top of TreePageClient.tsx
import dynamic from 'next/dynamic'

const TreeCanvas3D = dynamic(
  () => import('@/components/tree/TreeCanvas3D').then(m => ({ default: m.TreeCanvas3D })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400">Loading 3D view…</span>
      </div>
    ),
  }
)
```

### 3.4 Constants

```typescript
// lib/tree/constants3d.ts
export const PLANE_GAP    = 220   // px between generation plane Y positions
export const PLANE_WIDTH  = 3000  // width of each plane slab
export const PLANE_DEPTH  = 60    // depth/thickness of each slab
export const NODE_3D_W    = 160
export const NODE_3D_H    = 50
export const ARC_RISE     = 120   // how far marriage arcs float above the plane
```

### 3.5 `components/tree/TreeCanvas3D.tsx` — full structure

```typescript
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import { useState, useRef } from 'react'
import type { PersonRow, MarriageRow } from '@/lib/tree/types'
import type { LayoutNode } from '@/lib/workers/layout.worker'
import { PLANE_GAP, PLANE_WIDTH, PLANE_DEPTH, ARC_RISE } from '@/lib/tree/constants3d'
import { GenerationPlane }  from './GenerationPlane'
import { PersonNode3D }     from './PersonNode3D'
import { SpouseNode3D }     from './SpouseNode3D'
import { ParentChildLine3D } from './ParentChildLine3D'
import { MarriageArc3D }    from './MarriageArc3D'

export type TreeCanvas3DProps = {
  persons:   PersonRow[]
  marriages: MarriageRow[]
  nodes:     LayoutNode[]            // 2D layout positions reused for X axis
  onNodeClick: (personId: string) => void
}

export function TreeCanvas3D({ persons, marriages, nodes, onNodeClick }: TreeCanvas3DProps) {
  const [visibleGens, setVisibleGens] = useState<number[]>([])
  const uniqueGens = [...new Set(persons.map(p => p.generation ?? 1))].sort()

  // Map personId → 3D position
  const centerX = (nodes.reduce((s, n) => s + n.position.x, 0) / nodes.length) || 0
  const posMap = new Map(nodes.map(n => [
    n.id,
    [n.position.x - centerX, -(n.data.person.generation ?? 1) * PLANE_GAP, 0] as [number,number,number]
  ]))

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, -PLANE_GAP * 2, 800], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 500, 500]} intensity={0.5} />
        <OrbitControls enablePan enableZoom enableRotate />

        <FrustumCuller
          generations={uniqueGens}
          onVisibleChange={setVisibleGens}
        />

        {uniqueGens.map(gen => (
          <GenerationPlane key={gen} generation={gen} y={-gen * PLANE_GAP} />
        ))}

        {persons
          .filter(p => visibleGens.includes(p.generation ?? 1))
          .map(p => {
            const pos = posMap.get(p.id)
            if (!pos) return null
            return (
              <PersonNode3D
                key={p.id}
                person={p}
                position={pos}
                onClick={() => onNodeClick(p.id)}
              />
            )
          })}

        {marriages
          .filter(m => visibleGens.includes(
            persons.find(p => p.id === m.husband_id)?.generation ?? 99
          ))
          .map(m => {
            const hPos = posMap.get(m.husband_id)
            const wPos = posMap.get(m.wife_id)
            if (!hPos || !wPos) return null
            return (
              <MarriageArc3D
                key={m.id}
                from={hPos}
                to={wPos}
                marriageDate={m.date_hijri}
                crossBranch={
                  persons.find(p => p.id === m.husband_id)?.branch !==
                  persons.find(p => p.id === m.wife_id)?.branch
                }
              />
            )
          })}

        {persons
          .filter(p => p.father_id && posMap.has(p.id) && posMap.has(p.father_id))
          .map(p => (
            <ParentChildLine3D
              key={`drop-${p.id}`}
              from={posMap.get(p.father_id!)!}
              to={posMap.get(p.id)!}
            />
          ))}
      </Canvas>
    </div>
  )
}

// Reads camera Y and derives visible generation range
function FrustumCuller({
  generations, onVisibleChange,
}: { generations: number[]; onVisibleChange: (gens: number[]) => void }) {
  useFrame(({ camera }) => {
    const focusGen = Math.round(-camera.position.y / PLANE_GAP)
    onVisibleChange(generations.filter(g => Math.abs(g - focusGen) <= 5))
  })
  return null
}
```

### 3.6 `GenerationPlane.tsx`

```typescript
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { PLANE_WIDTH, PLANE_DEPTH, PLANE_GAP } from '@/lib/tree/constants3d'

const GEN_COLORS: Record<number, string> = {
  1: '#E1F5EE', 2: '#EAF3DE', 3: '#FAEEDA', 4: '#E6F1FB',
  5: '#EEEDFE', 6: '#F1EFE8', 7: '#FAECE7', 8: '#FBEAF0',
}

export function GenerationPlane({ generation, y }: { generation: number; y: number }) {
  const color = GEN_COLORS[generation % 8] ?? '#F5F5F5'
  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[PLANE_WIDTH, 6, PLANE_DEPTH]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}
```

### 3.7 `PersonNode3D.tsx`

Uses `@react-three/drei`'s `<Html>` to float a real HTML card in 3D space:

```typescript
import { Html } from '@react-three/drei'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { NODE_3D_W, NODE_3D_H } from '@/lib/tree/constants3d'
import type { PersonRow } from '@/lib/tree/types'

export function PersonNode3D({
  person, position, onClick,
}: { person: PersonRow; position: [number,number,number]; onClick: () => void }) {
  const colour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'

  return (
    <group position={position}>
      {/* Physical backing card */}
      <mesh onClick={onClick}>
        <boxGeometry args={[NODE_3D_W, NODE_3D_H, 4]} />
        <meshStandardMaterial color={colour} opacity={0.9} transparent />
      </mesh>
      {/* HTML label floats over the mesh */}
      <Html center distanceFactor={400} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: NODE_3D_W - 16,
          background: '#fff',
          border: `2px solid ${colour}`,
          borderRadius: 6,
          padding: '4px 8px',
          fontSize: 12,
          cursor: 'pointer',
          pointerEvents: 'all',
        }} onClick={onClick}>
          <p dir="rtl" style={{ fontWeight: 700, margin: 0, fontSize: 13 }}>{person.name_ar}</p>
          <p style={{ color: '#6B7280', margin: 0, fontSize: 11 }}>{person.name_en}</p>
        </div>
      </Html>
    </group>
  )
}
```

### 3.8 `SpouseNode3D.tsx`

Same structure as `PersonNode3D` but uses `CylinderGeometry` scaled flat as an oval backing
(Three.js has no native ellipse solid; a flat cylinder with high segments approximates one):

```typescript
<mesh onClick={onClick}>
  <cylinderGeometry args={[NODE_3D_W / 2, NODE_3D_W / 2, 4, 32]} />
  <meshStandardMaterial color={colour} transparent opacity={0.7} />
</mesh>
```

Scale the mesh: `scale={[1, 1, NODE_3D_H / NODE_3D_W]}` to squash the circle into an oval.

### 3.9 `ParentChildLine3D.tsx`

```typescript
import { Line } from '@react-three/drei'

export function ParentChildLine3D({
  from, to,
}: { from: [number,number,number]; to: [number,number,number] }) {
  return (
    <Line
      points={[from, to]}
      color="#9CA3AF"
      lineWidth={1}
      dashed
      dashSize={8}
      gapSize={4}
    />
  )
}
```

### 3.10 `MarriageArc3D.tsx`

Quadratic bezier sampled into 32 points, with torus rings at the midpoint:

```typescript
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { ARC_RISE } from '@/lib/tree/constants3d'

function bezierPoints(
  from: [number,number,number],
  to:   [number,number,number],
  segments: number
): [number,number,number][] {
  const mid: [number,number,number] = [
    (from[0] + to[0]) / 2,
    Math.min(from[1], to[1]) + ARC_RISE,
    0,
  ]
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments
    const x = (1-t)**2 * from[0] + 2*(1-t)*t * mid[0] + t**2 * to[0]
    const y = (1-t)**2 * from[1] + 2*(1-t)*t * mid[1] + t**2 * to[1]
    return [x, y, 0] as [number,number,number]
  })
}

export function MarriageArc3D({
  from, to, marriageDate, crossBranch,
}: {
  from: [number,number,number]; to: [number,number,number]
  marriageDate: string | null; crossBranch: boolean
}) {
  const points = bezierPoints(from, to, 32)
  const mid = points[16]
  const color = crossBranch ? '#D4537E' : '#9CA3AF'

  return (
    <>
      <Line points={points} color={color} lineWidth={2} dashed dashSize={8} gapSize={4} />
      {/* Interlocked ring pair at arc midpoint */}
      <mesh position={[mid[0] - 6, mid[1], 2]}>
        <torusGeometry args={[5, 1.2, 8, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[mid[0] + 6, mid[1], 2]}>
        <torusGeometry args={[5, 1.2, 8, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  )
}
```

---

## Feature 4 — Female Members as First-Class Nodes

### What we're building

Women appear in the tree as oval nodes — daughters, mothers, wives — with a female symbol.
They have full bios, sources, and branch membership. The `PersonNode` renders oval when
`gender === 'female'`.

### 4.1 Schema already covered by Feature 1 migration

The `gender` column on `persons` with `CHECK (gender IN ('male', 'female', 'unknown'))`.

### 4.2 PersonNode.tsx — gender-conditional shape

```tsx
const isFemalePerson = data.person.gender === 'female'

return (
  <>
    <Handle type="target" position={Position.Top} className="!bg-gray-400" />
    <div
      className={[
        'relative flex h-[64px] w-[180px] flex-col justify-center px-2 shadow-sm',
        'border-2',
        isFemalePerson ? 'rounded-[50%]' : 'rounded-md',
        selected ? 'ring-2 ring-offset-1' : '',
      ].join(' ')}
      style={{ borderColor: branchColour, background: isFemalePerson ? `${branchColour}12` : '#fff' }}
    >
      {/* Dual-border inner ring for mother's branch */}
      {data.motherBranch && (
        <div style={{
          position: 'absolute', inset: 3,
          borderRadius: isFemalePerson ? '50%' : 4,
          border: `1.5px solid ${BRANCH_COLOURS[data.motherBranch]}`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Female symbol */}
      {isFemalePerson && (
        <svg width="10" height="12" style={{ position: 'absolute', bottom: 4, left: 6 }}>
          <circle cx="5" cy="4" r="3.5" fill="none" stroke={branchColour} strokeWidth="1.2" />
          <line x1="5" y1="7.5" x2="5" y2="11" stroke={branchColour} strokeWidth="1.2" />
          <line x1="3" y1="9.5" x2="7" y2="9.5" stroke={branchColour} strokeWidth="1.2" />
        </svg>
      )}

      {/* Generation badge */}
      {person.generation !== null && (
        <span className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center
                         rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: branchColour }}>
          {person.generation}
        </span>
      )}

      {/* Collapse toggle */}
      {data.onToggleCollapse && (
        <button onClick={e => { e.stopPropagation(); data.onToggleCollapse!(person.id) }}
                style={{
                  position: 'absolute', bottom: -10, left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10, padding: '1px 6px',
                  borderRadius: 8, background: branchColour,
                  color: '#fff', border: 'none', cursor: 'pointer',
                }}>
          {data.collapsedCount !== undefined ? `▶ ${data.collapsedCount}` : '−'}
        </button>
      )}

      <p dir="rtl" className="truncate text-right text-sm leading-tight font-bold text-gray-900">
        {person.name_ar}
      </p>
      <p className="truncate text-left text-xs leading-tight text-gray-500">
        {person.name_en}
      </p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
  </>
)
```

### 4.3 PersonEditor — gender field

In `components/admin/PersonEditor.tsx`, add inside the form:

```tsx
<div className="flex flex-col gap-1">
  <label className="text-xs font-medium text-gray-700">Gender / الجنس</label>
  <select name="gender" defaultValue={person?.gender ?? 'male'}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm">
    <option value="male">Male / ذكر</option>
    <option value="female">Female / أنثى</option>
    <option value="unknown">Unknown / غير معروف</option>
  </select>
</div>
```

### 4.4 DetailPanel — gender badge

```tsx
{person.gender === 'female' && (
  <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800">
    Female / أنثى
  </span>
)}
{person.gender === 'male' && (
  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
    Male / ذكر
  </span>
)}
```

---

## Feature 5 — Collapse / Expand Subtrees

### What we're building

Any node can be collapsed, hiding all descendants. Collapse state persists in `localStorage`.
A "▶ N" badge on the collapsed node shows how many descendants are hidden. "Expand all /
Collapse all" toolbar buttons. Wife subtrees collapse independently via junction nodes.

### 5.1 Collapse state in TreePageClient

```typescript
const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
  if (typeof window === 'undefined') return new Set()
  try {
    const saved = localStorage.getItem('nasab-collapsed')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch { return new Set() }
})

function toggleCollapse(personId: string): void {
  setCollapsedIds(prev => {
    const next = new Set(prev)
    next.has(personId) ? next.delete(personId) : next.add(personId)
    localStorage.setItem('nasab-collapsed', JSON.stringify([...next]))
    return next
  })
}
```

### 5.2 Collapse filter function

```typescript
function buildChildrenMap(edges: FamilyEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const e of edges) {
    if (!map.has(e.source)) map.set(e.source, new Set())
    map.get(e.source)!.add(e.target)
  }
  return map
}

function getHiddenIds(collapsedIds: Set<string>, childrenOf: Map<string, Set<string>>): Set<string> {
  const hidden = new Set<string>()
  const queue = [...collapsedIds]
  while (queue.length > 0) {
    const id = queue.shift()!
    for (const childId of childrenOf.get(id) ?? []) {
      if (!hidden.has(childId)) {
        hidden.add(childId)
        queue.push(childId)
      }
    }
  }
  return hidden
}

function countDescendants(id: string, childrenOf: Map<string, Set<string>>): number {
  let count = 0
  const queue = [id]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const child of childrenOf.get(cur) ?? []) {
      count++
      queue.push(child)
    }
  }
  return count
}

function applyCollapse(
  nodes: AnyFlowNode[],
  edges: FamilyEdge[],
  collapsedIds: Set<string>,
  onToggle: (id: string) => void,
): { nodes: AnyFlowNode[]; edges: FamilyEdge[] } {
  if (collapsedIds.size === 0) {
    // Still inject callbacks even when nothing collapsed
    return {
      nodes: nodes.map(n => n.type === 'person'
        ? { ...n, data: { ...n.data, onToggleCollapse: onToggle } }
        : n),
      edges,
    }
  }

  const childrenOf = buildChildrenMap(edges)
  const hidden = getHiddenIds(collapsedIds, childrenOf)

  const visibleNodes = nodes
    .filter(n => !hidden.has(n.id))
    .map(n => {
      if (n.type !== 'person') return n
      const isCollapsed = collapsedIds.has(n.id)
      return {
        ...n,
        data: {
          ...n.data,
          onToggleCollapse: onToggle,
          collapsedCount: isCollapsed ? countDescendants(n.id, childrenOf) : undefined,
        },
      }
    })

  const visibleEdges = edges.filter(
    e => !hidden.has(e.source) && !hidden.has(e.target)
  )

  return { nodes: visibleNodes, edges: visibleEdges }
}
```

Call this just before passing to `TreeCanvas`:

```typescript
const { nodes: displayNodes, edges: displayEdges } = useMemo(
  () => applyCollapse(nodes, edges, collapsedIds, toggleCollapse),
  [nodes, edges, collapsedIds]
)
```

### 5.3 Toolbar buttons

```tsx
{/* In the header of TreePageClient */}
<button onClick={() => {
  const nonLeafIds = new Set(edges.map(e => e.source))
  setCollapsedIds(nonLeafIds)
  localStorage.setItem('nasab-collapsed', JSON.stringify([...nonLeafIds]))
}}>
  Collapse all
</button>

<button onClick={() => {
  setCollapsedIds(new Set())
  localStorage.removeItem('nasab-collapsed')
}}>
  Expand all
</button>
```

### 5.4 Wife subtree collapse via junction nodes

`JunctionNode` gets its own collapse toggle. When collapsed, it hides only the children
of that specific junction — not children of other junctions (other wives) of the same husband.

Extend `JunctionNodeData`:
```typescript
export type JunctionNodeData = {
  husbandId: string
  wifeId: string
  marriageId: string
  onToggleCollapse?: (junctionId: string) => void
  collapsedCount?: number
}
```

The `collapsedIds` set accepts both person IDs and junction node IDs — the same BFS logic
handles both.

---

## Full Implementation Order

Build in this exact sequence. Each phase is a working, deployed checkpoint.

### Phase A — Database & Type Foundation
1. Write migration `20260401000000_marriages.sql`
2. Run `npx supabase db push`
3. Regenerate types: `npx supabase gen types typescript --local > lib/supabase/types.ts`
4. Add `MarriageRow` and new node data types to `lib/tree/types.ts`
5. Create `server/trpc/routers/marriages.ts`
6. Register `marriagesRouter` in `server/trpc/root.ts`
7. Add seed data (Fatima bint al-Husayn + marriage + mother_id updates)
8. Run `npx supabase db reset` to apply seed

**Checkpoint:** Query `trpc.marriages.listAll` returns 1 row. `persons` table has `gender`, `mother_id`, `marriage_id`, `photo_url`. Fatima al-Zahra has `gender = 'female'`.

### Phase B — Layout Worker Extension
1. Extend `LayoutWorkerInput` to include `marriages: MarriageRow[]`
2. Update `TreePageClient` to pass marriages to worker via `postMessage`
3. Implement spouse placement pass in worker
4. Implement junction placement pass
5. Implement bracket placement pass
6. Implement dual-border metadata pass (`motherBranch` on children)
7. Emit `marriage`, `crossMarriage`, `parentChild` edge types

**Checkpoint:** Open browser console on `/tree`. Worker output JSON contains spouse nodes, junction nodes, bracket nodes. Cross-marriage edge has `type: 'crossMarriage'` in the edge array.

### Phase C — New Node & Edge Components
1. Build `SpouseNode.tsx`
2. Build `JunctionNode.tsx`
3. Build `BracketNode.tsx`
4. Build `MarriageEdge.tsx`
5. Build `CrossMarriageEdge.tsx`
6. Update `PersonNode.tsx` — oval shape, dual-border, female symbol, collapse button
7. Register all new types in `TreeCanvas.tsx`

**Checkpoint:** 2D tree shows Fatima bint al-Husayn as an oval. A pink arc with interlocked rings connects al-Hasan al-Muthanna to Fatima. Abdullah al-Kamil and Ibrahim show dual green/pink borders. Bracket label appears above them.

### Phase D — TreePageClient Wiring
1. Fetch marriages in `tree/page.tsx` (server component), pass to `TreePageClient`
2. Add `showWives` state + toggle in `BranchFilter`
3. Implement `collapsedIds` state + `applyCollapse()` function
4. Wire `toggleCollapse` callback to PersonNode and JunctionNode
5. Add "Collapse all / Expand all" toolbar buttons
6. Verify localStorage persistence across page refresh

**Checkpoint:** Can collapse any subtree. Count badge shows correct number. Expand all restores full tree. "Show wives" hides/shows all spouse nodes.

### Phase E — Female Member Rendering
1. Update `PersonNode` gender-conditional rendering (oval, female symbol, dual-border)
2. Add gender badge to `DetailPanel`
3. Add gender select to `PersonEditor`
4. Verify Fatima al-Zahra renders as oval in Generation 2
5. Verify Fatima bint al-Husayn renders as oval in Generation 4

**Checkpoint:** All female persons render as ovals in 2D tree. Gender badge appears in detail panel. Admin can set gender on any person.

### Phase F — 3D View
1. Install `@react-three/fiber @react-three/drei three @types/three`
2. Create `lib/tree/constants3d.ts`
3. Build `GenerationPlane.tsx`
4. Build `PersonNode3D.tsx`
5. Build `SpouseNode3D.tsx`
6. Build `ParentChildLine3D.tsx`
7. Build `MarriageArc3D.tsx`
8. Assemble `TreeCanvas3D.tsx`
9. Dynamic import in `TreePageClient` with `ssr: false`
10. Add view mode toggle to toolbar
11. Wire `onNodeClick` to existing `DetailPanel`

**Checkpoint:** Toggle to 3D. Generation planes visible. Nodes float on planes. Orbit rotates. Scroll zooms. Clicking a node opens existing DetailPanel. Cross-branch marriage arc visibly floats above planes.

### Phase G — DetailPanel Marriages Section
1. Add "Marriages" section (spouse list, dates, child count per union)
2. Add "Wives" section when viewing from husband's perspective
3. Add "Fly to" button that calls `setCenter()` on spouse node in 2D, or animates camera in 3D

**Checkpoint:** Click al-Hasan al-Muthanna. Detail panel shows "1 marriage — Fatima bint al-Husayn, c. 61 AH, 2 children." Click "Fly to" — canvas flies to Fatima's oval node.

### Phase H — Polish, RTL & Testing
1. Arabic locale audit — all new strings have `ar.json` keys, right-aligned, Hijri dates
2. Mobile audit — touch orbit controls in 3D, touch tap on spouse ovals
3. TypeScript — `npm run typecheck` with zero errors
4. Performance — layout worker benchmark with 300 persons + 100 marriages (target: < 150ms)
5. Jest — update tests for collapse filter and layout worker spouse output
6. Accessibility — all new buttons `aria-label`, spouse nodes `role="img" aria-label={person.name_en}`

---

## Files Created / Modified

### New files
```
supabase/migrations/20260401000000_marriages.sql
lib/tree/constants3d.ts
server/trpc/routers/marriages.ts
components/tree/SpouseNode.tsx
components/tree/SpouseNode3D.tsx
components/tree/JunctionNode.tsx
components/tree/BracketNode.tsx
components/tree/MarriageEdge.tsx
components/tree/CrossMarriageEdge.tsx
components/tree/GenerationPlane.tsx
components/tree/PersonNode3D.tsx
components/tree/ParentChildLine3D.tsx
components/tree/MarriageArc3D.tsx
components/tree/TreeCanvas3D.tsx
```

### Modified files
```
lib/tree/types.ts                              — MarriageRow, SpouseFlowNode, JunctionFlowNode, BracketFlowNode
lib/supabase/types.ts                          — regenerated + MarriageRow added manually
lib/workers/layout.worker.ts                   — spouse, junction, bracket layout passes; marriages input
components/tree/PersonNode.tsx                 — gender oval, dual-border, female symbol, collapse button
components/tree/TreeCanvas.tsx                 — new node/edge types registered
components/tree/DetailPanel.tsx                — marriages section, gender badge, Fly-to button
components/tree/BranchFilter.tsx               — showWives toggle
components/admin/PersonEditor.tsx              — gender select, photo_url upload
server/trpc/root.ts                            — marriagesRouter registered
app/[locale]/(public)/tree/page.tsx            — fetch marriages, pass to client
app/[locale]/(public)/tree/TreePageClient.tsx  — viewMode, collapseIds, showWives, marriages
supabase/seed.sql                              — Fatima bint al-Husayn, marriage row, mother_id updates
```

---

## Key Design Decisions

**Why junction nodes instead of multi-parent edges?**
`@xyflow/react` edges are strictly one source → one target. A child with two documented
parents requires a midpoint junction. This is the standard genealogy software pattern
(GEDCOM uses `FAM` records for exactly this). In 3D, junctions become small sphere meshes.

**Why store `marriage_id` on the child `persons` row?**
Allows resolving "which marriage produced this child" in a single join. A child has exactly
one biological marriage of their parents. Admins can leave it null for historically
undocumented cases — the child still appears under their father but without mother grouping.

**Why `UNIQUE (husband_id, wife_id)` on marriages?**
Prevents duplicate entries. Historical remarriage after divorce is modelled by closing date
ranges on the old row and creating a new row — not by allowing two open rows for the same pair.

**Why float arcs at 120px above the plane?**
At 120px, the arc visually clears all oval nodes (~52px tall) and plane slabs (6–8px thick)
without looking detached. 80px clips busy generations. 160px reads as a separate layer.
120px is the tested sweet spot from the diagram work.

**Why keep 2D as default, 3D as opt-in?**
Three.js adds ~380KB gzipped to the client bundle. Lazy loading via Next.js dynamic import
means 2D users pay zero cost. The tree's primary audience (South Asia, MENA) often connects
on bandwidth-constrained networks — 2D first is the right default.

**Why localStorage for collapse state rather than URL params?**
A fully-expanded 2000-person tree with 800 collapsed nodes would produce a URL ~30KB long.
localStorage handles this trivially. The trade-off is that collapsed views are not shareable
by URL — acceptable because collapse is personal navigation preference, not a canonical URL.

**Why pass marriages to the layout worker rather than computing spouse positions in the component?**
Spouse nodes affect subtree widths. If a person has 4 wives, their children need more
horizontal space to avoid overlapping with the wife column. The layout worker must know
about marriages before computing child positions. Doing this in a React component (after
layout) would require a second re-render pass — fragile and slow.
