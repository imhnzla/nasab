'use client'
// Quadratic bezier arc connecting husband and wife nodes in 3D space
// Cross-branch marriages render in pink; same-branch in gray

import React from 'react'
import { Line } from '@react-three/drei'
import { ARC_RISE } from '@/lib/tree/constants3d'

function bezierPoints(
  from: [number, number, number],
  to: [number, number, number],
  segments: number,
): [number, number, number][] {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    Math.min(from[1], to[1]) + ARC_RISE,
    0,
  ]
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * mid[0] + t ** 2 * to[0]
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * mid[1] + t ** 2 * to[1]
    return [x, y, 0] as [number, number, number]
  })
}

export function MarriageArc3D({
  from,
  to,
  crossBranch,
}: {
  from: [number, number, number]
  to: [number, number, number]
  marriageDate: string | null
  crossBranch: boolean
}): React.ReactElement {
  const points = bezierPoints(from, to, 32)
  const mid = points[16]
  const color = crossBranch ? '#D4537E' : '#9CA3AF'

  return (
    <>
      <Line points={points} color={color} lineWidth={2} dashed dashSize={8} gapSize={4} />

      {/* Interlocked ring pair at arc midpoint */}
      <mesh position={[mid[0] - 6, mid[1], 2]}>
        <torusGeometry args={[5, 1.2, 8, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[mid[0] + 6, mid[1], 2]}>
        <torusGeometry args={[5, 1.2, 8, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  )
}
