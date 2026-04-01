'use client'
import React from 'react'

type TimelineAxisProps = {
  persons: Array<{ generation: number | null; birth_date_hijri: string | null }>
  generationY: Map<number, number>  // gen → Y pixel in canvas
  canvasHeight: number
  scrollY: number
}

export function TimelineAxis({ persons, generationY, canvasHeight, scrollY }: TimelineAxisProps): React.ReactElement {
  // Extract unique generations and map to approximate Hijri centuries
  const genEntries = [...generationY.entries()].sort((a, b) => a[0] - b[0])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 64,
        height: canvasHeight,
        background: 'rgba(255,255,255,0.92)',
        borderRight: '1px solid #E5E7EB',
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg width={64} height={canvasHeight}>
        {genEntries.map(([gen, y]) => {
          const adjustedY = y - scrollY
          if (adjustedY < 0 || adjustedY > canvasHeight) return null
          return (
            <g key={gen} transform={`translate(0, ${adjustedY})`}>
              <line x1={48} y1={0} x2={64} y2={0} stroke="#E5E7EB" strokeWidth={1} />
              <text x={44} y={4} textAnchor="end" fontSize={10} fill="#9CA3AF">
                Gen {gen}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
