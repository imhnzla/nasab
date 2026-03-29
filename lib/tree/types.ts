// Shared TypeScript types for the Phase 1 interactive family tree
// Used by components/tree/* and the layout Web Worker

import type { Node, Edge } from '@xyflow/react'
import type { Database } from '@/lib/supabase/types'

export type PersonRow = Database['public']['Tables']['persons']['Row']

export type Branch = NonNullable<PersonRow['branch']>
export type ScholarlyTradition = NonNullable<PersonRow['scholarly_tradition']>

export const BRANCH_COLOURS: Record<Branch, string> = {
  hasanid: '#1B5E20',
  husaynid: '#0D1B2A',
  hashemite: '#C9A84C',
}

export const NODE_WIDTH = 180
export const NODE_HEIGHT = 64

// @xyflow/react typed node
export type PersonNodeData = {
  person: PersonRow
}

export type PersonFlowNode = Node<PersonNodeData, 'person'>
export type FamilyEdge = Edge

// Layout worker message types
export type LayoutWorkerInput = {
  persons: PersonRow[]
}

export type LayoutNode = {
  id: string
  x: number
  y: number
  data: { person: PersonRow }
}

export type LayoutWorkerOutput = {
  nodes: LayoutNode[]
  edges: FamilyEdge[]
}
