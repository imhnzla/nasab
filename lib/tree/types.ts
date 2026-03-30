// Shared TypeScript types for the Phase 1 interactive family tree
// Used by components/tree/* and the layout Web Worker

import type { Node, Edge } from '@xyflow/react'
import type { Database } from '@/lib/supabase/types'

export type PersonRow = Database['public']['Tables']['persons']['Row']

// SearchHit is the lean shape returned by the tRPC search.fuzzy procedure.
// It deliberately excludes Json fields (sources, titles) and bulk text fields
// (bio_ar, bio_en, dates) to keep the tRPC inferred output type shallow.
// Json is a recursive type alias — when it flows through tRPC v11's nested
// conditional types (inferProcedureOutput, DeepPartial, TRPCRequestOptions)
// TypeScript hits its instantiation depth limit (TS2589). Keeping Json out of
// the tRPC return type entirely is the correct structural fix.
export type SearchHit = {
  id: string
  name_ar: string
  name_en: string
  father_id: string | null
  branch: 'hasanid' | 'husaynid' | 'hashemite' | null
  scholarly_tradition: 'sunni' | 'shia' | 'both' | null
  generation: number | null
}

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
