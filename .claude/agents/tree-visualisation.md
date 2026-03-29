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

### Key Files

| File                                | Responsibility                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `components/tree/TreeCanvas.tsx`    | ReactFlow wrapper: zoom/pan, nodeTypes, edgeTypes, MiniMap, Controls                                             |
| `components/tree/PersonNode.tsx`    | Custom node — Arabic name (RTL), English name, branch colour border, generation badge, ✓ verified                |
| `components/tree/EdgeRenderer.tsx`  | Bezier edges using `getBezierPath` + `BaseEdge`, gray (#9CA3AF) with ArrowClosed marker                          |
| `components/tree/BranchFilter.tsx`  | Toggle buttons for Hasanid/Husaynid/Hashemite + All; inline `style` for dynamic branch colours                   |
| `components/tree/DetailPanel.tsx`   | Fixed right-side slide-in panel; uses `useLocale()` for bio language; parses `sources` jsonb                     |
| `components/tree/SearchOverlay.tsx` | Cmd+K modal; debounced `trpc.search.fuzzy.useQuery`; `prepareForSearch()` for Arabic normalisation               |
| `components/tree/ExportButton.tsx`  | `toPng(ref, { pixelRatio: 2, cacheBust: true })` from `html-to-image`; loading spinner state                     |
| `public/workers/layout.worker.ts`   | Web Worker: builds tree from `father_id` graph, custom tidy-tree layout, returns `LayoutNode[]` + `LayoutEdge[]` |
| `lib/tree/types.ts`                 | Shared types: `PersonFlowNode`, `FamilyEdge`, `Branch`, `BRANCH_COLOURS`, `NODE_WIDTH/HEIGHT`                    |

## Shared Types (lib/tree/types.ts)

```ts
import type { Node, Edge } from '@xyflow/react'
import type { Database } from '@/lib/supabase/types'

export type PersonRow = Database['public']['Tables']['persons']['Row']
export type Branch = NonNullable<PersonRow['branch']>

export const BRANCH_COLOURS: Record<Branch, string> = {
  hasanid: '#1B5E20',
  husaynid: '#0D1B2A',
  hashemite: '#C9A84C',
}

export const NODE_WIDTH = 180
export const NODE_HEIGHT = 64

export type PersonNodeData = { person: PersonRow }
export type PersonFlowNode = Node<PersonNodeData, 'person'>
export type FamilyEdge = Edge
```

**Always import from `@/lib/tree/types`** — never redefine these constants in components.

## Layout Worker

The worker at `public/workers/layout.worker.ts` implements a custom tidy-tree layout (no D3 — workers can't import from `lib/`):

```ts
// Worker receives/sends:
type LayoutWorkerInput  = { persons: PersonRow[] }
type LayoutWorkerOutput = { nodes: LayoutNode[]; edges: LayoutEdge[] }

// Usage in TreePageClient:
const worker = new Worker(
  new URL('/workers/layout.worker.ts', import.meta.url),
  { type: 'module' }
)
worker.postMessage({ persons: filtered })
worker.onmessage = (e: MessageEvent<LayoutWorkerOutput>) => { ... }
```

**Important**: The worker inlines its own `PersonRow` type — it cannot `import` from `@/lib/...`.

## Node Design

```tsx
// PersonNode: memo-wrapped for performance
export const PersonNode = memo(function PersonNodeInner({ data, selected }: NodeProps<PersonFlowNode>) {
  const branchColour = data.person.branch ? BRANCH_COLOURS[data.person.branch] : '#6B7280'
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div style={{ borderColor: branchColour }} className="h-[64px] w-[180px] border-2 ...">
        {/* generation badge, verified ✓, Arabic name (dir="rtl"), English name */}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
})

// EdgeRenderer: memo-wrapped
export const EdgeRenderer = memo(function({ id, sourceX, ...}: EdgeProps) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY, ... })
  return <><BaseEdge id={id} path={edgePath} style={{ stroke: '#9CA3AF' }} /><EdgeLabelRenderer><></></EdgeLabelRenderer></>
})
```

## TreeCanvas Configuration

```tsx
const nodeTypes: NodeTypes = { person: PersonNode }    // stable ref outside component
const edgeTypes: EdgeTypes = { smoothstep: EdgeRenderer }
const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, color: '#9CA3AF', width: 16, height: 16 },
}

<ReactFlow
  nodes={nodes} edges={edges}
  nodeTypes={nodeTypes} edgeTypes={edgeTypes}
  defaultEdgeOptions={defaultEdgeOptions}
  fitView fitViewOptions={{ padding: 0.2 }}
  minZoom={0.1} maxZoom={2}
>
  <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e5e7eb" />
  <Controls />
  <MiniMap nodeColor={(node) => BRANCH_COLOURS[node.data?.person?.branch] ?? '#6B7280'} />
</ReactFlow>
```

## Performance Rules

1. Render at most **500 visible nodes** at once — virtualise the rest.
2. All layout calculations run in a **Web Worker** (not on the main thread).
3. Node re-renders must be wrapped in `React.memo`.
4. `nodeTypes` and `edgeTypes` objects must be **stable references** (outside the component) to avoid full re-renders.
5. Use `useNodesState`/`useEdgesState` and `useEffect` to sync from props.

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
