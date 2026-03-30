'use client'
// Custom @xyflow/react node
// Female persons render as ovals; dual-border shows mother's branch; collapse toggle

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { PersonFlowNode } from '@/lib/tree/types'
import { BRANCH_COLOURS } from '@/lib/tree/types'

function PersonNodeInner({ data, selected }: NodeProps<PersonFlowNode>): React.ReactElement {
  const { person } = data
  const branchColour   = person.branch ? BRANCH_COLOURS[person.branch] : '#6B7280'
  const isFemalePerson = person.gender === 'female'

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div
        className={[
          'relative flex h-[64px] w-[180px] flex-col justify-center px-2 shadow-sm border-2',
          isFemalePerson ? 'rounded-[50%]' : 'rounded-md',
          selected ? 'ring-2 ring-offset-1' : '',
        ].join(' ')}
        style={{
          borderColor: branchColour,
          background: isFemalePerson ? `${branchColour}12` : '#fff',
          ...(selected ? { outline: `2px solid ${branchColour}` } : {}),
        }}
      >
        {/* Inner border — mother's branch colour */}
        {data.motherBranch && (
          <div
            style={{
              position: 'absolute',
              inset: 3,
              borderRadius: isFemalePerson ? '50%' : 4,
              border: `1.5px solid ${BRANCH_COLOURS[data.motherBranch]}`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Generation badge */}
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
            className="absolute end-1.5 bottom-1 text-[10px] font-bold"
            style={{ color: branchColour }}
            aria-label="Verified"
          >
            ✓
          </span>
        )}

        {/* Female symbol */}
        {isFemalePerson && (
          <svg
            width="10"
            height="12"
            style={{ position: 'absolute', bottom: 4, left: 6 }}
            aria-hidden="true"
          >
            <circle cx="5" cy="4" r="3.5" fill="none" stroke={branchColour} strokeWidth="1.2" />
            <line x1="5" y1="7.5" x2="5" y2="11" stroke={branchColour} strokeWidth="1.2" />
            <line x1="3" y1="9.5" x2="7" y2="9.5" stroke={branchColour} strokeWidth="1.2" />
          </svg>
        )}

        {/* Collapse toggle button */}
        {data.onToggleCollapse && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onToggleCollapse!(person.id)
            }}
            style={{
              position: 'absolute',
              bottom: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 8,
              background: branchColour,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
            aria-label={data.collapsedCount !== undefined ? 'Expand subtree' : 'Collapse subtree'}
          >
            {data.collapsedCount !== undefined ? `▶ ${data.collapsedCount}` : '−'}
          </button>
        )}

        {/* Arabic name */}
        <p
          dir="rtl"
          className="truncate text-right text-sm leading-tight font-bold text-gray-900"
          title={person.name_ar}
        >
          {person.name_ar}
        </p>

        {/* English name */}
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
