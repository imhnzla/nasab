'use client'
// Spouse node — oval shape, female symbol, marriage date label
// Rendered for each wife in a marriage

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { SpouseFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function SpouseNodeInner({ data }: NodeProps<SpouseFlowNode>): React.ReactElement {
  const { person, marriageDate } = data
  const colour = person.branch ? BRANCH_COLOURS[person.branch] : '#D4537E'

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      <div
        style={{
          width: 160,
          height: 52,
          borderRadius: '50%',
          border: `2px solid ${colour}`,
          background: `${colour}18`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {/* Marriage date floating above */}
        {marriageDate && (
          <span
            style={{
              position: 'absolute',
              top: -18,
              fontSize: 10,
              color: colour,
              whiteSpace: 'nowrap',
            }}
          >
            م. {marriageDate}
          </span>
        )}

        {/* Arabic name */}
        <p
          dir="rtl"
          style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#111827', lineHeight: 1.3 }}
        >
          {person.name_ar}
        </p>

        {/* English name */}
        <p style={{ fontSize: 11, color: '#6B7280', margin: 0, lineHeight: 1.2 }}>
          {person.name_en}
        </p>

        {/* Female symbol ♀ */}
        <svg
          width="10"
          height="12"
          style={{ position: 'absolute', bottom: 4, right: 10 }}
          aria-hidden="true"
        >
          <circle cx="5" cy="4" r="3.5" fill="none" stroke={colour} strokeWidth="1.2" />
          <line x1="5" y1="7.5" x2="5" y2="11" stroke={colour} strokeWidth="1.2" />
          <line x1="3" y1="9.5" x2="7" y2="9.5" stroke={colour} strokeWidth="1.2" />
        </svg>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  )
}

export const SpouseNode = memo(SpouseNodeInner)
