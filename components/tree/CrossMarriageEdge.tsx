'use client'
// Cross-branch marriage edge — floating bezier arc with interlocked rings at midpoint
// Used when husband and wife are from different branches

import React, { memo } from 'react'
import { EdgeLabelRenderer } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

function CrossMarriageEdgeInner({
  sourceX, sourceY, targetX, targetY, data,
}: EdgeProps): React.ReactElement | null {
  const midX = (sourceX + targetX) / 2
  const peakY = Math.min(sourceY, targetY) - 80
  const d = `M ${sourceX} ${sourceY} Q ${midX} ${peakY} ${targetX} ${targetY}`

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke="#D4537E"
        strokeWidth={2}
        strokeDasharray="6 3"
      />

      {/* Interlocked rings at arc peak */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${midX}px, ${peakY + 10}px)`,
            pointerEvents: 'none',
          }}
        >
          <svg width={24} height={14} aria-hidden="true">
            <circle cx={6}  cy={7} r={5} fill="none" stroke="#D4537E" strokeWidth={1.5} />
            <circle cx={14} cy={7} r={5} fill="none" stroke="#D4537E" strokeWidth={1.5} />
          </svg>

          {/* Marriage date */}
          {(data as { marriageDate?: string } | undefined)?.marriageDate && (
            <span
              style={{
                fontSize: 10,
                color: '#D4537E',
                whiteSpace: 'nowrap',
                display: 'block',
                textAlign: 'center',
                marginTop: 2,
              }}
            >
              {(data as { marriageDate: string }).marriageDate}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const CrossMarriageEdge = memo(CrossMarriageEdgeInner)
