'use client'
/**
 * WifeNodeCard — lapis blue wife card for the NASAB 2D tree.
 *
 * Sits between the father row and the children row (WIFE_ROW_OFFSET below father Y).
 * Hidden below ZOOM_DOT. Compact (name-only) below ZOOM_COMPACT.
 *
 * Registered as React Flow node type "wife".
 */

import React, { memo } from 'react'
import { Handle, Position, useStore } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { PersonRow } from '@/lib/tree/types'
import { COLOUR, WIFE_W, WIFE_H, ZOOM_DOT, ZOOM_COMPACT } from '@/lib/tree/constants2d'

export type WifeCardData = {
  person: PersonRow
  marriageId: string
  marriageDate: string | null
  orderNum: number
}

function WifeNodeCardInner({ data }: NodeProps): React.ReactElement | null {
  const zoom = useStore((s) => s.transform[2])
  const { person, marriageDate } = data as unknown as WifeCardData

  // Hide entirely below dot threshold — wives are too small to be meaningful
  if (zoom < ZOOM_DOT) return null

  // Compact: just the name pill
  if (zoom < ZOOM_COMPACT) {
    return (
      <>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div
          style={{
            width: WIFE_W,
            height: WIFE_H * 0.55,
            background: COLOUR.lapis,
            border: `1px solid ${COLOUR.lapisLight}`,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <p
            dir="rtl"
            style={{
              margin: 0,
              color: COLOUR.parchment,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: WIFE_W - 8,
            }}
          >
            {person.name_ar}
          </p>
        </div>
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      </>
    )
  }

  // Full wife card
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      <div
        style={{
          position: 'relative',
          width: WIFE_W,
          height: WIFE_H,
          background: COLOUR.lapis,
          border: `1.5px solid ${COLOUR.lapisLight}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
          userSelect: 'none',
        }}
      >
        {/* Marriage date — top centre */}
        {marriageDate && (
          <p
            style={{
              position: 'absolute',
              top: 4,
              margin: 0,
              fontSize: 8,
              color: `${COLOUR.parchment}70`,
              fontFamily: 'monospace',
              letterSpacing: 0.4,
              lineHeight: 1,
            }}
          >
            م. {marriageDate}
          </p>
        )}

        {/* Arabic name */}
        <p
          dir="rtl"
          title={person.name_ar}
          style={{
            margin: 0,
            color: COLOUR.parchment,
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.2,
            fontFamily: 'serif',
            maxWidth: WIFE_W - 10,
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
            color: `${COLOUR.parchment}80`,
            fontSize: 9,
            lineHeight: 1.1,
            maxWidth: WIFE_W - 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {person.name_en}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

export const WifeNodeCard = memo(WifeNodeCardInner)
