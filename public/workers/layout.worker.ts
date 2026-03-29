// Web Worker — D3 hierarchical layout for the NASAB family tree
// Phase 1: receives raw persons array, returns positioned nodes + edges
//
// Usage (from TreeCanvas):
//   const worker = new Worker(new URL('/workers/layout.worker.ts', import.meta.url))
//   worker.postMessage({ persons })
//   worker.onmessage = (e) => { setNodes(e.data.nodes); setEdges(e.data.edges) }
//
// TODO: Phase 1 — implement with d3-hierarchy stratify() + tree() layout
//   import * as d3 from 'd3-hierarchy'
//   const root = d3.stratify<PersonRow>().id(d => d.id).parentId(d => d.father_id)(persons)
//   d3.tree<PersonRow>().nodeSize([NODE_WIDTH + 24, NODE_HEIGHT + 48])(root)

export type PersonRow = {
  id: string
  name_ar: string
  name_en: string
  father_id: string | null
  branch: 'hasanid' | 'husaynid' | 'hashemite' | null
  scholarly_tradition: 'sunni' | 'shia' | 'both' | null
  generation: number | null
  birth_date_hijri: string | null
  death_date_hijri: string | null
  birth_date_gregorian: string | null
  death_date_gregorian: string | null
  bio_ar: string | null
  bio_en: string | null
  sources: unknown
  titles: unknown
  is_verified: boolean
  is_living: boolean
  created_at: string
  updated_at: string
}

export type LayoutNode = {
  id: string
  type: 'person'
  position: { x: number; y: number }
  data: { person: PersonRow }
}

export type LayoutEdge = {
  id: string
  source: string
  target: string
  type: 'smoothstep'
}

export type LayoutWorkerInput = { persons: PersonRow[] }
export type LayoutWorkerOutput = { nodes: LayoutNode[]; edges: LayoutEdge[] }

self.onmessage = (_event: MessageEvent<LayoutWorkerInput>): void => {
  // TODO: Phase 1 — d3-hierarchy layout implementation
  const output: LayoutWorkerOutput = { nodes: [], edges: [] }
  self.postMessage(output)
}
