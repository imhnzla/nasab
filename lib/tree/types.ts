// Shared TypeScript types for the NASAB family tree
// Used by components/tree/* and the layout Web Worker

import type { Node, Edge } from '@xyflow/react'
import type { Database } from '@/lib/supabase/types'

// Extend and override the base Supabase type with missing columns
export type PersonRow = Database['public']['Tables']['persons']['Row']

export type MarriageRow = Database['public']['Tables']['marriages']['Row']

// SearchHit is the lean shape returned by the tRPC search.fuzzy procedure.
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
  hasanid: '#C9943A',
  husaynid: '#1A5C3A',
  hashemite: '#8B4513',
}

export const NODE_WIDTH = 180
export const NODE_HEIGHT = 64

// ─── Node data types ────────────────────────────────────────────────────────

export type PersonNodeData = {
  person: PersonRow
  motherBranch?: Branch | null
  collapsedCount?: number
  highlighted?: boolean
  dimmed?: boolean
  onToggleCollapse?: (id: string) => void
}

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
  onToggleCollapse?: (junctionId: string) => void
  collapsedCount?: number
}

export type BracketNodeData = {
  motherName_ar: string
  motherName_en: string
  motherBranch: Branch | null
  spanPx: number
}

// ─── Wife node data (premium 2D layout) ─────────────────────────────────────

export type WifeNodeData = {
  person: PersonRow
  marriageId: string
  marriageDate: string | null
  orderNum: number
}

// ─── Flow node types ─────────────────────────────────────────────────────────

export type PersonFlowNode = Node<PersonNodeData, 'person'>
export type SpouseFlowNode = Node<SpouseNodeData, 'spouse'>
export type JunctionFlowNode = Node<JunctionNodeData, 'junction'>
export type BracketFlowNode = Node<BracketNodeData, 'bracket'>
export type WifeFlowNode = Node<WifeNodeData, 'wife'>

export type AnyFlowNode =
  | PersonFlowNode
  | SpouseFlowNode
  | JunctionFlowNode
  | BracketFlowNode
  | WifeFlowNode

// ─── Edge types ───────────────────────────────────────────────────────────────

export type FamilyEdge = Edge

// ─── Layout worker types ─────────────────────────────────────────────────────

export type LayoutWorkerInput = {
  persons: PersonRow[]
  marriages: MarriageRow[]
}

export type LayoutNode = {
  id: string
  type: 'person' | 'spouse' | 'junction' | 'bracket' | 'wife'
  position: { x: number; y: number }
  data: PersonNodeData | SpouseNodeData | JunctionNodeData | BracketNodeData | WifeNodeData
}

export type LayoutWorkerOutput = {
  nodes: LayoutNode[]
  edges: FamilyEdge[]
}
