'use client'
/**
 * PersonNodeCard — LOD-aware premium person card for the NASAB 2D tree.
 *
 * Zoom levels (from constants2d.ts):
 *   < ZOOM_DOT     → coloured dot (4px circle, branch colour)
 *   < ZOOM_COMPACT → compact: Arabic name only, no badges
 *   < ZOOM_FULL    → full: Arabic + English + G·n + verified + tradition strip
 *   ≥ ZOOM_FULL    → inspect: full + birth/death dates below name
 *
 * Registered as React Flow node type "person".
 */

import React, { memo } from 'react'
import { Handle, Position, useStore } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { PersonRow, Branch } from '@/lib/tree/types'
import {
  COLOUR,
  BRANCH_BORDER,
  NODE_W,
  NODE_H,
  ZOOM_DOT,
  ZOOM_COMPACT,
  ZOOM_FULL,
} from '@/lib/tree/constants2d'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PersonCardData = {
  person: PersonRow
  highlighted?: boolean
  dimmed?: boolean
  onToggleCollapse?: (id: string) => void
  collapsedCount?: number
}

// ─── Tradition strip ──────────────────────────────────────────────────────────

function TraditionStrip({ trad }: { trad: string | null }): React.ReactElement | null {
  if (!trad) return null
  if (trad === 'both') {
    return (
      <div
        aria-label="Sunni and Shia tradition"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: '0 0 8px 8px',
          background: `linear-gradient(90deg, ${COLOUR.tradGreen} 50%, ${COLOUR.tradNavy} 50%)`,
        }}
      />
    )
  }
  const color = trad === 'sunni' ? COLOUR.tradGreen : COLOUR.tradNavy
  return (
    <div
      aria-label={`${trad} tradition`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        borderRadius: '0 0 8px 8px',
        background: color,
      }}
    />
  )
}

// ─── Prophet's special octagon node ──────────────────────────────────────────

