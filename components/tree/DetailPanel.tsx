'use client'
// Phase 1 — Slide-in panel showing full biography when a tree node is clicked

import React from 'react'
import { useLocale } from 'next-intl'
import type { PersonRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

export type DetailPanelProps = {
  person: PersonRow | null
  onClose: () => void
}

type SourceEntry = {
  title?: string
  author?: string
  url?: string
}

function parseSources(sources: unknown): SourceEntry[] {
  if (!Array.isArray(sources)) return []
  return sources.filter(
    (s): s is SourceEntry => typeof s === 'object' && s !== null && 'title' in s
  )
}

function formatDate(hijri: string | null, gregorian: string | null): string | null {
  if (hijri) return `${hijri} AH`
  if (gregorian) return gregorian
  return null
}

export function DetailPanel({ person, onClose }: DetailPanelProps): React.ReactElement | null {
  const locale = useLocale()

  if (!person) return null

  const branchColour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'
  const branchLabel =
    person.branch === 'hasanid'
      ? 'Hasanid'
      : person.branch === 'husaynid'
        ? 'Husaynid'
        : person.branch === 'hashemite'
          ? 'Hashemite'
          : 'Unknown'

  const traditionLabel =
    person.scholarly_tradition === 'sunni'
      ? 'Sunni'
      : person.scholarly_tradition === 'shia'
        ? 'Shia'
        : person.scholarly_tradition === 'both'
          ? 'Sunni & Shia'
          : null

  const born = formatDate(person.birth_date_hijri, person.birth_date_gregorian)
  const died = formatDate(person.death_date_hijri, person.death_date_gregorian)

  const bio = locale === 'ar' ? person.bio_ar : person.bio_en
  const sources = parseSources(person.sources)

  return (
    // Backdrop (clicking outside closes on mobile)
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label={person.name_en}
    >
      {/* Semi-transparent backdrop — click to close */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className={[
          'relative z-10 flex h-full w-80 flex-col overflow-y-auto bg-white shadow-2xl',
          'translate-x-0 transition-transform duration-300',
        ].join(' ')}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-4 pt-4 pb-3"
          style={{ borderBottom: `3px solid ${branchColour}` }}
        >
          <div className="flex-1 overflow-hidden">
            <h2 dir="rtl" className="text-xl leading-tight font-bold text-gray-900">
              {person.name_ar}
            </h2>
            <p className="mt-0.5 truncate text-sm text-gray-500">{person.name_en}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ms-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {/* Branch badge */}
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: branchColour }}
            >
              {branchLabel}
            </span>

            {/* Scholarly tradition badge */}
            {traditionLabel && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {traditionLabel}
              </span>
            )}

            {/* Verified badge */}
            {person.is_verified && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: '#059669' }}
              >
                ✓ Verified
              </span>
            )}
          </div>

          {/* Generation */}
          {person.generation !== null && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Generation:</span> {person.generation}
            </div>
          )}

          {/* Dates */}
          {(born ?? died) && (
            <div className="flex flex-col gap-1 text-sm text-gray-700">
              {born && (
                <div>
                  <span className="font-medium">Born:</span> {born}
                </div>
              )}
              {died && (
                <div>
                  <span className="font-medium">Died:</span> {died}
                </div>
              )}
            </div>
          )}

          {/* Biography */}
          {bio && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Biography</h3>
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="text-sm leading-relaxed text-gray-700"
              >
                {bio}
              </p>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Sources</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {sources.map((src, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    <span>
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {src.title}
                        </a>
                      ) : (
                        src.title
                      )}
                      {src.author && <span className="text-gray-500"> — {src.author}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
