'use client'
// Junction node — invisible midpoint between husband and wife
// Acts as the shared parent for children of a specific marriage

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { JunctionFlowNode } from '@/lib/tree/types'

function JunctionNodeInner({ data }: NodeProps<JunctionFlowNode>): React.ReactElement {
  const isCollapsed = data.collapsedCount !== undefined

  return (
    <div style={{ position: 'relative', width: 8, height: 8 }}>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, width: 4, height: 4 }} />

      {/* Visible dot — pink when active, shown always so user can click */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#D4537E',
          opacity: 0.6,
        }}
      />

      {/* Collapse badge */}
      {isCollapsed && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onToggleCollapse?.(data.marriageId)
          }}
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 8,
            background: '#D4537E',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ▶ {data.collapsedCount}
        </button>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 4, height: 4 }} />
    </div>
  )
}

export const JunctionNode = memo(JunctionNodeInner)
