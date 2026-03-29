'use client'
// Phase 1 — Slide-in panel showing full biography when a tree node is clicked
// Displays: full name (ar+en), generation, birth/death dates (Hijri + Gregorian),
//           bio, scholarly tradition badge, sources list

import type { PersonRow } from '@/lib/tree/types'

export type DetailPanelProps = {
  person: PersonRow | null
  onClose: () => void
}

export function DetailPanel(_props: DetailPanelProps): JSX.Element {
  // TODO: Phase 1 — render slide-in panel with person biography
  return <div>DetailPanel — Phase 1</div>
}
