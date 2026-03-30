'use client'
// Dashed line connecting a parent node to a child node across generation planes

import React from 'react'
import { Line } from '@react-three/drei'

export function ParentChildLine3D({
  from,
  to,
}: {
  from: [number, number, number]
  to: [number, number, number]
}): React.ReactElement {
  return (
    <Line
      points={[from, to]}
      color="#9CA3AF"
      lineWidth={1}
      dashed
      dashSize={8}
      gapSize={4}
    />
  )
}