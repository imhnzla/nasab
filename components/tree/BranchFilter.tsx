'use client'
// Phase 1 — Sidebar with toggle buttons for Hasanid / Husaynid / Hashemite branches
// Also shows total node count per branch

import type { Branch } from '@/lib/tree/types'

export type BranchFilterProps = {
  activeBranches: Branch[]
  onChange: (branches: Branch[]) => void
}

export function BranchFilter(_props: BranchFilterProps): JSX.Element {
  // TODO: Phase 1 — render branch toggle buttons with branch colours
  return <div>BranchFilter — Phase 1</div>
}
