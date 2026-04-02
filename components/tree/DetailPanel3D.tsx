'use client'
/**
 * DetailPanel3D — parchment slide-in panel (spec section 7)
 *
 * Layout (top → bottom):
 *   Header: Arabic name, English name, close
 *   Lineage chain: horizontally scrollable ancestor strip
 *   Dates · Generation
 *   Spouses: lapis circle chips (click to fly)
 *   Children: gold-border (son) / emerald-border (daughter) chips
 *   Biography
 *   Sources
 *   Focus in tree button
 */

import React, { useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import type { PersonRow, MarriageRow } from '@/lib/tree/types'
import { COLOUR } from '@/lib/tree/constants3d'
import { BookmarkStar } from './BookmarkStar'

type DetailPanel3DProps = {
  person:           PersonRow | null
  marriages:        MarriageRow[]
  persons:          PersonRow[]
  posMap:           Map<string, [number, number, number]>
  onClose:          () => void
  onFlyTo:          (personId: string) => void
  onPathHighlight:  (ids: string[]) => void
}

type SourceEntry = { title?: string; author?: string; url?: string }

function parseSources(sources: unknown): SourceEntry[] {
  if (!Array.isArray(sources)) return []
  return sources.filter(
    (s): s is SourceEntry => typeof s === 'object' && s !== null && 'title' in s,
  )
}

/** Build ancestor chain from current person back to root */
function buildAncestorChain(person: PersonRow, personMap: Map<string, PersonRow>): PersonRow[] {
  const chain: PersonRow[] = []
  let cur: PersonRow | undefined = person
  const seen = new Set<string>()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    chain.unshift(cur)  // prepend so root is first
    cur = cur.father_id ? personMap.get(cur.father_id) : undefined
  }
  return chain
}

// ─── Chips ────────────────────────────────────────────────────────────────────

function AncestorChip({
  person,
  isActive,
  onClick,
}: {
  person:   PersonRow
  isActive: boolean
  onClick:  () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      title={person.name_en}
      style={{
        flexShrink:     0,
        background:     isActive ? `${COLOUR.goldPrimary}20` : 'transparent',
        border:         `1px solid ${isActive ? COLOUR.goldPrimary : COLOUR.goldDim + '60'}`,
        borderRadius:   4,
        padding:        '3px 8px',
        cursor:         'pointer',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            1,
        transition:     'background 0.2s, border-color 0.2s',
      }}
    >
      <span dir="rtl" style={{ fontSize: 10, color: COLOUR.ink, fontWeight: isActive ? 700 : 400, fontFamily: 'serif', whiteSpace: 'nowrap' }}>
        {person.name_ar}
      </span>
      <span style={{ fontSize: 8, color: COLOUR.dust, fontFamily: 'monospace' }}>
        G·{person.generation}
      </span>
    </button>
  )
}

function SpouseChip({
  person,
  marriageDate,
  onClick,
}: {
  person:       PersonRow
  marriageDate: string | null
  onClick:      () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      title={person.name_en}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        width:          64,
        height:         64,
        borderRadius:   '50%',
        background:     COLOUR.lapis,
        border:         `1.5px solid ${COLOUR.lapisLight}`,
        cursor:         'pointer',
        gap:            2,
        flexShrink:     0,
        boxShadow:      `0 2px 8px ${COLOUR.lapis}60`,
        transition:     'box-shadow 0.2s',
      }}
    >
      <span dir="rtl" style={{ fontSize: 9, color: COLOUR.parchment, fontWeight: 700, fontFamily: 'serif', textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
        {person.name_ar}
      </span>
      {marriageDate && (
        <span style={{ fontSize: 7, color: `${COLOUR.parchment}70`, fontFamily: 'monospace' }}>
          {marriageDate}
        </span>
      )}
    </button>
  )
}

