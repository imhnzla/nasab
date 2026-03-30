'use client'
// Bracket node — SVG horizontal bracket above a wife's children group
// Shows the mother's name as a label

import React, { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { BracketFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function BracketNodeInner({ data }: NodeProps<BracketFlowNode>): React.ReactElement {
  const colour = data.motherBranch ? BRANCH_COLOURS[data.motherBranch] : '#D4537E'
  const { spanPx, motherName_ar } = data

  return (
    <div style={{ position: 'relative', width: spanPx, height: 20, pointerEvents: 'none' }}>
      <svg
        width={spanPx}
        height={20}
        style={{ position: 'absolute', top: 0, left: 0 }}
        aria-hidden="true"
      >
        {/* Horizontal bar */}
        <line x1={0} y1={16} x2={spanPx} y2={16} stroke={colour} strokeWidth={1} />
        {/* Left tick */}
        <line x1={0} y1={10} x2={0} y2={16} stroke={colour} strokeWidth={1} />
        {/* Right tick */}
        <line x1={spanPx} y1={10} x2={spanPx} y2={16} stroke={colour} strokeWidth={1} />
        {/* Mother name label */}
        <text
          x={spanPx / 2}
          y={9}
          textAnchor="middle"
          style={{ fontSize: 10, fill: colour, fontFamily: 'inherit' }}
        >
          {motherName_ar}
        </text>
      </svg>
    </div>
  )
}

export const BracketNode = memo(BracketNodeInner)