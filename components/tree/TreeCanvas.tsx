'use client'
// Phase 1 — Root @xyflow/react wrapper with zoom/pan
// import { ReactFlow } from '@xyflow/react'
// import '@xyflow/react/dist/style.css'
// See .claude/agents/tree-visualisation.md for full implementation spec

import type { PersonFlowNode, FamilyEdge } from '@/lib/tree/types'

export type TreeCanvasProps = {
  nodes: PersonFlowNode[]
  edges: FamilyEdge[]
  onNodeClick?: (personId: string) => void
}

export function TreeCanvas(_props: TreeCanvasProps): JSX.Element {
  // TODO: Phase 1 — replace with ReactFlow canvas, load nodes from layout worker
  return <div>TreeCanvas — Phase 1</div>
}
