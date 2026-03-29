'use client'
// Phase 1 — Custom @xyflow/react node
// Displays: Arabic name (primary), English name (secondary), branch colour border,
// generation badge, verified checkmark

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { PersonFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function PersonNodeInner({ data, selected }: NodeProps<PersonFlowNode>): JSX.Element {
  const { person } = data
  const branchColour = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div
        className={[
          'relative flex h-[64px] w-[180px] flex-col justify-center rounded-md bg-white px-2 shadow-sm',
          'border-2',
          selected ? 'ring-2 ring-offset-1' : '',
        ].join(' ')}
        style={{
          borderColor: branchColour,
          ...(selected ? { ringColor: branchColour } : {}),
        }}
      >
        {/* Generation badge — top-right circle */}
        {person.generation !== null && (
          <span
            className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: branchColour }}
          >
            {person.generation}
          </span>
        )}

        {/* Verified checkmark */}
        {person.is_verified && (
          <span
            className="absolute bottom-1 end-1.5 text-[10px] font-bold"
            style={{ color: branchColour }}
            aria-label="Verified"
          >
            ✓
          </span>
        )}

        {/* Arabic name — primary */}
        <p
          dir="rtl"
          className="truncate text-right text-sm font-bold leading-tight text-gray-900"
          title={person.name_ar}
        >
          {person.name_ar}
        </p>

        {/* English name — secondary */}
        <p
          className="truncate text-left text-xs leading-tight text-gray-500"
          title={person.name_en}
        >
          {person.name_en}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </>
  )
}

export const PersonNode = memo(PersonNodeInner)
