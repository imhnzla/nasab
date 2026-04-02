'use client'
/**
 * MarriageArc3D — marriage bond line
 *
 * Spec:
 * - Dashed double-line, horizontal
 * - Color: #8B7355 (dust) — warmer, quieter than descent lines
 * - No arrowhead — it is a bond, not a direction
 * - Cross-branch marriages: slightly brighter dust tone
 */

import React, { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { COLOUR, LINE_WIDTH_MARRIAGE, MARRIAGE_ARC_RISE } from '@/lib/tree/constants3d'

function bezierPoints(
  from: [number, number, number],
  to:   [number, number, number],
): [number, number, number][] {
  const segments = 24
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + MARRIAGE_ARC_RISE,
    (from[2] + to[2]) / 2,
  ]
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t  = i / segments
    const mt = 1 - t
    return [
      mt * mt * from[0] + 2 * mt * t * mid[0] + t * t * to[0],
      mt * mt * from[1] + 2 * mt * t * mid[1] + t * t * to[1],
      mt * mt * from[2] + 2 * mt * t * mid[2] + t * t * to[2],
    ] as [number, number, number]
  })
}

export function MarriageArc3D({
  from,
  to,
  crossBranch,
}: {
  from:         [number, number, number]
  to:           [number, number, number]
  crossBranch:  boolean
  marriageDate: string | null
}): React.ReactElement {
  const points = useMemo(() => bezierPoints(from, to), [from, to])

  // Spec: dust tone; cross-branch slightly brighter
  const color = crossBranch ? '#A0896A' : COLOUR.dust

  return (
    <Line
      points={points}
      color={color}
      lineWidth={LINE_WIDTH_MARRIAGE}
      dashed
      dashSize={10}
      gapSize={6}
      transparent
      opacity={0.75}
    />
  )
}
