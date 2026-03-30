'use client'
// Marriage edge — double dashed horizontal lines between husband/wife and junction node

import React, { memo } from 'react'
import { getStraightPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

function MarriageEdgeInner({
  sourceX, sourceY, targetX, targetY,
}: EdgeProps): React.ReactElement | null {
  const [path1] = getStraightPath({
    sourceX, sourceY: sourceY - 2,
    targetX, targetY: targetY - 2,
  })
  const [path2] = getStraightPath({
    sourceX, sourceY: sourceY + 2,
    targetX, targetY: targetY + 2,
  })

  return (
    <>
      <path d={path1} fill="none" stroke="#D4537E" strokeWidth={1.5} strokeDasharray="5 3" />
      <path d={path2} fill="none" stroke="#D4537E" strokeWidth={1.5} strokeDasharray="5 3" />
    </>
  )
}

export const MarriageEdge = memo(MarriageEdgeInner)