function ProphetNode({
  person,
  highlighted,
}: {
  person: PersonRow
  highlighted: boolean
}): React.ReactElement {
  const OCTAGON = 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)'
  const W = NODE_W * 1.5
  const H = NODE_H * 1.5

  return (
    <div
      style={{
        width: W,
        height: H,
        clipPath: OCTAGON,
        background: `radial-gradient(circle at 40% 35%, ${COLOUR.goldLight}, ${COLOUR.goldPrimary} 70%)`,
        boxShadow: highlighted
          ? `0 0 0 4px ${COLOUR.goldLight}, 0 0 32px ${COLOUR.goldLight}80`
          : `0 0 20px ${COLOUR.goldPrimary}80, 0 0 48px ${COLOUR.goldPrimary}30`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <p
        dir="rtl"
        style={{
          margin: 0,
          color: COLOUR.ink,
          fontSize: 16,
          fontWeight: 900,
          lineHeight: 1.2,
          fontFamily: 'serif',
        }}
      >
        {person.name_ar}
      </p>
      <p
        style={{
          margin: 0,
          color: COLOUR.inkLight,
          fontSize: 11,
          fontStyle: 'italic',
          lineHeight: 1,
        }}
      >
        {person.name_en}
      </p>
      <p
        style={{
          margin: 0,
          color: COLOUR.goldDim,
          fontSize: 9,
          letterSpacing: 2,
          fontFamily: 'monospace',
          marginTop: 2,
        }}
      >
        النبي ﷺ
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function PersonNodeCardInner({ data, selected }: NodeProps): React.ReactElement {
  const zoom = useStore((s) => s.transform[2])

  const { person, highlighted, dimmed, onToggleCollapse, collapsedCount } =
    data as unknown as PersonCardData

  const isRoot = person.generation === 1 && !person.father_id
  const isDaughter = person.gender === 'female' && !!person.father_id
  const branch = person.branch as Branch | null
  const borderColor = branch ? (BRANCH_BORDER[branch] ?? COLOUR.goldDim) : COLOUR.goldDim

  const opacity = dimmed ? 0.18 : 1

  // ── Dot mode ──────────────────────────────────────────────────────────────
  if (zoom < ZOOM_DOT) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: borderColor,
            opacity,
            boxShadow: highlighted ? `0 0 6px ${COLOUR.goldLight}` : undefined,
          }}
        />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </>
    )
  }

  // ── Prophet octagon ───────────────────────────────────────────────────────
  if (isRoot) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <ProphetNode person={person} highlighted={!!highlighted} />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </>
    )
  }

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (zoom < ZOOM_COMPACT) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div
          style={{
            width: NODE_W,
            height: NODE_H * 0.6,
            background: COLOUR.parchment,
            border: `1.5px solid ${highlighted ? COLOUR.goldLight : isDaughter ? COLOUR.emerald : borderColor}`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            opacity,
            boxShadow: highlighted
              ? `0 0 0 2px ${COLOUR.goldLight}, 0 0 10px ${COLOUR.goldLight}60`
              : selected
                ? `0 0 0 2px ${COLOUR.goldLight}`
                : `0 1px 4px rgba(0,0,0,0.35)`,
          }}
        >
          <p
            dir="rtl"
            style={{
              margin: 0,
              color: COLOUR.ink,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: NODE_W - 12,
            }}
          >
            {person.name_ar}
          </p>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </>
    )
  }

  // ── Full / Inspect mode ───────────────────────────────────────────────────
  const showDates = zoom >= ZOOM_FULL && (person.birth_date_hijri || person.death_date_hijri)

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <div
        style={{
          position: 'relative',
          width: NODE_W,
          height: NODE_H,
          background: COLOUR.parchment,
          border: `2px solid ${highlighted ? COLOUR.goldLight : isDaughter ? COLOUR.emerald : borderColor}`,
          borderRadius: 10,
          paddingBottom: 4, // room for tradition strip
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          opacity,
          boxShadow: highlighted
            ? `0 0 0 3px ${COLOUR.goldLight}, 0 0 16px ${COLOUR.goldLight}70`
            : selected
              ? `0 0 0 2px ${COLOUR.goldLight}, 0 4px 12px rgba(0,0,0,0.4)`
              : `0 2px 8px rgba(0,0,0,0.35)`,
          userSelect: 'none',
        }}
      >
        {/* Daughter left-edge accent */}
        {isDaughter && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: COLOUR.emerald,
              borderRadius: '10px 0 0 10px',
            }}
          />
        )}

        {/* Verified badge — top left */}
        {person.is_verified && (
          <span
            title="Verified"
            style={{
              position: 'absolute',
              top: 4,
              left: isDaughter ? 8 : 5,
              fontSize: 9,
              color: COLOUR.emerald,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ✦
          </span>
        )}

        {/* Generation badge — top right */}
        {person.generation !== null && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 5,
              fontSize: 8,
              color: COLOUR.dust,
              fontFamily: 'monospace',
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            G·{person.generation}
          </span>
        )}

        {/* Arabic name */}
        <p
          dir="rtl"
          title={person.name_ar}
          style={{
            margin: 0,
            color: COLOUR.ink,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: 'serif',
            maxWidth: NODE_W - 20,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {person.name_ar}
        </p>

        {/* English name */}
        <p
          title={person.name_en}
          style={{
            margin: 0,
            color: COLOUR.dust,
            fontSize: 10,
            lineHeight: 1.1,
            maxWidth: NODE_W - 20,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {person.name_en}
        </p>

        {/* Dates (inspect zoom only) */}
        {showDates && (
          <p
            style={{
              margin: 0,
              color: COLOUR.dust,
              fontSize: 8,
              fontFamily: 'monospace',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            {person.birth_date_hijri ?? '?'} – {person.death_date_hijri ?? '?'}
          </p>
        )}

        {/* Collapse toggle — shown when node has children */}
        {collapsedCount !== undefined && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse?.(person.id)
            }}
            style={{
              position: 'absolute',
              bottom: 7,
              left: '50%',
              transform: 'translateX(-50%)',
              background: borderColor,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 8,
              padding: '1px 6px',
              cursor: 'pointer',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            +{collapsedCount}
          </button>
        )}
        {collapsedCount === undefined && onToggleCollapse && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse(person.id)
            }}
            style={{
              position: 'absolute',
              bottom: 7,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'transparent',
              border: `1px solid ${COLOUR.dust}`,
              color: COLOUR.dust,
              borderRadius: 10,
              fontSize: 8,
              padding: '1px 5px',
              cursor: 'pointer',
              lineHeight: 1.4,
            }}
            title="Collapse subtree"
          >
            −
          </button>
        )}

        {/* Tradition strip */}
        <TraditionStrip trad={person.scholarly_tradition} />
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

export const PersonNodeCard = memo(PersonNodeCardInner)
