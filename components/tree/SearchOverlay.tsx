'use client'
// Phase 1 — Fuzzy search overlay with Arabic diacritic-insensitive matching
// Keyboard: Cmd/Ctrl+K to open, Escape to close

import { useEffect, useRef, useState, useCallback } from 'react'
import type { PersonRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'
import { trpc } from '@/lib/trpc/client'
import { prepareForSearch } from '@/lib/i18n/arabic'

export type SearchOverlayProps = {
  isOpen: boolean
  onSelect: (person: PersonRow) => void
  onClose: () => void
}

export function SearchOverlay({ isOpen, onSelect, onClose }: SearchOverlayProps): JSX.Element | null {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Reset query when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  // Autofocus on open
  useEffect(() => {
    if (isOpen) {
      // Defer to next tick to ensure DOM is ready
      const frame = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(frame)
    }
  }, [isOpen])

  // Escape key closes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const preparedQuery = prepareForSearch(debouncedQuery)

  const { data: results = [], isFetching } = trpc.search.fuzzy.useQuery(
    { q: preparedQuery, limit: 20 },
    {
      enabled: preparedQuery.length >= 1,
      placeholderData: [],
    },
  )

  const handleSelect = useCallback(
    (person: PersonRow) => {
      onSelect(person)
      onClose()
    },
    [onSelect, onClose],
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search persons"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
          <svg
            className="h-4 w-4 flex-shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search… ابحث بالاسم"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            autoComplete="off"
            spellCheck={false}
          />

          {isFetching && (
            <svg
              className="h-4 w-4 animate-spin text-gray-400"
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
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          )}

          <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul className="overflow-y-auto" role="listbox">
          {results.length === 0 && preparedQuery.length > 0 && !isFetching && (
            <li className="px-4 py-6 text-center text-sm text-gray-500">
              No results found
            </li>
          )}

          {results.length === 0 && preparedQuery.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-400">
              Type to search persons in the tree
            </li>
          )}

          {(results as PersonRow[]).map((person) => {
            const branchColour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'
            return (
              <li key={person.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleSelect(person)}
                >
                  {/* Branch colour dot */}
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: branchColour }}
                    aria-hidden="true"
                  />

                  <span className="flex flex-1 flex-col overflow-hidden">
                    <span dir="rtl" className="truncate text-sm font-semibold text-gray-900">
                      {person.name_ar}
                    </span>
                    <span className="truncate text-xs text-gray-500">{person.name_en}</span>
                  </span>

                  {/* Generation badge */}
                  {person.generation !== null && (
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: branchColour }}
                    >
                      {person.generation}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
