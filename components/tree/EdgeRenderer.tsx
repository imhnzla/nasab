'use client'
// Phase 1 — Custom @xyflow/react edge with directional arrow markers
// Renders parent→child relationship lines in a neutral gray

import React, { memo } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

function EdgeRendererInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps): React.ReactElement | null {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: '#9CA3AF',
          strokeWidth: 1.5,
          ...style,
        }}
      />
      {/* EdgeLabelRenderer is required by @xyflow/react even if unused */}
      <EdgeLabelRenderer>
        <></>
      </EdgeLabelRenderer>
    </>
  )
}

export const EdgeRenderer = memo(EdgeRendererInner)
