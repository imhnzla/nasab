'use client'
// Phase 1 — Fuzzy search overlay with Arabic diacritic-insensitive matching
// Uses lib/i18n/arabic.ts prepareForSearch() before hitting the tRPC search.fuzzy endpoint
// Keyboard: Cmd/Ctrl+K to open, Escape to close

import type { PersonRow } from '@/lib/tree/types'

export type SearchOverlayProps = {
  isOpen: boolean
  onSelect: (person: PersonRow) => void
  onClose: () => void
}

export function SearchOverlay(_props: SearchOverlayProps): JSX.Element {
  // TODO: Phase 1 — render modal with search input + results list
  return <div>SearchOverlay — Phase 1</div>
}
