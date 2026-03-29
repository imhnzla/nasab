'use client'
// Phase 1 — Root @xyflow/react wrapper with zoom/pan, background, controls, minimap

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react'
import type { NodeTypes, EdgeTypes, Connection, NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { PersonFlowNode, FamilyEdge } from '@/lib/tree/types'
import { PersonNode } from './PersonNode'
import { EdgeRenderer } from './EdgeRenderer'

export type TreeCanvasProps = {
  nodes: PersonFlowNode[]
  edges: FamilyEdge[]
  onNodeClick?: (personId: string) => void
}

// Stable references outside component to avoid re-renders
const nodeTypes: NodeTypes = { person: PersonNode }
const edgeTypes: EdgeTypes = { smoothstep: EdgeRenderer }

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, color: '#9CA3AF', width: 16, height: 16 },
}

export function TreeCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: TreeCanvasProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonFlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<FamilyEdge>(initialEdges)

  // Sync when props change (e.g. after branch filter)
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleNodeClick: NodeMouseHandler<PersonFlowNode> = useCallback(
    (_event, node) => {
      onNodeClick?.(node.id)
    },
    [onNodeClick]
  )

  const proOptions = useMemo(() => ({ hideAttribution: false }), [])

  return (
    <div className="h-full min-h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={proOptions}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#e5e7eb" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const flowNode = node as PersonFlowNode
            if (flowNode.data?.person?.branch === 'hasanid') return '#1B5E20'
            if (flowNode.data?.person?.branch === 'husaynid') return '#0D1B2A'
            if (flowNode.data?.person?.branch === 'hashemite') return '#C9A84C'
            return '#6B7280'
          }}
          maskColor="rgba(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
