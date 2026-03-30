'use client'
// Phase 1 — Slide-in panel showing full biography when a tree node is clicked

import React from 'react'
import { useLocale } from 'next-intl'
import type { PersonRow, MarriageRow } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

export type DetailPanelProps = {
  person:    PersonRow | null
  marriages: MarriageRow[]
  persons:   PersonRow[]   // full list for resolving spouse names
  onClose:   () => void
  onFlyTo?:  (personId: string) => void
}

type SourceEntry = { title?: string; author?: string; url?: string }

function parseSources(sources: unknown): SourceEntry[] {
  if (!Array.isArray(sources)) return []
  return sources.filter(
    (s): s is SourceEntry => typeof s === 'object' && s !== null && 'title' in s,
  )
}

function formatDate(hijri: string | null, gregorian: string | null): string | null {
  if (hijri) return `${hijri} AH`
  if (gregorian) return gregorian
  return null
}

export function DetailPanel({
  person,
  marriages,
  persons,
  onClose,
  onFlyTo,
}: DetailPanelProps): React.ReactElement | null {
  const locale = useLocale()
  if (!person) return null

  const branchColour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'
  const branchLabel =
    person.branch === 'hasanid'   ? 'Hasanid'
    : person.branch === 'husaynid'  ? 'Husaynid'
    : person.branch === 'hashemite' ? 'Hashemite'
    : 'Unknown'

  const traditionLabel =
    person.scholarly_tradition === 'sunni' ? 'Sunni'
    : person.scholarly_tradition === 'shia' ? 'Shia'
    : person.scholarly_tradition === 'both' ? 'Sunni & Shia'
    : null

  const born    = formatDate(person.birth_date_hijri, person.birth_date_gregorian)
  const died    = formatDate(person.death_date_hijri, person.death_date_gregorian)
  const bio     = locale === 'ar' ? person.bio_ar : person.bio_en
  const sources = parseSources(person.sources)

  // Marriages where this person is the husband
  const personMap = new Map(persons.map((p) => [p.id, p]))
  const husbandMarriages = marriages
    .filter((m) => m.husband_id === person.id)
    .sort((a, b) => a.order_num - b.order_num)

  // Marriage where this person is a wife
  const wifeMarriage = marriages.find((m) => m.wife_id === person.id)
  const husbandOfWife = wifeMarriage ? personMap.get(wifeMarriage.husband_id) : null

  // Children per marriage
  const childrenByMarriage = (marriageId: string) =>
    persons.filter((p) => p.marriage_id === marriageId)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label={person.name_en}
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex h-full w-80 flex-col overflow-y-auto bg-white shadow-2xl">
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
            className="ms-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: branchColour }}
            >
              {branchLabel}
            </span>

            {/* Gender badge */}
            {person.gender === 'female' && (
              <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800">
                Female / أنثى
              </span>
            )}
            {person.gender === 'male' && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Male / ذكر
              </span>
            )}

            {traditionLabel && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {traditionLabel}
              </span>
            )}
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
              {born && <div><span className="font-medium">Born:</span> {born}</div>}
              {died && <div><span className="font-medium">Died:</span> {died}</div>}
            </div>
          )}

          {/* Marriages section (husband view) */}
          {husbandMarriages.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Marriages / الزيجات ({husbandMarriages.length})
              </h3>
              <div className="flex flex-col gap-3">
                {husbandMarriages.map((m) => {
                  const wife     = personMap.get(m.wife_id)
                  const children = childrenByMarriage(m.id)
                  if (!wife) return null
                  const wifeColour = wife.branch ? BRANCH_COLOURS[wife.branch] : '#D4537E'
                  return (
                    <div
                      key={m.id}
                      className="rounded-md border p-2 text-sm"
                      style={{ borderColor: wifeColour }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p dir="rtl" className="font-semibold text-gray-900">{wife.name_ar}</p>
                          <p className="text-xs text-gray-500">{wife.name_en}</p>
                          {m.date_hijri && (
                            <p className="text-xs text-gray-400">م. {m.date_hijri}</p>
                          )}
                        </div>
                        {onFlyTo && (
                          <button
                            onClick={() => onFlyTo(m.wife_id)}
                            className="ms-2 rounded px-2 py-1 text-xs text-white"
                            style={{ backgroundColor: wifeColour }}
                          >
                            Fly to
                          </button>
                        )}
                      </div>
                      {children.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {children.length} child{children.length !== 1 ? 'ren' : ''}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Spouse of section (wife view) */}
          {husbandOfWife && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Spouse of / زوجة</h3>
              <div
                className="flex items-center justify-between rounded-md border p-2 text-sm"
                style={{ borderColor: husbandOfWife.branch ? BRANCH_COLOURS[husbandOfWife.branch] : '#6B7280' }}
              >
                <div>
                  <p dir="rtl" className="font-semibold text-gray-900">{husbandOfWife.name_ar}</p>
                  <p className="text-xs text-gray-500">{husbandOfWife.name_en}</p>
                </div>
                {onFlyTo && (
                  <button
                    onClick={() => onFlyTo(husbandOfWife.id)}
                    className="ms-2 rounded px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: husbandOfWife.branch ? BRANCH_COLOURS[husbandOfWife.branch] : '#6B7280' }}
                  >
                    Fly to
                  </button>
                )}
              </div>
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
                        <a href={src.url} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 underline hover:text-blue-800">
                          {src.title}
                        </a>
                      ) : src.title}
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
