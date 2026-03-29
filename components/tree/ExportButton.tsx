'use client'
// Phase 1 — PNG export button using html-to-image at 2× resolution
// Captures the ReactFlow canvas container ref

import { useState } from 'react'
import type { RefObject } from 'react'
import { toPng } from 'html-to-image'

export type ExportButtonProps = {
  treeContainerRef: RefObject<HTMLDivElement | null>
  filename?: string
}

export function ExportButton({ treeContainerRef, filename = 'nasab-tree.png' }: ExportButtonProps): JSX.Element {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport(): Promise<void> {
    const el = treeContainerRef.current
    if (!el) return

    setIsExporting(true)
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    } catch (err) {
      // In production this should be surfaced via a toast — for now log to console
      console.error('[ExportButton] toPng failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleExport()}
      disabled={isExporting}
      className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Export tree as PNG"
    >
      {isExporting ? (
        <>
          <svg
            className="h-3.5 w-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Exporting…
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M12 3v9"
            />
          </svg>
          Export PNG
        </>
      )}
    </button>
  )
}
