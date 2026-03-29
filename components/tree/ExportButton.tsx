'use client'
// Phase 1 — PNG export button using html-to-image at 2× resolution
// Captures the ReactFlow canvas container ref

import type { RefObject } from 'react'

export type ExportButtonProps = {
  treeContainerRef: RefObject<HTMLDivElement | null>
  filename?: string
}

export function ExportButton(_props: ExportButtonProps): JSX.Element {
  // TODO: Phase 1 — call toPng() from html-to-image on treeContainerRef.current
  return <button type="button">Export — Phase 1</button>
}
