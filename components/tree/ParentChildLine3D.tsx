'use client'
/**
 * ParentChildLine3D — parent-to-child connection line
 *
 * Spec:
 * - Single stroke, gold #C9943A, dims to #7A5A1E toward living generations
 * - Highlighted path: gold glow pulse (handled via highlighted prop + CSS animation)
 * - At high zoom-out: already thin by default (lineWidth 1.5)
 */

import React, { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { COLOUR, LINE_WIDTH_PARENT } from '@/lib/tree/constants3d'

export function ParentChildLine3D({
  from,
  to,
  highlighted,
  generation,
}: {
  from:        [number, number, number]
  to:          [number, number, number]
  highlighted: boolean
  generation:  number
}): React.ReactElement {
  // Colour dims as generation increases (gold → gold-dim after gen 8)
  const t = Math.min(1, Math.max(0, (generation - 1) / 12))
  const color = highlighted ? COLOUR.goldLight : (t < 0.5 ? COLOUR.goldPrimary : COLOUR.goldDim)
  const width = highlighted ? LINE_WIDTH_PARENT * 2.5 : LINE_WIDTH_PARENT

  // Mid-point for a gentle curve
  const mid = useMemo((): [number, number, number] => [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2 + 20,   // slight Z bow
  ], [from, to])

  const points = useMemo((): [number, number, number][] => {
    const segments = 16
    return Array.from({ length: segments + 1 }, (_, i) => {
      const t = i / segments
      const mt = 1 - t
      return [
        mt * mt * from[0] + 2 * mt * t * mid[0] + t * t * to[0],
        mt * mt * from[1] + 2 * mt * t * mid[1] + t * t * to[1],
        mt * mt * from[2] + 2 * mt * t * mid[2] + t * t * to[2],
      ] as [number, number, number]
    })
  }, [from, mid, to])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      transparent
      opacity={highlighted ? 1 : 0.7}
    />
  )
}