function ChildChip({
  person,
  onClick,
}: {
  person:  PersonRow
  onClick: () => void
}): React.ReactElement {
  const isDaughter = person.gender === 'female'
  const borderColor = isDaughter ? COLOUR.emerald : COLOUR.goldPrimary

  return (
    <button
      onClick={onClick}
      title={person.name_en}
      style={{
        background:    COLOUR.parchment,
        border:        `1.5px solid ${borderColor}`,
        borderRadius:  '20%',
        padding:       '4px 8px',
        cursor:        'pointer',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           1,
        flexShrink:    0,
        boxShadow:     `0 1px 4px rgba(26,15,0,0.15)`,
        transition:    'box-shadow 0.2s',
      }}
    >
      <span dir="rtl" style={{ fontSize: 10, color: COLOUR.ink, fontWeight: 600, fontFamily: 'serif', whiteSpace: 'nowrap' }}>
        {person.name_ar}
      </span>
    </button>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function DetailPanel3D({
  person,
  marriages,
  persons,
  onClose,
  onFlyTo,
  onPathHighlight,
}: DetailPanel3DProps): React.ReactElement | null {
  const locale    = useLocale()
  const chainRef  = useRef<HTMLDivElement>(null)

  const personMap = new Map(persons.map((p) => [p.id, p]))

  useEffect(() => {
    // Scroll lineage chain to end (current person) on open
    if (chainRef.current) {
      chainRef.current.scrollLeft = chainRef.current.scrollWidth
    }
  }, [person?.id])

  if (!person) return null

  const bio     = locale === 'ar' ? person.bio_ar : person.bio_en
  const born    = person.birth_date_hijri ? `${person.birth_date_hijri} AH` : person.birth_date_gregorian
  const died    = person.death_date_hijri ? `${person.death_date_hijri} AH` : person.death_date_gregorian
  const sources = parseSources(person.sources)

  const ancestorChain = buildAncestorChain(person, personMap)

  // Marriages where this person is the husband
  const husbandMarriages = marriages
    .filter((m) => m.husband_id === person.id)
    .sort((a, b) => a.order_num - b.order_num)

  // Wife-of
  const wifeOfMarriage = marriages.find((m) => m.wife_id === person.id)
  const husbandPerson  = wifeOfMarriage ? personMap.get(wifeOfMarriage.husband_id) : null

  // Children per marriage (and direct father_id children)
  const directChildren = persons
    .filter((p) => p.father_id === person.id)
    .sort((a, b) => (a.generation ?? 0) - (b.generation ?? 0))

  // Highlight path back to root
  function handleHighlightPath(): void {
    onPathHighlight(ancestorChain.map((p) => p.id))
  }

  const branchLabel =
    person.branch === 'hasanid'   ? 'Hasanid · حسني'
    : person.branch === 'husaynid'  ? 'Husaynid · حسيني'
    : person.branch === 'hashemite' ? 'Hashemite · هاشمي'
    : null

  const tradLabel =
    person.scholarly_tradition === 'sunni' ? 'Sunni · سني'
    : person.scholarly_tradition === 'shia' ? 'Shia · شيعي'
    : person.scholarly_tradition === 'both' ? 'Sunni & Shia · متفق عليه'
    : null

  const isRoot = !person.father_id

  return (
    // Backdrop — dims the tree slightly per spec
    <div
      style={{
        position: 'fixed',
        inset:    0,
        zIndex:   50,
        display:  'flex',
        justifyContent: 'flex-end',
        pointerEvents:  'none',
      }}
      aria-modal="true"
      role="dialog"
      aria-label={person.name_en}
    >
      {/* Transparent backdrop — clicking closes */}
      <div
        style={{
          position:       'absolute',
          inset:          0,
          background:     'rgba(5,5,8,0.35)',
          backdropFilter: 'blur(1px)',
          pointerEvents:  'all',
          cursor:         'default',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        style={{
          position:        'relative',
          zIndex:          10,
          width:           400,
          height:          '100%',
          background:      COLOUR.parchment,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          boxShadow:       `-8px 0 40px rgba(26,15,0,0.35), -1px 0 0 ${COLOUR.goldDim}40`,
          overflowY:       'auto',
          display:         'flex',
          flexDirection:   'column',
          pointerEvents:   'all',
          animation:       'nasab-panel-in 0.28s ease-out',
        }}
      >
        <style>{`
          @keyframes nasab-panel-in {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          style={{
            padding:      '20px 20px 16px',
            borderBottom: `2px solid ${isRoot ? COLOUR.goldPrimary : COLOUR.goldDim}40`,
            position:     'sticky',
            top:          0,
            background:   COLOUR.parchment,
            zIndex:       5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {/* Arabic name */}
              <h2
                dir="rtl"
                style={{
                  margin:     0,
                  color:      COLOUR.ink,
                  fontSize:   22,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  fontFamily: 'serif',
                }}
              >
                {person.name_ar}
              </h2>
              {/* English name */}
              <p style={{ margin: '4px 0 0', color: COLOUR.dust, fontSize: 13, fontStyle: 'italic' }}>
                {person.name_en}
              </p>
              {/* Urdu name if present */}
              {person.name_ur && (
                <p dir="rtl" style={{ margin: '2px 0 0', color: COLOUR.dust, fontSize: 12 }}>
                  {person.name_ur}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <BookmarkStar personId={person.id} />
              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  background: 'none',
                  border:     'none',
                  color:      COLOUR.dust,
                  fontSize:   20,
                  cursor:     'pointer',
                  lineHeight: 1,
                  padding:    '2px 4px',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Badge row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {isRoot && (
              <span style={{ ...badgeStyle, background: COLOUR.goldPrimary, color: COLOUR.ink }}>
                النبي ﷺ
              </span>
            )}
            {branchLabel && (
              <span style={{ ...badgeStyle, background: `${COLOUR.goldDim}30`, color: COLOUR.ink, border: `1px solid ${COLOUR.goldDim}50` }}>
                {branchLabel}
              </span>
            )}
            {tradLabel && (
              <span style={{ ...badgeStyle, background: 'rgba(26,15,0,0.07)', color: COLOUR.inkLight }}>
                {tradLabel}
              </span>
            )}
            {person.is_verified && (
              <span style={{ ...badgeStyle, background: `${COLOUR.emerald}20`, color: COLOUR.emerald, border: `1px solid ${COLOUR.emerald}50` }}>
                ✦ Verified
              </span>
            )}
            {person.generation !== null && (
              <span style={{ ...badgeStyle, background: 'transparent', color: COLOUR.dust, border: `1px solid ${COLOUR.dust}40`, fontFamily: 'monospace' }}>
                G·{person.generation}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 20px 24px' }}>

          {/* Lineage chain strip */}
          {ancestorChain.length > 1 && (
            <div>
              <SectionLabel>Lineage · النسب</SectionLabel>
              <div
                ref={chainRef}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            4,
                  overflowX:      'auto',
                  paddingBottom:  6,
                  scrollbarWidth: 'none',
                }}
              >
                {ancestorChain.map((ancestor, i) => (
                  <React.Fragment key={ancestor.id}>
                    {i > 0 && (
                      <span style={{ color: COLOUR.goldDim, fontSize: 10, flexShrink: 0 }}>›</span>
                    )}
                    <AncestorChip
                      person={ancestor}
                      isActive={ancestor.id === person.id}
                      onClick={() => onFlyTo(ancestor.id)}
                    />
                  </React.Fragment>
                ))}
              </div>
              <button
                onClick={handleHighlightPath}
                style={{
                  marginTop:    6,
                  background:   'none',
                  border:       'none',
                  color:        COLOUR.goldDim,
                  fontSize:     10,
                  cursor:       'pointer',
                  textDecoration: 'underline',
                  padding:      0,
                  fontFamily:   'serif',
                }}
              >
                Illuminate path ✦
              </button>
            </div>
          )}

          {/* Dates */}
          {(born ?? died) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <SectionLabel>Dates · التواريخ</SectionLabel>
              {born && <DateRow label="Born · وُلد" value={born} />}
              {died && <DateRow label="Died · تُوفِّي" value={died} />}
            </div>
          )}

          {/* Spouses section */}
          {husbandMarriages.length > 0 && (
            <div>
              <SectionLabel>Spouses · الزوجات ({husbandMarriages.length})</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {husbandMarriages.map((m) => {
                  const wife = personMap.get(m.wife_id)
                  if (!wife) return null
                  return (
                    <SpouseChip
                      key={m.id}
                      person={wife}
                      marriageDate={m.date_hijri}
                      onClick={() => onFlyTo(wife.id)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Spouse-of section (wife view) */}
          {husbandPerson && (
            <div>
              <SectionLabel>Spouse of · زوجة</SectionLabel>
              <button
                onClick={() => onFlyTo(husbandPerson.id)}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           8,
                  background:    `${COLOUR.goldPrimary}12`,
                  border:        `1px solid ${COLOUR.goldDim}50`,
                  borderRadius:  6,
                  padding:       '6px 12px',
                  cursor:        'pointer',
                  marginTop:     6,
                  width:         '100%',
                  textAlign:     'left',
                }}
              >
                <span dir="rtl" style={{ color: COLOUR.ink, fontSize: 13, fontWeight: 700, fontFamily: 'serif' }}>
                  {husbandPerson.name_ar}
                </span>
                <span style={{ color: COLOUR.dust, fontSize: 11 }}>
                  {husbandPerson.name_en}
                </span>
              </button>
            </div>
          )}

          {/* Children */}
          {directChildren.length > 0 && (
            <div>
              <SectionLabel>Children · الأبناء ({directChildren.length})</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {directChildren.map((child) => (
                  <ChildChip
                    key={child.id}
                    person={child}
                    onClick={() => onFlyTo(child.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Biography */}
          {bio && (
            <div>
              <SectionLabel>Biography · السيرة</SectionLabel>
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                style={{
                  margin:      '6px 0 0',
                  color:       COLOUR.inkLight,
                  fontSize:    13,
                  lineHeight:  1.7,
                  fontFamily:  'serif',
                }}
              >
                {bio}
              </p>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <SectionLabel>Sources · المصادر</SectionLabel>
              <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sources.map((src, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: COLOUR.inkLight }}>
                    <span style={{ color: COLOUR.goldDim, marginTop: 3, flexShrink: 0 }}>◆</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer"
                         style={{ color: COLOUR.goldDim, textDecoration: 'underline' }}>
                        {src.title}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                    {src.author && <span style={{ color: COLOUR.dust }}> — {src.author}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Focus in tree */}
          <button
            onClick={() => onFlyTo(person.id)}
            style={{
              marginTop:      8,
              background:     `linear-gradient(135deg, ${COLOUR.goldDim}20, ${COLOUR.goldPrimary}30)`,
              border:         `1px solid ${COLOUR.goldPrimary}60`,
              borderRadius:   8,
              padding:        '10px 16px',
              cursor:         'pointer',
              color:          COLOUR.ink,
              fontSize:       13,
              fontFamily:     'serif',
              fontWeight:     600,
              letterSpacing:  0.5,
              width:          '100%',
              textAlign:      'center',
            }}
          >
            Focus in tree ↗ · انتقل إلى الشجرة
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helper sub-components ────────────────────────────────────────────────────

const badgeStyle: React.CSSProperties = {
  borderRadius:  20,
  padding:       '2px 10px',
  fontSize:      11,
  fontWeight:    600,
  whiteSpace:    'nowrap',
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <p style={{
      margin:        0,
      fontSize:      10,
      fontWeight:    700,
      color:         COLOUR.dust,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily:    'monospace',
    }}>
      {children}
    </p>
  )
}

function DateRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLOUR.inkLight }}>
      <span style={{ color: COLOUR.dust }}>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}
