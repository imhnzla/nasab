'use client'
// Phase 1 — PNG export button using html-to-image at 2× resolution
// Phase 2 — PDF export using jspdf

import React, { useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import { toPng } from 'html-to-image'

export type ExportButtonProps = {
  treeContainerRef: RefObject<HTMLDivElement | null>
  filename?: string
}

export function ExportButton({
  treeContainerRef,
  filename = 'nasab-tree.png',
}: ExportButtonProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handlePngExport(): Promise<void> {
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
      console.error('[ExportButton] toPng failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  async function handlePdfExport(): Promise<void> {
    const el = treeContainerRef.current
    if (!el) return

    setIsExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
      const img = new Image()
      img.src = dataUrl
      await new Promise((r) => { img.onload = r })
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width / 2, img.height / 2],
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2)
      pdf.save(filename.replace('.png', '.pdf'))
    } catch (err) {
      console.error('[ExportButton] PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Export tree"
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
            Export
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showDropdown && !isExporting && (
        <div className="absolute right-0 mt-1 w-36 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          <button
            onClick={() => { handlePngExport(); setShowDropdown(false) }}
            className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            Export PNG
          </button>
          <button
            onClick={() => { handlePdfExport(); setShowDropdown(false) }}
            className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  )
}
